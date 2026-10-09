import type {Comparison,ComparisonPeriod,Direction,ProfileView,Release} from './types';
import {compareValues,shiftMonth,sumWindow} from './metrics';
import {buildProfileView} from './profile';

export type ChangeMetric = 'dollars' | 'share';
export type CountryChange = {
  code:string; name:string; currentUsd:number|null; previousUsd:number|null;
  changeUsd:number|null; changePercent:number|null;
  currentSharePercent:number|null; previousSharePercent:number|null; shareChangePoints:number|null;
};
export type ChangesView = {
  productCode:string; title:string; direction:Direction;
  periods:{current:{from:string;to:string};previous:{from:string;to:string}};
  world:Comparison; countries:CountryChange[]; classificationComparable:boolean;
  periodType?:ComparisonPeriod;
  provenance:ProfileView['provenance'];
};

export function selectCountryChanges(view:ChangesView,countryCodes:string[]):CountryChange[]{
  const countries=countryCodes.map(code=>view.countries.find(country=>country.code===code));
  if(countryCodes.length>3||new Set(countryCodes).size!==countryCodes.length||countries.some(country=>!country))throw new Error('Choose up to three available countries');
  return countries as CountryChange[];
}

export function buildMonthlyChangesView(release:Release,direction:Direction):ChangesView{
  const measure=direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO';
  const rows=release.observations.filter(row=>row.productCode===release.productCode&&row.direction===direction&&row.measure===measure);
  const worldRow=rows.find(row=>row.geography==='world');
  if(!worldRow)throw new Error('Missing world observations');
  const end=release.reportingMonth,previous=shiftMonth(end,-12);
  const periods={current:{from:end,to:end},previous:{from:previous,to:previous}};
  const classificationComparable=release.classificationIntervals.some(interval=>interval.from<=previous&&end<=interval.to);
  const byMonth=new Map(rows.map(row=>[`${row.partnerCode}/${row.month}`,row]));
  const value=(code:string,month:string)=>{const row=byMonth.get(`${code}/${month}`);return row?.status==='reported'?row.valueUsd:null;};
  const world=compareValues(value('-',end),value('-',previous));
  if(!classificationComparable){world.changeUsd=null;world.changePercent=null;}
  const partners=new Map(rows.filter(row=>row.geography==='country').map(row=>[row.partnerCode,row.partnerName]));
  const countries=[...partners].map(([code,name])=>{
    const currentUsd=value(code,end),previousUsd=value(code,previous),comparison=compareValues(currentUsd,previousUsd);
    const currentSharePercent=currentUsd!==null&&world.current!==null&&world.current>0?currentUsd/world.current*100:null;
    const previousSharePercent=previousUsd!==null&&world.previous!==null&&world.previous>0?previousUsd/world.previous*100:null;
    return {code,name,currentUsd,previousUsd,changeUsd:classificationComparable?comparison.changeUsd:null,changePercent:classificationComparable?comparison.changePercent:null,currentSharePercent,previousSharePercent,
      shareChangePoints:classificationComparable&&currentSharePercent!==null&&previousSharePercent!==null?Number(shareNumerator(currentUsd!,previousUsd!,world))/Number(BigInt(world.current!)*BigInt(world.previous!))*100:null};
  });
  return {productCode:release.productCode,title:worldRow.description,direction,periodType:'monthly',periods,world,countries,classificationComparable,
    provenance:{source:release.source,measure,retrievedAt:release.retrievedAt,codeVersion:release.codeVersion,sourceUrls:release.sourceUrls,revised:release.revisedKeys.length>0}};
}

// Each share difference has the same denominator within a view. Integer cross-products
// preserve exact ties and signs even when decimal share subtraction loses precision.
const shareNumerator=(current:number,previous:number,world:Comparison)=>BigInt(current)*BigInt(world.previous!)-BigInt(previous)*BigInt(world.current!);

export function buildChangesView(release:Release,direction:Direction):ChangesView {
  const profile=buildProfileView(release,{direction,months:12,countryCodes:[]});
  const end=release.reportingMonth;
  const periods={current:{from:shiftMonth(end,-11),to:end},previous:{from:shiftMonth(end,-23),to:shiftMonth(end,-12)}};
  const verifiedSpan=(from:string,to:string)=>release.classificationIntervals.some(interval=>interval.from<=from&&to<=interval.to);
  const classificationComparable=verifiedSpan(periods.previous.from,periods.current.to);
  const previousVerified=verifiedSpan(periods.previous.from,periods.previous.to);
  const rows=release.observations.filter(row=>row.productCode===release.productCode&&row.direction===direction&&row.measure===(direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO')&&row.geography==='country');
  const countries=profile.partners.map(partner=>{
    const previousUsd=previousVerified?sumWindow(rows.filter(row=>row.partnerCode===partner.code),periods.previous.to,12):null;
    const comparison=compareValues(partner.valueUsd,previousUsd);
    const previousSharePercent=previousUsd!==null&&profile.trailingYear.previous!==null&&profile.trailingYear.previous>0?previousUsd/profile.trailingYear.previous*100:null;
    return {code:partner.code,name:partner.name,currentUsd:partner.valueUsd,previousUsd,
      changeUsd:classificationComparable?comparison.changeUsd:null,
      changePercent:classificationComparable?comparison.changePercent:null,
      currentSharePercent:partner.sharePercent,previousSharePercent,
      shareChangePoints:classificationComparable&&partner.sharePercent!==null&&previousSharePercent!==null?
        Number(shareNumerator(partner.valueUsd!,previousUsd!,profile.trailingYear))/Number(BigInt(profile.trailingYear.current!)*BigInt(profile.trailingYear.previous!))*100:null};
  });
  return {productCode:release.productCode,title:profile.title,direction,periods,world:profile.trailingYear,countries,classificationComparable,provenance:profile.provenance};
}

export function rankChanges(view:ChangesView,metric:ChangeMetric) {
  if(metric!=='dollars'&&metric!=='share')throw new Error('Invalid change metric');
  const score=(country:CountryChange)=>metric==='dollars'?(country.changeUsd===null?null:BigInt(country.changeUsd)):
    country.shareChangePoints===null?null:shareNumerator(country.currentUsd!,country.previousUsd!,view.world);
  const tie=(a:CountryChange,b:CountryChange)=>a.name.localeCompare(b.name)||a.code.localeCompare(b.code);
  const scored=view.countries.map(country=>({country,score:score(country)}));
  const compare=(a:typeof scored[number],b:typeof scored[number])=>a.score!<b.score!?-1:a.score!>b.score!?1:0;
  const increases=scored.filter(row=>row.score!==null&&row.score>0n).sort((a,b)=>compare(b,a)||tie(a.country,b.country));
  const decreases=scored.filter(row=>row.score!==null&&row.score<0n).sort((a,b)=>compare(a,b)||tie(a.country,b.country));
  return {increases:increases.slice(0,10).map(row=>row.country),decreases:decreases.slice(0,10).map(row=>row.country),
    unavailableCount:scored.filter(row=>row.score===null).length,
    unchangedCount:scored.filter(row=>row.score===0n).length};
}
