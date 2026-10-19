import type {MexicoAllGoodsProjection,MexicoIdentity,MexicoQualifications} from './types';
export interface MexicoAcceptanceAuthorization {
 schemaVersion:1;policyId:'mexico-private-all-goods-acceptance-v1';actor:'owner';scope:'private-all-goods-acceptance-and-recovery';
 approvedAt:string;approvedPlan:MexicoIdentity;approvedInputs:MexicoIdentity;candidate:MexicoIdentity;eligibility:MexicoIdentity;operatorProof:MexicoIdentity;
 baseline:'absent';instruction:string;classificationAccepted:false;productComparisonsAvailable:false;publicMexicoProfile:false;
}
export interface MexicoAcceptanceInstrument {
 schemaVersion:1;policyId:'mexico-private-all-goods-acceptance-v1';countryCode:'2010';scope:'all-goods';source:'census';
 from:'2024-09';to:'2026-08';releaseId:string;decision:'owner-authorized-for-private-all-goods';
 candidate:MexicoIdentity;projection:MexicoIdentity;eligibility:MexicoIdentity;operatorProof:MexicoIdentity;
 authorization:MexicoAcceptanceAuthorization;qualifications:MexicoQualifications;
 classificationAccepted:false;publicMexicoProfile:false;productComparisons:{available:false};
}
export interface MexicoAcceptanceInputs {candidateBytes:Buffer;evidenceFiles:ReadonlyMap<string,Buffer>;authorization:MexicoAcceptanceAuthorization}
export interface MexicoAcceptanceMaterial {candidateBytes:Buffer;instrument:MexicoAcceptanceInstrument;evidenceFiles:ReadonlyMap<string,Buffer>;projection:MexicoAllGoodsProjection}
