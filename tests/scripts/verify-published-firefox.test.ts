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
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {readPublishedFirefoxPlan} from '../../scripts/published-firefox-plan';
import {verifyProfileDownload,resolveProfileRequest,verifyProfileResponse,assertCompleteProfileJourneys,type ProfileJourneyReceipt} from '../../scripts/published-profile-journeys';
import {assertPublishedFirefoxCompletion} from '../../scripts/verify-published-firefox';
const plan=readPublishedFirefoxPlan(readFileSync(new URL('../fixtures/published-firefox-2026-08.json',import.meta.url)));
it('rejects a substituted CSV even when its filename is correct',()=>{
 const csv=plan.csvs[0];expect(()=>verifyProfileDownload(plan,csv.case,csv.filename,Buffer.alloc(csv.bytes))).toThrow('published-download');
});
it('rejects a crossed download filename before accepting content',()=>{
 expect(()=>verifyProfileDownload(plan,plan.csvs[0].case,'hs-090111-exports.csv',Buffer.from('x'))).toThrow('published-download');
});
it.each(['truncated','wrong dimensions','overflow'])('rejects %s PNG output',failure=>{
 const b=Buffer.alloc(failure==='overflow'?4194305:failure==='truncated'?8:33);Buffer.from('89504e470d0a1a0a','hex').copy(b);if(b.length>=33){b.writeUInt32BE(13,8);b.write('IHDR',12);b.writeUInt32BE(100,16);b.writeUInt32BE(1080,20);}
 expect(()=>verifyProfileDownload(plan,'duty-png','hs-090121-imports-estimated-duties-monthly-dollars.png',b)).toThrow('published-download');
});
it.each([
 ['https://other.invalid/products/090121/','GET'],[origin+'/unknown/','GET'],
 [origin+'/products/090121/?token=secret','GET'],[origin+'/products/090121/','POST'],
 [origin+'/data/backups/?x=1','GET'],
])('refuses an unapproved browser request without selecting a response: %s', (url,method)=>{
 expect(()=>resolveProfileRequest(plan,origin,url,method)).toThrow('published-browser-policy');
});
it('maps a named saved view to its own pinned HTML response',()=>{
 expect(resolveProfileRequest(plan,origin,origin+'/products/090111/?direction=exports&months=12&countries=1220%2C2010%2C2050','GET')).toMatchObject({path:'/products/090111/index.html',bytes:295228});
});
it('rejects wrong response bytes despite a separately successful preflight',()=>{
 const check=resolveProfileRequest(plan,origin,origin+'/products/090121/','GET');
 expect(()=>verifyProfileResponse(check,200,{'x-robots-tag':'noindex,nofollow'},Buffer.alloc(check.bytes))).toThrow('published-browser-response');
});
it('requires private probe status rather than only its exact error-page identity',()=>{
 const check=resolveProfileRequest(plan,origin,origin+'/.git/config','GET');
 expect(()=>verifyProfileResponse(check,200,{'x-robots-tag':'noindex,nofollow'},Buffer.alloc(check.bytes))).toThrow('published-browser-response');
});
function completeJourneys():ProfileJourneyReceipt{
 return {status:'pass',engine:'firefox',browserVersion:'unit-only',platform:'linux',checks:[
 '090121-imports-world-duties.csv','090121-imports-1220-2010-2050-duties.csv','090111-imports-world-duties.csv','090111-imports-1220-2010-2050-duties.csv',
 '090121-imports-world-rolling-dollars-changes.csv','090121-exports-world-rolling-dollars-changes.csv','090111-imports-world-rolling-dollars-changes.csv','090111-exports-world-rolling-dollars-changes.csv',
 'mobile-090121-320','static-090121','mobile-090111-375','static-090111','/changes/products/','/changes/duties/','/countries/1220/','private-route-404s'],
 downloads:[...plan.csvs.map(c=>({key:c.case,name:c.filename,bytes:c.bytes,sha256:c.sha256})),
 {key:'duty-png',name:'hs-090121-imports-estimated-duties-monthly-dollars.png',bytes:100,sha256:'a'.repeat(64),width:1920,height:1080},
 {key:'merchandise-png',name:'hs-090121-imports.png',bytes:100,sha256:'b'.repeat(64),width:1920,height:1080}],
 network:{requests:20,verifiedResponses:20,acceptedBytes:1000,failures:[]},pageErrors:[]};
}
it('accepts only the complete fixed journey and download set',()=>{expect(()=>assertCompleteProfileJourneys(plan,completeJourneys())).not.toThrow();});
it.each(['missing journey','duplicate journey','missing download','crossed CSV','network failure','page error','request overflow'])('refuses a falsely complete receipt: %s',failure=>{
 const r=completeJourneys();if(failure==='missing journey')r.checks.pop();if(failure==='duplicate journey')r.checks[0]=r.checks[1];if(failure==='missing download')r.downloads.pop();if(failure==='crossed CSV')r.downloads[0].sha256='c'.repeat(64);if(failure==='network failure')r.network.failures.push('blocked');if(failure==='page error')r.pageErrors.push('error');if(failure==='request overflow')r.network.requests=501;
 expect(()=>assertCompleteProfileJourneys(plan,r)).toThrow('published-incomplete');
});
it('cannot pass with a failed or incomplete postflight',()=>{
 for(const after of [{status:'failed',completedCount:38},{status:'pass',completedCount:37}])expect(()=>assertPublishedFirefoxCompletion(plan,{before:{status:'pass',completedCount:38},after,journeys:completeJourneys()})).toThrow('published-incomplete');
});
it('the actual CLI refuses occupied output without a browser or network request',async()=>{
 await mkdir('.tmp',{recursive:true});const root=await mkdtemp(resolve('.tmp/published-cli-'));let caught:any;
 try{execFileSync(process.execPath,['--import','tsx','--import','data:text/javascript,globalThis.fetch%3D()%3D%3E%7Bthrow%20Error(%22Network%20disabled%22)%7D','scripts/verify-published-firefox.ts','--proof-root',root],{encoding:'utf8',stdio:'pipe'});}catch(e){caught=e;}
 try{expect(caught?.status).toBe(1);expect(String(caught?.stderr)).toContain('published-proof');}finally{await rm(root,{recursive:true,force:true});}
});

