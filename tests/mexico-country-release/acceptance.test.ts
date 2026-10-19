import {afterEach,expect,it,vi} from 'vitest';
import {authenticateMexicoAcceptance} from '../../src/lib/mexico-country-release/acceptance.server';
import {mexicoAcceptanceContract} from '../../src/lib/mexico-country-release/acceptance-contract.server';
import type {MexicoAcceptanceInputs} from '../../src/lib/mexico-country-release/acceptance-types';
import {identity,json} from '../../src/lib/mexico-country-release/contract.server';
import {makeMexicoAcceptanceFixture} from '../helpers/mexico-archive-data';
afterEach(()=>vi.restoreAllMocks());
async function api(){return {authenticate:authenticateMexicoAcceptance,contract:mexicoAcceptanceContract};}
it('authorizes only qualified all-goods while retaining the exact historical candidate flags',async()=>{
 const {authenticate,contract}=await api(),f=makeMexicoAcceptanceFixture(contract),result=authenticate(f.input);
 expect(result.instrument.decision).toBe('owner-authorized-for-private-all-goods');
 expect(result.instrument.countryCode).toBe('2010');expect(result.instrument.scope).toBe('all-goods');
 expect(result.projection.periods.imports.current.totalUsd).toBe(1200000);
 expect(result.projection.periods.exports.current.totalUsd).toBe(2400000);
 expect(result.projection.releaseAccepted).toBe(false);expect(result.projection.classificationAccepted).toBe(false);
 expect(result.projection.productComparisons.available).toBe(false);
 expect(result.projection.productComparisons.ordinaryUnverified).toBe(17);expect(result.projection.productComparisons.statisticalExclusions).toBe(3);
 expect(result.projection.qualifications.references.dated).toEqual({matched:16,mismatch:32});
 expect(result.candidateBytes).toEqual(f.pack.bytes);expect(result.instrument.candidate).toEqual(identity(f.pack.bytes));
 expect(result.evidenceFiles.size).toBe(28);expect(result.instrument.authorization).toEqual(f.input.authorization);
});
it.each(['actor','scope','baseline','plan','inputs','candidate','eligibility','proof','classification','products','public','extra','old-time'] as const)('refuses %s authorization escalation or cross-binding',async kind=>{
 const {authenticate,contract}=await api(),f=makeMexicoAcceptanceFixture(contract),a=f.input.authorization as any;
 if(kind==='actor')a.actor='developer';if(kind==='scope')a.scope='public-release';if(kind==='baseline')a.baseline='replace';
 if(kind==='plan')a.approvedPlan.sha256='3'.repeat(64);if(kind==='inputs')a.approvedInputs.bytes++;
 if(kind==='candidate')a.candidate.sha256='3'.repeat(64);if(kind==='eligibility')a.eligibility.bytes++;if(kind==='proof')a.operatorProof.sha256='3'.repeat(64);
 if(kind==='classification')a.classificationAccepted=true;if(kind==='products')a.productComparisonsAvailable=true;if(kind==='public')a.publicMexicoProfile=true;
 if(kind==='extra')a.allGoodsAccepted=true;if(kind==='old-time')a.approvedAt='2026-10-01T00:00:00.000Z';
 expect(()=>authenticate(f.input)).toThrow();
});
it.each(['changed','missing','extra','swapped'] as const)('rejects %s evidence before conferring authorization',async kind=>{
 const {authenticate,contract}=await api(),f=makeMexicoAcceptanceFixture(contract),files=f.input.evidenceFiles;
 if(kind==='changed')files.set('prior/github/final-ci-evidence.json',Buffer.from('forged CI'));
 if(kind==='missing')files.delete('prior/github/final-ci-evidence.json');if(kind==='extra')files.set('../private-key',Buffer.from('not permitted'));
 if(kind==='swapped'){const a=files.get('prior/candidate-eligibility.json')!;files.set('prior/candidate-eligibility.json',files.get('prior/eligibility-decision.json')!);files.set('prior/eligibility-decision.json',a);}
 expect(()=>authenticate(f.input)).toThrow();
});
it('rejects an otherwise internally consistent replacement proof not in the approved pins',async()=>{
 const {authenticate,contract}=await api(),f=makeMexicoAcceptanceFixture(contract),proof=structuredClone(f.proof);
 proof.reviewedCommit='3'.repeat(40);proof.runtimeComparison.to=proof.reviewedCommit;proof.review.headCommit=proof.reviewedCommit;proof.ci.headCommit=proof.reviewedCommit;
 f.input.evidenceFiles.set('prior/operator-verification-proof.json',json(proof));
 expect(()=>authenticate(f.input)).toThrow();
});
it('refuses a different candidate even if its caller supplies a matching digest',async()=>{
 const {authenticate,contract}=await api(),f=makeMexicoAcceptanceFixture(contract);
 f.input.candidateBytes=Buffer.from(f.input.candidateBytes);f.input.candidateBytes[0]^=1;
 f.input.authorization.candidate=identity(f.input.candidateBytes);
 expect(()=>authenticate(f.input)).toThrow();
});
it('returns owned copies so later caller mutations cannot change authorized bytes',async()=>{
 const {authenticate,contract}=await api(),f=makeMexicoAcceptanceFixture(contract),r=authenticate(f.input),before=identity(r.candidateBytes);
 f.input.candidateBytes[0]^=1;f.input.evidenceFiles.get('prior/candidate-eligibility.json')![0]^=1;
 f.input.authorization.instruction='changed';
 expect(identity(r.candidateBytes)).toEqual(before);
 expect(r.instrument.authorization.instruction).toContain('Owner approves');
 expect(r.evidenceFiles.get('prior/candidate-eligibility.json')!.toString()).toContain('eligible');
});

