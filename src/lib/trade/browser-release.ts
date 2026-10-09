import type {Observation,Release,ReleaseV1} from './types';
import type {DutyDataset,DutyMoney,DutyObservation} from './duty-types';

// Internal page transport only: canonical releases and archives keep their schema.
// Dollar cells are nonnegative safe integers; -1 means missing, -2 suppressed.
// Coverage uses nonnegative affected dollars, or -1 for unavailable.
type Partner=[Observation['geography'],string,string];
type TradeRow=[number,0|1,number,number,number]; // description, direction, month, partner, money
type DutyRow=[number,number,number,number,number,number]; // month, partner, three money cells, coverage
type Metadata=Omit<ReleaseV1,'schemaVersion'|'observations'>&{schemaVersion:1|2};
type WireRelease={
  version:1;metadata:Metadata;months:string[];partners:Partner[];descriptions:string[];observations:TradeRow[];
  duties?:Omit<DutyDataset,'observations'>&{observations:DutyRow[]};
};
const invalid=():never=>{throw new Error('Invalid browser release payload');};
const dollars=(value:unknown):value is number=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0;
function encodeMoney(cell:DutyMoney):number{
  if(cell.status==='reported'&&dollars(cell.valueUsd))return cell.valueUsd;
  if(cell.valueUsd===null&&cell.status==='missing')return -1;
  if(cell.valueUsd===null&&cell.status==='suppressed')return -2;
  return invalid();
}
function decodeMoney(value:unknown):DutyMoney{
  if(dollars(value))return {valueUsd:value,status:'reported'};
  if(value===-1)return {valueUsd:null,status:'missing'};
  if(value===-2)return {valueUsd:null,status:'suppressed'};
  return invalid();
}
function dictionary<T>(key:(value:T)=>string){
  const values:T[]=[],indices=new Map<string,number>();
  return {values,index(value:T){const identity=key(value),existing=indices.get(identity);if(existing!==undefined)return existing;
    const index=values.length;values.push(value);indices.set(identity,index);return index;}};
}

export function encodeBrowserRelease(release:Release):string{
  const {observations,...rest}=release;
  const {duties,...metadata}=rest as Metadata&{duties?:DutyDataset};
  if(metadata.schemaVersion!==1&&metadata.schemaVersion!==2)return invalid();
  const months=dictionary<string>(value=>value),descriptions=dictionary<string>(value=>value),partners=dictionary<Partner>(JSON.stringify);
  const product=(code:string)=>{if(code!==release.productCode)invalid();};
  const wire:WireRelease={version:1,metadata,months:months.values,partners:partners.values,descriptions:descriptions.values,
    observations:observations.map(row=>{
      product(row.productCode);
      if(row.direction!=='imports'&&row.direction!=='exports'||row.measure!==(row.direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO'))invalid();
      return [descriptions.index(row.description),row.direction==='imports'?0:1,months.index(row.month),partners.index([row.geography,row.partnerCode,row.partnerName]),encodeMoney(row)];
    })};
  if(release.schemaVersion===2){
    if(!duties)return invalid();
    const {observations,...dutyMetadata}=duties;
    wire.duties={...dutyMetadata,observations:observations.map(row=>{
      product(row.productCode);
      const affected=row.coverage.uncalculatedDutiableValueUsd;
      if(row.coverage.status==='verified'?!dollars(affected):row.coverage.status!=='unavailable'||affected!==null)invalid();
      return [months.index(row.month),partners.index([row.geography,row.partnerCode,row.partnerName]),encodeMoney(row.calculatedDuty),encodeMoney(row.consumptionValue),encodeMoney(row.dutiableValue),row.coverage.status==='verified'?affected!:-1];
    })};
  }else if(duties!==undefined)invalid();
  // A single JSON string avoids Astro's per-cell serialization tags as well as
  // repeating object keys. Encoding happens once at build time, decoding once per island.
  return JSON.stringify(wire);
}

export function decodeBrowserRelease(payload:string):Release{
  let wire:WireRelease;try{wire=JSON.parse(payload);}catch{return invalid();}
  if(!wire||wire.version!==1||!wire.metadata||![1,2].includes(wire.metadata.schemaVersion)||
    !Array.isArray(wire.months)||wire.months.some(month=>typeof month!=='string')||
    !Array.isArray(wire.descriptions)||wire.descriptions.some(description=>typeof description!=='string')||
    !Array.isArray(wire.partners)||wire.partners.some(partner=>!Array.isArray(partner)||partner.length!==3||!['world','country'].includes(partner[0])||typeof partner[1]!=='string'||typeof partner[2]!=='string')||
    !Array.isArray(wire.observations))return invalid();
  const at=<T>(values:T[],index:unknown):T=>{
    if(typeof index!=='number'||!Number.isInteger(index)||index<0||index>=values.length)return invalid();return values[index];
  };
  const partner=(index:unknown)=>{const [geography,partnerCode,partnerName]=at(wire.partners,index);return {geography,partnerCode,partnerName};};
  const observations:Observation[]=wire.observations.map(row=>{
    if(!Array.isArray(row)||row.length!==5||(row[1]!==0&&row[1]!==1))return invalid();
    const direction=row[1]===0?'imports':'exports';
    return {productCode:wire.metadata.productCode,description:at(wire.descriptions,row[0]),direction,month:at(wire.months,row[2]),...partner(row[3]),
      measure:direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO',...decodeMoney(row[4])};
  });
  if(wire.metadata.schemaVersion===1){if(wire.duties!==undefined)return invalid();return {...wire.metadata,schemaVersion:1,observations};}
  if(!wire.duties||wire.duties.schemaVersion!==1||!Array.isArray(wire.duties.observations))return invalid();
  const {observations:rows,...dutyMetadata}=wire.duties;
  const dutyObservations:DutyObservation[]=rows.map(row=>{
    if(!Array.isArray(row)||row.length!==6||!(dollars(row[5])||row[5]===-1))return invalid();
    return {productCode:wire.metadata.productCode,month:at(wire.months,row[0]),...partner(row[1]),
      calculatedDuty:decodeMoney(row[2]),consumptionValue:decodeMoney(row[3]),dutiableValue:decodeMoney(row[4]),
      coverage:row[5]===-1?{status:'unavailable',uncalculatedDutiableValueUsd:null}:{status:'verified',uncalculatedDutiableValueUsd:row[5]}};
  });
  return {...wire.metadata,schemaVersion:2,observations,duties:{...dutyMetadata,observations:dutyObservations}};
}
