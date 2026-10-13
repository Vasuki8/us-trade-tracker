// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderToStaticMarkup} from 'react-dom/server';
import '@testing-library/jest-dom/vitest';
import {portfolioSample} from '../helpers/portfolio';
import {preparePortfolioBriefing} from '../../src/lib/trade/portfolio-briefing';
import {PortfolioBriefing} from '../../src/components/PortfolioBriefing';
const prepared=preparePortfolioBriefing([portfolioSample(),portfolioSample('090111','Green coffee')]);
afterEach(()=>{cleanup();vi.restoreAllMocks();window.history.replaceState(null,'','/');});
it('restores direction/products with separate figures and no export duties',()=>{
  window.history.replaceState(null,'','/briefing/portfolio/?products=090111&direction=exports');render(<PortfolioBriefing data={prepared}/>);
  expect(screen.getByRole('radio',{name:'Exports'})).toBeChecked();
  expect(screen.getByRole('article',{name:'Green coffee · HS 090111'})).toHaveTextContent(/Current value:\s*\$200/);
  expect(screen.queryByRole('article',{name:'Roasted coffee · HS 090121'})).toBeNull();
  expect(screen.queryByText('Estimated duties',{exact:true})).toBeNull();
  expect(screen.getByText('ALL_VAL_MO',{exact:true})).toBeVisible();
});
it('retains one product, updates history and restores on navigation',async()=>{
  window.history.replaceState({position:3},'','/briefing/portfolio/');render(<PortfolioBriefing data={prepared}/>);const user=userEvent.setup();
  await user.click(screen.getByRole('checkbox',{name:/Roasted coffee/}));
  expect(screen.getByRole('checkbox',{name:/Green coffee/})).toBeDisabled();
  expect(window.location.search).toBe('?products=090111&direction=imports');
  await user.click(screen.getByRole('radio',{name:'Exports'}));
  window.history.replaceState({position:4},'','/briefing/portfolio/');fireEvent.popState(window);
  expect(screen.getAllByRole('article',{name:/coffee · HS/})).toHaveLength(2);
  expect(screen.getByRole('radio',{name:'Imports'})).toBeChecked();expect(window.history.state).toEqual({position:4});
});
it('copies canonical links, offers manual fallback and ignores stale completions',async()=>{
  window.history.replaceState(null,'','/briefing/portfolio/?utm_source=x#main');render(<PortfolioBriefing data={prepared}/>);const user=userEvent.setup();let complete!:()=>void;
  const clipboard=vi.spyOn(navigator.clipboard,'writeText').mockImplementation(()=>new Promise<void>(resolve=>{complete=resolve;}));
  await user.click(screen.getByRole('button',{name:'Copy briefing link'}));
  expect(clipboard).toHaveBeenCalledWith(new URL('/briefing/portfolio/?products=090121%2C090111&direction=imports#main',window.location.origin).href);
  await user.click(screen.getByRole('radio',{name:'Exports'}));await act(async()=>complete());
  expect(screen.queryByText('Briefing link copied.')).toBeNull();
  clipboard.mockRejectedValue(new Error('denied'));await user.click(screen.getByRole('button',{name:'Copy briefing link'}));
  const input=screen.getByLabelText('Briefing link');expect((input as HTMLInputElement).value).toContain('direction=exports');await user.click(input);expect(input).toHaveFocus();
});
it('keeps readable default SSR research, unique IDs and sourced duty qualifications',()=>{
  const html=renderToStaticMarkup(<PortfolioBriefing data={prepared}/>);
  expect(html).toContain('GEN_VAL_MO');expect(html).not.toContain('ALL_VAL_MO');expect(html).toContain('Enable JavaScript');
  render(<PortfolioBriefing data={prepared}/>);
  const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);expect(new Set(ids).size).toBe(ids.length);
  const first=screen.getByRole('article',{name:'Roasted coffee · HS 090121'});
  expect(within(first).getByRole('region',{name:'Rolling estimated duties'})).toHaveTextContent('Duty share: 15.000%');
  expect(first).toHaveTextContent('RP 70/79');expect(first).toHaveTextContent('2026-01-01T00:00:00.000Z');
});
it('explains an older selected release and keeps its source identity without showing stale comparisons',()=>{
  const old=portfolioSample('090111','Green coffee');old.release.reportingMonth='2025-11';
  render(<PortfolioBriefing data={preparePortfolioBriefing([portfolioSample(),old])}/>);
  const card=screen.getByRole('article',{name:'Green coffee · HS 090111'});
  expect(card).toHaveTextContent('Comparisons unavailable for Dec 2025');
  expect(card).toHaveTextContent('2026-01-01T00:00:00.000Z');
  expect(within(card).queryByRole('region',{name:'Latest month'})).toBeNull();
});
