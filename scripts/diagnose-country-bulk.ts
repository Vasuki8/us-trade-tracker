import {spawn} from 'node:child_process';
import {resolve,win32} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {projectCanadaPublications} from './project-canada-publications';

export interface BulkOptions {python:string;output:string;preflight:boolean}
export interface LauncherAdapters {
  platform:string;nodeVersion:string;now:()=>number;
  probe:(exe:string,timeout:number)=>Promise<{implementation:string;version:number[]}>;
  supervise:(exe:string,args:string[],input:string,timeout:number)=>Promise<number>;
}
export function resolveBulkOptions(args:string[]):BulkOptions{
  const values=new Map<string,string>();let preflight=false;
  for(let i=0;i<args.length;i++){
    const key=args[i];
    if(key==='--preflight'){if(preflight)throw new Error('Duplicate option');preflight=true;continue;}
    if(!['--python','--output'].includes(key)||values.has(key)||!args[i+1]||args[i+1].startsWith('--'))throw new Error('Expected --python <absolute-exe> --output <fresh-path> [--preflight]');
    values.set(key,args[++i]);
  }
  const python=values.get('--python'),output=values.get('--output');
  if(!python||!win32.isAbsolute(python)||!/^\w:[/\\]/.test(python)||!output)throw new Error('An absolute Windows interpreter and fresh output are required');
  return {python,output,preflight};
}
export function cleanBulkEnvironment(env:NodeJS.ProcessEnv):NodeJS.ProcessEnv{
  const safe:NodeJS.ProcessEnv={};
  for(const key of ['PATH','Path','SystemRoot','WINDIR','TEMP','TMP','USERPROFILE','APPDATA','LOCALAPPDATA'])if(env[key]!==undefined)safe[key]=env[key];
  return {...safe,PYTHONDONTWRITEBYTECODE:'1'};
}
const repository=resolve(fileURLToPath(new URL('..',import.meta.url)));
function processCall(exe:string,args:string[],input:string,timeout:number,capture:boolean):Promise<{code:number;stdout:string}>{
  return new Promise((resolveCall,reject)=>{
    const child=spawn(exe,args,{cwd:repository,shell:false,windowsHide:true,env:cleanBulkEnvironment(process.env),stdio:['pipe',capture?'pipe':'inherit','inherit']});
    let stdout='';const timer=setTimeout(()=>{child.kill();reject(new Error('Diagnostic invocation deadline exceeded'));},timeout);
    child.stdout?.on('data',chunk=>{stdout+=chunk.toString();if(Buffer.byteLength(stdout)>4096){child.kill();reject(new Error('Interpreter probe output exceeded limit'));}});
    child.on('error',error=>{clearTimeout(timer);reject(error);});child.on('close',code=>{clearTimeout(timer);resolveCall({code:code??1,stdout});});
    child.stdin?.on('error',()=>{});child.stdin?.end(input);
  });
}
export async function runBulkDiagnostic(options:BulkOptions,adapters:LauncherAdapters):Promise<number>{
  const started=adapters.now();
  if(adapters.platform!=='win32'||Number(adapters.nodeVersion.split('.')[0])!==24)throw new Error('Diagnostic requires Windows and Node 24');
  const interpreter=await adapters.probe(options.python,10000);
  if(interpreter.implementation!=='CPython'||interpreter.version[0]!==3||interpreter.version[1]<11)throw new Error('Existing CPython 3.11+ is required');
  const remaining=3600000-(adapters.now()-started);if(remaining<=0)throw new Error('Invocation deadline exceeded');
  const args=['-B','-m','scripts.country_bulk.runner','--repo',repository,'--output',options.output,'--remaining-seconds',String(remaining/1000)];if(options.preflight)args.push('--preflight');
  return adapters.supervise(options.python,args,JSON.stringify(projectCanadaPublications()),remaining);
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  const adapters:LauncherAdapters={platform:process.platform,nodeVersion:process.versions.node,now:()=>performance.now(),probe:async(exe,timeout)=>{
    const result=await processCall(exe,['-B','-c','import json,platform,sys; print(json.dumps({"implementation":platform.python_implementation(),"version":list(sys.version_info[:3])}))'],'',timeout,true);
    if(result.code!==0)throw new Error('Interpreter probe failed');return JSON.parse(result.stdout);
  },supervise:async(exe,args,input,timeout)=>(await processCall(exe,args,input,timeout,false)).code};
  runBulkDiagnostic(resolveBulkOptions(process.argv.slice(2)),adapters).then(code=>{process.exitCode=code;}).catch(()=>{process.stderr.write('Bulk diagnostic launch failed. Check interpreter, platform and fresh output.\n');process.exitCode=1;});
}
