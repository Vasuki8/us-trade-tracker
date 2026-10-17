import {useEffect,useMemo,useRef,useState} from 'react';
import type {Release,ExplorerSelection} from '../lib/trade/types';import {buildProfileView} from '../lib/trade/profile';
import {usd,percent,monthLabel} from '../lib/trade/format';
import {TradeChart} from './TradeChart';
import {TradeChartDownload} from './TradeChartDownload';import {TradeTable} from './TradeTable';
import {TradeChanges} from './TradeChanges';import {buildChangesView,buildMonthlyChangesView} from '../lib/trade/changes';
import {EstimatedDuties} from './EstimatedDuties';import {buildDutyView} from '../lib/trade/duties';
import {profileViewPath,readViewSelection} from '../lib/trade/view-link';
import {CountryPicker} from './CountryPicker';
import {SelectedCountryComparison} from './SelectedCountryComparison';
import {CountryShareHistory} from './CountryShareHistory';
import {CountryShareHistoryDownload} from './CountryShareHistoryDownload';
import {buildCountryShareHistory} from '../lib/trade/country-share-history';
export function ProductExplorer({release}:{release:Release}){
  const [selection,setSelection]=useState<ExplorerSelection>({direction:'imports',months:60,countryCodes:[]});
  const {direction,months,countryCodes,comparisonPeriod='annual'}=selection;
  const [viewLink,setViewLink]=useState(''),[linkNotice,setLinkNotice]=useState<string|null>(null);
  const [copied,setCopied]=useState(false),[showLink,setShowLink]=useState(false);
  const linkGeneration=useRef(0),lastSearch=useRef<string|null>(null);
  useEffect(()=>{
    const restore=()=>{
      const restored=readViewSelection(window.location.search,release);
      lastSearch.current=window.location.search;
      linkGeneration.current++;setSelection(restored.selection);setLinkNotice(restored.notice);setCopied(false);setShowLink(false);
      setViewLink(new URL(profileViewPath(release.productCode,restored.selection)+window.location.hash,window.location.origin).href);
    };
    const navigate=()=>{
      if(lastSearch.current!==window.location.search){restore();return;}
      linkGeneration.current++;setCopied(false);
      const current=readViewSelection(window.location.search,release);
      setViewLink(new URL(profileViewPath(release.productCode,current.selection)+window.location.hash,window.location.origin).href);
    };
    restore();window.addEventListener('popstate',navigate);window.addEventListener('hashchange',navigate);
    return ()=>{linkGeneration.current++;window.removeEventListener('popstate',navigate);window.removeEventListener('hashchange',navigate);};
  },[release]);
  const changeSelection=(next:ExplorerSelection)=>{
    const path=profileViewPath(release.productCode,next)+window.location.hash;
    window.history.replaceState(window.history.state,'',path);
    lastSearch.current=window.location.search;
    linkGeneration.current++;setSelection(next);setLinkNotice(null);setCopied(false);setViewLink(new URL(path,window.location.origin).href);
  };
  const copyViewLink=async()=>{
    const generation=linkGeneration.current;
    try{await navigator.clipboard.writeText(viewLink);if(generation===linkGeneration.current){setCopied(true);setShowLink(false);}}
    catch{if(generation===linkGeneration.current){setCopied(false);setShowLink(true);}}
  };
  const svg=useRef<SVGSVGElement>(null);const view=buildProfileView(release,selection);const shareHistory=buildCountryShareHistory(release,view);
  const changes=useMemo(()=>buildChangesView(release,direction),[release,direction]);
  const selectedComparison=useMemo(()=>comparisonPeriod==='monthly'?buildMonthlyChangesView(release,direction):changes,[release,direction,comparisonPeriod,changes]);
  const countries=[...view.partners].sort((a,b)=>a.name.localeCompare(b.name));
  return <>
    {release.source==='fixture'&&<div className="sample-banner"><strong>Development sample data</strong><span>These figures are synthetic and are for development checks.</span></div>}
    <div className="release-strip"><span>Reporting month <strong>{monthLabel(release.reportingMonth)}</strong></span><span>Retrieved {new Date(release.retrievedAt).toISOString().slice(0,10)}</span><a href="/methods/">Source &amp; methods ↗</a></div>

    <div className="explorer-controls"><fieldset><legend>Trade direction</legend>{(['imports','exports'] as const).map(value=><label key={value}><input type="radio" name="direction" disabled={!viewLink} checked={direction===value} onChange={()=>changeSelection({...selection,direction:value,countryCodes:[]})}/>{value==='imports'?'Imports':'Exports'}</label>)}</fieldset>
      <label className="window-label">History window<select aria-label="History window" disabled={!viewLink} value={months} onChange={e=>changeSelection({...selection,months:Number(e.target.value) as 12|60})}><option value="60">Up to 5 years</option><option value="12">Last 12 months</option></select></label>
    </div>
    <div className="view-link"><button className="secondary-button" disabled={!viewLink} onClick={copyViewLink}>Copy view link</button><p>Saved links use the latest accepted data.</p>
      {linkNotice&&<p role="status">{linkNotice}</p>}{copied&&<p role="status">View link copied.</p>}
      {showLink&&<div className="view-link-fallback"><p role="status">Select and copy the view link below. Automatic copying is unavailable.</p><label>View link<input readOnly value={viewLink} onFocus={event=>event.currentTarget.select()}/></label></div>}
    </div>
    <noscript><p className="chart-note">Enable JavaScript to restore saved selections, copy a view link, find and select countries, change trade direction or history window, and download chart PNGs or data CSVs. The initial view shows U.S. imports with up to five years of available history.</p></noscript>
    <div className="summary-grid" role="region" aria-label="U.S. trade totals"><div className="stat"><span>U.S. total · latest month · {direction}</span><strong>{usd(view.latestMonth.current,true)}</strong><small>{percent(view.latestMonth.changePercent)} year over year · {usd(view.latestMonth.changeUsd,true)} change</small></div>
      <div className="stat"><span>U.S. total · trailing twelve months</span><strong>{usd(view.trailingYear.current,true)}</strong><small>{percent(view.trailingYear.changePercent)} versus previous twelve months · {usd(view.trailingYear.changeUsd,true)} change</small></div>
      <div className="stat definition"><span>What this measures</span><strong>{direction==='imports'?'General imports':'Total exports'}</strong><small>{direction==='imports'?'Customs value of goods entering the U.S.':'U.S. goods exported to partner markets'} · current dollars, not seasonally adjusted</small></div>
    </div>
    <nav className="profile-navigation" aria-label="On this profile"><strong>On this profile</strong><ul>
      <li><a href="#trade-history-heading">Trade over time</a></li><li><a href="#compare-countries-heading">Compare countries</a></li><li><a href="#changes-heading">What changed?</a></li><li><a href="#country-share-history-heading">Country share over time</a></li>
      {direction==='imports'&&<li><a href="#duties-heading">Estimated duties</a></li>}
      <li><a href="#chart-data-heading">Chart data</a></li><li><a href="#leading-partners-heading">Leading partners</a></li><li><a href="#profile-sources-heading">Sources</a></li>
    </ul></nav>
    <section className="research-grid"><div className="chart-card"><div className="section-heading"><div><p className="eyebrow">THE TREND</p><h2 id="trade-history-heading">Trade over time</h2></div><span className="measure-tag">{view.provenance.measure}</span></div>
      <TradeChart ref={svg} view={view}/><p className="chart-note">Available history: {view.series[0]?.points[0]?.month}–{release.reportingMonth}. Gaps mean unavailable data; classification boundaries break the line. Open circles mark recorded revisions; revised unavailable values appear in Chart data.</p>
      {view.series.some(series=>series.points.some(point=>!point.classificationVerified))&&<p className="sample-banner">Classification continuity is unverified for part or all of this history. Growth comparisons across unverified periods are unavailable.</p>}
      <TradeChartDownload view={view} svgRef={svg} ready={Boolean(viewLink)}/>
    </div><aside className="comparison-card" aria-labelledby="compare-countries-heading"><p className="eyebrow">PARTNER MARKETS</p><h2 id="compare-countries-heading">Compare countries</h2><p>Select up to three countries; no selection shows the U.S. total.</p>
      <CountryPicker key={direction} countries={countries} selectedCodes={countryCodes} ready={Boolean(viewLink)} onChange={codes=>changeSelection({...selection,countryCodes:codes})}/>
    </aside></section>
    <CountryShareHistory view={shareHistory} download={<CountryShareHistoryDownload view={shareHistory}/>}/>
    <SelectedCountryComparison view={selectedComparison} countryCodes={countryCodes} onPeriodChange={period=>changeSelection({...selection,comparisonPeriod:period})}/>
    <TradeChanges view={changes} controlsReady={Boolean(viewLink)}/>
    {direction==='imports'&&<EstimatedDuties view={buildDutyView(release,countryCodes)} classificationIntervals={release.classificationIntervals} controlsReady={Boolean(viewLink)}/>}
    <section className="detail-grid"><div className="data-card"><p className="eyebrow">DISPLAYED DATA</p><h2 id="chart-data-heading">Chart data</h2><TradeTable view={view}/></div>
      <aside className="partners-card" aria-labelledby="leading-partners-heading"><p className="eyebrow">LATEST TWELVE MONTHS</p><h2 id="leading-partners-heading">Leading partners</h2><p>Share of U.S. {direction} for this product.</p><ol className="partner-ranks">{view.partners.slice(0,10).map(partner=><li key={partner.code}><a href={profileViewPath(release.productCode,{direction,months:12,countryCodes:[partner.code]})+'#trade-history-heading'}>{partner.name}</a><strong>{usd(partner.valueUsd,true)}</strong><small>{partner.sharePercent===null?'Share unavailable':`${partner.sharePercent.toFixed(1)}% share`}</small></li>)}</ol><p className="chart-note">Ranked by dollar value. Incomplete periods remain unavailable. Export flows describe U.S. sales, not a destination’s total demand.</p></aside>
    </section>
    <div className="provenance"><h2 id="profile-sources-heading">Sources</h2><p>{release.source==='fixture'?'Development fixtures':'U.S. Census Bureau'} · {view.provenance.measure} · current USD</p><details className="content-details"><summary>Release and source details</summary><p>Source: {release.source==='fixture'?'Development fixtures':'U.S. Census Bureau'} · {view.provenance.measure} · USD · retrieved {release.retrievedAt} · processing version {release.codeVersion} · Merchandise release revisions: {view.provenance.revised?'yes':'no'}</p><p>{release.sourceUrls.map(url=><a key={url} href={url} rel="noreferrer">{url}</a>)}</p></details></div>
  </>;
}
