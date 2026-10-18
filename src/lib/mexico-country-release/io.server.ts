import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {dirname,relative,resolve} from 'node:path';
import {assertSnapshotPath} from '../../../scripts/country-snapshot-input';
import {equal,mexicoContract} from './contract.server';

export interface MexicoOutputReservation {
 readonly root:string;readonly path:string;
 readonly dev:bigint;readonly ino:bigint;
 readonly parentDev:bigint;readonly parentIno:bigint;
}
export class MexicoOutputPublicationError extends Error {
 readonly publicationState='may-be-visible';
 constructor(readonly path:string,cause:unknown){super('mexico-publication-cleanup-unverified',{cause});}
}
export function mexicoOutputPath(root:string,path:string):string{
 if(path.split(/[\\/]/).some(p=>p==='..'||p==='.'))throw Error('mexico-path-alias');
 const target=resolve(root,path),rel=relative(resolve(root),target).replaceAll('\\','/');
 if(!rel.startsWith(mexicoContract.namespace))throw Error('mexico-output-namespace');
 return target;
}
export async function checkMexicoFreshOutput(root:string,path:string):Promise<string>{
 const target=mexicoOutputPath(root,path),parent=dirname(target);
 await assertSnapshotPath(root,parent);
 if(!(await fs.lstat(parent)).isDirectory())throw Error('mexico-output-parent');
 await assertSnapshotPath(root,target,true);
 try{await fs.lstat(target);throw Error('mexico-output-occupied');}
 catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 const disk=await fs.statfs(parent);
 if(disk.bavail*disk.bsize<512*1024*1024)throw Error('mexico-disk-guard');
 return target;
}
export async function reserveMexicoOutput(root:string,path:string):Promise<MexicoOutputReservation>{
 const target=await checkMexicoFreshOutput(root,path);
 const parent=await fs.lstat(dirname(target),{bigint:true});
 await fs.mkdir(target);
 await assertSnapshotPath(root,target);
 const own=await fs.lstat(target,{bigint:true});
 const reservation=Object.freeze({root:resolve(root),path:target,dev:own.dev,ino:own.ino,parentDev:parent.dev,parentIno:parent.ino});
 await assertMexicoReservation(root,reservation);
 return reservation;
}
export async function assertMexicoReservation(root:string,reservation:MexicoOutputReservation):Promise<void>{
 if(!reservation||reservation.root!==resolve(root)||mexicoOutputPath(root,reservation.path)!==reservation.path)throw Error('mexico-output-grant');
 await assertSnapshotPath(root,reservation.path);
 const own=await fs.lstat(reservation.path,{bigint:true}),parent=await fs.lstat(dirname(reservation.path),{bigint:true});
 if(!own.isDirectory()||own.dev!==reservation.dev||own.ino!==reservation.ino||parent.dev!==reservation.parentDev||parent.ino!==reservation.parentIno)throw Error('mexico-output-directory-changed');
}
export async function readMexicoBoundedFile(root:string,path:string,limit:number):Promise<Buffer>{
 const target=resolve(root,path);await assertSnapshotPath(root,target);
 const h=await fs.open(target,'r');
 try{
  const before=await h.stat({bigint:true});
  if(!before.isFile()||before.size<1n||before.size>BigInt(limit))throw Error('mexico-read-limit');
  const bytes=Buffer.alloc(Number(before.size)+1);let length=0;
  while(length<bytes.length){const r=await h.read(bytes,length,bytes.length-length,null);if(!r.bytesRead)break;length+=r.bytesRead;}
  const after=await h.stat({bigint:true});await assertSnapshotPath(root,target);
  const linked=await fs.lstat(target,{bigint:true});
  if(before.dev!==linked.dev||before.ino!==linked.ino||before.size!==after.size||before.mtimeMs!==after.mtimeMs||before.ctimeMs!==after.ctimeMs||BigInt(length)!==before.size)throw Error('mexico-read-race');
  return Buffer.from(bytes.subarray(0,length));
 }finally{await h.close();}
}
export async function verifyMexicoOutputFiles(root:string,reservation:MexicoOutputReservation,expected:Readonly<Record<string,Buffer>>):Promise<void>{
 await assertMexicoReservation(root,reservation);
 equal((await fs.readdir(reservation.path)).sort(),Object.keys(expected).sort(),'complete-output-set');
 for(const [name,bytes]of Object.entries(expected)){
  if(name.includes('/')||name.includes('\\')||name==='.'||name==='..')throw Error('mexico-output-name');
  equal(await readMexicoBoundedFile(root,resolve(reservation.path,name),Math.max(1,bytes.length)),bytes,'complete-output-bytes');
 }
 await assertMexicoReservation(root,reservation);
}
export async function writeMexicoExclusiveFile(root:string,path:string,bytes:Buffer,reservation:MexicoOutputReservation):Promise<void>{
 if(bytes.length>mexicoContract.limits.serialized)throw Error('mexico-write-limit');
 const target=resolve(root,path);
 await assertMexicoReservation(root,reservation);
 if(dirname(target)!==reservation.path)throw Error('mexico-output-grant');
 const disk=await fs.statfs(reservation.path);
 if(disk.bavail*disk.bsize-bytes.length<512*1024*1024)throw Error('mexico-disk-guard');
 await assertSnapshotPath(root,target,true);
 const stage=resolve(reservation.path,'.'+target.slice(dirname(target).length+1)+'.'+randomUUID()+'.partial');
 const h=await fs.open(stage,'wx');let own:{dev:bigint;ino:bigint};
 try{await h.writeFile(bytes);await h.sync();own=await h.stat({bigint:true});}
 finally{await h.close();}
 // Publish only after sync, close, readback and reservation checks pass.
 equal(await readMexicoBoundedFile(root,stage,Math.max(1,bytes.length)),bytes,'staged-readback');
 await assertMexicoReservation(root,reservation);
 const staged=await fs.lstat(stage,{bigint:true});
 if(staged.dev!==own.dev||staged.ino!==own.ino)throw Error('mexico-staged-file-changed');
 let published=false;
 try{
  // A hard link publishes atomically and refuses to overwrite an existing file.
  await fs.link(stage,target);published=true;
  await assertMexicoReservation(root,reservation);
  const linked=await fs.lstat(target,{bigint:true});
  if(linked.dev!==own.dev||linked.ino!==own.ino)throw Error('mexico-publication-changed');
  await fs.unlink(stage);
 }catch(error){
  if(published){
   try{
    await assertMexicoReservation(root,reservation);
    const linked=await fs.lstat(target,{bigint:true});
    if(linked.dev!==own.dev||linked.ino!==own.ino)throw Error('mexico-publication-changed');
    await fs.unlink(target);
   }catch(cleanup){throw new MexicoOutputPublicationError(target,new AggregateError([error,cleanup]));}
  }
  throw error;
 }
}
