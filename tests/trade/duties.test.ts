import {expect,it} from 'vitest';
import {buildDutyView} from '../../src/lib/trade/duties';
import {sampleDutyRelease} from '../helpers/duties';
import {sampleRelease} from '../helpers/release';
import {serializeDutyCsv} from '../../src/lib/trade/downloads';
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
it('exports displayed monthly and rolling records, matching measures, qualifications and provenance',()=>{
 const r=sampleDutyRelease();r.duties.observations[12].coverage.uncalculatedDutiableValueUsd=100;
 const csv=serializeDutyCsv(buildDutyView(r,[]));expect(csv).toContain('CAL_DUT_MO,CON_VAL_MO,DUT_VAL_MO');expect(csv).toContain('Estimated duties');expect(csv).toContain('2026-01-01T00:00:00.000Z');expect(csv).toContain('Development sample data');expect(csv).toContain('2025-01,2025-12');
 const lines=csv.trim().split('\r\n');expect(lines).toHaveLength(27);const header=lines[0].split(','),current=lines.find(line=>line.startsWith('rolling_current,'))!.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
 expect(current[header.indexOf('calculated_duty_usd')]).toBe('30');expect(current[header.indexOf('consumption_value_usd')]).toBe('400');expect(current[header.indexOf('duty_share_percent')]).toBe('7.5');expect(current[header.indexOf('affected_dutiable_value_usd')]).toBe('100');expect(current[header.indexOf('affected_dutiable_share_percent')]).toBe('25');
 expect(current[header.indexOf('duty_share_change_percentage_points')]).toBe('2.5');
});
it('quotes CSV text safely, keeps numeric changes numeric and missing cells blank',()=>{
 const view=buildDutyView(sampleDutyRelease(),[]);view.title='@Coffee, "roasted"\nline';view.series[0].name='=1+1';view.series[0].monthly[0].calculatedDutyUsd=null;view.series[0].monthly[0].statuses.calculatedDuty='suppressed';view.series[0].rolling.change.calculatedDutyUsd=-20;
 const csv=serializeDutyCsv(view);expect(csv).toContain('"\'@Coffee, ""roasted""\nline"');expect(csv).toContain("'=1+1");expect(csv).toContain(',-20,');expect(csv).toContain(',suppressed,');expect(csv).not.toContain("'-20");
});
it('projects exact canonical monthly inputs in selected-series and month order without changing comparisons',()=>{
 const r=sampleDutyRelease(),before=buildDutyView(r,[]);
 r.duties.revisedKeys=[
  'imports/090121/2025-02/world/-/coverage','imports/090121/2024-01/world/-/DUT_VAL_MO',
  'imports/090121/2024-01/world/-/CAL_DUT_MO','imports/090121/2024-01/world/-/CON_VAL_MO',
  'imports/090121/2024-01/world/-/CAL_DUT_MO',
  'exports/090121/2024-01/world/-/CAL_DUT_MO','imports/090111/2024-01/world/-/CAL_DUT_MO',
  'imports/090121/2023-12/world/-/CAL_DUT_MO','imports/090121/2026-01/world/-/CAL_DUT_MO',
  'imports/090121/2024-01/country/-/CAL_DUT_MO','imports/090121/2024-01/world/1220/CAL_DUT_MO',
  'imports/090121/2024-01/world/-/GEN_VAL_MO','imports/090121/2024-01/world/-/CAL_DUT_MO/extra',
  'imports/090121/2025-03/country/1220/coverage','imports/090121/2024-04/country/2010/CON_VAL_MO',
 ];
 r.revisedKeys=['imports/090121/2025-04/world/-/CAL_DUT_MO'];
 const view=buildDutyView(r,[]);
 expect(view.monthlyRecordedRevisions).toEqual([
  {partnerCode:'-',month:'2024-01',inputs:['CAL_DUT_MO','CON_VAL_MO','DUT_VAL_MO']},
  {partnerCode:'-',month:'2025-02',inputs:['coverage']},
 ]);
 expect(buildDutyView(r,['2010','1220','4759']).monthlyRecordedRevisions).toEqual([
  {partnerCode:'2010',month:'2024-04',inputs:['CON_VAL_MO']},{partnerCode:'1220',month:'2025-03',inputs:['coverage']},
 ]);
 expect(view.series).toEqual(before.series);
 expect(view.series[0].rolling.current).toMatchObject({calculatedDutyUsd:30,consumptionValueUsd:400,dutySharePercent:7.5});
 expect(view.series[0].rolling.previous).toMatchObject({calculatedDutyUsd:10,consumptionValueUsd:200,dutySharePercent:5});
 expect(view.provenance.revised).toBe(true);
});
it.each(['zero','suppressed','removed'] as const)('retains monthly key attribution for %s inputs without manufacturing values',kind=>{
 const r=sampleDutyRelease();
 if(kind==='removed')r.duties.observations=r.duties.observations.filter(row=>row.month!=='2024-02');
 if(kind==='suppressed')r.duties.observations[1].calculatedDuty={valueUsd:null,status:'suppressed'};
 r.duties.revisedKeys=['imports/090121/2024-02/world/-/CAL_DUT_MO'];
 const view=buildDutyView(r,[]);
 expect(view.monthlyRecordedRevisions).toEqual([{partnerCode:'-',month:'2024-02',inputs:['CAL_DUT_MO']}]);
 expect(view.series[0].monthly[1].calculatedDutyUsd).toBe(kind==='zero'?0:null);
 expect(view.series[0].monthly[1].statuses.calculatedDuty).toBe(kind==='zero'?'reported':kind==='removed'?'missing':'suppressed');
});
it('has no monthly input attribution without duty keys, including legacy views',()=>{
 expect(buildDutyView(sampleRelease(),[]).monthlyRecordedRevisions).toEqual([]);
 expect(buildDutyView(sampleDutyRelease(),[]).monthlyRecordedRevisions).toEqual([]);
});
it('appends exact monthly revision inputs and explicitly leaves rolling attribution unassessed',()=>{
 const r=sampleDutyRelease();r.duties.revisedKeys=['coverage','DUT_VAL_MO','CON_VAL_MO','CAL_DUT_MO','coverage'].map(input=>`imports/090121/2025-01/world/-/${input}`);
 const csv=serializeDutyCsv(buildDutyView(r,[])),lines=csv.trim().split('\r\n');
 const parse=(line:string)=>line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
 const header=parse(lines[0]);expect(header.slice(-3)).toEqual(['revised_scope','recorded_revision_scope','recorded_revision_inputs']);
 const rows=lines.slice(1).map(parse);
 expect(rows.every(row=>row.length===header.length)).toBe(true);
 const revised=rows.find(row=>row[0]==='monthly'&&row[7]==='2025-01')!;
 expect(revised.slice(-3)).toEqual(['estimated_duty_release','monthly_inputs','CAL_DUT_MO | CON_VAL_MO | DUT_VAL_MO | coverage']);
 expect(revised[header.indexOf('revised')]).toBe('true');
 expect(revised[header.indexOf('calculated_duty_usd')]).toBe('19');
 expect(rows.find(row=>row[7]==='2024-02')!.slice(-3)).toEqual(['estimated_duty_release','monthly_inputs','']);
 for(const row of rows.filter(row=>row[0].startsWith('rolling'))){expect(row.slice(-3)).toEqual(['estimated_duty_release','not_assessed','']);expect(row[header.indexOf('revised')]).toBe('true');}
 expect(serializeDutyCsv(buildDutyView(sampleDutyRelease(),[]))).toContain(',false,');
});
