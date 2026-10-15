import {useMemo} from 'react';
import type {Direction} from '../lib/trade/types';
import {rankProductChanges,PRODUCT_GROWTH_THRESHOLD_USD,type ProductChange,type ProductChangeMetric,type ProductChangesView} from '../lib/trade/product-changes';
import {downloadBlob,serializeProductChangesCsv} from '../lib/trade/downloads';
import {monthLabel,percent,usd,usdChange} from '../lib/trade/format';
import {profileViewPath} from '../lib/trade/view-link';
import {portfolioPath} from '../lib/trade/portfolio-link';
import {ChangesViewLink,useChangesViewLink} from './ChangesViewLink';

function ProductChangesTable({products,movement,metric,direction}:{products:ProductChange[];movement:'increases'|'decreases';metric:ProductChangeMetric;direction:Direction}){
  const title=`Largest product ${movement} · ${metric==='dollars'?'dollar change':'percentage growth'}`;
  return <div className="changes-group">
    <h3>{title}</h3>
    <div className="table-scroll" role="region" aria-label={`Scrollable ${title.toLowerCase()}`} tabIndex={0}>
      <table aria-label={title}><thead><tr><th scope="col">Product</th><th scope="col">{metric==='dollars'?'Dollar change':'Growth'}</th><th scope="col">Current USD</th><th scope="col">Previous USD</th><th scope="col">{metric==='dollars'?'Growth':'Dollar change'}</th></tr></thead>
        <tbody>{products.map(product=><tr key={product.code}>
          <th scope="row"><a href={profileViewPath(product.code,{direction,months:12,countryCodes:[]})}>{product.name}</a> <small>HS {product.code}</small></th>
          <td className="ranked-value">{metric==='dollars'?usdChange(product.comparison.changeUsd):percent(product.comparison.changePercent)}</td>
          <td>{usd(product.comparison.current)}</td><td>{usd(product.comparison.previous)}</td>
          <td>{metric==='dollars'?percent(product.comparison.changePercent):usdChange(product.comparison.changeUsd)}</td>
        </tr>)}</tbody>
      </table>
    </div>
    {products.length===0&&<p className="changes-empty">No eligible products with {movement==='increases'?'an increase':'a decrease'} in this comparison.</p>}
  </div>;
}

