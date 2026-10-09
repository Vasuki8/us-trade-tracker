import {afterEach,describe,expect,it,vi} from 'vitest';
import {mkdtemp,readFile,readdir,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import hs from '../fixtures/census-duty-hs.json';
import hscy from '../fixtures/census-duty-hscy.json';
import hsrp from '../fixtures/census-duty-hsrp.json';
import hscyrp from '../fixtures/census-duty-hscyrp.json';
import {fetchDutyMonth} from '../../scripts/census-duty-client';
import {normalizeDutyMonth} from '../../src/lib/trade/duty-normalize';
import {runDutyAudit} from '../../scripts/audit-duties';
import type {DutyRawPart} from '../../src/lib/trade/duty-types';

const tables={HS:hs,HSCY:hscy,HSRP:hsrp,HSCYRP:hscyrp};
const context={productCode:'090121',month:'2026-08'};
const options={...context,apiKey:'do-not-leak-key',retrievedAt:'2026-10-09T00:00:00.000Z'};
function parts():DutyRawPart[]{
  return Object.entries(tables).map(([summary,payload])=>({summary:summary as DutyRawPart['summary'],httpStatus:200,payload:structuredClone(payload),requestUrl:'https://api.census.gov/data/timeseries/intltrade/imports/hs',retrievedAt:options.retrievedAt}));
}
function change(part:DutyRawPart,field:string,value:unknown,row=1){const table=part.payload as unknown[][];table[row][table[0].indexOf(field)]=value;}
const censusFetch=(async(input:RequestInfo|URL)=>{
  const url=new URL(String(input));const summary=url.searchParams.get('SUMMARY_LVL2') as keyof typeof tables;
  expect(url.searchParams.get('get')).toContain('CAL_DUT_MO,CON_VAL_MO,DUT_VAL_MO');
  expect(url.searchParams.get('SUMMARY_LVL')).toBe('DET');expect(url.searchParams.get('COMM_LVL')).toBe('HS6');
  expect(url.searchParams.get('key')).toBe(options.apiKey);
  const table=structuredClone(tables[summary]);for(const row of table.slice(1))row[table[0].indexOf('time')]=url.searchParams.get('time')!;
  return Response.json(table);
}) as typeof fetch;
const dirs:string[]=[];
afterEach(async()=>{vi.restoreAllMocks();vi.useRealTimers();await Promise.all(dirs.splice(0).map(dir=>rm(dir,{recursive:true,force:true})));});

describe('duty normalization',()=>{
  it('reconciles totals without adding RP components or country groups to them',()=>{
    const rows=normalizeDutyMonth(parts(),context);expect(rows).toHaveLength(3);
    const world=rows.find(row=>row.geography==='world')!;
    expect(world.calculatedDuty.valueUsd).toBe(12);expect(world.consumptionValue.valueUsd).toBe(200);
    expect(world.dutiableValue.valueUsd).toBe(120);expect(world.coverage).toEqual({status:'verified',uncalculatedDutiableValueUsd:40});
    expect(rows.find(row=>row.partnerCode==='1220')!.coverage.uncalculatedDutiableValueUsd).toBe(30);
  });
  it('accepts reordered headers while preserving reported zero and missing amounts',()=>{
    const input=parts();change(input[1],'CAL_DUT_MO','0');change(input[3],'CAL_DUT_MO','0');
    change(input[1],'CON_VAL_MO',null);const table=input[2].payload as unknown[][];input[2].payload=table.map(row=>[...row].reverse());
    const canada=normalizeDutyMonth(input,context).find(row=>row.partnerCode==='1220')!;
    expect(canada.calculatedDuty).toEqual({valueUsd:0,status:'reported'});expect(canada.consumptionValue).toEqual({valueUsd:null,status:'missing'});
    expect(canada.coverage).toEqual({status:'unavailable',uncalculatedDutiableValueUsd:null});
  });
  it('keeps absent breakdowns and country months unavailable instead of inventing zero',()=>{
    const input=parts();input[3]={...input[3],httpStatus:204,payload:null};
    expect(normalizeDutyMonth(input,context).find(row=>row.partnerCode==='1220')!.coverage.status).toBe('unavailable');
    input[3]=parts()[3];
    input[1]={...input[1],httpStatus:204,payload:null};
    expect(()=>normalizeDutyMonth(input,context)).toThrow(/orphan|total/i);
    input[3]={...input[3],httpStatus:204,payload:null};
    expect(normalizeDutyMonth(input,context)).toHaveLength(1);
  });
  it('rejects unreconciled RP totals',()=>{const input=parts();change(input[2],'CAL_DUT_MO','13');expect(()=>normalizeDutyMonth(input,context)).toThrow(/reconcil/i);});
  it('checks each available measure even when an unrelated component measure is missing',()=>{
    const input=parts();change(input[3],'CAL_DUT_MO','9');change(input[3],'DUT_VAL_MO',null);
    expect(()=>normalizeDutyMonth(input,context)).toThrow(/reconcil/i);
  });
  it('rejects inconsistent national and country rate-provision breakdowns even when every total matches',()=>{
    const input=parts();change(input[2],'CON_VAL_MO','170',1);change(input[2],'DUT_VAL_MO','90',1);
    change(input[2],'CON_VAL_MO','0',3);change(input[2],'DUT_VAL_MO','0',3);
    expect(()=>normalizeDutyMonth(input,context)).toThrow(/country.*rate|rate.*country/i);
  });
  it('checks available national/country RP measures despite unrelated missing measures',()=>{
    const input=parts();change(input[2],'CON_VAL_MO','170',1);change(input[2],'CON_VAL_MO','0',3);change(input[2],'DUT_VAL_MO',null,1);
    expect(()=>normalizeDutyMonth(input,context)).toThrow(/country.*rate|rate.*country/i);
  });
  it.each(['X','-1','1.5','9007199254740992'])('rejects unsupported dollar cell %s',value=>{const input=parts();change(input[0],'CAL_DUT_MO',value);expect(()=>normalizeDutyMonth(input,context)).toThrow(/dollar|value/i);});
  it('rejects duplicates and unexpected products, months or dimensions',()=>{
    for(const [field,value] of [['I_COMMODITY','010121'],['time','2026-07'],['DISTRICT','13'],['RP','70'],['SUMMARY_LVL2','HSCY']]){
      const input=parts();change(input[0],field,value);expect(()=>normalizeDutyMonth(input,context)).toThrow();
    }
    const input=parts();(input[3].payload as unknown[][]).push((input[3].payload as unknown[][])[1]);expect(()=>normalizeDutyMonth(input,context)).toThrow(/duplicate/i);
  });
  it('requires one world total and all four response records',()=>{
    expect(()=>normalizeDutyMonth(parts().slice(1),context)).toThrow();
    const input=parts();input[0]={...input[0],httpStatus:204,payload:null};expect(()=>normalizeDutyMonth(input,context)).toThrow(/world/i);
  });
});

describe('duty retrieval',()=>{
  it('fetches four scoped summaries and retains secret-free provenance',async()=>{
    const saved:DutyRawPart[]=[];const result=await fetchDutyMonth({...options,onRaw:async part=>{saved.push(part);}},censusFetch);
    expect(result.map(part=>part.summary)).toEqual(['HS','HSCY','HSRP','HSCYRP']);expect(saved).toEqual(result);
    for(const part of saved){expect(new URL(part.requestUrl).searchParams.has('key')).toBe(false);expect(JSON.stringify(part)).not.toContain(options.apiKey);}
    expect(normalizeDutyMonth(result,context)[0].calculatedDuty.valueUsd).toBe(12);
  });
  it('explicitly requests the rate-provision dimension required for live reconciliation',async()=>{
    const projected=(async(input:RequestInfo|URL)=>{
      const response=await censusFetch(input);const table=await response.json() as unknown[][];const url=new URL(String(input));
      // Retained genuine Census tables project get fields and append predicate fields.
      const headers=[...url.searchParams.get('get')!.split(','),...url.searchParams.keys()].filter(field=>field!=='get'&&field!=='key');
      return Response.json([headers,...table.slice(1).map(row=>headers.map(header=>row[table[0].indexOf(header)]))]);
    }) as typeof fetch;
    const rows=normalizeDutyMonth(await fetchDutyMonth(options,projected),context);
    expect(rows).toHaveLength(3);expect(rows.find(row=>row.geography==='world')!.coverage.uncalculatedDutiableValueUsd).toBe(40);
  });
  it('rejects HTML key pages and malformed JSON without exposing their contents',async()=>{
    for(const response of [new Response(options.apiKey,{headers:{'content-type':'text/html'}}),new Response(options.apiKey,{headers:{'content-type':'application/json'}})]){
      const error=await fetchDutyMonth(options,(async()=>response) as typeof fetch).catch(error=>error as Error);
      expect(error).toBeInstanceOf(Error);expect((error as Error).message).not.toContain(options.apiKey);
    }
  });
  it('retries 429 and server errors at most twice',async()=>{
    vi.useFakeTimers();let attempts=0;
    const task=fetchDutyMonth(options,(async(input,init)=>{attempts++;return attempts<=2?new Response(null,{status:attempts===1?429:503}):censusFetch(input,init);}) as typeof fetch);
    const [result]=await Promise.all([task,vi.advanceTimersByTimeAsync(1600)]);expect(result).toHaveLength(4);expect(attempts).toBe(6);
    attempts=0;const exhausted=fetchDutyMonth(options,(async()=>{attempts++;return new Response(null,{status:503});}) as typeof fetch);
    await Promise.all([expect(exhausted).rejects.toThrow(/503/),vi.advanceTimersByTimeAsync(1600)]);expect(attempts).toBe(3);
  });
  it('bounds each request to thirty seconds and sanitizes transport failures',async()=>{
    vi.useFakeTimers();
    vi.spyOn(AbortSignal,'timeout').mockImplementation(milliseconds=>{expect(milliseconds).toBe(30000);const controller=new AbortController();setTimeout(()=>controller.abort(),milliseconds);return controller.signal;});
    const pending=fetchDutyMonth(options,(async(_input,init)=>new Promise((_resolve,reject)=>init!.signal!.addEventListener('abort',()=>reject(new Error(options.apiKey))))) as typeof fetch);
    await Promise.all([expect(pending).rejects.toThrow(/timed out/),vi.advanceTimersByTimeAsync(30000)]);
  });
});

describe('coffee duty audit',()=>{
  it('retains 96 raw responses and a checked 24-month dataset without promoting a release',async()=>{
    const outputDir=await mkdtemp(join(tmpdir(),'trade-duty-audit-'));dirs.push(outputDir);
    await writeFile(join(outputDir,'current.json'),'accepted-pointer');
    const report=await runDutyAudit({productCode:'090121',end:'2026-08',months:24,outputDir,apiKey:options.apiKey},censusFetch);
    expect(report.fromMonth).toBe('2024-09');expect(report.toMonth).toBe('2026-08');expect(report.eligibleForRelease).toBe(true);
    expect(report.rawFiles).toHaveLength(96);expect(report.months).toHaveLength(24);
    expect(report.months.every(month=>month.countryReconciliation==='verified')).toBe(true);
    expect(await readdir(join(outputDir,'raw'))).toHaveLength(96);
    expect(await readFile(join(outputDir,'current.json'),'utf8')).toBe('accepted-pointer');
    const dataset=JSON.parse(await readFile(join(outputDir,'duty-dataset.json'),'utf8'));expect(dataset.observations).toHaveLength(72);
    expect(await readFile(join(outputDir,'audit.json'),'utf8')).not.toContain(options.apiKey);
  });
  it('does not accept national totals whose individual countries do not reconcile',async()=>{
    const outputDir=await mkdtemp(join(tmpdir(),'trade-duty-audit-'));dirs.push(outputDir);
    const fetcher=(async(input:RequestInfo|URL)=>{const response=await censusFetch(input);const table=await response.json() as unknown[][];if(new URL(String(input)).searchParams.get('SUMMARY_LVL2')==='HSCY'){table.splice(2,1);}if(new URL(String(input)).searchParams.get('SUMMARY_LVL2')==='HSCYRP'){table.splice(3,2);}return Response.json(table);}) as typeof fetch;
    const report=await runDutyAudit({productCode:'090121',end:'2026-08',months:24,outputDir,apiKey:options.apiKey},fetcher);
    expect(report.eligibleForRelease).toBe(false);expect(report.months[0].countryReconciliation).toBe('mismatch');
    expect(JSON.parse(await readFile(join(outputDir,'audit.json'),'utf8')).eligibleForRelease).toBe(false);
  });
  it('refuses to mix a rerun with retained source records or overwrite its prior report',async()=>{
    const outputDir=await mkdtemp(join(tmpdir(),'trade-duty-audit-'));dirs.push(outputDir);
    const auditOptions={productCode:'090121' as const,end:'2026-08',months:24 as const,outputDir,apiKey:options.apiKey};
    await runDutyAudit(auditOptions,censusFetch);const original=await readFile(join(outputDir,'audit.json'));
    await expect(runDutyAudit(auditOptions,censusFetch)).rejects.toThrow(/existing|empty|already/i);
    expect(await readFile(join(outputDir,'audit.json'))).toEqual(original);
  });
});
