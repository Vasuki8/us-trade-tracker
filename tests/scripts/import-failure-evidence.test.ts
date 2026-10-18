import {afterEach,expect,it,vi} from 'vitest';
import {access,mkdtemp,readdir,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {prepareRelease} from '../../scripts/prepare-release';
import {syntheticProductFetch} from '../helpers/product-data';

const roots:string[]=[];
afterEach(async()=>{vi.restoreAllMocks();for(const root of roots.splice(0))await rm(root,{recursive:true,force:true});});
async function setup(){
 const root=await mkdtemp(join(tmpdir(),'import-evidence-'));roots.push(root);
 const options={productCode:'090121',end:'2026-08',months:24,apiKey:'private-synthetic-key',codeVersion:'synthetic-commit',outputDir:join(root,'data','processed')};
 return {root,options,evidenceRoot:join(root,'.tmp','import-failure')};
}
it('retains only completed current-run captures after both workers stop and preserves the accepted pointer',async()=>{
 const f=await setup(),base=syntheticProductFetch('090121');
 await prepareRelease(f.options,base);
 const before=await readFile(join(f.options.outputDir,'current.json'));
 let hsSaved!:()=>void;const saved=new Promise<void>(resolve=>{hsSaved=resolve;});let siblingStopped=false;
 const fetcher=(async(input,init)=>{
  const u=new URL(String(input));
  if(u.pathname.includes('/exports/')){await saved;return new Response('bad request',{status:400});}
  if(u.searchParams.get('SUMMARY_LVL2')==='HS')return base(input,init);
  hsSaved();return await new Promise<Response>((_resolve,reject)=>init!.signal!.addEventListener('abort',()=>{siblingStopped=true;reject(new Error(f.options.apiKey));},{once:true}));
 }) as typeof fetch;
 const ready:string[]=[];
 const error=await prepareRelease({...f.options,failureEvidenceRoot:f.evidenceRoot,onFailureEvidence:async(path:string)=>{expect(siblingStopped).toBe(true);ready.push(path);}},fetcher).catch(error=>error as Error) as Error;
 expect(error).toBeInstanceOf(Error);expect((error as Error).message).toContain('HTTP 400');
 expect(await readdir(f.evidenceRoot).catch(()=>[])).toHaveLength(1);expect(ready).toHaveLength(1);
 if(!ready.length)return;
 const report=JSON.parse(await readFile(join(ready[0],'report.json'),'utf8'));
 expect(report).toMatchObject({purpose:'failed-import-evidence',releaseAccepted:false,productCode:'090121',reportingMonth:'2026-08',failure:{direction:'exports',summary:'HS',phase:'http',httpStatus:400},omitted:[]});
 expect(report.rawFiles).toHaveLength(1);expect(report.rawFiles[0].path).toBe('raw/imports-2024-09-HS.json');
 const bytes=await readFile(join(ready[0],report.rawFiles[0].path));expect(createHash('sha256').update(bytes).digest('hex')).toBe(report.rawFiles[0].sha256);
 expect(JSON.stringify(report)).not.toContain(f.options.apiKey);expect(JSON.stringify(report)).not.toContain(f.root);
 expect(await readFile(join(f.options.outputDir,'current.json'))).toEqual(before);
 await expect(access(join(f.options.outputDir,'.import.lock'))).rejects.toMatchObject({code:'ENOENT'});
});
it('does not let report failure mask the original error or replace an accepted pointer',async()=>{
 const f=await setup();await prepareRelease(f.options,syntheticProductFetch('090121'));
 const before=await readFile(join(f.options.outputDir,'current.json'));let calls=0;
 const error=await prepareRelease({...f.options,failureEvidenceRoot:f.evidenceRoot,onFailureEvidence:async()=>{calls++;throw new Error(f.options.apiKey);}},(async()=>new Response('bad',{status:400})) as typeof fetch).catch(error=>error as Error) as Error;
 expect(error.message).toContain('HTTP 400');expect(String(error)).not.toContain(f.options.apiKey);expect(calls).toBe(1);
 expect(await readFile(join(f.options.outputDir,'current.json'))).toEqual(before);
 await expect(access(join(f.options.outputDir,'.import.lock'))).rejects.toMatchObject({code:'ENOENT'});
});
it('withholds quote/backslash credential echoes before raw capture or artifact copying',async()=>{
 const f=await setup();f.options.apiKey='private-"key\\\\value';
 const base=syntheticProductFetch('090121');
 let nextRequest!:()=>void;const next=new Promise<void>(resolve=>{nextRequest=resolve;});
 const fetcher=(async(input,init)=>{
  const aborted=()=>new Promise<Response>((_resolve,reject)=>{if(init?.signal?.aborted)reject(new Error(f.options.apiKey));else init!.signal!.addEventListener('abort',()=>reject(new Error(f.options.apiKey)),{once:true});});
  const url=new URL(String(input));
  if(url.pathname.includes('/exports/'))return Promise.race([aborted(),next.then(()=>new Response('bad',{status:400}))]);
  if(url.searchParams.get('SUMMARY_LVL2')==='HSCY'){nextRequest();return aborted();}
  const response=await base(input,init),table=await response.json() as string[][];table[1][table[0].indexOf('I_COMMODITY_LDESC')]=f.options.apiKey;return Response.json(table);
 }) as typeof fetch;
 const ready:string[]=[];const error=await prepareRelease({...f.options,failureEvidenceRoot:f.evidenceRoot,onFailureEvidence:async(path:string)=>{ready.push(path);}},fetcher).catch(error=>error as Error) as Error;
 expect(error).toBeInstanceOf(Error);expect(String(error)).not.toContain(f.options.apiKey);expect(ready).toHaveLength(1);
 if(!ready.length)return;
 const reportText=await readFile(join(ready[0],'report.json'),'utf8'),report=JSON.parse(reportText);
 expect(report.rawFiles).toEqual([]);expect(reportText).not.toContain(f.options.apiKey);expect(reportText).not.toContain(JSON.stringify(f.options.apiKey).slice(1,-1));
 const runDirs=await readdir(join(f.root,'data','raw'));expect(await readdir(join(f.root,'data','raw',runDirs[0]))).toEqual([]);
});
it('creates no failure artifact for a successful import and leaves raw envelopes unchanged',async()=>{
 const f=await setup();let ready=0;
 await prepareRelease({...f.options,failureEvidenceRoot:f.evidenceRoot,onFailureEvidence:async()=>{ready++;}},syntheticProductFetch('090121'));
 expect(ready).toBe(0);await expect(access(f.evidenceRoot)).rejects.toMatchObject({code:'ENOENT'});
 const [id]=await readdir(join(f.root,'data','raw')),names=await readdir(join(f.root,'data','raw',id));
 expect(names).toHaveLength(96);
 const raw=JSON.parse(await readFile(join(f.root,'data','raw',id,names[0]),'utf8'));
 expect(Object.keys(raw).sort()).toEqual(['httpStatus','payload','requestUrl','retrievedAt']);
});

import {mkdir,writeFile,rename} from 'node:fs/promises';
import {writeImportFailureEvidence,emitImportFailureOutput} from '../../scripts/import-failure-evidence';
import type {CensusFailureContext} from '../../scripts/census-failure';
const runId='2026-08-11111111-1111-4111-8111-111111111111';
async function direct(){
 const f=await setup();const rawDir=join(f.root,'data','raw',runId);await mkdir(rawDir,{recursive:true});
 const failure:CensusFailureContext={productCode:'090121',month:'2026-08',direction:'imports',dataset:'merchandise',summary:'HS',requestUrl:'https://api.census.gov/data/timeseries/intltrade/imports/hs?time=2026-08',phase:'http',attempt:1,httpStatus:400,elapsedMs:1,transportCode:null};
 return {f,input:{root:f.evidenceRoot,runId,productCode:'090121',reportingMonth:'2026-08',codeVersion:'synthetic-commit',apiKey:f.options.apiKey,rawDir,captures:[] as {name:string;bytes:number;sha256:string}[],failure}};
}
async function capture(input:Awaited<ReturnType<typeof direct>>['input'],name:string,bytes:Buffer){
 await writeFile(join(input.rawDir,name),bytes);
 const row={name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};input.captures.push(row);return row;
}
it('omits whole files when report plus captures would exceed 64 MiB',async()=>{
 const {input}=await direct(),bytes=Buffer.alloc(32*1024*1024,120);
 await capture(input,'imports-2026-08-HS.json',bytes);await capture(input,'imports-2026-08-HSCY.json',bytes);
 const result=await writeImportFailureEvidence(input);
 expect(result.report.rawFiles).toHaveLength(1);expect(result.report.omitted).toEqual([{path:'raw/imports-2026-08-HSCY.json',reason:'budget'}]);
 const report=await readFile(join(result.path,'report.json'));
 expect(report.length+result.report.rawBytes).toBeLessThanOrEqual(64*1024*1024);
 expect(await readdir(join(result.path,'raw'))).toEqual(['imports-2026-08-HS.json']);
},20_000);
it('uses byte counts for multibyte captures and preserves their exact digest',async()=>{
 const {input}=await direct(),bytes=Buffer.from('€'.repeat(1024),'utf8');
 await capture(input,'imports-2026-08-HS.json',bytes);const result=await writeImportFailureEvidence(input);
 expect(result.report.rawFiles[0].bytes).toBe(3072);expect(await readFile(join(result.path,result.report.rawFiles[0].path))).toEqual(bytes);
});
it('withholds changed, credential-bearing and missing current-run files without copying unrelated baseline data',async()=>{
 const {input}=await direct();
 const changed=await capture(input,'imports-2026-08-HS.json',Buffer.from('original'));
 await writeFile(join(input.rawDir,changed.name),'modified');
 await capture(input,'imports-2026-08-HSCY.json',Buffer.from(encodeURIComponent(input.apiKey)));
 input.captures.push({name:'exports-2026-08-HS.json',bytes:1,sha256:'a'.repeat(64)});
 await writeFile(join(input.rawDir,'exports-2026-07-HS.json'),'unlisted old data');
 const result=await writeImportFailureEvidence(input);
 expect(result.report.rawFiles).toEqual([]);
 expect(result.report.omitted.map(row=>row.reason).sort()).toEqual(['changed','credential','read-failed']);
 expect(await readdir(join(result.path,'raw'))).toEqual([]);
});
it('rejects traversal, duplicate captures and a different raw run before staging',async()=>{
 const {input}=await direct();
 await expect(writeImportFailureEvidence({...input,captures:[{name:'../current.json',bytes:1,sha256:'a'.repeat(64)}]})).rejects.toThrow(/capture/i);
 const row=await capture(input,'imports-2026-08-HS.json',Buffer.from('safe'));
 await expect(writeImportFailureEvidence({...input,captures:[row,row]})).rejects.toThrow(/capture/i);
 await expect(writeImportFailureEvidence({...input,rawDir:join(input.rawDir,'older-run')})).rejects.toThrow(/run|options/i);
});
it('does not retain non-regular files and refuses occupied evidence output',async()=>{
 const {input}=await direct();await mkdir(join(input.rawDir,'imports-2026-08-HS.json'));
 input.captures.push({name:'imports-2026-08-HS.json',bytes:0,sha256:createHash('sha256').update('').digest('hex')});
 const result=await writeImportFailureEvidence(input);
 expect(result.report.omitted).toEqual([{path:'raw/imports-2026-08-HS.json',reason:'not-regular'}]);
 await expect(writeImportFailureEvidence(input)).rejects.toThrow();
});
it('drops arbitrary exception properties and refuses credential-bearing report URLs',async()=>{
 const {input}=await direct();
 const result=await writeImportFailureEvidence({...input,failure:{...input.failure,transportCode:input.apiKey,message:input.apiKey,stack:'/private/path'} as CensusFailureContext});
 const text=await readFile(join(result.path,'report.json'),'utf8');expect(text).not.toContain(input.apiKey);expect(text).not.toContain('/private/path');expect(result.report.failure.transportCode).toBe('unknown');
 const next=await direct();
 await expect(writeImportFailureEvidence({...next.input,failure:{...next.input.failure,requestUrl:next.input.failure.requestUrl+'&key=hidden'}})).rejects.toThrow(/URL/);
});
it('emits only the validated attempt directory as a relative Actions output',async()=>{
 const {f,input}=await direct(),result=await writeImportFailureEvidence(input),file=join(f.root,'actions-output');
 await emitImportFailureOutput(file,result.path,f.root);
 expect(await readFile(file,'utf8')).toBe('failure_evidence_path=.tmp/import-failure/'+runId+'\n');
 await expect(emitImportFailureOutput(file,join(f.root,'data/raw',runId),f.root)).rejects.toThrow();
 expect(await readFile(file,'utf8')).not.toContain(f.root);
});
it('does not lose the source failure when lock-path cleanup also fails',async()=>{
 const warning=vi.spyOn(console,'warn').mockImplementation(()=>{});
 const f=await setup();await prepareRelease(f.options,syntheticProductFetch('090121'));
 const before=await readFile(join(f.options.outputDir,'current.json'));let changed=false;
 const fetcher=(async()=>{
  if(!changed){changed=true;await rename(join(f.options.outputDir,'.import.lock'),join(f.options.outputDir,'.held-lock'));await mkdir(join(f.options.outputDir,'.import.lock'));}
  return new Response('bad',{status:400});
 }) as typeof fetch;
 const error=await prepareRelease({...f.options,failureEvidenceRoot:f.evidenceRoot},fetcher).catch(error=>error as Error) as Error;
 expect(error.message).toContain('HTTP 400');expect(warning).toHaveBeenCalledWith('Import lock cleanup failed; the original import error is unchanged.');expect(await readFile(join(f.options.outputDir,'current.json'))).toEqual(before);
});
it('records duty reconciliation as task-level validation without blaming a response',async()=>{
 const f=await setup();await prepareRelease(f.options,syntheticProductFetch('090121'));
 const before=await readFile(join(f.options.outputDir,'current.json')),base=syntheticProductFetch('090121',{duties:true}),ready:string[]=[];
 const fetcher=(async(input,init)=>{
  const response=await base(input,init),url=new URL(String(input));
  if(url.searchParams.get('get')?.includes('CAL_DUT_MO')&&url.searchParams.get('SUMMARY_LVL2')==='HS'&&url.searchParams.get('time')==='2024-09'){
   const table=await response.json() as string[][];table[1][table[0].indexOf('CAL_DUT_MO')]='13';return Response.json(table);
  }
  return response;
 }) as typeof fetch;
 const error=await prepareRelease({...f.options,includeDuties:true,failureEvidenceRoot:f.evidenceRoot,onFailureEvidence:async path=>{ready.push(path);}},fetcher).catch(error=>error as Error) as Error;
 expect(error).toBeInstanceOf(Error);expect(error.message).toContain('reconcil');expect(ready).toHaveLength(1);
 const report=JSON.parse(await readFile(join(ready[0],'report.json'),'utf8'));
 expect(report.failure).toMatchObject({dataset:'duties',direction:'imports',month:'2024-09',phase:'validation',summary:null,requestUrl:null,attempt:null,httpStatus:null});
 expect(report.rawFiles.some((f:{path:string})=>f.path.startsWith('raw/duties-2024-09-'))).toBe(true);
 expect(await readFile(join(f.options.outputDir,'current.json'))).toEqual(before);
});


it('does not emit an artifact path for an attempt without its ready report',async()=>{
 const {f}=await direct(),file=join(f.root,'actions-output');
 await expect(emitImportFailureOutput(file,join(f.evidenceRoot,runId),f.root)).rejects.toThrow(/report|ENOENT/i);
 await expect(access(file)).rejects.toMatchObject({code:'ENOENT'});
});
it('preserves an original failure when the evidence directory cannot be created',async()=>{
 const f=await setup();await prepareRelease(f.options,syntheticProductFetch('090121'));
 const before=await readFile(join(f.options.outputDir,'current.json'));await mkdir(join(f.root,'.tmp'));await writeFile(f.evidenceRoot,'occupied');
 let ready=0;
 const error=await prepareRelease({...f.options,failureEvidenceRoot:f.evidenceRoot,onFailureEvidence:async()=>{ready++;}},(async()=>new Response('bad',{status:400})) as typeof fetch).catch(error=>error as Error) as Error;
 expect(error.message).toContain('HTTP 400');expect(ready).toBe(0);
 expect(await readFile(join(f.options.outputDir,'current.json'))).toEqual(before);
});
it('does not create diagnostics or request data when the accepted baseline is a different product',async()=>{
 const f=await setup();await prepareRelease(f.options,syntheticProductFetch('090121'));
 const before=await readFile(join(f.options.outputDir,'current.json'));let calls=0;
 await expect(prepareRelease({...f.options,productCode:'180100',failureEvidenceRoot:f.evidenceRoot},(async()=>{calls++;throw new Error('unexpected');}) as typeof fetch)).rejects.toThrow(/product/i);
 expect(calls).toBe(0);await expect(access(f.evidenceRoot)).rejects.toMatchObject({code:'ENOENT'});
 expect(await readFile(join(f.options.outputDir,'current.json'))).toEqual(before);
});
it('waits for a late canceled sibling before creating the report or releasing the lock',async()=>{
 const f=await setup();let siblingStarted!:()=>void,unblock!:()=>void,aborted=false;
 const started=new Promise<void>(resolve=>{siblingStarted=resolve;}),blocked=new Promise<void>(resolve=>{unblock=resolve;}),ready:string[]=[];
 const base=syntheticProductFetch('090121');
 const fetcher=(async(input,init)=>{
  if(new URL(String(input)).pathname.includes('/imports/')){await started;return new Response('bad',{status:400});}
  init!.signal!.addEventListener('abort',()=>{aborted=true;},{once:true});siblingStarted();await blocked;return base(input,init);
 }) as typeof fetch;
 const pending=prepareRelease({...f.options,failureEvidenceRoot:f.evidenceRoot,onFailureEvidence:async path=>{ready.push(path);}},fetcher).catch(error=>error as Error);
 try{
  await vi.waitFor(()=>expect(aborted).toBe(true));expect(ready).toEqual([]);
  await expect(access(f.evidenceRoot)).rejects.toMatchObject({code:'ENOENT'});
  await expect(access(join(f.options.outputDir,'.import.lock'))).resolves.toBeUndefined();
 }finally{unblock();}
 const error=await pending as Error;expect(error.message).toContain('HTTP 400');expect(ready).toHaveLength(1);
 const report=JSON.parse(await readFile(join(ready[0],'report.json'),'utf8'));expect(report.rawFiles).toEqual([]);
});
it('does not label a successful pointer replacement as unaccepted when later lock cleanup fails',async()=>{
 const f=await setup(),base=syntheticProductFetch('090121');let changed=false,ready=0;
 const fetcher=(async(input,init)=>{
  const url=new URL(String(input));
  if(!changed&&url.pathname.includes('/exports/')&&url.searchParams.get('time')==='2026-08'&&url.searchParams.get('SUMMARY_LVL2')==='HSCY'){
   changed=true;await rename(join(f.options.outputDir,'.import.lock'),join(f.options.outputDir,'.held-lock'));await mkdir(join(f.options.outputDir,'.import.lock'));
  }
  return base(input,init);
 }) as typeof fetch;
 await expect(prepareRelease({...f.options,failureEvidenceRoot:f.evidenceRoot,onFailureEvidence:async()=>{ready++;}},fetcher)).rejects.toThrow(/EPERM|EISDIR|permitted/i);
 const pointer=JSON.parse(await readFile(join(f.options.outputDir,'current.json'),'utf8'));
 expect(JSON.parse(await readFile(join(f.options.outputDir,pointer.releaseFile),'utf8')).productCode).toBe('090121');
 expect(ready).toBe(0);await expect(access(f.evidenceRoot)).rejects.toMatchObject({code:'ENOENT'});
});
