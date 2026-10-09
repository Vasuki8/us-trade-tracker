import type {DutyMoney,DutyObservation,DutyRawPart,DutySummary} from './duty-types';
import {validMonth} from './normalize';
const fields={calculatedDuty:'CAL_DUT_MO',consumptionValue:'CON_VAL_MO',dutiableValue:'DUT_VAL_MO'} as const;
const moneyKeys=Object.keys(fields) as (keyof typeof fields)[];
type Component=Pick<DutyObservation,'calculatedDuty'|'consumptionValue'|'dutiableValue'> & {partnerCode:string;rp:string};
function money(value:unknown):DutyMoney{
  if(value===null||value===''||value==='null')return {valueUsd:null,status:'missing'};
  if(typeof value!=='string'||!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value)))throw new Error('Invalid duty dollar value');
  return {valueUsd:Number(value),status:'reported'};
}
function sum(values:number[]):number{const result=values.reduce((total,value)=>total+value,0);if(!Number.isSafeInteger(result))throw new Error('Duty total exceeds safe dollar range');return result;}
export function normalizeDutyMonth(parts:DutyRawPart[],context:{productCode:string;month:string}):DutyObservation[]{
  if(!/^\d{6}$/.test(context.productCode)||!validMonth(context.month))throw new Error('Invalid duty context');
  const summaries:DutySummary[]=['HS','HSCY','HSRP','HSCYRP'];
  if(parts.length!==4||new Set(parts.map(part=>part.summary)).size!==4||parts.some(part=>!summaries.includes(part.summary)))throw new Error('Incomplete duty response set');
  const totals=new Map<string,DutyObservation>();const components=new Map<string,Component[]>();const seen=new Set<string>();
  for(const part of parts){
    if(part.httpStatus===204){if(part.payload!==null||part.summary==='HS')throw new Error('Missing world duty total or invalid empty response');continue;}
    if(part.httpStatus!==200||!Array.isArray(part.payload)||!Array.isArray(part.payload[0]))throw new Error('Invalid duty table');
    const [headers,...rows]=part.payload as unknown[][];
    if(headers.some(header=>typeof header!=='string')||new Set(headers).size!==headers.length)throw new Error('Invalid duty headers');
    const required=['I_COMMODITY','I_COMMODITY_LDESC','CTY_CODE','CTY_NAME','time','COMM_LVL','SUMMARY_LVL','SUMMARY_LVL2','RP',...Object.values(fields)];
    if(required.some(field=>!headers.includes(field)))throw new Error('Missing duty field');
    for(const cells of rows){
      if(!Array.isArray(cells)||cells.length!==headers.length)throw new Error('Incomplete duty row');
      const row=Object.fromEntries(headers.map((header,index)=>[String(header),cells[index]]));
      if(required.filter(field=>!Object.values(fields).includes(field as typeof fields[keyof typeof fields])).some(field=>typeof row[field]!=='string'||row[field]===''))throw new Error('Invalid duty dimension');
      if(row.SUMMARY_LVL==='CGP')continue;
      if(row.SUMMARY_LVL!=='DET'||row.SUMMARY_LVL2!==part.summary||row.COMM_LVL!=='HS6'||row.I_COMMODITY!==context.productCode||row.time!==context.month)throw new Error('Unexpected duty product, month or aggregation');
      if(['DISTRICT','CTY_SUBCODE','DF'].some(field=>field in row&&row[field]!=='-'))throw new Error('Unexpected duty dimensions');
      const partnerCode=String(row.CTY_CODE),partnerName=String(row.CTY_NAME),rp=String(row.RP);
      const country=part.summary.includes('CY'),breakdown=part.summary.endsWith('RP');
      if(country?!/^[1-9]\d{3}$/.test(partnerCode):partnerCode!=='-')throw new Error('Wrong duty country aggregation');
      if(breakdown?!/^\d{2}$/.test(rp):rp!=='-')throw new Error('Wrong rate-provision aggregation');
      const key=[part.summary,partnerCode,rp].join('/');if(seen.has(key))throw new Error('Duplicate duty dimension');seen.add(key);
      const amounts={calculatedDuty:money(row.CAL_DUT_MO),consumptionValue:money(row.CON_VAL_MO),dutiableValue:money(row.DUT_VAL_MO)};
      if(breakdown){const list=components.get(partnerCode)??[];list.push({...amounts,partnerCode,rp});components.set(partnerCode,list);}
      else totals.set(partnerCode,{...amounts,productCode:context.productCode,month:context.month,geography:country?'country':'world',partnerCode,partnerName,coverage:{status:'unavailable',uncalculatedDutiableValueUsd:null}});
    }
  }
  if(!totals.has('-'))throw new Error('Missing world duty total');
  for(const code of components.keys())if(!totals.has(code))throw new Error('Orphan rate-provision records without a country total');
  for(const total of totals.values()){
    const rows=components.get(total.partnerCode);
    if(!rows?.length)continue;
    for(const key of moneyKeys){
      if(total[key].valueUsd===null||rows.some(row=>row[key].valueUsd===null))continue;
      const breakdown=sum(rows.map(row=>row[key].valueUsd!));
      if(breakdown!==total[key].valueUsd)throw new Error(`Duty rate-provision breakdown does not reconcile: product=${context.productCode}, month=${context.month}, partner=${total.partnerCode}, measure=${fields[key]}, total=${total[key].valueUsd} USD, breakdown=${breakdown} USD`);
    }
    if(moneyKeys.some(key=>total[key].valueUsd===null||rows.some(row=>row[key].valueUsd===null)))continue;
    total.coverage={status:'verified',uncalculatedDutiableValueUsd:sum(rows.filter(row=>row.rp==='70'||row.rp==='79').map(row=>row.dutiableValue.valueUsd!))};
  }
  const world=totals.get('-')!;const countries=[...totals.values()].filter(row=>row.geography==='country');
  const national=components.get('-');const countryRows=[...components.entries()].filter(([code])=>code!=='-').flatMap(([,rows])=>rows);
  for(const key of moneyKeys){
    if(!national?.length||world[key].valueUsd===null||countries.some(row=>row[key].valueUsd===null||!components.get(row.partnerCode)?.length)||[...national,...countryRows].some(row=>row[key].valueUsd===null))continue;
    if(sum(countries.map(row=>row[key].valueUsd!))!==world[key].valueUsd)continue; // The audit reports country-total mismatches separately.
    for(const rp of new Set([...national,...countryRows].map(row=>row.rp))){
      const nationalTotal=sum(national.filter(row=>row.rp===rp).map(row=>row[key].valueUsd!)),countryTotal=sum(countryRows.filter(row=>row.rp===rp).map(row=>row[key].valueUsd!));
      if(nationalTotal!==countryTotal)throw new Error(`Country rate-provision breakdown does not reconcile with national breakdown: product=${context.productCode}, month=${context.month}, partner=-, measure=${fields[key]}, RP=${rp}, national=${nationalTotal} USD, countries=${countryTotal} USD`);
    }
  }
  return [...totals.values()].sort((a,b)=>a.partnerCode.localeCompare(b.partnerCode));
}
