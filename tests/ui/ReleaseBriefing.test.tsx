// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {sampleRelease} from '../helpers/release';
import {sampleDutyRelease} from '../helpers/duties';
import {ReleaseBriefing} from '../../src/components/ReleaseBriefing';

afterEach(cleanup);

function briefingRelease(productCode:'090121'|'090111'){
  const release=sampleDutyRelease();release.productCode=productCode;
  for(const row of release.observations)row.productCode=productCode;
  for(const row of release.duties.observations)row.productCode=productCode;
  return release;
}

// Wrong product, direction or default rolling period would open unrelated research.
it.each([
  ['090121','/changes/?direction=imports&metric=dollars&period=monthly#changes-heading','/changes/?direction=exports&metric=dollars&period=monthly#changes-heading'],
  ['090111','/changes/090111/?direction=imports&metric=dollars&period=monthly#changes-heading','/changes/090111/?direction=exports&metric=dollars&period=monthly#changes-heading'],
] as const)('briefing_monthly_links_keep_product_direction_and_period: %s',(code,importsHref,exportsHref)=>{
  render(<ReleaseBriefing release={briefingRelease(code)}/>);
  const imports=screen.getByRole('region',{name:'Monthly imports'}),exports=screen.getByRole('region',{name:'Monthly exports'});
  expect(within(imports).getByRole('link',{name:'Explore latest-month import changes by country'})).toHaveAttribute('href',importsHref);
  expect(within(exports).getByRole('link',{name:'Explore latest-month export changes by country'})).toHaveAttribute('href',exportsHref);
  expect(imports).toHaveTextContent('Current value: $100');expect(imports).toHaveTextContent('Previous value: $50');
  expect(exports).toHaveTextContent('Current value: $200');expect(exports).toHaveTextContent('Previous value: $100');
});

// Growth being unavailable from a zero baseline must not suppress dollar research.
it.each(['imports','exports'] as const)('briefing_monthly_links_preserve_zero_and_unavailable_rules: zero prior %s',direction=>{
  const release=sampleDutyRelease();
  for(const row of release.observations)if(row.direction===direction&&row.month==='2024-12')row.valueUsd=0;
  render(<ReleaseBriefing release={release}/>);
  const card=screen.getByRole('region',{name:direction==='imports'?'Monthly imports':'Monthly exports'});
  expect(card).toHaveTextContent('Previous value: $0');expect(card).toHaveTextContent('Growth: Unavailable');
  expect(card).toHaveTextContent(direction==='imports'?'Dollar change: $100':'Dollar change: $200');
  expect(within(card).getByRole('link')).toHaveAttribute('href',direction==='imports'?'/changes/?direction=imports&metric=dollars&period=monthly#changes-heading':'/changes/?direction=exports&metric=dollars&period=monthly#changes-heading');
});

// Links must not imply comparison availability for missing amounts or disjoint classifications.
it.each(['missing current','suppressed prior','unverified classification','split classification'] as const)('briefing_monthly_links_preserve_zero_and_unavailable_rules: %s',failure=>{
  const release=sampleDutyRelease();
  if(failure==='missing current'||failure==='suppressed prior'){
    const row=release.observations.find(row=>row.direction==='imports'&&row.geography==='world'&&row.month===(failure==='missing current'?'2025-12':'2024-12'))!;
    row.valueUsd=null;row.status=failure==='missing current'?'missing':'suppressed';
  }else if(failure==='unverified classification')release.classificationIntervals=[];
  else release.classificationIntervals=[{...release.classificationIntervals[0],to:'2024-12'},{...release.classificationIntervals[0],from:'2025-01'}];
  render(<ReleaseBriefing release={release}/>);
  const card=screen.getByRole('region',{name:'Monthly imports'});
  expect(within(card).queryByRole('link',{name:'Explore latest-month import changes by country'})).toBeNull();
  expect(card).toHaveTextContent(failure==='missing current'?'Current value: Unavailable':'Current value: $100');
  expect(card).toHaveTextContent('Dollar change: Unavailable');expect(card).toHaveTextContent('Growth: Unavailable');
});

