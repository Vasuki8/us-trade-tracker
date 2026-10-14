// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderToStaticMarkup} from 'react-dom/server';
import '@testing-library/jest-dom/vitest';
import {dutyChangesRelease} from '../helpers/duty-changes';
import {sampleRelease} from '../helpers/release';
import {prepareDutyChanges} from '../../src/lib/trade/duty-changes';
import {DutyChanges} from '../../src/components/DutyChanges';
import * as downloads from '../../src/lib/trade/downloads';
import {parseCsv} from '../helpers/parse-csv';
afterEach(()=>{cleanup();vi.restoreAllMocks();window.history.replaceState(null,'','/');});
it.each([['rolling','share','$72','+20.000 pp'],['rolling','dollars','$72','+$60'],['monthly','share','$6','+20.000 pp'],['monthly','dollars','$6','+$5']] as const)('restores %s/%s with matching country figures', (period,metric,amount,change)=>{
  window.history.replaceState(null,'',`/changes/duties/?direction=imports&period=${period}&metric=${metric}`);render(<DutyChanges data={prepareDutyChanges(dutyChangesRelease())}/>);
  expect(screen.getByRole('radio',{name:period==='rolling'?'Rolling twelve months':'Latest month versus the same month last year'})).toBeChecked();
  expect(screen.getByRole('radio',{name:metric==='share'?'Share change in percentage points':'Dollar change'})).toBeChecked();
  const table=screen.getByRole('table',{name:'Largest estimated-duty increases'});expect(table).toHaveTextContent(amount);expect(table).toHaveTextContent(change);expect(table).toHaveTextContent('Canada');
  expect(screen.getByText(/100 × CAL_DUT_MO/)).toBeVisible();
  expect(screen.getByRole('link',{name:'Canada · 1220'})).toHaveAttribute('href',`/products/090121/?direction=imports&months=12&countries=1220${period==='monthly'?'&comparison=monthly':''}#duties-heading`);
});
it('pushes edits, resets fallback notice, and restores controls on popstate/hashchange',async()=>{
  window.history.replaceState({position:3},'','/changes/duties/?direction=exports#main');render(<DutyChanges data={prepareDutyChanges(dutyChangesRelease())}/>);expect(screen.getByRole('status')).toHaveTextContent(/could not be restored/);
  const length=window.history.length,user=userEvent.setup();await user.click(screen.getByRole('radio',{name:'Dollar change'}));expect(window.history.length).toBe(length+1);expect(window.location.search).toBe('?direction=imports&period=rolling&metric=dollars');expect(window.location.hash).toBe('#main');expect(screen.queryByRole('status')).toBeNull();
  window.history.replaceState({position:4},'','/changes/duties/?period=monthly&metric=share#duties-changes-heading');fireEvent.popState(window);
  expect(screen.getByRole('radio',{name:'Latest month versus the same month last year'})).toBeChecked();expect(window.history.state).toEqual({position:4});
  window.history.replaceState(null,'','/changes/duties/?metric=dollars#main');fireEvent(window,new Event('hashchange'));expect(screen.getByRole('radio',{name:'Dollar change'})).toBeChecked();
});
it('copies canonical latest-release links and suppresses stale clipboard completions',async()=>{
  window.history.replaceState(null,'','/changes/duties/?utm_source=x#main');render(<DutyChanges data={prepareDutyChanges(dutyChangesRelease())}/>);const user=userEvent.setup();let complete!:()=>void;
  const clipboard=vi.spyOn(navigator.clipboard,'writeText').mockImplementation(()=>new Promise<void>(resolve=>{complete=resolve;}));
  await user.click(screen.getByRole('button',{name:'Copy duty changes link'}));expect(clipboard).toHaveBeenCalledWith(new URL('/changes/duties/?direction=imports&period=rolling&metric=share#main',window.location.origin).href);
  await user.click(screen.getByRole('radio',{name:'Dollar change'}));await act(async()=>complete());expect(screen.queryByText('Duty changes link copied.')).toBeNull();
  clipboard.mockRejectedValue(new Error('blocked'));await user.click(screen.getByRole('button',{name:'Copy duty changes link'}));const input=screen.getByLabelText('Duty changes link');expect((input as HTMLInputElement).value).toContain('metric=dollars');await user.click(input);expect(input).toHaveFocus();
});
it('shows qualified coverage and independent countries when world is suppressed, with honest profile fallback',()=>{
  const release=dutyChangesRelease();release.observations=release.observations.filter(r=>r.partnerCode!=='1220');release.duties.observations.find(r=>r.partnerCode==='-'&&r.month==='2025-12')!.calculatedDuty={status:'suppressed',valueUsd:null};for(const row of release.duties.observations.filter(r=>r.partnerCode==='1220'))row.coverage.uncalculatedDutiableValueUsd=2;
  render(<DutyChanges data={prepareDutyChanges(release)}/>);expect(screen.getByRole('region',{name:'Official world estimated duties'})).toHaveTextContent(/comparison unavailable/i);const table=screen.getByRole('table',{name:'Largest estimated-duty increases'});expect(table).toHaveTextContent('$72');expect(table).toHaveTextContent('Qualified reported figures');expect(table).toHaveTextContent('$24');expect(table).toHaveTextContent('10.000%');expect(table).toHaveTextContent(/Country merchandise history is unavailable/);expect(within(table).getByRole('link',{name:'Canada · 1220'})).toHaveAttribute('href','/products/090121/?direction=imports&months=12#duties-heading');
});
it('renders readable default SSR with disabled controls, honest no-JS limits and unique IDs',()=>{
  window.history.replaceState(null,'','/changes/duties/?period=monthly&metric=dollars');const data=prepareDutyChanges(dutyChangesRelease()),html=renderToStaticMarkup(<DutyChanges data={data}/>);expect(html).toContain('$72');expect(html).toContain('Enable JavaScript');expect(html).not.toContain('observations');const serverDocument=new DOMParser().parseFromString(html,'text/html');expect([...serverDocument.querySelectorAll('button,input[type="radio"]')].every(control=>control.hasAttribute('disabled'))).toBe(true);
  render(<DutyChanges data={data}/>);const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);expect(new Set(ids).size).toBe(ids.length);
});
it('explains an unavailable duty dataset without invented rankings',()=>{
  render(<DutyChanges data={prepareDutyChanges(sampleRelease())}/>);expect(screen.getByText(/does not include a duty dataset/)).toBeVisible();expect(screen.queryByRole('table')).toBeNull();
});
it('downloads the selected table CSV and restores both period and metric with navigation',async()=>{
  const files:{blob:Blob;filename:string}[]=[];vi.spyOn(downloads,'downloadBlob').mockImplementation((blob,filename)=>{files.push({blob,filename});});
  render(<DutyChanges data={prepareDutyChanges(dutyChangesRelease())}/>);const user=userEvent.setup();
  await user.click(screen.getByRole('button',{name:'Download duty changes CSV'}));await user.click(screen.getByRole('radio',{name:'Latest month versus the same month last year'}));await user.click(screen.getByRole('radio',{name:'Dollar change'}));await user.click(screen.getByRole('button',{name:'Download duty changes CSV'}));
  window.history.replaceState(null,'','/changes/duties/?period=rolling&metric=share');fireEvent.popState(window);await user.click(screen.getByRole('button',{name:'Download duty changes CSV'}));
  const read=(blob:Blob)=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsText(blob);});
  expect(files.map(f=>f.filename)).toEqual(['hs-090121-imports-estimated-duty-changes-rolling-share.csv','hs-090121-imports-estimated-duty-changes-monthly-dollars.csv','hs-090121-imports-estimated-duty-changes-rolling-share.csv']);
  const rows=await Promise.all(files.map(async f=>parseCsv(await read(f.blob))));expect(rows[0][0].current_calculated_duty_usd).toBe('72');expect(rows[1][0]).toMatchObject({comparison_period:'monthly',ranking_metric:'dollars',current_calculated_duty_usd:'6'});expect(rows[2]).toEqual(rows[0]);
});
