import {afterEach,expect,it} from 'vitest';
import {mkdtemp,readFile,readdir,rm,mkdir} from 'node:fs/promises';
import {join} from 'node:path';import {tmpdir} from 'node:os';import {createHash} from 'node:crypto';import {parse} from 'yaml';
import * as client from '../../scripts/census-country-client';
import * as diagnostics from '../../scripts/diagnose-country';
import {countryFetch,referenceHtml} from '../helpers/country-data';

const context={countryCode:'1220',month:'2026-08',direction:'imports' as const,kind:'total' as const};
function enduseTable(month='2026-08'){
 return [['I_ENDUSE','I_ENDUSE_LDESC','GEN_VAL_MO','CTY_CODE','CTY_NAME','COMM_LVL','SUMMARY_LVL','SUMMARY_LVL2','DISTRICT','LAST_UPDATE','YEAR','MONTH'],['-','ALL GOODS','1000000','1220','CANADA','','DET','CY','-','2026-10-10',month.slice(0,4),month.slice(5)]];
}
const json=(payload:unknown)=>new Response(JSON.stringify(payload),{headers:{'content-type':'application/json'}});
const fetcher:typeof fetch=(async(input,init)=>{const url=new URL(String(input));return url.pathname.endsWith('/enduse')?json(enduseTable(`${url.searchParams.get('YEAR')}-${url.searchParams.get('MONTH')}`)):countryFetch()(input,init);}) as typeof fetch;
const dirs:string[]=[];afterEach(async()=>{for(const dir of dirs.splice(0))await rm(dir,{recursive:true,force:true});});
async function options(){const root=await mkdtemp(join(tmpdir(),'country-totals-'));dirs.push(root);return {countryCode:'1220',end:'2026-08',outputDir:join(root,'new'),apiKey:'synthetic-key',codeVersion:'test-version'};}

