import {expect,it} from 'vitest';
import {readFile} from 'node:fs/promises';
import {parse} from 'yaml';
const workflow=parse(await readFile('.github/workflows/import-census.yml','utf8'));
const steps=workflow.jobs.import.steps as any[];
it('uploads only a ready failure-evidence directory when retrieval fails',()=>{
 const upload=steps.find(s=>s.with?.name==='census-${{ steps.preflight.outputs.product_code }}-import-failure');
 expect(upload,'separate diagnostic artifact').toBeDefined();if(!upload)return;
 expect(upload.with.path).toBe('${{ steps.import.outputs.failure_evidence_path }}/');
 expect(upload.with['include-hidden-files']).toBe(true);expect(upload.with['if-no-files-found']).toBe('error');expect(upload.with['retention-days']).toBe(7);
 expect(upload.env).toBeUndefined();
 const predicate=new Function('failure','steps','return ('+upload.if+');');
 const allowed=(jobFailed:boolean,importState:string,path:string,preflight='success')=>predicate(()=>jobFailed,{preflight:{outcome:preflight},import:{outcome:importState,outputs:{failure_evidence_path:path}}});
 expect(allowed(true,'failure','.tmp/import-failure/current')).toBe(true);
 expect(allowed(false,'success','.tmp/import-failure/current')).toBe(false);
 expect(allowed(true,'success','.tmp/import-failure/current')).toBe(false);
 expect(allowed(true,'skipped','.tmp/import-failure/current')).toBe(false);
 expect(allowed(true,'cancelled','.tmp/import-failure/current')).toBe(false);
 expect(allowed(true,'failure','')).toBe(false);
 expect(allowed(true,'skipped','', 'failure')).toBe(false);
});
it('keeps the normal release artifact success-only and leaves source execution limits intact',()=>{
 const release=steps.find(s=>s.with?.name?.endsWith('}-release'));
 expect(release.if).toBe('!inputs.archive_to_r2');expect(release.if).not.toContain('always');
 expect(workflow.jobs.import['timeout-minutes']).toBe(20);expect(workflow.concurrency).toEqual({group:'census-data-import','cancel-in-progress':false});
 const retrieval=steps.find(s=>s.id==='import');expect(retrieval.env.CENSUS_API_KEY).toBe('${{ secrets.CENSUS_API_KEY }}');
 expect(retrieval.run).toContain('--months 60');expect(retrieval.run).not.toContain('failure-evidence');
 expect(Object.keys(workflow.on)).toEqual(['workflow_dispatch']);
});
