import {afterEach,expect,it,vi} from 'vitest';
import {writeFile,readFile,link,rename,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {loadLiveSitePackage} from '../../scripts/live-site-package';
import {cleanLiveFixtures,liveFixture,sha} from '../helpers/live-site';
afterEach(async()=>{vi.restoreAllMocks();await cleanLiveFixtures();});
it('authenticates a real ZIP and plans served and private routes without the control file',async()=>{
  const f=await liveFixture();const result=await loadLiveSitePackage(f);
  expect(result.zip).toMatchObject({sha256:f.zipSha256,bytes:f.receipt.bytes});
  expect(result.checks).toHaveLength(8);
  expect(result.checks.map((c:any)=>c.path)).toEqual(['/404.html','/index.html','/nested/index.html','/assets/main.js','/preview/countries/1220/','/preview/accepted/countries/1220/','/countries/9999/','/data/countries/1220/processed/current.json']);
  expect(result.checks[2].allowedPaths).toContain('/nested/');
  expect(Object.isFrozen(result.checks[0])).toBe(true);
});
it.each(['manifestSha256','zipSha256'])('rejects a wrong %s before subprocess verification',async key=>{
  const f=await liveFixture();let invoked=false;
  await expect(loadLiveSitePackage({...f,[key]:'b'.repeat(64)},async()=>{invoked=true;return f.receipt;})).rejects.toThrow();
  expect(invoked).toBe(false);
});
it.each(['entriesVerified','entryCount','bytes','sha256'])('rejects a forged subprocess %s',async key=>{
  const f=await liveFixture();
  await expect(loadLiveSitePackage(f,async()=>({...f.receipt,[key]:null}))).rejects.toThrow('live-package-receipt');
});
it('rejects changes between subprocess validation and readback',async()=>{
  const f=await liveFixture();
  await expect(loadLiveSitePackage(f,async()=>{await writeFile(f.manifestPath,(await readFile(f.manifestPath)).toString()+'\n');return f.receipt;})).rejects.toThrow();
});
it('rejects malformed ZIP bytes despite matching operator digest',async()=>{
  const f=await liveFixture();await writeFile(f.zipPath,'not a zip');
  await expect(loadLiveSitePackage({...f,zipSha256:sha('not a zip')})).rejects.toThrow('live-package-verification');
});
it('rejects duplicate JSON keys through the actual Python parser',async()=>{
  const f=await liveFixture();const text=(await readFile(f.manifestPath,'utf8')).replace('"schemaVersion":1','"schemaVersion":1,"schemaVersion":1');await writeFile(f.manifestPath,text);
  await expect(loadLiveSitePackage({...f,manifestSha256:sha(text)})).rejects.toThrow('live-package-verification');
});
it('rejects duplicate entries through the actual Python parser',async()=>{
  const f=await liveFixture();f.manifest.files.push(f.manifest.files[0]);const body=JSON.stringify(f.manifest);await writeFile(f.manifestPath,body);
  await expect(loadLiveSitePackage({...f,manifestSha256:sha(body)})).rejects.toThrow();
});
it('rejects withdrawal packages even when locally verified',async()=>{
  const f=await liveFixture();const body=JSON.stringify({...f.manifest,packageKind:'withdrawal'});await writeFile(f.manifestPath,body);
  await expect(loadLiveSitePackage({...f,manifestSha256:sha(body)},async()=>f.receipt)).rejects.toThrow('live-package-policy');
});
it('rejects work directories outside the executing checkout ignored scope',async()=>{
  const f=await liveFixture();
  await expect(loadLiveSitePackage({...f,workDir:resolve('.')})).rejects.toThrow('live-work-scope');
  await expect(loadLiveSitePackage({...f,manifestPath:resolve(f.workDir,'../site-manifest.json')})).rejects.toThrow();
});
it('rejects a hardlinked input',async()=>{
  const f=await liveFixture();await link(f.zipPath,resolve(f.workDir,'linked.zip'));
  await expect(loadLiveSitePackage(f)).rejects.toThrow();
});
it('rejects a reparse input ancestor',async()=>{
  const f=await liveFixture();await rename(f.zipPath,resolve(f.workDir,'original.zip'));
  const {symlink}=await import('node:fs/promises');const real=resolve(f.workDir,'real');await mkdir(real);
  await symlink(real,resolve(f.workDir,'alias'),process.platform==='win32'?'junction':'dir');
  await expect(loadLiveSitePackage({...f,zipPath:resolve(f.workDir,'alias/file.zip')})).rejects.toThrow();
});
it.each([['manifestPath',1048577],['zipPath',4194305]] as const)('rejects oversized %s before subprocess invocation',async(key,size)=>{
  const f=await liveFixture();await writeFile(f[key],Buffer.alloc(size));let invoked=false;
  await expect(loadLiveSitePackage({...f,[key==='zipPath'?'zipSha256':'manifestSha256']:sha(Buffer.alloc(size))},async()=>{invoked=true;return f.receipt;})).rejects.toThrow();
  expect(invoked).toBe(false);
});
it('rejects packages above the aggregate byte budget',async()=>{
  const f=await liveFixture({'large.js':'x'.repeat(2097152)});
  await expect(loadLiveSitePackage(f)).rejects.toThrow('live-package-policy');
});
it('rejects packages whose two-origin check plan exceeds 128 checks',async()=>{
  const f=await liveFixture(Object.fromEntries(Array.from({length:57},(_,i)=>['a'+i+'.js','x'])));
  await expect(loadLiveSitePackage(f)).rejects.toThrow('live-package-policy');
});

