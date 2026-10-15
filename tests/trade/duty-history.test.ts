import {expect,it} from 'vitest';
import {buildDutyHistoryChart} from '../../src/lib/trade/duty-history';
import {buildDutyView} from '../../src/lib/trade/duties';
import {serializeDutyCsv} from '../../src/lib/trade/downloads';
import {sampleDutyRelease} from '../helpers/duties';
import {sampleRelease} from '../helpers/release';
import {parseCsv} from '../helpers/parse-csv';

it('copies monthly values without rolling or general-import denominators',()=>{
 const r=sampleDutyRelease(),view=buildDutyView(r,[]),amount=buildDutyHistoryChart(view,r.classificationIntervals,'dollars'),share=buildDutyHistoryChart(view,r.classificationIntervals,'share');
 expect(amount).toMatchObject({productCode:'090121',fromMonth:'2024-01',reportingMonth:'2025-12',metric:'dollars'});
 expect(amount.series.map(s=>s.code)).toEqual(['-']);expect(amount.series[0].points).toHaveLength(24);
 expect(amount.series[0].points[12]).toMatchObject({month:'2025-01',value:19,consumptionValueUsd:180,classificationVerified:true,breakBefore:false});
 expect(share.series[0].points[12].value).toBeCloseTo(10.555555555555555);expect(share.series[0].points[13].value).toBe(5);
 const csv=parseCsv(serializeDutyCsv(view)).find(row=>row.record_type==='monthly'&&row.period_start==='2025-01')!;
 expect(csv.calculated_duty_usd).toBe('19');expect(csv.consumption_value_usd).toBe('180');expect(csv.duty_share_percent).toBe('10.555555555555555');
 expect(amount.provenance).toMatchObject({source:'fixture',retrievedAt:'2026-01-01T00:00:00.000Z',codeVersion:'synthetic'});
});
it('preserves selected-country order without adding world totals',()=>{
 const r=sampleDutyRelease(),world=[...r.duties.observations];
 for(const [code,name]of [['1220','CANADA'],['4759','ITALY'],['2010','MEXICO']])r.duties.observations.push(...world.map(row=>({...structuredClone(row),partnerCode:code,partnerName:name,geography:'country' as const,calculatedDuty:{status:'reported' as const,valueUsd:0},consumptionValue:{status:'reported' as const,valueUsd:1},dutiableValue:{status:'reported' as const,valueUsd:1}})));
 const model=buildDutyHistoryChart(buildDutyView(r,['2010','1220','4759']),r.classificationIntervals,'share');
 expect(model.series.map(s=>s.code)).toEqual(['2010','1220','4759']);expect(model.series.map(s=>s.name)).toEqual(['MEXICO','CANADA','ITALY']);expect(model.series.every(s=>s.points.length===24&&s.points[12].value===0)).toBe(true);
});
it('keeps reported zero dollars distinct from zero-denominator and suppressed shares',()=>{
 const r=sampleDutyRelease();r.duties.observations[0].calculatedDuty.valueUsd=0;r.duties.observations[0].consumptionValue.valueUsd=0;
 r.duties.observations[1].calculatedDuty={valueUsd:null,status:'suppressed'};
 const view=buildDutyView(r,[]),a=buildDutyHistoryChart(view,r.classificationIntervals,'dollars').series[0].points,s=buildDutyHistoryChart(view,r.classificationIntervals,'share').series[0].points;
 expect(a[0].value).toBe(0);expect(s[0].value).toBeNull();expect(a[1].value).toBeNull();expect(s[1].value).toBeNull();expect(a[2].breakBefore).toBe(true);
});
it('copies tiny positive shares without rounding or clamping',()=>{
 const r=sampleDutyRelease();Object.assign(r.duties.observations[0],{calculatedDuty:{valueUsd:3,status:'reported'},consumptionValue:{valueUsd:1_000_000,status:'reported'}});
 const model=buildDutyHistoryChart(buildDutyView(r,[]),r.classificationIntervals,'share');expect(model.series[0].points[0].value).toBe(0.0003);
 r.duties.observations[0].calculatedDuty.valueUsd=200;r.duties.observations[0].consumptionValue.valueUsd=100;
 expect(buildDutyHistoryChart(buildDutyView(r,[]),r.classificationIntervals,'share').series[0].points[0].value).toBe(200);
});
it('keeps qualified months connected with their exact affected coverage',()=>{
 const r=sampleDutyRelease();r.duties.observations[12].coverage.uncalculatedDutiableValueUsd=90;
 const p=buildDutyHistoryChart(buildDutyView(r,[]),r.classificationIntervals,'dollars').series[0].points;
 expect(p[12]).toMatchObject({value:19,breakBefore:false,coverage:{status:'verified',qualified:true,affectedDutiableValueUsd:90,affectedSharePercent:50}});expect(p[13].breakBefore).toBe(false);
});
it('isolates unverified reporting coverage while retaining reported points',()=>{
 const r=sampleDutyRelease();r.duties.observations[12].coverage={status:'unavailable',uncalculatedDutiableValueUsd:null};
 const p=buildDutyHistoryChart(buildDutyView(r,[]),r.classificationIntervals,'dollars').series[0].points;
 expect(p[12]).toMatchObject({value:19,breakBefore:true,coverage:{status:'unavailable',affectedDutiableValueUsd:null,affectedSharePercent:null}});expect(p[13].breakBefore).toBe(true);expect(p[14].breakBefore).toBe(false);
});
it('breaks between distinct verified classification intervals',()=>{
 const r=sampleDutyRelease();r.classificationIntervals=[{from:'2024-01',to:'2024-12',evidenceUrl:'https://example.invalid/a'},{from:'2025-01',to:'2025-12',evidenceUrl:'https://example.invalid/b'}];
 const v=buildDutyView(r,[]);expect(v.series[0].monthly[11].classificationCompatible).toBe(true);expect(v.series[0].monthly[12].classificationCompatible).toBe(true);
 const p=buildDutyHistoryChart(v,r.classificationIntervals,'dollars').series[0].points;
 expect(p[11].breakBefore).toBe(false);expect(p[12]).toMatchObject({value:19,classificationVerified:true,breakBefore:true});expect(p[13].breakBefore).toBe(false);
});
it('isolates classification gaps without erasing reported amounts',()=>{
 const r=sampleDutyRelease();r.classificationIntervals=[{from:'2024-01',to:'2024-12',evidenceUrl:'https://example.invalid/a'},{from:'2025-02',to:'2025-12',evidenceUrl:'https://example.invalid/b'}];
 const p=buildDutyHistoryChart(buildDutyView(r,[]),r.classificationIntervals,'dollars').series[0].points;
 expect(p[12]).toMatchObject({value:19,classificationVerified:false,breakBefore:true});expect(p[13].breakBefore).toBe(true);expect(p[14].breakBefore).toBe(false);
});
it.each(['zero','missing'] as const)('preserves a fully %s monthly series',kind=>{
 const r=sampleDutyRelease();for(const row of r.duties.observations)row.calculatedDuty=kind==='zero'?{valueUsd:0,status:'reported'}:{valueUsd:null,status:'missing'};
 const p=buildDutyHistoryChart(buildDutyView(r,[]),r.classificationIntervals,'dollars').series[0].points;
 expect(p).toHaveLength(24);expect(p.every(point=>point.value===(kind==='zero'?0:null))).toBe(true);
});
it('returns no chart series for a legacy release',()=>{
 const r=sampleRelease();expect(buildDutyHistoryChart(buildDutyView(r,[]),r.classificationIntervals,'dollars')).toMatchObject({fromMonth:null,series:[]});
});
it.each(['duplicate','missing','reordered','wrong-period'] as const)('rejects %s monthly alignment',kind=>{
 const r=sampleDutyRelease(),view=buildDutyView(r,[]),p=view.series[0].monthly;
 if(kind==='duplicate')p[1]=p[0];if(kind==='missing')p.pop();if(kind==='reordered')[p[1],p[2]]=[p[2],p[1]];if(kind==='wrong-period')p[1].to='2025-02';
 expect(()=>buildDutyHistoryChart(view,r.classificationIntervals,'dollars')).toThrow(/monthly|align/i);
});
