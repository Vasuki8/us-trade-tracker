import {equal,identity,json,keys,object,parse} from '../mexico-country-release/contract.server';
import {acceptanceDigest,acceptanceTime,authenticateMexicoAcceptance} from '../mexico-country-release/acceptance.server';
import {mexicoAcceptanceContract as acceptance} from '../mexico-country-release/acceptance-contract.server';
import type {MexicoAcceptanceAuthorization,MexicoAcceptanceInstrument,MexicoAcceptanceMaterial} from '../mexico-country-release/acceptance-types';
import type {MexicoIdentity} from '../mexico-country-release/types';
import {mexicoArchiveContract as contract} from './contract.server';
import type {MexicoAcceptedPointer,MexicoArchiveDescriptor,MexicoArchiveManifest,MexicoArchiveMaterial,MexicoArchiveReference,MexicoArchiveRole} from './types';

const objectLimit=(role:MexicoArchiveRole)=>contract.limits[role];
export function mexicoArchiveKey(role:MexicoArchiveRole,digest:MexicoIdentity):string {
 const checked=acceptanceDigest(digest,objectLimit(role));
 if(role==='candidate')equal(checked,acceptance.candidate,'archive-candidate');
 return contract.prefix+'objects/'+(role==='manifest'?'manifests':role)+'/'+checked.sha256+'.json';
}
function descriptor(value:unknown,role:MexicoArchiveRole):MexicoArchiveDescriptor {
 const v=object(value);keys(v,['role','key','identity']);equal(v.role,role);
 const digest=acceptanceDigest(v.identity,objectLimit(role));equal(v.key,mexicoArchiveKey(role,digest),'archive-key');return {role,key:String(v.key),identity:digest};
}
function reference(value:unknown,role:MexicoArchiveRole):MexicoArchiveReference {
 const v=object(value);keys(v,['key','identity']);const digest=acceptanceDigest(v.identity,objectLimit(role));equal(v.key,mexicoArchiveKey(role,digest),'archive-reference');return {key:String(v.key),identity:digest};
}
function boundedJson(bytes:Buffer,limit:number):Record<string,unknown>{if(!Buffer.isBuffer(bytes)||bytes.length<1||bytes.length>limit)throw Error('mexico-archive-size');return parse(bytes);}
const shared=()=>({schemaVersion:1 as const,policyId:contract.policyId,acceptancePolicyId:acceptance.policyId,countryCode:'2010' as const,scope:'all-goods' as const,source:'census' as const,from:'2024-09' as const,to:'2026-08' as const,releaseId:acceptance.releaseId});
function serialize(material:MexicoAcceptanceMaterial):MexicoArchiveMaterial {
 const candidateBytes=Buffer.from(material.candidateBytes),evidenceBytes=json({schemaVersion:1,policyId:contract.policyId,countryCode:'2010',scope:'all-goods',preservationDepth:contract.preservationDepth,instrument:material.instrument,files:acceptance.pins.map(p=>({name:p.name,base64:material.evidenceFiles.get(p.name)!.toString('base64')}))});
 if(evidenceBytes.length>contract.limits.evidence)throw Error('mexico-archive-evidence-limit');
 const objects:MexicoArchiveDescriptor[]=[{role:'candidate',key:mexicoArchiveKey('candidate',identity(candidateBytes)),identity:identity(candidateBytes)},{role:'evidence',key:mexicoArchiveKey('evidence',identity(evidenceBytes)),identity:identity(evidenceBytes)}];
 const manifest:MexicoArchiveManifest={...shared(),preservationDepth:contract.preservationDepth,projection:{...acceptance.projection},authorization:identity(json(material.instrument.authorization)),objects};
 const manifestBytes=json(manifest);if(manifestBytes.length>contract.limits.manifest||candidateBytes.length+evidenceBytes.length+manifestBytes.length+contract.limits.pointer>contract.limits.totalStored)throw Error('mexico-archive-total-limit');
 return {candidateBytes,evidenceBytes,manifestBytes,descriptors:[...objects,{role:'manifest',key:mexicoArchiveKey('manifest',identity(manifestBytes)),identity:identity(manifestBytes)}]};
}
export function buildMexicoArchive(material:MexicoAcceptanceMaterial):MexicoArchiveMaterial {
 const checked=authenticateMexicoAcceptance({candidateBytes:material.candidateBytes,evidenceFiles:material.evidenceFiles,authorization:material.instrument.authorization});
 equal(checked.instrument,material.instrument,'archive-instrument');equal(checked.projection,material.projection,'archive-projection');return serialize(checked);
}
export function parseMexicoArchiveManifest(bytes:Buffer):MexicoArchiveManifest {
 const v=boundedJson(bytes,contract.limits.manifest);keys(v,[...Object.keys(shared()),'preservationDepth','projection','authorization','objects']);
 for(const [name,value] of Object.entries(shared()))equal(v[name],value,'archive-manifest-'+name);
 equal(v.preservationDepth,contract.preservationDepth);equal(acceptanceDigest(v.projection,64*1024),acceptance.projection);
 if(!Array.isArray(v.objects)||v.objects.length!==2)throw Error('mexico-archive-object-set');
 const normalized:MexicoArchiveManifest={...shared(),preservationDepth:contract.preservationDepth,projection:{...acceptance.projection},authorization:acceptanceDigest(v.authorization,acceptance.limits.authorization),objects:[descriptor(v.objects[0],'candidate'),descriptor(v.objects[1],'evidence')]};
 equal(json(normalized),bytes,'archive-manifest-canonical');return normalized;
}
export function authenticateMexicoArchive(material:MexicoArchiveMaterial):MexicoAcceptanceMaterial {
 keys(object(material),['candidateBytes','evidenceBytes','manifestBytes','descriptors']);const manifest=parseMexicoArchiveManifest(material.manifestBytes);
 equal(identity(material.candidateBytes),manifest.objects[0].identity,'archive-candidate-body');equal(identity(material.evidenceBytes),manifest.objects[1].identity,'archive-evidence-body');
 const e=boundedJson(material.evidenceBytes,contract.limits.evidence);keys(e,['schemaVersion','policyId','countryCode','scope','preservationDepth','instrument','files']);equal(e.schemaVersion,1);equal(e.policyId,contract.policyId);equal(e.countryCode,'2010');equal(e.scope,'all-goods');equal(e.preservationDepth,contract.preservationDepth);
 const pins=acceptance.pins;if(!Array.isArray(e.files)||e.files.length!==pins.length)throw Error('mexico-archive-member-count');const files=new Map<string,Buffer>();let total=0;
 for(let i=0;i<pins.length;i++){const pin=pins[i],f=object(e.files[i]);keys(f,['name','base64']);equal(f.name,pin.name,'archive-member-order');if(typeof f.base64!=='string'||f.base64.length!==4*Math.ceil(pin.bytes/3))throw Error('mexico-archive-base64-length');const b=Buffer.from(f.base64,'base64');equal(b.toString('base64'),f.base64,'archive-base64');equal(identity(b),{bytes:pin.bytes,sha256:pin.sha256},'archive-member-identity');total+=b.length;if(total>contract.limits.evidence)throw Error('mexico-archive-decoded-limit');files.set(pin.name,b);}
 const instrument=object(e.instrument) as unknown as MexicoAcceptanceInstrument,checked=authenticateMexicoAcceptance({candidateBytes:material.candidateBytes,evidenceFiles:files,authorization:instrument.authorization as MexicoAcceptanceAuthorization});equal(checked.instrument,instrument,'archive-authorization');
 const rebuilt=serialize(checked);equal(rebuilt.evidenceBytes,material.evidenceBytes,'archive-envelope-canonical');equal(rebuilt.manifestBytes,material.manifestBytes,'archive-manifest');equal(rebuilt.descriptors,material.descriptors,'archive-descriptors');return checked;
}
/** This is only proposed selection data; remote confirmation belongs to verify.server. */
export function proposeMexicoAcceptedPointer(material:MexicoArchiveMaterial,acceptedAt:string):MexicoAcceptedPointer {
 const checked=authenticateMexicoArchive(material);acceptanceTime(acceptedAt);if(acceptedAt<checked.instrument.authorization.approvedAt)throw Error('mexico-archive-selection-time');
 const ref=(role:MexicoArchiveRole):MexicoArchiveReference=>{const d=material.descriptors.find(d=>d.role===role)!;return {key:d.key,identity:{...d.identity}};};
 return {...shared(),status:'accepted-private-all-goods',candidate:ref('candidate'),evidence:ref('evidence'),manifest:ref('manifest'),authorization:identity(json(checked.instrument.authorization)),acceptedAt,allGoodsAccepted:true,classificationAccepted:false,publicMexicoProfile:false,productComparisons:{available:false}};
}
export function parseMexicoAcceptedPointer(bytes:Buffer):MexicoAcceptedPointer {
 const p=boundedJson(bytes,contract.limits.pointer);keys(p,[...Object.keys(shared()),'status','candidate','evidence','manifest','authorization','acceptedAt','allGoodsAccepted','classificationAccepted','publicMexicoProfile','productComparisons']);
 for(const [name,value]of Object.entries(shared()))equal(p[name],value,'archive-pointer-'+name);
 equal(p.status,'accepted-private-all-goods');equal(p.allGoodsAccepted,true);equal(p.classificationAccepted,false);equal(p.publicMexicoProfile,false);equal(p.productComparisons,{available:false});
 const normalized:MexicoAcceptedPointer={...shared(),status:'accepted-private-all-goods',candidate:reference(p.candidate,'candidate'),evidence:reference(p.evidence,'evidence'),manifest:reference(p.manifest,'manifest'),authorization:acceptanceDigest(p.authorization,acceptance.limits.authorization),acceptedAt:acceptanceTime(p.acceptedAt),allGoodsAccepted:true,classificationAccepted:false,publicMexicoProfile:false,productComparisons:{available:false}};
 equal(json(normalized),bytes,'archive-pointer-canonical');return normalized;
}
export function verifyMexicoPointer(bytes:Buffer,material:MexicoArchiveMaterial):MexicoAcceptedPointer {
 const pointer=parseMexicoAcceptedPointer(bytes),expected=proposeMexicoAcceptedPointer(material,pointer.acceptedAt);equal(pointer,expected,'archive-selected-binding');return pointer;
}
