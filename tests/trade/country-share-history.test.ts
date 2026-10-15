import {expect,it} from 'vitest';
import {sampleRelease} from '../helpers/release';
import {sampleDutyRelease} from '../helpers/duties';
import {buildProfileView} from '../../src/lib/trade/profile';
import {buildCountryShareHistory} from '../../src/lib/trade/country-share-history';
import type {Direction,ExplorerSelection,Release,ValueStatus} from '../../src/lib/trade/types';
const selection:ExplorerSelection={direction:'imports',months:12,countryCodes:['1220']};
const make=(release=sampleRelease(),next=selection)=>buildCountryShareHistory(release,buildProfileView(release,next));
function set(release:Release,code:string,value:number|null,status:ValueStatus='reported',month='2025-12',direction:Direction='imports'){
 const row=release.observations.find(r=>r.partnerCode===code&&r.month===month&&r.direction===direction)!;
 row.valueUsd=value;row.status=status;
}
it('uses matching monthly U.S. totals rather than treating unchanged country dollars as unchanged share',()=>{
 const release=sampleRelease();set(release,'-',200);const view=make(release);
 expect(view.series[0].points.at(-2)).toMatchObject({month:'2025-11',countryValueUsd:25,worldValueUsd:100,sharePercent:25});
 expect(view.series[0].points.at(-1)).toMatchObject({month:'2025-12',countryValueUsd:25,worldValueUsd:200,sharePercent:12.5});
 expect(view).toMatchObject({productCode:'090121',direction:'imports',fromMonth:'2025-01',reportingMonth:'2025-12',provenance:{measure:'GEN_VAL_MO'}});
});
it('uses the official world denominator independently for each selected country in selection order',()=>{
 const view=make(sampleRelease(),{...selection,countryCodes:['2010','1220','4759']});
 expect(view.series.map(s=>[s.code,s.points.at(-1)?.sharePercent])).toEqual([['2010',25],['1220',25],['4759',25]]);
});
it('keeps imports and exports totals and product identities separate',()=>{
 const release=sampleRelease();release.productCode='090111';release.observations.forEach(r=>{r.productCode='090111';});set(release,'-',400,'reported','2025-12','exports');release.observations.reverse();
 expect(make(release).series[0].points.at(-1)?.sharePercent).toBe(25);
 const exports=make(release,{...selection,direction:'exports'});expect(exports).toMatchObject({productCode:'090111',direction:'exports',provenance:{measure:'ALL_VAL_MO'}});expect(exports.series[0].points.at(-1)).toMatchObject({countryValueUsd:50,worldValueUsd:400,sharePercent:12.5});
});
it('does not use imports-for-consumption or calculated duties as a merchandise share denominator',()=>{
 const release=sampleDutyRelease();for(const row of release.duties.observations)row.consumptionValue={status:'reported',valueUsd:1_000_000};
 expect(make(release).series[0].points.at(-1)).toMatchObject({countryValueUsd:25,worldValueUsd:100,sharePercent:25});
});
it('returns no selected-country series for the default world view',()=>{
 const view=make(sampleRelease(),{...selection,countryCodes:[]});expect(view.series).toEqual([]);expect(view.fromMonth).toBe('2025-01');
});
it('preserves reported country zero with positive world value as zero share',()=>{
 const release=sampleRelease();set(release,'1220',0);expect(make(release).series[0].points.at(-1)).toMatchObject({countryValueUsd:0,countryStatus:'reported',worldValueUsd:100,worldStatus:'reported',sharePercent:0});
});
it.each([['1220','missing'],['1220','suppressed'],['-','missing'],['-','suppressed']] as const)('keeps %s %s unavailable without losing its status', (code,status)=>{
 const release=sampleRelease();set(release,code,null,status);const p=make(release).series[0].points.at(-1)!;expect(p.sharePercent).toBeNull();expect(code==='-'?p.worldStatus:p.countryStatus).toBe(status);expect(code==='-'?p.countryValueUsd:p.worldValueUsd).toBe(code==='-'?25:100);
});
it.each(['1220','-'])('treats an absent %s month as missing and breaks the next connection',code=>{
 const release=sampleRelease();release.observations=release.observations.filter(r=>!(r.partnerCode===code&&r.direction==='imports'&&r.month==='2025-11'));
 const points=make(release).series[0].points;expect(points.at(-2)?.sharePercent).toBeNull();expect(code==='-'?points.at(-2)?.worldStatus:points.at(-2)?.countryStatus).toBe('missing');expect(points.at(-1)?.breakBefore).toBe(true);expect(points.at(-1)?.sharePercent).toBe(25);
});
it('leaves a zero world denominator unavailable while preserving its reported zeros',()=>{
 const release=sampleRelease();for(const row of release.observations)if(row.direction==='imports'&&row.month==='2025-12')row.valueUsd=0;
 expect(make(release).series[0].points.at(-1)).toMatchObject({countryValueUsd:0,worldValueUsd:0,worldStatus:'reported',sharePercent:null,breakBefore:true});
});
it('retains positive shares far below display precision without rounding the model',()=>{
 const release=sampleRelease();set(release,'-',1_000_000_000);set(release,'1220',1);expect(make(release).series[0].points.at(-1)?.sharePercent).toBe(0.0000001);
});
it('keeps an entirely zero country series distinct from an entirely unavailable series',()=>{
 const zero=sampleRelease();for(const row of zero.observations)if(row.partnerCode==='1220')row.valueUsd=0;
 expect(make(zero).series[0].points.every(p=>p.sharePercent===0)).toBe(true);
 const missing=sampleRelease();for(const row of missing.observations)if(row.partnerCode==='1220'){row.valueUsd=null;row.status='missing';}
 expect(make(missing).series[0].points.every(p=>p.sharePercent===null&&p.countryStatus==='missing')).toBe(true);
});
it('clips the requested history to the same available months as merchandise, including a single month',()=>{
 expect(make(sampleRelease(),{...selection,months:60}).series[0].points).toHaveLength(24);
 const release=sampleRelease();release.observations=release.observations.filter(r=>r.month==='2025-12');const view=make(release,{...selection,months:60});expect(view.series[0].points).toHaveLength(1);expect(view.fromMonth).toBe('2025-12');expect(view.series[0].points[0].breakBefore).toBe(true);
});
it('does not connect individually verified months in different reviewed classification intervals',()=>{
 const release=sampleRelease();release.classificationIntervals=[{from:'2024-01',to:'2025-11',evidenceUrl:'https://example.invalid/a'},{from:'2025-12',to:'2025-12',evidenceUrl:'https://example.invalid/b'}];
 const points=make(release).series[0].points;expect(points.at(-2)).toMatchObject({classificationVerified:true,sharePercent:25,breakBefore:false});expect(points.at(-1)).toMatchObject({classificationVerified:true,sharePercent:25,breakBefore:true});
});
it('preserves an unverified monthly value as isolated rather than claiming continuous history',()=>{
 const release=sampleRelease();release.classificationIntervals=[{from:'2024-01',to:'2025-10',evidenceUrl:'https://example.invalid/a'},{from:'2025-12',to:'2025-12',evidenceUrl:'https://example.invalid/b'}];
 const points=make(release).series[0].points;expect(points.at(-2)).toMatchObject({sharePercent:25,classificationVerified:false,breakBefore:true});expect(points.at(-1)?.breakBefore).toBe(true);
});
it.each(['productCode','reportingMonth','source','retrievedAt','codeVersion','measure'] as const)('rejects a mismatched view %s identity',field=>{
 const release=sampleRelease(),profile=buildProfileView(release,selection);
 if(field==='productCode')profile.productCode='090111';else if(field==='reportingMonth')profile.reportingMonth='2025-11';else if(field==='source')profile.provenance.source='census';else if(field==='retrievedAt')profile.provenance.retrievedAt='2026-02-01T00:00:00Z';else if(field==='codeVersion')profile.provenance.codeVersion='other';else profile.provenance.measure='ALL_VAL_MO';
 expect(()=>buildCountryShareHistory(release,profile)).toThrow();
});
it('rejects duplicate matching world months instead of arbitrarily choosing a denominator',()=>{
 const release=sampleRelease();const profile=buildProfileView(release,selection);release.observations.push({...release.observations.find(r=>r.direction==='imports'&&r.partnerCode==='-'&&r.month==='2025-12')!,valueUsd:200});expect(()=>buildCountryShareHistory(release,profile)).toThrow();
});
it('preserves existing country-exceeds-world rejection rather than clamping ratios',()=>{
 const release=sampleRelease();set(release,'1220',101);expect(()=>make(release)).toThrow('Country exceeds world total');
});
it('does not mutate canonical data/profile or leak summary period into chart identity',()=>{
 const release=sampleRelease(),profile=buildProfileView(release,selection),before=structuredClone({release,profile});const a=buildCountryShareHistory(release,profile);
 expect({release,profile}).toEqual(before);profile.selection.comparisonPeriod='monthly';expect(buildCountryShareHistory(release,profile)).toEqual(a);
});
