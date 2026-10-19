import fs from 'node:fs/promises';
import {basename,dirname,isAbsolute,relative,resolve,sep} from 'node:path';
import {randomUUID} from 'node:crypto';
import {equal,identity,json,keys,object,parse} from './contract.server';
import {readMexicoBoundedFile} from './io.server';
import {acceptanceTime} from './acceptance.server';
import {mexicoAcceptanceContract as acceptance} from './acceptance-contract.server';
import {mexicoArchiveContract as archive} from '../mexico-country-archive/contract.server';
import {authenticateMexicoArchive,mexicoArchiveKey,parseMexicoAcceptedPointer,parseMexicoArchiveManifest,verifyMexicoPointer} from '../mexico-country-archive/bundle.server';
import {assertMexicoStateGrant,inspectMexicoStateDirectory,reserveMexicoStateChild,reserveMexicoStateDirectory,writeMexicoStateFile} from './acceptance-io.server';
import type {MexicoAcceptanceMaterial} from './acceptance-types';
import type {MexicoAcceptedPointer,MexicoAcceptedRecoveryReceipt,MexicoArchiveMaterial,MexicoInstallationOutcome} from '../mexico-country-archive/types';

export class MexicoAcceptedRecoveryReceiptError extends Error {readonly isolatedStateVerified=true;constructor(readonly receipt:MexicoAcceptedRecoveryReceipt,cause:unknown){super('mexico-accepted-recovery-receipt-failed',{cause});}}
async function readArchiveSnapshot(root:string,path:string){
 const observe=async()=>Promise.all(['candidate.json','evidence.json','manifest.json'].map(async name=>{const stat=await fs.lstat(resolve(path,name),{bigint:true});if(!stat.isFile()||stat.isSymbolicLink())throw Error('accepted-file-kind');return {name,dev:stat.dev,ino:stat.ino,size:stat.size,mtime:stat.mtimeNs,ctime:stat.ctimeNs};}));
 const grant=await inspectMexicoStateDirectory(root,path);const before=await observe();equal((await fs.readdir(path)).sort(),['candidate.json','evidence.json','manifest.json'],'accepted-file-set');
 const candidateBytes=await readMexicoBoundedFile(root,resolve(path,'candidate.json'),archive.limits.candidate),evidenceBytes=await readMexicoBoundedFile(root,resolve(path,'evidence.json'),archive.limits.evidence),manifestBytes=await readMexicoBoundedFile(root,resolve(path,'manifest.json'),archive.limits.manifest),manifest=parseMexicoArchiveManifest(manifestBytes);
 const material={candidateBytes,evidenceBytes,manifestBytes,descriptors:[...manifest.objects,{role:'manifest' as const,key:mexicoArchiveKey('manifest',identity(manifestBytes)),identity:identity(manifestBytes)}]};authenticateMexicoArchive(material);const assertUnchanged=async()=>{await assertMexicoStateGrant(grant);equal((await fs.readdir(path)).sort(),['candidate.json','evidence.json','manifest.json'],'accepted-file-set-after');equal(await observe(),before,'accepted-files-changed');};await assertUnchanged();return {material,assertUnchanged};
}
export async function readMexicoArchiveDirectory(root:string,path:string):Promise<MexicoArchiveMaterial>{return (await readArchiveSnapshot(root,path)).material;}
export async function readAcceptedMexicoAllGoodsRelease(repoRoot:string):Promise<{pointer:MexicoAcceptedPointer;material:MexicoAcceptanceMaterial}>{
 const root=resolve(repoRoot),country=resolve(root,'data/countries/2010'),processed=resolve(root,acceptance.stateRoot),countryGrant=await inspectMexicoStateDirectory(root,country),stateGrant=await inspectMexicoStateDirectory(root,processed);
 equal((await fs.readdir(country)).sort(),['processed'],'accepted-country-set');equal((await fs.readdir(processed)).sort(),['current.json','releases'],'accepted-state-set');
 const pointerBytes=await readMexicoBoundedFile(root,resolve(processed,'current.json'),archive.limits.pointer),pointer=parseMexicoAcceptedPointer(pointerBytes),releases=resolve(processed,'releases'),releasesGrant=await inspectMexicoStateDirectory(root,releases);
 equal((await fs.readdir(releases)).sort(),[acceptance.releaseId],'accepted-release-set');const snapshot=await readArchiveSnapshot(root,resolve(releases,acceptance.releaseId)),data=snapshot.material;verifyMexicoPointer(pointerBytes,data);const material=authenticateMexicoArchive(data);
 for(const grant of [countryGrant,stateGrant,releasesGrant])await assertMexicoStateGrant(grant);
 equal((await fs.readdir(country)).sort(),['processed'],'accepted-country-set-after');equal((await fs.readdir(processed)).sort(),['current.json','releases'],'accepted-state-set-after');equal((await fs.readdir(releases)).sort(),[acceptance.releaseId],'accepted-release-set-after');
 equal(await readMexicoBoundedFile(root,resolve(processed,'current.json'),archive.limits.pointer),pointerBytes,'accepted-pointer-after');await snapshot.assertUnchanged();return {pointer,material};
}
async function writeInitialState(root:string,material:MexicoArchiveMaterial,pointer:MexicoAcceptedPointer):Promise<{pointer:MexicoAcceptedPointer;material:MexicoAcceptanceMaterial}>{
 const country=await reserveMexicoStateDirectory(root,resolve(root,'data/countries/2010')),
 processed=await reserveMexicoStateChild(country,'processed'),
 releases=await reserveMexicoStateChild(processed,'releases'),
 release=await reserveMexicoStateChild(releases,acceptance.releaseId);
 for(const [name,bytes]of [['candidate.json',material.candidateBytes],['evidence.json',material.evidenceBytes],['manifest.json',material.manifestBytes]] as const)await writeMexicoStateFile(release,name,bytes);
 const restored=await readMexicoArchiveDirectory(root,release.path);verifyMexicoPointer(json(pointer),restored);await assertMexicoStateGrant(country);
 await writeMexicoStateFile(processed,'current.json',json(pointer));const after=await readAcceptedMexicoAllGoodsRelease(root);equal(after.pointer,pointer,'accepted-initial-readback');await assertMexicoStateGrant(country);return after;
}
export async function recoverMexicoAcceptedState(opts:{repoRoot:string;outputDir:string;material:MexicoArchiveMaterial;pointer:MexicoAcceptedPointer;verificationStage?:'prospective'|'selected'}):Promise<MexicoAcceptedRecoveryReceipt>{
 const pointer=verifyMexicoPointer(json(opts.pointer),opts.material),checked=authenticateMexicoArchive(opts.material),stage=opts.verificationStage??'prospective';if(!['prospective','selected'].includes(stage))throw Error('mexico-recovery-stage');
 const output=privateInputPath(resolve(opts.repoRoot),opts.outputDir);const out=await reserveMexicoStateDirectory(opts.repoRoot,output);await writeInitialState(out.path,opts.material,pointer);await assertMexicoStateGrant(out);
 const receipt:MexicoAcceptedRecoveryReceipt={schemaVersion:1,policyId:archive.policyId,countryCode:'2010',status:'recovered',verificationStage:stage,recoveryId:randomUUID(),recoveredAt:new Date().toISOString(),candidate:identity(checked.candidateBytes),projection:identity(json(checked.projection)),pointer:identity(json(pointer)),historicalPathReads:0,sourceRequests:0};
 try{await writeMexicoStateFile(out,'recovery-receipt.json',json(receipt));}catch(error){throw new MexicoAcceptedRecoveryReceiptError(receipt,error);}return receipt;
}

