import type {Month,Release} from './types';
import type {DutyView,DutyPeriod} from './duty-types';
import {shiftMonth} from './metrics';

export type DutyChartMetric='dollars'|'share';
export type DutyChartPoint={month:Month;value:number|null;consumptionValueUsd:number|null;breakBefore:boolean;classificationVerified:boolean;coverage:DutyPeriod['coverage']};
export type DutyChartSeries={code:string;name:string;points:DutyChartPoint[]};
export type DutyChartModel={metric:DutyChartMetric;productCode:string;title:string;fromMonth:Month|null;reportingMonth:Month;series:DutyChartSeries[];provenance:DutyView['provenance']};

export function buildDutyHistoryChart(view:DutyView,intervals:Release['classificationIntervals'],metric:DutyChartMetric):DutyChartModel{
 const metadata={metric,productCode:view.productCode,title:view.title,fromMonth:view.fromMonth,reportingMonth:view.reportingMonth,provenance:view.provenance};
 if(!view.available)return {...metadata,series:[]};
 const months=Array.from({length:24},(_,i)=>shiftMonth(view.reportingMonth,i-23));
 if(view.fromMonth!==months[0])throw new Error('Duty monthly period is not aligned');
 const amount=(p:DutyPeriod)=>metric==='dollars'?p.calculatedDutyUsd:p.dutySharePercent;
 const verified=(p:DutyPeriod)=>p.classificationCompatible&&intervals.some(interval=>interval.from<=p.from&&p.to<=interval.to);
 const series=view.series.map(series=>{
  if(series.monthly.length!==24||series.monthly.some((p,i)=>p.from!==months[i]||p.to!==months[i]))throw new Error('Duty monthly observations are not aligned');
  return {code:series.code,name:series.name,points:series.monthly.map((p,i)=>{
   const prior=series.monthly[i-1],value=amount(p),classificationVerified=verified(p);
   const connected=prior!==undefined&&value!==null&&amount(prior)!==null&&p.coverage.status==='verified'&&prior.coverage.status==='verified'&&classificationVerified&&verified(prior)&&intervals.some(interval=>interval.from<=prior.from&&p.to<=interval.to);
   return {month:p.from,value,consumptionValueUsd:p.consumptionValueUsd,breakBefore:!connected,classificationVerified,coverage:{...p.coverage}};
  })};
 });
 return {...metadata,series};
}
