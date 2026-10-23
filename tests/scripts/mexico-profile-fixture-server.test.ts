import {afterEach,expect,it,vi} from 'vitest';
import {build,preview} from 'astro';
import {mkdir,mkdtemp,readFile,readdir,rm,symlink,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {resolveMexicoProfilePort,serveMexicoProfileFixture} from '../../scripts/serve-mexico-profile-fixture';
vi.mock('astro',()=>({build:vi.fn(),preview:vi.fn()}));
const roots:string[]=[];
afterEach(async()=>{vi.restoreAllMocks();vi.unstubAllEnvs();vi.mocked(build).mockReset();vi.mocked(preview).mockReset();for(const r of roots.splice(0))await rm(r,{recursive:true,force:true});});
async function root(){await mkdir(resolve('.tmp'),{recursive:true});const r=await mkdtemp(resolve('.tmp/mexico-server-test-'));roots.push(r);vi.spyOn(process,'cwd').mockReturnValue(r);return r;}
it('accepts only explicit bounded local ports',()=>{expect(resolveMexicoProfilePort(undefined)).toBe(4410);expect(resolveMexicoProfilePort('1024')).toBe(1024);expect(resolveMexicoProfilePort('65535')).toBe(65535);for(const p of ['','1023','65536','4.4',' 4410','4410x','04410'])expect(()=>resolveMexicoProfilePort(p)).toThrow();});
it('isolates fixture settings, binds loopback, preserves normal dist and restores the environment',async()=>{
 const r=await root();await mkdir(resolve(r,'dist'));await writeFile(resolve(r,'dist/owner.txt'),'ordinary');
 for(const [k,v] of Object.entries({MEXICO_LOCAL_PREVIEW_MODE:'selected',TRADE_DATA_MODE:'census',CANADA_PILOT_MODE:'snapshot',CANADA_PREVIEW_MODE:'retained',CANADA_ACCEPTED_PREVIEW_MODE:'selected'}))vi.stubEnv(k,v);
 vi.mocked(build).mockImplementation(async options=>{expect(process.env.MEXICO_LOCAL_PREVIEW_MODE).toBe('fixture');expect(process.env.TRADE_DATA_MODE).toBe('fixture');for(const k of ['CANADA_PILOT_MODE','CANADA_PREVIEW_MODE','CANADA_ACCEPTED_PREVIEW_MODE'])expect(process.env[k]).toBeUndefined();expect(resolve(options!.outDir!)).toContain('mexico-profile-');expect(options!.server).toMatchObject({host:'127.0.0.1',port:4410});});
 const stop=vi.fn(async()=>{});vi.mocked(preview).mockResolvedValue({port:4410,closed:async()=>{},stop});
 await serveMexicoProfileFixture();expect(vi.mocked(build).mock.calls[0][0]).toEqual(vi.mocked(preview).mock.calls[0][0]);expect(stop).toHaveBeenCalledTimes(1);expect(await readdir(resolve(r,'.tmp'))).toEqual([]);expect(await readFile(resolve(r,'dist/owner.txt'),'utf8')).toBe('ordinary');expect(process.env.MEXICO_LOCAL_PREVIEW_MODE).toBe('selected');expect(process.env.CANADA_PILOT_MODE).toBe('snapshot');expect(process.env.TRADE_DATA_MODE).toBe('census');
});
it.each(['build','server','port'] as const)('cleans owned output and restores environment after %s failure',async failure=>{
 const r=await root();vi.stubEnv('MEXICO_LOCAL_PREVIEW_MODE','selected');vi.stubEnv('TRADE_DATA_MODE','census');const stop=vi.fn(async()=>{});
 if(failure==='build')vi.mocked(build).mockRejectedValue(Error('build failed'));else if(failure==='server')vi.mocked(preview).mockRejectedValue(Error('server failed'));else vi.mocked(preview).mockResolvedValue({port:4411,closed:async()=>{},stop});
 await expect(serveMexicoProfileFixture()).rejects.toThrow();expect(await readdir(resolve(r,'.tmp'))).toEqual([]);expect(process.env.MEXICO_LOCAL_PREVIEW_MODE).toBe('selected');expect(process.env.TRADE_DATA_MODE).toBe('census');if(failure==='port')expect(stop).toHaveBeenCalledTimes(1);
});
it('rejects an output reparse ancestor before writing or building',async()=>{const r=await root(),target=resolve(r,'target');await mkdir(target);await symlink(target,resolve(r,'.tmp'),process.platform==='win32'?'junction':'dir');await expect(serveMexicoProfileFixture()).rejects.toThrow();expect(build).not.toHaveBeenCalled();expect(await readdir(target)).toEqual([]);});
it.each(['build','preview'] as const)('honours termination during %s startup and removes owned output',async phase=>{
 const r=await root(),signals=new Map<string,()=>void>();vi.spyOn(process,'on').mockImplementation(((name:string,listener:()=>void)=>{if(name==='SIGINT'||name==='SIGTERM')signals.set(name,listener);return process;}) as typeof process.on);
 const stop=vi.fn(async()=>{});
 if(phase==='build')vi.mocked(build).mockImplementation(async()=>{signals.get('SIGTERM')!();});
 vi.mocked(preview).mockImplementation(async()=>{if(phase==='preview')signals.get('SIGTERM')!();return {port:4410,stop,closed:async()=>{throw Error('Waited after startup interruption');}};});
 await expect(serveMexicoProfileFixture()).rejects.toThrow('startup interrupted');if(phase==='preview')expect(stop).toHaveBeenCalledTimes(1);else expect(preview).not.toHaveBeenCalled();expect(await readdir(resolve(r,'.tmp'))).toEqual([]);
});
