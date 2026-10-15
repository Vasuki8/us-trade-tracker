import type {Comparison,Direction,ProfileView,Release} from './types';
import type {ProductDefinition} from './product-registry';
import {buildChangesView,buildMonthlyChangesView} from './changes';
import {shiftMonth,sumWindow} from './metrics';

export type ProductChangeMetric='dollars'|'growth';
export type ProductChangesPeriod='rolling'|'monthly';
export type ProductChangeAvailability='available'|'reporting_month_mismatch'|'classification_unverified'|'incomplete_period';
export type ProductGrowthQualification={from:string;to:string;valueUsd:number|null;availability:'available'|'incomplete_period'|'classification_unverified'};
export type ProductChange={code:string;name:string;title:string;reportingMonth:string;comparison:Comparison;availability:ProductChangeAvailability;provenance:ProfileView['provenance'];growthQualification?:ProductGrowthQualification};
export type ProductChangesView={periodType:ProductChangesPeriod;direction:Direction;reportingMonth:string;periods:{current:{from:string;to:string};previous:{from:string;to:string}};products:ProductChange[]};
export type ProductChangesViews=Record<ProductChangesPeriod,Record<Direction,ProductChangesView>>;
type GrowthExclusion={product:ProductChange;reason:'below_threshold'|'qualification_unavailable'|'zero_prior_month'};
type ProductProfile={product:ProductDefinition;release:Release};
export const PRODUCT_GROWTH_THRESHOLD_USD=10_000_000;

function buildProductChanges(profiles:ProductProfile[],direction:Direction,periodType:ProductChangesPeriod):ProductChangesView{
  if(profiles.length===0)throw new Error('No published products');
  if(direction!=='imports'&&direction!=='exports')throw new Error('Invalid trade direction');
  if(new Set(profiles.map(({product})=>product.code)).size!==profiles.length)throw new Error('Duplicate product');
  const reportingMonth=profiles.map(({release})=>release.reportingMonth).toSorted().at(-1)!;
  const previousMonth=shiftMonth(reportingMonth,-12);
  const periods=periodType==='monthly'?{current:{from:reportingMonth,to:reportingMonth},previous:{from:previousMonth,to:previousMonth}}:
    {current:{from:shiftMonth(reportingMonth,-11),to:reportingMonth},previous:{from:shiftMonth(reportingMonth,-23),to:previousMonth}};
  const products=profiles.map(({product,release}):ProductChange=>{
    if(product.code!==release.productCode)throw new Error('Product identity differs');
    const view=(periodType==='monthly'?buildMonthlyChangesView:buildChangesView)(release,direction);
    const availability:ProductChangeAvailability=release.reportingMonth!==reportingMonth?'reporting_month_mismatch':!view.classificationComparable?'classification_unverified':view.world.current===null||view.world.previous===null?'incomplete_period':'available';
    let growthQualification:ProductGrowthQualification|undefined;
    if(periodType==='monthly'&&release.reportingMonth===reportingMonth){
      const from=shiftMonth(reportingMonth,-23),to=previousMonth;
      const verified=release.classificationIntervals.some(interval=>interval.from<=from&&to<=interval.to);
      const rows=release.observations.filter(row=>row.productCode===release.productCode&&row.direction===direction&&row.measure===view.provenance.measure&&row.geography==='world');
      const valueUsd=verified?sumWindow(rows,to,12):null;
      growthQualification={from,to,valueUsd,availability:!verified?'classification_unverified':valueUsd===null?'incomplete_period':'available'};
    }
    return {code:product.code,name:product.displayName,title:view.title,reportingMonth:release.reportingMonth,availability,
      comparison:availability==='reporting_month_mismatch'?{current:null,previous:null,changeUsd:null,changePercent:null}:view.world,provenance:view.provenance,
      ...(growthQualification?{growthQualification}:{})};
  });
  return {periodType,direction,reportingMonth,periods,products};
}

export function buildProductChangesView(profiles:ProductProfile[],direction:Direction):ProductChangesView{
  return buildProductChanges(profiles,direction,'rolling');
}
export function buildMonthlyProductChangesView(profiles:ProductProfile[],direction:Direction):ProductChangesView{
  return buildProductChanges(profiles,direction,'monthly');
}

export function rankProductChanges(view:ProductChangesView,metric:ProductChangeMetric){
  if(metric!=='dollars'&&metric!=='growth')throw new Error('Invalid product change metric');
  const available=view.products.filter(product=>product.availability==='available');
  const growthExclusions:GrowthExclusion[]=metric==='dollars'?[]:available.flatMap<GrowthExclusion>(product=>{
    if(view.periodType==='monthly'){
      if(product.comparison.previous===0)return [{product,reason:'zero_prior_month' as const}];
      if(product.growthQualification?.availability!=='available')return [{product,reason:'qualification_unavailable' as const}];
      if(product.growthQualification.valueUsd!>=PRODUCT_GROWTH_THRESHOLD_USD)return [];
    }else if(product.comparison.previous!>=PRODUCT_GROWTH_THRESHOLD_USD)return [];
    return [{product,reason:'below_threshold' as const}];
  });
  const excluded=new Set(growthExclusions.map(({product})=>product.code));
  const eligible=available.filter(product=>!excluded.has(product.code));
  // Growth ordering uses the matching comparison value, never the qualification total.
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
    belowThresholdCount:growthExclusions.filter(row=>row.reason==='below_threshold').length,
    growthQualificationUnavailableCount:growthExclusions.filter(row=>row.reason==='qualification_unavailable').length,
    zeroPriorMonthCount:growthExclusions.filter(row=>row.reason==='zero_prior_month').length,
    growthExclusions,unchangedCount:eligible.filter(product=>score(product)===0n).length};
}
