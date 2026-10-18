import {expect,it} from 'vitest';
import {readFile} from 'node:fs/promises';
import {parse} from 'yaml';

type Step={id?:string;name?:string;run?:string;uses?:string;env?:Record<string,string>;with?:Record<string,unknown>;if?:string};
const text=await readFile('.github/workflows/accept-retained-census.yml','utf8');
const workflow=parse(text);
const steps=(phase:string):Step[]=>workflow.jobs[phase].steps;
const command=(phase:string,id:string)=>steps(phase).find(step=>step.id===id)!;

it('has a main-only manual gate, fixed products and serialized bounded jobs',()=>{
  expect(Object.keys(workflow.on)).toEqual(['workflow_dispatch']);
  expect(workflow.on.workflow_dispatch.inputs.phase.options).toEqual(['stage','promote']);
  expect(workflow.on.workflow_dispatch.inputs.product_code.options).toEqual(['090240','180100']);
  expect(workflow.permissions).toEqual({contents:'read',actions:'read'});
  expect(workflow.concurrency).toEqual({group:'census-data-import','cancel-in-progress':false});
  for(const [phase,minutes] of [['stage',15],['promote',10]] as const){
    expect(workflow.jobs[phase].if).toContain("github.ref == 'refs/heads/main'");
    expect(workflow.jobs[phase]['timeout-minutes']).toBe(minutes);
    expect({...workflow.env,...workflow.jobs[phase].env}.SITE_PACKAGE_PYTHON).toBe('python3');
    expect(steps(phase).some(step=>step.run==='npm test -- --maxWorkers=2')).toBe(true);
    expect(steps(phase).some(step=>step.run==='python3 -m unittest discover -s tests/workflows -v')).toBe(true);
  }
  expect(text).not.toMatch(/CENSUS_API_KEY|data:import|data:audit|schedule:|pull_request:|\$\{\{\s*inputs\.[^}]*\}\}[^\n]*--/);
});

it('stages the offline authenticated pack before the first provider access and never promotes',()=>{
  const ids=steps('stage').filter(step=>step.id).map(step=>step.id);
  expect(ids).toEqual(['source','pack','restore','recover','stage','pair','backup','receipt']);
  expect(command('stage','source').run).toContain('retained_product_artifact.py source');
  expect(command('stage','pack').run).toContain('data:archive -- pack');
  expect(command('stage','pack').run).toContain('retained_product_artifact.py check-bundle');
  expect(command('stage','recover').run).toContain('data:archive -- recover');
  expect(command('stage','pair').run).toContain('--candidate .tmp/retained/archive/candidate.json');
  const backup=command('stage','backup');
  expect(backup.uses).toBe('actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9');
  expect(String(backup.with?.path).trim().split('\n')).toEqual(['.tmp/retained/archive/bundle.json','.tmp/retained/archive/candidate.json']);
  expect(backup.with).toMatchObject({'include-hidden-files':true,'if-no-files-found':'error','retention-days':7});
  expect(command('stage','receipt').env?.BACKUP_ARTIFACT_ID).toBe('${{ steps.backup.outputs.artifact-id }}');
  expect(command('stage','receipt').env?.BACKUP_ARTIFACT_DIGEST).toBe('${{ steps.backup.outputs.artifact-digest }}');
  expect(steps('stage').some(step=>step.run?.includes('data:archive -- promote'))).toBe(false);
});

it('promotes only the downloaded authenticated pair after offline verification',()=>{
  expect(steps('promote').filter(step=>step.id).map(step=>step.id)).toEqual(['backup','verify','promote']);
  expect(command('promote','backup').run).toContain('retained_product_artifact.py backup');
  expect(command('promote','verify').run).toContain('--run-dir .tmp/retained/backup/files');
  expect(command('promote','promote').run).toContain('--run-dir .tmp/retained/backup/files');
  expect(steps('promote').some(step=>/data:archive -- (restore|stage)|data:import/.test(step.run??''))).toBe(false);
  expect(steps('promote').find(step=>step.name==='Retain promotion evidence')?.if).toBe('always()');
});

it('places tokens and R2 credentials only at their required boundaries',()=>{
  for(const phase of ['stage','promote']){
    for(const step of steps(phase)){
      if(step.env?.GH_TOKEN) expect([phase==='stage'?'source':'backup']).toContain(step.id);
      if(step.env?.R2_SECRET_ACCESS_KEY) expect(phase==='stage'?['restore','stage']:['promote']).toContain(step.id);
      if(step.run) expect(step.run).not.toContain('${{ inputs.');
    }
  }
});
