import {afterAll,expect,it} from 'vitest';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {parse} from 'yaml';
import {parseArchiveDispatch} from '../../scripts/archive-inputs';
import {runArchiveCommand} from '../../scripts/archive-product';
import {createArchiveFixture,syntheticCensusFetch} from '../helpers/archive';
import {MemoryArchiveStore} from '../helpers/archive-store';
import {CURRENT_KEY,packBundle,encodePointer} from '../../scripts/archive-bundle';
import {prepareRelease,readCurrentRelease} from '../../scripts/prepare-release';
const valid={REPORTING_MONTH:'2026-08',ARCHIVE_TO_R2:'false',INITIALIZE_ARCHIVE:'false',GITHUB_REF:'refs/heads/main'};
const dirs:string[]=[];afterAll(async()=>{for(const dir of dirs)await rm(dir,{recursive:true,force:true});});
it('defaults to artifact-only and needs neither R2 configuration nor a provider client',async()=>{
  expect(parseArchiveDispatch(valid)).toEqual({productCode:'090121',reportingMonth:'2026-08',archive:false,initialize:false,includeDuties:false,candidateOnly:false});
  let calls=0;expect(await runArchiveCommand(['preflight'],valid,()=>{calls++;throw new Error('unexpected provider');})).toMatchObject({archive:false});expect(calls).toBe(0);
});
it('allows candidate-only review against an existing main-branch archive',()=>{
  expect(parseArchiveDispatch({...valid,ARCHIVE_TO_R2:'true',CANDIDATE_ONLY:'true'})).toMatchObject({archive:true,initialize:false,candidateOnly:true});
  expect(parseArchiveDispatch({...valid,CANDIDATE_ONLY:'false'})).toMatchObject({archive:false,candidateOnly:false});
});
it.each([
  {CANDIDATE_ONLY:'yes'},
  {CANDIDATE_ONLY:'true',ARCHIVE_TO_R2:'false'},
  {CANDIDATE_ONLY:'true',INITIALIZE_ARCHIVE:'true'},
  {CANDIDATE_ONLY:'true',GITHUB_REF:'refs/heads/feature'},
])('rejects contradictory candidate-only dispatch %j before provider access',async patch=>{
  const env={...valid,ARCHIVE_TO_R2:'true',...patch};let calls=0;
  await expect(runArchiveCommand(['restore','--data-dir','unused','--run-dir','unused'],env,()=>{calls++;throw new Error('unexpected provider');})).rejects.toThrow(/Invalid|Candidate-only/);
  expect(calls).toBe(0);
});
it('refuses candidate-only promotion before reading state or configuring a provider',async()=>{
  let calls=0;
  await expect(runArchiveCommand(['promote','--data-dir','unused','--run-dir','unused'],{...valid,ARCHIVE_TO_R2:'true',CANDIDATE_ONLY:'true'},()=>{calls++;throw new Error('unexpected provider');})).rejects.toThrow(/Candidate-only.*promotion/i);
  expect(calls).toBe(0);
});
it('refuses a candidate-only stage with no accepted baseline before provider access',async()=>{
  const root=await mkdtemp(join(tmpdir(),'trade-candidate-no-baseline-'));dirs.push(root);
  await writeFile(join(root,'run.json'),JSON.stringify({schemaVersion:2,productCode:'090121',reportingMonth:'2026-08',baseline:null}));let calls=0;
  await expect(runArchiveCommand(['stage','--data-dir',join(root,'data'),'--run-dir',root],{...valid,ARCHIVE_TO_R2:'true',CANDIDATE_ONLY:'true'},()=>{calls++;throw new Error('unexpected provider');})).rejects.toThrow(/Candidate-only.*baseline/i);
  expect(calls).toBe(0);
});
it('stops a candidate-only run at restore when the accepted archive is absent',async()=>{
  const root=await mkdtemp(join(tmpdir(),'trade-candidate-absent-'));dirs.push(root);const store=new MemoryArchiveStore();
  await expect(runArchiveCommand(['restore','--data-dir',join(root,'data'),'--run-dir',join(root,'run')],{...valid,ARCHIVE_TO_R2:'true',CANDIDATE_ONLY:'true'},()=>store)).rejects.toThrow(/Archive is absent/);
  expect(store.puts).toHaveLength(0);await expect(readFile(join(root,'run/run.json'))).rejects.toMatchObject({code:'ENOENT'});
});
it.each([true,false])('restores, stages and recovers a baseline-aware candidate with candidateOnly=%s',async candidateOnly=>{
  const f=await createArchiveFixture();dirs.push(f.dataDir);const root=await mkdtemp(join(tmpdir(),'trade-candidate-flow-'));dirs.push(root);
  const store=new MemoryArchiveStore(),baseline=packBundle(f.input),pointer=encodePointer(baseline.reference);
  store.seed(baseline.reference.key,baseline.bytes);store.seed(CURRENT_KEY,pointer);
  const dataDir=join(root,'data'),runDir=join(root,'run'),env={...valid,ARCHIVE_TO_R2:'true',CANDIDATE_ONLY:String(candidateOnly),BACKUP_ARTIFACT_ID:'1234',BACKUP_ARTIFACT_DIGEST:'e'.repeat(64)};
  const args=(command:string,target=dataDir)=>[command,'--data-dir',target,'--run-dir',runDir];
  await runArchiveCommand(args('restore'),env,()=>store);
  await prepareRelease({productCode:'090121',end:'2026-08',months:60,apiKey:'synthetic',outputDir:join(dataDir,'processed'),codeVersion:'synthetic-candidate'},syntheticCensusFetch({worldDelta:100}));
  const staged=await runArchiveCommand(args('stage'),env,()=>store) as {run:{baseline:{reference:unknown}};reference:{key:string}};
  expect(staged.run.baseline.reference).toEqual(baseline.reference);expect(store.objects.has(staged.reference.key)).toBe(true);
  const recovered=join(root,'recovered');await runArchiveCommand(args('verify',recovered),{},()=>{throw new Error('unexpected offline provider');});
  const release=await readCurrentRelease(join(recovered,'processed'));expect(release?.revisedKeys.length).toBeGreaterThan(0);
  expect(release).toEqual(await readCurrentRelease(join(dataDir,'processed')));expect(store.objects.get(CURRENT_KEY)!.bytes).toEqual(pointer);expect(store.pointerPutCalls).toBe(0);
  if(candidateOnly){
    await expect(runArchiveCommand(args('promote'),env,()=>store)).rejects.toThrow(/Candidate-only.*promotion/i);
    expect(store.objects.get(CURRENT_KEY)!.bytes).toEqual(pointer);expect(store.pointerPutCalls).toBe(0);
    await expect(readFile(join(runDir,'outcome.json'))).rejects.toMatchObject({code:'ENOENT'});
  }else{
    expect(await runArchiveCommand(args('promote'),env,()=>store)).toMatchObject({status:'acknowledged'});expect(store.pointerPutCalls).toBe(1);
  }
});
it.each([{INCLUDE_DUTIES:'yes'},{ARCHIVE_TO_R2:'yes'},{INITIALIZE_ARCHIVE:'1'},{REPORTING_MONTH:'2026-13'},{REPORTING_MONTH:'2026-08;echo'},{INITIALIZE_ARCHIVE:'true'},{ARCHIVE_TO_R2:'true',GITHUB_REF:'refs/heads/feature'}])('rejects invalid dispatch %j before any provider call',patch=>{expect(()=>parseArchiveDispatch({...valid,...patch})).toThrow();});
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
  expect(steps[backup].with).toMatchObject({name:'census-${{ steps.preflight.outputs.product_code }}-candidate',path:'.tmp/archive/bundle.json','include-hidden-files':true,'if-no-files-found':'error','retention-days':7});
  const receipt=steps.find(s=>s.with?.name==='census-${{ steps.preflight.outputs.product_code }}-promotion');expect(receipt.if).toContain('always()');expect(receipt.if).toContain("hashFiles('.tmp/archive/outcome.json')");expect(receipt.with.path).toBe('.tmp/archive/outcome.json');expect(receipt.with['include-hidden-files']).toBe(true);
  expect(steps.find(s=>s.with?.name==='census-${{ steps.preflight.outputs.product_code }}-release').if).toContain('!inputs.archive_to_r2');
});
it('opts into duty retrieval and requires offline recovery after backup and before promotion',async()=>{
 const w=parse(await readFile('.github/workflows/import-census.yml','utf8')),steps=w.jobs.import.steps as any[];
 expect(w.on.workflow_dispatch.inputs.include_duties).toMatchObject({type:'boolean',default:false});
 expect(steps.find(s=>s.id==='import').run).toContain('--duties');
 const recovery=steps.findIndex(s=>s.id==='recovery');expect(recovery).toBeGreaterThan(steps.findIndex(s=>s.id==='backup'));expect(recovery).toBeLessThan(steps.findIndex(s=>s.id==='promote'));
 expect(steps[recovery].run).toContain('verify');expect(steps[recovery].env).toBeUndefined();expect(steps.find(s=>s.id==='promote').if).toContain("steps.recovery.outcome == 'success'");
});
it('routes candidate-only success to review and never to promotion in the actual workflow',async()=>{
  const w=parse(await readFile('.github/workflows/import-census.yml','utf8')),job=w.jobs.import,steps=job.steps as any[];
  expect(w.on.workflow_dispatch.inputs.candidate_only).toMatchObject({type:'boolean',default:false});
  expect(job.env.CANDIDATE_ONLY).toBe('${{ inputs.candidate_only }}');
  const ready=steps.find(s=>s.id==='candidate_ready'),promote=steps.find(s=>s.id==='promote');expect(ready).toBeDefined();
  expect(steps.indexOf(ready)).toBeGreaterThan(steps.findIndex(s=>s.id==='recovery'));
  expect(ready.env).toEqual({BACKUP_ARTIFACT_ID:'${{ steps.backup.outputs.artifact-id }}',BACKUP_ARTIFACT_DIGEST:'${{ steps.backup.outputs.artifact-digest }}'});
  expect(ready.run).toContain('Candidate ready for review');expect(ready.run).toContain('GITHUB_STEP_SUMMARY');expect(ready.run).not.toContain('data:archive');expect(ready.run).not.toContain('outcome.json');
  // Evaluate the workflow's supported conjunctions; an unknown expression fails the contract.
  function allowed(expression:string,state:{candidate:boolean;archive:boolean;main:boolean;success:boolean;failed?:string}):boolean{
    const terms:Record<string,boolean>={'success()':state.success,'inputs.candidate_only':state.candidate,'!inputs.candidate_only':!state.candidate,'inputs.archive_to_r2':state.archive,"github.ref == 'refs/heads/main'":state.main};
    for(const id of ['restore','stage','backup','recovery'])terms[`steps.${id}.outcome == 'success'`]=state.failed!==id;
    return expression.split(' && ').map(term=>{if(!Object.hasOwn(terms,term))throw new Error(`Unsupported workflow gate: ${term}`);return terms[term];}).every(Boolean);
  }
  const success={candidate:true,archive:true,main:true,success:true};
  expect(allowed(ready.if,success)).toBe(true);expect(allowed(promote.if,success)).toBe(false);
  expect(allowed(ready.if,{...success,candidate:false})).toBe(false);expect(allowed(promote.if,{...success,candidate:false})).toBe(true);
  for(const state of [{...success,archive:false},{...success,main:false},{...success,success:false},...['restore','stage','backup','recovery'].map(failed=>({...success,failed}))])expect(allowed(ready.if,state)).toBe(false);
  for(const failed of ['backup','recovery'])expect(allowed(promote.if,{...success,candidate:false,failed})).toBe(false);
});
