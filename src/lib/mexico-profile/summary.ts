import type {MexicoDirectionProfile,MexicoDirectionSummary,MexicoSummaryPeriod} from './types';
const months=Array.from({length:24},(_,i)=>new Date(Date.UTC(2024,8+i,1)).toISOString().slice(0,7));
export function summarizeMexicoDirection(view:MexicoDirectionProfile):MexicoDirectionSummary {
 const imports=view.direction==='imports';
 if((!imports&&view.direction!=='exports')||view.measure!==(imports?'GEN_VAL_MO':'ALL_VAL_MO')||view.basis!==(imports?'general-imports-customs-value':'domestic-plus-foreign-exports-fas-value')||view.monthly.length!==24)throw Error('Incompatible Mexico history');
 for(let i=0;i<24;i++){const p=view.monthly[i];if(p.month!==months[i]||p.valueUsd!==null&&(!Number.isSafeInteger(p.valueUsd)||p.valueUsd<0))throw Error('Invalid Mexico month/value');}
 const period=(start:number):MexicoSummaryPeriod=>{
  const rows=view.monthly.slice(start,start+12),reported=rows.filter(p=>p.valueUsd!==null);let total=0;
  for(const p of reported){total+=p.valueUsd!;if(!Number.isSafeInteger(total))throw Error('Unsafe Mexico total');}
  return {from:rows[0].month,to:rows[11].month,reportedMonths:reported.length,totalUsd:reported.length===12?total:null};
 };
 const prior=period(0),current=period(12),changeUsd=prior.totalUsd!==null&&current.totalUsd!==null?current.totalUsd-prior.totalUsd:null;
 return {latest:{month:view.monthly[23].month,valueUsd:view.monthly[23].valueUsd},prior,current,changeUsd,growthPercent:changeUsd!==null&&prior.totalUsd!==null&&prior.totalUsd>0?changeUsd/prior.totalUsd*100:null};
}
