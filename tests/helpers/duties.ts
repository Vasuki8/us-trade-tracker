import type {DutyDataset,DutyObservation} from '../../src/lib/trade/duty-types';
import {sampleRelease} from './release';
import {syntheticCensusFetch} from './archive';
import hs from '../fixtures/census-duty-hs.json';
import hscy from '../fixtures/census-duty-hscy.json';
import hsrp from '../fixtures/census-duty-hsrp.json';
import hscyrp from '../fixtures/census-duty-hscyrp.json';
const tables={HS:hs,HSCY:hscy,HSRP:hsrp,HSCYRP:hscyrp};
export function syntheticDutyFetch():typeof fetch{
  const merchandise=syntheticCensusFetch();
  return (async(input:RequestInfo|URL,init?:RequestInit)=>{
    const url=new URL(String(input));if(!url.searchParams.get('get')?.includes('CAL_DUT_MO'))return merchandise(input,init);
    const table=structuredClone(tables[url.searchParams.get('SUMMARY_LVL2') as keyof typeof tables]);
    for(const row of table.slice(1))row[table[0].indexOf('time')]=url.searchParams.get('time')!;
    return Response.json(table);
  }) as typeof fetch;
}
// Clearly synthetic unequal monthly denominators: world rolling shares are 5% and 7.5%.
export function sampleDutyDataset():DutyDataset{
  const observations:DutyObservation[]=[];
  for(let year=2024;year<=2025;year++)for(let month=1;month<=12;month++){
    const current=year===2025,first=month===1;
    const duty=current?(first?19:1):(first?10:0),consumption=current?(first?180:20):(first?90:10);
    observations.push({productCode:'090121',month:`${year}-${String(month).padStart(2,'0')}`,geography:'world',partnerCode:'-',partnerName:'TOTAL FOR ALL COUNTRIES',calculatedDuty:{valueUsd:duty,status:'reported'},consumptionValue:{valueUsd:consumption,status:'reported'},dutiableValue:{valueUsd:consumption,status:'reported'},coverage:{status:'verified',uncalculatedDutiableValueUsd:0}});
  }
  return {schemaVersion:1,fromMonth:'2024-01',observations,revisedKeys:[]};
}
export function sampleDutyRelease(){return {...sampleRelease(),schemaVersion:2 as const,duties:sampleDutyDataset()};}
