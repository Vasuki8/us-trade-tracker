import {mkdir,writeFile,lstat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {normalizeProductResponses} from './census-client';
import type {Direction} from '../src/lib/trade/types';

const months=['2021-09','2026-08'] as const;
const summaries=['HS','HSCY'] as const;
const responseLimit=1_048_576,totalLimit=8_388_608,reportReserve=65_536;
const output='.tmp/cocoa-diagnostic';
const safeCodes=new Set(['UND_ERR_CONNECT_TIMEOUT','UND_ERR_HEADERS_TIMEOUT','UND_ERR_BODY_TIMEOUT','ECONNRESET','ETIMEDOUT','ENOTFOUND','ECONNREFUSED','ENETUNREACH','EHOSTUNREACH','ABORT_ERR']);
type Summary=typeof summaries[number];
type Phase='complete'|'fetch'|'body'|'status'|'content-type'|'json'|'credential'|'limit'|'encoding';
type Event={month:string;direction:Direction;summary:Summary;requestUrl:string;retrievedAt:string;elapsedMs:number;httpStatus:number|null;phase:Phase;errorCode:string|null;bytesRead:number};
type RawFile={path:string;bytes:number;sha256:string};
type Pair={month:string;direction:Direction;validation:'passed'|'failed'|'unavailable';reason:'normalization'|'part-summary'|null;worldRows:number|null;countryRows:number|null;countryResponseEmpty:boolean};
type Part={summary:Summary;httpStatus:200|204;payload:unknown};
type ProbeOptions={apiKey:string;outputDir:string;codeVersion:string};
type Report={schemaVersion:1;purpose:'merchandise-diagnostic';productCode:'180100';codeVersion:string;releaseAccepted:false;coverage:'unverified';probePassed:boolean;attempts:number;bytesRead:number;events:Event[];pairs:Pair[];rawFiles:RawFile[]};

// No configurable product, periods, endpoint, retry policy or deadline.
function request(month:string,direction:Direction,summary:Summary){
 const commodity=direction==='imports'?'I_COMMODITY':'E_COMMODITY';
 const measure=direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO';
 const url=new URL('https://api.census.gov/data/timeseries/intltrade/'+direction+'/hs');
 url.searchParams.set('get',[commodity+'_LDESC',measure,'CTY_CODE','CTY_NAME','LAST_UPDATE'].join(','));
 for(const [name,value] of Object.entries({[commodity]:'180100',COMM_LVL:'HS6',SUMMARY_LVL:'DET',SUMMARY_LVL2:summary,time:month}))url.searchParams.set(name,value);
 return url;
}
function credentialBearing(text:string,key:string){
 const unicode=text.replace(/\\u([a-f\d]{4})/gi,(_,code:string)=>String.fromCharCode(parseInt(code,16)));
 let decoded=unicode;
 try{decoded=decodeURIComponent(unicode.replace(/\+/g,' '));}catch{/* Raw and Unicode checks still apply to invalid URI text. */}
 return [text,unicode,decoded].some(value=>value.includes(key)||value.includes(encodeURIComponent(key)));
}
function transportCode(error:unknown,timedOut:boolean){
 if(timedOut)return 'timeout';
 const e=error as {cause?:{code?:unknown};code?:unknown;name?:unknown};
 const code=e?.cause?.code??e?.code;
 return typeof code==='string'&&safeCodes.has(code)?code:e?.name==='AbortError'?'aborted':'unknown';
}
async function fresh(path:string){
 try{await lstat(path);}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return;throw new Error('Cannot inspect diagnostic output');}
 throw new Error('Diagnostic requires fresh output; directory exists');
}
export function cocoaProbeMode(args:string[]){
 if(args.length===0)return 'run';
 if(args.length===1&&args[0]==='--preflight')return 'preflight';
 throw new Error('Cocoa diagnostic accepts only its fixed run or --preflight');
}
export async function runCocoaProbe(options:ProbeOptions,fetchImpl:typeof fetch=fetch):Promise<Report>{
 if(!/^[A-Za-z0-9]{16,128}$/.test(options.apiKey)||!/^[a-f0-9]{40}$/.test(options.codeVersion))throw new Error('Invalid diagnostic credentials or code identity');
 await fresh(options.outputDir);
 await mkdir(resolve(options.outputDir,'..'),{recursive:true});
 // mkdir without recursive refuses occupied/symlink output, including races.
 await mkdir(options.outputDir);await mkdir(join(options.outputDir,'raw'));
 const report:Report={schemaVersion:1,purpose:'merchandise-diagnostic',productCode:'180100',codeVersion:options.codeVersion,releaseAccepted:false,coverage:'unverified',probePassed:false,attempts:0,bytesRead:0,events:[],pairs:[],rawFiles:[]};
 async function checkpoint(){
  const text=JSON.stringify(report,null,2)+'\n';
  if(Buffer.byteLength(text)>reportReserve||credentialBearing(text,options.apiKey))throw new Error('Unsafe diagnostic report');
  await writeFile(join(options.outputDir,'probe.json'),text);
 }
 await checkpoint();
 for(const month of months)for(const direction of ['imports','exports'] as const){
  const parts:Part[]=[];
  for(const summary of summaries){
   const url=request(month,direction,summary),start=Date.now();
   const event:Event={month,direction,summary,requestUrl:url.toString(),retrievedAt:new Date().toISOString(),elapsedMs:0,httpStatus:null,phase:'fetch',errorCode:null,bytesRead:0};
   report.events.push(event);
   const available=Math.min(responseLimit,totalLimit-reportReserve-report.bytesRead);
   if(available<=0){event.phase='limit';await checkpoint();continue;}
   url.searchParams.set('key',options.apiKey);
   const controller=new AbortController();let timedOut=false;
   let reader:ReadableStreamDefaultReader<Uint8Array>|undefined;
   let rejectDeadline!:(error:Error)=>void;
   const deadline=new Promise<never>((_,reject)=>{rejectDeadline=reject;});
   const timer=setTimeout(()=>{timedOut=true;rejectDeadline(new Error('deadline'));controller.abort();},30_000);
   try{
    report.attempts++;
    const response=await Promise.race([fetchImpl(url,{signal:controller.signal,redirect:'manual'}),deadline]);
    event.httpStatus=response.status;event.phase='body';
    reader=response.body?.getReader();
    const chunks:Uint8Array[]=[];
    if(reader)while(true){
     const next=await Promise.race([reader.read(),deadline]);if(next.done)break;
     const consumed=Math.min(next.value.byteLength,available-event.bytesRead+1);
     event.bytesRead+=consumed;report.bytesRead+=consumed;
     if(event.bytesRead>available){event.phase='limit';break;}
     chunks.push(next.value);
    }
    if(event.phase==='limit')continue;
    const body=Buffer.concat(chunks);
    let text:string;
    try{text=new TextDecoder('utf-8',{fatal:true}).decode(body);}catch{event.phase='encoding';continue;}
    if(credentialBearing(text,options.apiKey)){event.phase='credential';continue;}
    const path='raw/'+month+'-'+direction+'-'+summary+'.body';
    await writeFile(join(options.outputDir,path),body,{flag:'wx'});
    report.rawFiles.push({path,bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')});
    event.phase='status';
    if(response.status===204){parts.push({summary,httpStatus:204,payload:null});event.phase='complete';continue;}
    if(response.status!==200)continue;
    event.phase='content-type';
    if(!response.headers.get('content-type')?.toLowerCase().includes('application/json'))continue;
    event.phase='json';let payload:unknown;
    try{payload=JSON.parse(text);}catch{continue;}
    parts.push({summary,httpStatus:200,payload});event.phase='complete';
   }catch(error){
    if(event.phase!=='fetch'&&event.phase!=='body')throw new Error('Diagnostic could not safely retain evidence');
    event.errorCode=transportCode(error,timedOut);
   }finally{
    clearTimeout(timer);controller.abort();
    // Never await a potentially stalled stream cleanup.
    if(reader)void reader.cancel().catch(()=>{});
    event.elapsedMs=Date.now()-start;await checkpoint();
   }
  }
  const pair:Pair={month,direction,validation:'unavailable',reason:null,worldRows:null,countryRows:null,countryResponseEmpty:parts.some(p=>p.summary==='HSCY'&&p.httpStatus===204)};
  if(parts.length===2){
   pair.validation='failed';
   const summariesMatch=parts.every(p=>{
    if(p.httpStatus===204||!Array.isArray(p.payload)||!Array.isArray(p.payload[0]))return true;
    const table=p.payload as unknown[][];
    return table.slice(1).every(row=>Array.isArray(row)&&row[table[0].indexOf('SUMMARY_LVL2')]===p.summary);
   });
   if(!summariesMatch)pair.reason='part-summary';
   else try{
    const rows=normalizeProductResponses(parts,{productCode:'180100',month,direction});
    pair.validation='passed';pair.worldRows=rows.filter(r=>r.geography==='world').length;pair.countryRows=rows.filter(r=>r.geography==='country').length;
   }catch{pair.reason='normalization';}
  }
  report.pairs.push(pair);await checkpoint();
 }
 report.probePassed=report.events.length===8&&report.events.every(e=>e.phase==='complete')&&report.pairs.every(p=>p.validation==='passed');
 await checkpoint();return report;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 try{
  const mode=cocoaProbeMode(process.argv.slice(2));await fresh(output);
  if(mode==='preflight')console.log('Fixed cocoa diagnostic: at most 8 requests, one attempt each, 30 seconds each; fresh private output.');
  else{
   const report=await runCocoaProbe({apiKey:process.env.CENSUS_API_KEY??'',outputDir:output,codeVersion:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()});
   console.log('Cocoa diagnostic: '+report.attempts+' attempts; '+(report.probePassed?'response pairs validated':'inspect safe failure evidence')+'. Coverage unverified; no release accepted.');
   if(!report.probePassed)process.exitCode=1;
  }
 }catch{console.error('Cocoa diagnostic stopped; inspect safe retained evidence if present. No release accepted.');process.exitCode=1;}
}
