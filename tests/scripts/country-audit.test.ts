import {afterEach,describe,expect,it} from 'vitest';
import {mkdtemp,readFile,readdir,rm,mkdir,writeFile,stat} from 'node:fs/promises';
import {join} from 'node:path';import {tmpdir} from 'node:os';import {createHash} from 'node:crypto';import {parse} from 'yaml';
import * as audit from '../../scripts/audit-country';
import {parseCountryReference} from '../../scripts/country-reference';
import {countryFetch,referenceHtml} from '../helpers/country-data';
const dirs:string[]=[];afterEach(async()=>{for(const dir of dirs.splice(0))await rm(dir,{recursive:true,force:true});});
async function workspace(){const dir=await mkdtemp(join(tmpdir(),'country-audit-'));dirs.push(dir);return dir;}
const options=(outputDir:string)=>({countryCode:'1220',end:'2026-08',outputDir,apiKey:'synthetic-key',codeVersion:'test-version'});

describe('isolated Canada audit',()=>{
  it('retains all 96 original sources, reconciles totals and labels classification unverified',async()=>{
    const root=await workspace();await mkdir(join(root,'data'));await writeFile(join(root,'data','accepted.json'),'unchanged');
    const output=join(root,'audit');const report=await audit.runCountryAudit(options(output),countryFetch());
    expect(report).toMatchObject({countryCode:'1220',fromMonth:'2024-09',toMonth:'2026-08',sourceCoverage:'verified',classificationStatus:'unverified'});
    expect(report.months).toHaveLength(48);expect(report.rawFiles).toHaveLength(97);expect(report.months.every(row=>row.residualUsd===0&&row.referenceCheck==='matched')).toBe(true);
    const candidate=report.candidates.find(row=>row.direction==='imports'&&row.code==='090121')!;
    expect(candidate).toMatchObject({currentUsd:10800000,previousUsd:10800000,currentSharePercent:90,previousSharePercent:90,shareChangePercentagePoints:0,complete:true,classificationStatus:'unverified',comparisonAvailable:false});
    expect(await readFile(join(root,'data','accepted.json'),'utf8')).toBe('unchanged');
    for(const file of report.rawFiles){const bytes=await readFile(join(output,file.path));expect(bytes.length).toBe(file.bytes);expect(createHash('sha256').update(bytes).digest('hex')).toBe(file.sha256);expect(bytes.toString()).not.toContain('synthetic-key');}
    expect((await readdir(output)).sort()).toEqual(['audit.json','country-dataset.json','raw']);
  });
  it('reports a residual without inventing an other-products category or forcing equality',async()=>{
    const report=await audit.runCountryAudit(options(join(await workspace(),'audit')),countryFetch((payload,url)=>{if(url.searchParams.get('SUMMARY_LVL2')==='CY')payload[1][2]='1000050';}));
    expect(report.sourceCoverage).toBe('failed');expect(report.months[0].residualUsd).toBe(50);expect(report.candidates.some(row=>row.code==='other')).toBe(false);
  });
  it('keeps absent products unavailable and ratios of sums rather than averaged shares',async()=>{
    const report=await audit.runCountryAudit(options(join(await workspace(),'audit')),countryFetch((payload,url)=>{
      if(url.searchParams.get('time')==='2026-08'){if(url.searchParams.get('SUMMARY_LVL2')==='CY')payload[1][2]='2000000';else{payload[1][2]='1900000';payload.pop();}}
    }));
    expect(report.candidates.find(row=>row.code==='090121'&&row.direction==='imports')!.currentSharePercent).toBeCloseTo(100*11800000/13000000);
    expect(report.candidates.find(row=>row.code==='999995')!).toMatchObject({complete:false,currentUsd:null,currentSharePercent:null,comparisonAvailable:false});
  });
  it('withholds shares when country totals are zero and preserves unavailable reported values',async()=>{
    const report=await audit.runCountryAudit(options(join(await workspace(),'audit')),countryFetch((payload,url)=>{
      if(url.searchParams.get('SUMMARY_LVL2')==='CY')payload[1][2]='0';else{payload[1][2]='0';payload[2][2]='';}
    }));
    expect(report.candidates.find(row=>row.code==='090121')!).toMatchObject({currentUsd:0,currentSharePercent:null,previousSharePercent:null});expect(report.months[0].productSumUsd).toBeNull();
  });
  it('keeps evidence and a safe error after a malformed response without abandoning the remaining grid',async()=>{
    const report=await audit.runCountryAudit(options(join(await workspace(),'audit')),countryFetch((payload,url)=>{if(url.searchParams.get('time')==='2024-09'&&url.searchParams.get('SUMMARY_LVL2')==='CY')payload[1][3]='2010';}));
    expect(report.sourceCoverage).toBe('failed');expect(report.rawFiles).toHaveLength(97);expect(report.months[0].errors.length).toBe(1);expect(report.months[0].totalUsd).toBeNull();
  });
  it('refuses occupied output and concurrent reuse before fetching',async()=>{
    const root=await workspace();let calls=0;const fetcher=(async(input,init)=>{calls++;return countryFetch()(input,init);}) as typeof fetch;
    await expect(audit.runCountryAudit(options(root),fetcher)).rejects.toThrow(/exists/);expect(calls).toBe(0);
    const output=join(root,'new');const results=await Promise.allSettled([audit.runCountryAudit(options(output),fetcher),audit.runCountryAudit(options(output),fetcher)]);
    expect(results.filter(result=>result.status==='fulfilled')).toHaveLength(1);expect(calls).toBe(97);
  });
  it.each([{countryCode:'../1220'},{countryCode:'2010'},{end:'2026-09'},{end:'2026-8'},{apiKey:''}])('validates pilot inputs before writing %j',async override=>{
    const output=join(await workspace(),'new');let calls=0;
    await expect(audit.runCountryAudit({...options(output),...override},(async()=>{calls++;throw new Error('unexpected');}) as typeof fetch)).rejects.toThrow();expect(calls).toBe(0);await expect(stat(output)).rejects.toMatchObject({code:'ENOENT'});
  });
  it('supports key-free preflight and rejects duplicate CLI inputs',()=>{
    expect(audit.resolveCountryAuditOptions(['--country','1220','--end','2026-08'],{},true)).toMatchObject({countryCode:'1220',end:'2026-08',outputDir:'.tmp/country-audit/1220'});
    expect(()=>audit.resolveCountryAuditOptions(['--end','2026-08','--end','2026-08'],{},true)).toThrow(/Repeated/);
  });
});

