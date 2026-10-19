import {afterEach,expect,it,vi} from 'vitest';
import fs from 'node:fs/promises';import {tmpdir} from 'node:os';import {resolve,sep} from 'node:path';
import * as stateIo from '../../src/lib/mexico-country-release/acceptance-io.server';
import {identity,json} from '../../src/lib/mexico-country-release/contract.server';import {makeMexicoArchiveFixture} from '../helpers/mexico-archive-data';
const roots:string[]=[];afterEach(async()=>{vi.restoreAllMocks();for(const r of roots.splice(0))await fs.rm(r,{recursive:true,force:true});});
async function setup(){let api:any;try{api=await import('../../src/lib/mexico-country-release/acceptance-state.server');}catch{}expect(api?.installMexicoAcceptedState,'first-only installation is missing').toBeTypeOf('function');const root=await fs.mkdtemp(resolve(tmpdir(),'mx-accepted-install-'));roots.push(root);const batch=resolve(root,'data/backups/mexico-country-release/private-acceptance-archive-20261018-r1'),archiveDir=resolve(batch,'archive');await fs.mkdir(archiveDir,{recursive:true});const f=makeMexicoArchiveFixture();
 for(const [name,b]of [['candidate.json',f.material.candidateBytes],['evidence.json',f.material.evidenceBytes],['manifest.json',f.material.manifestBytes]] as const)await fs.writeFile(resolve(archiveDir,name),b);
 const pointerFile=resolve(batch,'pointer.json'),verificationFile=resolve(batch,'verification-set.json'),outcomeFile=resolve(batch,'outcome.json');await fs.writeFile(pointerFile,json(f.pointer));
 const receipt=(mode:string,digit:string)=>({schemaVersion:1,policyId:'mexico-private-all-goods-archive-v1',countryCode:'2010',mode,status:'verified',archiveOutcome:mode==='initialize'?'initialized':'read-only-verified',currentStateVerified:true,pointer:f.pointer,pointerIdentity:identity(json(f.pointer)),recovery:{schemaVersion:1,policyId:'mexico-private-all-goods-archive-v1',countryCode:'2010',status:'recovered',verificationStage:mode==='initialize'?'prospective':'selected',recoveryId:digit+'2345678-1234-4123-8123-123456789abc',recoveredAt:'2026-10-19T03:00:01.000Z',candidate:identity(f.material.candidateBytes),projection:identity(json(f.projection)),pointer:identity(json(f.pointer)),historicalPathReads:0,sourceRequests:0}});
 const verification={schemaVersion:1,initialization:receipt('initialize','1'),selected:receipt('selected','2'),localReadback:receipt('local-readback','3')};await fs.writeFile(verificationFile,json(verification));const opts={repoRoot:root,archiveDir,pointerFile,verificationFile,outcomeFile};return {api,root,batch,archiveDir,verification,opts,...f};}
