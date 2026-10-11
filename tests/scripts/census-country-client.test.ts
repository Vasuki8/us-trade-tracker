import {describe,expect,it} from 'vitest';
import * as client from '../../scripts/census-country-client';
import type {CountryRaw} from '../../scripts/country-audit-types';
import {countryTable as table} from '../helpers/country-data';

export const context={countryCode:'1220',month:'2026-08',direction:'imports' as const,kind:'products' as const};
const json=(payload:unknown)=>new Response(JSON.stringify(payload),{headers:{'content-type':'application/json'}});
function calendarTable(kind:'total'|'products'='products',direction:'imports'|'exports'='imports'){
  const payload=table(kind,direction);const index=payload[0].indexOf('time');
  payload[0].splice(index,1,'YEAR','MONTH');payload.slice(1).forEach(row=>row.splice(index,1,'2026','08'));return payload;
}

describe('diagnostic export cumulative total',()=>{
  const exportContext={...context,direction:'exports' as const,kind:'total' as const};
  const cumulativeTable=()=>{const payload=calendarTable('total','exports');payload[0].push('ALL_VAL_YR');payload[1].push('8000000');return payload;};
  it('retains the original cumulative field while keeping the ordinary total contract strict',async()=>{
    const evidence:CountryRaw[]=[];
    const payload=cumulativeTable();
    const result=await client.fetchCountryExportCumulativeTotal({...exportContext,apiKey:'fixture-key',onRaw:async raw=>{evidence.push(raw);}},(async input=>{
      const url=new URL(String(input));expect(url.searchParams.get('get')!.split(',')).toContain('ALL_VAL_YR');expect(url.searchParams.get('SUMMARY_LVL2')).toBe('CY');expect(url.searchParams.get('YEAR')).toBe('2026');expect(url.searchParams.get('MONTH')).toBe('08');return json(payload);
    }) as typeof fetch);
    expect(result).toMatchObject({part:{measure:'ALL_VAL_MO',rows:[{code:'-',valueUsd:1000000}]},yearToDateUsd:8000000});
    expect(JSON.parse(evidence[0].responseBody)).toEqual(payload);expect(evidence[0].requestUrl).not.toContain('key=');
    expect(()=>client.normalizeCountryPart(payload,exportContext)).toThrow(/column/);
  });
  it('rejects duplicate, absent, unsafe or crossed cumulative data and preserves an explicit zero',()=>{
    const zero=cumulativeTable();zero[1][zero[0].indexOf('ALL_VAL_YR')]='0';expect(client.normalizeCountryExportCumulativeTotal(zero,exportContext).yearToDateUsd).toBe(0);
    const missing=cumulativeTable();missing[1][missing[0].indexOf('ALL_VAL_YR')]='';expect(client.normalizeCountryExportCumulativeTotal(missing,exportContext).yearToDateUsd).toBeNull();
    for(const value of ['-1','(D)','9007199254740992']){const payload=cumulativeTable();payload[1][payload[0].indexOf('ALL_VAL_YR')]=value;expect(()=>client.normalizeCountryExportCumulativeTotal(payload,exportContext)).toThrow();}
    const duplicate=cumulativeTable();duplicate[0].push('ALL_VAL_YR');duplicate[1].push('8000000');expect(()=>client.normalizeCountryExportCumulativeTotal(duplicate,exportContext)).toThrow();
    expect(()=>client.normalizeCountryExportCumulativeTotal(calendarTable('total','exports'),exportContext)).toThrow();
    const crossed=cumulativeTable();crossed[1][crossed[0].indexOf('MONTH')]='07';expect(()=>client.normalizeCountryExportCumulativeTotal(crossed,exportContext)).toThrow();
    expect(()=>client.normalizeCountryExportCumulativeTotal(cumulativeTable(),context)).toThrow();
  });
});

