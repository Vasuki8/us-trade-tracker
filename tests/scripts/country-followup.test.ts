import {afterEach,expect,it} from 'vitest';
import {mkdtemp,readFile,readdir,rm,mkdir} from 'node:fs/promises';import {join} from 'node:path';import {tmpdir} from 'node:os';import {createHash} from 'node:crypto';import {parse} from 'yaml';
import {runCountryFollowup} from '../../scripts/diagnose-country';import {countryFetch,referenceHtml} from '../helpers/country-data';
const dirs:string[]=[];afterEach(async()=>{for(const dir of dirs.splice(0))await rm(dir,{recursive:true,force:true});});
async function options(){const root=await mkdtemp(join(tmpdir(),'country-followup-'));dirs.push(root);return {countryCode:'1220',end:'2026-08',outputDir:join(root,'new'),apiKey:'synthetic-key',codeVersion:'test-version'};}
const fixture=countryFetch((payload,url)=>{if(url.searchParams.get('get')?.split(',').includes('ALL_VAL_YR')){payload[0].push('ALL_VAL_YR');payload[1].push('8000000');}});
const expectedImports=['2025-05/total','2025-06/total','2025-06/products','2025-08/total','2025-09/products','2025-12/total','2026-03/total','2026-04/total','2026-06/total'];
it('requests only the nine missing import parts, one cumulative export total and a fresh reference, without accepting coverage',async()=>{
 const o=await options();let active=0,max=0;const urls:URL[]=[];
 const fetcher=(async(input,init)=>{const url=new URL(String(input));urls.push(url);active++;max=Math.max(max,active);expect(init?.signal).toBeInstanceOf(AbortSignal);const response=await fixture(input,init);const text=response.text.bind(response);Object.defineProperty(response,'text',{value:async()=>{await new Promise(resolve=>setTimeout(resolve,2));try{return await text();}finally{active--;}}});return response;}) as typeof fetch;
 const report=await runCountryFollowup(o,fetcher);expect(urls).toHaveLength(11);expect(urls[0].hostname).toBe('www.census.gov');expect(max).toBe(2);
 expect(urls.filter(url=>url.pathname.includes('/imports/')).map(url=>`${url.searchParams.get('YEAR')}-${url.searchParams.get('MONTH')}/${url.searchParams.get('SUMMARY_LVL2')==='CY'?'total':'products'}`).sort()).toEqual([...expectedImports].sort());
 expect(urls.filter(url=>url.pathname.includes('/exports/'))).toHaveLength(1);
 expect(report).toMatchObject({purpose:'source-followup-diagnostic',baselineAuditRunId:38096086464,diagnosticPassed:true,sourceCoverage:'unverified',classificationStatus:'unverified',releaseAccepted:false,logicalRequests:11});
 expect(report.rawFiles).toHaveLength(11);expect(report.results).toHaveLength(11);expect(report.events).toHaveLength(11);
 expect(report.cumulativeComparison).toMatchObject({status:'within-rounding-bound',referenceMonths:8,apiYearToDateUsd:8000000,referenceMonthlySumUsd:8000000,differenceUsd:0,roundingBoundUsd:400000});
 for(const file of report.rawFiles){const bytes=await readFile(join(o.outputDir,file.path));expect(bytes.length).toBe(file.bytes);expect(createHash('sha256').update(bytes).digest('hex')).toBe(file.sha256);expect(bytes.toString()).not.toContain(o.apiKey);expect(JSON.parse(bytes.toString()).requestUrl).not.toContain('key=');}
 expect(await readdir(o.outputDir)).toEqual(['raw','source-followup.json']);
});
it('records header and body failures separately with only allowlisted diagnostics, while finishing the remaining parts',async()=>{
 const o=await options();const report=await runCountryFollowup(o,(async(input,init)=>{
  const url=new URL(String(input));if(url.searchParams.get('MONTH')==='05')throw Object.assign(new Error(o.apiKey),{cause:{code:'UND_ERR_CONNECT_TIMEOUT'}});
  const response=await fixture(input,init);if(url.searchParams.get('MONTH')==='06'&&url.searchParams.get('YEAR')==='2025'&&url.searchParams.get('SUMMARY_LVL2')==='HSCY')Object.defineProperty(response,'text',{value:async()=>{throw Object.assign(new Error(o.apiKey),{cause:{code:'UND_ERR_BODY_TIMEOUT'}});}});return response;
 }) as typeof fetch);
 expect(report.diagnosticPassed).toBe(false);expect(report.rawFiles).toHaveLength(11);expect(report.results.filter(row=>row.outcome==='failed')).toHaveLength(2);
 expect(report.events).toEqual(expect.arrayContaining([expect.objectContaining({phase:'headers',httpStatus:null,errorCode:'UND_ERR_CONNECT_TIMEOUT'}),expect.objectContaining({phase:'body',httpStatus:200,errorCode:'UND_ERR_BODY_TIMEOUT'})]));
 expect(await readFile(join(o.outputDir,'source-followup.json'),'utf8')).not.toContain(o.apiKey);
});
it('retains HTTP retry bodies and rejects crossed identities without losing other results',async()=>{
 const o=await options();let attempts=0;const report=await runCountryFollowup(o,(async(input,init)=>{const url=new URL(String(input));if(url.searchParams.get('YEAR')==='2025'&&url.searchParams.get('MONTH')==='05'&&attempts++===0)return new Response('temporary failure',{status:503});const response=await fixture(input,init);if(url.searchParams.get('MONTH')==='09')return new Response((await response.text()).replaceAll('CANADA','MEXICO'),{headers:{'content-type':'application/json'}});return response;}) as typeof fetch);
 const record=JSON.parse(await readFile(join(o.outputDir,report.rawFiles.find(row=>row.path.includes('2025-05-total'))!.path),'utf8'));expect(record.responses).toMatchObject([{attempt:1,httpStatus:503,responseBody:'temporary failure'},{attempt:2,httpStatus:200}]);expect(report.events).toHaveLength(12);expect(report.diagnosticPassed).toBe(false);
});
it('does not treat missing reference months or a cumulative discrepancy as accepted monthly data',async()=>{
 for(const missing of [false,true]){const o=await options();const report=await runCountryFollowup(o,countryFetch((payload,url)=>{if(url.searchParams.get('get')?.includes('ALL_VAL_YR')){payload[0].push('ALL_VAL_YR');payload[1].push(missing?'':'9000000');}}));expect(report.diagnosticPassed).toBe(false);expect(report.sourceCoverage).toBe('unverified');expect(report.cumulativeComparison.status).toBe(missing?'unavailable':'outside-rounding-bound');}
 const o=await options();const report=await runCountryFollowup(o,(async(input,init)=>new URL(String(input)).hostname==='www.census.gov'?new Response(referenceHtml().replace('<tr><td>January 2026</td><td>1.0</td><td>1.0</td><td>0.0</td></tr>',''),{headers:{'content-type':'text/html'}}):fixture(input,init)) as typeof fetch);expect(report.cumulativeComparison.status).toBe('unavailable');expect(report.cumulativeComparison.referenceMonthlySumUsd).toBeNull();expect(report.diagnosticPassed).toBe(false);
});
it('rejects echoed credentials before JSON escaping and refuses occupied output or unreviewed inputs before requests',async()=>{
 const o={...await options(),apiKey:'key"with\\slash'};const report=await runCountryFollowup(o,(async()=>new Response(o.apiKey,{headers:{'content-type':'application/json'}})) as typeof fetch);expect(report.rawFiles).toHaveLength(0);expect(report.diagnosticPassed).toBe(false);expect(await readFile(join(o.outputDir,'source-followup.json'),'utf8')).not.toContain('with');
 const occupied=await options();await mkdir(occupied.outputDir);let calls=0;const noFetch=(async()=>{calls++;throw Error('unexpected');}) as typeof fetch;await expect(runCountryFollowup(occupied,noFetch)).rejects.toThrow(/fresh|exists/);await expect(runCountryFollowup({...occupied,end:'2026-09'},noFetch)).rejects.toThrow();expect(calls).toBe(0);
});
it('provides a finite manual followup within the existing read-only workflow and request budget',async()=>{
 const workflow=parse(await readFile('.github/workflows/audit-census-country.yml','utf8'));expect(workflow.on.workflow_dispatch.inputs.audit_mode.options).toEqual(['full','connectivity-probe','source-followup']);expect(workflow.permissions).toEqual({contents:'read'});expect(workflow.on).not.toHaveProperty('schedule');
 const step=workflow.jobs.audit.steps.find((row:{run?:string})=>row.run?.includes('data:diagnose-country'));expect(step.if).toContain('source-followup');expect(step['timeout-minutes']).toBe(9);expect(step['timeout-minutes']*60).toBeGreaterThan(30+5*(3*30+0.5+1));expect(step.env.CENSUS_API_KEY).toContain('secrets.CENSUS_API_KEY');expect(JSON.stringify(workflow)).not.toContain('R2_');
});
