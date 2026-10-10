import {afterEach,expect,it,vi} from 'vitest';
import {mkdtemp,readFile,readdir,rm,copyFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {prepareRelease,readCurrentRelease} from '../../scripts/prepare-release';
import {restoreForImport,stageCandidate,promoteCandidate,recoverBundle} from '../../scripts/archive-release';
import {packBundle,encodePointer} from '../../scripts/archive-bundle';
import {productArchiveKeys} from '../../scripts/product-paths';
import {buildProfileView} from '../../src/lib/trade/profile';
import {buildDutyView} from '../../src/lib/trade/duties';
import {syntheticProductFetch,createProductArchiveFixture} from '../helpers/product-data';
import {MemoryArchiveStore} from '../helpers/archive-store';
const dirs:string[]=[];
afterEach(async()=>{for(const dir of dirs.splice(0))await rm(dir,{recursive:true,force:true});});
const classification=(end:string)=>[{from:'2021-09',to:end,evidenceUrl:'https://example.invalid/synthetic-monthly-refresh'}];

it.each([{productCode:'090121',includeDuties:false},{productCode:'090121',includeDuties:true},{productCode:'090111',includeDuties:true}])('rejects an older reporting month before fetching or changing accepted files: %j',async({productCode,includeDuties})=>{
  const root=await mkdtemp(join(tmpdir(),'trade-month-regression-'));dirs.push(root);
  const options={productCode,includeDuties,months:24,apiKey:'synthetic',codeVersion:'synthetic-month-regression',outputDir:join(root,'processed')};
  await prepareRelease({...options,end:'2026-08',classificationIntervals:classification('2026-08')},syntheticProductFetch(productCode,{duties:includeDuties}));
  const pointer=await readFile(join(options.outputDir,'current.json')),releaseFile=JSON.parse(pointer.toString()).releaseFile,releaseBytes=await readFile(join(options.outputDir,releaseFile)),rawNames=await readdir(join(root,'raw'));
  const fetcher=vi.fn(syntheticProductFetch(productCode,{duties:includeDuties}));
  await expect(prepareRelease({...options,end:'2026-07',classificationIntervals:classification('2026-07')},fetcher)).rejects.toThrow(/Reporting month cannot regress/);
  expect(fetcher).not.toHaveBeenCalled();expect(await readFile(join(options.outputDir,'current.json'))).toEqual(pointer);expect(await readFile(join(options.outputDir,releaseFile))).toEqual(releaseBytes);expect(await readdir(join(root,'raw'))).toEqual(rawNames);
});

it('allows an initial historical snapshot and a same-month revision in a separate workspace',async()=>{
  const root=await mkdtemp(join(tmpdir(),'trade-history-refresh-'));dirs.push(root);
  const options={productCode:'090121',end:'2026-07',months:24,apiKey:'synthetic',codeVersion:'synthetic-history-refresh',outputDir:join(root,'processed')};
  await prepareRelease(options,syntheticProductFetch('090121'));
  const next=await prepareRelease(options,syntheticProductFetch('090121',{worldDelta:10}));
  expect(next.reportingMonth).toBe('2026-07');expect(next.revisedKeys).toHaveLength(48);
  expect(next.observations.find(row=>row.direction==='imports'&&row.geography==='world')?.valueUsd).toBe(1010);
  expect(await readCurrentRelease(options.outputDir)).toEqual(next);
});

// Entirely synthetic September observations; this is not a future Census release.
it.each(['090121','090111'])('advances %s across monthly windows, revisions and offline successor recovery',async productCode=>{
  const baseline=await createProductArchiveFixture(productCode,{duties:true});dirs.push(baseline.dataDir);
  const pkg=packBundle(baseline.input,productCode),store=new MemoryArchiveStore(),key=productArchiveKeys(productCode).currentKey;
  store.seed(pkg.reference.key,pkg.bytes);store.seed(key,encodePointer(pkg.reference,productCode));
  const root=await mkdtemp(join(tmpdir(),'trade-monthly-successor-'));dirs.push(root);
  const context={productCode,store,dataDir:join(root,'runner/data'),runDir:join(root,'runner/run')};
  const run=await restoreForImport(context,{reportingMonth:'2026-09',initialize:false});
  const outputDir=join(context.dataDir,'processed'),acceptedPointer=await readFile(join(outputDir,'current.json'));
  const options={productCode,end:'2026-09',months:60,apiKey:'synthetic',codeVersion:'synthetic-monthly-successor',includeDuties:true,outputDir};
  const failed=(async()=>new Response(null,{status:401})) as typeof fetch;
  await expect(prepareRelease({...options,classificationIntervals:classification('2026-09')},failed)).rejects.toThrow(/Census HTTP 401/);
  await expect(prepareRelease({...options,classificationIntervals:classification('2026-08')},syntheticProductFetch(productCode,{duties:true}))).rejects.toThrow(/classification/i);
  expect(await readFile(join(outputDir,'current.json'))).toEqual(acceptedPointer);expect(store.objects.get(key)!.bytes).toEqual(encodePointer(pkg.reference,productCode));
  const base=syntheticProductFetch(productCode,{duties:true}),revised=syntheticProductFetch(productCode,{duties:true,scale:2}),newMonth=syntheticProductFetch(productCode,{duties:true,worldDelta:37});
  const fetcher=(async(input:RequestInfo|URL,init?:RequestInit)=>{const month=new URL(String(input)).searchParams.get('time');return (month==='2026-07'?revised:month==='2026-09'?newMonth:base)(input,init);}) as typeof fetch;
  const next=await prepareRelease({...options,classificationIntervals:classification('2026-09')},fetcher);
  expect(next.reportingMonth).toBe('2026-09');expect(next.schemaVersion).toBe(2);if(next.schemaVersion!==2)throw new Error('Expected duty-enabled successor');
  expect([...new Set(next.observations.map(row=>row.month))].sort()).toHaveLength(60);expect(next.observations.some(row=>row.month==='2021-09')).toBe(false);expect(next.observations.some(row=>row.month==='2021-10')).toBe(true);
  expect(next.duties.fromMonth).toBe('2024-10');expect([...new Set(next.duties.observations.map(row=>row.month))].sort()).toHaveLength(24);expect(next.duties.observations.some(row=>row.month==='2024-09')).toBe(false);
  expect(next.revisedKeys.toSorted()).toEqual([
    `imports/${productCode}/2026-07/world/-/GEN_VAL_MO`,`imports/${productCode}/2026-07/country/1220/GEN_VAL_MO`,`imports/${productCode}/2026-07/country/4759/GEN_VAL_MO`,
    `exports/${productCode}/2026-07/world/-/ALL_VAL_MO`,`exports/${productCode}/2026-07/country/1220/ALL_VAL_MO`,
  ].sort());
  const dutyKeys=['-','1220','4759'].flatMap(code=>['CAL_DUT_MO','CON_VAL_MO','DUT_VAL_MO','coverage'].map(measure=>`imports/${productCode}/2026-07/${code==='-'?'world':'country'}/${code}/${measure}`));
  expect(next.duties.revisedKeys).toEqual(dutyKeys.sort());
  const imports=buildProfileView(next,{direction:'imports',months:12,countryCodes:[]}),exports=buildProfileView(next,{direction:'exports',months:12,countryCodes:[]});
  expect(imports.latestMonth.current).toBe(1037);expect(exports.latestMonth.current).toBe(837);
  expect(imports.trailingYear).toMatchObject({current:13037,previous:12000});expect(exports.trailingYear).toMatchObject({current:10437,previous:9600});
  const duties=buildDutyView(next,[]);expect(duties.series[0].rolling.current).toMatchObject({from:'2025-10',to:'2026-09'});expect(duties.series[0].rolling.previous).toMatchObject({from:'2024-10',to:'2025-09'});
  expect(duties.series[0].rolling.current).toMatchObject({calculatedDutyUsd:156,consumptionValueUsd:2600,dutySharePercent:6});
  expect(duties.series[0].rolling.previous).toMatchObject({calculatedDutyUsd:144,consumptionValueUsd:2400,dutySharePercent:6});
  expect(await readFile(join(outputDir,'releases',`${run.baseline!.releaseId}.json`))).toEqual(baseline.input.releaseBytes);
  const candidate=await stageCandidate(context,run),pointerBefore=Buffer.from(store.objects.get(key)!.bytes);
  const backup=join(root,'synthetic-backup.json');await copyFile(join(context.runDir,'bundle.json'),backup);
  const manifest=JSON.parse(await readFile(backup,'utf8')).manifest;expect(manifest.previous).toEqual(pkg.reference);expect(manifest.files).toHaveLength(337);
  const recoveryDir=join(root,'offline-recovered');await recoverBundle(backup,candidate.reference.sha256,recoveryDir,productCode);
  const recovered=await readCurrentRelease(join(recoveryDir,'processed'),productCode);expect(recovered).toEqual(next);
  const p=JSON.parse(await readFile(join(outputDir,'current.json'),'utf8')),id=p.releaseFile.slice(9,-5);
  expect(await readFile(join(recoveryDir,'processed',p.releaseFile))).toEqual(await readFile(join(outputDir,p.releaseFile)));
  const rawNames=await readdir(join(context.dataDir,'raw',id));expect(rawNames).toHaveLength(336);
  for(const name of rawNames)expect(await readFile(join(recoveryDir,'raw',id,name))).toEqual(await readFile(join(context.dataDir,'raw',id,name)));
  await expect(promoteCandidate(context,candidate,{artifactId:'',artifactDigest:''})).rejects.toThrow(/backup/i);expect(store.objects.get(key)!.bytes).toEqual(pointerBefore);
  expect((await promoteCandidate(context,candidate,{artifactId:'123',artifactDigest:'e'.repeat(64)})).status).toBe('acknowledged');
  const fresh={...context,dataDir:join(root,'fresh/data'),runDir:join(root,'fresh/run')},restored=await restoreForImport(fresh,{reportingMonth:'2026-09',initialize:false});
  expect(restored.baseline!.reference).toEqual(candidate.reference);expect(await readCurrentRelease(join(fresh.dataDir,'processed'),productCode)).toEqual(next);
},30_000);
