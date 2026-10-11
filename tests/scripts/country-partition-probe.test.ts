import {afterEach,expect,it} from 'vitest';
import {mkdtemp,readFile,readdir,rm,mkdir} from 'node:fs/promises';
import {join} from 'node:path';import {tmpdir} from 'node:os';import {createHash} from 'node:crypto';import {parse} from 'yaml';
import * as client from '../../scripts/census-country-client';
import * as diagnostics from '../../scripts/diagnose-country';
import type {CountryPrefixPart} from '../../scripts/country-audit-types';
import {countryFetch} from '../helpers/country-data';
const month='2024-09',prefixes=Array.from({length:10},(_,i)=>String(i));
const parts=():CountryPrefixPart[]=>prefixes.map(commodityPrefix=>({countryCode:'1220',month,direction:'imports',kind:'products',measure:'GEN_VAL_MO',commodityPrefix,completeCountryBreakdown:false,rows:[{code:`${commodityPrefix}10000`,description:'TEST PRODUCT',valueUsd:100000,special:false}]}));
const fixture=countryFetch((table,url)=>{
 if(url.searchParams.get('SUMMARY_LVL2')==='CY')return;
 const prefix=url.searchParams.get('I_COMMODITY')?.slice(0,-1)??'?',row=[...table[1]];row[0]=`${prefix}10000`;row[1]='TEST PRODUCT';row[2]='100000';table.splice(1,table.length-1,row);
 if(prefix==='0'){const zero=[...row];zero[0]='090111';zero[2]='0';table.push(zero);}
 if(prefix==='9'){row[0]='980000';row[2]='40000';const special=[...row];special[0]='999995';special[2]='60000';table.push(special);}
});
const dirs:string[]=[];afterEach(async()=>{for(const dir of dirs.splice(0))await rm(dir,{recursive:true,force:true});});
async function options(){const root=await mkdtemp(join(tmpdir(),'country-partition-'));dirs.push(root);return {countryCode:'1220',end:'2026-08',outputDir:join(root,'new'),apiKey:'fixture-key',codeVersion:'fixture-version'};}

