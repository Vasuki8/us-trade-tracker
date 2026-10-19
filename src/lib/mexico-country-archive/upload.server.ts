import {request as httpsRequest} from 'node:https';
import {Readable} from 'node:stream';
import {resolve} from 'node:path';
import {equal,identity,json,keys,object} from '../mexico-country-release/contract.server';
import {inspectMexicoStateDirectory,reserveMexicoStateChild,reserveMexicoStateDirectory,writeMexicoStateFile} from '../mexico-country-release/acceptance-io.server';
import {recoverMexicoAcceptedState} from '../mexico-country-release/acceptance-state.server';
import {authenticateMexicoArchive,verifyMexicoPointer} from './bundle.server';
import {validateMexicoCapabilities,type MexicoCapabilities,type MexicoCapability} from './capabilities.server';
import {mexicoArchiveContract as contract} from './contract.server';
import {mexicoArchiveOutputPath} from './verify.server';
import type {MexicoArchiveMaterial,MexicoArchiveReceipt} from './types';
import type {MexicoArchiveLedger} from './store.server';
interface Response {statusCode:number;headers:Record<string,string|undefined>;body:Readable;destroy:()=>void}
type Request=(capability:MexicoCapability,body:Buffer|undefined,signal:AbortSignal)=>Promise<Response>;
export interface MexicoCapabilityTransport {readonly ledger:MexicoArchiveLedger;get(key:string,maxBytes:number):Promise<Buffer>;putImmutable(key:string,bytes:Buffer):Promise<void>}
export class MexicoTransferError extends Error {constructor(){super('mexico-capability-transfer-failed');}}
const nativeRequest:Request=(capability,body,signal)=>new Promise((accept,reject)=>{
 const request=httpsRequest(capability.url,{method:capability.method,headers:capability.headers,signal,agent:false},response=>{accept({statusCode:response.statusCode??0,headers:{'content-length':typeof response.headers['content-length']==='string'?response.headers['content-length']:undefined},body:response,destroy:()=>{response.destroy();request.destroy();}});});request.once('error',()=>reject(new MexicoTransferError()));request.end(body);
});
export function createMexicoCapabilityTransport(capabilities:MexicoCapabilities,options:{readOnly?:boolean;request?:Request;requestMs?:number;maxRequests?:number;maxBytes?:number}={}):MexicoCapabilityTransport{
 const checked=validateMexicoCapabilities(capabilities,capabilities.context,new Date()),request=options.request??nativeRequest,requestMs=options.requestMs??30000,maxRequests=options.maxRequests??8,maxBytes=options.maxBytes??24*1024*1024;
 for(const [n,max]of [[requestMs,30000],[maxRequests,32],[maxBytes,64*1024*1024]])if(!Number.isSafeInteger(n)||n<1||n>max)throw new MexicoTransferError();
 const ledger:MexicoArchiveLedger={requests:0,get:0,put:0,requestBytes:0,responseBytes:0},puts=new Set<string>(),deadline=Date.now()+300000;
 async function execute(method:'GET'|'PUT',key:string,bytes:Buffer|undefined,limit:number):Promise<Buffer>{
  let response:Response|undefined,timer:ReturnType<typeof setTimeout>|undefined;const controller=new AbortController();
  try{
   validateMexicoCapabilities(checked,checked.context,new Date());const c=checked.entries.find(c=>c.method===method&&c.key===key);if(!c||!Number.isSafeInteger(limit)||limit<1||limit>c.maxBytes&&method==='GET')throw Error('permission');
   const payload=bytes?.length??0;if(Date.now()>=deadline||ledger.requests>=maxRequests||ledger.requestBytes+ledger.responseBytes+payload>=maxBytes)throw Error('budget');
   if(method==='PUT'){if(options.readOnly||puts.has(key)||!bytes||!c.identity)throw Error('write');equal(identity(bytes),c.identity);if(maxRequests-ledger.requests<3||maxBytes-ledger.requestBytes-ledger.responseBytes-payload<2*c.maxBytes)throw Error('reserve');puts.add(key);}
   ledger.requests++;ledger[method==='GET'?'get':'put']++;ledger.requestBytes+=payload;
   const timeout=new Promise<never>((_a,reject)=>{timer=setTimeout(()=>{controller.abort();response?.destroy();reject(new MexicoTransferError());},Math.min(requestMs,Math.max(1,deadline-Date.now())));});
   const operation=(async()=>{
    const value=await request(c,bytes,controller.signal);response=value;if(controller.signal.aborted){value.destroy();throw Error('late-response');}
    const successful=value.statusCode>=200&&value.statusCode<300,cap=successful&&method==='GET'?limit:4096,header=value.headers['content-length'];if(header!==undefined&&(!/^(0|[1-9][0-9]*)$/.test(header)||!Number.isSafeInteger(Number(header))||Number(header)>cap))throw Error('length');
    let size=0;const chunks:Buffer[]=[];for await(const chunk of value.body){const b=Buffer.from(chunk);size+=b.length;ledger.responseBytes+=b.length;if(controller.signal.aborted||size>cap||ledger.requestBytes+ledger.responseBytes>maxBytes)throw Error('stream');chunks.push(b);}
    if(header!==undefined&&Number(header)!==size||!successful||method==='GET'&&size===0)throw Error('response');return Buffer.concat(chunks,size);
   })();return await Promise.race([operation,timeout]);
  }catch{throw new MexicoTransferError();}finally{if(timer)clearTimeout(timer);controller.abort();response?.destroy();}
 }
 return {get ledger(){return {...ledger};},async get(key,max){return execute('GET',key,undefined,max);},async putImmutable(key,bytes){await execute('PUT',key,Buffer.from(bytes),contract.limits.pointer);}};
}
export interface MexicoTransferReceipt {schemaVersion:1;mode:'upload'|'readback';status:'staged-verified'|'readback-verified'|'unconfirmed';accepted:boolean;objects:{key:string;identity:{bytes:number;sha256:string};verified:boolean}[];ledger:MexicoArchiveLedger;verification:MexicoArchiveReceipt|null}
export class MexicoTransferReceiptError extends Error {constructor(readonly receipt:MexicoTransferReceipt){super('mexico-transfer-receipt-persistence-failed');}}
export async function transferMexicoArchive(opts:{repoRoot:string;material:MexicoArchiveMaterial;capabilities:MexicoCapabilities;mode:'upload'|'readback';outputDir:string;transport?:MexicoCapabilityTransport}):Promise<MexicoTransferReceipt>{
 keys(object(opts),['repoRoot','material','capabilities','mode','outputDir',...('transport'in opts?['transport']:[])]);if(!['upload','readback'].includes(opts.mode))throw new MexicoTransferError();authenticateMexicoArchive(opts.material);const capabilities=validateMexicoCapabilities(opts.capabilities,opts.capabilities.context,new Date());equal(capabilities.context.descriptors,opts.material.descriptors);
 const output=mexicoArchiveOutputPath(opts.repoRoot,opts.outputDir),out=await reserveMexicoStateDirectory(opts.repoRoot,output),transport=opts.transport??createMexicoCapabilityTransport(capabilities,{readOnly:opts.mode==='readback',maxBytes:(opts.mode==='readback'?12:24)*1024*1024}),result:MexicoTransferReceipt={schemaVersion:1,mode:opts.mode,status:'unconfirmed',accepted:false,objects:[],ledger:transport.ledger,verification:null};
 if(opts.mode==='upload'){
  const batch=await inspectMexicoStateDirectory(opts.repoRoot,resolve(opts.repoRoot,contract.backupRoot,'private-acceptance-archive-20261018-r1'));
  for(const d of opts.material.descriptors){const bytes=Buffer.from(opts.material[d.role==='candidate'?'candidateBytes':d.role==='evidence'?'evidenceBytes':'manifestBytes']);
   // Durable attempt reservation precedes each possible PUT. A second output directory cannot authorize a repeated write.
   await writeMexicoStateFile(batch,'put-'+d.role+'-admission.json',json({schemaVersion:1,key:d.key,identity:d.identity,admittedAt:new Date().toISOString()}));
   try{await transport.putImmutable(d.key,bytes);}catch{/* Ambiguous acknowledgement is resolved by this capability's GET only. */}
   let verified=false;try{equal(identity(await transport.get(d.key,d.identity.bytes)),d.identity);verified=true;}catch{/* Never retry the PUT. */}
   result.objects.push({key:d.key,identity:d.identity,verified});if(!verified)break;
  }
  if(result.objects.length===3&&result.objects.every(o=>o.verified))result.status='staged-verified';
 }else{
  try{
   const pointerBytes=await transport.get(contract.currentKey,contract.limits.pointer),downloaded:MexicoArchiveMaterial={candidateBytes:Buffer.alloc(0),evidenceBytes:Buffer.alloc(0),manifestBytes:Buffer.alloc(0),descriptors:opts.material.descriptors};
   for(const d of opts.material.descriptors){const bytes=await transport.get(d.key,d.identity.bytes);equal(identity(bytes),d.identity);downloaded[d.role==='candidate'?'candidateBytes':d.role==='evidence'?'evidenceBytes':'manifestBytes']=bytes;result.objects.push({key:d.key,identity:d.identity,verified:true});}
   const pointer=verifyMexicoPointer(pointerBytes,downloaded),archiveDir=await reserveMexicoStateChild(out,'archive');for(const [name,b]of [['candidate.json',downloaded.candidateBytes],['evidence.json',downloaded.evidenceBytes],['manifest.json',downloaded.manifestBytes]] as const)await writeMexicoStateFile(archiveDir,name,b);
   await writeMexicoStateFile(out,'selected-pointer.json',pointerBytes);const recovery=await recoverMexicoAcceptedState({repoRoot:opts.repoRoot,outputDir:resolve(output,'isolated'),material:downloaded,pointer,verificationStage:'selected'});
   result.verification={schemaVersion:1,policyId:contract.policyId,countryCode:'2010',mode:'local-readback',status:'verified',archiveOutcome:'read-only-verified',currentStateVerified:true,pointer,pointerIdentity:identity(pointerBytes),recovery};result.status='readback-verified';result.accepted=true;
  }catch{/* Preserve partial private bytes and refuse an accepted readback claim. */}
 }
 result.ledger=transport.ledger;try{await writeMexicoStateFile(out,'transfer.json',json(result));}catch{throw new MexicoTransferReceiptError(result);}return result;
}
