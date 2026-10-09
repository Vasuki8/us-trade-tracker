import {expect,it} from 'vitest';
import {buildDutyView} from '../../src/lib/trade/duties';
import {sampleDutyRelease} from '../helpers/duties';
import {sampleRelease} from '../helpers/release';
const series=()=>buildDutyView(sampleDutyRelease(),[]).series[0];
it('calculates rolling shares from matching sums, not monthly percentage averages',()=>{
 const {current,previous,change}=series().rolling;
 expect(current.calculatedDutyUsd).toBe(30);expect(current.consumptionValueUsd).toBe(400);expect(current.dutySharePercent).toBe(7.5);
 expect(previous.calculatedDutyUsd).toBe(10);expect(previous.consumptionValueUsd).toBe(200);expect(previous.dutySharePercent).toBe(5);
 expect(change.dutySharePercentagePoints).toBe(2.5);expect(change.calculatedDutyUsd).toBe(20);expect(change.growthPercent).toBe(200);
 expect(current.from).toBe('2025-01');expect(current.to).toBe('2025-12');expect(previous.from).toBe('2024-01');
});
it('uses matching months for YoY even when an intervening month is missing',()=>{
 const r=sampleDutyRelease();r.duties.observations=r.duties.observations.filter(row=>row.month!=='2025-03');
 for(const row of r.duties.observations){if(row.month==='2025-12'){row.calculatedDuty.valueUsd=6;row.consumptionValue.valueUsd=100;}if(row.month==='2024-12'){row.calculatedDuty.valueUsd=2;row.consumptionValue.valueUsd=50;}}
 const view=buildDutyView(r,[]).series[0];expect(view.latest.change).toMatchObject({calculatedDutyUsd:4,growthPercent:200,dutySharePercentagePoints:2,comparable:true});
 expect(view.rolling.change.comparable).toBe(false);expect(view.rolling.change.calculatedDutyUsd).toBeNull();expect(view.monthly.find(row=>row.from==='2025-03')!.calculatedDutyUsd).toBeNull();
});
it.each(['missing','suppressed','coverage','classification'])('withholds unsupported rolling comparisons for %s while retaining available reported dollars',kind=>{
 const r=sampleDutyRelease(),row=r.duties.observations.find(row=>row.month==='2025-01')!;
 if(kind==='missing'||kind==='suppressed')row.consumptionValue={valueUsd:null,status:kind};
 if(kind==='coverage')row.coverage={status:'unavailable',uncalculatedDutiableValueUsd:null};
 if(kind==='classification')r.classificationIntervals=[{from:'2024-01',to:'2024-12',evidenceUrl:'https://example.invalid/prior'},{from:'2025-01',to:'2025-12',evidenceUrl:'https://example.invalid/current'}];
 const view=buildDutyView(r,[]).series[0];expect(view.rolling.current.calculatedDutyUsd).toBe(30);expect(view.rolling.change.comparable).toBe(false);expect(view.rolling.change.growthPercent).toBeNull();
 if(kind==='classification')expect(view.latest.change.comparable).toBe(false);
});
it('retains reported zero duties and reports RP70/79 affected dutiable dollars and share in both periods',()=>{
 const r=sampleDutyRelease();r.duties.observations[0].coverage.uncalculatedDutiableValueUsd=40;r.duties.observations[12].coverage.uncalculatedDutiableValueUsd=100;
 const view=buildDutyView(r,[]).series[0];expect(view.rolling.change.comparable).toBe(true);expect(view.rolling.current.coverage).toMatchObject({status:'verified',affectedDutiableValueUsd:100,affectedSharePercent:25,qualified:true});expect(view.rolling.previous.coverage.affectedSharePercent).toBe(20);
 expect(view.monthly[1].calculatedDutyUsd).toBe(0);expect(view.monthly[1].dutySharePercent).toBe(0);
});
it('keeps a zero denominator and zero prior duty out of derived percentages',()=>{
 const r=sampleDutyRelease();for(const row of r.duties.observations){if(row.month.startsWith('2024'))row.calculatedDuty.valueUsd=0;if(row.month==='2025-12')row.consumptionValue.valueUsd=0;}
 const view=buildDutyView(r,[]).series[0];expect(view.latest.current.dutySharePercent).toBeNull();expect(view.latest.change.growthPercent).toBeNull();expect(view.rolling.change.growthPercent).toBeNull();expect(view.rolling.change.calculatedDutyUsd).toBe(30);
});
it('keeps each selected country separate, without manufacturing missing country-month zeros',()=>{
 const r=sampleDutyRelease();r.duties.observations.push(...r.duties.observations.filter(row=>row.month!=='2025-05').map(row=>({...structuredClone(row),geography:'country' as const,partnerCode:'1220',partnerName:'CANADA'})));
 const view=buildDutyView(r,['1220','4759']);expect(view.series.map(s=>s.code)).toEqual(['1220','4759']);expect(view.series[0].rolling.change.comparable).toBe(false);expect(view.series[1].rolling.current.calculatedDutyUsd).toBeNull();expect(view.series[0].latest.current.calculatedDutyUsd).toBe(1);
});
it('returns explicit unavailability for v1 and rejects duplicate identities or unsafe totals',()=>{
 expect(buildDutyView(sampleRelease(),[])).toMatchObject({available:false,series:[]});const r=sampleDutyRelease();r.duties.observations.push(r.duties.observations[0]);expect(()=>buildDutyView(r,[])).toThrow(/duplicate/i);
 const huge=sampleDutyRelease();huge.duties.observations.forEach(row=>row.calculatedDuty.valueUsd=Number.MAX_SAFE_INTEGER);expect(()=>buildDutyView(huge,[])).toThrow(/precision|safe/i);
});
