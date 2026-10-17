// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import * as downloads from '../../src/lib/trade/downloads';
import {parseCsv} from '../helpers/parse-csv';
import {sampleRelease} from '../helpers/release';
import {makeCountryChangesData} from '../helpers/country-changes';
import {renderToStaticMarkup} from 'react-dom/server';
import {MonthlyChanges} from '../../src/components/MonthlyChanges';
import type {Release} from '../../src/lib/trade/types';

afterEach(()=>{cleanup();vi.restoreAllMocks();window.history.replaceState(null,'','/');});
const props=(release:Release)=>({reportingMonth:release.reportingMonth,data:makeCountryChangesData(release)});

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
  expect(screen.getByText('U.S. Census Bureau',{exact:true})).toBeVisible();
  expect(screen.getByRole('link',{name:release.sourceUrls[0]})).toHaveAttribute('href',release.sourceUrls[0]);
});

it('switches to matching single months with independent expected totals and ties',async()=>{
  render(<MonthlyChanges {...props(sampleRelease())}/>);
  const user=userEvent.setup();
  await user.click(screen.getByRole('radio',{name:'Latest month versus the same month last year'}));
  const region=screen.getByRole('region',{name:'What changed?'});
  expect(region).toHaveTextContent('Dec 2025 compared with Dec 2024');
  expect(region).not.toHaveTextContent('Dec 2025–Dec 2025');
  expect(region).toHaveTextContent('U.S. total · current $100previous $50');
  const rows=within(screen.getByRole('table',{name:'Largest increases · dollar change'})).getAllByRole('row').slice(1);
  expect(rows.map(row=>within(row).getByRole('rowheader').textContent)).toEqual(['CANADA 1220','ITALY 4759','MEXICO 2010','GERMANY 4280']);
  expect(within(rows[0]).getAllByRole('cell').map(cell=>cell.textContent)).toEqual(['+$13','$25','$12','+108.3%','25.0%','24.0%','+1.0 pp']);
  await user.click(screen.getByRole('radio',{name:'Rolling twelve months'}));
  expect(region).toHaveTextContent('U.S. total · current $1,200previous $600');
  expect(within(screen.getByRole('table',{name:'Largest increases · dollar change'})).getByRole('row',{name:/CANADA/})).toHaveTextContent('$300');
});

it('retains direction and metric when the period changes and binds export provenance',async()=>{
  render(<MonthlyChanges {...props(sampleRelease())}/>);
  const user=userEvent.setup();
  await user.click(screen.getByRole('radio',{name:'Exports'}));
  await user.selectOptions(screen.getByLabelText('Rank changes by'),'share');
  await user.click(screen.getByRole('radio',{name:'Latest month versus the same month last year'}));
  expect(screen.getByRole('radio',{name:'Exports'})).toBeChecked();
  expect(screen.getByLabelText('Rank changes by')).toHaveValue('share');
  expect(screen.getByText(/Source: Development fixtures/)).toHaveTextContent('ALL_VAL_MO');
  expect(screen.getByRole('region',{name:'What changed?'})).toHaveTextContent('current $200previous $100');
  expect(screen.getByRole('button',{name:'Download changes CSV'})).toBeDisabled();
  expect(screen.getByText(/4 countries have no change/)).toBeVisible();
});

it.each(['missing','suppressed'] as const)('excludes a country with a %s matching prior month',async status=>{
  const release=sampleRelease();
  if(status==='missing')release.observations=release.observations.filter(row=>!(row.direction==='imports'&&row.partnerCode==='1220'&&row.month==='2024-12'));
  else {const row=release.observations.find(row=>row.direction==='imports'&&row.partnerCode==='1220'&&row.month==='2024-12')!;row.status='suppressed';row.valueUsd=null;}
  render(<MonthlyChanges {...props(release)}/>);
  await userEvent.setup().click(screen.getByRole('radio',{name:'Latest month versus the same month last year'}));
  expect(screen.getByText(/1 country excluded/)).toBeVisible();
  expect(screen.queryByRole('link',{name:'CANADA'})).toBeNull();
});

it('withholds monthly share rankings with a zero official world denominator',async()=>{
  const release=sampleRelease();
  for(const row of release.observations)if(row.direction==='imports'&&row.month==='2024-12')row.valueUsd=0;
  render(<MonthlyChanges {...props(release)}/>);
  const user=userEvent.setup();
  await user.click(screen.getByRole('radio',{name:'Latest month versus the same month last year'}));
  expect(screen.getByRole('button',{name:'Download changes CSV'})).toBeEnabled();
  await user.selectOptions(screen.getByLabelText('Rank changes by'),'share');
  expect(screen.getByRole('button',{name:'Download changes CSV'})).toBeDisabled();
  expect(screen.getByText(/4 countries excluded/)).toBeVisible();
});

