// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest';
import {cleanup,render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {sampleRelease} from '../helpers/release';
import {ProductExplorer} from '../../src/components/ProductExplorer';
import {serializeCsv} from '../../src/lib/trade/downloads';
import {buildProfileView} from '../../src/lib/trade/profile';
afterEach(cleanup);
it('switches direction and enforces three countries with accessible controls',async()=>{
  render(<ProductExplorer release={sampleRelease()}/>);const user=userEvent.setup();
  expect(screen.getByText('Development sample data')).toBeVisible();
  expect(screen.getByRole('table')).toBeVisible();
  await user.click(screen.getByRole('radio',{name:'Exports'}));
  expect(screen.getAllByText(/ALL_VAL_MO/).length).toBeGreaterThan(0);
  for(const name of ['CANADA','ITALY','MEXICO'])await user.click(screen.getByRole('checkbox',{name}));
  expect(screen.getByRole('checkbox',{name:'GERMANY'})).toBeDisabled();
  await user.selectOptions(screen.getByLabelText('History window'),'12');
  expect(screen.getAllByRole('row')).toHaveLength(13);
});
it('shows missing data as unavailable in the matching table',()=>{
  const release=sampleRelease();release.observations.find(r=>r.direction==='imports'&&r.month==='2025-12'&&r.geography==='world')!.valueUsd=null;
  render(<ProductExplorer release={release}/>);
  expect(screen.getAllByText('Unavailable').length).toBeGreaterThan(0);
});
it('exports active series and provenance with valid CSV quoting and no invented zero',()=>{
  const release=sampleRelease();release.observations.forEach(r=>{r.description='Coffee, "roasted"\nline';});
  const view=buildProfileView(release,{direction:'exports',months:12,countryCodes:['1220']});
  view.series[0].points[0].valueUsd=null;
  const csv=serializeCsv(view);
  expect(csv).toContain('ALL_VAL_MO');expect(csv).toContain('2026-01-01T00:00:00.000Z');
  expect(csv).toContain('"Coffee, ""roasted""\nline"');
  expect(csv).toContain('2025-01,090121');expect(csv).toContain(',unavailable,');
  expect(csv).toContain('Development sample data');
});
