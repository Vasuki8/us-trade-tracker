import {useMemo} from 'react';
import type {CountryChangesViews} from '../lib/trade/changes';
import {monthLabel} from '../lib/trade/format';
import {TradeChanges} from './TradeChanges';
import {monthlyChangesPath} from '../lib/trade/view-link';
import {ChangesViewLink,useChangesViewLink} from './ChangesViewLink';
import {dutyChangesPath} from '../lib/trade/duty-changes-link';

export function MonthlyChanges({data,reportingMonth}:{data:string;reportingMonth:string}){
  // The static build sends calculated views, without merchandise or duty history.
  const views=useMemo(()=>JSON.parse(data) as CountryChangesViews,[data]);
  const savedView=useChangesViewLink(monthlyChangesPath(views.rolling.imports.productCode),'share',{allowPeriod:true});
  const {direction,metric}=savedView.selection,period=savedView.selection.period??'rolling';
  const view=views[period][direction],provenance=view.provenance,ready=Boolean(savedView.link);
  return <>
    {provenance.source==='fixture'&&<div className="sample-banner"><strong>Development sample data</strong><span>These figures are synthetic and are for development checks.</span></div>}
    <div className="release-strip"><span>Reporting month <strong>{monthLabel(reportingMonth)}</strong></span><span>Retrieved {new Date(provenance.retrievedAt).toISOString().slice(0,10)}</span><a href="/methods/">Source &amp; methods ↗</a></div>
    <div className="explorer-controls">
      <fieldset><legend>Trade direction</legend>{(['imports','exports'] as const).map(value=><label key={value}><input type="radio" name="direction" disabled={!ready} checked={direction===value} onChange={()=>savedView.changeSelection({direction:value,metric,period})}/>{value==='imports'?'Imports':'Exports'}</label>)}</fieldset>
      <fieldset><legend>Comparison period</legend>{(['rolling','monthly'] as const).map(value=><label key={value}><input type="radio" name="comparison-period" disabled={!ready} checked={period===value} onChange={()=>savedView.changeSelection({direction,metric,period:value})}/>{value==='rolling'?'Rolling twelve months':'Latest month versus the same month last year'}</label>)}</fieldset>
    </div>
    <ChangesViewLink {...savedView} includePeriod/>
    {direction==='imports'&&<p><a href={dutyChangesPath(view.productCode,period==='monthly'?{period:'monthly',metric:'share'}:undefined)}>Explore estimated-duty changes across countries</a></p>}
    <TradeChanges view={view} context="standalone" metric={metric} controlsReady={ready} onMetricChange={value=>savedView.changeSelection({direction,metric:value,period})}/>
    <p className="chart-note"><span>{provenance.source==='fixture'?'Development fixtures':'U.S. Census Bureau'}</span> · {provenance.measure} · current USD, not seasonally adjusted.</p>
    <details className="provenance content-details"><summary>Release and source details</summary><p>Source: {provenance.source==='fixture'?'Development fixtures':'U.S. Census Bureau'} · {provenance.measure} · USD · retrieved {provenance.retrievedAt} · processing version {provenance.codeVersion} · revised observations: {provenance.revised?'yes':'no'}</p><p>{provenance.sourceUrls.map(url=><a key={url} href={url} rel="noreferrer">{url}</a>)}</p></details>
  </>;
}
