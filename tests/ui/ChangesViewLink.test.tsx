// @vitest-environment jsdom
import {afterEach,describe,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderToStaticMarkup} from 'react-dom/server';
import '@testing-library/jest-dom/vitest';
import {sampleRelease} from '../helpers/release';
import {productChangeSample} from '../helpers/product-changes';
import {buildChangesView} from '../../src/lib/trade/changes';
import {buildProductChangesView} from '../../src/lib/trade/product-changes';
import {MonthlyChanges} from '../../src/components/MonthlyChanges';
import {ProductChanges} from '../../src/components/ProductChanges';

afterEach(()=>{cleanup();vi.restoreAllMocks();window.history.replaceState(null,'','/');});
const release=sampleRelease();
const countryData=JSON.stringify({imports:buildChangesView(release,'imports'),exports:buildChangesView(release,'exports')});
const products=[productChangeSample('100001','Big',1_000_000_000,1_100_000_000,40_000_000,20_000_000)];
const productData=JSON.stringify({imports:buildProductChangesView(products,'imports'),exports:buildProductChangesView(products,'exports')});

for(const config of [
  {name:'country changes',path:'/changes/',metric:'share',wrongMetric:'growth',label:'Rank changes by',element:<MonthlyChanges data={countryData} reportingMonth={release.reportingMonth}/>},
  {name:'product changes',path:'/changes/products/',metric:'growth',wrongMetric:'share',label:'Rank product changes by',element:<ProductChanges data={productData}/>},
] as const)describe(config.name,()=>{
  it('restores both saved filters and the corresponding export measure',()=>{
    window.history.replaceState(null,'',`${config.path}?direction=exports&metric=${config.metric}`);
    render(config.element);
    expect(screen.getByRole('radio',{name:'Exports'})).toBeChecked();
    expect(screen.getByLabelText(config.label)).toHaveValue(config.metric);
    expect(screen.getByText('ALL_VAL_MO',{exact:true})).toBeVisible();
    expect(screen.getByRole('button',{name:'Copy changes link'})).toBeEnabled();
  });

  it('copies current filters without tracking parameters while preserving the section and history state',async()=>{
    window.history.replaceState({position:3},'',`${config.path}?utm_source=briefing#research`);
    render(config.element);const user=userEvent.setup(),write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();
    await user.click(screen.getByRole('radio',{name:'Exports'}));
    await user.selectOptions(screen.getByLabelText(config.label),config.metric);
    await user.click(screen.getByRole('button',{name:'Copy changes link'}));
    const path=`${config.path}?direction=exports&metric=${config.metric}#research`;
    expect(window.location.pathname+window.location.search+window.location.hash).toBe(path);
    expect(window.history.state).toEqual({position:3});
    expect(write).toHaveBeenCalledWith(new URL(path,window.location.origin).href);
    expect(screen.getByText('Changes link copied.')).toBeVisible();
    await user.click(screen.getByRole('radio',{name:'Imports'}));
    expect(screen.getByLabelText(config.label)).toHaveValue(config.metric);
    expect(screen.queryByText('Changes link copied.')).toBeNull();
  });

  it('provides a selectable updated link when the clipboard is unavailable',async()=>{
    window.history.replaceState(null,'',config.path);render(config.element);const user=userEvent.setup();
    vi.spyOn(navigator.clipboard,'writeText').mockRejectedValue(new Error('Denied'));
    await user.click(screen.getByRole('button',{name:'Copy changes link'}));
    const input=screen.getByLabelText('Changes link');
    expect(input).toHaveValue(new URL(`${config.path}?direction=imports&metric=dollars`,window.location.origin).href);
    await user.click(input);expect(input).toHaveFocus();
    expect((input as HTMLInputElement).selectionEnd).toBe((input as HTMLInputElement).value.length);
    await user.selectOptions(screen.getByLabelText(config.label),config.metric);
    expect(input).toHaveValue(new URL(`${config.path}?direction=imports&metric=${config.metric}`,window.location.origin).href);
  });

  it.each([
    '?direction=exports&direction=imports',
    '?direction=exports&metric=dollars&metric=dollars',
    '?direction=outbound',
    `?direction=exports&metric=${config.wrongMetric}`,
    `?direction=exports&padding=${'x'.repeat(2048)}`,
  ])('explains invalid saved filters and clears the notice after an edit: %s',async search=>{
    window.history.replaceState(null,'',config.path+search);render(config.element);const user=userEvent.setup();
    expect(screen.getByRole('radio',{name:'Imports'})).toBeChecked();
    expect(screen.getByLabelText(config.label)).toHaveValue('dollars');
    expect(screen.getByText(/saved changes selection could not be restored/i)).toBeVisible();
    await user.click(screen.getByRole('radio',{name:'Exports'}));
    expect(screen.queryByText(/saved changes selection could not be restored/i)).toBeNull();
    expect(window.location.search).toBe('?direction=exports&metric=dollars');
  });

  it('restores filters together during browser navigation without rewriting unrelated history state',()=>{
    window.history.replaceState(null,'',config.path);render(config.element);
    window.history.replaceState({position:4},'',`${config.path}?direction=exports&metric=${config.metric}`);fireEvent.popState(window);
    expect(screen.getByRole('radio',{name:'Exports'})).toBeChecked();expect(screen.getByLabelText(config.label)).toHaveValue(config.metric);
    window.history.replaceState({position:5},'',config.path);fireEvent.popState(window);
    expect(screen.getByRole('radio',{name:'Imports'})).toBeChecked();expect(screen.getByLabelText(config.label)).toHaveValue('dollars');
    expect(window.history.state).toEqual({position:5});expect(window.location.search).toBe('');
  });

  it('ignores a stale clipboard completion after changing a filter',async()=>{
    window.history.replaceState(null,'',config.path);render(config.element);const user=userEvent.setup();let complete!:()=>void;
    vi.spyOn(navigator.clipboard,'writeText').mockImplementation(()=>new Promise<void>(resolve=>{complete=resolve;}));
    await user.click(screen.getByRole('button',{name:'Copy changes link'}));
    await user.click(screen.getByRole('radio',{name:'Exports'}));await act(async()=>{complete();});
    expect(screen.queryByText('Changes link copied.')).toBeNull();
  });

  it('renders an honest default before hydration even when the address has saved filters',()=>{
    window.history.replaceState(null,'',`${config.path}?direction=exports&metric=${config.metric}`);
    const html=renderToStaticMarkup(config.element);
    expect(html).toContain('GEN_VAL_MO');expect(html).not.toContain('ALL_VAL_MO');
    expect(html).toContain('Enable JavaScript to restore saved changes');
    expect(html).toContain('initial view shows U.S. imports ranked by dollar change');
  });
});
