import {expect,it} from 'vitest';
import {sampleRelease} from '../helpers/release';
import {buildChangesView,rankChanges} from '../../src/lib/trade/changes';
import {serializeChangesCsv} from '../../src/lib/trade/downloads';
const coffee=()=>{
  const release=sampleRelease();
  for(const row of release.observations){
    if(row.direction!=='imports')continue;
    const values:Record<string,[number,number]>={'1220':[10,30],'4759':[12,25],'2010':[8,5]};
    if(values[row.partnerCode])row.valueUsd=values[row.partnerCode][row.month.startsWith('2024')?0:1];
  }
  return release;
};
it('compares the two complete twelve-month periods and uses official world denominators',()=>{
  const view=buildChangesView(coffee(),'imports');
  expect(view).toMatchObject({periods:{current:{from:'2025-01',to:'2025-12'},previous:{from:'2024-01',to:'2024-12'}},world:{current:1200,previous:600,changeUsd:600,changePercent:100}});
  expect(view.countries.find(p=>p.code==='1220')).toMatchObject({currentUsd:360,previousUsd:120,changeUsd:240,changePercent:200,currentSharePercent:30,previousSharePercent:20,shareChangePoints:10});
  expect(view.countries.find(p=>p.code==='2010')).toMatchObject({currentUsd:60,previousUsd:96,changeUsd:-36,changePercent:-37.5,shareChangePoints:-11});
});
it('ranks gains and declines separately by dollars or percentage-point share change',()=>{
  const view=buildChangesView(coffee(),'imports');
  expect(rankChanges(view,'dollars').increases.map(p=>p.code)).toEqual(['1220','4759','4280']);
  expect(rankChanges(view,'dollars').decreases.map(p=>p.code)).toEqual(['2010']);
  expect(rankChanges(view,'share').increases.map(p=>p.code)).toEqual(['1220','4759']);
  expect(rankChanges(view,'share').decreases.map(p=>p.code)).toEqual(['2010','4280']);
});
it('keeps direction-specific totals and marks zero prior growth unavailable',()=>{
  const release=coffee();release.observations.filter(r=>r.direction==='imports'&&r.partnerCode==='1220'&&r.month.startsWith('2024')).forEach(r=>{r.valueUsd=0;});
  expect(buildChangesView(release,'imports').countries.find(p=>p.code==='1220')).toMatchObject({previousUsd:0,changeUsd:360,changePercent:null,shareChangePoints:30});
  expect(buildChangesView(release,'exports').countries.find(p=>p.code==='1220')).toMatchObject({currentUsd:600,previousUsd:300,changeUsd:300,changePercent:100,shareChangePoints:0});
});
it('breaks exact share-change ties by name even when floating-point subtraction differs',()=>{
  const release=sampleRelease();
  for(const row of release.observations){
    if(row.direction!=='imports')continue;
    if(row.partnerCode==='4280'){row.partnerName='A COUNTRY';row.valueUsd=row.month.startsWith('2024')?14:29;}
    if(row.partnerCode==='1220')row.partnerName='B COUNTRY';
  }
  // A: 348/1200 - 168/600; B: 300/1200 - 144/600. Both are exactly +1 pp.
  expect(rankChanges(buildChangesView(release,'imports'),'share').increases.map(country=>country.code)).toEqual(['4280','1220','4759','2010']);
});
it('does not infer zero for a missing or suppressed country month in either period',()=>{
  for(const month of ['2024-06','2025-06'])for(const suppressed of [false,true]){
    const release=coffee();
    if(suppressed){const row=release.observations.find(r=>r.direction==='imports'&&r.partnerCode==='1220'&&r.month===month)!;row.status='suppressed';row.valueUsd=null;}
    else release.observations=release.observations.filter(r=>!(r.direction==='imports'&&r.partnerCode==='1220'&&r.month===month));
    const view=buildChangesView(release,'imports');
    expect(view.countries.find(p=>p.code==='1220')).toMatchObject({changeUsd:null,changePercent:null,shareChangePoints:null});
    expect(rankChanges(view,'dollars').unavailableCount).toBe(1);
    expect(rankChanges(view,'dollars').increases.map(p=>p.code)).not.toContain('1220');
  }
});
it('keeps classification-incompatible changes out of both rankings',()=>{
  const release=coffee();release.classificationIntervals=[{from:'2024-01',to:'2024-12',evidenceUrl:'https://example.invalid/a'},{from:'2025-01',to:'2025-12',evidenceUrl:'https://example.invalid/b'}];
  const view=buildChangesView(release,'imports');
  expect(view.countries.find(p=>p.code==='1220')).toMatchObject({currentUsd:360,previousUsd:120,changeUsd:null,shareChangePoints:null});
  for(const metric of ['dollars','share'] as const)expect(rankChanges(view,metric)).toMatchObject({increases:[],decreases:[],unavailableCount:4});
});
it('does not fabricate country shares when the prior world denominator is zero',()=>{
  const release=coffee();release.observations.filter(r=>r.month.startsWith('2024')).forEach(r=>{r.valueUsd=0;});
  const view=buildChangesView(release,'imports');
  expect(view.countries.find(p=>p.code==='1220')).toMatchObject({changeUsd:360,previousSharePercent:null,shareChangePoints:null});
  expect(rankChanges(view,'share')).toMatchObject({increases:[],decreases:[],unavailableCount:4});
});
it('limits each ranking to the ten largest moves and excludes unchanged partners',()=>{
  const release=sampleRelease();release.observations.filter(r=>r.geography==='world').forEach(r=>{r.valueUsd=10000;});
  for(let i=0;i<25;i++)for(const year of [2024,2025])for(let month=1;month<=12;month++){
    release.observations.push({productCode:'090121',description:'Coffee',direction:'imports',month:`${year}-${String(month).padStart(2,'0')}`,partnerCode:String(6000+i),partnerName:`Partner ${i}`,geography:'country',measure:'GEN_VAL_MO',valueUsd:year===2024?1:25+i,status:'reported'});
  }
  for(let i=0;i<26;i++)for(const year of [2024,2025])for(let month=1;month<=12;month++){
    release.observations.push({productCode:'090121',description:'Coffee',direction:'imports',month:`${year}-${String(month).padStart(2,'0')}`,partnerCode:String(8000+i),partnerName:`Decline ${i}`,geography:'country',measure:'GEN_VAL_MO',valueUsd:i===25?10:year===2024?25+i:1,status:'reported'});
  }
  const ranking=rankChanges(buildChangesView(release,'imports'),'dollars');
  expect(ranking.increases.map(p=>p.code)).toEqual(['6024','6023','6022','6021','6020','6019','6018','6017','6016','6015']);
  expect(ranking.increases[0].changeUsd).toBe(576);
  expect(ranking.decreases.map(p=>p.code)).toEqual(['8024','8023','8022','8021','8020','8019','8018','8017','8016','8015']);
  expect(ranking.decreases[0].changeUsd).toBe(-576);
  expect(ranking.unchangedCount).toBe(1);
  expect(serializeChangesCsv(buildChangesView(release,'imports'),'dollars').trim().split('\r\n')).toHaveLength(21);
});
it('exports the displayed rankings with direction, both periods, units and source provenance',()=>{
  const csv=serializeChangesCsv(buildChangesView(coffee(),'imports'),'share');
  expect(csv).toContain('share_change_percentage_points');
  expect(csv).toContain('090121');expect(csv).toContain('imports');expect(csv).toContain('GEN_VAL_MO');
  expect(csv).toContain('2025-01,2025-12,2024-01,2024-12');
  expect(csv).toContain('Development sample data');expect(csv).toContain('2026-01-01T00:00:00.000Z');
  const lines=csv.trim().split('\r\n');expect(lines).toHaveLength(5);
  expect(lines[1]).toContain('1220,CANADA,360,120,240,200,30,20,10');
  const unsafe=coffee();unsafe.observations.filter(r=>r.partnerCode==='1220').forEach(r=>{r.partnerName='=1+1';});
  expect(serializeChangesCsv(buildChangesView(unsafe,'imports'),'dollars')).toContain("'=1+1,360,120");
});
