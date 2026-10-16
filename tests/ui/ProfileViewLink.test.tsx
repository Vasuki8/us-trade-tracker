// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,render,screen,within,fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {sampleDutyRelease} from '../helpers/duties';
import {ProductExplorer} from '../../src/components/ProductExplorer';
import {ReleaseBriefing} from '../../src/components/ReleaseBriefing';
import {renderToStaticMarkup} from 'react-dom/server';
import {act} from 'react';
import * as downloads from '../../src/lib/trade/downloads';

afterEach(()=>{cleanup();vi.restoreAllMocks();window.history.replaceState(null,'','/');});
function fragment(hash:string,traversal=false){
  window.history.replaceState(window.history.state,'',window.location.pathname+window.location.search+hash);
  if(traversal)fireEvent.popState(window);
  fireEvent(window,new HashChangeEvent('hashchange'));
}
it('copy_tracks_hash_navigation_without_changing_filters',async()=>{
  window.history.replaceState({position:3},'','/products/090121/?direction=exports&months=12&countries=4759%2C1220&comparison=monthly&utm_source=briefing');
  render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();
  const write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();
  const before=screen.getByRole('table',{name:'Selected country monthly comparison'}).textContent;
  fragment('#chart-data-heading');await user.click(screen.getByRole('button',{name:'Copy view link'}));
  expect(write).toHaveBeenCalledWith(new URL('/products/090121/?direction=exports&months=12&countries=4759%2C1220&comparison=monthly#chart-data-heading',window.location.origin).href);
  expect(screen.getByRole('radio',{name:'Exports'})).toBeChecked();expect(screen.getByLabelText('History window')).toHaveValue('12');
  expect(screen.getByRole('table',{name:'Selected country monthly comparison'}).textContent).toBe(before);
  expect(window.history.state).toEqual({position:3});expect(window.location.search).toContain('utm_source=briefing');
  fragment('#profile-sources-heading');expect(screen.queryByText('View link copied.')).toBeNull();
});
it('preserves open manual copy, picker search and download errors through fragment history',async()=>{
  window.history.replaceState({position:4},'','/products/090121/?direction=imports&months=12&countries=1220');
  render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();
  vi.spyOn(downloads,'exportChartPng').mockRejectedValue(new Error('conversion failed'));
  await user.click(screen.getByRole('button',{name:'Download chart PNG'}));
  const failure='PNG export failed. You can still download the displayed data as CSV.';
  expect(screen.getByText(failure)).toBeVisible();
  await user.type(screen.getByRole('searchbox',{name:'Find a country'}),'can');
  vi.spyOn(navigator.clipboard,'writeText').mockRejectedValue(new Error('Denied'));
  await user.click(screen.getByRole('button',{name:'Copy view link'}));
  for(const [hash,traversal] of [['#chart-data-heading',false],['#profile-sources-heading',true],['#chart-data-heading',true]] as const){
    fragment(hash,traversal);
    const field=screen.getByLabelText('View link');
    expect(field).toHaveValue(new URL('/products/090121/?direction=imports&months=12&countries=1220'+hash,window.location.origin).href);
    act(()=>{(field as HTMLInputElement).blur();(field as HTMLInputElement).focus();});
    expect((field as HTMLInputElement).selectionStart).toBe(0);expect((field as HTMLInputElement).selectionEnd).toBe((field as HTMLInputElement).value.length);
    expect(screen.getByRole('searchbox',{name:'Find a country'})).toHaveValue('can');expect(screen.getByText(failure)).toBeVisible();
    expect(screen.getByRole('table',{name:'Selected country annual comparison'})).toHaveTextContent('CANADA');expect(window.history.state).toEqual({position:4});
  }
  window.history.replaceState({position:5},'','/products/090121/?direction=exports&months=60&countries=4759');fireEvent.popState(window);
  expect(screen.getByRole('radio',{name:'Exports'})).toBeChecked();expect(screen.getByLabelText('History window')).toHaveValue('60');
  expect(screen.getByRole('checkbox',{name:'ITALY'})).toBeChecked();expect(screen.queryByLabelText('View link')).toBeNull();expect(screen.queryByText(failure)).toBeNull();
});
it.each([['success',false],['failure',false],['success',true],['failure',true]] as const)('ignores stale clipboard %s after fragment navigation and return=%s',async(outcome,returns)=>{
  window.history.replaceState(null,'','/products/090121/#trade-history-heading');render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();let settle!:()=>void;
  vi.spyOn(navigator.clipboard,'writeText').mockImplementation(()=>new Promise<void>((resolve,reject)=>{settle=()=>outcome==='success'?resolve():reject(new Error('Denied'));}));
  await user.click(screen.getByRole('button',{name:'Copy view link'}));fragment('#chart-data-heading');if(returns)fragment('#trade-history-heading');
  await act(async()=>settle());expect(screen.queryByText('View link copied.')).toBeNull();expect(screen.queryByLabelText('View link')).toBeNull();
});
it('cleans fragment/history listeners and pending copy when unmounted',async()=>{
  const added=vi.spyOn(window,'addEventListener'),removed=vi.spyOn(window,'removeEventListener');
  const rendered=render(<ProductExplorer release={sampleDutyRelease()}/>),user=userEvent.setup();let settle!:()=>void;
  vi.spyOn(navigator.clipboard,'writeText').mockImplementation(()=>new Promise<void>((_,reject)=>{settle=()=>reject(new Error('Denied'));}));
  await user.click(screen.getByRole('button',{name:'Copy view link'}));rendered.unmount();
  for(const type of ['popstate','hashchange']){const listener=added.mock.calls.find(call=>call[0]===type)?.[1];expect(listener).toBeTypeOf('function');expect(removed).toHaveBeenCalledWith(type,listener);}
  await act(async()=>settle());expect(screen.queryByLabelText('View link')).toBeNull();
});

