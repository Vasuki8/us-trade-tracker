import {expect,it} from 'vitest';
import {buildProfileView} from '../../src/lib/trade/profile';
import {sampleRelease} from '../helpers/release';
const selection={direction:'imports' as const,months:60 as const,countryCodes:[]};
it('derives national changes and country shares from matching windows',()=>{
  const view=buildProfileView(sampleRelease(),selection);
  expect(view.trailingYear).toEqual({current:1200,previous:600,changeUsd:600,changePercent:100});
  expect(view.latestMonth.changePercent).toBe(100);
  expect(view.partners[0]).toMatchObject({valueUsd:300,sharePercent:25});
  expect(view.series[0].points).toHaveLength(24);
});
it('enforces three distinct country selections and direction-specific values',()=>{
  const release=sampleRelease();
  expect(()=>buildProfileView(release,{...selection,countryCodes:['1220','4759','2010','4280']})).toThrow();
  expect(()=>buildProfileView(release,{...selection,countryCodes:['-']})).toThrow();
  expect(()=>buildProfileView(release,{...selection,countryCodes:['0003']})).toThrow();
  const view=buildProfileView(release,{direction:'exports',months:12,countryCodes:['1220','1220']});
  expect(view.series).toHaveLength(1);
  expect(view.series[0].points[0]).toMatchObject({month:'2025-01',valueUsd:50});
  expect(view.provenance.measure).toBe('ALL_VAL_MO');
});
it('leaves incomplete partners and zero-denominator shares unavailable',()=>{
  const release=sampleRelease();
  release.observations=release.observations.filter(r=>!(r.partnerCode==='1220'&&r.month==='2025-06'));
  expect(buildProfileView(release,selection).partners.find(p=>p.code==='1220')?.valueUsd).toBeNull();
  const zero=sampleRelease(); zero.observations.forEach(r=>{r.valueUsd=0;});
  expect(buildProfileView(zero,selection).partners[0].sharePercent).toBeNull();
});
it('breaks incompatible classification history and rejects cross-interval growth',()=>{
  const release=sampleRelease();
  release.classificationIntervals=[{from:'2024-01',to:'2024-12',evidenceUrl:'https://example.invalid/a'},{from:'2025-01',to:'2025-12',evidenceUrl:'https://example.invalid/b'}];
  const view=buildProfileView(release,selection);
  expect(view.trailingYear.changePercent).toBeNull();
  expect(view.latestMonth.changePercent).toBeNull();
  expect(view.series[0].points.find(p=>p.month==='2025-01')?.breakBefore).toBe(true);
});
it('rejects a partner exceeding the matching national total',()=>{
  const release=sampleRelease();
  release.observations.filter(r=>r.partnerCode==='1220').forEach(r=>{r.valueUsd=1000;});
  expect(()=>buildProfileView(release,selection)).toThrow(/world total/i);
});
it('can calculate the earlier fixture year using integer dollar observations',()=>{
  const release=sampleRelease();release.reportingMonth='2024-12';
  const view=buildProfileView(release,selection);
  expect(view.trailingYear.current).toBe(600);
  expect(view.partners.find(p=>p.code==='4280')?.valueUsd).toBe(168);
});

it.each([
  ['exact identity','imports/090121/2025-01/country/1220/GEN_VAL_MO',true],
  ['another product','imports/090111/2025-01/country/1220/GEN_VAL_MO',false],
  ['another direction','exports/090121/2025-01/country/1220/ALL_VAL_MO',false],
  ['another measure','imports/090121/2025-01/country/1220/ALL_VAL_MO',false],
  ['another geography','imports/090121/2025-01/world/1220/GEN_VAL_MO',false],
  ['another partner','imports/090121/2025-01/country/4759/GEN_VAL_MO',false],
  ['another month','imports/090121/2024-12/country/1220/GEN_VAL_MO',false],
] as const)('profile recorded revision matches all identity dimensions: %s',(_case,key,want)=>{
  const release=sampleRelease();release.revisedKeys=[key];
  const view=buildProfileView(release,{...selection,countryCodes:['1220','4759']});
  expect(view.series[0].points.find(p=>p.month==='2025-01')?.recordedRevision).toBe(want);
  expect(view.series[1].points.find(p=>p.month==='2025-01')?.recordedRevision).toBe(_case==='another partner');
  expect(view.provenance.revised).toBe(true);
});

it('keeps world and country revision marks separate across directions and windows',()=>{
  const release=sampleRelease();release.revisedKeys=[
    'imports/090121/2024-07/country/1220/GEN_VAL_MO',
    'exports/090121/2025-01/world/-/ALL_VAL_MO',
  ];
  const selected=buildProfileView(release,{...selection,months:12,countryCodes:['1220']});
  expect(selected.series[0].points.map(p=>p.recordedRevision)).toEqual(Array(12).fill(false));
  expect(selected.provenance.revised).toBe(true);
  const world=buildProfileView(release,{...selection,direction:'exports'});
  expect(world.series[0].points.filter(p=>p.recordedRevision).map(p=>p.month)).toEqual(['2025-01']);
  const imports=buildProfileView(release,selection);
  expect(imports.series[0].points.every(p=>p.recordedRevision===false)).toBe(true);
});

it.each(['removed','missing','suppressed','zero'] as const)('retains a recorded revision for a %s monthly value',status=>{
  const release=sampleRelease();
  const row=release.observations.find(r=>r.direction==='imports'&&r.partnerCode==='1220'&&r.month==='2025-01')!;
  if(status==='removed')release.observations=release.observations.filter(r=>r!==row);
  else {row.status=status==='zero'?'reported':status;row.valueUsd=status==='zero'?0:null;}
  release.revisedKeys=['imports/090121/2025-01/country/1220/GEN_VAL_MO'];
  const point=buildProfileView(release,{...selection,countryCodes:['1220']}).series[0].points.find(p=>p.month==='2025-01');
  expect(point).toMatchObject({valueUsd:status==='zero'?0:null,recordedRevision:true,classificationVerified:true,breakBefore:false});
});

it('leaves an empty initial comparison unmarked and preserves calculations when only keys change',()=>{
  const release=sampleRelease(),before=buildProfileView(release,selection);
  expect(before.provenance.revised).toBe(false);
  expect(before.series[0].points.every(p=>p.recordedRevision===false)).toBe(true);
  release.revisedKeys=['imports/090121/2025-01/world/-/GEN_VAL_MO'];
  const after=buildProfileView(release,selection);
  expect(after.latestMonth).toEqual(before.latestMonth);expect(after.trailingYear).toEqual(before.trailingYear);
  expect(after.partners).toEqual(before.partners);
  expect(after.series[0].points.map(({recordedRevision,...point})=>point)).toEqual(before.series[0].points.map(({recordedRevision,...point})=>point));
  expect(after.provenance).toEqual({...before.provenance,revised:true});
});