// A shared default-import link cannot serve a reader of the export card.
it.each([
  ['090121','/changes/?direction=imports&metric=dollars#changes-heading','/changes/?direction=exports&metric=dollars#changes-heading','/products/090121/?direction=imports&months=12&countries=1220','/products/090121/?direction=exports&months=12&countries=1220'],
  ['090111','/changes/090111/?direction=imports&metric=dollars#changes-heading','/changes/090111/?direction=exports&metric=dollars#changes-heading','/products/090111/?direction=imports&months=12&countries=1220','/products/090111/?direction=exports&months=12&countries=1220'],
] as const)('briefing_annual_links_keep_card_direction: %s',(code,importsHref,exportsHref,importPartner,exportPartner)=>{
  render(<ReleaseBriefing release={briefingRelease(code)}/>);
  const imports=screen.getByRole('region',{name:'Annual import partner changes'}),exports=screen.getByRole('region',{name:'Annual export partner changes'});
  expect(within(imports).getByRole('link',{name:'Explore twelve-month import changes by country'})).toHaveAttribute('href',importsHref);
  expect(within(exports).getByRole('link',{name:'Explore twelve-month export changes by country'})).toHaveAttribute('href',exportsHref);
  expect(within(imports).getByRole('link',{name:'CANADA',exact:true})).toHaveAttribute('href',importPartner);
  expect(within(exports).getByRole('link',{name:'CANADA',exact:true})).toHaveAttribute('href',exportPartner);
  expect(imports).toHaveTextContent('Largest increase: CANADA · $156');expect(exports).toHaveTextContent('Largest increase: CANADA · $300');
  for(const card of [imports,exports]){expect(card).toHaveTextContent('Jan 2025–Dec 2025 compared with Jan 2024–Dec 2024');expect(card).toHaveTextContent('4 countries with comparable data; 0 unavailable');expect(card).toHaveTextContent('No country decrease among comparable observations.');}
  expect(screen.queryByRole('link',{name:'See all country changes',exact:true})).toBeNull();
});

// Dollar eligibility survives zero baselines and equal periods, regardless of growth availability.
it.each(['zero prior','no changes'] as const)('briefing_annual_links_follow_dollar_eligibility: %s',condition=>{
  const release=sampleDutyRelease();
  for(const row of release.observations)if(row.month.startsWith('2024'))row.valueUsd=condition==='zero prior'?0:(row.direction==='imports'?1:2)*(row.geography==='world'?100:25);
  render(<ReleaseBriefing release={release}/>);
  for(const direction of ['imports','exports'] as const){
    const card=screen.getByRole('region',{name:direction==='imports'?'Annual import partner changes':'Annual export partner changes'});
    expect(card).toHaveTextContent('4 countries with comparable data; 0 unavailable');
    expect(within(card).getByRole('link',{name:direction==='imports'?'Explore twelve-month import changes by country':'Explore twelve-month export changes by country'})).toHaveAttribute('href',direction==='imports'?'/changes/?direction=imports&metric=dollars#changes-heading':'/changes/?direction=exports&metric=dollars#changes-heading');
    if(condition==='no changes'){expect(card).toHaveTextContent('No country increase among comparable observations.');expect(card).toHaveTextContent('No country decrease among comparable observations.');}
  }
});

// No eligible countries or incompatible classifications must not create a research promise.
it.each(['missing','suppressed','unverified classification'] as const)('briefing_annual_links_follow_dollar_eligibility: %s',condition=>{
  const release=sampleDutyRelease();
  if(condition==='unverified classification')release.classificationIntervals=[];
  else for(const row of release.observations)if(row.geography==='country'&&row.month.startsWith('2025')){row.valueUsd=null;row.status=condition;}
  render(<ReleaseBriefing release={release}/>);
  for(const name of ['Annual import partner changes','Annual export partner changes']){
    const card=screen.getByRole('region',{name});expect(within(card).queryByRole('link',{name:/Explore twelve-month/})).toBeNull();
    expect(card).toHaveTextContent('Country comparisons are unavailable');expect(card).toHaveTextContent('0 countries with comparable data; 4 unavailable');
  }
});

