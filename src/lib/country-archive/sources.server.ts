import {createHash} from 'node:crypto';
import {lstat,open} from 'node:fs/promises';
import {resolve,posix} from 'node:path';
import {assertSnapshotPath,readSnapshotFile} from '../../../scripts/country-snapshot-input';
import {countryJson,countryJsonBytes,countryKeys,countrySame as same,countryInteger,countryHash,digestCountryBytes} from '../country-release/contract.server';
import {countryArchiveContract as contract} from './contract.server';
import type {SourceEntry,SourceManifest} from './types';
export function sourceObjectKey(id:string):string{if(!/^\d{4}$/.test(id)||Number(id)>=contract.expectedSources.files)throw new Error('country-archive-source-id');return `${contract.prefix}source-collections/${contract.manifestPin.sha256}/files/${id}`;}
export const sourceManifestKey=()=>`${contract.prefix}source-collections/${contract.manifestPin.sha256}/manifest.json`;
export function bundleObjectKey(hash:string):string{return `${contract.prefix}releases/${contract.releaseId}/${countryHash(hash)}.json`;}
export function assertCountryArchiveKey(key:string){if(key===contract.currentKey||key===sourceManifestKey())return;const start=`${contract.prefix}releases/${contract.releaseId}/`;if(key.startsWith(start)&&/^[a-f0-9]{64}\.json$/.test(key.slice(start.length)))return;
  const source=`${contract.prefix}source-collections/${contract.manifestPin.sha256}/files/`;if(key.startsWith(source)&&sourceObjectKey(key.slice(source.length))===key)return;throw new Error('country-archive-key');}
export function parseSourceEntry(value:unknown):SourceEntry{
  const v=countryKeys(value,['id','path','bytes','sha256','role']);
  if(typeof v.id!=='string'||!/^\d{4}$/.test(v.id))throw new Error('country-archive-source-id');
  if(typeof v.path!=='string'||!v.path||v.path!==posix.normalize(v.path)||/[:\\\u0000-\u001f]/.test(v.path)||v.path.startsWith('/')||v.path.split('/').some(p=>p==='.'||p==='..'||!p))throw new Error('country-archive-source-path');
  if(!['original','normalized','classification','capture'].includes(String(v.role)))throw new Error('country-archive-source-role');
  return {id:v.id,path:v.path,bytes:countryInteger(v.bytes,1,contract.limits.source),sha256:countryHash(v.sha256),role:v.role as SourceEntry['role']};
}
export function parseCountrySourceManifest(bytes:Buffer):SourceManifest{
  same(digestCountryBytes(bytes),{bytes:contract.manifestPin.bytes,sha256:contract.manifestPin.sha256});
  const parsed=countryJson(bytes,contract.limits.manifest);if(!countryJsonBytes(parsed).equals(bytes))throw new Error('country-archive-noncanonical-manifest');
  const v=countryKeys(parsed,['schemaVersion','policyId','countryCode','reporting','sourceBytes','files']);same(v.schemaVersion,1);same(v.policyId,contract.policyId);same(v.countryCode,'1220');same(v.reporting,{from:'2024-09',to:'2026-08'});
  if(!Array.isArray(v.files)||v.files.length<1||v.files.length>contract.limits.files||v.files.length!==contract.expectedSources.files)throw new Error('country-archive-source-count');
  const entries=v.files.map(parseSourceEntry),paths=new Set<string>();let total=0;
  entries.forEach((entry,i)=>{if(entry.id!==String(i).padStart(4,'0')||paths.has(entry.path))throw new Error('country-archive-duplicate-source');paths.add(entry.path);total+=entry.bytes;if(!Number.isSafeInteger(total)||total>contract.limits.total)throw new Error('country-archive-source-total');});
  same(countryInteger(v.sourceBytes,1,contract.limits.total),total);same(total,contract.expectedSources.bytes);
  return {schemaVersion:1,policyId:contract.policyId,countryCode:'1220',reporting:{from:'2024-09',to:'2026-08'},sourceBytes:total,files:entries};
}
export async function loadCountrySourceManifest(repoRoot:string){const bytes=await readSnapshotFile(repoRoot,contract.manifestPin);return {manifest:parseCountrySourceManifest(bytes),bytes,digest:digestCountryBytes(bytes)};}
export async function verifyLocalSource(repoRoot:string,entry:SourceEntry):Promise<void>{
  const source=parseSourceEntry(entry),path=resolve(repoRoot,source.path);await assertSnapshotPath(repoRoot,path);const handle=await open(path,'r');
  try{const before=await handle.stat();if(!before.isFile()||before.size!==source.bytes)throw new Error('country-archive-source-length');const hash=createHash('sha256'),chunk=Buffer.alloc(contract.limits.chunk);let total=0;
    for(;;){const {bytesRead}=await handle.read(chunk,0,chunk.length,null);if(!bytesRead)break;total+=bytesRead;if(total>source.bytes)throw new Error('country-archive-source-length');hash.update(chunk.subarray(0,bytesRead));}
    const after=await handle.stat();await assertSnapshotPath(repoRoot,path);const linked=await lstat(path);
    if(before.dev!==linked.dev||before.ino!==linked.ino||before.size!==after.size||before.mtimeMs!==after.mtimeMs||before.ctimeMs!==after.ctimeMs||linked.size!==after.size||linked.mtimeMs!==after.mtimeMs||linked.ctimeMs!==after.ctimeMs)throw new Error('country-archive-source-changed');
    same(total,source.bytes);same(hash.digest('hex'),source.sha256);
  }finally{await handle.close();}
}
