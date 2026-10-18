import {afterEach,expect,it,vi} from 'vitest';
import fs from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {MexicoOutputPublicationError,reserveMexicoOutput,writeMexicoExclusiveFile} from '../../src/lib/mexico-country-release/io.server';
const roots:string[]=[];
afterEach(async()=>{vi.restoreAllMocks();for(const root of roots.splice(0))await fs.rm(root,{recursive:true,force:true});});
async function setup(){
 const root=await fs.mkdtemp(resolve(tmpdir(),'mexico-io-review-'));roots.push(root);
 const parent=resolve(root,'data/backups/mexico-country-release');await fs.mkdir(parent,{recursive:true});
 const output=resolve(parent,'output'),reservation=await reserveMexicoOutput(root,output);
 return {root,parent,output,reservation};
}
it.each(['sync','close','readback'] as const)('does not publish verified receipt when staged %s fails',async phase=>{
 const f=await setup(),target=resolve(f.output,'recovery-receipt.json'),open=fs.open;
 vi.spyOn(fs,'open').mockImplementation(async(path,...args)=>{
  const h=await open(path,...args);
  if(String(path).includes('recovery-receipt.json')){
   if(phase==='sync'&&args[0]==='wx')h.sync=async()=>{throw Object.assign(Error('sync EIO'),{code:'EIO'});};
   if(phase==='close'&&args[0]==='wx'){const close=h.close.bind(h);h.close=async()=>{await close();throw Object.assign(Error('close EIO'),{code:'EIO'});};}
   if(phase==='readback'&&args[0]==='r')h.read=async()=>{throw Object.assign(Error('readback EIO'),{code:'EIO'});};
  }return h;
 });
 await expect(writeMexicoExclusiveFile(f.root,target,Buffer.from('{"status":"verified"}\n'),f.reservation)).rejects.toThrow();
 await expect(fs.access(target)).rejects.toThrow();
});
it('rejects an ordinary directory replacement between output writes',async()=>{
 const f=await setup();await writeMexicoExclusiveFile(f.root,resolve(f.output,'candidate.json'),Buffer.from('{}\n'),f.reservation);
 await fs.rename(f.output,resolve(f.parent,'original'));await fs.mkdir(f.output);
 await fs.writeFile(resolve(f.output,'unrelated.txt'),'preserve me');
 await expect(writeMexicoExclusiveFile(f.root,resolve(f.output,'research-data.json'),Buffer.from('{}\n'),f.reservation)).rejects.toThrow();
 expect(await fs.readdir(f.output)).toEqual(['unrelated.txt']);
});
it('removes its published receipt when final staging cleanup fails',async()=>{
 const f=await setup(),target=resolve(f.output,'recovery-receipt.json'),unlink=fs.unlink;
 vi.spyOn(fs,'unlink').mockImplementation(async path=>{if(String(path).endsWith('.partial'))throw Error('cleanup EIO');return unlink(path);});
 await expect(writeMexicoExclusiveFile(f.root,target,Buffer.from('{"status":"verified"}\n'),f.reservation)).rejects.toThrow('cleanup EIO');
 await expect(fs.access(target)).rejects.toThrow();
});
it('explicitly reports uncertain publication when the filesystem also refuses rollback',async()=>{
 const f=await setup(),target=resolve(f.output,'recovery-receipt.json');
 vi.spyOn(fs,'unlink').mockRejectedValue(Error('filesystem unavailable'));
 const outcome=await writeMexicoExclusiveFile(f.root,target,Buffer.from('{"status":"verified"}\n'),f.reservation).then(()=>null,error=>error);
 expect(outcome).toBeInstanceOf(MexicoOutputPublicationError);expect(outcome.publicationState).toBe('may-be-visible');
 expect(outcome.path).toBe(target);
});
