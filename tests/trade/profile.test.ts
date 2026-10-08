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
