import {expect,it} from 'vitest';
import {serializeCsv} from '../../src/lib/trade/downloads';
import {buildProfileView} from '../../src/lib/trade/profile';
import {sampleRelease} from '../helpers/release';
import {parseCsv} from '../helpers/parse-csv';
const legacy=['month','product_code','product_description','direction','partner_code','partner_name','value_usd','value_status','measure','units','period_start','period_end','source','retrieved_at','code_version','revised','classification_verified','classification_break_before','source_urls'];
it.each([
 ['imports',[],0],['imports',['1220','4759'],1],['exports',['1220'],0],
] as const)('adds exact revision scope and point identity for %s %j',(direction,countryCodes,count)=>{
 const release=sampleRelease();release.revisedKeys=['imports/090121/2025-01/country/1220/GEN_VAL_MO'];
 const view=buildProfileView(release,{direction,months:12,countryCodes:[...countryCodes]});
 const csv=serializeCsv(view),rows=parseCsv(csv);
 expect(csv.split('\r\n')[0].split(',')).toEqual([...legacy,'revised_scope','observation_recorded_revision']);
 expect(rows.every(r=>r.revised==='true'&&r.revised_scope==='merchandise_release')).toBe(true);
 expect(rows.filter(r=>r.observation_recorded_revision==='true')).toHaveLength(count);
 if(count)expect(rows.filter(r=>r.observation_recorded_revision==='true')).toEqual([expect.objectContaining({month:'2025-01',partner_code:'1220',direction:'imports',measure:'GEN_VAL_MO',value_usd:'25'})]);
 expect(rows.every(r=>['true','false'].includes(r.observation_recorded_revision))).toBe(true);
});
it('preserves quoted text, numeric zero and unavailable values while appending recorded marks',()=>{
 const release=sampleRelease();release.revisedKeys=['imports/090121/2025-01/country/1220/GEN_VAL_MO','imports/090121/2025-02/country/1220/GEN_VAL_MO'];
 for(const row of release.observations){row.description='Coffee, "roasted"\nline';if(row.partnerCode==='1220')row.partnerName='Canada, "label"';}
 const zero=release.observations.find(r=>r.direction==='imports'&&r.partnerCode==='1220'&&r.month==='2025-01')!;zero.valueUsd=0;
 const missing=release.observations.find(r=>r.direction==='imports'&&r.partnerCode==='1220'&&r.month==='2025-02')!;missing.valueUsd=null;missing.status='missing';
 const csv=serializeCsv(buildProfileView(release,{direction:'imports',months:12,countryCodes:['1220']})),rows=parseCsv(csv);
 expect(rows[0]).toMatchObject({product_description:'Coffee, "roasted"\nline',partner_name:'Canada, "label"',value_usd:'0',value_status:'reported',observation_recorded_revision:'true'});
 expect(rows[1]).toMatchObject({value_usd:'',value_status:'unavailable',observation_recorded_revision:'true'});
 expect(rows[2].observation_recorded_revision).toBe('false');expect(csv.endsWith('\r\n')).toBe(true);
});
it('makes no historical finality claim for an initial release without recorded keys',()=>{
 const rows=parseCsv(serializeCsv(buildProfileView(sampleRelease(),{direction:'imports',months:12,countryCodes:[]})));
 expect(rows.every(r=>r.revised==='false'&&r.observation_recorded_revision==='false'&&r.revised_scope==='merchandise_release')).toBe(true);
});