export function ProductChanges({data}:{data:string}){
  const views=useMemo(()=>JSON.parse(data) as Record<Direction,ProductChangesView>,[data]);
  const savedView=useChangesViewLink('/changes/products/','growth');
  const {direction,metric}=savedView.selection,ready=Boolean(savedView.link);
  const view=views[direction],ranking=rankProductChanges(view,metric);
  const period=(value:{from:string;to:string})=>`${monthLabel(value.from)}–${monthLabel(value.to)}`;
  const excluded=view.products.filter(product=>product.availability!=='available');
  const belowThreshold=metric==='growth'?view.products.filter(product=>product.availability==='available'&&product.comparison.previous!<PRODUCT_GROWTH_THRESHOLD_USD):[];
  return <>
    {view.products.some(product=>product.provenance.source==='fixture')&&<div className="sample-banner"><strong>Development sample data</strong><span>These figures are synthetic and are for development checks.</span></div>}
    <div className="release-strip"><span>Comparison reporting month <strong>{monthLabel(view.reportingMonth)}</strong></span><a href="/methods/">Source &amp; methods ↗</a></div>
    <div className="explorer-controls"><fieldset><legend>Trade direction</legend>{(['imports','exports'] as const).map(value=><label key={value}><input type="radio" name="product-direction" disabled={!ready} checked={direction===value} onChange={()=>savedView.changeSelection({direction:value,metric})}/>{value==='imports'?'Imports':'Exports'}</label>)}</fieldset></div>
    <ChangesViewLink {...savedView}/>
    <p><a href={portfolioPath({productCodes:view.products.map(product=>product.code),direction})}>Compare latest-month figures</a></p>
    <section className="changes-card" aria-labelledby="product-changes-heading">
      <div className="section-heading"><div><p className="eyebrow">REVIEWED PRODUCT COMPARISONS</p><h2 id="product-changes-heading">Ranked product changes</h2></div><span className="measure-tag">{direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO'}</span></div>
      <p className="changes-period"><strong>{period(view.periods.current)}</strong> compared with <strong>{period(view.periods.previous)}</strong> · U.S. {direction}</p>
      <p>Coverage: {view.products.length} reviewed pilot products. Rankings cover these products only. Growing flows are research leads.</p>
      <p className="changes-description">Up to ten increases and ten decreases. Growth rankings require at least {usd(PRODUCT_GROWTH_THRESHOLD_USD)} in the preceding twelve months. This is an initial editorial threshold.</p>
      <div className="changes-controls"><label>Rank product changes by<select disabled={!ready} value={metric} onChange={event=>savedView.changeSelection({direction,metric:event.target.value as ProductChangeMetric})}><option value="dollars">Dollar change</option><option value="growth">Percentage growth</option></select></label>
        <button className="secondary-button" disabled={!ready||ranking.increases.length+ranking.decreases.length===0} onClick={()=>downloadBlob(new Blob([serializeProductChangesCsv(view,metric)],{type:'text/csv;charset=utf-8'}),`pilot-products-${direction}-changes-${metric}.csv`)}>Download product changes CSV</button>
      </div>
      <p className="changes-status" role="status" aria-live="polite" aria-atomic="true">Excluded products: {ranking.unavailableCount} unavailable {ranking.unavailableCount===1?'comparison':'comparisons'}; {ranking.differentMonthCount} different reporting {ranking.differentMonthCount===1?'month':'months'}; {ranking.belowThresholdCount} below the growth threshold. {ranking.unchangedCount} {ranking.unchangedCount===1?'product has':'products have'} no change.</p>
      {excluded.length>0&&<ul aria-label="Products excluded from comparison">{excluded.map(product=><li key={product.code}>{product.name} · HS {product.code}: {product.availability==='reporting_month_mismatch'?`Reporting month ${monthLabel(product.reportingMonth)} differs from ${monthLabel(view.reportingMonth)}.`:product.availability==='classification_unverified'?'Classification continuity is unverified across these periods.':'Reported months are incomplete in one or both periods.'}</li>)}</ul>}
      {belowThreshold.length>0&&<p className="chart-note">Below the growth threshold: {belowThreshold.map(product=>`${product.name} (HS ${product.code})`).join('; ')}.</p>}
      <ProductChangesTable products={ranking.increases} movement="increases" metric={metric} direction={direction}/>
      <ProductChangesTable products={ranking.decreases} movement="decreases" metric={metric} direction={direction}/>
      <p className="chart-note">Values are current USD, not seasonally adjusted. Comparisons require both complete, compatible twelve-month periods and the same reporting month. A zero prior value has no growth percentage. The CSV contains the displayed rankings, periods, threshold and each product’s source details.</p>
      <noscript><p className="chart-note">Enable JavaScript to restore saved filters, change direction or ranking and download a CSV. The initial view shows U.S. imports ranked by dollar change over rolling twelve months.</p></noscript>
    </section>
    <details className="provenance"><summary>Sources for these product comparisons</summary>{view.products.map(product=><div key={product.code}>
      <p><strong>{product.name} · HS {product.code}</strong> · {product.title}</p>
      <p>Source: {product.provenance.source==='fixture'?'Development fixtures':'U.S. Census Bureau'} · {product.provenance.measure} · reporting month {product.reportingMonth} · retrieved {product.provenance.retrievedAt} · processing version {product.provenance.codeVersion} · revised observations: {product.provenance.revised?'yes':'no'}</p>
      <p><a href={profileViewPath(product.code,{direction,months:12,countryCodes:[]})}>Open {product.name} research</a>. Source requests are included in the CSV.</p>
    </div>)}</details>
  </>;
}
