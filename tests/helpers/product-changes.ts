import {sampleRelease} from './release';
import type {ProductDefinition} from '../../src/lib/trade/product-registry';

export function productChangeSample(code:string,name:string,previous:number,current:number,exportsPrevious=12_000_000,exportsCurrent=36_000_000){
  const release=sampleRelease();release.productCode=code;
  for(const row of release.observations){
    row.productCode=code;row.description=`${name} official description`;
    const annual=row.direction==='imports'?(row.month.startsWith('2024')?previous:current):(row.month.startsWith('2024')?exportsPrevious:exportsCurrent);
    const monthly=Math.floor(annual/12)+(row.month.endsWith('-12')?annual%12:0),quarter=Math.floor(monthly/4);
    row.valueUsd=row.geography==='world'?monthly:row.partnerCode==='4280'?monthly-3*quarter:quarter;
  }
  const product:ProductDefinition={code,displayName:name,importable:true,published:true,dutiesAccepted:false};
  return {product,release};
}
