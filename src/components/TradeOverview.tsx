import {useEffect,useState} from 'react';
import type {OverviewProduct} from '../lib/trade/overview';
import type {ChartSeries,Direction} from '../lib/trade/types';
import {monthLabel,percent,usd} from '../lib/trade/format';
import {profileViewPath,monthlyChangesPath,releaseBriefingPath} from '../lib/trade/view-link';

function History({points,small=false,mobile=false}:{points:ChartSeries['points'];small?:boolean;mobile?:boolean}){
  const width=small?110:mobile?320:720,height=small?30:270,left=small?1:mobile?56:68,right=width-12,top=small?2:20,bottom=small?28:233;
  const maximum=Math.max(1,...points.map(point=>point.valueUsd??0))*1.12;
  const x=(i:number)=>left+i/Math.max(1,points.length-1)*(right-left),y=(value:number)=>bottom-value/maximum*(bottom-top);
  let connected=false;
  const path=points.map((point,i)=>{if(point.valueUsd===null){connected=false;return '';}const command=connected&&!point.breakBefore?'L':'M';connected=true;return `${command}${x(i)},${y(point.valueUsd)}`;}).join(' ');
  const fontSize=mobile?13:16;
  return <svg className={small?'sparkline':mobile?'overview-chart overview-chart-mobile':'overview-chart overview-chart-desktop'} viewBox={`0 0 ${width} ${height}`} role={small?undefined:'img'} aria-label={small?undefined:'Monthly U.S. trade value history'} aria-hidden={small||undefined} fontFamily="Segoe UI, Arial, sans-serif">
    {!small&&[0,1,2,3,4].map(i=><g key={i}><line x1={left} x2={right} y1={y(maximum*i/4)} y2={y(maximum*i/4)} stroke="var(--grid)"/><text x={left-10} y={y(maximum*i/4)+4} textAnchor="end" fill="var(--muted)" fontSize={fontSize}>{usd(maximum*i/4,true)}</text></g>)}
    <path d={path} fill="none" stroke="var(--primary)" strokeWidth={small?2:2.5} strokeLinejoin="round"/>
    {!small&&points.map((point,i)=>point.valueUsd===null?null:<circle key={point.month} cx={x(i)} cy={y(point.valueUsd)} r={point.recordedRevision?4:2} fill={point.recordedRevision?'var(--panel)':'var(--primary)'} stroke="var(--primary)"><title>{`${monthLabel(point.month)}: ${usd(point.valueUsd)}${point.recordedRevision?' · Recorded revision':''}`}</title></circle>)}
    {!small&&points.length>0&&<><text x={left} y={height-9} fill="var(--muted)" fontSize={fontSize}>{monthLabel(points[0].month)}</text><text x={right} y={height-9} textAnchor="end" fill="var(--muted)" fontSize={fontSize}>{monthLabel(points.at(-1)!.month)}</text></>}
  </svg>;
}
const share=(value:number|null)=>value===null?'Unavailable':value>0&&value<0.1?'<0.1%':`${value.toFixed(1)}%`;
const deltaClass=(value:number|null)=>value===null?'':value<0?'negative':value>0?'positive':'';

