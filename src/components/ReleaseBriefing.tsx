import type {Release,ProfileView} from '../lib/trade/types';
import type {ChangesView} from '../lib/trade/changes';
import type {DutyPeriod} from '../lib/trade/duty-types';
import {buildProfileView} from '../lib/trade/profile';
import {buildChangesView,rankChanges} from '../lib/trade/changes';
import {buildDutyView} from '../lib/trade/duties';
import {shiftMonth} from '../lib/trade/metrics';
import {monthLabel,usd,percent} from '../lib/trade/format';
import {profileViewPath,monthlyChangesPath,countryChangesViewPath} from '../lib/trade/view-link';

const period=(from:string,to:string)=>from===to?monthLabel(from):`${monthLabel(from)}–${monthLabel(to)}`;
const share=(value:number|null)=>value===null?'Unavailable':value>0&&value<0.001?'<0.001%':`${value.toFixed(3)}%`;

function MonthlyTrade({view}:{view:ProfileView}){
  const imports=view.selection.direction==='imports',value=view.latestMonth;
  return <section className="briefing-card" aria-label={imports?'Monthly imports':'Monthly exports'}>
    <h3>{imports?'Imports':'Exports'}</h3>
    <p className="briefing-period">{monthLabel(view.reportingMonth)} compared with {monthLabel(shiftMonth(view.reportingMonth,-12))}</p>
    <p>Current value: <strong>{usd(value.current)}</strong><br/>Previous value: <strong>{usd(value.previous)}</strong></p>
    <p>Dollar change: <strong>{usd(value.changeUsd)}</strong> · Growth: <strong>{percent(value.changePercent)}</strong></p>
    <p className="chart-note">{imports?'General import customs value':'Total exports, including re-exports'} · {view.provenance.measure} · current USD, not seasonally adjusted.</p>
    {value.changeUsd!==null&&<p><a href={countryChangesViewPath(view.productCode,{direction:view.selection.direction,period:'monthly'})}>Explore latest-month {imports?'import':'export'} changes by country</a></p>}
  </section>;
}

function PartnerChanges({view}:{view:ChangesView}){
  const ranks=rankChanges(view,'dollars'),available=view.countries.length-ranks.unavailableCount;
  const imports=view.direction==='imports',increase=ranks.increases[0],decrease=ranks.decreases[0];
  return <section className="briefing-card" aria-label={imports?'Annual import partner changes':'Annual export partner changes'}>
    <h3>{imports?'Import partners':'Export partners'}</h3>
    <p className="briefing-period">{period(view.periods.current.from,view.periods.current.to)} compared with {period(view.periods.previous.from,view.periods.previous.to)}</p>
    {!view.classificationComparable||available===0?<p>Country comparisons are unavailable for these periods. They require complete observations and verified classification continuity.</p>:<>
      <p>{increase?<>Largest increase: <strong><a href={profileViewPath(view.productCode,{direction:view.direction,months:12,countryCodes:[increase.code]})}>{increase.name}</a> · {usd(increase.changeUsd)}</strong></>:'No country increase among comparable observations.'}</p>
      <p>{decrease?<>Largest decrease: <strong><a href={profileViewPath(view.productCode,{direction:view.direction,months:12,countryCodes:[decrease.code]})}>{decrease.name}</a> · {usd(decrease.changeUsd)}</strong></>:'No country decrease among comparable observations.'}</p>
    </>}
    <p className="chart-note">Ranked by dollar change · {available} countries with comparable data; {ranks.unavailableCount} unavailable. Missing country months remain unavailable.</p>
  </section>;
}

function DutySummary({value,rolling=false}:{value:DutyPeriod;rolling?:boolean}){
  return <article className="briefing-card" aria-label={rolling?'Rolling estimated duties':'Monthly estimated duties'}>
    <h3>{rolling?'Rolling twelve months':'Latest month'}</h3>
    <p className="briefing-period">{period(value.from,value.to)}</p>
    <p>Calculated duties: <strong>{usd(value.calculatedDutyUsd)}</strong><br/>Consumption value: <strong>{usd(value.consumptionValueUsd)}</strong><br/>Duty share: <strong>{share(value.dutySharePercent)}</strong></p>
    <p className="chart-note">{value.coverage.status==='unavailable'?'Reporting coverage unavailable.':<>RP70/79 affected dutiable value: {usd(value.coverage.affectedDutiableValueUsd)} · {share(value.coverage.affectedSharePercent)} of dutiable value.{value.coverage.qualified?' Qualified reported figures.':''}</>}</p>
    {!value.classificationCompatible&&<p className="chart-note">Classification continuity is unverified for this period.</p>}
    {!value.complete&&<p className="chart-note">Some figures are missing or suppressed; available reported amounts remain visible.</p>}
  </article>;
}

