import {afterEach,expect,it,vi} from 'vitest';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
const roots:string[]=[];afterEach(async()=>{vi.restoreAllMocks();for(const r of roots.splice(0))await fs.rm(r,{recursive:true,force:true});});
async function setup(){let api:any;try{api=await import('../../src/lib/mexico-country-release/acceptance-io.server');}catch{}expect(api?.reserveMexicoStateDirectory,'state reservation is missing').toBeTypeOf('function');const root=await fs.mkdtemp(resolve(tmpdir(),'mx-accepted-io-'));roots.push(root);const batch=resolve(root,'data/backups/mexico-country-release/private-acceptance-archive-20261018-r1');await fs.mkdir(batch,{recursive:true});const out=resolve(batch,'case'),grant=await api.reserveMexicoStateDirectory(root,out);return {api,root,batch,out,grant};}
it('writes and reads back exact bytes through an owned reservation',async()=>{const f=await setup();await f.api.writeMexicoStateFile(f.grant,'receipt.json',Buffer.from('{}\n'));expect(await fs.readFile(resolve(f.out,'receipt.json'),'utf8')).toBe('{}\n');expect(await fs.readdir(f.out)).toEqual(['receipt.json']);});
it.each(['sync','close','readback'] as const)('withholds final publication on staged %s failure',async phase=>{
 const f=await setup(),open=fs.open;vi.spyOn(fs,'open').mockImplementation(async(path,...args)=>{const h=await open(path,...args);if(String(path).includes('receipt.json')){
 if(phase==='sync'&&args[0]==='wx')h.sync=async()=>{throw Error('sync failed');};
 if(phase==='close'&&args[0]==='wx'){const close=h.close.bind(h);h.close=async()=>{await close();throw Error('close failed');};}
 if(phase==='readback'&&args[0]==='r')h.read=async()=>{throw Error('readback failed');};}return h;});
 await expect(f.api.writeMexicoStateFile(f.grant,'receipt.json',Buffer.from('{}\n'))).rejects.toThrow();await expect(fs.access(resolve(f.out,'receipt.json'))).rejects.toThrow();
});
it('detects ordinary ancestor replacement and preserves the replacement files',async()=>{
 const f=await setup();await fs.rename(f.batch,f.batch+'-original');await fs.mkdir(f.out,{recursive:true});await fs.writeFile(resolve(f.out,'unrelated.txt'),'keep');
 await expect(f.api.writeMexicoStateFile(f.grant,'receipt.json',Buffer.from('{}\n'))).rejects.toThrow();expect(await fs.readdir(f.out)).toEqual(['unrelated.txt']);
});
it('preserves and reports uncertain publication when final stage cleanup fails',async()=>{
 const f=await setup(),unlink=fs.unlink;vi.spyOn(fs,'unlink').mockImplementation(async p=>{if(String(p).endsWith('.partial'))throw Error('cannot remove stage');return unlink(p);});
 const error=await f.api.writeMexicoStateFile(f.grant,'current.json',Buffer.from('{}\n')).then(()=>null,(e:any)=>e);
 expect(error.publicationState).toBe('may-be-visible');expect(await fs.readFile(resolve(f.out,'current.json'),'utf8')).toBe('{}\n');
});
it('refuses to overwrite an existing file and never removes its bytes',async()=>{
 const f=await setup();await fs.writeFile(resolve(f.out,'receipt.json'),'unknown');await expect(f.api.writeMexicoStateFile(f.grant,'receipt.json',Buffer.from('{}\n'))).rejects.toThrow();expect(await fs.readFile(resolve(f.out,'receipt.json'),'utf8')).toBe('unknown');
});
it('allows only one concurrent directory owner',async()=>{
 const f=await setup(),target=resolve(f.batch,'concurrent'),result=await Promise.allSettled([f.api.reserveMexicoStateDirectory(f.root,target),f.api.reserveMexicoStateDirectory(f.root,target)]);expect(result.map(r=>r.status).sort()).toEqual(['fulfilled','rejected']);
});
it('refuses aliases, frozen old proof output and forged grants',async()=>{
 const f=await setup();await expect(f.api.writeMexicoStateFile(f.grant,'../outside',Buffer.from('x'))).rejects.toThrow();
 await expect(f.api.reserveMexicoStateDirectory(f.root,resolve(f.root,'data/backups/mexico-country-release/repaired-runtime-verification-20261018-r1/new'))).rejects.toThrow();
 await expect(f.api.writeMexicoStateFile({...f.grant},'receipt.json',Buffer.from('x'))).rejects.toThrow();
});
it('refuses a linked output ancestor before creating any file',async()=>{
 const f=await setup(),other=resolve(f.root,'other');await fs.mkdir(other);const link=resolve(f.batch,'linked');await fs.symlink(other,link,process.platform==='win32'?'junction':'dir');
 await expect(f.api.reserveMexicoStateDirectory(f.root,resolve(link,'output'))).rejects.toThrow();expect(await fs.readdir(other)).toEqual([]);
});

it('detects replacement above the configured root even when the root directory inode survives',async()=>{
 const f=await setup(),container=await fs.mkdtemp(resolve(tmpdir(),'mx-ancestor-container-'));roots.push(container,container+'-old');
 const repo=resolve(container,'repo');await fs.mkdir(repo);const path=resolve(repo,'data/backups/mexico-country-release/private-acceptance-archive-20261018-r1/case');
 const grant=await f.api.reserveMexicoStateDirectory(repo,path);await fs.rename(container,container+'-old');await fs.mkdir(container);await fs.rename(resolve(container+'-old','repo'),repo);
 await expect(f.api.writeMexicoStateFile(grant,'receipt.json',Buffer.from('{}\n'))).rejects.toThrow();
});
