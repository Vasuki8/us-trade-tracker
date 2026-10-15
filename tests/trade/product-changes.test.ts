import {expect,it} from 'vitest';
import {productChangeSample as sample,monthlyProductChangeSample as monthly} from '../helpers/product-changes';
import {buildProductChangesView,buildMonthlyProductChangesView,rankProductChanges} from '../../src/lib/trade/product-changes';
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


// These expectations use literal monthly values and separately set annual totals.
it('compares matching months rather than annual totals, separately in each direction',()=>{
  const products=[monthly('100001','Monthly winner',100,300,12_000_000,80,40),monthly('100002','Other',1000,1100)];
  const view=buildMonthlyProductChangesView(products,'imports');
  expect(view).toMatchObject({periodType:'monthly',reportingMonth:'2025-12',periods:{current:{from:'2025-12',to:'2025-12'},previous:{from:'2024-12',to:'2024-12'}}});
  expect(view.products[0]).toMatchObject({availability:'available',comparison:{current:300,previous:100,changeUsd:200,changePercent:200},growthQualification:{from:'2024-01',to:'2024-12',valueUsd:12_000_000,availability:'available'},provenance:{measure:'GEN_VAL_MO'}});
  expect(rankProductChanges(view,'growth').increases.map(p=>p.code)).toEqual(['100001','100002']);
  expect(rankProductChanges(view,'dollars').increases.map(p=>p.code)).toEqual(['100001','100002']);
  expect(rankProductChanges(buildProductChangesView(products,'imports'),'dollars').increases).toHaveLength(0);
  expect(buildMonthlyProductChangesView(products,'exports').products[0]).toMatchObject({comparison:{current:40,previous:80,changeUsd:-40,changePercent:-50},provenance:{measure:'ALL_VAL_MO'}});
});

it('qualifies growth on the prior twelve months, not the previous matching month',()=>{
  const rows=[monthly('100001','Boundary',10,20,10_000_000),monthly('100002','Below',10,30,9_999_999),monthly('100003','Zero month',0,40,12_000_000),monthly('100004','Unchanged',10,10)];
  const view=buildMonthlyProductChangesView(rows,'imports');
  expect(rankProductChanges(view,'growth')).toMatchObject({increases:[{code:'100001'}],belowThresholdCount:1,zeroPriorMonthCount:1,growthQualificationUnavailableCount:0,unchangedCount:1});
  expect(rankProductChanges(view,'growth').growthExclusions.map(e=>[e.product.code,e.reason])).toEqual([['100002','below_threshold'],['100003','zero_prior_month']]);
  expect(rankProductChanges(view,'dollars')).toMatchObject({increases:[{code:'100003'},{code:'100002'},{code:'100001'}],belowThresholdCount:0,zeroPriorMonthCount:0,growthQualificationUnavailableCount:0,unchangedCount:1});
});

it('keeps monthly dollars independent of missing qualification and current-year intermediate months',()=>{
  const priorGap=monthly('100001','Prior gap',100,200),currentGap=monthly('100002','Current gap',100,200);
  priorGap.release.observations=priorGap.release.observations.filter(r=>!(r.geography==='world'&&r.direction==='imports'&&r.month==='2024-06'));
  currentGap.release.observations=currentGap.release.observations.filter(r=>!(r.geography==='world'&&r.direction==='imports'&&r.month==='2025-06'));
  const view=buildMonthlyProductChangesView([priorGap,currentGap],'imports');
  expect(view.products.map(p=>p.availability)).toEqual(['available','available']);
  expect(view.products.map(p=>p.growthQualification)).toMatchObject([{availability:'incomplete_period',valueUsd:null},{availability:'available',valueUsd:12_000_000}]);
  expect(rankProductChanges(view,'growth')).toMatchObject({increases:[{code:'100002'}],growthQualificationUnavailableCount:1,belowThresholdCount:0});
  expect(rankProductChanges(view,'dollars').increases).toHaveLength(2);
  expect(buildProductChangesView([currentGap],'imports').products[0].availability).toBe('incomplete_period');
});

