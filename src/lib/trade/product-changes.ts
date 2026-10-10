import type {Comparison,Direction,ProfileView,Release} from './types';
import type {ProductDefinition} from './product-registry';
import {buildChangesView} from './changes';
import {shiftMonth} from './metrics';

export type ProductChangeMetric='dollars'|'growth';
export type ProductChangeAvailability='available'|'reporting_month_mismatch'|'classification_unverified'|'incomplete_period';
export type ProductChange={code:string;name:string;title:string;reportingMonth:string;comparison:Comparison;availability:ProductChangeAvailability;provenance:ProfileView['provenance']};
export type ProductChangesView={direction:Direction;reportingMonth:string;periods:{current:{from:string;to:string};previous:{from:string;to:string}};products:ProductChange[]};
export const PRODUCT_GROWTH_THRESHOLD_USD=10_000_000;
export function buildProductChangesView(profiles:{product:ProductDefinition;release:Release}[],direction:Direction):ProductChangesView{
  if(profiles.length===0)throw new Error('No published products');
  if(direction!=='imports'&&direction!=='exports')throw new Error('Invalid trade direction');
  if(new Set(profiles.map(({product})=>product.code)).size!==profiles.length)throw new Error('Duplicate product');
  const reportingMonth=profiles.map(({release})=>release.reportingMonth).toSorted().at(-1)!;
  const periods={current:{from:shiftMonth(reportingMonth,-11),to:reportingMonth},previous:{from:shiftMonth(reportingMonth,-23),to:shiftMonth(reportingMonth,-12)}};
  const products=profiles.map(({product,release}):ProductChange=>{
    if(product.code!==release.productCode)throw new Error('Product identity differs');
    const view=buildChangesView(release,direction);
    const availability:ProductChangeAvailability=release.reportingMonth!==reportingMonth?'reporting_month_mismatch':!view.classificationComparable?'classification_unverified':view.world.current===null||view.world.previous===null?'incomplete_period':'available';
    return {code:product.code,name:product.displayName,title:view.title,reportingMonth:release.reportingMonth,availability,
      comparison:availability==='reporting_month_mismatch'?{current:null,previous:null,changeUsd:null,changePercent:null}:view.world,provenance:view.provenance};
  });
  return {direction,reportingMonth,periods,products};
}
export function rankProductChanges(view:ProductChangesView,metric:ProductChangeMetric):{increases:ProductChange[];decreases:ProductChange[];unavailableCount:number;differentMonthCount:number;belowThresholdCount:number;unchangedCount:number}{
  if(metric!=='dollars'&&metric!=='growth')throw new Error('Invalid product change metric');
  const available=view.products.filter(product=>product.availability==='available');
  const eligible=available.filter(product=>metric==='dollars'||product.comparison.previous!>=PRODUCT_GROWTH_THRESHOLD_USD);
  // Compare growth as exact integer fractions; floating-point percentages can collapse distinct ranks.
  const score=(product:ProductChange)=>BigInt(product.comparison.changeUsd!);
  const compare=(a:ProductChange,b:ProductChange)=>{
    const aScore=score(a)*(metric==='growth'?BigInt(b.comparison.previous!):1n),bScore=score(b)*(metric==='growth'?BigInt(a.comparison.previous!):1n);
    return aScore<bScore?-1:aScore>bScore?1:0;
  };
  const tie=(a:ProductChange,b:ProductChange)=>a.name.localeCompare(b.name)||a.code.localeCompare(b.code);
  return {increases:eligible.filter(product=>score(product)>0n).sort((a,b)=>compare(b,a)||tie(a,b)).slice(0,10),
    decreases:eligible.filter(product=>score(product)<0n).sort((a,b)=>compare(a,b)||tie(a,b)).slice(0,10),
    unavailableCount:view.products.filter(product=>product.availability==='classification_unverified'||product.availability==='incomplete_period').length,
    differentMonthCount:view.products.filter(product=>product.availability==='reporting_month_mismatch').length,
    belowThresholdCount:available.length-eligible.length,unchangedCount:eligible.filter(product=>score(product)===0n).length};
}
