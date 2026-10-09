// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {sampleRelease} from '../helpers/release';
import {sampleDutyRelease} from '../helpers/duties';
import {ReleaseBriefing} from '../../src/components/ReleaseBriefing';

afterEach(cleanup);

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
