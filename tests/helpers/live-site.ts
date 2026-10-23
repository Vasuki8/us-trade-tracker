import {mkdir,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {resolve,sep,delimiter} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import type {SiteManifest} from '../../scripts/site-assembly';
const roots:string[]=[],objectDirectories:string[]=[];
const originalObjectDirectories=process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES;
export const sha=(body:Uint8Array|string)=>createHash('sha256').update(body).digest('hex');
export async function liveFixture(extra:Record<string,string>={}){return makeLiveFixture(extra);}
export async function liveMexicoFixture(extra:Record<string,string>={}){return makeLiveFixture({'countries/2010/index.html':'<!doctype html><h1>Selected Mexico all-goods snapshot</h1>',...extra},undefined,true);}
export async function liveFixtureWithTotal(totalBytes:number){return makeLiveFixture({},totalBytes);}
export async function liveMalformedMexicoSourceFixture(){return makeLiveFixture({},undefined,false,Buffer.from('{}'));}
async function makeLiveFixture(extra:Record<string,string>={},totalBytes?:number,mexico=false,sourceSelection?:Buffer){
  await mkdir(resolve('.tmp'),{recursive:true});
  const workDir=await mkdtemp(resolve('.tmp/live-verification-test-')); roots.push(workDir);
  const tree=resolve(workDir,'site'); await mkdir(tree);
  const bodies:Record<string,Buffer>={
    '_headers':await readFile(resolve('deployment/pages/_headers')),
    '404.html':await readFile(resolve('deployment/pages/404.html')),
    'index.html':Buffer.from('<!doctype html><title>Fixture</title>'),
    'nested/index.html':Buffer.from('<!doctype html><title>Nested</title>'),
    'assets/main.js':Buffer.from('export const fixture = true;'),
    ...Object.fromEntries(Object.entries(extra).map(([k,v])=>[k,Buffer.from(v)])),
  };
  if(totalBytes!==undefined){
    const otherBytes=Object.entries(bodies).filter(([path])=>path!=='assets/main.js').reduce((n,[,body])=>n+body.length,0);
    if(!Number.isSafeInteger(totalBytes)||totalBytes<otherBytes)throw Error('Invalid fixture total');
    bodies['assets/main.js']=Buffer.alloc(totalBytes-otherBytes,'x');
  }
  const files=Object.entries(bodies).map(([path,body])=>({path,bytes:body.length,sha256:sha(body),role:path==='_headers'?'provider-control' as const:path==='404.html'?'served-error-page' as const:'served-asset' as const}));
  const manifest:SiteManifest={schemaVersion:1,status:'prepared-for-owner-deployment-review',packageKind:'site',codeCommit:'a'.repeat(40),fileCount:files.length,totalBytes:files.reduce((n,f)=>n+f.bytes,0),largestFile:files.reduce((a,b)=>a.bytes>=b.bytes?a:b),planningAlertTriggered:false,files,
    uploadLimits:{dashboard:{maxFiles:1000,maxAssetBytes:26214400,eligible:true}},
    sourceTemplates:['_headers','404.html'].map(targetPath=>({sourcePath:'deployment/pages/'+targetPath,targetPath,bytes:bodies[targetPath].length,sha256:sha(bodies[targetPath]),gitBlob:createHash('sha1').update(Buffer.from('blob '+bodies[targetPath].length+'\0')).update(bodies[targetPath]).digest('hex')}))};
  if(mexico){
   const path='deployment/site-mexico-selection.json',body=await readFile(resolve(path)),value=JSON.parse(body.toString('utf8'));
   const {schemaVersion:_schema,source:_source,...binding}=value;
   manifest.mexico={...binding,selection:{path,bytes:body.length,sha256:sha(body),mode:'100644',gitBlob:createHash('sha1').update(Buffer.from('blob '+body.length+'\0')).update(body).digest('hex')}};
  }
  const sourceRoot=resolve(workDir,'source');await mkdir(sourceRoot);await writeFile(resolve(sourceRoot,'README.md'),'Synthetic package source fixture.\n');
  const selector=sourceSelection??(mexico?await readFile(resolve('deployment/site-mexico-selection.json')):null);
  if(selector){await mkdir(resolve(sourceRoot,'deployment'));await writeFile(resolve(sourceRoot,'deployment/site-mexico-selection.json'),selector);}
  const sourceGit=(args:string[])=>execFileSync('git',['-c','core.autocrlf=false','-c','commit.gpgsign=false','-c','user.name=Live package fixture','-c','user.email=fixture@example.invalid',...args],{cwd:sourceRoot,encoding:'utf8',stdio:['pipe','pipe','pipe']});
  sourceGit(['init','--initial-branch=fixture','-q']);sourceGit(['add','.']);sourceGit(['commit','-qm','Synthetic package source']);
  manifest.codeCommit=sourceGit(['rev-parse','HEAD']).trim();
  objectDirectories.push(resolve(sourceRoot,'.git/objects'));
  process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES=[...objectDirectories,...(originalObjectDirectories?[originalObjectDirectories]:[])].join(delimiter);
  for(const [name,body]of Object.entries(bodies)){await mkdir(resolve(tree,name,'..'),{recursive:true});await writeFile(resolve(tree,name),body);}
  const manifestPath=resolve(workDir,'site-manifest.json'),zipPath=resolve(workDir,'site.zip');
  await writeFile(manifestPath,JSON.stringify(manifest));
  const python=process.env.SITE_PACKAGE_PYTHON;if(!python)throw Error('SITE_PACKAGE_PYTHON is required');
  const receipt=JSON.parse(execFileSync(python,[resolve('scripts/package_site.py'),'create','--work-dir',workDir,'--manifest',manifestPath,'--zip',zipPath,'--root',tree],{encoding:'utf8',stdio:['pipe','pipe','pipe']}));
  return {workDir,manifestPath,zipPath,manifestSha256:sha(await readFile(manifestPath)),zipSha256:receipt.sha256 as string,manifest,bodies,receipt,proofRoot:resolve(workDir,'proof'),deploymentOrigin:'https://660d1364.us-trade-tracker.pages.dev'};
}
export async function cleanLiveFixtures(){
  if(originalObjectDirectories===undefined)delete process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES;else process.env.GIT_ALTERNATE_OBJECT_DIRECTORIES=originalObjectDirectories;
  objectDirectories.length=0;
  for(const root of roots.splice(0)){if(!root.startsWith(resolve('.tmp')+sep))throw Error('Unsafe fixture cleanup');await rm(root,{recursive:true,force:true});}
}
