import {expect,it} from 'vitest';
import {readFile,readdir} from 'node:fs/promises';
import {parse} from 'yaml';

type Environment=Record<string,unknown>;
type Step={run?:string;env?:Environment};
type Workflow={env?:Environment;jobs:Record<string,{env?:Environment;steps:Step[];'timeout-minutes'?:number}>};
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
it('discovers every existing unit-test job without an empty or omitted workflow',()=>{
  expect(suiteSteps.map(step=>step.id).sort()).toEqual([
    'audit-census-country.yml:audit','audit-census-duties.yml:audit','checks.yml:check','import-census.yml:import','probe-census-cocoa.yml:probe',
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

it.each([
  {file:'import-census.yml',jobName:'import'},
  {file:'audit-census-duties.yml',jobName:'audit'},
])('$file bounds prerequisite test workers before Census retrieval',async({file,jobName})=>{
  const workflow=parse(await readFile('.github/workflows/'+file,'utf8')) as Workflow;
  const job=workflow.jobs[jobName];
  const tests=job.steps.filter(step=>/^\s*npm\s+test(?:\s|$)/m.test(step.run??''));
  expect(tests).toHaveLength(1);
  expect(tests[0].run?.trim()).toBe('npm test -- --maxWorkers=2');
  expect(effectiveEnvironment(workflow.env,job.env,tests[0].env).SITE_PACKAGE_PYTHON).toBe('python3');
  expect(job['timeout-minutes']).toBe(20);
});
