// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {sampleDutyRelease} from '../helpers/duties';
import {ProductExplorer} from '../../src/components/ProductExplorer';

afterEach(()=>{cleanup();window.history.replaceState(null,'','/');});
const savedView=()=>window.history.replaceState(null,'','/products/090121/?direction=imports&months=12&countries=4759%2C1220');

it('finds a country by case-insensitive partial name without changing the selected view',async()=>{
  render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup(),address=window.location.href;
  const search=screen.getByRole('searchbox',{name:'Find a country'});await user.type(search,' iTa ');
  expect(screen.getAllByRole('checkbox')).toHaveLength(1);expect(screen.getByRole('checkbox',{name:'ITALY'})).not.toBeChecked();expect(screen.getByText(/1 of 4 countries/)).toBeVisible();expect(window.location.href).toBe(address);
  await user.click(screen.getByRole('button',{name:'Clear country search'}));expect(screen.getAllByRole('checkbox')).toHaveLength(4);expect(search).toHaveValue('');expect(search).toHaveFocus();
});

it('finds a country by code and applies it to the chart table and duty selection',async()=>{
  render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();await user.type(screen.getByRole('searchbox',{name:'Find a country'}),'1220');
  await user.click(screen.getByRole('checkbox',{name:'CANADA'}));expect(screen.getByRole('list',{name:'Selected countries'})).toHaveTextContent('CANADA');expect(screen.getByText('1 of 3 selected')).toBeVisible();
  expect(within(screen.getByRole('table',{name:'Monthly trade values · current U.S. dollars'})).getAllByRole('columnheader').map(header=>header.textContent)).toEqual(['Month','CANADA']);
  expect(screen.getByRole('region',{name:'Estimated duties'})).toHaveTextContent('CANADA');expect(window.location.search).toBe('?direction=imports&months=60&countries=1220');
});

it('keeps restored countries visible in their saved order when the result list is filtered',async()=>{
  savedView();render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();await user.type(screen.getByRole('searchbox',{name:'Find a country'}),'mex');
  const items=within(screen.getByRole('list',{name:'Selected countries'})).getAllByRole('listitem');expect(items).toHaveLength(2);expect(within(items[0]).getByRole('button',{name:'Remove ITALY'})).toBeVisible();expect(within(items[1]).getByRole('button',{name:'Remove CANADA'})).toBeVisible();
  expect(screen.getAllByRole('checkbox')).toHaveLength(1);expect(screen.getByRole('checkbox',{name:'MEXICO'})).not.toBeChecked();expect(screen.getByText('2 of 3 selected')).toBeVisible();
});

it('removes a hidden selected country and returns keyboard focus to the search field',async()=>{
  savedView();render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup(),search=screen.getByRole('searchbox',{name:'Find a country'});await user.type(search,'mex');
  await user.click(screen.getByRole('button',{name:'Remove ITALY'}));expect(search).toHaveFocus();expect(search).toHaveValue('mex');expect(screen.queryByRole('button',{name:'Remove ITALY'})).toBeNull();expect(screen.getByRole('button',{name:'Remove CANADA'})).toBeVisible();expect(window.location.search).toBe('?direction=imports&months=12&countries=1220');
  expect(within(screen.getByRole('table',{name:'Monthly trade values · current U.S. dollars'})).getAllByRole('columnheader').map(header=>header.textContent)).toEqual(['Month','CANADA']);
  await user.click(screen.getByRole('button',{name:'Show U.S. total'}));expect(screen.queryByRole('list',{name:'Selected countries'})).toBeNull();expect(screen.getByText('0 of 3 selected')).toBeVisible();expect(window.location.search).toBe('?direction=imports&months=12');expect(search).toHaveFocus();
});

it('enforces the three-country limit across searches and permits another country after removal',async()=>{
  render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup(),search=screen.getByRole('searchbox',{name:'Find a country'});
  for(const [code,name] of [['1220','CANADA'],['4759','ITALY'],['2010','MEXICO']]){await user.clear(search);await user.type(search,code);await user.click(screen.getByRole('checkbox',{name}));}
  await user.clear(search);await user.type(search,'germ');expect(screen.getByRole('checkbox',{name:'GERMANY'})).toBeDisabled();expect(screen.getByText('3 of 3 selected')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Remove ITALY'}));expect(screen.getByRole('checkbox',{name:'GERMANY'})).toBeEnabled();await user.click(screen.getByRole('checkbox',{name:'GERMANY'}));expect(screen.getByText('3 of 3 selected')).toBeVisible();expect(window.location.search).toBe('?direction=imports&months=60&countries=1220%2C2010%2C4280');
});

it('explains no matches and clears the search when switching direction',async()=>{
  const release=sampleDutyRelease();release.observations=release.observations.filter(row=>!(row.direction==='exports'&&row.partnerCode==='2010'));
  render(<ProductExplorer release={release}/>);const user=userEvent.setup(),search=screen.getByRole('searchbox',{name:'Find a country'});await user.type(search,'not-a-country');expect(screen.queryAllByRole('checkbox')).toHaveLength(0);expect(screen.getByText(/No matching countries/)).toBeVisible();expect(screen.getByText(/0 of 4 countries/)).toBeVisible();
  await user.clear(search);await user.type(search,'mex');await user.click(screen.getByRole('checkbox',{name:'MEXICO'}));await user.click(screen.getByRole('radio',{name:'Exports'}));
  expect(screen.getByRole('searchbox',{name:'Find a country'})).toHaveValue('');expect(screen.getAllByRole('checkbox')).toHaveLength(3);expect(screen.queryByRole('list',{name:'Selected countries'})).toBeNull();expect(screen.queryByRole('checkbox',{name:'MEXICO'})).toBeNull();expect(screen.getByText('0 of 3 selected')).toBeVisible();
});

it('keeps all country names readable but picker controls disabled before JavaScript restoration',()=>{
  const holder=document.createElement('div');holder.innerHTML=renderToStaticMarkup(<ProductExplorer release={sampleDutyRelease()}/>);
  expect((holder.querySelector('input[type=search]') as HTMLInputElement|null)?.disabled).toBe(true);
  const countries=holder.querySelectorAll<HTMLInputElement>('.country-list input');expect(countries).toHaveLength(4);expect([...countries].every(input=>input.disabled)).toBe(true);
  expect(holder.querySelector('.country-list')).toHaveTextContent('CANADA');expect(holder.querySelector('noscript')).toHaveTextContent('find and select countries');
});
