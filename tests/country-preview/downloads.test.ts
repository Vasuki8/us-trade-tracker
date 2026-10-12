import {expect,it} from 'vitest';
import {makeCountryPreviewFixture} from '../helpers/country-preview-data';
import {parseCsv} from '../helpers/parse-csv';
import {serializeCountryMonthlyCsv,serializeCountryProductsCsv,countryCsvFilename} from '../../src/lib/country-preview/downloads';
import {validateFixturePreview} from '../../src/lib/country-preview/load.server';
it('exports 24 direction-specific monthly amounts and synthetic provenance',()=>{
  const data=makeCountryPreviewFixture(),csv=serializeCountryMonthlyCsv(data,'exports'),rows=parseCsv(csv);
  expect(rows).toHaveLength(24);expect(rows[0]).toMatchObject({month:'2024-09',value_usd:'300000',original_source_url:''});
  expect(csv).toContain('1220,Canada,exports,2026-08,200000,reported,ALL_VAL_MO');expect(csv).toContain('Synthetic development data');expect(csv).not.toContain('GEN_VAL_MO');
  expect(countryCsvFilename('exports','monthly')).toBe('canada-1220-exports-2024-09-2026-08-preview-monthly.csv');
  expect(countryCsvFilename('imports','products')).toBe('canada-1220-imports-2024-09-2026-08-preview-products.csv');
  data.directions.exports.monthly[0].valueUsd=null;data.directions.exports.monthly[1].valueUsd=0;
  expect(parseCsv(serializeCountryMonthlyCsv(data,'exports')).slice(0,2)).toMatchObject([{value_usd:'',value_status:'unavailable'},{value_usd:'0',value_status:'reported'}]);
});
it('exports ten fixed product pairs with same-archive denominators and statistical exclusions',()=>{
  const rows=parseCsv(serializeCountryProductsCsv(makeCountryPreviewFixture(),'imports'));
  expect(rows).toHaveLength(10);expect(rows.map(x=>x.product_code)).toEqual(['270900','980100','271019','271121','870323','870340','870324','870829','271012','880240']);
  expect(rows[0]).toMatchObject({current_value_usd:'240000',prior_value_usd:'120000',current_country_total_usd:'2400000',prior_country_total_usd:'1200000',change_usd:'120000',growth_percent:'100',current_share_percent:'10',prior_share_percent:'10',share_change_percentage_points:'0',current_period_start:'2025-09',prior_period_start:'2024-09',classification_status:'compatible',raw_verification:'synthetic',current_original_sources:'[]'});
  expect(rows[1]).toMatchObject({current_value_usd:'216000',comparison_eligible:'false',classification_status:'statistical-category',change_usd:'',growth_percent:'',current_share_percent:''});
});
it.each([['imports','incompatible'],['exports','incomplete']] as const)('blanks unsupported %s %s comparisons while preserving observed totals', (direction,reason)=>{
  const data=makeCountryPreviewFixture(),product=data.directions[direction].products.find(row=>row.code==='270900')!;
  product.comparisonEligible=false;product.reason=reason;product.classification.status=reason==='incompatible'?'incompatible':'unverified';
  if(reason==='incomplete')product.current.reportedMonths=11;
  const rows=parseCsv(serializeCountryProductsCsv(validateFixturePreview(data),direction));
  expect(rows.find(row=>row.product_code==='270900')).toMatchObject({comparison_eligible:'false',reason,current_value_usd:direction==='imports'?'240000':'216000',prior_value_usd:direction==='imports'?'120000':'108000',current_country_total_usd:String(product.current.countryTotalUsd),prior_country_total_usd:String(product.prior.countryTotalUsd),current_reported_months:String(product.current.reportedMonths),change_usd:'',growth_percent:'',current_share_percent:'',prior_share_percent:'',share_change_percentage_points:''});
  const eligible=rows.find(row=>row.comparison_eligible==='true')!;expect(eligible.growth_percent).toBe('100');expect(eligible.current_share_percent).not.toBe('');
});
it('binds retained monthly and rolling source records to the selected direction',()=>{
  const data=makeCountryPreviewFixture();data.source='retained';data.rawVerification='previous-reviewed-replay';
  for(const d of ['imports','exports'] as const)for(const p of data.directions[d].monthly)p.originalSource={month:p.month,url:`https://www.census.gov/${d}/${p.month}.ZIP`,capturedAt:'2026-10-11T00:00:00Z',bytes:123,sha256:d==='imports'?'a'.repeat(64):'b'.repeat(64)};
  for(const d of ['imports','exports'] as const){
    const monthly=parseCsv(serializeCountryMonthlyCsv(data,d)),products=parseCsv(serializeCountryProductsCsv(data,d));
    expect(monthly[0]).toMatchObject({original_source_url:`https://www.census.gov/${d}/2024-09.ZIP`,original_source_bytes:'123',raw_verification:'previous-reviewed-replay'});
    const sources=JSON.parse(products[0].current_original_sources);expect(sources).toHaveLength(12);expect(sources[0]).toEqual(data.directions[d].monthly[12].originalSource);
    expect(JSON.parse(products[0].prior_original_sources)[11]).toEqual(data.directions[d].monthly[11].originalSource);
    expect(products[0].source).toBe('U.S. Census Bureau monthly merchandise files');
  }
});
it('round-trips quoted descriptions and protects formulas while keeping negative numbers numeric',()=>{
  const data=makeCountryPreviewFixture();data.directions.imports.products[0].description='=SUM(1,1)';data.directions.imports.products[0].changeUsd=-120000;data.directions.imports.products[2].description='A "quoted"\ncategory';
  const rows=parseCsv(serializeCountryProductsCsv(data,'imports'));
  expect(rows[0].description).toBe("'=SUM(1,1)");expect(rows[0].change_usd).toBe('-120000');expect(rows[2].description).toBe('A "quoted"\ncategory');
});
