import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,lstat,symlink} from 'node:fs/promises';
import {resolve,relative,sep} from 'node:path';
import {loadCanadaPilot} from '../src/lib/country-preview/pilot-load.server';
import {canadaCountryReleaseContract as release,countryJsonBytes,digestCountryBytes,countrySame} from '../src/lib/country-release/contract.server';
import {countryArchiveContract as archive} from '../src/lib/country-archive/contract.server';
import {assertLocalPath,localName,readSiteFile,writeSiteFile,type FileIdentity} from './site-preparation-files';
export type SiteStageOptions={sourceRoot:string;dataRoot:string;outputRoot:string;commit:string};
export type SourceIdentity=FileIdentity&{mode:'100644'|'100755';gitBlob:string};
export type NamedDataIdentity=FileIdentity&{kind:'country-pointer'|'country-package'|'country-acceptance'|'product-pointer'|'product-release';productCode?:string};
export type SiteStageReceipt={schemaVersion:1;status:'staged-for-local-build';codeCommit:string;sources:SourceIdentity[];data:NamedDataIdentity[];country:{releaseId:string;reporting:{from:string;to:string;latest:string};pointer:{bytes:number;sha256:string};projection:{bytes:number;sha256:string}};products:{code:string;pointer:FileIdentity;release:FileIdentity}[];runtime:{nodeMajor:24;dependencyMode:'shared-existing';dependencyTarget:string;lock:FileIdentity}};
export function siteGit(root:string,args:string[],input?:Buffer):Buffer{return execFileSync('git',args,{cwd:root,input,maxBuffer:128*1024*1024,stdio:['pipe','pipe','pipe']});}
export async function siteSources(root:string,commit:string):Promise<{identity:SourceIdentity;body:Buffer}[]>{
 await assertLocalPath(root,root);if(!/^[a-f0-9]{40}$/.test(commit))throw Error('site-invalid-commit');
 const entries=siteGit(root,['ls-tree','-rz',commit]).toString('utf8').split('\0').filter(Boolean).map(line=>{
  const tab=line.indexOf('\t'),meta=line.slice(0,tab).split(' '),path=localName(line.slice(tab+1));
  if(tab<0||meta[1]!=='blob'||!['100644','100755'].includes(meta[0])||!/^[a-f0-9]{40}$/.test(meta[2]))throw Error('site-nonregular-git-source');return{path,mode:meta[0] as SourceIdentity['mode'],gitBlob:meta[2]};
 });const names=new Set<string>();for(const e of entries){if(names.has(e.path.toLowerCase()))throw Error('site-source-case-collision');names.add(e.path.toLowerCase());}
 if(!entries.length)throw Error('site-empty-source');const batch=siteGit(root,['cat-file','--batch'],Buffer.from(entries.map(e=>e.gitBlob).join('\n')+'\n'));let offset=0;
 const result=entries.map(entry=>{
  const newline=batch.indexOf(10,offset),header=batch.subarray(offset,newline).toString().split(' '),bytes=Number(header[2]);
  if(newline<0||header[0]!==entry.gitBlob||header[1]!=='blob'||!Number.isSafeInteger(bytes)||bytes<0||bytes>16*1024*1024)throw Error('site-git-batch');
  const body=batch.subarray(newline+1,newline+1+bytes);if(body.length!==bytes||batch[newline+1+bytes]!==10||createHash('sha1').update(Buffer.from('blob '+body.length+'\0')).update(body).digest('hex')!==entry.gitBlob)throw Error('site-git-blob');
  offset=newline+1+bytes+1;return{identity:{...entry,...digestCountryBytes(body)},body};
 });if(offset!==batch.length)throw Error('site-git-batch-extra');return result;
}
export async function siteData(root:string):Promise<{files:{identity:NamedDataIdentity;body:Buffer}[];country:SiteStageReceipt['country'];products:SiteStageReceipt['products']}>{
 await assertLocalPath(root,root);const state=release.stateRoot,pointerPath=state+'/current.json',pointerBody=await readSiteFile(root,resolve(root,pointerPath),release.limits.pointer,archive.selectedPointerDigest),pointer=JSON.parse(pointerBody.toString());
 const pilot=await loadCanadaPilot({workspaceRoot:root,environment:{CANADA_PILOT_MODE:'snapshot',TRADE_DATA_MODE:'census'}});
 if(!pilot||pilot.presentation.kind!=='pilot-snapshot'||pointer.releaseId!==archive.releaseId)throw Error('site-invalid-country-selection');
 countrySame(digestCountryBytes(countryJsonBytes(pilot.data)),release.projection);
 if(pilot.data.reporting.to!=='2026-08'||pilot.data.reporting.from!=='2024-09')throw Error('site-country-coverage');
 const files:{identity:NamedDataIdentity;body:Buffer}[]=[{identity:{path:pointerPath,...digestCountryBytes(pointerBody),kind:'country-pointer'},body:pointerBody}];
 for(const [name,kind]of [['package','country-package'],['acceptance','country-acceptance']] as const){
  const ref=pointer[name],expected='releases/'+archive.releaseId+'/'+(name==='package'?'candidate.json':'acceptance.json');if(ref?.path!==expected)throw Error('site-country-path');
  const path=state+'/'+localName(ref.path),body=await readSiteFile(root,resolve(root,path),name==='package'?release.limits.package:release.limits.record,ref);files.push({identity:{path,...digestCountryBytes(body),kind},body});
 }
 const pins=new Map(release.protectedFiles.map(f=>[f.path,f])),products:SiteStageReceipt['products']=[];
 for(const [code,base]of [['090121','data/processed'],['090111','data/products/090111/processed']]){
  const path=base+'/current.json',pin=pins.get(path);if(!pin)throw Error('site-product-pin');
  const body=await readSiteFile(root,resolve(root,path),release.limits.pointer,pin),v=JSON.parse(body.toString());
  if(typeof v.releaseFile!=='string'||!/^releases\/2026-08-[a-z0-9-]+\.json$/.test(v.releaseFile))throw Error('site-product-pointer');
  const releasePath=base+'/'+localName(v.releaseFile),releasePin=pins.get(releasePath);if(!releasePin)throw Error('site-product-release-pin');
  const releaseBody=await readSiteFile(root,resolve(root,releasePath),16*1024*1024,releasePin);
  const a={path,...digestCountryBytes(body)},b={path:releasePath,...digestCountryBytes(releaseBody)};
  files.push({identity:{...a,kind:'product-pointer',productCode:code},body},{identity:{...b,kind:'product-release',productCode:code},body:releaseBody});products.push({code,pointer:a,release:b});
 }
 return{files,country:{releaseId:pointer.releaseId,reporting:pilot.data.reporting,pointer:digestCountryBytes(pointerBody),projection:release.projection},products};
}
export async function stageInformation(sourceRoot:string,dataRoot:string,commit:string):Promise<{receipt:SiteStageReceipt;sources:Awaited<ReturnType<typeof siteSources>>;data:Awaited<ReturnType<typeof siteData>>}>{
 if(Number(process.versions.node.split('.')[0])!==24)throw Error('site-node-24-required');
 const sources=await siteSources(sourceRoot,commit),data=await siteData(dataRoot),lock=sources.find(f=>f.identity.path==='package-lock.json')?.identity;
 if(!lock)throw Error('site-lockfile-required');const dependencyTarget=resolve(sourceRoot,'node_modules');await assertLocalPath(sourceRoot,dependencyTarget);if(!(await lstat(dependencyTarget)).isDirectory())throw Error('site-runtime-directory');
 return{receipt:{schemaVersion:1,status:'staged-for-local-build',codeCommit:commit,sources:sources.map(s=>s.identity),data:data.files.map(f=>f.identity),country:data.country,products:data.products,runtime:{nodeMajor:24,dependencyMode:'shared-existing',dependencyTarget,lock:{path:lock.path,bytes:lock.bytes,sha256:lock.sha256}}},sources,data};
}
async function cleanHead(root:string,commit:string){if(siteGit(root,['rev-parse','HEAD']).toString().trim()!==commit)throw Error('site-commit-not-head');if(siteGit(root,['status','--porcelain','--untracked-files=all']).toString().trim())throw Error('site-clean-checkout-required');}
export async function createSiteStage(options:SiteStageOptions):Promise<SiteStageReceipt>{
 const sourceRoot=resolve(options.sourceRoot),dataRoot=resolve(options.dataRoot),outputRoot=resolve(options.outputRoot),rel=relative(sourceRoot,outputRoot);
 if(!rel.startsWith('.tmp'+sep)||rel.includes('..')||siteGit(sourceRoot,['check-ignore','--no-index',outputRoot]).toString().trim()==='')throw Error('site-output-must-be-ignored-scope');
 await cleanHead(sourceRoot,options.commit);await assertLocalPath(sourceRoot,outputRoot,true);
 try{await lstat(outputRoot);throw Error('site-occupied-output');}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
 const info=await stageInformation(sourceRoot,dataRoot,options.commit);
 for(const file of info.sources){const path=resolve(sourceRoot,file.identity.path);await assertLocalPath(sourceRoot,path);const stat=await lstat(path);if(!stat.isFile()||stat.nlink!==1)throw Error('site-working-source-file-type');}
 await mkdir(outputRoot);await mkdir(resolve(outputRoot,'project'));
 for(const file of [...info.sources,...info.data.files])await writeSiteFile(outputRoot,resolve(outputRoot,'project',file.identity.path),file.body);
 await symlink(info.receipt.runtime.dependencyTarget,resolve(outputRoot,'project/node_modules'),process.platform==='win32'?'junction':'dir');
 const fresh=await stageInformation(sourceRoot,dataRoot,options.commit);countrySame(fresh.receipt,info.receipt);await cleanHead(sourceRoot,options.commit);
 await writeSiteFile(outputRoot,resolve(outputRoot,'staging-receipt.json'),countryJsonBytes(info.receipt));return info.receipt;
}