it('rejects unapproved bytes under unmocked production pins before reading any evidence',async()=>{
 vi.restoreAllMocks();const {authenticate,contract}=await api();
 expect(contract.candidate).toEqual({bytes:6443203,sha256:'e9317cfb9269d0641613c0cfda5f97941d66e8cc68b1842f566c2e5b9f426454'});
 expect(contract.projection).toEqual({bytes:9425,sha256:'a507ead76c0936572c54674b8b0615d7813cd1749eeff95bdec5313eabd07d02'});
 expect(contract.plan).toEqual({bytes:44906,sha256:'76ab3670efa149d6bfb59cb52bec9596ab1e51fdf975f21977dd4b3d5c3224da'});
 expect(contract.inputs).toEqual({bytes:14371,sha256:'3257a29089893dc24db022d0ba4e1a7bb57b2cedc854b30a5ba1abe8466103f3'});
 const evidenceFiles={get(){throw Error('unapproved evidence must not be consulted');},size:28};
 expect(()=>authenticate({candidateBytes:Buffer.from('old or unapproved candidate'),evidenceFiles,authorization:null} as unknown as MexicoAcceptanceInputs)).toThrow('mexico-acceptance-candidate');
});
it('refuses a valid synthetic candidate against restored production pins',async()=>{
 const {authenticate,contract}=await api(),f=makeMexicoAcceptanceFixture(contract);vi.restoreAllMocks();
 expect(()=>authenticate(f.input)).toThrow('mexico-acceptance-candidate');
});
it('rejects a fully bound fixture-only packet rather than treating it as a real release',async()=>{
 const {authenticate,contract}=await api(),f=makeMexicoAcceptanceFixture(contract,'fixture');
 expect(f.report.status).toBe('fixture-only');expect(()=>authenticate(f.input)).toThrow();
});
it.each(['missing-disposition','available','accepted-classification'] as const)('refuses %s even after caller rehashes the candidate',async kind=>{
 const {authenticate,contract}=await api(),f=makeMexicoAcceptanceFixture(contract),v=JSON.parse(f.pack.bytes.toString()),last=v.files.length-1;
 const projection=JSON.parse(Buffer.from(v.files[last].base64,'base64').toString());
 if(kind==='missing-disposition')projection.productComparisons.dispositions.pop();
 if(kind==='available')projection.productComparisons.available=true;
 if(kind==='accepted-classification')projection.classificationAccepted=true;
 const b=json(projection);v.files[last].base64=b.toString('base64');v.manifest.members[last]={name:'research-data.json',...identity(b)};
 f.input.candidateBytes=json(v);const digest=identity(f.input.candidateBytes);
 vi.spyOn(contract,'candidate','get').mockReturnValue(digest);f.input.authorization.candidate=digest;
 expect(()=>authenticate(f.input)).toThrow();
});
