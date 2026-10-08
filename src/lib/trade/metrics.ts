import type {Comparison,Observation} from './types';
import {validMonth} from './normalize';
export function compareValues(current:number|null,previous:number|null): Comparison {
  for (const value of [current,previous]) if(value!==null&&(!Number.isSafeInteger(value)||value<0)) throw new Error('Invalid comparison value');
  return {current,previous,changeUsd:current!==null&&previous!==null?current-previous:null,
    changePercent:current!==null&&previous!==null&&previous>0?(current-previous)/previous*100:null};
}
export function shiftMonth(month:string,offset:number):string {
  if(!validMonth(month)||!Number.isInteger(offset)) throw new Error('Invalid month');
  const [year,m]=month.split('-').map(Number);
  const date=new Date(Date.UTC(year,m-1+offset,1));
  const result=date.toISOString().slice(0,7);
  if(!validMonth(result)) throw new Error('Month outside supported range');
  return result;
}
export function sumWindow(observations:Observation[],end:string,months:12):number|null {
  if(months!==12||!validMonth(end)) throw new Error('Invalid window');
  const identity=(r:Observation)=>[r.direction,r.productCode,r.partnerCode,r.geography,r.measure].join('/');
  if(new Set(observations.map(identity)).size>1) throw new Error('Mixed observation series');
  const byMonth=new Map<string,Observation>();
  for(const row of observations){
    if(!validMonth(row.month)||byMonth.has(row.month)) throw new Error('Duplicate or invalid month');
    byMonth.set(row.month,row);
  }
  let sum=0;
  for(let offset=1-months;offset<=0;offset++){
    const row=byMonth.get(shiftMonth(end,offset));
    if(!row||row.status!=='reported'||row.valueUsd===null)return null;
    if(!Number.isSafeInteger(row.valueUsd)||row.valueUsd<0)throw new Error('Invalid value');
    sum+=row.valueUsd;
    if(!Number.isSafeInteger(sum))throw new Error('Total exceeds safe precision');
  }
  return sum;
}
