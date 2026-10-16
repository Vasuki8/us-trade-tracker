import {afterEach,expect,it,vi} from 'vitest';
import {readFile,writeFile,mkdir,readdir,lstat,link,unlink,symlink,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {countryJsonBytes,digestCountryBytes} from '../../src/lib/country-release/contract.server';
import * as fs from 'node:fs/promises';
import {readSiteFile,assertLocalPath} from '../../scripts/site-preparation-files';
import {createSiteStage,verifySiteStage,stageInformation} from '../../scripts/site-staging';
import {preparationFixture,cleanPreparationFixtures,fixtureGit,blob,preparationProductRelease} from '../helpers/site-preparation';
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
 await expect(createSiteStage({...f,outputRoot:resolve(alias,'nested')})).rejects.toThrow(/reparse|ignored-scope/);
 await expect(lstat(resolve(alias,'nested'))).rejects.toMatchObject({code:'ENOENT'});
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


it.each(['visible','external'] as const)('rejects_relocated_stage_%s',async kind=>{
 const f=await preparationFixture();await createSiteStage(f);
 const stageRoot=resolve(kind==='visible'?f.sourceRoot:f.home,'relocated-stage');
 await rename(f.outputRoot,stageRoot);
 await expect(verifySiteStage({...f,stageRoot})).rejects.toThrow(/scope|ignored/);
 expect(await readFile(resolve(stageRoot,'project/a.ts'),'utf8')).toContain('export const');
});
it('rejects_stage_that_is_no_longer_ignored',async()=>{
 const f=await preparationFixture();await createSiteStage(f);
 await writeFile(resolve(f.sourceRoot,'.gitignore'),'node_modules/\n');
 await expect(verifySiteStage({...f,stageRoot:f.outputRoot})).rejects.toThrow(/scope|ignored/);
});
it('rejects_non_symlink_windows_reparse_attribute',async()=>{
 const f=await preparationFixture(),path=resolve(f.sourceRoot,'a.ts');let inspected:string[]=[];
 const attributes=async(paths:string[])=>{inspected=paths;return paths.map(p=>p===f.sourceRoot?1024:16);};
 await expect(assertLocalPath(f.sourceRoot,path,false,attributes)).rejects.toThrow(/reparse/);
 expect(inspected).toContain(f.sourceRoot);expect(inspected).toContain(path);
});
it('fails_closed_when_windows_attribute_results_are_incomplete',async()=>{
 const f=await preparationFixture();
 await expect(assertLocalPath(f.sourceRoot,resolve(f.sourceRoot,'a.ts'),false,async()=>[])).rejects.toThrow(/attributes/);
});


const selectionPath='deployment/site-product-selection.json';
async function editSelection(f:Awaited<ReturnType<typeof preparationFixture>>,edit:(v:any)=>void){
 const path=resolve(f.sourceRoot,selectionPath),value=JSON.parse(await readFile(path,'utf8'));edit(value);
 await writeFile(path,countryJsonBytes(value));fixtureGit(f.sourceRoot,['add',selectionPath]);fixtureGit(f.sourceRoot,['commit','-qm','Edited synthetic selection']);
 f.commit=fixtureGit(f.sourceRoot,['rev-parse','HEAD']).toString().trim();
}
async function legacyStage(f:Awaited<ReturnType<typeof preparationFixture>>){
 const info=await stageInformation(f.sourceRoot,f.dataRoot,f.commit,'allow-legacy');
 await mkdir(resolve(f.outputRoot,'project'),{recursive:true});
 for(const file of [...info.sources,...info.data.files]){const path=resolve(f.outputRoot,'project',file.identity.path);await mkdir(resolve(path,'..'),{recursive:true});await writeFile(path,file.body);}
 await symlink(resolve(f.sourceRoot,'node_modules'),resolve(f.outputRoot,'project/node_modules'),process.platform==='win32'?'junction':'dir');
 await writeFile(resolve(f.outputRoot,'staging-receipt.json'),countryJsonBytes(info.receipt));return info.receipt;
}
it.each([['2026-09','2026-09'],['2026-09','2026-08']] as [string,string][])('stages_selected_successors_%s_%s_with_fixed_Canada',async(a,b)=>{
 const f=await preparationFixture({months:[a,b]}),receipt=await createSiteStage(f);
 expect(receipt.country.reporting).toEqual({from:'2024-09',to:'2026-08',latest:'2026-08'});
 expect(receipt.products[0].release.path).toContain('/'+a+'-090121.json');expect(receipt.products[1].release.path).toContain('/'+b+'-090111.json');
 expect(receipt.data).toHaveLength(7);
 for(const [path,body]of Object.entries(f.bodies)){expect(await readFile(resolve(f.outputRoot,'project',path))).toEqual(body);expect(await readFile(resolve(f.dataRoot,path))).toEqual(body);}
 expect(await verifySiteStage({...f,stageRoot:f.outputRoot})).toEqual(receipt);
});
it('creation_requires_a_committed_selection',async()=>{
 const f=await preparationFixture({legacy:true});await expect(createSiteStage(f)).rejects.toThrow(/selection/);
 await expect(lstat(resolve(f.outputRoot,'staging-receipt.json'))).rejects.toMatchObject({code:'ENOENT'});
});
it('malformed_new_selection_never_falls_back_to_legacy',async()=>{
 const f=await preparationFixture();await editSelection(f,v=>v.extra=true);
 await expect(createSiteStage(f)).rejects.toThrow(/selection/);await expect(stageInformation(f.sourceRoot,f.dataRoot,f.commit,'allow-legacy')).rejects.toThrow(/selection/);
});
it.each(['fixture','schema1','product','month','invalid-metadata','pointer'] as const)('rejects_matching_hashes_with_invalid_%s',async kind=>{
 const f=await preparationFixture(),selection=JSON.parse(await readFile(resolve(f.sourceRoot,selectionPath),'utf8')),product=selection.products[0];
 const path=kind==='pointer'?product.pointer.path:product.release.path;
 const value=JSON.parse(await readFile(resolve(f.dataRoot,path),'utf8'));
 if(kind==='fixture')value.source='fixture';
 if(kind==='schema1'){value.schemaVersion=1;delete value.duties;}
 if(kind==='product')value.productCode='090111';
 if(kind==='month')value.reportingMonth='2026-09';
 if(kind==='invalid-metadata')value.retrievedAt='invalid';
 if(kind==='pointer')value.releaseFile='releases/2026-08-different.json';
 const body=countryJsonBytes(value);await writeFile(resolve(f.dataRoot,path),body);
 await editSelection(f,v=>Object.assign(kind==='pointer'?v.products[0].pointer:v.products[0].release,digestCountryBytes(body)));
 await expect(createSiteStage(f)).rejects.toThrow();await expect(lstat(resolve(f.outputRoot,'staging-receipt.json'))).rejects.toMatchObject({code:'ENOENT'});
});
it('readback_uses_committed_selection_not_working_copy_or_data_root',async()=>{
 const f=await preparationFixture(),receipt=await createSiteStage(f);
 await writeFile(resolve(f.sourceRoot,selectionPath),'malformed mutable replacement');
 await mkdir(resolve(f.dataRoot,'deployment'));await writeFile(resolve(f.dataRoot,selectionPath),'{}');
 expect(await verifySiteStage({...f,stageRoot:f.outputRoot})).toEqual(receipt);
 await expect(createSiteStage({...f,outputRoot:resolve(f.sourceRoot,'.tmp/second')})).rejects.toThrow(/clean/);
});
it('rejects_changed_staged_selection_even_when_original_working_copy_matches_it',async()=>{
 const f=await preparationFixture();await createSiteStage(f);
 for(const root of [f.sourceRoot,resolve(f.outputRoot,'project')])await writeFile(resolve(root,selectionPath),'{}');
 await expect(verifySiteStage({...f,stageRoot:f.outputRoot})).rejects.toThrow();
});
it('rejects_second_read_data_mutation_without_success_receipt',async()=>{
 const f=await preparationFixture(),path=resolve(f.dataRoot,'data/processed/current.json');let reads=0;
 vi.mocked(fs.open).mockImplementation(async(...args)=>{if(resolve(String(args[0]))===path&&++reads===2)await writeFile(path,'changed');return originalOpen(...args);});
 await expect(createSiteStage(f)).rejects.toThrow();expect(reads).toBe(2);
 await expect(lstat(resolve(f.outputRoot,'staging-receipt.json'))).rejects.toMatchObject({code:'ENOENT'});
});
it('verifies_an_old_receipt_only_with_exact_historical_pins',async()=>{
 const f=await preparationFixture({legacy:true}),receipt=await legacyStage(f);
 expect(await verifySiteStage({...f,stageRoot:f.outputRoot})).toEqual(receipt);
 await writeFile(resolve(f.dataRoot,receipt.products[0].release.path),preparationProductRelease('090121','2026-09'));
 await expect(verifySiteStage({...f,stageRoot:f.outputRoot})).rejects.toThrow();
});
it('legacy_readback_rejects_successor_paths_even_if_protected_hashes_match',async()=>{
 const f=await preparationFixture({legacy:true,months:['2026-09','2026-09']});
 await expect(stageInformation(f.sourceRoot,f.dataRoot,f.commit,'allow-legacy')).rejects.toThrow(/pointer/);
});
