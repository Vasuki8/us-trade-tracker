import {afterEach,expect,it,vi} from 'vitest';
import {verifyMexicoAllGoodsEvidence} from '../../src/lib/mexico-country-release/evidence.server';
import {makeMexicoEvidenceFixture,installMexicoFixture,edit} from '../helpers/mexico-country-release-data';
afterEach(()=>vi.restoreAllMocks());
function checked(change?:(files:Map<string,Buffer>)=>void){const f=makeMexicoEvidenceFixture();change?.(f);installMexicoFixture(f);return ()=>verifyMexicoAllGoodsEvidence(f);}
it('authenticates both complete retained controls without accepting a release',()=>{
 const v=checked()();expect(v.observations).toHaveLength(48);expect(v.source).toBe('fixture');
 expect(v.qualifications.productComparisons).toMatchObject({available:false,ordinaryUnverified:17,statisticalExclusions:3});
 expect(v.qualifications.references).toMatchObject({currentBefore:{matched:48,mismatch:0},dated:{matched:16,mismatch:32},differenceCause:'not-established'});
});
it.each([
 ['country',(f:Map<string,Buffer>)=>edit(f,'maintained-summary.json',x=>x.countryCode='1220')],
 ['role',(f:Map<string,Buffer>)=>edit(f,'independent-summary.json',x=>x.role='maintained')],
 ['measure',(f:Map<string,Buffer>)=>edit(f,'reassessment-public-evidence.json',x=>x.contexts[0].measure='CON_VAL_MO')],
 ['source',(f:Map<string,Buffer>)=>edit(f,'maintained-imports-2024-09-receipt.json',x=>x.source.sha256='0'.repeat(64))],
 ['duplicate',(f:Map<string,Buffer>)=>edit(f,'maintained-summary.json',x=>x.contexts[1]=x.contexts[0])],
 ['missing',(f:Map<string,Buffer>)=>edit(f,'maintained-summary.json',x=>x.contexts.pop())],
 ['processing',(f:Map<string,Buffer>)=>edit(f,'maintained-summary.json',x=>x.sourceCommit='0'.repeat(40))],
 ['wrong control',(f:Map<string,Buffer>)=>edit(f,'maintained-summary.json',x=>x.contexts[0].countryTotalUsd++)],
 ['unsafe USD',(f:Map<string,Buffer>)=>edit(f,'maintained-summary.json',x=>x.contexts[0].sumUsd=Number.MAX_SAFE_INTEGER+1)],
 ['claimed revision',(f:Map<string,Buffer>)=>edit(f,'reference-public-evidence.json',x=>x.differenceCause='revision-proven')],
 ['product comparison',(f:Map<string,Buffer>)=>edit(f,'classification-ledger.json',x=>x.entries[0].comparisonAvailable=true)],
 ['compatible status',(f:Map<string,Buffer>)=>edit(f,'classification-ledger.json',x=>x.entries[0].status='compatible')],
 ['YTD column',(f:Map<string,Buffer>)=>edit(f,'reference-matrix.json',x=>x.rows[0].publicationCell.period='year-to-date')],
 ['rounding tie',(f:Map<string,Buffer>)=>edit(f,'reference-matrix.json',x=>x.rows[0].currentBefore.displayedUsd+=50000)],
] as const)('rejects crossed, unsafe or unsupported %s evidence',(_name,change)=>expect(checked(change)).toThrow());
it('rejects changed bytes against external pins even when JSON remains valid',()=>{
 const f=makeMexicoEvidenceFixture();installMexicoFixture(f);f.set('maintained-summary.json',Buffer.concat([f.get('maintained-summary.json')!,Buffer.from(' ')]));
 expect(()=>verifyMexicoAllGoodsEvidence(f)).toThrow();
});
it('preserves large historical metadata as original bytes, not numeric identity claims',()=>{
 const v=checked()();expect(v.files.get('reassessment-frozen-scripts.json')!.toString()).toContain('1792347899539979800');
});

