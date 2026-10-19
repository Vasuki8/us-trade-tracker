import {createCipheriv,createDecipheriv,createPrivateKey,createPublicKey,diffieHellman,generateKeyPairSync,hkdfSync,randomBytes} from 'node:crypto';
import {S3Client,GetObjectCommand,PutObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {readR2Config,type R2Config} from '../../../scripts/archive-store';
import {equal,identity,json,keys,object,parse} from '../mexico-country-release/contract.server';
import {acceptanceDigest} from '../mexico-country-release/acceptance.server';
import type {MexicoIdentity} from '../mexico-country-release/types';
import {mexicoArchiveKey} from './bundle.server';
import {mexicoArchiveContract as contract} from './contract.server';
import type {MexicoArchiveDescriptor,MexicoArchiveRole} from './types';

const repository='Vasuki8/us-trade-tracker',workflowPath='.github/workflows/mexico-archive-capabilities.yml';
const algorithm='X25519-HKDF-SHA256-AES-256-GCM',info='us-trade-tracker/mexico-archive-capabilities/v1';
const roles:MexicoArchiveRole[]=['candidate','evidence','manifest'];
export interface MexicoCapabilityContext {schemaVersion:1;repository:string;workflowPath:string;headSha:string;runId:string;runAttempt:string;policyId:string;recipientFingerprint:string;descriptors:readonly MexicoArchiveDescriptor[];issuedAt:string;expiresAt:string}
export interface MexicoCapability {method:'PUT'|'GET';key:string;identity:MexicoIdentity|null;maxBytes:number;url:string;headers:Record<string,string>}
export interface MexicoCapabilities {schemaVersion:1;context:MexicoCapabilityContext;entries:MexicoCapability[]}
function b64(value:unknown,max:number,exact?:number):Buffer{if(typeof value!=='string'||value.length>4*Math.ceil(max/3))throw Error('base64');const b=Buffer.from(value,'base64');if(b.length<1||b.length>max||exact!==undefined&&b.length!==exact||b.toString('base64')!==value)throw Error('base64');return b;}
function publicKey(value:unknown){const b=b64(value,44,44),key=createPublicKey({key:b,format:'der',type:'spki'});if(key.asymmetricKeyType!=='x25519'||!key.export({format:'der',type:'spki'}).equals(b))throw Error('recipient');const shared=diffieHellman({privateKey:generateKeyPairSync('x25519').privateKey,publicKey:key});try{if(shared.equals(Buffer.alloc(32)))throw Error('low-order');}finally{shared.fill(0);}return {bytes:b,key};}
function descriptors(value:unknown):MexicoArchiveDescriptor[]{if(!Array.isArray(value)||value.length!==3||json(value).length>8192)throw Error('descriptors');return roles.map((role,i)=>{const d=object(value[i]);keys(d,['role','key','identity']);equal(d.role,role);const digest=acceptanceDigest(d.identity,contract.limits[role]);equal(d.key,mexicoArchiveKey(role,digest));return {role,key:String(d.key),identity:digest};});}
function timestamp(v:unknown):string{if(typeof v!=='string'||!Number.isFinite(Date.parse(v))||new Date(v).toISOString()!==v)throw Error('time');return v;}
function checkedContext(value:unknown,now:Date):MexicoCapabilityContext{
 const v=object(value);keys(v,['schemaVersion','repository','workflowPath','headSha','runId','runAttempt','policyId','recipientFingerprint','descriptors','issuedAt','expiresAt']);equal(v.schemaVersion,1);equal(v.repository,repository);equal(v.workflowPath,workflowPath);equal(v.policyId,contract.policyId);
 if(typeof v.headSha!=='string'||!(/^[a-f0-9]{40}$/).test(v.headSha)||typeof v.recipientFingerprint!=='string'||!(/^[a-f0-9]{64}$/).test(v.recipientFingerprint))throw Error('context');
 for(const n of [v.runId,v.runAttempt])if(typeof n!=='string'||!(/^[1-9][0-9]{0,19}$/).test(n))throw Error('run');
 const issuedAt=timestamp(v.issuedAt),expiresAt=timestamp(v.expiresAt);if(!Number.isFinite(now.getTime())||Date.parse(expiresAt)-Date.parse(issuedAt)!==3600000||now.getTime()<Date.parse(issuedAt)-300000||now.getTime()>=Date.parse(expiresAt))throw Error('expired');
 return {schemaVersion:1,repository,workflowPath,headSha:v.headSha,runId:String(v.runId),runAttempt:String(v.runAttempt),policyId:contract.policyId,recipientFingerprint:v.recipientFingerprint,descriptors:descriptors(v.descriptors),issuedAt,expiresAt};
}
export function createMexicoRecipient(){const pair=generateKeyPairSync('x25519'),pub=pair.publicKey.export({format:'der',type:'spki'});return {privateKey:pair.privateKey.export({format:'der',type:'pkcs8'}),publicKey:pub.toString('base64'),fingerprint:identity(pub).sha256};}
export function mexicoCapabilityContext(opts:{headSha:string;runId:string;runAttempt:string;descriptors:readonly MexicoArchiveDescriptor[];recipientPublicKey:string;now:Date}):MexicoCapabilityContext{
 const pub=publicKey(opts.recipientPublicKey),issued=new Date(Math.floor(opts.now.getTime()/1000)*1000);return checkedContext({schemaVersion:1,repository,workflowPath,headSha:opts.headSha,runId:opts.runId,runAttempt:opts.runAttempt,policyId:contract.policyId,recipientFingerprint:identity(pub.bytes).sha256,descriptors:descriptors(opts.descriptors),issuedAt:issued.toISOString(),expiresAt:new Date(issued.getTime()+3600000).toISOString()},opts.now);
}
function requiredHeaders(method:'PUT'|'GET',d:MexicoArchiveDescriptor|null):Record<string,string>{return method==='GET'?{}:{'content-length':String(d!.identity.bytes),'content-type':'application/json','if-none-match':'*','x-amz-meta-sha256':d!.identity.sha256};}
function validateUrl(entry:MexicoCapability,context:MexicoCapabilityContext):void{
 if(typeof entry.url!=='string'||entry.url.length>8192)throw Error('url');const u=new URL(entry.url);if(u.protocol!=='https:'||u.host!==contract.accountId+'.r2.cloudflarestorage.com'||u.username||u.password||u.hash||u.pathname!=='/'+contract.bucketName+'/'+entry.key)throw Error('target');
 const allowed=new Set(['X-Amz-Algorithm','X-Amz-Content-Sha256','X-Amz-Credential','X-Amz-Date','X-Amz-Expires','X-Amz-Signature','X-Amz-SignedHeaders','x-id']);for(const [name] of u.searchParams)if(!allowed.has(name)||u.searchParams.getAll(name).length!==1)throw Error('query');
 const get=(k:string)=>u.searchParams.get(k);if(get('X-Amz-Algorithm')!=='AWS4-HMAC-SHA256'||get('X-Amz-Content-Sha256')!=='UNSIGNED-PAYLOAD'||get('X-Amz-Expires')!=='3600'||!(/^[a-f0-9]{64}$/).test(get('X-Amz-Signature')??''))throw Error('signature');
 const date=context.issuedAt.replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');equal(get('X-Amz-Date'),date);if(!new RegExp('^[a-f0-9]{32}/'+date.slice(0,8)+'/auto/s3/aws4_request$').test(get('X-Amz-Credential')??''))throw Error('credential-scope');equal(get('x-id'),entry.method==='PUT'?'PutObject':'GetObject');
 equal(get('X-Amz-SignedHeaders'),entry.method==='PUT'?'content-length;content-type;host;if-none-match;x-amz-meta-sha256':'host');
}
export function validateMexicoCapabilities(value:unknown,expectedContext:MexicoCapabilityContext,now:Date):MexicoCapabilities{
 const v=object(value);keys(v,['schemaVersion','context','entries']);equal(v.schemaVersion,1);const context=checkedContext(v.context,now);equal(context,checkedContext(expectedContext,now),'capability-context');
 if(!Array.isArray(v.entries)||v.entries.length!==7)throw Error('permissions');const rawEntries=v.entries;const spec=[...context.descriptors.map(d=>({method:'PUT' as const,d})),...context.descriptors.map(d=>({method:'GET' as const,d})),{method:'GET' as const,d:null}];
 const entries=spec.map(({method,d},i)=>{const c=object(rawEntries[i]);keys(c,['method','key','identity','maxBytes','url','headers']);equal(c.method,method);equal(c.key,d?.key??contract.currentKey);equal(c.identity,d?.identity??null);equal(c.maxBytes,d?.identity.bytes??contract.limits.pointer);equal(c.headers,requiredHeaders(method,d));const entry=c as unknown as MexicoCapability;validateUrl(entry,context);return structuredClone(entry);});return {schemaVersion:1,context,entries};
}
export async function sealMexicoCapabilities(opts:{config:R2Config;descriptors:readonly MexicoArchiveDescriptor[];recipientPublicKey:string;context:MexicoCapabilityContext;now:Date}):Promise<Buffer>{
 let shared:Buffer|undefined,key:Buffer|undefined;
 try{
  const ds=descriptors(opts.descriptors),pub=publicKey(opts.recipientPublicKey),context=checkedContext(opts.context,opts.now);equal(context.descriptors,ds);equal(context.recipientFingerprint,identity(pub.bytes).sha256);
  const config=readR2Config({R2_ACCOUNT_ID:opts.config.accountId,R2_BUCKET_NAME:opts.config.bucketName,R2_ACCESS_KEY_ID:opts.config.accessKeyId,R2_SECRET_ACCESS_KEY:opts.config.secretAccessKey});equal(config.accountId,contract.accountId);equal(config.bucketName,contract.bucketName);
  const pair=generateKeyPairSync('x25519');shared=diffieHellman({privateKey:pair.privateKey,publicKey:pub.key});if(shared.equals(Buffer.alloc(32)))throw Error('shared-secret');const salt=randomBytes(32),nonce=randomBytes(12);key=Buffer.from(hkdfSync('sha256',shared,salt,Buffer.concat([Buffer.from(info+'\0'),Buffer.from(identity(json(context)).sha256,'hex')]),32));
  const client=new S3Client({region:'auto',endpoint:'https://'+contract.accountId+'.r2.cloudflarestorage.com',forcePathStyle:true,credentials:{accessKeyId:config.accessKeyId,secretAccessKey:config.secretAccessKey},maxAttempts:1,requestChecksumCalculation:'WHEN_REQUIRED',responseChecksumValidation:'WHEN_REQUIRED'});
  const entries:MexicoCapability[]=[];try{for(const {method,d}of [...ds.map(d=>({method:'PUT' as const,d})),...ds.map(d=>({method:'GET' as const,d})),{method:'GET' as const,d:null}]){
   const headers=requiredHeaders(method,d),objectKey=d?.key??contract.currentKey,command=method==='GET'?new GetObjectCommand({Bucket:config.bucketName,Key:objectKey}):new PutObjectCommand({Bucket:config.bucketName,Key:objectKey,ContentLength:d!.identity.bytes,ContentType:'application/json',IfNoneMatch:'*',Metadata:{sha256:d!.identity.sha256}});
   const url=await getSignedUrl(client,command,{expiresIn:3600,signingDate:new Date(context.issuedAt),signableHeaders:new Set(Object.keys(headers)),unhoistableHeaders:new Set(['x-amz-meta-sha256'])});entries.push({method,key:objectKey,identity:d?.identity??null,maxBytes:d?.identity.bytes??contract.limits.pointer,url,headers});
  }}finally{client.destroy();}
  const payload=validateMexicoCapabilities({schemaVersion:1,context,entries},context,opts.now),cipher=createCipheriv('aes-256-gcm',key,nonce);cipher.setAAD(json(context));const encrypted=Buffer.concat([cipher.update(json(payload)),cipher.final()]);const bytes=json({schemaVersion:1,algorithm,context,ephemeralPublicKey:pair.publicKey.export({format:'der',type:'spki'}).toString('base64'),salt:salt.toString('base64'),nonce:nonce.toString('base64'),tag:cipher.getAuthTag().toString('base64'),ciphertext:encrypted.toString('base64')});if(bytes.length>128*1024)throw Error('envelope-limit');return bytes;
 }catch{throw Error('mexico-capability-seal-failed');}finally{shared?.fill(0);key?.fill(0);}
}
export function openMexicoCapabilities(opts:{ciphertext:Buffer;privateKey:Buffer;expectedContext:MexicoCapabilityContext;trustedCiphertextIdentity:MexicoIdentity;now:Date}):MexicoCapabilities{
 let shared:Buffer|undefined,key:Buffer|undefined,plain:Buffer|undefined;
 try{
  if(!Buffer.isBuffer(opts.ciphertext)||opts.ciphertext.length>128*1024)throw Error('limit');equal(identity(opts.ciphertext),acceptanceDigest(opts.trustedCiphertextIdentity,128*1024));const e=parse(opts.ciphertext);keys(e,['schemaVersion','algorithm','context','ephemeralPublicKey','salt','nonce','tag','ciphertext']);equal(e.schemaVersion,1);equal(e.algorithm,algorithm);equal(json(e),opts.ciphertext);
  const context=checkedContext(e.context,opts.now);equal(context,checkedContext(opts.expectedContext,opts.now));if(!Buffer.isBuffer(opts.privateKey)||opts.privateKey.length!==48)throw Error('private-key');const recipient=createPrivateKey({key:opts.privateKey,format:'der',type:'pkcs8'});if(recipient.asymmetricKeyType!=='x25519')throw Error('recipient');equal(identity(createPublicKey(recipient).export({format:'der',type:'spki'})).sha256,context.recipientFingerprint);
  shared=diffieHellman({privateKey:recipient,publicKey:publicKey(e.ephemeralPublicKey).key});if(shared.equals(Buffer.alloc(32)))throw Error('shared-secret');key=Buffer.from(hkdfSync('sha256',shared,b64(e.salt,32,32),Buffer.concat([Buffer.from(info+'\0'),Buffer.from(identity(json(context)).sha256,'hex')]),32));const decipher=createDecipheriv('aes-256-gcm',key,b64(e.nonce,12,12));decipher.setAAD(json(context));decipher.setAuthTag(b64(e.tag,16,16));plain=Buffer.concat([decipher.update(b64(e.ciphertext,96*1024)),decipher.final()]);const v=parse(plain);equal(json(v),plain);return validateMexicoCapabilities(v,context,opts.now);
 }catch{throw Error('mexico-capability-open-failed');}finally{shared?.fill(0);key?.fill(0);plain?.fill(0);}
}
