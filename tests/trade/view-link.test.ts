import {expect,it} from 'vitest';
import {sampleRelease} from '../helpers/release';
import {readViewSelection,profileViewPath,countryChangesViewPath} from '../../src/lib/trade/view-link';
import type {ExplorerSelection} from '../../src/lib/trade/types';

it('opens default imports without treating unrelated parameters as saved filters',()=>{
  expect(readViewSelection('?utm_source=briefing',sampleRelease())).toEqual({selection:{direction:'imports',months:60,countryCodes:[]},notice:null});
});
it('restores all three filters together in their selected country order',()=>{
  expect(readViewSelection('?direction=exports&months=12&countries=4759%2C1220%2C2010',sampleRelease())).toEqual({selection:{direction:'exports',months:12,countryCodes:['4759','1220','2010']},notice:null});
});
it('supports direction-only links and a reported world view with an empty country parameter',()=>{
  expect(readViewSelection('?direction=exports',sampleRelease())).toEqual({selection:{direction:'exports',months:60,countryCodes:[]},notice:null});
  expect(readViewSelection('?direction=imports&months=12&countries=',sampleRelease())).toEqual({selection:{direction:'imports',months:12,countryCodes:[]},notice:null});
});
it.each([
  '?direction=other','?direction=','?months=13','?months=012','?countries=-','?countries=9999',
  '?countries=1220,4759,2010,4280','?countries=1220,1220','?countries=1220,,4759',
  '?direction=imports&direction=exports','?months=12&months=60','?countries=1220&countries=4759',
  '?countries=%3Cscript%3E','?months='+('1'.repeat(2100))
])('rejects unsupported or ambiguous selection %s as a whole with a notice',query=>{
  const result=readViewSelection(query,sampleRelease());
  expect(result.selection).toEqual({direction:'imports',months:60,countryCodes:[]});expect(result.notice).toMatch(/could not be restored/i);
});
it('checks country membership for the requested direction rather than accepting any retained country',()=>{
  const release=sampleRelease();release.observations=release.observations.filter(row=>!(row.direction==='exports'&&row.partnerCode==='2010'));
  const result=readViewSelection('?direction=exports&months=12&countries=2010',release);
  expect(result.selection).toEqual({direction:'imports',months:60,countryCodes:[]});expect(result.notice).not.toBeNull();
});
it('preserves a selected country with missing period coverage so its unavailable data stays visible',()=>{
  const release=sampleRelease();const row=release.observations.find(row=>row.direction==='imports'&&row.partnerCode==='1220'&&row.month==='2025-12')!;row.valueUsd=null;row.status='missing';
  expect(readViewSelection('?direction=imports&months=12&countries=1220',release)).toEqual({selection:{direction:'imports',months:12,countryCodes:['1220']},notice:null});
});
it('creates a deterministic relative link containing only the selected filters',()=>{
  expect(profileViewPath('090121',{direction:'exports',months:12,countryCodes:['4759','1220']})).toBe('/products/090121/?direction=exports&months=12&countries=4759%2C1220');
  expect(profileViewPath('090121',{direction:'imports',months:60,countryCodes:[]})).toBe('/products/090121/?direction=imports&months=60');
});
it.each([
  {direction:'unknown',months:12,countryCodes:[]},{direction:'imports',months:13,countryCodes:[]},
  {direction:'imports',months:12,countryCodes:['-']},{direction:'imports',months:12,countryCodes:['1220','1220']},
  {direction:'imports',months:12,countryCodes:['1220','4759','2010','4280']}
])('does not generate links with invalid selection fields %j',selection=>{
  expect(()=>profileViewPath('090121',selection as ExplorerSelection)).toThrow(/Invalid profile selection/);
});
it('does not interpolate a product path supplied outside the six-digit classification contract',()=>{
  expect(()=>profileViewPath('../methods',{direction:'imports',months:60,countryCodes:[]})).toThrow(/Invalid product code/);
});


it.each([
  ['090121','imports','monthly','/changes/?direction=imports&metric=dollars&period=monthly#changes-heading'],
  ['090121','exports','monthly','/changes/?direction=exports&metric=dollars&period=monthly#changes-heading'],
  ['090121','imports','rolling','/changes/?direction=imports&metric=dollars#changes-heading'],
  ['090121','exports','rolling','/changes/?direction=exports&metric=dollars#changes-heading'],
  ['090111','imports','monthly','/changes/090111/?direction=imports&metric=dollars&period=monthly#changes-heading'],
  ['090111','exports','monthly','/changes/090111/?direction=exports&metric=dollars&period=monthly#changes-heading'],
  ['090111','imports','rolling','/changes/090111/?direction=imports&metric=dollars#changes-heading'],
  ['090111','exports','rolling','/changes/090111/?direction=exports&metric=dollars#changes-heading'],
  ['090122','exports','monthly','/changes/090122/?direction=exports&metric=dollars&period=monthly#changes-heading'],
] as const)('country drilldown retains %s %s %s',(code,direction,period,expected)=>{
  expect(countryChangesViewPath(code,{direction,period})).toBe(expected);
});
it.each([
  ['../methods','imports','monthly'],['09012x','imports','rolling'],['090121','other','monthly'],['090121','imports','annual'],
])('rejects invalid country drilldown selection %s %s %s',(code,direction,period)=>{
  expect(()=>countryChangesViewPath(code,{direction,period} as Parameters<typeof countryChangesViewPath>[1])).toThrow();
});
