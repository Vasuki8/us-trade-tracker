import type {CountryContext,CountryPart,CountryFetchOptions,CountryRaw} from './country-audit-types';
import {validMonth} from '../src/lib/trade/normalize';
function validateContext(context:CountryContext){
  if(context.countryCode!=='1220'||!validMonth(context.month)||!['imports','exports'].includes(context.direction)||!['total','products'].includes(context.kind))throw new Error('Invalid country request context');
}
function publicContext(context:CountryContext):CountryContext{return {countryCode:context.countryCode,month:context.month,direction:context.direction,kind:context.kind};}
function fields(direction:CountryContext['direction']){
  const commodity=direction==='imports'?'I_COMMODITY':'E_COMMODITY';
  const measure=direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO';
  return {commodity,measure,columns:[commodity,`${commodity}_LDESC`,measure,'CTY_CODE','CTY_NAME','COMM_LVL','SUMMARY_LVL','SUMMARY_LVL2','time','DISTRICT',direction==='imports'?'RP':'DF',...(direction==='imports'?['CTY_SUBCODE']:[]),'LAST_UPDATE']};
}
export function normalizeCountryPart(payload:unknown,context:CountryContext):CountryPart{
  validateContext(context);const {commodity,measure,columns}=fields(context.direction);
  if(!Array.isArray(payload)||!Array.isArray(payload[0]))throw new Error('Invalid country Census table');
  const [headers,...cells]=payload as unknown[][];
  if(headers.some(header=>typeof header!=='string')||new Set(headers).size!==headers.length)throw new Error('Invalid country headers');
  if(columns.some(column=>!headers.includes(column))||headers.some(header=>!columns.includes(String(header))))throw new Error('Unexpected country columns');
  const seen=new Set<string>();const rows:CountryPart['rows']=[];
  for(const cell of cells){
    if(!Array.isArray(cell)||cell.length!==headers.length)throw new Error('Incomplete country row');
    const row=Object.fromEntries(headers.map((header,index)=>[String(header),cell[index]]));
    if(columns.filter(column=>column!==measure).some(column=>typeof row[column]!=='string'))throw new Error('Invalid country dimension type');
    if(row.CTY_CODE!==context.countryCode||row.CTY_NAME!=='CANADA'||row.time!==context.month||row.SUMMARY_LVL!=='DET'||row.SUMMARY_LVL2!==(context.kind==='total'?'CY':'HSCY'))throw new Error('Unexpected country identity or aggregation');
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
export async function fetchCountryPart(options:CountryFetchOptions,fetchImpl:typeof fetch=fetch):Promise<CountryPart>{
  validateContext(options);if(!options.apiKey.trim())throw new Error('Census key required');
  const {columns}=fields(options.direction);
  const url=new URL(`https://api.census.gov/data/timeseries/intltrade/${options.direction}/hs`);
  url.searchParams.set('CTY_CODE',options.countryCode);url.searchParams.set('SUMMARY_LVL','DET');url.searchParams.set('SUMMARY_LVL2',options.kind==='total'?'CY':'HSCY');url.searchParams.set('time',options.month);
  if(options.kind==='products')url.searchParams.set('COMM_LVL','HS6');
  url.searchParams.set('get',columns.filter(column=>!url.searchParams.has(column)).join(','));
  const requestUrl=url.toString();url.searchParams.set('key',options.apiKey);
  let response:Response|undefined;let attempts=0;
  try{
    for(;attempts<3;){
      attempts++;response=await fetchImpl(url,{signal:AbortSignal.timeout(30_000)});
      if(response.status!==429&&response.status<500)break;
      if(attempts<3)await new Promise(resolve=>setTimeout(resolve,500*2**(attempts-1)));
    }
  }catch{throw new Error('Country Census request failed or timed out');}
  if(!response)throw new Error('No country Census response');
  let responseBody:string;try{responseBody=await response.text();}catch{throw new Error('Country Census body failed or timed out');}
  if(responseBody.includes(options.apiKey)||responseBody.includes(encodeURIComponent(options.apiKey)))throw new Error('Country response contains a credential');
  const raw:CountryRaw={schemaVersion:1,countryCode:options.countryCode,month:options.month,direction:options.direction,kind:options.kind,requestUrl,retrievedAt:new Date().toISOString(),httpStatus:response.status,attempts,responseBody};
  await options.onRaw?.(raw);
  if(response.status===204){if(options.kind==='total')throw new Error('Missing country total');return {...publicContext(options),measure:options.direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO',rows:[]};}
  if(!response.ok)throw new Error(`Country Census HTTP ${response.status}`);
  if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('Country Census returned non-JSON data');
  let payload:unknown;try{payload=JSON.parse(responseBody);}catch{throw new Error('Invalid country Census JSON');}
  return normalizeCountryPart(payload,options);
}
