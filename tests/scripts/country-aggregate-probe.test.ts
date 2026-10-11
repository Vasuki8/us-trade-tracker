import {afterEach,expect,it} from 'vitest';
import {mkdtemp,readFile,readdir,rm,mkdir} from 'node:fs/promises';
import {join} from 'node:path';import {tmpdir} from 'node:os';import {createHash} from 'node:crypto';import {parse} from 'yaml';
import * as diagnostics from '../../scripts/diagnose-country';
import {countryFetch,referenceHtml} from '../helpers/country-data';
const dirs:string[]=[];afterEach(async()=>{for(const dir of dirs.splice(0))await rm(dir,{recursive:true,force:true});});
async function options(){const root=await mkdtemp(join(tmpdir(),'country-aggregate-'));dirs.push(root);return {countryCode:'1220',end:'2026-08',outputDir:join(root,'new'),apiKey:'synthetic-key',codeVersion:'test-version'};}
const probe=async(o:Awaited<ReturnType<typeof options>>,fetcher:typeof fetch=countryFetch())=>diagnostics.runCountryAggregateProbe(o,fetcher);
it('compares only subdivision predicate strategies for fixed failures and controls, retaining original hashes and no acceptance',async()=>{
 const o=await options(),urls:URL[]=[];let active=0,max=0;
 const report=await probe(o,(async(input,init)=>{
  urls.push(new URL(String(input)));active++;max=Math.max(max,active);expect(init?.signal).toBeInstanceOf(AbortSignal);
  const response=await countryFetch()(input,init),text=response.text.bind(response);
  Object.defineProperty(response,'text',{value:async()=>{await new Promise(resolve=>setTimeout(resolve,2));try{return await text();}finally{active--;}}});return response;
 }) as typeof fetch);
 expect(urls).toHaveLength(9);expect(urls[0].hostname).toBe('www.census.gov');expect(max).toBe(2);
 expect(urls.slice(1).map(url=>`${url.pathname.includes('/imports/')?'imports':'exports'}/${url.searchParams.get('YEAR')}-${url.searchParams.get('MONTH')}/${url.searchParams.get('SUMMARY_LVL2')}`)).toEqual(['imports/2025-05/CY','imports/2025-05/CY','imports/2025-06/HSCY','imports/2025-06/HSCY','imports/2026-08/CY','imports/2026-08/CY','exports/2026-05/CY','exports/2026-05/CY']);
 for(let index=1;index<9;index+=2){const [base,narrow]=urls.slice(index,index+2),fields=base.pathname.includes('/imports/')?['DISTRICT','RP','CTY_SUBCODE']:['DISTRICT','DF'];for(const field of fields){expect(base.searchParams.has(field)).toBe(false);expect(narrow.searchParams.getAll(field)).toEqual(['-']);narrow.searchParams.delete(field);}const baseGet=base.searchParams.get('get')!.split(',').filter(field=>!fields.includes(field));expect(narrow.searchParams.get('get')!.split(',')).toEqual(baseGet);narrow.searchParams.set('get',base.searchParams.get('get')!);expect(narrow.toString()).toBe(base.toString());}
 expect(report).toMatchObject({purpose:'aggregate-query-diagnostic',baselineAuditRunId:38096086464,probePassed:true,sourceCoverage:'unverified',classificationStatus:'unverified',releaseAccepted:false,logicalRequests:9});
 expect(report.pairedComparisons.map(row=>row.status)).toEqual(['equivalent','equivalent','equivalent','equivalent']);expect(report.exportReferenceChecks.map(row=>row.status)).toEqual(['matched','matched']);
 expect(report.results).toHaveLength(9);expect(report.events).toHaveLength(9);expect(report.rawFiles).toHaveLength(9);
 for(const file of report.rawFiles){const bytes=await readFile(join(o.outputDir,file.path));expect(bytes.length).toBe(file.bytes);expect(createHash('sha256').update(bytes).digest('hex')).toBe(file.sha256);expect(bytes.toString()).not.toContain(o.apiKey);expect(JSON.parse(bytes.toString()).requestUrl).not.toContain('key=');}
 expect(await readdir(o.outputDir)).toEqual(['aggregate-probe.json','raw']);
});
it('compares rows by commodity identity independent of response order, and catches equal-sum description changes',async()=>{
 const reordered=await probe(await options(),countryFetch((table,url)=>{if(url.searchParams.has('RP')&&url.searchParams.get('SUMMARY_LVL2')==='HSCY')table.splice(1,2,...table.slice(1).reverse());}));expect(reordered.pairedComparisons[1].status).toBe('equivalent');expect(reordered.probePassed).toBe(true);
 const changed=await probe(await options(),countryFetch((table,url)=>{if(url.searchParams.has('RP')&&url.searchParams.get('SUMMARY_LVL2')==='HSCY')table[1][1]='CHANGED DESCRIPTION';}));expect(changed.pairedComparisons[1]).toMatchObject({status:'mismatch',baselineAmountUsd:1000000,explicitAmountUsd:1000000});expect(changed.probePassed).toBe(false);
});
it('separates header/body retrieval failures, invalid contracts, paired availability and reference agreement',async()=>{
 const o=await options();const report=await probe(o,(async(input,init)=>{const url=new URL(String(input));
  if(url.searchParams.get('YEAR')==='2025'&&url.searchParams.get('MONTH')==='05'&&!url.searchParams.has('RP'))throw Object.assign(new Error(o.apiKey),{name:'TimeoutError'});
  const response=await countryFetch()(input,init);if(url.searchParams.get('YEAR')==='2025'&&url.searchParams.get('MONTH')==='06'&&!url.searchParams.has('RP'))Object.defineProperty(response,'text',{value:async()=>{throw Object.assign(new Error(o.apiKey),{cause:{code:'UND_ERR_BODY_TIMEOUT'}});}});
  if(url.searchParams.get('YEAR')==='2026'&&url.searchParams.get('MONTH')==='08'&&url.searchParams.has('RP'))return new Response((await response.text()).replaceAll('CANADA','MEXICO'),{headers:{'content-type':'application/json'}});return response;
 }) as typeof fetch);
 expect(report.probePassed).toBe(false);expect(report.rawFiles).toHaveLength(9);expect(report.results.filter(row=>row.outcome==='failed')).toHaveLength(3);
 expect(report.events).toEqual(expect.arrayContaining([expect.objectContaining({phase:'headers',httpStatus:null,errorCode:'timeout'}),expect.objectContaining({phase:'body',httpStatus:200,errorCode:'UND_ERR_BODY_TIMEOUT'})]));
 expect(report.pairedComparisons.slice(0,3).every(row=>row.status==='unavailable')).toBe(true);expect(report.exportReferenceChecks.every(row=>row.status==='matched')).toBe(true);expect(await readFile(join(o.outputDir,'aggregate-probe.json'),'utf8')).not.toContain(o.apiKey);
});
it('retains retry bodies and never treats absent or null product values as usable pairs',async()=>{
 const o=await options();let attempts=0;const report=await probe(o,(async(input,init)=>{const url=new URL(String(input));if(url.searchParams.get('SUMMARY_LVL2')==='HSCY'&&url.searchParams.has('RP'))return new Response(null,{status:204});if(url.searchParams.get('YEAR')==='2025'&&url.searchParams.get('MONTH')==='05'&&!url.searchParams.has('RP')&&attempts++===0)return new Response('temporary',{status:503});return countryFetch()(input,init);}) as typeof fetch);
 expect(report.events).toHaveLength(10);expect(report.probePassed).toBe(false);expect(report.pairedComparisons[1].status).toBe('unavailable');
 const raw=JSON.parse(await readFile(join(o.outputDir,'raw/aggregate-imports-2025-05-total-baseline.json'),'utf8'));expect(raw.responses).toMatchObject([{attempt:1,httpStatus:503,responseBody:'temporary'},{attempt:2,httpStatus:200}]);
 const missing=await probe(await options(),countryFetch((table,url)=>{if(url.searchParams.get('SUMMARY_LVL2')==='HSCY')table[1][2]='';}));expect(missing.probePassed).toBe(false);expect(missing.pairedComparisons[1].status).toBe('unavailable');
});
it('keeps a rounded reference mismatch separate from equivalent API rows and refuses missing reference months',async()=>{
 const mismatch=await probe(await options(),countryFetch((table,url)=>{if(url.pathname.includes('/exports/'))table[1][2]='1600000';}));expect(mismatch.pairedComparisons[3].status).toBe('equivalent');expect(mismatch.exportReferenceChecks.map(row=>row.status)).toEqual(['mismatch','mismatch']);expect(mismatch.exportReferenceChecks[0].differenceUsd).toBe(600000);expect(mismatch.probePassed).toBe(false);
 const missing=await probe(await options(),(async(input,init)=>new URL(String(input)).hostname==='www.census.gov'?new Response(referenceHtml().replace('<tr><td>May 2026</td><td>1.0</td><td>1.0</td><td>0.0</td></tr>',''),{headers:{'content-type':'text/html'}}):countryFetch()(input,init)) as typeof fetch);expect(missing.exportReferenceChecks.every(row=>row.status==='unavailable')).toBe(true);expect(missing.probePassed).toBe(false);
});
it('refuses occupied or concurrent output and unreviewed inputs before requests; echoed keys never become evidence',async()=>{
 const o=await options();await mkdir(o.outputDir);let calls=0;const noFetch=(async()=>{calls++;throw Error('unexpected');}) as typeof fetch;await expect(probe(o,noFetch)).rejects.toThrow(/fresh|exists/);await expect(probe({...o,countryCode:'2010'},noFetch)).rejects.toThrow();expect(calls).toBe(0);
 const simultaneous=await options(),runs=await Promise.allSettled([probe(simultaneous),probe(simultaneous)]);expect(runs.filter(row=>row.status==='fulfilled')).toHaveLength(1);
 const echoed={...await options(),apiKey:'key"with\\slash'};const report=await probe(echoed,(async()=>new Response(echoed.apiKey,{headers:{'content-type':'application/json'}})) as typeof fetch);expect(report.rawFiles).toHaveLength(0);expect(report.probePassed).toBe(false);expect(await readFile(join(echoed.outputDir,'aggregate-probe.json'),'utf8')).not.toContain('with');
});
it('runs the fixed diagnostic manually after restricted key-free preflight within its retry schedule',async()=>{
 const workflow=parse(await readFile('.github/workflows/audit-census-country.yml','utf8'));expect(workflow.on.workflow_dispatch.inputs.audit_mode.options).toContain('aggregate-probe');expect(workflow.permissions).toEqual({contents:'read'});expect(workflow.on).not.toHaveProperty('schedule');expect(workflow.jobs.audit.if).toBe("github.ref == 'refs/heads/main'");
 const steps=workflow.jobs.audit.steps,step=steps.find((row:{run?:string})=>row.run?.includes('data:probe-aggregates'));expect(step).toBeDefined();expect(step.if).toContain('aggregate-probe');expect(step['timeout-minutes']*60).toBeGreaterThan(30+4*(3*30+0.5+1));expect(step['timeout-minutes']).toBe(7);expect(step.env.CENSUS_API_KEY).toContain('secrets.CENSUS_API_KEY');expect(steps.find((row:{id?:string})=>row.id==='preflight').run).toContain('aggregate-probe');expect(JSON.stringify(workflow)).not.toContain('R2_');
});
