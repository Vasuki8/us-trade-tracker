import type {DutyDataset,DutyMoney} from './duty-types';
import type {Release} from './types';
import {validMonth} from './normalize';
import {shiftMonth} from './metrics';
export function validateDutyDataset(value:unknown,release:Pick<Release,'productCode'|'reportingMonth'|'classificationIntervals'>,requireCensus=false):asserts value is DutyDataset{
  if(!value||typeof value!=='object')throw new Error('Invalid duty dataset');const data=value as DutyDataset;
  if(data.schemaVersion!==1||data.fromMonth!==shiftMonth(release.reportingMonth,-23)||!Array.isArray(data.observations)||!data.observations.length||!Array.isArray(data.revisedKeys)||data.revisedKeys.some(key=>typeof key!=='string'))throw new Error('Invalid duty dataset window or arrays');
  const moneyKeys=['calculatedDuty','consumptionValue','dutiableValue'] as const;
  const validMoney=(value:unknown):value is DutyMoney=>{
    if(!value||typeof value!=='object')return false;const cell=value as DutyMoney;
    return ['reported','missing','suppressed'].includes(cell.status)&&(cell.status==='reported'?Number.isSafeInteger(cell.valueUsd)&&cell.valueUsd!==null&&cell.valueUsd>=0:cell.valueUsd===null);
  };
  const seen=new Set<string>();
  for(const row of data.observations){
    if(!row||row.productCode!==release.productCode||!validMonth(row.month)||row.month<data.fromMonth||row.month>release.reportingMonth||!['world','country'].includes(row.geography)||typeof row.partnerCode!=='string'||(row.geography==='world'?row.partnerCode!=='-':!/^[1-9]\d{3}$/.test(row.partnerCode))||typeof row.partnerName!=='string'||!row.partnerName||moneyKeys.some(key=>!validMoney(row[key])))throw new Error('Invalid duty observation');
    const key=[row.productCode,row.month,row.geography,row.partnerCode].join('/');if(seen.has(key))throw new Error('Duplicate duty observation');seen.add(key);
    if(!row.coverage||!['verified','unavailable'].includes(row.coverage.status))throw new Error('Invalid duty coverage');
    const affected=row.coverage.uncalculatedDutiableValueUsd;
    if(row.coverage.status==='verified'?(moneyKeys.some(key=>row[key].status!=='reported')||!Number.isSafeInteger(affected)||affected===null||affected<0||affected>row.dutiableValue.valueUsd!):affected!==null)throw new Error('Invalid duty coverage amounts');
  }
  if(requireCensus&&!release.classificationIntervals.some(interval=>interval.from<=data.fromMonth&&release.reportingMonth<=interval.to))throw new Error('Duty classification continuity is unverified or incompatible');
  for(let month=data.fromMonth;month<=release.reportingMonth;month=shiftMonth(month,1)){
    const world=data.observations.find(row=>row.month===month&&row.geography==='world');
    if(!world||(requireCensus&&(world.coverage.status!=='verified'||moneyKeys.some(key=>world[key].status!=='reported'))))throw new Error('Incomplete national duty window');
    const countries=data.observations.filter(row=>row.month===month&&row.geography==='country');
    for(const key of moneyKeys){
      if(countries.some(row=>row[key].valueUsd!==null&&world[key].valueUsd!==null&&row[key].valueUsd!>world[key].valueUsd!))throw new Error('Country duty measure exceeds national total');
      if(requireCensus&&world[key].valueUsd!==null&&countries.every(row=>row[key].valueUsd!==null)){
        const total=countries.reduce((sum,row)=>sum+row[key].valueUsd!,0);
        if(!Number.isSafeInteger(total)||total!==world[key].valueUsd)throw new Error('Country duty totals do not reconcile');
      }
    }
  }
}
