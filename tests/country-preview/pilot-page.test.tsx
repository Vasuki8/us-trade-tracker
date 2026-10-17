// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {CanadaPreview} from '../../src/components/CanadaPreview';
import {makeCountryPreviewFixture} from '../helpers/country-preview-data';
import {countryCsvFilename,serializeCountryMonthlyCsv,serializeCountryProductsCsv} from '../../src/lib/country-preview/downloads';
import {parseCsv} from '../helpers/parse-csv';
import type {CountryPilotPresentation} from '../../src/lib/country-preview/types';
afterEach(()=>cleanup());
const pilot:CountryPilotPresentation={kind:'pilot-prepared',releaseId:'2026-08-2e27b39c-932b-4f3d-b2aa-3b11ca2a3cca',acceptedAt:'2026-10-12T23:46:54.013Z'};
const sample:CountryPilotPresentation={kind:'pilot-fixture'};
const snapshot:CountryPilotPresentation={kind:'pilot-snapshot',releaseId:'2026-08-2e27b39c-932b-4f3d-b2aa-3b11ca2a3cca',acceptedAt:'2026-10-12T23:46:54.013Z'};
function real(){const data=makeCountryPreviewFixture();data.source='retained';data.rawVerification='previous-reviewed-replay';return data;}
it('presents a fixed historical snapshot and accepted context without claiming deployment',async()=>{
  const data=real(),before=JSON.stringify(data);render(<CanadaPreview data={data} presentation={pilot}/>);
  expect(screen.getByRole('heading',{name:'Canada historical snapshot'})).toBeVisible();expect(screen.getByText('24-month accepted snapshot · Prepared for pilot publication')).toBeVisible();
  expect(screen.getByText('12 Oct 2026, 23:46 UTC')).toHaveAttribute('datetime',pilot.acceptedAt);
  expect(screen.getByText('11 Oct 2026, 17:01 UTC')).toHaveAttribute('datetime',data.captureInterval.startedAt);
  const overview=screen.getByRole('region',{name:'Country overview'});expect(overview).toHaveTextContent('$2,400,000');expect(overview).toHaveTextContent('$1,200,000');
  expect(screen.getByRole('table',{name:'Selected categories · Imports'})).toBeVisible();
  const summary=screen.getByText('Capture and verification details');expect(summary.closest('details')).not.toHaveAttribute('open');await userEvent.click(summary);expect(summary.closest('details')).toHaveAttribute('open');
  await userEvent.click(screen.getByRole('radio',{name:'Exports'}));expect(summary.closest('details')).toHaveAttribute('open');expect(overview).toHaveTextContent('Canadian import data');expect(screen.getByRole('region',{name:'Sources and revision differences'})).toHaveTextContent('17 matched; 7 mismatch');expect(screen.getByRole('region',{name:'Sources and revision differences'})).toHaveTextContent('Local acceptance applies');expect(JSON.stringify(data)).toBe(before);
  expect(screen.queryByText(/Not published|latest Canada data|monthly Canada updates/)).toBeNull();
});
it('keeps pilot fixtures synthetic and without local acceptance',()=>{
  render(<CanadaPreview data={makeCountryPreviewFixture()} presentation={sample}/>);expect(screen.getByText('Synthetic pilot preparation sample · No accepted country release')).toBeVisible();expect(screen.getByText('Synthetic development data')).toBeVisible();expect(screen.queryByText(/Local acceptance recorded/)).toBeNull();expect(screen.getByText('Capture and verification details')).toBeVisible();
});
it.each(['imports','exports'] as const)('retains every %s value/provenance column with separate pilot CSV context',direction=>{
  const data=real();for(const [kind,serialize] of [['monthly',serializeCountryMonthlyCsv],['products',serializeCountryProductsCsv]] as const){const original=parseCsv(serialize(data,direction)),rows=parseCsv(serialize(data,direction,pilot));expect(rows).toHaveLength(kind==='monthly'?24:10);rows.forEach((row,i)=>{for(const [key,value] of Object.entries(original[i]))expect(row[key],key).toBe(value);expect(row).toMatchObject({presentation_context:'pilot-preparation',accepted_release_id:pilot.releaseId,local_accepted_at:pilot.acceptedAt,build_context:'local-preparation-only'});expect(row).not.toHaveProperty('publication_status');});expect(countryCsvFilename(direction,kind,pilot)).toBe(`canada-1220-${direction}-2024-09-2026-08-pilot-prepared-${kind}.csv`);}
  for(const row of parseCsv(serializeCountryProductsCsv(data,direction,pilot)).filter(r=>r.special_by_policy==='true'))expect(row).toMatchObject({change_usd:'',growth_percent:'',current_share_percent:'',prior_share_percent:'',share_change_percentage_points:''});
});
it('uses hand-derived sample denominators and no real acceptance in fixture CSVs',()=>{
  const rows=parseCsv(serializeCountryProductsCsv(makeCountryPreviewFixture(),'imports',sample));expect(rows[0]).toMatchObject({current_value_usd:'240000',prior_value_usd:'120000',current_country_total_usd:'2400000',prior_country_total_usd:'1200000',current_share_percent:'10',prior_share_percent:'10',presentation_context:'pilot-fixture',accepted_release_id:'',local_accepted_at:'',build_context:'local-preparation-only'});expect(countryCsvFilename('exports','products',sample)).toBe('canada-1220-exports-2024-09-2026-08-pilot-fixture-products.csv');
});
it.each(['imports','exports'] as const)('withholds unsupported %s display and CSV comparisons while retaining reported amounts',async direction=>{
  const data=real(),p=data.directions[direction].products.find(row=>!row.specialByPolicy)!;p.comparisonEligible=false;p.reason='incompatible';p.classification.status='incompatible';
  render(<CanadaPreview data={data} presentation={pilot}/>);if(direction==='exports')await userEvent.click(screen.getByRole('radio',{name:'Exports'}));
  const table=screen.getByRole('table',{name:`Selected categories · ${direction==='imports'?'Imports':'Exports'}`}),row=within(table).getAllByRole('row').find(row=>row.textContent?.startsWith(p.code))!;
  expect(row).toHaveTextContent('Unavailable');expect(within(row).getAllByRole('cell').slice(2,7).every(cell=>cell.textContent==='Unavailable')).toBe(true);
  const csvRow=parseCsv(serializeCountryProductsCsv(data,direction,pilot)).find(row=>row.product_code===p.code)!;expect(csvRow.current_value_usd).toBe(String(p.current.observedSumUsd));expect(csvRow.change_usd).toBe('');expect(csvRow.current_share_percent).toBe('');
});
it('rejects crossed pilot sources in both rendering and serializers',()=>{
  const spy=vi.spyOn(console,'error').mockImplementation(()=>{});try{for(const [data,presentation] of [[makeCountryPreviewFixture(),pilot],[real(),sample]] as const){expect(()=>render(<CanadaPreview data={data} presentation={presentation}/>)).toThrow();for(const serialize of [serializeCountryMonthlyCsv,serializeCountryProductsCsv])expect(()=>serialize(data,'imports',presentation)).toThrow();}}finally{spy.mockRestore();}
});
it('snapshot retains research without preparation or publication claims',async()=>{
  const data=real(),before=JSON.stringify(data);render(<CanadaPreview data={data} presentation={snapshot}/>);
  expect(screen.getByRole('heading',{name:'Canada historical snapshot'})).toBeVisible();
  expect(screen.getByText('24-month accepted historical snapshot')).toBeVisible();expect(screen.getByText('COUNTRY RESEARCH / HISTORICAL SNAPSHOT')).toBeVisible();
  await userEvent.click(screen.getByText('Capture and verification details',{exact:true}));
  expect(screen.getByText('12 Oct 2026, 23:46 UTC')).toHaveAttribute('datetime',snapshot.acceptedAt);
  expect(screen.getByText(/Snapshot accepted/)).toBeVisible();expect(screen.queryByText(/Prepared for pilot publication|This prepared page does not publish|Website published|Deployment time/)).toBeNull();
  expect(screen.getAllByText('Compatible · accepted snapshot').length).toBeGreaterThan(0);
  await userEvent.click(screen.getByRole('radio',{name:'Exports'}));expect(screen.getByRole('table',{name:'Selected categories · Exports'})).toBeVisible();
  expect(screen.getByText('Capture and verification details')).toBeVisible();expect(screen.getByText('Canadian data exchange definitions')).toBeVisible();expect(JSON.stringify(data)).toBe(before);
});
it.each(['imports','exports'] as const)('snapshot CSVs preserve original %s columns with a truthful separate context',direction=>{
  const data=real();for(const [kind,serialize] of [['monthly',serializeCountryMonthlyCsv],['products',serializeCountryProductsCsv]] as const){
    const original=parseCsv(serialize(data,direction)),rows=parseCsv(serialize(data,direction,snapshot));
    expect(rows).toHaveLength(kind==='monthly'?24:10);rows.forEach((row,i)=>{for(const [key,value] of Object.entries(original[i]))expect(row[key],key).toBe(value);expect(row).toMatchObject({presentation_context:'historical-snapshot',accepted_release_id:snapshot.releaseId,local_accepted_at:snapshot.acceptedAt,build_context:'accepted-historical-snapshot'});expect(row).not.toHaveProperty('publication_status');});
    expect(countryCsvFilename(direction,kind,snapshot)).toBe(`canada-1220-${direction}-2024-09-2026-08-historical-snapshot-${kind}.csv`);
  }
  const statistical=parseCsv(serializeCountryProductsCsv(data,direction,snapshot)).filter(row=>row.special_by_policy==='true');expect(statistical.length).toBeGreaterThan(0);
  for(const row of statistical)expect(row).toMatchObject({change_usd:'',growth_percent:'',current_share_percent:'',prior_share_percent:'',share_change_percentage_points:''});
});
it('snapshot keeps zero-prior growth and unavailable comparisons blank',()=>{
  const data=real(),p=data.directions.imports.products[0];p.prior.observedSumUsd=0;p.prior.sharePercent=0;p.growthPercent=null;
  let row=parseCsv(serializeCountryProductsCsv(data,'imports',snapshot))[0];expect(row.prior_value_usd).toBe('0');expect(row.growth_percent).toBe('');expect(row.prior_share_percent).toBe('0');
  p.comparisonEligible=false;p.reason='classification-unverified';row=parseCsv(serializeCountryProductsCsv(data,'imports',snapshot))[0];
  expect(row).toMatchObject({comparison_eligible:'false',change_usd:'',growth_percent:'',current_share_percent:'',prior_share_percent:'',share_change_percentage_points:''});
});
it('snapshot rejects fixture or synthetic-replay sources before displaying or exporting',()=>{
  const invalid=[makeCountryPreviewFixture(),real()];invalid[1].rawVerification='synthetic';
  const spy=vi.spyOn(console,'error').mockImplementation(()=>{});try{for(const data of invalid){expect(()=>render(<CanadaPreview data={data} presentation={snapshot}/>)).toThrow();for(const serialize of [serializeCountryMonthlyCsv,serializeCountryProductsCsv])expect(()=>serialize(data,'imports',snapshot)).toThrow();}}finally{spy.mockRestore();}
});
