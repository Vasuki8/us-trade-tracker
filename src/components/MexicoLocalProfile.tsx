import {useEffect,useState} from 'react';
import type {MexicoDirection,MexicoLocalProfile as Profile} from '../lib/mexico-profile/types';
import {summarizeMexicoDirection} from '../lib/mexico-profile/summary';
import {mexicoCsvFilename,serializeMexicoMonthlyCsv,serializeMexicoSummaryCsv} from '../lib/mexico-profile/downloads';
import {downloadBlob} from '../lib/trade/downloads';
import {monthLabel,percent,usd,usdChange} from '../lib/trade/format';
import {MexicoAllGoodsHistory} from './MexicoAllGoodsHistory';
const period=(from:string,to:string)=>monthLabel(from)+'–'+monthLabel(to);
const timestamp=(value:string)=>new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'UTC'}).format(new Date(value))+' UTC';
export function MexicoLocalProfile({data}:{data:Profile}):React.JSX.Element{
 const [direction,setDirection]=useState<MexicoDirection>('imports'),[ready,setReady]=useState(false),[error,setError]=useState<string|null>(null);
 useEffect(()=>setReady(true),[]);
 const view=data.directions[direction],summary=summarizeMexicoDirection(view),real=data.source==='census';
 const download=(kind:'monthly'|'summary')=>{
  if(!ready)return;
  try{const text=kind==='monthly'?serializeMexicoMonthlyCsv(data,direction):serializeMexicoSummaryCsv(data,direction);downloadBlob(new Blob([text],{type:'text/csv;charset=utf-8'}),mexicoCsvFilename(data,direction,kind));setError(null);}catch{setError('Download unavailable. Please try again.');}
 };
 return <div className="mx-local">
  <div className="page-heading"><p className="eyebrow">COUNTRY RESEARCH / LOCAL PREVIEW</p><h1>Mexico — all-goods trade</h1><p>September 2024–August 2026 · Captured U.S. goods trade</p></div>
  <div className="sample-banner"><strong>{real?'Local preview · Accepted for private all-goods use · Unpublished':'Synthetic development sample · No accepted Mexico release'}</strong><span>{real?'U.S. Census Bureau monthly merchandise files':'All displayed values and reference checks are synthetic.'}</span></div>
  <fieldset className="explorer-controls" disabled={!ready}><legend>Trade direction</legend>{(['imports','exports'] as const).map(d=><label key={d}><input type="radio" name="mexico-direction" value={d} checked={direction===d} onChange={()=>{setDirection(d);setError(null);}}/>{d==='imports'?'Imports':'Exports'}</label>)}</fieldset>
  <noscript><p>Imports are shown below. Direction switching and CSV downloads require JavaScript.</p></noscript>
  <p className="mx-basis">{direction==='imports'?'General imports · Customs value · GEN_VAL_MO':'Domestic plus foreign exports · FAS value · ALL_VAL_MO'} · Nominal USD · All transport modes · Not seasonally adjusted</p>
  <section className="mx-summary" aria-label="Mexico all-goods overview">
   <div aria-label="Latest captured month"><span>Latest captured month · {monthLabel(summary.latest.month)}</span><strong>{usd(summary.latest.valueUsd)}</strong></div>
   <div aria-label="Current twelve-month total"><span>Current · {period(summary.current.from,summary.current.to)}</span><strong>{usd(summary.current.totalUsd)}</strong><small>{summary.current.reportedMonths}/12 months reported</small></div>
   <div aria-label="Prior twelve-month total"><span>Prior · {period(summary.prior.from,summary.prior.to)}</span><strong>{usd(summary.prior.totalUsd)}</strong><small>{summary.prior.reportedMonths}/12 months reported</small></div>
   <div aria-label="All-goods change"><span>Change versus prior twelve months</span><strong>{usdChange(summary.changeUsd)}</strong><small>Growth: {percent(summary.growthPercent)}</small></div>
  </section>
  <MexicoAllGoodsHistory view={view}/>
  <div className="download-actions"><button className="secondary-button" disabled={!ready} onClick={()=>download('monthly')}>Download monthly CSV</button><button className="secondary-button" disabled={!ready} onClick={()=>download('summary')}>Download summary CSV</button></div>
  {error&&<p role="alert">{error}</p>}
  <section className="data-card" aria-label="Snapshot qualifications">
   <p>Dated publication checks differ in 32 of 48 observations; causes and original-byte vintage are not established. Product comparisons are unavailable pending classification verification.</p>
   <details className="content-details"><summary>Sources and snapshot qualifications</summary>
    <p>{real?'These captured figures are not a claim to the latest revised Census series.':'All observations and reference examples in this development sample are synthetic.'} The retained current reference grids match 48 of 48 controls before collection and 48 of 48 after. Dated publications have 16 matches and 32 differences. These are whole-snapshot counts across Imports and Exports.</p>
    <p>The 17 ordinary classification pairs remain unverified. Three statistical exclusions remain included in all-goods totals; every product comparison is withheld.</p>
    <p>Collection captured <time dateTime={data.captureInterval.startedAt}>{timestamp(data.captureInterval.startedAt)}</time> to <time dateTime={data.captureInterval.finishedAt}>{timestamp(data.captureInterval.finishedAt)}</time>. Capture times describe saved files, not observation revision dates.</p>
    {data.acceptance&&<p>Accepted for private all-goods use on <time dateTime={data.acceptance.acceptedAt}>{timestamp(data.acceptance.acceptedAt)}</time>. This local preview is unpublished.</p>}
    <p>{real?'This view reuses prior reviewed retained evidence and performs no fresh raw-source verification. Earlier failed audits remain failed.':'No accepted release, official-source verification or real acceptance date is represented by this synthetic sample.'}</p>
    <p><a href="https://www.census.gov/foreign-trade/reference/definitions/index.html">Census trade definitions and revision methodology</a></p>
   </details>
  </section>
 </div>;
}
