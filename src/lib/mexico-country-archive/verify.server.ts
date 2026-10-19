import fs from 'node:fs/promises';
import {relative,resolve,sep} from 'node:path';
import {assertSnapshotPath} from '../../../scripts/country-snapshot-input';
import {acceptanceDigest} from '../mexico-country-release/acceptance.server';
import {equal,identity,json,keys,object} from '../mexico-country-release/contract.server';
import {assertMexicoStateGrant,reserveMexicoStateDirectory,writeMexicoStateFile} from '../mexico-country-release/acceptance-io.server';
import {recoverMexicoAcceptedState} from '../mexico-country-release/acceptance-state.server';
import {mexicoArchiveContract as contract} from './contract.server';
import {authenticateMexicoArchive,mexicoArchiveKey,parseMexicoAcceptedPointer,parseMexicoArchiveManifest,proposeMexicoAcceptedPointer,verifyMexicoPointer} from './bundle.server';
import type {MexicoIdentity} from '../mexico-country-release/types';
import type {MexicoAcceptedPointer,MexicoArchiveMaterial,MexicoArchiveReceipt,MexicoArchiveStore,MexicoVerifyOptions} from './types';

export class MexicoArchiveReceiptError extends Error {constructor(readonly receipt:MexicoArchiveReceipt,cause:unknown){super('mexico-archive-receipt-persistence-failed',{cause});}}
export function mexicoArchiveOutputPath(root:string,path:string):string {
 if(path.split(/[\\/]/).some(x=>x==='.'||x==='..'))throw Error('mexico-archive-output-alias');const out=resolve(root,path),batch=resolve(root,contract.backupRoot,'private-acceptance-archive-20261018-r1'),rel=relative(batch,out).split(sep).join('/');if(!/^[A-Za-z0-9_-]{1,96}$/.test(rel))throw Error('mexico-archive-output');return out;
}
async function fullObject(store:MexicoArchiveStore,key:string,digest:MexicoIdentity):Promise<Buffer>{const value=await store.get(key,digest.bytes);if(!value)throw Error('mexico-archive-object-missing');equal(identity(value.bytes),digest,'archive-full-body');return Buffer.from(value.bytes);}
async function remoteMaterial(store:MexicoArchiveStore,digest:MexicoIdentity):Promise<MexicoArchiveMaterial>{
 const manifestBytes=await fullObject(store,mexicoArchiveKey('manifest',digest),digest),manifest=parseMexicoArchiveManifest(manifestBytes),candidateBytes=await fullObject(store,manifest.objects[0].key,manifest.objects[0].identity),evidenceBytes=await fullObject(store,manifest.objects[1].key,manifest.objects[1].identity),material={candidateBytes,evidenceBytes,manifestBytes,descriptors:[...manifest.objects,{role:'manifest' as const,key:mexicoArchiveKey('manifest',digest),identity:{...digest}}]};authenticateMexicoArchive(material);return material;
}
export async function verifyMexicoArchive(opts:MexicoVerifyOptions):Promise<MexicoArchiveReceipt>{
 keys(object(opts),['store','repoRoot','outputDir','mode',...(opts.mode==='initialize'?['expectedManifest']:[])]);if(!['initialize','selected'].includes(opts.mode))throw Error('mexico-archive-verification-mode');
 const root=resolve(opts.repoRoot),output=mexicoArchiveOutputPath(root,opts.outputDir);await assertSnapshotPath(root,output,true);try{await fs.lstat(output);throw Error('mexico-archive-output-occupied');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 const expected=opts.mode==='initialize'?acceptanceDigest(opts.expectedManifest,contract.limits.manifest):null;
 const before=await opts.store.get(contract.currentKey,contract.limits.pointer),selected=before?parseMexicoAcceptedPointer(before.bytes):null;
 if(opts.mode==='selected'&&!selected)throw Error('mexico-archive-selection-missing');if(selected&&expected)equal(selected.manifest.identity,expected,'archive-existing-selection-conflict');
 const material=await remoteMaterial(opts.store,expected??selected!.manifest.identity),pointer=selected?verifyMexicoPointer(before!.bytes,material):proposeMexicoAcceptedPointer(material,new Date().toISOString()),pointerBytes=json(pointer),pointerIdentity=identity(pointerBytes);
 const out=await reserveMexicoStateDirectory(root,output);await writeMexicoStateFile(out,opts.mode==='initialize'?'proposed-pointer.json':'selected-pointer.json',pointerBytes);
 const recovery=await recoverMexicoAcceptedState({repoRoot:root,outputDir:resolve(output,'isolated'),material,pointer,verificationStage:selected?'selected':'prospective'});await assertMexicoStateGrant(out);
 let acknowledged=false;
 if(!selected){try{await opts.store.put(contract.currentKey,pointerBytes,{ifNoneMatch:'*'});acknowledged=true;}catch{/* A single authenticated readback resolves even an unknown acknowledgement. */}}
 let outcome:MexicoArchiveReceipt['archiveOutcome']='unconfirmed',status:MexicoArchiveReceipt['status']='unconfirmed',currentStateVerified=false;
 try{
  const after=await opts.store.get(contract.currentKey,contract.limits.pointer);
  if(after&&after.bytes.equals(pointerBytes)){verifyMexicoPointer(after.bytes,material);currentStateVerified=true;status='verified';outcome=opts.mode==='selected'?'read-only-verified':selected?'already-selected':acknowledged?'initialized':'confirmed-by-readback';}
  else if(after){status='conflict';outcome='conflict';}
 }catch{/* Preserve the prospective identity while refusing a verified-current-state claim. */}
 const receipt:MexicoArchiveReceipt={schemaVersion:1,policyId:contract.policyId,countryCode:'2010',mode:opts.mode,status,archiveOutcome:outcome,currentStateVerified,pointer,pointerIdentity,recovery};
 try{await writeMexicoStateFile(out,'verification.json',json(receipt));}catch(error){throw new MexicoArchiveReceiptError(receipt,error);}return receipt;
}
