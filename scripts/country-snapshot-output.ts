import {mkdir,lstat,open,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {canadaSnapshotContract as contract} from './country-snapshot-contract';
import {assertSnapshotPath} from './country-snapshot-input';
import type {FileIdentity,SnapshotAssessment} from './country-snapshot-types';
type Owner={root:string;dev:number;ino:number;bytes:number;writing:boolean};
const owners=new Map<string,Owner>();
const reservedFailureBytes=8192;
export async function reserveSnapshotOutput(repoRoot:string,outputDir:string):Promise<void>{
  const path=resolve(outputDir);await assertSnapshotPath(repoRoot,path,true);
  await mkdir(path); // no recursive creation; even an empty existing directory is occupied
  await assertSnapshotPath(repoRoot,path);const info=await lstat(path);
  owners.set(path,{root:repoRoot,dev:info.dev,ino:info.ino,bytes:0,writing:false});
}
async function ownerFor(path:string):Promise<Owner>{
  const owner=owners.get(resolve(path));if(!owner)throw new Error('unowned-output');
  await assertSnapshotPath(owner.root,path);const info=await lstat(path);
  if(!info.isDirectory()||info.dev!==owner.dev||info.ino!==owner.ino)throw new Error('changed-output-owner');return owner;
}
async function stage(path:string,name:string,body:string,limit:number):Promise<FileIdentity>{
  const owner=await ownerFor(path),bytes=Buffer.byteLength(body);
  if(owner.bytes+bytes>limit)throw new Error('output-size-limit');
  // Count attempted bytes conservatively; failed partial writes do not replenish the allowance.
  owner.bytes+=bytes;const target=resolve(path,name);const handle=await open(target,'wx');
  try {await handle.writeFile(body);await handle.sync();}finally{await handle.close();}
  await ownerFor(path);const info=await lstat(target);if(!info.isFile()||info.isSymbolicLink()||info.size!==bytes)throw new Error('output-identity');
  return {path:name,bytes,sha256:createHash('sha256').update(body).digest('hex')};
}
export function renderSnapshotReport(result:SnapshotAssessment):string{
  const before=result.months.filter(m=>m.beforeReference.referenceCheck==='mismatch').length;
  const after=result.months.filter(m=>m.afterReference.referenceCheck==='mismatch').length;
  const publication=result.months.filter(m=>m.afterReference.publicationCheck==='matched').length;
  return ['# Canada archive snapshot assessment','',`Archive integrity: **${result.archiveIntegrity}**. Assessment completed: ${result.completed}.`,
    '','Offline assessment only. Release accepted: false. Public rolling comparisons: false. Default audit retrieval changed: false.',
    '',`Reporting grid: September 2024–August 2026, ${result.months.length} monthly direction contexts. Imports are general/customs; exports are domestic plus foreign/reported FAS. Nominal integer USD, national all-transport merchandise, not seasonally adjusted.`,
    '',`Capture interval: ${result.inputProvenance.captureInterval.startedAt} to ${result.inputProvenance.captureInterval.finishedAt}. Processing commit: ${result.processingCommit??'unbound'}.`,
    '','Raw source verification: previous-reviewed-replay; this command freshly checks normalized files and retained current references, and does not read or decompress trade ZIP bodies. The collection is not a uniform revision vintage or latest revised headline history.',
    '',`Current reference mismatches: before ${before}, after ${after}. Reviewed original publication matches: ${publication}; the other contexts are not reviewed against original publications. Original strict-audit failures are preserved.`,
    '','Rolling windows: September 2025–August 2026 versus September 2024–August 2025. Observed sums below are retained observations, not accepted comparisons. Qualified shares use summed same-archive dollar denominators; missing is not zero.',
    '','| Direction | HS6 | Prior observed USD | Current observed USD | Comparison eligible | Reason |','| --- | --- | ---: | ---: | --- | --- |',
    ...result.candidates.map(c=>`| ${c.direction} | ${c.code} | ${c.prior.observedSumUsd??'unavailable'} | ${c.current.observedSumUsd??'unavailable'} | ${c.comparisonEligible} | ${c.reason} |`),
    '','Classification evidence and precise reasons are bound in the JSON artifact. Known statistical categories stay in totals and the selected list. Historical capture flags are unchanged.',''].join('\n');
}
export async function writeSnapshotOutputs(outputDir:string,result:SnapshotAssessment):Promise<readonly FileIdentity[]>{
  const path=resolve(outputDir),owner=await ownerFor(path);if(owner.writing)throw new Error('output-already-writing');owner.writing=true;
  const limit=contract.outputLimit-reservedFailureBytes;
  const markdown=renderSnapshotReport(result),json=JSON.stringify(result,null,2)+'\n';
  // Reject the combined allocation before either artifact can be published.
  if(Buffer.byteLength(markdown)+Buffer.byteLength(json)>limit)throw new Error('output-size-limit');
  const md=await stage(path,'.snapshot-assessment.md.stage',markdown,limit),data=await stage(path,'.snapshot-assessment.json.stage',json,limit);
  await ownerFor(path);await rename(resolve(path,md.path),resolve(path,'snapshot-assessment.md'));
  await ownerFor(path);await rename(resolve(path,data.path),resolve(path,'snapshot-assessment.json'));
  owners.delete(path);return [{...md,path:'snapshot-assessment.md'},{...data,path:'snapshot-assessment.json'}];
}
export async function writeFailedSnapshotOutput(outputDir:string):Promise<void>{
  const body=JSON.stringify({schemaVersion:1,policyId:contract.policyId,completed:false,archiveIntegrity:'failed',failureReason:'snapshot-assessment-failed',releaseAccepted:false,rollingComparisonsAvailable:false,defaultAuditRetrievalChanged:false})+'\n';
  try {await stage(resolve(outputDir),'snapshot-assessment.json',body,contract.outputLimit);}finally{owners.delete(resolve(outputDir));}
}
