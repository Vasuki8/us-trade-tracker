import {firefox,type Browser} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {mkdir,lstat} from 'node:fs/promises';
import {resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {siteArguments} from './stage-site';
import {assertLocalPath,readSiteFile,writeSiteFile,siteDirectories} from './site-preparation-files';
import {readPublishedFirefoxPlan,publishedFirefoxChecks,type PublishedFirefoxPlan} from './published-firefox-plan';
import {requestCheck,type Runtime,type CheckResult} from './live-site-verification';
import {runPublishedProfileJourneys,assertCompleteProfileJourneys,type ProfileJourneyReceipt} from './published-profile-journeys';
const checkout=fileURLToPath(new URL('../',import.meta.url));
export type HttpPhaseReceipt={status:'pass'|'failed';completedCount:number;httpAttempts:number;checks:CheckResult[]};
export type PublishedFirefoxReceipt={schemaVersion:1;status:'pass'|'failed';startedAt:string;finishedAt:string;checkerCommit:string;subject:PublishedFirefoxPlan['package'];origin:string;expectationSha256:string;platform:string;before?:HttpPhaseReceipt;after?:HttpPhaseReceipt;journeys?:ProfileJourneyReceipt;acceptedHttpBytes:number;failure?:{code:string}};
export function assertPublishedFirefoxCompletion(plan:PublishedFirefoxPlan,r:{before?:{status:string;completedCount:number};after?:{status:string;completedCount:number};journeys?:ProfileJourneyReceipt}):void{
 if(r.before?.status!=='pass'||r.before.completedCount!==38||r.after?.status!=='pass'||r.after.completedCount!==38||!r.journeys||r.journeys.engine!=='firefox'||r.journeys.platform!=='linux')throw Error('published-incomplete');assertCompleteProfileJourneys(plan,r.journeys);
}
async function newProof(path:string):Promise<string>{
 const tmp=resolve(checkout,'.tmp'),root=resolve(path),name=relative(tmp,root);
 if(path.split(/[\\/]/).includes('..')||!name||isAbsolute(name)||!(/^[A-Za-z0-9-]{1,80}$/).test(name))throw Error('published-proof');
 try{await siteDirectories(checkout,tmp);await assertLocalPath(checkout,root,true);try{await lstat(root);throw Error('occupied');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}execFileSync('git',['check-ignore','--quiet','--',root],{cwd:checkout,stdio:'pipe',timeout:10000});await mkdir(root);await assertLocalPath(checkout,root);return root;}catch{throw Error('published-proof');}
}
async function phase(plan:PublishedFirefoxPlan,result:HttpPhaseReceipt,budget:{bytes:number}):Promise<void>{
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(Error('published-http-timeout')),180000);
 const runtime:Runtime={fetch:globalThis.fetch,now:Date.now,setTimer:setTimeout,clearTimer:t=>clearTimeout(t as ReturnType<typeof setTimeout>)};
 try{for(const check of publishedFirefoxChecks(plan)){const r=await requestCheck(plan.origin,check,runtime,controller.signal,()=>{if(++result.httpAttempts>152)throw Error('published-http-budget');});budget.bytes+=r.bytes;if(budget.bytes>4194304)throw Error('published-http-budget');result.checks.push(r);result.completedCount++;}result.status='pass';}finally{clearTimeout(timer);controller.abort();}
}
export async function runPublishedFirefox(args:string[]):Promise<PublishedFirefoxReceipt>{
 let a:Record<string,string>;try{a=siteArguments(args,['--proof-root']);}catch{throw Error('published-arguments');}
 const bytes=await readSiteFile(checkout,resolve(checkout,'tests/fixtures/published-firefox-2026-08.json'),16384),plan=readPublishedFirefoxPlan(bytes),root=await newProof(a['--proof-root']);
 const receipt:PublishedFirefoxReceipt={schemaVersion:1,status:'failed',startedAt:new Date().toISOString(),finishedAt:'',checkerCommit:'',subject:plan.package,origin:plan.origin,expectationSha256:createHash('sha256').update(bytes).digest('hex'),platform:process.platform,acceptedHttpBytes:0};
 let browser:Browser|undefined;const budget={bytes:0};
 try{
  receipt.checkerCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:checkout,encoding:'utf8',timeout:10000}).trim();if(process.env.GITHUB_SHA&&process.env.GITHUB_SHA!==receipt.checkerCommit)throw Error('published-checker');
  if(process.platform!=='linux')throw Error('published-platform');
  receipt.before={status:'failed',completedCount:0,httpAttempts:0,checks:[]};await phase(plan,receipt.before,budget);
  try{browser=await firefox.launch({headless:true});}catch{throw Error('published-browser-launch');}
  receipt.journeys=await runPublishedProfileJourneys({browser,origin:plan.origin,plan,proofRoot:root});await browser.close();browser=undefined;
  if(receipt.journeys.status!=='pass')throw Error('published-journeys');
  receipt.after={status:'failed',completedCount:0,httpAttempts:0,checks:[]};await phase(plan,receipt.after,budget);
  assertPublishedFirefoxCompletion(plan,receipt);receipt.status='pass';
 }catch(error){receipt.failure={code:error instanceof Error&&/^(?:published|live)-[a-z-]+$/.test(error.message)?error.message:'published-failure'};}
 finally{if(browser)await browser.close().catch(()=>{});receipt.acceptedHttpBytes=budget.bytes;receipt.finishedAt=new Date().toISOString();await writeSiteFile(root,resolve(root,'receipt.json'),Buffer.from(JSON.stringify(receipt,null,2)+'\n'));}
 return receipt;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){runPublishedFirefox(process.argv.slice(2)).then(r=>{console.log(JSON.stringify({status:r.status,before:r.before?.completedCount??0,journeys:r.journeys?.checks.length??0,after:r.after?.completedCount??0,...(r.failure?{error:r.failure.code}:{})}));if(r.status!=='pass')process.exitCode=1;}).catch(error=>{console.error(error instanceof Error&&/^published-[a-z-]+$/.test(error.message)?error.message:'published-input');process.exitCode=1;});}