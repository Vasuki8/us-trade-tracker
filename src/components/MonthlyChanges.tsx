import {useMemo} from 'react';
import type {Direction} from '../lib/trade/types';
import type {ChangesView} from '../lib/trade/changes';
import {monthLabel} from '../lib/trade/format';
import {TradeChanges} from './TradeChanges';
import {monthlyChangesPath} from '../lib/trade/view-link';
import {ChangesViewLink,useChangesViewLink} from './ChangesViewLink';
import {dutyChangesPath} from '../lib/trade/duty-changes-link';

export function MonthlyChanges({data,reportingMonth}:{data:string;reportingMonth:string}){
  // The static build sends calculated views, without merchandise or duty history.
  const views=useMemo(()=>JSON.parse(data) as Record<Direction,ChangesView>,[data]);
  const savedView=useChangesViewLink(monthlyChangesPath(views.imports.productCode),'share');
  const {direction,metric}=savedView.selection;
  const view=views[direction],provenance=view.provenance;
  return <>
    {provenance.source==='fixture'&&<div className="sample-banner"><strong>Development sample data</strong><span>These figures are synthetic and are for development checks.</span></div>}
    <div className="release-strip"><span>Reporting month <strong>{monthLabel(reportingMonth)}</strong></span><span>Retrieved {new Date(provenance.retrievedAt).toISOString().slice(0,10)}</span><a href="/methods/">Source &amp; methods ↗</a></div>
    <div className="explorer-controls"><fieldset><legend>Trade direction</legend>{(['imports','exports'] as const).map(value=><label key={value}><input type="radio" name="direction" checked={direction===value} onChange={()=>savedView.changeSelection({direction:value,metric})}/>{value==='imports'?'Imports':'Exports'}</label>)}</fieldset></div>
    <ChangesViewLink {...savedView}/>
    {direction==='imports'&&<p><a href={dutyChangesPath(view.productCode)}>Explore estimated-duty changes across countries</a></p>}
    <TradeChanges view={view} context="standalone" metric={metric} onMetricChange={value=>savedView.changeSelection({direction,metric:value})}/>
    <div className="provenance"><p>Source: {provenance.source==='fixture'?'Development fixtures':'U.S. Census Bureau'} · {provenance.measure} · USD · retrieved {provenance.retrievedAt} · processing version {provenance.codeVersion} · revised observations: {provenance.revised?'yes':'no'}</p><p>{provenance.sourceUrls.map(url=><a key={url} href={url} rel="noreferrer">{url}</a>)}</p></div>
  </>;
}
