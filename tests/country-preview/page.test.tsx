// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {CanadaPreview} from '../../src/components/CanadaPreview';
import {makeCountryPreviewFixture} from '../helpers/country-preview-data';
import {downloadBlob} from '../../src/lib/trade/downloads';
import {serializeCountryMonthlyCsv,serializeCountryProductsCsv} from '../../src/lib/country-preview/downloads';
vi.mock('../../src/lib/trade/downloads',()=>({downloadBlob:vi.fn()}));
afterEach(()=>{cleanup();vi.clearAllMocks();});
it('renders complete Imports research with fixed periods and selected categories',()=>{
  const {container}=render(<CanadaPreview data={makeCountryPreviewFixture()}/>);
  expect(screen.getByRole('radio',{name:'Imports'})).toBeChecked();
  expect(screen.getByRole('img',{name:'Monthly U.S. imports from Canada'})).toBeVisible();
  const monthly=screen.getByRole('table',{name:'Monthly U.S. imports from Canada · nominal USD'});
  expect(within(monthly).getAllByRole('row')).toHaveLength(25);expect(within(monthly).getAllByRole('columnheader')).toHaveLength(2);
  const products=screen.getByRole('table',{name:'Selected leading categories · Imports'});expect(within(products).getAllByRole('row')).toHaveLength(11);
  expect(screen.getByRole('region',{name:'Country overview'})).toHaveTextContent('$2,400,000');expect(screen.getByRole('region',{name:'Country overview'})).toHaveTextContent('$1,200,000');
  expect(screen.getAllByText(/Sep 2025–Aug 2026/).length).toBeGreaterThan(0);expect(screen.getAllByText(/Sep 2024–Aug 2025/).length).toBeGreaterThan(0);
  expect(within(products).getByRole('row',{name:/980100/})).toHaveTextContent('Statistical category');expect(within(products).getByRole('row',{name:/980100/})).toHaveTextContent('Unavailable');
  expect(container.querySelector('a[href^="/products/"]')).toBeNull();expect(screen.queryByRole('combobox')).toBeNull();expect(container).toHaveTextContent('Synthetic development data');
  expect(container).toHaveTextContent('These figures come from a captured set of monthly Census files. Currently revised country totals can differ. Product shares here use totals from the same files as the product values.');
  expect(container).toHaveTextContent('2026-10-11T17:01:00.000Z');
});
it('switches overview, chart, table, measure and revision results together',async()=>{
  render(<CanadaPreview data={makeCountryPreviewFixture()}/>);await userEvent.click(screen.getByRole('radio',{name:'Exports'}));
  expect(screen.getByRole('radio',{name:'Exports'})).toBeChecked();expect(screen.getByRole('img',{name:'Monthly U.S. exports to Canada'})).toBeVisible();
  expect(within(screen.getByRole('table',{name:'Monthly U.S. exports to Canada · nominal USD'})).getAllByRole('row')).toHaveLength(25);
  expect(screen.getByRole('region',{name:'Country overview'})).toHaveTextContent('$4,600,000');expect(screen.getByRole('region',{name:'Country overview'})).toHaveTextContent('ALL_VAL_MO');
  expect(screen.getByRole('region',{name:'Sources and revision differences'})).toHaveTextContent('17 matched; 7 mismatch');
  expect(within(screen.getByRole('table',{name:'Retained reference differences · Exports'})).getAllByRole('row')).toHaveLength(8);
});
it('downloads both selected-direction CSVs from the same view',async()=>{
  const data=makeCountryPreviewFixture();render(<CanadaPreview data={data}/>);await userEvent.click(screen.getByRole('radio',{name:'Exports'}));
  await userEvent.click(screen.getByRole('button',{name:'Download monthly CSV'}));await userEvent.click(screen.getByRole('button',{name:'Download products CSV'}));
  expect(downloadBlob).toHaveBeenCalledTimes(2);const calls=vi.mocked(downloadBlob).mock.calls;
  const read=(blob:Blob)=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsText(blob);});
  expect(await read(calls[0][0])).toBe(serializeCountryMonthlyCsv(data,'exports'));expect(calls[0][1]).toContain('exports');expect(await read(calls[1][0])).toBe(serializeCountryProductsCsv(data,'exports'));
});
it.each(['null','zero-prior','incompatible','incomplete'] as const)('keeps %s comparisons explicitly unavailable',kind=>{
  const data=makeCountryPreviewFixture(),v=data.directions.imports,p=v.products[0];
  if(kind==='null'){v.monthly[0].valueUsd=null;v.summary.prior.totalUsd=null;v.summary.changeUsd=null;v.summary.growthPercent=null;}
  if(kind==='zero-prior'){v.summary.prior.totalUsd=0;v.summary.growthPercent=null;}
  if(kind==='incompatible'||kind==='incomplete'){p.comparisonEligible=false;p.reason=kind;p.classification.status=kind==='incompatible'?'incompatible':'unverified';}
  render(<CanadaPreview data={data}/>);
  if(kind==='incompatible'||kind==='incomplete')expect(within(screen.getByRole('table',{name:'Selected leading categories · Imports'})).getByRole('row',{name:/270900/})).toHaveTextContent('Unavailable');
  else {const overview=screen.getByRole('region',{name:'Country overview'});expect(overview).toHaveTextContent('Unavailable');if(kind==='null')expect(overview).not.toHaveTextContent('$0');else expect(overview).toHaveTextContent('$0');}
});
it('attributes retained publication links without claiming uniform revision maturity',async()=>{
  const data=makeCountryPreviewFixture();data.source='retained';data.rawVerification='previous-reviewed-replay';data.directions.exports.references.differences[0].publicationSource={url:'https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2601.pdf',bytes:100,sha256:'a'.repeat(64)};
  render(<CanadaPreview data={data}/>);await userEvent.click(screen.getByRole('radio',{name:'Exports'}));
  expect(screen.getByText('U.S. Census Bureau monthly merchandise files')).toBeVisible();expect(screen.getByRole('link',{name:'Jan 2026 original publication'})).toHaveAttribute('href',data.directions.exports.references.differences[0].publicationSource?.url);
  expect(screen.getByRole('region',{name:'Sources and revision differences'})).toHaveTextContent('do not establish each product observation’s revision date');
});
