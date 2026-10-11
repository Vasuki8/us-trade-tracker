import {mkdir,writeFile} from 'node:fs/promises';import {dirname,join,resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';import {parseArgs} from 'node:util';
import type {CountryAuditOptions,CountryAuditReport,CountryPart,CountryReferenceRow} from './country-audit-types';
import {fetchCountryPart} from './census-country-client';import {parseCountryReference} from './country-reference';import {shiftMonth} from '../src/lib/trade/metrics';
import {canadaReviewedPublications,compareCountryReferences,fetchReviewedPublication} from './country-publications';
export function validateCountryAuditOptions(options:CountryAuditOptions,preflight=false){
  if(options.countryCode!=='1220'||options.end!=='2026-08'||!options.outputDir.trim()||(!preflight&&!options.apiKey.trim()))throw new Error('Country audit requires reviewed Canada 1220, end 2026-08, fresh output and a Census key');
}
export function resolveCountryAuditOptions(args:string[],env:NodeJS.ProcessEnv,preflight=false):CountryAuditOptions{
  const {values,tokens}=parseArgs({args,options:{country:{type:'string',default:'1220'},end:{type:'string'},output:{type:'string'},preflight:{type:'boolean',default:false}},tokens:true});
  const seen=new Set<string>();for(const token of tokens)if(token.kind==='option'){if(seen.has(token.name))throw new Error('Repeated country audit option');seen.add(token.name);}
  const options={countryCode:values.country!,end:values.end??'',outputDir:values.output??'.tmp/country-audit/1220',apiKey:env.CENSUS_API_KEY??''};validateCountryAuditOptions(options,preflight||values.preflight);return options;
}
function sum(values:(number|null)[]):number|null{if(values.some(value=>value===null))return null;const total=values.reduce<number>((result,value)=>result+value!,0);return Number.isSafeInteger(total)?total:null;}
export async function runCountryAudit(options:CountryAuditOptions,fetchImpl:typeof fetch=fetch):Promise<CountryAuditReport>{
  validateCountryAuditOptions(options);
  await mkdir(dirname(resolve(options.outputDir)),{recursive:true});
  try{await mkdir(options.outputDir);}catch{throw new Error('Country audit output already exists or cannot be created; use a fresh directory');}
  await mkdir(join(options.outputDir,'raw'));
  const report:CountryAuditReport={schemaVersion:1,countryCode:options.countryCode,fromMonth:shiftMonth(options.end,-23),toMonth:options.end,retrievedAt:new Date().toISOString(),codeVersion:options.codeVersion??'unspecified',sourceCoverage:'failed',classificationStatus:'unverified',rawFiles:[],months:[],candidates:[],publications:[],reference:{url:'https://www.census.gov/foreign-trade/balance/c1220.html',retrievedAt:null,lastModified:null,httpDate:null,error:null}};
  async function saveBytes(path:string,bytes:Buffer){await writeFile(join(options.outputDir,path),bytes,{flag:'wx'});report.rawFiles.push({path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
  async function save(path:string,payload:unknown){await saveBytes(path,Buffer.from(JSON.stringify(payload)));}
  let reference:CountryReferenceRow[]=[];
  try{
    const response=await fetchImpl(report.reference.url,{signal:AbortSignal.timeout(30_000)});const responseBody=await response.text();
    if(responseBody.includes(options.apiKey)||responseBody.includes(encodeURIComponent(options.apiKey)))throw new Error('Country reference contains a credential');
    report.reference.retrievedAt=new Date().toISOString();report.reference.lastModified=response.headers.get('last-modified');report.reference.httpDate=response.headers.get('date');
    await save('raw/canada-reference.json',{schemaVersion:1,...report.reference,httpStatus:response.status,responseBody});
    if(!response.ok||!response.headers.get('content-type')?.includes('text/html'))throw new Error('Country reference HTTP or content-type failure');reference=parseCountryReference(responseBody);
  }catch{report.reference.error='Official Canada reference unavailable or incompatible; inspect retained evidence';}
  // Fixed public references use no API credential and cannot overlap the API request pairs.
  for(let index=0;index<canadaReviewedPublications.length;index+=2){
    const sources=await Promise.all(canadaReviewedPublications.slice(index,index+2).map(reviewed=>fetchReviewedPublication(reviewed,options.apiKey,fetchImpl)));
    for(const {evidence,body} of sources){
      if(body!==null)await saveBytes(`raw/ft900-${evidence.reviewed.month}.pdf`,body);
      await save(`raw/ft900-${evidence.reviewed.month}.json`,evidence);report.publications.push(evidence);
    }
  }
  const products:CountryPart[]=[];
  for(let offset=-23;offset<=0;offset++){
    const month=shiftMonth(options.end,offset);
    for(const direction of ['imports','exports'] as const){
      const results=await Promise.allSettled((['total','products'] as const).map(kind=>fetchCountryPart({countryCode:options.countryCode,month,direction,kind,apiKey:options.apiKey,onRaw:raw=>save(`raw/${direction}-${month}-${kind}.json`,raw)},fetchImpl)));
      const total=results[0].status==='fulfilled'?results[0].value:null;const detail=results[1].status==='fulfilled'?results[1].value:null;
      if(detail)products.push(detail);
      // Only our fixed diagnostics enter the report, never exception text or server error bodies.
      const errors=results.flatMap((result,index)=>result.status==='rejected'?[`${index===0?'Total':'HS6'} retrieval or validation failed; inspect raw evidence`]:[]);
      const totalUsd=total?.rows[0]?.valueUsd??null;const productSumUsd=detail?sum(detail.rows.map(row=>row.valueUsd)):null;
      const residualUsd=totalUsd!==null&&productSumUsd!==null?totalUsd-productSumUsd:null;
      const referenceUsd=reference.find(row=>row.month===month)?.[direction==='imports'?'importsUsd':'exportsUsd']??null;
      const publication=report.publications.find(source=>source.reviewed.month===month&&source.reviewed.direction===direction);
      const publicationReferenceUsd=publication?.referenceUsd??null;
      report.months.push({month,direction,totalUsd,productSumUsd,residualUsd,productRows:detail?.rows.length??0,unavailableValues:detail?.rows.filter(row=>row.valueUsd===null).length??0,specialRows:detail?.rows.filter(row=>row.special)??[],referenceUsd,publicationReferenceUsd,...compareCountryReferences(totalUsd,referenceUsd,publication?publicationReferenceUsd:undefined),errors});
    }
  }
  const currentFrom=shiftMonth(options.end,-11);
  for(const direction of ['imports','exports'] as const){
    const parts=products.filter(part=>part.direction===direction);const codes=[...new Set(parts.flatMap(part=>part.rows.map(row=>row.code)))].sort();
    const totals=report.months.filter(month=>month.direction===direction);
    const currentTotal=sum(totals.filter(month=>month.month>=currentFrom).map(month=>month.totalUsd));const previousTotal=sum(totals.filter(month=>month.month<currentFrom).map(month=>month.totalUsd));
    for(const code of codes){
      const observations=parts.flatMap(part=>part.rows.filter(row=>row.code===code).map(row=>({...row,month:part.month})));
      const current=observations.filter(row=>row.month>=currentFrom);const previous=observations.filter(row=>row.month<currentFrom);
      const currentUsd=current.length===12?sum(current.map(row=>row.valueUsd)):null;const previousUsd=previous.length===12?sum(previous.map(row=>row.valueUsd)):null;
      const currentSharePercent=currentUsd!==null&&currentTotal!==null&&currentTotal>0?100*currentUsd/currentTotal:null;const previousSharePercent=previousUsd!==null&&previousTotal!==null&&previousTotal>0?100*previousUsd/previousTotal:null;
      report.candidates.push({direction,code,description:observations.at(-1)!.description,special:observations.some(row=>row.special),currentUsd,previousUsd,currentSharePercent,previousSharePercent,shareChangePercentagePoints:currentSharePercent===null||previousSharePercent===null?null:currentSharePercent-previousSharePercent,currentReportedMonths:current.filter(row=>row.valueUsd!==null).length,previousReportedMonths:previous.filter(row=>row.valueUsd!==null).length,complete:currentUsd!==null&&previousUsd!==null&&currentTotal!==null&&previousTotal!==null,classificationStatus:'unverified',comparisonAvailable:false});
    }
  }
  report.rawFiles.sort((a,b)=>a.path.localeCompare(b.path));
  report.sourceCoverage=report.months.every(month=>!month.errors.length&&month.totalUsd!==null&&month.residualUsd===0&&month.referenceCheck==='matched')?'verified':'failed';
  await writeFile(join(options.outputDir,'country-dataset.json'),JSON.stringify({schemaVersion:1,countryCode:options.countryCode,fromMonth:report.fromMonth,toMonth:report.toMonth,retrievedAt:report.retrievedAt,codeVersion:report.codeVersion,source:'census',totals:report.months.map(({month,direction,totalUsd})=>({month,direction,valueUsd:totalUsd})),products}),{flag:'wx'});
  await writeFile(join(options.outputDir,'audit.json'),JSON.stringify(report,null,2),{flag:'wx'});return report;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  try{
    const preflight=process.argv.includes('--preflight');const options=resolveCountryAuditOptions(process.argv.slice(2),process.env,preflight);
    if(preflight){if(process.env.GITHUB_ACTIONS==='true'&&process.env.GITHUB_REF!=='refs/heads/main')throw new Error('Manual country audit requires main');console.log('Validated Canada 1220 through 2026-08');}
    else{const report=await runCountryAudit({...options,codeVersion:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()});console.log(`Canada source audit ${report.fromMonth}–${report.toMonth}: ${report.rawFiles.length} retained source files; source coverage ${report.sourceCoverage}; ${report.months.filter(month=>month.referenceCorroboration==='original-publication-only').length} original-publication-only matches; product classifications unverified. No release accepted.`);if(report.sourceCoverage!=='verified')process.exitCode=1;}
  }catch{console.error('Country audit failed; check inputs and retained evidence. Accepted releases are unchanged.');process.exitCode=1;}
}
