import {afterEach,expect,it,vi} from 'vitest';import fs from 'node:fs/promises';import {resolve} from 'node:path';import {tmpdir} from 'node:os';
import {encodeMexicoCandidate} from '../../src/lib/mexico-country-release/package.server';import {verifyMexicoAllGoodsEvidence} from '../../src/lib/mexico-country-release/evidence.server';
import {recoverMexicoCandidate} from '../../src/lib/mexico-country-release/recovery.server';import * as io from '../../src/lib/mexico-country-release/io.server';
import {makeMexicoEvidenceFixture,installMexicoFixture} from '../helpers/mexico-country-release-data';
const roots:string[]=[];afterEach(async()=>{vi.restoreAllMocks();for(const r of roots.splice(0))await fs.rm(r,{recursive:true,force:true});});
async function setup(){const root=await fs.mkdtemp(resolve(tmpdir(),'mexico-recovery-'));roots.push(root);const parent=resolve(root,'data/backups/mexico-country-release');await fs.mkdir(parent,{recursive:true});const f=makeMexicoEvidenceFixture();installMexicoFixture(f);const p=encodeMexicoCandidate(verifyMexicoAllGoodsEvidence(f),{releaseId:'2026-08-12345678-1234-4123-8123-123456789abc',packagingCommit:'1'.repeat(40),preparedAt:'2026-10-18T23:00:00.000Z'}),candidate=resolve(parent,'input.json');await fs.writeFile(candidate,p.bytes);return {root,parent,candidate,bytes:p.bytes};}
it('recovers with no historical paths, reading only candidate data and its own output readbacks',async()=>{
 const f=await setup(),open=fs.open,opens:string[]=[];vi.spyOn(fs,'open').mockImplementation(async(path,...args)=>{const p=String(path);opens.push(p);if(!p.startsWith(f.parent))throw Error('historical-read');return open(path,...args);});vi.stubGlobal('fetch',()=>{throw Error('network');});
 const output=resolve(f.parent,'primary'),r=await recoverMexicoCandidate({repoRoot:f.root,candidateFile:f.candidate,outputDir:output});expect(r.status).toBe('verified');expect(r.historicalPathReads).toBe(0);expect(opens.length).toBeGreaterThan(0);expect(opens.every(p=>p===f.candidate||p.startsWith(output))).toBe(true);expect(await fs.readdir(output)).toEqual(['candidate.json','recovery-receipt.json','research-data.json']);expect(await fs.access(resolve(f.root,'data/countries/2010')).then(()=>true,()=>false)).toBe(false);vi.unstubAllGlobals();
 const second=resolve(f.parent,'second');await recoverMexicoCandidate({repoRoot:f.root,candidateFile:resolve(output,'candidate.json'),outputDir:second});expect(await fs.readFile(resolve(second,'candidate.json'))).toEqual(f.bytes);expect(await fs.readFile(resolve(second,'research-data.json'))).toEqual(await fs.readFile(resolve(output,'research-data.json')));
});
it('rejects invalid package before output creation',async()=>{const f=await setup();await fs.writeFile(f.candidate,'{}');const output=resolve(f.parent,'invalid');await expect(recoverMexicoCandidate({repoRoot:f.root,candidateFile:f.candidate,outputDir:output})).rejects.toThrow();await expect(fs.access(output)).rejects.toThrow();});
it('interruption cannot leave a verified receipt',async()=>{const f=await setup(),write=io.writeMexicoExclusiveFile;let n=0;vi.spyOn(io,'writeMexicoExclusiveFile').mockImplementation(async(...args)=>{if(++n===2)throw Error('interrupted');return write(...args);});const output=resolve(f.parent,'interrupted');await expect(recoverMexicoCandidate({repoRoot:f.root,candidateFile:f.candidate,outputDir:output})).rejects.toThrow();await expect(fs.access(resolve(output,'recovery-receipt.json'))).rejects.toThrow();});
it('detects a replaced read target before trusting its bytes',async()=>{const f=await setup(),lstat=fs.lstat;vi.spyOn(fs,'lstat').mockImplementation(async(...args)=>{const s=await lstat(...args);if(String(args[0])===f.candidate)Object.defineProperty(s,'ino',{value:0n});return s;});await expect(io.readMexicoBoundedFile(f.root,f.candidate,24*1024*1024)).rejects.toThrow('race');});
it.each(['replace-directory','remove-candidate','add-unrelated'] as const)('rejects incomplete recovery after %s',async change=>{
 const f=await setup(),output=resolve(f.parent,'incomplete'),write=io.writeMexicoExclusiveFile;
 vi.spyOn(io,'writeMexicoExclusiveFile').mockImplementation(async(...args)=>{
  await write(...args);
  if(change==='replace-directory'&&String(args[1]).endsWith('candidate.json')){await fs.rename(output,resolve(f.parent,'moved'));await fs.mkdir(output);}
  if(String(args[1]).endsWith('research-data.json')){
   if(change==='remove-candidate')await fs.unlink(resolve(output,'candidate.json'));
   if(change==='add-unrelated')await fs.writeFile(resolve(output,'unrelated.txt'),'preserve me');
  }
 });
 await expect(recoverMexicoCandidate({repoRoot:f.root,candidateFile:f.candidate,outputDir:output})).rejects.toThrow();
 await expect(fs.access(resolve(output,'recovery-receipt.json'))).rejects.toThrow();
});
