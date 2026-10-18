import {afterEach,expect,it,vi} from 'vitest';
import {mkdtemp,readFile,readdir,rm,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';

const dirs:string[]=[];
afterEach(async()=>{vi.useRealTimers();for(const dir of dirs.splice(0))await rm(dir,{recursive:true,force:true});});
async function options(){
 const root=await mkdtemp(join(tmpdir(),'cocoa-probe-'));dirs.push(root);
 return {outputDir:join(root,'fresh'),apiKey:'0123456789abcdef0123456789abcdef01234567',codeVersion:'a'.repeat(40)};
}
function table(input:Parameters<typeof fetch>[0]){
 const url=new URL(String(input)),imports=url.pathname.includes('/imports/'),commodity=imports?'I_COMMODITY':'E_COMMODITY',measure=imports?'GEN_VAL_MO':'ALL_VAL_MO',summary=url.searchParams.get('SUMMARY_LVL2')!;
 return JSON.stringify([[commodity,`${commodity}_LDESC`,measure,'CTY_CODE','CTY_NAME','LAST_UPDATE','time','COMM_LVL','SUMMARY_LVL','SUMMARY_LVL2'],['180100','COCOA BEANS','125',summary==='HS'?'-':'1220',summary==='HS'?'TOTAL':'CANADA','2026-10-01',url.searchParams.get('time'),'HS6','DET',summary]]);
}
it('makes only the eight fixed cocoa requests serially and retains diagnostic evidence without accepting data',async()=>{
 const module=await import('../../scripts/probe-cocoa').catch(()=>({runCocoaProbe:undefined}));
 expect(module.runCocoaProbe,'bounded diagnostic entry point').toBeTypeOf('function');
 if(!module.runCocoaProbe)return;
 const o=await options();const calls:string[]=[];let active=0,maxActive=0;
 const fetcher=(async(input,init)=>{calls.push(String(input));active++;maxActive=Math.max(maxActive,active);expect(init?.redirect).toBe('manual');expect(init?.signal).toBeInstanceOf(AbortSignal);await new Promise(resolve=>setTimeout(resolve,1));active--;return new Response(table(input),{headers:{'content-type':'application/json'}});}) as typeof fetch;
 const report=await module.runCocoaProbe(o,fetcher);
 expect(calls).toHaveLength(8);expect(new Set(calls).size).toBe(8);expect(maxActive).toBe(1);
 const contexts=calls.map(value=>{const u=new URL(value);expect(u.origin).toBe('https://api.census.gov');expect(u.searchParams.get('key')).toBe(o.apiKey);const imports=u.pathname.includes('/imports/');expect(u.searchParams.get(imports?'I_COMMODITY':'E_COMMODITY')).toBe('180100');expect(u.searchParams.get('get')).toBe(imports?'I_COMMODITY_LDESC,GEN_VAL_MO,CTY_CODE,CTY_NAME,LAST_UPDATE':'E_COMMODITY_LDESC,ALL_VAL_MO,CTY_CODE,CTY_NAME,LAST_UPDATE');expect(u.searchParams.get('COMM_LVL')).toBe('HS6');expect(u.searchParams.get('SUMMARY_LVL')).toBe('DET');expect(u.searchParams.has('YEAR')).toBe(false);expect(u.searchParams.has('MONTH')).toBe(false);return [u.pathname,u.searchParams.get('time'),u.searchParams.get('SUMMARY_LVL2')].join('/');});
 expect(contexts).toEqual([
 '/data/timeseries/intltrade/imports/hs/2021-09/HS','/data/timeseries/intltrade/imports/hs/2021-09/HSCY',
 '/data/timeseries/intltrade/exports/hs/2021-09/HS','/data/timeseries/intltrade/exports/hs/2021-09/HSCY',
 '/data/timeseries/intltrade/imports/hs/2026-08/HS','/data/timeseries/intltrade/imports/hs/2026-08/HSCY',
 '/data/timeseries/intltrade/exports/hs/2026-08/HS','/data/timeseries/intltrade/exports/hs/2026-08/HSCY']);
 expect(report).toMatchObject({productCode:'180100',purpose:'merchandise-diagnostic',releaseAccepted:false,coverage:'unverified',probePassed:true,attempts:8});
 expect(report.pairs.map(pair=>pair.validation)).toEqual(['passed','passed','passed','passed']);
 expect(report.events).toHaveLength(8);expect(report.rawFiles).toHaveLength(8);
 expect((await readdir(o.outputDir)).sort()).toEqual(['probe.json','raw']);
 const text=await readFile(join(o.outputDir,'probe.json'),'utf8');expect(text).not.toContain(o.apiKey);expect(text).not.toContain('key=');
});

import {createHash} from 'node:crypto';
import {parse} from 'yaml';
import {runCocoaProbe,cocoaProbeMode} from '../../scripts/probe-cocoa';

it.each([429,503,307])('does not retry or follow HTTP %s and keeps safe failure bodies',async status=>{
 const o=await options();let calls=0;
 const report=await runCocoaProbe(o,(async()=>{calls++;return new Response('diagnostic failure',{status,headers:{location:'https://example.test/extra'}});}) as typeof fetch);
 expect(calls).toBe(8);expect(report.probePassed).toBe(false);
 expect(report.events.every(e=>e.phase==='status'&&e.httpStatus===status)).toBe(true);
 expect(report.rawFiles).toHaveLength(8);expect(await readFile(join(o.outputDir,report.rawFiles[0].path),'utf8')).toBe('diagnostic failure');
});
it('records only allowlisted transport codes and never exception messages',async()=>{
 const o=await options();let calls=0;
 const report=await runCocoaProbe(o,(async()=>{calls++;throw Object.assign(new Error(o.apiKey),{name:o.apiKey,cause:{code:calls===1?'ECONNRESET':o.apiKey}});}) as typeof fetch);
 expect(calls).toBe(8);expect(report.events[0]).toMatchObject({phase:'fetch',httpStatus:null,errorCode:'ECONNRESET'});
 expect(report.events.slice(1).every(e=>e.errorCode==='unknown')).toBe(true);expect(report.rawFiles).toHaveLength(0);
 expect(await readFile(join(o.outputDir,'probe.json'),'utf8')).not.toContain(o.apiKey);
});
it('retains HTTP status when the response body fails and discards partial bytes',async()=>{
 const o=await options();
 const report=await runCocoaProbe(o,(async()=>new Response(new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('partial'));c.error(new Error(o.apiKey));}}),{status:503})) as typeof fetch);
 expect(report.events.every(e=>e.phase==='body'&&e.httpStatus===503)).toBe(true);expect(report.rawFiles).toHaveLength(0);
 expect(await readdir(join(o.outputDir,'raw'))).toEqual([]);
});
it.each(['fetch','body'] as const)('enforces one 30-second deadline through %s without retry',async phase=>{
 const o=await options();let calls=0;vi.useFakeTimers();
 const pending=runCocoaProbe(o,(async(input)=>{
  calls++;if(calls>1)return new Response(table(input),{headers:{'content-type':'application/json'}});
  if(phase==='fetch')return await new Promise<Response>(()=>{});
  return new Response(new ReadableStream({pull(){return new Promise(()=>{});}}),{headers:{'content-type':'application/json'}});
 }) as typeof fetch);
 await vi.waitFor(()=>expect(calls).toBe(1));await vi.advanceTimersByTimeAsync(30_001);
 const report=await pending;
 expect(calls).toBe(8);expect(report.events[0]).toMatchObject({phase,errorCode:'timeout',httpStatus:phase==='fetch'?null:200});
 expect(report.events[0].elapsedMs).toBeGreaterThanOrEqual(30_000);
});
it('accepts exactly 1 MiB but rejects one extra streamed byte without retaining truncated bodies',async()=>{
 const o=await options();let calls=0;
 const report=await runCocoaProbe(o,(async input=>{
  calls++;if(calls>2)return new Response(table(input),{headers:{'content-type':'application/json'}});
  const size=1_048_576+(calls===2?1:0);
  return new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(size).fill(120));c.close();}}),{headers:{'content-type':'text/plain','content-length':'1'}});
 }) as typeof fetch);
 expect(report.events[0].phase).toBe('content-type');expect(report.events[1].phase).toBe('limit');
 const retained=report.rawFiles.find(f=>f.path.includes('2021-09-imports-HS.'))!;
 expect(retained.bytes).toBe(1_048_576);
 expect(report.rawFiles.some(f=>f.path.includes('2021-09-imports-HSCY.'))).toBe(false);
 for(const f of report.rawFiles){const b=await readFile(join(o.outputDir,f.path));expect(b.length).toBe(f.bytes);expect(createHash('sha256').update(b).digest('hex')).toBe(f.sha256);}
});
it('keeps the complete retained evidence below 8 MiB including its report',async()=>{
 const o=await options();let calls=0;
 const report=await runCocoaProbe(o,(async()=>{calls++;return new Response('x'.repeat(1_048_576),{headers:{'content-type':'text/plain'}});}) as typeof fetch);
 expect(calls).toBe(8);expect(report.events.at(-1)?.phase).toBe('limit');
 const total=(await readFile(join(o.outputDir,'probe.json'))).length+report.rawFiles.reduce((sum,f)=>sum+f.bytes,0);
 expect(total).toBeLessThanOrEqual(8_388_608);
});
it.each(['raw','percent','unicode'] as const)('withholds a %s credential echo before any raw write',async mode=>{
 const o=await options();
 const body=mode==='raw'?o.apiKey:mode==='percent'?[...o.apiKey].map(c=>'%'+c.charCodeAt(0).toString(16)).join(''):JSON.stringify([...o.apiKey].map(c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0')).join('')).replaceAll('\\\\u','\\u');
 const report=await runCocoaProbe(o,(async()=>new Response(body,{headers:{'content-type':'application/json'}})) as typeof fetch);
 expect(report.events.every(e=>e.phase==='credential')).toBe(true);expect(report.rawFiles).toHaveLength(0);
 expect(await readdir(join(o.outputDir,'raw'))).toEqual([]);expect(await readFile(join(o.outputDir,'probe.json'),'utf8')).not.toContain(o.apiKey);
});
it('distinguishes an empty HSCY response from zero or accepted coverage',async()=>{
 const o=await options();
 const report=await runCocoaProbe(o,(async input=>new URL(String(input)).searchParams.get('SUMMARY_LVL2')==='HSCY'?new Response(null,{status:204}):new Response(table(input),{headers:{'content-type':'application/json'}})) as typeof fetch);
 expect(report.probePassed).toBe(true);expect(report.coverage).toBe('unverified');expect(report.releaseAccepted).toBe(false);
 expect(report.pairs.every(p=>p.countryResponseEmpty&&p.countryRows===0)).toBe(true);
});
it.each(['missing-world','wrong-summary','wrong-product','wrong-month','duplicate-header','calendar-only','malformed','non-json'] as const)('retains safe evidence but rejects %s',async defect=>{
 const o=await options();
 const report=await runCocoaProbe(o,(async input=>{
  if(defect==='missing-world'&&new URL(String(input)).searchParams.get('SUMMARY_LVL2')==='HS')return new Response(null,{status:204});
  let b=table(input);
  if(defect==='wrong-summary')b=b.replaceAll('"HSCY"','"HS"');
  if(defect==='wrong-product')b=b.replaceAll('"180100"','"090121"');
  if(defect==='wrong-month')b=b.replaceAll('"2021-09"','"2020-09"').replaceAll('"2026-08"','"2020-08"');
  if(defect==='duplicate-header')b=b.replace('"CTY_NAME"','"CTY_CODE"');
  if(defect==='calendar-only')b=b.replace('"time"','"YEAR"');
  if(defect==='malformed')b='[';
  return new Response(b,{headers:{'content-type':defect==='non-json'?'text/html':'application/json'}});
 }) as typeof fetch);
 expect(report.probePassed).toBe(false);expect(report.rawFiles.length).toBeGreaterThan(0);expect(report.releaseAccepted).toBe(false);
});
it('refuses occupied output, extra CLI arguments and missing keys before any request',async()=>{
 const o=await options();await mkdir(o.outputDir);let calls=0;
 const fetcher=(async()=>{calls++;throw new Error('unexpected');}) as typeof fetch;
 await expect(runCocoaProbe(o,fetcher)).rejects.toThrow(/fresh|exists/);
 await expect(runCocoaProbe({...o,outputDir:join(o.outputDir,'other'),apiKey:''},fetcher)).rejects.toThrow();
 expect(calls).toBe(0);expect(()=>cocoaProbeMode(['--product','090121'])).toThrow();expect(()=>cocoaProbeMode(['--output','elsewhere'])).toThrow();expect(cocoaProbeMode([])).toBe('run');expect(cocoaProbeMode(['--preflight'])).toBe('preflight');
});
it('keeps dispatch manual/main-only, isolates the key, and uploads only the fixed diagnostic output',async()=>{
 const workflow=parse(await readFile('.github/workflows/probe-census-cocoa.yml','utf8'));
 expect(Object.keys(workflow.on)).toEqual(['workflow_dispatch']);expect(workflow.on.workflow_dispatch??{}).not.toHaveProperty('inputs');
 expect(workflow.permissions).toEqual({contents:'read'});
 const job=workflow.jobs.probe;expect(job.if).toContain("github.ref == 'refs/heads/main'");expect(job['timeout-minutes']).toBeLessThanOrEqual(15);
 const steps=job.steps;const retrieval=steps.filter((s:any)=>s.env?.CENSUS_API_KEY);
 expect(retrieval).toHaveLength(1);expect(retrieval[0].run).toBe('npm run data:probe-cocoa');
 expect(retrieval[0].env.CENSUS_API_KEY).toBe('${{ secrets.CENSUS_API_KEY }}');expect(retrieval[0]['timeout-minutes']).toBe(5);
 const upload=steps.find((s:any)=>String(s.uses).startsWith('actions/upload-artifact@'));
 expect(upload.if).toContain('always()');expect(upload.with.path).toBe('.tmp/cocoa-diagnostic/');expect(upload.with['retention-days']).toBe(7);
 expect(JSON.stringify(workflow)).not.toMatch(/R2_|AWS_|data:import|data:archive|wrangler|schedule/);
 expect(steps.find((s:any)=>s.id==='preflight').env).toBeUndefined();
});


it('shares the 30-second deadline between delayed headers and a stalled body',async()=>{
 const o=await options();let calls=0;vi.useFakeTimers();
 const pending=runCocoaProbe(o,(async input=>{
  calls++;
  if(calls>1)return new Response(table(input),{headers:{'content-type':'application/json'}});
  await new Promise(resolve=>setTimeout(resolve,25_000));
  return new Response(new ReadableStream({pull(){return new Promise(()=>{});}}));
 }) as typeof fetch);
 await vi.waitFor(()=>expect(calls).toBe(1));
 await vi.advanceTimersByTimeAsync(30_001);
 const report=await pending;expect(report.events[0]).toMatchObject({phase:'body',errorCode:'timeout',httpStatus:200});
 expect(report.events[0].elapsedMs).toBeGreaterThanOrEqual(30_000);expect(report.events[0].elapsedMs).toBeLessThan(30_100);
});
it('normalizes reordered response headers without changing retained raw bytes',async()=>{
 const o=await options();
 const report=await runCocoaProbe(o,(async input=>{
  const rows=JSON.parse(table(input)) as string[][];
  if(new URL(String(input)).searchParams.get('SUMMARY_LVL2')==='HSCY')for(const row of rows)row.reverse();
  return new Response(JSON.stringify(rows),{headers:{'content-type':'application/json'}});
 }) as typeof fetch);
 expect(report.probePassed).toBe(true);expect(report.pairs.every(p=>p.worldRows===1&&p.countryRows===1)).toBe(true);
});