it('allows successful HTTP phases only with the complete browser receipt',()=>{expect(()=>assertPublishedFirefoxCompletion(plan,{before:{status:'pass',completedCount:38},after:{status:'pass',completedCount:38},journeys:completeJourneys()})).not.toThrow();});

import {isGeneratedProfileResource} from '../../scripts/published-profile-journeys';
it('leaves an actual same-origin UUID blob GET to the native browser PNG pipeline',()=>{
 expect(isGeneratedProfileResource(origin,'blob:'+origin+'/eadd5f66-3041-4136-be50-d2bc0277035c','GET')).toBe(true);
});
it.each([
 ['blob:https://other.invalid/eadd5f66-3041-4136-be50-d2bc0277035c','GET'],
 ['blob:'+origin+'/not-a-generated-uuid','GET'],
 ['blob:'+origin+'/eadd5f66-3041-4136-be50-d2bc0277035c','POST'],
 ['data:image/svg+xml,unverified','GET'],[origin+'/eadd5f66-3041-4136-be50-d2bc0277035c','GET'],
])('does not exempt an unrelated request from HTTP authentication: %s',(url,method)=>{
 expect(isGeneratedProfileResource(origin,url,method)).toBe(false);
});

it('accepts the historical monthly duty PNG filename with the required header dimensions',()=>{
 const b=Buffer.alloc(33);Buffer.from('89504e470d0a1a0a','hex').copy(b);b.writeUInt32BE(13,8);b.write('IHDR',12);b.writeUInt32BE(1920,16);b.writeUInt32BE(1080,20);
 expect(verifyProfileDownload(plan,'duty-png','hs-090121-imports-estimated-duties-monthly-dollars.png',b)).toMatchObject({width:1920,height:1080});
});

it.each(['wrong engine','wrong platform'])('never closes Linux Firefox acceptance for %s',failure=>{
 const r=completeJourneys();if(failure==='wrong engine')r.engine='webkit';else r.platform='win32';
 expect(()=>assertPublishedFirefoxCompletion(plan,{before:{status:'pass',completedCount:38},after:{status:'pass',completedCount:38},journeys:r})).toThrow('published-incomplete');
});
