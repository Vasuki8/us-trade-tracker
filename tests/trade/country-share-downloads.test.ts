import {expect,it} from 'vitest';
import {sampleRelease} from '../helpers/release';
import {buildProfileView} from '../../src/lib/trade/profile';
import {buildCountryShareHistory} from '../../src/lib/trade/country-share-history';
import {serializeCountryShareHistoryCsv} from '../../src/lib/trade/country-share-downloads';
import {parseCsv} from '../helpers/parse-csv';
const headers='feature,product_code,product_description,direction,partner_code,partner_name,month,country_value_usd,country_value_status,world_value_usd,world_value_status,country_share_percent,numerator_measure,denominator_measure,units,period_start,period_end,classification_verified,classification_break_before,source,retrieved_at,code_version,revised,source_urls';
it.each(['imports','exports'] as const)('exports full precision %s rows in selected-country chronological order with both matching measures',direction=>{
 const r=sampleRelease();r.sourceUrls=['https://example.test/a?x=1,y=2','https://example.test/b'];r.retrievedAt='2026-01-01T00:00:00.000Z';
 for(const o of r.observations)if(o.direction===direction&&o.partnerCode==='-')o.valueUsd=300;
 const v=buildCountryShareHistory(r,buildProfileView(r,{direction,months:12,countryCodes:['2010','1220']})),text=serializeCountryShareHistoryCsv(v),rows=parseCsv(text);
 expect(text.split('\r\n')[0]).toBe(headers);expect(text.endsWith('\r\n')).toBe(true);expect(rows).toHaveLength(24);
 expect(rows[0]).toMatchObject({feature:'Country share history',product_code:'090121',direction,partner_code:'2010',month:'2025-01',country_value_usd:direction==='imports'?'25':'50',world_value_usd:'300',country_share_percent:String(direction==='imports'?100*25/300:100*50/300),numerator_measure:direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO',denominator_measure:direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO',period_start:'2025-01',period_end:'2025-12',country_value_status:'reported',world_value_status:'reported',source:'Development sample data',retrieved_at:'2026-01-01T00:00:00.000Z',source_urls:'https://example.test/a?x=1,y=2 | https://example.test/b',classification_break_before:'true'});
 expect(rows[11].month).toBe('2025-12');expect(rows[12]).toMatchObject({partner_code:'1220',month:'2025-01'});expect(rows[0].units).toMatch(/USD.*not seasonally adjusted.*percent/);
});
it('retains reported zeros, empty unavailable cells and separate status/continuity flags',()=>{
 const r=sampleRelease();const v=buildCountryShareHistory(r,buildProfileView(r,{direction:'imports',months:12,countryCodes:['1220']}));
 Object.assign(v.series[0].points[0],{countryValueUsd:0,sharePercent:0});Object.assign(v.series[0].points[1],{countryValueUsd:null,countryStatus:'suppressed',sharePercent:null,classificationVerified:false,breakBefore:true});Object.assign(v.series[0].points[2],{worldValueUsd:0,sharePercent:null});
 const rows=parseCsv(serializeCountryShareHistoryCsv(v));expect(rows[0]).toMatchObject({country_value_usd:'0',country_share_percent:'0'});expect(rows[1]).toMatchObject({country_value_usd:'',country_value_status:'suppressed',world_value_usd:'100',country_share_percent:'',classification_verified:'false',classification_break_before:'true'});expect(rows[2]).toMatchObject({world_value_usd:'0',world_value_status:'reported',country_share_percent:''});
});
it('round trips Unicode, commas, quotes and embedded newlines with source provenance',()=>{
 const r=sampleRelease(),v=buildCountryShareHistory(r,buildProfileView(r,{direction:'imports',months:12,countryCodes:['1220']}));v.title='Café, "roasted"\ncoffee';v.series[0].name='Îles, "Canada"\nNorth';v.provenance.codeVersion='v1,"review"';v.provenance.revised=true;
 const rows=parseCsv(serializeCountryShareHistoryCsv(v));expect(rows[0]).toMatchObject({product_description:v.title,partner_name:v.series[0].name,code_version:'v1,"review"',revised:'true'});
});
it('neutralizes spreadsheet formula text without changing numeric zeros and emits headers only for no selection',()=>{
 const r=sampleRelease(),v=buildCountryShareHistory(r,buildProfileView(r,{direction:'imports',months:12,countryCodes:['1220']}));v.series[0].name='=unsafe';expect(parseCsv(serializeCountryShareHistoryCsv(v))[0].partner_name).toBe("'=unsafe");v.series=[];expect(serializeCountryShareHistoryCsv(v)).toBe(headers+'\r\n');
});
