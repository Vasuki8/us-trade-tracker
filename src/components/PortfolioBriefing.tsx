import {useEffect,useRef,useState} from 'react';
import type {PreparedPortfolio,PortfolioSelection,PortfolioTrade,PortfolioProduct} from '../lib/trade/portfolio-briefing';
import {selectPortfolioBriefing} from '../lib/trade/portfolio-briefing';
import {portfolioPath,readPortfolioSelection} from '../lib/trade/portfolio-link';
import type {DutyComparison,DutyPeriod} from '../lib/trade/duty-types';
import {usd,usdChange,percent,percentagePoints,monthLabel} from '../lib/trade/format';
import {profileViewPath} from '../lib/trade/view-link';
import type {Direction} from '../lib/trade/types';
import {downloadBlob,serializePortfolioSummaryCsv,serializePortfolioPartnersCsv} from '../lib/trade/downloads';

const range=(period:{from:string;to:string})=>period.from===period.to?monthLabel(period.to):`${monthLabel(period.from)}–${monthLabel(period.to)}`;
const dutyShare=(value:number|null)=>value===null?'Unavailable':`${value.toFixed(3)}%`;
function TradeSummary({label,trade,id}:{label:string;trade:PortfolioTrade;id:string}){
  return <section aria-labelledby={id} className="portfolio-section"><h3 id={id}>{label}</h3>
    <p className="briefing-period">{range(trade.periods.current)} compared with {range(trade.periods.previous)}</p>
    <dl className="portfolio-figures"><div><dt>Current value:</dt><dd>{usd(trade.comparison.current)}</dd></div><div><dt>Prior value:</dt><dd>{usd(trade.comparison.previous)}</dd></div><div><dt>Dollar change:</dt><dd>{usdChange(trade.comparison.changeUsd)}</dd></div><div><dt>Growth:</dt><dd>{percent(trade.comparison.changePercent)}</dd></div></dl>
    {trade.status!=='available'&&<p>Comparison unavailable: {trade.status==='classification_unverified'?'the classification is not verified across both periods.':'one or both periods are incomplete or suppressed.'}</p>}
    {trade.comparison.previous===0&&<p>No growth percentage is calculated from a zero prior value.</p>}
  </section>;
}
function DutyAmounts({label,period}:{label:string;period:DutyPeriod}){
  return <div className="portfolio-duty-period"><h5>{label} · {range(period)}</h5>
    <p>Estimated duties: {usd(period.calculatedDutyUsd)} · Consumption value: {usd(period.consumptionValueUsd)} · Duty share: {dutyShare(period.dutySharePercent)}</p>
    <p className="chart-note">Amount status: duties {period.statuses.calculatedDuty}, consumption {period.statuses.consumptionValue}, dutiable value {period.statuses.dutiableValue}. {period.complete?'Complete period.':'Incomplete period.'} Classification {period.classificationCompatible?'verified':'unverified'}.</p>
    <p className="chart-note">RP 70/79 coverage: {period.coverage.status}. {period.coverage.qualified?'Qualified: some dutiable value has no calculated duty. ':''}Affected dutiable value: {usd(period.coverage.affectedDutiableValueUsd)} ({dutyShare(period.coverage.affectedSharePercent)} of {usd(period.dutiableValueUsd)} dutiable value).</p>
  </div>;
}
function DutySummary({label,value,id}:{label:string;value:DutyComparison;id:string}){
  return <section aria-labelledby={id} className="portfolio-section portfolio-duties"><h4 id={id}>{label}</h4>
    <DutyAmounts label="Current" period={value.current}/><DutyAmounts label="Prior" period={value.previous}/>
    <p>Duty dollar change: {usdChange(value.change.calculatedDutyUsd)} · Duty growth: {percent(value.change.growthPercent)} · Share change: {percentagePoints(value.change.dutySharePercentagePoints)}</p>
    {!value.change.comparable&&<p>Duty comparison unavailable: complete amounts, verified coverage and compatible classifications are required for both periods.</p>}
  </section>;
}
function ProductCard({product,direction,reportingMonth}:{product:PortfolioProduct;direction:Direction;reportingMonth:string}){
  const id=`portfolio-${product.code}`,data=product.data;
  return <article className="portfolio-product" aria-labelledby={`${id}-title`}><h2 id={`${id}-title`}>{product.name} · HS {product.code}</h2>
    <p className="portfolio-description">{product.description}</p>
    <p><a href={profileViewPath(product.code,{direction,months:12,countryCodes:[]})}>Explore {product.name} research</a></p>
    {!data?<p role="status">Comparisons unavailable for {monthLabel(reportingMonth)}. This product's retained release ends in {monthLabel(product.reportingMonth)}. Select it alone to read its own reporting period.</p>:<>
      <TradeSummary label="Latest month" trade={data.monthly} id={`${id}-monthly`}/><TradeSummary label="Rolling twelve months" trade={data.rolling} id={`${id}-rolling`}/>
      <section className="portfolio-section" aria-labelledby={`${id}-partners`}><h3 id={`${id}-partners`}>Partner highlights</h3><p>Largest rolling dollar increase and decrease · {range(data.rolling.periods.current)} compared with {range(data.rolling.periods.previous)}.</p>
        {data.highlights.length===0&&<p>No comparable partner increase or decrease is available.</p>}
        {data.highlights.map(({movement,country,duties})=><div className="portfolio-partner" key={movement}><h4>{movement==='increase'?'Largest increase':'Largest decrease'}: <a href={profileViewPath(product.code,{direction,months:12,countryCodes:[country.code]})}>{country.name} · {country.code}</a></h4>
          <p>Current value: {usd(country.currentUsd)} · Prior value: {usd(country.previousUsd)} · Dollar change: {usdChange(country.changeUsd)} · Growth: {percent(country.changePercent)}</p>
          <p>Country share: {dutyShare(country.currentSharePercent)} (prior {dutyShare(country.previousSharePercent)}) · Share change: {percentagePoints(country.shareChangePoints)}</p>
          {duties&&<DutySummary label={`${country.name} rolling estimated duties`} value={duties} id={`${id}-${country.code}-duties`}/>}</div>)}
        <p className="chart-note">Partners with unavailable comparisons: {data.unavailablePartnerCount}. Rankings use dollar change independently of profile chart selections.</p>
      </section>
      {direction==='imports'&&<section className="portfolio-section" aria-labelledby={`${id}-duties`}><h3 id={`${id}-duties`}>Estimated duties</h3><p>Duty share uses calculated duties (CAL_DUT_MO) divided by matching imports for consumption (CON_VAL_MO), rather than general imports. Rolling shares use sums over matching periods.</p>
        {data.worldDuties?<><DutySummary label="Monthly estimated duties" value={data.worldDuties.latest} id={`${id}-world-monthly-duties`}/><DutySummary label="Rolling estimated duties" value={data.worldDuties.rolling} id={`${id}-world-rolling-duties`}/></>:<p>Estimated-duty data is unavailable for this release.</p>}
        <p className="chart-note">Estimated duties may differ from duties paid and exclude antidumping and countervailing duties. A reported zero does not establish duty-free treatment.</p>
      </section>}
      <section className="portfolio-section portfolio-source" aria-labelledby={`${id}-source`}><h3 id={`${id}-source`}>Sources and release</h3><p>Source: {data.provenance.source==='fixture'?'Development sample data':'U.S. Census Bureau'} · Reporting month: {monthLabel(product.reportingMonth)} · Measure: <span>{data.provenance.measure}</span> · Current USD, not seasonally adjusted.</p>
        <p>Retrieved: {data.provenance.retrievedAt} · Processing revision: {data.provenance.codeVersion} · Merchandise revised: {data.provenance.revised?'yes':'no'}{data.dutyProvenance&&` · Duties revised: ${data.dutyProvenance.revised?'yes':'no'}`}</p>
        <ul>{data.provenance.sourceUrls.map(url=><li key={url}><a href={url}>{url}</a></li>)}</ul>
      </section>
    </>}
  </article>;
}

