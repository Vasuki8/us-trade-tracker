import {afterEach,expect,it,vi} from 'vitest';
import {build,preview} from 'astro';
import {mkdtemp,mkdir,readdir,rm,symlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {resolveCanadaPreviewPort,serveCanadaPreviewFixture} from '../../scripts/serve-canada-preview-fixture';
vi.mock('astro',()=>({build:vi.fn(),preview:vi.fn()}));
const roots:string[]=[];
afterEach(async()=>{vi.restoreAllMocks();vi.unstubAllEnvs();vi.mocked(build).mockReset();vi.mocked(preview).mockReset();for(const r of roots.splice(0))await rm(r,{recursive:true,force:true});});
async function root(){await mkdir(resolve('.tmp'),{recursive:true});const r=await mkdtemp(resolve('.tmp/canada-server-test-'));roots.push(r);vi.spyOn(process,'cwd').mockReturnValue(r);return r;}
it('accepts only explicit integer local ports',()=>{
  expect(resolveCanadaPreviewPort(undefined)).toBe(4402);expect(resolveCanadaPreviewPort('1024')).toBe(1024);expect(resolveCanadaPreviewPort('65535')).toBe(65535);
  for(const value of ['','1023','65536','4.4',' 4402','4402x','04402'])expect(()=>resolveCanadaPreviewPort(value)).toThrow();
});
it('forces fixture modes, shares an owned output and restores environment after its server closes',async()=>{
  const r=await root();vi.stubEnv('CANADA_PREVIEW_MODE','retained');vi.stubEnv('CANADA_ACCEPTED_PREVIEW_MODE','selected');vi.stubEnv('TRADE_DATA_MODE','published');vi.stubEnv('PLAYWRIGHT_CANADA_PORT','4402');
  vi.mocked(build).mockImplementation(async options=>{expect(process.env.CANADA_PREVIEW_MODE).toBe('fixture');expect(process.env.CANADA_ACCEPTED_PREVIEW_MODE).toBe('fixture');expect(process.env.TRADE_DATA_MODE).toBe('fixture');expect(resolve(options!.outDir!)).toContain('canada-preview-');});
  const stop=vi.fn(async()=>{});vi.mocked(preview).mockResolvedValue({port:4402,host:'127.0.0.1',closed:async()=>{},stop});
  await serveCanadaPreviewFixture();expect(vi.mocked(build).mock.calls[0][0]).toEqual(vi.mocked(preview).mock.calls[0][0]);expect(stop).toHaveBeenCalled();expect(await readdir(resolve(r,'.tmp'))).toEqual([]);expect(process.env.CANADA_PREVIEW_MODE).toBe('retained');expect(process.env.CANADA_ACCEPTED_PREVIEW_MODE).toBe('selected');expect(process.env.TRADE_DATA_MODE).toBe('published');
});
it('cleans its owned output after a build failure before server startup',async()=>{
  const r=await root();vi.mocked(build).mockRejectedValue(Error('simulated build error'));await expect(serveCanadaPreviewFixture()).rejects.toThrow();expect(preview).not.toHaveBeenCalled();expect(await readdir(resolve(r,'.tmp'))).toEqual([]);
});
it('stops an unexpected fallback port and fails',async()=>{
  await root();const stop=vi.fn(async()=>{});vi.mocked(preview).mockResolvedValue({port:4403,closed:async()=>{},stop});await expect(serveCanadaPreviewFixture()).rejects.toThrow('Unexpected Canada preview port');expect(stop).toHaveBeenCalled();
});
it('rejects an output reparse ancestor',async()=>{
  const r=await root(),target=resolve(r,'target');await mkdir(target);await symlink(target,resolve(r,'.tmp'),process.platform==='win32'?'junction':'dir');await expect(serveCanadaPreviewFixture()).rejects.toThrow();expect(build).not.toHaveBeenCalled();expect(await readdir(target)).toEqual([]);
});
