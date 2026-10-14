import type {Release} from './types';
import type {DutyComparison,DutyView} from './duty-types';
import {buildDutyView} from './duties';
import {shiftMonth} from './metrics';

export type DutyChangePeriod='rolling'|'monthly';
export type DutyChangeMetric='share'|'dollars';
export type DutyChangesSelection={period:DutyChangePeriod;metric:DutyChangeMetric};
export type DutyChangeCountry={code:string;name:string;comparison:DutyComparison;profileCountryAvailable:boolean};
type Periods={current:{from:string;to:string};previous:{from:string;to:string}};
type Identity={productCode:string;title:string;reportingMonth:string;available:boolean;provenance:DutyView['provenance']};
type ComparisonView={periods:Periods;classificationComparable:boolean;world:DutyComparison|null};
export type DutyChangesView=Identity&ComparisonView&{countries:DutyChangeCountry[]};
export type DutyExclusions={classification_unverified:number;incomplete_period:number;coverage_unavailable:number;denominator_unavailable:number};
type Counts={totalCountryCount:number;comparableCount:number;unavailableCount:number;unchangedCount:number;qualifiedCount:number;exclusions:DutyExclusions};
export type DutyChangesRanking=Counts&{increases:DutyChangeCountry[];decreases:DutyChangeCountry[]};
type RankingRefs=Counts&{increases:string[];decreases:string[]};
export type PreparedDutyChanges=Identity&{views:Record<DutyChangePeriod,ComparisonView&{countries:DutyChangeCountry[];rankings:Record<DutyChangeMetric,RankingRefs>}>};
export type SelectedDutyChanges=Identity&ComparisonView&{selection:DutyChangesSelection;ranking:DutyChangesRanking};

function shareFraction(comparison:DutyComparison):{numerator:bigint;denominator:bigint} {
  const {current,previous}=comparison;
  return {numerator:BigInt(current.calculatedDutyUsd!)*BigInt(previous.consumptionValueUsd!)-BigInt(previous.calculatedDutyUsd!)*BigInt(current.consumptionValueUsd!),
    denominator:BigInt(current.consumptionValueUsd!)*BigInt(previous.consumptionValueUsd!)};
}
// Compute display differences from the exact fraction too, preserving small signs and exact zero.
function normalizedComparison(comparison:DutyComparison):DutyComparison {
  if(!comparison.change.comparable||!comparison.current.consumptionValueUsd||!comparison.previous.consumptionValueUsd)return comparison;
  const fraction=shareFraction(comparison);
  return {...comparison,change:{...comparison.change,dutySharePercentagePoints:100*Number(fraction.numerator)/Number(fraction.denominator)}};
}

export function buildDutyChangesView(release:Release,period:DutyChangePeriod):DutyChangesView {
  if(period!=='monthly'&&period!=='rolling')throw new Error('Invalid duty comparison period');
  const end=release.reportingMonth,prior=shiftMonth(end,-12);
  const periods={current:{from:period==='monthly'?end:shiftMonth(end,-11),to:end},previous:{from:period==='monthly'?prior:shiftMonth(end,-23),to:prior}};
  const world=buildDutyView(release,[]),{productCode,title,reportingMonth,available,provenance}=world;
  const classificationComparable=release.classificationIntervals.some(i=>i.from<=periods.previous.from&&periods.current.to<=i.to);
  const comparisonKey=period==='monthly'?'latest':'rolling';
  const countries:DutyChangeCountry[]=[];
  if(release.schemaVersion===2){
    const codes=[...new Set(release.duties.observations.filter(r=>r.geography==='country').map(r=>r.partnerCode))];
    const profileCodes=new Set(release.observations.filter(r=>r.direction==='imports'&&r.geography==='country'&&r.measure==='GEN_VAL_MO').map(r=>r.partnerCode));
    for(let i=0;i<codes.length;i+=3)for(const series of buildDutyView(release,codes.slice(i,i+3)).series)countries.push({code:series.code,name:series.name,comparison:normalizedComparison(series[comparisonKey]),profileCountryAvailable:profileCodes.has(series.code)});
  }
  return {productCode,title,reportingMonth,available,provenance,periods,classificationComparable,world:world.series[0]?normalizedComparison(world.series[0][comparisonKey]):null,countries};
}