describe('official country-table checks',()=>{
  it('parses nominal millions and checks one tenth of a million precision',()=>{
    expect(parseCountryReference(referenceHtml()).find(row=>row.month==='2026-08')).toEqual({month:'2026-08',importsUsd:1000000,exportsUsd:1000000});
    expect(()=>parseCountryReference(referenceHtml().replace('Canada','Mexico'))).toThrow(/Canada/);
    expect(()=>parseCountryReference(referenceHtml()+referenceHtml())).toThrow(/Duplicate/);
  });
  it('records missing or changed reference rows as failed checks',async()=>{
    const fetcher=(async(input,init)=>new URL(String(input)).hostname==='www.census.gov'?new Response(referenceHtml().replaceAll('<td>1.0</td>','<td>2.0</td>'),{headers:{'content-type':'text/html'}}):countryFetch()(input,init)) as typeof fetch;
    const report=await audit.runCountryAudit(options(join(await workspace(),'audit')),fetcher);expect(report.sourceCoverage).toBe('failed');expect(report.months[0].referenceCheck).toBe('mismatch');
  });
  it('rejects changed units or column order and accepts actual table whitespace',()=>{
    expect(()=>parseCountryReference(referenceHtml().replaceAll('millions','billions'))).toThrow(/units/);
    expect(()=>parseCountryReference(referenceHtml().replace('<th>Exports</th><th>Imports</th>','<th>Imports</th><th>Exports</th>'))).toThrow(/order/);
    expect(parseCountryReference(referenceHtml().replace('<tr>','<tr\n>').replace('January 2024',' January   2024 '))).toHaveLength(36);
    expect(parseCountryReference(referenceHtml().replaceAll('<td>1.0</td>','<td>1,024.1</td>'))[0].importsUsd).toBe(1024100000);
  });
});

it('manual country workflow validates inputs before key access, retains failures and cannot publish or write R2',async()=>{
  const workflow=parse(await readFile('.github/workflows/audit-census-country.yml','utf8'));
  expect(workflow.on).toHaveProperty('workflow_dispatch');expect(workflow.on).not.toHaveProperty('schedule');expect(workflow.permissions).toEqual({contents:'read'});
  expect(workflow.jobs.audit.if).toContain('refs/heads/main');const steps=workflow.jobs.audit.steps;
  const preflight=steps.findIndex((step:{id?:string})=>step.id==='preflight');const retrieve=steps.findIndex((step:{env?:Record<string,string>})=>step.env?.CENSUS_API_KEY);expect(preflight).toBeGreaterThan(0);expect(retrieve).toBeGreaterThan(preflight);
  expect(steps[retrieve]['timeout-minutes']).toBe(15);expect(workflow.jobs.audit['timeout-minutes']-steps[retrieve]['timeout-minutes']).toBeGreaterThanOrEqual(5);expect(steps[retrieve]['continue-on-error']).not.toBe(true);
  const upload=steps.find((step:{uses?:string})=>step.uses?.startsWith('actions/upload-artifact@'));expect(upload.if).toContain('always()');expect(upload.with['include-hidden-files']).toBe(true);expect(upload.with['retention-days']).toBe(7);
  expect(JSON.stringify(workflow)).not.toContain('R2_');expect(JSON.stringify(workflow)).not.toContain('data:archive');
});
