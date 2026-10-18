import {contextId,equal,mexicoContract,usd} from './contract.server';
import type {VerifiedMexicoEvidence,MexicoAllGoodsProjection,MexicoDirection,MexicoPeriod} from './types';
export function projectMexicoAllGoods(evidence:VerifiedMexicoEvidence):MexicoAllGoodsProjection{
 const seen=new Map();for(const o of evidence.observations){const c=contextId(o.id);equal(o.month,c.month);equal(o.direction,c.direction);equal(o.measure,c.measure);if(seen.has(o.id))throw Error('mexico-duplicate-observation');if(o.usd!==null)usd(o.usd);seen.set(o.id,o.usd);}
 const observations=mexicoContract.months.flatMap(month=>(['imports','exports'] as const).map(direction=>{const c=contextId(direction+'-'+month);return {...c,usd:seen.has(c.id)?seen.get(c.id) as number|null:null};}));
 function period(direction:MexicoDirection,start:number):MexicoPeriod{const months=mexicoContract.months.slice(start,start+12);let total:number|null=0;
  for(const m of months){const v=observations.find(o=>o.id===direction+'-'+m)!.usd;if(v===null){total=null;break;}total=usd(total+v);}return {from:months[0],to:months[11],totalUsd:total};}
 function direction(d:MexicoDirection){const prior=period(d,0),current=period(d,12);return {prior,current,growthPercent:prior.totalUsd!==null&&prior.totalUsd>0&&current.totalUsd!==null?(current.totalUsd-prior.totalUsd)/prior.totalUsd*100:null};}
 return {schemaVersion:1,policyId:mexicoContract.policyId,sourcePolicyId:mexicoContract.sourcePolicyId,source:evidence.source,countryCode:'2010',scope:'all-goods',from:'2024-09',to:'2026-08',classificationAccepted:false,releaseAccepted:false,publicMexicoProfile:false,observations,periods:{imports:direction('imports'),exports:direction('exports')},productComparisons:structuredClone(evidence.qualifications.productComparisons),qualifications:structuredClone(evidence.qualifications)};
}