export function PortfolioBriefing({data}:{data:PreparedPortfolio}){
  const [selection,setSelection]=useState<PortfolioSelection>(()=>({productCodes:data.products.map(p=>p.code),direction:'imports'}));
  const [ready,setReady]=useState(false),[notice,setNotice]=useState<string|null>(null),[link,setLink]=useState(''),[copied,setCopied]=useState(false),[manual,setManual]=useState(false);
  const generation=useRef(0);
  useEffect(()=>{
    const restore=()=>{const value=readPortfolioSelection(window.location.search,data.products.map(p=>p.code));generation.current++;setSelection(value.selection);setNotice(value.notice);setCopied(false);setManual(false);setLink(new URL(portfolioPath(value.selection,window.location.hash),window.location.origin).href);setReady(true);};
    restore();window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
    return ()=>{generation.current++;window.removeEventListener('popstate',restore);window.removeEventListener('hashchange',restore);};
  },[data]);
  const change=(next:PortfolioSelection)=>{const path=portfolioPath(next,window.location.hash);window.history.pushState(window.history.state,'',path);generation.current++;setSelection(next);setNotice(null);setCopied(false);setManual(false);setLink(new URL(path,window.location.origin).href);};
  const copy=async()=>{const current=++generation.current;try{await navigator.clipboard.writeText(link);if(current===generation.current){setCopied(true);setManual(false);}}catch{if(current===generation.current){setCopied(false);setManual(true);}}};
  const view=selectPortfolioBriefing(data,selection);
  const download=(kind:'summary'|'partners')=>downloadBlob(new Blob([kind==='summary'?serializePortfolioSummaryCsv(view):serializePortfolioPartnersCsv(view)],{type:'text/csv;charset=utf-8'}),`coffee-portfolio-${selection.direction}-${view.reportingMonth}-${kind}.csv`);
  return <div className="portfolio-briefing"><div className="portfolio-controls">
    <fieldset disabled={!ready}><legend>Products · select at least one</legend>{data.products.map(p=><label key={p.code}><input type="checkbox" checked={selection.productCodes.includes(p.code)} disabled={selection.productCodes.length===1&&selection.productCodes.includes(p.code)} onChange={event=>change({...selection,productCodes:data.products.filter(item=>item.code===p.code?event.target.checked:selection.productCodes.includes(item.code)).map(item=>item.code)})}/>{p.name} · HS {p.code}</label>)}</fieldset>
    <fieldset disabled={!ready}><legend>Trade direction</legend>{(['imports','exports'] as const).map(direction=><label key={direction}><input type="radio" name="portfolio-direction" checked={direction===selection.direction} onChange={()=>change({...selection,direction})}/>{direction==='imports'?'Imports':'Exports'}</label>)}</fieldset>
    <div className="view-link"><button className="secondary-button" disabled={!ready} onClick={copy}>Copy briefing link</button><p>Links restore your products and direction using the latest accepted releases.</p>{notice&&<p role="status">{notice}</p>}{copied&&<p role="status">Briefing link copied.</p>}{manual&&<label>Briefing link<input readOnly value={link} onFocus={event=>event.currentTarget.select()}/></label>}</div>
    <div className="download-actions"><button className="secondary-button" disabled={!ready} onClick={()=>download('summary')}>Download summary CSV</button><button className="secondary-button" disabled={!ready} onClick={()=>download('partners')}>Download partner changes CSV</button><button className="secondary-button" disabled={!ready} onClick={()=>window.print()}>Print / Save PDF</button></div>
    <noscript><p>Enable JavaScript to select products, change direction, restore a saved selection or download CSVs. The default report shows all available products and Imports. You can print this default report using your browser.</p></noscript>
  </div>
    <p className="portfolio-selection">Selected report: {view.products.map(p=>`${p.name} (HS ${p.code})`).join('; ')} · {selection.direction==='imports'?'Imports':'Exports'} · Reporting month: {monthLabel(view.reportingMonth)}.</p>
    <p>Figures are shown separately for each product. There is no combined portfolio total or averaged duty rate.</p>
    {view.products.map(product=><ProductCard key={product.code} product={product} direction={selection.direction} reportingMonth={view.reportingMonth}/>)}
  </div>;
}