it('restores the saved direction, window and countries before exposing the active view link',()=>{
  window.history.replaceState(null,'','/products/090121/?direction=exports&months=12&countries=4759%2C1220');
  render(<ProductExplorer release={sampleDutyRelease()}/>);
  expect(screen.getByRole('radio',{name:'Exports'})).toBeChecked();expect(screen.getByLabelText('History window')).toHaveValue('12');
  expect(screen.getByRole('checkbox',{name:'CANADA'})).toBeChecked();expect(screen.getByRole('checkbox',{name:'ITALY'})).toBeChecked();
  const table=screen.getByRole('table',{name:'Monthly trade values · current U.S. dollars'});expect(within(table).getAllByRole('row')).toHaveLength(13);expect(table).toHaveTextContent('ITALY');expect(table).toHaveTextContent('CANADA');
  expect(screen.queryByRole('region',{name:'Estimated duties'})).toBeNull();expect(screen.getByRole('button',{name:'Copy view link'})).toBeEnabled();
});
it('copies current filters as an absolute link and keeps the address aligned after edits',async()=>{
  render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();
  await user.click(screen.getByRole('radio',{name:'Exports'}));await user.selectOptions(screen.getByLabelText('History window'),'12');await user.click(screen.getByRole('checkbox',{name:'ITALY'}));
  const write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();
  await user.click(screen.getByRole('button',{name:'Copy view link'}));
  expect(write).toHaveBeenCalledWith(new URL('/products/090121/?direction=exports&months=12&countries=4759',window.location.origin).href);
  expect(window.location.search).toBe('?direction=exports&months=12&countries=4759');expect(screen.getByText('View link copied.')).toBeVisible();
  await user.click(screen.getByRole('radio',{name:'Imports'}));expect(screen.getByRole('checkbox',{name:'ITALY'})).not.toBeChecked();expect(window.location.search).toBe('?direction=imports&months=12');expect(screen.queryByText('View link copied.')).toBeNull();
});
it('provides a selectable current link when automatic clipboard copying fails',async()=>{
  render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();vi.spyOn(navigator.clipboard,'writeText').mockRejectedValue(new Error('Denied'));
  await user.click(screen.getByRole('button',{name:'Copy view link'}));
  expect(screen.getByLabelText('View link')).toHaveValue(new URL('/products/090121/?direction=imports&months=60',window.location.origin).href);
  expect(screen.getByText(/Select and copy the view link below/)).toBeVisible();
  await user.click(screen.getByRole('checkbox',{name:'CANADA'}));expect(screen.getByLabelText('View link')).toHaveValue(new URL('/products/090121/?direction=imports&months=60&countries=1220',window.location.origin).href);
  expect(screen.queryByText('View link copied.')).toBeNull();
});
it('preserves the section and browser history state while copying only supported filters',async()=>{
  window.history.replaceState({position:3},'','/products/090121/?direction=exports&utm_source=briefing#changes-heading');
  render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup(),write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();
  await user.selectOptions(screen.getByLabelText('History window'),'12');await user.click(screen.getByRole('button',{name:'Copy view link'}));
  expect(window.history.state).toEqual({position:3});expect(window.location.hash).toBe('#changes-heading');
  expect(write).toHaveBeenCalledWith(new URL('/products/090121/?direction=exports&months=12#changes-heading',window.location.origin).href);
});
it('does not announce an outdated copy after the user has changed filters',async()=>{
  render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();let complete!:()=>void;
  vi.spyOn(navigator.clipboard,'writeText').mockImplementation(()=>new Promise<void>(resolve=>{complete=resolve;}));
  await user.click(screen.getByRole('button',{name:'Copy view link'}));await user.click(screen.getByRole('radio',{name:'Exports'}));complete();
  await user.click(screen.getByLabelText('History window'));expect(screen.queryByText('View link copied.')).toBeNull();
});
it('explains an invalid saved selection and removes the notice after a legitimate edit',async()=>{
  window.history.replaceState(null,'','/products/090121/?direction=exports&countries=9999');render(<ProductExplorer release={sampleDutyRelease()}/>);
  expect(screen.getByText(/could not be restored/i)).toBeVisible();expect(screen.getByRole('radio',{name:'Imports'})).toBeChecked();expect(screen.getByRole('checkbox',{name:'CANADA'})).not.toBeChecked();
  await userEvent.setup().selectOptions(screen.getByLabelText('History window'),'12');expect(screen.queryByText(/could not be restored/i)).toBeNull();expect(window.location.search).toBe('?direction=imports&months=12');
});
it('restores another saved view on browser navigation with all filters applied together',()=>{
  render(<ProductExplorer release={sampleDutyRelease()}/>);
  window.history.replaceState(null,'','/products/090121/?direction=exports&months=12&countries=4759');fireEvent.popState(window);
  expect(screen.getByRole('radio',{name:'Exports'})).toBeChecked();expect(screen.getByLabelText('History window')).toHaveValue('12');expect(screen.getByRole('checkbox',{name:'ITALY'})).toBeChecked();
  window.history.replaceState(null,'','/products/090121/?direction=imports&months=60&countries=1220');fireEvent.popState(window);
  expect(screen.getByRole('radio',{name:'Imports'})).toBeChecked();expect(screen.getByLabelText('History window')).toHaveValue('60');expect(screen.getByRole('checkbox',{name:'CANADA'})).toBeChecked();expect(screen.getByRole('checkbox',{name:'ITALY'})).not.toBeChecked();expect(screen.getByRole('region',{name:'Estimated duties'})).toHaveTextContent('CANADA');
});
it('links ranking and briefing country highlights to the matching trade direction and country',async()=>{
  const release=sampleDutyRelease(),profile=render(<ProductExplorer release={release}/>),user=userEvent.setup();
  const imports=screen.getByRole('region',{name:'What changed?'});expect(within(imports).getByRole('link',{name:'ITALY'})).toHaveAttribute('href','/products/090121/?direction=imports&months=12&countries=4759');
  await user.click(screen.getByRole('radio',{name:'Exports'}));expect(within(imports).getByRole('link',{name:'CANADA'})).toHaveAttribute('href','/products/090121/?direction=exports&months=12&countries=1220');
  profile.unmount();render(<ReleaseBriefing release={release}/>);
  expect(within(screen.getByRole('region',{name:'Annual export partner changes'})).getByRole('link',{name:'CANADA'})).toHaveAttribute('href','/products/090121/?direction=exports&months=12&countries=1220');
});
it('keeps server rendering on the default view with an explicit no-JavaScript shared-view explanation',()=>{
  window.history.replaceState(null,'','/products/090121/?direction=exports&months=12&countries=4759');
  const html=renderToStaticMarkup(<ProductExplorer release={sampleDutyRelease()}/>);
  expect(html).toContain('The initial view shows U.S. imports');expect(html).toContain('Enable JavaScript to restore saved selections');expect(html).toContain('Copy view link');
  expect(html).toContain('General imports');
  const doc=new DOMParser().parseFromString(html,'text/html');
  expect(doc.querySelector<HTMLSelectElement>('.changes-controls select')!.disabled).toBe(true);
  for(const name of ['Download changes CSV','Download estimated duties CSV']){
    const button=[...doc.querySelectorAll('button')].find(button=>button.textContent===name)!;
    expect(button.disabled,name).toBe(true);
  }
  expect(doc.querySelector('table[aria-label="Monthly estimated duties · All partner countries"]')).not.toBeNull();
});