it('installs the exact confirmed private-only state and reads it back without changing historical flags',async()=>{
 const f=await setup(),r=await f.api.installMexicoAcceptedState(f.opts);expect(r.status).toBe('installed');expect(r.currentStateVerified).toBe(true);expect(r.pointer).toEqual(identity(json(f.pointer)));
 const state=await f.api.readAcceptedMexicoAllGoodsRelease(f.root);expect(state.pointer.allGoodsAccepted).toBe(true);expect(state.pointer.productComparisons.available).toBe(false);expect(state.material.projection.releaseAccepted).toBe(false);expect(state.material.projection.periods.imports.current.totalUsd).toBe(1200000);
 const release=resolve(f.root,'data/countries/2010/processed/releases',f.pointer.releaseId);expect((await fs.readdir(release)).sort()).toEqual(['candidate.json','evidence.json','manifest.json']);expect(await fs.readFile(resolve(release,'candidate.json'))).toEqual(f.material.candidateBytes);
});
it('recognizes only a completely authenticated already-installed state without rewriting it',async()=>{
 const f=await setup();await f.api.installMexicoAcceptedState(f.opts);const current=resolve(f.root,'data/countries/2010/processed/current.json'),before=await fs.stat(current,{bigint:true});
 const r=await f.api.installMexicoAcceptedState({...f.opts,outcomeFile:resolve(f.batch,'second-outcome.json')});expect(r.status).toBe('already-installed');expect((await fs.stat(current,{bigint:true})).mtimeNs).toBe(before.mtimeNs);
});
it.each(['unknown','partial'] as const)('preserves an occupied %s country directory',async kind=>{
 const f=await setup(),country=resolve(f.root,'data/countries/2010');await fs.mkdir(country,{recursive:true});await fs.writeFile(resolve(country,kind+'.txt'),'preserve');const r=await f.api.installMexicoAcceptedState(f.opts);expect(r.status).toBe('conflict');expect(r.currentStateVerified).toBe(false);expect(await fs.readdir(country)).toEqual([kind+'.txt']);expect(await fs.readFile(resolve(country,kind+'.txt'),'utf8')).toBe('preserve');
});
it.each(['prospective','unconfirmed','same-id','missing-recovery','crossed-pointer','source-read'] as const)('refuses %s verification before canonical mutation',async kind=>{
 const f=await setup(),v=f.verification as any;if(kind==='prospective')v.selected.recovery.verificationStage='prospective';if(kind==='unconfirmed'){v.selected.status='unconfirmed';v.selected.currentStateVerified=false;}
 if(kind==='same-id')v.localReadback.recovery.recoveryId=v.selected.recovery.recoveryId;if(kind==='missing-recovery')v.selected.recovery=null;
 if(kind==='crossed-pointer')v.selected.pointerIdentity.sha256='3'.repeat(64);if(kind==='source-read')v.localReadback.recovery.historicalPathReads=1;
 await fs.writeFile(f.opts.verificationFile,json(v));await expect(f.api.installMexicoAcceptedState(f.opts)).rejects.toThrow();await expect(fs.access(resolve(f.root,'data/countries/2010'))).rejects.toThrow();
});
it('refuses source/outcome aliases before creating the canonical root',async()=>{
 const f=await setup();await expect(f.api.installMexicoAcceptedState({...f.opts,outcomeFile:resolve(f.archiveDir,'candidate.json')})).rejects.toThrow();await expect(fs.access(resolve(f.root,'data/countries/2010'))).rejects.toThrow();expect(await fs.readFile(resolve(f.archiveDir,'candidate.json'))).toEqual(f.material.candidateBytes);
});
it('carries a verified installed outcome when external receipt persistence fails',async()=>{
 const f=await setup(),open=fs.open;vi.spyOn(fs,'open').mockImplementation(async(path,...args)=>{const h=await open(path,...args);if(String(path).includes('.outcome.json.')&&args[0]==='wx')h.sync=async()=>{throw Error('receipt failure');};return h;});
 const e=await f.api.installMexicoAcceptedState(f.opts).then(()=>null,(e:any)=>e);expect(e.outcome.status).toBe('installed');expect(e.outcome.currentStateVerified).toBe(true);expect((await f.api.readAcceptedMexicoAllGoodsRelease(f.root)).pointer).toEqual(f.pointer);
});
it('does not claim installation when published pointer readback is unavailable',async()=>{
 const f=await setup(),open=fs.open;vi.spyOn(fs,'open').mockImplementation(async(path,...args)=>{if(String(path).endsWith(sep+'current.json')&&args[0]==='r')throw Error('final pointer unavailable');return open(path,...args);});
 const r=await f.api.installMexicoAcceptedState(f.opts);expect(r.status).toBe('unconfirmed');expect(r.currentStateVerified).toBe(false);await fs.access(resolve(f.root,'data/countries/2010/processed/current.json'));
});

