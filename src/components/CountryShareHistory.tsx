import {useId,type ReactNode} from 'react';
import type {CountryShareHistoryPoint,CountryShareHistorySeries,CountryShareHistoryView} from '../lib/trade/country-share-history';
import {monthLabel,usd,seriesColor} from '../lib/trade/format';
export type CountrySharePlotSize={width:number;height:number;left:number;right:number;top:number;bottom:number;fontSize:number};
export const countryShareHeading=(view:CountryShareHistoryView)=>`Country share of U.S. ${view.direction} · %`;
export const countryShareLabel=(v:number|null)=>v===null?'Unavailable':v>0&&v<0.001?'<0.001%':v.toFixed(3)+'%';
export const countryShareDash=(i:number)=>[undefined,'8 5','2 5'][i];
export const countrySharePointTitle=(view:CountryShareHistoryView,s:CountryShareHistorySeries,p:CountryShareHistoryPoint)=>`${monthLabel(p.month)} · ${s.name} (${s.code}): ${countryShareLabel(p.sharePercent)} · Country value ${usd(p.countryValueUsd)} (${p.countryStatus}) · U.S. total ${usd(p.worldValueUsd)} (${p.worldStatus}) · ${view.provenance.measure} · Classification ${p.classificationVerified?'verified':'unverified'}`;
export function CountrySharePlotMarks({view,size}:{view:CountryShareHistoryView;size:CountrySharePlotSize}){
 const points=view.series[0]?.points??[],largest=Math.max(0,...view.series.flatMap(s=>s.points.map(p=>p.sharePercent??0))),maximum=(largest>0?largest:1)*1.12;
 const x=(i:number)=>size.left+i/Math.max(1,points.length-1)*(size.right-size.left),y=(v:number)=>size.bottom-v/maximum*(size.bottom-size.top);
 const tick=(v:number)=>new Intl.NumberFormat('en-US',{maximumSignificantDigits:3,notation:v>0&&v<0.001?'scientific':'standard'}).format(v)+'%';
 return <>
  {[0,1,2,3,4].map(i=><g key={i}><line x1={size.left} x2={size.right} y1={y(maximum*i/4)} y2={y(maximum*i/4)} stroke="#d8dfd9"/><text x={size.left-9} y={y(maximum*i/4)+4} textAnchor="end" fontSize={size.fontSize} fill="#53676e">{tick(maximum*i/4)}</text></g>)}
  {view.series.map((s,si)=>{let connected=false;const path=s.points.map((p,i)=>{if(p.sharePercent===null){connected=false;return '';}const command=connected&&!p.breakBefore?'L':'M';connected=true;return command+x(i)+','+y(p.sharePercent);}).join(' ');return <g key={s.code}>
   <path d={path} fill="none" stroke={seriesColor(s.code)} strokeWidth="2.5" strokeDasharray={countryShareDash(si)} strokeLinejoin="round"/>
   {s.points.map((p,i)=>p.sharePercent===null?null:<circle key={p.month} cx={x(i)} cy={y(p.sharePercent)} r="3.3" fill={p.classificationVerified?seriesColor(s.code):'white'} stroke={seriesColor(s.code)} strokeWidth="1.8"><title>{countrySharePointTitle(view,s,p)}</title></circle>)}
  </g>;})}
  {points.length>0&&<><text x={size.left} y={size.bottom+26} fontSize={size.fontSize} fill="#53676e">{monthLabel(points[0].month)}</text><text x={size.right} y={size.bottom+26} textAnchor="end" fontSize={size.fontSize} fill="#53676e">{monthLabel(points.at(-1)!.month)}</text></>}
 </>;
}
const desktop:CountrySharePlotSize={width:960,height:310,left:90,right:930,top:20,bottom:250,fontSize:13};
const mobile:CountrySharePlotSize={width:320,height:230,left:64,right:308,top:18,bottom:188,fontSize:11};
export function CountryShareHistory({view,download}:{view:CountryShareHistoryView;download?:ReactNode}){
 const id=useId(),heading=countryShareHeading(view),period=view.fromMonth?monthLabel(view.fromMonth)+'–'+monthLabel(view.reportingMonth):'Unavailable';
 const controls=download??<div className="download-actions"><button className="secondary-button" disabled>Download country share chart PNG</button><button className="secondary-button" disabled>Download country share data CSV</button></div>;
 return <section className="country-share-history data-card" aria-labelledby="country-share-history-heading">
  <h2 id="country-share-history-heading">Country share over time</h2>
  {view.series.length===0?<><p>Choose up to three countries in Compare countries to see their monthly shares.</p><p className="chart-note">JavaScript is required to restore or select countries and download their share history.</p>{controls}</>:<>
   <figure className="share-history-chart" aria-labelledby={id+'-heading'}>
    <h3 id={id+'-heading'}>{heading}</h3><p className="share-history-period">{period} · {view.provenance.measure} · monthly merchandise value</p>
    <p className="share-history-definition">Each country’s value divided by the matching monthly U.S. total for this product and direction, multiplied by 100. {view.direction==='imports'?'General imports':'Total exports'} · current USD, not seasonally adjusted.</p>
    <div role="img" aria-label={heading+' chart · '+period} aria-describedby={id+'-notes'}>{[['share-history-desktop',desktop],['share-history-mobile',mobile]].map(([className,size])=>{const s=size as CountrySharePlotSize;return <svg key={className as string} className={className as string} viewBox={`0 0 ${s.width} ${s.height}`} aria-hidden="true" focusable="false" fontFamily="Segoe UI, Arial, sans-serif"><CountrySharePlotMarks view={view} size={s}/></svg>;})}</div>
    {!view.series.some(s=>s.points.some(p=>p.sharePercent!==null))&&<p>No reported monthly shares are available for this selection.</p>}
    <ul className="share-history-legend">{view.series.map((s,i)=><li key={s.code}><svg viewBox="0 0 24 8" aria-hidden="true"><line x1="0" x2="24" y1="4" y2="4" stroke={seriesColor(s.code)} strokeWidth="3" strokeDasharray={countryShareDash(i)}/></svg>{s.name} · {s.code}</li>)}</ul>
    <figcaption id={id+'-notes'}><p>Gaps mean missing/suppressed values or a zero/missing U.S. total. Hollow markers indicate unverified classification; lines also break across reviewed classification boundaries. Exact numerators, denominators and statuses are in Monthly country shares below.</p>
     {view.series.map(s=><p key={s.code}>{s.name} ({s.code}): unavailable {s.points.filter(p=>p.sharePercent===null).length} of {s.points.length} · classification unverified {s.points.filter(p=>!p.classificationVerified).length} of {s.points.length}</p>)}
     <p>These are country shares of U.S. trade for this product. Export shares do not measure a destination’s total worldwide demand.</p>
    </figcaption>
   </figure>{controls}
   <details className="share-history-data"><summary>Monthly country shares</summary>{view.series.map(s=><div key={s.code} className="table-scroll" tabIndex={0} role="region" aria-label={s.name+' monthly country shares'}><table><caption>{s.name} ({s.code}) · monthly country shares · {period}</caption><thead><tr>{['Month','Country value · current USD','U.S. total · current USD','Country share · %','Country status','U.S. total status','Classification'].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{s.points.map(p=><tr key={p.month}><th scope="row">{monthLabel(p.month)}</th><td>{usd(p.countryValueUsd)}</td><td>{usd(p.worldValueUsd)}</td><td>{countryShareLabel(p.sharePercent)}</td><td>{p.countryStatus}</td><td>{p.worldStatus}</td><td>{p.classificationVerified?'Verified':'Unverified'}</td></tr>)}</tbody></table></div>)}</details>
   <p className="chart-note">Source: {view.provenance.source==='fixture'?'Development sample data':'U.S. Census Bureau'} · {view.provenance.measure} · retrieved {view.provenance.retrievedAt} · processing version {view.provenance.codeVersion} · revised observations: {view.provenance.revised?'yes':'no'} · <a href="/methods/">Sources and methods</a></p>
  </>}
 </section>;
}
