import {afterEach,expect,it,vi} from 'vitest';
import {verifyMexicoAllGoodsEvidence} from '../../src/lib/mexico-country-release/evidence.server';
import {projectMexicoAllGoods} from '../../src/lib/mexico-country-release/project.server';
import {makeMexicoEvidenceFixture,installMexicoFixture} from '../helpers/mexico-country-release-data';
afterEach(()=>vi.restoreAllMocks());
function evidence(){const f=makeMexicoEvidenceFixture();installMexicoFixture(f);return verifyMexicoAllGoodsEvidence(f);}
it('projects exact all-goods periods and no product numerators',()=>{
 const p=projectMexicoAllGoods(evidence());expect(p.observations).toHaveLength(48);
 expect(p.periods.imports).toEqual({prior:{from:'2024-09',to:'2025-08',totalUsd:1200000},current:{from:'2025-09',to:'2026-08',totalUsd:1200000},growthPercent:0});
 expect(p.periods.exports.prior.totalUsd).toBe(2400000);expect(p.releaseAccepted).toBe(false);expect(p.productComparisons.available).toBe(false);
 expect(p).not.toHaveProperty('products');expect(JSON.stringify(p)).not.toContain('1792347899539979800');
});
it('does not turn missing into zero or divide by a zero prior total',()=>{
 const e=evidence();e.observations=e.observations.map(o=>({...o,usd:o.direction==='imports'&&o.month<'2025-09'?0:o.usd}));
 let p=projectMexicoAllGoods(e);expect(p.periods.imports.prior.totalUsd).toBe(0);expect(p.periods.imports.growthPercent).toBeNull();
 e.observations=e.observations.filter(o=>o.id!=='imports-2024-09');p=projectMexicoAllGoods(e);
 expect(p.observations.find(o=>o.id==='imports-2024-09')!.usd).toBeNull();expect(p.periods.imports.prior.totalUsd).toBeNull();expect(p.periods.imports.growthPercent).toBeNull();
});
it('rejects integer overflow and duplicate observations',()=>{
 const e=evidence();e.observations[0].usd=Number.MAX_SAFE_INTEGER;expect(()=>projectMexicoAllGoods(e)).toThrow();
 const e2=evidence();e2.observations.push({...e2.observations[0]});expect(()=>projectMexicoAllGoods(e2)).toThrow();
});

