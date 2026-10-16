import {createHash} from 'node:crypto';
import {readFile,lstat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {expect,type Browser,type BrowserContext,type Route,type Page} from '@playwright/test';
import {writeSiteFile} from './site-preparation-files';
import {publishedFirefoxChecks,type PublishedFirefoxPlan} from './published-firefox-plan';
import type {ExpectedLiveCheck} from './live-site-package';
export type ProfileDownload={key:string;name:string;bytes:number;sha256:string;width?:number;height?:number};
export type ProfileJourneyReceipt={status:'pass'|'failed';engine:string;browserVersion:string;platform:string;checks:string[];downloads:ProfileDownload[];network:{requests:number;verifiedResponses:number;acceptedBytes:number;failures:string[];generatedResources?:number};pageErrors:string[];failure?:{code:string;stage:string}};
const digest=(body:Buffer)=>({bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')});
const pngs:Record<string,string>={'duty-png':'hs-090121-imports-estimated-duties-monthly-dollars.png','merchandise-png':'hs-090121-imports.png'};
function bad(code:string):never{throw Error(code);}
export function verifyProfileDownload(plan:PublishedFirefoxPlan,key:string,name:string,body:Buffer):ProfileDownload{
 const identity=digest(body),csv=plan.csvs.find(c=>c.case===key);
 if(csv){if(name!==csv.filename||identity.bytes!==csv.bytes||identity.sha256!==csv.sha256)bad('published-download');return{key,name,...identity};}
 if(pngs[key]!==name||body.length<33||body.length>4194304||body.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||body.readUInt32BE(8)!==13||body.toString('ascii',12,16)!=='IHDR'||body.readUInt32BE(16)!==1920||body.readUInt32BE(20)!==1080)bad('published-download');
 return{key,name,...identity,width:1920,height:1080};
}
export function isGeneratedProfileResource(origin:string,url:string,method:string):boolean{
 try{const u=new URL(url);if(method!=='GET'||u.protocol!=='blob:'||u.origin!==origin||u.search||u.hash)return false;const inner=new URL(url.slice(5));return !inner.username&&!inner.password&&/^\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(inner.pathname);}catch{return false;}
}
export function resolveProfileRequest(plan:PublishedFirefoxPlan,origin:string,url:string,method:string):ExpectedLiveCheck{
 if(origin!==plan.origin&&!/^http:\/\/127\.0\.0\.1:\d{4,5}$/.test(origin))bad('published-browser-policy');
 let u:URL;try{u=new URL(url);}catch{return bad('published-browser-policy');}
 if(u.origin!==origin||u.username||u.password||u.hash||!['GET','HEAD'].includes(method))bad('published-browser-policy');
 const check=publishedFirefoxChecks(plan).find(c=>c.allowedPaths.includes(u.pathname));if(!check)bad('published-browser-policy');
 if(u.search){const q=u.searchParams.toString(),allowed=['direction=imports&months=12&countries=1220%2C2010%2C2050','direction=exports&months=12&countries=1220%2C2010%2C2050','countries=1220','direction=exports&countries=1220'];if(!/^\/products\/(090121|090111)\/$/.test(u.pathname)||!allowed.includes(q))bad('published-browser-policy');}
 return check;
}
export function verifyProfileResponse(check:ExpectedLiveCheck,status:number,headers:Record<string,string>,body:Buffer):void{
 const robots=(headers['x-robots-tag']??'').split(',').map(x=>x.trim().toLowerCase()).sort();
 if(!check.statuses.includes(status)||robots.join(',')!=='nofollow,noindex'||body.length!==check.bytes||digest(body).sha256!==check.sha256)bad('published-browser-response');
}
function journeyNames(plan:PublishedFirefoxPlan){return [...plan.csvs.map(c=>c.case),'mobile-090121-320','static-090121','mobile-090111-375','static-090111','/changes/products/','/changes/duties/','/countries/1220/','private-route-404s'];}
export function assertCompleteProfileJourneys(plan:PublishedFirefoxPlan,r:ProfileJourneyReceipt):void{
 const names=journeyNames(plan);if(r.status!=='pass'||r.checks.length!==16||new Set(r.checks).size!==16||names.some(n=>!r.checks.includes(n))||r.downloads.length!==10||new Set(r.downloads.map(d=>d.key)).size!==10||r.pageErrors.length||r.network.failures.length||r.network.requests<=0||r.network.requests>500||r.network.verifiedResponses<=0||r.network.verifiedResponses>r.network.requests||r.network.acceptedBytes<=0||r.network.acceptedBytes>33554432)bad('published-incomplete');
 for(const csv of plan.csvs){const d=r.downloads.find(x=>x.key===csv.case);if(!d||d.name!==csv.filename||d.bytes!==csv.bytes||d.sha256!==csv.sha256)bad('published-incomplete');}
 for(const key of Object.keys(pngs)){const d=r.downloads.find(x=>x.key===key);if(!d||d.name!==pngs[key]||d.bytes<33||d.bytes>4194304||!/^[a-f0-9]{64}$/.test(d.sha256)||d.width!==1920||d.height!==1080)bad('published-incomplete');}
}
async function guardedRoute(route:Route,plan:PublishedFirefoxPlan,origin:string,stats:ProfileJourneyReceipt['network'],signal:AbortSignal){
 stats.requests++;if(stats.requests>500)bad('published-browser-budget');const requested=route.request(),check=resolveProfileRequest(plan,origin,requested.url(),requested.method());
 let url=requested.url();const seen=new Set([url]);const headers=Object.fromEntries(Object.entries(requested.headers()).filter(([name])=>!['cookie','authorization','proxy-authorization','host'].includes(name)));headers.cookie='';headers.authorization='';
 for(let hop=0;hop<=3;hop++){
  if(hop&&++stats.requests>500)bad('published-browser-budget');
  const response=await route.fetch({url,headers,method:'GET',maxRedirects:0,maxRetries:0,timeout:15000,signal});
  try{
   if(response.url()!==url)bad('published-browser-response');const status=response.status(),responseHeaders=response.headers();
   if([301,302,303,307,308].includes(status)){
    const location=responseHeaders.location;if(check.privateRoute||!location||hop===3||/[\\\u0000-\u0020\u007f]/.test(location))bad('published-browser-redirect');const next=new URL(location,url);
    const nextCheck=resolveProfileRequest(plan,origin,next.href,requested.method());if(nextCheck.path!==check.path||seen.has(next.href))bad('published-browser-redirect');seen.add(next.href);url=next.href;continue;
   }
   const body=await response.body();stats.acceptedBytes+=body.length;if(stats.acceptedBytes>33554432)bad('published-browser-budget');verifyProfileResponse(check,status,responseHeaders,body);
   const fulfilled={...responseHeaders};for(const name of ['content-encoding','content-length','transfer-encoding'])delete fulfilled[name];
   await route.fulfill({status,headers:fulfilled,body});stats.verifiedResponses++;return;
  }finally{await response.dispose();}
 }
 bad('published-browser-redirect');
}
export async function runPublishedProfileJourneys(options:{browser:Browser;origin:string;plan:PublishedFirefoxPlan;proofRoot:string}):Promise<ProfileJourneyReceipt>{
 const {browser,origin,plan,proofRoot}=options;const receipt:ProfileJourneyReceipt={status:'failed',engine:browser.browserType().name(),browserVersion:browser.version(),platform:process.platform,checks:[],downloads:[],network:{requests:0,verifiedResponses:0,acceptedBytes:0,failures:[]},pageErrors:[]};
 const contexts:BrowserContext[]=[],pending=new Set<Promise<void>>(),controller=new AbortController();let stage='start',traced:BrowserContext|undefined,passed=false;
 const timer=setTimeout(()=>{receipt.network.failures.push('published-browser-timeout');controller.abort();void browser.close();},180000);
 const context=async(options:Parameters<Browser['newContext']>[0]={})=>{const c=await browser.newContext({acceptDownloads:true,serviceWorkers:'block',...options});contexts.push(c);c.on('page',p=>p.on('pageerror',()=>receipt.pageErrors.push('published-page-error')));await c.route('**/*',async route=>{if(isGeneratedProfileResource(origin,route.request().url(),route.request().method())){receipt.network.generatedResources=(receipt.network.generatedResources??0)+1;if(receipt.network.generatedResources>32){receipt.network.failures.push('published-browser-budget');await route.abort();}else await route.continue();return;}const op=guardedRoute(route,plan,origin,receipt.network,controller.signal);pending.add(op);try{await op;}catch(error){const code=error instanceof Error&&/^published-[a-z-]+$/.test(error.message)?error.message:'published-browser-network';receipt.network.failures.push(code);await route.abort().catch(()=>{});}finally{pending.delete(op);}});return c;};
 const download=async(page:Page,key:string,label:string,name:string)=>{const waiting=page.waitForEvent('download');await page.getByRole('button',{name:label,exact:true}).click();const d=await waiting,path=await d.path();if(!path||await d.failure())bad('published-download');const max=key in pngs?4194304:131072;if((await lstat(path)).size>max)bad('published-download');const body=await readFile(path);const identity=verifyProfileDownload(plan,key,d.suggestedFilename(),body);if(d.suggestedFilename()!==name)bad('published-download');receipt.downloads.push(identity);if(key in pngs)await writeSiteFile(proofRoot,resolve(proofRoot,name),body);return body;};
 try{
  const c=await context({viewport:{width:1280,height:900}});traced=c;await c.tracing.start({screenshots:true,snapshots:true});const page=await c.newPage();
  for(const code of ['090121','090111'])for(const partner of ['world','1220-2010-2050']){
   stage=code+'-imports-'+partner+'-duties.csv';const params=partner==='world'?'':'?direction=imports&months=12&countries=1220%2C2010%2C2050';await page.goto(origin+'/products/'+code+'/'+params);await expect(page.getByRole('button',{name:'Copy view link',exact:true})).toBeEnabled();
   const duty=page.getByRole('region',{name:'Estimated duties'});await expect(duty.getByText(/^Revised(?: input)?$/)).toHaveCount(0);await expect(duty.locator('.duty-source')).toContainText('Estimated-duty release revisions: no');
   const body=await download(page,stage,'Download estimated duties CSV','hs-'+code+'-imports-estimated-duties.csv');if(!body.includes(Buffer.from('estimated_duty_release,monthly_inputs,'))||!body.includes(Buffer.from('estimated_duty_release,not_assessed,')))bad('published-download');
   await expect(page.getByRole('table',{name:'Monthly trade values · current U.S. dollars'})).toBeVisible();await expect(page.getByRole('figure',{name:'Monthly estimated duties · current USD'})).toBeVisible();
   if(code==='090121'&&partner==='world'){await download(page,'duty-png','Download duty amounts chart PNG',pngs['duty-png']);await download(page,'merchandise-png','Download chart PNG',pngs['merchandise-png']);}receipt.checks.push(stage);
  }
  for(const code of ['090121','090111'])for(const direction of ['imports','exports']){
   stage=code+'-'+direction+'-world-rolling-dollars-changes.csv';await page.goto(origin+'/products/'+code+'/?direction='+direction+'&months=12&countries=1220%2C2010%2C2050');await expect(page.getByRole('button',{name:'Copy view link',exact:true})).toBeEnabled();await expect(page.getByLabel('Rank changes by')).toBeEnabled();if(direction==='exports')await expect(page.getByRole('region',{name:'Estimated duties'})).toHaveCount(0);
   await download(page,stage,'Download changes CSV','hs-'+code+'-'+direction+'-changes-dollars.csv');receipt.checks.push(stage);
  }
  for(const [code,width] of [['090121',320],['090111',375]] as const){
   stage='mobile-'+code+'-'+width;await page.setViewportSize({width,height:850});await page.goto(origin+'/products/'+code+'/?countries=1220');await expect(page.getByRole('button',{name:'Copy view link',exact:true})).toBeEnabled();const scroll=page.getByRole('region',{name:/^Scrollable monthly estimated duties/});await scroll.focus();await expect(scroll).toBeFocused();await page.keyboard.press('ArrowRight');if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))bad('published-overflow');if(code==='090121')await writeSiteFile(proofRoot,resolve(proofRoot,'mobile-090121-320.png'),await page.screenshot());receipt.checks.push(stage);
   stage='static-'+code;const s=await context({javaScriptEnabled:false,viewport:{width,height:850}}),sp=await s.newPage();await sp.goto(origin+'/products/'+code+'/?direction=exports&countries=1220');await expect(sp.getByRole('table',{name:'Monthly estimated duties · All partner countries'})).toBeVisible();await expect(sp.getByRole('region',{name:'Estimated duties'}).getByText(/^Revised(?: input)?$/)).toHaveCount(0);await expect(sp.locator('noscript p').filter({hasText:'Enable JavaScript to change the ranking'})).toBeVisible();await expect(sp.getByLabel('Rank changes by')).toBeDisabled();for(const name of ['Download changes CSV','Download estimated duties CSV'])await expect(sp.getByRole('button',{name,exact:true})).toBeDisabled();receipt.checks.push(stage);await s.close();
  }
  await page.setViewportSize({width:1280,height:900});for(const [path,name] of [['/changes/products/','Product changes'],['/changes/duties/','Estimated-duty changes'],['/countries/1220/','Canada']]){stage=path;await page.goto(origin+path);await expect(page.getByRole('heading',{level:1})).toContainText(name);receipt.checks.push(stage);}
  stage='private-route-404s';for(const path of ['/preview/countries/1220/','/data/processed/current.json','/data/backups/','/.env','/.git/config']){const r=await page.goto(origin+path);if(r?.status()!==404)bad('published-private-status');}receipt.checks.push(stage);
  await Promise.all(pending);receipt.status='pass';assertCompleteProfileJourneys(plan,receipt);passed=true;
 }catch(error){receipt.status='failed';receipt.failure={stage,code:error instanceof Error&&/^published-[a-z-]+$/.test(error.message)?error.message:'published-journey'};}
 finally{clearTimeout(timer);if(traced)await traced.tracing.stop(passed?{}:{path:resolve(proofRoot,'failure-trace.zip')}).catch(()=>{receipt.network.failures.push('published-trace');});for(const c of contexts)await c.close().catch(()=>{});await Promise.allSettled(pending);controller.abort();}
 if(receipt.network.failures.length||receipt.pageErrors.length)receipt.status='failed';return receipt;
}