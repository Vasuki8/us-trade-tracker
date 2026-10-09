import {afterEach,expect,it} from 'vitest';
import {mkdtemp,readFile,readdir,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {prepareRelease,readCurrentRelease,validateRelease} from '../../scripts/prepare-release';
import {findDutyRevisedKeys} from '../../src/lib/trade/revisions';
import {buildProfileView} from '../../src/lib/trade/profile';
import {buildChangesView} from '../../src/lib/trade/changes';
import {sampleDutyDataset,sampleDutyRelease,syntheticDutyFetch} from '../helpers/duties';
import {sampleRelease} from '../helpers/release';
const dirs:string[]=[];
afterEach(async()=>{await Promise.all(dirs.splice(0).map(dir=>rm(dir,{recursive:true,force:true})));});
const options={productCode:'090121',end:'2026-08',months:60,apiKey:'synthetic-key',codeVersion:'synthetic-duty-release',classificationIntervals:[{from:'2021-09',to:'2026-08',evidenceUrl:'https://example.invalid/synthetic'}]};
it('prepares a separate 24-month duty dataset while retaining all 60 merchandise months',async()=>{
  const dataDir=await mkdtemp(join(tmpdir(),'trade-duty-release-'));dirs.push(dataDir);const outputDir=join(dataDir,'processed');
  const legacy=await prepareRelease({...options,outputDir},syntheticDutyFetch());
  const release=await prepareRelease({...options,outputDir,includeDuties:true},syntheticDutyFetch());
  expect(release.schemaVersion).toBe(2);if(release.schemaVersion!==2)throw new Error('Expected duty release');
  expect(release.observations).toEqual(legacy.observations);expect(release.revisedKeys).toEqual([]);
  expect(release.duties.fromMonth).toBe('2024-09');expect(release.duties.observations).toHaveLength(72);expect(release.duties.revisedKeys).toEqual([]);
  expect(buildProfileView(release,{direction:'imports',months:60,countryCodes:[]})).toEqual(buildProfileView({...legacy,retrievedAt:release.retrievedAt},{direction:'imports',months:60,countryCodes:[]}));
  expect(buildChangesView(release,'exports')).toEqual(buildChangesView({...legacy,retrievedAt:release.retrievedAt},'exports'));
  const pointer=JSON.parse(await readFile(join(outputDir,'current.json'),'utf8'));const id=pointer.releaseFile.slice(9,-5);
  expect(await readdir(join(dataDir,'raw',id))).toHaveLength(336);expect(await readCurrentRelease(outputDir)).toEqual(release);
});
it('accepts both formats and rejects malformed duty data, coverage and periods',()=>{
  expect(()=>validateRelease(sampleRelease())).not.toThrow();expect(()=>validateRelease(sampleDutyRelease())).not.toThrow();
  const badCases=[
    (r:ReturnType<typeof sampleDutyRelease>)=>{r.duties.observations.push(r.duties.observations[0]);},
    (r:ReturnType<typeof sampleDutyRelease>)=>{r.duties.fromMonth='2024-02';},
    (r:ReturnType<typeof sampleDutyRelease>)=>{r.duties.observations[0].productCode='010121';},
    (r:ReturnType<typeof sampleDutyRelease>)=>{r.duties.observations[0].coverage.uncalculatedDutiableValueUsd=1000;},
    (r:ReturnType<typeof sampleDutyRelease>)=>{r.duties.observations[0].consumptionValue={valueUsd:null,status:'missing'};},
  ];
  for(const mutate of badCases){const release=sampleDutyRelease();mutate(release);expect(()=>validateRelease(release)).toThrow();}
  const noClassification=sampleDutyRelease();noClassification.source='census';noClassification.classificationIntervals=[];expect(()=>validateRelease(noClassification,true)).toThrow(/classification/i);
});
it('records overlapping duty changes and removals independently of merchandise revisions',()=>{
  const previous=sampleDutyDataset(),next=structuredClone(previous);
  next.observations[0].calculatedDuty.valueUsd=11;next.observations[1].coverage.uncalculatedDutiableValueUsd=1;next.observations.splice(2,1);
  expect(findDutyRevisedKeys(undefined,next)).toEqual([]);
  expect(findDutyRevisedKeys(previous,next)).toEqual(expect.arrayContaining(['imports/090121/2024-01/world/-/CAL_DUT_MO','imports/090121/2024-02/world/-/coverage','imports/090121/2024-03/world/-/CON_VAL_MO']));
});
it('retains the accepted pointer after a duty retrieval or classification failure',async()=>{
  const dataDir=await mkdtemp(join(tmpdir(),'trade-duty-release-'));dirs.push(dataDir);const outputDir=join(dataDir,'processed');
  const first=await prepareRelease({...options,outputDir},syntheticDutyFetch());const pointer=await readFile(join(outputDir,'current.json'));
  const fake=syntheticDutyFetch();const failed=(async(input:RequestInfo|URL,init?:RequestInit)=>new URL(String(input)).searchParams.get('get')!.includes('CAL_DUT_MO')?new Response(null,{status:401}):fake(input,init)) as typeof fetch;
  await expect(prepareRelease({...options,outputDir,includeDuties:true},failed)).rejects.toThrow();
  await expect(prepareRelease({...options,outputDir,includeDuties:true,classificationIntervals:[]},fake)).rejects.toThrow(/classification/i);
  expect(await readFile(join(outputDir,'current.json'))).toEqual(pointer);expect(await readCurrentRelease(outputDir)).toEqual(first);
});
