import {expect,it} from 'vitest';
import {productChangeSample as sample} from '../helpers/product-changes';
import {buildProductChangesView,rankProductChanges} from '../../src/lib/trade/product-changes';
import {serializeProductChangesCsv} from '../../src/lib/trade/downloads';

it('compares official product world totals over matching annual periods in each direction',()=>{
  const products=[sample('090121','Roasted',10_000_000,25_000_000,30_000_000,12_000_000),sample('090111','Green',20_000_000,24_000_000)];
  const view=buildProductChangesView(products,'imports');
  expect(view).toMatchObject({reportingMonth:'2025-12',periods:{current:{from:'2025-01',to:'2025-12'},previous:{from:'2024-01',to:'2024-12'}}});
  expect(view.products[0]).toMatchObject({code:'090121',name:'Roasted',availability:'available',comparison:{current:25_000_000,previous:10_000_000,changeUsd:15_000_000,changePercent:150},provenance:{measure:'GEN_VAL_MO'}});
  expect(buildProductChangesView(products,'exports').products[0]).toMatchObject({comparison:{current:12_000_000,previous:30_000_000,changeUsd:-18_000_000,changePercent:-60},provenance:{measure:'ALL_VAL_MO'}});
});

it('ranks dollar movements and growth separately with an inclusive $10 million prior threshold',()=>{
  const view=buildProductChangesView([sample('100001','Big',1_000_000_000,1_100_000_000),sample('100002','Boundary',10_000_000,20_000_000),sample('100003','Below',9_999_999,29_999_997),sample('100004','Decline',20_000_000,10_000_000)],'imports');
  expect(rankProductChanges(view,'dollars').increases.map(p=>p.name)).toEqual(['Big','Below','Boundary']);
  const growth=rankProductChanges(view,'growth');
  expect(growth.increases.map(p=>p.name)).toEqual(['Boundary','Big']);expect(growth.decreases.map(p=>p.name)).toEqual(['Decline']);
  expect(growth.belowThresholdCount).toBe(1);expect(rankProductChanges(view,'dollars').belowThresholdCount).toBe(0);
});

it('keeps reported zero prior value in dollar rankings with no fabricated growth',()=>{
  const view=buildProductChangesView([sample('100001','New',0,12_000_000),sample('100002','Unchanged',20_000_000,20_000_000)],'imports');
  expect(view.products[0].comparison).toMatchObject({changeUsd:12_000_000,changePercent:null});
  expect(rankProductChanges(view,'dollars')).toMatchObject({increases:[{name:'New'}],unchangedCount:1});
  expect(rankProductChanges(view,'growth')).toMatchObject({increases:[],belowThresholdCount:1,unchangedCount:1});
});

it('uses exact rational growth ordering and stable name/code ties',()=>{
  const view=buildProductChangesView([sample('100001','A less negative',8_000_000_000_000_001,4_000_000_000_000_000),sample('100002','Z more negative',8_000_000_000_000_002,4_000_000_000_000_000)],'imports');
  expect(view.products[0].comparison.changePercent).toBe(view.products[1].comparison.changePercent);
  expect(rankProductChanges(view,'growth').decreases.map(p=>p.code)).toEqual(['100002','100001']);
  const tied=buildProductChangesView([sample('100003','Z',10_000_000,15_000_000),sample('100002','A',20_000_000,30_000_000),sample('100001','A',10_000_000,15_000_000)],'imports');
  expect(rankProductChanges(tied,'growth').increases.map(p=>p.code)).toEqual(['100001','100002','100003']);
});

