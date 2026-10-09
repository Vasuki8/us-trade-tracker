// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';import {cleanup,render,screen,within} from '@testing-library/react';import userEvent from '@testing-library/user-event';import '@testing-library/jest-dom/vitest';
import {EstimatedDuties} from '../../src/components/EstimatedDuties';import {buildDutyView} from '../../src/lib/trade/duties';import {sampleDutyRelease} from '../helpers/duties';import {sampleRelease} from '../helpers/release';
import {ProductExplorer} from '../../src/components/ProductExplorer';import {renderToStaticMarkup} from 'react-dom/server';
afterEach(cleanup);
it('shows monthly and rolling amounts, the consumption denominator and coverage qualification',()=>{
 const r=sampleDutyRelease();r.duties.observations[12].coverage.uncalculatedDutiableValueUsd=100;render(<EstimatedDuties view={buildDutyView(r,[])}/>);
 const region=screen.getByRole('region',{name:'Estimated duties'});expect(region).toHaveTextContent('Jan 2025–Dec 2025');expect(region).toHaveTextContent('Jan 2024–Dec 2024');expect(region).toHaveTextContent('7.500%');expect(region).toHaveTextContent('+2.500 pp');expect(region).toHaveTextContent('RP70/79');expect(region).toHaveTextContent('imports for consumption');expect(region).toHaveTextContent('not proof of duty-free trade');
 expect(within(region).getByRole('table',{name:'Monthly estimated duties · All partner countries'})).toBeVisible();expect(within(region).getByRole('button',{name:'Download estimated duties CSV'})).toBeEnabled();
});
it('provides explicit unavailable data for legacy releases and missing country history',()=>{
 const legacy=render(<EstimatedDuties view={buildDutyView(sampleRelease(),[])}/>);expect(screen.getByText(/does not include a duty dataset/)).toBeVisible();expect(screen.queryByRole('button',{name:'Download estimated duties CSV'})).toBeNull();legacy.unmount();
 render(<EstimatedDuties view={buildDutyView(sampleDutyRelease(),['1220'])}/>);expect(screen.getByRole('heading',{name:'CANADA'})).toBeVisible();expect(screen.getAllByText('Unavailable').length).toBeGreaterThan(0);expect(screen.getByText(/comparisons are unavailable/i)).toBeVisible();
});
it('follows profile country selection and appears for imports only',async()=>{
 render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();expect(screen.getByRole('region',{name:'Estimated duties'})).toHaveTextContent('All partner countries');
 await user.click(screen.getByRole('checkbox',{name:'CANADA'}));expect(screen.getByRole('region',{name:'Estimated duties'})).toHaveTextContent('CANADA');expect(screen.queryByRole('heading',{name:'All partner countries'})).toBeNull();
 await user.click(screen.getByRole('radio',{name:'Exports'}));expect(screen.queryByRole('region',{name:'Estimated duties'})).toBeNull();await user.click(screen.getByRole('radio',{name:'Imports'}));expect(screen.getByRole('region',{name:'Estimated duties'})).toHaveTextContent('All partner countries');
});
it('keeps zero-prior growth unavailable and an initial sourced world view in server rendering',()=>{
 const r=sampleDutyRelease();r.duties.observations.filter(row=>row.month.startsWith('2024')).forEach(row=>row.calculatedDuty.valueUsd=0);
 const html=renderToStaticMarkup(<EstimatedDuties view={buildDutyView(r,[])}/>);expect(html).toContain('Growth unavailable');expect(html).toContain('Enable JavaScript');expect(html).toContain('All partner countries');expect(html).toContain('api.census.gov');
});
it('generates the displayed CSV in the browser on keyboard activation',async()=>{
 const create=vi.fn(()=> 'blob:synthetic'),revoke=vi.fn();vi.stubGlobal('URL',Object.assign(class extends URL {},{createObjectURL:create,revokeObjectURL:revoke}));const click=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
 try{render(<EstimatedDuties view={buildDutyView(sampleDutyRelease(),[])}/>);const user=userEvent.setup();screen.getByRole('button',{name:'Download estimated duties CSV'}).focus();await user.keyboard('{Enter}');expect(create).toHaveBeenCalledTimes(1);expect(click).toHaveBeenCalledOnce();await new Promise(resolve=>setTimeout(resolve,1100));expect(revoke).toHaveBeenCalledOnce();}finally{click.mockRestore();vi.unstubAllGlobals();}
});
