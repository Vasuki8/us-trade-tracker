// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {sampleRelease} from '../helpers/release';
import {buildChangesView} from '../../src/lib/trade/changes';
import {MonthlyChanges} from '../../src/components/MonthlyChanges';
import type {Release} from '../../src/lib/trade/types';

afterEach(cleanup);
const props=(release:Release)=>({reportingMonth:release.reportingMonth,data:JSON.stringify({imports:buildChangesView(release,'imports'),exports:buildChangesView(release,'exports')})});

it('shows reporting and comparison periods with explicit sample provenance',()=>{
  render(<MonthlyChanges {...props(sampleRelease())}/>);
  expect(screen.getByText('Development sample data')).toBeVisible();
  expect(screen.getByText('Dec 2025')).toBeVisible();
  expect(screen.getByRole('region',{name:'What changed?'})).toHaveTextContent('Jan 2025–Dec 2025 compared with Jan 2024–Dec 2024');
  expect(screen.getByText(/Source: Development fixtures/)).toHaveTextContent('GEN_VAL_MO');
  expect(screen.getByText(/Source: Development fixtures/)).toHaveTextContent('2026-01-01T00:00:00.000Z');
  expect(screen.queryByText(/independent of chart selections/)).toBeNull();
});

it('switches all totals, rankings and provenance together while keeping the ranking choice',async()=>{
  const release=sampleRelease();release.revisedKeys=['090121/exports/2025-12/country/1220/ALL_VAL_MO'];
  render(<MonthlyChanges {...props(release)}/>);const user=userEvent.setup();
  await user.selectOptions(screen.getByLabelText('Rank changes by'),'share');
  expect(screen.getByRole('table',{name:'Largest decreases · country share change'})).toHaveTextContent('GERMANY');
  await user.click(screen.getByRole('radio',{name:'Exports'}));
  expect(screen.getByLabelText('Rank changes by')).toHaveValue('share');
  expect(screen.getByRole('button',{name:'Download changes CSV'})).toBeDisabled();
  expect(screen.getByText(/Source: Development fixtures/)).toHaveTextContent('ALL_VAL_MO');
  expect(screen.getByText(/Source: Development fixtures/)).toHaveTextContent('revised observations: yes');
  await user.selectOptions(screen.getByLabelText('Rank changes by'),'dollars');
  const canada=within(screen.getByRole('table',{name:'Largest increases · dollar change'})).getByRole('row',{name:/CANADA/});
  expect(canada).toHaveTextContent('$600');expect(canada).toHaveTextContent('$300');
  expect(screen.getByRole('button',{name:'Download changes CSV'})).toBeEnabled();
});

it('withholds unsupported rankings and downloads for incompatible classification periods',()=>{
  const release=sampleRelease();release.classificationIntervals=[];
  render(<MonthlyChanges {...props(release)}/>);
  expect(screen.getByText(/Classification continuity is not verified across both periods/)).toBeVisible();
  expect(screen.getByRole('button',{name:'Download changes CSV'})).toBeDisabled();
  expect(screen.getByText(/4 countries excluded/)).toBeVisible();
});

it('shows sourced Census data without a sample banner',()=>{
  const release=sampleRelease();release.source='census';
  render(<MonthlyChanges {...props(release)}/>);
  expect(screen.queryByText('Development sample data')).toBeNull();
  expect(screen.getByText(/Source: U.S. Census Bureau/)).toBeVisible();
  expect(screen.getByRole('link',{name:release.sourceUrls[0]})).toHaveAttribute('href',release.sourceUrls[0]);
});