it('requires verified qualification separately, and counts zero prior months before unavailable qualification',()=>{
  const unverified=monthly('100001','Unverified qualification',100,200),zero=monthly('100002','Zero prior',0,200);
  for(const p of [unverified,zero])p.release.classificationIntervals=[{from:'2024-12',to:'2025-12',evidenceUrl:'https://example.invalid/monthly-only'}];
  const view=buildMonthlyProductChangesView([unverified,zero],'imports');
  expect(view.products[0]).toMatchObject({availability:'available',growthQualification:{availability:'classification_unverified',valueUsd:null}});
  const ranking=rankProductChanges(view,'growth');
  expect(ranking).toMatchObject({increases:[],growthQualificationUnavailableCount:1,zeroPriorMonthCount:1,unavailableCount:0,belowThresholdCount:0});
  expect(ranking.growthExclusions).toHaveLength(2);
  expect(rankProductChanges(view,'dollars').increases).toHaveLength(2);
});

it.each(['missing','suppressed'] as const)('withholds %s endpoints without zero filling or duplicate growth exclusions',status=>{
  const p=monthly('100001','Endpoint',100,200);
  if(status==='missing')p.release.observations=p.release.observations.filter(r=>!(r.geography==='world'&&r.direction==='imports'&&r.month==='2024-12'));
  else {const r=p.release.observations.find(r=>r.geography==='world'&&r.direction==='imports'&&r.month==='2025-12')!;r.status='suppressed';r.valueUsd=null;}
  const view=buildMonthlyProductChangesView([p],'imports');
  expect(view.products[0].availability).toBe('incomplete_period');
  expect(rankProductChanges(view,'growth')).toMatchObject({increases:[],decreases:[],unavailableCount:1,growthExclusions:[],belowThresholdCount:0,zeroPriorMonthCount:0});
});

it('accepts reported zeros in qualification but rejects suppressed intermediate values',()=>{
  const good=monthly('100001','Zeros',100,200,100),suppressed=monthly('100002','Suppressed qualification',100,200);
  const r=suppressed.release.observations.find(r=>r.geography==='world'&&r.direction==='imports'&&r.month==='2024-06')!;r.status='suppressed';r.valueUsd=null;
  const view=buildMonthlyProductChangesView([good,suppressed],'imports');
  expect(view.products[0].growthQualification).toMatchObject({availability:'available',valueUsd:100});
  expect(view.products[1].growthQualification).toMatchObject({availability:'incomplete_period',valueUsd:null});
});

it('handles January, older releases and incompatible monthly classifications',()=>{
  const january=monthly('100001','January',100,200);january.release.reportingMonth='2025-01';
  for(const r of january.release.observations.filter(r=>r.geography==='world'&&r.direction==='imports')){if(r.month==='2024-01')r.valueUsd=10;if(r.month==='2025-01')r.valueUsd=15;}
  expect(buildMonthlyProductChangesView([january],'imports')).toMatchObject({periods:{current:{from:'2025-01',to:'2025-01'},previous:{from:'2024-01',to:'2024-01'}},products:[{comparison:{changeUsd:5,changePercent:50},growthQualification:{from:'2023-02',to:'2024-01',availability:'classification_unverified'}}]});
  const latest=monthly('100002','Latest',100,200),older=monthly('100003','Older',100,200),broken=monthly('100004','Broken',100,200);older.release.reportingMonth='2025-11';broken.release.classificationIntervals=[];
  const view=buildMonthlyProductChangesView([older,latest,broken],'imports');
  expect(view.products[0]).toMatchObject({availability:'reporting_month_mismatch',comparison:{current:null,previous:null,changeUsd:null,changePercent:null}});
  expect(view.products[2]).toMatchObject({availability:'classification_unverified',comparison:{current:200,previous:100,changeUsd:null,changePercent:null}});
  expect(rankProductChanges(view,'growth')).toMatchObject({differentMonthCount:1,unavailableCount:1,growthExclusions:[],increases:[{code:'100002'}]});
});

