import {mkdir,writeFile,lstat,open,appendFile} from 'node:fs/promises';
import {join,relative,basename} from 'node:path';
import {createHash} from 'node:crypto';
import {credentialBearing,type CensusFailureContext} from './census-failure';
import {validMonth} from '../src/lib/trade/normalize';

export type CompletedCapture={name:string;bytes:number;sha256:string};
const limit=64*1024*1024,reportReserve=256*1024;
const runPattern=/^20\d{2}-(0[1-9]|1[0-2])-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const rawPattern=/^(?:(?:imports|exports)-20\d{2}-(?:0[1-9]|1[0-2])-(?:HS|HSCY)|duties-20\d{2}-(?:0[1-9]|1[0-2])-(?:HS|HSCY|HSRP|HSCYRP))\.json$/;
const transportCodes=new Set(['unknown','timeout','canceled','UND_ERR_CONNECT_TIMEOUT','UND_ERR_HEADERS_TIMEOUT','UND_ERR_BODY_TIMEOUT','ECONNRESET','ETIMEDOUT','ENOTFOUND','ECONNREFUSED','ENETUNREACH','EHOSTUNREACH','ABORT_ERR']);
type Input={root:string;runId:string;productCode:string;reportingMonth:string;codeVersion:string;apiKey:string;rawDir:string;captures:CompletedCapture[];failure:CensusFailureContext};
function safeContext(c:CensusFailureContext,productCode:string):CensusFailureContext{
 if(!c||c.productCode!==productCode||!validMonth(c.month)||!['merchandise','duties','release'].includes(c.dataset)||!['imports','exports',null].includes(c.direction)||c.dataset==='duties'&&c.direction!=='imports'||c.dataset!=='release'&&c.direction===null||!['HS','HSCY','HSRP','HSCYRP',null].includes(c.summary)||!['fetch','http','content-type','body','json','validation','capture'].includes(c.phase))throw new Error('Invalid failure context');
 if(c.attempt!==null&&(!Number.isInteger(c.attempt)||c.attempt<0||c.attempt>3)||c.httpStatus!==null&&(!Number.isInteger(c.httpStatus)||c.httpStatus<100||c.httpStatus>599)||c.elapsedMs!==null&&(!Number.isSafeInteger(c.elapsedMs)||c.elapsedMs<0))throw new Error('Invalid failure context');
 if(c.requestUrl!==null){
  if(typeof c.requestUrl!=='string'||c.requestUrl.length>2048)throw new Error('Invalid failure URL');
  const url=new URL(c.requestUrl);
  if(url.origin!=='https://api.census.gov'||url.pathname!=='/data/timeseries/intltrade/'+c.direction+'/hs'||url.username||url.password||url.hash||[...url.searchParams.keys()].some(k=>k.toLowerCase()==='key'))throw new Error('Invalid failure URL');
 }
 return {productCode:c.productCode,month:c.month,direction:c.direction,dataset:c.dataset,summary:c.summary,requestUrl:c.requestUrl,phase:c.phase,attempt:c.attempt,httpStatus:c.httpStatus,elapsedMs:c.elapsedMs,transportCode:c.transportCode===null?null:transportCodes.has(c.transportCode)?c.transportCode:'unknown'};
}
async function readBounded(path:string,max:number){
 const handle=await open(path,'r');
 try{
  const chunks:Buffer[]=[];let total=0;
  if(!(await handle.stat()).isFile())throw new Error('Not a capture file');
  while(true){
   const buffer=Buffer.alloc(Math.min(65536,max-total+1));
   const {bytesRead}=await handle.read(buffer);if(!bytesRead)break;
   total+=bytesRead;if(total>max)throw new Error('Capture byte limit exceeded');
   chunks.push(buffer.subarray(0,bytesRead));
  }
  return Buffer.concat(chunks,total);
 }finally{await handle.close();}
}
export async function writeImportFailureEvidence(input:Input){
 if(!/^\d{6}$/.test(input.productCode)||!validMonth(input.reportingMonth)||!runPattern.test(input.runId)||basename(input.rawDir)!==input.runId||!input.runId.startsWith(input.reportingMonth+'-')||!/^[a-zA-Z0-9._-]{1,128}$/.test(input.codeVersion)||!input.apiKey||!Array.isArray(input.captures)||input.captures.length>336)throw new Error('Invalid failure evidence options');
 const failure=safeContext(input.failure,input.productCode),names=new Set<string>();
 for(const c of input.captures){
  if(!rawPattern.test(c.name)||names.has(c.name)||!Number.isSafeInteger(c.bytes)||c.bytes<0||!/^[a-f0-9]{64}$/.test(c.sha256))throw new Error('Invalid completed capture');
  names.add(c.name);
 }
 await mkdir(input.root,{recursive:true});
 const path=join(input.root,input.runId);await mkdir(path);await mkdir(join(path,'raw'));
 const rawFiles:{path:string;bytes:number;sha256:string}[]=[];
 const omitted:{path:string;reason:'budget'|'not-regular'|'changed'|'credential'|'read-failed'}[]=[];
 let rawBytes=0;
 for(const capture of [...input.captures].sort((a,b)=>a.name.localeCompare(b.name))){
  const filePath='raw/'+capture.name;
  if(capture.bytes>limit-reportReserve-rawBytes){omitted.push({path:filePath,reason:'budget'});continue;}
  let bytes:Buffer;
  try{
   const source=join(input.rawDir,capture.name),info=await lstat(source);
   if(!info.isFile()||info.isSymbolicLink()){omitted.push({path:filePath,reason:'not-regular'});continue;}
   if(info.size!==capture.bytes){omitted.push({path:filePath,reason:'changed'});continue;}
   bytes=await readBounded(source,capture.bytes);
  }catch{omitted.push({path:filePath,reason:'read-failed'});continue;}
  if(bytes.length!==capture.bytes||createHash('sha256').update(bytes).digest('hex')!==capture.sha256){omitted.push({path:filePath,reason:'changed'});continue;}
  if(credentialBearing(bytes.toString('utf8'),input.apiKey)){omitted.push({path:filePath,reason:'credential'});continue;}
  await writeFile(join(path,filePath),bytes,{flag:'wx'});
  rawBytes+=bytes.length;rawFiles.push({path:filePath,bytes:bytes.length,sha256:capture.sha256});
 }
 const report={schemaVersion:1,purpose:'failed-import-evidence',releaseAccepted:false,productCode:input.productCode,reportingMonth:input.reportingMonth,runId:input.runId,codeVersion:input.codeVersion,recordedAt:new Date().toISOString(),failure,completedCaptureCount:input.captures.length,rawFiles,omitted,rawBytes,limitBytes:limit};
 const reportBytes=Buffer.from(JSON.stringify(report,null,2)+'\n');
 if(reportBytes.length>reportReserve||rawBytes+reportBytes.length>limit||credentialBearing(reportBytes.toString('utf8'),input.apiKey))throw new Error('Unsafe failure report');
 // The ready marker appears last. Partial directories never become artifact outputs.
 await writeFile(join(path,'report.json'),reportBytes,{flag:'wx'});
 return {path,report};
}
export async function emitImportFailureOutput(outputFile:string,path:string,workspaceRoot:string){
 const value=relative(workspaceRoot,path).replaceAll('\\','/');
 if(!value.startsWith('.tmp/import-failure/')||!runPattern.test(value.slice('.tmp/import-failure/'.length)))throw new Error('Invalid failure artifact output');
 const marker=await lstat(join(path,'report.json'));
 if(!marker.isFile()||marker.isSymbolicLink())throw new Error('Failure report is not ready');
 await appendFile(outputFile,'failure_evidence_path='+value+'\n');
}
