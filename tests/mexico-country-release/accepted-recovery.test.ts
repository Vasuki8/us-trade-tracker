import {afterEach,expect,it,vi} from 'vitest';
import fs from 'node:fs/promises';import {tmpdir} from 'node:os';import {resolve} from 'node:path';
import {identity,json} from '../../src/lib/mexico-country-release/contract.server';
import {mexicoAcceptanceContract} from '../../src/lib/mexico-country-release/acceptance-contract.server';
import {authenticateMexicoAcceptance} from '../../src/lib/mexico-country-release/acceptance.server';
import {buildMexicoArchive,proposeMexicoAcceptedPointer} from '../../src/lib/mexico-country-archive/bundle.server';
import {makeMexicoArchiveFixture} from '../helpers/mexico-archive-data';
const roots:string[]=[];afterEach(async()=>{vi.restoreAllMocks();for(const r of roots.splice(0))await fs.rm(r,{recursive:true,force:true});});
async function setup(){let api:any;try{api=await import('../../src/lib/mexico-country-release/acceptance-state.server');}catch{}expect(api?.recoverMexicoAcceptedState,'accepted-state recovery is missing').toBeTypeOf('function');const root=await fs.mkdtemp(resolve(tmpdir(),'mx-accepted-recover-'));roots.push(root);const batch=resolve(root,'data/backups/mexico-country-release/private-acceptance-archive-20261018-r1');await fs.mkdir(batch,{recursive:true});return {api,root,batch,...makeMexicoArchiveFixture()};}
it('restores exact portable state twice with distinct recovery identities and no historical reads',async()=>{
 const f=await setup(),a=await f.api.recoverMexicoAcceptedState({repoRoot:f.root,outputDir:resolve(f.batch,'one'),material:f.material,pointer:f.pointer,verificationStage:'selected'}),b=await f.api.recoverMexicoAcceptedState({repoRoot:f.root,outputDir:resolve(f.batch,'two'),material:f.material,pointer:f.pointer,verificationStage:'selected'});
 expect(a.status).toBe('recovered');expect(a.verificationStage).toBe('selected');expect(a.recoveryId).not.toBe(b.recoveryId);expect(a.historicalPathReads).toBe(0);expect(a.pointer).toEqual(identity(json(f.pointer)));
 const state=await f.api.readAcceptedMexicoAllGoodsRelease(resolve(f.batch,'one'));expect(state.projection?.releaseAccepted??state.material.projection.releaseAccepted).toBe(false);expect(state.pointer.allGoodsAccepted).toBe(true);
 expect(await fs.readFile(resolve(f.batch,'two/data/countries/2010/processed/current.json'))).toEqual(json(f.pointer));await expect(fs.access(resolve(f.root,'data/countries/2010'))).rejects.toThrow();
});
it('marks a pre-initialization recovery prospective even when its proposed pointer says accepted',async()=>{
 const f=await setup(),r=await f.api.recoverMexicoAcceptedState({repoRoot:f.root,outputDir:resolve(f.batch,'prospective'),material:f.material,pointer:f.pointer});expect(r.verificationStage).toBe('prospective');expect(r.status).toBe('recovered');
});
it('rejects a crossed pointer before creating the output directory',async()=>{
 const f=await setup(),out=resolve(f.batch,'invalid'),pointer={...f.pointer,publicMexicoProfile:true};await expect(f.api.recoverMexicoAcceptedState({repoRoot:f.root,outputDir:out,material:f.material,pointer})).rejects.toThrow();await expect(fs.access(out)).rejects.toThrow();
});
it('does not emit a verified recovery receipt after a late pointer write failure',async()=>{
 const f=await setup(),out=resolve(f.batch,'late-failure'),open=fs.open;vi.spyOn(fs,'open').mockImplementation(async(path,...args)=>{const h=await open(path,...args);if(String(path).includes('.current.json.')&&args[0]==='wx')h.sync=async()=>{throw Error('pointer sync');};return h;});await expect(f.api.recoverMexicoAcceptedState({repoRoot:f.root,outputDir:out,material:f.material,pointer:f.pointer})).rejects.toThrow();await expect(fs.access(resolve(out,'recovery-receipt.json'))).rejects.toThrow();
});

it('treats historical record paths as inert bytes during portable recovery',async()=>{
 const f=await setup(),sentinel=resolve(f.root,'never-open-this-historical-source.json'),name=[...f.input.evidenceFiles.keys()].find(n=>!['prior/candidate-eligibility.json','prior/operator-verification-proof.json','prior/eligibility-decision.json'].includes(n))!;
 await fs.writeFile(sentinel,'this file is not archive authority');f.input.evidenceFiles.set(name,json({sourcePath:sentinel,outputDir:sentinel}));const pins=[...f.input.evidenceFiles].map(([name,b])=>({name,...identity(b)}));vi.spyOn(mexicoAcceptanceContract,'pins','get').mockReturnValue(pins);
 const material=buildMexicoArchive(authenticateMexicoAcceptance(f.input)),pointer=proposeMexicoAcceptedPointer(material,'2026-10-19T03:00:00.000Z'),open=fs.open;const spy=vi.spyOn(fs,'open').mockImplementation(async(path,...args)=>{if(String(path)===sentinel)throw Error('historical path followed');return open(path,...args);});
 const result=await f.api.recoverMexicoAcceptedState({repoRoot:f.root,outputDir:resolve(f.batch,'inert-paths'),material,pointer});expect(result.historicalPathReads).toBe(0);expect(spy.mock.calls.some(call=>String(call[0])===sentinel)).toBe(false);
});

it('rejects direct recovery into the canonical country root before any state write',async()=>{
 const f=await setup(),country=resolve(f.root,'data/countries/2010');await expect(f.api.recoverMexicoAcceptedState({repoRoot:f.root,outputDir:country,material:f.material,pointer:f.pointer})).rejects.toThrow();await expect(fs.access(country)).rejects.toThrow();
});