it('keeps exact rational monthly growth, stable ties and top-ten limits',()=>{
  const a=8_000_000_000_000_001,b=8_000_000_000_000_002;
  const view=buildMonthlyProductChangesView([monthly('100001','A',a,4_000_000_000_000_000,a),monthly('100002','Z',b,4_000_000_000_000_000,b)],'imports');
  expect(view.products[0].comparison.changePercent).toBe(view.products[1].comparison.changePercent);
  expect(rankProductChanges(view,'growth').decreases.map(p=>p.code)).toEqual(['100002','100001']);
  const tied=buildMonthlyProductChangesView([monthly('100003','Z',10,20),monthly('100002','A',20,40),monthly('100001','A',10,20)],'imports');
  expect(rankProductChanges(tied,'growth').increases.map(p=>p.code)).toEqual(['100001','100002','100003']);
  const many=Array.from({length:12},(_,i)=>monthly(String(200000+i),`Up ${i}`,100,101+i));
  many.push(...Array.from({length:12},(_,i)=>monthly(String(300000+i),`Down ${i}`,100,99-i)));
  const ranked=rankProductChanges(buildMonthlyProductChangesView(many,'imports'),'dollars');
  expect(ranked.increases).toHaveLength(10);expect(ranked.increases[0].code).toBe('200011');expect(ranked.decreases).toHaveLength(10);expect(ranked.decreases[0].code).toBe('300011');
});

it('rejects monthly invalid identities/directions and unknown metrics',()=>{
  expect(()=>buildMonthlyProductChangesView([],'imports')).toThrow('No published products');
  const p=monthly('100001','First',100,200);
  expect(()=>buildMonthlyProductChangesView([p,p],'imports')).toThrow('Duplicate product');
  expect(()=>buildMonthlyProductChangesView([p],'other' as 'imports')).toThrow('Invalid trade direction');
  p.release.productCode='100002';expect(()=>buildMonthlyProductChangesView([p],'imports')).toThrow('Product identity differs');
});

it('exports explicit monthly values, qualification metadata and counts without changing rolling schema',()=>{
  const p=monthly('100001','Quoted, \"coffee\"',100,300),gap=monthly('100002','Gap',100,200);
  gap.release.observations=gap.release.observations.filter(r=>!(r.geography==='world'&&r.direction==='imports'&&r.month==='2024-06'));
  const view=buildMonthlyProductChangesView([p,gap],'imports');
  const dollarCsv=serializeProductChangesCsv(view,'dollars'),growthCsv=serializeProductChangesCsv(view,'growth');
  expect(dollarCsv).toContain('minimum_growth_qualification_value_usd');expect(dollarCsv).not.toContain('minimum_previous_value_usd');
  expect(dollarCsv).toContain('300,100,200,200,2025-12,2025-12,2024-12,2024-12');
  expect(dollarCsv).toContain('monthly,preceding_twelve_months,2024-01,2024-12,,incomplete_period,0,0');
  expect(growthCsv).toContain('monthly,preceding_twelve_months,2024-01,2024-12,12000000,available,1,0');
  expect(growthCsv.trim().split('\r\n')).toHaveLength(2);expect(dollarCsv.trim().split('\r\n')).toHaveLength(3);
  expect(dollarCsv).toContain('"Quoted, ""coffee"""');
  expect(growthCsv).toContain('Development sample data');expect(growthCsv).toContain('GEN_VAL_MO');
  const rolling=serializeProductChangesCsv(buildProductChangesView([p],'imports'),'growth');
  expect(rolling).toContain('minimum_previous_value_usd');expect(rolling).not.toContain('growth_qualification');expect(rolling).not.toContain('comparison_period');
});