it('only one concurrent installer can own the initial country directory',async()=>{
 const f=await setup();const outcomes=await Promise.all([f.api.installMexicoAcceptedState(f.opts),f.api.installMexicoAcceptedState({...f.opts,outcomeFile:resolve(f.batch,'concurrent-outcome.json')})]);
 expect(outcomes.filter(r=>r.status==='installed')).toHaveLength(1);expect(outcomes.filter(r=>r.currentStateVerified&&r.status==='installed')).toHaveLength(1);
 expect(['already-installed','unconfirmed']).toContain(outcomes.find(r=>r.status!=='installed').status);expect((await f.api.readAcceptedMexicoAllGoodsRelease(f.root)).pointer).toEqual(f.pointer);
});

it('refuses an original country reservation replaced before child creation',async()=>{
 const f=await setup(),country=resolve(f.root,'data/countries/2010'),original=country+'-owned-old',reserve=stateIo.reserveMexicoStateDirectory;let moved=false;
 vi.spyOn(stateIo,'reserveMexicoStateDirectory').mockImplementation(async(root,path)=>{const grant=await reserve(root,path);if(String(path)===country&&!moved){await fs.rename(country,original);await fs.mkdir(country);await fs.writeFile(resolve(country,'unknown.txt'),'preserve');moved=true;}return grant;});
 const r=await f.api.installMexicoAcceptedState(f.opts);expect(moved).toBe(true);expect(r.currentStateVerified).toBe(false);expect(await fs.readdir(country)).toEqual(['unknown.txt']);
});
it('refuses extra files introduced while an accepted state is read',async()=>{
 const f=await setup();await f.api.installMexicoAcceptedState(f.opts);const release=resolve(f.root,'data/countries/2010/processed/releases',f.pointer.releaseId),open=fs.open;let added=false;
 vi.spyOn(fs,'open').mockImplementation(async(path,...args)=>{const h=await open(path,...args);if(String(path)===resolve(release,'candidate.json')&&args[0]==='r'&&!added){added=true;await fs.writeFile(resolve(release,'unknown.txt'),'preserve');}return h;});
 await expect(f.api.readAcceptedMexicoAllGoodsRelease(f.root)).rejects.toThrow();expect(added).toBe(true);
});

it('detects a pointer replaced during accepted snapshot reading',async()=>{
 const f=await setup();await f.api.installMexicoAcceptedState(f.opts);const release=resolve(f.root,'data/countries/2010/processed/releases',f.pointer.releaseId),current=resolve(f.root,'data/countries/2010/processed/current.json'),open=fs.open;let altered=false;
 vi.spyOn(fs,'open').mockImplementation(async(path,...args)=>{const h=await open(path,...args);if(String(path)===resolve(release,'candidate.json')&&args[0]==='r'&&!altered){altered=true;await fs.writeFile(current,json({...f.pointer,acceptedAt:'2026-10-19T03:00:01.000Z'}));}return h;});
 await expect(f.api.readAcceptedMexicoAllGoodsRelease(f.root)).rejects.toThrow();expect(altered).toBe(true);
});

it('detects an archive body replaced after its individual read',async()=>{
 const f=await setup();await f.api.installMexicoAcceptedState(f.opts);const release=resolve(f.root,'data/countries/2010/processed/releases',f.pointer.releaseId),candidate=resolve(release,'candidate.json'),open=fs.open;let altered=false;
 vi.spyOn(fs,'open').mockImplementation(async(path,...args)=>{const h=await open(path,...args);if(String(path)===resolve(release,'manifest.json')&&args[0]==='r'&&!altered){altered=true;await fs.writeFile(candidate,'changed after candidate read');}return h;});
 const error=await f.api.readAcceptedMexicoAllGoodsRelease(f.root).then(()=>null,(e:any)=>e);expect(altered).toBe(true);expect(error).toBeInstanceOf(Error);
});
