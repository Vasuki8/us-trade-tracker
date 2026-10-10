import {describe,expect,it} from 'vitest';
import * as client from '../../scripts/census-country-client';
import {countryTable as table} from '../helpers/country-data';

export const context={countryCode:'1220',month:'2026-08',direction:'imports' as const,kind:'products' as const};
const json=(payload:unknown)=>new Response(JSON.stringify(payload),{headers:{'content-type':'application/json'}});

describe('country source contracts',()=>{
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
});
