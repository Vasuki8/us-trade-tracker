import {vi} from 'vitest';
import approved from '../../docs/superpowers/plans/2026-10-18-mexico-private-acceptance-archive-inputs.json';
import {mexicoContract,identity,json} from '../../src/lib/mexico-country-release/contract.server';
import {verifyMexicoAllGoodsEvidence} from '../../src/lib/mexico-country-release/evidence.server';
import {encodeMexicoCandidate,decodeMexicoCandidate,verifyMexicoCandidate} from '../../src/lib/mexico-country-release/package.server';
import {finalizeMexicoEligibility} from '../../src/lib/mexico-country-release/recovery.server';
import {makeMexicoEvidenceFixture,installMexicoFixture} from './mexico-country-release-data';
import type {MexicoAcceptanceAuthorization} from '../../src/lib/mexico-country-release/acceptance-types';
import type {MexicoVerificationProof} from '../../src/lib/mexico-country-release/types';

/** Synthetic protocol data; contract getters are replaced only by Vitest spies. */
export function makeMexicoAcceptanceFixture(contract:Record<string,any>,source:'census'|'fixture'='census'){
 const retained=makeMexicoEvidenceFixture();installMexicoFixture(retained);
 vi.spyOn(mexicoContract,'source','get').mockReturnValue(source);
 const packagingCommit='1'.repeat(40),head='2'.repeat(40);
 const pack=encodeMexicoCandidate(verifyMexicoAllGoodsEvidence(retained),{releaseId:'2026-08-12345678-1234-4123-8123-123456789abc',packagingCommit,preparedAt:'2026-10-18T23:00:00.000Z'});
 const projection=verifyMexicoCandidate(decodeMexicoCandidate(pack.bytes)).projection;
 const external=identity(Buffer.from('synthetic observed operator record'));
 const receipt=(digit:string)=>({schemaVersion:1,policyId:mexicoContract.policyId,countryCode:'2010',source,candidate:pack.digest,projection:identity(json(projection)),status:'verified',historicalPathReads:0,recoveryId:digit+'2345678-1234-4123-8123-123456789abc',recoveredAt:'2026-10-18T23:01:00.000Z'});
 const proof={schemaVersion:1,source,candidate:pack.digest,projection:identity(json(projection)),packagingCommit,reviewedCommit:head,
 runtimeComparison:{from:packagingCommit,to:head,unchangedRuntime:true,documentationOnly:true,identity:external},
 recoveries:[{role:'primary',receipt:receipt('1'),identity:identity(json(receipt('1')))},{role:'independent',receipt:receipt('2'),identity:identity(json(receipt('2')))}],
 calculation:{status:'passed',candidate:pack.digest,projection:identity(json(projection)),observations:48,periodTotals:4,growthResults:2,productComparisonsWithheld:true,identity:external},
 preservation:{before:{identity:external,count:21},after:{identity:external,count:21},unchanged:true},review:{status:'passed',headCommit:head,identity:external},ci:{status:'passed',headCommit:head,identity:external},checks:{unitTests:true,typeCheck:true,normalBuild:true,routeExclusion:true,supervisor:true}} as unknown as MexicoVerificationProof;
 const report=finalizeMexicoEligibility(pack.bytes,proof);
 const evidenceFiles=new Map<string,Buffer>(approved.evidenceMembers.map(p=>[p.archiveName,json({synthetic:p.archiveName})]));
 evidenceFiles.set('prior/operator-verification-proof.json',json(proof));
 evidenceFiles.set('prior/candidate-eligibility.json',json(report));
 evidenceFiles.set('prior/eligibility-decision.json',json({status:'eligible',candidate:pack.digest,projection:identity(json(projection)),packagingCommit,reviewedCommit:head}));
 const plan=identity(Buffer.from('synthetic approved plan')),inputs=identity(Buffer.from('synthetic approved input allowlist'));
 const pins=[...evidenceFiles].map(([name,b])=>({name,...identity(b)}));
 for(const [name,value] of Object.entries({candidate:pack.digest,projection:identity(json(projection)),pins,plan,inputs,packagingCommit,reviewedCommit:head,releaseId:pack.manifest.releaseId})){const frozen=structuredClone(value);vi.spyOn(contract,name,'get').mockImplementation(()=>structuredClone(frozen));}
 const authorization:MexicoAcceptanceAuthorization={schemaVersion:1,policyId:'mexico-private-all-goods-acceptance-v1',actor:'owner',scope:'private-all-goods-acceptance-and-recovery',approvedAt:'2026-10-19T02:00:00.000Z',approvedPlan:plan,approvedInputs:inputs,candidate:pack.digest,eligibility:identity(json(report)),operatorProof:identity(json(proof)),baseline:'absent',instruction:'Owner approves private Mexico all-goods acceptance, retained evidence archiving and isolated recovery; every product comparison and public Mexico profile stay withheld.',classificationAccepted:false,productComparisonsAvailable:false,publicMexicoProfile:false};
 return {input:{candidateBytes:pack.bytes,evidenceFiles,authorization},pack,projection,proof,report,pins};
}
