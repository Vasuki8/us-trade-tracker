import {useId,type ReactNode} from 'react';
import type {DutyChartModel,DutyChartMetric,DutyChartPoint,DutyChartSeries} from '../lib/trade/duty-history';
import {monthLabel,usd,seriesColor} from '../lib/trade/format';
export type DutyPlotSize={width:number;height:number;left:number;right:number;top:number;bottom:number;fontSize:number};
export const dutyDesktopSize:DutyPlotSize={width:960,height:310,left:90,right:930,top:20,bottom:250,fontSize:13};
const mobileSize:DutyPlotSize={width:320,height:230,left:64,right:308,top:18,bottom:188,fontSize:11};
export const dutyMetricHeading=(metric:DutyChartMetric)=>metric==='dollars'?'Monthly estimated duties · current USD':'Calculated duties as share of import value · %';
export const dutyShareLabel=(value:number|null)=>value===null?'Unavailable':value>0&&value<0.001?'<0.001%':value.toFixed(3)+'%';
export const dutyValueLabel=(metric:DutyChartMetric,value:number|null)=>metric==='dollars'?usd(value):dutyShareLabel(value);
export const dutySeriesDash=(i:number)=>[undefined,'8 5','2 5'][i];
export function dutyQualificationSummary(series:DutyChartSeries):string{
 const p=series.points,n=p.length;
 return `${series.name} (${series.code}): RP70/79 affected ${p.filter(p=>p.coverage.qualified).length} of ${n} · coverage unverified ${p.filter(p=>p.coverage.status!=='verified').length} of ${n} · classification unverified ${p.filter(p=>!p.classificationVerified).length} of ${n} · unavailable ${p.filter(p=>p.value===null).length} of ${n}`;
}
export const dutyPointTitle=(model:DutyChartModel,series:DutyChartSeries,p:DutyChartPoint)=>`${monthLabel(p.month)} · ${series.name} (${series.code}): ${dutyValueLabel(model.metric,p.value)} · Consumption value ${usd(p.consumptionValueUsd)} · RP70/79 ${usd(p.coverage.affectedDutiableValueUsd)} (${dutyShareLabel(p.coverage.affectedSharePercent)} of dutiable value) · Reporting coverage ${p.coverage.status} · Classification ${p.classificationVerified?'verified':'unverified'}`;
export function DutyPlotMarks({model,size}:{model:DutyChartModel;size:DutyPlotSize}){
 const points=model.series[0]?.points??[],largest=Math.max(0,...model.series.flatMap(s=>s.points.map(p=>p.value??0))),maximum=(largest>0?largest:1)*1.12;
 const x=(i:number)=>size.left+i/Math.max(1,points.length-1)*(size.right-size.left),y=(v:number)=>size.bottom-v/maximum*(size.bottom-size.top);
 const tick=(v:number)=>model.metric==='share'?new Intl.NumberFormat('en-US',{maximumSignificantDigits:3,notation:v>0&&v<0.000001?'scientific':'standard'}).format(v)+'%':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:v>=1000?'compact':'standard',maximumSignificantDigits:3}).format(v);
 return <>
  {[0,1,2,3,4].map(i=><g key={i}><line x1={size.left} x2={size.right} y1={y(maximum*i/4)} y2={y(maximum*i/4)} stroke="#d8dfd9"/><text x={size.left-9} y={y(maximum*i/4)+4} textAnchor="end" fontSize={size.fontSize} fill="#53676e">{tick(maximum*i/4)}</text></g>)}
  {model.series.map((series,si)=>{
   let connected=false;
   const path=series.points.map((p,i)=>{if(p.value===null){connected=false;return '';}const command=connected&&!p.breakBefore?'L':'M';connected=true;return command+x(i)+','+y(p.value);}).join(' ');
   return <g key={series.code}><path d={path} fill="none" stroke={seriesColor(series.code)} strokeWidth="2.5" strokeDasharray={dutySeriesDash(si)} strokeLinejoin="round"/>
    {series.points.map((p,i)=>p.value===null?null:<circle key={p.month} cx={x(i)} cy={y(p.value)} r="3.3" fill={p.coverage.qualified||p.coverage.status!=='verified'||!p.classificationVerified?'white':seriesColor(series.code)} stroke={seriesColor(series.code)} strokeWidth="1.8"><title>{dutyPointTitle(model,series,p)}</title></circle>)}
   </g>;
  })}
  {points.length>0&&<><text x={size.left} y={size.bottom+26} fontSize={size.fontSize} fill="#53676e">{monthLabel(points[0].month)}</text><text x={size.right} y={size.bottom+26} textAnchor="end" fontSize={size.fontSize} fill="#53676e">{monthLabel(points.at(-1)!.month)}</text></>}
 </>;
}
export function DutyHistoryChart({model,download}:{model:DutyChartModel;download?:ReactNode}){
 const id=useId(),heading=dutyMetricHeading(model.metric),period=model.fromMonth?monthLabel(model.fromMonth)+'–'+monthLabel(model.reportingMonth):'Unavailable';
 const hasValues=model.series.some(s=>s.points.some(p=>p.value!==null));
 return <figure className="duty-history-chart" aria-labelledby={id+'-heading'}>
  <h3 id={id+'-heading'}>{heading}</h3><p className="duty-chart-period">{period} · Monthly U.S. imports for consumption · {model.metric==='dollars'?'CAL_DUT_MO · not seasonally adjusted':'100 × CAL_DUT_MO / CON_VAL_MO'}</p>
  <div role="img" aria-label={heading+' chart · '+period} aria-describedby={id+'-notes'}>
   {[['duty-chart-desktop',dutyDesktopSize],['duty-chart-mobile',mobileSize]].map(([className,size])=>{const s=size as DutyPlotSize;return <svg key={className as string} className={className as string} viewBox={`0 0 ${s.width} ${s.height}`} aria-hidden="true" focusable="false" fontFamily="Segoe UI, Arial, sans-serif"><DutyPlotMarks model={model} size={s}/></svg>;})}
  </div>
  {!hasValues&&<p>No reported monthly values are available for this chart metric.</p>}
  <ul className="duty-chart-legend">{model.series.map((s,i)=><li key={s.code}><svg viewBox="0 0 24 8" aria-hidden="true"><line x1="0" x2="24" y1="4" y2="4" stroke={seriesColor(s.code)} strokeWidth="3" strokeDasharray={dutySeriesDash(i)}/></svg>{s.name} · {s.code}</li>)}</ul>
  <figcaption id={id+'-notes'}><p>Exact values, denominators and reporting details are in the monthly tables below. Hollow markers indicate RP70/79 affected values or unverified coverage/classification. Gaps indicate unavailable values; connections require verified coverage in the same reviewed classification interval.</p>
   {model.series.map(s=><p key={s.code}>{dutyQualificationSummary(s)}</p>)}
   <p>Counts can overlap. Reported zero duties do not prove duty-free trade. Duty-share changes can reflect import mix and reporting coverage as well as tariff changes.</p>
  </figcaption>
  {download}
 </figure>;
}
