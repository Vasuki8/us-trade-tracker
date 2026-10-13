import {sampleRelease} from './release';
import type {ReleaseV2} from '../../src/lib/trade/types';
import type {ProductDefinition} from '../../src/lib/trade/product-registry';
export function portfolioSample(code='090121',name='Roasted coffee'){
  const base=sampleRelease();
  base.productCode=code;
  for(const row of base.observations){
    row.productCode=code;
    const current=row.month.startsWith('2025');
    if(row.geography==='country')row.valueUsd=row.partnerCode==='1220'?(current?40:10):row.partnerCode==='4759'?(current?10:20):(current?25:10);
  }
  const release:ReleaseV2={...base,schemaVersion:2,duties:{schemaVersion:1,fromMonth:'2024-01',revisedKeys:[],observations:base.observations.filter(r=>r.direction==='imports').map(row=>{
    const current=row.month.startsWith('2025'),world=row.geography==='world';
    return {productCode:code,month:row.month,geography:row.geography,partnerCode:row.partnerCode,partnerName:row.partnerName,
      calculatedDuty:{valueUsd:world?(current?12:2):1,status:'reported'},consumptionValue:{valueUsd:world?(current?80:20):10,status:'reported'},dutiableValue:{valueUsd:world?40:10,status:'reported'},coverage:{status:'verified',uncalculatedDutiableValueUsd:world&&current?2:0}};
  })}};
  const product:ProductDefinition={code,displayName:name,published:true,importable:true,dutiesAccepted:true};
  return {product,release};
}
