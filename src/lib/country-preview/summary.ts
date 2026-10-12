import type {CountryTotalPoint,CountryPeriodSummary,CountryTotalSummary} from './types';
const months=Array.from({length:24},(_,i)=>new Date(Date.UTC(2024,8+i)).toISOString().slice(0,7));
export function buildCountryTotalSummary(points:readonly CountryTotalPoint[]):CountryTotalSummary{
  const values=new Map<string,number|null>();
  for(const p of points){if(!months.includes(p.month)||values.has(p.month)||(p.valueUsd!==null&&(!Number.isSafeInteger(p.valueUsd)||p.valueUsd<0)))throw new Error('Invalid country summary input');values.set(p.month,p.valueUsd);}
  function period(from:string,to:string):CountryPeriodSummary{
    const selected=months.filter(m=>m>=from&&m<=to),reported=selected.filter(m=>values.get(m)!==undefined&&values.get(m)!==null);
    let sum=0;for(const m of reported){sum+=values.get(m)!;if(!Number.isSafeInteger(sum))throw new Error('Unsafe country period total');}
    return {from,to,reportedMonths:reported.length,totalUsd:reported.length===12?sum:null};
  }
  const prior=period('2024-09','2025-08'),current=period('2025-09','2026-08'),changeUsd=prior.totalUsd!==null&&current.totalUsd!==null?current.totalUsd-prior.totalUsd:null;
  if(changeUsd!==null&&!Number.isSafeInteger(changeUsd))throw new Error('Unsafe country change');
  return {latestMonth:'2026-08',latestUsd:values.get('2026-08')??null,current,prior,changeUsd,growthPercent:changeUsd!==null&&prior.totalUsd!>0?100*changeUsd/prior.totalUsd!:null};
}
