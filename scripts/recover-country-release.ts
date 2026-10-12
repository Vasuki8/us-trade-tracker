import {resolve,relative,isAbsolute,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {assertCountryReleaseNodeVersion} from './prepare-country-release';
import {countryOutputPath} from '../src/lib/country-release/prepare.server';
import {recoverCountryCandidate} from '../src/lib/country-release/recovery.server';
import {canadaCountryReleaseContract as contract} from '../src/lib/country-release/contract.server';
import type {CountryRecoveryReceipt} from '../src/lib/country-release/types';
const repository=resolve(fileURLToPath(new URL('..',import.meta.url)));
export function resolveCountryReleaseRecoveryOptions(args:string[],repoRoot:string):{repoRoot:string;candidateFile:string;outputDir:string}{
  const values=new Map<string,string>();for(let i=0;i<args.length;i++){const arg=args[i];if(!['--candidate','--output'].includes(arg)||values.has(arg))throw new Error('country-unknown-or-duplicate-option');const value=args[++i];if(!value||value.startsWith('--')||value.split(/[\\/]/).includes('..'))throw new Error('country-invalid-option-value');values.set(arg,value);}
  if(values.size!==2)throw new Error('country-missing-option');const root=resolve(repoRoot),candidateFile=resolve(root,values.get('--candidate')!),rel=relative(resolve(root,contract.backupRoot),candidateFile);
  if(!rel||rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel)||!rel.split(sep).every((p,i,a)=>i===a.length-1?/^[A-Za-z0-9_-]+\.json$/.test(p):/^[A-Za-z0-9_-]+$/.test(p)))throw new Error('country-candidate-namespace');return {repoRoot:root,candidateFile,outputDir:countryOutputPath(root,values.get('--output')!)};
}
export async function runCountryReleaseRecovery(opts:ReturnType<typeof resolveCountryReleaseRecoveryOptions>):Promise<{exitCode:0|1;receipt:CountryRecoveryReceipt|null}>{
  try{assertCountryReleaseNodeVersion();const options=resolveCountryReleaseRecoveryOptions(['--candidate',opts.candidateFile,'--output',opts.outputDir],opts.repoRoot);return {exitCode:0,receipt:await recoverCountryCandidate(options)};}catch{return {exitCode:1,receipt:null};}
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  try{assertCountryReleaseNodeVersion();const result=await runCountryReleaseRecovery(resolveCountryReleaseRecoveryOptions(process.argv.slice(2),repository));process.exitCode=result.exitCode;process.stdout.write(result.exitCode?'Country recovery failed. Check the package bytes and fresh contained output; no release selected.\n':'Country candidate recovery verified using packaged evidence only; no release selected.\n');}
  catch{process.stderr.write('Country recovery requires Node 24, --candidate and --output beneath the country backup namespace.\n');process.exitCode=1;}
}
