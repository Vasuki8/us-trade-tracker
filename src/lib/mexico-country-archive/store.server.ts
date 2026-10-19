import {S3Client,GetObjectCommand,PutObjectCommand,type S3ClientConfig} from '@aws-sdk/client-s3';
import {Readable} from 'node:stream';
import {readR2Config,type R2Config} from '../../../scripts/archive-store';
import {equal} from '../mexico-country-release/contract.server';
import {mexicoAcceptanceContract as acceptance} from '../mexico-country-release/acceptance-contract.server';
import {mexicoArchiveContract as contract} from './contract.server';
import {parseMexicoAcceptedPointer} from './bundle.server';
import type {MexicoArchiveRole,MexicoArchiveStore} from './types';
export interface MexicoArchiveLedger {requests:number;get:number;put:number;requestBytes:number;responseBytes:number}
export interface MexicoMeteredArchiveStore extends MexicoArchiveStore {readonly ledger:MexicoArchiveLedger}
export class MexicoArchiveStoreError extends Error {constructor(readonly kind:'read-failed'|'write-failed'|'unconfirmed-write'|'conflict'|'budget'){super('mexico-archive-'+kind);}}
function etag(v:unknown):v is string{return typeof v==='string'&&/^"[\x21\x23-\x7e]{1,510}"$/.test(v);}
function keyLimit(key:string):number {
 if(key===contract.currentKey)return contract.limits.pointer;
 const match=/^trade\/v1\/countries\/2010\/private-all-goods\/objects\/(candidate|evidence|manifests)\/([a-f0-9]{64})\.json$/.exec(key);
 if(!match)throw Error('mexico-archive-store-key');const role=(match[1]==='manifests'?'manifest':match[1]) as MexicoArchiveRole;
 const limit=contract.limits[role];if(role==='candidate')equal(match[2],acceptance.candidate.sha256,'archive-store-candidate');
 return limit;
}
export function createMexicoArchiveStore(config:R2Config,options:Pick<S3ClientConfig,'requestHandler'>&{requestMs?:number;maxRequests?:number;maxBytes?:number}={}):MexicoMeteredArchiveStore {
 readR2Config({R2_ACCOUNT_ID:config.accountId,R2_BUCKET_NAME:config.bucketName,R2_ACCESS_KEY_ID:config.accessKeyId,R2_SECRET_ACCESS_KEY:config.secretAccessKey});equal(config.accountId,contract.accountId,'archive-account');equal(config.bucketName,contract.bucketName,'archive-bucket');
 const requestMs=options.requestMs??contract.limits.requestMs,maxRequests=options.maxRequests??8,maxBytes=options.maxBytes??16*1024*1024;
 for(const [n,max]of [[requestMs,contract.limits.requestMs],[maxRequests,contract.limits.batchRequests],[maxBytes,contract.limits.batchBytes]])if(!Number.isSafeInteger(n)||n<1||n>max)throw Error('mexico-archive-store-limits');
 const ledger:MexicoArchiveLedger={requests:0,get:0,put:0,requestBytes:0,responseBytes:0},expires=Date.now()+contract.limits.operationMs;
 const client=new S3Client({region:'auto',endpoint:`https://${config.accountId}.r2.cloudflarestorage.com`,forcePathStyle:true,credentials:{accessKeyId:config.accessKeyId,secretAccessKey:config.secretAccessKey},maxAttempts:1,requestChecksumCalculation:'WHEN_REQUIRED',responseChecksumValidation:'WHEN_REQUIRED',requestHandler:options.requestHandler});
 async function request(kind:'get'|'put',payload:number,command:GetObjectCommand|PutObjectCommand,limit:number):Promise<{bytes:Buffer;etag:string}|void>{
  if(Date.now()>=expires||ledger.requests>=maxRequests||ledger.requestBytes+ledger.responseBytes+payload>=maxBytes)throw new MexicoArchiveStoreError('budget');
  if(kind==='put'&&(maxRequests-ledger.requests<3||maxBytes-ledger.requestBytes-ledger.responseBytes-payload<2*contract.limits.pointer))throw new MexicoArchiveStoreError('budget');
  ledger.requests++;ledger[kind]++;ledger.requestBytes+=payload;
  const controller=new AbortController(),bodies=new Set<Readable>();let timer:ReturnType<typeof setTimeout>|undefined;
  command.middlewareStack.addRelativeTo((next:any)=>async(args:any)=>{
   const result=await next(args),response=result.response as {statusCode:number;body?:Readable},raw=response.body;if(!raw)return result;
   bodies.add(raw);const cap=response.statusCode>=200&&response.statusCode<300?limit:Math.min(limit,4096);
   response.body=Readable.from((async function*(){let received=0;try{for await(const chunk of raw){const b=Buffer.from(chunk);received+=b.length;ledger.responseBytes+=b.length;
    if(controller.signal.aborted||received>cap||ledger.requestBytes+ledger.responseBytes>maxBytes)throw Error('mexico-archive-stream-limit');yield b;}
   }finally{raw.destroy();}})());bodies.add(response.body);return result;
  },{relation:'after',toMiddleware:'deserializerMiddleware',name:'mexicoArchiveBoundedResponse'});
  const deadline=new Promise<never>((_resolve,reject)=>{timer=setTimeout(()=>{controller.abort();for(const body of bodies)body.destroy();reject(Error('mexico-archive-request-timeout'));},Math.min(requestMs,Math.max(1,expires-Date.now())));});
  const operation=(async()=>{
   const value=await client.send(command as GetObjectCommand,{abortSignal:controller.signal});
   if(kind==='put')return;
   const body=value.Body;if(!body||!(Symbol.asyncIterator in body)||!etag(value.ETag)||value.ContentLength!==undefined&&(!Number.isSafeInteger(value.ContentLength)||value.ContentLength<1||value.ContentLength>limit))throw Error('mexico-archive-object-header');
   const chunks:Buffer[]=[];let length=0;
   for await(const chunk of body as AsyncIterable<Uint8Array>){const b=Buffer.from(chunk);length+=b.length;if(controller.signal.aborted||length>limit)throw Error('mexico-archive-read-bound');chunks.push(b);}
   if(length<1||value.ContentLength!==undefined&&length!==value.ContentLength)throw Error('mexico-archive-content-length');return {bytes:Buffer.concat(chunks,length),etag:value.ETag};
  })();
  // The deadline covers both headers and complete body consumption.
  try{return await Promise.race([operation,deadline]);}
  finally{if(timer)clearTimeout(timer);controller.abort();for(const body of bodies)body.destroy();}
 }
 return {
  get ledger(){return {...ledger};},
  async get(key,maxBytesForObject){
   try{
    const limit=keyLimit(key);if(!Number.isSafeInteger(maxBytesForObject)||maxBytesForObject<1||maxBytesForObject>limit)throw Error('mexico-archive-read-bound');
    return await request('get',0,new GetObjectCommand({Bucket:config.bucketName,Key:key}),maxBytesForObject) as {bytes:Buffer;etag:string};
   }catch(error){const e=error as {name?:string;$metadata?:{httpStatusCode?:number}};if(e.name==='NoSuchKey'&&e.$metadata?.httpStatusCode===404)return null;throw error instanceof MexicoArchiveStoreError?error:new MexicoArchiveStoreError('read-failed');}
  },
  async put(key,bytes,condition){
   try{if(key!==contract.currentKey||!Buffer.isBuffer(bytes)||bytes.length>contract.limits.pointer)throw Error('mexico-archive-write-key');equal(condition,{ifNoneMatch:'*'},'archive-write-condition');parseMexicoAcceptedPointer(bytes);}
   catch{throw new MexicoArchiveStoreError('write-failed');}
   try{await request('put',bytes.length,new PutObjectCommand({Bucket:config.bucketName,Key:key,Body:bytes,ContentType:'application/json',ContentLength:bytes.length,IfNoneMatch:'*'}),contract.limits.pointer);}
   catch(error){if(error instanceof MexicoArchiveStoreError)throw error;const status=(error as {$metadata?:{httpStatusCode?:number}}).$metadata?.httpStatusCode;throw new MexicoArchiveStoreError(status===412?'conflict':status!==undefined&&status>=400&&status<500?'write-failed':'unconfirmed-write');}
  },
 };
}
