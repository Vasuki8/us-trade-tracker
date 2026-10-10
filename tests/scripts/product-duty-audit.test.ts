import {afterEach,describe,expect,it} from 'vitest';
import {mkdtemp,readFile,readdir,rm,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {parse} from 'yaml';
import * as audit from '../../scripts/audit-duties';
import {runArchiveCommand} from '../../scripts/archive-product';
import {PRODUCTS,type ProductDefinition} from '../../src/lib/trade/product-registry';
import {syntheticProductFetch} from '../helpers/product-data';

const registry:ProductDefinition[]=[...PRODUCTS,
  {code:'090122',displayName:'Synthetic second product',importable:true,published:false,dutiesAccepted:false},
  {code:'090123',displayName:'Unavailable product',importable:false,published:false,dutiesAccepted:false},
];
const dirs:string[]=[];
const secret='synthetic-audit-key';
afterEach(async()=>{await Promise.all(dirs.splice(0).map(dir=>rm(dir,{recursive:true,force:true})));});
async function workspace(){const root=await mkdtemp(join(tmpdir(),'trade audit space-'));dirs.push(root);return root;}
const options=(outputDir:string,productCode='090121')=>({productCode,end:'2026-08',months:24 as const,outputDir,apiKey:secret});

describe('reviewed product duty audits',()=>{
  it('audits an unpublished product before duty acceptance, keeping its identity and amounts',async()=>{
    const root=await workspace();let requests=0;
    const base=syntheticProductFetch('090122',{duties:true,scale:2});
    const fetcher=(async(input,init)=>{requests++;expect(new URL(String(input)).searchParams.get('I_COMMODITY')).toBe('090122');return base(input,init);}) as typeof fetch;
    const report=await audit.runDutyAudit(options(root,'090122'),fetcher,registry);
    expect(report).toMatchObject({schemaVersion:1,productCode:'090122',fromMonth:'2024-09',toMonth:'2026-08',eligibleForRelease:true});
    expect(requests).toBe(96);expect(report.months).toHaveLength(24);expect(report.rawFiles).toHaveLength(96);
    expect(report.months.every(month=>month.worldAvailable&&month.countryReconciliation==='verified')).toBe(true);
    const dataset=JSON.parse(await readFile(join(root,'duty-dataset.json'),'utf8'));
    expect(dataset.observations).toHaveLength(72);
    expect(dataset.observations.every((row:{productCode:string})=>row.productCode==='090122')).toBe(true);
    expect(dataset.observations.find((row:{month:string;geography:string})=>row.month==='2026-08'&&row.geography==='world')).toMatchObject({
      calculatedDuty:{valueUsd:24},consumptionValue:{valueUsd:400},dutiableValue:{valueUsd:240},coverage:{uncalculatedDutiableValueUsd:80},
    });
    for(const file of report.rawFiles){
      const text=await readFile(join(root,file.path),'utf8');expect(text).not.toContain(secret);
      expect(new URL(JSON.parse(text).requestUrl).searchParams.get('I_COMMODITY')).toBe('090122');
    }
    expect((await readdir(root)).sort()).toEqual(['audit.json','duty-dataset.json','raw']);
    expect(registry.find(product=>product.code==='090122')).toMatchObject({published:false,dutiesAccepted:false});
  });

  it.each(['../090121','090121\n','09012','090124','090123'])('rejects unavailable or unsafe product %j before fetching or writing',async code=>{
    const root=await workspace(),outputDir=join(root,'audit');let requests=0;
    const fetcher=(async()=>{requests++;throw new Error('Unexpected Census request');}) as typeof fetch;
    await expect(audit.runDutyAudit(options(outputDir,code),fetcher,registry)).rejects.toThrow();
    expect(requests).toBe(0);await expect(stat(outputDir)).rejects.toMatchObject({code:'ENOENT'});
  });

  it('keeps both products separate and refuses to overwrite a retained audit',async()=>{
    expect(typeof audit.resolveDutyAuditOptions).toBe('function');
    const root=await workspace();
    for(const code of ['090121','090122']){
      const selected=audit.resolveDutyAuditOptions(['--product',code,'--end','2026-08'],{CENSUS_API_KEY:secret},registry);
      const outputDir=join(root,selected.outputDir);
      const report=await audit.runDutyAudit({...selected,outputDir},syntheticProductFetch(code,{duties:true,scale:code==='090121'?1:2}),registry);
      expect(report.productCode).toBe(code);
    }
    const coffeePath=join(root,'.tmp/duty-audit/090121/audit.json');
    const coffee=await readFile(coffeePath),second=JSON.parse(await readFile(join(root,'.tmp/duty-audit/090122/audit.json'),'utf8'));
    expect(second.productCode).toBe('090122');expect(JSON.parse(coffee.toString()).productCode).toBe('090121');
    let requests=0;
    await expect(audit.runDutyAudit(options(join(root,'.tmp/duty-audit/090121')),(async()=>{requests++;throw new Error('Unexpected');}) as typeof fetch,registry)).rejects.toThrow(/already|existing/i);
    expect(requests).toBe(0);expect(await readFile(coffeePath)).toEqual(coffee);
  });
});

describe('audit command selection',()=>{
  it('keeps the legacy coffee command and derives a product-specific evidence directory',()=>{
    expect(typeof audit.resolveDutyAuditOptions).toBe('function');
    expect(audit.resolveDutyAuditOptions(['--end','2026-08'],{CENSUS_API_KEY:secret})).toMatchObject({productCode:'090121',end:'2026-08',months:24,outputDir:join('.tmp','duty-audit','090121'),apiKey:secret});
    expect(audit.resolveDutyAuditOptions(['--product','090122','--end','2026-08'],{CENSUS_API_KEY:secret},registry)).toMatchObject({productCode:'090122',outputDir:join('.tmp','duty-audit','090122')});
  });
  it('preserves an explicitly selected output directory with spaces',()=>{
    expect(typeof audit.resolveDutyAuditOptions).toBe('function');
    expect(audit.resolveDutyAuditOptions(['--end','2026-08','--output','saved audits/coffee'],{CENSUS_API_KEY:secret}).outputDir).toBe('saved audits/coffee');
  });
  it.each([
    ['--product','../090121','--end','2026-08'],['--product','090124','--end','2026-08'],
    ['--product','090123','--end','2026-08'],['--end','2026-13'],[],['--end','2026-08','--product','090121','--product','090122'],
  ].map(args=>({args})))('rejects invalid or ambiguous CLI input $args',({args})=>{
    expect(typeof audit.resolveDutyAuditOptions).toBe('function');
    expect(()=>audit.resolveDutyAuditOptions(args,{CENSUS_API_KEY:secret},registry)).toThrow();
  });
});

it('scopes workflow evidence to validated product output before giving the audit its key',async()=>{
  const workflow=parse(await readFile('.github/workflows/audit-census-duties.yml','utf8'));
  expect(workflow.on.workflow_dispatch.inputs.product_code).toMatchObject({type:'string',default:'090121'});
  const steps=workflow.jobs.audit.steps as any[],preflight=steps.find(step=>step.id==='preflight');
  expect(preflight).toBeDefined();expect(preflight.run).toBe('npm run data:archive -- preflight');
  const retrieve=steps.findIndex(step=>step.env?.CENSUS_API_KEY);expect(steps.indexOf(preflight)).toBeLessThan(retrieve);
  const upload=steps.find(step=>step.uses?.startsWith('actions/upload-artifact@'));
  expect(upload.if).toContain("steps.preflight.outcome == 'success'");
  expect(upload.with.name).toBe('census-${{ steps.preflight.outputs.product_code }}-duty-audit');
  expect(upload.with.path).toBe('.tmp/duty-audit/${{ steps.preflight.outputs.product_code }}/');
  const root=await workspace(),output=join(root,'preflight-output');
  await runArchiveCommand(['preflight'],{PRODUCT_CODE:'090122',REPORTING_MONTH:'2026-08',GITHUB_WORKSPACE:root,GITHUB_OUTPUT:output},undefined,registry);
  const values=Object.fromEntries((await readFile(output,'utf8')).trim().split('\n').map(line=>line.split('=')));
  const artifactPath=upload.with.path.replace('${{ steps.preflight.outputs.product_code }}',values.product_code);
  expect(artifactPath).toBe('.tmp/duty-audit/090122/');
  await expect(runArchiveCommand(['preflight'],{PRODUCT_CODE:'../../',REPORTING_MONTH:'2026-08',GITHUB_WORKSPACE:root,GITHUB_OUTPUT:join(root,'bad-output')},undefined,registry)).rejects.toThrow();
  await expect(stat(join(root,'bad-output'))).rejects.toMatchObject({code:'ENOENT'});
  for(const step of steps){if(step.run)expect(step.run).not.toContain('${{');expect(Object.keys(step.env??{}).some(key=>key.startsWith('R2_'))).toBe(false);}
});
