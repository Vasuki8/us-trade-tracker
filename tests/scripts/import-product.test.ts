import {expect,it,vi} from 'vitest';
import imports from '../fixtures/census-imports.json';
import exports from '../fixtures/census-exports.json';
import {fetchProductMonth} from '../../scripts/census-client';
const options={productCode:'090121',month:'2026-06',direction:'imports' as const,apiKey:'test-secret-key'};
const body=(direction:string,summary:string)=>{
  const payload=direction==='imports'?imports:exports;
  const field=payload[0].indexOf('SUMMARY_LVL2');
  return [payload[0],...payload.slice(1).filter(r=>r[field]===summary)];
};
it('retrieves exact HS6 national totals and partners with the correct direction measure',async()=>{
  const fetcher=vi.fn(async(input:RequestInfo|URL)=>{
    const url=new URL(String(input)); const direction=url.pathname.includes('exports')?'exports':'imports';
    expect(url.searchParams.get(direction==='imports'?'I_COMMODITY':'E_COMMODITY')).toBe('090121');
    expect(url.searchParams.get('time')).toBe('2026-06');
    expect(url.searchParams.get('get')).toContain(direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO');
    return Response.json(body(direction,url.searchParams.get('SUMMARY_LVL2')!));
  });
  const rows=await fetchProductMonth(options,fetcher as typeof fetch);
  expect(rows.map(r=>r.valueUsd)).toEqual([1000,600,400]);
  expect((await fetchProductMonth({...options,direction:'exports'},fetcher as typeof fetch))[0].measure).toBe('ALL_VAL_MO');
});
it('treats an absent country response as unavailable data, preserving the world observation',async()=>{
  const fetcher=(async(input:RequestInfo|URL)=>new URL(String(input)).searchParams.get('SUMMARY_LVL2')==='HS'?Response.json(body('imports','HS')):new Response(null,{status:204})) as typeof fetch;
  const raw:{payload:unknown;httpStatus:unknown}[]=[];
  expect(await fetchProductMonth({...options,onRaw:async(payload,_url,...status)=>{raw.push({payload,httpStatus:status[0]});}},fetcher)).toHaveLength(1);
  expect(raw).toContainEqual({payload:null,httpStatus:204});
});
it.each([401,403])('fails authentication %s without exposing the request key',async(status)=>{
  await expect(fetchProductMonth(options,(async()=>new Response('private',{status})) as typeof fetch)).rejects.toThrow(`HTTP ${status}`);
  try{await fetchProductMonth(options,(async()=>{throw new Error('https://example/?key=test-secret-key');}) as typeof fetch);}catch(error){expect(String(error)).not.toContain(options.apiKey);}
});
it('bounds retries for rate limits and server failures',async()=>{
  vi.useFakeTimers(); let attempts=0;
  const operation=fetchProductMonth(options,(async()=>{attempts++;return new Response('limited',{status:429});}) as typeof fetch).then(()=>null,error=>error as Error);
  await vi.runAllTimersAsync();const error=await operation;vi.useRealTimers();
  expect(error?.message).toContain('HTTP 429');
  expect(attempts).toBe(3);
});
it.each([new Response('<html>no</html>',{headers:{'content-type':'text/html'}}),new Response('bad json',{headers:{'content-type':'application/json'}})])('rejects a non-data response',async(response)=>{
  await expect(fetchProductMonth(options,(async()=>response) as typeof fetch)).rejects.toThrow();
});
it('reports only known header names when a response repeats query fields',async()=>{
  const field=imports[0].indexOf('I_COMMODITY');
  const payload=body('imports','HS').map(row=>[...row,row[field],options.apiKey]);
  const error=await fetchProductMonth(options,(async()=>Response.json(payload)) as typeof fetch).then(()=>null,error=>error as Error);
  expect(error?.message).toContain('known fields');expect(error?.message).not.toContain(options.apiKey);
});
it.each(['imports','exports'] as const)('normalizes %s when Census appends predicate columns to requested columns',async(direction)=>{
  const fetcher=(async(input:RequestInfo|URL)=>{
    const url=new URL(String(input));const commodity=direction==='imports'?'I_COMMODITY':'E_COMMODITY';
    // Observed live API behavior: get columns, predicate columns, then time.
    const headers=[...url.searchParams.get('get')!.split(','),commodity,'COMM_LVL','SUMMARY_LVL','SUMMARY_LVL2','time'];
    const source=body(direction,url.searchParams.get('SUMMARY_LVL2')!);
    return Response.json([headers,...source.slice(1).map(row=>headers.map(name=>{
      const index=source[0].indexOf(name);return index>=0?row[index]:name==='LAST_UPDATE'?'2026-07-02':url.searchParams.get(name);
    }))]);
  }) as typeof fetch;
  const rows=await fetchProductMonth({...options,direction},fetcher);
  expect(rows.map(row=>row.valueUsd)).toEqual(direction==='imports'?[1000,600,400]:[800,800]);
});