it('requests a country total from end-use using only its supported dimensions and retains the original endpoint',async()=>{
 const evidence:any[]=[];
 const total=await client.fetchCountryImportEnduseTotal({...context,apiKey:'fixture-key',onRaw:async raw=>{evidence.push(raw);}},(async(input,init)=>{
  const url=new URL(String(input));expect(url.pathname).toBe('/data/timeseries/intltrade/imports/enduse');expect(init?.signal).toBeInstanceOf(AbortSignal);
  expect(Object.fromEntries(url.searchParams)).toEqual({CTY_CODE:'1220',SUMMARY_LVL:'DET',SUMMARY_LVL2:'CY',YEAR:'2026',MONTH:'08',get:'I_ENDUSE,I_ENDUSE_LDESC,GEN_VAL_MO,CTY_NAME,COMM_LVL,DISTRICT,LAST_UPDATE',key:'fixture-key'});
  return json(enduseTable());
 }) as typeof fetch);
 expect(total).toEqual({countryCode:'1220',month:'2026-08',endpoint:'enduse',measure:'GEN_VAL_MO',description:'ALL GOODS',valueUsd:1000000});
 expect(evidence).toHaveLength(1);expect(JSON.parse(evidence[0].responseBody)).toEqual(enduseTable());expect(evidence[0].requestUrl).toContain('/imports/enduse?');expect(JSON.stringify(evidence)).not.toContain('fixture-key');
});
it('rejects crossed, subdivided and end-use breakdown rows instead of treating them as all-goods totals',()=>{
 expect(client.normalizeCountryImportEnduseTotal(enduseTable(),context).valueUsd).toBe(1000000);
 for(const [field,value] of [['I_ENDUSE','0'],['CTY_CODE','2010'],['CTY_NAME','MEXICO'],['COMM_LVL','EU1'],['SUMMARY_LVL','CGP'],['SUMMARY_LVL2','EUCY'],['DISTRICT','10'],['YEAR','2025'],['MONTH','8']]){const table=enduseTable();table[1][table[0].indexOf(field)]=value;expect(()=>client.normalizeCountryImportEnduseTotal(table,context)).toThrow();}
 const duplicate=enduseTable();duplicate.push([...duplicate[1]]);expect(()=>client.normalizeCountryImportEnduseTotal(duplicate,context)).toThrow();
 for(const field of ['RP','CTY_SUBCODE','time']){const extra=enduseTable();extra[0].push(field);extra[1].push('-');expect(()=>client.normalizeCountryImportEnduseTotal(extra,context)).toThrow();}
 const absent=enduseTable();absent[0].pop();absent[1].pop();expect(()=>client.normalizeCountryImportEnduseTotal(absent,context)).toThrow();
 const header=enduseTable();header[0][1]=header[0][0];expect(()=>client.normalizeCountryImportEnduseTotal(header,context)).toThrow();
 expect(()=>client.normalizeCountryImportEnduseTotal(enduseTable(),{...context,kind:'products'})).toThrow();expect(()=>client.normalizeCountryImportEnduseTotal(enduseTable(),{...context,direction:'exports'})).toThrow();
});
it('preserves zero and missing totals and rejects unsafe dollar values',()=>{
 for(const [raw,expected] of [['0',0],['',null],['null',null],[null,null]] as const){const table:unknown[][]=enduseTable();table[1][2]=raw;expect(client.normalizeCountryImportEnduseTotal(table,context).valueUsd).toBe(expected);}
 for(const value of ['-1','1.5','(D)','9007199254740992',1000000]){const table:unknown[][]=enduseTable();table[1][2]=value;expect(()=>client.normalizeCountryImportEnduseTotal(table,context)).toThrow();}
});
it('retains bounded retry and failure evidence without credentials or accepting 204/non-JSON totals',async()=>{
 const evidence:any[]=[];let calls=0;
 await client.fetchCountryImportEnduseTotal({...context,apiKey:'fixture-key',onRaw:async raw=>{evidence.push(raw);}},(async()=>++calls===1?new Response('temporary',{status:503}):json(enduseTable())) as typeof fetch);
 expect(calls).toBe(2);expect(evidence[0].responses).toMatchObject([{attempt:1,httpStatus:503,responseBody:'temporary'},{attempt:2,httpStatus:200}]);
 for(const response of [new Response(null,{status:204}),new Response('not JSON',{headers:{'content-type':'text/html'}}),json(null),json(enduseTable('2026-07'))]){await expect(client.fetchCountryImportEnduseTotal({...context,apiKey:'fixture-key'},(async()=>response) as typeof fetch)).rejects.toThrow();}
 let saved=false;await expect(client.fetchCountryImportEnduseTotal({...context,apiKey:'fixture-key',onRaw:async()=>{saved=true;}},(async()=>new Response('fixture-key',{status:400})) as typeof fetch)).rejects.toThrow(/credential/);expect(saved).toBe(false);
});
it('compares three fixed HS/end-use pairs with an independently retrieved reference, retaining seven originals',async()=>{
 const o=await options(),urls:URL[]=[];let active=0,max=0;
 const report=await diagnostics.runCountryTotalProbe(o,(async(input,init)=>{urls.push(new URL(String(input)));active++;max=Math.max(max,active);const response=await fetcher(input,init),text=response.text.bind(response);Object.defineProperty(response,'text',{value:async()=>{await new Promise(resolve=>setTimeout(resolve,2));try{return await text();}finally{active--;}}});return response;}) as typeof fetch);
 expect(urls).toHaveLength(7);expect(urls[0].hostname).toBe('www.census.gov');expect(max).toBe(2);
 expect(urls.slice(1).map(url=>`${url.pathname.split('/').at(-1)}/${url.searchParams.get('YEAR')}-${url.searchParams.get('MONTH')}/${url.searchParams.get('SUMMARY_LVL2')}`)).toEqual(['hs/2025-05/CY','enduse/2025-05/CY','hs/2025-06/CY','enduse/2025-06/CY','hs/2026-08/CY','enduse/2026-08/CY']);
 expect(report).toMatchObject({purpose:'total-endpoint-diagnostic',probePassed:true,baselineAuditRunId:38096086464,logicalRequests:7,sourceCoverage:'unverified',classificationStatus:'unverified',releaseAccepted:false});
 expect(report.totalComparisons.map(row=>row.status)).toEqual(['equivalent','equivalent','equivalent']);expect(report.importReferenceChecks.map(row=>row.status)).toEqual(Array(6).fill('matched'));
 expect(report.rawFiles).toHaveLength(7);expect(report.events).toHaveLength(7);
 for(const file of report.rawFiles){const bytes=await readFile(join(o.outputDir,file.path));expect(bytes.length).toBe(file.bytes);expect(createHash('sha256').update(bytes).digest('hex')).toBe(file.sha256);expect(bytes.toString()).not.toContain(o.apiKey);}
 expect(await readdir(o.outputDir)).toEqual(['raw','total-probe.json']);
});
it('keeps an available alternate total separate from a missing HS total, and distinguishes disagreement from rounding',async()=>{
 const report=await diagnostics.runCountryTotalProbe(await options(),(async(input,init)=>{const url=new URL(String(input));if(url.pathname.endsWith('/hs')&&url.searchParams.get('MONTH')==='05')throw Object.assign(Error('secret'),{name:'TimeoutError'});if(url.pathname.endsWith('/enduse')&&url.searchParams.get('MONTH')==='06'){const table=enduseTable('2025-06');table[1][2]='1050000';return json(table);}return fetcher(input,init);}) as typeof fetch);
 expect(report.probePassed).toBe(false);expect(report.totalComparisons.map(row=>row.status)).toEqual(['unavailable','mismatch','equivalent']);expect(report.importReferenceChecks.find(row=>row.month==='2025-05'&&row.endpoint==='enduse')?.status).toBe('matched');expect(report.importReferenceChecks.find(row=>row.month==='2025-06'&&row.endpoint==='enduse')?.status).toBe('mismatch');expect(report.events).toContainEqual(expect.objectContaining({phase:'headers',httpStatus:null,errorCode:'timeout'}));expect(report.rawFiles).toHaveLength(7);
 const missing=await diagnostics.runCountryTotalProbe(await options(),(async(input,init)=>new URL(String(input)).pathname.endsWith('/enduse')?json(enduseTable().map((row,index)=>index?[...row.slice(0,2),'',...row.slice(3)]:row)):fetcher(input,init)) as typeof fetch);expect(missing.probePassed).toBe(false);expect(missing.totalComparisons.every(row=>row.status==='unavailable')).toBe(true);
});
it('refuses unavailable reference, occupied outputs and unreviewed inputs; a response echo never leaks the key',async()=>{
 const noReference=await diagnostics.runCountryTotalProbe(await options(),(async(input,init)=>new URL(String(input)).hostname==='www.census.gov'?new Response(referenceHtml().replace('<tr><td>May 2025</td><td>1.0</td><td>1.0</td><td>0.0</td></tr>',''),{headers:{'content-type':'text/html'}}):fetcher(input,init)) as typeof fetch);expect(noReference.probePassed).toBe(false);expect(noReference.importReferenceChecks.slice(0,2).map(row=>row.status)).toEqual(['unavailable','unavailable']);
 const o=await options();await mkdir(o.outputDir);let calls=0;const noFetch=(async()=>{calls++;throw Error('unexpected');}) as typeof fetch;await expect(diagnostics.runCountryTotalProbe(o,noFetch)).rejects.toThrow(/fresh|exists/);await expect(diagnostics.runCountryTotalProbe({...o,countryCode:'2010'},noFetch)).rejects.toThrow();expect(calls).toBe(0);
 const echo=await options(),report=await diagnostics.runCountryTotalProbe(echo,(async()=>new Response(echo.apiKey,{headers:{'content-type':'application/json'}})) as typeof fetch);expect(report.rawFiles).toHaveLength(0);expect(report.probePassed).toBe(false);expect(await readFile(join(echo.outputDir,'total-probe.json'),'utf8')).not.toContain(echo.apiKey);
});
it('provides a restricted manual diagnostic within the permitted nineteen-attempt retry budget',async()=>{
 const workflow=parse(await readFile('.github/workflows/audit-census-country.yml','utf8'));expect(workflow.on.workflow_dispatch.inputs.audit_mode.options).toContain('total-probe');expect(workflow.on).not.toHaveProperty('schedule');expect(workflow.permissions).toEqual({contents:'read'});
 const steps=workflow.jobs.audit.steps,step=steps.find((row:{run?:string})=>row.run?.includes('data:probe-totals'));expect(step.if).toContain('total-probe');expect(step['timeout-minutes']).toBe(6);expect(step['timeout-minutes']*60).toBeGreaterThan(30+3*(3*30+0.5+1));expect(step.env.CENSUS_API_KEY).toContain('secrets.CENSUS_API_KEY');expect(steps.find((row:{id?:string})=>row.id==='preflight').run).toContain('total-probe');expect(JSON.stringify(workflow)).not.toContain('R2_');
});
