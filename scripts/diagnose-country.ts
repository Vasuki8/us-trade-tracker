import {mkdir,writeFile} from 'node:fs/promises';import {dirname,join,resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';
import {resolveCountryAuditOptions,validateCountryAuditOptions} from './audit-country';import {fetchCountryPart,fetchCountryExportCumulativeTotal} from './census-country-client';import {parseCountryReference} from './country-reference';import type {CountryAuditOptions,CountryAuditReport,CountryReferenceRow} from './country-audit-types';

// Fixed failed identities from retained audit 38096086464; this is not a resume/acceptance path.
const missingImports=[['2025-05','total'],['2025-06','total'],['2025-06','products'],['2025-08','total'],['2025-09','products'],['2025-12','total'],['2026-03','total'],['2026-04','total'],['2026-06','total']] as const;
type Event={label:string;attempt:number;phase:'complete'|'headers'|'body';retrievedAt:string;elapsedMs:number;httpStatus:number|null;errorCode:string|null};
type Result={label:string;outcome:'received'|'validated'|'failed';rows?:number;amountUsd?:number|null;yearToDateUsd?:number|null;normalizedRowsSha256?:string};
const aggregateContexts=[{direction:'imports',month:'2025-05',kind:'total'},{direction:'imports',month:'2025-06',kind:'products'},{direction:'imports',month:'2026-08',kind:'total'},{direction:'exports',month:'2026-05',kind:'total'}] as const;
const safeCodes=new Set(['UND_ERR_CONNECT_TIMEOUT','UND_ERR_HEADERS_TIMEOUT','UND_ERR_BODY_TIMEOUT','ECONNRESET','ETIMEDOUT','ENOTFOUND','ECONNREFUSED','ENETUNREACH','EHOSTUNREACH','ABORT_ERR']);
function safeErrorCode(error:unknown){const cause=error as {cause?:{code?:unknown};name?:string}|null;const code=String(cause?.cause?.code??'');return safeCodes.has(code)?code:cause?.name==='TimeoutError'?'timeout':'unknown';}
function safeSum(values:(number|null)[]){if(!values.length||values.some(value=>value===null))return null;const value=values.reduce<bigint>((sum,value)=>sum+BigInt(value!),0n);return value>BigInt(Number.MAX_SAFE_INTEGER)?null:Number(value);}

async function runCountryDiagnostic(options:CountryAuditOptions,fetchImpl:typeof fetch,aggregateProbe:boolean){
 validateCountryAuditOptions(options);await mkdir(dirname(resolve(options.outputDir)),{recursive:true});try{await mkdir(options.outputDir);}catch{throw new Error('Followup requires fresh output; directory already exists or cannot be created');}await mkdir(join(options.outputDir,'raw'));
 const events:Event[]=[],results:Result[]=[],rawFiles:CountryAuditReport['rawFiles']=[],attempts=new Map<string,number>();
 async function save(label:string,payload:unknown){const bytes=Buffer.from(JSON.stringify(payload));if(bytes.includes(Buffer.from(options.apiKey))||bytes.includes(Buffer.from(encodeURIComponent(options.apiKey))))throw new Error('Credential-bearing diagnostic evidence');const path=`raw/${aggregateProbe?'aggregate':'followup'}-${label}.json`;await writeFile(join(options.outputDir,path),bytes,{flag:'wx'});rawFiles.push({path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
 function instrument(label:string):typeof fetch{return (async(input,init)=>{
  const started=Date.now(),attempt=(attempts.get(label)??0)+1;attempts.set(label,attempt);let response:Response;
  const record=(phase:Event['phase'],httpStatus:number|null,errorCode:string|null)=>events.push({label,attempt,phase,httpStatus,errorCode,retrievedAt:new Date().toISOString(),elapsedMs:Date.now()-started});
  try{response=await fetchImpl(input,init);}catch(error){record('headers',null,safeErrorCode(error));throw new Error('Diagnostic request failed');}
  const text=response.text.bind(response);
  // Observe the original body read without replacing a response's own method.
  return new Proxy({} as Response,{get(_target,property){if(property==='text')return async()=>{try{const body=await text();record('complete',response.status,null);return body;}catch(error){record('body',response.status,safeErrorCode(error));throw new Error('Diagnostic body failed');}};const value=Reflect.get(response,property,response);return typeof value==='function'?value.bind(response):value;}});
 }) as typeof fetch;}

 const reference={url:'https://www.census.gov/foreign-trade/balance/c1220.html',retrievedAt:null as string|null,lastModified:null as string|null,httpDate:null as string|null,error:null as string|null};let referenceRows:CountryReferenceRow[]=[];
 // Reference runs alone, then the fixed API list runs in pairs within its mode's budget.
 try{
  let response:Response;try{response=await instrument('canada-reference')(reference.url,{signal:AbortSignal.timeout(30_000)});}catch{await save('canada-reference',{schemaVersion:1,requestUrl:reference.url,httpStatus:0,responseBody:null,retrievedAt:new Date().toISOString()});throw new Error('Reference transport failure');}
  reference.retrievedAt=new Date().toISOString();reference.lastModified=response.headers.get('last-modified');reference.httpDate=response.headers.get('date');
  let responseBody:string;try{responseBody=await response.text();}catch{await save('canada-reference',{schemaVersion:1,requestUrl:reference.url,httpStatus:response.status,responseBody:null,...reference});throw new Error('Reference body failure');}
  if(responseBody.includes(options.apiKey)||responseBody.includes(encodeURIComponent(options.apiKey)))throw new Error('Credential-bearing reference');reference.retrievedAt=new Date().toISOString();
  await save('canada-reference',{schemaVersion:1,requestUrl:reference.url,httpStatus:response.status,responseBody,...reference});
  if(!response.ok||!response.headers.get('content-type')?.includes('text/html'))throw new Error('Reference HTTP or content failure');referenceRows=parseCountryReference(responseBody);results.push({label:'canada-reference',outcome:'received'});
 }catch{reference.error='Official Canada reference unavailable or incompatible; inspect retained evidence';results.push({label:'canada-reference',outcome:'failed'});}

 const tasks=missingImports.map(([month,kind])=>{const label=`imports-${month}-${kind}`;return {label,run:async()=>{const part=await fetchCountryPart({countryCode:options.countryCode,month,direction:'imports',kind,apiKey:options.apiKey,onRaw:raw=>save(label,raw)},instrument(label));return {label,outcome:'validated' as const,rows:part.rows.length,amountUsd:safeSum(part.rows.map(row=>row.valueUsd))};}};});
 const cumulativeLabel='exports-2026-08-cumulative';let cumulativeUsd:number|null=null;
 const allTasks:{label:string;run:()=>Promise<Result>}[]=aggregateProbe?aggregateContexts.flatMap(context=>(['baseline','explicit'] as const).map(strategy=>{
  const label=`${context.direction}-${context.month}-${context.kind}-${strategy}`;
  return {label,run:async()=>{
   const part=await fetchCountryPart({...context,countryCode:options.countryCode,explicitAggregates:strategy==='explicit',apiKey:options.apiKey,onRaw:raw=>save(label,raw)},instrument(label));
   const normalizedRows=[...part.rows].sort((a,b)=>a.code.localeCompare(b.code));
   return {label,outcome:'validated' as const,rows:part.rows.length,amountUsd:safeSum(part.rows.map(row=>row.valueUsd)),normalizedRowsSha256:createHash('sha256').update(JSON.stringify(normalizedRows)).digest('hex')};
  }};
 })):[...tasks,{label:cumulativeLabel,run:async()=>{const {part,yearToDateUsd}=await fetchCountryExportCumulativeTotal({countryCode:options.countryCode,month:options.end,direction:'exports',kind:'total',apiKey:options.apiKey,onRaw:raw=>save(cumulativeLabel,raw)},instrument(cumulativeLabel));cumulativeUsd=yearToDateUsd;return {label:cumulativeLabel,outcome:'validated',rows:part.rows.length,amountUsd:part.rows[0].valueUsd,yearToDateUsd};}}];
 for(let start=0;start<allTasks.length;start+=2)await Promise.all(allTasks.slice(start,start+2).map(async task=>{try{results.push(await task.run());}catch{results.push({label:task.label,outcome:'failed'});}}));

 const expectedMonths=Array.from({length:8},(_,index)=>`2026-${String(index+1).padStart(2,'0')}`);const yearRows=referenceRows.filter(row=>expectedMonths.includes(row.month));
 const referenceMonthlySumUsd=expectedMonths.every(month=>yearRows.some(row=>row.month===month))?safeSum(yearRows.map(row=>row.exportsUsd)):null;
 const differenceUsd=cumulativeUsd===null||referenceMonthlySumUsd===null?null:cumulativeUsd-referenceMonthlySumUsd,roundingBoundUsd=400000;
 const status=differenceUsd===null?'unavailable':Math.abs(differenceUsd)<=roundingBoundUsd?'within-rounding-bound':'outside-rounding-bound';
 rawFiles.sort((a,b)=>a.path.localeCompare(b.path));results.sort((a,b)=>a.label.localeCompare(b.label));
 const allUsable=results.every(row=>row.outcome==='received'||row.outcome==='validated'&&row.amountUsd!==null);
 const pairedComparisons=aggregateProbe?aggregateContexts.map(context=>{
  const label=`${context.direction}-${context.month}-${context.kind}`,baseline=results.find(row=>row.label===`${label}-baseline`)!,explicit=results.find(row=>row.label===`${label}-explicit`)!;
  const usable=(row:Result)=>row.outcome==='validated'&&row.amountUsd!==null;
  return {...context,status:!usable(baseline)||!usable(explicit)?'unavailable':baseline.normalizedRowsSha256===explicit.normalizedRowsSha256?'equivalent':'mismatch',baselineRows:baseline.rows??null,explicitRows:explicit.rows??null,baselineAmountUsd:baseline.amountUsd??null,explicitAmountUsd:explicit.amountUsd??null};
 }):[];
 const exportReferenceChecks=aggregateProbe?(['baseline','explicit'] as const).map(strategy=>{
  const result=results.find(row=>row.label===`exports-2026-05-total-${strategy}`)!,referenceUsd=referenceRows.find(row=>row.month==='2026-05')?.exportsUsd??null,apiTotalUsd=result.amountUsd??null;
  return {month:'2026-05',direction:'exports',strategy,apiTotalUsd,referenceUsd,differenceUsd:apiTotalUsd===null||referenceUsd===null?null:apiTotalUsd-referenceUsd,precisionUsd:100000,status:apiTotalUsd===null||referenceUsd===null?'unavailable':Math.round(apiTotalUsd/100000)*100000===referenceUsd?'matched':'mismatch'};
 }):[];
 const common={schemaVersion:1,baselineAuditRunId:38096086464,countryCode:options.countryCode,reportingMonth:options.end,codeVersion:options.codeVersion??'unspecified',retrievedAt:new Date().toISOString(),sourceCoverage:'unverified',classificationStatus:'unverified',releaseAccepted:false,logicalRequests:allTasks.length+1,events,results,rawFiles,reference};
 return {common,allUsable,pairedComparisons,exportReferenceChecks,cumulativeComparison:{status,referenceMonths:yearRows.length,apiYearToDateUsd:cumulativeUsd,referenceMonthlySumUsd,differenceUsd,roundingBoundUsd,meaning:'Cumulative corroboration only; does not resolve monthly differences or establish product eligibility'}};
}
export async function runCountryFollowup(options:CountryAuditOptions,fetchImpl:typeof fetch=fetch){
 const {common,allUsable,cumulativeComparison}=await runCountryDiagnostic(options,fetchImpl,false);
 const report={...common,purpose:'source-followup-diagnostic',diagnosticPassed:allUsable&&cumulativeComparison.status==='within-rounding-bound',cumulativeComparison};
 await writeFile(join(options.outputDir,'source-followup.json'),JSON.stringify(report,null,2),{flag:'wx'});return report;
}
export async function runCountryAggregateProbe(options:CountryAuditOptions,fetchImpl:typeof fetch=fetch){
 const {common,allUsable,pairedComparisons,exportReferenceChecks}=await runCountryDiagnostic(options,fetchImpl,true);
 const report={...common,purpose:'aggregate-query-diagnostic',probePassed:allUsable&&pairedComparisons.every(row=>row.status==='equivalent')&&exportReferenceChecks.every(row=>row.status==='matched'),pairedComparisons,exportReferenceChecks,meaning:'Fixed query-strategy evidence only; paired differences do not prove a cause or establish full coverage, compatible classifications or release acceptance'};
 await writeFile(join(options.outputDir,'aggregate-probe.json'),JSON.stringify(report,null,2),{flag:'wx'});return report;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){try{const options=resolveCountryAuditOptions(process.argv.slice(2),process.env);const report=await runCountryFollowup({...options,codeVersion:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()});console.log(`Canada source followup: ${report.results.length} logical checks, ${report.events.length} attempts; ${report.diagnosticPassed?'passed':'failed'}. Coverage and classification remain unverified; no release accepted.`);if(!report.diagnosticPassed)process.exitCode=1;}catch{console.error('Canada source followup failed; inspect retained evidence.');process.exitCode=1;}}
