import {afterEach,expect,it,vi} from 'vitest';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createSiteStage} from '../../scripts/site-staging';
import {prepareSite} from '../../scripts/site-assembly';
import {preparationFixture,cleanPreparationFixtures} from '../helpers/site-preparation';
vi.mock('../../src/lib/country-preview/pilot-load.server',()=>({loadCanadaPilot:vi.fn()}));
afterEach(cleanPreparationFixtures);
it('both_preparation_manifests_roundtrip_with_the_tracked_packager',async()=>{
 const python=process.env.SITE_PACKAGE_PYTHON;if(!python)throw Error('Set SITE_PACKAGE_PYTHON to the existing Python 3.12+ executable for preparation integration.');
 const f=await preparationFixture();await createSiteStage(f);const buildRoot=resolve(f.outputRoot,'real-dist'),outputRoot=resolve(f.outputRoot,'packages');
 await mkdir(buildRoot);await writeFile(resolve(buildRoot,'index.html'),'<!doctype html><title>Local tool fixture</title>');
 await prepareSite({...f,stageRoot:f.outputRoot,buildRoot,outputRoot});
 for(const kind of ['site','withdrawal']){
  const manifest=resolve(outputRoot,kind+'-manifest.json'),zip=resolve(outputRoot,kind+'.zip'),base=['--work-dir',f.outputRoot,'--manifest',manifest,'--zip',zip];
  const run=(args:string[])=>JSON.parse(execFileSync(python,[resolve('scripts/package_site.py'),...args],{encoding:'utf8',stdio:['pipe','pipe','pipe']}));
  const created=run(['create',...base,'--root',resolve(outputRoot,kind)]),verified=run(['verify',...base]);
  expect(verified).toEqual(created);expect(verified.entriesVerified).toBe(true);expect(verified.entryCount).toBe(3);
  const second=run(['create','--work-dir',f.outputRoot,'--manifest',manifest,'--zip',resolve(outputRoot,kind+'-copy.zip'),'--root',resolve(outputRoot,kind)]);
  expect(second.sha256).toBe(created.sha256);expect(await readFile(zip)).toEqual(await readFile(resolve(outputRoot,kind+'-copy.zip')));
 }
}, 15000);

