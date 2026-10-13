import {mkdir,lstat} from 'node:fs/promises';
import {resolve,relative,dirname,isAbsolute,sep} from 'node:path';
import {assertSnapshotPath} from '../../../scripts/country-snapshot-input';
import {readSelectedCountryRelease,recoverSelectedCountryRelease} from '../country-release/selection.server';
import {authenticateCountryCandidate} from '../country-release/recovery.server';
import {canadaCountryReleaseContract as release,countryKeys,countryJson,countryJsonBytes,countrySame as same,countryTimestamp,digestCountryBytes,parseCountryDigest} from '../country-release/contract.server';
import {readCountryBoundedFile,writeCountryExclusiveFile} from '../country-release/prepare.server';
import type {CountryApproval,CountryCurrentPointer,CountryVerificationProof} from '../country-release/types';
import {countryArchiveContract as contract} from './contract.server';
import {loadCountrySourceManifest} from './sources.server';
import type {ArchiveMemberName,DecodedArchive,OperatorAuthorization} from './types';
export const archiveMemberNames:readonly ArchiveMemberName[]=['candidate.json','acceptance.json','local-pointer.json','selection-receipt.json','local-completion.json','operator-authorization.json'];
const manifestDigest=()=>({bytes:contract.manifestPin.bytes,sha256:contract.manifestPin.sha256});
const refDigest=(ref:{bytes:number;sha256:string})=>({bytes:ref.bytes,sha256:ref.sha256});
function canonical(body:Buffer,limit:number){const value=countryJson(body,limit);if(!countryJsonBytes(value).equals(body))throw new Error('country-archive-noncanonical-record');return value;}
function pointerRecord(body:Buffer):CountryCurrentPointer{
  const p=countryKeys(canonical(body,contract.limits.pointer),['schemaVersion','countryCode','releaseId','package','acceptance']);same(p.schemaVersion,1);same(p.countryCode,'1220');same(p.releaseId,contract.releaseId);same(digestCountryBytes(body),contract.selectedPointerDigest);
  for(const [name,file,limit]of [['package','candidate.json',release.limits.package],['acceptance','acceptance.json',contract.limits.record]] as const){const r=countryKeys(p[name],['path','bytes','sha256']);same(r.path,`releases/${contract.releaseId}/${file}`);parseCountryDigest(refDigest(r as {bytes:number;sha256:string}),limit);}
  return p as unknown as CountryCurrentPointer;
}
function recoveryApproval(value:unknown,expected:{candidate:unknown;report:unknown;pointer:unknown;at:string}):CountryApproval{
  const a=countryKeys(value,['scope','actor','approvedAt','candidateDigest','eligibilityReportDigest','baseline']);same(a.scope,'local-selection-only');same(a.actor,'owner');same(countryTimestamp(a.approvedAt),expected.at);same(parseCountryDigest(a.candidateDigest),expected.candidate);same(parseCountryDigest(a.eligibilityReportDigest,contract.limits.record),expected.report);same(a.baseline,{kind:'existing',pointerDigest:expected.pointer});return a as unknown as CountryApproval;
}
function validateMembers(files:Map<ArchiveMemberName,Buffer>):OperatorAuthorization{
  const pointer=pointerRecord(files.get('local-pointer.json')!);same(digestCountryBytes(files.get('candidate.json')!),refDigest(pointer.package));same(digestCountryBytes(files.get('acceptance.json')!),refDigest(pointer.acceptance));
  const record=countryKeys(canonical(files.get('acceptance.json')!,contract.limits.record),['schemaVersion','decision','approval','report','proof']);same(record.schemaVersion,1);same(record.decision,'approved-for-local-selection');
  const auth=authenticateCountryCandidate(files.get('candidate.json')!,record.proof as CountryVerificationProof);same(auth.candidate.manifest.releaseId,contract.releaseId);same(record.report,auth.report);
  const approval=countryKeys(record.approval,['scope','actor','approvedAt','candidateDigest','eligibilityReportDigest','baseline']);same(approval.scope,'local-selection-only');same(approval.actor,'owner');const selectedAt=countryTimestamp(approval.approvedAt);if(selectedAt<auth.candidate.manifest.preparedAt)throw new Error('country-archive-selection-time');same(approval.candidateDigest,auth.candidate.digest);same(approval.eligibilityReportDigest,digestCountryBytes(countryJsonBytes(auth.report)));same(approval.baseline,{kind:'initialize'});
  const receipt=countryKeys(canonical(files.get('selection-receipt.json')!,contract.limits.pointer),['status','candidateDigest','currentStateVerified','selectedPointerDigest']);if(!['acknowledged','confirmed-by-readback','already-selected'].includes(String(receipt.status)))throw new Error('country-archive-selection-unconfirmed');same(receipt.currentStateVerified,true);same(receipt.candidateDigest,auth.candidate.digest);same(receipt.selectedPointerDigest,contract.selectedPointerDigest);
  const completion=canonical(files.get('local-completion.json')!,contract.limits.record) as Record<string,unknown>;same(completion.schemaVersion,1);same(completion.status,'local-acceptance-complete');same(completion.selectedPointerDigest,contract.selectedPointerDigest);same(completion.candidateDigest,auth.candidate.digest);
  const o=countryKeys(canonical(files.get('operator-authorization.json')!,contract.limits.record),['schemaVersion','scope','actor','recordedAt','instruction','localPointerDigest','sourceManifestDigest','recovery']);same(o.schemaVersion,1);same(o.scope,'private-country-archive-and-isolated-recovery');same(o.actor,'owner');const recordedAt=countryTimestamp(o.recordedAt);if(recordedAt<selectedAt)throw new Error('country-archive-authorization-time');if(typeof o.instruction!=='string'||o.instruction.trim().length<40||Buffer.byteLength(o.instruction)>8192)throw new Error('country-archive-owner-instruction');same(o.localPointerDigest,contract.selectedPointerDigest);same(o.sourceManifestDigest,manifestDigest());
  const recovery=recoveryApproval(o.recovery,{candidate:auth.candidate.digest,report:digestCountryBytes(countryJsonBytes(auth.report)),pointer:contract.selectedPointerDigest,at:recordedAt});
  return {schemaVersion:1,scope:'private-country-archive-and-isolated-recovery',actor:'owner',recordedAt,instruction:o.instruction,localPointerDigest:contract.selectedPointerDigest,sourceManifestDigest:manifestDigest(),recovery};
}
function encode(files:Map<ArchiveMemberName,Buffer>):Buffer{return countryJsonBytes({schemaVersion:1,policyId:contract.policyId,countryCode:'1220',releaseId:contract.releaseId,sourceManifestDigest:manifestDigest(),files:archiveMemberNames.map(name=>({name,...digestCountryBytes(files.get(name)!),base64:files.get(name)!.toString('base64')}))});}
export function decodeCountryArchive(input:Buffer):DecodedArchive{
  if(!Buffer.isBuffer(input)||input.length<1||input.length>contract.limits.bundle)throw new Error('country-archive-bundle-limit');
  const bytes=Buffer.from(input),v=countryKeys(countryJson(bytes,contract.limits.bundle),['schemaVersion','policyId','countryCode','releaseId','sourceManifestDigest','files']);same(v.schemaVersion,1);same(v.policyId,contract.policyId);same(v.countryCode,'1220');same(v.releaseId,contract.releaseId);same(v.sourceManifestDigest,manifestDigest());
  if(!Array.isArray(v.files)||v.files.length!==archiveMemberNames.length)throw new Error('country-archive-member-count');const files=new Map<ArchiveMemberName,Buffer>();
  for(let i=0;i<archiveMemberNames.length;i++){const name=archiveMemberNames[i],f=countryKeys(v.files[i],['name','bytes','sha256','base64']);same(f.name,name);const d=parseCountryDigest(refDigest(f as {bytes:number;sha256:string}),name==='candidate.json'?release.limits.package:contract.limits.record);
    if(typeof f.base64!=='string'||f.base64.length!==4*Math.ceil(d.bytes/3)||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(f.base64))throw new Error('country-archive-base64');const body=Buffer.from(f.base64,'base64');same(body.toString('base64'),f.base64);same(digestCountryBytes(body),d);files.set(name,body);
  }
  if(!encode(files).equals(bytes))throw new Error('country-archive-noncanonical-bundle');const authorization=validateMembers(files);return {digest:digestCountryBytes(bytes),releaseId:contract.releaseId,sourceManifestDigest:manifestDigest(),files,authorization};
}
export async function reserveArchiveOutput(repoRoot:string,outputDir:string):Promise<string>{
  const base=resolve(repoRoot,contract.backupRoot),target=resolve(repoRoot,outputDir),rel=relative(base,target);if(!rel||rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel)||!rel.split(sep).every(p=>/^[A-Za-z0-9_-]+$/.test(p)))throw new Error('country-archive-output-namespace');
  await assertSnapshotPath(repoRoot,dirname(base));await assertSnapshotPath(repoRoot,base,true);try{await mkdir(base);}catch(e){if((e as NodeJS.ErrnoException).code!=='EEXIST')throw e;}await assertSnapshotPath(repoRoot,base);if(!(await lstat(base)).isDirectory())throw new Error('country-archive-output-root');
  await assertSnapshotPath(repoRoot,dirname(target));await assertSnapshotPath(repoRoot,target,true);await mkdir(target);await assertSnapshotPath(repoRoot,target);return target;
}
export async function prepareCountryArchive(opts:{repoRoot:string;outputDir:string;operatorInstruction:string}){
  if(typeof opts.operatorInstruction!=='string'||opts.operatorInstruction.trim().length<40||Buffer.byteLength(opts.operatorInstruction)>8192)throw new Error('country-archive-owner-instruction');
  const source=await loadCountrySourceManifest(opts.repoRoot),selected=await readSelectedCountryRelease(opts.repoRoot),pointerBytes=await readCountryBoundedFile(opts.repoRoot,resolve(opts.repoRoot,release.stateRoot,'current.json'),contract.limits.pointer);same(digestCountryBytes(pointerBytes),contract.selectedPointerDigest);same(selected.pointer.releaseId,contract.releaseId);
  const files=new Map<ArchiveMemberName,Buffer>();files.set('local-pointer.json',pointerBytes);files.set('candidate.json',await readCountryBoundedFile(opts.repoRoot,resolve(opts.repoRoot,release.stateRoot,selected.pointer.package.path),release.limits.package));files.set('acceptance.json',await readCountryBoundedFile(opts.repoRoot,resolve(opts.repoRoot,release.stateRoot,selected.pointer.acceptance.path),contract.limits.record));
  files.set('selection-receipt.json',await readCountryBoundedFile(opts.repoRoot,resolve(opts.repoRoot,contract.selectionEvidenceRoot,'selection-receipt.json'),contract.limits.pointer));files.set('local-completion.json',await readCountryBoundedFile(opts.repoRoot,resolve(opts.repoRoot,contract.selectionEvidenceRoot,'completion.json'),contract.limits.record));
  const recordedAt=new Date().toISOString(),authorization:OperatorAuthorization={schemaVersion:1,scope:'private-country-archive-and-isolated-recovery',actor:'owner',recordedAt,instruction:opts.operatorInstruction,localPointerDigest:contract.selectedPointerDigest,sourceManifestDigest:source.digest,recovery:{scope:'local-selection-only',actor:'owner',approvedAt:recordedAt,candidateDigest:refDigest(selected.pointer.package),eligibilityReportDigest:digestCountryBytes(countryJsonBytes(selected.record.report)),baseline:{kind:'existing',pointerDigest:contract.selectedPointerDigest}}};
  files.set('operator-authorization.json',countryJsonBytes(authorization));const bytes=encode(files),decoded=decodeCountryArchive(bytes);same(digestCountryBytes(await readCountryBoundedFile(opts.repoRoot,resolve(opts.repoRoot,release.stateRoot,'current.json'),contract.limits.pointer)),contract.selectedPointerDigest);
  const output=await reserveArchiveOutput(opts.repoRoot,opts.outputDir),bundleFile=resolve(output,'bundle.json');await writeCountryExclusiveFile(opts.repoRoot,bundleFile,bytes);await writeCountryExclusiveFile(opts.repoRoot,resolve(output,'operator-authorization.json'),files.get('operator-authorization.json')!);
  const result={bundleFile,bundleDigest:decoded.digest,sourceManifestDigest:source.digest,localPointerDigest:contract.selectedPointerDigest};await writeCountryExclusiveFile(opts.repoRoot,resolve(output,'preparation.json'),countryJsonBytes(result));return result;
}
export async function restoreCountryArchive(opts:{repoRoot:string;bundleBytes:Buffer;outputDir:string}){
  const decoded=decodeCountryArchive(opts.bundleBytes),output=await reserveArchiveOutput(opts.repoRoot,opts.outputDir);
  for(const name of archiveMemberNames)await writeCountryExclusiveFile(opts.repoRoot,resolve(output,name),decoded.files.get(name)!);
  await mkdir(resolve(output,release.backupRoot),{recursive:true});await assertSnapshotPath(output,resolve(output,release.backupRoot));
  const recovered=resolve(output,release.backupRoot,'restored'),receipt=await recoverSelectedCountryRelease({repoRoot:output,candidateFile:resolve(output,'candidate.json'),recordFile:resolve(output,'acceptance.json'),selectionReceiptFile:resolve(output,'selection-receipt.json'),expectedPointer:pointerRecord(decoded.files.get('local-pointer.json')!),outputDir:recovered,recoveryAuthorization:decoded.authorization.recovery});
  const selected=await readSelectedCountryRelease(recovered),pointerBytes=await readCountryBoundedFile(recovered,resolve(recovered,release.stateRoot,'current.json'),contract.limits.pointer);same(digestCountryBytes(pointerBytes),contract.selectedPointerDigest);same(digestCountryBytes(countryJsonBytes(selected.projection)),release.projection);
  return {root:recovered,receipt,pointerDigest:digestCountryBytes(pointerBytes),projectionDigest:receipt.projectionDigest};
}
