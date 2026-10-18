import type {DutyRawPart} from '../src/lib/trade/duty-types';
import {validMonth} from '../src/lib/trade/normalize';
import {CensusRequestError,credentialBearing,safeTransportCode,type CensusFailureContext} from './census-failure';
export type FetchDutyOptions={productCode:string;month:string;apiKey:string;retrievedAt:string;signal?:AbortSignal;onRaw?:(part:DutyRawPart)=>Promise<void>};
export async function fetchDutyMonth(options:FetchDutyOptions,fetchImpl:typeof fetch=fetch):Promise<DutyRawPart[]>{
  if(!/^\d{6}$/.test(options.productCode)||!validMonth(options.month)||!options.apiKey.trim()||!Number.isFinite(Date.parse(options.retrievedAt)))throw new Error('Invalid duty request options');
  const parts:DutyRawPart[]=[];
  for(const summary of ['HS','HSCY','HSRP','HSCYRP'] as const){
    const url=new URL('https://api.census.gov/data/timeseries/intltrade/imports/hs');
    url.searchParams.set('get','I_COMMODITY_LDESC,CAL_DUT_MO,CON_VAL_MO,DUT_VAL_MO,CTY_CODE,CTY_NAME,RP,LAST_UPDATE');
    url.searchParams.set('I_COMMODITY',options.productCode);url.searchParams.set('COMM_LVL','HS6');url.searchParams.set('SUMMARY_LVL','DET');url.searchParams.set('SUMMARY_LVL2',summary);url.searchParams.set('time',options.month);
    const requestUrl=url.toString();url.searchParams.set('key',options.apiKey);
    let response:Response|undefined,signal:AbortSignal|undefined,attempts=0,start=Date.now();
    const fail=(message:string,phase:CensusFailureContext['phase'],transportCode:string|null=null)=>new CensusRequestError(message,{productCode:options.productCode,month:options.month,direction:'imports',dataset:'duties',summary,requestUrl,phase,attempt:attempts,httpStatus:response?.status??null,elapsedMs:Date.now()-start,transportCode});
    for(let attempt=0;attempt<3;attempt++){
      if(options.signal?.aborted)throw fail('Duty retrieval canceled','fetch','canceled');
      attempts=attempt+1;start=Date.now();
      const deadline=AbortSignal.timeout(30_000);signal=options.signal?AbortSignal.any([options.signal,deadline]):deadline;
      response=undefined;
      try{response=await fetchImpl(url,{signal});}catch(error){throw fail('Duty Census request failed or timed out','fetch',safeTransportCode(error,signal,options.signal));}
      if(response.status!==429&&response.status<500)break;
      if(attempt<2)await new Promise(resolve=>setTimeout(resolve,500*2**attempt));
    }
    if(!response)throw fail('No duty Census response','fetch');
    let payload:unknown=null;let httpStatus:200|204;
    if(response.status===204){httpStatus=204;}
    else{
      if(!response.ok)throw fail('Duty Census HTTP '+response.status,'http');
      if(!response.headers.get('content-type')?.includes('application/json'))throw fail('Duty Census returned non-JSON data','content-type');
      try{payload=await response.json();}catch(error){throw fail('Invalid duty Census JSON',error instanceof SyntaxError?'json':'body',error instanceof SyntaxError?null:safeTransportCode(error,signal,options.signal));}
      if(!Array.isArray(payload)||!Array.isArray(payload[0]))throw fail('Invalid duty Census table','validation');
      if(credentialBearing(JSON.stringify(payload),options.apiKey))throw fail('Duty Census response contains a credential','capture');
      httpStatus=200;
    }
    if(options.signal?.aborted)throw fail('Duty retrieval canceled','capture','canceled');
    const part:DutyRawPart={summary,httpStatus,payload,requestUrl,retrievedAt:options.retrievedAt};
    try{await options.onRaw?.(part);}catch{throw fail('Duty Census raw capture failed','capture');}
    parts.push(part);
  }
  return parts;
}
