import {describe,expect,it} from 'vitest';
import {canadaReviewedPublications} from '../../scripts/country-publications';
import {projectCanadaPublications} from '../../scripts/project-canada-publications';

const launcher=await import('../../scripts/diagnose-country-bulk').catch(()=>null);
it('implements the optional launcher',()=>expect(launcher).not.toBeNull());
it('rejects nonabsolute interpreter and unknown options',()=>{
  expect(launcher).not.toBeNull();
  for(const args of [[],['--python','python','--output','x'],['--python','C:/Python/python.exe','--output','x','--months','1']])expect(()=>launcher!.resolveBulkOptions(args)).toThrow();
});
it('sanitizes credentials and disables bytecode',()=>{
  expect(launcher).not.toBeNull();
  expect(launcher!.cleanBulkEnvironment({PATH:'safe',SystemRoot:'C:/Windows',CENSUS_API_KEY:'secret',R2_SECRET_ACCESS_KEY:'secret',AWS_ACCESS_KEY_ID:'secret',PYTHONPATH:'unsafe'})).toEqual({PATH:'safe',SystemRoot:'C:/Windows',PYTHONDONTWRITEBYTECODE:'1'});
});
it('checks versions before invoking the bounded supervisor with the exact projection',async()=>{
  expect(launcher).not.toBeNull();let invoked=false;
  const options=launcher!.resolveBulkOptions(['--python','C:/Python/python.exe','--output','data/backups/canada-country-audit/new','--preflight']);
  const adapters={platform:'win32',nodeVersion:'24.0.0',now:()=>0,probe:async()=>({implementation:'CPython',version:[3,12,0]}),supervise:async(exe:string,args:string[],input:string,timeout:number)=>{
    invoked=true;expect(exe).toBe(options.python);expect(args).toContain('-B');expect(args).toContain('scripts.country_bulk.runner');expect(args).toContain('--preflight');expect(JSON.parse(input)).toEqual(projectCanadaPublications());expect(timeout).toBe(3600000);return 0;
  }};
  expect(await launcher!.runBulkDiagnostic(options,adapters)).toBe(0);expect(invoked).toBe(true);
  invoked=false;await expect(launcher!.runBulkDiagnostic(options,{...adapters,platform:'linux'})).rejects.toThrow();expect(invoked).toBe(false);
  await expect(launcher!.runBulkDiagnostic(options,{...adapters,probe:async()=>({implementation:'PyPy',version:[3,12,0]})})).rejects.toThrow();
  await expect(launcher!.runBulkDiagnostic(options,{...adapters,probe:async()=>({implementation:'CPython',version:[3,10,0]})})).rejects.toThrow();
});

describe('Canada bulk publication projection',()=>{
  it('projects the existing reviewed ledger with copies and no network',async()=>{
    const module=await import('../../scripts/project-canada-publications').catch(()=>null);
    expect(module,'Publication projection implementation is missing').not.toBeNull();
    const projected=module!.projectCanadaPublications();
    expect(projected).toEqual({schemaVersion:1,countryCode:'1220',publications:canadaReviewedPublications});
    expect(projected.publications).toHaveLength(7);
    projected.publications[0].valueUsd=0;
    expect(canadaReviewedPublications[0].valueUsd).toBe(24510300000);
  });
});
