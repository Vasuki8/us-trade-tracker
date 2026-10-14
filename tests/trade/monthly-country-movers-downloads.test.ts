import {createHash} from 'node:crypto';
import {expect,it} from 'vitest';
import {sampleRelease} from '../helpers/release';
import {parseCsv} from '../helpers/parse-csv';
import {buildChangesView,buildMonthlyChangesView} from '../../src/lib/trade/changes';
import {serializeChangesCsv} from '../../src/lib/trade/downloads';

// Captured before the opt-in serializer edit. downloads.ts matched base 6a74b79.
const golden={
  'rolling/dollars':'eeee26af92ee194481851a79cdd0a628e3182458245a85739e494bc6a554cd0c',
  'rolling/share':'b0db9edd9d512ae17ee63ffff8a271f2ce1a6736a89601b62aaaa9a55547b730',
  'monthly/dollars':'47f6ad495843caaf63833236ab2cff566c28c6e3d57a7b8638b456820a2dbfb1',
  'monthly/share':'af1753f75fcdbb60fe45f930fe7f396314e06015fc70a18b98fb2a414ea79cbb',
};
for(const [period,builder] of [['rolling',buildChangesView],['monthly',buildMonthlyChangesView]] as const){
  it.each(['dollars','share'] as const)('preserves default '+period+'/%s CSV bytes',metric=>{
    expect(createHash('sha256').update(serializeChangesCsv(builder(sampleRelease(),'imports'),metric)).digest('hex')).toBe(golden[period+'/'+metric as keyof typeof golden]);
  });
  it('appends '+period+' metadata only when explicitly requested',()=>{
    const view=builder(sampleRelease(),'imports'),old=serializeChangesCsv(view,'dollars');
    const current=serializeChangesCsv(view,'dollars',{includeComparisonPeriod:true});
    expect(current.split('\r\n')[0]).toBe(old.split('\r\n')[0]+',comparison_period');
    expect(current.split('\r\n').filter(Boolean).map(line=>line.slice(0,line.lastIndexOf(','))).join('\r\n')+'\r\n').toBe(old);
    expect(parseCsv(current).every(row=>row.comparison_period===period)).toBe(true);
  });
}
it('exports monthly dates, ranks, world-based shares and provenance',()=>{
  const rows=parseCsv(serializeChangesCsv(buildMonthlyChangesView(sampleRelease(),'imports'),'share',{includeComparisonPeriod:true}));
  expect(rows.map(row=>[row.partner_code,row.movement,row.rank])).toEqual([['1220','increase','1'],['4759','increase','2'],['2010','increase','3'],['4280','decrease','1']]);
  expect(rows[0]).toMatchObject({current_value_usd:'25',previous_value_usd:'12',change_usd:'13',growth_percent:'108.33333333333333',current_share_percent:'25',previous_share_percent:'24',share_change_percentage_points:'1',current_period_start:'2025-12',current_period_end:'2025-12',previous_period_start:'2024-12',previous_period_end:'2024-12',measure:'GEN_VAL_MO',source:'Development sample data',retrieved_at:'2026-01-01T00:00:00.000Z',code_version:'synthetic',revised:'false',classification_comparable:'true',comparison_period:'monthly'});
  expect(rows[0].units).toContain('share change in percentage points');
  expect(rows[0].source_urls).toBe(sampleRelease().sourceUrls[0]);
});
it('keeps partner text quoted and formula-safe in opted-in monthly CSV',()=>{
  const release=sampleRelease();
  for(const row of release.observations)if(row.partnerCode==='1220')row.partnerName='=SUM(1,2)\n"Canada"';
  const rows=parseCsv(serializeChangesCsv(buildMonthlyChangesView(release,'imports'),'dollars',{includeComparisonPeriod:true}));
  expect(rows.find(row=>row.partner_code==='1220')?.partner_name).toBe('\'=SUM(1,2)\n"Canada"');
});
it.each(['empty','incompatible'] as const)('keeps %s monthly rankings header-only',kind=>{
  const release=sampleRelease();
  if(kind==='incompatible')release.classificationIntervals=[];
  const view=buildMonthlyChangesView(release,kind==='empty'?'exports':'imports');
  const body=serializeChangesCsv(view,'share',{includeComparisonPeriod:true});
  expect(parseCsv(body)).toEqual([]);
  expect(body.split('\r\n')).toHaveLength(2);
  expect(body.split('\r\n')[0]).toMatch(/,comparison_period$/);
});
it('leaves zero-prior growth blank without suppressing a valid monthly increase',()=>{
  const release=sampleRelease();
  release.observations.find(row=>row.direction==='imports'&&row.partnerCode==='1220'&&row.month==='2024-12')!.valueUsd=0;
  const row=parseCsv(serializeChangesCsv(buildMonthlyChangesView(release,'imports'),'dollars',{includeComparisonPeriod:true})).find(row=>row.partner_code==='1220');
  expect(row).toMatchObject({previous_value_usd:'0',change_usd:'25',growth_percent:'',comparison_period:'monthly'});
});
