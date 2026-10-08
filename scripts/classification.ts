import type {Release} from '../src/lib/trade/types';
import {validMonth} from '../src/lib/trade/normalize';
type Intervals=Release['classificationIntervals'];
export function validateClassificationIntervals(value:unknown,reportingMonth?:string):asserts value is Intervals {
  if(!Array.isArray(value))throw new Error('Invalid classification intervals');
  for(const interval of value){
    if(!interval||!validMonth(interval.from)||!validMonth(interval.to)||interval.from>interval.to||(reportingMonth&&interval.to>reportingMonth)||typeof interval.evidenceUrl!=='string'||new URL(interval.evidenceUrl).protocol!=='https:')throw new Error('Invalid classification intervals');
  }
  const sorted=[...value].sort((a,b)=>a.from.localeCompare(b.from));
  if(sorted.some((interval,i)=>i>0&&sorted[i-1].to>=interval.from))throw new Error('Invalid classification intervals');
}
export function classificationThrough(value:unknown,end:string):Intervals {
  if(!validMonth(end))throw new Error('Invalid reporting month');
  validateClassificationIntervals(value);
  return value.filter(interval=>interval.from<=end).map(interval=>({...interval,to:interval.to>end?end:interval.to}));
}
