import {execFile,execFileSync} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {resolve,relative,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {lstat} from 'node:fs/promises';
import {assertLocalPath,readSiteFile,type FileIdentity} from './site-preparation-files';
import type {SiteManifest} from './site-assembly';

export type LivePackageOptions={workDir:string;manifestPath:string;zipPath:string;manifestSha256:string;zipSha256:string};
export type ExpectedLiveCheck={path:string;allowedPaths:string[];statuses:number[];bytes:number;sha256:string;privateRoute:boolean};
export type LiveSitePackage={manifest:SiteManifest;manifestIdentity:FileIdentity;zip:FileIdentity;checks:ExpectedLiveCheck[]};
const checkout=fileURLToPath(new URL('../',import.meta.url));
const run=promisify(execFile);
const digest=(body:Buffer)=>createHash('sha256').update(body).digest('hex');
const privatePaths=['/preview/countries/1220/','/preview/accepted/countries/1220/','/countries/9999/','/data/countries/1220/processed/current.json'];

export async function assertLiveWorkDir(workDir:string):Promise<void>{
  const rel=relative(checkout,resolve(workDir));
  if(workDir.split(/[\\/]/).includes('..')||!rel.startsWith('.tmp'+sep))throw Error('live-work-scope');
  try{
    execFileSync('git',['check-ignore','--quiet','--',resolve(workDir)],{cwd:checkout,timeout:10000,maxBuffer:4096,stdio:'pipe'});
    await assertLocalPath(checkout,workDir);
    if(!(await lstat(workDir)).isDirectory())throw Error('not-directory');
  }catch{throw Error('live-work-scope');}
}
async function verifyPackage(options:LivePackageOptions):Promise<unknown>{
  const python=process.env.SITE_PACKAGE_PYTHON;
  if(!python)throw Error('live-package-verification');
  try{
    const {stdout}=await run(python,[resolve(checkout,'scripts/package_site.py'),'verify','--work-dir',options.workDir,'--manifest',options.manifestPath,'--zip',options.zipPath],{encoding:'utf8',timeout:30000,maxBuffer:65536,windowsHide:true});
    return JSON.parse(stdout);
  }catch{throw Error('live-package-verification');}
}
function freeze<T>(value:T):T{
  if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}
  return value;
}
function allowedPaths(path:string):string[]{
  const paths=[path];
  if(path.endsWith('.html')){paths.push(path.slice(0,-5),path.slice(0,-5)+'/');if(path.endsWith('/index.html'))paths.push(path.slice(0,-10),path.slice(0,-11)||'/');}
  return [...new Set(paths)];
}
export async function loadLiveSitePackage(options:LivePackageOptions,verify:(options:LivePackageOptions)=>Promise<unknown>=verifyPackage):Promise<LiveSitePackage>{
  await assertLiveWorkDir(options.workDir);
  let manifestBody:Buffer,zipBody:Buffer;
  try{
    if(!/^[a-f0-9]{64}$/.test(options.manifestSha256)||!/^[a-f0-9]{64}$/.test(options.zipSha256))throw Error('pin');
    manifestBody=await readSiteFile(options.workDir,options.manifestPath,1048576);
    zipBody=await readSiteFile(options.workDir,options.zipPath,4194304);
    if(digest(manifestBody)!==options.manifestSha256||digest(zipBody)!==options.zipSha256)throw Error('pin');
  }catch{throw Error('live-package-input');}
  const receipt=await verify(options);
  // The Python verifier supplies the schema/path/template/ZIP validation.
  // Parse only the exact bytes pinned above and re-read both inputs after it exits.
  try{
    await readSiteFile(options.workDir,options.manifestPath,1048576,{bytes:manifestBody.length,sha256:options.manifestSha256});
    await readSiteFile(options.workDir,options.zipPath,4194304,{bytes:zipBody.length,sha256:options.zipSha256});
  }catch{throw Error('live-package-changed');}
  const manifest=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(manifestBody)) as SiteManifest;
  const r=receipt as Record<string,unknown>|null;
  if(!r||r.entriesVerified!==true||r.entryCount!==manifest.fileCount||r.bytes!==zipBody.length||r.sha256!==options.zipSha256)throw Error('live-package-receipt');
  if(manifest.packageKind!=='site'||manifest.totalBytes>8388608||(manifest.files.length-1+privatePaths.length)*2>128)throw Error('live-package-policy');
  const checks:ExpectedLiveCheck[]=manifest.files.filter(f=>f.role!=='provider-control').map(f=>{
    const path='/'+f.path.split('/').map(encodeURIComponent).join('/');
    return{path,allowedPaths:allowedPaths(path),statuses:f.role==='served-error-page'?[200,404]:[200],bytes:f.bytes,sha256:f.sha256,privateRoute:false};
  });
  const error=manifest.files.find(f=>f.path==='404.html');
  if(!error)throw Error('live-package-policy');
  for(const path of privatePaths)checks.push({path,allowedPaths:[path],statuses:[404],bytes:error.bytes,sha256:error.sha256,privateRoute:true});
  return freeze({manifest,manifestIdentity:{path:relative(options.workDir,options.manifestPath).split(sep).join('/'),bytes:manifestBody.length,sha256:options.manifestSha256},zip:{path:relative(options.workDir,options.zipPath).split(sep).join('/'),bytes:zipBody.length,sha256:options.zipSha256},checks});
}
