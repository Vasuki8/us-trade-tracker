export type SnapshotDirection = 'imports'|'exports';
export type FileIdentity = {path:string;bytes:number;sha256:string};
export type SnapshotRow = {code:string;description:string|null;valueUsd:number;detailRecordCount:number;specialAtCapture:boolean};
export type ContextIdentity = {id:string;month:string;direction:SnapshotDirection;measure:'GEN_VAL_MO'|'ALL_VAL_MO'};
export type ReferenceEvidence = {
  currentUsd:number;publicationUsd:number|undefined;quantumUsd:100000;
  sourceFiles:readonly FileIdentity[];sourceUrl:string;capturedAt:string;
  publicationSource:Record<string,unknown>|null;recordedComparison:Record<string,unknown>;
};
export type ReviewedContext = ContextIdentity & {
  original:Record<string,unknown>;rowsFile:FileIdentity;receiptFile:FileIdentity;
  expectedSumUsd:number;expectedCountryTotalUsd:number;expectedRows:number;
  beforeReference:ReferenceEvidence;afterReference:ReferenceEvidence;
};
export type ReviewedCollection = {
  policyId:'canada-archive-snapshot-v1';repoRoot:string;anchors:readonly FileIdentity[];
  sourceProcessingCommit:string;parserProcessingCommit:string;
  captureInterval:{startedAt:string;finishedAt:string};rawVerification:'previous-reviewed-replay';
  strictAuditVerdicts:Record<string,unknown>;snapshotStability:unknown;
  contexts:readonly ReviewedContext[];
};
export type SnapshotContext = ContextIdentity & {
  countryTotalUsd:number;rows:readonly SnapshotRow[];
  beforeReference:ReferenceEvidence;afterReference:ReferenceEvidence;
};
export type ClassificationSource=FileIdentity & {url:string;locator:string;kind:'definition-and-notes'|'dated-change'|'historical-code-screen'|'annual-concordance'};
export type ClassificationEntry={direction:SnapshotDirection;code:string;from:string;to:string;status:'compatible'|'incompatible'|'unverified';reason:string;sources:readonly ClassificationSource[];scopeConclusion:string};
export type ReferenceResult=ReferenceEvidence & {referenceCheck:'matched'|'mismatch'|'unavailable';publicationCheck:'matched'|'mismatch'|'unavailable'|'not-reviewed';referenceCorroboration:'current-table'|'original-publication-only'|'none';currentDifferenceUsd:number|null;publicationDifferenceUsd:number|null};
export type MonthlySnapshotAssessment=ContextIdentity & {sumUsd:number;countryTotalUsd:number;residualUsd:number;beforeReference:ReferenceResult;afterReference:ReferenceResult};
export type CandidateMonth={month:string;valueUsd:number|null;countryTotalUsd:number|null;specialAtCapture:boolean|null;specialByPolicy:boolean;sharePercent:number|null};
export type CandidatePeriod={from:string;to:string;reportedMonths:number;observedSumUsd:number|null;countryTotalUsd:number|null;sharePercent:number|null};
export type SnapshotCandidate={direction:SnapshotDirection;code:string;description:string|null;months:readonly CandidateMonth[];classification:ClassificationEntry|null;comparisonEligible:boolean;reason:string;current:CandidatePeriod;prior:CandidatePeriod;growthPercent:number|null;sharePointChange:number|null};
export type SnapshotAssessment={
  schemaVersion:1;policyId:'canada-archive-snapshot-v1';completed:boolean;archiveIntegrity:'passed'|'failed';failureReason:string|null;
  processingCommit:string|null;inputProvenance:Omit<ReviewedCollection,'contexts'|'repoRoot'> & {originals:readonly Record<string,unknown>[];normalizedFiles:readonly FileIdentity[]};
  strictAuditVerdicts:Record<string,unknown>;months:readonly MonthlySnapshotAssessment[];candidates:readonly SnapshotCandidate[];
  classificationLedgerIdentity:FileIdentity|null;releaseAccepted:false;rollingComparisonsAvailable:false;defaultAuditRetrievalChanged:false;
};
