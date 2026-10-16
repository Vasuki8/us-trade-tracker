import {DutyChartDownload} from './DutyChartDownload';
import type {Release} from '../lib/trade/types';
import {buildDutyHistoryChart} from '../lib/trade/duty-history';
import {DutyHistoryChart} from './DutyHistoryChart';
import type {DutyView,DutyPeriod,DutyComparison} from '../lib/trade/duty-types';
import {monthLabel,usd,percent} from '../lib/trade/format';
import {downloadBlob,serializeDutyCsv} from '../lib/trade/downloads';
import {dutyChangesPath} from '../lib/trade/duty-changes-link';
const share=(value:number|null)=>value===null?'Unavailable':value>0&&value<0.001?'<0.001%':`${value.toFixed(3)}%`;
function points(comparison:DutyComparison){
  const value=comparison.change.dutySharePercentagePoints;if(value===null)return 'Unavailable';
  // Allow arithmetic noise from subtracting the two computed shares at the display boundary.
  const tolerance=4*Number.EPSILON*Math.max(1,Math.abs(comparison.current.dutySharePercent??0),Math.abs(comparison.previous.dutySharePercent??0));
  return value!==0&&Math.abs(value)<0.001-tolerance?`${value>0?'Increase':'Decrease'} <0.001 pp`:`${value>0?'+':''}${value.toFixed(3)} pp`;
}
const period=(value:DutyPeriod)=>value.from===value.to?monthLabel(value.from):`${monthLabel(value.from)}–${monthLabel(value.to)}`;
function Coverage({value}:{value:DutyPeriod}){
  if(value.coverage.status==='unavailable')return <span>Coverage unavailable</span>;
  return <span>RP70/79: {usd(value.coverage.affectedDutiableValueUsd)} · {share(value.coverage.affectedSharePercent)} of dutiable value{value.coverage.qualified?' · Qualified reported figures':''}</span>;
}
function Change({value}:{value:DutyComparison}){
  return <p className="duty-change">Duty change <strong>{usd(value.change.calculatedDutyUsd)}</strong> · {value.change.growthPercent===null?'Growth unavailable':`${percent(value.change.growthPercent)} growth`} · Duty-share change <strong>{points(value)}</strong></p>;
}
export function EstimatedDuties({view,classificationIntervals}:{view:DutyView;classificationIntervals:Release['classificationIntervals']}){
  const monthlyRevisions=new Map(view.monthlyRecordedRevisions.map(row=>[`${row.partnerCode}/${row.month}`,new Set(row.inputs)]));
  return <section className="duties-card" aria-labelledby="duties-heading">
    <div className="section-heading"><div><p className="eyebrow">IMPORTS FOR CONSUMPTION</p><h2 id="duties-heading">Estimated duties</h2></div><span className="measure-tag">CAL_DUT_MO / CON_VAL_MO</span></div>
    {!view.available?<p>This retained release does not include a duty dataset. Estimated duties are unavailable.</p>:<>
      <p className="duty-definition">Calculated duties as share of import value uses imports for consumption (CON_VAL_MO). Monthly shares divide the same month’s calculated duties by its consumption value; rolling shares divide matching totals. Duty history: {monthLabel(view.fromMonth!)}–{monthLabel(view.reportingMonth)}. Country selections follow “Compare countries”; the chart history control does not shorten duty history.</p>
      <p><a href={dutyChangesPath(view.productCode)}>Explore estimated-duty changes across countries</a></p>
      {(['dollars','share'] as const).map(metric=>{const model=buildDutyHistoryChart(view,classificationIntervals,metric);return <DutyHistoryChart key={metric} model={model} download={<DutyChartDownload model={model}/>}/>;})}
      {view.series.map(series=><article className="duty-series" key={series.code}>
        <h3>{series.name}</h3>
        <h4>Latest month · {period(series.latest.current)}</h4>
        <div className="duty-latest"><span>Calculated duties <strong>{usd(series.latest.current.calculatedDutyUsd)}</strong></span><span>Consumption value <strong>{usd(series.latest.current.consumptionValueUsd)}</strong></span><span>Duty share <strong>{share(series.latest.current.dutySharePercent)}</strong></span></div>
        <p className="duty-coverage"><Coverage value={series.latest.current}/></p>
        <p className="chart-note">Compared with {period(series.latest.previous)}: calculated duties {usd(series.latest.previous.calculatedDutyUsd)}, consumption value {usd(series.latest.previous.consumptionValueUsd)}, duty share {share(series.latest.previous.dutySharePercent)}. <Coverage value={series.latest.previous}/></p>
        <Change value={series.latest}/>
        <h4>Rolling twelve months</h4>
        <div className="table-scroll" role="region" aria-label={`Scrollable rolling estimated duties · ${series.name}`} tabIndex={0}><table aria-label={`Rolling estimated duties · ${series.name}`}><thead><tr><th scope="col">Period</th><th scope="col">Calculated duties (USD)</th><th scope="col">Consumption value (USD)</th><th scope="col">Duty share</th><th scope="col">Dutiable value (USD)</th><th scope="col">Reporting coverage</th></tr></thead><tbody>{[series.rolling.current,series.rolling.previous].map(value=><tr key={value.from}><th scope="row">{period(value)}</th><td>{usd(value.calculatedDutyUsd)}</td><td>{usd(value.consumptionValueUsd)}</td><td>{share(value.dutySharePercent)}</td><td>{usd(value.dutiableValueUsd)}</td><td className="duty-coverage"><Coverage value={value}/></td></tr>)}</tbody></table></div>
        <Change value={series.rolling}/>
        {(!series.latest.change.comparable||!series.rolling.change.comparable)&&<p className="duty-unavailable">Some comparisons are unavailable because of missing or suppressed figures, unverified reporting coverage, or incompatible classification periods. Available reported dollars remain visible.</p>}
        <h4>Monthly figures</h4>
        <div className="table-scroll" role="region" aria-label={`Scrollable monthly estimated duties · ${series.name}`} tabIndex={0}><table aria-label={`Monthly estimated duties · ${series.name}`}><thead><tr><th scope="col">Month</th><th scope="col">Calculated duties (USD)</th><th scope="col">Consumption value (USD)</th><th scope="col">Duty share</th><th scope="col">Dutiable value (USD)</th><th scope="col">Reporting coverage</th></tr></thead><tbody>{series.monthly.map(value=>{const inputs=monthlyRevisions.get(`${series.code}/${value.from}`);return <tr key={value.from}><th scope="row">{monthLabel(value.from)}</th><td>{usd(value.calculatedDutyUsd)}{inputs?.has('CAL_DUT_MO')&&<> <span>Revised</span></>}</td><td>{usd(value.consumptionValueUsd)}{inputs?.has('CON_VAL_MO')&&<> <span>Revised</span></>}</td><td>{share(value.dutySharePercent)}{(inputs?.has('CAL_DUT_MO')||inputs?.has('CON_VAL_MO'))&&<> <span>Revised input</span></>}</td><td>{usd(value.dutiableValueUsd)}{inputs?.has('DUT_VAL_MO')&&<> <span>Revised</span></>}</td><td className="duty-coverage"><Coverage value={value}/>{(inputs?.has('coverage')||inputs?.has('DUT_VAL_MO'))&&<> <span>Revised input</span></>}</td></tr>;})}</tbody></table></div>
      </article>)}
      <div className="download-actions"><button className="secondary-button" onClick={()=>downloadBlob(new Blob([serializeDutyCsv(view)],{type:'text/csv;charset=utf-8'}),`hs-${view.productCode}-imports-estimated-duties.csv`)}>Download estimated duties CSV</button></div>
      <p className="chart-note">Revised marks a recorded change to that monthly input against the prior retained release. Revised input marks monthly shares or reporting coverage that depend on a revised input. Revised inputs can leave the displayed result unchanged; attribution here applies only to monthly figures.</p>
      <p className="chart-note">No mark does not mean a figure was never revised or is final. These marks do not supply old values, revision dates or causes.</p>
      <p className="chart-note">Calculated duties can differ from amounts actually paid and exclude antidumping and countervailing duties. RP70/79 report dutiable value without calculating duties; reported zero duties are not proof of duty-free trade. Duty-share changes can reflect import mix and reporting coverage as well as tariff changes. Zero or missing consumption value has no duty share; zero prior duties have no percentage growth. Amounts are current USD, not seasonally adjusted. CSV values retain full precision.</p>
      <p className="duty-source">Source: {view.provenance.source==='fixture'?'Development sample data':'U.S. Census Bureau'} · retrieved {view.provenance.retrievedAt} · processing version {view.provenance.codeVersion} · Estimated-duty release revisions: {view.provenance.revised?'yes':'no'}. {view.provenance.sourceUrls.map(url=><a key={url} href={url}>{url}</a>)}</p>
      <noscript><p className="chart-note">Enable JavaScript to select countries, change trade direction or download the estimated duties CSV.</p></noscript>
    </>}
  </section>;
}
