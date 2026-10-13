import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import type {Readable} from 'node:stream';
import {countryKeys,countryJson,countryJsonBytes,countrySame as same,digestCountryBytes,parseCountryDigest} from '../country-release/contract.server';
import {writeCountryExclusiveFile} from '../country-release/prepare.server';
import type {Digest} from '../country-release/types';
import {countryArchiveContract as contract} from './contract.server';
import {sourceManifestKey,sourceObjectKey,bundleObjectKey,parseCountrySourceManifest} from './sources.server';
import {decodeCountryArchive,restoreCountryArchive,reserveArchiveOutput} from './bundle.server';
import type {ArchiveStore,SourceManifest,CountryArchivePointer,ArchiveVerificationReceipt} from './types';
const manifestDigest=()=>({bytes:contract.manifestPin.bytes,sha256:contract.manifestPin.sha256});
const refDigest=(value:{bytes:number;sha256:string})=>({bytes:value.bytes,sha256:value.sha256});
function boundedRequest<T>(signal:AbortSignal,request:()=>Promise<T>):Promise<T>{
  if(signal.aborted)return Promise.reject(new Error('country-archive-invocation-deadline'));
  return new Promise<T>((resolve,reject)=>{const clean=()=>signal.removeEventListener('abort',abort),abort=()=>{clean();reject(new Error('country-archive-invocation-deadline'));};signal.addEventListener('abort',abort,{once:true});try{request().then(value=>{clean();resolve(value);},error=>{clean();reject(error);});}catch(error){clean();reject(error);}});
}
async function invocation<T>(provider:ArchiveStore,work:(store:ArchiveStore)=>Promise<T>):Promise<T>{
  const controller=new AbortController(),signal=controller.signal,timer=setTimeout(()=>controller.abort(),contract.limits.totalMs);
  const store:ArchiveStore={
    get:(key,maxBytes)=>boundedRequest(signal,()=>provider.get(key,maxBytes,signal)),
    put:(key,bytes,condition)=>boundedRequest(signal,()=>provider.put(key,bytes,condition,signal)),
    source:(key,maxBytes,parentSignal)=>{const combined=parentSignal?AbortSignal.any([signal,parentSignal]):signal;return boundedRequest(combined,async()=>{const object=await provider.source(key,maxBytes,combined),abort=()=>object.stream.destroy();if(combined.aborted){abort();throw new Error('country-archive-invocation-deadline');}combined.addEventListener('abort',abort,{once:true});object.stream.once('close',()=>combined.removeEventListener('abort',abort));return object;});},
  };
  try{return await work(store);}finally{clearTimeout(timer);controller.abort();}
}
export function parseCountryArchivePointer(bytes:Buffer):CountryArchivePointer{
  const parsed=countryJson(bytes,contract.limits.pointer);if(!countryJsonBytes(parsed).equals(bytes))throw new Error('country-archive-pointer-canonical');const p=countryKeys(parsed,['schemaVersion','policyId','countryCode','releaseId','sourceManifest','bundle','localPointerDigest']);same(p.schemaVersion,1);same(p.policyId,contract.policyId);same(p.countryCode,'1220');same(p.releaseId,contract.releaseId);same(p.localPointerDigest,contract.selectedPointerDigest);
  const source=countryKeys(p.sourceManifest,['key','bytes','sha256']);same(source,{key:sourceManifestKey(),...manifestDigest()});
  const bundle=countryKeys(p.bundle,['key','bytes','sha256']),digest=parseCountryDigest(refDigest(bundle as {bytes:number;sha256:string}),contract.limits.bundle);same(bundle.key,bundleObjectKey(digest.sha256));return p as unknown as CountryArchivePointer;
}
async function compact(store:ArchiveStore,key:string,digest:Digest){const object=await store.get(key,digest.bytes);if(!object)throw new Error('country-archive-object-missing');same(digestCountryBytes(object.bytes),digest);return object.bytes;}
async function current(store:ArchiveStore){const object=await store.get(contract.currentKey,contract.limits.pointer);if(!object)return null;const pointer=parseCountryArchivePointer(object.bytes),bundle=decodeCountryArchive(await compact(store,pointer.bundle.key,refDigest(pointer.bundle)));same(bundle.sourceManifestDigest,refDigest(pointer.sourceManifest));same(bundle.authorization.localPointerDigest,pointer.localPointerDigest);return {pointer,bytes:object.bytes,digest:digestCountryBytes(object.bytes)};}
async function verifySources(store:ArchiveStore,manifest:SourceManifest){
  const controller=new AbortController(),active=new Set<Readable>();let cursor=0,total=0,passed=0,failure:unknown;
  const stop=()=>{controller.abort();for(const stream of active)stream.destroy();};
  const timer=setTimeout(()=>{failure??=new Error('country-archive-source-deadline');stop();},contract.limits.totalMs);
  try{await Promise.all(Array.from({length:contract.limits.concurrency},async()=>{for(;;){if(failure!==undefined)return;const i=cursor++;if(i>=manifest.files.length)return;const entry=manifest.files[i];let stream:Readable|undefined;
    try{const object=await store.source(sourceObjectKey(entry.id),entry.bytes,controller.signal);stream=object.stream;active.add(stream);if(object.contentLength!==null&&object.contentLength!==entry.bytes)throw new Error('country-archive-source-length');let bytes=0;const hash=createHash('sha256');
      for await(const part of stream){if(controller.signal.aborted)throw new Error('country-archive-source-aborted');const chunk=Buffer.from(part);bytes+=chunk.length;total+=chunk.length;if(bytes>entry.bytes||total>contract.limits.total)throw new Error('country-archive-source-length');hash.update(chunk);}
      same(bytes,entry.bytes);same(hash.digest('hex'),entry.sha256);passed++;
    }catch(error){failure??=error;stop();}finally{if(stream){active.delete(stream);stream.destroy();}}
  }}));if(failure!==undefined)throw new Error('country-archive-source-verification-failed');same(passed,manifest.files.length);same(total,manifest.sourceBytes);return {count:passed,bytes:total};}
  finally{clearTimeout(timer);stop();}
}
export class CountryArchiveVerificationReceiptError extends Error{constructor(readonly receipt:ArchiveVerificationReceipt){super('country-archive-verification-receipt-failed');this.name='CountryArchiveVerificationReceiptError';}}
type VerificationOptions={store:ArchiveStore;repoRoot:string;outputDir:string;bundleDigest:Digest;initialize:boolean};
async function verifyWithinInvocation(opts:VerificationOptions):Promise<ArchiveVerificationReceipt>{
  const bundleDigest=parseCountryDigest(opts.bundleDigest,contract.limits.bundle),sourceBytes=await compact(opts.store,sourceManifestKey(),manifestDigest()),manifest=parseCountrySourceManifest(sourceBytes),bundleBytes=await compact(opts.store,bundleObjectKey(bundleDigest.sha256),bundleDigest),bundle=decodeCountryArchive(bundleBytes);same(bundle.sourceManifestDigest,manifestDigest());
  const output=await reserveArchiveOutput(opts.repoRoot,opts.outputDir);await writeCountryExclusiveFile(opts.repoRoot,resolve(output,'source-manifest.json'),sourceBytes);await writeCountryExclusiveFile(opts.repoRoot,resolve(output,'bundle.json'),bundleBytes);
  const sources=await verifySources(opts.store,manifest),restored=await restoreCountryArchive({repoRoot:output,bundleBytes,outputDir:resolve(output,contract.backupRoot,'isolated-recovery')});
  const pointer:CountryArchivePointer={schemaVersion:1,policyId:contract.policyId,countryCode:'1220',releaseId:contract.releaseId,sourceManifest:{key:sourceManifestKey(),...manifestDigest()},bundle:{key:bundleObjectKey(bundleDigest.sha256),...bundleDigest},localPointerDigest:restored.pointerDigest},pointerBytes=countryJsonBytes(pointer),targetDigest=digestCountryBytes(pointerBytes);
  let archiveOutcome:ArchiveVerificationReceipt['archiveOutcome']='unconfirmed',currentStateVerified=false,archivePointerDigest:Digest|null=null;
  let before:Awaited<ReturnType<typeof current>>|undefined;
  try{before=await current(opts.store);}catch{before=undefined;}
  if(before===undefined){archiveOutcome='unconfirmed';}
  else if(before){archivePointerDigest=before.digest;currentStateVerified=true;archiveOutcome=before.bytes.equals(pointerBytes)?opts.initialize?'already-selected':'read-only-verified':'conflict';}
  else if(!opts.initialize){archiveOutcome='unchanged';currentStateVerified=true;}
  else{
    let acknowledged=false;try{await opts.store.put(contract.currentKey,pointerBytes,{ifNoneMatch:'*'});acknowledged=true;}catch{/* Establish resulting state through independent readback. */}
    try{const after=await current(opts.store);currentStateVerified=true;if(after){archivePointerDigest=after.digest;archiveOutcome=after.bytes.equals(pointerBytes)?acknowledged?'initialized':'confirmed-by-readback':'conflict';}else{archiveOutcome=acknowledged?'unconfirmed':'unchanged';currentStateVerified=!acknowledged;archivePointerDigest=acknowledged?targetDigest:null;}}
    catch{archiveOutcome='unconfirmed';currentStateVerified=false;archivePointerDigest=acknowledged?targetDigest:null;}
  }
  const receipt:ArchiveVerificationReceipt={schemaVersion:1,policyId:contract.policyId,status:'verified',sourceManifestDigest:manifestDigest(),bundleDigest,localPointerDigest:restored.pointerDigest,sourceCount:sources.count,sourceBytes:sources.bytes,projectionDigest:restored.projectionDigest,recovery:restored.receipt,originalSourceFetches:0,archiveOutcome,currentStateVerified,archivePointerDigest};
  try{await writeCountryExclusiveFile(opts.repoRoot,resolve(output,'verification-receipt.json'),countryJsonBytes(receipt));}catch{throw new CountryArchiveVerificationReceiptError(receipt);}return receipt;
}
export async function verifySelectedCountryArchive(opts:{store:ArchiveStore;repoRoot:string;outputDir:string}):Promise<ArchiveVerificationReceipt>{
  const provider:ArchiveStore={get:(key,maxBytes,signal)=>opts.store.get(key,maxBytes,signal),source:(key,maxBytes,signal)=>opts.store.source(key,maxBytes,signal),put:async()=>{throw new Error('country-archive-read-only');}};
  return invocation(provider,async store=>{const selected=await current(store);if(!selected)throw new Error('country-archive-selected-missing');return verifyWithinInvocation({...opts,store,bundleDigest:refDigest(selected.pointer.bundle),initialize:false});});
}
export async function verifyCountryArchive(opts:VerificationOptions):Promise<ArchiveVerificationReceipt>{return invocation(opts.store,store=>verifyWithinInvocation({...opts,store}));}
