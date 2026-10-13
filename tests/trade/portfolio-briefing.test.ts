import {expect,it} from 'vitest';
import {portfolioSample} from '../helpers/portfolio';
import {preparePortfolioBriefing,selectPortfolioBriefing} from '../../src/lib/trade/portfolio-briefing';

it('uses matching world periods and rolling dollar-ranked partner highlights',()=>{
  const data=preparePortfolioBriefing([portfolioSample()]);
  const view=selectPortfolioBriefing(data,{productCodes:['090121'],direction:'imports'});
  expect(view.reportingMonth).toBe('2025-12');
  const card=view.products[0].data!;
  expect(card.monthly).toMatchObject({periods:{current:{from:'2025-12',to:'2025-12'},previous:{from:'2024-12',to:'2024-12'}},status:'available',comparison:{current:100,previous:50,changeUsd:50,changePercent:100}});
  expect(card.rolling.comparison).toEqual({current:1200,previous:600,changeUsd:600,changePercent:100});
  expect(card.highlights).toMatchObject([{movement:'increase',country:{code:'1220',currentUsd:480,previousUsd:120,changeUsd:360,shareChangePoints:20}},{movement:'decrease',country:{code:'4759',currentUsd:120,previousUsd:240,changeUsd:-120,shareChangePoints:-30}}]);
  expect(card.worldDuties?.rolling.current).toMatchObject({calculatedDutyUsd:144,consumptionValueUsd:960,dutySharePercent:15,coverage:{qualified:true,affectedDutiableValueUsd:24,affectedSharePercent:5}});
  expect(card.worldDuties?.rolling.change).toMatchObject({calculatedDutyUsd:120,growthPercent:500,dutySharePercentagePoints:5});
  expect(card.highlights[0].duties?.current).toMatchObject({calculatedDutyUsd:12,consumptionValueUsd:120,dutySharePercent:10});
  expect(JSON.stringify(data)).not.toContain('observations');
  expect(JSON.stringify(data)).not.toContain('monthly":[{');
  expect(selectPortfolioBriefing(data,{productCodes:['090121'],direction:'exports'}).products[0].data).toMatchObject({monthly:{comparison:{current:200,previous:100}},worldDuties:null});
});

it('does not mix reporting months and lets an older selected product stand alone',()=>{
  const latest=portfolioSample(),older=portfolioSample('090111','Green');older.release.reportingMonth='2025-11';
  const data=preparePortfolioBriefing([latest,older]),before=JSON.stringify(data);
  const mixed=selectPortfolioBriefing(data,{productCodes:['090121','090111'],direction:'imports'});
  expect(mixed.products[1]).toMatchObject({reportingMonth:'2025-11',status:'reporting_month_mismatch',data:null});
  expect(mixed.periods.monthly.current).toEqual({from:'2025-12',to:'2025-12'});
  expect(selectPortfolioBriefing(data,{productCodes:['090111'],direction:'imports'})).toMatchObject({reportingMonth:'2025-11',products:[{status:'available',data:{monthly:{periods:{current:{from:'2025-11',to:'2025-11'}}}}}]});
  expect(JSON.stringify(data)).toBe(before);
});

it('preserves suppressed, missing and zero values without fabricated growth or duties',()=>{
  const item=portfolioSample();
  for(const row of item.release.observations)if(row.month==='2024-12')row.valueUsd=0;
  const hidden=item.release.observations.find(r=>r.month==='2025-12'&&r.partnerCode==='1220'&&r.direction==='imports')!;hidden.status='suppressed';hidden.valueUsd=null;
  const duty=item.release.duties.observations.find(r=>r.month==='2025-12'&&r.geography==='world')!;duty.consumptionValue.valueUsd=0;
  const view=selectPortfolioBriefing(preparePortfolioBriefing([item]),{productCodes:['090121'],direction:'imports'}).products[0].data!;
  expect(view.monthly.comparison).toEqual({current:100,previous:0,changeUsd:100,changePercent:null});
  expect(view.highlights.some(h=>h.country.code==='1220')).toBe(false);
  expect(view.worldDuties?.latest.current.dutySharePercent).toBeNull();
  item.release.observations=item.release.observations.filter(r=>!(r.geography==='world'&&r.direction==='imports'&&r.month==='2025-12'));
  expect(preparePortfolioBriefing([item]).products[0].directions.imports.monthly).toMatchObject({status:'incomplete_period',comparison:{current:null,changeUsd:null}});
});

it('keeps classification and uncalculated-duty coverage qualifications',()=>{
  const item=portfolioSample();item.release.classificationIntervals=[{from:'2024-01',to:'2024-12',evidenceUrl:'a'},{from:'2025-01',to:'2025-12',evidenceUrl:'b'}];
  const data=preparePortfolioBriefing([item]).products[0].directions.imports;
  expect(data.rolling).toMatchObject({status:'classification_unverified',comparison:{changeUsd:null,changePercent:null}});
  expect(data.highlights).toEqual([]);expect(data.worldDuties?.rolling.change.comparable).toBe(false);
  item.release.classificationIntervals=[{from:'2024-01',to:'2025-12',evidenceUrl:'c'}];
  item.release.duties.observations[0].coverage={status:'unavailable',uncalculatedDutiableValueUsd:null};
  expect(preparePortfolioBriefing([item]).products[0].directions.imports.worldDuties?.rolling.previous.coverage.status).toBe('unavailable');
});

it('rejects invalid product selections and mismatched identities',()=>{
  const item=portfolioSample(),data=preparePortfolioBriefing([item]);
  for(const codes of [[],['bad'],['090121','090121']])expect(()=>selectPortfolioBriefing(data,{productCodes:codes,direction:'imports'})).toThrow();
  expect(()=>selectPortfolioBriefing(data,{productCodes:['090121'],direction:'bad' as 'imports'})).toThrow();
  expect(()=>preparePortfolioBriefing([item,item])).toThrow();
  item.release.productCode='090111';expect(()=>preparePortfolioBriefing([item])).toThrow();
});
