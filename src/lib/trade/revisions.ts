import type {Release} from './types';
import {observationKey} from './normalize';
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