export function rankDutyChanges(view:DutyChangesView,metric:DutyChangeMetric):DutyChangesRanking {
  if(metric!=='share'&&metric!=='dollars')throw new Error('Invalid duty change metric');
  const exclusions:DutyExclusions={classification_unverified:0,incomplete_period:0,coverage_unavailable:0,denominator_unavailable:0};
  const eligible:DutyChangeCountry[]=[];
  for(const country of view.countries){const {current,previous}=country.comparison;
    if(!view.classificationComparable||!current.classificationCompatible||!previous.classificationCompatible)exclusions.classification_unverified++;
    else if(!current.complete||!previous.complete)exclusions.incomplete_period++;
    else if(current.coverage.status!=='verified'||previous.coverage.status!=='verified'||!country.comparison.change.comparable)exclusions.coverage_unavailable++;
    else if(metric==='share'&&(!(current.consumptionValueUsd!>0)||!(previous.consumptionValueUsd!>0)))exclusions.denominator_unavailable++;
    else eligible.push(country);
  }
  const score=(country:DutyChangeCountry)=>metric==='share'?shareFraction(country.comparison):{numerator:BigInt(country.comparison.current.calculatedDutyUsd!)-BigInt(country.comparison.previous.calculatedDutyUsd!),denominator:1n};
  const compare=(a:DutyChangeCountry,b:DutyChangeCountry)=>{const x=score(a),y=score(b),delta=x.numerator*y.denominator-y.numerator*x.denominator;return delta<0n?-1:delta>0n?1:0;};
  const tie=(a:DutyChangeCountry,b:DutyChangeCountry)=>a.name.localeCompare(b.name,'en')||a.code.localeCompare(b.code,'en');
  return {increases:eligible.filter(c=>score(c).numerator>0n).sort((a,b)=>compare(b,a)||tie(a,b)).slice(0,10),decreases:eligible.filter(c=>score(c).numerator<0n).sort((a,b)=>compare(a,b)||tie(a,b)).slice(0,10),
    totalCountryCount:view.countries.length,comparableCount:eligible.length,unavailableCount:view.countries.length-eligible.length,unchangedCount:eligible.filter(c=>score(c).numerator===0n).length,qualifiedCount:eligible.filter(c=>c.comparison.current.coverage.qualified||c.comparison.previous.coverage.qualified).length,exclusions};
}

/** Only displayed records cross the build/browser boundary; selection does no arithmetic. */
export function prepareDutyChanges(release:Release):PreparedDutyChanges {
  const views={} as PreparedDutyChanges['views'];
  let identity:Identity|undefined;
  for(const period of ['rolling','monthly'] as const){
    const {countries,...view}=buildDutyChangesView(release,period),{productCode,title,reportingMonth,available,provenance,...comparisonView}=view;
    identity={productCode,title,reportingMonth,available,provenance};
    const displayed=new Set<string>(),rankings={} as Record<DutyChangeMetric,RankingRefs>;
    for(const metric of ['share','dollars'] as const){const {increases,decreases,...counts}=rankDutyChanges({...view,countries},metric);for(const country of [...increases,...decreases])displayed.add(country.code);rankings[metric]={...counts,increases:increases.map(c=>c.code),decreases:decreases.map(c=>c.code)};}
    views[period]={...comparisonView,countries:countries.filter(c=>displayed.has(c.code)),rankings};
  }
  return {...identity!,views};
}
export function selectDutyChanges(data:PreparedDutyChanges,selection:DutyChangesSelection):SelectedDutyChanges {
  if(!['rolling','monthly'].includes(selection.period)||!['share','dollars'].includes(selection.metric))throw new Error('Invalid duty changes selection');
  const {views,...identity}=data,{countries,rankings,...view}=views[selection.period],{increases,decreases,...counts}=rankings[selection.metric];
  const byCode=new Map(countries.map(c=>[c.code,c]));
  const expand=(codes:string[])=>codes.map(code=>{const record=byCode.get(code);if(!record)throw new Error('Missing prepared duty country');return record;});
  return {...identity,...view,selection:{...selection},ranking:{...counts,increases:expand(increases),decreases:expand(decreases)}};
}