it('keeps a zero-prior monthly increase while leaving growth unavailable',async()=>{
  const release=sampleRelease();
  release.observations.find(row=>row.direction==='imports'&&row.partnerCode==='1220'&&row.month==='2024-12')!.valueUsd=0;
  render(<MonthlyChanges {...props(release)}/>);
  await userEvent.setup().click(screen.getByRole('radio',{name:'Latest month versus the same month last year'}));
  const row=within(screen.getByRole('table',{name:'Largest increases · dollar change'})).getByRole('row',{name:/CANADA/});
  expect(within(row).getAllByRole('cell').slice(0,4).map(cell=>cell.textContent)).toEqual(['+$25','$25','$0','Unavailable']);
});

it('keeps incompatible monthly classifications unavailable',async()=>{
  const release=sampleRelease();release.classificationIntervals=[{from:'2025-01',to:'2025-12',evidenceUrl:'https://example.invalid'}];
  render(<MonthlyChanges {...props(release)}/>);
  await userEvent.setup().click(screen.getByRole('radio',{name:'Latest month versus the same month last year'}));
  expect(screen.getByText(/Classification continuity is not verified/)).toBeVisible();
  expect(screen.getByRole('button',{name:'Download changes CSV'})).toBeDisabled();
});

it('binds monthly amounts and saved links to the alternate product route',async()=>{
  const release=sampleRelease();release.productCode='090122';
  for(const row of release.observations){row.productCode='090122';row.valueUsd!*=3;}
  window.history.replaceState(null,'','/changes/090122/?direction=exports&metric=dollars&period=monthly');
  render(<MonthlyChanges {...props(release)}/>);
  expect(screen.getByRole('radio',{name:'Latest month versus the same month last year'})).toBeChecked();
  expect(screen.getByRole('region',{name:'What changed?'})).toHaveTextContent('current $600previous $300');
  expect(within(screen.getByRole('table',{name:'Largest increases · dollar change'})).getByRole('row',{name:/CANADA/})).toHaveTextContent('$150');
});

it('renders a truthful rolling default with all interactive controls disabled before hydration',()=>{
  window.history.replaceState(null,'','/changes/?direction=exports&metric=share&period=monthly');
  const container=document.createElement('div');document.body.append(container);
  container.innerHTML=renderToStaticMarkup(<MonthlyChanges {...props(sampleRelease())}/>);
  const page=within(container);
  expect(page.getByRole('radio',{name:'Imports'})).toBeChecked();
  expect(page.getByRole('radio',{name:'Rolling twelve months'})).toBeChecked();
  for(const input of page.getAllByRole('radio'))expect(input).toBeDisabled();
  expect(page.getByLabelText('Rank changes by')).toBeDisabled();
  expect(page.getByRole('button',{name:'Download changes CSV'})).toBeDisabled();
  expect(page.getByRole('button',{name:'Copy changes link'})).toBeDisabled();
  expect(container).toHaveTextContent('The initial view shows U.S. imports ranked by dollar change over rolling twelve months.');
  expect(page.getByRole('region',{name:'What changed?'})).toHaveTextContent('Jan 2025–Dec 2025');container.remove();
});

it('preserves monthly context in the import duty handoff and omits duties for exports',async()=>{
  render(<MonthlyChanges {...props(sampleRelease())}/>);
  const user=userEvent.setup(),link=()=>screen.getByRole('link',{name:'Explore estimated-duty changes across countries'});
  expect(link()).toHaveAttribute('href','/changes/duties/');
  await user.click(screen.getByRole('radio',{name:'Latest month versus the same month last year'}));
  expect(link()).toHaveAttribute('href','/changes/duties/?direction=imports&period=monthly&metric=share');
  await user.click(screen.getByRole('radio',{name:'Exports'}));
  expect(screen.queryByRole('link',{name:'Explore estimated-duty changes across countries'})).toBeNull();
});
it('downloads an explicitly identified monthly CSV and leaves rolling filenames unchanged',async()=>{
  const files:{blob:Blob;filename:string}[]=[];
  vi.spyOn(downloads,'downloadBlob').mockImplementation((blob,filename)=>{files.push({blob,filename});});
  render(<MonthlyChanges {...props(sampleRelease())}/>);
  const user=userEvent.setup();
  await user.selectOptions(screen.getByLabelText('Rank changes by'),'share');
  await user.click(screen.getByRole('button',{name:'Download changes CSV'}));
  await user.click(screen.getByRole('radio',{name:'Latest month versus the same month last year'}));
  await user.click(screen.getByRole('button',{name:'Download changes CSV'}));
  expect(files.map(file=>file.filename)).toEqual(['hs-090121-imports-changes-share.csv','hs-090121-imports-changes-monthly-share.csv']);
  const read=(blob:Blob)=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsText(blob);});
  const [rolling,monthly]=await Promise.all(files.map(async file=>parseCsv(await read(file.blob))));
  expect(rolling[0]).not.toHaveProperty('comparison_period');
  expect(monthly[0]).toMatchObject({comparison_period:'monthly',partner_code:'1220',current_value_usd:'25',current_period_start:'2025-12',previous_period_start:'2024-12'});
});
