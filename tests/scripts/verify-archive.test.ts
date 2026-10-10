import {afterAll,beforeAll,expect,it} from 'vitest';
import {mkdtemp,readFile,rm,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {verifyArchive} from '../../scripts/verify-archive';
import {packBundle,encodePointer,sha256} from '../../scripts/archive-bundle';
import {productArchiveKeys,productDataPaths} from '../../scripts/product-paths';
import {createProductArchiveFixture} from '../helpers/product-data';
import {MemoryArchiveStore} from '../helpers/archive-store';
import {parse} from 'yaml';
const dirs:string[]=[],fixtures=new Map<string,Awaited<ReturnType<typeof createProductArchiveFixture>>>();
beforeAll(async()=>{for(const code of ['090121','090111']){const fixture=await createProductArchiveFixture(code,{duties:true});dirs.push(fixture.dataDir);fixtures.set(code,fixture);}},20_000);
afterAll(async()=>{for(const directory of dirs)await rm(directory,{recursive:true,force:true});});
async function workspace(){const root=await mkdtemp(join(tmpdir(),'archive-verification-'));dirs.push(root);return root;}
const env={GITHUB_REF:'refs/heads/main'};
function accepted(code:string){const store=new MemoryArchiveStore(),bundle=packBundle(fixtures.get(code)!.input,code);store.seed(productArchiveKeys(code).currentKey,encodePointer(bundle.reference,code));store.seed(bundle.reference.key,bundle.bytes);return {store,bundle};}

it.each(['090121','090111'])('restores the selected %s archive and records its exact source identity without writes',async code=>{
  const root=await workspace(),{store,bundle}=accepted(code),before=Buffer.from(store.objects.get(productArchiveKeys(code).currentKey)!.bytes),gets:string[]=[];
  store.beforeGet=key=>gets.push(key);
  const result=await verifyArchive({productCode:code,reportingMonth:'2026-08',workspaceRoot:root},env,()=>store);
  expect(result).toMatchObject({schemaVersion:1,status:'verified',productCode:code,reportingMonth:'2026-08',codeVersion:'synthetic-product-fixture',archive:{reference:bundle.reference,releaseId:fixtures.get(code)!.input.releaseId,releaseSha256:sha256(fixtures.get(code)!.input.releaseBytes)},dutyFromMonth:'2024-09'});
  expect(result.dutyObservations).toBeGreaterThan(0);
  expect(gets).toEqual([productArchiveKeys(code).currentKey,bundle.reference.key]);expect(store.puts).toHaveLength(0);expect(store.objects.get(productArchiveKeys(code).currentKey)!.bytes).toEqual(before);
  const pointer=JSON.parse(await readFile(join(productDataPaths(root,code).processedDir,'current.json'),'utf8'));
  expect(await readFile(join(productDataPaths(root,code).processedDir,pointer.releaseFile))).toEqual(fixtures.get(code)!.input.releaseBytes);
  expect(JSON.parse(await readFile(join(root,'.tmp/archive-verification/verification.json'),'utf8'))).toEqual(result);
});

it('verifies the existing merchandise-only archive format with duties explicitly unavailable',async()=>{
  const fixture=await createProductArchiveFixture('090121');dirs.push(fixture.dataDir);const root=await workspace(),store=new MemoryArchiveStore(),bundle=packBundle(fixture.input);
  store.seed(productArchiveKeys('090121').currentKey,encodePointer(bundle.reference));store.seed(bundle.reference.key,bundle.bytes);
  const result=await verifyArchive({productCode:'090121',reportingMonth:'2026-08',workspaceRoot:root},env,()=>store);
  expect(result).toMatchObject({status:'verified',dutyObservations:0,dutyFromMonth:null});expect(result.merchandiseObservations).toBeGreaterThan(0);expect(store.puts).toHaveLength(0);
});

it('refuses an absent archive instead of initializing it, even with initialization in inherited environment',async()=>{
  const root=await workspace(),store=new MemoryArchiveStore();
  await expect(verifyArchive({productCode:'090111',reportingMonth:'2026-08',workspaceRoot:root},{...env,INITIALIZE_ARCHIVE:'true'},()=>store)).rejects.toThrow(/absent/);
  expect(store.puts).toHaveLength(0);await expect(stat(join(root,'.tmp/archive-verification/verification.json'))).rejects.toThrow();
});

it('withholds a success receipt when the accepted reporting month differs from the requested month',async()=>{
  const root=await workspace(),{store}=accepted('090111');
  await expect(verifyArchive({productCode:'090111',reportingMonth:'2026-09',workspaceRoot:root},env,()=>store)).rejects.toThrow(/reporting month/);
  expect(store.puts).toHaveLength(0);await expect(stat(join(root,'.tmp/archive-verification/verification.json'))).rejects.toThrow();
});

it('rejects a cross-product pointer before writing recovered data or a success receipt',async()=>{
  const root=await workspace(),{store,bundle}=accepted('090121');store.seed(productArchiveKeys('090111').currentKey,encodePointer(bundle.reference,'090121'));
  await expect(verifyArchive({productCode:'090111',reportingMonth:'2026-08',workspaceRoot:root},env,()=>store)).rejects.toThrow();
  expect(store.puts).toHaveLength(0);await expect(stat(join(productDataPaths(root,'090111').processedDir,'current.json'))).rejects.toThrow();
});

it.each([
  {productCode:'090111',reportingMonth:'2026-08',ref:'refs/heads/feature'},
  {productCode:'999999',reportingMonth:'2026-08',ref:'refs/heads/main'},
  {productCode:'090111',reportingMonth:'invalid',ref:'refs/heads/main'},
])('rejects invalid dispatch before creating transport: %j',async input=>{
  const root=await workspace();let calls=0;
  await expect(verifyArchive({...input,workspaceRoot:root},{GITHUB_REF:input.ref},()=>{calls++;throw new Error('Unexpected provider');})).rejects.toThrow();
  expect(calls).toBe(0);await expect(stat(join(root,'.tmp/archive-verification'))).rejects.toThrow();
});

it('keeps hosted recovery manual and serialized, with credentials limited to restoration and product-scoped evidence',async()=>{
  const w=parse(await readFile('.github/workflows/verify-archive.yml','utf8')),job=w.jobs.verify,steps=job.steps as any[];
  expect(Object.keys(w.on)).toEqual(['workflow_dispatch']);expect(Object.keys(w.on.workflow_dispatch.inputs).sort()).toEqual(['product_code','reporting_month']);
  expect(w.permissions).toEqual({contents:'read'});expect(w.concurrency).toEqual({group:'census-data-import','cancel-in-progress':false});expect(job.if).toBe("github.ref == 'refs/heads/main'");
  expect(job.env.INITIALIZE_ARCHIVE).toBe('false');expect(job['timeout-minutes']).toBe(10);
  for(const step of steps){
    const keys=Object.keys(step.env??{}).filter(key=>key.includes('KEY'));expect(keys.sort()).toEqual(step.id==='restore'?['R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY']:[]);
    if(step.run)expect(step.run).not.toContain('${{');
    if(step.uses)expect(step.uses).toMatch(/^actions\/(checkout|setup-node|upload-artifact)@[a-f0-9]{40}$/);
  }
  const restored=steps.find(step=>step.with?.name==='census-${{ steps.preflight.outputs.product_code }}-restored');
  expect(restored.with.path.trim().split('\n')).toEqual(['${{ steps.preflight.outputs.processed_dir }}/current.json','${{ steps.preflight.outputs.processed_dir }}/releases/*.json','${{ steps.preflight.outputs.data_dir }}/raw/**/*.json']);
  expect(steps.find(step=>step.with?.name==='census-${{ steps.preflight.outputs.product_code }}-verification').with).toMatchObject({'include-hidden-files':true,'if-no-files-found':'error','retention-days':7});
});
