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
    ['What changed?','changes-heading'],['Estimated duties','duties-heading'],['Country share over time','country-share-history-heading'],
    ['Chart data','chart-data-heading'],['Leading partners','leading-partners-heading'],['Sources','profile-sources-heading'],
  ]){
    const link=[...navigation!.querySelectorAll('a')].find(item=>item.textContent===label);
    expect(link?.getAttribute('href')).toBe('#'+id);
    expect(document.querySelectorAll('[id="'+id+'"]').length).toBe(1);
  }
  expect(navigation!.querySelectorAll('a')).toHaveLength(8);
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
it.each([
  ['090121','imports','/products/090121/?direction=imports&months=12&countries=1220#trade-history-heading','$300'],
  ['090121','exports','/products/090121/?direction=exports&months=12&countries=1220#trade-history-heading','$600'],
  ['090111','imports','/products/090111/?direction=imports&months=12&countries=1220#trade-history-heading','$300'],
  ['090111','exports','/products/090111/?direction=exports&months=12&countries=1220#trade-history-heading','$600'],
] as const)('opens a fresh annual partner view for %s %s',(code,direction,href,amount)=>{
  const release=sampleRelease();release.productCode=code;release.observations.forEach(row=>{row.productCode=code;});
  window.history.replaceState(null,'',`/products/${code}/?direction=${direction}&months=60&countries=1220%2C4759%2C2010&comparison=monthly`);
  render(<ProductExplorer release={release}/>);
  const partners=screen.getByRole('complementary',{name:'Leading partners'});
  expect(within(partners).getByRole('link',{name:'CANADA'})).toHaveAttribute('href',href);
  const rows=within(partners).getAllByRole('listitem');
  expect(rows.map(row=>within(row).getByRole('link').textContent)).toEqual(['CANADA','GERMANY','ITALY','MEXICO']);
  for(const row of rows){expect(row.querySelector('strong')).toHaveTextContent(amount);expect(row.querySelector('small')).toHaveTextContent('25.0% share');}
  expect(screen.getByRole('table',{name:'Selected country monthly comparison'})).toBeVisible();
});
it('keeps an incomplete leading partner link and its unavailable observations',()=>{
  const release=sampleRelease();const missing=release.observations.find(row=>row.direction==='imports'&&row.month==='2025-12'&&row.partnerCode==='1220')!;
  missing.valueUsd=null;missing.status='missing';
  window.history.replaceState(null,'','/products/090121/?direction=imports&months=12&countries=1220#trade-history-heading');
  render(<ProductExplorer release={release}/>);
  const partners=screen.getByRole('complementary',{name:'Leading partners'});
  const link=within(partners).getByRole('link',{name:'CANADA'});
  expect(link).toHaveAttribute('href','/products/090121/?direction=imports&months=12&countries=1220#trade-history-heading');
  expect(link.closest('li')!.querySelector('strong')).toHaveTextContent('Unavailable');
  const row=within(screen.getByRole('table',{name:'Selected country annual comparison'})).getAllByRole('row')[1];
  expect(within(row).getAllByRole('cell')[0]).toHaveTextContent('Unavailable');
  const csv=serializeCsv(buildProfileView(release,{direction:'imports',months:12,countryCodes:['1220']}));
  const december=csv.split('\n').find(line=>line.startsWith('2025-12,'))!;
  expect(december).toContain(',unavailable,');expect(december).not.toContain(',0,reported,');
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

it('shares_country_history_controls_without_shortening_duty_history',async()=>{
 const {sampleDutyRelease}=await import('../helpers/duties');render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();
 await user.click(screen.getByRole('checkbox',{name:'CANADA'}));await user.selectOptions(screen.getByLabelText('History window'),'12');
 const f=screen.getByRole('figure',{name:'Country share of U.S. imports · %'});expect(f).toHaveTextContent('Jan 2025–Dec 2025');expect(f.querySelectorAll('svg.share-history-desktop circle')).toHaveLength(12);
 expect(screen.getByRole('figure',{name:'Monthly estimated duties · current USD'})).toHaveTextContent('Jan 2024–Dec 2025');expect(document.querySelector('.chart-card svg.desktop-chart circle title')).toHaveTextContent('Jan 2025: $25');
 await user.selectOptions(screen.getByLabelText('History window'),'60');expect(f.querySelectorAll('svg.share-history-desktop circle')).toHaveLength(24);await user.click(screen.getByRole('radio',{name:'Exports'}));expect(screen.queryByRole('figure',{name:'Country share of U.S. imports · %'})).toBeNull();expect(screen.getByText('Choose up to three countries in Compare countries to see their monthly shares.')).toBeVisible();
});

it('server markup disables merchandise controls until saved-view restoration and explains the JavaScript requirement',()=>{
 const html=renderToStaticMarkup(<ProductExplorer release={sampleRelease()}/>),doc=new DOMParser().parseFromString(html,'text/html');
 for(const control of doc.querySelectorAll('input[name="direction"],select[aria-label="History window"]'))expect(control.hasAttribute('disabled')).toBe(true);
 for(const label of ['Download chart PNG','Download data CSV'])expect([...doc.querySelectorAll('button')].find(b=>b.textContent===label)?.hasAttribute('disabled')).toBe(true);
 expect((doc.querySelector('input[name="direction"][value="imports"]')??doc.querySelector('input[name="direction"][checked]'))?.hasAttribute('checked')).toBe(true);
 expect([...doc.querySelectorAll('table caption')].some(c=>c.textContent==='Monthly trade values · current U.S. dollars')).toBe(true);
 const note=doc.querySelector('noscript')!.textContent!;for(const word of ['direction','history','PNG','CSV'])expect(note).toContain(word);
});

it('renders recorded chart points and the export legend without plotting unavailable amounts',()=>{
 const release=sampleRelease();release.revisedKeys=['imports/090121/2025-01/country/1220/GEN_VAL_MO','imports/090121/2025-02/country/1220/GEN_VAL_MO'];
 const missing=release.observations.find(r=>r.direction==='imports'&&r.partnerCode==='1220'&&r.month==='2025-02')!;missing.valueUsd=null;missing.status='missing';
 const view=buildProfileView(release,{direction:'imports',months:12,countryCodes:['1220']});
 const {container}=render(<TradeChart view={view}/>);
 for(const svg of container.querySelectorAll('svg')){
  expect(svg.querySelectorAll('circle')).toHaveLength(11);
  const revised=[...svg.querySelectorAll('circle')].find(c=>c.querySelector('title')?.textContent==='Jan 2025: $25 · Recorded revision');
  expect(revised).toHaveAttribute('fill','white');expect(revised).toHaveAttribute('r','4');expect(revised).toHaveAttribute('stroke-width','2');
  expect(svg.querySelector('circle title')?.textContent).toContain('Recorded revision');
  const ordinary=[...svg.querySelectorAll('circle')].find(c=>c.querySelector('title')?.textContent==='Mar 2025: $25');expect(ordinary).toHaveAttribute('r','2.7');
 }
 expect(container.querySelector('.desktop-chart')).toHaveTextContent('Open circles: recorded revisions');
 expect(container.querySelector('.desktop-chart')).toHaveTextContent('Merchandise release revisions: yes');
});
it('keeps release revision scope separate while country and direction controls change',async()=>{
 const release=sampleRelease();release.revisedKeys=['imports/090121/2025-01/country/1220/GEN_VAL_MO'];
 render(<ProductExplorer release={release}/>);const user=userEvent.setup();
 const table=()=>screen.getByRole('table',{name:'Monthly trade values · current U.S. dollars'});
 expect(within(table()).queryByText('Revised',{exact:true})).toBeNull();
 expect(document.querySelector('.provenance')).toHaveTextContent('Merchandise release revisions: yes');
 await user.click(screen.getByRole('checkbox',{name:'CANADA'}));expect(within(table()).getAllByText('Revised',{exact:true})).toHaveLength(1);
 await user.click(screen.getByRole('radio',{name:'Exports'}));expect(within(table()).queryByText('Revised',{exact:true})).toBeNull();
 expect(document.querySelector('.provenance')).toHaveTextContent('Merchandise release revisions: yes');
});
