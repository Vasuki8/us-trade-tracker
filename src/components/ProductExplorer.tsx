import {useRef,useState} from 'react';
import type {Release,Direction} from '../lib/trade/types';import {buildProfileView} from '../lib/trade/profile';
import {usd,percent,monthLabel} from '../lib/trade/format';import {serializeCsv,downloadBlob,exportChartPng} from '../lib/trade/downloads';
import {TradeChart} from './TradeChart';import {TradeTable} from './TradeTable';
export function ProductExplorer({release}:{release:Release}){
  const [direction,setDirection]=useState<Direction>('imports');const [months,setMonths]=useState<12|60>(60);
  const [countryCodes,setCountryCodes]=useState<string[]>([]);const [downloadError,setDownloadError]=useState('');const [busy,setBusy]=useState(false);
  const svg=useRef<SVGSVGElement>(null);const view=buildProfileView(release,{direction,months,countryCodes});
  const countries=[...view.partners].sort((a,b)=>a.name.localeCompare(b.name));
  const downloadPng=async()=>{setDownloadError('');setBusy(true);try{if(!svg.current)throw new Error('Chart unavailable');downloadBlob(await exportChartPng(svg.current),`hs-${release.productCode}-${direction}.png`);}catch{setDownloadError('PNG export failed. You can still download the displayed data as CSV.');}finally{setBusy(false);}};
  return <>
    {release.source==='fixture'&&<div className="sample-banner"><strong>Development sample data</strong><span>These figures are synthetic. Live Census validation is pending.</span></div>}
    <div className="release-strip"><span>Reporting month <strong>{monthLabel(release.reportingMonth)}</strong></span><span>Retrieved {new Date(release.retrievedAt).toISOString().slice(0,10)}</span><a href="/methods/">Source &amp; methods ↗</a></div>
    <div className="explorer-controls"><fieldset><legend>Trade direction</legend>{(['imports','exports'] as const).map(value=><label key={value}><input type="radio" name="direction" checked={direction===value} onChange={()=>{setDirection(value);setCountryCodes([]);setDownloadError('');}}/>{value==='imports'?'Imports':'Exports'}</label>)}</fieldset>
      <label className="window-label">History window<select aria-label="History window" value={months} onChange={e=>setMonths(Number(e.target.value) as 12|60)}><option value="60">Up to 5 years</option><option value="12">Last 12 months</option></select></label>
    </div>
    <div className="summary-grid"><div className="stat"><span>Latest month · {direction}</span><strong>{usd(view.latestMonth.current,true)}</strong><small>{percent(view.latestMonth.changePercent)} year over year · {usd(view.latestMonth.changeUsd,true)} change</small></div>
      <div className="stat"><span>Trailing twelve months</span><strong>{usd(view.trailingYear.current,true)}</strong><small>{percent(view.trailingYear.changePercent)} versus previous twelve months · {usd(view.trailingYear.changeUsd,true)} change</small></div>
      <div className="stat definition"><span>What this measures</span><strong>{direction==='imports'?'General imports':'Total exports'}</strong><small>{direction==='imports'?'Customs value of goods entering the U.S.':'U.S. goods exported to partner markets'} · current dollars, not seasonally adjusted</small></div>
    </div>
    <section className="research-grid"><div className="chart-card"><div className="section-heading"><div><p className="eyebrow">THE TREND</p><h2>Trade over time</h2></div><span className="measure-tag">{view.provenance.measure}</span></div>
      <TradeChart ref={svg} view={view}/><p className="chart-note">Available history: {view.series[0]?.points[0]?.month}–{release.reportingMonth}. Gaps mean unavailable data; classification boundaries break the line.</p>
      {view.series.some(series=>series.points.some(point=>!point.classificationVerified))&&<p className="sample-banner">Classification continuity is unverified for part or all of this history. Growth comparisons across unverified periods are unavailable.</p>}
      <div className="download-actions"><button className="primary-button" disabled={busy} onClick={downloadPng}>{busy?'Creating image…':'Download chart PNG'}</button><button className="secondary-button" onClick={()=>downloadBlob(new Blob([serializeCsv(view)],{type:'text/csv;charset=utf-8'}),`hs-${release.productCode}-${direction}.csv`)}>Download data CSV</button></div>
      {downloadError&&<p role="alert" className="download-error">{downloadError}</p>}
    </div><aside className="comparison-card"><p className="eyebrow">PARTNER MARKETS</p><h2>Compare countries</h2><p>Choose up to three partners. With none selected, the chart shows the U.S. total.</p>
      <fieldset className="country-list"><legend className="sr-only">Partner countries</legend>{countries.map(country=><label key={country.code}><input type="checkbox" checked={countryCodes.includes(country.code)} disabled={countryCodes.length===3&&!countryCodes.includes(country.code)} onChange={e=>setCountryCodes(e.target.checked?[...countryCodes,country.code]:countryCodes.filter(c=>c!==country.code))}/><span>{country.name}</span></label>)}</fieldset>
      <p className="selection-count" role="status">{countryCodes.length} of 3 selected</p>{countryCodes.length>0&&<button className="text-button" onClick={()=>setCountryCodes([])}>Show U.S. total</button>}
    </aside></section>
    <section className="detail-grid"><div className="data-card"><p className="eyebrow">DISPLAYED DATA</p><h2>The numbers behind the chart</h2><TradeTable view={view}/></div>
      <aside className="partners-card"><p className="eyebrow">LATEST TWELVE MONTHS</p><h2>Leading partners</h2><p>Share of U.S. {direction} for this product.</p><ol className="partner-ranks">{view.partners.slice(0,10).map(partner=><li key={partner.code}><span>{partner.name}</span><strong>{usd(partner.valueUsd,true)}</strong><small>{partner.sharePercent===null?'Share unavailable':`${partner.sharePercent.toFixed(1)}% share`}</small></li>)}</ol><p className="chart-note">Ranked by dollar value. Incomplete periods remain unavailable. Export flows describe U.S. sales, not a destination’s total demand.</p></aside>
    </section>
    <div className="provenance"><p>Source: {release.source==='fixture'?'Development fixtures':'U.S. Census Bureau'} · {view.provenance.measure} · USD · retrieved {release.retrievedAt} · processing version {release.codeVersion} · revised observations: {view.provenance.revised?'yes':'no'}</p><p>{release.sourceUrls.map(url=><a key={url} href={url} rel="noreferrer">{url}</a>)}</p></div>
  </>;
}
