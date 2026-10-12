import {canadaPreviewContract as contract} from './contract.server';
import {buildCountryTotalSummary} from './summary';
import {parseSnapshotClassificationLedger,specialSnapshotCode} from '../../../scripts/country-snapshot-assessment';
import {compareCountryReferences} from '../../../scripts/country-publications';
import {snapshotObject as object,snapshotArray as array,snapshotUsd as usd} from '../../../scripts/country-snapshot-input';
import type {SnapshotAssessment,SnapshotCandidate,ReferenceResult} from '../../../scripts/country-snapshot-types';
import type {CountryDirection,CountryPreview,CountryDirectionView,CountryProductPeriod,PublicReferenceSource,PublicPublicationSource} from './types';
const fail=()=>{throw new Error('Invalid reviewed Canada preview assessment');};
const signed=(value:unknown):number=>{if(typeof value!=='number'||!Number.isSafeInteger(value))fail();return value as number;};
const fraction=(value:unknown,nullable=false)=>{if(value===null&&nullable)return;if(typeof value!=='number'||!Number.isFinite(value))fail();};
const timestamp=(value:unknown):string=>{if(typeof value!=='string'||!/^\d{4}-\d\d-\d\dT/.test(value)||!Number.isFinite(Date.parse(value)))fail();return value as string;};
const hash=(value:unknown)=>{if(typeof value!=='string'||!/^[a-f0-9]{64}$/.test(value))fail();};
function publicReference(ref:ReferenceResult,label:'before'|'after'):PublicReferenceSource{
  if(ref.sourceUrl!=='https://www.census.gov/foreign-trade/balance/c1220.html')fail();
  const files=array(ref.sourceFiles).map(object),body=files.find(f=>typeof f.path==='string'&&f.path.endsWith(`/canada-${label}.html`));
  if(!body)fail();hash(body!.sha256);const bytes=usd(body!.bytes);if(bytes<1)fail();
  return {url:ref.sourceUrl,capturedAt:timestamp(ref.capturedAt),bytes,sha256:String(body!.sha256)};
}
function publicPublication(value:Record<string,unknown>|null,month:string):PublicPublicationSource|null{
  if(value===null)return null;
  const p=object(value),url=`https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_${month.slice(2,4)+month.slice(5)}.pdf`;
  if(p.countryCode!=='1220'||p.direction!=='exports'||p.month!==month||p.url!==url||usd(p.bytes)<1)fail();hash(p.sha256);
  return {url,bytes:Number(p.bytes),sha256:String(p.sha256)};
}
function checkReference(ref:ReferenceResult,total:number,publicationRequired:boolean,label:'before'|'after',month:string){
  object(ref);usd(ref.currentUsd);if(ref.quantumUsd!==100000||ref.currentUsd%100000)fail();
  publicReference(ref,label);
  if((ref.publicationUsd!==undefined)!==publicationRequired)fail();
  if(publicationRequired){usd(ref.publicationUsd);if(ref.publicationUsd!%100000||!ref.publicationSource)fail();}
  if(publicationRequired)publicPublication(ref.publicationSource,month);
  const result=compareCountryReferences(total,ref.currentUsd,ref.publicationUsd);
  for(const key of ['referenceCheck','publicationCheck','referenceCorroboration'] as const)if(ref[key]!==result[key])fail();
  if(ref.currentDifferenceUsd!==signed(total-ref.currentUsd)||ref.publicationDifferenceUsd!==(ref.publicationUsd===undefined?null:signed(total-ref.publicationUsd)))fail();
}
export function validateRetainedAssessment(value:unknown):SnapshotAssessment{
  const v=object(value);
  if(v.schemaVersion!==1||v.policyId!==contract.policyId||v.processingCommit!==contract.processingCommit||v.completed!==true||v.archiveIntegrity!=='passed'||v.failureReason!==null)fail();
  for(const k of ['releaseAccepted','rollingComparisonsAvailable','defaultAuditRetrievalChanged'])if(v[k]!==false)fail();
  const ledger=object(v.classificationLedgerIdentity);if(ledger.path!==contract.ledger.path||ledger.bytes!==contract.ledger.bytes||ledger.sha256!==contract.ledger.sha256)fail();
  const p=object(v.inputProvenance),capture=object(p.captureInterval);
  if(p.policyId!==contract.policyId||p.rawVerification!=='previous-reviewed-replay'||timestamp(capture.startedAt)>timestamp(capture.finishedAt))fail();
  const expected=new Set(contract.months.flatMap(m=>['imports-'+m,'exports-'+m])),seen=new Set<string>();
  const originals=new Map<string,Record<string,unknown>>();
  for(const item of array(p.originals)){
    const r=object(item),id=String(r.context_id);if(!expected.has(id)||originals.has(id)||r.id!==id||r.kind!=='zip'||r.outcome!=='complete'||r.status!==200)fail();
    const [d,y,m]=id.split('-'),url=`https://www.census.gov/trade/downloads/${y}/Merch/${d==='imports'?'im_m':'ex_m'}/${d==='imports'?'IMDB':'EXDB'}${y.slice(2)+m}.ZIP`;
    if(r.source_url!==url||usd(r.bytes)<1)fail();hash(r.sha256);timestamp(r.retrieved_at);originals.set(id,r);
  }
  if(originals.size!==48)fail();
  const months=array(v.months);
  for(const item of months){
    const r=object(item),id=String(r.id),d=r.direction as CountryDirection;
    if(!expected.has(id)||seen.has(id)||id!==`${d}-${r.month}`||r.measure!==(d==='imports'?'GEN_VAL_MO':'ALL_VAL_MO'))fail();seen.add(id);
    const total=usd(r.countryTotalUsd);if(total<=0||usd(r.sumUsd)!==total||r.residualUsd!==0)fail();
    const required=d==='exports'&&String(r.month)>='2026-01'&&String(r.month)<='2026-07';
    checkReference(r.beforeReference as ReferenceResult,total,required,'before',String(r.month));checkReference(r.afterReference as ReferenceResult,total,required,'after',String(r.month));
  }
  if(seen.size!==48)fail();
  const assessment=value as SnapshotAssessment,candidates=array(v.candidates),keys=Object.entries(contract.candidates).flatMap(([d,codes])=>codes.map(c=>d+'-'+c));
  if(candidates.length!==20)fail();
  const classifications=[];
  for(let i=0;i<candidates.length;i++){
    const c=object(candidates[i]) as unknown as SnapshotCandidate;
    if(`${c.direction}-${c.code}`!==keys[i]||(c.description!==null&&typeof c.description!=='string'))fail();
    const special=specialSnapshotCode(c.direction,c.code),selected=assessment.months.filter(m=>m.direction===c.direction),totals=new Map(selected.map(m=>[m.month,m.countryTotalUsd]));
    const observations=array(c.months).map(object);if(observations.length!==24)fail();
    for(let j=0;j<24;j++){
      const o=observations[j];if(o.month!==contract.months[j]||o.countryTotalUsd!==totals.get(String(o.month))||o.specialByPolicy!==special||(o.specialAtCapture!==null&&typeof o.specialAtCapture!=='boolean'))fail();usd(o.valueUsd);fraction(o.sharePercent,special);if(special&&o.sharePercent!==null)fail();
    }
    if(c.comparisonEligible!==!special||c.reason!==(special?'statistical-category':'eligible-offline-only'))fail();
    if(special){if(c.classification!==null||c.growthPercent!==null||c.sharePointChange!==null)fail();}
    else {if(!c.classification||c.classification.direction!==c.direction||c.classification.code!==c.code||c.classification.status!=='compatible'||c.classification.from!=='2024-09'||c.classification.to!=='2026-08')fail();classifications.push(c.classification);fraction(c.growthPercent,true);fraction(c.sharePointChange);}
    for(const [name,from,to] of [['prior','2024-09','2025-08'],['current','2025-09','2026-08']] as const){
      const period=object(c[name]);if(period.from!==from||period.to!==to||period.reportedMonths!==12)fail();usd(period.observedSumUsd);const denominator=selected.filter(m=>m.month>=from&&m.month<=to).reduce((s,m)=>usd(s+m.countryTotalUsd),0);
      if(period.countryTotalUsd!==denominator)fail();fraction(period.sharePercent,special);if(special&&period.sharePercent!==null)fail();
    }
  }
  parseSnapshotClassificationLedger({schemaVersion:1,policyId:contract.policyId,entries:classifications});
  for(const d of ['imports','exports'] as const){const group=assessment.months.filter(m=>m.direction===d);for(const label of ['beforeReference','afterReference'] as const){if(group.filter(m=>m[label].referenceCheck==='mismatch').length!==(d==='imports'?0:7))fail();}}
  return assessment;
}
const period=(p:CountryProductPeriod):CountryProductPeriod=>({from:p.from,to:p.to,reportedMonths:p.reportedMonths,observedSumUsd:p.observedSumUsd,countryTotalUsd:p.countryTotalUsd,sharePercent:p.sharePercent});
export function projectRetainedAssessment(value:unknown):CountryPreview{
  const a=validateRetainedAssessment(value),directions={} as Record<CountryDirection,CountryDirectionView>,originals=new Map(a.inputProvenance.originals.map(o=>[String(o.context_id),o]));
  for(const direction of ['imports','exports'] as const){
    const months=a.months.filter(m=>m.direction===direction).sort((x,y)=>x.month.localeCompare(y.month));
    const monthly=months.map(m=>{const o=originals.get(m.id)!;return {month:m.month,valueUsd:m.countryTotalUsd,originalSource:{month:m.month,url:String(o.source_url),capturedAt:String(o.retrieved_at),bytes:Number(o.bytes),sha256:String(o.sha256)}};});
    const products=a.candidates.filter(c=>c.direction===direction).map(c=>({code:c.code,description:c.description,current:period(c.current),prior:period(c.prior),comparisonEligible:c.comparisonEligible,reason:c.reason,specialByPolicy:specialSnapshotCode(c.direction,c.code),classification:c.classification?{status:c.classification.status,from:c.classification.from,to:c.classification.to}:{status:'statistical-category' as const,from:null,to:null},changeUsd:c.comparisonEligible?signed(c.current.observedSumUsd!-c.prior.observedSumUsd!):null,growthPercent:c.growthPercent,sharePointChange:c.sharePointChange}));
    directions[direction]={direction,measure:direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO',title:direction==='imports'?'U.S. imports from Canada':'U.S. exports to Canada',monthly,summary:buildCountryTotalSummary(monthly),products,references:{before:{matched:months.filter(m=>m.beforeReference.referenceCheck==='matched').length,mismatch:months.filter(m=>m.beforeReference.referenceCheck==='mismatch').length,source:publicReference(months[0].beforeReference,'before')},after:{matched:months.filter(m=>m.afterReference.referenceCheck==='matched').length,mismatch:months.filter(m=>m.afterReference.referenceCheck==='mismatch').length,source:publicReference(months[0].afterReference,'after')},publication:{matched:months.filter(m=>m.beforeReference.publicationCheck==='matched').length,notReviewed:months.filter(m=>m.beforeReference.publicationCheck==='not-reviewed').length},differences:months.filter(m=>m.beforeReference.referenceCheck==='mismatch'||m.afterReference.referenceCheck==='mismatch').map(m=>({month:m.month,archiveUsd:m.countryTotalUsd,currentBeforeUsd:m.beforeReference.currentUsd,currentAfterUsd:m.afterReference.currentUsd,differenceBeforeUsd:m.beforeReference.currentDifferenceUsd!,differenceAfterUsd:m.afterReference.currentDifferenceUsd!,publicationUsd:m.beforeReference.publicationUsd??null,publicationDifferenceUsd:m.beforeReference.publicationDifferenceUsd,publicationCheck:m.beforeReference.publicationCheck,publicationSource:publicPublication(m.beforeReference.publicationSource,m.month)}))}};
  }
  return {schemaVersion:1,countryCode:'1220',countryName:'Canada',source:'retained',reporting:{from:'2024-09',to:'2026-08',latest:'2026-08'},captureInterval:{...a.inputProvenance.captureInterval},processingVersion:a.processingCommit!,rawVerification:'previous-reviewed-replay',directions,availability:{releaseAccepted:false,rollingComparisonsAvailable:false,defaultAuditRetrievalChanged:false}};
}
