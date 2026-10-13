import {open,lstat} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {Readable} from 'node:stream';
import {assertSnapshotPath} from '../../../scripts/country-snapshot-input';
import {readCountryBoundedFile,writeCountryExclusiveFile} from '../country-release/prepare.server';
import type {Digest} from '../country-release/types';
import {countryKeys,countryJson,countryJsonBytes,countrySame as same,countryTimestamp,parseCountryDigest,digestCountryBytes} from '../country-release/contract.server';
import {countryArchiveContract as contract} from './contract.server';
import {loadCountrySourceManifest,verifyLocalSource} from './sources.server';
import {uploadDescriptors,uploadHeaders} from './transport.server';
import {reserveArchiveOutput} from './bundle.server';
import type {SourceManifest,Capabilities,UploadCapability,UploadReceipt} from './types';
export function parseCountryUploadCapabilities(bytes:Buffer,manifest:SourceManifest,now:Date):Capabilities{
  const parsed=countryJson(bytes,contract.limits.capabilities);if(!countryJsonBytes(parsed).equals(bytes))throw new Error('country-archive-capabilities-canonical');const v=countryKeys(parsed,['schemaVersion','policyId','accountId','bucketName','issuedAt','expiresAt','sourceManifestDigest','bundleDigest','objects']);same(v.schemaVersion,1);same(v.policyId,contract.policyId);
  if(typeof v.accountId!=='string'||!/^[a-f0-9]{32}$/.test(v.accountId)||typeof v.bucketName!=='string'||!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(v.bucketName))throw new Error('country-archive-capability-target');
  const issuedAt=countryTimestamp(v.issuedAt),expiresAt=countryTimestamp(v.expiresAt);if(Date.parse(expiresAt)-Date.parse(issuedAt)!==contract.limits.lifetimeSeconds*1000||now.getTime()<Date.parse(issuedAt)-60_000||now.getTime()>=Date.parse(expiresAt))throw new Error('country-archive-capability-expired');
  same(v.sourceManifestDigest,{bytes:contract.manifestPin.bytes,sha256:contract.manifestPin.sha256});const bundleDigest=parseCountryDigest(v.bundleDigest,contract.limits.bundle);
  if(!Array.isArray(v.objects)||v.objects.length!==manifest.files.length+2)throw new Error('country-archive-capability-count');const last=v.objects[v.objects.length-1] as Record<string,unknown>,descriptors=uploadDescriptors(manifest,bundleDigest,last.path as string);
  const objects=v.objects.map((value,i)=>{const o=countryKeys(value,['id','path','bytes','sha256','role','key','url','headers']),expected=descriptors[i];for(const key of ['id','path','bytes','sha256','role','key'] as const)same(o[key],expected[key]);same(o.headers,uploadHeaders(expected));if(typeof o.url!=='string')throw new Error('country-archive-capability-url');
    let url:URL;try{url=new URL(o.url);}catch{throw new Error('country-archive-capability-url');}if(url.protocol!=='https:'||url.username||url.password||url.port||url.hash||url.hostname!==v.accountId+'.r2.cloudflarestorage.com'||url.pathname!=='/'+v.bucketName+'/'+expected.key)throw new Error('country-archive-capability-target');
    const query=url.searchParams,seen=new Set<string>();for(const [key]of query){if(seen.has(key))throw new Error('country-archive-capability-query');seen.add(key);}
    same(query.get('X-Amz-Algorithm'),'AWS4-HMAC-SHA256');same(query.get('X-Amz-Expires'),String(contract.limits.lifetimeSeconds));same(query.get('X-Amz-Date'),issuedAt.replaceAll('-','').replaceAll(':','').replace(/\.\d{3}Z$/,'Z'));same(query.get('x-id'),'PutObject');
    if(!/^[a-f0-9]{64}$/.test(query.get('X-Amz-Signature')??'')||!new RegExp('^[a-f0-9]{32}/'+query.get('X-Amz-Date')!.slice(0,8)+'/auto/s3/aws4_request$').test(query.get('X-Amz-Credential')??''))throw new Error('country-archive-capability-signature');
    const signed=query.get('X-Amz-SignedHeaders')?.split(';')??[];for(const h of ['host','if-none-match','content-length','content-type','x-amz-meta-sha256'])if(!signed.includes(h))throw new Error('country-archive-capability-signed-headers');
    return o as unknown as UploadCapability;
  });return {schemaVersion:1,policyId:contract.policyId,accountId:v.accountId,bucketName:v.bucketName,issuedAt,expiresAt,sourceManifestDigest:{bytes:contract.manifestPin.bytes,sha256:contract.manifestPin.sha256},bundleDigest,objects};
}
async function uploadOne(repoRoot:string,o:UploadCapability,deadlineAt:number):Promise<'uploaded'|'existing'|'failed'>{
  let handle:Awaited<ReturnType<typeof open>>|undefined,source:Readable|undefined,body:Readable|undefined,timer:ReturnType<typeof setTimeout>|undefined;const controller=new AbortController();
  try{await verifyLocalSource(repoRoot,{id:/^\d{4}$/.test(o.id)?o.id:'0000',path:o.path,bytes:o.bytes,sha256:o.sha256,role:o.role});if(Date.now()>=deadlineAt)throw new Error('country-archive-upload-deadline');const path=resolve(repoRoot,o.path);await assertSnapshotPath(repoRoot,path);handle=await open(path,'r');const before=await handle.stat();if(!before.isFile()||before.size!==o.bytes)throw new Error('country-archive-upload-file');source=handle.createReadStream({autoClose:false,highWaterMark:contract.limits.chunk});
    const hash=createHash('sha256');let total=0;body=Readable.from((async function*(){for await(const part of source!){const chunk=Buffer.from(part);total+=chunk.length;if(total>o.bytes)throw new Error('country-archive-upload-length');hash.update(chunk);yield chunk;}})());
    timer=setTimeout(()=>{controller.abort();body?.destroy();source?.destroy();},Math.max(1,Math.min(contract.limits.objectMs,deadlineAt-Date.now())));
    const response=await fetch(o.url,{method:'PUT',headers:o.headers,body:body as unknown as BodyInit,duplex:'half',redirect:'error',signal:controller.signal} as RequestInit);await response.body?.cancel();
    if(response.status===412)return 'existing';if(!response.ok)throw new Error('country-archive-upload-status');const after=await handle.stat();await assertSnapshotPath(repoRoot,path);const linked=await lstat(path);
    if(before.dev!==linked.dev||before.ino!==linked.ino||before.size!==after.size||before.mtimeMs!==after.mtimeMs||before.ctimeMs!==after.ctimeMs||after.size!==linked.size||after.mtimeMs!==linked.mtimeMs||after.ctimeMs!==linked.ctimeMs)throw new Error('country-archive-upload-changed');same(total,o.bytes);same(hash.digest('hex'),o.sha256);return 'uploaded';
  }catch{return 'failed';}finally{if(timer)clearTimeout(timer);body?.destroy();source?.destroy();await handle?.close().catch(()=>{});}
}
export class CountryArchiveUploadReceiptError extends Error{constructor(readonly receipt:UploadReceipt){super('country-archive-upload-receipt-failed');this.name='CountryArchiveUploadReceiptError';}}
export async function uploadCountryObjects(opts:{repoRoot:string;capabilityFile:string;capabilityDigest:Digest;bundleFile:string;outputDir:string;onProgress?:(progress:{completed:number;total:number;failed:number})=>void}):Promise<UploadReceipt>{
  const source=await loadCountrySourceManifest(opts.repoRoot),capabilityBytes=await readCountryBoundedFile(opts.repoRoot,opts.capabilityFile,contract.limits.capabilities);same(digestCountryBytes(capabilityBytes),parseCountryDigest(opts.capabilityDigest,contract.limits.capabilities));
  const caps=parseCountryUploadCapabilities(capabilityBytes,source.manifest,new Date());same(relative(resolve(opts.repoRoot),resolve(opts.bundleFile)).replaceAll('\\','/'),caps.objects.at(-1)!.path);same(digestCountryBytes(await readCountryBoundedFile(opts.repoRoot,opts.bundleFile,contract.limits.bundle)),caps.bundleDigest);
  const output=await reserveArchiveOutput(opts.repoRoot,opts.outputDir),outcomes:UploadReceipt['outcomes']=new Array(caps.objects.length),deadlineAt=Math.min(Date.now()+contract.limits.totalMs,Date.parse(caps.expiresAt));let cursor=0,completed=0,failed=0;
  await Promise.all(Array.from({length:contract.limits.concurrency},async()=>{for(;;){const i=cursor++;if(i>=caps.objects.length)return;const o=caps.objects[i];outcomes[i]={id:o.id,status:Date.now()>=deadlineAt?'failed':await uploadOne(opts.repoRoot,o,deadlineAt)};completed++;failed+=outcomes[i].status==='failed'?1:0;try{opts.onProgress?.({completed,total:caps.objects.length,failed});}catch{/* Diagnostics cannot alter the transfer outcome. */}}}));
  const receipt:UploadReceipt={schemaVersion:1,status:outcomes.some(o=>o.status==='failed')?'incomplete':'complete',sourceManifestDigest:caps.sourceManifestDigest,bundleDigest:caps.bundleDigest,capabilityDigest:opts.capabilityDigest,outcomes};try{await writeCountryExclusiveFile(opts.repoRoot,resolve(output,'upload-receipt.json'),countryJsonBytes(receipt));}catch{throw new CountryArchiveUploadReceiptError(receipt);}return receipt;
}
