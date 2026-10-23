import {windowsIntegrationTimeoutMs} from '../helpers/windows-integration-timeout';
import {afterEach,expect,it,vi} from 'vitest';
import {readFile,writeFile,mkdir,lstat,link,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import * as fs from 'node:fs/promises';
import {createSiteStage} from '../../scripts/site-staging';
import {prepareSite} from '../../scripts/site-assembly';
import {preparationFixture,cleanPreparationFixtures} from '../helpers/site-preparation';
vi.mock('../../src/lib/country-preview/pilot-load.server',()=>({loadCanadaPilot:vi.fn()}));
vi.mock('node:fs/promises',async importOriginal=>{const actual=await importOriginal<typeof import('node:fs/promises')>();return{...actual,readdir:vi.fn(actual.readdir)};});
const originalReaddir=vi.mocked(fs.readdir).getMockImplementation()!;
afterEach(async()=>{vi.mocked(fs.readdir).mockImplementation(originalReaddir);await cleanPreparationFixtures();});
async function setup(){
 const f=await preparationFixture();await createSiteStage(f);const buildRoot=resolve(f.outputRoot,'real-dist'),outputRoot=resolve(f.outputRoot,'packages');
 await mkdir(buildRoot);await mkdir(resolve(buildRoot,'_astro'));await writeFile(resolve(buildRoot,'index.html'),'<!doctype html><title>Prepared local test</title>');
 await writeFile(resolve(buildRoot,'_astro/app.js'),'if(kind==="fixture")warn("Development sample data");');
 return{...f,stageRoot:f.outputRoot,buildRoot,outputRoot};
}
it('assembles_site_controls_from_git_templates',async()=>{
 const f=await setup(),r=await prepareSite(f),m=JSON.parse(await readFile(resolve(f.outputRoot,'site-manifest.json'),'utf8'));
 expect(r.status).toBe('prepared-for-owner-deployment-review');expect(m.codeCommit).toBe(f.commit);expect(m.schemaVersion).toBe(1);expect(m.packageKind).toBe('site');
 expect(m.files.map((v:any)=>v.path)).toEqual(['_astro/app.js','_headers','404.html','index.html']);expect(m.fileCount).toBe(4);
 expect(m.totalBytes).toBe(m.files.reduce((n:number,v:any)=>n+v.bytes,0));expect(m.largestFile.path).toBe('404.html');
 for(const s of m.sourceTemplates)expect(s.gitBlob).toMatch(/^[a-f0-9]{40}$/);
 expect(await readFile(resolve(f.outputRoot,'site/_headers'))).toEqual(f.templates['deployment/pages/_headers']);
 expect(m.products.map((v:any)=>v.path)).toEqual(['data/processed/current.json','data/processed/releases/2026-08-090121.json','data/products/090111/processed/current.json','data/products/090111/processed/releases/2026-08-090111.json','data/products/090240/processed/current.json','data/products/090240/processed/releases/2026-08-090240.json','data/products/180100/processed/current.json','data/products/180100/processed/releases/2026-08-180100.json']);
},windowsIntegrationTimeoutMs);
it('withdrawal_has_exact_three_entries',async()=>{
 const f=await setup();await prepareSite(f);const m=JSON.parse(await readFile(resolve(f.outputRoot,'withdrawal-manifest.json'),'utf8'));
 expect(m.files.map((v:any)=>v.path)).toEqual(['_headers','404.html','index.html']);expect(m.fileCount).toBe(3);expect(m.country).toBeUndefined();expect(m.products).toBeUndefined();
 expect(m.sourceTemplates.map((v:any)=>v.sourcePath).sort()).toEqual(['deployment/pages/_headers','deployment/pages/withdrawal/404.html','deployment/pages/withdrawal/index.html'].sort());
 expect((await readFile(resolve(f.outputRoot,'withdrawal/index.html'),'utf8'))).toContain('Pilot temporarily unavailable');
},windowsIntegrationTimeoutMs);
it.each(['template','private-path','private-body'] as const)('rejects_changed_templates_and_private_output_%s',async kind=>{
 const f=await setup();
 if(kind==='template')await writeFile(resolve(f.stageRoot,'project/deployment/pages/_headers'),'bad');
 if(kind==='private-path'){await mkdir(resolve(f.buildRoot,'preview'));await writeFile(resolve(f.buildRoot,'preview/index.html'),'private');}
 if(kind==='private-body')await writeFile(resolve(f.buildRoot,'index.html'),'private?X-Amz-Signature=redacted-unit-fixture');
 await expect(prepareSite(f)).rejects.toThrow();await expect(lstat(resolve(f.outputRoot,'preparation-receipt.json'))).rejects.toMatchObject({code:'ENOENT'});
},windowsIntegrationTimeoutMs);
it('rejects_rendered_fixture_data_while_client_guard_literals_are_allowed',async()=>{
 const f=await setup();await writeFile(resolve(f.buildRoot,'index.html'),'Development sample data');
 await expect(prepareSite(f)).rejects.toThrow(/fixture/);
},windowsIntegrationTimeoutMs);
it.each(['occupied','case','oversize','source-map','hardlink','wrong-build','missing-home'] as const)('refuses_collisions_limits_and_occupied_output_%s',async kind=>{
 const f=await setup();
 if(kind==='occupied'){await mkdir(f.outputRoot);await writeFile(resolve(f.outputRoot,'keep.txt'),'keep');}
 if(kind==='case'){await writeFile(resolve(f.buildRoot,'A.html'),'a');await writeFile(resolve(f.buildRoot,'a.html'),'a');if(process.platform==='win32')vi.mocked(fs.readdir).mockImplementation(async(...args)=>{const entries=await originalReaddir(...args) as any[];if(String(args[0])===f.buildRoot){const entry=entries.find(v=>v.name==='A.html');return [...entries,Object.assign(Object.create(Object.getPrototypeOf(entry)),entry,{name:'a.html'})] as any;}return entries as any;});}
 if(kind==='oversize'){const fs=await import('node:fs/promises'),handle=await fs.open(resolve(f.buildRoot,'large.js'),'w');await handle.truncate(26214401);await handle.close();}
 if(kind==='source-map')await writeFile(resolve(f.buildRoot,'_astro/app.js.map'),'{}');
 if(kind==='hardlink')await link(resolve(f.buildRoot,'index.html'),resolve(f.stageRoot,'linked.html'));
 if(kind==='wrong-build')f.buildRoot=f.stageRoot;
 if(kind==='missing-home'){const fs=await import('node:fs/promises');await fs.unlink(resolve(f.buildRoot,'index.html'));}
 await expect(prepareSite(f)).rejects.toThrow();if(kind==='occupied')expect(await readFile(resolve(f.outputRoot,'keep.txt'),'utf8')).toBe('keep');
},windowsIntegrationTimeoutMs);

it('rejects_1001_entries_including_both_site_controls',async()=>{
 const f=await setup();for(let i=0;i<997;i++)await writeFile(resolve(f.buildRoot,'p'+i+'.html'),'x');
 await expect(prepareSite(f)).rejects.toThrow(/file-count-limit/);
 await expect(lstat(resolve(f.outputRoot,'preparation-receipt.json'))).rejects.toMatchObject({code:'ENOENT'});
},30000);


it('rejects_relocated_stage_before_assembly_output',async()=>{
 const f=await setup(),stageRoot=resolve(f.home,'relocated-stage');await rename(f.stageRoot,stageRoot);
 const outputRoot=resolve(stageRoot,'packages');
 await expect(prepareSite({...f,stageRoot,buildRoot:resolve(stageRoot,'real-dist'),outputRoot})).rejects.toThrow(/scope|ignored/);
 await expect(lstat(outputRoot)).rejects.toMatchObject({code:'ENOENT'});
},windowsIntegrationTimeoutMs);
