import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {decodeCountryRelease,verifyCountryRelease} from './package.server';
import {canadaCountryReleaseContract as contract,countryJsonBytes,countryJson,countryKeys,countrySame as same,countryInteger as integer,countryHash,countryCommit,parseCountryDigest,digestCountryBytes} from './contract.server';
import {readCountryBoundedFile,reserveCountryOutput,writeCountryExclusiveFile,countryFailureReceipt,pendingCountryReport} from './prepare.server';
import type {CountryVerificationProof,CountryGateReport,CountryRecoveryReceipt,DecodedCountryPackage} from './types';
export function parseCountryRecoveryReceipt(value:unknown):CountryRecoveryReceipt{
  const v=countryKeys(value,['schemaVersion','candidateDigest','projectionDigest','policyId','status','historicalPathReads']);same(v.schemaVersion,1);same(v.policyId,contract.policyId);same(v.status,'verified');same(v.historicalPathReads,0);
  return {schemaVersion:1,candidateDigest:parseCountryDigest(v.candidateDigest),projectionDigest:parseCountryDigest(v.projectionDigest,contract.limits.member),policyId:contract.policyId,status:'verified',historicalPathReads:0};
}
export function parseCountryVerificationProof(value:unknown):CountryVerificationProof{
  // This validates a trusted operator record, not the authenticity of external CI/reviewer claims.
  const v=countryKeys(countryJson(countryJsonBytes(value),contract.limits.record),['schemaVersion','policyId','candidateDigest','packagingCommit','recovery','preservation','checks','review','ci','runtimeComparison']);same(v.schemaVersion,1);same(v.policyId,contract.policyId);
  const candidateDigest=parseCountryDigest(v.candidateDigest),packagingCommit=countryCommit(v.packagingCommit),recovery=parseCountryRecoveryReceipt(v.recovery);same(recovery.candidateDigest,candidateDigest);
  const preservation=countryKeys(v.preservation,['before','after']);
  for(const name of ['before','after']){const files=preservation[name];if(!Array.isArray(files)||files.length!==11)throw new Error('country-preservation-count');for(const f of files){const item=countryKeys(f,['path','bytes','sha256']);parseCountryDigest({bytes:item.bytes,sha256:item.sha256});if(typeof item.path!=='string')throw new Error('country-preservation-path');}same([...files].sort((a,b)=>a.path.localeCompare(b.path)),contract.protectedFiles.sort((a,b)=>a.path.localeCompare(b.path)));}
  const checks=countryKeys(v.checks,['unit','types','browser','normalBuild']);
  const unit=countryKeys(checks.unit,['passed','failed','logSha256']);integer(unit.passed,1);same(unit.failed,0);countryHash(unit.logSha256);
  const types=countryKeys(checks.types,['files','errors','warnings','hints','logSha256']);integer(types.files,1);for(const k of ['errors','warnings','hints'])same(types[k],0);countryHash(types.logSha256);
  const browser=countryKeys(checks.browser,['ordinaryPassed','canadaPassed','failed','logSha256']);integer(browser.ordinaryPassed,1);integer(browser.canadaPassed,6);same(browser.failed,0);countryHash(browser.logSha256);
  const build=countryKeys(checks.normalBuild,['previewAbsent','fileCount','totalBytes','logSha256']);same(build.previewAbsent,true);integer(build.fileCount,1);integer(build.totalBytes,1);countryHash(build.logSha256);
  const review=countryKeys(v.review,['reviewedHead','verdict','report','reportSha256','unresolvedFindingIds','findingDispositions']);countryCommit(review.reviewedHead);if(review.verdict!=='passed'&&review.verdict!=='with-fixes-resolved')throw new Error('country-review-verdict');
  if(typeof review.report!=='string'||!review.report.trim()||Buffer.byteLength(review.report)>contract.limits.review)throw new Error('country-review-limit');same(createHash('sha256').update(review.report).digest('hex'),countryHash(review.reportSha256));same(review.unresolvedFindingIds,[]);
  if(!Array.isArray(review.findingDispositions))throw new Error('country-review-dispositions');const ids=new Set<string>();
  for(const f of review.findingDispositions){const d=countryKeys(f,['id','decision','reason','evidenceSha256']);if(typeof d.id!=='string'||!d.id||ids.has(d.id)||!['fixed','outside-scope'].includes(String(d.decision))||typeof d.reason!=='string'||!d.reason.trim())throw new Error('country-review-disposition');ids.add(d.id);countryHash(d.evidenceSha256);}
  const ci=countryKeys(v.ci,['repository','runId','headCommit','testedMergeCommit','testedTree','conclusion','logSha256']);same(ci.repository,'Vasuki8/us-trade-tracker');integer(ci.runId,1);same(ci.conclusion,'success');for(const k of ['headCommit','testedMergeCommit','testedTree'])countryCommit(ci[k]);countryHash(ci.logSha256);
  const comparison=countryKeys(v.runtimeComparison,['fromCommit','toCommit','changedPaths']);same(countryCommit(comparison.fromCommit),packagingCommit);same(countryCommit(comparison.toCommit),ci.headCommit);
  if(!Array.isArray(comparison.changedPaths)||new Set(comparison.changedPaths).size!==comparison.changedPaths.length||comparison.changedPaths.some(p=>!['README.md','docs/validation/canada-release-candidate.md'].includes(p)))throw new Error('country-runtime-changed');
  if(comparison.fromCommit===comparison.toCommit&&comparison.changedPaths.length)throw new Error('country-runtime-comparison');
  if(review.reviewedHead!==ci.headCommit&&review.reviewedHead!==packagingCommit&&(review.verdict!=='with-fixes-resolved'||!ids.size))throw new Error('country-unreviewed-head');
  return v as unknown as CountryVerificationProof;
}
export function sealCountryEligibility(candidate:DecodedCountryPackage,proof:CountryVerificationProof):CountryGateReport{
  verifyCountryRelease(candidate);const report=pendingCountryReport(candidate);if(proof===undefined)return report;
  try{const p=parseCountryVerificationProof(proof);same(p.candidateDigest,candidate.digest);same(p.packagingCommit,candidate.manifest.packagingCommit);same(p.recovery.projectionDigest,digestCountryBytes(candidate.files.get('research-data.json')!));report.gates.recoveryVerified='passed';report.gates.reviewAndPreservationVerified='passed';if(candidate.manifest.source==='census')report.status='eligible';}
  catch{report.gates.recoveryVerified='failed';report.gates.reviewAndPreservationVerified='failed';report.status=candidate.manifest.source==='fixture'?'fixture-only':'ineligible';report.diagnosticCodes=['country-invalid-verification-proof'];}
  return report;
}
export async function recoverCountryCandidate(opts:{repoRoot:string;candidateFile:string;outputDir:string}):Promise<CountryRecoveryReceipt>{
  const bytes=await readCountryBoundedFile(opts.repoRoot,opts.candidateFile,contract.limits.package),candidate=decodeCountryRelease(bytes),verified=verifyCountryRelease(candidate),projection=countryJsonBytes(verified.projection);
  const output=await reserveCountryOutput(opts.repoRoot,opts.outputDir);
  try{await writeCountryExclusiveFile(opts.repoRoot,resolve(output,'candidate.json'),bytes);await writeCountryExclusiveFile(opts.repoRoot,resolve(output,'research-data.json'),projection);
    const receipt:CountryRecoveryReceipt={schemaVersion:1,candidateDigest:candidate.digest,projectionDigest:digestCountryBytes(projection),policyId:contract.policyId,status:'verified',historicalPathReads:0};await writeCountryExclusiveFile(opts.repoRoot,resolve(output,'recovery-receipt.json'),countryJsonBytes(receipt));return receipt;
  }catch(error){await countryFailureReceipt(opts.repoRoot,output);throw error;}
}