export function ReleaseBriefing({release}:{release:Release}){
  const imports=buildProfileView(release,{direction:'imports',months:12,countryCodes:[]});
  const exports=buildProfileView(release,{direction:'exports',months:12,countryCodes:[]});
  const duties=buildDutyView(release,[]),worldDuty=duties.series[0];
  return <div className="briefing">
    {release.source==='fixture'&&<div className="sample-banner"><strong>Development sample data</strong><span>This briefing uses synthetic observations for development checks.</span></div>}
    <div className="release-strip"><span>Reporting month: <strong>{monthLabel(release.reportingMonth)}</strong></span><span>Retrieved: {release.retrievedAt}</span><a href="/methods/">Sources &amp; methods</a></div>
    <section className="briefing-section" aria-labelledby="monthly-trade-heading">
      <h2 id="monthly-trade-heading">Latest monthly trade</h2>
      <p>Compare the reporting month with the same month one year earlier. Dollar changes and growth require both reported values and verified classification continuity; a zero prior value has no growth percentage.</p>
      <div className="briefing-grid"><MonthlyTrade view={imports}/><MonthlyTrade view={exports}/></div>
    </section>
    <section className="briefing-section" aria-labelledby="partner-movements-heading">
      <h2 id="partner-movements-heading">Partner markets over the latest twelve months</h2>
      <p>These highlights compare two rolling annual periods. They describe changes in recorded U.S. flows for this product; they do not establish worldwide demand or profitability.</p>
      <div className="briefing-grid"><PartnerChanges view={buildChangesView(release,'imports')}/><PartnerChanges view={buildChangesView(release,'exports')}/></div>
      <p><a href={monthlyChangesPath(release.productCode)}>See all country changes</a></p>
    </section>
    <section className="briefing-section" aria-labelledby="briefing-duties-heading">
      <h2 id="briefing-duties-heading">Estimated duties</h2>
      {!duties.available?<p>This retained release does not include duty history. Estimated duties are unavailable.</p>:<>
        <p>All partner countries · U.S. imports for consumption. Calculated duties as share of import value uses CAL_DUT_MO / CON_VAL_MO. Rolling shares divide matching sums, rather than averaging monthly percentages.</p>
        <div className="briefing-grid"><DutySummary value={worldDuty.latest.current}/><DutySummary value={worldDuty.rolling.current} rolling/></div>
        <p className="chart-note">Calculated duties can differ from amounts actually paid and exclude antidumping and countervailing duties. RP70/79 report dutiable value without calculating duties. Reported zero duties do not prove duty-free trade. A zero or missing consumption value has no duty share.</p>
        <p><a href={`/products/${release.productCode}/#duties-heading`}>Explore duty history and comparisons</a></p>
      </>}
    </section>
    <section className="briefing-section provenance" aria-labelledby="briefing-sources-heading">
      <h2 id="briefing-sources-heading">Sources and release</h2>
      <p>Source: {release.source==='fixture'?'Development fixtures':'U.S. Census Bureau'} · retrieved {release.retrievedAt} · processing version {release.codeVersion}.</p>
      <p>Merchandise observations revised: {release.revisedKeys.length}. Duty revisions: {release.schemaVersion===2?release.duties.revisedKeys.length:'no retained duty history'}.</p>
      <p>Dollar values are {release.source==='fixture'?'synthetic development observations':'reported Census observations'}; comparisons are calculations by US Trade Tracker. Revision counts compare this snapshot with the previous retained snapshot.</p>
      {[...new Set(release.sourceUrls)].map(url=><a key={url} href={url}>{url}</a>)}
      <p><a href={`/products/${release.productCode}/`}>Explore the full product profile</a></p>
    </section>
  </div>;
}
