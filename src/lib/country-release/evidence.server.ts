import {readSnapshotFile} from '../../../scripts/country-snapshot-input';
import {validateRetainedAssessment,projectRetainedAssessment} from '../country-preview/project.server';
import {canadaCountryReleaseContract as contract,countryJson,countryJsonBytes,countryObject as obj,countrySame as same,digestCountryBytes,countryInteger} from './contract.server';
import type {EvidenceName,VerifiedCountryEvidence} from './types';
const array=(value:unknown):unknown[]=>{if(!Array.isArray(value))throw new Error('country-invalid-grid');return value;};
const flags=(v:Record<string,unknown>)=>{for(const k of ['releaseAccepted','rollingComparisonsAvailable','defaultAuditRetrievalChanged'])same(v[k],false);};
function grid(value:unknown):Map<string,Record<string,unknown>>{const values=array(value).map(obj),map=new Map(values.map(c=>[String(c.id),c]));if(map.size!==48||values.length!==48)throw new Error('country-incomplete-grid');return map;}
export async function readCountryReleaseEvidence(repoRoot:string):Promise<VerifiedCountryEvidence>{
  const files=new Map<EvidenceName,Buffer>();
  for(const p of contract.pins){if(p.bytes>contract.limits.member)throw new Error('country-member-limit');files.set(p.name,await readSnapshotFile(repoRoot,p));}
  return verifyCountryEvidence(files);
}
export function verifyCountryEvidence(input:ReadonlyMap<EvidenceName,Buffer>):VerifiedCountryEvidence{
  if(input.size!==10)throw new Error('country-evidence-count');
  const files=new Map<EvidenceName,Buffer>(),parsed=new Map<EvidenceName,Record<string,unknown>>();
  for(const p of contract.pins){const body=input.get(p.name);if(!Buffer.isBuffer(body)||body.length>contract.limits.member)throw new Error('country-member-limit');const owned=Buffer.from(body);same(digestCountryBytes(owned),{bytes:p.bytes,sha256:p.sha256});files.set(p.name,owned);parsed.set(p.name,obj(countryJson(owned,contract.limits.member)));}
  const get=(name:EvidenceName)=>parsed.get(name)!;
  const identity=(name:EvidenceName)=>{const p=contract.pins.find(p=>p.name===name)!;return {path:p.path,bytes:p.bytes,sha256:p.sha256};};
  const a=validateRetainedAssessment(get('assessment.json')),ledger=get('classification-ledger.json'),bulk=get('bulk-report.json'),manifest=get('original-manifest.json'),replay=get('offline-replay.json'),inventory=get('inventory-review.json');
  const source=a.inputProvenance.sourceProcessingCommit,parser=a.inputProvenance.parserProcessingCommit;
  for(const c of [bulk.processingCommit,manifest.processingCommit,replay.sourceProcessingCommit,inventory.sourceProcessingCommit])same(c,source);
  for(const c of [replay.parserProcessingCommit,inventory.parserProcessingCommit])same(c,parser);
  same(a.inputProvenance.anchors,['bulk-report.json','original-manifest.json','offline-replay.json','inventory-review.json'].map(n=>identity(n as EvidenceName)));
  const strict={original:{sourceCoverage:'failed',diagnosticOutcome:'failed',classificationStatus:'unverified'},inventory:{sourceCoverage:'failed'}};
  same(a.strictAuditVerdicts,strict);same(a.inputProvenance.strictAuditVerdicts,strict);
  for(const [k,v] of Object.entries(strict.original))same(bulk[k],v);same(replay.sourceCoverage,'failed');
  for(const v of [bulk,replay,inventory,get('continuity-evidence.json')])flags(v);
  same(inventory.verdict,'all48-arithmetic-verified-source-coverage-still-failed');same(inventory.findings,[]);
  same(inventory.offlineReportIdentity,{file:'offline-replay.json',bytes:identity('offline-replay.json').bytes,sha256:identity('offline-replay.json').sha256});
  const old=grid(bulk.contexts),replayed=grid(replay.contexts),reviewed=grid(inventory.contexts);
  const requests=array(manifest.requests).map(obj),normalized=new Map(a.inputProvenance.normalizedFiles.map(f=>[f.path,f]));let rows=0;
  for(const m of a.months){
    const r=replayed.get(m.id),b=old.get(m.id),v=reviewed.get(m.id);if(!r||!b||!v)throw new Error('country-crossed-context');
    for(const c of [r,b])for(const k of ['id','month','direction','measure'] as const)same(c[k],m[k]);
    for(const k of ['sumUsd','countryTotalUsd','residualUsd'] as const)same(r[k],m[k]);
    for(const k of ['sumUsd','countryTotalUsd','residualUsd'] as const)same(v[k],m[k]);
    same(v.allNormalizedRowsMatched,true);same(v.hs6Rows,r.hs6Rows);rows=countryInteger(rows+countryInteger(r.hs6Rows,1));
    const originals=a.inputProvenance.originals.filter(o=>o.context_id===m.id),requested=requests.filter(o=>o.context_id===m.id);if(originals.length!==1||requested.length!==1)throw new Error('country-original-binding');
    same(originals[0],r.original);same(requested[0],r.original);
    const wf=obj(obj(r.worker).files),outputs=array(v.maintainedOutputs).map(obj);
    for(const [kind,suffix] of [['rows','-hs6.json'],['receipt','-receipt.json']] as const){const f=obj(wf[kind]);same(f.path,m.id+suffix);const found=[...normalized.values()].filter(n=>n.path.endsWith('/'+f.path));if(found.length!==1)throw new Error('country-normalized-binding');same({bytes:found[0].bytes,sha256:found[0].sha256},{bytes:f.bytes,sha256:f.sha256});same(outputs.filter(o=>o.file===f.path),[{file:f.path,bytes:f.bytes,sha256:f.sha256}]);}
    for(const label of ['before','after'] as const)same(r[label+'Comparison'],m[label==='before'?'beforeReference':'afterReference'].recordedComparison);
  }
  same(rows,223049);same(normalized.size,96);
  const ordinary=a.candidates.filter(c=>c.comparisonEligible);same(array(ledger.entries),ordinary.map(c=>c.classification));
  const review=get('classification-review.json'),correction=get('citation-correction.json'),calc=get('calculation-review.json'),continuity=get('continuity-evidence.json');
  same(obj(review.assessment).readyToIntegrate,'with fixes');same(obj(review.issues).critical,[]);same(array(obj(review.issues).important).map(i=>obj(i).id),['R1']);
  const verdicts=array(review.entryVerdicts).map(obj);same(verdicts.length,17);
  for(const c of ordinary){const v=verdicts.filter(v=>v.direction===c.direction&&v.code===c.code);if(v.length!==1)throw new Error('country-classification-binding');for(const [k,value]of Object.entries({from:'2024-09',to:'2026-08',semanticVerdict:'compatible'}))same(v[0][k],value);}
  same(correction.status,'passed');same(correction.reviewedCommit,review.head);same(correction.reviewReceipt,identity('classification-review.json'));same(correction.correctedLedger,identity('classification-ledger.json'));same(correction.finding,'R1');same(correction.correctedLocatorCount,72);same(correction.semanticConclusionsChanged,false);same(correction.sourceBodiesChanged,false);
  same(continuity.correctedLedgerIdentity,identity('classification-ledger.json'));same(continuity.compatibleCount,17);same(continuity.countryCode,'1220');same(continuity.from,'2024-09');same(continuity.to,'2026-08');same(obj(continuity.independentClassificationReview).receipt,identity('classification-review.json'));same(obj(continuity.independentClassificationReview).verdict,'with fixes');
  const disposition=obj(continuity.reviewFindingDisposition);same(disposition.id,'R1');same(disposition.status,'corrected');same(disposition.correctionReceipt,identity('citation-correction.json'));same(disposition.semanticConclusionsChanged,false);same(disposition.sourceBodiesChanged,false);
  same(obj(continuity.independentCalculationVerification).receipt,identity('calculation-review.json'));same(calc.verdict,'passed');same(calc.findings,[]);same(calc.reviewedProcessingCommit,a.processingCommit);same(calc.classificationLedgerIdentity,identity('classification-ledger.json'));same(obj(calc.classificationBasis).reviewReceiptIdentity,identity('classification-review.json'));same(obj(calc.classificationBasis).reviewedSourceCommit,review.head);same(obj(calc.classificationBasis).semanticAndSourceIdentitiesUnchanged,true);
  if(!array(calc.outputIdentities).some(i=>{try{same(i,identity('assessment.json'));return true;}catch{return false;}}))throw new Error('country-calculation-binding');
  const counts=obj(calc.counts);for(const [k,v]of Object.entries({contexts:48,normalizedRows:223049,eligibleCandidates:17,statisticalCandidates:3}))same(counts[k],v);
  const calculated=grid(calc.monthlyRecalculation);for(const m of a.months){const c=calculated.get(m.id)!;for(const k of ['sumUsd','countryTotalUsd','residualUsd'] as const)same(c[k],m[k]);same(c.rows,reviewed.get(m.id)!.hs6Rows);}
  const products=array(calc.candidateRecalculation).map(obj);same(products.length,20);
  for(const c of a.candidates){const matches=products.filter(v=>v.direction===c.direction&&v.code===c.code);if(matches.length!==1)throw new Error('country-calculated-product');const p=matches[0];same(p.comparisonEligible,c.comparisonEligible);for(const period of ['prior','current'] as const){const w=obj(obj(p.windows)[period]);same({numeratorUsd:w.numeratorUsd,denominatorUsd:w.denominatorUsd,reportedMonths:w.reportedMonths,qualifiedSharePercent:w.qualifiedSharePercent},{numeratorUsd:c[period].observedSumUsd,denominatorUsd:c[period].countryTotalUsd,reportedMonths:12,qualifiedSharePercent:c[period].sharePercent});}same(p.growthPercent,c.growthPercent);same(p.sharePointChange,c.sharePointChange);}
  const projection=projectRetainedAssessment(a);same(digestCountryBytes(countryJsonBytes(projection)),contract.projection);
  return {files,projection};
}
