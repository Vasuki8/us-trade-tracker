// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {render,screen,cleanup,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderToStaticMarkup} from 'react-dom/server';
import {Blob as NodeBlob} from 'node:buffer';
import '@testing-library/jest-dom/vitest';
import fixture from '../fixtures/mexico-local-profile.json';
import {MexicoLocalProfile} from '../../src/components/MexicoLocalProfile';
import {MexicoAllGoodsHistory} from '../../src/components/MexicoAllGoodsHistory';
import {parseCsv} from '../helpers/parse-csv';
import type {MexicoLocalProfile as Profile} from '../../src/lib/mexico-profile/types';
const download=vi.hoisted(()=>vi.fn());
vi.mock('../../src/lib/trade/downloads',()=>({downloadBlob:download}));
const data=()=>structuredClone(fixture) as Profile;
beforeEach(()=>{download.mockReset();vi.stubGlobal('Blob',NodeBlob);});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('server renders Imports with disabled controls and meaningful no-JavaScript content',()=>{
 const html=renderToStaticMarkup(<MexicoLocalProfile data={data()}/>);
 expect(html).toContain('Mexico — all-goods trade');expect(html).toContain('Synthetic development sample');expect(html).toContain('No accepted Mexico release');
 expect(html).toMatch(/<fieldset[^>]*disabled/);expect(html).toMatch(/<button[^>]*disabled[^>]*>Download monthly CSV/);
 expect(html).toContain('$33,000');expect(html).toContain('$18,600');expect(html).toContain('Direction switching and CSV downloads require JavaScript.');
 expect(html).not.toMatch(/<details[^>]*open/);
});
it('switches all direction-dependent cards, history labels and rows together',async()=>{
 const user=userEvent.setup();render(<MexicoLocalProfile data={data()}/>);
 expect(screen.getByRole('radio',{name:'Imports'})).toBeChecked();
 expect(screen.getByLabelText('Latest captured month')).toHaveTextContent('$3,300');
 await user.click(screen.getByRole('radio',{name:'Exports'}));
 expect(screen.getByRole('radio',{name:'Exports'})).toBeChecked();expect(screen.getByLabelText('Latest captured month')).toHaveTextContent('$6,600');
 expect(screen.getByLabelText('Current twelve-month total')).toHaveTextContent('$66,000');
 expect(screen.getByLabelText('Prior twelve-month total')).toHaveTextContent('$37,200');
 expect(screen.getByRole('img',{name:'Monthly U.S. exports to Mexico'})).toBeInTheDocument();
 const table=screen.getByRole('table',{name:'Monthly U.S. exports to Mexico — nominal USD',hidden:true});
 expect(within(table).getAllByRole('row',{hidden:true})[1]).toHaveTextContent('$2,000');
});
it('preserves whole-snapshot qualifications and withholds product comparisons',()=>{
 render(<MexicoLocalProfile data={data()}/>);
 expect(screen.getByText(/Dated publication checks differ in 32 of 48 observations/)).toBeVisible();
 expect(screen.getByText(/whole-snapshot counts across Imports and Exports/)).toBeInTheDocument();
 expect(screen.getByText(/Product comparisons are unavailable pending classification verification/)).toBeVisible();
 expect(screen.queryByRole('heading',{name:/products|categories|duties/i})).not.toBeInTheDocument();
});
it('downloads the active direction with exact values and a local filename',async()=>{
 const user=userEvent.setup();render(<MexicoLocalProfile data={data()}/>);
 await user.click(screen.getByRole('radio',{name:'Exports'}));await user.click(screen.getByRole('button',{name:'Download summary CSV'}));
 const [blob,name]=download.mock.calls[0];expect(name).toBe('mexico-2010-exports-2024-09-2026-08-synthetic-local-summary.csv');
 expect(parseCsv(await blob.text())[0]).toMatchObject({direction:'exports',current_total_usd:'66000',prior_total_usd:'37200',publication_status:'unpublished'});
});
it('shows a retryable download error, clearing it after a successful retry',async()=>{
 download.mockImplementationOnce(()=>{throw Error('blocked');});const user=userEvent.setup();render(<MexicoLocalProfile data={data()}/>);
 const button=screen.getByRole('button',{name:'Download monthly CSV'});await user.click(button);expect(screen.getByRole('alert')).toHaveTextContent('Download unavailable. Please try again.');
 await user.click(button);expect(screen.queryByRole('alert')).not.toBeInTheDocument();expect(download).toHaveBeenCalledTimes(2);
});
it('renders a gap rather than joining across unavailable monthly values',()=>{
 const view=data().directions.imports;view.monthly[5].valueUsd=null;
 const html=renderToStaticMarkup(<MexicoAllGoodsHistory view={view}/>);
 expect(html).toContain('Unavailable');expect(html).toContain('Gaps indicate unavailable values.');
 const paths=[...html.matchAll(/data-monthly-line="true"[^>]*d="([^"]*)"/g)].map(m=>m[1]);
 expect(paths).toHaveLength(2);for(const path of paths)expect(path.match(/M/g)).toHaveLength(2);
});

it('labels public real snapshots without local or unpublished claims',()=>{
 const profile={...data(),source:'census' as const,presentation:'public-pilot-snapshot' as const,acceptance:{releaseId:'2026-08-test',acceptedAt:'2026-10-19T04:12:15.203Z',scope:'private-all-goods' as const}};
 render(<MexicoLocalProfile data={profile}/>);
 expect(screen.getByText('Historical snapshot · All goods only')).toBeVisible();
 expect(screen.getByText('COUNTRY RESEARCH / HISTORICAL SNAPSHOT')).toBeVisible();
 expect(screen.queryByText(/local preview|unpublished/i)).not.toBeInTheDocument();
 expect(screen.getByText(/private all-goods acceptance/i)).toBeInTheDocument();
 expect(screen.getByText(/not an official publication or revision date/i)).toBeInTheDocument();
});
it('labels the public fixture as synthetic and exports its public scope',async()=>{
 const profile={...data(),presentation:'public-pilot-fixture' as const};const user=userEvent.setup();render(<MexicoLocalProfile data={profile}/>);
 expect(screen.getByText('COUNTRY RESEARCH / HISTORICAL SNAPSHOT')).toBeVisible();
 expect(screen.getByText(/Synthetic development sample · No accepted Mexico release/)).toBeVisible();
 expect(screen.queryByText(/local preview|unpublished/i)).not.toBeInTheDocument();
 for(const direction of ['imports','exports'] as const){
  await user.click(screen.getByRole('radio',{name:direction==='imports'?'Imports':'Exports'}));
  for(const kind of ['monthly','summary'] as const){
   await user.click(screen.getByRole('button',{name:'Download '+kind+' CSV'}));
   const [blob,name]=download.mock.calls.at(-1)!;
   expect(name).toContain('-public-pilot-fixture-'+kind+'.csv');
   expect(parseCsv(await blob.text())[0]).toMatchObject({direction,publication_status:'synthetic-public-pilot-fixture',publication_scope:'all-goods-only',product_comparisons_available:'false',acceptance_scope:'synthetic-local'});
  }
 }
 expect(screen.getByLabelText('Latest captured month')).toHaveTextContent('$6,600');
 expect(screen.getByRole('img',{name:'Monthly U.S. exports to Mexico'})).toBeInTheDocument();
 expect(screen.getByText(/32 of 48 observations/)).toBeVisible();
 expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
});
