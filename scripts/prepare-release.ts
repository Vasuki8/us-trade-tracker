import type {Release} from '../src/lib/trade/types';
import {mkdir,readFile,writeFile,rename,open,unlink} from 'node:fs/promises';
import {join,dirname} from 'node:path';import {randomUUID} from 'node:crypto';
import {fetchProductMonth} from './census-client';
import {observationKey,validMonth} from '../src/lib/trade/normalize';
import {shiftMonth} from '../src/lib/trade/metrics';
import {buildProfileView} from '../src/lib/trade/profile';
import {validateClassificationIntervals} from './classification';
import {findRevisedKeys} from '../src/lib/trade/revisions';
export type PrepareOptions={productCode:string;end:string;months:number;apiKey:string;outputDir:string;codeVersion:string;classificationIntervals?:Release['classificationIntervals']};
export function validateRelease(value:unknown,requireCensus=false):asserts value is Release {
  if(!value||typeof value!=='object')throw new Error('Invalid release');
  const r=value as Release;
  if(requireCensus&&r.source!=='census')throw new Error('Cannot promote fixture data');
  if(r.schemaVersion!==1||!['census','fixture'].includes(r.source)||typeof r.productCode!=='string'||!/^\d{6}$/.test(r.productCode)||!validMonth(r.reportingMonth)||typeof r.retrievedAt!=='string'||!Number.isFinite(Date.parse(r.retrievedAt))||typeof r.codeVersion!=='string'||!r.codeVersion)throw new Error('Invalid release metadata');
  if(!Array.isArray(r.observations)||!r.observations.length||!Array.isArray(r.sourceUrls)||!r.sourceUrls.length||!Array.isArray(r.revisedKeys)||r.revisedKeys.some(k=>typeof k!=='string')||!Array.isArray(r.classificationIntervals))throw new Error('Invalid release arrays');
  for(const source of r.sourceUrls){const url=new URL(source);if(url.protocol!=='https:'||[...url.searchParams.keys()].some(k=>k.toLowerCase()==='key')||(r.source==='census'&&url.hostname!=='api.census.gov'))throw new Error('Invalid or private source URL');}
  validateClassificationIntervals(r.classificationIntervals,r.reportingMonth);
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
export async function readCurrentRelease(dir:string):Promise<Release>{
  const pointer=JSON.parse(await readFile(join(dir,'current.json'),'utf8'));
  if(typeof pointer.releaseFile!=='string'||!/^releases\/[a-zA-Z0-9-]+\.json$/.test(pointer.releaseFile))throw new Error('Invalid current-release pointer');
  const release:unknown=JSON.parse(await readFile(join(dir,pointer.releaseFile),'utf8'));
  validateRelease(release,true);return release;
}
export async function prepareRelease(options:PrepareOptions,fetchImpl:typeof fetch=fetch):Promise<Release>{
  if(!/^\d{6}$/.test(options.productCode)||!validMonth(options.end)||!Number.isInteger(options.months)||options.months<24||options.months>60||!options.apiKey.trim()||!options.codeVersion)throw new Error('Provide an HS6 product, reporting month, key, code version, and 24–60 months');
  await mkdir(options.outputDir,{recursive:true});
  const lockPath=join(options.outputDir,'.import.lock');
  let lock;try{lock=await open(lockPath,'wx');}catch{throw new Error('A data import is already running; current release is unchanged');}
  try{
    let previous:Release|undefined;
    try{previous=await readCurrentRelease(options.outputDir);}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
    const retrievedAt=new Date().toISOString();const id=`${options.end}-${randomUUID()}`;
    const rawDir=join(dirname(options.outputDir),'raw',id);await mkdir(rawDir,{recursive:true});
    const tasks=Array.from({length:options.months},(_,i)=>shiftMonth(options.end,i-options.months+1)).flatMap(month=>(['imports','exports'] as const).map(direction=>({month,direction})));
    const batches:Release['observations'][]=new Array(tasks.length);let cursor=0;const controller=new AbortController();
    const workers=await Promise.allSettled(Array.from({length:2},async()=>{
      try{while(cursor<tasks.length&&!controller.signal.aborted){const index=cursor++;const task=tasks[index];
        batches[index]=await fetchProductMonth({...task,productCode:options.productCode,apiKey:options.apiKey,signal:controller.signal,
          onRaw:async(payload,url,httpStatus)=>{const summary=new URL(url).searchParams.get('SUMMARY_LVL2');await writeFile(join(rawDir,`${task.direction}-${task.month}-${summary}.json`),JSON.stringify({retrievedAt,requestUrl:url,httpStatus,payload}));}},fetchImpl);
      }}catch(error){controller.abort();throw error;}
    }));
    const failure=workers.find(result=>result.status==='rejected');if(failure?.status==='rejected')throw failure.reason;
    const observations=batches.flat();
    const release:Release={schemaVersion:1,productCode:options.productCode,reportingMonth:options.end,retrievedAt,codeVersion:options.codeVersion,
      source:'census',sourceUrls:['imports','exports'].map(d=>`https://api.census.gov/data/timeseries/intltrade/${d}/hs`),observations,revisedKeys:[],
      classificationIntervals:options.classificationIntervals??[]};
    release.revisedKeys=findRevisedKeys(previous,release);
    validateRelease(release,true);
    await mkdir(join(options.outputDir,'releases'),{recursive:true});
    const releaseFile=`releases/${id}.json`;await writeFile(join(options.outputDir,releaseFile),JSON.stringify(release));
    const pending=join(options.outputDir,`current-${id}.tmp`);await writeFile(pending,JSON.stringify({releaseFile}));
    await rename(pending,join(options.outputDir,'current.json'));return release;
  }finally{await lock.close();await unlink(lockPath);}
}
