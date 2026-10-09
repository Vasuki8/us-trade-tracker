// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {sampleRelease} from '../helpers/release';
import {ProductExplorer} from '../../src/components/ProductExplorer';
afterEach(()=>{cleanup();window.history.replaceState(null,'','/');});

it('shows both periods and direction-specific country totals and growth',async()=>{
  render(<ProductExplorer release={sampleRelease()}/>);
  const changes=within(screen.getByRole('region',{name:'What changed?'}));
  expect(screen.getByRole('region',{name:'What changed?'})).toHaveTextContent('Jan 2025–Dec 2025 compared with Jan 2024–Dec 2024');
  const canada=()=>within(changes.getByRole('table',{name:'Largest increases · dollar change'})).getByRole('row',{name:/CANADA/});
  expect(within(canada()).getAllByRole('cell').map(cell=>cell.textContent)).toEqual(['+$156','$300','$144','+108.3%','25.0%','24.0%','+1.0 pp']);
  await userEvent.setup().click(screen.getByRole('radio',{name:'Exports'}));
  expect(within(canada()).getAllByRole('cell').map(cell=>cell.textContent)).toEqual(['+$300','$600','$300','+100.0%','25.0%','25.0%','0.0 pp']);
  expect(changes.getByText(/Share of U.S. exports/)).toBeVisible();
});

it('ranks by share in percentage points independently of chart selections and history',async()=>{
  render(<ProductExplorer release={sampleRelease()}/>);const user=userEvent.setup();
  const changes=within(screen.getByRole('region',{name:'What changed?'}));
  await user.selectOptions(changes.getByRole('combobox',{name:'Rank changes by'}),'share');
  const decreases=changes.getByRole('table',{name:'Largest decreases · country share change'});
  expect(within(within(decreases).getByRole('row',{name:/GERMANY/})).getAllByRole('cell').map(cell=>cell.textContent)).toEqual(['-3.0 pp','$300','$168','+$132','+78.6%','25.0%','28.0%']);
  const rankedText=decreases.textContent;
  await user.click(screen.getByRole('checkbox',{name:'CANADA'}));
  await user.selectOptions(screen.getByRole('combobox',{name:'History window'}),'12');
  expect(decreases.textContent).toBe(rankedText);
});

it('explains unavailable rankings when classification continuity is not verified',()=>{
  const release=sampleRelease();release.classificationIntervals=[];
  render(<ProductExplorer release={release}/>);
  const changes=within(screen.getByRole('region',{name:'What changed?'}));
  expect(changes.getByText(/Classification continuity is not verified across both periods/)).toBeVisible();
  expect(changes.getByText(/4 countries excluded because this comparison is unavailable/)).toBeVisible();
  expect(changes.getAllByText(/No eligible countries/)).toHaveLength(2);
  expect(changes.getByRole('button',{name:'Download changes CSV'})).toBeDisabled();
});
it('keeps small nonzero share changes visible rather than rounding them to zero',async()=>{
  const release=sampleRelease();
  for(const row of release.observations){
    if(row.direction!=='imports')continue;
    if(row.geography==='world')row.valueUsd!*=10;
    if(row.partnerCode==='1220'&&row.month.startsWith('2025'))row.valueUsd=row.month==='2025-12'?23:24;
  }
  render(<ProductExplorer release={release}/>);
  const changes=within(screen.getByRole('region',{name:'What changed?'}));
  await userEvent.setup().selectOptions(changes.getByRole('combobox',{name:'Rank changes by'}),'share');
  const canada=within(changes.getByRole('table',{name:'Largest decreases · country share change'})).getByRole('row',{name:/CANADA/});
  expect(within(canada).getAllByRole('cell')[0]).toHaveTextContent('-0.0083 pp');
});
