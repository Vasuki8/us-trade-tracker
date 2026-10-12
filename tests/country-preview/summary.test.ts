import {describe,it,expect} from 'vitest';
import {buildCountryTotalSummary} from '../../src/lib/country-preview/summary';
import {makeCountryTotalPointsFixture} from '../helpers/country-preview-data';
describe('captured country period summary',()=>{
  it('uses complete matching periods rather than monthly averages',()=>{
    const r=buildCountryTotalSummary(makeCountryTotalPointsFixture());
    expect(r).toMatchObject({latestMonth:'2026-08',latestUsd:200000,current:{from:'2025-09',to:'2026-08',reportedMonths:12,totalUsd:2400000},prior:{from:'2024-09',to:'2025-08',reportedMonths:12,totalUsd:1200000},changeUsd:1200000,growthPercent:100});
  });
  it.each(['missing','null'] as const)('withholds totals when a prior month is %s',kind=>{
    const p=makeCountryTotalPointsFixture();if(kind==='missing')p.shift();else p[0].valueUsd=null;
    expect(buildCountryTotalSummary(p)).toMatchObject({prior:{reportedMonths:11,totalUsd:null},current:{totalUsd:2400000},changeUsd:null,growthPercent:null});
  });
  it('keeps reported zero and withholds growth for a zero prior total',()=>{
    const p=makeCountryTotalPointsFixture();for(const v of p.filter(v=>v.month<'2025-09'))v.valueUsd=0;
    expect(buildCountryTotalSummary(p)).toMatchObject({prior:{reportedMonths:12,totalUsd:0},changeUsd:2400000,growthPercent:null});
  });
  it.each(['duplicate','unsafe','negative','wrong-month','overflow'] as const)('rejects %s input',kind=>{
    const p=makeCountryTotalPointsFixture();if(kind==='duplicate')p.push({...p[0]});if(kind==='unsafe')p[0].valueUsd=Number.MAX_SAFE_INTEGER+1;if(kind==='negative')p[0].valueUsd=-1;if(kind==='wrong-month')p[0].month='2024-13';if(kind==='overflow')for(const v of p)v.valueUsd=Number.MAX_SAFE_INTEGER;
    expect(()=>buildCountryTotalSummary(p)).toThrow();
  });
});
