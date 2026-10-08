import type {Direction,Observation} from '../src/lib/trade/types';
import {normalizeCensusResponse,validMonth} from '../src/lib/trade/normalize';
export type FetchOptions={productCode:string;month:string;direction:Direction;apiKey:string;signal?:AbortSignal;onRaw?:(payload:unknown,url:string)=>Promise<void>};
export async function fetchProductMonth(options:FetchOptions,fetchImpl:typeof fetch=fetch):Promise<Observation[]> {
  if(!/^\d{6}$/.test(options.productCode)||!validMonth(options.month)||!options.apiKey.trim()||!['imports','exports'].includes(options.direction))throw new Error('Invalid Census request options');
  const commodity=options.direction==='imports'?'I_COMMODITY':'E_COMMODITY';
  const measure=options.direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO';
  const payloads:unknown[][][]=[];
  for(const summary of ['HS','HSCY']){
    const url=new URL(`https://api.census.gov/data/timeseries/intltrade/${options.direction}/hs`);
    url.searchParams.set('get',[commodity,`${commodity}_LDESC`,measure,'CTY_CODE','CTY_NAME','COMM_LVL','SUMMARY_LVL','SUMMARY_LVL2','LAST_UPDATE'].join(','));
    url.searchParams.set(commodity,options.productCode);url.searchParams.set('COMM_LVL','HS6');
    url.searchParams.set('SUMMARY_LVL','DET');url.searchParams.set('SUMMARY_LVL2',summary);
    url.searchParams.set('time',options.month);
    const sanitized=url.toString();url.searchParams.set('key',options.apiKey);
    let response:Response|undefined;
    for(let attempt=0;attempt<3;attempt++){
      const signal=options.signal?AbortSignal.any([options.signal,AbortSignal.timeout(30_000)]):AbortSignal.timeout(30_000);
      try{response=await fetchImpl(url,{signal});}catch{throw new Error('Census request failed or timed out; the current release is unchanged');}
      if(response.status!==429&&response.status<500)break;
      if(attempt<2)await new Promise(resolve=>setTimeout(resolve,500*2**attempt));
    }
    if(!response)throw new Error('No Census response');
    if(response.status===204){if(summary==='HS')throw new Error('Missing world observation');continue;}
    if(!response.ok)throw new Error(`Census HTTP ${response.status}; the current release is unchanged`);
    if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('Census returned non-JSON data');
    let payload:unknown;
    try{payload=await response.json();}catch{throw new Error('Invalid Census JSON');}
    if(!Array.isArray(payload)||!Array.isArray(payload[0]))throw new Error('Invalid Census table');
    if(options.signal?.aborted)throw new Error('Data import canceled');
    await options.onRaw?.(payload,sanitized);
    payloads.push(payload);
  }
  const headers=payloads[0][0];
  const combined=[headers];
  for(const payload of payloads){
    if(new Set(payload[0]).size!==payload[0].length||payload[0].length!==headers.length||headers.some(h=>!payload[0].includes(h)))throw new Error('Inconsistent Census headers');
    for(const row of payload.slice(1)){
      if(!Array.isArray(row)||row.length!==headers.length)throw new Error('Incomplete Census row');
      combined.push(headers.map(h=>row[payload[0].indexOf(h)]));
    }
  }
  const observations=normalizeCensusResponse(combined,options.direction);
  if(observations.some(r=>r.productCode!==options.productCode||r.month!==options.month))throw new Error('Unexpected product or reporting month');
  return observations;
}