describe('country source contracts',()=>{
  it.each(['imports','exports'] as const)('explicitly filters aggregate subdivisions for the %s diagnostic without weakening returned contracts',async direction=>{
    for(const kind of ['total','products'] as const){
      const evidence:CountryRaw[]=[],urls:URL[]=[];
      const result=await client.fetchCountryPart({...context,direction,kind,apiKey:'fixture-key',explicitAggregates:true,onRaw:async raw=>{evidence.push(raw);}},(async input=>{
        urls.push(new URL(String(input)));
        return json(calendarTable(kind,direction));
      }) as typeof fetch);
      const url=urls[0],subdivisions=direction==='imports'?['DISTRICT','RP','CTY_SUBCODE']:['DISTRICT','DF'];
      for(const field of subdivisions){expect(url.searchParams.getAll(field)).toEqual(['-']);expect(url.searchParams.get('get')!.split(',')).not.toContain(field);}
      expect(url.searchParams.has(direction==='imports'?'I_COMMODITY':'E_COMMODITY')).toBe(false);
      expect(url.searchParams.get('SUMMARY_LVL2')).toBe(kind==='total'?'CY':'HSCY');expect(url.searchParams.get('MONTH')).toBe('08');
      expect(result.rows).toHaveLength(kind==='total'?1:2);expect(evidence).toHaveLength(1);expect(evidence[0].requestUrl).not.toContain('key=');
      const wrong=calendarTable(kind,direction);wrong[1][wrong[0].indexOf('DISTRICT')]='10';
      await expect(client.fetchCountryPart({...context,direction,kind,apiKey:'fixture-key',explicitAggregates:true},(async()=>json(wrong)) as typeof fetch)).rejects.toThrow(/subdivision/);
    }
  });
  it('rejects JSON null from HTTP 200 instead of confusing it with a 204 empty breakdown',async()=>{
    await expect(client.fetchCountryPart({...context,apiKey:'fixture-key'},(async()=>json(null)) as typeof fetch)).rejects.toThrow(/table/);
    expect((await client.fetchCountryPart({...context,apiKey:'fixture-key'},(async()=>new Response(null,{status:204})) as typeof fetch)).rows).toEqual([]);
  });
  it.each(['imports','exports'] as const)('requests exact YEAR/MONTH predicates for %s and validates their returned identity',async direction=>{
    for(const kind of ['total','products'] as const){
      const result=await client.fetchCountryPart({...context,direction,kind,apiKey:'fixture-key'},(async input=>{
        const url=new URL(String(input));expect(url.searchParams.has('time')).toBe(false);expect(url.searchParams.get('YEAR')).toBe('2026');expect(url.searchParams.get('MONTH')).toBe('08');
        const requested=url.searchParams.get('get')!.split(',');for(const field of ['time','YEAR','MONTH'])expect(requested).not.toContain(field);
        return json(calendarTable(kind,direction));
      }) as typeof fetch);expect(result.month).toBe('2026-08');expect(result.rows).toHaveLength(kind==='total'?1:2);
    }
  });
  it('accepts either exact legacy time or paired calendar columns, never missing, crossed or mixed periods',()=>{
    expect(client.normalizeCountryPart(calendarTable(),context).month).toBe(context.month);
    expect(client.normalizeCountryPart(table(),context).month).toBe(context.month);
    for(const [field,value] of [['YEAR','2025'],['MONTH','8'],['MONTH','09']]){const payload=calendarTable();payload[1][payload[0].indexOf(field)]=value;expect(()=>client.normalizeCountryPart(payload,context)).toThrow();}
    const unpaired=calendarTable();const index=unpaired[0].indexOf('MONTH');unpaired.forEach(row=>row.splice(index,1));expect(()=>client.normalizeCountryPart(unpaired,context)).toThrow();
    const mixed=calendarTable();mixed[0].push('time');mixed.slice(1).forEach(row=>row.push(context.month));expect(()=>client.normalizeCountryPart(mixed,context)).toThrow();
  });
  it('keeps country all-goods total separate from HS6 products and special aggregates',()=>{
    expect(client.normalizeCountryPart(table('total'),{...context,kind:'total'})).toMatchObject({kind:'total',rows:[{code:'-',valueUsd:1000000}]});
    expect(client.normalizeCountryPart(table(),context).rows).toMatchObject([{code:'090121',valueUsd:900000,special:false},{code:'999995',valueUsd:100000,special:true}]);
  });
  it('preserves zero versus unavailable value',()=>{
    const payload=table();payload[1][2]='0';payload[2][2]='';
    expect(client.normalizeCountryPart(payload,context).rows.map(row=>row.valueUsd)).toEqual([0,null]);
  });
  it.each(['CTY_CODE','time','COMM_LVL','SUMMARY_LVL','SUMMARY_LVL2','DISTRICT','RP','CTY_SUBCODE'])('rejects crossed or subdivided %s',field=>{
    const payload=table();payload[1][payload[0].indexOf(field)]='unexpected';
    expect(()=>client.normalizeCountryPart(payload,context)).toThrow();
  });
  it.each(['-1','NaN','9007199254740992','(D)'])('rejects unverified dollar marker %s',value=>{
    const payload=table();payload[1][2]=value;expect(()=>client.normalizeCountryPart(payload,context)).toThrow();
  });
  it('rejects duplicates, parent categories and unknown columns',()=>{
    const duplicate=table();duplicate.push(duplicate[1]);expect(()=>client.normalizeCountryPart(duplicate,context)).toThrow(/Duplicate/);
    const parent=table();parent[1][0]='09';expect(()=>client.normalizeCountryPart(parent,context)).toThrow();
    const extra=table();extra[0].push('UNKNOWN');extra.slice(1).forEach(row=>row.push('-'));expect(()=>client.normalizeCountryPart(extra,context)).toThrow(/column/);
    const header=table();header[0][1]=header[0][0];expect(()=>client.normalizeCountryPart(header,context)).toThrow(/header/);
  });
  it('requests only Canada and the selected aggregation without repeated predicate columns',async()=>{
    const evidence:unknown[]=[];let calls=0;
    const result=await client.fetchCountryPart({...context,apiKey:'fixture-key',onRaw:async raw=>{evidence.push(raw);}},(async input=>{
      calls++;const url=new URL(String(input));expect(url.searchParams.get('CTY_CODE')).toBe('1220');expect(url.searchParams.get('COMM_LVL')).toBe('HS6');expect(url.searchParams.get('SUMMARY_LVL2')).toBe('HSCY');
      for(const predicate of ['CTY_CODE','COMM_LVL','SUMMARY_LVL','SUMMARY_LVL2','time'])expect(url.searchParams.get('get')!.split(',')).not.toContain(predicate);
      expect(url.searchParams.get('key')).toBe('fixture-key');return json(table());
    }) as typeof fetch);
    expect(result.rows).toHaveLength(2);expect(calls).toBe(1);expect(JSON.stringify(result)).not.toContain('fixture-key');expect(JSON.stringify(evidence)).not.toContain('fixture-key');expect(evidence[0]).toHaveProperty('responseBody',JSON.stringify(table()));
  });
  it('retains malformed source evidence before rejecting the dimensions',async()=>{
    const payload=table();payload[1][3]='2010';let saved=false;
    await expect(client.fetchCountryPart({...context,apiKey:'fixture-key',onRaw:async()=>{saved=true;}},(async()=>json(payload)) as typeof fetch)).rejects.toThrow();expect(saved).toBe(true);
  });
  it('treats 204 breakdown as absent and 204 total as failure',async()=>{
    const fetcher=(async()=>new Response(null,{status:204})) as typeof fetch;
    const result=await client.fetchCountryPart({...context,apiKey:'fixture-key'},fetcher);expect(result.rows).toEqual([]);expect(JSON.stringify(result)).not.toContain('fixture-key');
    await expect(client.fetchCountryPart({...context,kind:'total',apiKey:'fixture-key'},fetcher)).rejects.toThrow(/total/);
  });
  it('retries only bounded server failures and never saves a credential returned by the server',async()=>{
    let calls=0;await client.fetchCountryPart({...context,apiKey:'fixture-key'},(async()=>++calls===1?new Response('temporary',{status:503}):json(table())) as typeof fetch);expect(calls).toBe(2);
    let saved=false;await expect(client.fetchCountryPart({...context,apiKey:'fixture-key',onRaw:async()=>{saved=true;}},(async()=>new Response('fixture-key',{status:400})) as typeof fetch)).rejects.toThrow(/credential/);expect(saved).toBe(false);
  });
  it('retains the original response for every retry and a safe transport failure event',async()=>{
    const evidence:any[]=[];let calls=0;
    await client.fetchCountryPart({...context,apiKey:'fixture-key',onRaw:async raw=>{evidence.push(raw);}},(async()=>++calls===1?new Response('temporary',{status:503}):json(table())) as typeof fetch);
    expect(evidence[0].responses).toMatchObject([{attempt:1,httpStatus:503,responseBody:'temporary'},{attempt:2,httpStatus:200,responseBody:JSON.stringify(table())}]);
    calls=0;evidence.length=0;
    await expect(client.fetchCountryPart({...context,apiKey:'fixture-key',onRaw:async raw=>{evidence.push(raw);}},(async()=>{if(++calls===1)return new Response('first failure',{status:503});throw new Error('https://example.invalid/?key=fixture-key');}) as typeof fetch)).rejects.toThrow(/failed/);
    expect(evidence[0].responses).toMatchObject([{attempt:1,httpStatus:503,responseBody:'first failure'},{attempt:2,httpStatus:null,responseBody:null}]);expect(JSON.stringify(evidence)).not.toContain('fixture-key');
  });
});
