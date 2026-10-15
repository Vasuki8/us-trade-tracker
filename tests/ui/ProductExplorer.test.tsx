// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {sampleRelease} from '../helpers/release';
import {ProductExplorer} from '../../src/components/ProductExplorer';
import {serializeCsv} from '../../src/lib/trade/downloads';
import {buildProfileView} from '../../src/lib/trade/profile';
import {renderToStaticMarkup} from 'react-dom/server';
import {TradeChart} from '../../src/components/TradeChart';
afterEach(()=>{cleanup();window.history.replaceState(null,'','/');});
it('native_profile_navigation_has_unique_rendered_targets',()=>{
  const html=renderToStaticMarkup(<ProductExplorer release={sampleRelease()}/>);
  const document=new DOMParser().parseFromString(html,'text/html');
  const navigation=document.querySelector('nav[aria-label="On this profile"]');
  expect(navigation).not.toBeNull();
  for(const [label,id] of [
    ['Trade over time','trade-history-heading'],['Compare countries','compare-countries-heading'],
    ['What changed?','changes-heading'],['Estimated duties','duties-heading'],
    ['Chart data','chart-data-heading'],['Leading partners','leading-partners-heading'],['Sources','profile-sources-heading'],
  ]){
    const link=[...navigation!.querySelectorAll('a')].find(item=>item.textContent===label);
    expect(link?.getAttribute('href')).toBe('#'+id);
    expect(document.querySelectorAll('[id="'+id+'"]').length).toBe(1);
  }
  expect(navigation!.querySelectorAll('a')).toHaveLength(7);
  expect(document.querySelector('aside[aria-labelledby="compare-countries-heading"]')).not.toBeNull();
  expect(document.querySelector('aside[aria-labelledby="leading-partners-heading"]')).not.toBeNull();
});
it('profile_navigation_tracks_direction',async()=>{
  render(<ProductExplorer release={sampleRelease()}/>);const user=userEvent.setup();
  const nav=screen.getByRole('navigation',{name:'On this profile'});
  expect(within(nav).getByRole('link',{name:'Estimated duties'})).toHaveAttribute('href','#duties-heading');
  await user.click(screen.getByRole('checkbox',{name:'CANADA'}));
  expect(document.querySelectorAll('#selected-comparison-heading')).toHaveLength(1);
  expect(within(nav).queryByRole('link',{name:'Selected country comparison'})).toBeNull();
  await user.click(screen.getByRole('radio',{name:'Exports'}));
  expect(within(nav).queryByRole('link',{name:'Estimated duties'})).toBeNull();
  for(const link of within(nav).getAllByRole('link'))expect(document.querySelectorAll(link.getAttribute('href')!)).toHaveLength(1);
});
it('switches direction and enforces three countries with accessible controls',async()=>{
  render(<ProductExplorer release={sampleRelease()}/>);const user=userEvent.setup();
  expect(screen.getByText('Development sample data')).toBeVisible();
  expect(screen.getByRole('table',{name:'Monthly trade values · current U.S. dollars'})).toBeVisible();
  await user.click(screen.getByRole('radio',{name:'Exports'}));
  expect(screen.getAllByText(/ALL_VAL_MO/).length).toBeGreaterThan(0);
  for(const name of ['CANADA','ITALY','MEXICO'])await user.click(screen.getByRole('checkbox',{name}));
  expect(screen.getByRole('checkbox',{name:'GERMANY'})).toBeDisabled();
  await user.selectOptions(screen.getByLabelText('History window'),'12');
  expect(within(screen.getByRole('table',{name:'Monthly trade values · current U.S. dollars'})).getAllByRole('row')).toHaveLength(13);
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
it('preserves classification boundaries and verification in downloaded CSV',()=>{
  const release=sampleRelease();
  const continuous=serializeCsv(buildProfileView(release,{direction:'imports',months:60,countryCodes:[]}));
  release.classificationIntervals=[{from:'2024-01',to:'2024-12',evidenceUrl:'https://example.invalid/old'},{from:'2025-01',to:'2025-12',evidenceUrl:'https://example.invalid/new'}];
  const split=serializeCsv(buildProfileView(release,{direction:'imports',months:60,countryCodes:[]}));
  expect(split).not.toBe(continuous);
  expect(split).toContain('classification_verified,classification_break_before');
  release.classificationIntervals=[];
  expect(serializeCsv(buildProfileView(release,{direction:'imports',months:12,countryCodes:[]}))).toContain(',false,true,');
});
it('warns when only part of the displayed history has verified classification',()=>{
  const release=sampleRelease();release.classificationIntervals[0].from='2025-01';
  render(<ProductExplorer release={release}/>);
  expect(screen.getByText(/Classification continuity is unverified/)).toBeVisible();
});
it('keeps point tooltips and the classification explanation in server-rendered SVG',()=>{
  const view=buildProfileView(sampleRelease(),{direction:'imports',months:60,countryCodes:[]});
  const svg=renderToStaticMarkup(<TradeChart view={view}/>);
  expect(svg).toContain('<title>Jan 2024: $50</title>');
  expect(svg).toContain('incompatible or unverified classifications');
});
it('neutralizes spreadsheet formulas in downloaded text without changing numeric values',()=>{
  const view=buildProfileView(sampleRelease(),{direction:'imports',months:12,countryCodes:['1220']});
  view.series[0].name='=1+1';view.title='@SUM(1)';
  const csv=serializeCsv(view);
  expect(csv).toContain("'@SUM(1)");expect(csv).toContain("'=1+1,25,reported");
});
it('distinguishes all three comparison lines and their legends without relying on color',()=>{
  const view=buildProfileView(sampleRelease(),{direction:'exports',months:12,countryCodes:['1220','4759','2010']});
  const {container}=render(<TradeChart view={view}/>);
  for(const svg of container.querySelectorAll('svg')){
    const patterns=[...svg.querySelectorAll('path')].map(path=>path.getAttribute('stroke-dasharray'));
    expect(new Set(patterns).size).toBe(3);
    const legends=[...svg.querySelectorAll('line')].filter(line=>line.getAttribute('stroke-width')==='3');
    expect(legends.map(line=>line.getAttribute('stroke-dasharray'))).toEqual(patterns);
  }
});
