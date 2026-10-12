import {lstat,open,mkdir} from 'node:fs/promises';
import {resolve,relative,dirname,sep,isAbsolute} from 'node:path';
import {assertSnapshotPath} from '../../../scripts/country-snapshot-input';
import {readCountryReleaseEvidence} from './evidence.server';
import {packCountryRelease,decodeCountryRelease,verifyCountryRelease} from './package.server';
import {canadaCountryReleaseContract as contract,digestCountryBytes,countrySame as same,countryJsonBytes} from './contract.server';
import type {CandidateMetadata,CountryPackage,CountryGateReport,DecodedCountryPackage} from './types';
export function countryOutputPath(repoRoot:string,outputDir:string):string{
  const base=resolve(repoRoot,contract.backupRoot),target=resolve(repoRoot,outputDir),rel=relative(base,target);
  if(!rel||rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel)||!rel.split(sep).every(s=>/^[A-Za-z0-9_-]+$/.test(s)))throw new Error('country-output-namespace');return target;
}
export async function reserveCountryOutput(repoRoot:string,outputDir:string):Promise<string>{
  const target=countryOutputPath(repoRoot,outputDir);await assertSnapshotPath(repoRoot,dirname(target));await assertSnapshotPath(repoRoot,target,true);
  await mkdir(target);await assertSnapshotPath(repoRoot,target);return target;
}
export async function readCountryBoundedFile(repoRoot:string,path:string,limit:number):Promise<Buffer>{
  const target=resolve(repoRoot,path);await assertSnapshotPath(repoRoot,target);const handle=await open(target,'r');
  try{const before=await handle.stat();if(!before.isFile()||before.size<1||before.size>limit)throw new Error('country-read-limit');
    const body=Buffer.alloc(before.size+1);let length=0;while(length<body.length){const {bytesRead}=await handle.read(body,length,body.length-length,null);if(!bytesRead)break;length+=bytesRead;}
    const after=await handle.stat();await assertSnapshotPath(repoRoot,target);const linked=await lstat(target);
    if(length!==before.size||before.dev!==linked.dev||before.ino!==linked.ino||before.size!==after.size||before.mtimeMs!==after.mtimeMs||before.ctimeMs!==after.ctimeMs)throw new Error('country-changed-input');return body.subarray(0,length);
  }finally{await handle.close();}
}
export async function writeCountryExclusiveFile(repoRoot:string,path:string,body:Buffer):Promise<void>{
  await assertSnapshotPath(repoRoot,path,true);const handle=await open(path,'wx');try{await handle.writeFile(body);await handle.sync();}finally{await handle.close();}
  const readback=await readCountryBoundedFile(repoRoot,path,body.length);same(digestCountryBytes(readback),digestCountryBytes(body));
}
export function pendingCountryReport(candidate:Pick<DecodedCountryPackage,'digest'|'manifest'>):CountryGateReport{
  return {schemaVersion:1,policyId:contract.policyId,candidateDigest:{...candidate.digest},packagingCommit:candidate.manifest.packagingCommit,source:candidate.manifest.source,
    gates:{assessmentAuthenticated:'passed',replayEvidenceAuthenticated:'passed',classificationScopeQualified:'passed',referenceQualificationsRecorded:'passed',projectionVerified:'passed',recoveryVerified:'pending',reviewAndPreservationVerified:'pending'},status:candidate.manifest.source==='fixture'?'fixture-only':'verification-pending',
    sourceQualifications:{strictAuditVerdicts:{original:{sourceCoverage:'failed',diagnosticOutcome:'failed',classificationStatus:'unverified'},inventory:{sourceCoverage:'failed'}},references:{before:{matched:41,mismatch:7},after:{matched:41,mismatch:7},publication:{matched:7,notReviewed:41},quantumUsd:100000},selectedCategories:20,qualifiedComparisons:17,statisticalExclusions:3,rawVerification:'previous-reviewed-replay',revisionDates:'unknown'},diagnosticCodes:[]};
}
export async function countryFailureReceipt(repoRoot:string,output:string):Promise<void>{try{await writeCountryExclusiveFile(repoRoot,resolve(output,'failure.json'),countryJsonBytes({schemaVersion:1,status:'failed',code:'country-operation-failed'}));}catch{/* Never overwrite an existing file or hide the original failure. */}}
export async function prepareCountryRelease(opts:{repoRoot:string;outputDir:string;metadata:CandidateMetadata}):Promise<{package:CountryPackage;report:CountryGateReport}>{
  // Authenticate before owning output; preparation never accesses selected state.
  const evidence=await readCountryReleaseEvidence(opts.repoRoot),packed=packCountryRelease(evidence,opts.metadata),output=await reserveCountryOutput(opts.repoRoot,opts.outputDir);
  try{await writeCountryExclusiveFile(opts.repoRoot,resolve(output,'candidate.json'),packed.bytes);const readback=decodeCountryRelease(await readCountryBoundedFile(opts.repoRoot,resolve(output,'candidate.json'),contract.limits.package));verifyCountryRelease(readback);same(readback.digest,packed.digest);const report=pendingCountryReport(readback);await writeCountryExclusiveFile(opts.repoRoot,resolve(output,'candidate-report.json'),countryJsonBytes(report));return {package:packed,report};
  }catch(error){await countryFailureReceipt(opts.repoRoot,output);throw error;}
}
