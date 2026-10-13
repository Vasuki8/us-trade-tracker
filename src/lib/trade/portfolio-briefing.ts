import type {Comparison,Direction,ProfileView,Release} from './types';
import type {ProductDefinition} from './product-registry';
import type {DutyComparison,DutyView} from './duty-types';
import {buildMonthlyChangesView,buildChangesView,rankChanges,type CountryChange,type ChangesView} from './changes';
import {buildDutyView} from './duties';
import {shiftMonth} from './metrics';

export type PortfolioSelection={productCodes:string[];direction:Direction};
export type PortfolioPeriods={monthly:ChangesView['periods'];rolling:ChangesView['periods']};
export type PortfolioTrade={periods:ChangesView['periods'];comparison:Comparison;status:'available'|'incomplete_period'|'classification_unverified'};
export type PortfolioHighlight={movement:'increase'|'decrease';country:CountryChange;duties:DutyComparison|null};
export type PortfolioDirection={monthly:PortfolioTrade;rolling:PortfolioTrade;highlights:PortfolioHighlight[];unavailablePartnerCount:number;worldDuties:{latest:DutyComparison;rolling:DutyComparison}|null;provenance:ProfileView['provenance'];dutyProvenance:DutyView['provenance']|null};
export type PreparedPortfolioProduct={code:string;name:string;description:string;reportingMonth:string;directions:Record<Direction,PortfolioDirection>};
export type PreparedPortfolio={products:PreparedPortfolioProduct[]};
export type PortfolioProduct=Omit<PreparedPortfolioProduct,'directions'>&{status:'available'|'reporting_month_mismatch';data:PortfolioDirection|null};
export type PortfolioBriefing={selection:PortfolioSelection;reportingMonth:string;periods:PortfolioPeriods;products:PortfolioProduct[]};

export function portfolioPeriods(end:string):PortfolioPeriods{
  return {monthly:{current:{from:end,to:end},previous:{from:shiftMonth(end,-12),to:shiftMonth(end,-12)}},rolling:{current:{from:shiftMonth(end,-11),to:end},previous:{from:shiftMonth(end,-23),to:shiftMonth(end,-12)}}};
}
const compactTrade=(view:ChangesView):PortfolioTrade=>({periods:view.periods,comparison:view.world,status:!view.classificationComparable?'classification_unverified':view.world.current===null||view.world.previous===null?'incomplete_period':'available'});

/** Build-time only: no raw observations, history arrays or complete country rankings cross this boundary. */
export function preparePortfolioBriefing(profiles:readonly {product:ProductDefinition;release:Release}[]):PreparedPortfolio{
  if(!profiles.length)throw new Error('No published products');
  const seen=new Set<string>();
  const products=profiles.map(({product,release})=>{
    if(product.code!==release.productCode)throw new Error('Product identity differs');
    if(seen.has(product.code))throw new Error('Duplicate product');seen.add(product.code);
    const directionData=(direction:Direction):PortfolioDirection=>{
      const monthly=buildMonthlyChangesView(release,direction),rolling=buildChangesView(release,direction),rank=rankChanges(rolling,'dollars');
      const highlights:PortfolioHighlight[]=[];
      if(rank.increases[0])highlights.push({movement:'increase',country:rank.increases[0],duties:null});
      if(rank.decreases[0])highlights.push({movement:'decrease',country:rank.decreases[0],duties:null});
      const duties=direction==='imports'?buildDutyView(release,[]):null;
      const partnerDuties=direction==='imports'&&highlights.length?buildDutyView(release,highlights.map(h=>h.country.code)):null;
      for(const highlight of highlights)highlight.duties=partnerDuties?.series.find(s=>s.code===highlight.country.code)?.rolling??null;
      const world=duties?.series[0];
      return {monthly:compactTrade(monthly),rolling:compactTrade(rolling),highlights,unavailablePartnerCount:rank.unavailableCount,
        worldDuties:world?{latest:world.latest,rolling:world.rolling}:null,provenance:rolling.provenance,dutyProvenance:duties?.provenance??null};
    };
    const imports=directionData('imports'),exports=directionData('exports');
    return {code:product.code,name:product.displayName,description:release.observations.find(row=>row.geography==='world')?.description??product.displayName,reportingMonth:release.reportingMonth,directions:{imports,exports}};
  });
  return {products};
}

export function selectPortfolioBriefing(prepared:PreparedPortfolio,selection:PortfolioSelection):PortfolioBriefing{
  if(!['imports','exports'].includes(selection.direction)||!selection.productCodes.length||new Set(selection.productCodes).size!==selection.productCodes.length||selection.productCodes.some(code=>!prepared.products.some(p=>p.code===code)))throw new Error('Choose available products and direction');
  const selected=prepared.products.filter(p=>selection.productCodes.includes(p.code));
  const reportingMonth=selected.map(p=>p.reportingMonth).sort().at(-1)!;
  return {selection:{direction:selection.direction,productCodes:selected.map(p=>p.code)},reportingMonth,periods:portfolioPeriods(reportingMonth),products:selected.map(({directions,...product})=>({...product,status:product.reportingMonth===reportingMonth?'available':'reporting_month_mismatch',data:product.reportingMonth===reportingMonth?directions[selection.direction]:null}))};
}
