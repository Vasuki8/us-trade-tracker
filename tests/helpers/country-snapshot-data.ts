import {createHash} from 'node:crypto';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {vi} from 'vitest';
import type {ReviewedCollection} from '../../scripts/country-snapshot-types';

export const snapshotMonths = Array.from({length:24}, (_, i) => {
  const date = new Date(Date.UTC(2024, 8+i)); return date.toISOString().slice(0,7);
});
export const snapshotCandidates = {
  imports:['270900','980100','271019','271121','870323','870340','870324','870829','271012','880240'],
  exports:['988000','270900','880000','870431','271012','271019','870899','847150','870323','711291'],
} as const;
export type SnapshotFixtureOverrides = {
  crossedReceipt?:boolean; duplicateContext?:boolean; wrongMeasure?:boolean;
  invalidTimestamp?:boolean; duplicateRow?:boolean; unsafeValue?:boolean; nullValue?:boolean;
  traversal?:boolean;
};
export const hash = (body:Buffer|string) => createHash('sha256').update(body).digest('hex');
export async function snapshotFixture(overrides:SnapshotFixtureOverrides = {}) {
  await mkdir('.tmp', {recursive:true});
  const repoRoot = await mkdtemp(resolve('.tmp/snapshot-fixture-'));
  const sourceRoot = 'data/backups/canada-country-audit/source';
  const normalizedRoot = 'data/backups/canada-country-audit/normalized';
  const sourceCommit = 'a'.repeat(40), parserCommit = 'b'.repeat(40);
  const contexts:Record<string,unknown>[] = [], independent:Record<string,unknown>[] = [];
  const requests:Record<string,unknown>[] = [];
  async function put(path:string, value:unknown, raw=false) {
    const body = raw ? String(value) : JSON.stringify(value);
    const absolute=resolve(repoRoot,path);await mkdir(resolve(absolute,'..'),{recursive:true});
    await writeFile(absolute,body); return {path,bytes:Buffer.byteLength(body),sha256:hash(body)};
  }
  for (const month of snapshotMonths) for (const direction of ['imports','exports'] as const) {
    const id=`${direction}-${month}`, measure=direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO';
    const basename=`${direction==='imports'?'IMDB':'EXDB'}${month.slice(2,4)}${month.slice(5)}.ZIP`;
    const original={id,kind:'zip',source_url:`https://www.census.gov/trade/downloads/${month.slice(0,4)}/Merch/${direction==='imports'?'im_m':'ex_m'}/${basename}`,context_id:id,processing_commit:sourceCommit,attempted:true,outcome:'complete',status:200,started_at:'2026-10-11T17:00:00Z',retrieved_at:overrides.invalidTimestamp?'invalid':'2026-10-11T17:01:00Z',bytes:100,sha256:'c'.repeat(64),file:`${id}.zip`};
    requests.push(original);
    const rows=[{commodity:'270900',description:'Crude oil',value_usd:100000,detail_record_count:2,special:false},{commodity:'880000',description:'Aircraft',value_usd:100000,detail_record_count:1,special:false}];
    if(overrides.duplicateRow)rows.push({...rows[0]});
    if(overrides.unsafeValue)rows[0].value_usd=Number.MAX_SAFE_INTEGER+1;
    if(overrides.nullValue)(rows[0] as unknown as Record<string,unknown>).value_usd=null;
    const rowsIdentity=await put(`${normalizedRoot}/${id}-hs6.json`,rows);
    const rowsFile={...rowsIdentity,path:overrides.traversal?'../outside.json':`${id}-hs6.json`};
    const receiptIdentity=await put(`${normalizedRoot}/${id}-receipt.json`,{context:{country_code:'1220',month,direction:overrides.crossedReceipt?'other':direction,measure:overrides.wrongMeasure?'CON_VAL_MO':measure,basename},sum_usd:200000,country_total_usd:200000,residual_usd:0,rowsFile});
    const files={rows:rowsFile,receipt:{...receiptIdentity,path:`${id}-receipt.json`}};
    const comparison={referenceCheck:'matched',publicationCheck:'not-reviewed',referenceCorroboration:'current-reference',currentDifferenceUsd:0,publicationDifferenceUsd:null};
    contexts.push({id,month,direction,measure,original,state:'validated',worker:{state:'validated',files},sumUsd:200000,countryTotalUsd:200000,residualUsd:0,hs6Rows:rows.length,beforeComparison:comparison,afterComparison:comparison});
    independent.push({id,sumUsd:200000,countryTotalUsd:200000,residualUsd:0,hs6Rows:rows.length,allNormalizedRowsMatched:true,maintainedOutputs:Object.values(files).map(f=>({file:f.path,bytes:f.bytes,sha256:f.sha256}))});
  }
  if(overrides.duplicateContext)contexts[1]=contexts[0];
  const sourceFiles:Record<string,unknown>={};
  const html='Trade in goods with Canada; millions of U.S. dollars on a nominal basis; not seasonally adjusted<table><tr><th>Month</th><th>Exports</th><th>Imports</th><th>Balance</th></tr>'+snapshotMonths.map(month=>`<tr><td>${new Date(month+'-01T00:00:00Z').toLocaleString('en-US',{month:'long',timeZone:'UTC'})} ${month.slice(0,4)}</td><td>0.2</td><td>0.2</td><td>0.0</td></tr>`).join('')+'</table>';
  for(const label of ['before','after']) {
    const name=`canada-${label}.html`, identity=await put(`${sourceRoot}/${name}`,html,true);
    sourceFiles[name]={...identity,path:name};
    const metadata={id:`canada-${label}`,kind:'html',source_url:'https://www.census.gov/foreign-trade/balance/c1220.html',context_id:null,processing_commit:sourceCommit,outcome:'complete',status:200,bytes:identity.bytes,sha256:identity.sha256,file:name,started_at:'2026-10-11T17:00:00Z',retrieved_at:'2026-10-11T17:01:00Z'};
    const meta=await put(`${sourceRoot}/${name}.request.json`,metadata);sourceFiles[name+'.request.json']={...meta,path:name+'.request.json'};
  }
  // Seven required original publication pins are real constants, even in the synthetic collection.
  const {canadaReviewedPublications}=await import('../../scripts/country-publications');
  const projection=await put(`${sourceRoot}/publication-projection.json`,{schemaVersion:1,countryCode:'1220',publications:canadaReviewedPublications});
  sourceFiles['publication-projection.json']={...projection,path:'publication-projection.json'};
  const bulk=await put(`${sourceRoot}/bulk-report.json`,{schemaVersion:1,countryCode:'1220',months:24,endMonth:'2026-08',processingCommit:sourceCommit,sourceCoverage:'failed',diagnosticOutcome:'failed',snapshotStability:'stable',classificationStatus:'unverified',releaseAccepted:false,rollingComparisonsAvailable:false,defaultAuditRetrievalChanged:false,contexts});
  const manifest=await put(`${sourceRoot}/original-manifest.json`,{schemaVersion:1,processingCommit:sourceCommit,requests});
  const replay=await put(`${normalizedRoot}/offline-replay.json`,{schemaVersion:1,sourceProcessingCommit:sourceCommit,parserProcessingCommit:parserCommit,sourceRoot,outputRoot:normalizedRoot,sourceFiles,contexts,sourceCoverage:'failed',snapshotStability:'stable',releaseAccepted:false,rollingComparisonsAvailable:false,defaultAuditRetrievalChanged:false});
  const verification=await put('review/independent.json',{verdict:'all48-arithmetic-verified-source-coverage-still-failed',findings:[],sourceProcessingCommit:sourceCommit,parserProcessingCommit:parserCommit,contexts:independent,offlineReportIdentity:{file:'offline-replay.json',bytes:replay.bytes,sha256:replay.sha256},sourceCoverage:'failed',classificationStatus:'unverified'});
  const contract={policyId:'canada-archive-snapshot-v1',sourceRoot,normalizedRoot,months:snapshotMonths,candidates:snapshotCandidates,anchors:{bulk,manifest,replay,verification},outputLimit:8*1024*1024};
  return {repoRoot,contract,put,async input(){vi.resetModules();vi.doMock('../../scripts/country-snapshot-contract',()=>({canadaSnapshotContract:contract}));return import('../../scripts/country-snapshot-input');},async cleanup(){vi.doUnmock('../../scripts/country-snapshot-contract');await rm(repoRoot,{recursive:true,force:true});}};
}
export async function consumeContexts(collection:ReviewedCollection) {
  const {readReviewedContexts}=await import('../../scripts/country-snapshot-input');
  const result=[];for await(const context of readReviewedContexts(collection))result.push(context);return result;
}
