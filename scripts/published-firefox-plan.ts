import {createHash} from 'node:crypto';
import type {ExpectedLiveCheck} from './live-site-package';
export type PublishedFile={path:string;role:'served-asset'|'served-error-page';bytes:number;sha256:string};
export type PublishedCsv={case:string;filename:string;bytes:number;sha256:string};
export type PublishedFirefoxPlan={schemaVersion:1;origin:string;package:{codeCommit:string;zip:{bytes:number;sha256:string};manifest:{bytes:number;sha256:string}};files:PublishedFile[];csvs:PublishedCsv[]};
const origin='https://2b73be66.us-trade-tracker.pages.dev';
const recordSha256='5ed6eaba6c7a9ed112bc4b763cd0a47de36c4fd9f12849d8fa6200dbb134a296';
const privatePaths=['/preview/countries/1220/','/preview/accepted/countries/1220/','/countries/9999/','/data/countries/1220/processed/current.json','/data/processed/current.json','/data/backups/','/.env','/.git/config'];
const fail=():never=>{throw Error('published-plan');};
function keys(value:unknown,names:string[]):asserts value is Record<string,any>{
 if(!value||typeof value!=='object'||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value))||Object.keys(value).sort().join(',')!==[...names].sort().join(','))fail();
}
function identity(v:unknown,max:number):asserts v is {bytes:number;sha256:string}{keys(v,['bytes','sha256']);if(!Number.isSafeInteger(v.bytes)||v.bytes<=0||v.bytes>max||typeof v.sha256!=='string'||!(/^[a-f0-9]{64}$/).test(v.sha256))fail();}
function freeze<T>(v:T):T{if(v&&typeof v==='object'){for(const x of Object.values(v))freeze(x);Object.freeze(v);}return v;}
function csvNames(){const map=new Map<string,string>();for(const code of ['090121','090111']){for(const partner of ['world','1220-2010-2050'])map.set(code+'-imports-'+partner+'-duties.csv','hs-'+code+'-imports-estimated-duties.csv');for(const direction of ['imports','exports'])map.set(code+'-'+direction+'-world-rolling-dollars-changes.csv','hs-'+code+'-'+direction+'-changes-dollars.csv');}return map;}
export function parsePublishedFirefoxPlan(value:unknown):PublishedFirefoxPlan{
 keys(value,['schemaVersion','origin','package','files','csvs']);if(value.schemaVersion!==1||value.origin!==origin)fail();
 keys(value.package,['codeCommit','zip','manifest']);identity(value.package.zip,4194304);identity(value.package.manifest,16384);
 if(value.package.codeCommit!=='b77cb8a6d6d69e352123c0e4baf6e8b13381bcf8'||value.package.zip.bytes!==412614||value.package.zip.sha256!=='6e63391ecc9ebe3c22432f69f620bf1e5f6d443dded47600062c92957346a283'||value.package.manifest.bytes!==6557||value.package.manifest.sha256!=='7b57293e1c354c1d384ede45ef9636d73058ab3cb38f48f0e396f8db61f948dd')fail();
 if(!Array.isArray(value.files)||value.files.length!==30||!Array.isArray(value.csvs)||value.csvs.length!==8)fail();
 const seen=new Set<string>();let total=0,errors=0;
 for(const f of value.files){keys(f,['path','role','bytes','sha256']);identity({bytes:f.bytes,sha256:f.sha256},2097152);if(typeof f.path!=='string'||!(/^(?:_astro\/[A-Za-z0-9_.-]+|(?:[a-z0-9]+\/)*[a-z0-9]+\.html)$/).test(f.path)||f.path.split('/').some((p:string)=>p==='.'||p==='..')||seen.has(f.path))fail();seen.add(f.path);total+=f.bytes;if(f.path==='404.html'){if(f.role!=='served-error-page')fail();errors++;}else if(f.role!=='served-asset')fail();}
 if(total!==1893239||errors!==1)fail();
 const names=csvNames(),used=new Set<string>();let csvTotal=0;
 for(const c of value.csvs){keys(c,['case','filename','bytes','sha256']);identity({bytes:c.bytes,sha256:c.sha256},131072);if(typeof c.case!=='string'||names.get(c.case)!==c.filename||used.has(c.case))fail();used.add(c.case);csvTotal+=c.bytes;}
 if(csvTotal!==193320||used.size!==8)fail();return freeze(value as PublishedFirefoxPlan);
}
export function readPublishedFirefoxPlan(bytes:Uint8Array):PublishedFirefoxPlan{
 if(bytes.byteLength>16384||createHash('sha256').update(bytes).digest('hex')!==recordSha256)fail();
 try{return parsePublishedFirefoxPlan(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)));}catch{return fail();}
}
function aliases(path:string){const result=[path];if(path.endsWith('.html')){result.push(path.slice(0,-5),path.slice(0,-5)+'/');if(path.endsWith('/index.html'))result.push(path.slice(0,-10),path.slice(0,-11)||'/');}return [...new Set(result)];}
export function publishedFirefoxChecks(plan:PublishedFirefoxPlan):ExpectedLiveCheck[]{
 parsePublishedFirefoxPlan(plan);const checks:ExpectedLiveCheck[]=plan.files.map(f=>({path:'/'+f.path,allowedPaths:aliases('/'+f.path),statuses:f.role==='served-error-page'?[200,404]:[200],bytes:f.bytes,sha256:f.sha256,privateRoute:false}));const error=plan.files.find(f=>f.path==='404.html')!;for(const path of privatePaths)checks.push({path,allowedPaths:[path],statuses:[404],bytes:error.bytes,sha256:error.sha256,privateRoute:true});return checks;
}