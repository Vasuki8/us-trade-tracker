import {mkdir,readdir,writeFile,open} from 'node:fs/promises';
import {join} from 'node:path';
import {validateRelease} from './prepare-release';
import {validMonth} from '../src/lib/trade/normalize';
import {findRevisedKeys} from '../src/lib/trade/revisions';
import {ArchiveStoreError,type ArchiveStore} from './archive-store';
import {CURRENT_KEY,LIMITS,decodePointer,encodePointer,packBundle,unpackBundle,parseArchiveJson,releaseIdFromKey,sha256,validateReference,type BundleReference,type BundlePackage,type DecodedBundle} from './archive-bundle';
export type ArchiveRunState={schemaVersion:1;reportingMonth:string;baseline:null|{reference:BundleReference;etag:string;releaseId:string;releaseSha256:string}};
export type ArchiveCandidate={schemaVersion:1;run:ArchiveRunState;reference:BundleReference;bundleFile:'bundle.json'};
export type ArchiveContext={store:ArchiveStore;dataDir:string;runDir:string};
export type BackupReceipt={artifactId:string;artifactDigest:string};
export type PromotionOutcome={status:'acknowledged'|'confirmed_by_readback'|'conflict'|'unconfirmed';reference:BundleReference};
export class PromotionReceiptError extends Error{constructor(readonly outcome:PromotionOutcome){super('Promotion outcome established, but local receipt could not be saved');this.name='PromotionReceiptError';}}
function object(value:unknown,keys:string[]):Record<string,any>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(value,k)))throw new Error('Invalid archive state schema');return value as Record<string,any>;}
export function parseRunState(value:unknown):ArchiveRunState{
  const run=object(value,['schemaVersion','reportingMonth','baseline']);
  if(run.schemaVersion!==1||!validMonth(run.reportingMonth))throw new Error('Invalid archive run metadata');
  if(run.baseline!==null){
    const b=object(run.baseline,['reference','etag','releaseId','releaseSha256']);const ref=validateReference(b.reference);
    if(b.releaseId!==releaseIdFromKey(ref.key)||b.releaseId.slice(0,7)>run.reportingMonth||typeof b.etag!=='string'||!/^"[\x21\x23-\x7e]{1,510}"$/.test(b.etag)||typeof b.releaseSha256!=='string'||!/^[a-f0-9]{64}$/.test(b.releaseSha256))throw new Error('Invalid archive baseline');
  }
  return run as ArchiveRunState;
}
export function parseCandidateState(value:unknown):ArchiveCandidate{
  const c=object(value,['schemaVersion','run','reference','bundleFile']);const run=parseRunState(c.run);const ref=validateReference(c.reference);
  if(c.schemaVersion!==1||c.bundleFile!=='bundle.json'||releaseIdFromKey(ref.key).slice(0,7)!==run.reportingMonth||ref.key===run.baseline?.reference.key)throw new Error('Invalid archive candidate');
  return c as ArchiveCandidate;
}
export async function readLocalFileBounded(path:string,maxBytes:number):Promise<Buffer>{
  const file=await open(path,'r');try{
    if(!(await file.stat()).isFile())throw new Error('Expected an archive file');
    const chunks:Buffer[]=[];let total=0;
    while(true){const chunk=Buffer.alloc(Math.min(64*1024,maxBytes-total+1));const {bytesRead}=await file.read(chunk);if(!bytesRead)break;total+=bytesRead;if(total>maxBytes)throw new Error('Local archive byte size limit exceeded');chunks.push(chunk.subarray(0,bytesRead));}
    return Buffer.concat(chunks,total);
  }finally{await file.close();}
}
async function emptyDestination(dataDir:string,allowClassification=false):Promise<void>{
  try{if((await readdir(dataDir)).some(name=>!allowClassification||name!=='classification'))throw new Error('Recovery destination must be empty of generated data');}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
}
async function restoreDecoded(decoded:DecodedBundle,dataDir:string,allowClassification=false):Promise<{releaseFile:string}>{
  await emptyDestination(dataDir,allowClassification);const id=decoded.manifest.releaseId;
  await mkdir(join(dataDir,'processed/releases'),{recursive:true});await mkdir(join(dataDir,'raw',id),{recursive:true});
  for(const [path,bytes] of decoded.files){if(path==='release.json')continue;await writeFile(join(dataDir,'raw',id,path.slice(4)),bytes,{flag:'wx'});}
  const releaseFile=`releases/${id}.json`;
  await writeFile(join(dataDir,'processed',releaseFile),decoded.files.get('release.json')!,{flag:'wx'});
  // A local pointer appears only after every validated original file is retained.
  await writeFile(join(dataDir,'processed/current.json'),JSON.stringify({releaseFile}),{flag:'wx'});return {releaseFile};
}
function verifyIdentity(decoded:DecodedBundle,ref:BundleReference):void{if(decoded.manifest.releaseId!==releaseIdFromKey(ref.key))throw new Error('Bundle key and release identity differ');}
export async function buildLocalBundle(dataDir:string,baseline:ArchiveRunState['baseline']):Promise<BundlePackage>{
  const pointer=object(parseArchiveJson(await readLocalFileBounded(join(dataDir,'processed/current.json'),LIMITS.pointer),LIMITS.pointer),['releaseFile']);
  if(typeof pointer.releaseFile!=='string'||!pointer.releaseFile.startsWith('releases/'))throw new Error('Invalid local release pointer');
  const id=releaseIdFromKey(`trade/v1/products/090121/${pointer.releaseFile}`);
  const releaseBytes=await readLocalFileBounded(join(dataDir,'processed',pointer.releaseFile),LIMITS.file);
  const release:unknown=parseArchiveJson(releaseBytes,LIMITS.file);validateRelease(release,true);
  let previous:typeof release|undefined;
  if(baseline){
    parseRunState({schemaVersion:1,reportingMonth:release.reportingMonth,baseline});
    const bytes=await readLocalFileBounded(join(dataDir,'processed/releases',`${baseline.releaseId}.json`),LIMITS.file);
    if(sha256(bytes)!==baseline.releaseSha256)throw new Error('Restored baseline bytes changed');
    const parsed:unknown=parseArchiveJson(bytes,LIMITS.file);validateRelease(parsed,true);previous=parsed;
  }
  const revisions=findRevisedKeys(previous,release).sort();
  if(new Set(release.revisedKeys).size!==release.revisedKeys.length||JSON.stringify([...release.revisedKeys].sort())!==JSON.stringify(revisions))throw new Error('Candidate revisions differ from restored baseline');
  const records=new Map<string,Buffer>();let total=releaseBytes.length;
  const names=await readdir(join(dataDir,'raw',id));if(names.length!==240)throw new Error('Incomplete source request grid');
  for(const name of names){if(!/^(imports|exports)-20\d{2}-(0[1-9]|1[0-2])-(HS|HSCY)\.json$/.test(name))throw new Error('Invalid raw file path');const bytes=await readLocalFileBounded(join(dataDir,'raw',id,name),Math.min(LIMITS.file,LIMITS.total-total));total+=bytes.length;records.set(`raw/${name}`,bytes);}
  return packBundle({releaseId:id,releaseBytes,rawRecords:records,previous:baseline?.reference??null});
}
export async function restoreForImport(context:ArchiveContext,request:{reportingMonth:string;initialize:boolean}):Promise<ArchiveRunState>{
  if(!validMonth(request.reportingMonth)||typeof request.initialize!=='boolean')throw new Error('Invalid archive restore request');
  await emptyDestination(context.dataDir,true);const pointer=await context.store.get(CURRENT_KEY,LIMITS.pointer);
  let baseline:ArchiveRunState['baseline']=null;
  if(!pointer){if(!request.initialize)throw new Error('Archive is absent; explicit initialization required');}
  else{
    if(request.initialize)throw new Error('Archive already exists; initialization rejected');
    const reference=decodePointer(pointer.bytes);const bundle=await context.store.get(reference.key,LIMITS.bundle);if(!bundle)throw new Error('Accepted archive bundle is missing');
    const decoded=unpackBundle(bundle.bytes,reference.sha256);verifyIdentity(decoded,reference);
    if(request.reportingMonth<decoded.release.reportingMonth)throw new Error('Reporting month cannot regress');
    baseline={reference,etag:pointer.etag,releaseId:decoded.manifest.releaseId,releaseSha256:sha256(decoded.files.get('release.json')!)};
    parseRunState({schemaVersion:1,reportingMonth:request.reportingMonth,baseline});await restoreDecoded(decoded,context.dataDir,true);
  }
  const run:ArchiveRunState={schemaVersion:1,reportingMonth:request.reportingMonth,baseline};
  await mkdir(context.runDir,{recursive:true});await writeFile(join(context.runDir,'run.json'),JSON.stringify(run),{flag:'wx'});return run;
}
export async function stageCandidate(context:ArchiveContext,run:ArchiveRunState):Promise<ArchiveCandidate>{
  parseRunState(run);const pkg=await buildLocalBundle(context.dataDir,run.baseline);
  const candidate=parseCandidateState({schemaVersion:1,run,reference:pkg.reference,bundleFile:'bundle.json'});
  await mkdir(context.runDir,{recursive:true});await writeFile(join(context.runDir,'bundle.json'),pkg.bytes,{flag:'wx'});
  try{await context.store.put(pkg.reference.key,pkg.bytes,{ifNoneMatch:'*'});}
  catch(error){if(!(error instanceof ArchiveStoreError)||!['conflict','unconfirmed_write'].includes(error.code))throw error;}
  const stored=await context.store.get(pkg.reference.key,LIMITS.bundle);
  if(!stored||!stored.bytes.equals(pkg.bytes))throw new Error('Candidate upload could not be verified');
  verifyIdentity(unpackBundle(stored.bytes,pkg.reference.sha256),pkg.reference);
  await writeFile(join(context.runDir,'candidate.json'),JSON.stringify(candidate),{flag:'wx'});return candidate;
}
export async function promoteCandidate(context:ArchiveContext,candidate:ArchiveCandidate,backup:BackupReceipt):Promise<PromotionOutcome>{
  parseCandidateState(candidate);
  if(!backup||typeof backup.artifactId!=='string'||! /^[1-9]\d*$/.test(backup.artifactId)||typeof backup.artifactDigest!=='string'||! /^[a-f0-9]{64}$/.test(backup.artifactDigest))throw new Error('A successful backup artifact receipt is required');
  const bytes=await readLocalFileBounded(join(context.runDir,'bundle.json'),LIMITS.bundle);const decoded=unpackBundle(bytes,candidate.reference.sha256);verifyIdentity(decoded,candidate.reference);
  if(JSON.stringify(decoded.manifest.previous)!==JSON.stringify(candidate.run.baseline?.reference??null))throw new Error('Candidate baseline identity differs');
  const remote=await context.store.get(candidate.reference.key,LIMITS.bundle);if(!remote||!remote.bytes.equals(bytes))throw new Error('Backed-up candidate differs from staged archive');
  const pointer=encodePointer(candidate.reference);let status:PromotionOutcome['status'];
  try{await context.store.put(CURRENT_KEY,pointer,candidate.run.baseline?{ifMatch:candidate.run.baseline.etag}:{ifNoneMatch:'*'});status='acknowledged';}
  catch(error){
    if(!(error instanceof ArchiveStoreError))throw error;
    if(error.code==='conflict')status='conflict';
    else if(error.code==='unconfirmed_write'){
      status='unconfirmed';try{const current=await context.store.get(CURRENT_KEY,LIMITS.pointer);if(current?.bytes.equals(pointer))status='confirmed_by_readback';}catch{/* An unreadable outcome is unknown, never proof of rollback. */}
    }else throw error;
  }
  const outcome={status,reference:candidate.reference};
  try{await writeFile(join(context.runDir,'outcome.json'),JSON.stringify({...outcome,backup}));}catch{throw new PromotionReceiptError(outcome);}return outcome;
}
export async function recoverBundle(bundlePath:string,expectedSha256:string,dataDir:string):Promise<{releaseFile:string}>{
  const decoded=unpackBundle(await readLocalFileBounded(bundlePath,LIMITS.bundle),expectedSha256);return restoreDecoded(decoded,dataDir);
}
