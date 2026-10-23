export type MexicoDirection='imports'|'exports';
export interface MexicoOriginalSource {url:string;capturedAt:string;bytes:number;sha256:string}
export interface MexicoMonth {month:string;valueUsd:number|null;originalSource:MexicoOriginalSource|null}
export interface MexicoDirectionProfile {
 direction:MexicoDirection;measure:'GEN_VAL_MO'|'ALL_VAL_MO';
 basis:'general-imports-customs-value'|'domestic-plus-foreign-exports-fas-value';monthly:MexicoMonth[];
}
export interface MexicoLocalProfile {
 schemaVersion:1;countryCode:'2010';countryName:'Mexico';from:'2024-09';to:'2026-08';
 source:'fixture'|'census';presentation:'synthetic-local'|'accepted-private-local';
 acceptance:{releaseId:string;acceptedAt:string;scope:'private-all-goods'}|null;
 captureInterval:{startedAt:string;finishedAt:string};
 directions:Record<MexicoDirection,MexicoDirectionProfile>;
 qualifications:{
  currentBeforeMatched:48;currentAfterMatched:48;datedMatched:16;datedDifferences:32;
  differenceCause:'not-established';vintageRelationship:'not-established';
  classificationAccepted:false;productComparisonsAvailable:false;
  verificationBasis:'synthetic'|'prior-reviewed-retained-evidence';historicalFailuresPreserved:true;
 };
}
export interface MexicoSummaryPeriod {from:string;to:string;reportedMonths:number;totalUsd:number|null}
export interface MexicoDirectionSummary {
 latest:{month:string;valueUsd:number|null};prior:MexicoSummaryPeriod;current:MexicoSummaryPeriod;
 changeUsd:number|null;growthPercent:number|null;
}
export type MexicoPilotProfile=Omit<MexicoLocalProfile,'presentation'>&{presentation:'public-pilot-snapshot'|'public-pilot-fixture'};
export type MexicoProfileView=MexicoLocalProfile|MexicoPilotProfile;
