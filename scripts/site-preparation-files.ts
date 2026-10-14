import {lstat,open,mkdir} from 'node:fs/promises';
import {resolve,relative,isAbsolute,parse,sep,dirname} from 'node:path';
import {digestCountryBytes} from '../src/lib/country-release/contract.server';
export type FileIdentity={path:string;bytes:number;sha256:string};
export function localName(value:string):string{
 if(typeof value!=='string'||!value||/[\\:?#%*<>"|\x00-\x1f\x7f]/.test(value)||value.split('/').some(p=>!p||p==='.'||p==='..'||/[ .]$/.test(p)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p)))throw Error('site-invalid-path');return value;
}
export async function assertLocalPath(root:string,target:string,missing=false):Promise<void>{
 if(target.split(/[\\/]/).includes('..'))throw Error('site-path-traversal');
 const base=resolve(root),path=resolve(target),rel=relative(base,path);if(rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel))throw Error('site-outside-scope');
 let cursor=parse(path).root;for(const part of path.slice(cursor.length).split(sep).filter(Boolean)){
  cursor=resolve(cursor,part);try{const s=await lstat(cursor);if(s.isSymbolicLink())throw Error('site-reparse-path');}
  catch(error){if(missing&&cursor===path&&(error as NodeJS.ErrnoException).code==='ENOENT')continue;throw error;}
 }
}
const identity=(v:{dev:number|bigint;ino:number|bigint;size:number|bigint;mtimeMs:number|bigint;ctimeMs:number|bigint})=>[v.dev,v.ino,v.size,v.mtimeMs,v.ctimeMs].join('|');
export async function readSiteFile(root:string,path:string,maxBytes=16*1024*1024,expected?:{bytes:number;sha256:string}):Promise<Buffer>{
 await assertLocalPath(root,path);const before=await lstat(path);if(!before.isFile()||before.nlink!==1||before.size>maxBytes||expected&&before.size!==expected.bytes)throw Error('site-file-type-length');
 const handle=await open(path,'r');let body:Buffer;
 try{
  const opened=await handle.stat();await assertLocalPath(root,path);if(opened.dev!==before.dev||opened.ino!==before.ino)throw Error('site-file-changed-before-read');
  const buffer=Buffer.alloc(before.size+1);let count=0;while(count<buffer.length){const r=await handle.read(buffer,count,buffer.length-count,null);if(!r.bytesRead)break;count+=r.bytesRead;}
  const after=await handle.stat(),current=await lstat(path);await assertLocalPath(root,path);
  if(identity(opened)!==identity(after)||identity(before)!==identity(current)||count!==before.size)throw Error('site-file-changed-during-read');body=buffer.subarray(0,count);
 }finally{await handle.close();}
 if(expected){const digest=digestCountryBytes(body);if(digest.bytes!==expected.bytes||digest.sha256!==expected.sha256)throw Error('site-file-digest');}return body;
}
export async function siteDirectories(root:string,path:string):Promise<void>{
 const rel=relative(resolve(root),resolve(path));await assertLocalPath(root,root);let cursor=resolve(root);
 for(const part of rel.split(sep).filter(Boolean)){cursor=resolve(cursor,part);await assertLocalPath(root,cursor,true);try{await mkdir(cursor);}catch(error){if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error;}await assertLocalPath(root,cursor);if(!(await lstat(cursor)).isDirectory())throw Error('site-parent-not-directory');}
}
export async function writeSiteFile(root:string,path:string,body:Buffer):Promise<void>{
 await siteDirectories(root,dirname(path));await assertLocalPath(root,path,true);const handle=await open(path,'wx');try{await handle.writeFile(body);}finally{await handle.close();}
 await readSiteFile(root,path,Math.max(body.length,1),digestCountryBytes(body));
}

