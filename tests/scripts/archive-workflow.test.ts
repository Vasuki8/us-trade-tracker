import {afterAll,expect,it} from 'vitest';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {parse} from 'yaml';
import {parseArchiveDispatch} from '../../scripts/archive-inputs';
import {runArchiveCommand} from '../../scripts/archive-product';
import {createArchiveFixture} from '../helpers/archive';
import {MemoryArchiveStore} from '../helpers/archive-store';
import {CURRENT_KEY} from '../../scripts/archive-bundle';
import {readCurrentRelease} from '../../scripts/prepare-release';
const valid={REPORTING_MONTH:'2026-08',ARCHIVE_TO_R2:'false',INITIALIZE_ARCHIVE:'false',GITHUB_REF:'refs/heads/main'};
const dirs:string[]=[];afterAll(async()=>{for(const dir of dirs)await rm(dir,{recursive:true,force:true});});
it('defaults to artifact-only and needs neither R2 configuration nor a provider client',async()=>{
  expect(parseArchiveDispatch(valid)).toEqual({reportingMonth:'2026-08',archive:false,initialize:false});
  let calls=0;expect(await runArchiveCommand(['preflight'],valid,()=>{calls++;throw new Error('unexpected provider');})).toMatchObject({archive:false});expect(calls).toBe(0);
});
it.each([{ARCHIVE_TO_R2:'yes'},{INITIALIZE_ARCHIVE:'1'},{REPORTING_MONTH:'2026-13'},{REPORTING_MONTH:'2026-08;echo'},{INITIALIZE_ARCHIVE:'true'},{ARCHIVE_TO_R2:'true',GITHUB_REF:'refs/heads/feature'}])('rejects invalid dispatch %j before any provider call',patch=>{expect(()=>parseArchiveDispatch({...valid,...patch})).toThrow();});
it('packs and recovers synthetic original data entirely offline without changing its source pointer',async()=>{
  const f=await createArchiveFixture();dirs.push(f.dataDir);const run=await mkdtemp(join(tmpdir(),'trade-cli-test-'));dirs.push(run);const original=await readFile(join(f.dataDir,'processed/current.json'));
  let calls=0;const factory=()=>{calls++;throw new Error('unexpected provider');};
  const pkg=await runArchiveCommand(['pack','--data-dir',f.dataDir,'--run-dir',run],{},factory) as {sha256:string};
  const target=join(run,'recovery');await runArchiveCommand(['recover','--bundle',join(run,'bundle.json'),'--sha256',pkg.sha256,'--data-dir',target],{},factory);
  expect(await readCurrentRelease(join(target,'processed'))).toEqual(JSON.parse(f.input.releaseBytes.toString()));expect((await readFile(join(f.dataDir,'processed/current.json'))).equals(original)).toBe(true);expect(calls).toBe(0);
});
it.each([['unknown'],['preflight','--oops','value'],['pack','--data-dir','data'],['recover','--bundle','file','--sha256','bad','--data-dir','data']].map(args=>({args})))('rejects malformed CLI invocation $args',async({args})=>{await expect(runArchiveCommand(args,valid)).rejects.toThrow();});
it('rejects malformed persisted state before any remote mutation',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'trade-state-test-'));dirs.push(dir);await writeFile(join(dir,'candidate.json'),'{}');const store=new MemoryArchiveStore();
  await expect(runArchiveCommand(['promote','--data-dir',join(dir,'data'),'--run-dir',dir],{...valid,ARCHIVE_TO_R2:'true'},()=>store)).rejects.toThrow();expect(store.puts).toHaveLength(0);expect(store.objects.has(CURRENT_KEY)).toBe(false);
});
it('keeps dispatch, credentials, backup ordering and promotion gates explicit in the actual workflow',async()=>{
  const w=parse(await readFile('.github/workflows/import-census.yml','utf8'));expect(Object.keys(w.on)).toEqual(['workflow_dispatch']);expect(w.permissions).toEqual({contents:'read'});expect(w.concurrency).toEqual({group:'census-data-import','cancel-in-progress':false});
  const inputs=w.on.workflow_dispatch.inputs;expect(inputs.archive_to_r2).toMatchObject({type:'boolean',default:false});expect(inputs.initialize_archive).toMatchObject({type:'boolean',default:false});
  const job=w.jobs.import;expect(job['timeout-minutes']).toBe(20);const steps=job.steps as any[];
  for(const step of steps.filter(s=>s.uses))expect(step.uses).toMatch(/^actions\/(checkout|setup-node|upload-artifact)@[a-f0-9]{40}$/);
  expect(steps.find(s=>s.uses?.startsWith('actions/setup-node')).with['node-version']).toBe(24);
  const restore=steps.findIndex(s=>s.id==='restore'),stage=steps.findIndex(s=>s.id==='stage'),backup=steps.findIndex(s=>s.id==='backup'),promote=steps.findIndex(s=>s.id==='promote');
  expect(restore).toBeGreaterThan(-1);expect(stage).toBeGreaterThan(restore);expect(backup).toBeGreaterThan(stage);expect(promote).toBeGreaterThan(backup);
  for(const step of steps){const credentials=Object.keys(step.env??{}).filter(k=>k.includes('KEY'));if(['restore','stage','promote'].includes(step.id)){expect(credentials.sort()).toEqual(['R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY']);expect(step.if).toContain('inputs.archive_to_r2');expect(step.if).toContain('refs/heads/main');}else expect(credentials).toEqual(step.id==='import'?['CENSUS_API_KEY']:[]);if(step.run)expect(step.run).not.toContain('${{');}
  expect(steps[promote].if).toContain('success()');expect(steps[promote].if).toContain("steps.backup.outcome == 'success'");expect(steps[promote].env.BACKUP_ARTIFACT_ID).toBe('${{ steps.backup.outputs.artifact-id }}');expect(steps[promote].env.BACKUP_ARTIFACT_DIGEST).toBe('${{ steps.backup.outputs.artifact-digest }}');
  expect(steps[backup].with).toMatchObject({name:'census-coffee-candidate',path:'.tmp/archive/bundle.json','include-hidden-files':true,'if-no-files-found':'error','retention-days':7});
  const receipt=steps.find(s=>s.with?.name==='census-coffee-promotion');expect(receipt.if).toContain('always()');expect(receipt.if).toContain("hashFiles('.tmp/archive/outcome.json')");expect(receipt.with.path).toBe('.tmp/archive/outcome.json');expect(receipt.with['include-hidden-files']).toBe(true);
  expect(steps.find(s=>s.with?.name==='census-coffee-release').if).toContain('!inputs.archive_to_r2');
});
