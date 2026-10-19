import {acceptanceDigest,acceptanceTime} from '../mexico-country-release/acceptance.server';
import {equal,identity,json,keys,object,parse} from '../mexico-country-release/contract.server';
import type {MexicoCapabilityContext} from './capabilities.server';
/** The operator must obtain proof from independent provider inspection. Encryption cannot authenticate its sender. */
export function authenticateMexicoCapabilityArtifact(opts:{ciphertext:Buffer;metadata:Buffer;proof:unknown}):{context:MexicoCapabilityContext;trustedCiphertextIdentity:{bytes:number;sha256:string}}{
 try{
  if(!Buffer.isBuffer(opts.ciphertext)||!Buffer.isBuffer(opts.metadata)||opts.metadata.length>16*1024||opts.ciphertext.length+opts.metadata.length>128*1024)throw Error('artifact-limit');
  const m=parse(opts.metadata);keys(m,['schemaVersion','context','ciphertext']);equal(m.schemaVersion,1);equal(json(m),opts.metadata);equal(acceptanceDigest(m.ciphertext,128*1024),identity(opts.ciphertext));
  const p=object(opts.proof);keys(p,['schemaVersion','status','observedAt','repository','workflowPath','headSha','runId','runAttempt','conclusion','artifactId','artifactName','expired','zipIdentity','extraction']);equal(p.schemaVersion,1);equal(p.status,'provider-authenticated');acceptanceTime(p.observedAt);equal(p.repository,'Vasuki8/us-trade-tracker');equal(p.workflowPath,'.github/workflows/mexico-archive-capabilities.yml');equal(p.conclusion,'success');equal(p.artifactName,'mexico-2010-encrypted-capabilities');equal(p.expired,false);
  if(typeof p.headSha!=='string'||!/^[a-f0-9]{40}$/.test(p.headSha))throw Error('head');for(const n of [p.runId,p.runAttempt,p.artifactId])if(typeof n!=='string'||!/^[1-9][0-9]{0,19}$/.test(n))throw Error('provider-id');
  const context=object(m.context);for(const k of ['repository','workflowPath','headSha','runId','runAttempt'])equal(context[k],p[k]);
  const extraction=object(p.extraction);keys(extraction,['zipIdentity','members']);equal(acceptanceDigest(p.zipIdentity,256*1024),acceptanceDigest(extraction.zipIdentity,256*1024));equal(extraction.members,[{name:'ciphertext.json',...identity(opts.ciphertext)},{name:'metadata.json',...identity(opts.metadata)}]);
  return {context:context as unknown as MexicoCapabilityContext,trustedCiphertextIdentity:identity(opts.ciphertext)};
 }catch{throw Error('mexico-capability-artifact-failed');}
}
