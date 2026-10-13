import {lstat} from 'node:fs/promises';
import {resolve,relative,isAbsolute} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {assertSnapshotPath} from './country-snapshot-input';
import {readR2Config} from './archive-store';
import {countryArchiveContract as contract} from '../src/lib/country-archive/contract.server';
import {countryJsonBytes,countryJson,countrySame,parseCountryDigest,digestCountryBytes} from '../src/lib/country-release/contract.server';
import {readCountryBoundedFile,writeCountryExclusiveFile} from '../src/lib/country-release/prepare.server';
import {loadCountrySourceManifest} from '../src/lib/country-archive/sources.server';
import {prepareCountryArchive,reserveArchiveOutput} from '../src/lib/country-archive/bundle.server';
import {createCountryArchiveStore,createCountryUploadCapabilities,uploadDescriptors} from '../src/lib/country-archive/transport.server';
import {uploadCountryObjects,CountryArchiveUploadReceiptError} from '../src/lib/country-archive/upload.server';
import {verifyCountryArchive,verifySelectedCountryArchive,CountryArchiveVerificationReceiptError} from '../src/lib/country-archive/verify.server';
import type {Digest} from '../src/lib/country-release/types';
type Mode='prepare'|'capabilities'|'upload'|'verify'|'verify-selected';
type Options={mode:Mode;repoRoot:string;outputDir:string;preflight:boolean;initialize:boolean;bundleDigest?:Digest;capabilityDigest?:Digest;ownerFile?:string;bundlePath?:string;bundleFile?:string;capabilityFile?:string;account?:string;bucket?:string};
const modes:Mode[]=['prepare','capabilities','upload','verify','verify-selected'];
export function resolveCountryArchiveOptions(args:string[],repoRoot:string):Options {
  const mode=args[0] as Mode;if(!modes.includes(mode))throw new Error('country-archive-mode');
  const allowed:Record<Mode,string[]>={prepare:['--owner-instruction-file'],capabilities:['--bundle-sha256','--bundle-bytes','--bundle-path'],upload:['--bundle-file','--capability-file','--capability-sha256','--capability-bytes','--account','--bucket'],verify:['--bundle-sha256','--bundle-bytes','--initialize'],'verify-selected':[]};
  const values=new Map<string,string>();let preflight=false,initialize=false;
  for(let i=1;i<args.length;i++){const key=args[i];if(values.has(key))throw new Error('country-archive-duplicate-option');if(!['--output','--preflight',...allowed[mode]].includes(key))throw new Error('country-archive-unknown-option');if(key==='--preflight'||key==='--initialize'){values.set(key,'true');preflight||=key==='--preflight';initialize||=key==='--initialize';}else{const value=args[++i];if(!value||value.startsWith('--'))throw new Error('country-archive-missing-option');values.set(key,value);}}
  const requireValue=(key:string)=>{const value=values.get(key);if(!value)throw new Error('country-archive-missing-option');return value;};
  const root=resolve(repoRoot),out=requireValue('--output');if(out.split(/[\\/]/).includes('..'))throw new Error('country-archive-output');const outputDir=resolve(root,out),rel=relative(resolve(root,contract.backupRoot),outputDir);if(!/^[A-Za-z0-9_-]+$/.test(rel)||isAbsolute(rel)||rel==='..')throw new Error('country-archive-output');
  const digest=(prefix:string,limit:number)=>{const count=requireValue(prefix+'-bytes');if(!/^[1-9]\d*$/.test(count))throw new Error('country-archive-size');return parseCountryDigest({bytes:Number(count),sha256:requireValue(prefix+'-sha256')},limit);};
  const opts:Options={mode,repoRoot:root,outputDir,preflight,initialize};
  if(mode==='prepare')opts.ownerFile=resolve(root,requireValue('--owner-instruction-file'));
  if(mode==='verify'||mode==='capabilities')opts.bundleDigest=digest('--bundle',contract.limits.bundle);
  if(mode==='capabilities'){opts.bundlePath=requireValue('--bundle-path');const path=opts.bundlePath;if(!path.startsWith(contract.backupRoot+'/')||!/^data\/backups\/canada-country-archive\/[A-Za-z0-9_-]+\/bundle\.json$/.test(path))throw new Error('country-archive-bundle-path');}
  if(mode==='upload'){opts.capabilityDigest=digest('--capability',contract.limits.capabilities);opts.capabilityFile=resolve(root,requireValue('--capability-file'));opts.bundleFile=resolve(root,requireValue('--bundle-file'));opts.account=requireValue('--account');opts.bucket=requireValue('--bucket');if(!/^[a-f0-9]{32}$/.test(opts.account)||!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(opts.bucket))throw new Error('country-archive-target');}
  return opts;
}
export async function runCountryArchive(opts:Options,env:NodeJS.ProcessEnv=process.env,storeFactory=()=>createCountryArchiveStore(readR2Config(env))):Promise<{exitCode:0|1;summary:string}> {
  try {
    if(!/^24\.\d+\.\d+$/.test(process.versions.node))throw new Error('country-archive-node');
    await assertSnapshotPath(opts.repoRoot,opts.outputDir,true);try{await lstat(opts.outputDir);throw new Error('country-archive-output-occupied');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
    const source=await loadCountrySourceManifest(opts.repoRoot);
    if(opts.mode==='capabilities')uploadDescriptors(source.manifest,opts.bundleDigest!,opts.bundlePath!);
    if(opts.mode==='prepare'){const owner=await readCountryBoundedFile(opts.repoRoot,opts.ownerFile!,8192);const instruction=new TextDecoder('utf8',{fatal:true}).decode(owner);if(instruction.trim().length<40)throw new Error('country-archive-owner-instruction');if(opts.preflight)return {exitCode:0,summary:'Canada archive preparation preflight passed.'};const result=await prepareCountryArchive({...opts,operatorInstruction:instruction});return {exitCode:0,summary:`Canada bundle prepared: ${result.bundleDigest.sha256}, ${result.bundleDigest.bytes} bytes.`};}
    if(opts.preflight)return {exitCode:0,summary:'Canada archive preflight passed; no storage access or output created.'};
    if(opts.mode==='capabilities'){const caps=await createCountryUploadCapabilities({config:readR2Config(env),sourceManifest:source.manifest,bundleDigest:opts.bundleDigest!,localBundlePath:opts.bundlePath!,now:new Date()}),output=await reserveArchiveOutput(opts.repoRoot,opts.outputDir),bytes=countryJsonBytes(caps);await writeCountryExclusiveFile(opts.repoRoot,resolve(output,'capabilities.json'),bytes);const digest=digestCountryBytes(bytes);await writeCountryExclusiveFile(opts.repoRoot,resolve(output,'capability-identity.json'),countryJsonBytes({schemaVersion:1,digest,sourceManifestDigest:source.digest,bundleDigest:opts.bundleDigest,accountId:caps.accountId,bucketName:caps.bucketName,objects:caps.objects.length,expiresAt:caps.expiresAt}));return {exitCode:0,summary:`Private capabilities prepared: ${digest.sha256}, ${digest.bytes} bytes; ${caps.objects.length} conditional objects.`};}
    if(opts.mode==='upload'){const bytes=await readCountryBoundedFile(opts.repoRoot,opts.capabilityFile!,contract.limits.capabilities);countrySame(digestCountryBytes(bytes),opts.capabilityDigest);const caps=countryJson(bytes,contract.limits.capabilities) as {accountId:unknown;bucketName:unknown};countrySame(caps.accountId,opts.account);countrySame(caps.bucketName,opts.bucket);const receipt=await uploadCountryObjects({...opts,capabilityFile:opts.capabilityFile!,capabilityDigest:opts.capabilityDigest!,bundleFile:opts.bundleFile!,onProgress:progress=>{if(progress.completed%32===0||progress.completed===progress.total)process.stdout.write(`Canada upload ${progress.completed}/${progress.total}; failures ${progress.failed}.\n`);}});return {exitCode:receipt.status==='complete'?0:1,summary:`Canada upload ${receipt.status}; ${receipt.outcomes.length} object outcomes recorded. Remote verification remains required.`};}
    const store=storeFactory(),receipt=opts.mode==='verify-selected'?await verifySelectedCountryArchive({...opts,store}):await verifyCountryArchive({...opts,store,bundleDigest:opts.bundleDigest!});
    const success=receipt.currentStateVerified&&['initialized','confirmed-by-readback','already-selected','read-only-verified'].includes(receipt.archiveOutcome);
    return {exitCode:success?0:1,summary:`Canada archive ${receipt.archiveOutcome}; verified ${receipt.sourceCount} source files / ${receipt.sourceBytes} bytes; isolated recovery passed.`};
  }catch(error){if(error instanceof CountryArchiveVerificationReceiptError)return {exitCode:1,summary:`Canada verification receipt persistence failed; established outcome ${error.receipt.archiveOutcome}, current-state verified ${error.receipt.currentStateVerified}.`};if(error instanceof CountryArchiveUploadReceiptError)return {exitCode:1,summary:`Canada upload receipt persistence failed; transfer status ${error.receipt.status}.`};return {exitCode:1,summary:'Canada archive operation failed. Check fixed identities, fresh output, private artifact integrity and transport access.'};}
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){try{const opts=resolveCountryArchiveOptions(process.argv.slice(2),resolve(fileURLToPath(new URL('..',import.meta.url)))),result=await runCountryArchive(opts);process.stdout.write(result.summary+'\n');process.exitCode=result.exitCode;}catch{process.stderr.write('Invalid Canada archive mode/options; consult the private archive operator guide.\n');process.exitCode=1;}}
