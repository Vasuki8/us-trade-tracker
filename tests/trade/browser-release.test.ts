import {expect,it} from 'vitest';
import fixture from '../fixtures/product-release.json';
import {sampleRelease} from '../helpers/release';
import {sampleDutyRelease} from '../helpers/duties';
import {encodeBrowserRelease,decodeBrowserRelease} from '../../src/lib/trade/browser-release';
import {buildProfileView} from '../../src/lib/trade/profile';
import {buildChangesView} from '../../src/lib/trade/changes';
import {buildDutyView} from '../../src/lib/trade/duties';
import {serializeCsv,serializeChangesCsv,serializeDutyCsv} from '../../src/lib/trade/downloads';
import {validateRelease} from '../../scripts/prepare-release';
import type {Release} from '../../src/lib/trade/types';

it.each([['legacy',sampleRelease()],['duties',sampleDutyRelease()],['full fixture',fixture as Release]])('round-trips the entire %s release through the browser payload',(_name,release)=>{
  const original=structuredClone(release);
  const decoded=decodeBrowserRelease(encodeBrowserRelease(release));
  expect(decoded).toEqual(original);
  expect(release).toEqual(original);
  validateRelease(decoded);
  decoded.sourceUrls.push('https://example.invalid/decoded-only');
  expect(release.sourceUrls).toEqual(original.sourceUrls);
});

it('preserves changing names, descriptions, ordering, statuses, qualifications and revision evidence',()=>{
  const release=sampleDutyRelease();
  const country=release.observations.find(row=>row.partnerCode==='1220')!;
  country.partnerName='Canada, "historical"';country.description='Coffee\nold description';
  const missing=release.observations.find(row=>row.partnerCode==='1220'&&row.month==='2025-01')!;
  missing.status='missing';missing.valueUsd=null;
  const suppressed=release.observations.find(row=>row.partnerCode==='1220'&&row.month==='2025-02')!;
  suppressed.status='suppressed';suppressed.valueUsd=null;
  const zero=release.observations.find(row=>row.partnerCode==='1220'&&row.month==='2025-03')!;
  zero.status='reported';zero.valueUsd=0;
  release.duties.observations[0].coverage.uncalculatedDutiableValueUsd=20;
  release.duties.observations[1].calculatedDuty={valueUsd:null,status:'missing'};
  release.duties.observations[1].coverage={status:'unavailable',uncalculatedDutiableValueUsd:null};
  release.duties.observations[2].consumptionValue={valueUsd:null,status:'suppressed'};
  release.duties.observations[2].coverage={status:'unavailable',uncalculatedDutiableValueUsd:null};
  release.duties.observations.push({...structuredClone(release.duties.observations[0]),geography:'country',partnerCode:'1220',partnerName:'Canada duty label'});
  release.revisedKeys=['090121/imports/2025-01/country/1220/GEN_VAL_MO'];
  release.duties.revisedKeys=['090121/2024-01/world/-'];
  release.classificationIntervals=[{from:'2024-01',to:'2024-12',evidenceUrl:'https://example.invalid/old'},{from:'2025-01',to:'2025-12',evidenceUrl:'https://example.invalid/new'}];
  release.observations.reverse();release.duties.observations.reverse();
  expect(decodeBrowserRelease(encodeBrowserRelease(release))).toEqual(release);
});

it.each(['imports','exports'] as const)('keeps %s profile and changes calculations and CSV byte-for-byte identical',direction=>{
  const release=fixture as Release,decoded=decodeBrowserRelease(encodeBrowserRelease(release));
  for(const months of [12,60] as const)for(const countryCodes of [[],['1220','4759','2010']]){
    const selection={direction,months,countryCodes};
    expect(buildProfileView(decoded,selection)).toEqual(buildProfileView(release,selection));
    expect(serializeCsv(buildProfileView(decoded,selection))).toBe(serializeCsv(buildProfileView(release,selection)));
  }
  for(const metric of ['dollars','share'] as const){
    expect(buildChangesView(decoded,direction)).toEqual(buildChangesView(release,direction));
    expect(serializeChangesCsv(buildChangesView(decoded,direction),metric)).toBe(serializeChangesCsv(buildChangesView(release,direction),metric));
  }
});

it('keeps monthly and rolling duty comparisons, absent countries and CSV byte-for-byte identical',()=>{
  const release=fixture as Release,decoded=decodeBrowserRelease(encodeBrowserRelease(release));
  for(const countries of [[],['1220','4759','9999']]){
    expect(buildDutyView(decoded,countries)).toEqual(buildDutyView(release,countries));
    expect(serializeDutyCsv(buildDutyView(decoded,countries))).toBe(serializeDutyCsv(buildDutyView(release,countries)));
  }
});

it.each([
  ['format version',(wire:any)=>{wire.version=2;}],
  ['month index',(wire:any)=>{wire.observations[0][2]=wire.months.length;}],
  ['partner index',(wire:any)=>{wire.observations[0][3]=-1;}],
  ['description index',(wire:any)=>{wire.observations[0][0]=0.5;}],
  ['direction',(wire:any)=>{wire.observations[0][1]=2;}],
  ['missing money cell',(wire:any)=>{wire.observations[0].pop();}],
  ['invalid money cell',(wire:any)=>{wire.observations[0][4]=-3;}],
  ['invalid duty coverage',(wire:any)=>{wire.duties.observations[0][5]=-2;}],
  ['absent v2 duties',(wire:any)=>{delete wire.duties;}],
])('rejects corrupt %s instead of inventing data',(_name,corrupt)=>{
  const wire=JSON.parse(encodeBrowserRelease(sampleDutyRelease()));corrupt(wire);
  expect(()=>decodeBrowserRelease(JSON.stringify(wire))).toThrow(/browser release/i);
});

it('rejects unsupported input measures and product identities before compacting them',()=>{
  const release=sampleRelease();release.observations[0].measure='ALL_VAL_MO';
  expect(()=>encodeBrowserRelease(release)).toThrow(/browser release/i);
  release.observations[0].measure='GEN_VAL_MO';release.observations[0].productCode='090122';
  expect(()=>encodeBrowserRelease(release)).toThrow(/browser release/i);
});
