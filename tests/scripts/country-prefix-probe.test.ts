import {afterEach,expect,it} from 'vitest';
import {mkdtemp,readFile,readdir,rm,mkdir} from 'node:fs/promises';
import {join} from 'node:path';import {tmpdir} from 'node:os';import {createHash} from 'node:crypto';import {parse} from 'yaml';
import * as client from '../../scripts/census-country-client';
import * as diagnostics from '../../scripts/diagnose-country';
import {countryFetch,countryTable} from '../helpers/country-data';
const context={countryCode:'1220',month:'2026-08',direction:'imports' as const,kind:'products' as const,commodityPrefix:'0'};
const json=(payload:unknown)=>new Response(JSON.stringify(payload),{headers:{'content-type':'application/json'}});
const fetcher=()=>countryFetch((table,url)=>{if(url.searchParams.has('I_COMMODITY'))table.splice(1,table.length-1,...table.slice(1).filter(row=>row[0].startsWith(url.searchParams.get('I_COMMODITY')!.slice(0,-1))));});
const dirs:string[]=[];afterEach(async()=>{for(const dir of dirs.splice(0))await rm(dir,{recursive:true,force:true});});
async function options(){const root=await mkdtemp(join(tmpdir(),'country-prefix-'));dirs.push(root);return {countryCode:'1220',end:'2026-08',outputDir:join(root,'new'),apiKey:'synthetic-key',codeVersion:'test-version'};}

