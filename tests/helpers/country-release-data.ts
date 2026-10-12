import {createHash} from 'node:crypto';
import {vi} from 'vitest';
import {makeCountryAssessmentFixture} from './country-preview-data';
import {canadaCountryReleaseContract as contract} from '../../src/lib/country-release/contract.server';
import {canadaPreviewContract} from '../../src/lib/country-preview/contract.server';
import * as projector from '../../src/lib/country-preview/project.server';
import type {CandidateMetadata,EvidenceName,MemberPin} from '../../src/lib/country-release/types';
export const releaseEvidenceNames:EvidenceName[]=['assessment.json','classification-ledger.json','bulk-report.json','original-manifest.json','offline-replay.json','inventory-review.json','classification-review.json','citation-correction.json','calculation-review.json','continuity-evidence.json'];
export const fixtureDigest=(body:Buffer)=>({bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')});
const body=(value:unknown)=>Buffer.from(JSON.stringify(value)+'\n');
// Entirely synthetic. No retained files or production calculations supply expected amounts.
export function makeCountryReleaseEvidenceFixture():ReadonlyMap<EvidenceName,Buffer>{
  const a=makeCountryAssessmentFixture();
  const ledger=body({schemaVersion:1,policyId:a.policyId,entries:a.candidates.flatMap(c=>c.classification?[c.classification]:[])});
  const identity=(name:EvidenceName,b:Buffer)=>({path:'source/'+name,...fixtureDigest(b)});
  a.classificationLedgerIdentity=identity('classification-ledger.json',ledger);
  a.strictAuditVerdicts={original:{sourceCoverage:'failed',diagnosticOutcome:'failed',classificationStatus:'unverified'},inventory:{sourceCoverage:'failed'}};
  a.inputProvenance.strictAuditVerdicts=a.strictAuditVerdicts;
  const contexts=a.months.map((m,i)=>({...m,hs6Rows:i===0?35049:4000,state:'validated',original:a.inputProvenance.originals[i],worker:{files:{rows:{path:m.id+'-hs6.json',bytes:100,sha256:'b'.repeat(64)},receipt:{path:m.id+'-receipt.json',bytes:100,sha256:'b'.repeat(64)}}},beforeComparison:m.beforeReference.recordedComparison,afterComparison:m.afterReference.recordedComparison}));
  a.inputProvenance.normalizedFiles=contexts.flatMap(c=>Object.values(c.worker.files).map(f=>({...f,path:'normalized/'+f.path})));
  const bulk=body({processingCommit:'a'.repeat(40),sourceCoverage:'failed',diagnosticOutcome:'failed',classificationStatus:'unverified',contexts,releaseAccepted:false,rollingComparisonsAvailable:false,defaultAuditRetrievalChanged:false});
  const manifest=body({processingCommit:'a'.repeat(40),requests:a.inputProvenance.originals});
  const replay=body({sourceProcessingCommit:'a'.repeat(40),parserProcessingCommit:'b'.repeat(40),sourceCoverage:'failed',contexts,releaseAccepted:false,rollingComparisonsAvailable:false,defaultAuditRetrievalChanged:false});
  const inventory=body({sourceProcessingCommit:'a'.repeat(40),parserProcessingCommit:'b'.repeat(40),verdict:'all48-arithmetic-verified-source-coverage-still-failed',findings:[],offlineReportIdentity:{file:'offline-replay.json',...fixtureDigest(replay)},contexts:contexts.map(c=>({id:c.id,sumUsd:c.sumUsd,countryTotalUsd:c.countryTotalUsd,hs6Rows:c.hs6Rows,residualUsd:0,allNormalizedRowsMatched:true,maintainedOutputs:Object.values(c.worker.files).map(f=>({file:f.path,bytes:f.bytes,sha256:f.sha256}))})),releaseAccepted:false,rollingComparisonsAvailable:false,defaultAuditRetrievalChanged:false});
  a.inputProvenance.anchors=[identity('bulk-report.json',bulk),identity('original-manifest.json',manifest),identity('offline-replay.json',replay),identity('inventory-review.json',inventory)];
  const review=body({head:'d'.repeat(40),assessment:{readyToIntegrate:'with fixes',semanticVerdict:'all17 compatible within fixed interval'},issues:{critical:[],important:[{id:'R1'}],minor:[]},entryVerdicts:a.candidates.flatMap(c=>c.classification?[{direction:c.direction,code:c.code,from:'2024-09',to:'2026-08',semanticVerdict:'compatible'}]:[])});
  const correction=body({status:'passed',reviewedCommit:'d'.repeat(40),reviewReceipt:identity('classification-review.json',review),correctedLedger:a.classificationLedgerIdentity,correctedLocatorCount:72,semanticConclusionsChanged:false,sourceBodiesChanged:false,finding:'R1'});
  const assessment=body(a);
  const calc=body({verdict:'passed',findings:[],reviewedProcessingCommit:a.processingCommit,outputIdentities:[identity('assessment.json',assessment)],classificationLedgerIdentity:a.classificationLedgerIdentity,classificationBasis:{reviewReceiptIdentity:identity('classification-review.json',review),reviewedSourceCommit:'d'.repeat(40),semanticAndSourceIdentitiesUnchanged:true},counts:{contexts:48,normalizedRows:223049,eligibleCandidates:17,statisticalCandidates:3},monthlyRecalculation:contexts.map(c=>({id:c.id,rows:c.hs6Rows,sumUsd:c.sumUsd,countryTotalUsd:c.countryTotalUsd,residualUsd:0})),candidateRecalculation:a.candidates.map(c=>({direction:c.direction,code:c.code,comparisonEligible:c.comparisonEligible,windows:{prior:{numeratorUsd:c.prior.observedSumUsd,denominatorUsd:c.prior.countryTotalUsd,reportedMonths:12,qualifiedSharePercent:c.prior.sharePercent},current:{numeratorUsd:c.current.observedSumUsd,denominatorUsd:c.current.countryTotalUsd,reportedMonths:12,qualifiedSharePercent:c.current.sharePercent}},growthPercent:c.growthPercent,sharePointChange:c.sharePointChange}))});
  const continuity=body({countryCode:'1220',from:'2024-09',to:'2026-08',compatibleCount:17,correctedLedgerIdentity:a.classificationLedgerIdentity,independentClassificationReview:{receipt:identity('classification-review.json',review),verdict:'with fixes'},reviewFindingDisposition:{id:'R1',status:'corrected',correctionReceipt:identity('citation-correction.json',correction),semanticConclusionsChanged:false,sourceBodiesChanged:false},independentCalculationVerification:{receipt:identity('calculation-review.json',calc),verdict:'passed'},releaseAccepted:false,rollingComparisonsAvailable:false,defaultAuditRetrievalChanged:false});
  return new Map(releaseEvidenceNames.map((name,i)=>[name,[assessment,ledger,bulk,manifest,replay,inventory,review,correction,calc,continuity][i]]));
}
export function makeCountryReleaseMetadataFixture():CandidateMetadata{return {releaseId:'2026-08-00000000-0000-4000-8000-000000000001',packagingCommit:'e'.repeat(40),preparedAt:'2026-10-12T00:00:00.000Z'};}
// Test-only pin replacement and provenance marking. There is no runtime override.
export function mockCountryReleaseEvidence(files:ReadonlyMap<EvidenceName,Buffer>){
  const pins:MemberPin[]=releaseEvidenceNames.map(name=>({name,path:'source/'+name,...fixtureDigest(files.get(name)!)}));
  vi.spyOn(contract,'pins','get').mockReturnValue(pins);
  vi.spyOn(canadaPreviewContract,'ledger','get').mockReturnValue({path:'source/classification-ledger.json',...fixtureDigest(files.get('classification-ledger.json')!)} as unknown as typeof canadaPreviewContract.ledger);
  const project=projector.projectRetainedAssessment;
  const projection={...project(JSON.parse(files.get('assessment.json')!.toString())),source:'fixture' as const,rawVerification:'synthetic' as const};
  vi.spyOn(projector,'projectRetainedAssessment').mockImplementation(value=>({...project(value),source:'fixture',rawVerification:'synthetic'}));
  vi.spyOn(contract,'projection','get').mockReturnValue(fixtureDigest(body(projection)));
  return pins;
}
