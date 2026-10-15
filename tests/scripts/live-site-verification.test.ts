import {afterEach,expect,it,vi} from 'vitest';
import {mkdir,readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {verifyLiveSite} from '../../scripts/live-site-verification';
import {cleanLiveFixtures,liveFixture} from '../helpers/live-site';
type Fixture=Awaited<ReturnType<typeof liveFixture>>;
afterEach(async()=>{vi.restoreAllMocks();vi.unstubAllGlobals();await cleanLiveFixtures();});
function transport(f:Fixture,change?:(path:string,n:number,init:RequestInit)=>Response|Promise<Response|undefined>|undefined){
 const requests:string[]=[];
 const fetch=async(url:string|URL|Request,init:RequestInit={})=>{
  const target=String(url),path=new URL(target).pathname;requests.push(target);
  expect(init.redirect).toBe('manual');expect(init.credentials).toBe('omit');
  expect(new Headers(init.headers).has('authorization')).toBe(false);expect(new Headers(init.headers).has('cookie')).toBe(false);
  const changed=await change?.(path,requests.length,init);if(changed)return changed;
  const name=path==='/'?'index.html':path==='/nested/'?'nested/index.html':path.slice(1);
  const body=f.bodies[name]??f.bodies['404.html'];
  return new Response(new Uint8Array(body),{status:f.bodies[name]?200:404,headers:{'x-robots-tag':' NOFOLLOW, NoIndex '}});
 };
 return{fetch:fetch as typeof globalThis.fetch,requests};
}
const stored=async(f:Fixture,name='failed.json')=>JSON.parse(await readFile(resolve(f.proofRoot,name),'utf8'));
it('checks both origins, excludes controls, and saves a verified success receipt',async()=>{
 const f=await liveFixture(),t=transport(f);const r=await verifyLiveSite(f,t);
 expect(r.status).toBe('passed');expect(r.completedCount).toBe(16);expect(r.httpAttempts).toBe(16);
 expect(new Set(t.requests.map(u=>new URL(u).origin))).toEqual(new Set(['https://us-trade-tracker.pages.dev',f.deploymentOrigin]));
 expect(t.requests.some(u=>u.endsWith('/_headers'))).toBe(false);
 expect(await stored(f,'receipt.json')).toEqual(r);await expect(access(resolve(f.proofRoot,'failed.json'))).rejects.toThrow();
});
it.each(['http://660d1364.us-trade-tracker.pages.dev','https://other.pages.dev','https://660d1364.us-trade-tracker.pages.dev/','https://660d1364.us-trade-tracker.pages.dev:443','https://user@660d1364.us-trade-tracker.pages.dev','https://660d1364.us-trade-tracker.pages.dev?x=1','https://660d1364.us-trade-tracker.pages.dev#x'])('rejects an unapproved origin without HTTP: %s',async deploymentOrigin=>{
 const f=await liveFixture(),t=transport(f);
 await expect(verifyLiveSite({...f,deploymentOrigin},t)).rejects.toThrow('live-origin');
 expect(t.requests).toHaveLength(0);await expect(access(f.proofRoot)).rejects.toThrow();
});
it('records a local package failure without HTTP or a success receipt',async()=>{
 const f=await liveFixture(),t=transport(f);const r=await verifyLiveSite({...f,zipSha256:'b'.repeat(64)},t);
 expect(r.status).toBe('failed');expect(r.failure!.code).toBe('live-package-input');expect(t.requests).toHaveLength(0);
 expect((await stored(f)).status).toBe('failed');
});
it('follows only the allowed HTML alias and retains its redirect chain',async()=>{
 const f=await liveFixture(),t=transport(f,p=>p==='/nested/index.html'?new Response(null,{status:308,headers:{location:'/nested/'}}):undefined);
 const r=await verifyLiveSite(f,t);expect(r.status).toBe('passed');expect(r.httpAttempts).toBe(18);
 expect(r.checks.find((c:any)=>c.path==='/nested/index.html')!.redirects).toEqual([{from:'/nested/index.html',to:'/nested/',status:308}]);
});
it.each(['https://evil.invalid/?token=secret','http://us-trade-tracker.pages.dev/index','https://user:password@us-trade-tracker.pages.dev/index','/index?token=secret','/index#secret','/elsewhere','/index\\evil'])('rejects a forbidden redirect before another fetch: %s',async location=>{
 const f=await liveFixture(),t=transport(f,()=>new Response(null,{status:302,headers:{location}}));
 const r=await verifyLiveSite(f,t);expect(r.status).toBe('failed');expect(r.failure!.code).toBe('live-redirect');expect(t.requests).toHaveLength(1);
 const proof=await readFile(resolve(f.proofRoot,'failed.json'),'utf8');expect(proof).not.toMatch(/evil|secret|password/);
});
it('rejects redirect loops',async()=>{
 const f=await liveFixture(),t=transport(f,p=>new Response(null,{status:301,headers:{location:p}}));const r=await verifyLiveSite(f,t);
 expect(r.failure!.code).toBe('live-redirect');expect(t.requests).toHaveLength(1);
});
it('enforces the three-redirect budget without following the fourth',async()=>{
 const f=await liveFixture(),chain:Record<string,string>={'/nested/index.html':'/nested/index','/nested/index':'/nested/index/','/nested/index/':'/nested/','/nested/':'/nested'};
 const t=transport(f,p=>chain[p]?new Response(null,{status:302,headers:{location:chain[p]}}):undefined);
 const r=await verifyLiveSite(f,t);expect(r.failure!.code).toBe('live-redirect');expect(t.requests.filter(u=>u.includes('/nested'))).toHaveLength(4);
});
it.each([
 ['status',()=>new Response('bad',{status:500,headers:{'x-robots-tag':'noindex, nofollow'}}),'live-status'],
 ['header',()=>new Response('bad',{headers:{'x-robots-tag':'index, follow'}}),'live-robots'],
 ['short body',()=>new Response('x',{headers:{'x-robots-tag':'noindex,nofollow'}}),'live-body-length'],
 ['overflow',()=>new Response('x'.repeat(5000),{headers:{'x-robots-tag':'noindex,nofollow'}}),'live-body-length'],
] as const)('records %s mismatch, preserves earlier success and never retries',async(_name,response,code)=>{
 const f=await liveFixture(),t=transport(f,(_p,n)=>n===2?response():undefined);const r=await verifyLiveSite(f,t);
 expect(r.status).toBe('failed');expect(r.failure!.code).toBe(code);expect(r.completedCount).toBe(1);expect(t.requests).toHaveLength(2);
 expect((await stored(f)).checks).toHaveLength(1);await expect(access(resolve(f.proofRoot,'receipt.json'))).rejects.toThrow();
});
it('rejects a same-length body with a wrong hash',async()=>{
 const f=await liveFixture(),t=transport(f,p=>p==='/index.html'?new Response('x'.repeat(f.bodies['index.html'].length),{headers:{'x-robots-tag':'noindex,nofollow'}}):undefined);
 expect((await verifyLiveSite(f,t)).failure!.code).toBe('live-body-hash');
});
it.each(['/preview/countries/1220/','/preview/accepted/countries/1220/','/countries/9999/','/data/countries/1220/processed/current.json'])('requires the exact private-route 404 for %s',async path=>{
 const f=await liveFixture(),t=transport(f,p=>p===path?new Response(new Uint8Array(f.bodies['404.html']),{status:200,headers:{'x-robots-tag':'noindex,nofollow'}}):undefined);
 const r=await verifyLiveSite(f,t);expect(r.failure).toMatchObject({code:'live-status',path});expect(r.status).toBe('failed');
});
it('does not permit private-route redirection',async()=>{
 const f=await liveFixture(),t=transport(f,p=>p.startsWith('/preview/')?new Response(null,{status:302,headers:{location:p.slice(0,-1)}}):undefined);
 expect((await verifyLiveSite(f,t)).failure!.code).toBe('live-redirect');
});
it('compares decoded content despite different compressed Content-Length',async()=>{
 const f=await liveFixture(),t=transport(f,p=>p==='/index.html'?new Response(new Uint8Array(f.bodies['index.html']),{headers:{'x-robots-tag':'noindex,nofollow','content-encoding':'gzip','content-length':'7'}}):undefined);
 expect((await verifyLiveSite(f,t)).status).toBe('passed');
});
it('cancels an oversized stream immediately',async()=>{
 const f=await liveFixture();let cancelled=false;const t=transport(f,()=>new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(5000));},cancel(){cancelled=true;}},{highWaterMark:0}),{headers:{'x-robots-tag':'noindex,nofollow'}}));
 expect((await verifyLiveSite(f,t)).failure!.code).toBe('live-body-length');expect(cancelled).toBe(true);expect(t.requests).toHaveLength(1);
});
it('records a stream error without its untrusted message',async()=>{
 const f=await liveFixture(),t=transport(f,()=>new Response(new ReadableStream({start(c){c.error(Error('secret token'));}}),{headers:{'x-robots-tag':'noindex,nofollow'}}));
 expect((await verifyLiveSite(f,t)).failure!.code).toBe('live-network');expect(await readFile(resolve(f.proofRoot,'failed.json'),'utf8')).not.toContain('secret');
});
it.each([15000,180000])('aborts a stalled body at deadline %s and clears all timers',async deadline=>{
 const f=await liveFixture();const timers=new Map<number,{fn:()=>void;ms:number}>();let id=0,cancelled=false,signal:AbortSignal|undefined;
 const t=transport(f,(_p,_n,init)=>{signal=init.signal as AbortSignal;return new Response(new ReadableStream({pull(){queueMicrotask(()=>{const v=[...timers.values()].find(t=>t.ms===deadline);v?.fn();});},cancel(){cancelled=true;}},{highWaterMark:0}),{headers:{'x-robots-tag':'noindex,nofollow'}});});
 const r=await verifyLiveSite(f,{...t,setTimer:(fn:()=>void,ms:number)=>{timers.set(++id,{fn,ms});return id;},clearTimer:(key:unknown)=>{timers.delete(key as number);}});
 expect(r.failure!.code).toBe(deadline===15000?'live-request-timeout':'live-run-timeout');expect(cancelled).toBe(true);expect(signal?.aborted).toBe(true);expect(timers.size).toBe(0);
});
it('refuses an occupied proof directory without overwriting it or requesting HTTP',async()=>{
 const f=await liveFixture(),t=transport(f);await mkdir(f.proofRoot);await writeFile(resolve(f.proofRoot,'keep'),'original');
 await expect(verifyLiveSite(f,t)).rejects.toThrow('live-proof-path');expect(t.requests).toHaveLength(0);expect(await readFile(resolve(f.proofRoot,'keep'),'utf8')).toBe('original');
});
it('refuses an unsafe or missing-parent proof path without HTTP',async()=>{
 const f=await liveFixture(),t=transport(f);
 await expect(verifyLiveSite({...f,proofRoot:resolve(f.workDir,'../escape')},t)).rejects.toThrow('live-proof-path');
 await expect(verifyLiveSite({...f,proofRoot:resolve(f.workDir,'missing/proof')},t)).rejects.toThrow('live-proof-path');
 expect(t.requests).toHaveLength(0);
});
it('does not report success when its receipt cannot be created',async()=>{
 const f=await liveFixture(),t=transport(f,async(_p,n)=>{if(n===1)await writeFile(resolve(f.proofRoot,'receipt.json'),'occupied');return undefined;});
 const r=await verifyLiveSite(f,t);expect(r.status).toBe('failed');expect(r.failure!.code).toBe('live-proof-write');expect(await readFile(resolve(f.proofRoot,'receipt.json'),'utf8')).toBe('occupied');
});
it('rejects if even the failure receipt cannot be written',async()=>{
 const f=await liveFixture(),t=transport(f,async()=>{await writeFile(resolve(f.proofRoot,'failed.json'),'occupied');throw Error('untrusted');});
 await expect(verifyLiveSite(f,t)).rejects.toThrow('live-proof-write');expect(t.requests).toHaveLength(1);
});



it('cancels a response that arrives after a request timeout',async()=>{
 const f=await liveFixture();let fire:(()=>void)|undefined,cancelled=false;
 const t=transport(f,()=>{queueMicrotask(()=>fire?.());return new Response(new ReadableStream({cancel(){cancelled=true;}}),{headers:{'x-robots-tag':'noindex,nofollow'}});});
 const r=await verifyLiveSite(f,{...t,setTimer:(fn:()=>void,ms:number)=>{if(ms===15000)fire=fn;return ms;},clearTimer:()=>{}});
 expect(r.failure!.code).toBe('live-request-timeout');expect(cancelled).toBe(true);
});

