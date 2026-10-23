import {mkdir,lstat,readdir} from 'node:fs/promises';
import {resolve,relative,sep,extname,isAbsolute} from 'node:path';
import {assertLocalPath,localName,readSiteFile,writeSiteFile,type FileIdentity} from './site-preparation-files';
import {verifySiteStage,type SiteStageReceipt} from './site-staging';
import {countryJsonBytes,digestCountryBytes,countrySame} from '../src/lib/country-release/contract.server';
export const SITE_MAX_FILES=1000,SITE_MAX_ASSET_BYTES=26214400;
type Asset=FileIdentity&{role:'provider-control'|'served-error-page'|'served-asset'};
type Template={sourcePath:string;targetPath:string;gitBlob:string;bytes:number;sha256:string};
export type SiteManifest={schemaVersion:1;status:'prepared-for-owner-deployment-review';packageKind:'site'|'withdrawal';codeCommit:string;country?:SiteStageReceipt['country'];products?:FileIdentity[];mexico?:SiteStageReceipt['mexico'];fileCount:number;totalBytes:number;largestFile:Asset;planningAlertTriggered:boolean;uploadLimits:{dashboard:{maxFiles:1000;maxAssetBytes:26214400;eligible:true}};files:Asset[];sourceTemplates:Template[]};
export type SitePreparationReceipt={schemaVersion:1;status:'prepared-for-owner-deployment-review';codeCommit:string;site:{tree:string;manifest:FileIdentity;fileCount:number;totalBytes:number;largestFile:Asset};withdrawal:{tree:string;manifest:FileIdentity;fileCount:number;totalBytes:number;largestFile:Asset}};
const order=(a:{path:string},b:{path:string})=>a.path.localeCompare(b.path,'en');
const header=Buffer.from('/*\n  X-Robots-Tag: noindex, nofollow\n');
function assetName(name:string):void{
 localName(name);if(!/^[A-Za-z0-9_./-]+$/.test(name)||!['.html','.js','.css'].includes(extname(name))||name==='404.html'||name.split('/').some(p=>p.startsWith('.')||['preview','functions','data','secrets','node_modules'].includes(p.toLowerCase()))||['_worker.js','_redirects'].includes(name.split('/').at(-1)!.toLowerCase()))throw Error('site-private-or-unsupported-output');
}
const mexicoRoute='countries/2010/index.html';
function decodeMexicoProps(text:string):unknown{
 const islands=[...text.matchAll(/<astro-island\b[^>]*\bcomponent-export="MexicoLocalProfile"[^>]*>/g)];
 if(islands.length!==1)throw Error('site-mexico-public-projection');
 const props=islands[0][0].match(/\bprops="([^"]*)"/)?.[1];
 if(!props||props.length>131072)throw Error('site-mexico-public-projection');
 const raw=JSON.parse(props.replaceAll('&quot;','"').replaceAll('&#34;','"').replaceAll('&#x22;','"').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&'));
 if(!raw||typeof raw!=='object'||Object.keys(raw).length!==1||!Object.hasOwn(raw,'data'))throw Error('site-mexico-public-projection');
 function unpack(node:unknown,depth=0):unknown{
  if(depth>16||!Array.isArray(node)||node.length!==2)throw Error('site-mexico-public-projection');
  const [tag,value]=node;
  if(tag===1){if(!Array.isArray(value))throw Error('site-mexico-public-projection');return value.map(v=>unpack(v,depth+1));}
  if(tag!==0)throw Error('site-mexico-public-projection');
  if(value!==null&&typeof value==='object'){
   if(Array.isArray(value))throw Error('site-mexico-public-projection');
   return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,unpack(v,depth+1)]));
  }
  if(value===null||typeof value==='string'||typeof value==='number'||typeof value==='boolean')return value;
  throw Error('site-mexico-public-projection');
 }
 return unpack(raw.data);
}
function assetContent(name:string,body:Buffer,stage:SiteStageReceipt):void{
 const text=new TextDecoder('utf8',{fatal:true}).decode(body);
 if(/data\/backups|\.superpowers\/|X-Amz-Signature|[?&]key=[^&"\s]+/i.test(text)||text.includes(stage.country.pointer.sha256)||text.includes(stage.data.find(f=>f.kind==='country-package')!.sha256))throw Error('site-private-output');
 if(extname(name)==='.html'&&/Development sample data|Synthetic category 270900|Synthetic second product/.test(text))throw Error('site-rendered-fixture-output');
 if(stage.mexico){
  for(const ref of Object.values(stage.mexico.inputs))if(text.includes(ref.sha256)||text.includes(ref.path))throw Error('site-private-mexico-output');
  if(/(?:"|&quot;)(?:ownerAuthorization|ownerInstructions|authorization)(?:"|&quot;)\s*:|PRIVATE_OWNER_INSTRUCTION/.test(text))throw Error('site-private-mexico-output');
 }
 const mexicoPath=/^countries\/2010(?:\.html|\/)/.test(name);
 if(mexicoPath&&(name!==mexicoRoute||!stage.mexico))throw Error('site-unselected-mexico-route');
 if(extname(name)==='.html'&&name!==mexicoRoute&&/\bcomponent-export="MexicoLocalProfile"/.test(text))throw Error('site-unselected-mexico-route');
 if(name===mexicoRoute){
  if(!stage.mexico)throw Error('site-unselected-mexico-route');
  const profile=decodeMexicoProps(text) as Record<string,unknown>;
  if(profile?.source!=='census'||profile.presentation!=='public-pilot-snapshot')throw Error('site-mexico-public-projection');
  try{countrySame(digestCountryBytes(Buffer.from(JSON.stringify(profile))),stage.mexico.publicProfile);}catch{throw Error('site-mexico-public-projection');}
 }
}
async function buildAssets(root:string,stage:SiteStageReceipt):Promise<Asset[]>{
 await assertLocalPath(root,root);const files:Asset[]=[],folded=new Set<string>();
 async function walk(directory:string):Promise<void>{
  await assertLocalPath(root,directory);for(const entry of await readdir(directory,{withFileTypes:true})){
   const path=resolve(directory,entry.name);await assertLocalPath(root,path);const value=await lstat(path);
   if(value.isDirectory()){await walk(path);continue;}if(!value.isFile())throw Error('site-nonregular-output');
   const name=relative(root,path).split(sep).join('/');assetName(name);if(folded.has(name.toLowerCase()))throw Error('site-output-case-collision');folded.add(name.toLowerCase());
   if(files.length+3>SITE_MAX_FILES)throw Error('site-file-count-limit');
   const body=await readSiteFile(root,path,SITE_MAX_ASSET_BYTES);assetContent(name,body,stage);files.push({path:name,...digestCountryBytes(body),role:'served-asset'});
  }
 }
 await walk(root);if(!files.some(f=>f.path==='index.html'))throw Error('site-missing-homepage');if(stage.mexico&&!files.some(f=>f.path===mexicoRoute))throw Error('site-missing-mexico-route');return files.sort(order);
}
async function template(stageRoot:string,stage:SiteStageReceipt,sourcePath:string,targetPath:string):Promise<{item:Template;asset:Asset;body:Buffer}>{
 const source=stage.sources.find(f=>f.path===sourcePath);if(!source)throw Error('site-missing-template-source');
 const body=await readSiteFile(stageRoot,resolve(stageRoot,'project',sourcePath),SITE_MAX_ASSET_BYTES,source);
 if(targetPath==='_headers'&&body.toString().replaceAll('\r\n','\n')!==header.toString())throw Error('site-header-control');
 const item={sourcePath,targetPath,gitBlob:source.gitBlob,...digestCountryBytes(body)};
 return{item,asset:{path:targetPath,...digestCountryBytes(body),role:targetPath==='_headers'?'provider-control':targetPath==='404.html'?'served-error-page':'served-asset'},body};
}
function makeManifest(kind:'site'|'withdrawal',stage:SiteStageReceipt,files:Asset[],templates:Template[]):SiteManifest{
 files.sort(order);if(!files.length||files.length>SITE_MAX_FILES||files.some(f=>f.bytes>SITE_MAX_ASSET_BYTES))throw Error('site-package-limit');
 return{schemaVersion:1,status:'prepared-for-owner-deployment-review',packageKind:kind,codeCommit:stage.codeCommit,...(kind==='site'?{country:stage.country,products:stage.products.flatMap(p=>[p.pointer,p.release]),...(stage.mexico?{mexico:stage.mexico}:{})}:{}),fileCount:files.length,totalBytes:files.reduce((n,f)=>n+f.bytes,0),largestFile:files.reduce((a,b)=>b.bytes>a.bytes?b:a),planningAlertTriggered:files.length>=15000,uploadLimits:{dashboard:{maxFiles:SITE_MAX_FILES,maxAssetBytes:SITE_MAX_ASSET_BYTES,eligible:true}},files,sourceTemplates:templates};
}
export async function prepareSite(options:{sourceRoot:string;dataRoot:string;stageRoot:string;buildRoot:string;outputRoot:string}):Promise<SitePreparationReceipt>{
 const stageRoot=resolve(options.stageRoot),buildRoot=resolve(options.buildRoot),outputRoot=resolve(options.outputRoot);
 const outRel=relative(stageRoot,outputRoot);if(buildRoot!==resolve(stageRoot,'real-dist')||!outRel||outRel==='..'||outRel.startsWith('..'+sep)||isAbsolute(outRel)||['real-dist','project'].includes(outRel.split(sep)[0]))throw Error('site-assembly-scope');
 await assertLocalPath(stageRoot,outputRoot,true);try{await lstat(outputRoot);throw Error('site-occupied-output');}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
 const stage=await verifySiteStage(options),assets=await buildAssets(buildRoot,stage);
 const siteTemplates=await Promise.all([template(stageRoot,stage,'deployment/pages/_headers','_headers'),template(stageRoot,stage,'deployment/pages/404.html','404.html')]);
 const withdrawalTemplates=await Promise.all([template(stageRoot,stage,'deployment/pages/_headers','_headers'),template(stageRoot,stage,'deployment/pages/withdrawal/404.html','404.html'),template(stageRoot,stage,'deployment/pages/withdrawal/index.html','index.html')]);
 if(!siteTemplates[1].body.toString().includes('Page not found')||withdrawalTemplates.slice(1).some(t=>!t.body.toString().includes('Pilot temporarily unavailable')))throw Error('site-template-purpose');
 await mkdir(outputRoot);await mkdir(resolve(outputRoot,'site'));await mkdir(resolve(outputRoot,'withdrawal'));
 for(const asset of assets){const body=await readSiteFile(buildRoot,resolve(buildRoot,asset.path),SITE_MAX_ASSET_BYTES,asset);await writeSiteFile(outputRoot,resolve(outputRoot,'site',asset.path),body);}
 for(const [tree,templates]of [['site',siteTemplates],['withdrawal',withdrawalTemplates]] as const)for(const t of templates)await writeSiteFile(outputRoot,resolve(outputRoot,tree,t.asset.path),t.body);
 const site=makeManifest('site',stage,[...assets,...siteTemplates.map(t=>t.asset)],siteTemplates.map(t=>t.item)),withdrawal=makeManifest('withdrawal',stage,withdrawalTemplates.map(t=>t.asset),withdrawalTemplates.map(t=>t.item));
 countrySame(await verifySiteStage(options),stage);countrySame(await buildAssets(buildRoot,stage),assets);
 for(const [tree,manifest]of [['site',site],['withdrawal',withdrawal]] as const)for(const file of manifest.files)await readSiteFile(outputRoot,resolve(outputRoot,tree,file.path),SITE_MAX_ASSET_BYTES,file);
 const siteBody=countryJsonBytes(site),withdrawalBody=countryJsonBytes(withdrawal);
 const receipt:SitePreparationReceipt={schemaVersion:1,status:'prepared-for-owner-deployment-review',codeCommit:stage.codeCommit,site:{tree:'site',manifest:{path:'site-manifest.json',...digestCountryBytes(siteBody)},fileCount:site.fileCount,totalBytes:site.totalBytes,largestFile:site.largestFile},withdrawal:{tree:'withdrawal',manifest:{path:'withdrawal-manifest.json',...digestCountryBytes(withdrawalBody)},fileCount:withdrawal.fileCount,totalBytes:withdrawal.totalBytes,largestFile:withdrawal.largestFile}};
 await writeSiteFile(outputRoot,resolve(outputRoot,'site-manifest.json'),siteBody);await writeSiteFile(outputRoot,resolve(outputRoot,'withdrawal-manifest.json'),withdrawalBody);
 await writeSiteFile(outputRoot,resolve(outputRoot,'preparation-receipt.json'),countryJsonBytes(receipt));return receipt;
}
