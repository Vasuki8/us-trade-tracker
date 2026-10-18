import type {Release} from '../src/lib/trade/types';
import {mkdir,readFile,writeFile,rename,open,unlink} from 'node:fs/promises';
import {join,dirname} from 'node:path';import {randomUUID,createHash} from 'node:crypto';
import {fetchProductMonth} from './census-client';
import {CensusRequestError,credentialBearing,type CensusFailureContext} from './census-failure';
import {writeImportFailureEvidence,type CompletedCapture} from './import-failure-evidence';
import {fetchDutyMonth} from './census-duty-client';
import {normalizeDutyMonth} from '../src/lib/trade/duty-normalize';
import {validateDutyDataset} from '../src/lib/trade/duty-validation';
import type {DutyObservation} from '../src/lib/trade/duty-types';
import {observationKey,validMonth} from '../src/lib/trade/normalize';
import {shiftMonth} from '../src/lib/trade/metrics';
import {buildProfileView} from '../src/lib/trade/profile';
import {validateClassificationIntervals} from './classification';
import {findRevisedKeys,findDutyRevisedKeys} from '../src/lib/trade/revisions';
import {assertProductCode,DEFAULT_PRODUCT_CODE} from '../src/lib/trade/product-registry';
export type PrepareOptions={productCode:string;end:string;months:number;apiKey:string;outputDir:string;codeVersion:string;classificationIntervals?:Release['classificationIntervals'];includeDuties?:boolean;failureEvidenceRoot?:string;onFailureEvidence?:(path:string)=>Promise<void>};
export function validateRelease(value:unknown,requireCensus=false):asserts value is Release {
  if(!value||typeof value!=='object')throw new Error('Invalid release');
  const r=value as Release;
  if(requireCensus&&r.source!=='census')throw new Error('Cannot promote fixture data');
  if(![1,2].includes(r.schemaVersion)||!['census','fixture'].includes(r.source)||typeof r.productCode!=='string'||!/^\d{6}$/.test(r.productCode)||!validMonth(r.reportingMonth)||typeof r.retrievedAt!=='string'||!Number.isFinite(Date.parse(r.retrievedAt))||typeof r.codeVersion!=='string'||!r.codeVersion)throw new Error('Invalid release metadata');
  if(!Array.isArray(r.observations)||!r.observations.length||!Array.isArray(r.sourceUrls)||!r.sourceUrls.length||!Array.isArray(r.revisedKeys)||r.revisedKeys.some(k=>typeof k!=='string')||!Array.isArray(r.classificationIntervals))throw new Error('Invalid release arrays');
  for(const source of r.sourceUrls){const url=new URL(source);if(url.protocol!=='https:'||[...url.searchParams.keys()].some(k=>k.toLowerCase()==='key')||(r.source==='census'&&url.hostname!=='api.census.gov'))throw new Error('Invalid or private source URL');}
  validateClassificationIntervals(r.classificationIntervals,r.reportingMonth);
  if(r.schemaVersion===2)validateDutyDataset(r.duties,r,requireCensus);
  else if('duties' in r)throw new Error('Duty data requires release schema version 2');
  const seen=new Set<string>();
  for(const row of r.observations){
    if(!row||row.productCode!==r.productCode||!validMonth(row.month)||row.month>r.reportingMonth||!['imports','exports'].includes(row.direction)||row.measure!==(row.direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO')||typeof row.description!=='string'||!row.description||typeof row.partnerName!=='string'||!row.partnerName||typeof row.partnerCode!=='string'||!['world','country'].includes(row.geography)||(row.geography==='world'?row.partnerCode!=='-':!/^[1-9]\d{3}$/.test(row.partnerCode))||!['reported','missing','suppressed'].includes(row.status)||(row.status==='reported'?typeof row.valueUsd!=='number'||!Number.isSafeInteger(row.valueUsd)||row.valueUsd<0:row.valueUsd!==null))throw new Error('Invalid release observation');
    const key=observationKey(row);if(seen.has(key))throw new Error('Duplicate release observation');seen.add(key);
  }
  const first=r.observations.map(row=>row.month).sort()[0];
  for(const direction of ['imports','exports'] as const){
    for(let month=first;month<=r.reportingMonth;month=shiftMonth(month,1)){
      const row=r.observations.find(o=>o.direction===direction&&o.month===month&&o.geography==='world');
      if(!row||(requireCensus&&row.status!=='reported'))throw new Error('Incomplete national reporting window');
    }
    buildProfileView(r,{direction,months:60,countryCodes:[]});
  }
}
export async function readCurrentRelease(dir:string,expectedProductCode:string=DEFAULT_PRODUCT_CODE):Promise<Release>{
  assertProductCode(expectedProductCode);
  const pointer=JSON.parse(await readFile(join(dir,'current.json'),'utf8'));
  if(typeof pointer.releaseFile!=='string'||!/^releases\/[a-zA-Z0-9-]+\.json$/.test(pointer.releaseFile))throw new Error('Invalid current-release pointer');
  const release:unknown=JSON.parse(await readFile(join(dir,pointer.releaseFile),'utf8'));
  validateRelease(release,true);if(release.productCode!==expectedProductCode)throw new Error(`Current release does not match product ${expectedProductCode}`);return release;
}
export async function prepareRelease(options:PrepareOptions,fetchImpl:typeof fetch=fetch):Promise<Release>{
  if(!/^\d{6}$/.test(options.productCode)||!validMonth(options.end)||!Number.isInteger(options.months)||options.months<24||options.months>60||!options.apiKey.trim()||!options.codeVersion||(options.includeDuties!==undefined&&typeof options.includeDuties!=='boolean'))throw new Error('Provide an HS6 product, reporting month, key, code version, and 24–60 months');
  await mkdir(options.outputDir,{recursive:true});
  const lockPath=join(options.outputDir,'.import.lock');
  let lock;try{lock=await open(lockPath,'wx');}catch{throw new Error('A data import is already running; current release is unchanged');}
  let operationFailed=false;
  try{
    let previous:Release|undefined;
    try{previous=await readCurrentRelease(options.outputDir,options.productCode);}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
    if(previous&&options.end<previous.reportingMonth)throw new Error('Reporting month cannot regress; use a separate workspace for historical imports');
    if(previous?.schemaVersion===2&&!options.includeDuties)throw new Error('The accepted release includes duties; continue importing with --duties');
    const retrievedAt=new Date().toISOString();const id=`${options.end}-${randomUUID()}`;
    const rawDir=join(dirname(options.outputDir),'raw',id);await mkdir(rawDir,{recursive:true});
    const captures:CompletedCapture[]=[];
    const writeRaw=async(name:string,record:unknown)=>{
      const bytes=Buffer.from(JSON.stringify(record));
      if(credentialBearing(bytes.toString('utf8'),options.apiKey))throw new Error('Raw capture contains a credential');
      await writeFile(join(rawDir,name),bytes);
      if(options.failureEvidenceRoot)captures.push({name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
    };
    const taskContext=(task?:{month:string;direction:'imports'|'exports'|'duties'}):CensusFailureContext=>({productCode:options.productCode,month:task?.month??options.end,direction:task?task.direction==='duties'?'imports':task.direction:null,dataset:task?task.direction==='duties'?'duties':'merchandise':'release',summary:null,requestUrl:null,phase:'validation',attempt:null,httpStatus:null,elapsedMs:null,transportCode:null});
    let failureContext=taskContext();
    try{

    const tasks:{month:string;direction:'imports'|'exports'|'duties'}[]=Array.from({length:options.months},(_,i)=>shiftMonth(options.end,i-options.months+1)).flatMap(month=>(['imports','exports'] as const).map(direction=>({month,direction})));
    if(options.includeDuties)for(let i=-23;i<=0;i++)tasks.push({month:shiftMonth(options.end,i),direction:'duties'});
    const batches:Release['observations'][]=new Array(tasks.length);const dutyBatches:DutyObservation[][]=new Array(tasks.length);let cursor=0;const controller=new AbortController();
    // allSettled preserves worker order, not the order failures occur.
    let firstFailure:{reason:unknown;context:CensusFailureContext}|undefined;
    await Promise.allSettled(Array.from({length:2},async()=>{
      let activeTask:typeof tasks[number]|undefined;
      try{while(cursor<tasks.length&&!controller.signal.aborted){const index=cursor++;const task=tasks[index];activeTask=task;
        if(task.direction==='duties'){
          const parts=await fetchDutyMonth({productCode:options.productCode,month:task.month,apiKey:options.apiKey,retrievedAt,signal:controller.signal,onRaw:async({summary,...record})=>{await writeRaw(`duties-${task.month}-${summary}.json`,record);}},fetchImpl);
          dutyBatches[index]=normalizeDutyMonth(parts,{productCode:options.productCode,month:task.month});
        }else batches[index]=await fetchProductMonth({...task,direction:task.direction,productCode:options.productCode,apiKey:options.apiKey,signal:controller.signal,
          onRaw:async(payload,url,httpStatus)=>{const summary=new URL(url).searchParams.get('SUMMARY_LVL2');await writeRaw(`${task.direction}-${task.month}-${summary}.json`,{retrievedAt,requestUrl:url,httpStatus,payload});}},fetchImpl);
      }}catch(error){firstFailure??={reason:error,context:error instanceof CensusRequestError?error.requestContext:taskContext(activeTask)};controller.abort();throw error;}
    }));
    if(firstFailure){failureContext=firstFailure.context;throw firstFailure.reason;}
    const observations=batches.flat();
    const base={productCode:options.productCode,reportingMonth:options.end,retrievedAt,codeVersion:options.codeVersion,
      source:'census' as const,sourceUrls:['imports','exports'].map(d=>`https://api.census.gov/data/timeseries/intltrade/${d}/hs`),observations,revisedKeys:[],
      classificationIntervals:options.classificationIntervals??[]};
    const release:Release=options.includeDuties?{...base,schemaVersion:2,duties:{schemaVersion:1,fromMonth:shiftMonth(options.end,-23),observations:dutyBatches.flat(),revisedKeys:[]}}:{...base,schemaVersion:1};
    if(release.schemaVersion===2)release.duties.revisedKeys=findDutyRevisedKeys(previous?.schemaVersion===2?previous.duties:undefined,release.duties);
    release.revisedKeys=findRevisedKeys(previous,release);
    validateRelease(release,true);
    failureContext={...taskContext(),phase:'capture'};
    await mkdir(join(options.outputDir,'releases'),{recursive:true});
    const releaseFile=`releases/${id}.json`;await writeFile(join(options.outputDir,releaseFile),JSON.stringify(release));
    const pending=join(options.outputDir,`current-${id}.tmp`);await writeFile(pending,JSON.stringify({releaseFile}));
    await rename(pending,join(options.outputDir,'current.json'));return release;
    }catch(error){
      // Diagnostics wait for settled workers and must never mask the import failure.
      if(options.failureEvidenceRoot)try{
        const evidence=await writeImportFailureEvidence({root:options.failureEvidenceRoot,runId:id,productCode:options.productCode,reportingMonth:options.end,codeVersion:options.codeVersion,apiKey:options.apiKey,rawDir,captures,failure:failureContext});
        await options.onFailureEvidence?.(evidence.path);
      }catch{/* The original failure remains authoritative; no ready output is emitted. */}
      throw error;
    }

  }catch(error){operationFailed=true;throw error;}
  finally{
    try{await lock.close();await unlink(lockPath);}catch(error){
      if(!operationFailed)throw error;
      console.warn('Import lock cleanup failed; the original import error is unchanged.');
    }
  }
}
