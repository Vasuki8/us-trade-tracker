import type {Release,ValueStatus} from './types';
import type {DutyView,DutyObservation,DutyPeriod,DutyComparison,DutyRevisionInput} from './duty-types';
import {shiftMonth} from './metrics';import {validMonth} from './normalize';
const measures=['calculatedDuty','consumptionValue','dutiableValue'] as const;
function safeSum(values:number[]):number{let sum=0;for(const value of values){sum+=value;if(!Number.isSafeInteger(sum))throw new Error('Duty total exceeds safe precision');}return sum;}
export function buildDutyView(release:Release,partnerCodes:string[]):DutyView{
  const codes=[...new Set(partnerCodes)];if(codes.length>3||codes.some(code=>!/^[1-9]\d{3}$/.test(code)))throw new Error('Choose up to three partner countries');
  const metadata={productCode:release.productCode,title:release.observations.find(row=>row.direction==='imports'&&row.geography==='world')?.description??release.productCode,reportingMonth:release.reportingMonth,
    provenance:{source:release.source,retrievedAt:release.retrievedAt,codeVersion:release.codeVersion,sourceUrls:release.sourceUrls.filter(url=>url.includes('/imports/hs')),revised:release.schemaVersion===2&&release.duties.revisedKeys.length>0}};
  if(release.schemaVersion===1)return {...metadata,fromMonth:null,available:false,series:[],monthlyRecordedRevisions:[]};
  const rows=release.duties.observations,seen=new Set<string>();
  for(const row of rows){
    if(row.productCode!==release.productCode||!validMonth(row.month)||(row.geography==='world'?row.partnerCode!=='-':row.geography!=='country'||!/^[1-9]\d{3}$/.test(row.partnerCode)))throw new Error('Invalid duty series identity');
    const key=[row.month,row.geography,row.partnerCode].join('/');if(seen.has(key))throw new Error('Duplicate duty observation');seen.add(key);
    for(const measure of measures){const cell=row[measure];if(!['reported','missing','suppressed'].includes(cell.status)||(cell.status==='reported'?cell.valueUsd===null||!Number.isSafeInteger(cell.valueUsd)||cell.valueUsd<0:cell.valueUsd!==null))throw new Error('Invalid duty amount');}
    const affected=row.coverage.uncalculatedDutiableValueUsd;
    if(!['verified','unavailable'].includes(row.coverage.status)||(row.coverage.status==='verified'?(affected===null||!Number.isSafeInteger(affected)||affected<0||row.dutiableValue.valueUsd===null||affected>row.dutiableValue.valueUsd):affected!==null))throw new Error('Invalid duty coverage');
  }
  const compatible=(from:string,to:string)=>release.classificationIntervals.some(interval=>interval.from<=from&&to<=interval.to);
  const months=Array.from({length:24},(_,index)=>shiftMonth(release.reportingMonth,index-23));
  const series=(codes.length?codes:['-']).map(code=>{
    const selected=rows.filter(row=>row.partnerCode===code),byMonth=new Map(selected.map(row=>[row.month,row]));
    const period=(from:string,to:string):DutyPeriod=>{
      const observations:(DutyObservation|undefined)[]=[];for(let month=from;month<=to;month=shiftMonth(month,1))observations.push(byMonth.get(month));
      const status=(measure:typeof measures[number]):ValueStatus=>observations.every(row=>row?.[measure].status==='reported')?'reported':observations.some(row=>row?.[measure].status==='suppressed')?'suppressed':'missing';
      const statuses={calculatedDuty:status('calculatedDuty'),consumptionValue:status('consumptionValue'),dutiableValue:status('dutiableValue')};
      const amount=(measure:typeof measures[number])=>statuses[measure]==='reported'?safeSum(observations.map(row=>row![measure].valueUsd!)):null;
      const calculatedDutyUsd=amount('calculatedDuty'),consumptionValueUsd=amount('consumptionValue'),dutiableValueUsd=amount('dutiableValue');
      const coverageVerified=observations.every(row=>row?.coverage.status==='verified');
      const affectedDutiableValueUsd=coverageVerified?safeSum(observations.map(row=>row!.coverage.uncalculatedDutiableValueUsd!)):null;
      return {from,to,calculatedDutyUsd,consumptionValueUsd,dutiableValueUsd,dutySharePercent:calculatedDutyUsd!==null&&consumptionValueUsd!==null&&consumptionValueUsd>0?100*calculatedDutyUsd/consumptionValueUsd:null,statuses,
        complete:Object.values(statuses).every(status=>status==='reported'),classificationCompatible:compatible(from,to),
        coverage:{status:coverageVerified?'verified':'unavailable',affectedDutiableValueUsd,affectedSharePercent:affectedDutiableValueUsd!==null&&dutiableValueUsd!==null&&dutiableValueUsd>0?100*affectedDutiableValueUsd/dutiableValueUsd:null,qualified:affectedDutiableValueUsd!==null&&affectedDutiableValueUsd>0}};
    };
    const comparison=(current:DutyPeriod,previous:DutyPeriod):DutyComparison=>{
      const comparable=current.complete&&previous.complete&&current.coverage.status==='verified'&&previous.coverage.status==='verified'&&compatible(previous.from,current.to);
      return {current,previous,change:{comparable,calculatedDutyUsd:comparable?current.calculatedDutyUsd!-previous.calculatedDutyUsd!:null,
        growthPercent:comparable&&previous.calculatedDutyUsd!>0?100*(current.calculatedDutyUsd!-previous.calculatedDutyUsd!)/previous.calculatedDutyUsd!:null,
        dutySharePercentagePoints:comparable&&current.dutySharePercent!==null&&previous.dutySharePercent!==null?current.dutySharePercent-previous.dutySharePercent:null}};
    };
    const monthly=months.map(month=>period(month,month));const end=release.reportingMonth,priorEnd=shiftMonth(end,-12);
    return {code,name:code==='-'?'All partner countries':selected.at(-1)?.partnerName??release.observations.find(row=>row.direction==='imports'&&row.partnerCode===code)?.partnerName??code,monthly,
      latest:comparison(monthly.at(-1)!,period(priorEnd,priorEnd)),rolling:comparison(period(shiftMonth(end,-11),end),period(shiftMonth(end,-23),priorEnd))};
  });
  const revisedKeys=new Set(release.duties.revisedKeys);
  const inputOrder:DutyRevisionInput[]=['CAL_DUT_MO','CON_VAL_MO','DUT_VAL_MO','coverage'];
  const monthlyRecordedRevisions=series.flatMap(({code})=>months.flatMap(month=>{
    const prefix=`imports/${release.productCode}/${month}/${code==='-'?'world':'country'}/${code}/`;
    const inputs=inputOrder.filter(input=>revisedKeys.has(prefix+input));
    return inputs.length?[{partnerCode:code,month,inputs}]:[];
  }));
  return {...metadata,fromMonth:months[0],available:true,series,monthlyRecordedRevisions};
}
