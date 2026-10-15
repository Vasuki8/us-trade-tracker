// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderToStaticMarkup} from 'react-dom/server';
import '@testing-library/jest-dom/vitest';
import {productChangeSample as sample} from '../helpers/product-changes';
import {buildProductChangesView} from '../../src/lib/trade/product-changes';
import {ProductChanges} from '../../src/components/ProductChanges';

afterEach(()=>{cleanup();window.history.replaceState(null,'','/');});
const data=(products:ReturnType<typeof sample>[])=>(JSON.stringify({imports:buildProductChangesView(products,'imports'),exports:buildProductChangesView(products,'exports')}));

it('switches product ranking and trade direction while keeping periods and profile links',async()=>{
  render(<ProductChanges data={data([sample('100001','Big',1_000_000_000,1_100_000_000,40_000_000,20_000_000),sample('100002','Fast',10_000_000,20_000_000,20_000_000,50_000_000)])}/>);
  const user=userEvent.setup(),section=screen.getByRole('region',{name:'Ranked product changes'});
  const rows=(title:string)=>within(screen.getByRole('table',{name:title})).getAllByRole('row').slice(1);
  expect(rows('Largest product increases · dollar change').map(row=>within(row).getByRole('link').textContent)).toEqual(['Big','Fast']);
  expect(section).toHaveTextContent('Jan 2025–Dec 2025 compared with Jan 2024–Dec 2024');
  expect(within(rows('Largest product increases · dollar change')[0]).getAllByRole('cell').map(cell=>cell.textContent)).toEqual(['+$100,000,000','$1,100,000,000','$1,000,000,000','+10.0%']);
  await user.selectOptions(screen.getByLabelText('Rank product changes by'),'growth');
  expect(rows('Largest product increases · percentage growth').map(row=>within(row).getByRole('link').textContent)).toEqual(['Fast','Big']);
  await user.click(screen.getByRole('radio',{name:'Exports'}));
  expect(rows('Largest product decreases · percentage growth')[0]).toHaveTextContent('Big');
  expect(within(rows('Largest product decreases · percentage growth')[0]).getByRole('link')).toHaveAttribute('href','/products/100001/?direction=exports&months=12');
  expect(section).toHaveTextContent('U.S. exports');expect(screen.getByRole('button',{name:'Download product changes CSV'})).toBeEnabled();
});

it('explains unavailable and different-month exclusions and disables an empty CSV',()=>{
  const broken=sample('100001','Unverified',10_000_000,20_000_000);broken.release.classificationIntervals=[];
  const older=sample('100002','Older',10_000_000,20_000_000);older.release.reportingMonth='2025-11';
  render(<ProductChanges data={data([broken,older])}/>);
  const list=screen.getByRole('list',{name:'Products excluded from comparison'});
  expect(list).toHaveTextContent('Unverified');expect(list).toHaveTextContent('Classification continuity is unverified');
  expect(list).toHaveTextContent('Older');expect(list).toHaveTextContent('Nov 2025');
  expect(screen.getByRole('status')).toHaveTextContent('1 unavailable comparison');expect(screen.getByRole('status')).toHaveTextContent('1 different reporting month');
  expect(screen.getByRole('button',{name:'Download product changes CSV'})).toBeDisabled();
});

it('shows the editorial threshold and excludes small prior totals only for growth',async()=>{
  render(<ProductChanges data={data([sample('100001','Small',0,12_000_000)])}/>);
  expect(screen.getByRole('table',{name:'Largest product increases · dollar change'})).toHaveTextContent('Unavailable');
  expect(screen.getByRole('button',{name:'Download product changes CSV'})).toBeEnabled();
  await userEvent.setup().selectOptions(screen.getByLabelText('Rank product changes by'),'growth');
  expect(screen.getByRole('status')).toHaveTextContent('1 below the growth threshold');
  expect(screen.getByText(/Growth rankings require at least \$10,000,000/)).toBeVisible();
  expect(screen.getByText(/Below the growth threshold: Small/)).toBeVisible();
  expect(screen.getByRole('button',{name:'Download product changes CSV'})).toBeDisabled();
});


it('product_monthly_entry_preserves_direction_and_coverage',async()=>{
  const unavailable=sample('090111','Green',20_000_000,30_000_000);unavailable.release.classificationIntervals=[];
  render(<ProductChanges data={data([sample('090121','Roasted',10_000_000,20_000_000),unavailable])}/>);
  const entry=screen.getByRole('link',{name:'Compare latest-month figures',exact:true});
  expect(entry).toHaveAttribute('href','/briefing/portfolio/?products=090121%2C090111&direction=imports');
  await userEvent.setup().click(screen.getByRole('radio',{name:'Exports',exact:true}));
  await userEvent.setup().selectOptions(screen.getByLabelText('Rank product changes by'),'growth');
  expect(entry).toHaveAttribute('href','/briefing/portfolio/?products=090121%2C090111&direction=exports');
  expect(screen.getByRole('list',{name:'Products excluded from comparison'})).toHaveTextContent('Green');
});

it('static_product_controls_wait_for_hydration',()=>{
  const container=document.createElement('div');
  container.innerHTML=renderToStaticMarkup(<ProductChanges data={data([sample('090121','Roasted',10_000_000,20_000_000)])}/>);
  const page=within(container);
  expect(page.getByRole('radio',{name:'Imports',exact:true})).toBeChecked();
  for(const name of ['Imports','Exports'])expect(page.getByRole('radio',{name,exact:true})).toBeDisabled();
  expect(page.getByLabelText('Rank product changes by')).toBeDisabled();
  expect(page.getByRole('button',{name:'Download product changes CSV',exact:true})).toBeDisabled();
  expect(page.getByRole('table',{name:'Largest product increases · dollar change'})).toHaveTextContent('Roasted');
  expect(page.getByRole('link',{name:'Compare latest-month figures',exact:true})).toHaveAttribute('href','/briefing/portfolio/?products=090121&direction=imports');
});