it('excludes incomplete, suppressed and classification-incompatible comparisons',()=>{
  const missing=sample('100001','Missing',10_000_000,20_000_000),suppressed=sample('100002','Suppressed',10_000_000,20_000_000),incompatible=sample('100003','Boundary',10_000_000,20_000_000);
  missing.release.observations=missing.release.observations.filter(row=>!(row.geography==='world'&&row.direction==='imports'&&row.month==='2024-06'));
  const row=suppressed.release.observations.find(row=>row.geography==='world'&&row.direction==='imports'&&row.month==='2025-06')!;row.valueUsd=null;row.status='suppressed';
  incompatible.release.classificationIntervals=[{from:'2024-01',to:'2024-12',evidenceUrl:'https://example.invalid/prior'},{from:'2025-01',to:'2025-12',evidenceUrl:'https://example.invalid/current'}];
  const view=buildProductChangesView([missing,suppressed,incompatible],'imports');
  expect(view.products.map(p=>p.availability)).toEqual(['incomplete_period','incomplete_period','classification_unverified']);
  for(const metric of ['dollars','growth'] as const)expect(rankProductChanges(view,metric)).toMatchObject({increases:[],decreases:[],unavailableCount:3});
});

it('uses the newest reporting month and explains older releases without mixing their periods',()=>{
  const latest=sample('100001','Latest',10_000_000,20_000_000),older=sample('100002','Older',10_000_000,20_000_000);older.release.reportingMonth='2025-11';
  const view=buildProductChangesView([older,latest],'imports');
  expect(view.reportingMonth).toBe('2025-12');expect(view.products[0]).toMatchObject({availability:'reporting_month_mismatch',reportingMonth:'2025-11',comparison:{current:null,previous:null,changeUsd:null,changePercent:null}});
  expect(rankProductChanges(view,'dollars')).toMatchObject({differentMonthCount:1,unavailableCount:0,increases:[{code:'100001'}]});
});

it('limits each movement to ten products and counts excluded and unchanged products',()=>{
  const products=Array.from({length:12},(_,i)=>sample(String(100000+i),`Increase ${i}`,20_000_000,20_000_000+i+1));
  products.push(...Array.from({length:12},(_,i)=>sample(String(200000+i),`Decrease ${i}`,20_000_000,20_000_000-i-1)),sample('300000','Unchanged',20_000_000,20_000_000));
  const ranking=rankProductChanges(buildProductChangesView(products,'imports'),'dollars');
  expect(ranking.increases.map(p=>p.code)).toEqual(['100011','100010','100009','100008','100007','100006','100005','100004','100003','100002']);
  expect(ranking.decreases.map(p=>p.code)).toEqual(['200011','200010','200009','200008','200007','200006','200005','200004','200003','200002']);expect(ranking.unchangedCount).toBe(1);
});

it('rejects empty, duplicate or mismatched identities and unknown ranking measures',()=>{
  expect(()=>buildProductChangesView([],'imports')).toThrow('No published products');
  const first=sample('100001','First',10_000_000,20_000_000);expect(()=>buildProductChangesView([first,first],'imports')).toThrow('Duplicate product');
  first.release.productCode='100002';expect(()=>buildProductChangesView([first],'imports')).toThrow('Product identity differs');
  const view=buildProductChangesView([sample('100001','First',10_000_000,20_000_000)],'imports');expect(()=>rankProductChanges(view,'share' as 'dollars')).toThrow('Invalid product change metric');
});

it('exports exactly the displayed rankings with each product source, periods and threshold',()=>{
  const view=buildProductChangesView([sample('100001','=1+1',0,12_000_000),sample('100002','Qualified',10_000_000,20_000_000)],'imports');
  const dollarCsv=serializeProductChangesCsv(view,'dollars'),growthCsv=serializeProductChangesCsv(view,'growth');
  expect(dollarCsv.trim().split('\r\n')).toHaveLength(3);expect(growthCsv.trim().split('\r\n')).toHaveLength(2);
  expect(dollarCsv).toContain("'=1+1");expect(dollarCsv).toContain('12000000,0,12000000,,');
  expect(growthCsv).not.toContain('100001');expect(growthCsv).toContain('20000000,10000000,10000000,100');
  expect(growthCsv).toContain('2025-01,2025-12,2024-01,2024-12');expect(growthCsv).toContain('minimum_previous_value_usd');
  expect(growthCsv).toContain('Development sample data');expect(growthCsv).toContain('2026-01-01T00:00:00.000Z');expect(growthCsv).toContain('GEN_VAL_MO');expect(growthCsv).toContain('10000000');
});
