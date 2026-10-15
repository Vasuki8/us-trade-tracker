import type {Direction,Month,ProfileView,Release,ValueStatus} from './types';
export type CountryShareHistoryPoint={month:Month;countryValueUsd:number|null;countryStatus:ValueStatus;worldValueUsd:number|null;worldStatus:ValueStatus;sharePercent:number|null;classificationVerified:boolean;breakBefore:boolean};
export type CountryShareHistorySeries={code:string;name:string;points:CountryShareHistoryPoint[]};
export type CountryShareHistoryView={productCode:string;title:string;direction:Direction;fromMonth:Month|null;reportingMonth:Month;series:CountryShareHistorySeries[];provenance:ProfileView['provenance']};
export function buildCountryShareHistory(release:Release,profile:ProfileView):CountryShareHistoryView{
 const direction=profile.selection.direction,measure=direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO',p=profile.provenance;
 if(!['imports','exports'].includes(direction)||profile.productCode!==release.productCode||profile.reportingMonth!==release.reportingMonth||p.source!==release.source||p.retrievedAt!==release.retrievedAt||p.codeVersion!==release.codeVersion||p.measure!==measure)throw new Error('Country share release/view identity differs');
 const rows=release.observations.filter(r=>r.productCode===release.productCode&&r.direction===direction&&r.measure===measure);
 const world=new Map<string,typeof rows[number]>();
 for(const row of rows.filter(r=>r.geography==='world'&&r.partnerCode==='-')){if(world.has(row.month))throw new Error('Duplicate country share world month');world.set(row.month,row);}
 const country=new Map(rows.filter(r=>r.geography==='country').map(r=>[r.partnerCode+'/'+r.month,r]));
 const metadata={productCode:profile.productCode,title:profile.title,direction,fromMonth:profile.series[0]?.points[0]?.month??null,reportingMonth:profile.reportingMonth,provenance:{...p,sourceUrls:[...p.sourceUrls]}};
 if(profile.selection.countryCodes.length===0)return {...metadata,series:[]};
 if(profile.series.length!==profile.selection.countryCodes.length||profile.series.some((s,i)=>s.code!==profile.selection.countryCodes[i]))throw new Error('Country share selection differs');
 const series=profile.series.map(s=>{
  const points:CountryShareHistoryPoint[]=[];
  for(const point of s.points){
   const c=country.get(s.code+'/'+point.month),w=world.get(point.month),countryStatus=c?.status??'missing',worldStatus=w?.status??'missing';
   const countryValueUsd=point.valueUsd,worldValueUsd=w?.valueUsd??null;
   const sharePercent=countryStatus==='reported'&&worldStatus==='reported'&&countryValueUsd!==null&&worldValueUsd!==null&&worldValueUsd>0?100*countryValueUsd/worldValueUsd:null;
   const prior=points.at(-1),connected=prior!==undefined&&prior.sharePercent!==null&&sharePercent!==null&&prior.classificationVerified&&point.classificationVerified&&!point.breakBefore;
   points.push({month:point.month,countryValueUsd,countryStatus,worldValueUsd,worldStatus,sharePercent,classificationVerified:point.classificationVerified,breakBefore:!connected});
  }
  return {code:s.code,name:s.name,points};
 });
 return {...metadata,series};
}
