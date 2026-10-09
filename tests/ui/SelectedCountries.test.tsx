// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {sampleDutyRelease} from '../helpers/duties';
import {ProductExplorer} from '../../src/components/ProductExplorer';

afterEach(()=>{cleanup();window.history.replaceState(null,'','/');});
const saved=(direction='imports')=>window.history.replaceState(null,'',`/products/090121/?direction=${direction}&months=12&countries=4759%2C1220`);
const comparison=()=>screen.getByRole('region',{name:'Selected country comparison'});
const table=()=>within(comparison()).getByRole('table',{name:'Selected country annual comparison'});

it('identifies national headlines as U.S. totals while a selected country comparison is shown',()=>{
  saved();render(<ProductExplorer release={sampleDutyRelease()}/>);const national=screen.getByRole('region',{name:'U.S. trade totals'});expect(national).toHaveTextContent('U.S. total · latest month · imports');expect(national).toHaveTextContent('U.S. total · trailing twelve months');expect(national).toHaveTextContent('$100');expect(national).toHaveTextContent('$1.2K');
});
it('shows selected annual rows in saved order with matching periods, shares and growth',()=>{
  saved();render(<ProductExplorer release={sampleDutyRelease()}/>);expect(comparison()).toHaveTextContent('Jan 2025–Dec 2025 compared with Jan 2024–Dec 2024');expect(comparison()).toHaveTextContent('U.S. imports');
  const rows=within(table()).getAllByRole('row').slice(1);expect(rows).toHaveLength(2);expect(rows[0]).toHaveTextContent('ITALY');expect(rows[1]).toHaveTextContent('CANADA');for(const row of rows)expect(within(row).getAllByRole('cell').map(cell=>cell.textContent)).toEqual(['$300','$144','+$156','+108.3%','25.0%','24.0%','+1.0 pp']);
  expect(comparison()).toHaveTextContent('GEN_VAL_MO');expect(within(comparison()).getByRole('button',{name:'Download selected countries CSV'})).toBeEnabled();
});
it('retains annual figures when the chart window or picker search changes',async()=>{
  saved();render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup(),before=table().textContent;await user.selectOptions(screen.getByLabelText('History window'),'60');await user.type(screen.getByRole('searchbox',{name:'Find a country'}),'mex');expect(table().textContent).toBe(before);expect(comparison()).toHaveTextContent(/history window changes the chart/);
});
it('updates comparison rows after country removal and hides them when showing the U.S. total',async()=>{
  saved();render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();await user.click(screen.getByRole('button',{name:'Remove ITALY'}));expect(within(table()).getAllByRole('row')).toHaveLength(2);expect(table()).toHaveTextContent('CANADA');expect(table()).not.toHaveTextContent('ITALY');await user.click(screen.getByRole('button',{name:'Show U.S. total'}));expect(screen.queryByRole('region',{name:'Selected country comparison'})).toBeNull();
});
it('clears the old summary on direction change and uses export values for new selections',async()=>{
  saved();render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();await user.click(screen.getByRole('radio',{name:'Exports'}));expect(screen.queryByRole('region',{name:'Selected country comparison'})).toBeNull();await user.click(screen.getByRole('checkbox',{name:'CANADA'}));expect(comparison()).toHaveTextContent('U.S. exports');expect(comparison()).toHaveTextContent('ALL_VAL_MO');expect(within(within(table()).getByRole('row',{name:/CANADA/})).getAllByRole('cell').map(cell=>cell.textContent)).toEqual(['$600','$300','+$300','+100.0%','25.0%','25.0%','0.0 pp']);
});
it('keeps an incomplete selected country visible with available figures and unavailable comparisons',()=>{
  const release=sampleDutyRelease();release.observations=release.observations.filter(row=>!(row.direction==='imports'&&row.partnerCode==='1220'&&row.month==='2024-07'));saved();render(<ProductExplorer release={release}/>);
  expect(within(within(table()).getByRole('row',{name:/CANADA/})).getAllByRole('cell').map(cell=>cell.textContent)).toEqual(['$300','Unavailable','Unavailable','Unavailable','25.0%','Unavailable','Unavailable']);expect(comparison()).toHaveTextContent(/Some figures or comparisons are unavailable/);
});
it('leaves growth unavailable at a zero prior value and comparisons unavailable across classifications',()=>{
  const release=sampleDutyRelease();release.observations.filter(row=>row.direction==='imports'&&row.partnerCode==='1220'&&row.month<'2025-01').forEach(row=>{row.valueUsd=0;});release.classificationIntervals=[{from:'2024-01',to:'2024-12',evidenceUrl:'https://example.invalid/old'},{from:'2025-01',to:'2025-12',evidenceUrl:'https://example.invalid/new'}];saved();render(<ProductExplorer release={release}/>);
  expect(within(within(table()).getByRole('row',{name:/CANADA/})).getAllByRole('cell').map(cell=>cell.textContent)).toEqual(['$300','$0','Unavailable','Unavailable','25.0%','0.0%','Unavailable']);
});
