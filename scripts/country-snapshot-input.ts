import {createHash} from 'node:crypto';
import {lstat,open,realpath} from 'node:fs/promises';
import {isAbsolute,resolve,relative,parse,sep} from 'node:path';
import {canadaSnapshotContract as contract} from './country-snapshot-contract';
import {parseCountryReference} from './country-reference';
import {canadaReviewedPublications} from './country-publications';
import type {ContextIdentity,FileIdentity,ReviewedCollection,ReviewedContext,SnapshotContext,SnapshotRow} from './country-snapshot-types';

export function snapshotObject(value:unknown):Record<string,unknown> {
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('invalid-object');
  return value as Record<string,unknown>;
}
export function snapshotArray(value:unknown):unknown[]{if(!Array.isArray(value))throw new Error('invalid-array');return value;}
export function snapshotUsd(value:unknown):number {if(typeof value!=='number'||!Number.isSafeInteger(value)||value<0)throw new Error('invalid-usd');return value;}
const sha=(body:Buffer)=>createHash('sha256').update(body).digest('hex');
const timestamp=(value:unknown):string=>{if(typeof value!=='string'||!/^\d{4}-\d\d-\d\dT/.test(value)||!Number.isFinite(Date.parse(value)))throw new Error('invalid-capture');return new Date(value).toISOString();};
const commit=(value:unknown):string=>{if(typeof value!=='string'||!/^[a-f0-9]{40}$/.test(value))throw new Error('invalid-commit');return value;};
const same=(a:unknown,b:unknown)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error('identity-binding');};
export function snapshotFileIdentity(value:unknown):FileIdentity {
  const f=snapshotObject(value);
  if(typeof f.path!=='string'||!f.path||typeof f.sha256!=='string'||!/^[a-f0-9]{64}$/.test(f.sha256)||!Number.isSafeInteger(f.bytes)||Number(f.bytes)<1)throw new Error('invalid-file-identity');
  return {path:f.path,bytes:Number(f.bytes),sha256:f.sha256};
}
// Reject reparse ancestors as well as final links, including within the repository root.
export async function assertSnapshotPath(repoRoot:string,target:string,allowMissing=false):Promise<void> {
  const root=resolve(repoRoot),path=resolve(target),rel=relative(root,path);
  if(rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel))throw new Error('outside-workspace');
  let cursor=parse(path).root;
  for(const piece of path.slice(cursor.length).split(sep).filter(Boolean)) {
    cursor=resolve(cursor,piece);
    try {const info=await lstat(cursor);if(info.isSymbolicLink())throw new Error('reparse-path');}
    catch(error){if(allowMissing&&(error as NodeJS.ErrnoException).code==='ENOENT')return;throw error;}
  }
  if(resolve(await realpath(path))!==path)throw new Error('reparse-path');
}
export async function readSnapshotFile(repoRoot:string,identity:FileIdentity):Promise<Buffer> {
  if(identity.bytes>16*1024*1024)throw new Error('input-size-limit');
  const path=resolve(repoRoot,identity.path);await assertSnapshotPath(repoRoot,path);
  const handle=await open(path,'r');
  try {
    const before=await handle.stat();if(!before.isFile()||before.size!==identity.bytes)throw new Error('input-length');
    const body=Buffer.alloc(identity.bytes+1);let length=0;
    while(length<body.length){const read=await handle.read(body,length,body.length-length,null);if(!read.bytesRead)break;length+=read.bytesRead;}
    const after=await handle.stat();await assertSnapshotPath(repoRoot,path);
    const linked=await lstat(path);
    if(before.dev!==linked.dev||before.ino!==linked.ino||before.size!==after.size||before.mtimeMs!==after.mtimeMs||before.ctimeMs!==after.ctimeMs||length!==identity.bytes||sha(body.subarray(0,length))!==identity.sha256)throw new Error('changed-input');
    return body.subarray(0,length);
  } finally {await handle.close();}
}
const readJson=async(root:string,f:FileIdentity)=>snapshotObject(JSON.parse((await readSnapshotFile(root,f)).toString('utf8')));
function scopedFile(root:string,value:unknown):FileIdentity {
  const f=snapshotFileIdentity(value);if(!/^[A-Za-z0-9._-]+$/.test(f.path)||f.path==='.'||f.path==='..')throw new Error('invalid-relative-file');
  return {...f,path:root+'/'+f.path};
}
function contextIdentity(value:unknown):ContextIdentity {
  const c=snapshotObject(value);
  if(!contract.months.includes(String(c.month))||!['imports','exports'].includes(String(c.direction))||c.id!==`${c.direction}-${c.month}`||c.measure!==(c.direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO'))throw new Error('invalid-context');
  return {id:String(c.id),month:String(c.month),direction:c.direction as ContextIdentity['direction'],measure:c.measure as ContextIdentity['measure']};
}
function grid(value:unknown):Map<string,Record<string,unknown>> {
  const map=new Map<string,Record<string,unknown>>();
  for(const item of snapshotArray(value)){const c=snapshotObject(item),id=contextIdentity(c).id;if(map.has(id))throw new Error('duplicate-context');map.set(id,c);}
  if(map.size!==48||contract.months.some(month=>['imports','exports'].some(d=>!map.has(`${d}-${month}`))))throw new Error('incomplete-grid');return map;
}
export async function loadReviewedCollection(repoRoot:string):Promise<ReviewedCollection> {
  const root=resolve(repoRoot),anchors=Object.values(contract.anchors);
  // Sequential bounded anchor reads; no ZIP or arbitrary directory inventory.
  const bulk=await readJson(root,contract.anchors.bulk),manifest=await readJson(root,contract.anchors.manifest),replay=await readJson(root,contract.anchors.replay),verification=await readJson(root,contract.anchors.verification);
  const sourceProcessingCommit=commit(manifest.processingCommit),parserProcessingCommit=commit(replay.parserProcessingCommit);
  for(const v of [bulk.processingCommit,replay.sourceProcessingCommit,verification.sourceProcessingCommit])same(v,sourceProcessingCommit);
  same(verification.parserProcessingCommit,parserProcessingCommit);
  if(verification.verdict!=='all48-arithmetic-verified-source-coverage-still-failed'||snapshotArray(verification.findings).length)throw new Error('unreviewed-replay');
  const replayIdentity=snapshotObject(verification.offlineReportIdentity);
  if(replayIdentity.file!=='offline-replay.json'||replayIdentity.bytes!==contract.anchors.replay.bytes||replayIdentity.sha256!==contract.anchors.replay.sha256)throw new Error('review-report-binding');
  const originalGrid=grid(bulk.contexts),replayGrid=grid(replay.contexts);
  const checkedGrid=new Map(snapshotArray(verification.contexts).map(x=>{const c=snapshotObject(x);return [String(c.id),c] as const;}));
  if(checkedGrid.size!==48||snapshotArray(verification.contexts).length!==48)throw new Error('invalid-review-grid');
  const sourceFiles=snapshotObject(replay.sourceFiles),requests=snapshotArray(manifest.requests).map(snapshotObject);
  const referenceData=[];
  for(const label of ['before','after']) {
    const name=`canada-${label}.html`,htmlIdentity=scopedFile(contract.sourceRoot,sourceFiles[name]),metaIdentity=scopedFile(contract.sourceRoot,sourceFiles[name+'.request.json']);
    const html=(await readSnapshotFile(root,htmlIdentity)).toString('utf8'),meta=await readJson(root,metaIdentity);
    if(meta.source_url!=='https://www.census.gov/foreign-trade/balance/c1220.html'||meta.file!==name||meta.bytes!==htmlIdentity.bytes||meta.sha256!==htmlIdentity.sha256||meta.status!==200||meta.outcome!=='complete'||meta.processing_commit!==sourceProcessingCommit)throw new Error('invalid-reference-metadata');
    timestamp(meta.started_at);const capturedAt=timestamp(meta.retrieved_at);
    referenceData.push({rows:parseCountryReference(html),sourceFiles:[htmlIdentity,metaIdentity],sourceUrl:String(meta.source_url),capturedAt});
  }
  const projection=await readJson(root,scopedFile(contract.sourceRoot,sourceFiles['publication-projection.json']));
  if(projection.countryCode!=='1220')throw new Error('invalid-publication-country');
  const publications=snapshotArray(projection.publications).map(snapshotObject);
  if(publications.length!==7)throw new Error('incomplete-publications');
  for(const reviewed of canadaReviewedPublications){const entry=publications.find(p=>p.month===reviewed.month);if(!entry)throw new Error('missing-publication');for(const [key,value]of Object.entries(reviewed))same(entry[key],value);}
  let startedAt='9999',finishedAt='';const contexts:ReviewedContext[]=[];
  const usedPaths=new Set<string>();
  for(const month of contract.months)for(const direction of ['imports','exports'] as const){
    const id=`${direction}-${month}`,item=replayGrid.get(id)!,old=originalGrid.get(id)!,verified=checkedGrid.get(id);if(!verified)throw new Error('missing-reviewed-context');
    const identity=contextIdentity(item);same(contextIdentity(old),identity);
    const original=snapshotObject(item.original),request=requests.filter(r=>r.id===id);
    if(request.length!==1)throw new Error('original-request-binding');same(original,request[0]);
    const basename=`${direction==='imports'?'IMDB':'EXDB'}${month.slice(2,4)}${month.slice(5)}.ZIP`;
    const url=`https://www.census.gov/trade/downloads/${month.slice(0,4)}/Merch/${direction==='imports'?'im_m':'ex_m'}/${basename}`;
    if(original.kind!=='zip'||original.context_id!==id||original.processing_commit!==sourceProcessingCommit||original.source_url!==url||original.file!==id+'.zip'||original.outcome!=='complete'||original.status!==200)throw new Error('invalid-original-context');
    snapshotFileIdentity({path:String(original.file),bytes:original.bytes,sha256:original.sha256});
    const start=timestamp(original.started_at),end=timestamp(original.retrieved_at);if(start>end)throw new Error('capture-order');startedAt=start<startedAt?start:startedAt;finishedAt=end>finishedAt?end:finishedAt;
    const files=snapshotObject(snapshotObject(item.worker).files),rowsFile=scopedFile(contract.normalizedRoot,files.rows),receiptFile=scopedFile(contract.normalizedRoot,files.receipt);
    if(rowsFile.path!==contract.normalizedRoot+'/'+id+'-hs6.json'||receiptFile.path!==contract.normalizedRoot+'/'+id+'-receipt.json'||item.state!=='validated')throw new Error('crossed-output');
    for(const f of [rowsFile,receiptFile]){if(usedPaths.has(f.path))throw new Error('duplicate-file');usedPaths.add(f.path);const attested=snapshotArray(verified.maintainedOutputs).map(snapshotObject).filter(x=>x.file===f.path.split('/').at(-1));if(attested.length!==1||attested[0].bytes!==f.bytes||attested[0].sha256!==f.sha256)throw new Error('review-output-binding');}
    const expectedSumUsd=snapshotUsd(item.sumUsd),expectedCountryTotalUsd=snapshotUsd(item.countryTotalUsd),expectedRows=snapshotUsd(item.hs6Rows);
    if(verified.sumUsd!==expectedSumUsd||verified.countryTotalUsd!==expectedCountryTotalUsd||verified.hs6Rows!==expectedRows||verified.allNormalizedRowsMatched!==true||verified.residualUsd!==0||item.residualUsd!==0)throw new Error('review-control-binding');
    const references=referenceData.map((data,i)=>{
      const row=data.rows.filter(r=>r.month===month);if(row.length!==1)throw new Error('missing-reference-context');
      const pub=direction==='exports'?canadaReviewedPublications.find(p=>p.month===month):undefined;
      return {currentUsd:direction==='imports'?row[0].importsUsd:row[0].exportsUsd,publicationUsd:pub?.valueUsd,quantumUsd:100000 as const,sourceFiles:data.sourceFiles,sourceUrl:data.sourceUrl,capturedAt:data.capturedAt,publicationSource:pub?{...pub}:null,recordedComparison:snapshotObject(item[i===0?'beforeComparison':'afterComparison'])};
    });
    contexts.push({...identity,original,rowsFile,receiptFile,expectedSumUsd,expectedCountryTotalUsd,expectedRows,beforeReference:references[0],afterReference:references[1]});
  }
  return {policyId:contract.policyId,repoRoot:root,anchors,sourceProcessingCommit,parserProcessingCommit,captureInterval:{startedAt,finishedAt},rawVerification:'previous-reviewed-replay',strictAuditVerdicts:{original:{sourceCoverage:bulk.sourceCoverage,diagnosticOutcome:bulk.diagnosticOutcome,classificationStatus:bulk.classificationStatus},inventory:{sourceCoverage:replay.sourceCoverage}},snapshotStability:replay.snapshotStability,contexts};
}
export async function* readReviewedContexts(collection:ReviewedCollection):AsyncIterable<SnapshotContext> {
  for(const c of collection.contexts){
    const receipt=await readJson(collection.repoRoot,c.receiptFile),metadata=snapshotObject(receipt.context);
    const basename=`${c.direction==='imports'?'IMDB':'EXDB'}${c.month.slice(2,4)}${c.month.slice(5)}.ZIP`;
    if(metadata.country_code!=='1220'||metadata.month!==c.month||metadata.direction!==c.direction||metadata.measure!==c.measure||metadata.basename!==basename||receipt.sum_usd!==c.expectedSumUsd||receipt.country_total_usd!==c.expectedCountryTotalUsd||receipt.residual_usd!==0)throw new Error('receipt-binding');
    same(scopedFile(contract.normalizedRoot,receipt.rowsFile),c.rowsFile);
    const raw=snapshotArray(JSON.parse((await readSnapshotFile(collection.repoRoot,c.rowsFile)).toString('utf8'))),seen=new Set<string>();
    const rows:SnapshotRow[]=raw.map(value=>{
      const r=snapshotObject(value);if(typeof r.commodity!=='string'||!/^\d{6}$/.test(r.commodity)||seen.has(r.commodity)||(r.description!==null&&typeof r.description!=='string')||typeof r.special!=='boolean')throw new Error('invalid-hs6-row');seen.add(r.commodity);
      const detailRecordCount=snapshotUsd(r.detail_record_count);if(detailRecordCount===0)throw new Error('empty-detail-count');
      return {code:r.commodity,description:r.description as string|null,valueUsd:snapshotUsd(r.value_usd),detailRecordCount,specialAtCapture:r.special};
    });
    if(rows.length!==c.expectedRows)throw new Error('row-count');
    yield {id:c.id,month:c.month,direction:c.direction,measure:c.measure,countryTotalUsd:snapshotUsd(receipt.country_total_usd),rows,beforeReference:c.beforeReference,afterReference:c.afterReference};
  }
}
