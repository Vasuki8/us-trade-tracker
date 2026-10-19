import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {identity,json} from '../../src/lib/mexico-country-release/contract.server';
import {mexicoArchiveContract} from '../../src/lib/mexico-country-archive/contract.server';
import {makeMexicoArchiveFixture,MemoryMexicoArchiveStore} from '../helpers/mexico-archive-data';
const roots:string[]=[];beforeEach(()=>{vi.useFakeTimers({toFake:['Date']});vi.setSystemTime('2026-10-19T03:00:00.000Z');});afterEach(async()=>{vi.restoreAllMocks();vi.useRealTimers();for(const r of roots.splice(0))await fs.rm(r,{recursive:true,force:true});});
async function setup(){let api:any;try{api=await import('../../src/lib/mexico-country-archive/verify.server');}catch{}expect(api?.verifyMexicoArchive,'remote verifier is missing').toBeTypeOf('function');const root=await fs.mkdtemp(resolve(tmpdir(),'mx-archive-verify-'));roots.push(root);const batch=resolve(root,'data/backups/mexico-country-release/private-acceptance-archive-20261018-r1');await fs.mkdir(batch,{recursive:true});const f=makeMexicoArchiveFixture(),store=new MemoryMexicoArchiveStore(f.material);return {api,root,batch,out:resolve(batch,'verification'),store,...f};}
const expected=(f:any)=>identity(f.material.manifestBytes);
it('recovers every complete object before its sole marker initialization and confirms readback',async()=>{
 const f=await setup(),r=await f.api.verifyMexicoArchive({store:f.store,repoRoot:f.root,outputDir:f.out,mode:'initialize',expectedManifest:expected(f)});
 expect(r.status).toBe('verified');expect(r.archiveOutcome).toBe('initialized');expect(r.currentStateVerified).toBe(true);expect(r.recovery.verificationStage).toBe('prospective');
 expect(f.store.events.filter(e=>e.method==='put').map(e=>e.key)).toEqual([mexicoArchiveContract.currentKey]);
 expect(f.store.objects.get(mexicoArchiveContract.currentKey)).toEqual(json(r.pointer));expect(await fs.readFile(resolve(f.out,'proposed-pointer.json'))).toEqual(json(r.pointer));
 await expect(fs.access(resolve(f.root,'data/countries/2010'))).rejects.toThrow();
 expect(r.recovery.historicalPathReads).toBe(0);expect(r.recovery.sourceRequests).toBe(0);
});
it('follows the selected marker on a fresh recovery and never invokes PUT',async()=>{
 const f=await setup();f.store.objects.set(mexicoArchiveContract.currentKey,json(f.pointer));const r=await f.api.verifyMexicoArchive({store:f.store,repoRoot:f.root,outputDir:f.out,mode:'selected'});
 expect(r.archiveOutcome).toBe('read-only-verified');expect(r.recovery.verificationStage).toBe('selected');expect(r.pointerIdentity).toEqual(identity(json(f.pointer)));expect(f.store.events.filter(e=>e.method==='put')).toEqual([]);
 for(const d of f.material.descriptors)expect(f.store.events.filter(e=>e.method==='get'&&e.key===d.key)).toHaveLength(1);
});
it.each(['changed-body','missing-body','wrong-manifest'] as const)('refuses %s before marker publication',async kind=>{
 const f=await setup(),d=f.material.descriptors[0];if(kind==='changed-body'){const b=Buffer.from(f.material.candidateBytes);b[0]^=1;f.store.objects.set(d.key,b);}if(kind==='missing-body')f.store.objects.delete(d.key);
 let pin=expected(f);if(kind==='wrong-manifest')pin={...pin,sha256:'3'.repeat(64)};
 await expect(f.api.verifyMexicoArchive({store:f.store,repoRoot:f.root,outputDir:f.out,mode:'initialize',expectedManifest:pin})).rejects.toThrow();expect(f.store.objects.has(mexicoArchiveContract.currentKey)).toBe(false);
});
it('resolves a lost marker acknowledgement through exact readback without another PUT',async()=>{
 const f=await setup(),put=f.store.put.bind(f.store);vi.spyOn(f.store,'put').mockImplementation(async(...args)=>{await put(...args);throw Error('acknowledgement lost');});
 const r=await f.api.verifyMexicoArchive({store:f.store,repoRoot:f.root,outputDir:f.out,mode:'initialize',expectedManifest:expected(f)});expect(r.archiveOutcome).toBe('confirmed-by-readback');expect(r.currentStateVerified).toBe(true);expect(f.store.events.filter(e=>e.method==='put')).toHaveLength(1);
});
it('keeps an acknowledged but unreadable selection explicitly unconfirmed',async()=>{
 const f=await setup(),get=f.store.get.bind(f.store);let markerGets=0;vi.spyOn(f.store,'get').mockImplementation(async(key,max)=>{if(key===mexicoArchiveContract.currentKey&&++markerGets>1)throw Error('readback unavailable');return get(key,max);});
 const r=await f.api.verifyMexicoArchive({store:f.store,repoRoot:f.root,outputDir:f.out,mode:'initialize',expectedManifest:expected(f)});expect(r.status).toBe('unconfirmed');expect(r.currentStateVerified).toBe(false);expect(f.store.objects.has(mexicoArchiveContract.currentKey)).toBe(true);expect(f.store.events.filter(e=>e.method==='put')).toHaveLength(1);
});
it('retains a conflicting marker without overwriting or claiming its acceptance',async()=>{
 const f=await setup(),other={...f.pointer,acceptedAt:'2026-10-19T03:00:01.000Z'},put=f.store.put.bind(f.store);vi.spyOn(f.store,'put').mockImplementation(async(...args)=>{await put(...args);f.store.objects.set(mexicoArchiveContract.currentKey,json(other));throw Error('conflict');});
 const r=await f.api.verifyMexicoArchive({store:f.store,repoRoot:f.root,outputDir:f.out,mode:'initialize',expectedManifest:expected(f)});expect(r.status).toBe('conflict');expect(r.currentStateVerified).toBe(false);expect(f.store.objects.get(mexicoArchiveContract.currentKey)).toEqual(json(other));
});
it.each(['sync','close','readback'] as const)('carries the established remote outcome when receipt %s fails',async phase=>{
 const f=await setup(),open=fs.open;vi.spyOn(fs,'open').mockImplementation(async(path,...args)=>{const h=await open(path,...args);if(String(path).includes('verification.json')){
 if(phase==='sync'&&args[0]==='wx')h.sync=async()=>{throw Error('receipt sync failed');};if(phase==='close'&&args[0]==='wx'){const close=h.close.bind(h);h.close=async()=>{await close();throw Error('receipt close failed');};}if(phase==='readback'&&args[0]==='r')h.read=async()=>{throw Error('receipt read failed');};}return h;});
 const e=await f.api.verifyMexicoArchive({store:f.store,repoRoot:f.root,outputDir:f.out,mode:'initialize',expectedManifest:expected(f)}).then(()=>null,(e:any)=>e);expect(e.receipt.status).toBe('verified');expect(e.receipt.currentStateVerified).toBe(true);expect(f.store.objects.has(mexicoArchiveContract.currentKey)).toBe(true);expect(f.store.events.filter(e=>e.method==='put')).toHaveLength(1);
});
it('refuses an occupied output before any storage read',async()=>{
 const f=await setup();await fs.mkdir(f.out);await fs.writeFile(resolve(f.out,'unrelated'),'keep');await expect(f.api.verifyMexicoArchive({store:f.store,repoRoot:f.root,outputDir:f.out,mode:'initialize',expectedManifest:expected(f)})).rejects.toThrow();expect(f.store.events).toEqual([]);expect(await fs.readFile(resolve(f.out,'unrelated'),'utf8')).toBe('keep');
});

it.each([false,true])('keeps missing marker readback unconfirmed, lost acknowledgement=%s',async lost=>{
 const f=await setup(),put=f.store.put.bind(f.store),get=f.store.get.bind(f.store);let reads=0;vi.spyOn(f.store,'put').mockImplementation(async(...args)=>{await put(...args);if(lost)throw Error('ack lost');});
 vi.spyOn(f.store,'get').mockImplementation(async(key,max)=>{if(key===mexicoArchiveContract.currentKey&&++reads>1)return null;return get(key,max);});
 const r=await f.api.verifyMexicoArchive({store:f.store,repoRoot:f.root,outputDir:f.out,mode:'initialize',expectedManifest:expected(f)});expect(r.status).toBe('unconfirmed');expect(r.archiveOutcome).toBe('unconfirmed');expect(r.currentStateVerified).toBe(false);expect(f.store.events.filter(e=>e.method==='put')).toHaveLength(1);
});
