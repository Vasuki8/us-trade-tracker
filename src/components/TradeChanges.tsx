import {useState} from 'react';
import {rankChanges,type ChangeMetric,type ChangesView,type CountryChange} from '../lib/trade/changes';
import {downloadBlob,serializeChangesCsv} from '../lib/trade/downloads';
import {monthLabel,percent,usd,countryShare as share,percentagePoints as points,usdChange as dollars} from '../lib/trade/format';
import {profileViewPath} from '../lib/trade/view-link';

function ChangesTable({countries,movement,metric,view}:{countries:CountryChange[];movement:'increases'|'decreases';metric:ChangeMetric;view:ChangesView}) {
  const title=`Largest ${movement} · ${metric==='dollars'?'dollar change':'country share change'}`;
  return <div className="changes-group">
    <h3>{title}</h3>
    <div className="table-scroll" role="region" aria-label={`Scrollable ${title.toLowerCase()}`} tabIndex={0}>
      <table aria-label={title}><thead><tr><th scope="col">Country</th><th scope="col">{metric==='dollars'?'Dollar change':'Share change (pp)'}</th><th scope="col">Current USD</th><th scope="col">Previous USD</th>{metric==='share'&&<th scope="col">Dollar change</th>}<th scope="col">Growth</th><th scope="col">Current share</th><th scope="col">Previous share</th>{metric==='dollars'&&<th scope="col">Share change (pp)</th>}</tr></thead>
        <tbody>{countries.map(country=><tr key={country.code}>
          <th scope="row"><a href={profileViewPath(view.productCode,{direction:view.direction,months:12,countryCodes:[country.code],...(view.periodType==='monthly'?{comparisonPeriod:'monthly' as const}:{})})+(view.periodType==='monthly'?'#selected-comparison-heading':'')}>{country.name}</a> <small>{country.code}</small></th>
          <td className="ranked-value">{metric==='dollars'?dollars(country.changeUsd):points(country.shareChangePoints)}</td>
          <td>{usd(country.currentUsd)}</td><td>{usd(country.previousUsd)}</td>
          {metric==='share'&&<td>{dollars(country.changeUsd)}</td>}<td>{percent(country.changePercent)}</td>
          <td>{share(country.currentSharePercent)}</td><td>{share(country.previousSharePercent)}</td>{metric==='dollars'&&<td>{points(country.shareChangePoints)}</td>}
        </tr>)}</tbody>
      </table>
    </div>
    {countries.length===0&&<p className="changes-empty">No eligible countries with {movement==='increases'?'an increase':'a decrease'} in this comparison.</p>}
  </div>;
}

export function TradeChanges({view,context='profile',metric:controlledMetric,onMetricChange,controlsReady=true}:{view:ChangesView;context?:'profile'|'standalone';metric?:ChangeMetric;onMetricChange?:(metric:ChangeMetric)=>void;controlsReady?:boolean}) {
  const [localMetric,setLocalMetric]=useState<ChangeMetric>('dollars');
  const metric=controlledMetric??localMetric,setMetric=onMetricChange??setLocalMetric;
  const ranking=rankChanges(view,metric);
  const period=(value:{from:string;to:string})=>value.from===value.to?monthLabel(value.from):`${monthLabel(value.from)}–${monthLabel(value.to)}`;
  return <section className="changes-card" aria-labelledby="changes-heading">
    <div className="section-heading"><div><p className="eyebrow">COUNTRY COMPARISONS</p><h2 id="changes-heading">What changed?</h2></div><span className="measure-tag">{view.provenance.measure}</span></div>
    <p className="changes-period"><strong>{period(view.periods.current)}</strong> compared with <strong>{period(view.periods.previous)}</strong> · U.S. {view.direction}</p>
    <p className="changes-description">Up to ten increases and ten decreases, ranked by dollar change or country-share change. Share of U.S. {view.direction} for this product uses the official world total for each period.{context==='profile'&&' These comparisons stay independent of chart selections and the history window.'}</p>
    <div className="changes-world"><span>U.S. total · current <strong>{usd(view.world.current)}</strong></span><span>previous <strong>{usd(view.world.previous)}</strong></span><span>change <strong>{dollars(view.world.changeUsd)}</strong> · {percent(view.world.changePercent)}</span></div>
    <div className="changes-controls"><label>Rank changes by<select disabled={!controlsReady} value={metric} onChange={event=>setMetric(event.target.value as ChangeMetric)}><option value="dollars">Dollar change</option><option value="share">Country share change</option></select></label>
      <button className="secondary-button" disabled={!controlsReady||ranking.increases.length+ranking.decreases.length===0} onClick={()=>downloadBlob(new Blob([serializeChangesCsv(view,metric,view.periodType==='monthly'?{includeComparisonPeriod:true}:undefined)],{type:'text/csv;charset=utf-8'}),`hs-${view.productCode}-${view.direction}-changes-${view.periodType==='monthly'?'monthly-':''}${metric}.csv`)}>Download changes CSV</button>
    </div>
    <p className="changes-status" role="status">{ranking.unavailableCount} {ranking.unavailableCount===1?'country':'countries'} excluded because this comparison is unavailable. {ranking.unchangedCount} {ranking.unchangedCount===1?'country has':'countries have'} no change in the selected measure.</p>
    {!view.classificationComparable&&<p className="sample-banner">Classification continuity is not verified across both periods. Changes are unavailable.</p>}
    <ChangesTable countries={ranking.increases} movement="increases" metric={metric} view={view}/>
    <ChangesTable countries={ranking.decreases} movement="decreases" metric={metric} view={view}/>
    <p className="chart-note">Values are current USD, not seasonally adjusted. Share change is measured in percentage points (pp). Incomplete periods stay unavailable; a zero prior value has no growth percentage. The CSV contains the displayed rankings, both periods and source details.</p>
    <noscript><p className="chart-note">Enable JavaScript to change the ranking, trade direction or download a CSV.</p></noscript>
  </section>;
}
