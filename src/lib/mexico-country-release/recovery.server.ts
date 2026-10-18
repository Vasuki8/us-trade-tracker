import {randomUUID} from 'node:crypto';import {resolve} from 'node:path';
import {array,checkIdentity,equal,identity,json,keys,mexicoContract,object,usd} from './contract.server';
import {decodeMexicoCandidate,verifyMexicoCandidate} from './package.server';
import {readMexicoBoundedFile,reserveMexicoOutput,verifyMexicoOutputFiles,writeMexicoExclusiveFile} from './io.server';
import type {MexicoGateReport,MexicoRecoveryReceipt,MexicoVerificationProof} from './types';
export async function recoverMexicoCandidate(opts:{repoRoot:string;candidateFile:string;outputDir:string}):Promise<MexicoRecoveryReceipt>{
 const bytes=await readMexicoBoundedFile(opts.repoRoot,opts.candidateFile,mexicoContract.limits.serialized),candidate=decodeMexicoCandidate(bytes),{report}=verifyMexicoCandidate(candidate);
 // Complete all authentication before reserving output; no retained provenance path is followed.
 const out=await reserveMexicoOutput(opts.repoRoot,opts.outputDir),receipt:MexicoRecoveryReceipt={schemaVersion:1,policyId:mexicoContract.policyId,countryCode:'2010',source:candidate.manifest.source,candidate:identity(bytes),projection:report.projection,status:'verified',historicalPathReads:0,recoveryId:randomUUID(),recoveredAt:new Date().toISOString()};
 const projection=candidate.files.get('research-data.json')!;
 await writeMexicoExclusiveFile(opts.repoRoot,resolve(out.path,'candidate.json'),bytes,out);
 await writeMexicoExclusiveFile(opts.repoRoot,resolve(out.path,'research-data.json'),projection,out);
 await verifyMexicoOutputFiles(opts.repoRoot,out,{'candidate.json':bytes,'research-data.json':projection});
 await writeMexicoExclusiveFile(opts.repoRoot,resolve(out.path,'recovery-receipt.json'),json(receipt),out);
 return receipt;
}
function externalIdentity(x:unknown):void{const r=object(x);keys(r,['bytes','sha256']);if(usd(r.bytes)<1||typeof r.sha256!=='string'||!/^[a-f0-9]{64}$/.test(r.sha256)||/^0+$/.test(r.sha256))throw Error('mexico-external-identity');}
export function finalizeMexicoEligibility(candidateBytes:Buffer,proof:MexicoVerificationProof):MexicoGateReport{
 const decoded=decodeMexicoCandidate(candidateBytes),{report}=verifyMexicoCandidate(decoded);
 // The operator must inspect actual external records. These checks authenticate internal bindings,
 // not the existence or honesty of a CI provider, reviewer, or preservation assertion.
 try{
  if(json(proof).length>mexicoContract.limits.proof)throw Error('mexico-proof-limit');const p=object(proof);keys(p,['schemaVersion','source','candidate','projection','packagingCommit','reviewedCommit','runtimeComparison','recoveries','calculation','preservation','review','ci','checks']);equal(p.schemaVersion,1);equal(p.source,report.source);checkIdentity(p.candidate,report.candidate);checkIdentity(p.projection,report.projection);equal(p.packagingCommit,decoded.manifest.packagingCommit);if(typeof p.reviewedCommit!=='string'||!/^[a-f0-9]{40}$/.test(p.reviewedCommit))throw Error('mexico-reviewed-head');
  const runtime=object(p.runtimeComparison);keys(runtime,['from','to','unchangedRuntime','documentationOnly','identity']);equal(runtime.from,p.packagingCommit);equal(runtime.to,p.reviewedCommit);equal(runtime.unchangedRuntime,true);equal(runtime.documentationOnly,true);externalIdentity(runtime.identity);
  const recoveries=array(p.recoveries).map(object);equal(recoveries.length,2);equal(recoveries.map(r=>r.role),['primary','independent']);const ids=new Set<string>();
  for(const recovery of recoveries){keys(recovery,['role','receipt','identity']);const r=object(recovery.receipt);keys(r,['schemaVersion','policyId','countryCode','source','candidate','projection','status','historicalPathReads','recoveryId','recoveredAt']);equal(r.schemaVersion,1);equal(r.policyId,mexicoContract.policyId);equal(r.countryCode,'2010');equal(r.source,report.source);checkIdentity(r.candidate,report.candidate);checkIdentity(r.projection,report.projection);equal(r.status,'verified');equal(r.historicalPathReads,0);if(typeof r.recoveryId!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(r.recoveryId)||ids.has(r.recoveryId))throw Error('mexico-recovery-id');ids.add(r.recoveryId);if(typeof r.recoveredAt!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(r.recoveredAt)||new Date(r.recoveredAt).toISOString()!==r.recoveredAt)throw Error('mexico-recovery-time');checkIdentity(recovery.identity,identity(json(r)));}
  report.gates.portableRecoveryVerified='passed';
  const calc=object(p.calculation);keys(calc,['status','candidate','projection','observations','periodTotals','growthResults','productComparisonsWithheld','identity']);equal(calc.status,'passed');checkIdentity(calc.candidate,report.candidate);checkIdentity(calc.projection,report.projection);equal(calc.observations,48);equal(calc.periodTotals,4);equal(calc.growthResults,2);equal(calc.productComparisonsWithheld,true);externalIdentity(calc.identity);
  const preservation=object(p.preservation);keys(preservation,['before','after','unchanged']);equal(preservation.unchanged,true);const before=object(preservation.before),after=object(preservation.after);for(const r of [before,after]){keys(r,['identity','count']);externalIdentity(r.identity);if(usd(r.count)<21)throw Error('mexico-preservation-count');}equal(before.count,after.count);
  for(const name of ['review','ci']){const r=object(p[name]);keys(r,['status','headCommit','identity']);equal(r.status,'passed');equal(r.headCommit,p.reviewedCommit);externalIdentity(r.identity);}
  const checks=object(p.checks);keys(checks,['unitTests','typeCheck','normalBuild','routeExclusion','supervisor']);for(const v of Object.values(checks))equal(v,true);
  report.gates.reviewAndPreservationVerified='passed';report.status=report.source==='fixture'?'fixture-only':'eligible';
 }catch{report.status=report.source==='fixture'?'fixture-only':'ineligible';report.gates.reviewAndPreservationVerified='failed';}
 return report;
}
