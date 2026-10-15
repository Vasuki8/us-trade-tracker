import {createHash} from 'node:crypto';
import {mkdir,lstat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {assertLocalPath,writeSiteFile,type FileIdentity} from './site-preparation-files';
import {assertLiveWorkDir,loadLiveSitePackage,type LivePackageOptions,type ExpectedLiveCheck} from './live-site-package';

export type LiveSiteOptions=LivePackageOptions&{deploymentOrigin:string;proofRoot:string};
type Redirect={from:string;to:string;status:number};
type CheckResult={origin:string;path:string;finalPath:string;allowedPaths:string[];status:number;bytes:number;sha256:string;robots:string[];redirects:Redirect[]};
export type LiveSiteVerificationReceipt={
 schemaVersion:1;status:'passed'|'failed';startedAt:string;finishedAt:string;origins:string[];
 manifest?:FileIdentity;zip?:FileIdentity;plannedCount:number;completedCount:number;httpAttempts:number;
 checks:CheckResult[];failure?:{code:string;origin?:string;path?:string};
};
type Runtime={fetch:typeof globalThis.fetch;now:()=>number;setTimer:(fn:()=>void,ms:number)=>unknown;clearTimer:(timer:unknown)=>void};
const canonical='https://us-trade-tracker.pages.dev';
const redirects=new Set([301,302,303,307,308]);
const codes=new Set(['live-package-input','live-package-changed','live-package-verification','live-package-receipt','live-package-policy','live-work-scope','live-redirect','live-status','live-robots','live-body-length','live-body-hash','live-request-timeout','live-run-timeout','live-proof-write','live-response-url']);
const code=(error:unknown)=>error instanceof Error&&codes.has(error.message)?error.message:'live-network';
const cancel=(body:ReadableStream<Uint8Array>|null)=>{if(body)void body.cancel().catch(()=>{});};
function abortable<T>(promise:Promise<T>,signal:AbortSignal):Promise<T>{
 return new Promise((resolve,reject)=>{
  const aborted=()=>reject(signal.reason);
  signal.addEventListener('abort',aborted,{once:true});
  if(signal.aborted)aborted();
  promise.then(resolve,reject).finally(()=>signal.removeEventListener('abort',aborted));
 });
}
async function bodyIdentity(response:Response,expected:ExpectedLiveCheck,signal:AbortSignal){
 const hash=createHash('sha256');let bytes=0;
 if(response.body){
  const reader=response.body.getReader();
  try{
   for(;;){
    const chunk=await abortable(reader.read(),signal);if(chunk.done)break;
    if(bytes+chunk.value.byteLength>expected.bytes)throw Error('live-body-length');
    bytes+=chunk.value.byteLength;hash.update(chunk.value);
   }
  }finally{void reader.cancel().catch(()=>{});reader.releaseLock();}
 }
 if(bytes!==expected.bytes)throw Error('live-body-length');
 const sha256=hash.digest('hex');if(sha256!==expected.sha256)throw Error('live-body-hash');
 return{bytes,sha256};
}
async function requestCheck(origin:string,expected:ExpectedLiveCheck,runtime:Runtime,overall:AbortSignal,attempt:()=>void):Promise<CheckResult>{
 let path=expected.path;const seen=new Set([path]),chain:Redirect[]=[];
 for(let hop=0;hop<=3;hop++){
  if(overall.aborted)throw overall.reason;
  const controller=new AbortController(),signal=AbortSignal.any([overall,controller.signal]);
  const timer=runtime.setTimer(()=>controller.abort(Error('live-request-timeout')),15000);
  let response:Response|undefined;
  try{
   attempt();
   const pending=runtime.fetch(origin+path,{method:'GET',redirect:'manual',credentials:'omit',signal,headers:{accept:'*/*'}});
   void pending.then(value=>{if(signal.aborted)cancel(value.body);},()=>{});
   response=await abortable(pending,signal);
   if(response.url&&response.url!==origin+path)throw Error('live-response-url');
   if(redirects.has(response.status)){
    const location=response.headers.get('location');
    if(expected.privateRoute||!location||hop===3||/[\\\u0000-\u0020\u007f]/.test(location))throw Error('live-redirect');
    let next:URL;try{next=new URL(location,origin+path);}catch{throw Error('live-redirect');}
    if(next.origin!==origin||next.username||next.password||next.search||next.hash||!expected.allowedPaths.includes(next.pathname)||seen.has(next.pathname))throw Error('live-redirect');
    chain.push({from:path,to:next.pathname,status:response.status});seen.add(next.pathname);path=next.pathname;
    continue;
   }
   if(!expected.statuses.includes(response.status))throw Error('live-status');
   const robots=(response.headers.get('x-robots-tag')??'').split(',').map(s=>s.trim().toLowerCase()).sort();
   if(robots.length!==2||robots[0]!=='nofollow'||robots[1]!=='noindex')throw Error('live-robots');
   const identity=await bodyIdentity(response,expected,signal);
   if(signal.aborted)throw signal.reason;
   return{origin,path:expected.path,finalPath:path,allowedPaths:expected.allowedPaths,status:response.status,...identity,robots,redirects:chain};
  }finally{
   runtime.clearTimer(timer);
   if(response&&!response.body?.locked)cancel(response.body);
  }
 }
 throw Error('live-redirect');
}
async function createProof(options:LiveSiteOptions){
 try{
  await assertLiveWorkDir(options.workDir);
  await assertLocalPath(options.workDir,options.proofRoot,true);
  try{await lstat(options.proofRoot);throw Error('occupied');}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
  await mkdir(options.proofRoot);await assertLocalPath(options.workDir,options.proofRoot);
 }catch{throw Error('live-proof-path');}
}
export async function verifyLiveSite(options:LiveSiteOptions,overrides:Partial<Runtime>={}):Promise<LiveSiteVerificationReceipt>{
 if(!/^https:\/\/[a-f0-9]{8}\.us-trade-tracker\.pages\.dev$/.test(options.deploymentOrigin))throw Error('live-origin');
 const runtime:Runtime={fetch:globalThis.fetch,now:Date.now,setTimer:setTimeout,clearTimer:t=>clearTimeout(t as ReturnType<typeof setTimeout>),...overrides};
 await createProof(options);
 const receipt:LiveSiteVerificationReceipt={schemaVersion:1,status:'failed',startedAt:new Date(runtime.now()).toISOString(),finishedAt:'',origins:[canonical,options.deploymentOrigin],plannedCount:0,completedCount:0,httpAttempts:0,checks:[]};
 let active:{origin:string;path:string}|undefined;
 const controller=new AbortController();let timer:unknown;
 try{
  const pkg=await loadLiveSitePackage(options);receipt.manifest=pkg.manifestIdentity;receipt.zip=pkg.zip;receipt.plannedCount=pkg.checks.length*2;
  timer=runtime.setTimer(()=>controller.abort(Error('live-run-timeout')),180000);
  for(const origin of receipt.origins)for(const check of pkg.checks){
   active={origin,path:check.path};
   receipt.checks.push(await requestCheck(origin,check,runtime,controller.signal,()=>{
    receipt.httpAttempts++;if(receipt.httpAttempts>receipt.plannedCount*4)throw Error('live-redirect');
   }));
   receipt.completedCount++;
  }
  active=undefined;receipt.status='passed';receipt.finishedAt=new Date(runtime.now()).toISOString();
  try{await writeSiteFile(options.workDir,resolve(options.proofRoot,'receipt.json'),Buffer.from(JSON.stringify(receipt,null,2)+'\n'));}
  catch{throw Error('live-proof-write');}
  return receipt;
 }catch(error){
  receipt.status='failed';receipt.finishedAt=new Date(runtime.now()).toISOString();receipt.failure={code:code(error),...active};
  try{await writeSiteFile(options.workDir,resolve(options.proofRoot,'failed.json'),Buffer.from(JSON.stringify(receipt,null,2)+'\n'));}
  catch{throw Error('live-proof-write');}
  return receipt;
 }finally{if(timer!==undefined)runtime.clearTimer(timer);controller.abort();}
}
