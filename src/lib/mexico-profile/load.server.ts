import {readFile,lstat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {summarizeMexicoDirection} from './summary';
import {readAcceptedMexicoAllGoodsRelease} from '../mexico-country-release/acceptance-state.server';
import {decodeMexicoCandidate} from '../mexico-country-release/package.server';
import {mexicoAcceptanceContract} from '../mexico-country-release/acceptance-contract.server';
import type {MexicoDirection,MexicoLocalProfile,MexicoOriginalSource} from './types';
const LIMIT=64*1024;
const directions=['imports','exports'] as const;
const months=Array.from({length:24},(_,i)=>new Date(Date.UTC(2024,8+i,1)).toISOString().slice(0,7));
const basis={imports:'general-imports-customs-value',exports:'domestic-plus-foreign-exports-fas-value'} as const;
const measure={imports:'GEN_VAL_MO',exports:'ALL_VAL_MO'} as const;
const assert=(ok:unknown):void=>{if(!ok)throw Error('Invalid Mexico local profile');};
function object(v:unknown):Record<string,unknown>{assert(v!==null&&typeof v==='object'&&!Array.isArray(v));return v as Record<string,unknown>;}
function keys(v:unknown,expected:string[]):void{assert(JSON.stringify(Object.keys(object(v)).sort())===JSON.stringify([...expected].sort()));}
function time(v:unknown):void{assert(typeof v==='string'&&v.length<=64&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(v)&&Number.isFinite(Date.parse(v)));}
function source(v:unknown):MexicoOriginalSource{
 const s=object(v);keys(s,['url','capturedAt','bytes','sha256']);assert(typeof s.url==='string'&&s.url.length<=2048);
 const u=new URL(s.url as string);assert(u.protocol==='https:'&&u.hostname==='www.census.gov'&&u.pathname.startsWith('/trade/downloads/')&&!u.username&&!u.password&&!u.search&&!u.hash);
 time(s.capturedAt);assert(typeof s.bytes==='number'&&Number.isSafeInteger(s.bytes)&&s.bytes>0);assert(typeof s.sha256==='string'&&/^[a-f0-9]{64}$/.test(s.sha256));
 return {url:s.url as string,capturedAt:s.capturedAt as string,bytes:s.bytes as number,sha256:s.sha256 as string};
}
function qualifications(real:boolean):MexicoLocalProfile['qualifications']{
 return {currentBeforeMatched:48,currentAfterMatched:48,datedMatched:16,datedDifferences:32,differenceCause:'not-established',vintageRelationship:'not-established',classificationAccepted:false,productComparisonsAvailable:false,verificationBasis:real?'prior-reviewed-retained-evidence':'synthetic',historicalFailuresPreserved:true};
}
function validate(value:unknown,real:boolean):MexicoLocalProfile{
 assert(Buffer.byteLength(JSON.stringify(value),'utf8')<=LIMIT);
 keys(value,['schemaVersion','countryCode','countryName','from','to','source','presentation','acceptance','captureInterval','directions','qualifications']);
 const p=value as MexicoLocalProfile;
 assert(p.schemaVersion===1&&p.countryCode==='2010'&&p.countryName==='Mexico'&&p.from==='2024-09'&&p.to==='2026-08');
 assert(p.source===(real?'census':'fixture')&&p.presentation===(real?'accepted-private-local':'synthetic-local'));
 if(real){keys(p.acceptance,['releaseId','acceptedAt','scope']);assert(p.acceptance?.releaseId===mexicoAcceptanceContract.releaseId&&p.acceptance.scope==='private-all-goods');time(p.acceptance!.acceptedAt);}else assert(p.acceptance===null);
 keys(p.captureInterval,['startedAt','finishedAt']);time(p.captureInterval.startedAt);time(p.captureInterval.finishedAt);assert(Date.parse(p.captureInterval.startedAt)<=Date.parse(p.captureInterval.finishedAt));
 if(real)assert(Date.parse(p.acceptance!.acceptedAt)>=Date.parse(p.captureInterval.finishedAt));
 keys(p.directions,['imports','exports']);
 for(const d of directions){
  const v=p.directions[d];keys(v,['direction','measure','basis','monthly']);assert(v.direction===d&&v.measure===measure[d]&&v.basis===basis[d]&&Array.isArray(v.monthly)&&v.monthly.length===24);
  for(let i=0;i<24;i++){const row=v.monthly[i];keys(row,['month','valueUsd','originalSource']);assert(row.month===months[i]);assert(row.valueUsd===null||typeof row.valueUsd==='number'&&Number.isSafeInteger(row.valueUsd)&&row.valueUsd>=0);if(real)source(row.originalSource);else assert(row.originalSource===null);}
 }
 const q=qualifications(real);keys(p.qualifications,Object.keys(q));
 for(const [k,v] of Object.entries(q))assert(object(p.qualifications)[k]===v);
 return structuredClone(p);
}
type Environment=Readonly<Record<string,string|undefined>>;
function mode(environment:Environment):null|'fixture'|'selected'{
 const m=environment.MEXICO_LOCAL_PREVIEW_MODE;if(m===undefined)return null;
 assert(m==='fixture'||m==='selected');
 assert(['CANADA_PILOT_MODE','CANADA_PREVIEW_MODE','CANADA_ACCEPTED_PREVIEW_MODE','MEXICO_PILOT_MODE'].every(k=>environment[k]===undefined));
 assert(environment.TRADE_DATA_MODE===(m==='fixture'?'fixture':'census'));return m as 'fixture'|'selected';
}
export async function loadMexicoLocalProfile(options:{workspaceRoot?:string;environment?:Environment}={}):Promise<MexicoLocalProfile|null>{
 try{
  const selectedMode=mode(options.environment??process.env);if(selectedMode===null)return null;
  const root=resolve(options.workspaceRoot??process.cwd());
  if(selectedMode==='fixture'){
   const path=resolve(root,'tests/fixtures/mexico-local-profile.json'),stat=await lstat(path);
   assert(stat.isFile()&&!stat.isSymbolicLink()&&stat.size>0&&stat.size<=LIMIT);
   const bytes=await readFile(path);assert(bytes.length<=LIMIT);return validate(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)),false);
  }
  const {pointer:p,material:m}=await readAcceptedMexicoAllGoodsRelease(root),v=m.projection;
  assert(p.countryCode==='2010'&&p.scope==='all-goods'&&p.source==='census'&&p.from==='2024-09'&&p.to==='2026-08'&&p.releaseId===mexicoAcceptanceContract.releaseId&&p.status==='accepted-private-all-goods'&&p.allGoodsAccepted===true&&p.classificationAccepted===false&&p.publicMexicoProfile===false&&p.productComparisons.available===false);
  assert(m.instrument.releaseId===p.releaseId&&m.instrument.decision==='owner-authorized-for-private-all-goods'&&m.instrument.classificationAccepted===false&&m.instrument.publicMexicoProfile===false&&m.instrument.productComparisons.available===false);
  assert(v.countryCode==='2010'&&v.scope==='all-goods'&&v.source==='census'&&v.from==='2024-09'&&v.to==='2026-08'&&v.classificationAccepted===false&&v.releaseAccepted===false&&v.publicMexicoProfile===false&&v.productComparisons.available===false&&v.productComparisons.ordinaryUnverified===17&&v.productComparisons.statisticalExclusions===3);
  const refs=v.qualifications.references;assert(refs.currentBefore.matched===48&&refs.currentBefore.mismatch===0&&refs.currentAfter.matched===48&&refs.currentAfter.mismatch===0&&refs.dated.matched===16&&refs.dated.mismatch===32&&refs.differenceCause==='not-established'&&refs.vintageRelationship==='not-established'&&refs.originalPublicationBytesProven===false);
  const decoded=decodeMexicoCandidate(m.candidateBytes);assert(decoded.manifest.countryCode==='2010'&&decoded.manifest.source==='census'&&decoded.manifest.releaseId===p.releaseId);
  const original=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(decoded.files.get('national-original-manifest.json')!));
  assert(Array.isArray(original.requests));const sources=new Map<string,MexicoOriginalSource>();
  for(const entry of original.requests.filter((r:Record<string,unknown>)=>r.kind==='zip')){
   assert(typeof entry.id==='string'&&entry.context_id===entry.id&&!sources.has(entry.id)&&entry.outcome==='complete');
   const [d,month]=[entry.id.slice(0,7),entry.id.slice(8)];assert(directions.includes(d as MexicoDirection)&&months.includes(month)&&entry.id===d+'-'+month);
   sources.set(entry.id,source({url:entry.source_url,capturedAt:entry.retrieved_at,bytes:entry.bytes,sha256:entry.sha256}));
  }
  assert(sources.size===48&&Array.isArray(v.observations)&&v.observations.length===48);
  const observations=new Map(v.observations.map(row=>[row.id,row]));assert(observations.size===48);
  const result:MexicoLocalProfile={
   schemaVersion:1,countryCode:'2010',countryName:'Mexico',from:'2024-09',to:'2026-08',source:'census',presentation:'accepted-private-local',
   acceptance:{releaseId:p.releaseId,acceptedAt:p.acceptedAt,scope:'private-all-goods'},captureInterval:{...decoded.manifest.captureInterval},
   directions:Object.fromEntries(directions.map(d=>[d,{direction:d,measure:measure[d],basis:basis[d],monthly:months.map(month=>{
    const id=d+'-'+month,row=observations.get(id);assert(row&&row.id===id&&row.direction===d&&row.month===month&&row.measure===measure[d]);
    return {month,valueUsd:row!.usd,originalSource:sources.get(id)!};
   })}])) as MexicoLocalProfile['directions'],
   qualifications:qualifications(true),
  };
  const checked=validate(result,true);
  for(const d of directions){
   const summary=summarizeMexicoDirection(checked.directions[d]),expected=v.periods[d];
   for(const k of ['prior','current'] as const)assert(summary[k].from===expected[k].from&&summary[k].to===expected[k].to&&summary[k].totalUsd===expected[k].totalUsd);
   assert(summary.growthPercent===expected.growthPercent);
  }
  return checked;
 }catch{throw Error('Mexico local profile unavailable or invalid');}
}
