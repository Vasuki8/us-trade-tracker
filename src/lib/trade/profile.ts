import type {Release,ExplorerSelection,ProfileView} from './types';
import {compareValues,shiftMonth,sumWindow} from './metrics';
export function buildProfileView(release:Release,selection:ExplorerSelection):ProfileView {
  if(!['imports','exports'].includes(selection.direction)||![12,60].includes(selection.months))throw new Error('Invalid selection');
  const rows=release.observations.filter(r=>r.direction===selection.direction&&r.productCode===release.productCode);
  const world=rows.filter(r=>r.geography==='world');
  if(!world.length)throw new Error('Missing world observations');
  const end=release.reportingMonth;
  const codes=[...new Set(selection.countryCodes)];
  const countries=[...new Set(rows.filter(r=>r.geography==='country').map(r=>r.partnerCode))];
  if(codes.length>3||codes.some(c=>!countries.includes(c)))throw new Error('Choose up to three available countries');
  const interval=(month:string)=>release.classificationIntervals.findIndex(i=>i.from<=month&&month<=i.to);
  const comparable=(from:string,to:string)=>interval(from)>=0&&interval(from)===interval(to);
  const latest=world.find(r=>r.month===end)?.valueUsd??null;
  const previous=world.find(r=>r.month===shiftMonth(end,-12))?.valueUsd??null;
  const currentYear=comparable(shiftMonth(end,-11),end)?sumWindow(world,end,12):null;
  const previousYear=comparable(shiftMonth(end,-23),shiftMonth(end,-12))?sumWindow(world,shiftMonth(end,-12),12):null;
  const partners=countries.map(code=>{
    const series=rows.filter(r=>r.partnerCode===code);
    for(const row of series){
      const denominator=world.find(w=>w.month===row.month)?.valueUsd;
      if(row.valueUsd!==null&&denominator!==undefined&&denominator!==null&&row.valueUsd>denominator)throw new Error('Country exceeds world total');
    }
    const valueUsd=comparable(shiftMonth(end,-11),end)?sumWindow(series,end,12):null;
    return {code,name:series[0].partnerName,valueUsd,sharePercent:valueUsd!==null&&currentYear!==null&&currentYear>0?valueUsd/currentYear*100:null};
  }).sort((a,b)=>(b.valueUsd??-1)-(a.valueUsd??-1)||a.name.localeCompare(b.name));
  const earliest=world.map(r=>r.month).sort()[0];
  const months=Array.from({length:selection.months},(_,i)=>shiftMonth(end,i-selection.months+1)).filter(m=>m>=earliest);
  const series=(codes.length?codes:['-']).map(code=>{
    const observations=rows.filter(r=>r.partnerCode===code);
    const byMonth=new Map(observations.map(r=>[r.month,r]));
    return {code,name:code==='-'?'All partner countries':observations[0].partnerName,
      points:months.map((month,index)=>({month,valueUsd:byMonth.get(month)?.valueUsd??null,
        classificationVerified:interval(month)>=0,
        breakBefore:index>0&&!comparable(months[index-1],month)}))};
  });
  const latestMonth=compareValues(latest,previous);
  if(!comparable(shiftMonth(end,-12),end)){latestMonth.changeUsd=null;latestMonth.changePercent=null;}
  const trailingYear=compareValues(currentYear,previousYear);
  if(!comparable(shiftMonth(end,-23),end)){trailingYear.changeUsd=null;trailingYear.changePercent=null;}
  return {productCode:release.productCode,title:world[0].description,selection:{...selection,countryCodes:codes},reportingMonth:end,
    latestMonth,trailingYear,partners,series,provenance:{source:release.source,
      measure:selection.direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO',retrievedAt:release.retrievedAt,
      codeVersion:release.codeVersion,sourceUrls:release.sourceUrls,revised:release.revisedKeys.length>0}};
}
