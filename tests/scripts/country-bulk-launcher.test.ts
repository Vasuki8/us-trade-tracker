import {describe,expect,it} from 'vitest';
import {canadaReviewedPublications} from '../../scripts/country-publications';

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