it('assembles all ten disjoint scopes deterministically, retaining zeros and special categories',()=>{
 const input=parts();input[0].rows.push({code:'090111',description:'ZERO',valueUsd:0,special:false});input[9].rows=[{code:'980000',description:'RETURNS',valueUsd:40000,special:true},{code:'999995',description:'ESTIMATE',valueUsd:60000,special:true}];
 const assembled=client.assembleCountryImportPrefixes(input,month);
 expect(assembled.amountUsd).toBe(1000000);expect(assembled.rows).toHaveLength(12);expect(assembled.specialRows.map(row=>row.code)).toEqual(['980000','999995']);expect(assembled.rows.find(row=>row.code==='090111')?.valueUsd).toBe(0);
 expect(client.assembleCountryImportPrefixes([...input].reverse().map(part=>({...part,rows:[...part.rows].reverse()})),month)).toEqual(assembled);
});
it('rejects missing, repeated, incompatible, empty or overlapping prefix inputs',()=>{
 expect(typeof client.assembleCountryImportPrefixes).toBe('function');
 const bad:CountryPrefixPart[][]=[parts().slice(1),[...parts(),parts()[0]]];const duplicate=parts();duplicate[9]=duplicate[0];bad.push(duplicate);
 for(const patch of [{countryCode:'2010'},{month:'2024-10'},{direction:'exports'},{kind:'total'},{measure:'ALL_VAL_MO'},{commodityPrefix:'0*'},{completeCountryBreakdown:true},{rows:[]}]){const input=parts();Object.assign(input[0],patch);bad.push(input);}
 for(const patch of [{code:'110000'},{code:'01000'},{valueUsd:null},{valueUsd:-1},{valueUsd:0.1},{valueUsd:Infinity},{valueUsd:Number.MAX_SAFE_INTEGER+1},{valueUsd:'0'},{special:true},{description:null}]){const input=parts();Object.assign(input[0].rows[0],patch);bad.push(input);}
 const rows=parts();rows[0].rows.push({...rows[0].rows[0]});bad.push(rows);
 for(const input of bad)expect(()=>client.assembleCountryImportPrefixes(input,month)).toThrow();
 const unsafe=parts();unsafe[0].rows[0].valueUsd=Number.MAX_SAFE_INTEGER;expect(()=>client.assembleCountryImportPrefixes(unsafe,month)).toThrow();
 expect(()=>client.assembleCountryImportPrefixes(parts(),'2024-99')).toThrow();
});
it('retrieves a fixed same-run set, reconciles exactly, retains twelve originals and limits concurrency to two',async()=>{
 const o=await options(),urls:URL[]=[];let active=0,max=0;
 const report=await diagnostics.runCountryPartitionProbe(o,(async(input,init)=>{urls.push(new URL(String(input)));active++;max=Math.max(max,active);const response=await fixture(input,init),text=response.text.bind(response);Object.defineProperty(response,'text',{value:async()=>{await new Promise(resolve=>setTimeout(resolve,2));try{return await text();}finally{active--;}}});return response;}) as typeof fetch);
 expect(urls).toHaveLength(12);expect(urls[0].hostname).toBe('www.census.gov');expect(max).toBe(2);
 expect(urls.slice(1).map(url=>url.searchParams.get('I_COMMODITY')??'total')).toEqual([...prefixes.map(prefix=>`${prefix}*`),'total']);
 for(const url of urls.slice(1)){expect(url.pathname).toBe('/data/timeseries/intltrade/imports/hs');expect(url.searchParams.get('YEAR')).toBe('2024');expect(url.searchParams.get('MONTH')).toBe('09');expect(url.searchParams.get('CTY_CODE')).toBe('1220');}
 expect(report).toMatchObject({purpose:'partition-query-diagnostic',baselineAuditRunId:38108488071,probeMonth:month,logicalRequests:12,probePassed:true,sourceCoverage:'unverified',classificationStatus:'unverified',releaseAccepted:false,rollingComparisonAvailable:false});
 expect(report.partitionAssembly).toMatchObject({status:'assembled',rows:12,amountUsd:1000000,specialRows:[{code:'980000',valueUsd:40000},{code:'999995',valueUsd:60000}]});
 expect(report.reconciliation).toEqual({status:'matched',assembledAmountUsd:1000000,apiTotalUsd:1000000,residualUsd:0});expect(report.referenceCheck).toMatchObject({status:'matched',referenceUsd:1000000,apiTotalUsd:1000000,precisionUsd:100000});
 expect(report.rawFiles).toHaveLength(12);expect(report.events).toHaveLength(12);expect(report.results.filter(row=>row.label.includes('prefix-'))).toHaveLength(10);
 for(const file of report.rawFiles){const bytes=await readFile(join(o.outputDir,file.path));expect(bytes.length).toBe(file.bytes);expect(createHash('sha256').update(bytes).digest('hex')).toBe(file.sha256);expect(bytes.toString()).not.toContain(o.apiKey);}
 expect(await readdir(o.outputDir)).toEqual(['partition-probe.json','raw']);
});
it('retains every available original and finishes after one header failure without assembling a partial sum',async()=>{
 const o=await options(),report=await diagnostics.runCountryPartitionProbe(o,(async(input,init)=>new URL(String(input)).searchParams.get('I_COMMODITY')==='4*'?Promise.reject(Object.assign(Error(o.apiKey),{name:'TimeoutError'})):fixture(input,init)) as typeof fetch);
 expect(report.probePassed).toBe(false);expect(report.partitionAssembly).toMatchObject({status:'unavailable',rows:null,amountUsd:null,normalizedRowsSha256:null});expect(report.reconciliation).toEqual({status:'unavailable',assembledAmountUsd:null,apiTotalUsd:1000000,residualUsd:null});expect(report.rawFiles).toHaveLength(12);expect(report.results).toHaveLength(12);expect(report.events).toContainEqual(expect.objectContaining({phase:'headers',httpStatus:null,errorCode:'timeout'}));expect(await readFile(join(o.outputDir,'partition-probe.json'),'utf8')).not.toContain(o.apiKey);
});
it('keeps empty, missing and malformed partitions unavailable while a genuine zero stays valid',async()=>{
 for(const state of ['empty','missing','wrong-prefix','wrong-country','zero']){
  const report=await diagnostics.runCountryPartitionProbe(await options(),(async(input,init)=>{if(new URL(String(input)).searchParams.get('I_COMMODITY')!=='4*')return fixture(input,init);if(state==='empty')return new Response(null,{status:204});const response=await fixture(input,init),table=JSON.parse(await response.text());if(state==='wrong-prefix')table[1][0]='510000';else if(state==='wrong-country')table[1][3]='2010';else table[1][2]=state==='missing'?'':'0';return new Response(JSON.stringify(table),{headers:{'content-type':'application/json'}});}) as typeof fetch);
  expect(report.probePassed).toBe(false);expect(report.partitionAssembly.status).toBe(state==='zero'?'assembled':'unavailable');expect(report.partitionAssembly.amountUsd).toBe(state==='zero'?900000:null);expect(report.reconciliation.status).toBe(state==='zero'?'mismatch':'unavailable');
 }
});
it('distinguishes a one-dollar residual, missing total and independently rounded reference mismatch',async()=>{
 for(const state of ['residual','missing-total','reference']){
  const report=await diagnostics.runCountryPartitionProbe(await options(),(async(input,init)=>{const url=new URL(String(input)),response=await fixture(input,init);if(url.searchParams.get('SUMMARY_LVL2')!=='CY')return response;const table=JSON.parse(await response.text());table[1][2]=state==='missing-total'?'':state==='residual'?'1000001':'1100000';return new Response(JSON.stringify(table),{headers:{'content-type':'application/json'}});}) as typeof fetch);
  expect(report.probePassed).toBe(false);expect(report.partitionAssembly.status).toBe('assembled');expect(report.reconciliation.status).toBe(state==='missing-total'?'unavailable':'mismatch');expect(report.reconciliation.residualUsd).toBe(state==='missing-total'?null:state==='residual'?-1:-100000);expect(report.referenceCheck.status).toBe(state==='reference'?'mismatch':state==='missing-total'?'unavailable':'matched');
 }
});
it('withholds overall success when the reference fails while preserving exact API reconciliation',async()=>{
 const report=await diagnostics.runCountryPartitionProbe(await options(),(async(input,init)=>new URL(String(input)).hostname==='www.census.gov'?new Response('unavailable',{status:503}):fixture(input,init)) as typeof fetch);
 expect(report.reconciliation.status).toBe('matched');expect(report.referenceCheck.status).toBe('unavailable');expect(report.probePassed).toBe(false);expect(report.rawFiles).toHaveLength(12);
});
it('refuses unreviewed or occupied inputs before requests and excludes credential echoes',async()=>{
 const o=await options();await mkdir(o.outputDir);let calls=0;const noFetch=(async()=>{calls++;throw Error('unexpected');}) as typeof fetch;
 await expect(diagnostics.runCountryPartitionProbe(o,noFetch)).rejects.toThrow();await expect(diagnostics.runCountryPartitionProbe({...o,end:'2026-09'},noFetch)).rejects.toThrow();expect(calls).toBe(0);
 const echo=await options(),report=await diagnostics.runCountryPartitionProbe(echo,(async()=>new Response(echo.apiKey,{headers:{'content-type':'application/json'}})) as typeof fetch);expect(report.rawFiles).toHaveLength(0);expect(report.probePassed).toBe(false);expect(await readFile(join(echo.outputDir,'partition-probe.json'),'utf8')).not.toContain(echo.apiKey);
});
it('provides a manual main-only eleven-minute step covering all permitted attempts and preserving artifact retention',async()=>{
 const workflow=parse(await readFile('.github/workflows/audit-census-country.yml','utf8')),steps=workflow.jobs.audit.steps;
 expect(workflow.on.workflow_dispatch.inputs.audit_mode.options).toContain('partition-probe');expect(workflow.permissions).toEqual({contents:'read'});expect(workflow.on).not.toHaveProperty('schedule');expect(workflow.jobs.audit.if).toBe("github.ref == 'refs/heads/main'");
 const step=steps.find((row:{run?:string})=>row.run?.includes('data:probe-partitions'));expect(step['timeout-minutes']).toBe(11);expect(step['timeout-minutes']*60).toBeGreaterThan(30+6*(3*30+0.5+1));expect(step.if).toContain('partition-probe');expect(step.env.CENSUS_API_KEY).toContain('secrets.CENSUS_API_KEY');expect(steps.find((row:{id?:string})=>row.id==='preflight').run).toContain('partition-probe');expect(steps.at(-1).if).toContain('always()');expect(JSON.stringify(workflow)).not.toContain('R2_');
 const pkg=JSON.parse(await readFile('package.json','utf8'));expect(pkg.scripts['data:probe-partitions']).toContain('scripts/probe-country-partitions.ts');
});
