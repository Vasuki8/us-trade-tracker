import {useEffect,useRef,useState} from 'react';
import type {DutyComparison,DutyPeriod} from '../lib/trade/duty-types';
import {selectDutyChanges,type PreparedDutyChanges,type DutyChangesSelection,type DutyChangeCountry} from '../lib/trade/duty-changes';
import {dutyChangesPath,readDutyChangesSelection} from '../lib/trade/duty-changes-link';
import {profileViewPath} from '../lib/trade/view-link';
import {monthLabel,usd,usdChange,percent} from '../lib/trade/format';
import {downloadBlob,serializeDutyChangesCsv} from '../lib/trade/downloads';

const share=(value:number|null)=>value===null?'Unavailable':value>0&&value<0.001?'<0.001%':`${value.toFixed(3)}%`;
const points=(value:number|null)=>value===null?'Unavailable':value!==0&&Math.abs(value)<0.001?`${value>0?'Increase':'Decrease'} <0.001 pp`:`${value>0?'+':''}${value.toFixed(3)} pp`;
const periodLabel=(period:{from:string;to:string})=>period.from===period.to?monthLabel(period.from):`${monthLabel(period.from)}–${monthLabel(period.to)}`;
function Coverage({value}:{value:DutyPeriod}){
  return <span>{value.coverage.status==='verified'?<>RP70/79 affected: {usd(value.coverage.affectedDutiableValueUsd)} · {share(value.coverage.affectedSharePercent)} of {usd(value.dutiableValueUsd)} dutiable value{value.coverage.qualified?' · Qualified reported figures':''}</>:'Reporting coverage unavailable'}</span>;
}
function PeriodFigures({value}:{value:DutyPeriod}){
  return <><strong>{usd(value.calculatedDutyUsd)}</strong> estimated duties<br/>{usd(value.consumptionValueUsd)} consumption value<br/>{share(value.dutySharePercent)} duty share</>;
}
function Changes({value}:{value:DutyComparison}){
  return <>{usdChange(value.change.calculatedDutyUsd)}<br/>{value.change.growthPercent===null?'Growth unavailable':`${percent(value.change.growthPercent)} growth`}<br/>{points(value.change.dutySharePercentagePoints)}</>;
}
function RankingTable({rows,movement,productCode,selection}:{rows:DutyChangeCountry[];movement:'increases'|'decreases';productCode:string;selection:DutyChangesSelection}){
  const title=`Largest estimated-duty ${movement}`;
  return <section aria-labelledby={`duty-${movement}`}><h2 id={`duty-${movement}`}>{title}</h2>{!rows.length?<p>No comparable {movement} for this selection.</p>:<div className="table-scroll" role="region" aria-label={`Scrollable ${title.toLowerCase()}`} tabIndex={0}><table aria-label={title}>
    <thead><tr><th scope="col">Rank / country</th><th scope="col">Current period</th><th scope="col">Prior period</th><th scope="col">Changes</th><th scope="col">Reporting coverage</th></tr></thead>
    <tbody>{rows.map((country,index)=><tr key={country.code}><th scope="row">{index+1}. <a href={profileViewPath(productCode,{direction:'imports',months:12,countryCodes:country.profileCountryAvailable?[country.code]:[],...(selection.period==='monthly'?{comparisonPeriod:'monthly' as const}:{})})+'#duties-heading'}>{country.name} · {country.code}</a>{!country.profileCountryAvailable&&<p className="chart-note">Country merchandise history is unavailable. This link opens the unfiltered product profile.</p>}</th>
      <td><PeriodFigures value={country.comparison.current}/></td><td><PeriodFigures value={country.comparison.previous}/></td><td><Changes value={country.comparison}/></td>
      <td className="duty-coverage">Current: <Coverage value={country.comparison.current}/><br/>Prior: <Coverage value={country.comparison.previous}/></td></tr>)}</tbody>
  </table></div>}</section>;
}
export function DutyChanges({data}:{data:PreparedDutyChanges}){
  const [selection,setSelection]=useState<DutyChangesSelection>({period:'rolling',metric:'share'});
  const [ready,setReady]=useState(false),[link,setLink]=useState(''),[notice,setNotice]=useState<string|null>(null);
  const [copied,setCopied]=useState(false),[showLink,setShowLink]=useState(false),generation=useRef(0);
  const path=(value:DutyChangesSelection)=>dutyChangesPath(data.productCode,value,window.location.hash);
  useEffect(()=>{
    const restore=()=>{const saved=readDutyChangesSelection(window.location.search);generation.current++;setSelection(saved.selection);setNotice(saved.notice);setCopied(false);setShowLink(false);setLink(new URL(path(saved.selection),window.location.origin).href);setReady(true);};
    restore();window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
    return ()=>{generation.current++;window.removeEventListener('popstate',restore);window.removeEventListener('hashchange',restore);};
  },[data.productCode]);
  const change=(next:DutyChangesSelection)=>{const href=path(next);window.history.pushState(window.history.state,'',href);generation.current++;setSelection(next);setNotice(null);setCopied(false);setShowLink(false);setLink(new URL(href,window.location.origin).href);};
  const copy=async()=>{const current=++generation.current;try{await navigator.clipboard.writeText(link);if(current===generation.current){setCopied(true);setShowLink(false);}}catch{if(current===generation.current){setCopied(false);setShowLink(true);}}};
  const view=selectDutyChanges(data,selection),rank=view.ranking;
  return <section className="duty-changes" aria-labelledby="duties-changes-heading">
    {view.provenance.source==='fixture'&&<div className="sample-banner"><strong>Development sample data</strong><span>These figures are synthetic and are for development checks.</span></div>}
    <h2 id="duties-changes-heading">U.S. imports only</h2>
    <div className="release-strip"><span>Reporting month <strong>{monthLabel(view.reportingMonth)}</strong></span><span>Retrieved {view.provenance.retrievedAt.slice(0,10)}</span><span>Source <strong>{view.provenance.source==='fixture'?'Development sample data':'U.S. Census Bureau'}</strong></span><a href="/methods/">Source &amp; methods ↗</a></div>
    <div className="explorer-controls duty-changes-controls"><fieldset><legend>Comparison period</legend>{(['rolling','monthly'] as const).map(value=><label key={value}><input type="radio" name="duty-period" disabled={!ready} checked={selection.period===value} onChange={()=>change({...selection,period:value})}/>{value==='rolling'?'Rolling twelve months':'Latest month versus the same month last year'}</label>)}</fieldset>
      <fieldset><legend>Rank estimated-duty changes by</legend>{(['share','dollars'] as const).map(value=><label key={value}><input type="radio" name="duty-metric" disabled={!ready} checked={selection.metric===value} onChange={()=>change({...selection,metric:value})}/>{value==='share'?'Share change in percentage points':'Dollar change'}</label>)}</fieldset></div>
    <div className="view-link"><button className="secondary-button" disabled={!ready} onClick={copy}>Copy duty changes link</button><p>Links reopen this product, period and ranking using the latest accepted dataset.</p>{notice&&<p role="status">{notice}</p>}{copied&&<p role="status">Duty changes link copied.</p>}{showLink&&<div className="view-link-fallback"><p role="status">Select and copy the link below. Automatic copying is unavailable.</p><label>Duty changes link<input readOnly value={link} onFocus={event=>event.currentTarget.select()}/></label></div>}</div>
    <div className="download-actions"><button className="secondary-button" disabled={!ready||!view.available} onClick={()=>downloadBlob(new Blob([serializeDutyChangesCsv(view)],{type:'text/csv;charset=utf-8'}),`hs-${view.productCode}-imports-estimated-duty-changes-${selection.period}-${selection.metric}.csv`)}>Download duty changes CSV</button></div>
    <noscript><p className="chart-note">Enable JavaScript to change periods or rankings, restore saved filters, copy links and generate CSV. The initial view shows imports, rolling twelve months, ranked by share change.</p></noscript>
    <p className="duty-period-labels"><strong>Current: {periodLabel(view.periods.current)}</strong> · Prior: {periodLabel(view.periods.previous)}</p>
    <p>Duty share = calculated duties ÷ imports for consumption × 100. Amounts are current USD, not seasonally adjusted.</p><details className="content-details"><summary>Duty-share calculation</summary>    <p>Duty share = 100 × CAL_DUT_MO ÷ CON_VAL_MO for the same country, product and period. Rolling shares divide matching sums. Amounts are current USD, not seasonally adjusted.</p></details>
    {!view.available?<p>This retained release does not include a duty dataset. Estimated-duty comparisons are unavailable.</p>:<>
      <section className="duties-card" role="region" aria-labelledby="duty-world-heading"><h2 id="duty-world-heading">Official world estimated duties</h2><p>This is the official all-partner comparison, independent of the displayed country subset.</p>
        {view.world&&<><div className="table-scroll" role="region" aria-label="Scrollable official world estimated duties" tabIndex={0}><table aria-label="Official world duty figures"><thead><tr><th scope="col">Period</th><th scope="col">Amounts and share</th><th scope="col">Reporting coverage</th></tr></thead><tbody>{(['current','previous'] as const).map(side=><tr key={side}><th scope="row">{side==='current'?'Current':'Prior'} · {periodLabel(view.world![side])}</th><td><PeriodFigures value={view.world![side]}/></td><td><Coverage value={view.world![side]}/></td></tr>)}</tbody></table></div><p className="duty-change"><Changes value={view.world}/></p></>}
        {!view.world?.change.comparable&&<p>World comparison unavailable. Valid country comparisons remain available independently.</p>}</section>
      <p className="duty-ranking-counts">{rank.comparableCount} comparable of {rank.totalCountryCount} observed countries · {rank.unavailableCount} unavailable · {rank.unchangedCount} unchanged · {rank.qualifiedCount} qualified. Showing up to ten increases and ten decreases.</p>
      <details className="content-details"><summary>Why comparisons are unavailable</summary><p className="chart-note">Unavailable by first applicable reason: {rank.exclusions.classification_unverified} classification, {rank.exclusions.incomplete_period} incomplete amounts, {rank.exclusions.coverage_unavailable} reporting coverage, {rank.exclusions.denominator_unavailable} consumption denominator.</p></details>
      <RankingTable rows={rank.increases} movement="increases" productCode={view.productCode} selection={selection}/><RankingTable rows={rank.decreases} movement="decreases" productCode={view.productCode} selection={selection}/>
    </>}
    <section className="provenance" aria-labelledby="duty-sources"><h2 id="duty-sources">Sources and qualifications</h2><p className="duty-warning">Estimated duties may differ from amounts paid and exclude antidumping and countervailing duties. Reported zero does not establish duty-free treatment. Import mix and reporting coverage can change duty shares; these figures do not calculate shipment liability.</p><details className="content-details"><summary>Full qualifications and source details</summary><p>These are estimated duties, which may differ from amounts paid and exclude antidumping and countervailing duties. RP70/79 carry dutiable value without calculated duties; affected values qualify reported comparisons. Reported zero does not establish duty-free treatment. Import mix and reporting coverage can change duty shares. These figures do not calculate shipment liability.</p><p>A zero or missing consumption denominator has no duty share; zero prior duties have no percentage growth. Missing or suppressed figures, unverified coverage and incompatible classification periods withhold comparisons. Qualified complete figures remain included.</p>
      <p>Source: {view.provenance.source==='fixture'?'Development sample data':'U.S. Census Bureau'} · retrieved {view.provenance.retrievedAt} · processing version {view.provenance.codeVersion} · duty revisions: {view.provenance.revised?'yes':'no'}. <a href="/methods/">Definitions and methods</a></p><p>{view.provenance.sourceUrls.map(url=><a key={url} href={url} rel="noreferrer">{url}</a>)}</p></details></section>
  </section>;
}
