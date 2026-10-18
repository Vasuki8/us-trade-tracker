export type MexicoDirection='imports'|'exports';
export type MexicoSource='census'|'fixture';
export interface MexicoIdentity {bytes:number;sha256:string}
export interface MexicoObservation {id:string;month:string;direction:MexicoDirection;measure:'GEN_VAL_MO'|'ALL_VAL_MO';usd:number|null}
export interface MexicoQualifications {
 productComparisons:{available:false;ordinaryUnverified:17;statisticalExclusions:3;dispositions:{direction:string;code:string;status:'unverified'|'statistical-excluded'}[]};
 references:{currentBefore:{matched:48;mismatch:0};currentAfter:{matched:48;mismatch:0};dated:{matched:16;mismatch:32};differenceCause:'not-established';vintageRelationship:'not-established';originalPublicationBytesProven:false;currentBodyBytesEqual:false;currentBasisQualification:string};
 historical:{validContexts:26;stoppedContext:'imports-2025-09';stoppedContextSeconds:2828.093;executionLimitSeconds:60;preciseOverrunCause:'unverified';currentReferenceAgreementEstablished:false};
 retainedVerification:{normalizedRows:200855;globalDetailKeys:80011182;rowRecalculation:false;metadataEquality:'previous-exact-verification';outerGuardZeroMemory:'historical-placeholder'};
}
export interface VerifiedMexicoEvidence {source:MexicoSource;files:ReadonlyMap<string,Buffer>;observations:MexicoObservation[];captureInterval:{startedAt:string;finishedAt:string};qualifications:MexicoQualifications}
export interface MexicoPeriod {from:string;to:string;totalUsd:number|null}
export interface MexicoAllGoodsProjection {
 schemaVersion:1;policyId:string;sourcePolicyId:string;source:MexicoSource;countryCode:'2010';scope:'all-goods';from:'2024-09';to:'2026-08';
 classificationAccepted:false;releaseAccepted:false;publicMexicoProfile:false;
 observations:MexicoObservation[];periods:Record<MexicoDirection,{prior:MexicoPeriod;current:MexicoPeriod;growthPercent:number|null}>;
 productComparisons:MexicoQualifications['productComparisons'];qualifications:MexicoQualifications;
}
