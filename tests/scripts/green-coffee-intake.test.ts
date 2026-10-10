import {expect,it} from 'vitest';
import {resolveImportOptions} from '../../scripts/import-product';
import {resolveDutyAuditOptions} from '../../scripts/audit-duties';
import {parseArchiveDispatch} from '../../scripts/archive-inputs';
import {PRODUCTS} from '../../src/lib/trade/product-registry';
import {loadPublishedReleases} from '../../src/lib/trade/load-release';

it('allows green coffee intake through the real registry',async()=>{
  const imported=await resolveImportOptions(['--product','090111','--end','2026-08','--duties'],{CENSUS_API_KEY:'synthetic'},'workspace');
  expect(imported.productCode).toBe('090111');expect(imported.outputDir).toMatch(/data[\\/]products[\\/]090111[\\/]processed$/);
  expect(imported.includeDuties).toBe(true);expect(imported.classificationIntervals).toEqual([]);
  const classified=await resolveImportOptions(['--product','090111','--end','2026-06','--classification','data/classification/090111.json'],{},'workspace');
  expect(classified.classificationIntervals).toMatchObject([{from:'2021-09',to:'2026-06'}]);
  expect(resolveDutyAuditOptions(['--product','090111','--end','2026-08'],{CENSUS_API_KEY:'synthetic'}).productCode).toBe('090111');
  expect(parseArchiveDispatch({PRODUCT_CODE:'090111',REPORTING_MONTH:'2026-08'}).productCode).toBe('090111');
});

it('keeps green coffee out of the public profile set until its own evidence is accepted',async()=>{
  const all=await loadPublishedReleases({mode:'fixture',registry:PRODUCTS.map(product=>product.code==='090111'?{...product,published:false,dutiesAccepted:false}:product)});
  expect(all.map(({product})=>product.code)).toEqual(['090121']);
  expect(all[0].release.productCode).toBe('090121');
});
