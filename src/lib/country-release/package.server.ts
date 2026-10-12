import {canadaPreviewContract} from '../country-preview/contract.server';
import {verifyCountryEvidence} from './evidence.server';
import {canadaCountryReleaseContract as contract,countryKeys,countryJson,countryJsonBytes,countrySame as same,countryMemberNames,parseCountryDigest,countryTimestamp,countryCommit,validateCountryMetadata,digestCountryBytes} from './contract.server';
import type {VerifiedCountryEvidence,CandidateMetadata,CountryPackage,DecodedCountryPackage,CountryPackageManifest,MemberName,EvidenceName} from './types';
const reporting={from:'2024-09',to:'2026-08',latest:'2026-08'} as const;
const measures={imports:'GEN_VAL_MO',exports:'ALL_VAL_MO',units:'nominal-integer-USD',seasonallyAdjusted:false,transport:'all'} as const;
function manifest(value:unknown):CountryPackageManifest{
  const v=countryKeys(value,['schemaVersion','countryCode','source','sourcePolicyId','policyId','reporting','measures','captureInterval','sourceAssessmentCommit','releaseId','packagingCommit','preparedAt','members']);
  if(countryJsonBytes(v).length>contract.limits.manifest)throw new Error('country-manifest-limit');
  same(v.schemaVersion,1);same(v.countryCode,'1220');same(v.sourcePolicyId,contract.sourcePolicyId);same(v.policyId,contract.policyId);same(v.reporting,reporting);same(v.measures,measures);
  if(v.source!=='census'&&v.source!=='fixture')throw new Error('country-invalid-source');
  same(countryCommit(v.sourceAssessmentCommit),canadaPreviewContract.processingCommit);
  const c=countryKeys(v.captureInterval,['startedAt','finishedAt']),captureInterval={startedAt:countryTimestamp(c.startedAt),finishedAt:countryTimestamp(c.finishedAt)};
  if(captureInterval.startedAt>captureInterval.finishedAt)throw new Error('country-capture-order');
  const metadata=validateCountryMetadata({releaseId:v.releaseId as string,packagingCommit:v.packagingCommit as string,preparedAt:v.preparedAt as string});
  const names=countryMemberNames();if(!Array.isArray(v.members)||v.members.length!==11)throw new Error('country-member-count');let total=0;
  const members=v.members.map((x,i)=>{const m=countryKeys(x,['name','bytes','sha256']);same(m.name,names[i]);const d=parseCountryDigest({bytes:m.bytes,sha256:m.sha256},contract.limits.member);total+=d.bytes;return {name:names[i],...d};});
  if(total>contract.limits.decoded)throw new Error('country-decoded-limit');
  return {schemaVersion:1,countryCode:'1220',source:v.source,sourcePolicyId:contract.sourcePolicyId,policyId:contract.policyId,reporting,measures,captureInterval,sourceAssessmentCommit:canadaPreviewContract.processingCommit,...metadata,members};
}
function serialize(m:CountryPackageManifest,files:ReadonlyMap<MemberName,Buffer>):Buffer{return countryJsonBytes({manifest:m,files:m.members.map(x=>({name:x.name,base64:files.get(x.name)!.toString('base64')}))});}
export function packCountryRelease(evidence:VerifiedCountryEvidence,metadata:CandidateMetadata):CountryPackage{
  const verified=verifyCountryEvidence(evidence.files),files=new Map<MemberName,Buffer>(verified.files);
  files.set('research-data.json',countryJsonBytes(verified.projection));
  const m=manifest({schemaVersion:1,countryCode:'1220',source:verified.projection.source==='fixture'?'fixture':'census',sourcePolicyId:contract.sourcePolicyId,policyId:contract.policyId,reporting,measures,captureInterval:verified.projection.captureInterval,sourceAssessmentCommit:canadaPreviewContract.processingCommit,...validateCountryMetadata(metadata),members:countryMemberNames().map(name=>({name,...digestCountryBytes(files.get(name)!)}))});
  const bytes=serialize(m,files);if(bytes.length>contract.limits.package)throw new Error('country-package-limit');return {bytes,digest:digestCountryBytes(bytes),manifest:m};
}
export function decodeCountryRelease(input:Buffer):DecodedCountryPackage{
  if(!Buffer.isBuffer(input)||input.length>contract.limits.package)throw new Error('country-package-limit');const bytes=Buffer.from(input);
  const v=countryKeys(countryJson(bytes,contract.limits.package),['manifest','files']),m=manifest(v.manifest);
  if(!Array.isArray(v.files)||v.files.length!==11)throw new Error('country-member-count');const files=new Map<MemberName,Buffer>();
  for(let i=0;i<11;i++){
    const f=countryKeys(v.files[i],['name','base64']),d=m.members[i];same(f.name,d.name);
    if(typeof f.base64!=='string'||f.base64.length!==4*Math.ceil(d.bytes/3)||f.base64.length>4*Math.ceil(contract.limits.member/3)||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(f.base64))throw new Error('country-base64-limit');
    const body=Buffer.from(f.base64,'base64');same(body.toString('base64'),f.base64);same(digestCountryBytes(body),{bytes:d.bytes,sha256:d.sha256});files.set(d.name,body);
  }
  if(!serialize(m,files).equals(bytes))throw new Error('country-noncanonical-package');
  return {digest:digestCountryBytes(bytes),manifest:m,files};
}
export function verifyCountryRelease(decoded:DecodedCountryPackage):VerifiedCountryEvidence{
  // Reconstructing validates a mutable caller object as well as every member digest.
  const checked=decodeCountryRelease(serialize(manifest(decoded.manifest),decoded.files));same(checked.digest,decoded.digest);
  const evidence=verifyCountryEvidence(new Map(contract.pins.map(p=>[p.name,checked.files.get(p.name)!] as [EvidenceName,Buffer])));
  same(checked.manifest.source,evidence.projection.source==='fixture'?'fixture':'census');same(checked.manifest.captureInterval,evidence.projection.captureInterval);
  if(!countryJsonBytes(evidence.projection).equals(checked.files.get('research-data.json')!))throw new Error('country-projection-binding');return evidence;
}
