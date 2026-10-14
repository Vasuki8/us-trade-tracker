import {sampleRelease} from './release';
import type {ReleaseV2} from '../../src/lib/trade/types';
import type {DutyObservation} from '../../src/lib/trade/duty-types';

/** Literal sample: consumption differs from general merchandise imports. */
export function dutyChangesRelease():ReleaseV2 {
  const observations:DutyObservation[]=[];
  for(let year=2024;year<=2025;year++)for(let month=1;month<=12;month++) {
    const current=year===2025;
    for(const [code,name,cal,con] of [
      ['-','World',current?7:6,current?40:20],
      ['1220','Canada',current?6:1,current?20:10],
      ['4759','Italy',current?1:5,current?20:10],
    ] as const) observations.push({productCode:'090121',month:`${year}-${String(month).padStart(2,'0')}`,geography:code==='-'?'world':'country',partnerCode:code,partnerName:name,
      calculatedDuty:{valueUsd:cal,status:'reported'},consumptionValue:{valueUsd:con,status:'reported'},dutiableValue:{valueUsd:con,status:'reported'},coverage:{status:'verified',uncalculatedDutiableValueUsd:0}});
  }
  return {...sampleRelease(),schemaVersion:2,duties:{schemaVersion:1,fromMonth:'2024-01',observations,revisedKeys:[]}};
}

export function setDutyAmounts(release:ReleaseV2,code:string,current:[number,number],previous:[number,number]) {
  for(const row of release.duties.observations.filter(row=>row.partnerCode===code)) {
    const [cal,con]=row.month.startsWith('2025')?current:previous;
    row.calculatedDuty.valueUsd=cal;row.consumptionValue.valueUsd=con;row.dutiableValue.valueUsd=con;
  }
}
