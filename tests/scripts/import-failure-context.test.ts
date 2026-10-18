import {afterEach,expect,it,vi} from 'vitest';
import {fetchProductMonth} from '../../scripts/census-client';
import {fetchDutyMonth} from '../../scripts/census-duty-client';
import {syntheticProductFetch} from '../helpers/product-data';

const key='synthetic-private-key';
const options={productCode:'090121',month:'2026-08',direction:'imports' as const,apiKey:key};
afterEach(()=>{vi.restoreAllMocks();vi.useRealTimers();});
async function failed(run:Promise<unknown>){return await run.then(()=>null,error=>error) as Error&{requestContext?:Record<string,unknown>};}
it.each(['imports','exports'] as const)('retains safe %s transport context without serializing exception content',async direction=>{
 const error=await failed(fetchProductMonth({...options,direction},(async()=>{throw Object.assign(new Error(key),{cause:{code:'ECONNRESET'}});}) as typeof fetch));
 expect(error.message).toBe('Census request failed or timed out; the current release is unchanged');
 expect(error.requestContext).toMatchObject({productCode:'090121',month:'2026-08',direction,dataset:'merchandise',summary:'HS',phase:'fetch',attempt:1,httpStatus:null,transportCode:'ECONNRESET'});
 expect(JSON.stringify(error.requestContext)).not.toContain(key);expect(JSON.stringify(error.requestContext)).not.toContain('stack');
 expect(new URL(String(error.requestContext?.requestUrl)).searchParams.has('key')).toBe(false);
});
it.each(['merchandise','duties'] as const)('retains final HTTP attempt context for %s without changing retry count',async dataset=>{
 vi.useFakeTimers();let calls=0;
 const fetcher=(async()=>{calls++;return new Response(key,{status:503});}) as typeof fetch;
 const pending=failed(dataset==='merchandise'?fetchProductMonth(options,fetcher):fetchDutyMonth({...options,retrievedAt:'2026-10-17T00:00:00Z'},fetcher));
 await vi.advanceTimersByTimeAsync(1600);const error=await pending;
 expect(calls).toBe(3);expect(error.requestContext).toMatchObject({dataset,summary:'HS',phase:'http',attempt:3,httpStatus:503,transportCode:null});
 expect(error.message).toContain('503');expect(JSON.stringify(error.requestContext)).not.toContain(key);
});
it.each(['body','json'] as const)('distinguishes %s failure after successful headers',async phase=>{
 const response=phase==='json'?new Response('[',{headers:{'content-type':'application/json'}}):new Response(new ReadableStream({start(c){c.error(Object.assign(new Error(key),{cause:{code:'UND_ERR_BODY_TIMEOUT'}}));}}),{headers:{'content-type':'application/json'}});
 const error=await failed(fetchProductMonth(options,(async()=>response) as typeof fetch));
 expect(error.requestContext).toMatchObject({phase,httpStatus:200,summary:'HS',attempt:1});
 expect(String(error)).not.toContain(key);
});
it('identifies caller cancellation separately from unknown transport failures',async()=>{
 const controller=new AbortController();controller.abort();
 const error=await failed(fetchProductMonth({...options,signal:controller.signal},(async()=>{throw new Error(key);}) as typeof fetch));
 expect(error.requestContext).toMatchObject({phase:'fetch',transportCode:'canceled'});
});
it('records validation at pair level instead of assigning it to the final response',async()=>{
 const base=syntheticProductFetch('090121');
 const fetcher=(async(input,init)=>{const response=await base(input,init);const rows=await response.json() as string[][];rows[1][rows[0].indexOf('GEN_VAL_MO')]='invalid';return Response.json(rows);}) as typeof fetch;
 const error=await failed(fetchProductMonth(options,fetcher));
 expect(error.message).toBe('Invalid dollar value');
 expect(error.requestContext).toMatchObject({phase:'validation',summary:null,requestUrl:null,attempt:null,httpStatus:null,dataset:'merchandise'});
});
it('retains duty body-read context without changing the scoped query',async()=>{
 const seen:URL[]=[];
 const error=await failed(fetchDutyMonth({...options,retrievedAt:'2026-10-17T00:00:00Z'},(async input=>{seen.push(new URL(String(input)));return new Response(new ReadableStream({start(c){c.error(new Error(key));}}),{headers:{'content-type':'application/json'}});}) as typeof fetch));
 expect(seen).toHaveLength(1);expect(seen[0].searchParams.get('get')).toBe('I_COMMODITY_LDESC,CAL_DUT_MO,CON_VAL_MO,DUT_VAL_MO,CTY_CODE,CTY_NAME,RP,LAST_UPDATE');
 expect(error.requestContext).toMatchObject({dataset:'duties',direction:'imports',phase:'body',httpStatus:200,summary:'HS'});
});

it.each(['merchandise','duties'] as const)('clears a previous HTTP status when the next %s attempt fails in transport',async dataset=>{
 vi.useFakeTimers();let calls=0;
 const fetcher=(async()=>{calls++;if(calls===1)return new Response('busy',{status:503});throw Object.assign(new Error(key),{code:'ECONNRESET'});}) as typeof fetch;
 const pending=failed(dataset==='merchandise'?fetchProductMonth(options,fetcher):fetchDutyMonth({...options,retrievedAt:'2026-10-17T00:00:00Z'},fetcher));
 await vi.advanceTimersByTimeAsync(600);const error=await pending;
 expect(calls).toBe(2);expect(error.requestContext).toMatchObject({dataset,summary:'HS',phase:'fetch',attempt:2,httpStatus:null,transportCode:'ECONNRESET'});
 expect(JSON.stringify(error.requestContext)).not.toContain(key);
});
