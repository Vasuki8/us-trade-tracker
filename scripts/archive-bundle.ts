import type {Release} from '../src/lib/trade/types';
import {createHash} from 'node:crypto';
import {validateRelease} from './prepare-release';
import {normalizeProductResponses} from './census-client';
import {normalizeDutyMonth} from '../src/lib/trade/duty-normalize';
import type {DutyObservation,DutyRawPart} from '../src/lib/trade/duty-types';
import {validMonth,observationKey} from '../src/lib/trade/normalize';
import {shiftMonth} from '../src/lib/trade/metrics';
import {DEFAULT_PRODUCT_CODE,assertProductCode} from '../src/lib/trade/product-registry';
import {productArchiveKeys} from './product-paths';
export type BundleReference={key:string;sha256:string};
type ManifestBase={productCode:string;releaseId:string;reportingMonth:string;retrievedAt:string;codeVersion:string;previous:BundleReference|null;files:{path:string;bytes:number;sha256:string}[]};
export type BundleManifest=ManifestBase&({schemaVersion:1}|{schemaVersion:2;scope:{merchandiseMonths:60;dutyMonths:24}});
export type ArchiveBundle={manifest:BundleManifest;files:{path:string;contentBase64:string}[]};
export type BundleInput={releaseId:string;releaseBytes:Buffer;rawRecords:Map<string,Buffer>;previous:BundleReference|null};
export type BundlePackage={bytes:Buffer;reference:BundleReference};
export type DecodedBundle={manifest:BundleManifest;release:Release;files:Map<string,Buffer>};
export type ArchivePointer={schemaVersion:1;productCode:string;bundleKey:string;bundleSha256:string};
export const ARCHIVE_PREFIX='trade/v1/products/090121/';
export const CURRENT_KEY=`${ARCHIVE_PREFIX}current.json`;
export const LIMITS={pointer:16*1024,manifest:256*1024,file:32*1024*1024,total:64*1024*1024,bundle:96*1024*1024} as const;
const idPattern=/^(20\d{2}-(?:0[1-9]|1[0-2]))-[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
export function sha256(bytes:Buffer):string{return createHash('sha256').update(bytes).digest('hex');}
function fail(message='Invalid archive schema'):never{throw new Error(message);}
function record(value:unknown,keys:string[]):Record<string,any>{
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!keys.includes(k))||keys.some(k=>!(k in value)))fail();
  return value as Record<string,any>;
}
export function parseArchiveJson(bytes:Buffer,maxBytes:number):unknown{
  if(bytes.length>maxBytes)fail('Archive byte size limit exceeded');
  try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{fail('Invalid archive JSON or UTF-8');}
}
export function releaseIdFromKey(key:string,expectedProductCode:string=DEFAULT_PRODUCT_CODE):string{
  const {prefix}=productArchiveKeys(expectedProductCode);
  if(typeof key!=='string'||!key.startsWith(`${prefix}releases/`)||!key.endsWith('.json'))fail('Invalid archive key');
  const id=key.slice(`${prefix}releases/`.length,-5);if(!idPattern.test(id))fail('Invalid archive release ID');return id;
}
export function validateReference(value:unknown,expectedProductCode:string=DEFAULT_PRODUCT_CODE):BundleReference{
  const r=record(value,['key','sha256']);releaseIdFromKey(r.key,expectedProductCode);if(typeof r.sha256!=='string'||! /^[a-f0-9]{64}$/.test(r.sha256))fail('Invalid archive checksum');
  return {key:r.key,sha256:r.sha256};
}
export function encodePointer(reference:BundleReference,expectedProductCode:string=DEFAULT_PRODUCT_CODE):Buffer{
  const r=validateReference(reference,expectedProductCode);return Buffer.from(JSON.stringify({schemaVersion:1,productCode:expectedProductCode,bundleKey:r.key,bundleSha256:r.sha256}));
}
export function decodePointer(bytes:Buffer,expectedProductCode:string=DEFAULT_PRODUCT_CODE):BundleReference{
  assertProductCode(expectedProductCode);
  const p=record(parseArchiveJson(bytes,LIMITS.pointer),['schemaVersion','productCode','bundleKey','bundleSha256']);
  if(p.schemaVersion!==1||p.productCode!==expectedProductCode)fail();return validateReference({key:p.bundleKey,sha256:p.bundleSha256},expectedProductCode);
}
function validateFiles(manifest:BundleManifest,files:Map<string,Buffer>,expectedProductCode:string):Release{
  const release:unknown=parseArchiveJson(files.get('release.json')??fail('Missing prepared release'),LIMITS.file);
  validateRelease(release,true);
  record(release,['schemaVersion','productCode','reportingMonth','retrievedAt','codeVersion','source','sourceUrls','observations','revisedKeys','classificationIntervals',...(release.schemaVersion===2?['duties']:[])]);
  if(manifest.schemaVersion!==release.schemaVersion)fail('Archive and release versions differ');
  if(manifest.schemaVersion===2){const scope=record(manifest.scope,['merchandiseMonths','dutyMonths']);if(scope.merchandiseMonths!==60||scope.dutyMonths!==24)fail('Invalid archive scope');}
  const sourceUrls=['imports','exports'].map(d=>`https://api.census.gov/data/timeseries/intltrade/${d}/hs`);
  if(release.sourceUrls.length!==2||new Set(release.sourceUrls).size!==2||release.sourceUrls.some(u=>!sourceUrls.includes(u)))fail('Invalid prepared source URLs');
  for(const row of release.observations)record(row,['productCode','description','direction','month','partnerCode','partnerName','geography','measure','valueUsd','status']);
  for(const interval of release.classificationIntervals)record(interval,['from','to','evidenceUrl']);
  if(manifest.productCode!==expectedProductCode||release.productCode!==expectedProductCode||!idPattern.test(manifest.releaseId)||!manifest.releaseId.startsWith(`${release.reportingMonth}-`)||manifest.reportingMonth!==release.reportingMonth||manifest.retrievedAt!==release.retrievedAt||manifest.codeVersion!==release.codeVersion)fail('Inconsistent archive release identity');
  const expected=new Set(['release.json']);const replay=new Map<string,Release['observations'][number]>();
  for(let i=-59;i<=0;i++)for(const direction of ['imports','exports'] as const){
    const month=shiftMonth(release.reportingMonth,i);const parts=[];
    for(const summary of ['HS','HSCY'] as const){
      const path=`raw/${direction}-${month}-${summary}.json`;expected.add(path);
      const raw=parseArchiveJson(files.get(path)??fail('Missing Census request record'),LIMITS.file);
      const keys=['retrievedAt','requestUrl','payload',...(raw&&typeof raw==='object'&&'httpStatus' in raw?['httpStatus']:[])];
      const r=record(raw,keys);if(r.retrievedAt!==release.retrievedAt||typeof r.requestUrl!=='string')fail('Invalid request metadata');
      const status=r.httpStatus??200;if(![200,204].includes(status))fail('Invalid recorded HTTP status');
      let u:URL;try{u=new URL(r.requestUrl);}catch{fail('Invalid Census URL');}
      const commodity=direction==='imports'?'I_COMMODITY':'E_COMMODITY';const measure=direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO';
      const params={get:[`${commodity}_LDESC`,measure,'CTY_CODE','CTY_NAME','LAST_UPDATE'].join(','),[commodity]:expectedProductCode,COMM_LVL:'HS6',SUMMARY_LVL:'DET',SUMMARY_LVL2:summary,time:month};
      if(u.origin!=='https://api.census.gov'||u.pathname!==`/data/timeseries/intltrade/${direction}/hs`||u.username||u.password||u.hash||[...u.searchParams].length!==Object.keys(params).length||Object.entries(params).some(([k,v])=>u.searchParams.get(k)!==v))fail('Invalid Census query scope');
      parts.push({summary,httpStatus:status as 200|204,payload:r.payload});
    }
    for(const row of normalizeProductResponses(parts,{productCode:expectedProductCode,month,direction})){
      const key=observationKey(row);if(replay.has(key))fail('Duplicate source observation');replay.set(key,row);
    }
  }
  if(replay.size!==release.observations.length)fail('Prepared observations differ from source records');
  for(const row of release.observations){const source=replay.get(observationKey(row));if(!source||Object.keys(source).some(k=>source[k as keyof typeof source]!==row[k as keyof typeof row]))fail('Prepared observation differs from source record');}
  if(release.schemaVersion===2){
    record(release.duties,['schemaVersion','fromMonth','observations','revisedKeys']);
    const dutyReplay=new Map<string,DutyObservation>(),identity=(row:DutyObservation)=>[row.month,row.geography,row.partnerCode].join('/');
    for(let i=-23;i<=0;i++){
      const month=shiftMonth(release.reportingMonth,i),parts:DutyRawPart[]=[];
      for(const summary of ['HS','HSCY','HSRP','HSCYRP'] as const){
        const path=`raw/duties-${month}-${summary}.json`;expected.add(path);
        const r=record(parseArchiveJson(files.get(path)??fail('Missing duty request record'),LIMITS.file),['retrievedAt','requestUrl','httpStatus','payload']);
        if(r.retrievedAt!==release.retrievedAt||typeof r.requestUrl!=='string'||![200,204].includes(r.httpStatus))fail('Invalid duty request metadata');
        let u:URL;try{u=new URL(r.requestUrl);}catch{fail('Invalid duty URL');}
        const params={get:'I_COMMODITY_LDESC,CAL_DUT_MO,CON_VAL_MO,DUT_VAL_MO,CTY_CODE,CTY_NAME,RP,LAST_UPDATE',I_COMMODITY:expectedProductCode,COMM_LVL:'HS6',SUMMARY_LVL:'DET',SUMMARY_LVL2:summary,time:month};
        if(u.origin!=='https://api.census.gov'||u.pathname!=='/data/timeseries/intltrade/imports/hs'||u.username||u.password||u.hash||[...u.searchParams].length!==Object.keys(params).length||Object.entries(params).some(([k,v])=>u.searchParams.get(k)!==v))fail('Invalid duty query scope');
        parts.push({summary,httpStatus:r.httpStatus,payload:r.payload,requestUrl:r.requestUrl,retrievedAt:r.retrievedAt});
      }
      for(const row of normalizeDutyMonth(parts,{productCode:expectedProductCode,month}))dutyReplay.set(identity(row),row);
    }
    if(dutyReplay.size!==release.duties.observations.length)fail('Prepared duties differ from source records');
    for(const row of release.duties.observations){
      record(row,['productCode','month','geography','partnerCode','partnerName','calculatedDuty','consumptionValue','dutiableValue','coverage']);
      const source=dutyReplay.get(identity(row));if(!source)fail('Prepared duty identity differs from source');
      for(const key of ['productCode','month','geography','partnerCode','partnerName'] as const)if(source[key]!==row[key])fail('Prepared duty identity differs from source');
      for(const key of ['calculatedDuty','consumptionValue','dutiableValue'] as const){record(row[key],['valueUsd','status']);if(source[key].valueUsd!==row[key].valueUsd||source[key].status!==row[key].status)fail('Prepared duty amount differs from source');}
      record(row.coverage,['status','uncalculatedDutiableValueUsd']);if(source.coverage.status!==row.coverage.status||source.coverage.uncalculatedDutiableValueUsd!==row.coverage.uncalculatedDutiableValueUsd)fail('Prepared duty coverage differs from source');
    }
  }
  if(files.size!==expected.size||[...files.keys()].some(k=>!expected.has(k)))fail('Unexpected archive file grid');
  return release;
}
export function packBundle(input:BundleInput,expectedProductCode:string=DEFAULT_PRODUCT_CODE):BundlePackage{
  const {prefix}=productArchiveKeys(expectedProductCode);
  if(!idPattern.test(input.releaseId))fail('Invalid archive release ID');
  const release:unknown=parseArchiveJson(input.releaseBytes,LIMITS.file);validateRelease(release,true);
  const files=new Map([['release.json',input.releaseBytes],...input.rawRecords]);
  if(files.size!==(release.schemaVersion===2?337:241))fail('Invalid archive file grid');
  const sorted=[...files].sort(([a],[b])=>a.localeCompare(b));let total=0;
  const descriptors=sorted.map(([path,bytes])=>{total+=bytes.length;if(bytes.length>LIMITS.file||total>LIMITS.total)fail('Archive decoded size limit exceeded');return {path,bytes:bytes.length,sha256:sha256(bytes)};});
  const base:ManifestBase={productCode:expectedProductCode,releaseId:input.releaseId,reportingMonth:release.reportingMonth,retrievedAt:release.retrievedAt,codeVersion:release.codeVersion,previous:input.previous===null?null:validateReference(input.previous,expectedProductCode),files:descriptors};
  const manifest:BundleManifest=release.schemaVersion===2?{schemaVersion:2,...base,scope:{merchandiseMonths:60,dutyMonths:24}}:{schemaVersion:1,...base};
  if(Buffer.byteLength(JSON.stringify(manifest))>LIMITS.manifest)fail('Manifest size limit exceeded');validateFiles(manifest,files,expectedProductCode);
  const bytes=Buffer.from(JSON.stringify({manifest,files:sorted.map(([path,b])=>({path,contentBase64:b.toString('base64')}))}));
  if(bytes.length>LIMITS.bundle)fail('Bundle size limit exceeded');
  return {bytes,reference:{key:`${prefix}releases/${input.releaseId}.json`,sha256:sha256(bytes)}};
}
export function unpackBundle(bytes:Buffer,expectedSha256:string,expectedProductCode:string=DEFAULT_PRODUCT_CODE):DecodedBundle{
  assertProductCode(expectedProductCode);
  if(bytes.length>LIMITS.bundle)fail('Bundle size limit exceeded');
  if(!/^[a-f0-9]{64}$/.test(expectedSha256)||sha256(bytes)!==expectedSha256)fail('Archive checksum mismatch');
  const b=record(parseArchiveJson(bytes,LIMITS.bundle),['manifest','files']);
  const m=record(b.manifest,['schemaVersion','productCode','releaseId','reportingMonth','retrievedAt','codeVersion','previous','files',...(b.manifest?.schemaVersion===2?['scope']:[])]);
  if(Buffer.byteLength(JSON.stringify(m))>LIMITS.manifest)fail('Manifest size limit exceeded');
  const fileCount=m.schemaVersion===2?337:241;
  if(![1,2].includes(m.schemaVersion)||m.productCode!==expectedProductCode||typeof m.releaseId!=='string'||!idPattern.test(m.releaseId)||!validMonth(m.reportingMonth)||!Array.isArray(m.files)||m.files.length!==fileCount||!Array.isArray(b.files)||b.files.length!==fileCount)fail();
  if(m.previous!==null)validateReference(m.previous,expectedProductCode);
  const descriptors=new Map<string,{bytes:number;sha256:string}>();let total=0;
  for(const value of m.files){const f=record(value,['path','bytes','sha256']);if(typeof f.path!=='string'||descriptors.has(f.path)||!Number.isSafeInteger(f.bytes)||f.bytes<0||f.bytes>LIMITS.file||typeof f.sha256!=='string'||!/^[a-f0-9]{64}$/.test(f.sha256))fail('Invalid file size, hash or identity');total+=f.bytes;if(total>LIMITS.total)fail('Archive decoded size limit exceeded');descriptors.set(f.path,{bytes:f.bytes,sha256:f.sha256});}
  const files=new Map<string,Buffer>();
  for(const value of b.files){
    const f=record(value,['path','contentBase64']);const d=descriptors.get(f.path);
    if(!d||files.has(f.path)||typeof f.contentBase64!=='string')fail('Invalid archive file identity');
    if(f.contentBase64.length>4*Math.ceil(LIMITS.file/3)||f.contentBase64.length!==4*Math.ceil(d.bytes/3))fail('Encoded file length limit or size mismatch');
    if(!/^[A-Za-z0-9+/]*={0,2}$/.test(f.contentBase64))fail('Noncanonical base64');
    const data=Buffer.from(f.contentBase64,'base64');if(data.length!==d.bytes||data.toString('base64')!==f.contentBase64||sha256(data)!==d.sha256)fail('File size or checksum mismatch');files.set(f.path,data);
  }
  const manifest=m as BundleManifest;return {manifest,release:validateFiles(manifest,files,expectedProductCode),files};
}
