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
  expect(await fetchProductMonth(options,fetcher)).toHaveLength(1);
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
