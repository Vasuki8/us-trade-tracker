import {afterAll,beforeAll,expect,it} from 'vitest';
import {mkdir,mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {createArchiveFixture,syntheticCensusFetch} from '../helpers/archive';
import {MemoryArchiveStore} from '../helpers/archive-store';
import {ArchiveStoreError} from '../../scripts/archive-store';
import {packBundle,unpackBundle,encodePointer,sha256,CURRENT_KEY} from '../../scripts/archive-bundle';
import {restoreForImport,stageCandidate,promoteCandidate,recoverBundle,parseRunState,parseCandidateState,buildLocalBundle,decodeCandidateBundle,type ArchiveContext} from '../../scripts/archive-release';
import {prepareRelease,readCurrentRelease} from '../../scripts/prepare-release';
let fixture:Awaited<ReturnType<typeof createArchiveFixture>>;const dirs:string[]=[];
beforeAll(async()=>{fixture=await createArchiveFixture();});
afterAll(async()=>{if(fixture)dirs.push(fixture.dataDir);for(const dir of dirs)await rm(dir,{recursive:true,force:true});});
const receipt={artifactId:'1234',artifactDigest:'e'.repeat(64)};
async function context(initial=true){
  const root=await mkdtemp(join(tmpdir(),'trade-protocol-test-'));dirs.push(root);
  const store=new MemoryArchiveStore();const baseline=packBundle(fixture.input);const pointer=encodePointer(baseline.reference);
  if(initial){store.seed(baseline.reference.key,baseline.bytes);store.seed(CURRENT_KEY,pointer);}
  const ctx:ArchiveContext={store,dataDir:join(root,'data'),runDir:join(root,'run')};return {ctx,store,baseline,pointer};
}
async function candidate(initial=true){
  const c=await context(initial);const run=await restoreForImport(c.ctx,{reportingMonth:'2026-08',initialize:!initial});
  await prepareRelease({productCode:'090121',end:'2026-08',months:60,apiKey:'synthetic',outputDir:join(c.ctx.dataDir,'processed'),codeVersion:'synthetic-next'},syntheticCensusFetch({worldDelta:100}));
  const staged=await stageCandidate(c.ctx,run);return {...c,run,staged};
}
const unchanged=(store:MemoryArchiveStore,pointer:Buffer)=>expect(store.objects.get(CURRENT_KEY)!.bytes.equals(pointer)).toBe(true);
it('restores the exact baseline on a fresh runner and recomputes same-month revisions against it',async()=>{
  const c=await context();const run=await restoreForImport(c.ctx,{reportingMonth:'2026-08',initialize:false});
  expect(await readCurrentRelease(join(c.ctx.dataDir,'processed'))).toEqual(JSON.parse(fixture.input.releaseBytes.toString()));
  expect(run.baseline?.reference).toEqual(c.baseline.reference);
  await prepareRelease({productCode:'090121',end:'2026-08',months:60,apiKey:'synthetic',outputDir:join(c.ctx.dataDir,'processed'),codeVersion:'next'},syntheticCensusFetch({partner204:true}));
  const staged=await stageCandidate(c.ctx,run);const d=unpackBundle(c.store.objects.get(staged.reference.key)!.bytes,staged.reference.sha256);
  expect(d.manifest.previous).toEqual(c.baseline.reference);expect(d.release.revisedKeys).toHaveLength(180);expect(d.release.revisedKeys).toContain('imports/090121/2026-08/country/1220/GEN_VAL_MO');unchanged(c.store,c.pointer);
});
it('restores beside tracked classification evidence in a fresh checkout without overwriting it',async()=>{
  const c=await context();const evidence=join(c.ctx.dataDir,'classification/090121.json');await mkdir(join(c.ctx.dataDir,'classification'),{recursive:true});await writeFile(evidence,'tracked evidence');
  await restoreForImport(c.ctx,{reportingMonth:'2026-08',initialize:false});expect(await readFile(evidence,'utf8')).toBe('tracked evidence');expect(await readCurrentRelease(join(c.ctx.dataDir,'processed'))).toEqual(JSON.parse(fixture.input.releaseBytes.toString()));
});
it.each(['absent','existing-init','missing-bundle','corrupt-bundle','older-month'])('rejects %s before altering current acceptance',async(kind)=>{
  const c=await context(kind!=='absent');if(kind==='missing-bundle')c.store.objects.delete(c.baseline.reference.key);if(kind==='corrupt-bundle')c.store.seed(c.baseline.reference.key,Buffer.from('{}'));
  await expect(restoreForImport(c.ctx,{reportingMonth:kind==='older-month'?'2026-07':'2026-08',initialize:kind==='existing-init'})).rejects.toThrow();
  if(kind==='absent')expect(c.store.objects.has(CURRENT_KEY)).toBe(false);else unchanged(c.store,c.pointer);
});
it('requires empty revisions at initialization and a valid backup receipt before promotion',async()=>{
  const c=await candidate(false);expect(c.run.baseline).toBeNull();
  for(const invalid of [{artifactId:'',artifactDigest:''},{artifactId:'-1',artifactDigest:'e'.repeat(64)},{artifactId:'1',artifactDigest:'bad'}])await expect(promoteCandidate(c.ctx,c.staged,invalid)).rejects.toThrow();
  expect(c.store.pointerPutCalls).toBe(0);expect((await promoteCandidate(c.ctx,c.staged,receipt)).status).toBe('acknowledged');
});
it('rejects a changed restored immutable baseline before candidate upload',async()=>{
  const c=await context();const run=await restoreForImport(c.ctx,{reportingMonth:'2026-08',initialize:false});
  await prepareRelease({productCode:'090121',end:'2026-08',months:60,apiKey:'synthetic',outputDir:join(c.ctx.dataDir,'processed'),codeVersion:'next'},syntheticCensusFetch());
  await writeFile(join(c.ctx.dataDir,'processed/releases',`${run.baseline!.releaseId}.json`),'{}');await expect(stageCandidate(c.ctx,run)).rejects.toThrow();expect(c.store.puts).toHaveLength(0);unchanged(c.store,c.pointer);
});
it('preserves a competing writer with the original ETag precondition',async()=>{
  const c=await candidate();const foreign=Buffer.from('foreign pointer');c.store.seed(CURRENT_KEY,foreign);
  expect((await promoteCandidate(c.ctx,c.staged,receipt)).status).toBe('conflict');expect(c.store.objects.get(CURRENT_KEY)!.bytes).toEqual(foreign);expect(c.store.pointerPutCalls).toBe(1);
});
it('accepts an immutable upload lost response only after identical readback',async()=>{
  const c=await context(false);const run=await restoreForImport(c.ctx,{reportingMonth:'2026-08',initialize:true});
  await prepareRelease({productCode:'090121',end:'2026-08',months:60,apiKey:'synthetic',outputDir:join(c.ctx.dataDir,'processed'),codeVersion:'next'},syntheticCensusFetch());
  c.store.afterPut=()=>{throw new ArchiveStoreError('unconfirmed_write');};expect(await stageCandidate(c.ctx,run)).toHaveProperty('reference');expect(c.store.objects.has(CURRENT_KEY)).toBe(false);
});
it.each(['exact','different','unreadable'])('resolves a lost pointer response with %s readback',async(kind)=>{
  const c=await candidate();c.store.afterPut=key=>{if(key===CURRENT_KEY){if(kind==='different')c.store.seed(key,c.pointer);if(kind==='unreadable')c.store.beforeGet=()=>{throw new ArchiveStoreError('read_failed');};throw new ArchiveStoreError('unconfirmed_write');}};
  expect((await promoteCandidate(c.ctx,c.staged,receipt)).status).toBe(kind==='exact'?'confirmed_by_readback':'unconfirmed');expect(c.store.pointerPutCalls).toBe(1);
});
it('returns acknowledged success without relying on a later readable pointer',async()=>{
  const c=await candidate();c.store.beforeGet=key=>{if(key===CURRENT_KEY)throw new ArchiveStoreError('read_failed');};expect((await promoteCandidate(c.ctx,c.staged,receipt)).status).toBe('acknowledged');
});
it.each(['acknowledged','confirmed_by_readback'] as const)('preserves the %s outcome when local receipt persistence fails',async(status)=>{
  const c=await candidate();await mkdir(join(c.ctx.runDir,'outcome.json'));
  if(status==='confirmed_by_readback')c.store.afterPut=key=>{if(key===CURRENT_KEY)throw new ArchiveStoreError('unconfirmed_write');};
  await expect(promoteCandidate(c.ctx,c.staged,receipt)).rejects.toMatchObject({outcome:{status,reference:c.staged.reference}});
  expect(c.store.objects.get(CURRENT_KEY)!.bytes.equals(encodePointer(c.staged.reference))).toBe(true);expect(c.store.pointerPutCalls).toBe(1);
});
it('recovers a selected checksum-verified backup only into an empty destination',async()=>{
  const c=await candidate();const target=join(c.ctx.runDir,'recovery');const bundle=join(c.ctx.runDir,'bundle.json');
  await expect(recoverBundle(bundle,'a'.repeat(64),target)).rejects.toThrow();
  await recoverBundle(bundle,c.staged.reference.sha256,target);expect(await readCurrentRelease(join(target,'processed'))).toEqual(unpackBundle(await readFile(bundle),c.staged.reference.sha256).release);
  await expect(recoverBundle(bundle,c.staged.reference.sha256,target)).rejects.toThrow();unchanged(c.store,c.pointer);
});
it('rejects malformed saved state and identities',()=>{
  expect(()=>parseRunState({schemaVersion:1,reportingMonth:'2026-13',baseline:null})).toThrow();
  expect(()=>parseCandidateState({schemaVersion:1,run:{schemaVersion:1,reportingMonth:'2026-08',baseline:null},reference:{key:'outside',sha256:'a'.repeat(64)},bundleFile:'../private'})).toThrow();
});
it.each(['collision','corrupt-readback','failed-upload'])('rejects immutable %s without changing acceptance',async(kind)=>{
  const c=await context();const run=await restoreForImport(c.ctx,{reportingMonth:'2026-08',initialize:false});
  await prepareRelease({productCode:'090121',end:'2026-08',months:60,apiKey:'synthetic',outputDir:join(c.ctx.dataDir,'processed'),codeVersion:'next'},syntheticCensusFetch());
  const pkg=await buildLocalBundle(c.ctx.dataDir,run.baseline);
  if(kind==='collision')c.store.seed(pkg.reference.key,Buffer.from('{}'));
  else c.store.afterPut=key=>{if(kind==='corrupt-readback')c.store.seed(key,Buffer.from('{}'));else throw new ArchiveStoreError('write_failed');};
  await expect(stageCandidate(c.ctx,run)).rejects.toThrow();unchanged(c.store,c.pointer);expect(c.store.pointerPutCalls).toBe(0);
});
it.each([true,false])('rejects forged revision metadata with accepted baseline=%s',async(initial)=>{
  const c=await context(initial);const run=await restoreForImport(c.ctx,{reportingMonth:'2026-08',initialize:!initial});
  await prepareRelease({productCode:'090121',end:'2026-08',months:60,apiKey:'synthetic',outputDir:join(c.ctx.dataDir,'processed'),codeVersion:'next'},syntheticCensusFetch());
  const pointer=JSON.parse(await readFile(join(c.ctx.dataDir,'processed/current.json'),'utf8'));const path=join(c.ctx.dataDir,'processed',pointer.releaseFile);
  const release=JSON.parse(await readFile(path,'utf8'));release.revisedKeys=['imports/090121/2026-08/world/-/GEN_VAL_MO'];await writeFile(path,JSON.stringify(release));
  await expect(stageCandidate(c.ctx,run)).rejects.toThrow(/revisions/);expect(c.store.puts).toHaveLength(0);if(initial)unchanged(c.store,c.pointer);else expect(c.store.objects.has(CURRENT_KEY)).toBe(false);
});


it('decodes a candidate only when its release and predecessor identities match',async()=>{
  const c=await candidate(),bytes=await readFile(join(c.ctx.runDir,'bundle.json'));
  const decoded=decodeCandidateBundle(bytes,c.staged);
  expect(decoded).toEqual(unpackBundle(bytes,c.staged.reference.sha256));
  const changedKey=structuredClone(c.staged);
  changedKey.reference.key=changedKey.reference.key.replace(/[^/]+\.json$/,'2026-08-00000000-0000-4000-8000-000000000001.json');
  expect(()=>decodeCandidateBundle(bytes,changedKey)).toThrow(/Bundle key and release identity differ/);
  for(const kind of ['checksum','reference','missing'] as const){
    const state=structuredClone(c.staged);
    if(kind==='missing')state.run.baseline=null;
    else if(kind==='checksum')state.run.baseline!.reference.sha256='f'.repeat(64);
    else{
      const id='2026-08-00000000-0000-4000-8000-000000000002';
      state.run.baseline!.reference.key=state.run.baseline!.reference.key.replace(/[^/]+\.json$/,id+'.json');
      state.run.baseline!.releaseId=id;
    }
    expect(()=>decodeCandidateBundle(bytes,state),kind).toThrow(/Candidate baseline identity differs/);
  }
  expect(()=>decodeCandidateBundle(bytes,c.staged,'090122')).toThrow(/product|identity/i);
  expect(()=>decodeCandidateBundle(bytes,{...c.staged,bundleFile:'other.json'} as any)).toThrow(/Invalid archive candidate/);
  expect(()=>decodeCandidateBundle(Buffer.from('{}'),c.staged)).toThrow();
  expect(()=>decodeCandidateBundle(bytes,{...c.staged,reference:{...c.staged.reference,sha256:'e'.repeat(64)}})).toThrow();
  unchanged(c.store,c.pointer);expect(c.store.pointerPutCalls).toBe(0);
});
it('decodes null-baseline initialization but rejects an unexpected predecessor',async()=>{
  const c=await candidate(false),bytes=await readFile(join(c.ctx.runDir,'bundle.json'));
  expect(decodeCandidateBundle(bytes,c.staged).manifest.previous).toBeNull();
  const state=structuredClone(c.staged);
  state.run.baseline={reference:c.baseline.reference,etag:'"synthetic"',releaseId:fixture.input.releaseId,releaseSha256:sha256(fixture.input.releaseBytes)};
  expect(()=>decodeCandidateBundle(bytes,state)).toThrow(/Candidate baseline identity differs/);
  expect(c.store.pointerPutCalls).toBe(0);
});
