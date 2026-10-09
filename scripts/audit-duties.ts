import {mkdir,readdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {parseArgs} from 'node:util';
import type {DutyAuditReport,DutyDataset} from '../src/lib/trade/duty-types';
import {validMonth} from '../src/lib/trade/normalize';
import {shiftMonth} from '../src/lib/trade/metrics';
import {normalizeDutyMonth} from '../src/lib/trade/duty-normalize';
import {fetchDutyMonth} from './census-duty-client';
export type DutyAuditOptions={productCode:'090121';end:string;months:24;outputDir:string;apiKey:string;codeVersion?:string};
export async function runDutyAudit(options:DutyAuditOptions,fetchImpl:typeof fetch=fetch):Promise<DutyAuditReport>{
  if(options.productCode!=='090121'||!validMonth(options.end)||options.months!==24||!options.apiKey.trim())throw new Error('Duty audit requires coffee, 24 months, a valid reporting month and a Census key');
  const report:DutyAuditReport={schemaVersion:1,productCode:options.productCode,fromMonth:shiftMonth(options.end,-23),toMonth:options.end,retrievedAt:new Date().toISOString(),codeVersion:options.codeVersion??'unspecified',sourceUrls:['https://api.census.gov/data/timeseries/intltrade/imports/hs'],eligibleForRelease:true,rawFiles:[],months:[]};
  const dataset:DutyDataset={schemaVersion:1,fromMonth:report.fromMonth,observations:[],revisedKeys:[]};
  await mkdir(join(options.outputDir,'raw'),{recursive:true});
  const existing=await readdir(options.outputDir);
  if(existing.includes('audit.json')||existing.includes('duty-dataset.json')||(await readdir(join(options.outputDir,'raw'))).length)throw new Error('Audit output already contains data; use a new directory');
  // One month at a time keeps the audit below the established two-request limit.
  for(let offset=-23;offset<=0;offset++){
    const month=shiftMonth(options.end,offset);
    try{
      const parts=await fetchDutyMonth({productCode:options.productCode,month,apiKey:options.apiKey,retrievedAt:report.retrievedAt,onRaw:async part=>{
        const path=`raw/duties-${month}-${part.summary}.json`;const bytes=Buffer.from(JSON.stringify(part));
        await writeFile(join(options.outputDir,path),bytes,{flag:'wx'});report.rawFiles.push({path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
      }},fetchImpl);
      const observations=normalizeDutyMonth(parts,{productCode:options.productCode,month});dataset.observations.push(...observations);
      const world=observations.find(row=>row.geography==='world')!;const countries=observations.filter(row=>row.geography==='country');
      const keys=['calculatedDuty','consumptionValue','dutiableValue'] as const;
      const available=keys.every(key=>world[key].valueUsd!==null&&countries.every(row=>row[key].valueUsd!==null));
      const reconciles=available&&keys.every(key=>{const sum=countries.reduce((total,row)=>total+row[key].valueUsd!,0);return Number.isSafeInteger(sum)&&sum===world[key].valueUsd;});
      const worldAvailable=world.coverage.status==='verified'&&keys.every(key=>world[key].valueUsd!==null);
      report.months.push({month,worldAvailable,countryCount:countries.length,unavailableCountryCoverage:countries.filter(row=>row.coverage.status!=='verified').length,countryReconciliation:available?(reconciles?'verified':'mismatch'):'unavailable',uncalculatedDutiableValueUsd:world.coverage.uncalculatedDutiableValueUsd});
      if(!worldAvailable||!reconciles)report.eligibleForRelease=false;
    }catch(error){
      const message=error instanceof Error&&!error.message.includes(options.apiKey)?error.message:'Duty audit month failed';
      report.months.push({month,worldAvailable:false,countryCount:0,unavailableCountryCoverage:0,countryReconciliation:'unavailable',uncalculatedDutiableValueUsd:null,error:message});report.eligibleForRelease=false;
    }
  }
  await writeFile(join(options.outputDir,'duty-dataset.json'),JSON.stringify(dataset));
  await writeFile(join(options.outputDir,'audit.json'),JSON.stringify(report,null,2));
  return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const {values}=parseArgs({options:{end:{type:'string'},output:{type:'string',default:'.tmp/duty-audit'}}});
    if(!values.end)throw new Error('Usage: npm run data:audit-duties -- --end YYYY-MM [--output directory]');
    const report=await runDutyAudit({productCode:'090121',end:values.end,months:24,outputDir:values.output!,apiKey:process.env.CENSUS_API_KEY??'',codeVersion:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()});
    console.log(`Coffee duty audit ${report.fromMonth}–${report.toMonth}: ${report.rawFiles.length} source records; eligible for release: ${report.eligibleForRelease}. No release promoted.`);
    if(!report.eligibleForRelease)process.exitCode=1;
  }catch(error){console.error(error instanceof Error?error.message:'Duty audit failed');process.exitCode=1;}
}
