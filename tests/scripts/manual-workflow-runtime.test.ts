import {expect,it} from 'vitest';
import {readFile,readdir} from 'node:fs/promises';
import {parse} from 'yaml';

type Environment=Record<string,unknown>;
type Step={run?:string;env?:Environment};
type Workflow={env?:Environment;jobs:Record<string,{env?:Environment;steps:Step[]}>};
function effectiveEnvironment(workflowEnv:Environment|undefined,jobEnv:Environment|undefined,stepEnv:Environment|undefined):Environment{
  return {...workflowEnv,...jobEnv,...stepEnv};
}
const files=(await readdir('.github/workflows')).filter(name=>/\.ya?ml$/.test(name)).sort();
const suiteSteps=(await Promise.all(files.map(async file=>{
  const workflow=parse(await readFile(`.github/workflows/${file}`,'utf8')) as Workflow;
  return Object.entries(workflow.jobs).flatMap(([jobName,job])=>job.steps
    .filter(step=>/^\s*npm\s+test(?:\s|$)/m.test(step.run??''))
    .map(step=>({id:`${file}:${jobName}`,environment:effectiveEnvironment(workflow.env,job.env,step.env)})));
}))).flat();

// Removing a manual job's interpreter declaration must fail before a real data run is needed.
it('discovers the four existing full-unit-suite jobs without an empty or omitted workflow',()=>{
  expect(suiteSteps.map(step=>step.id).sort()).toEqual([
    'audit-census-country.yml:audit','audit-census-duties.yml:audit','checks.yml:check','import-census.yml:import',
  ]);
});
it.each(suiteSteps)('$id supplies the packaging interpreter to its unit test process',({environment})=>{
  expect(environment.SITE_PACKAGE_PYTHON).toBe('python3');
});
it.each([
  {name:'workflow default',workflow:{SITE_PACKAGE_PYTHON:'python3'},job:undefined,step:undefined},
  {name:'job override',workflow:{SITE_PACKAGE_PYTHON:'wrong'},job:{SITE_PACKAGE_PYTHON:'python3'},step:undefined},
  {name:'step override',workflow:{SITE_PACKAGE_PYTHON:'wrong'},job:{SITE_PACKAGE_PYTHON:'wrong'},step:{SITE_PACKAGE_PYTHON:'python3'}},
])('resolves the effective interpreter from the $name',({workflow,job,step})=>{
  expect(effectiveEnvironment(workflow,job,step).SITE_PACKAGE_PYTHON).toBe('python3');
});
it.each(['','wrong-python'])('does not hide an invalid test-step override %j behind a valid job',value=>{
  const environment=effectiveEnvironment({SITE_PACKAGE_PYTHON:'python3'},{SITE_PACKAGE_PYTHON:'python3'},{SITE_PACKAGE_PYTHON:value});
  expect(environment.SITE_PACKAGE_PYTHON).toBe(value);
  expect(environment.SITE_PACKAGE_PYTHON).not.toBe('python3');
});
