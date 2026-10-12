import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {randomUUID} from 'node:crypto';
import {lstat} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {assertSnapshotPath} from './country-snapshot-input';
import {countryOutputPath,prepareCountryRelease} from '../src/lib/country-release/prepare.server';
import {readCountryReleaseEvidence} from '../src/lib/country-release/evidence.server';
import {countryCommit} from '../src/lib/country-release/contract.server';
import type {Digest} from '../src/lib/country-release/types';
const git=promisify(execFile),repository=resolve(fileURLToPath(new URL('..',import.meta.url)));
export function assertCountryReleaseNodeVersion(version=process.versions.node):void{if(!/^24\.\d+\.\d+$/.test(version))throw new Error('country-node-version');}
export function resolveCountryReleasePrepareOptions(args:string[],repoRoot:string):{repoRoot:string;outputDir:string;preflight:boolean}{
  let output:string|undefined,preflight=false;const seen=new Set<string>();
  for(let i=0;i<args.length;i++){const arg=args[i];if(seen.has(arg))throw new Error('country-duplicate-option');seen.add(arg);if(arg==='--preflight')preflight=true;else if(arg==='--output'){output=args[++i];if(!output||output.startsWith('--'))throw new Error('country-missing-output');}else throw new Error('country-unknown-option');}
  if(!output||output.split(/[\\/]/).includes('..'))throw new Error('country-invalid-output');const root=resolve(repoRoot);return {repoRoot:root,outputDir:countryOutputPath(root,output),preflight};
}
export async function runCountryReleasePrepare(opts:ReturnType<typeof resolveCountryReleasePrepareOptions>):Promise<{exitCode:0|1;candidateDigest:Digest|null}>{
  try{assertCountryReleaseNodeVersion();const options=resolveCountryReleasePrepareOptions(['--output',opts.outputDir,...(opts.preflight?['--preflight']:[])],opts.repoRoot);
    await assertSnapshotPath(options.repoRoot,dirname(options.outputDir));if(!(await lstat(dirname(options.outputDir))).isDirectory())throw new Error('country-output-parent');await assertSnapshotPath(options.repoRoot,options.outputDir,true);
    try{await lstat(options.outputDir);throw new Error('country-output-occupied');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
    if(options.preflight){await readCountryReleaseEvidence(options.repoRoot);return {exitCode:0,candidateDigest:null};}
    const head=countryCommit((await git('git',['rev-parse','--verify','HEAD'],{cwd:options.repoRoot,windowsHide:true,timeout:10000,maxBuffer:1024})).stdout.trim());
    const result=await prepareCountryRelease({...options,metadata:{releaseId:'2026-08-'+randomUUID(),packagingCommit:head,preparedAt:new Date().toISOString()}});return {exitCode:0,candidateDigest:result.package.digest};
  }catch{return {exitCode:1,candidateDigest:null};}
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  try{assertCountryReleaseNodeVersion();const result=await runCountryReleasePrepare(resolveCountryReleasePrepareOptions(process.argv.slice(2),repository));process.exitCode=result.exitCode;process.stdout.write(result.exitCode?'Country preparation failed. Check fixed retained evidence and a fresh output beneath the existing backup parent.\n':result.candidateDigest?`Country candidate prepared: ${result.candidateDigest.sha256}. Recovery and review remain pending; no release selected.\n`:'Country preflight passed; no output created.\n');}
  catch{process.stderr.write('Country preparation requires Node 24, --output and optional --preflight.\n');process.exitCode=1;}
}
