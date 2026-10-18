import {afterEach,expect,it,vi} from 'vitest';
import {decodeMexicoCandidate,encodeMexicoCandidate,verifyMexicoCandidate} from '../../src/lib/mexico-country-release/package.server';
import {verifyMexicoAllGoodsEvidence} from '../../src/lib/mexico-country-release/evidence.server';
import {identity,json,mexicoContract} from '../../src/lib/mexico-country-release/contract.server';
import {makeMexicoEvidenceFixture,installMexicoFixture} from '../helpers/mexico-country-release-data';
export const metadata={releaseId:'2026-08-12345678-1234-4123-8123-123456789abc',packagingCommit:'1'.repeat(40),preparedAt:'2026-10-18T23:00:00.000Z'};
afterEach(()=>vi.restoreAllMocks());
function pack(){const f=makeMexicoEvidenceFixture();installMexicoFixture(f);return encodeMexicoCandidate(verifyMexicoAllGoodsEvidence(f),metadata);}
it('round trips exactly121 externally pinned members, keeping original bytes and pending gates',()=>{
 const p=pack(),d=decodeMexicoCandidate(p.bytes),v=verifyMexicoCandidate(d);expect(d.files.size).toBe(121);expect(d.files.get('reassessment-frozen-scripts.json')!.toString()).toContain('1792347899539979800');
 expect(v.report.status).toBe('fixture-only');expect(v.report.gates.portableRecoveryVerified).toBe('pending');expect(v.report.gates.reviewAndPreservationVerified).toBe('pending');expect(v.projection.productComparisons.available).toBe(false);
 expect(encodeMexicoCandidate(verifyMexicoAllGoodsEvidence(new Map([...d.files].filter(([n])=>n!=='research-data.json'))),metadata).bytes).toEqual(p.bytes);
});
it.each(['country','policy','extra-scope','extra-member','duplicate','traversal','base64','whitespace','utf8','duplicate-key','size','decoded','manifest','metadata'] as const)('rejects malformed %s envelopes',kind=>{
 const p=pack(),v=JSON.parse(p.bytes.toString());let b:Buffer;
 if(kind==='country')v.manifest.countryCode='1220';if(kind==='policy')v.manifest.policyId='canada';if(kind==='extra-scope')v.manifest.products=[];
 if(kind==='extra-member')v.files.push(v.files[0]);if(kind==='duplicate')v.files[1]=v.files[0];if(kind==='traversal')v.files[0].name='../x';if(kind==='base64')v.files[0].base64+='\n';
 if(kind==='decoded')v.manifest.members.forEach((m:{bytes:number})=>m.bytes=mexicoContract.limits.member);
 if(kind==='manifest')v.manifest.releaseId='x'.repeat(66000);if(kind==='metadata')v.manifest.preparedAt='2026-10-18';
 b=json(v);if(kind==='whitespace')b=Buffer.from(JSON.stringify(v,null,2));if(kind==='utf8')b=Buffer.from([0xc3,0x28]);if(kind==='duplicate-key')b=Buffer.from(p.bytes.toString().replace('"schemaVersion":1','"schemaVersion":0,"schemaVersion":1'));if(kind==='size')b=Buffer.alloc(mexicoContract.limits.serialized+1);
 expect(()=>decodeMexicoCandidate(b)).toThrow();
});
it('rejects a forged projection even when all envelope hashes are recomputed',()=>{
 const v=JSON.parse(pack().bytes.toString()),i=v.files.length-1,projection=JSON.parse(Buffer.from(v.files[i].base64,'base64').toString());projection.observations[0].usd++;
 const body=json(projection);v.files[i].base64=body.toString('base64');v.manifest.members[i]={name:'research-data.json',...identity(body)};expect(()=>decodeMexicoCandidate(json(v))).toThrow();
});
it('reauthenticates mutated evidence, decoded buffers and manifest objects',()=>{
 const p=pack(),d=decodeMexicoCandidate(p.bytes);d.files.get('maintained-summary.json')![0]^=1;expect(()=>verifyMexicoCandidate(d)).toThrow();
 const d2=decodeMexicoCandidate(p.bytes);d2.manifest.countryCode='1220' as '2010';expect(()=>verifyMexicoCandidate(d2)).toThrow();
 const f=makeMexicoEvidenceFixture();installMexicoFixture(f);const e=verifyMexicoAllGoodsEvidence(f);e.files.get('maintained-summary.json')![0]^=1;expect(()=>encodeMexicoCandidate(e,metadata)).toThrow();
});
