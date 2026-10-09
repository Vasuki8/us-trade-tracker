import type {Release} from './types';
import {observationKey} from './normalize';
import type {DutyDataset} from './duty-types';
export function findRevisedKeys(previous:Release|undefined,next:Release):string[]{
  if(!previous)return [];
  const oldByKey=new Map(previous.observations.map(r=>[observationKey(r),r]));
  const newByKey=new Map(next.observations.map(r=>[observationKey(r),r]));
  const overlapFrom=[previous.observations.map(r=>r.month).sort()[0],next.observations.map(r=>r.month).sort()[0]].sort().at(-1)!;
  const overlapTo=previous.reportingMonth<next.reportingMonth?previous.reportingMonth:next.reportingMonth;
  return [...new Set([...oldByKey.keys(),...newByKey.keys()])].filter(key=>{
    const old=oldByKey.get(key),row=newByKey.get(key);const month=(old??row)!.month;
    return month>=overlapFrom&&month<=overlapTo&&(!old||!row||old.valueUsd!==row.valueUsd||old.status!==row.status);
  });
}
export function findDutyRevisedKeys(previous:DutyDataset|undefined,next:DutyDataset):string[]{
  if(!previous)return [];
  const byKey=(data:DutyDataset)=>new Map(data.observations.map(row=>[[row.productCode,row.month,row.geography,row.partnerCode].join('/'),row]));
  const oldByKey=byKey(previous),newByKey=byKey(next);
  const from=previous.fromMonth>next.fromMonth?previous.fromMonth:next.fromMonth;
  const last=(data:DutyDataset)=>data.observations.map(row=>row.month).sort().at(-1)!;
  const to=last(previous)<last(next)?last(previous):last(next);
  const measures={calculatedDuty:'CAL_DUT_MO',consumptionValue:'CON_VAL_MO',dutiableValue:'DUT_VAL_MO'} as const;
  const revisions:string[]=[];
  for(const key of new Set([...oldByKey.keys(),...newByKey.keys()])){
    const old=oldByKey.get(key),row=newByKey.get(key);const identity=(old??row)!;
    if(identity.month<from||identity.month>to)continue;
    const prefix=['imports',identity.productCode,identity.month,identity.geography,identity.partnerCode].join('/');
    for(const property of Object.keys(measures) as (keyof typeof measures)[]){
      if(!old||!row||old[property].valueUsd!==row[property].valueUsd||old[property].status!==row[property].status)revisions.push(`${prefix}/${measures[property]}`);
    }
    if(!old||!row||old.coverage.status!==row.coverage.status||old.coverage.uncalculatedDutiableValueUsd!==row.coverage.uncalculatedDutiableValueUsd)revisions.push(`${prefix}/coverage`);
  }
  return revisions.sort();
}
