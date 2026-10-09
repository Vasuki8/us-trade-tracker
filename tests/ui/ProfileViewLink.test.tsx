// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,render,screen,within,fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {sampleDutyRelease} from '../helpers/duties';
import {ProductExplorer} from '../../src/components/ProductExplorer';
import {ReleaseBriefing} from '../../src/components/ReleaseBriefing';
import {renderToStaticMarkup} from 'react-dom/server';

afterEach(()=>{cleanup();vi.restoreAllMocks();window.history.replaceState(null,'','/');});

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
});
