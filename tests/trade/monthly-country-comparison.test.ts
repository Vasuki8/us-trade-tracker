import {expect,it} from 'vitest';
import {sampleRelease} from '../helpers/release';
import {buildMonthlyChangesView,buildChangesView,selectCountryChanges} from '../../src/lib/trade/changes';
import {serializeSelectedCountriesCsv} from '../../src/lib/trade/downloads';
import {readViewSelection,profileViewPath} from '../../src/lib/trade/view-link';
import type {ExplorerSelection} from '../../src/lib/trade/types';

const country=(release=sampleRelease())=>selectCountryChanges(buildMonthlyChangesView(release,'imports'),['1220'])[0];
const record=(csv:string)=>{const [header,line]=csv.trim().split('\r\n');return Object.fromEntries(line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((value,i)=>[header.split(',')[i],value.replace(/^"|"$/g,'').replaceAll('""','"')]));};

it('compares the latest month with the matching month one year earlier using monthly world totals',()=>{
  const view=buildMonthlyChangesView(sampleRelease(),'imports');expect(view).toMatchObject({periods:{current:{from:'2025-12',to:'2025-12'},previous:{from:'2024-12',to:'2024-12'}},world:{current:100,previous:50,changeUsd:50,changePercent:100}});
  expect(selectCountryChanges(view,['4759','1220']).map(row=>({code:row.code,current:row.currentUsd,previous:row.previousUsd,delta:row.changeUsd,growth:row.changePercent,share:row.currentSharePercent,priorShare:row.previousSharePercent,points:row.shareChangePoints}))).toEqual(['4759','1220'].map(code=>({code,current:25,previous:12,delta:13,growth:108.33333333333333,share:25,priorShare:24,points:1})));
});
it('keeps monthly comparisons available when an unrelated month makes the annual period incomplete',()=>{
  const release=sampleRelease();release.observations=release.observations.filter(row=>!(row.direction==='imports'&&row.partnerCode==='1220'&&row.month==='2024-07'));expect(country(release)).toMatchObject({currentUsd:25,previousUsd:12,changeUsd:13});expect(selectCountryChanges(buildChangesView(release,'imports'),['1220'])[0].previousUsd).toBeNull();
});
it.each(['2024-12','2025-12'])('preserves a missing or suppressed comparison month %s as unavailable',month=>{
  for(const status of ['missing','suppressed'] as const){const release=sampleRelease(),row=release.observations.find(row=>row.direction==='imports'&&row.partnerCode==='1220'&&row.month===month)!;row.status=status;row.valueUsd=null;expect(country(release)).toMatchObject({currentUsd:month==='2025-12'?null:25,previousUsd:month==='2024-12'?null:12,changeUsd:null,changePercent:null,shareChangePoints:null});}
});
it('retains reported zero and leaves growth unavailable for a zero prior amount',()=>{
  const release=sampleRelease();release.observations.find(row=>row.direction==='imports'&&row.partnerCode==='1220'&&row.month==='2024-12')!.valueUsd=0;expect(country(release)).toMatchObject({currentUsd:25,previousUsd:0,changeUsd:25,changePercent:null,previousSharePercent:0,shareChangePoints:25});
});
it.each(['zero','missing'])('withholds shares for a %s monthly world denominator without withholding reported country dollars',status=>{
  const release=sampleRelease();for(const row of release.observations.filter(row=>row.direction==='imports'&&row.month==='2024-12')){row.valueUsd=0;}const world=release.observations.find(row=>row.direction==='imports'&&row.partnerCode==='-'&&row.month==='2024-12')!;if(status==='missing'){world.valueUsd=null;world.status='missing';}expect(country(release)).toMatchObject({currentUsd:25,previousUsd:0,changeUsd:25,changePercent:null,previousSharePercent:null,shareChangePoints:null});
});
it('withholds comparisons across incompatible classifications while preserving monthly reported amounts',()=>{
  const release=sampleRelease();release.classificationIntervals=[{from:'2024-01',to:'2024-12',evidenceUrl:'https://example.invalid/old'},{from:'2025-01',to:'2025-12',evidenceUrl:'https://example.invalid/new'}];const view=buildMonthlyChangesView(release,'imports');expect(view.classificationComparable).toBe(false);expect(view.world).toMatchObject({current:100,previous:50,changeUsd:null,changePercent:null});expect(country(release)).toMatchObject({currentUsd:25,previousUsd:12,currentSharePercent:25,previousSharePercent:24,changeUsd:null,changePercent:null,shareChangePoints:null});release.classificationIntervals=[];expect(country(release).changeUsd).toBeNull();
});
it('uses export amounts and measures with no annual aggregation',()=>{
  const view=buildMonthlyChangesView(sampleRelease(),'exports');expect(selectCountryChanges(view,['1220'])[0]).toMatchObject({currentUsd:50,previousUsd:25,changeUsd:25,changePercent:100,currentSharePercent:25,previousSharePercent:25,shareChangePoints:0});expect(view.provenance.measure).toBe('ALL_VAL_MO');
});
it('serializes the selected comparison period, exact monthly denominators and source provenance',()=>{
  const row=record(serializeSelectedCountriesCsv(buildMonthlyChangesView(sampleRelease(),'imports'),['1220']));expect(row).toMatchObject({comparison_period:'monthly',current_value_usd:'25',previous_value_usd:'12',change_usd:'13',world_current_value_usd:'100',world_previous_value_usd:'50',current_period_start:'2025-12',current_period_end:'2025-12',previous_period_start:'2024-12',previous_period_end:'2024-12',measure:'GEN_VAL_MO',retrieved_at:'2026-01-01T00:00:00.000Z',source:'Development sample data'});expect(record(serializeSelectedCountriesCsv(buildChangesView(sampleRelease(),'imports'),['1220'])).comparison_period).toBe('annual');
});
it('restores and generates monthly comparison links while old links keep their annual default',()=>{
  const result=readViewSelection('?direction=exports&months=12&countries=4759%2C1220&comparison=monthly',sampleRelease());expect(result).toEqual({selection:{direction:'exports',months:12,countryCodes:['4759','1220'],comparisonPeriod:'monthly'},notice:null});expect(profileViewPath('090121',result.selection)).toBe('/products/090121/?direction=exports&months=12&countries=4759%2C1220&comparison=monthly');expect(readViewSelection('?comparison=annual',sampleRelease())).toEqual(readViewSelection('',sampleRelease()));
});
it.each(['?comparison=other','?comparison=','?comparison=monthly&comparison=annual'])('rejects an invalid or ambiguous comparison period %s as a whole',search=>{
  const result=readViewSelection(search,sampleRelease());expect(result.selection).toEqual({direction:'imports',months:60,countryCodes:[]});expect(result.notice).not.toBeNull();
});
it('does not generate an unsupported comparison choice in a profile link',()=>{
  const selection={direction:'imports',months:12,countryCodes:['1220'],comparisonPeriod:'other'} as unknown as ExplorerSelection;expect(()=>profileViewPath('090121',selection)).toThrow(/Invalid profile selection/);
});
