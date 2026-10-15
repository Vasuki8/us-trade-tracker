// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {CountryShareHistory} from '../../src/components/CountryShareHistory';
import {buildCountryShareHistory} from '../../src/lib/trade/country-share-history';
import {buildProfileView} from '../../src/lib/trade/profile';
import {sampleRelease} from '../helpers/release';
import type {ExplorerSelection} from '../../src/lib/trade/types';
afterEach(cleanup);
const selection:ExplorerSelection={direction:'imports',months:12,countryCodes:['1220']};
const model=(release=sampleRelease(),s=selection)=>buildCountryShareHistory(release,buildProfileView(release,s));
const figure=()=>screen.getByRole('figure',{name:'Country share of U.S. imports · %'});
it('explains the default without adding a world share plot or table',()=>{
 render(<CountryShareHistory view={model(sampleRelease(),{...selection,countryCodes:[]})}/>);
 expect(screen.getByRole('heading',{name:'Country share over time'})).toHaveAttribute('id','country-share-history-heading');expect(screen.getByText('Choose up to three countries in Compare countries to see their monthly shares.')).toBeVisible();expect(screen.queryByRole('img')).toBeNull();expect(screen.queryByRole('table')).toBeNull();expect(screen.getAllByRole('button').every(b=>b.hasAttribute('disabled'))).toBe(true);
});
it('shows one accessible figure image, exact period and matching merchandise denominator',()=>{
 render(<CountryShareHistory view={model()}/>);const f=figure();expect(within(f).getAllByRole('img')).toHaveLength(1);expect(f).toHaveTextContent('Jan 2025–Dec 2025');expect(f).toHaveTextContent('GEN_VAL_MO');expect(f).toHaveTextContent(/matching monthly U.S. total/);expect(f).not.toHaveTextContent('CON_VAL_MO');expect(f.querySelectorAll('svg.share-history-desktop circle')).toHaveLength(12);
});
it('shows exports with its own measure and selection order rather than a world series',()=>{
 render(<CountryShareHistory view={model(sampleRelease(),{...selection,direction:'exports',countryCodes:['2010','1220','4759']})}/>);const f=screen.getByRole('figure',{name:'Country share of U.S. exports · %'});expect(f).toHaveTextContent('ALL_VAL_MO');expect([...f.querySelectorAll('.share-history-legend li')].map(e=>e.textContent)).toEqual(['MEXICO · 2010','CANADA · 1220','ITALY · 4759']);expect(f.querySelectorAll('svg.share-history-desktop circle')).toHaveLength(36);
});
it('makes exact country/world/share values and statuses available in named monthly tables',async()=>{
 const release=sampleRelease();release.observations.find(r=>r.direction==='imports'&&r.partnerCode==='-'&&r.month==='2025-12')!.valueUsd=200;render(<CountryShareHistory view={model(release)}/>);await userEvent.click(screen.getByText('Monthly country shares',{exact:true}));const table=screen.getByRole('table',{name:'CANADA (1220) · monthly country shares · Jan 2025–Dec 2025'}),last=within(table).getAllByRole('row').at(-1)!;expect(within(last).getAllByRole('cell').map(e=>e.textContent)).toEqual(['$25','$200','12.500%','reported','reported','Verified']);expect(within(last).getByRole('rowheader')).toHaveTextContent('Dec 2025');
});
it('preserves a zero point and small positive shares while making missing denominators gaps',()=>{
 const view=model();view.series[0].points[0].sharePercent=0;view.series[0].points[1].sharePercent=0.0000001;view.series[0].points[2].sharePercent=null;view.series[0].points[3].breakBefore=true;render(<CountryShareHistory view={view}/>);const svg=figure().querySelector('svg.share-history-desktop')!,points=svg.querySelectorAll('circle');expect(points).toHaveLength(11);expect(points[0].textContent).toContain('0.000%');expect(points[1].textContent).toContain('<0.001%');expect(points[0].getAttribute('cy')).toBe('250');expect(Number(points[1].getAttribute('cy'))).toBeLessThan(250);expect(svg.querySelector('path')?.getAttribute('d')?.match(/M/g)).toHaveLength(2);
});
it('keeps interval boundaries and unverified reported values visible as disconnected points',()=>{
 const release=sampleRelease();release.classificationIntervals=[{from:'2024-01',to:'2025-09',evidenceUrl:'https://example.invalid/a'},{from:'2025-11',to:'2025-11',evidenceUrl:'https://example.invalid/b'},{from:'2025-12',to:'2025-12',evidenceUrl:'https://example.invalid/c'}];render(<CountryShareHistory view={model(release)}/>);const svg=figure().querySelector('svg.share-history-desktop')!;expect(svg.querySelectorAll('circle')).toHaveLength(12);expect(svg.querySelectorAll('circle[fill="white"]')).toHaveLength(1);expect(svg.querySelector('path')?.getAttribute('d')?.match(/M/g)).toHaveLength(4);expect(figure()).toHaveTextContent('classification unverified 1 of 12');expect(figure()).toHaveTextContent(/Hollow markers/);
});
it('keeps all-unavailable selected months in the table instead of displaying zeros',async()=>{
 const release=sampleRelease();for(const r of release.observations)if(r.partnerCode==='1220'){r.valueUsd=null;r.status='suppressed';}render(<CountryShareHistory view={model(release)}/>);expect(figure()).toHaveTextContent('No reported monthly shares are available for this selection.');expect(figure().querySelectorAll('svg.share-history-desktop circle')).toHaveLength(0);await userEvent.click(screen.getByText('Monthly country shares',{exact:true}));const row=screen.getByRole('table').querySelector('tbody tr')!;expect(row.textContent).toContain('Unavailable');expect(row.textContent).toContain('suppressed');
});
it('uses the actual clipped history and adaptive tiny percentage axis',()=>{
 const view=model(sampleRelease(),{...selection,months:60});view.series[0].points.forEach(p=>p.sharePercent=0.0000001);render(<CountryShareHistory view={view}/>);expect(figure()).toHaveTextContent('Jan 2024–Dec 2025');const labels=[...figure().querySelectorAll('svg.share-history-desktop > g text')].map(e=>e.textContent!);expect(labels.some(s=>s.includes('E-'))).toBe(true);expect(labels.every(s=>s.length<20)).toBe(true);
});
it.each([0.000001,0.00001])('keeps intermediate tiny share %s axes concise in scientific notation',value=>{
 const view=model();view.series[0].points.forEach(p=>p.sharePercent=value);render(<CountryShareHistory view={view}/>);const labels=[...figure().querySelectorAll('svg.share-history-mobile > g text')].map(t=>t.textContent!).filter(t=>t!=='0%');expect(labels).toHaveLength(4);expect(labels.every(t=>t.includes('E-'))).toBe(true);
});
