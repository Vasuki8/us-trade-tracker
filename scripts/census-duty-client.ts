import type {DutyRawPart} from '../src/lib/trade/duty-types';
import {validMonth} from '../src/lib/trade/normalize';
export type FetchDutyOptions={productCode:string;month:string;apiKey:string;retrievedAt:string;signal?:AbortSignal;onRaw?:(part:DutyRawPart)=>Promise<void>};
export async function fetchDutyMonth(options:FetchDutyOptions,fetchImpl:typeof fetch=fetch):Promise<DutyRawPart[]>{
  if(!/^\d{6}$/.test(options.productCode)||!validMonth(options.month)||!options.apiKey.trim()||!Number.isFinite(Date.parse(options.retrievedAt)))throw new Error('Invalid duty request options');
  const parts:DutyRawPart[]=[];
  for(const summary of ['HS','HSCY','HSRP','HSCYRP'] as const){
    const url=new URL('https://api.census.gov/data/timeseries/intltrade/imports/hs');
    url.searchParams.set('get','I_COMMODITY_LDESC,CAL_DUT_MO,CON_VAL_MO,DUT_VAL_MO,CTY_CODE,CTY_NAME,LAST_UPDATE');
    url.searchParams.set('I_COMMODITY',options.productCode);url.searchParams.set('COMM_LVL','HS6');url.searchParams.set('SUMMARY_LVL','DET');url.searchParams.set('SUMMARY_LVL2',summary);url.searchParams.set('time',options.month);
    const requestUrl=url.toString();url.searchParams.set('key',options.apiKey);
    let response:Response|undefined;
    for(let attempt=0;attempt<3;attempt++){
      if(options.signal?.aborted)throw new Error('Duty retrieval canceled');
      const deadline=AbortSignal.timeout(30_000);const signal=options.signal?AbortSignal.any([options.signal,deadline]):deadline;
      try{response=await fetchImpl(url,{signal});}catch{throw new Error('Duty Census request failed or timed out');}
      if(response.status!==429&&response.status<500)break;
      if(attempt<2)await new Promise(resolve=>setTimeout(resolve,500*2**attempt));
    }
    if(!response)throw new Error('No duty Census response');
    let payload:unknown=null;let httpStatus:200|204;
    if(response.status===204){httpStatus=204;}
    else{
      if(!response.ok)throw new Error(`Duty Census HTTP ${response.status}`);
      if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('Duty Census returned non-JSON data');
      try{payload=await response.json();}catch{throw new Error('Invalid duty Census JSON');}
      if(!Array.isArray(payload)||!Array.isArray(payload[0]))throw new Error('Invalid duty Census table');
      if(JSON.stringify(payload).includes(options.apiKey))throw new Error('Duty Census response contains a credential');
      httpStatus=200;
    }
    if(options.signal?.aborted)throw new Error('Duty retrieval canceled');
    const part:DutyRawPart={summary,httpStatus,payload,requestUrl,retrievedAt:options.retrievedAt};
    await options.onRaw?.(part);parts.push(part);
  }
  return parts;
}
