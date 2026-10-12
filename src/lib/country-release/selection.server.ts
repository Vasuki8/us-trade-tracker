import {lstat,mkdir,open,rename,unlink} from 'node:fs/promises';
import {resolve,relative,dirname,sep,isAbsolute} from 'node:path';
import {randomUUID} from 'node:crypto';
import {assertSnapshotPath} from '../../../scripts/country-snapshot-input';
import {authenticateCountryCandidate} from './recovery.server';
import {canadaCountryReleaseContract as contract,countryJson,countryJsonBytes,countryKeys,countrySame as same,countryTimestamp,countryReleaseId,parseCountryDigest,digestCountryBytes} from './contract.server';
import {readCountryBoundedFile,writeCountryExclusiveFile,reserveCountryOutput,countryFailureReceipt} from './prepare.server';
import {CountrySelectionReceiptError,type CountryApproval,type CountryVerificationProof,type CountrySelectionOutcome,type CountryCurrentPointer,type CountryAcceptanceRecord,type CountryRecoveryReceipt,type AuthenticatedCountryCandidate,type Digest} from './types';
import type {CountryPreview} from '../country-preview/types';
function canonicalJson(bytes:Buffer,limit:number):unknown{const value=countryJson(bytes,limit);if(!countryJsonBytes(value).equals(bytes))throw new Error('country-noncanonical-record');return value;}
function parseApproval(value:unknown):CountryApproval{
  const a=countryKeys(countryJson(countryJsonBytes(value),contract.limits.record),['scope','actor','approvedAt','candidateDigest','eligibilityReportDigest','baseline']);same(a.scope,'local-selection-only');same(a.actor,'owner');countryTimestamp(a.approvedAt);parseCountryDigest(a.candidateDigest);parseCountryDigest(a.eligibilityReportDigest,contract.limits.record);
  const b=countryKeys(a.baseline,['kind',...(a.baseline&&typeof a.baseline==='object'&&(a.baseline as {kind:unknown}).kind==='existing'?['pointerDigest']:[])]);
  if(b.kind==='existing')parseCountryDigest(b.pointerDigest,contract.limits.pointer);else same(b.kind,'initialize');return a as unknown as CountryApproval;
}
function checkApproval(approval:CountryApproval,auth:AuthenticatedCountryCandidate){same(approval.candidateDigest,auth.candidate.digest);same(approval.eligibilityReportDigest,digestCountryBytes(countryJsonBytes(auth.report)));if(approval.approvedAt<auth.candidate.manifest.preparedAt)throw new Error('country-approval-time');}
function parsePointer(value:unknown):CountryCurrentPointer{
  const p=countryKeys(value,['schemaVersion','countryCode','releaseId','package','acceptance']);same(p.schemaVersion,1);same(p.countryCode,'1220');const releaseId=countryReleaseId(p.releaseId);
  for(const [name,file,limit]of [['package','candidate.json',contract.limits.package],['acceptance','acceptance.json',contract.limits.record]] as const){const ref=countryKeys(p[name],['path','bytes','sha256']);same(ref.path,`releases/${releaseId}/${file}`);parseCountryDigest({bytes:ref.bytes,sha256:ref.sha256},limit);}
  return p as unknown as CountryCurrentPointer;
}
function referenceDigest(ref:Digest):Digest{return {bytes:ref.bytes,sha256:ref.sha256};}
function validateRecord(recordBytes:Buffer,packageBytes:Buffer):{record:CountryAcceptanceRecord;auth:AuthenticatedCountryCandidate}{
  const r=countryKeys(canonicalJson(recordBytes,contract.limits.record),['schemaVersion','decision','approval','report','proof']);same(r.schemaVersion,1);same(r.decision,'approved-for-local-selection');
  const auth=authenticateCountryCandidate(packageBytes,r.proof as CountryVerificationProof),approval=parseApproval(r.approval);checkApproval(approval,auth);same(r.report,auth.report);
  return {record:{schemaVersion:1,decision:'approved-for-local-selection',approval,report:auth.report,proof:auth.proof},auth};
}
async function readState(repoRoot:string){
  const state=resolve(repoRoot,contract.stateRoot),pointerBytes=await readCountryBoundedFile(repoRoot,resolve(state,'current.json'),contract.limits.pointer),pointer=parsePointer(canonicalJson(pointerBytes,contract.limits.pointer));
  const packageBytes=await readCountryBoundedFile(repoRoot,resolve(state,pointer.package.path),contract.limits.package),recordBytes=await readCountryBoundedFile(repoRoot,resolve(state,pointer.acceptance.path),contract.limits.record);
  same(digestCountryBytes(packageBytes),referenceDigest(pointer.package));same(digestCountryBytes(recordBytes),referenceDigest(pointer.acceptance));const {record,auth}=validateRecord(recordBytes,packageBytes);same(pointer.releaseId,auth.candidate.manifest.releaseId);
  return {pointer,record,projection:auth.projection,digest:digestCountryBytes(pointerBytes)};
}
async function maybeState(repoRoot:string):Promise<Awaited<ReturnType<typeof readState>>|null>{
  const path=resolve(repoRoot,contract.stateRoot,'current.json');await assertSnapshotPath(repoRoot,path,true);try{await lstat(path);}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;}return readState(repoRoot);
}
function checkBaseline(approval:CountryApproval,state:Awaited<ReturnType<typeof maybeState>>){if(approval.baseline.kind==='initialize'){if(state!==null)throw new Error('country-baseline-conflict');}else{if(!state)throw new Error('country-baseline-conflict');same(state.digest,approval.baseline.pointerDigest);}}
async function ensureDirectory(repoRoot:string,path:string){
  const root=resolve(repoRoot),target=resolve(path),rel=relative(root,target);if(rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel))throw new Error('country-outside-workspace');await assertSnapshotPath(root,root);
  let cursor=root;for(const piece of rel.split(sep).filter(Boolean)){cursor=resolve(cursor,piece);await assertSnapshotPath(root,cursor,true);try{await mkdir(cursor);}catch(e){if((e as NodeJS.ErrnoException).code!=='EEXIST')throw e;}await assertSnapshotPath(root,cursor);if(!(await lstat(cursor)).isDirectory())throw new Error('country-invalid-directory');}
}
function selectedOutcome(status:CountrySelectionOutcome['status'],auth:AuthenticatedCountryCandidate,verified:boolean,pointerDigest:Digest|null):CountrySelectionOutcome{return {status,candidateDigest:{...auth.candidate.digest},currentStateVerified:verified,selectedPointerDigest:pointerDigest};}
async function persistOutcome(repoRoot:string,path:string,outcome:CountrySelectionOutcome){try{await writeCountryExclusiveFile(repoRoot,path,countryJsonBytes(outcome));}catch{throw new CountrySelectionReceiptError(outcome);}return outcome;}
async function removeOwnedFile(repoRoot:string,path:string,digest:Digest){try{same(digestCountryBytes(await readCountryBoundedFile(repoRoot,path,digest.bytes)),digest);await assertSnapshotPath(repoRoot,path);await unlink(path);}catch{/* Keep changed, linked or inaccessible files for deliberate diagnosis. */}}
export async function readSelectedCountryRelease(repoRoot:string):Promise<{pointer:CountryCurrentPointer;record:CountryAcceptanceRecord;projection:CountryPreview}>{const {pointer,record,projection}=await readState(repoRoot);return {pointer,record,projection};}
export async function selectLocalCountryRelease(opts:{repoRoot:string;candidateFile:string;proof:CountryVerificationProof;approval:CountryApproval;outcomeFile:string}):Promise<CountrySelectionOutcome>{
  const bytes=await readCountryBoundedFile(opts.repoRoot,opts.candidateFile,contract.limits.package),auth=authenticateCountryCandidate(bytes,opts.proof),approval=parseApproval(opts.approval);checkApproval(approval,auth);
  const state=resolve(opts.repoRoot,contract.stateRoot),current=resolve(state,'current.json'),outcomeFile=resolve(opts.repoRoot,opts.outcomeFile),outRel=relative(state,outcomeFile);
  if((outRel!=='..'&&!outRel.startsWith('..'+sep)&&!isAbsolute(outRel))||outcomeFile===resolve(opts.repoRoot,opts.candidateFile))throw new Error('country-outcome-path');await assertSnapshotPath(opts.repoRoot,dirname(outcomeFile));await assertSnapshotPath(opts.repoRoot,outcomeFile,true);
  const before=await maybeState(opts.repoRoot);
  if(before&&before.pointer.package.sha256===auth.candidate.digest.sha256&&before.pointer.package.bytes===auth.candidate.digest.bytes)return persistOutcome(opts.repoRoot,outcomeFile,selectedOutcome('already-selected',auth,true,before.digest));
  checkBaseline(approval,before);await ensureDirectory(opts.repoRoot,resolve(state,'releases'));
  const lockPath=resolve(state,'.accept.lock'),lockBytes=countryJsonBytes({token:randomUUID()}),lockDigest=digestCountryBytes(lockBytes);await assertSnapshotPath(opts.repoRoot,lockPath,true);const lock=await open(lockPath,'wx');let pending:string|null=null,pendingDigest:Digest|null=null;
  try{
    await lock.writeFile(lockBytes);await lock.sync();await assertSnapshotPath(opts.repoRoot,state);checkBaseline(approval,await maybeState(opts.repoRoot));
    const fresh=await readCountryBoundedFile(opts.repoRoot,opts.candidateFile,contract.limits.package);same(digestCountryBytes(fresh),auth.candidate.digest);const checked=authenticateCountryCandidate(fresh,auth.proof);checkApproval(approval,checked);
    const release=resolve(state,'releases',checked.candidate.manifest.releaseId);await assertSnapshotPath(opts.repoRoot,release,true);await mkdir(release);await assertSnapshotPath(opts.repoRoot,release);
    const record:CountryAcceptanceRecord={schemaVersion:1,decision:'approved-for-local-selection',approval,report:checked.report,proof:checked.proof},recordBytes=countryJsonBytes(record);if(recordBytes.length>contract.limits.record)throw new Error('country-record-limit');
    await writeCountryExclusiveFile(opts.repoRoot,resolve(release,'candidate.json'),fresh);await writeCountryExclusiveFile(opts.repoRoot,resolve(release,'acceptance.json'),recordBytes);
    validateRecord(await readCountryBoundedFile(opts.repoRoot,resolve(release,'acceptance.json'),contract.limits.record),await readCountryBoundedFile(opts.repoRoot,resolve(release,'candidate.json'),contract.limits.package));
    const id=checked.candidate.manifest.releaseId,pointer:CountryCurrentPointer={schemaVersion:1,countryCode:'1220',releaseId:id,package:{...checked.candidate.digest,path:`releases/${id}/candidate.json`},acceptance:{...digestCountryBytes(recordBytes),path:`releases/${id}/acceptance.json`}},pointerBytes=countryJsonBytes(pointer);pendingDigest=digestCountryBytes(pointerBytes);pending=resolve(state,`.current-${randomUUID()}.pending`);
    await writeCountryExclusiveFile(opts.repoRoot,pending,pointerBytes);checkBaseline(approval,await maybeState(opts.repoRoot));let acknowledged=false;
    try{await assertSnapshotPath(opts.repoRoot,current,true);await rename(pending,current);acknowledged=true;}catch{/* Resolve uncertain replacement through validated readback. */}
    let outcome:CountrySelectionOutcome;
    try{const after=await maybeState(opts.repoRoot);if(after&&after.digest.sha256===pendingDigest.sha256&&after.digest.bytes===pendingDigest.bytes)outcome=selectedOutcome(acknowledged?'acknowledged':'confirmed-by-readback',checked,true,pendingDigest);
      else if(acknowledged)outcome=selectedOutcome('acknowledged',checked,false,pendingDigest);
      else if((before===null&&after===null)||(before&&after&&before.digest.sha256===after.digest.sha256&&before.digest.bytes===after.digest.bytes))outcome=selectedOutcome('unchanged',checked,true,null);
      else outcome=selectedOutcome('conflict',checked,true,null);
    }catch{outcome=selectedOutcome(acknowledged?'acknowledged':'unconfirmed',checked,false,acknowledged?pendingDigest:null);}
    return await persistOutcome(opts.repoRoot,outcomeFile,outcome);
  }finally{await lock.close();if(pending&&pendingDigest)await removeOwnedFile(opts.repoRoot,pending,pendingDigest);await removeOwnedFile(opts.repoRoot,lockPath,lockDigest);}
}
export async function recoverSelectedCountryRelease(opts:{repoRoot:string;candidateFile:string;recordFile:string;selectionReceiptFile:string;expectedPointer:CountryCurrentPointer;outputDir:string;recoveryAuthorization:CountryApproval}):Promise<CountryRecoveryReceipt>{
  const pointer=parsePointer(countryJson(countryJsonBytes(opts.expectedPointer),contract.limits.pointer)),pointerBytes=countryJsonBytes(pointer),pointerDigest=digestCountryBytes(pointerBytes);
  const packageBytes=await readCountryBoundedFile(opts.repoRoot,opts.candidateFile,contract.limits.package),recordBytes=await readCountryBoundedFile(opts.repoRoot,opts.recordFile,contract.limits.record);same(digestCountryBytes(packageBytes),referenceDigest(pointer.package));same(digestCountryBytes(recordBytes),referenceDigest(pointer.acceptance));const {auth}=validateRecord(recordBytes,packageBytes);same(pointer.releaseId,auth.candidate.manifest.releaseId);
  const receipt=countryKeys(canonicalJson(await readCountryBoundedFile(opts.repoRoot,opts.selectionReceiptFile,contract.limits.pointer),contract.limits.pointer),['status','candidateDigest','currentStateVerified','selectedPointerDigest']);if(!['acknowledged','confirmed-by-readback','already-selected'].includes(String(receipt.status)))throw new Error('country-selection-not-confirmed');same(receipt.currentStateVerified,true);same(parseCountryDigest(receipt.candidateDigest),auth.candidate.digest);same(parseCountryDigest(receipt.selectedPointerDigest,contract.limits.pointer),pointerDigest);
  const authorization=parseApproval(opts.recoveryAuthorization);checkApproval(authorization,auth);if(authorization.baseline.kind!=='existing')throw new Error('country-recovery-authorization');same(authorization.baseline.pointerDigest,pointerDigest);
  const output=await reserveCountryOutput(opts.repoRoot,opts.outputDir);
  try{const state=resolve(output,contract.stateRoot),release=resolve(state,'releases',pointer.releaseId);await ensureDirectory(output,release);await writeCountryExclusiveFile(output,resolve(release,'candidate.json'),packageBytes);await writeCountryExclusiveFile(output,resolve(release,'acceptance.json'),recordBytes);await writeCountryExclusiveFile(output,resolve(state,'current.json'),pointerBytes);const recovered=await readSelectedCountryRelease(output);same(recovered.pointer,pointer);
    const projection=countryJsonBytes(recovered.projection);await writeCountryExclusiveFile(output,resolve(output,'research-data.json'),projection);const result:CountryRecoveryReceipt={schemaVersion:1,policyId:contract.policyId,candidateDigest:auth.candidate.digest,projectionDigest:digestCountryBytes(projection),status:'verified',historicalPathReads:0};await writeCountryExclusiveFile(output,resolve(output,'recovery-receipt.json'),countryJsonBytes(result));return result;
  }catch(error){await countryFailureReceipt(opts.repoRoot,output);throw error;}
}
