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
export interface MexicoCandidateMetadata {releaseId:string;packagingCommit:string;preparedAt:string}
export interface MexicoManifest extends MexicoCandidateMetadata {
 schemaVersion:1;countryCode:'2010';scope:'all-goods';policyId:string;sourcePolicyId:string;source:MexicoSource;
 from:'2024-09';to:'2026-08';measures:{imports:'GEN_VAL_MO';exports:'ALL_VAL_MO'};sourceAssessmentCommit:string;
 captureInterval:{startedAt:string;finishedAt:string};members:({name:string}&MexicoIdentity)[];
}
export type MexicoGate='retainedEvidenceAuthenticated'|'allGoodsControlsVerified'|'referenceQualificationsPreserved'|'productComparisonsWithheld'|'projectionVerified'|'portableRecoveryVerified'|'reviewAndPreservationVerified';
export interface MexicoGateReport {
 schemaVersion:1;policyId:string;countryCode:'2010';candidate:MexicoIdentity;projection:MexicoIdentity;
 source:MexicoSource;status:'verification-pending'|'fixture-only'|'eligible'|'ineligible';gates:Record<MexicoGate,'passed'|'pending'|'failed'>;
 classificationAccepted:false;releaseAccepted:false;publicMexicoProfile:false;productComparisons:{available:false};
}
export interface DecodedMexicoCandidate {manifest:MexicoManifest;files:Map<string,Buffer>}
export interface MexicoCandidatePackage extends DecodedMexicoCandidate {bytes:Buffer;digest:MexicoIdentity}
export interface MexicoPreparedCandidate {package:MexicoCandidatePackage;report:MexicoGateReport}
export interface MexicoRecoveryReceipt {schemaVersion:1;policyId:string;countryCode:'2010';source:MexicoSource;candidate:MexicoIdentity;projection:MexicoIdentity;status:'verified';historicalPathReads:0;recoveryId:string;recoveredAt:string}
export interface MexicoVerificationProof {
 schemaVersion:number;source:MexicoSource;candidate:MexicoIdentity;projection:MexicoIdentity;packagingCommit:string;reviewedCommit:string;
 runtimeComparison:{from:string;to:string;unchangedRuntime:boolean;documentationOnly:boolean;identity:MexicoIdentity};
 recoveries:{role:string;receipt:MexicoRecoveryReceipt;identity:MexicoIdentity}[];
 calculation:{status:string;candidate:MexicoIdentity;projection:MexicoIdentity;observations:number;periodTotals:number;growthResults:number;productComparisonsWithheld:boolean;identity:MexicoIdentity};
 preservation:{before:{identity:MexicoIdentity;count:number};after:{identity:MexicoIdentity;count:number};unchanged:boolean};
 review:{status:string;headCommit:string;identity:MexicoIdentity};ci:{status:string;headCommit:string;identity:MexicoIdentity};
 checks:{unitTests:boolean;typeCheck:boolean;normalBuild:boolean;routeExclusion:boolean;supervisor:boolean};
}
