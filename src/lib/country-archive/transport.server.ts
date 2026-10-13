import {S3Client,GetObjectCommand,PutObjectCommand,type S3ClientConfig} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {Readable} from 'node:stream';
import {posix} from 'node:path';
import {readR2Config,type R2Config} from '../../../scripts/archive-store';
import {countryJsonBytes,parseCountryDigest} from '../country-release/contract.server';
import type {Digest} from '../country-release/types';
import {countryArchiveContract as contract} from './contract.server';
import {parseCountrySourceManifest,sourceObjectKey,sourceManifestKey,bundleObjectKey,assertCountryArchiveKey} from './sources.server';
import type {ArchiveStore,SourceManifest,SourceEntry,Capabilities} from './types';
export class CountryArchiveTransportError extends Error{constructor(readonly code:'conflict'|'unconfirmed_write'|'write_failed'|'read_failed'){super('country-archive-transport-'+code);this.name='CountryArchiveTransportError';}}
function clientFor(config:R2Config,options:Pick<S3ClientConfig,'requestHandler'>={}){readR2Config({R2_ACCOUNT_ID:config.accountId,R2_BUCKET_NAME:config.bucketName,R2_ACCESS_KEY_ID:config.accessKeyId,R2_SECRET_ACCESS_KEY:config.secretAccessKey});return new S3Client({region:'auto',endpoint:`https://${config.accountId}.r2.cloudflarestorage.com`,forcePathStyle:true,credentials:{accessKeyId:config.accessKeyId,secretAccessKey:config.secretAccessKey},maxAttempts:1,requestChecksumCalculation:'WHEN_REQUIRED',responseChecksumValidation:'WHEN_REQUIRED',...options});}
export function uploadDescriptors(sourceManifest:SourceManifest,bundleDigest:Digest,localBundlePath:string):(SourceEntry&{key:string})[]{
  const m=parseCountrySourceManifest(countryJsonBytes(sourceManifest)),d=parseCountryDigest(bundleDigest,contract.limits.bundle);
  if(typeof localBundlePath!=='string'||localBundlePath!==posix.normalize(localBundlePath)||!localBundlePath.startsWith(contract.backupRoot+'/')||!localBundlePath.endsWith('/bundle.json')||/[:\\\u0000-\u001f]/.test(localBundlePath)||localBundlePath.split('/').some(p=>!p||p==='.'||p==='..'))throw new Error('country-archive-bundle-path');
  return [...m.files.map(f=>({...f,key:sourceObjectKey(f.id)})),{id:'manifest',path:contract.manifestPin.path,bytes:contract.manifestPin.bytes,sha256:contract.manifestPin.sha256,role:'capture' as const,key:sourceManifestKey()},{id:'bundle',path:localBundlePath,...d,role:'capture' as const,key:bundleObjectKey(d.sha256)}];
}
export const uploadHeaders=(o:Digest)=>({'content-type':'application/octet-stream','content-length':String(o.bytes),'if-none-match':'*','x-amz-meta-sha256':o.sha256});
export async function createCountryUploadCapabilities(opts:{config:R2Config;sourceManifest:SourceManifest;bundleDigest:Digest;localBundlePath:string;now:Date}):Promise<Capabilities>{
  const client=clientFor(opts.config),objects=[];
  for(const descriptor of uploadDescriptors(opts.sourceManifest,opts.bundleDigest,opts.localBundlePath)){
    const url=await getSignedUrl(client,new PutObjectCommand({Bucket:opts.config.bucketName,Key:descriptor.key,ContentType:'application/octet-stream',ContentLength:descriptor.bytes,IfNoneMatch:'*',Metadata:{sha256:descriptor.sha256},StorageClass:'STANDARD'}),{expiresIn:contract.limits.lifetimeSeconds,signingDate:opts.now,signableHeaders:new Set(['if-none-match','content-length','content-type','x-amz-meta-sha256']),unhoistableHeaders:new Set(['x-amz-meta-sha256'])});
    objects.push({...descriptor,url,headers:uploadHeaders(descriptor)});
  }
  return {schemaVersion:1,policyId:contract.policyId,accountId:opts.config.accountId,bucketName:opts.config.bucketName,issuedAt:opts.now.toISOString(),expiresAt:new Date(opts.now.getTime()+contract.limits.lifetimeSeconds*1000).toISOString(),sourceManifestDigest:{bytes:contract.manifestPin.bytes,sha256:contract.manifestPin.sha256},bundleDigest:opts.bundleDigest,objects};
}
function responseLimit(command:GetObjectCommand|PutObjectCommand,maxBytes:number,controller:AbortController,owned:Set<Readable>){
  command.middlewareStack.addRelativeTo((next:(args:any)=>Promise<any>)=>async(args:any)=>{const result=await next(args),response=result.response as {statusCode:number;body?:Readable},raw=response.body;if(!raw||!(Symbol.asyncIterator in raw))throw new Error('country-archive-response');owned.add(raw);
    const cap=response.statusCode>=200&&response.statusCode<300?maxBytes:Math.min(maxBytes,contract.limits.pointer);response.body=Readable.from((async function*(){let total=0;try{for await(const chunk of raw){if(controller.signal.aborted)throw new Error('country-archive-timeout');const b=Buffer.from(chunk);total+=b.length;if(total>cap)throw new Error('country-archive-response-limit');yield b;}}finally{raw.destroy();}})());owned.add(response.body);return result;
  },{relation:'after',toMiddleware:'deserializerMiddleware',name:'countryArchiveResponseLimit'});
}
const validEtag=(v:unknown):v is string=>typeof v==='string'&&/^"[\x21\x23-\x7e]{1,510}"$/.test(v);
export function createCountryArchiveStore(config:R2Config,options:Pick<S3ClientConfig,'requestHandler'>={}):ArchiveStore{
  const client=clientFor(config,options);
  async function source(key:string,maxBytes:number,parentSignal?:AbortSignal){
    const controller=new AbortController(),owned=new Set<Readable>();let timer:ReturnType<typeof setTimeout>|undefined;
    const abort=()=>{controller.abort();for(const stream of owned)stream.destroy();};
    const clean=()=>{if(timer)clearTimeout(timer);parentSignal?.removeEventListener('abort',abort);for(const stream of owned)stream.destroy();};
    parentSignal?.addEventListener('abort',abort,{once:true});
    try{if(parentSignal?.aborted)throw new Error('country-archive-aborted');assertCountryArchiveKey(key);if(!Number.isSafeInteger(maxBytes)||maxBytes<1||maxBytes>contract.limits.source)throw new Error('country-archive-read-bound');
      const deadline=new Promise<never>((_r,reject)=>{timer=setTimeout(()=>{controller.abort();for(const stream of owned)stream.destroy();reject(new Error('country-archive-timeout'));},contract.limits.objectMs);});
      const command=new GetObjectCommand({Bucket:config.bucketName,Key:key});responseLimit(command,maxBytes,controller,owned);const object=await Promise.race([client.send(command,{abortSignal:controller.signal}),deadline]);
      if(!validEtag(object.ETag)||!object.Body||!(Symbol.asyncIterator in object.Body)||object.ContentLength!==undefined&&(!Number.isSafeInteger(object.ContentLength)||object.ContentLength<0||object.ContentLength>maxBytes))throw new Error('country-archive-response');
      const body=object.Body as Readable;owned.add(body);
      const stream=Readable.from((async function*(){let bytes=0;try{for await(const part of body){if(controller.signal.aborted)throw new Error('country-archive-timeout');const chunk=Buffer.from(part);bytes+=chunk.length;if(bytes>maxBytes)throw new Error('country-archive-stream-limit');yield chunk;}if(object.ContentLength!==undefined&&bytes!==object.ContentLength)throw new Error('country-archive-stream-length');}catch{throw new Error('country-archive-stream-failed');}finally{clean();}})());
      stream.once('close',clean);return {stream,contentLength:object.ContentLength??null,etag:object.ETag};
    }catch(error){clean();const e=error as {name?:string;$metadata?:{httpStatusCode?:number}};if(e.name==='NoSuchKey'&&e.$metadata?.httpStatusCode===404)throw error;throw new CountryArchiveTransportError('read_failed');}
  }
  return {
    async get(key,maxBytes,signal){try{if(maxBytes>contract.limits.bundle)throw new Error('country-archive-compact-bound');const object=await source(key,maxBytes,signal),chunks:Buffer[]=[];for await(const part of object.stream)chunks.push(Buffer.from(part));return {bytes:Buffer.concat(chunks),etag:object.etag};}catch(error){const e=error as {name?:string;$metadata?:{httpStatusCode?:number}};if(e.name==='NoSuchKey'&&e.$metadata?.httpStatusCode===404)return null;throw new CountryArchiveTransportError('read_failed');}},
    source,
    async put(key,bytes,condition,parentSignal){
      try{if(parentSignal?.aborted)throw new Error('country-archive-aborted');assertCountryArchiveKey(key);if(key!==contract.currentKey||!Buffer.isBuffer(bytes)||bytes.length<1||bytes.length>contract.limits.pointer||!condition||Object.keys(condition).join()!=='ifNoneMatch'||condition.ifNoneMatch!=='*')throw new Error('country-archive-write-bound');}catch{throw new CountryArchiveTransportError('write_failed');}
      const controller=new AbortController(),owned=new Set<Readable>();let timer:ReturnType<typeof setTimeout>|undefined;
      const abort=()=>{controller.abort();for(const stream of owned)stream.destroy();};parentSignal?.addEventListener('abort',abort,{once:true});
      try{const deadline=new Promise<never>((_r,reject)=>{timer=setTimeout(()=>{controller.abort();for(const stream of owned)stream.destroy();reject(new Error('country-archive-timeout'));},contract.limits.objectMs);}),command=new PutObjectCommand({Bucket:config.bucketName,Key:key,Body:bytes,IfNoneMatch:'*',ContentType:'application/json',StorageClass:'STANDARD'});responseLimit(command,contract.limits.pointer,controller,owned);await Promise.race([client.send(command,{abortSignal:controller.signal}),deadline]);}
      catch(error){const status=(error as {$metadata?:{httpStatusCode?:number}}).$metadata?.httpStatusCode;throw new CountryArchiveTransportError(status===412?'conflict':status!==undefined&&status>=400&&status<500?'write_failed':'unconfirmed_write');}
      finally{if(timer)clearTimeout(timer);parentSignal?.removeEventListener('abort',abort);for(const stream of owned)stream.destroy();}
    },
  };
}
