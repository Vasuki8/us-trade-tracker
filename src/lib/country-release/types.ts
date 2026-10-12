import type {FileIdentity} from '../../../scripts/country-snapshot-types';
import type {CountryPreview} from '../country-preview/types';
export type EvidenceName='assessment.json'|'classification-ledger.json'|'bulk-report.json'|'original-manifest.json'|'offline-replay.json'|'inventory-review.json'|'classification-review.json'|'citation-correction.json'|'calculation-review.json'|'continuity-evidence.json';
export type MemberName=EvidenceName|'research-data.json';
export type Digest={bytes:number;sha256:string};
export type MemberPin=Digest&{name:EvidenceName;path:string};
export type CandidateMetadata={releaseId:string;packagingCommit:string;preparedAt:string};
export type CountryPackageManifest=CandidateMetadata&{
  schemaVersion:1;countryCode:'1220';source:'census'|'fixture';
  sourcePolicyId:'canada-archive-snapshot-v1';policyId:'canada-country-release-v1';
  reporting:{from:'2024-09';to:'2026-08';latest:'2026-08'};
  measures:{imports:'GEN_VAL_MO';exports:'ALL_VAL_MO';units:'nominal-integer-USD';seasonallyAdjusted:false;transport:'all'};
  captureInterval:{startedAt:string;finishedAt:string};sourceAssessmentCommit:string;
  members:readonly (Digest&{name:MemberName})[];
};
export type VerifiedCountryEvidence={files:ReadonlyMap<EvidenceName,Buffer>;projection:CountryPreview};
export type CountryPackage={bytes:Buffer;digest:Digest;manifest:CountryPackageManifest};
export type DecodedCountryPackage={digest:Digest;manifest:CountryPackageManifest;files:ReadonlyMap<MemberName,Buffer>};
export type GateId='assessmentAuthenticated'|'replayEvidenceAuthenticated'|'classificationScopeQualified'|'referenceQualificationsRecorded'|'projectionVerified'|'recoveryVerified'|'reviewAndPreservationVerified';
export type GateStatus='passed'|'failed'|'pending';
export type CountryGateReport={schemaVersion:1;policyId:'canada-country-release-v1';candidateDigest:Digest;packagingCommit:string;source:'census'|'fixture';gates:Record<GateId,GateStatus>;status:'ineligible'|'verification-pending'|'eligible'|'fixture-only';sourceQualifications:{strictAuditVerdicts:{original:{sourceCoverage:'failed';diagnosticOutcome:'failed';classificationStatus:'unverified'};inventory:{sourceCoverage:'failed'}};references:{before:{matched:41;mismatch:7};after:{matched:41;mismatch:7};publication:{matched:7;notReviewed:41};quantumUsd:100000};selectedCategories:20;qualifiedComparisons:17;statisticalExclusions:3;rawVerification:'previous-reviewed-replay';revisionDates:'unknown'};diagnosticCodes:readonly string[]};
export type CountryRecoveryReceipt={schemaVersion:1;candidateDigest:Digest;projectionDigest:Digest;policyId:'canada-country-release-v1';status:'verified'|'failed';historicalPathReads:0};
export type CountryVerificationProof={
  schemaVersion:1;policyId:'canada-country-release-v1';candidateDigest:Digest;packagingCommit:string;
  recovery:CountryRecoveryReceipt;
  preservation:{before:readonly FileIdentity[];after:readonly FileIdentity[]};
  checks:{
    unit:{passed:number;failed:0;logSha256:string};
    types:{files:number;errors:0;warnings:0;hints:0;logSha256:string};
    browser:{ordinaryPassed:number;canadaPassed:number;failed:0;logSha256:string};
    normalBuild:{previewAbsent:true;fileCount:number;totalBytes:number;logSha256:string};
  };
  review:{reviewedHead:string;verdict:'passed'|'with-fixes-resolved';report:string;reportSha256:string;unresolvedFindingIds:readonly [];findingDispositions:readonly {id:string;decision:'fixed'|'outside-scope';reason:string;evidenceSha256:string}[]};
  ci:{repository:'Vasuki8/us-trade-tracker';runId:number;headCommit:string;testedMergeCommit:string;testedTree:string;conclusion:'success';logSha256:string};
  runtimeComparison:{fromCommit:string;toCommit:string;changedPaths:readonly string[]};
};
export type CountryApproval={scope:'local-selection-only';actor:'owner';approvedAt:string;candidateDigest:Digest;eligibilityReportDigest:Digest;baseline:{kind:'initialize'}|{kind:'existing';pointerDigest:Digest}};
export type CountryAcceptanceRecord={schemaVersion:1;decision:'approved-for-local-selection';approval:CountryApproval;report:CountryGateReport;proof:CountryVerificationProof};
export type CountryCurrentPointer={schemaVersion:1;countryCode:'1220';releaseId:string;package:Digest&{path:string};acceptance:Digest&{path:string}};
export type CountrySelectionOutcome={status:'acknowledged'|'confirmed-by-readback'|'already-selected'|'unchanged'|'conflict'|'unconfirmed';candidateDigest:Digest;currentStateVerified:boolean};
export class CountrySelectionReceiptError extends Error{
  constructor(public readonly outcome:CountrySelectionOutcome){super('country-selection-receipt-failed');this.name='CountrySelectionReceiptError';}
}
