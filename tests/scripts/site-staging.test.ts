import {afterEach,expect,it,vi} from 'vitest';
import {readFile,writeFile,mkdir,readdir,lstat,link,unlink,symlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import * as fs from 'node:fs/promises';
import {readSiteFile} from '../../scripts/site-preparation-files';
import {createSiteStage,verifySiteStage} from '../../scripts/site-staging';
import {preparationFixture,cleanPreparationFixtures,fixtureGit,blob} from '../helpers/site-preparation';
vi.mock('../../src/lib/country-preview/pilot-load.server',()=>({loadCanadaPilot:vi.fn()}));
vi.mock('node:fs/promises',async importOriginal=>{const actual=await importOriginal<typeof import('node:fs/promises')>();return{...actual,open:vi.fn(actual.open)};});
const originalOpen=vi.mocked(fs.open).getMockImplementation()!;
afterEach(async()=>{vi.mocked(fs.open).mockImplementation(originalOpen);await cleanPreparationFixtures();});
it('exports_requested_clean_head',async()=>{
 const f=await preparationFixture(),receipt=await createSiteStage(f);
 expect(receipt.codeCommit).toBe(f.commit);expect(receipt.status).toBe('staged-for-local-build');
 const expected=fixtureGit(f.sourceRoot,['ls-files','-z']).toString().split('\0').filter(Boolean);
 expect(receipt.sources.map(s=>s.path).sort()).toEqual(expected.sort());
 for(const item of receipt.sources){const body=await readFile(resolve(f.outputRoot,'project',item.path));expect(blob(body)).toBe(item.gitBlob);}
 expect((await lstat(resolve(f.outputRoot,'project/node_modules'))).isSymbolicLink()).toBe(true);
 expect(receipt.runtime.dependencyMode).toBe('shared-existing');expect(receipt.runtime.nodeMajor).toBe(24);
});
it('stages_only_seven_named_inputs',async()=>{
 const f=await preparationFixture();await mkdir(resolve(f.dataRoot,'data/backups'),{recursive:true});await writeFile(resolve(f.dataRoot,'.env'),'PRIVATE_DO_NOT_COPY');
 const receipt=await createSiteStage(f);
 expect(receipt.data).toHaveLength(7);expect(receipt.data.map(d=>d.path).sort()).toEqual(Object.keys(f.bodies).sort());
 expect(receipt.products.map(p=>p.code)).toEqual(['090121','090111']);
 for(const [path,body]of Object.entries(f.bodies)){expect(await readFile(resolve(f.outputRoot,'project',path))).toEqual(body);expect(await readFile(resolve(f.dataRoot,path))).toEqual(body);}
 expect(await readdir(f.outputRoot)).toEqual(expect.arrayContaining(['project','staging-receipt.json']));
 await expect(lstat(resolve(f.outputRoot,'project/.env'))).rejects.toMatchObject({code:'ENOENT'});
 await expect(lstat(resolve(f.outputRoot,'project/data/backups'))).rejects.toMatchObject({code:'ENOENT'});
});
it('refuses_dirty_or_crossed_commit',async()=>{
 const f=await preparationFixture();await writeFile(resolve(f.sourceRoot,'a.ts'),'changed');
 await expect(createSiteStage(f)).rejects.toThrow(/clean/);await expect(lstat(f.outputRoot)).rejects.toMatchObject({code:'ENOENT'});
 fixtureGit(f.sourceRoot,['checkout','--','a.ts']);
 await expect(createSiteStage({...f,commit:'0'.repeat(40)})).rejects.toThrow(/commit/);
});
it('refuses_occupied_or_escaped_output',async()=>{
 const f=await preparationFixture();await mkdir(f.outputRoot);await writeFile(resolve(f.outputRoot,'keep.txt'),'keep');
 await expect(createSiteStage(f)).rejects.toThrow(/occupied/i);expect(await readFile(resolve(f.outputRoot,'keep.txt'),'utf8')).toBe('keep');
 await expect(createSiteStage({...f,outputRoot:resolve(f.sourceRoot,'../../escape')})).rejects.toThrow(/output|scope|ignored/i);
});
it('rejects_changed_original_state_without_a_success_receipt',async()=>{
 const f=await preparationFixture(),path=Object.keys(f.bodies).find(p=>p.startsWith('data/processed/releases/'))!;
 await writeFile(resolve(f.dataRoot,path),'changed');
 await expect(createSiteStage(f)).rejects.toThrow();await expect(lstat(resolve(f.outputRoot,'staging-receipt.json'))).rejects.toMatchObject({code:'ENOENT'});
});

it('refuses_hardlinked_working_source_without_copying_it',async()=>{
 const f=await preparationFixture();await link(resolve(f.sourceRoot,'a.ts'),resolve(f.sourceRoot,'.tmp/linked-source'));
 await expect(createSiteStage(f)).rejects.toThrow(/source|file|link/);
 await expect(lstat(resolve(f.outputRoot,'staging-receipt.json'))).rejects.toMatchObject({code:'ENOENT'});
});

it('readbacks_complete_stage_and_permitted_build_cache',async()=>{
 const f=await preparationFixture(),receipt=await createSiteStage(f);await mkdir(resolve(f.outputRoot,'project/.astro'));await writeFile(resolve(f.outputRoot,'project/.astro/cache.json'),'{}');
 expect(await verifySiteStage({...f,stageRoot:f.outputRoot})).toEqual(receipt);
});
it.each(['missing','changed','forged','original'] as const)('rejects_missing_changed_or_forged_stage_%s',async kind=>{
 const f=await preparationFixture();await createSiteStage(f);
 if(kind==='missing')await unlink(resolve(f.outputRoot,'project/a.ts'));
 if(kind==='changed')await writeFile(resolve(f.outputRoot,'project/a.ts'),'changed');
 if(kind==='original')await writeFile(resolve(f.dataRoot,'data/processed/current.json'),'changed');
 if(kind==='forged'){const p=resolve(f.outputRoot,'staging-receipt.json'),v=JSON.parse(await readFile(p,'utf8'));v.products[0].code='999999';await writeFile(p,JSON.stringify(v)+'\n');}
 await expect(verifySiteStage({...f,stageRoot:f.outputRoot})).rejects.toThrow();
});
it('rejects_unexpected_stage_file',async()=>{
 const f=await preparationFixture();await createSiteStage(f);await writeFile(resolve(f.outputRoot,'project/proof.json'),'private');
 await expect(verifySiteStage({...f,stageRoot:f.outputRoot})).rejects.toThrow(/unexpected/);
});
it('dependency_exception_is_one_bound_link',async()=>{
 const f=await preparationFixture();await createSiteStage(f);const runtime=resolve(f.outputRoot,'project/node_modules');
 await unlink(runtime);await symlink(f.dataRoot,runtime,process.platform==='win32'?'junction':'dir');
 await expect(verifySiteStage({...f,stageRoot:f.outputRoot})).rejects.toThrow(/runtime|dependency/);
 await unlink(runtime);await symlink(resolve(f.sourceRoot,'node_modules'),runtime,process.platform==='win32'?'junction':'dir');
 const alias=resolve(f.outputRoot,'project/other-link');await symlink(f.dataRoot,alias,process.platform==='win32'?'junction':'dir');
 await expect(verifySiteStage({...f,stageRoot:f.outputRoot})).rejects.toThrow(/reparse/);
});
it('rejects_input_output_reparse_ancestors_and_hardlinked_stage',async()=>{
 const f=await preparationFixture();const alias=resolve(f.sourceRoot,'.tmp/alias');await symlink(f.dataRoot,alias,process.platform==='win32'?'junction':'dir');
 await expect(createSiteStage({...f,outputRoot:resolve(alias,'nested')})).rejects.toThrow(/reparse/);
 await expect(createSiteStage({...f,dataRoot:alias})).rejects.toThrow(/reparse/);
 await createSiteStage(f);await link(resolve(f.outputRoot,'project/a.ts'),resolve(f.sourceRoot,'.tmp/linked-copy'));
 await expect(verifySiteStage({...f,stageRoot:f.outputRoot})).rejects.toThrow(/type|length/);
});
it('metadata_changes_during_read_fail_but_domains_may_differ',async()=>{
 const f=await preparationFixture(),path=resolve(f.sourceRoot,'a.ts');let changing=false;
 vi.mocked(fs.open).mockImplementation(async(...args)=>{
  const handle=await originalOpen(...args),original=handle.stat.bind(handle);let calls=0;
  vi.spyOn(handle,'stat').mockImplementation(async(...statArgs:any[])=>{const value=await original(...statArgs as []);calls++;return Object.assign(Object.create(Object.getPrototypeOf(value)),value,{ctimeMs:Number(value.ctimeMs)+1000+(changing&&calls===2?1000:0)});});return handle;
 });
 expect((await readSiteFile(f.sourceRoot,path)).toString()).toContain('export const');
 changing=true;await expect(readSiteFile(f.sourceRoot,path)).rejects.toThrow(/changed-during/);
});

