import fs from 'node:fs/promises';
import {dirname,isAbsolute,relative,resolve,sep,parse as parsePath} from 'node:path';
import {randomUUID} from 'node:crypto';
import {assertSnapshotPath} from '../../../scripts/country-snapshot-input';
import {readMexicoBoundedFile} from './io.server';
import {equal,identity} from './contract.server';
import type {MexicoIdentity} from './types';
const scopes=['data/countries/2010','data/backups/mexico-country-release/private-acceptance-archive-20261018-r1','.tmp/mexico-private-archive-20261018-r1'];
interface DirectoryIdentity {readonly path:string;readonly dev:bigint;readonly ino:bigint}
export interface MexicoStateGrant {readonly root:string;readonly path:string;readonly ancestors:readonly DirectoryIdentity[]}
const grants=new WeakSet<object>();
export class MexicoStatePublicationError extends Error {readonly publicationState='may-be-visible';constructor(readonly target:string,readonly identity:MexicoIdentity,cause:unknown){super('mexico-state-publication-unconfirmed',{cause});}}
function scoped(root:string,path:string,parent=false):string{
 if(path.split(/[\\/]/).some(p=>p==='.'||p==='..'))throw Error('mexico-state-path-alias');
 const target=resolve(root,path),rel=relative(resolve(root),target).split(sep).join('/');
 if(isAbsolute(rel)||rel==='..'||rel.startsWith('../')||!scopes.some(s=>rel===s||rel.startsWith(s+'/')||parent&&(rel===''||s.startsWith(rel+'/'))))throw Error('mexico-state-output-scope');return target;
}
async function freeSpace(parent:string,additional=0){const disk=await fs.statfs(parent);if(disk.bavail*disk.bsize-additional<512*1024*1024)throw Error('mexico-state-disk-guard');}
export async function ensureMexicoStateParents(root:string,path:string):Promise<void>{
 const target=scoped(root,path,true);await assertSnapshotPath(root,root);let cursor=resolve(root);
 for(const piece of relative(cursor,target).split(sep).filter(Boolean)){
  cursor=resolve(cursor,piece);await assertSnapshotPath(root,cursor,true);
  try{await fs.mkdir(cursor);}catch(e){if((e as NodeJS.ErrnoException).code!=='EEXIST')throw e;}
  await assertSnapshotPath(root,cursor);if(!(await fs.lstat(cursor)).isDirectory())throw Error('mexico-state-parent');
 }
}
export async function inspectMexicoStateDirectory(root:string,path:string):Promise<MexicoStateGrant>{
 const target=scoped(root,path);await assertSnapshotPath(root,target);let cursor=parsePath(target).root;const ancestors:DirectoryIdentity[]=[];
 for(const piece of ['',...target.slice(cursor.length).split(sep).filter(Boolean)]){
  if(piece)cursor=resolve(cursor,piece);const stat=await fs.lstat(cursor,{bigint:true});if(!stat.isDirectory()||stat.isSymbolicLink())throw Error('mexico-state-directory');ancestors.push(Object.freeze({path:cursor,dev:stat.dev,ino:stat.ino}));
 }
 const grant=Object.freeze({root:resolve(root),path:target,ancestors:Object.freeze(ancestors)});grants.add(grant);await assertMexicoStateGrant(grant);return grant;
}
export async function reserveMexicoStateDirectory(root:string,path:string):Promise<MexicoStateGrant>{
 const target=scoped(root,path);await ensureMexicoStateParents(root,dirname(target));await freeSpace(dirname(target));await assertSnapshotPath(root,target,true);await fs.mkdir(target);return inspectMexicoStateDirectory(root,target);
}
export async function assertMexicoStateGrant(grant:MexicoStateGrant):Promise<void>{
 if(!grant||!grants.has(grant)||scoped(grant.root,grant.path)!==grant.path)throw Error('mexico-state-grant');await assertSnapshotPath(grant.root,grant.path);
 for(const expected of grant.ancestors){const current=await fs.lstat(expected.path,{bigint:true});if(!current.isDirectory()||current.dev!==expected.dev||current.ino!==expected.ino)throw Error('mexico-state-ancestor-changed');}
}
export async function writeMexicoStateFile(grant:MexicoStateGrant,name:string,bytes:Buffer):Promise<void>{
 await assertMexicoStateGrant(grant);if(!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,95}$/.test(name)||!Buffer.isBuffer(bytes)||bytes.length<1||bytes.length>24*1024*1024)throw Error('mexico-state-file');
 await freeSpace(grant.path,bytes.length);const target=resolve(grant.path,name),stage=resolve(grant.path,'.'+name+'.'+randomUUID()+'.partial');await assertSnapshotPath(grant.root,target,true);
 const handle=await fs.open(stage,'wx');let owned:{dev:bigint;ino:bigint}|undefined;
 try{await handle.writeFile(bytes);await handle.sync();const info=await handle.stat({bigint:true});owned={dev:info.dev,ino:info.ino};}finally{await handle.close();}
 if(!owned)throw Error('mexico-state-stage');equal(await readMexicoBoundedFile(grant.root,stage,bytes.length),bytes,'state-stage-readback');await assertMexicoStateGrant(grant);
 const checked=await fs.lstat(stage,{bigint:true});if(checked.dev!==owned.dev||checked.ino!==owned.ino)throw Error('mexico-state-stage-changed');
 let published=false;
 try{
  await fs.link(stage,target);published=true;await assertMexicoStateGrant(grant);
  const linked=await fs.lstat(target,{bigint:true});if(linked.dev!==owned.dev||linked.ino!==owned.ino)throw Error('mexico-state-file-changed');
  equal(await readMexicoBoundedFile(grant.root,target,bytes.length),bytes,'state-file-readback');await fs.unlink(stage);await assertMexicoStateGrant(grant);
 }catch(error){if(published)throw new MexicoStatePublicationError(target,identity(bytes),error);throw error;}
}

/** Retain the original parent's identity when extending an owned state tree. */
export async function reserveMexicoStateChild(parent:MexicoStateGrant,name:string):Promise<MexicoStateGrant>{
 if(!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,95}$/.test(name))throw Error('mexico-state-child');const target=scoped(parent.root,resolve(parent.path,name));await assertMexicoStateGrant(parent);await freeSpace(parent.path);await assertMexicoStateGrant(parent);
 // Parent ownership is already established: do not recreate or recapture its ancestors.
 await fs.mkdir(target);await assertMexicoStateGrant(parent);const stat=await fs.lstat(target,{bigint:true});if(!stat.isDirectory()||stat.isSymbolicLink())throw Error('mexico-state-directory');
 const grant=Object.freeze({root:parent.root,path:target,ancestors:Object.freeze([...parent.ancestors,Object.freeze({path:target,dev:stat.dev,ino:stat.ino})])});grants.add(grant);await assertMexicoStateGrant(grant);return grant;
}
