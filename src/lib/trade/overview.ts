import type {ProductDefinition} from './product-registry';
import type {Release,Direction} from './types';
import {buildProfileView} from './profile';
import {buildMonthlyChangesView} from './changes';
import {buildDutyView} from './duties';

// Reuse the reviewed profile calculations; send summaries, not raw releases, to the overview.
export function buildOverviewProduct({product,release}:{product:ProductDefinition;release:Release}){
  const direction=(value:Direction)=>{
    const view=buildProfileView(release,{direction:value,months:60,countryCodes:[]});
    const monthlyPartners=buildMonthlyChangesView(release,value).countries.map(row=>({code:row.code,name:row.name,valueUsd:row.currentUsd,sharePercent:row.currentSharePercent})).sort((a,b)=>(b.valueUsd??-1)-(a.valueUsd??-1)||a.name.localeCompare(b.name));
    const available=(rows:typeof view.partners)=>rows.filter(row=>row.valueUsd!==null);
    return {
      view:{...view,partners:available(view.partners).slice(0,5),provenance:{source:view.provenance.source,retrievedAt:view.provenance.retrievedAt}},
      monthlyPartners:available(monthlyPartners).slice(0,5),
      partnerCounts:{monthly:{total:monthlyPartners.length,reported:available(monthlyPartners).length},annual:{total:view.partners.length,reported:available(view.partners).length}},
    };
  };
  const duty=buildDutyView(release,[]).series[0];
  return {code:product.code,name:product.displayName,imports:direction('imports'),exports:direction('exports'),duty:{monthly:duty?.latest.current??null,annual:duty?.rolling.current??null}};
}
export type OverviewProduct=ReturnType<typeof buildOverviewProduct>;