it('requests a scoped import prefix without repeating its commodity predicate and retains explicit partial identity',async()=>{
 const evidence:any[]=[];
 const part=await client.fetchCountryImportPrefix({...context,apiKey:'fixture-key',onRaw:async raw=>{evidence.push(raw);}},(async(input,init)=>{
  const url=new URL(String(input));expect(url.pathname).toBe('/data/timeseries/intltrade/imports/hs');expect(init?.signal).toBeInstanceOf(AbortSignal);
  expect(url.searchParams.getAll('I_COMMODITY')).toEqual(['0*']);expect(url.searchParams.get('get')!.split(',')).not.toContain('I_COMMODITY');
  for(const [field,value] of Object.entries({CTY_CODE:'1220',SUMMARY_LVL:'DET',SUMMARY_LVL2:'HSCY',COMM_LVL:'HS6',YEAR:'2026',MONTH:'08'}))expect(url.searchParams.get(field)).toBe(value);
  expect(url.searchParams.has('DISTRICT')).toBe(false);return fetcher()(input,init);
 }) as typeof fetch);
 expect(part).toMatchObject({commodityPrefix:'0',completeCountryBreakdown:false,measure:'GEN_VAL_MO',rows:[{code:'090121',valueUsd:900000}]});
 expect(evidence[0]).toMatchObject({commodityPrefix:'0',completeCountryBreakdown:false,kind:'products'});expect(JSON.stringify(evidence)).not.toContain('fixture-key');
 let queried=false;await client.fetchCountryPart({...context,apiKey:'fixture-key'},(async(input,init)=>{queried=true;expect(new URL(String(input)).searchParams.has('I_COMMODITY')).toBe(false);return countryFetch()(input,init);}) as typeof fetch);expect(queried).toBe(true);
});
it('rejects unsupported scope before requests, and rejects crossed identities, duplicate or out-of-prefix rows',async()=>{
 let calls=0;const noFetch=(async()=>{calls++;throw Error('unexpected');}) as typeof fetch;
 for(const commodityPrefix of ['', '0*','09','a','-',0 as unknown as string])await expect(client.fetchCountryImportPrefix({...context,commodityPrefix,apiKey:'fixture-key'},noFetch)).rejects.toThrow();
 for(const change of [{kind:'total' as const},{direction:'exports' as const},{explicitAggregates:true}])await expect(client.fetchCountryImportPrefix({...context,...change,apiKey:'fixture-key'},noFetch)).rejects.toThrow();expect(calls).toBe(0);
 const valid=countryTable();valid.splice(2,1);expect(client.normalizeCountryImportPrefix(valid,context).rows).toHaveLength(1);
 for(const [field,value] of [['I_COMMODITY','999995'],['CTY_CODE','2010'],['time','2026-07'],['DISTRICT','10'],['COMM_LVL','HS2'],['SUMMARY_LVL2','CY']]){const table=structuredClone(valid);table[1][table[0].indexOf(field)]=value;expect(()=>client.normalizeCountryImportPrefix(table,context)).toThrow();}
 const duplicate=structuredClone(valid);duplicate.push([...duplicate[1]]);expect(()=>client.normalizeCountryImportPrefix(duplicate,context)).toThrow(/Duplicate/);
 const missing=structuredClone(valid);missing[1][2]='';expect(client.normalizeCountryImportPrefix(missing,context).rows[0].valueUsd).toBeNull();missing[1][2]='0';expect(client.normalizeCountryImportPrefix(missing,context).rows[0].valueUsd).toBe(0);
});
it('retains scoped retry/transport evidence and distinguishes empty 204 from invalid JSON or credential echoes',async()=>{
 const evidence:any[]=[];let calls=0;
 await client.fetchCountryImportPrefix({...context,apiKey:'fixture-key',onRaw:async raw=>{evidence.push(raw);}},(async(input,init)=>++calls===1?new Response('temporary',{status:503}):fetcher()(input,init)) as typeof fetch);
 expect(evidence[0]).toMatchObject({commodityPrefix:'0',completeCountryBreakdown:false,responses:[{attempt:1,httpStatus:503,responseBody:'temporary'},{attempt:2,httpStatus:200}]});
 const failed:any[]=[];await expect(client.fetchCountryImportPrefix({...context,apiKey:'fixture-key',onRaw:async raw=>{failed.push(raw);}},(async()=>{throw Error('fixture-key');}) as typeof fetch)).rejects.toThrow();expect(failed[0]).toMatchObject({commodityPrefix:'0',responses:[{httpStatus:null,responseBody:null}]});
 expect(await client.fetchCountryImportPrefix({...context,apiKey:'fixture-key'},(async()=>new Response(null,{status:204})) as typeof fetch)).toMatchObject({rows:[],completeCountryBreakdown:false});
 await expect(client.fetchCountryImportPrefix({...context,apiKey:'fixture-key'},(async()=>json(null)) as typeof fetch)).rejects.toThrow();
 let saved=false;await expect(client.fetchCountryImportPrefix({...context,apiKey:'fixture-key',onRaw:async()=>{saved=true;}},(async()=>new Response('fixture-key',{status:400})) as typeof fetch)).rejects.toThrow(/credential/);expect(saved).toBe(false);
});
it('compares three full/scoped pairs by complete normalized subset rows, retaining seven originals under two-request concurrency',async()=>{
 const o=await options(),urls:URL[]=[];let active=0,max=0;
 const report=await diagnostics.runCountryPrefixProbe(o,(async(input,init)=>{urls.push(new URL(String(input)));active++;max=Math.max(max,active);const response=await fetcher()(input,init),text=response.text.bind(response);Object.defineProperty(response,'text',{value:async()=>{await new Promise(resolve=>setTimeout(resolve,2));try{return await text();}finally{active--;}}});return response;}) as typeof fetch);
 expect(urls).toHaveLength(7);expect(urls[0].hostname).toBe('www.census.gov');expect(max).toBe(2);
 expect(urls.slice(1).map(url=>`${url.searchParams.get('YEAR')}-${url.searchParams.get('MONTH')}/${url.searchParams.get('I_COMMODITY')??'full'}`)).toEqual(['2024-09/full','2024-09/0*','2026-04/full','2026-04/0*','2025-02/full','2025-02/0*']);
 expect(report).toMatchObject({purpose:'prefix-query-diagnostic',probePassed:true,baselineAuditRunId:38105445755,logicalRequests:7,sourceCoverage:'unverified',classificationStatus:'unverified',releaseAccepted:false});
 expect(report.prefixComparisons.map(row=>({status:row.status,baselineSubsetRows:row.baselineSubsetRows,prefixRows:row.prefixRows,baselineSubsetAmountUsd:row.baselineSubsetAmountUsd,prefixAmountUsd:row.prefixAmountUsd}))).toEqual(Array(3).fill({status:'equivalent',baselineSubsetRows:1,prefixRows:1,baselineSubsetAmountUsd:900000,prefixAmountUsd:900000}));
 expect(report.rawFiles).toHaveLength(7);expect(report.events).toHaveLength(7);
 for(const file of report.rawFiles){const bytes=await readFile(join(o.outputDir,file.path));expect(bytes.length).toBe(file.bytes);expect(createHash('sha256').update(bytes).digest('hex')).toBe(file.sha256);expect(bytes.toString()).not.toContain(o.apiKey);}
 expect(await readdir(o.outputDir)).toEqual(['prefix-probe.json','raw']);
});
it('keeps a received prefix separate from missing full coverage and detects exact-dollar disagreement',async()=>{
 const report=await diagnostics.runCountryPrefixProbe(await options(),(async(input,init)=>{const url=new URL(String(input));if(url.searchParams.get('YEAR')==='2024'&&!url.searchParams.has('I_COMMODITY'))throw Object.assign(Error('secret'),{name:'TimeoutError'});if(url.searchParams.get('MONTH')==='04'&&url.searchParams.has('I_COMMODITY'))return countryFetch((table)=>{table.splice(2,1);table[1][2]='900001';})(input,init);return fetcher()(input,init);}) as typeof fetch);
 expect(report.probePassed).toBe(false);expect(report.prefixComparisons.map(row=>row.status)).toEqual(['unavailable','mismatch','equivalent']);expect(report.results.find(row=>row.label==='imports-2024-09-products-prefix-0')?.outcome).toBe('validated');expect(report.events).toContainEqual(expect.objectContaining({phase:'headers',httpStatus:null,errorCode:'timeout'}));expect(report.rawFiles).toHaveLength(7);
});
it('detects description-only subset changes and ignores response row ordering',async()=>{
 for(const mismatch of [false,true]){
  const report=await diagnostics.runCountryPrefixProbe(await options(),countryFetch((table,url)=>{const extra=[...table[1]];extra[0]='090111';extra[1]='GREEN COFFEE';extra[2]='0';table.push(extra);if(url.searchParams.has('I_COMMODITY')){table.splice(1,table.length-1,...table.slice(1).filter(row=>row[0].startsWith('0')).reverse());if(mismatch)table[1][1]='CHANGED DESCRIPTION';}}));
  expect(report.probePassed).toBe(!mismatch);expect(report.prefixComparisons.map(row=>row.status)).toEqual(Array(3).fill(mismatch?'mismatch':'equivalent'));
 }
});
it('leaves missing values and empty prefix responses unavailable while preserving reported zero',async()=>{
 for(const state of ['missing','empty','zero']){
  const report=await diagnostics.runCountryPrefixProbe(await options(),(async(input,init)=>{const url=new URL(String(input));if(state==='empty'&&url.searchParams.has('I_COMMODITY'))return new Response(null,{status:204});return countryFetch((table,url)=>{table[1][2]=state==='missing'?'':'0';if(url.searchParams.has('I_COMMODITY'))table.splice(2,1);})(input,init);}) as typeof fetch);
  expect(report.probePassed).toBe(state==='zero');expect(report.prefixComparisons.map(row=>row.status)).toEqual(Array(3).fill(state==='zero'?'equivalent':'unavailable'));
 }
});
it('refuses unreviewed or occupied output before requests and withholds credential-bearing evidence',async()=>{
 const o=await options();await mkdir(o.outputDir);let calls=0;const noFetch=(async()=>{calls++;throw Error('unexpected');}) as typeof fetch;
 await expect(diagnostics.runCountryPrefixProbe(o,noFetch)).rejects.toThrow(/fresh|exists/);await expect(diagnostics.runCountryPrefixProbe({...o,countryCode:'2010'},noFetch)).rejects.toThrow();expect(calls).toBe(0);
 const echo=await options(),report=await diagnostics.runCountryPrefixProbe(echo,(async()=>new Response(echo.apiKey,{headers:{'content-type':'application/json'}})) as typeof fetch);expect(report.rawFiles).toHaveLength(0);expect(report.probePassed).toBe(false);expect(await readFile(join(echo.outputDir,'prefix-probe.json'),'utf8')).not.toContain(echo.apiKey);
});
it('restricts the manual prefix diagnostic to preflighted main with a six-minute nineteen-attempt budget',async()=>{
 const workflow=parse(await readFile('.github/workflows/audit-census-country.yml','utf8'));expect(workflow.on.workflow_dispatch.inputs.audit_mode.options).toContain('prefix-probe');expect(workflow.permissions).toEqual({contents:'read'});expect(workflow.on).not.toHaveProperty('schedule');expect(workflow.jobs.audit.if).toBe("github.ref == 'refs/heads/main'");
 const steps=workflow.jobs.audit.steps,step=steps.find((row:{run?:string})=>row.run?.includes('data:probe-prefix'));expect(step.if).toContain('prefix-probe');expect(step['timeout-minutes']).toBe(6);expect(step['timeout-minutes']*60).toBeGreaterThan(30+3*(3*30+0.5+1));expect(step.env.CENSUS_API_KEY).toContain('secrets.CENSUS_API_KEY');expect(steps.find((row:{id?:string})=>row.id==='preflight').run).toContain('prefix-probe');expect(JSON.stringify(workflow)).not.toContain('R2_');
 const pkg=JSON.parse(await readFile('package.json','utf8'));expect(pkg.scripts['data:probe-prefix']).toContain('scripts/probe-country-prefix.ts');
});
