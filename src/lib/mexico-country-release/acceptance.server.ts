import {checkIdentity,equal,identity,json,keys,object,parse} from './contract.server';
import {decodeMexicoCandidate,verifyMexicoCandidate} from './package.server';
import {finalizeMexicoEligibility} from './recovery.server';
import {mexicoAcceptanceContract as contract} from './acceptance-contract.server';
import type {MexicoIdentity,MexicoVerificationProof} from './types';
import type {MexicoAcceptanceAuthorization,MexicoAcceptanceInputs,MexicoAcceptanceInstrument,MexicoAcceptanceMaterial} from './acceptance-types';

export function acceptanceDigest(value:unknown,limit=24*1024*1024):MexicoIdentity {
 const v=object(value);keys(v,['bytes','sha256']);
 if(typeof v.bytes!=='number'||!Number.isSafeInteger(v.bytes)||v.bytes<1||v.bytes>limit||typeof v.sha256!=='string'||!/^[a-f0-9]{64}$/.test(v.sha256)||/^0+$/.test(v.sha256))throw Error('mexico-acceptance-identity');
 return {bytes:v.bytes,sha256:v.sha256};
}
export function acceptanceTime(value:unknown):string {
 if(typeof value!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString()!==value)throw Error('mexico-acceptance-time');return value;
}
export function parseMexicoAuthorization(value:unknown):MexicoAcceptanceAuthorization {
 const a=object(value);keys(a,['schemaVersion','policyId','actor','scope','approvedAt','approvedPlan','approvedInputs','candidate','eligibility','operatorProof','baseline','instruction','classificationAccepted','productComparisonsAvailable','publicMexicoProfile']);
 equal(a.schemaVersion,1);equal(a.policyId,contract.policyId);equal(a.actor,'owner');equal(a.scope,'private-all-goods-acceptance-and-recovery');equal(a.baseline,'absent');
 acceptanceTime(a.approvedAt);equal(acceptanceDigest(a.approvedPlan,1024*1024),contract.plan);equal(acceptanceDigest(a.approvedInputs,256*1024),contract.inputs);
 for(const field of ['candidate','eligibility','operatorProof'])acceptanceDigest(a[field]);
 for(const field of ['classificationAccepted','productComparisonsAvailable','publicMexicoProfile'])equal(a[field],false,'withheld');
 if(typeof a.instruction!=='string'||a.instruction.trim().length<40||a.instruction.length>8192||json(a).length>contract.limits.authorization)throw Error('mexico-acceptance-instruction');
 return structuredClone(a) as unknown as MexicoAcceptanceAuthorization;
}
/** Exact approved bytes + trusted owner authorization, not independent proof of an external provider. */
export function authenticateMexicoAcceptance(inputs:MexicoAcceptanceInputs):MexicoAcceptanceMaterial {
 keys(object(inputs),['candidateBytes','evidenceFiles','authorization']);
 if(!Buffer.isBuffer(inputs.candidateBytes)||!inputs.evidenceFiles||typeof inputs.evidenceFiles.get!=='function')throw Error('mexico-acceptance-input');
 const candidateBytes=Buffer.from(inputs.candidateBytes);equal(identity(candidateBytes),contract.candidate,'acceptance-candidate');
 const pins=contract.pins;equal(inputs.evidenceFiles.size,pins.length,'acceptance-evidence-count');
 const files=new Map<string,Buffer>();let bytes=0;
 for(const p of pins){const b=inputs.evidenceFiles.get(p.name);if(!Buffer.isBuffer(b))throw Error('mexico-acceptance-evidence-missing');checkIdentity(identity(b),p);bytes+=b.length;if(bytes>contract.limits.evidence)throw Error('mexico-acceptance-evidence-limit');files.set(p.name,Buffer.from(b));}
 const decoded=decodeMexicoCandidate(candidateBytes),verified=verifyMexicoCandidate(decoded),projection=verified.projection;
 equal(decoded.manifest.source,'census');equal(decoded.manifest.packagingCommit,contract.packagingCommit);equal(decoded.manifest.releaseId,contract.releaseId);checkIdentity(identity(decoded.files.get('research-data.json')!),contract.projection);
 const proofBytes=files.get('prior/operator-verification-proof.json')!,eligibilityBytes=files.get('prior/candidate-eligibility.json')!;
 const proof=parse(proofBytes) as unknown as MexicoVerificationProof,report=finalizeMexicoEligibility(candidateBytes,proof);
 equal(proof.reviewedCommit,contract.reviewedCommit);equal(report.status,'eligible');equal(parse(eligibilityBytes),report,'acceptance-eligible-report');
 const decision=parse(files.get('prior/eligibility-decision.json')!);equal(decision.status,'eligible');checkIdentity(decision.candidate,contract.candidate);checkIdentity(decision.projection,contract.projection);equal(decision.packagingCommit,contract.packagingCommit);equal(decision.reviewedCommit,contract.reviewedCommit);
 const authorization=parseMexicoAuthorization(inputs.authorization);checkIdentity(authorization.candidate,contract.candidate);checkIdentity(authorization.eligibility,identity(eligibilityBytes));checkIdentity(authorization.operatorProof,identity(proofBytes));
 if(authorization.approvedAt<decoded.manifest.preparedAt)throw Error('mexico-acceptance-approval-precedes-candidate');
 equal(projection.classificationAccepted,false);equal(projection.releaseAccepted,false);equal(projection.publicMexicoProfile,false);equal(projection.productComparisons.available,false);equal(projection.productComparisons.ordinaryUnverified,17);equal(projection.productComparisons.statisticalExclusions,3);equal(projection.productComparisons.dispositions.length,20);
 equal(projection.qualifications.references.dated,{matched:16,mismatch:32});equal(projection.qualifications.references.differenceCause,'not-established');equal(projection.qualifications.references.vintageRelationship,'not-established');
 const instrument:MexicoAcceptanceInstrument={schemaVersion:1,policyId:contract.policyId,countryCode:'2010',scope:'all-goods',source:'census',from:'2024-09',to:'2026-08',releaseId:decoded.manifest.releaseId,decision:'owner-authorized-for-private-all-goods',candidate:{...contract.candidate},projection:{...contract.projection},eligibility:identity(eligibilityBytes),operatorProof:identity(proofBytes),authorization,qualifications:structuredClone(projection.qualifications),classificationAccepted:false,publicMexicoProfile:false,productComparisons:{available:false}};
 if(json(instrument).length>contract.limits.instrument)throw Error('mexico-acceptance-instrument-limit');
 return {candidateBytes,instrument,evidenceFiles:files,projection:structuredClone(projection)};
}
