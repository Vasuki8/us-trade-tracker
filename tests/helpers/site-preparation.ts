import {mkdir,mkdtemp,writeFile,rm,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,sep} from 'node:path';
import {vi} from 'vitest';
import productFixture from '../fixtures/product-release.json';
import {shiftMonth} from '../../src/lib/trade/metrics';
import {canadaCountryReleaseContract as release,countryJsonBytes,digestCountryBytes} from '../../src/lib/country-release/contract.server';
import {countryArchiveContract as archive} from '../../src/lib/country-archive/contract.server';
import {loadCanadaPilot} from '../../src/lib/country-preview/pilot-load.server';
export const fixtureRoots:string[]=[];
export function fixtureGit(root:string,args:string[],input?:Buffer):Buffer{return execFileSync('git',['-c','core.autocrlf=false','-c','commit.gpgsign=false','-c','user.name=Preparation fixture','-c','user.email=fixture@example.invalid',...args],{cwd:root,input,maxBuffer:128*1024*1024});}
// Census-shaped validation fixture only; generated amounts are synthetic, never an accepted source.
export function preparationProductRelease(code:string,end='2026-08'):Buffer{
 const value=structuredClone(productFixture),original=value.reportingMonth;
 const offset=(Number(end.slice(0,4))-Number(original.slice(0,4)))*12+Number(end.slice(5))-Number(original.slice(5));
 value.productCode=code;value.reportingMonth=end;value.source='census';value.codeVersion='synthetic-site-preparation';
 value.retrievedAt='2026-10-15T00:00:00.000Z';
 for(const row of value.observations){row.productCode=code;row.month=shiftMonth(row.month,offset);row.description='SYNTHETIC SITE PRODUCT '+code;}
 for(const interval of value.classificationIntervals){interval.from=shiftMonth(interval.from,offset);interval.to=shiftMonth(interval.to,offset);}
 value.duties.fromMonth=shiftMonth(value.duties.fromMonth,offset);
 for(const row of value.duties.observations){row.productCode=code;row.month=shiftMonth(row.month,offset);}
 for(const world of value.duties.observations.filter(row=>row.geography==='world')){
  const countries=value.duties.observations.filter(row=>row.geography==='country'&&row.month===world.month);
  for(const key of ['calculatedDuty','consumptionValue','dutiableValue'] as const)world[key].valueUsd=countries.reduce((sum,row)=>sum+row[key].valueUsd!,0);
  world.coverage.uncalculatedDutiableValueUsd=countries.reduce((sum,row)=>sum+row.coverage.uncalculatedDutiableValueUsd!,0);
 }
 return countryJsonBytes(value);
}
export async function preparationFixture(options:{months?:[string,string];legacy?:boolean}={}){
 await mkdir(resolve('.tmp'),{recursive:true});const home=await mkdtemp(resolve('.tmp/site-preparation-tests-'));fixtureRoots.push(home);
 const sourceRoot=resolve(home,'source'),dataRoot=resolve(home,'accepted'),outputRoot=resolve(sourceRoot,'.tmp/preparation');
 await mkdir(sourceRoot);await mkdir(resolve(sourceRoot,'.tmp'));await mkdir(dataRoot);await mkdir(resolve(sourceRoot,'node_modules'));
 const templates:Record<string,Buffer>={};
 for(const name of ['_headers','404.html','withdrawal/index.html','withdrawal/404.html'])templates['deployment/pages/'+name]=await readFile(resolve('deployment/pages',name));
 for(const [path,body]of Object.entries({...templates,'a.ts':Buffer.from('export const sample=1;\n'),'.gitignore':Buffer.from('node_modules/\n.tmp/\n'),'package-lock.json':Buffer.from('{"lockfileVersion":3}\n'),'package.json':Buffer.from('{"name":"local-fixture","private":true}\n')})){await mkdir(resolve(sourceRoot,path,'..'),{recursive:true});await writeFile(resolve(sourceRoot,path),body);}
 fixtureGit(sourceRoot,['init','-q']);fixtureGit(sourceRoot,['add','.']);fixtureGit(sourceRoot,['commit','-qm','Fixture source']);
 let commit=fixtureGit(sourceRoot,['rev-parse','HEAD']).toString().trim();
 const countryId='2026-08-2e27b39c-932b-4f3d-b2aa-3b11ca2a3cca';
 const projection={source:'retained',rawVerification:'previous-reviewed-replay',reporting:{from:'2024-09',to:'2026-08',latest:'2026-08'}};
 const candidate=Buffer.from('{"retained":"unit-test-only"}\n'),record=Buffer.from('{"decision":"approved-for-local-selection"}\n');
 const pointer={schemaVersion:1,countryCode:'1220',releaseId:countryId,package:{path:'releases/'+countryId+'/candidate.json',...digestCountryBytes(candidate)},acceptance:{path:'releases/'+countryId+'/acceptance.json',...digestCountryBytes(record)}};
 const bodies:Record<string,Buffer>={['data/countries/1220/processed/current.json']:countryJsonBytes(pointer),['data/countries/1220/processed/'+pointer.package.path]:candidate,['data/countries/1220/processed/'+pointer.acceptance.path]:record};
 const productPins=[],selection=[];let productIndex=0;
 for(const [code,base]of (options.legacy?['090121','090111']:['090121','090111','090240','180100']).map(code=>[code,code==='090121'?'data/processed':`data/products/${code}/processed`])){
  const month=options.months?.[productIndex++]??'2026-08',path=base+'/releases/'+month+'-'+code+'.json';
  bodies[path]=preparationProductRelease(code,month);bodies[base+'/current.json']=countryJsonBytes({releaseFile:'releases/'+month+'-'+code+'.json'});
  const pointer={path:base+'/current.json',...digestCountryBytes(bodies[base+'/current.json'])},release={path,...digestCountryBytes(bodies[path])};
  productPins.push(pointer,release);selection.push({code,reportingMonth:month,pointer,release});
 }
 if(!options.legacy){
  await writeFile(resolve(sourceRoot,'deployment/site-product-selection.json'),countryJsonBytes({schemaVersion:1,products:selection}));
  fixtureGit(sourceRoot,['add','deployment/site-product-selection.json']);fixtureGit(sourceRoot,['commit','-qm','Synthetic product selection']);
  commit=fixtureGit(sourceRoot,['rev-parse','HEAD']).toString().trim();
 }
 for(const [path,body]of Object.entries(bodies)){await mkdir(resolve(dataRoot,path,'..'),{recursive:true});await writeFile(resolve(dataRoot,path),body);}
 vi.spyOn(release,'protectedFiles','get').mockReturnValue(productPins as any);
 vi.spyOn(release,'projection','get').mockReturnValue(digestCountryBytes(countryJsonBytes(projection)));
 vi.spyOn(archive,'selectedPointerDigest','get').mockReturnValue(digestCountryBytes(bodies['data/countries/1220/processed/current.json']));
 vi.mocked(loadCanadaPilot).mockResolvedValue({data:projection,presentation:{kind:'pilot-snapshot',releaseId:countryId,acceptedAt:'2026-10-12T23:46:54.013Z'}} as any);
 return {home,sourceRoot,dataRoot,outputRoot,commit,bodies,templates,projection};
}
export async function cleanPreparationFixtures(){vi.restoreAllMocks();for(const root of fixtureRoots.splice(0)){if(!root.startsWith(resolve('.tmp')+sep))throw Error('Fixture cleanup escaped');await rm(root,{recursive:true,force:true});}}
export function blob(body:Buffer){return createHash('sha1').update(Buffer.from('blob '+body.length+'\0')).update(body).digest('hex');}