it('separates latest-month year-over-year figures for imports and exports',()=>{
  render(<ReleaseBriefing release={sampleDutyRelease()}/>);
  const imports=screen.getByRole('region',{name:'Monthly imports'}),exports=screen.getByRole('region',{name:'Monthly exports'});
  expect(imports).toHaveTextContent('Dec 2025');expect(imports).toHaveTextContent('Dec 2024');
  expect(imports).toHaveTextContent('Current value: $100');expect(imports).toHaveTextContent('Previous value: $50');expect(imports).toHaveTextContent('Dollar change: $50');expect(imports).toHaveTextContent('Growth: +100.0%');expect(imports).toHaveTextContent('GEN_VAL_MO');
  expect(exports).toHaveTextContent('Current value: $200');expect(exports).toHaveTextContent('Previous value: $100');expect(exports).toHaveTextContent('Dollar change: $100');expect(exports).toHaveTextContent('ALL_VAL_MO');
  expect(screen.getByText('Development sample data')).toBeVisible();
  expect(screen.getByRole('region',{name:'Sources and release'})).toHaveTextContent('Dollar values are synthetic development observations');
});

it('highlights annual country changes by dollars, with their actual periods and excluded coverage',()=>{
  const release=sampleRelease();
  for(const row of release.observations){
    if(row.direction==='imports'&&row.partnerCode==='4280'&&row.month.startsWith('2025'))row.valueUsd=5;
    if(row.direction==='imports'&&row.partnerCode==='2010')row.valueUsd=row.month.startsWith('2025')?5:1;
    if(row.direction==='exports'&&row.partnerCode==='2010'&&row.month==='2024-01'){row.valueUsd=null;row.status='missing';}
  }
  render(<ReleaseBriefing release={release}/>);
  const imports=screen.getByRole('region',{name:'Annual import partner changes'}),exports=screen.getByRole('region',{name:'Annual export partner changes'});
  expect(imports).toHaveTextContent('Jan 2025–Dec 2025');expect(imports).toHaveTextContent('Jan 2024–Dec 2024');
  expect(imports).toHaveTextContent('Largest increase: CANADA · $156');expect(imports).toHaveTextContent('Largest decrease: GERMANY · -$108');
  expect(imports).toHaveTextContent('4 countries with comparable data; 0 unavailable');
  expect(exports).toHaveTextContent('Largest increase: CANADA · $300');expect(exports).toHaveTextContent('No country decrease among comparable observations');
  expect(exports).toHaveTextContent('3 countries with comparable data; 1 unavailable');
});

it('withholds growth for a zero prior month while preserving the reported dollar change',()=>{
  const release=sampleRelease();for(const row of release.observations)if(row.direction==='imports'&&row.month==='2024-12')row.valueUsd=0;
  render(<ReleaseBriefing release={release}/>);
  const imports=screen.getByRole('region',{name:'Monthly imports'});
  expect(imports).toHaveTextContent('Previous value: $0');expect(imports).toHaveTextContent('Dollar change: $100');expect(imports).toHaveTextContent('Growth: Unavailable');
  expect(imports).not.toHaveTextContent('Infinity');
});

it('withholds comparisons across unverified classification periods without hiding reported monthly amounts',()=>{
  const release=sampleDutyRelease();release.classificationIntervals=[];
  render(<ReleaseBriefing release={release}/>);
  expect(screen.getByRole('region',{name:'Monthly imports'})).toHaveTextContent('Current value: $100');
  expect(screen.getByRole('region',{name:'Monthly imports'})).toHaveTextContent('Dollar change: Unavailable');
  expect(screen.getByRole('region',{name:'Monthly imports'})).toHaveTextContent('Growth: Unavailable');
  expect(screen.getByRole('region',{name:'Annual import partner changes'})).toHaveTextContent('Country comparisons are unavailable');
  expect(screen.getByRole('region',{name:'Annual import partner changes'})).not.toHaveTextContent('Largest increase:');
  expect(screen.getByRole('region',{name:'Estimated duties'})).toHaveTextContent('Classification continuity is unverified');
});

