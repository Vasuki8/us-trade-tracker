import {expect,it,vi} from 'vitest';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {parse} from 'yaml';
import {resolveCountryArchiveOptions,runCountryArchive} from '../../scripts/country-archive';
const root=resolve('.'),output='data/backups/canada-country-archive/test-cli',sha='a'.repeat(64);
it.each([
  ['unknown','--output',output],['prepare','--output',output,'--yes'],
  ['prepare','--output','../outside','--owner-instruction-file','owner.txt'],
  ['prepare','--output',output,'--output',output,'--owner-instruction-file','owner.txt'],
  ['verify-selected','--output',output,'--initialize'],
  ['verify-selected','--output',output,'--bundle-sha256',sha,'--bundle-bytes','10'],
  ['verify','--output',output,'--bundle-sha256',sha,'--bundle-bytes','1e3'],
  ['upload','--output',output,'--capability-file','caps.json','--bundle-file','bundle.json'],
  ['capabilities','--output',output,'--bundle-sha256',sha,'--bundle-bytes','10','--bundle-path','.env'],
].map(args=>({args})))('rejects unsafe or mode-incompatible options $args',({args})=>expect(()=>resolveCountryArchiveOptions(args,root)).toThrow());
it('separates initialization from read-only selected verification',()=>{expect(resolveCountryArchiveOptions(['verify-selected','--output',output],root).mode).toBe('verify-selected');expect(resolveCountryArchiveOptions(['verify','--output',output,'--bundle-sha256',sha,'--bundle-bytes','10','--initialize'],root).initialize).toBe(true);});
it('preflight validates inputs without reading credentials or creating a store',async()=>{const factory=vi.fn(()=>{throw new Error('secret');}),result=await runCountryArchive(resolveCountryArchiveOptions(['verify-selected','--output',output,'--preflight'],root),{},factory);expect(result.exitCode).toBe(0);expect(factory).not.toHaveBeenCalled();expect(result.summary).not.toContain('secret');});
it('sanitizes operational failures rather than printing private URLs or SDK stacks',async()=>{const factory=vi.fn(()=>{throw new Error('https://private?X-Amz-Signature=secret');}),result=await runCountryArchive(resolveCountryArchiveOptions(['verify-selected','--output',output],root),{},factory);expect(result.exitCode).toBe(1);expect(result.summary).not.toContain('secret');expect(result.summary).not.toContain('https://');});
it.each(['canada-archive-capabilities.yml','verify-canada-archive.yml'])('guards %s with main/private, concurrency, deadlines and scoped private artifacts',async file=>{const text=await readFile(resolve('.github/workflows',file),'utf8'),workflow=parse(text),job=Object.values(workflow.jobs)[0] as any;expect(job.if).toContain("github.ref == 'refs/heads/main'");expect(job.if).toContain('github.event.repository.private == true');expect(workflow.permissions).toEqual({contents:'read'});expect(workflow.concurrency).toEqual({group:'canada-private-archive-1220','cancel-in-progress':false});expect(job['timeout-minutes']).toBeLessThanOrEqual(185);const transport=job.steps.filter((s:any)=>s.env?.R2_SECRET_ACCESS_KEY);expect(transport).toHaveLength(1);expect(transport[0].run).not.toMatch(/echo|printenv|set -x/);expect(transport[0].env.CENSUS_API_KEY).toBeUndefined();const index=job.steps.indexOf(transport[0]);expect(job.steps.slice(0,index).some((s:any)=>s.id==='preflight'&&s.run.includes('--preflight'))).toBe(true);expect(job.steps.filter((s:any)=>s.uses?.startsWith('actions/upload-artifact@')).every((s:any)=>s.with['retention-days']===(file.startsWith('canada-')?1:7))).toBe(true);expect(text).not.toContain('CENSUS_API_KEY');expect(job.steps.filter((s:any)=>s.uses).every((s:any)=>/@[a-f0-9]{40}$/.test(s.uses))).toBe(true);});
