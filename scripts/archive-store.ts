import {S3Client,GetObjectCommand,PutObjectCommand,type S3ClientConfig} from '@aws-sdk/client-s3';
import {CURRENT_KEY,LIMITS,releaseIdFromKey} from './archive-bundle';
import {Readable} from 'node:stream';
export type WriteCondition={ifNoneMatch:'*'}|{ifMatch:string};
export type StoredObject={bytes:Buffer;etag:string};
export interface ArchiveStore{get(key:string,maxBytes:number):Promise<StoredObject|null>;put(key:string,bytes:Buffer,condition:WriteCondition):Promise<void>;}
export type StoreErrorCode='conflict'|'unconfirmed_write'|'write_failed'|'read_failed';
export class ArchiveStoreError extends Error{constructor(readonly code:StoreErrorCode){super(`Archive storage ${code}`);this.name='ArchiveStoreError';}}
export type R2Config={accountId:string;bucketName:string;accessKeyId:string;secretAccessKey:string};
export function readR2Config(env:NodeJS.ProcessEnv):R2Config{
  const config={accountId:env.R2_ACCOUNT_ID??'',bucketName:env.R2_BUCKET_NAME??'',accessKeyId:env.R2_ACCESS_KEY_ID??'',secretAccessKey:env.R2_SECRET_ACCESS_KEY??''};
  if(!/^[a-f0-9]{32}$/.test(config.accountId)||! /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(config.bucketName)||! /^[a-f0-9]{32}$/.test(config.accessKeyId)||! /^[a-f0-9]{64}$/.test(config.secretAccessKey))throw new Error('Missing or invalid R2 settings');
  return config;
}
function validEtag(value:unknown):value is string{return typeof value==='string'&&/^"[\x21\x23-\x7e]{1,510}"$/.test(value);}
function validateKey(key:string):void{if(key!==CURRENT_KEY)releaseIdFromKey(key);}
function boundResponse(command:GetObjectCommand|PutObjectCommand,maxBytes:number,setBody:(body:any)=>void):void{
  // This inner middleware sees the raw HTTP stream before SDK error/XML buffering.
  command.middlewareStack.addRelativeTo((next:(args:any)=>Promise<any>)=>async (args:any)=>{
    const result=await next(args);const response=result.response as {statusCode:number;body?:Readable};const raw=response.body;
    setBody(raw);
    if(!raw||!(Symbol.asyncIterator in raw))throw new Error('Invalid archive response body');
    const cap=response.statusCode>=200&&response.statusCode<300?maxBytes:Math.min(maxBytes,LIMITS.pointer);
    response.body=Readable.from((async function*(){let total=0;try{for await(const chunk of raw){const bytes=Buffer.from(chunk);total+=bytes.length;if(total>cap)throw new Error('Archive response byte limit exceeded');yield bytes;}}finally{raw.destroy();}})());
    return result;
  },{relation:'after',toMiddleware:'deserializerMiddleware',name:'archiveResponseLimit'});
}
async function bounded<T>(operation:(signal:AbortSignal,setBody:(body:any)=>void)=>Promise<T>):Promise<T>{
  const controller=new AbortController();const bodies=new Set<any>();
  let timer:ReturnType<typeof setTimeout>;
  const deadline=new Promise<never>((_resolve,reject)=>{timer=setTimeout(()=>{controller.abort();for(const body of bodies)body?.destroy?.();reject(new Error('Archive timeout'));},30_000);});
  try{return await Promise.race([operation(controller.signal,value=>{bodies.add(value);if(controller.signal.aborted)value?.destroy?.();}),deadline]);}
  finally{clearTimeout(timer!);for(const body of bodies)body?.destroy?.();}
}
export function createR2Store(config:R2Config,options:Pick<S3ClientConfig,'requestHandler'>={}):ArchiveStore{
  readR2Config({R2_ACCOUNT_ID:config.accountId,R2_BUCKET_NAME:config.bucketName,R2_ACCESS_KEY_ID:config.accessKeyId,R2_SECRET_ACCESS_KEY:config.secretAccessKey});
  const client=new S3Client({region:'auto',endpoint:`https://${config.accountId}.r2.cloudflarestorage.com`,forcePathStyle:true,credentials:{accessKeyId:config.accessKeyId,secretAccessKey:config.secretAccessKey},maxAttempts:1,requestChecksumCalculation:'WHEN_REQUIRED',responseChecksumValidation:'WHEN_REQUIRED',requestHandler:options.requestHandler});
  return {
    async get(key,maxBytes){
      try{
        validateKey(key);if(!Number.isSafeInteger(maxBytes)||maxBytes<1||maxBytes>LIMITS.bundle)throw new Error('Invalid read bound');
        return await bounded(async(signal,setBody)=>{
          const command=new GetObjectCommand({Bucket:config.bucketName,Key:key});boundResponse(command,maxBytes,setBody);
          const object=await client.send(command,{abortSignal:signal});
          setBody(object.Body);
          if(!validEtag(object.ETag)||!object.Body||!(Symbol.asyncIterator in object.Body)||object.ContentLength!==undefined&&(!Number.isSafeInteger(object.ContentLength)||object.ContentLength<0||object.ContentLength>maxBytes))throw new Error('Invalid stored object');
          const chunks:Buffer[]=[];let bytes=0;
          for await(const chunk of object.Body as AsyncIterable<Uint8Array>){if(signal.aborted)throw new Error('Archive timeout');const b=Buffer.from(chunk);bytes+=b.length;if(bytes>maxBytes)throw new Error('Stored object exceeds byte limit');chunks.push(b);}
          if(object.ContentLength!==undefined&&object.ContentLength!==bytes)throw new Error('Stored object length mismatch');
          return {bytes:Buffer.concat(chunks,bytes),etag:object.ETag};
        });
      }catch(error){const e=error as {name?:string;$metadata?:{httpStatusCode?:number}};if(e.name==='NoSuchKey'&&e.$metadata?.httpStatusCode===404)return null;throw new ArchiveStoreError('read_failed');}
    },
    async put(key,bytes,condition){
      try{validateKey(key);const limit=key===CURRENT_KEY?LIMITS.pointer:LIMITS.bundle;if(bytes.length>limit||!condition||Object.keys(condition).length!==1||!('ifNoneMatch' in condition&&condition.ifNoneMatch==='*'||'ifMatch' in condition&&validEtag(condition.ifMatch)))throw new Error('Invalid conditional write');}
      catch{throw new ArchiveStoreError('write_failed');}
      try{await bounded(async(signal,setBody)=>{const command=new PutObjectCommand({Bucket:config.bucketName,Key:key,Body:bytes,ContentType:'application/json',...('ifMatch' in condition?{IfMatch:condition.ifMatch}:{IfNoneMatch:condition.ifNoneMatch})});boundResponse(command,LIMITS.pointer,setBody);await client.send(command,{abortSignal:signal});});}
      catch(error){const status=(error as {$metadata?:{httpStatusCode?:number}}).$metadata?.httpStatusCode;throw new ArchiveStoreError(status===412?'conflict':status!==undefined&&status>=400&&status<500?'write_failed':'unconfirmed_write');}
    }
  };
}
