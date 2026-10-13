import {useEffect,useState} from 'react';
import type {CountryDirection,CountryPreview,CountryPresentation} from '../lib/country-preview/types';
import {countryCsvFilename,serializeCountryMonthlyCsv,serializeCountryProductsCsv,assertCountryPresentationSource} from '../lib/country-preview/downloads';
import {downloadBlob} from '../lib/trade/downloads';
import {usd,usdChange,percent,countryShare,percentagePoints,monthLabel} from '../lib/trade/format';
import {CountryPreviewChart} from './CountryPreviewChart';
import {countryTimestampLabel} from '../lib/country-preview/presentation';
const period=(from:string,to:string)=>`${monthLabel(from)}–${monthLabel(to)}`;
export function CanadaPreview({data,presentation={kind:'preview'}}:{data:CountryPreview;presentation?:CountryPresentation}):React.JSX.Element {
  const accepted=presentation.kind==='accepted-local',profileSample=presentation.kind==='accepted-fixture';
  const profile=accepted||profileSample;
  assertCountryPresentationSource(data,presentation);
  const [direction,setDirection]=useState<CountryDirection>('imports'),[error,setError]=useState<string|null>(null);
  const [interactive,setInteractive]=useState(false);
  useEffect(()=>{setInteractive(true);},[]);
  const view=data.directions[direction],label=direction==='imports'?'Imports':'Exports';
  const publicationSources=view.references.differences.flatMap(row=>row.publicationSource?[{month:row.month,...row.publicationSource}]:[]);
  const source=data.source==='fixture'?'Synthetic development data':'U.S. Census Bureau monthly merchandise files';
  const banner=accepted?'24-month locally accepted snapshot · Not published':profileSample?'Synthetic accepted-profile sample · No accepted country release':data.source==='retained'?'24-month captured assessment · Acceptance not checked in this preview':'24-month development preview · No accepted country release';
  const verificationNote=data.source==='retained'?`Reuses the previously reviewed ${profile?'source':'raw'} replay; this page performs no fresh source verification.`:'All displayed observations and reference examples are synthetic.';
  const auditMetadata=<>
    <p>Assessment processing version: <code>{data.processingVersion}</code> · Source verification basis: {data.rawVerification}. {!profile&&verificationNote}</p>
    {(['before','after'] as const).map(which=>{const s=view.references[which].source;return s&&<p key={which}>Saved {which} reference: <a href={s.url}>{s.url}</a> · captured {s.capturedAt} · {s.bytes} bytes · SHA-256 {s.sha256}</p>;})}
  </>;
  const download=(kind:'monthly'|'products')=>{try{downloadBlob(new Blob([kind==='monthly'?serializeCountryMonthlyCsv(data,direction,presentation):serializeCountryProductsCsv(data,direction,presentation)],{type:'text/csv;charset=utf-8'}),countryCsvFilename(direction,kind,presentation));setError(null);}catch{setError('Download unavailable. Please try again.');}};
  return <div className="canada-preview">
    <div className="page-heading"><p className="eyebrow">COUNTRY RESEARCH / {accepted?'ACCEPTED LOCAL PREVIEW':profileSample?'ACCEPTED-PROFILE DEVELOPMENT SAMPLE':'LOCAL DEVELOPMENT PREVIEW'}</p><h1>Canada</h1><p>Explore captured U.S. goods trade with Canada, September 2024–August 2026.</p></div>
    <div className="sample-banner"><strong>{source}</strong><span>{banner}</span></div>
    {accepted&&<p className="preview-capture">Local acceptance recorded <time dateTime={presentation.acceptedAt}>{countryTimestampLabel(presentation.acceptedAt)}</time>. This local preview does not publish the snapshot.</p>}
    <p className="preview-capture">Source collection captured {profile?<time dateTime={data.captureInterval.startedAt}>{countryTimestampLabel(data.captureInterval.startedAt)}</time>:data.captureInterval.startedAt} to {profile?<time dateTime={data.captureInterval.finishedAt}>{countryTimestampLabel(data.captureInterval.finishedAt)}</time>:data.captureInterval.finishedAt}. Capture times describe the saved files, not observation revision dates.</p>
    <fieldset className="explorer-controls" disabled={!interactive}><legend>Trade direction</legend>{(['imports','exports'] as const).map(d=><label key={d}><input type="radio" name="canada-direction" value={d} checked={direction===d} onChange={()=>{setDirection(d);setError(null);}}/>{d==='imports'?'Imports':'Exports'}</label>)}</fieldset>
    <noscript><p>Imports are shown below. Direction switching and CSV downloads require JavaScript.</p></noscript>
    <section aria-label="Country overview">
      <h2>{view.title}</h2><p>{view.measure} · {direction==='imports'?'General imports, customs value':'Domestic plus foreign exports, FAS value'} · nominal USD, not seasonally adjusted.</p>
      {(accepted||profileSample)&&direction==='exports'&&<p>Census derives exports to Canada from Canadian import data. <a href="https://www.census.gov/foreign-trade/reference/definitions/index.html">Canadian data exchange definitions</a></p>}
      <div className="preview-summary">
        <div><span>Latest captured month · {monthLabel(view.summary.latestMonth)}</span><strong>{usd(view.summary.latestUsd)}</strong></div>
        <div><span>Current · {period(view.summary.current.from,view.summary.current.to)}</span><strong>{usd(view.summary.current.totalUsd)}</strong><small>{view.summary.current.reportedMonths}/12 months reported</small></div>
        <div><span>Prior · {period(view.summary.prior.from,view.summary.prior.to)}</span><strong>{usd(view.summary.prior.totalUsd)}</strong><small>{view.summary.prior.reportedMonths}/12 months reported</small></div>
        <div><span>All-goods change</span><strong>{usdChange(view.summary.changeUsd)}</strong><small>Growth: {percent(view.summary.growthPercent)}</small></div>
      </div>
    </section>
    <CountryPreviewChart view={view} source={data.source}/>
    <section className="data-card" aria-label={accepted||profileSample?'Selected categories and changes':'Leading products and changes'}>
      <h2>{accepted||profileSample?'Selected categories and changes':'Leading products and changes'}</h2><p>Current: {period(view.summary.current.from,view.summary.current.to)} · Prior: {period(view.summary.prior.from,view.summary.prior.to)}</p>
      <p>These ten selected categories are ordered by current-period reported value and cover a subset of trade. Shares use all U.S. {direction==='imports'?'imports from':'exports to'} Canada as the same-archive denominator; they are not a country’s share of U.S. trade for one product.</p>
      <p>Statistical categories remain in this list and the all-goods denominator. Their observed totals are shown; share, growth and change comparisons are unavailable under the reviewed policy.</p>
      <div className="table-scroll" role="region" aria-label="Selected country category comparisons" tabIndex={0}><table>
        <caption>{accepted||profileSample?'Selected categories':'Selected leading categories'} · {label}</caption>
        <thead><tr>{['Category','Current value (USD)','Prior value (USD)','Dollar change','Growth (%)','Current share (%)','Prior share (%)','Share change (pp)','Comparison status'].map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead>
        <tbody>{view.products.map(p=><tr key={p.code}>
          <th scope="row">{p.code}<small>{p.description??'Description unavailable'}</small></th><td>{usd(p.current.observedSumUsd)}</td><td>{usd(p.prior.observedSumUsd)}</td>
          <td>{usdChange(p.comparisonEligible?p.changeUsd:null)}</td><td>{percent(p.comparisonEligible?p.growthPercent:null)}</td><td>{countryShare(p.comparisonEligible?p.current.sharePercent:null)}</td><td>{countryShare(p.comparisonEligible?p.prior.sharePercent:null)}</td><td>{percentagePoints(p.comparisonEligible?p.sharePointChange:null)}</td>
          <td>{p.specialByPolicy?'Statistical category':p.comparisonEligible?accepted?'Compatible · accepted snapshot':'Compatible · offline preview only':'Unavailable'}<small>{accepted&&p.reason==='eligible-offline-only'?'Reviewed against the captured files':accepted&&p.reason==='statistical-category'?'Ordinary-product comparisons are unavailable':p.reason}</small>{p.classification.from&&<small>Classification: {period(p.classification.from,p.classification.to!)} · {p.classification.status}</small>}</td>
        </tr>)}</tbody>
      </table></div>
    </section>
    <div className="download-actions"><button className="secondary-button" disabled={!interactive} onClick={()=>download('monthly')}>Download monthly CSV</button><button className="secondary-button" disabled={!interactive} onClick={()=>download('products')}>Download products CSV</button></div>{error&&<p role="alert">{error}</p>}
    <section className="data-card preview-methods" aria-label="Sources and revision differences">
      <h2>Sources and revision differences</h2>
      <p>These figures come from a captured set of monthly Census files. Currently revised country totals can differ. Product shares here use totals from the same files as the product values.</p>
      <p>Saved current reference before collection: {view.references.before.matched} matched; {view.references.before.mismatch} mismatch. Saved current reference after collection: {view.references.after.matched} matched; {view.references.after.mismatch} mismatch.</p>
      <p>Original-publication checks: {view.references.publication.matched} matched; {view.references.publication.notReviewed} not reviewed. Matches and mismatches are separate from signed differences against rounded reference figures.</p>
      <p>Documented Census revision procedures support differing publication maturity, but do not establish each product observation’s revision date. This is a captured collection, without a uniform or latest-revised claim. {accepted?'Historical failed source audits remain failed. Local acceptance applies to this captured snapshot and its qualified comparisons; it does not assert current revised headline agreement.':'Historical failed source audits remain failed; these offline comparisons do not accept a country release.'}</p>
      <p><a href="https://www.census.gov/foreign-trade/reference/definitions/index.html">Census trade definitions and revision methodology</a></p>
      {view.references.differences.length>0?<div className="table-scroll" role="region" aria-label="Country reference differences" tabIndex={0}><table className="preview-reference-table">
        <caption>Retained reference differences · {label}</caption><thead><tr>{['Month','Archive (USD)','Current before (USD)','Difference before (USD)','Current after (USD)','Difference after (USD)','Original publication (USD)','Publication difference (USD)','Publication check'].map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead>
        <tbody>{view.references.differences.map(r=><tr key={r.month}><th scope="row">{monthLabel(r.month)}</th><td>{usd(r.archiveUsd)}</td><td>{usd(r.currentBeforeUsd)}</td><td>{usdChange(r.differenceBeforeUsd)}</td><td>{usd(r.currentAfterUsd)}</td><td>{usdChange(r.differenceAfterUsd)}</td><td>{usd(r.publicationUsd)}</td><td>{usdChange(r.publicationDifferenceUsd)}</td><td className="preview-publication-check">{r.publicationCheck}{r.publicationSource&&<small><a href={r.publicationSource.url}>{monthLabel(r.month)} original publication</a></small>}</td></tr>)}</tbody>
      </table></div>:<p>No current-reference mismatches in this direction.</p>}
      {publicationSources.length>0&&<details><summary>Original-publication source identities</summary><ul>{publicationSources.map(source=><li key={source.month}><strong>{monthLabel(source.month)}</strong>: <a href={source.url}>{source.url}</a> · {source.bytes} bytes · SHA-256 {source.sha256}</li>)}</ul></details>}
      {profile?<>
        <p>{verificationNote}</p>
        <details><summary>Capture and verification details</summary>
          {accepted&&<p>Exact local acceptance time: <time dateTime={presentation.acceptedAt}>{presentation.acceptedAt}</time>.</p>}
          <p>Exact collection times: <time dateTime={data.captureInterval.startedAt}>{data.captureInterval.startedAt}</time> to <time dateTime={data.captureInterval.finishedAt}>{data.captureInterval.finishedAt}</time>.</p>
          {auditMetadata}
        </details>
      </>:auditMetadata}
      {data.source==='retained'&&<details><summary>Monthly original source identities</summary><ul>{view.monthly.map(p=><li key={p.month}>{monthLabel(p.month)}: {p.originalSource&&<><a href={p.originalSource.url}>{p.originalSource.url}</a> · captured {p.originalSource.capturedAt} · {p.originalSource.bytes} bytes · SHA-256 {p.originalSource.sha256}</>}</li>)}</ul></details>}
    </section>
  </div>;
}