it('uses consumption denominators and ratios of sums for world estimated duties',()=>{
  render(<ReleaseBriefing release={sampleDutyRelease()}/>);
  const duties=screen.getByRole('region',{name:'Estimated duties'});
  const latest=within(duties).getByRole('article',{name:'Monthly estimated duties'}),rolling=within(duties).getByRole('article',{name:'Rolling estimated duties'});
  expect(latest).toHaveTextContent('Calculated duties: $1');expect(latest).toHaveTextContent('Consumption value: $20');expect(latest).toHaveTextContent('Duty share: 5.000%');
  expect(rolling).toHaveTextContent('Jan 2025–Dec 2025');expect(rolling).toHaveTextContent('Calculated duties: $30');expect(rolling).toHaveTextContent('Consumption value: $400');expect(rolling).toHaveTextContent('Duty share: 7.500%');
  expect(duties).toHaveTextContent('CAL_DUT_MO / CON_VAL_MO');
});

it('qualifies reported zero duties with affected dutiable value rather than implying duty-free trade',()=>{
  const release=sampleDutyRelease(),row=release.duties.observations.find(row=>row.month==='2025-12')!;
  row.calculatedDuty.valueUsd=0;row.coverage.uncalculatedDutiableValueUsd=5;
  render(<ReleaseBriefing release={release}/>);
  const latest=screen.getByRole('article',{name:'Monthly estimated duties'});
  expect(latest).toHaveTextContent('Calculated duties: $0');expect(latest).toHaveTextContent('RP70/79 affected dutiable value: $5');expect(latest).toHaveTextContent('25.000% of dutiable value');expect(latest).toHaveTextContent('Qualified reported figures');
  expect(screen.getByRole('region',{name:'Estimated duties'})).toHaveTextContent('Reported zero duties do not prove duty-free trade');
});

it('keeps missing duty shares and unverified reporting coverage visibly unavailable',()=>{
  const release=sampleDutyRelease(),row=release.duties.observations.find(row=>row.month==='2025-12')!;
  row.consumptionValue={valueUsd:null,status:'suppressed'};row.coverage={status:'unavailable',uncalculatedDutiableValueUsd:null};
  render(<ReleaseBriefing release={release}/>);
  const latest=screen.getByRole('article',{name:'Monthly estimated duties'});
  expect(latest).toHaveTextContent('Consumption value: Unavailable');expect(latest).toHaveTextContent('Duty share: Unavailable');expect(latest).toHaveTextContent('Reporting coverage unavailable');
  expect(latest).not.toHaveTextContent('RP70/79 affected dutiable value: $0');
});

it('does not fabricate a duty dataset for a legacy release and distinguishes Census provenance and revisions',()=>{
  const release=sampleRelease();release.source='census';release.revisedKeys=['090121/imports/2025-12/world/-/GEN_VAL_MO'];
  render(<ReleaseBriefing release={release}/>);
  expect(screen.getByRole('region',{name:'Estimated duties'})).toHaveTextContent('This retained release does not include duty history');
  expect(screen.queryByText('Development sample data')).toBeNull();
  const sources=screen.getByRole('region',{name:'Sources and release'});
  expect(sources).toHaveTextContent('U.S. Census Bureau');expect(sources).toHaveTextContent('2026-01-01T00:00:00.000Z');expect(sources).toHaveTextContent('Merchandise observations revised: 1');expect(sources).toHaveTextContent('Duty revisions: no retained duty history');
  expect(within(sources).getByRole('link',{name:release.sourceUrls[0]})).toHaveAttribute('href',release.sourceUrls[0]);
});
