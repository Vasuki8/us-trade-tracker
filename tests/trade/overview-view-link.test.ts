import {expect,it} from 'vitest';
import {readOverviewSelection,overviewViewPath,type OverviewSelection} from '../../src/lib/trade/overview-view-link';

const products=['090121','090122'];
const defaults:OverviewSelection={productCode:'090121',direction:'imports',comparisonPeriod:'monthly',months:60};

it('overview defaults and partial selections preserve the published product order',()=>{
  expect(readOverviewSelection('',products)).toEqual({selection:defaults,notice:null});
  expect(readOverviewSelection('?direction=exports',products)).toEqual({selection:{...defaults,direction:'exports'},notice:null});
  expect(readOverviewSelection('?product=090122&months=12',products)).toEqual({selection:{...defaults,productCode:'090122',months:12},notice:null});
  expect(readOverviewSelection('',products.toReversed()).selection.productCode).toBe('090122');
});

for(const productCode of products)for(const direction of ['imports','exports'] as const)
for(const comparisonPeriod of ['monthly','annual'] as const)for(const months of [12,60] as const)
it(`all overview selections round trip: ${productCode} ${direction} ${comparisonPeriod} ${months}`,()=>{
  const selection={productCode,direction,comparisonPeriod,months};
  const literal=`/?product=${productCode}&direction=${direction}&comparison=${comparisonPeriod}&months=${months}`;
  expect(overviewViewPath(selection)).toBe(literal);
  expect(readOverviewSelection(literal.slice(1),products)).toEqual({selection,notice:null});
});

it.each([
  'product=180100','product=09012','product=','product=090121&product=090122',
  'direction=other','direction=','direction=imports&direction=exports',
  'comparison=rolling','comparison=','comparison=monthly&comparison=annual',
  'months=012','months=5','months=','months=12&months=60',
  'product=%3Cscript%3E','product=..%2Fmethods',
])('invalid saved choices restore the whole default: %s',invalid=>{
  const otherChoices=invalid.startsWith('product=')?'&direction=exports&months=12':'&product=090122';
  const result=readOverviewSelection(`?${invalid}${otherChoices}`,products);
  expect(result.selection).toEqual(defaults);
  expect(result.notice).toMatch(/could not be restored/);
});

it('query length boundary keeps valid choices but rejects oversized input as a whole',()=>{
  const prefix='?product=090122&direction=exports&extra=';
  const query=prefix+'x'.repeat(2048-prefix.length);
  expect(readOverviewSelection(query,products)).toEqual({selection:{...defaults,productCode:'090122',direction:'exports'},notice:null});
  expect(readOverviewSelection(query+'x',products).selection).toEqual(defaults);
  expect(readOverviewSelection(query+'x',products).notice).not.toBeNull();
});

it('fixture membership is supplied instead of a second live product allowlist',()=>{
  expect(readOverviewSelection('?product=090122',products).selection.productCode).toBe('090122');
  expect(readOverviewSelection('?product=090121',['180100']).selection.productCode).toBe('180100');
  expect(readOverviewSelection('?product=090121',['180100']).notice).not.toBeNull();
});

it('canonical paths exclude unrelated query keys and preserve leading zeroes',()=>{
  const restored=readOverviewSelection('?utm_source=briefing&product=090122&direction=exports&comparison=annual&months=12',products);
  expect(restored.notice).toBeNull();
  expect(overviewViewPath(restored.selection)).toBe('/?product=090122&direction=exports&comparison=annual&months=12');
  expect(readOverviewSelection('?utm_source=one&utm_source=two',products)).toEqual({selection:defaults,notice:null});
});

it.each([[],['090121','090121'],['09012'],['../methods'],['090121','18010x']].map(codes=>({codes})))('invalid internal product list is rejected: $codes',({codes})=>{
  expect(()=>readOverviewSelection('',codes)).toThrow(/product/i);
});

it.each([
  {...defaults,productCode:'../methods'}, {...defaults,productCode:'09012x'},
  {...defaults,direction:'other'}, {...defaults,comparisonPeriod:'rolling'},
  {...defaults,months:13}, {...defaults,months:'12'},
])('invalid internal selections cannot produce a misleading URL: %j',selection=>{
  expect(()=>overviewViewPath(selection as OverviewSelection)).toThrow(/selection/i);
});
