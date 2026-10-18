import fs from 'node:fs/promises';
import {dirname,relative,resolve} from 'node:path';
import {assertSnapshotPath} from '../../../scripts/country-snapshot-input';
import {equal,mexicoContract} from './contract.server';
export function mexicoOutputPath(root:string,path:string):string{
 if(path.split(/[\\/]/).some(p=>p==='..'||p==='.'))throw Error('mexico-path-alias');const target=resolve(root,path),rel=relative(resolve(root),target).replaceAll('\\','/');if(!rel.startsWith(mexicoContract.namespace)||rel===mexicoContract.namespace.slice(0,-1))throw Error('mexico-output-namespace');return target;
}
export async function checkMexicoFreshOutput(root:string,path:string):Promise<string>{
 const target=mexicoOutputPath(root,path),parent=dirname(target);await assertSnapshotPath(root,parent);if(!(await fs.lstat(parent)).isDirectory())throw Error('mexico-output-parent');await assertSnapshotPath(root,target,true);
 try{await fs.lstat(target);throw Error('mexico-output-occupied');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}const disk=await fs.statfs(parent);if(disk.bavail*disk.bsize<512*1024*1024)throw Error('mexico-disk-guard');return target;
}
export async function reserveMexicoOutput(root:string,path:string):Promise<string>{const target=await checkMexicoFreshOutput(root,path);await fs.mkdir(target);await assertSnapshotPath(root,target);return target;}
export async function readMexicoBoundedFile(root:string,path:string,limit:number):Promise<Buffer>{
 const target=resolve(root,path);await assertSnapshotPath(root,target);const h=await fs.open(target,'r');try{const before=await h.stat({bigint:true});if(!before.isFile()||before.size<1n||before.size>BigInt(limit))throw Error('mexico-read-limit');const bytes=Buffer.alloc(Number(before.size)+1);let length=0;while(length<bytes.length){const r=await h.read(bytes,length,bytes.length-length,null);if(!r.bytesRead)break;length+=r.bytesRead;}const after=await h.stat({bigint:true});await assertSnapshotPath(root,target);const linked=await fs.lstat(target,{bigint:true});if(before.dev!==linked.dev||before.ino!==linked.ino||before.size!==after.size||before.mtimeMs!==after.mtimeMs||before.ctimeMs!==after.ctimeMs||BigInt(length)!==before.size)throw Error('mexico-read-race');return Buffer.from(bytes.subarray(0,length));}finally{await h.close();}
}
export async function writeMexicoExclusiveFile(root:string,path:string,bytes:Buffer):Promise<void>{
 if(bytes.length>mexicoContract.limits.serialized)throw Error('mexico-write-limit');const target=resolve(root,path);mexicoOutputPath(root,target);await assertSnapshotPath(root,dirname(target));await assertSnapshotPath(root,target,true);const h=await fs.open(target,'wx');try{await h.writeFile(bytes);await h.sync();const own=await h.stat({bigint:true});await assertSnapshotPath(root,target);const linked=await fs.lstat(target,{bigint:true});if(own.ino!==linked.ino||own.dev!==linked.dev)throw Error('mexico-write-race');}finally{await h.close();}equal(await readMexicoBoundedFile(root,target,Math.max(1,bytes.length)),bytes,'write-readback');
}
