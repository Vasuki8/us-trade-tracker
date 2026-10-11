import type {CountryContext,CountryPart,CountryFetchOptions,CountryRaw,CountryPrefixFetchOptions,CountryPrefixPart} from './country-audit-types';
import {validMonth} from '../src/lib/trade/normalize';
function validateContext(context:CountryContext){
  if(context.countryCode!=='1220'||!validMonth(context.month)||!['imports','exports'].includes(context.direction)||!['total','products'].includes(context.kind))throw new Error('Invalid country request context');
}
function publicContext(context:CountryContext):CountryContext{return {countryCode:context.countryCode,month:context.month,direction:context.direction,kind:context.kind};}
function fields(direction:CountryContext['direction']){
  const commodity=direction==='imports'?'I_COMMODITY':'E_COMMODITY';
  const measure:CountryPart['measure']=direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO';
  return {commodity,measure,columns:[commodity,`${commodity}_LDESC`,measure,'CTY_CODE','CTY_NAME','COMM_LVL','SUMMARY_LVL','SUMMARY_LVL2','DISTRICT',direction==='imports'?'RP':'DF',...(direction==='imports'?['CTY_SUBCODE']:[]),'LAST_UPDATE']};
}
export function normalizeCountryPart(payload:unknown,context:CountryContext):CountryPart{
  validateContext(context);const {commodity,measure,columns:dimensions}=fields(context.direction);
  if(!Array.isArray(payload)||!Array.isArray(payload[0]))throw new Error('Invalid country Census table');
  const [headers,...cells]=payload as unknown[][];
  if(headers.some(header=>typeof header!=='string')||new Set(headers).size!==headers.length)throw new Error('Invalid country headers');
  const calendar=!headers.includes('time');const columns=[...dimensions,...(calendar?['YEAR','MONTH']:['time'])];
  if(columns.some(column=>!headers.includes(column))||headers.some(header=>!columns.includes(String(header))))throw new Error('Unexpected country columns');
  const seen=new Set<string>();const rows:CountryPart['rows']=[];
  for(const cell of cells){
    if(!Array.isArray(cell)||cell.length!==headers.length)throw new Error('Incomplete country row');
    const row=Object.fromEntries(headers.map((header,index)=>[String(header),cell[index]]));
    if(columns.filter(column=>column!==measure).some(column=>typeof row[column]!=='string'))throw new Error('Invalid country dimension type');
    const periodMatches=calendar?row.YEAR===context.month.slice(0,4)&&row.MONTH===context.month.slice(5):row.time===context.month;
    if(row.CTY_CODE!==context.countryCode||row.CTY_NAME!=='CANADA'||!periodMatches||row.SUMMARY_LVL!=='DET'||row.SUMMARY_LVL2!==(context.kind==='total'?'CY':'HSCY'))throw new Error('Unexpected country identity or aggregation');
    if(['DISTRICT','RP','DF','CTY_SUBCODE'].some(field=>field in row&&row[field]!=='-'))throw new Error('Unexpected country subdivision');
    const code=String(row[commodity]);
    if(context.kind==='total'?(code!=='-'||!['','-'].includes(String(row.COMM_LVL))):(row.COMM_LVL!=='HS6'||!/^\d{6}$/.test(code)))throw new Error('Unexpected country commodity level');
    if(seen.has(code))throw new Error('Duplicate country commodity');seen.add(code);
    const raw=row[measure];const missing=raw===null||raw===''||raw==='null';
    if(!missing&&(typeof raw!=='string'||!/^\d+$/.test(raw)||!Number.isSafeInteger(Number(raw))))throw new Error('Invalid country dollar value');
    rows.push({code,description:String(row[`${commodity}_LDESC`]),valueUsd:missing?null:Number(raw),special:/^(98|99)/.test(code)});
  }
  if(context.kind==='total'&&rows.length!==1)throw new Error('Missing or duplicate country total');
  return {...publicContext(context),measure,rows};
}
const noContent=Symbol('country-no-content');
async function fetchCountryTable(options:CountryFetchOptions,fetchImpl:typeof fetch,mode:'hs'|'export-cumulative'|'import-enduse-total'='hs',commodityPrefix?:string):Promise<unknown>{
  validateContext(options);if(!options.apiKey.trim())throw new Error('Census key required');
  const columns=mode==='import-enduse-total'?['I_ENDUSE','I_ENDUSE_LDESC','GEN_VAL_MO','CTY_CODE','CTY_NAME','COMM_LVL','SUMMARY_LVL','SUMMARY_LVL2','DISTRICT','LAST_UPDATE']:fields(options.direction).columns;
  const url=new URL(`https://api.census.gov/data/timeseries/intltrade/${options.direction}/${mode==='import-enduse-total'?'enduse':'hs'}`);
  url.searchParams.set('CTY_CODE',options.countryCode);url.searchParams.set('SUMMARY_LVL','DET');url.searchParams.set('SUMMARY_LVL2',options.kind==='total'?'CY':'HSCY');
  // Census recommends native calendar predicates to reduce monthly query processing.
  url.searchParams.set('YEAR',options.month.slice(0,4));url.searchParams.set('MONTH',options.month.slice(5));
  if(options.kind==='products')url.searchParams.set('COMM_LVL','HS6');
  if(commodityPrefix!==undefined)url.searchParams.set('I_COMMODITY',`${commodityPrefix}*`);
  // Opt-in diagnostic strategy; returned dimensions still pass the same strict validator.
  if(options.explicitAggregates)for(const field of options.direction==='imports'?['DISTRICT','RP','CTY_SUBCODE']:['DISTRICT','DF'])url.searchParams.set(field,'-');
  url.searchParams.set('get',[...columns,...(mode==='export-cumulative'?['ALL_VAL_YR']:[])].filter(column=>!url.searchParams.has(column)).join(','));
  const requestUrl=url.toString();url.searchParams.set('key',options.apiKey);
  let response:Response|undefined;let attempts=0;let responseBody='';const responses:CountryRaw['responses']=[];
  const persist=async()=>{const last=responses.at(-1)!;await options.onRaw?.({schemaVersion:1,...publicContext(options),requestUrl,retrievedAt:last.retrievedAt,httpStatus:last.httpStatus??0,attempts,responseBody:last.responseBody??'',responses});};
  for(;attempts<3;){
    attempts++;
    try{response=await fetchImpl(url,{signal:AbortSignal.timeout(30_000)});}catch{
      responses.push({attempt:attempts,httpStatus:null,responseBody:null,retrievedAt:new Date().toISOString()});await persist();throw new Error('Country Census request failed or timed out');
    }
    try{responseBody=await response.text();}catch{
      responses.push({attempt:attempts,httpStatus:response.status,responseBody:null,retrievedAt:new Date().toISOString()});await persist();throw new Error('Country Census body failed or timed out');
    }
    if(responseBody.includes(options.apiKey)||responseBody.includes(encodeURIComponent(options.apiKey)))throw new Error('Country response contains a credential');
    responses.push({attempt:attempts,httpStatus:response.status,responseBody,retrievedAt:new Date().toISOString()});
    if(response.status!==429&&response.status<500)break;
    if(attempts<3)await new Promise(resolve=>setTimeout(resolve,500*2**(attempts-1)));
  }
  if(!response)throw new Error('No country Census response');
  await persist();
  if(response.status===204){if(options.kind==='total')throw new Error('Missing country total');return noContent;}
  if(!response.ok)throw new Error(`Country Census HTTP ${response.status}`);
  if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('Country Census returned non-JSON data');
  let payload:unknown;try{payload=JSON.parse(responseBody);}catch{throw new Error('Invalid country Census JSON');}
  return payload;
}
export async function fetchCountryPart(options:CountryFetchOptions,fetchImpl:typeof fetch=fetch):Promise<CountryPart>{
  const payload=await fetchCountryTable(options,fetchImpl);
  return payload===noContent?{...publicContext(options),measure:options.direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO',rows:[]}:normalizeCountryPart(payload,options);
}
function validatePrefixContext(context:CountryContext & {commodityPrefix:string}){
  validateContext(context);if(context.direction!=='imports'||context.kind!=='products'||typeof context.commodityPrefix!=='string'||!/^\d$/.test(context.commodityPrefix))throw new Error('Prefix diagnostic requires an import HS6 single-digit prefix');
}
export function normalizeCountryImportPrefix(payload:unknown,context:CountryContext & {commodityPrefix:string}):CountryPrefixPart{
  validatePrefixContext(context);const part=normalizeCountryPart(payload,context);
  if(part.rows.some(row=>!row.code.startsWith(context.commodityPrefix)))throw new Error('Unexpected out-of-prefix commodity');
  return {...part,commodityPrefix:context.commodityPrefix,completeCountryBreakdown:false};
}
export async function fetchCountryImportPrefix(options:CountryPrefixFetchOptions,fetchImpl:typeof fetch=fetch):Promise<CountryPrefixPart>{
  validatePrefixContext(options);if(options.explicitAggregates)throw new Error('Prefix diagnostic does not combine subdivision query changes');
  const payload=await fetchCountryTable({...options,onRaw:async raw=>{await options.onRaw?.({...raw,commodityPrefix:options.commodityPrefix,completeCountryBreakdown:false});}},fetchImpl,'hs',options.commodityPrefix);
  return payload===noContent?{...publicContext(options),measure:'GEN_VAL_MO',rows:[],commodityPrefix:options.commodityPrefix,completeCountryBreakdown:false}:normalizeCountryImportPrefix(payload,options);
}
export function normalizeCountryExportCumulativeTotal(payload:unknown,context:CountryContext){
  validateContext(context);if(context.direction!=='exports'||context.kind!=='total')throw new Error('Cumulative diagnostic requires an export total');
  if(!Array.isArray(payload)||!Array.isArray(payload[0]))throw new Error('Invalid cumulative table');
  const table=payload as unknown[][],headers=table[0],index=headers.indexOf('ALL_VAL_YR');
  if(index<0||headers.lastIndexOf('ALL_VAL_YR')!==index)throw new Error('Missing or duplicate cumulative column');
  if(table.some(row=>!Array.isArray(row)||row.length!==headers.length))throw new Error('Incomplete cumulative table');
  // Validate the ordinary total dimensions without changing the original retained body.
  const part=normalizeCountryPart(table.map(row=>row.filter((_,column)=>column!==index)),context);
  const raw=table[1][index],missing=raw===null||raw===''||raw==='null';
  if(!missing&&(typeof raw!=='string'||!/^\d+$/.test(raw)||!Number.isSafeInteger(Number(raw))))throw new Error('Invalid cumulative dollar value');
  return {part,yearToDateUsd:missing?null:Number(raw)};
}
export async function fetchCountryExportCumulativeTotal(options:CountryFetchOptions,fetchImpl:typeof fetch=fetch){
  validateContext(options);if(options.direction!=='exports'||options.kind!=='total')throw new Error('Cumulative diagnostic requires an export total');
  return normalizeCountryExportCumulativeTotal(await fetchCountryTable(options,fetchImpl,'export-cumulative'),options);
}

function validateEnduseContext(context:CountryContext){validateContext(context);if(context.direction!=='imports'||context.kind!=='total')throw new Error('End-use diagnostic requires an import total');}
// This endpoint has no RP or CTY_SUBCODE fields. Validate its own aggregate contract.
export function normalizeCountryImportEnduseTotal(payload:unknown,context:CountryContext){
  validateEnduseContext(context);
  const columns=['I_ENDUSE','I_ENDUSE_LDESC','GEN_VAL_MO','CTY_CODE','CTY_NAME','COMM_LVL','SUMMARY_LVL','SUMMARY_LVL2','DISTRICT','LAST_UPDATE','YEAR','MONTH'];
  if(!Array.isArray(payload)||payload.length!==2||!Array.isArray(payload[0])||!Array.isArray(payload[1]))throw new Error('Missing or duplicate end-use total');
  const [headers,cell]=payload as unknown[][];
  if(headers.some(header=>typeof header!=='string')||new Set(headers).size!==headers.length||headers.length!==columns.length||columns.some(column=>!headers.includes(column))||cell.length!==headers.length)throw new Error('Unexpected end-use columns');
  const row=Object.fromEntries(headers.map((header,index)=>[String(header),cell[index]]));
  if(columns.filter(column=>column!=='GEN_VAL_MO').some(column=>typeof row[column]!=='string'))throw new Error('Invalid end-use dimension type');
  if(row.I_ENDUSE!=='-'||!['','-'].includes(String(row.COMM_LVL))||row.CTY_CODE!==context.countryCode||row.CTY_NAME!=='CANADA'||row.SUMMARY_LVL!=='DET'||row.SUMMARY_LVL2!=='CY'||row.DISTRICT!=='-'||row.YEAR!==context.month.slice(0,4)||row.MONTH!==context.month.slice(5))throw new Error('Unexpected end-use identity or aggregation');
  const raw=row.GEN_VAL_MO,missing=raw===null||raw===''||raw==='null';
  if(!missing&&(typeof raw!=='string'||!/^\d+$/.test(raw)||!Number.isSafeInteger(Number(raw))))throw new Error('Invalid end-use dollar value');
  return {countryCode:context.countryCode,month:context.month,endpoint:'enduse' as const,measure:'GEN_VAL_MO' as const,description:String(row.I_ENDUSE_LDESC),valueUsd:missing?null:Number(raw)};
}
export async function fetchCountryImportEnduseTotal(options:CountryFetchOptions,fetchImpl:typeof fetch=fetch){
  validateEnduseContext(options);if(options.explicitAggregates)throw new Error('End-use diagnostic does not support HS subdivision predicates');
  return normalizeCountryImportEnduseTotal(await fetchCountryTable(options,fetchImpl,'import-enduse-total'),options);
}
