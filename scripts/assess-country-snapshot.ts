import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
import {lstat} from 'node:fs/promises';
import {isAbsolute,relative,resolve,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {assertSnapshotPath,loadReviewedCollection,readReviewedContexts} from './country-snapshot-input';
import {assessCountrySnapshot,parseSnapshotClassificationLedger} from './country-snapshot-assessment';
import {reserveSnapshotOutput,writeSnapshotOutputs,writeFailedSnapshotOutput} from './country-snapshot-output';
import type {SnapshotAssessment} from './country-snapshot-types';
export type SnapshotOptions={repoRoot:string;outputDir:string;preflight:boolean};
const git=promisify(execFile),ledgerPath='docs/data-validation/1220-snapshot-classification-evidence.json';
const repository=resolve(fileURLToPath(new URL('..',import.meta.url)));
export function resolveSnapshotOptions(args:string[],repoRoot:string):SnapshotOptions{
  let output:string|undefined,preflight=false;const seen=new Set<string>();
  for(let i=0;i<args.length;i++){
    const arg=args[i];if(seen.has(arg))throw new Error('duplicate-option');seen.add(arg);
    if(arg==='--preflight')preflight=true;
    else if(arg==='--output'){output=args[++i];if(!output||output.startsWith('--'))throw new Error('missing-output');}
    else throw new Error('unknown-option');
  }
  if(!output||output.split(/[\\/]/).includes('..'))throw new Error('missing-or-invalid-output');
  const root=resolve(repoRoot),outputRoot=resolve(root,'data/backups/canada-country-audit'),outputDir=resolve(root,output),rel=relative(outputRoot,outputDir);
  if(!rel||rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel))throw new Error('invalid-output-root');
  return {repoRoot:root,outputDir,preflight};
}
export async function runCountrySnapshot(options:SnapshotOptions):Promise<{exitCode:0|1;result:SnapshotAssessment|null}>{
  let owned=false;
  try {
    // Revalidate internal options too: tests or another script cannot bypass root containment.
    const validated=resolveSnapshotOptions(['--output',options.outputDir,...(options.preflight?['--preflight']:[])],options.repoRoot);
    await assertSnapshotPath(validated.repoRoot,validated.outputDir,true);
    await assertSnapshotPath(validated.repoRoot,resolve(validated.outputDir,'..'));
    if(!(await lstat(resolve(validated.outputDir,'..'))).isDirectory())throw new Error('invalid-output-parent');
    try {await lstat(validated.outputDir);throw new Error('occupied-output');}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
    if(options.preflight)return {exitCode:0,result:null};
    await reserveSnapshotOutput(options.repoRoot,options.outputDir);owned=true;
    const gitOptions={cwd:options.repoRoot,windowsHide:true,timeout:10000,maxBuffer:1024*1024,encoding:'buffer' as const};
    const head=(await git('git',['rev-parse','--verify','HEAD'],gitOptions)).stdout.toString().trim();if(!/^[a-f0-9]{40}$/.test(head))throw new Error('invalid-processing-version');
    const body=(await git('git',['show',`${head}:${ledgerPath}`],gitOptions)).stdout;
    const classifications=parseSnapshotClassificationLedger(JSON.parse(body.toString('utf8')));
    const collection=await loadReviewedCollection(options.repoRoot),result=await assessCountrySnapshot(collection,readReviewedContexts(collection),classifications);
    if(!result.completed||result.archiveIntegrity!=='passed')throw new Error('incomplete-assessment');
    result.processingCommit=head;result.classificationLedgerIdentity={path:ledgerPath,bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')};
    await writeSnapshotOutputs(options.outputDir,result);return {exitCode:0,result};
  }catch{
    if(owned)await writeFailedSnapshotOutput(options.outputDir).catch(()=>{});
    return {exitCode:1,result:null};
  }
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  try {
    if(Number(process.versions.node.split('.')[0])!==24)throw new Error('node-version');
    runCountrySnapshot(resolveSnapshotOptions(process.argv.slice(2),repository)).then(({exitCode,result})=>{
      process.exitCode=exitCode;
      process.stdout.write(exitCode===0?(result?'Offline snapshot assessment completed; release and public comparisons remain unavailable.\n':'Snapshot preflight passed; no assessment or output created.\n'):'Snapshot assessment failed. Check retained reviewed inputs, committed ledger and fresh output path.\n');
    });
  }catch{process.stderr.write('Snapshot command requires Node 24 and a fresh bounded --output path.\n');process.exitCode=1;}
}