export class MexicoInstallationReceiptError extends Error {constructor(readonly outcome:MexicoInstallationOutcome,cause:unknown){super('mexico-installation-receipt-failed',{cause});}}
function privateInputPath(root:string,path:string):string {
 if(path.split(/[\\/]/).some(p=>p==='.'||p==='..'))throw Error('mexico-install-path-alias');
 const target=resolve(root,path),batch=resolve(root,archive.backupRoot,'private-acceptance-archive-20261018-r1'),rel=relative(batch,target);
 if(!rel||isAbsolute(rel)||rel==='..'||rel.startsWith('..'+sep))throw Error('mexico-install-private-path');return target;
}
export function validateMexicoInstallationVerification(bytes:Buffer,pointer:MexicoAcceptedPointer,material:MexicoArchiveMaterial):void {
 const packet=parse(bytes);keys(packet,['schemaVersion','initialization','selected','localReadback']);equal(packet.schemaVersion,1);equal(json(packet),bytes,'installation-verification-canonical');const ids=new Set<string>(),pointerIdentity=identity(json(pointer));
 for(const [field,mode]of [['initialization','initialize'],['selected','selected'],['localReadback','local-readback']] as const){
  const r=object(packet[field]);keys(r,['schemaVersion','policyId','countryCode','mode','status','archiveOutcome','currentStateVerified','pointer','pointerIdentity','recovery']);
  equal(r.schemaVersion,1);equal(r.policyId,archive.policyId);equal(r.countryCode,'2010');equal(r.mode,mode);equal(r.status,'verified');equal(r.currentStateVerified,true);
  if(!(mode==='initialize'?['initialized','confirmed-by-readback','already-selected']:['read-only-verified']).includes(String(r.archiveOutcome)))throw Error('mexico-install-unconfirmed-archive');
  equal(r.pointer,pointer,'installation-selected-pointer');equal(r.pointerIdentity,pointerIdentity,'installation-pointer-identity');
  const recovery=object(r.recovery);keys(recovery,['schemaVersion','policyId','countryCode','status','verificationStage','recoveryId','recoveredAt','candidate','projection','pointer','historicalPathReads','sourceRequests']);equal(recovery.schemaVersion,1);equal(recovery.policyId,archive.policyId);equal(recovery.countryCode,'2010');equal(recovery.status,'recovered');
  if(mode==='initialize'){if(!['prospective','selected'].includes(String(recovery.verificationStage)))throw Error('mexico-install-recovery-stage');}else equal(recovery.verificationStage,'selected');
  if(typeof recovery.recoveryId!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(recovery.recoveryId)||ids.has(recovery.recoveryId))throw Error('mexico-install-independent-recovery');ids.add(recovery.recoveryId);
  acceptanceTime(recovery.recoveredAt);equal(recovery.candidate,identity(material.candidateBytes));equal(recovery.projection,acceptance.projection);equal(recovery.pointer,pointerIdentity);equal(recovery.historicalPathReads,0);equal(recovery.sourceRequests,0);
 }
}
export async function installMexicoAcceptedState(opts:{repoRoot:string;archiveDir:string;pointerFile:string;verificationFile:string;outcomeFile:string}):Promise<MexicoInstallationOutcome>{
 keys(object(opts),['repoRoot','archiveDir','pointerFile','verificationFile','outcomeFile']);
 const root=resolve(opts.repoRoot),archiveDir=privateInputPath(root,opts.archiveDir),pointerFile=privateInputPath(root,opts.pointerFile),verificationFile=privateInputPath(root,opts.verificationFile),outcomeFile=privateInputPath(root,opts.outcomeFile),outParent=dirname(outcomeFile),rel=relative(archiveDir,outcomeFile);
 if(!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('..'+sep)||outcomeFile===pointerFile||outcomeFile===verificationFile||!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,95}$/.test(basename(outcomeFile)))throw Error('mexico-install-outcome-alias');
 const outcomeGrant=await inspectMexicoStateDirectory(root,outParent);try{await fs.lstat(outcomeFile);throw Error('mexico-install-outcome-occupied');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 const material=await readMexicoArchiveDirectory(root,archiveDir),pointerBytes=await readMexicoBoundedFile(root,pointerFile,archive.limits.pointer),pointer=verifyMexicoPointer(pointerBytes,material),verificationBytes=await readMexicoBoundedFile(root,verificationFile,256*1024);validateMexicoInstallationVerification(verificationBytes,pointer,material);await assertMexicoStateGrant(outcomeGrant);
 const make=(status:MexicoInstallationOutcome['status'],verified:boolean):MexicoInstallationOutcome=>({schemaVersion:1,countryCode:'2010',status,currentStateVerified:verified,pointer:identity(pointerBytes),candidate:identity(material.candidateBytes)});
 const persist=async(outcome:MexicoInstallationOutcome)=>{try{await writeMexicoStateFile(outcomeGrant,basename(outcomeFile),json(outcome));}catch(error){throw new MexicoInstallationReceiptError(outcome,error);}return outcome;};
 const country=resolve(root,'data/countries/2010');let exists=false;try{await fs.lstat(country);exists=true;}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 if(exists){let identical=false;try{const current=await readAcceptedMexicoAllGoodsRelease(root);identical=json(current.pointer).equals(pointerBytes)&&json(current.material.instrument).equals(json(authenticateMexicoArchive(material).instrument));}catch{/* Unknown occupied state is never overwritten. */}return persist(make(identical?'already-installed':'conflict',identical));}
 let outcome:MexicoInstallationOutcome;try{const after=await writeInitialState(root,material,pointer);equal(after.pointer,pointer,'installation-readback');outcome=make('installed',true);}catch{outcome=make('unconfirmed',false);}return persist(outcome);
}
