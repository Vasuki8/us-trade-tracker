import {afterEach,expect,it,vi} from 'vitest';
import {requestCheck,type Runtime} from '../../scripts/live-site-verification';
import type {ExpectedLiveCheck} from '../../scripts/live-site-package';
const origin='https://2b73be66.us-trade-tracker.pages.dev';
const expected:ExpectedLiveCheck={path:'/index.html',allowedPaths:['/index.html','/'],statuses:[200],bytes:5,sha256:'2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',privateRoute:false};
const runtime=(fetch:typeof globalThis.fetch):Runtime=>({fetch,now:Date.now,setTimer:setTimeout,clearTimer:t=>clearTimeout(t as ReturnType<typeof setTimeout>)});
afterEach(()=>vi.useRealTimers());
it('reuses exact-response checks without credentials or an implicit redirect',async()=>{
 const seen:{url:string;init:RequestInit}[]=[];
 const r=await requestCheck(origin,expected,runtime((async(url,init)=>{seen.push({url:String(url),init:init!});return new Response('hello',{headers:{'x-robots-tag':'noindex,nofollow'}});}) as typeof fetch),new AbortController().signal,()=>{});
 expect(r).toMatchObject({origin,path:'/index.html',bytes:5,sha256:expected.sha256});
 expect(seen).toHaveLength(1);expect(seen[0].init).toMatchObject({redirect:'manual',credentials:'omit',method:'GET'});
});
it.each(['wrong hash','overflow'])('rejects %s instead of producing a successful body identity',async failure=>{
 const fetch=(async()=>new Response(failure==='wrong hash'?'xxxxx':'hello!',{headers:{'x-robots-tag':'noindex,nofollow'}})) as typeof globalThis.fetch;
 await expect(requestCheck(origin,expected,runtime(fetch),new AbortController().signal,()=>{})).rejects.toThrow(failure==='wrong hash'?'live-body-hash':'live-body-length');
});
it('refuses a cross-origin redirect before requesting its destination',async()=>{
 let requests=0;
 await expect(requestCheck(origin,expected,runtime((async()=>{requests++;return new Response(null,{status:302,headers:{location:'https://other.invalid/secret'}});}) as typeof fetch),new AbortController().signal,()=>{})).rejects.toThrow('live-redirect');
 expect(requests).toBe(1);
});
it('terminates a stalled body on the original request deadline',async()=>{
 vi.useFakeTimers();
 const pending=requestCheck(origin,expected,runtime((async()=>new Response(new ReadableStream({start(){}}),{headers:{'x-robots-tag':'noindex,nofollow'}})) as typeof fetch),new AbortController().signal,()=>{});
 const assertion=expect(pending).rejects.toThrow('live-request-timeout');await vi.advanceTimersByTimeAsync(15000);await assertion;
});