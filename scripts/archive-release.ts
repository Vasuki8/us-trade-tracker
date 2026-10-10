import {mkdir,readdir,writeFile,open} from 'node:fs/promises';
import {join} from 'node:path';
import {validateRelease} from './prepare-release';
import {validMonth} from '../src/lib/trade/normalize';
import {findRevisedKeys,findDutyRevisedKeys} from '../src/lib/trade/revisions';
import {ArchiveStoreError,type ArchiveStore} from './archive-store';
import {LIMITS,decodePointer,encodePointer,packBundle,unpackBundle,parseArchiveJson,releaseIdFromKey,sha256,validateReference,type BundleReference,type BundlePackage,type DecodedBundle} from './archive-bundle';
import {DEFAULT_PRODUCT_CODE,assertProductCode} from '../src/lib/trade/product-registry';
import {productArchiveKeys} from './product-paths';
export type ArchiveRunState={schemaVersion:2;productCode:string;reportingMonth:string;baseline:null|{reference:BundleReference;etag:string;releaseId:string;releaseSha256:string}};
export type ArchiveCandidate={schemaVersion:2;productCode:string;run:ArchiveRunState;reference:BundleReference;bundleFile:'bundle.json'};
export type ArchiveContext={store:ArchiveStore;dataDir:string;runDir:string;productCode?:string};
export type BackupReceipt={artifactId:string;artifactDigest:string};
export type PromotionOutcome={status:'acknowledged'|'confirmed_by_readback'|'conflict'|'unconfirmed';reference:BundleReference};
export class PromotionReceiptError extends Error{constructor(readonly outcome:PromotionOutcome){super('Promotion outcome established, but local receipt could not be saved');this.name='PromotionReceiptError';}}
function object(value:unknown,keys:string[]):Record<string,any>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(value,k)))throw new Error('Invalid archive state schema');return value as Record<string,any>;}
export function parseRunState(value:unknown,expectedProductCode:string=DEFAULT_PRODUCT_CODE):ArchiveRunState{
  assertProductCode(expectedProductCode);
  const version=(value as {schemaVersion?:unknown}|null)?.schemaVersion;
  const run=object(value,['schemaVersion',...(version===2?['productCode']:[]),'reportingMonth','baseline']);
  if(!(version===1&&expectedProductCode===DEFAULT_PRODUCT_CODE||version===2&&run.productCode===expectedProductCode)||!validMonth(run.reportingMonth))throw new Error('Invalid archive run product or metadata');
  if(run.baseline!==null){
    const b=object(run.baseline,['reference','etag','releaseId','releaseSha256']);const ref=validateReference(b.reference,expectedProductCode);
    if(b.releaseId!==releaseIdFromKey(ref.key,expectedProductCode)||b.releaseId.slice(0,7)>run.reportingMonth||typeof b.etag!=='string'||!/^"[\x21\x23-\x7e]{1,510}"$/.test(b.etag)||typeof b.releaseSha256!=='string'||!/^[a-f0-9]{64}$/.test(b.releaseSha256))throw new Error('Invalid archive baseline');
  }
  return {schemaVersion:2,productCode:expectedProductCode,reportingMonth:run.reportingMonth,baseline:run.baseline};
}
export function parseCandidateState(value:unknown,expectedProductCode:string=DEFAULT_PRODUCT_CODE):ArchiveCandidate{
  assertProductCode(expectedProductCode);
  const version=(value as {schemaVersion?:unknown}|null)?.schemaVersion;
  const c=object(value,['schemaVersion',...(version===2?['productCode']:[]),'run','reference','bundleFile']);const run=parseRunState(c.run,expectedProductCode);const ref=validateReference(c.reference,expectedProductCode);
  if(!(version===1&&expectedProductCode===DEFAULT_PRODUCT_CODE||version===2&&c.productCode===expectedProductCode)||c.bundleFile!=='bundle.json'||releaseIdFromKey(ref.key,expectedProductCode).slice(0,7)!==run.reportingMonth||ref.key===run.baseline?.reference.key)throw new Error('Invalid archive candidate product or metadata');
  return {schemaVersion:2,productCode:expectedProductCode,run,reference:ref,bundleFile:'bundle.json'};
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
function verifyIdentity(decoded:DecodedBundle,ref:BundleReference,productCode:string):void{if(decoded.manifest.productCode!==productCode||decoded.manifest.releaseId!==releaseIdFromKey(ref.key,productCode))throw new Error('Bundle key and release identity differ');}
export async function buildLocalBundle(dataDir:string,baseline:ArchiveRunState['baseline'],expectedProductCode:string=DEFAULT_PRODUCT_CODE):Promise<BundlePackage>{
  const {prefix}=productArchiveKeys(expectedProductCode);
  const pointer=object(parseArchiveJson(await readLocalFileBounded(join(dataDir,'processed/current.json'),LIMITS.pointer),LIMITS.pointer),['releaseFile']);
  if(typeof pointer.releaseFile!=='string'||!pointer.releaseFile.startsWith('releases/'))throw new Error('Invalid local release pointer');
  const id=releaseIdFromKey(`${prefix}${pointer.releaseFile}`,expectedProductCode);
  const releaseBytes=await readLocalFileBounded(join(dataDir,'processed',pointer.releaseFile),LIMITS.file);
  const release:unknown=parseArchiveJson(releaseBytes,LIMITS.file);validateRelease(release,true);
  if(release.productCode!==expectedProductCode)throw new Error('Candidate product differs from selected product');
  let previous:typeof release|undefined;
  if(baseline){
    parseRunState({schemaVersion:2,productCode:expectedProductCode,reportingMonth:release.reportingMonth,baseline},expectedProductCode);
    const bytes=await readLocalFileBounded(join(dataDir,'processed/releases',`${baseline.releaseId}.json`),LIMITS.file);
    if(sha256(bytes)!==baseline.releaseSha256)throw new Error('Restored baseline bytes changed');
    const parsed:unknown=parseArchiveJson(bytes,LIMITS.file);validateRelease(parsed,true);if(parsed.productCode!==expectedProductCode)throw new Error('Baseline product differs from selected product');previous=parsed;
  }
  const revisions=findRevisedKeys(previous,release).sort();
  if(new Set(release.revisedKeys).size!==release.revisedKeys.length||JSON.stringify([...release.revisedKeys].sort())!==JSON.stringify(revisions))throw new Error('Candidate revisions differ from restored baseline');
  if(release.schemaVersion===2){const keys=release.duties.revisedKeys,expected=findDutyRevisedKeys(previous?.schemaVersion===2?previous.duties:undefined,release.duties);if(new Set(keys).size!==keys.length||JSON.stringify([...keys].sort())!==JSON.stringify(expected))throw new Error('Candidate duty revisions differ from restored baseline');}
  const records=new Map<string,Buffer>();let total=releaseBytes.length;
  const names=await readdir(join(dataDir,'raw',id));if(names.length!==(release.schemaVersion===2?336:240))throw new Error('Incomplete source request grid');
  for(const name of names){if(!/^(imports|exports)-20\d{2}-(0[1-9]|1[0-2])-(HS|HSCY)\.json$/.test(name)&&!(release.schemaVersion===2&&/^duties-20\d{2}-(0[1-9]|1[0-2])-(HS|HSCY|HSRP|HSCYRP)\.json$/.test(name)))throw new Error('Invalid raw file path');const bytes=await readLocalFileBounded(join(dataDir,'raw',id,name),Math.min(LIMITS.file,LIMITS.total-total));total+=bytes.length;records.set(`raw/${name}`,bytes);}
  return packBundle({releaseId:id,releaseBytes,rawRecords:records,previous:baseline?.reference??null},expectedProductCode);
}
export async function restoreForImport(context:ArchiveContext,request:{reportingMonth:string;initialize:boolean}):Promise<ArchiveRunState>{
  const productCode=context.productCode??DEFAULT_PRODUCT_CODE,{currentKey}=productArchiveKeys(productCode);
  if(!validMonth(request.reportingMonth)||typeof request.initialize!=='boolean')throw new Error('Invalid archive restore request');
  await emptyDestination(context.dataDir,true);const pointer=await context.store.get(currentKey,LIMITS.pointer);
  let baseline:ArchiveRunState['baseline']=null;
  if(!pointer){if(!request.initialize)throw new Error('Archive is absent; explicit initialization required');}
  else{
    if(request.initialize)throw new Error('Archive already exists; initialization rejected');
    const reference=decodePointer(pointer.bytes,productCode);const bundle=await context.store.get(reference.key,LIMITS.bundle);if(!bundle)throw new Error('Accepted archive bundle is missing');
    const decoded=unpackBundle(bundle.bytes,reference.sha256,productCode);verifyIdentity(decoded,reference,productCode);
    if(request.reportingMonth<decoded.release.reportingMonth)throw new Error('Reporting month cannot regress');
    baseline={reference,etag:pointer.etag,releaseId:decoded.manifest.releaseId,releaseSha256:sha256(decoded.files.get('release.json')!)};
    parseRunState({schemaVersion:2,productCode,reportingMonth:request.reportingMonth,baseline},productCode);await restoreDecoded(decoded,context.dataDir,true);
  }
  const run:ArchiveRunState={schemaVersion:2,productCode,reportingMonth:request.reportingMonth,baseline};
  await mkdir(context.runDir,{recursive:true});await writeFile(join(context.runDir,'run.json'),JSON.stringify(run),{flag:'wx'});return run;
}
export async function stageCandidate(context:ArchiveContext,run:ArchiveRunState):Promise<ArchiveCandidate>{
  const productCode=context.productCode??DEFAULT_PRODUCT_CODE;run=parseRunState(run,productCode);const pkg=await buildLocalBundle(context.dataDir,run.baseline,productCode);
  const candidate=parseCandidateState({schemaVersion:2,productCode,run,reference:pkg.reference,bundleFile:'bundle.json'},productCode);
  await mkdir(context.runDir,{recursive:true});await writeFile(join(context.runDir,'bundle.json'),pkg.bytes,{flag:'wx'});
  try{await context.store.put(pkg.reference.key,pkg.bytes,{ifNoneMatch:'*'});}
  catch(error){if(!(error instanceof ArchiveStoreError)||!['conflict','unconfirmed_write'].includes(error.code))throw error;}
  const stored=await context.store.get(pkg.reference.key,LIMITS.bundle);
  if(!stored||!stored.bytes.equals(pkg.bytes))throw new Error('Candidate upload could not be verified');
  verifyIdentity(unpackBundle(stored.bytes,pkg.reference.sha256,productCode),pkg.reference,productCode);
  await writeFile(join(context.runDir,'candidate.json'),JSON.stringify(candidate),{flag:'wx'});return candidate;
}
export async function promoteCandidate(context:ArchiveContext,candidate:ArchiveCandidate,backup:BackupReceipt):Promise<PromotionOutcome>{
  const productCode=context.productCode??DEFAULT_PRODUCT_CODE,{currentKey}=productArchiveKeys(productCode);candidate=parseCandidateState(candidate,productCode);
  if(!backup||typeof backup.artifactId!=='string'||! /^[1-9]\d*$/.test(backup.artifactId)||typeof backup.artifactDigest!=='string'||! /^[a-f0-9]{64}$/.test(backup.artifactDigest))throw new Error('A successful backup artifact receipt is required');
  const bytes=await readLocalFileBounded(join(context.runDir,'bundle.json'),LIMITS.bundle);const decoded=unpackBundle(bytes,candidate.reference.sha256,productCode);verifyIdentity(decoded,candidate.reference,productCode);
  if(JSON.stringify(decoded.manifest.previous)!==JSON.stringify(candidate.run.baseline?.reference??null))throw new Error('Candidate baseline identity differs');
  const remote=await context.store.get(candidate.reference.key,LIMITS.bundle);if(!remote||!remote.bytes.equals(bytes))throw new Error('Backed-up candidate differs from staged archive');
  const pointer=encodePointer(candidate.reference,productCode);let status:PromotionOutcome['status'];
  try{await context.store.put(currentKey,pointer,candidate.run.baseline?{ifMatch:candidate.run.baseline.etag}:{ifNoneMatch:'*'});status='acknowledged';}
  catch(error){
    if(!(error instanceof ArchiveStoreError))throw error;
    if(error.code==='conflict')status='conflict';
    else if(error.code==='unconfirmed_write'){
      status='unconfirmed';try{const current=await context.store.get(currentKey,LIMITS.pointer);if(current?.bytes.equals(pointer))status='confirmed_by_readback';}catch{/* An unreadable outcome is unknown, never proof of rollback. */}
    }else throw error;
  }
  const outcome={status,reference:candidate.reference};
  try{await writeFile(join(context.runDir,'outcome.json'),JSON.stringify({...outcome,backup}));}catch{throw new PromotionReceiptError(outcome);}return outcome;
}
export async function recoverBundle(bundlePath:string,expectedSha256:string,dataDir:string,expectedProductCode:string=DEFAULT_PRODUCT_CODE):Promise<{releaseFile:string}>{
  const decoded=unpackBundle(await readLocalFileBounded(bundlePath,LIMITS.bundle),expectedSha256,expectedProductCode);return restoreDecoded(decoded,dataDir);
}
