// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {CanadaPreview} from '../../src/components/CanadaPreview';
import {makeCountryPreviewFixture} from '../helpers/country-preview-data';
import {countryCsvFilename,serializeCountryMonthlyCsv,serializeCountryProductsCsv} from '../../src/lib/country-preview/downloads';
import {parseCsv} from '../helpers/parse-csv';
import type {CountryPresentation} from '../../src/lib/country-preview/types';
afterEach(()=>cleanup());
const presentation:CountryPresentation={kind:'accepted-local',releaseId:'2026-08-2e27b39c-932b-4f3d-b2aa-3b11ca2a3cca',acceptedAt:'2026-10-12T23:00:00.000Z'};
function data(){const value=makeCountryPreviewFixture();value.source='retained';value.rawVerification='previous-reviewed-replay';for(const view of Object.values(value.directions))for(const p of view.products)if(p.comparisonEligible)p.reason='eligible-offline-only';return value;}
it('shows local acceptance independently of historical availability and publication',async()=>{const value=data(),before=JSON.stringify(value);render(<CanadaPreview data={value} presentation={presentation}/>);expect(screen.getByText('24-month locally accepted snapshot · Not published')).toBeVisible();expect(screen.queryByText(/No accepted country release/)).toBeNull();expect(screen.getByRole('table',{name:'Selected categories · Imports'})).toBeVisible();expect(screen.getByRole('region',{name:'Sources and revision differences'})).toHaveTextContent('Local acceptance applies to this captured snapshot');await userEvent.click(screen.getByRole('radio',{name:'Exports'}));expect(screen.getByRole('region',{name:'Country overview'})).toHaveTextContent('Canadian import data');expect(screen.getByRole('region',{name:'Sources and revision differences'})).toHaveTextContent('17 matched; 7 mismatch');expect(JSON.stringify(value)).toBe(before);expect(value.availability.releaseAccepted).toBe(false);});
it('keeps accepted-profile samples visibly synthetic and unaccepted',()=>{render(<CanadaPreview data={makeCountryPreviewFixture()} presentation={{kind:'accepted-fixture'}}/>);expect(screen.getByText('Synthetic development data')).toBeVisible();expect(screen.getByText('Synthetic accepted-profile sample · No accepted country release')).toBeVisible();});
it('refuses an accepted-local label on synthetic observations',()=>{const spy=vi.spyOn(console,'error').mockImplementation(()=>{});expect(()=>render(<CanadaPreview data={makeCountryPreviewFixture()} presentation={presentation}/>)).toThrow();spy.mockRestore();});
it.each(['imports','exports'] as const)('preserves %s CSV values/blanks and adds acceptance context only',direction=>{const value=data();for(const serialize of [serializeCountryMonthlyCsv,serializeCountryProductsCsv]){const original=parseCsv(serialize(value,direction)),accepted=parseCsv(serialize(value,direction,presentation));expect(accepted).toHaveLength(original.length);accepted.forEach((row,i)=>{expect(row.presentation_context).toBe('accepted-local');expect(row.accepted_release_id).toBe(presentation.releaseId);expect(row.local_accepted_at).toBe(presentation.acceptedAt);expect(row.publication_status).toBe('not-published');for(const [key,cell] of Object.entries(original[i]))expect(row[key]).toBe(cell);});}expect(countryCsvFilename(direction,'products',presentation)).toContain('accepted-local');const statistical=parseCsv(serializeCountryProductsCsv(value,direction,presentation)).filter(row=>row.special_by_policy==='true');expect(statistical.length).toBeGreaterThan(0);for(const row of statistical)expect(row.change_usd).toBe('');});
it('uses synthetic CSV context without an acceptance identity in fixture samples',()=>{const row=parseCsv(serializeCountryMonthlyCsv(makeCountryPreviewFixture(),'imports',{kind:'accepted-fixture'}))[0];expect(row.presentation_context).toBe('accepted-profile-fixture');expect(row.accepted_release_id).toBe('');expect(row.local_accepted_at).toBe('');});
it('rejects crossed synthetic/accepted CSV provenance',()=>{for(const serialize of [serializeCountryMonthlyCsv,serializeCountryProductsCsv]){expect(()=>serialize(makeCountryPreviewFixture(),'imports',presentation)).toThrow();expect(()=>serialize(data(),'exports',{kind:'accepted-fixture'})).toThrow();}});
it('explains accepted comparison qualifications in plain language without rewriting recorded reasons',()=>{const value=data();render(<CanadaPreview data={value} presentation={presentation}/>);expect(screen.queryAllByText('eligible-offline-only')).toHaveLength(0);expect(screen.getAllByText('Reviewed against the captured files').length).toBeGreaterThan(0);expect(value.directions.imports.products.find(p=>p.comparisonEligible)?.reason).toBe('eligible-offline-only');});
it('keeps an assessment-only retained preview explicit about unchecked acceptance',()=>{render(<CanadaPreview data={data()}/>);expect(screen.getByText('24-month captured assessment · Acceptance not checked in this preview')).toBeVisible();expect(screen.queryByText(/No accepted country release/)).toBeNull();});
it('shows accepted capture times in UTC while retaining the exact original instants',()=>{
  const value=data();value.captureInterval.startedAt='2026-10-11T19:01:00.123+02:00';
  render(<CanadaPreview data={value} presentation={presentation}/>);
  expect(screen.getByText('12 Oct 2026, 23:00 UTC')).toHaveAttribute('datetime',presentation.acceptedAt);
  expect(screen.getByText('11 Oct 2026, 17:01 UTC')).toHaveAttribute('datetime',value.captureInterval.startedAt);
  expect(screen.getByText('11 Oct 2026, 17:02 UTC')).toHaveAttribute('datetime',value.captureInterval.finishedAt);
});
it('discloses exact accepted audit metadata while keeping review limits visible and following direction',async()=>{
  const value=data(),url='https://www.census.gov/foreign-trade/balance/c1220.html';
  value.directions.imports.references.before.source={url,capturedAt:'2026-10-11T17:00:00.000Z',bytes:100,sha256:'1'.repeat(64)};
  value.directions.exports.references.before.source={url,capturedAt:'2026-10-11T17:03:00.000Z',bytes:101,sha256:'2'.repeat(64)};
  const original=JSON.stringify(value);render(<CanadaPreview data={value} presentation={presentation}/>);
  const methods=screen.getByRole('region',{name:'Sources and revision differences'}),summary=within(methods).getByText('Capture and verification details',{exact:true}),details=summary.closest('details')!;
  expect(details).not.toHaveAttribute('open');
  expect(within(methods).getByText(/previously reviewed source replay/)).toBeVisible();
  expect(within(methods).getByText(/no fresh source verification/)).toBeVisible();
  expect(within(details).getByText(value.processingVersion,{exact:true})).not.toBeVisible();
  expect(details).toHaveTextContent(value.captureInterval.startedAt);expect(details).toHaveTextContent(presentation.acceptedAt);
  await userEvent.click(summary);expect(details).toHaveAttribute('open');expect(within(details).getByText(value.processingVersion,{exact:true})).toBeVisible();
  expect(details).toHaveTextContent('100 bytes');expect(details).toHaveTextContent('1'.repeat(64));
  expect(within(details).getByRole('link',{name:url})).toHaveAttribute('href',url);
  await userEvent.click(screen.getByRole('radio',{name:'Exports'}));expect(details).toHaveAttribute('open');expect(details).toHaveTextContent('101 bytes');expect(details).toHaveTextContent('2'.repeat(64));expect(details).not.toHaveTextContent('1'.repeat(64));
  expect(methods).toHaveTextContent('17 matched; 7 mismatch');expect(JSON.stringify(value)).toBe(original);
});
it('keeps accepted-profile capture explanations synthetic and without a real acceptance time',()=>{
  render(<CanadaPreview data={makeCountryPreviewFixture()} presentation={{kind:'accepted-fixture'}}/>);
  expect(screen.getByText('11 Oct 2026, 17:01 UTC')).toBeVisible();
  expect(screen.getByText(/All displayed observations and reference examples are synthetic/)).toBeVisible();
  expect(screen.queryByText(/Local acceptance recorded/)).toBeNull();
  const details=screen.getByText('Capture and verification details',{exact:true}).closest('details')!;
  expect(details).toHaveTextContent('synthetic');expect(details).not.toHaveTextContent('previous-reviewed-replay');
});
it('preserves the original assessment preview timestamp and metadata presentation',()=>{
  const value=data();render(<CanadaPreview data={value}/>);
  expect(screen.queryByText('Capture and verification details',{exact:true})).toBeNull();
  expect(screen.getByText(new RegExp(`Source collection captured ${value.captureInterval.startedAt}`))).toBeVisible();
  expect(screen.getByText(value.processingVersion,{exact:true})).toBeVisible();
});
