import {expect,it} from 'vitest';
import {sampleRelease} from '../helpers/release';
import {buildChangesView,selectCountryChanges} from '../../src/lib/trade/changes';
import {serializeSelectedCountriesCsv} from '../../src/lib/trade/downloads';

const records=(csv:string)=>{const [header,...lines]=csv.trim().split('\r\n'),columns=header.split(',');return lines.map(line=>Object.fromEntries(line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((value,i)=>[columns[i],value.replace(/^"|"$/g,'').replaceAll('""','"')])));};
it('selects countries in saved order instead of ranking order, retaining unchanged observations',()=>{
  const view=buildChangesView(sampleRelease(),'exports');expect(selectCountryChanges(view,['4759','1220']).map(country=>({code:country.code,current:country.currentUsd,previous:country.previousUsd,share:country.currentSharePercent,points:country.shareChangePoints}))).toEqual([
    {code:'4759',current:600,previous:300,share:25,points:0},{code:'1220',current:600,previous:300,share:25,points:0}
  ]);
});
it.each([['9999'],['-'],['1220','1220'],['1220','4759','2010','4280']])('rejects invalid country selection %j rather than omitting requested data',(...codes)=>{
  expect(()=>selectCountryChanges(buildChangesView(sampleRelease(),'imports'),codes)).toThrow(/Choose up to three available countries/);
});
it('exports selected annual figures, matching world denominators and complete provenance',()=>{
  const csv=serializeSelectedCountriesCsv(buildChangesView(sampleRelease(),'imports'),['4759','1220']),rows=records(csv);expect(rows).toHaveLength(2);expect(rows.map(row=>row.partner_code)).toEqual(['4759','1220']);
  for(const row of rows){expect(row).toMatchObject({feature:'Selected country comparison',product_code:'090121',direction:'imports',current_value_usd:'300',previous_value_usd:'144',change_usd:'156',current_share_percent:'25',previous_share_percent:'24',share_change_percentage_points:'1',world_current_value_usd:'1200',world_previous_value_usd:'600',current_period_start:'2025-01',current_period_end:'2025-12',previous_period_start:'2024-01',previous_period_end:'2024-12',measure:'GEN_VAL_MO',source:'Development sample data',retrieved_at:'2026-01-01T00:00:00.000Z',code_version:'synthetic',revised:'false',classification_comparable:'true',source_urls:'https://api.census.gov/data/timeseries/intltrade/imports/hs'});expect(Number(row.growth_percent)).toBeCloseTo(108.33333333333333);expect(row.units).toContain('current USD');}
});
it('keeps incomplete selected countries in the CSV with blanks for unavailable figures',()=>{
  const release=sampleRelease();release.observations=release.observations.filter(row=>!(row.direction==='imports'&&row.partnerCode==='1220'&&row.month==='2024-07'));
  const row=records(serializeSelectedCountriesCsv(buildChangesView(release,'imports'),['1220']))[0];expect(row).toMatchObject({partner_code:'1220',current_value_usd:'300',previous_value_usd:'',change_usd:'',growth_percent:'',current_share_percent:'25',previous_share_percent:'',share_change_percentage_points:''});
});
it('withholds incompatible comparisons while preserving individually verified annual amounts',()=>{
  const release=sampleRelease();release.classificationIntervals=[{from:'2024-01',to:'2024-12',evidenceUrl:'https://example.invalid/old'},{from:'2025-01',to:'2025-12',evidenceUrl:'https://example.invalid/new'}];
  const row=records(serializeSelectedCountriesCsv(buildChangesView(release,'imports'),['4759']))[0];expect(row).toMatchObject({current_value_usd:'300',previous_value_usd:'144',change_usd:'',growth_percent:'',share_change_percentage_points:'',classification_comparable:'false'});
});
it('preserves reported zero without manufacturing growth from a zero prior value',()=>{
  const release=sampleRelease();release.observations.filter(row=>row.direction==='imports'&&row.partnerCode==='1220'&&row.month<'2025-01').forEach(row=>{row.valueUsd=0;});
  const row=records(serializeSelectedCountriesCsv(buildChangesView(release,'imports'),['1220']))[0];expect(row).toMatchObject({current_value_usd:'300',previous_value_usd:'0',change_usd:'300',growth_percent:'',previous_share_percent:'0',share_change_percentage_points:'25'});
});
it('quotes descriptions and neutralizes formula-like country text while leaving dollar values numeric',()=>{
  const view=buildChangesView(sampleRelease(),'imports');view.title='Coffee, "roasted"';view.countries.find(country=>country.code==='1220')!.name='=SUM(1)';const csv=serializeSelectedCountriesCsv(view,['1220']);
  expect(csv).toContain('"Coffee, ""roasted"""');expect(records(csv)[0]).toMatchObject({partner_name:"'=SUM(1)",current_value_usd:'300',change_usd:'156'});
});
it('exports the full selected-country record when comparisons cannot be ranked',()=>{
  const view=buildChangesView(sampleRelease(),'exports');const row=records(serializeSelectedCountriesCsv(view,['4280']))[0];expect(row).toMatchObject({direction:'exports',current_value_usd:'600',previous_value_usd:'300',change_usd:'300',growth_percent:'100',current_share_percent:'25',previous_share_percent:'25',share_change_percentage_points:'0',measure:'ALL_VAL_MO'});
});
it('produces a header-only CSV when no countries are selected',()=>{
  const csv=serializeSelectedCountriesCsv(buildChangesView(sampleRelease(),'imports'),[]);expect(csv.trim().split('\r\n')).toHaveLength(1);expect(csv).toContain('partner_code');
});