export function TradeOverview({products}:{products:OverviewProduct[]}){
  const [code,setCode]=useState(products[0].code),[direction,setDirection]=useState<Direction>('imports'),[period,setPeriod]=useState<'monthly'|'annual'>('monthly'),[months,setMonths]=useState<12|60>(60),[ready,setReady]=useState(false);
  useEffect(()=>setReady(true),[]);
  const product=products.find(item=>item.code===code)!,{view,monthlyPartners,partnerCounts}=product[direction];
  const comparison=period==='monthly'?view.latestMonth:view.trailingYear,partners=period==='monthly'?monthlyPartners:view.partners;
  const availablePartners=partners.filter(row=>row.valueUsd!==null),leading=availablePartners[0],duty=product.duty[period];
  const points=view.series[0].points.slice(-months),profileHref=profileViewPath(code,{direction,months,countryCodes:[],comparisonPeriod:period==='monthly'?'monthly':'annual'});
  const periodLabel=period==='monthly'?'Latest month':'Trailing 12 months';
  return <div className="trade-overview">
    <div className="overview-controls">
      <label className="sr-only" htmlFor="overview-product">Overview product</label><select id="overview-product" value={code} disabled={!ready} onChange={event=>setCode(event.target.value)}>{products.map(item=><option key={item.code} value={item.code}>{item.name} · {item.code}</option>)}</select>
      <div className="segment" role="group" aria-label="Overview trade direction">{(['imports','exports'] as const).map(value=><button type="button" key={value} disabled={!ready} aria-pressed={direction===value} onClick={()=>setDirection(value)}>{value==='imports'?'Imports':'Exports'}</button>)}</div>
      <div className="segment" role="group" aria-label="Overview comparison period"><button type="button" disabled={!ready} aria-pressed={period==='monthly'} onClick={()=>setPeriod('monthly')}>Latest month</button><button type="button" disabled={!ready} aria-pressed={period==='annual'} onClick={()=>setPeriod('annual')}>Last 12 months</button></div>
      <span className="overview-context">{monthLabel(view.reportingMonth)} · USD</span>
    </div>
    <noscript><p className="chart-note">Initial view: latest-month imports. Open a product profile for all available data; enable JavaScript to change overview filters.</p></noscript>
    <div className="overview-kpis" role="region" aria-label="Overview figures">
      <div className="overview-kpi"><span>U.S. {direction} · {periodLabel.toLowerCase()}</span><strong>{usd(comparison.current,true)}</strong><small>{monthLabel(view.reportingMonth)}{period==='annual'?' · 12-month total':''}</small></div>
      <div className="overview-kpi"><span>{period==='monthly'?'Year-over-year change':'Change vs. previous 12 months'}</span><strong className={deltaClass(comparison.changePercent)}>{percent(comparison.changePercent)}</strong><small>{usd(comparison.changeUsd,true)} change · U.S. total</small></div>
      <div className="overview-kpi"><span>Leading partner share</span><strong>{share(leading?.sharePercent??null)}</strong><small>{leading?.name??'Unavailable'} · {periodLabel.toLowerCase()}</small></div>
      {direction==='imports'?<div className="overview-kpi"><span>Estimated duty share</span><strong>{share(duty?.dutySharePercent??null)}</strong><small>{duty?.coverage.qualified?'Qualified · RP70/79':duty?.coverage.status!=='verified'?'Coverage unverified':'Calculated / consumption value'}</small></div>:<div className="overview-kpi"><span>Partners with reported values</span><strong>{partnerCounts[period].reported}</strong><small>{periodLabel} · {partnerCounts[period].total} partners in history</small></div>}
    </div>
    <div className="overview-grid">
      <section className="dashboard-panel" aria-labelledby="overview-history-heading"><div className="panel-heading"><h2 id="overview-history-heading">Monthly trade history</h2><div className="segment" role="group" aria-label="Overview history window">{([12,60] as const).map(value=><button type="button" key={value} disabled={!ready} aria-pressed={months===value} onClick={()=>setMonths(value)}>{value===12?'1Y':'5Y'}</button>)}</div></div>
        <div className="chart-context"><i aria-hidden="true"></i>{product.name} · U.S. {direction}</div><History points={points}/><History points={points} mobile/>
        <div className="panel-foot"><span>Monthly current USD · {direction==='imports'?'General imports':'Total exports'} · Not seasonally adjusted</span><a href={profileHref+'#chart-data-heading'}>Exact values &amp; downloads →</a></div>
      </section>
      <section className="dashboard-panel" aria-label="Leading partner markets"><div className="panel-heading"><h2>Leading partner markets</h2><span>{periodLabel}</span></div><div className="partner-bars">{availablePartners.slice(0,5).map(partner=><div className="partner-bar" key={partner.code}><div><a href={profileViewPath(code,{direction,months:12,countryCodes:[partner.code],comparisonPeriod:period==='monthly'?'monthly':'annual'})+'#trade-history-heading'}>{partner.name}</a><strong>{usd(partner.valueUsd,true)}</strong></div><div className="bar-track"><span style={{width:`${Math.min(100,partner.sharePercent??0)}%`}}/></div><small>{partner.sharePercent===null?'Share unavailable':`${share(partner.sharePercent)} of U.S. ${direction}`}</small></div>)}{availablePartners.length===0&&<p>No complete partner values available.</p>}</div><div className="panel-foot">{partnerCounts[period].total-partnerCounts[period].reported} partners unavailable · <a href={profileHref+'#compare-countries-heading'}>Compare countries →</a></div></section>
    </div>
    <div className="overview-bottom-grid">
      <section className="dashboard-panel" aria-labelledby="product-monitor-heading"><div className="panel-heading"><h2 id="product-monitor-heading">Product monitor</h2><a href="/products/" aria-label="Find a product">Find a product →</a></div>
        <nav className="monitor-navigation" aria-label="Product profiles"><div className="table-scroll" tabIndex={0} role="region" aria-label="Product monitor values"><table><caption className="sr-only">Reviewed products · {periodLabel.toLowerCase()} · U.S. {direction}</caption><thead><tr><th scope="col">Product / HS code</th><th scope="col">{periodLabel}</th><th scope="col">Change %</th><th scope="col">12M trend</th></tr></thead><tbody>{products.map(item=>{const model=item[direction].view,metric=period==='monthly'?model.latestMonth:model.trailingYear;return <tr key={item.code}><th scope="row"><article aria-label={`${item.name} · HS ${item.code}`}><h3><a href={`/products/${item.code}/`}>{item.name} · HS {item.code}</a></h3><details className="content-details"><summary>Source &amp; research links</summary><p>{model.title}</p><p>Source: {model.provenance.source==='fixture'?'Development fixtures':'U.S. Census Bureau'}<br/>Reporting month: <time dateTime={model.reportingMonth}>{monthLabel(model.reportingMonth)}</time></p><div className="monitor-links"><a href={monthlyChangesPath(item.code)}>Country changes</a><a href={releaseBriefingPath(item.code)}>Release briefing</a></div></details></article></th><td>{usd(metric.current,true)}</td><td className={deltaClass(metric.changePercent)}>{percent(metric.changePercent)}</td><td><History points={model.series[0].points.slice(-12)} small/></td></tr>;})}</tbody></table></div></nav>
      </section>
      <aside className="dashboard-panel release-panel" aria-label="Release information"><div className="panel-heading"><h2>Release information</h2></div><dl><div><dt>Selected product</dt><dd>HS {code}</dd></div><div><dt>Reporting month</dt><dd>{monthLabel(view.reportingMonth)}</dd></div><div><dt>Retrieved</dt><dd>{view.provenance.retrievedAt.slice(0,10)}</dd></div><div><dt>Coverage</dt><dd>{products.length} reviewed products</dd></div></dl><p>{products.length} reviewed pilot {products.length===1?'profile':'profiles'}. Coverage is limited to the products listed below.</p><a href="/methods/">Sources &amp; definitions →</a></aside>
    </div>
    <p className="overview-notes">Gaps mean unavailable observations; classification boundaries break lines. Hollow points mark recorded revisions. {direction==='imports'&&<>Estimated duties use calculated duties divided by imports for consumption, not a statutory tariff rate. <a href={`/products/${code}/#duties-heading`}>Coverage and qualifications →</a></>}</p>
  </div>;
}
