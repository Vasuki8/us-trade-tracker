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
  expect(within(card).queryByRole('link',{name:'Explore latest-month country changes',exact:true})).toBeNull();
  expect(within(card).queryByRole('link',{name:'Explore rolling country changes',exact:true})).toBeNull();
});


it('country research links retain the summary period and changed direction',async()=>{
  render(<PortfolioBriefing data={prepared}/>);
  const card=within(screen.getByRole('article',{name:'Green coffee · HS 090111'}));
  expect(card.getByRole('link',{name:'Explore latest-month country changes',exact:true})).toHaveAttribute('href','/changes/090111/?direction=imports&metric=dollars&period=monthly#changes-heading');
  expect(card.getByRole('link',{name:'Explore rolling country changes',exact:true})).toHaveAttribute('href','/changes/090111/?direction=imports&metric=dollars#changes-heading');
  await userEvent.setup().click(screen.getByRole('radio',{name:'Exports',exact:true}));
  expect(card.getByRole('link',{name:'Explore latest-month country changes',exact:true})).toHaveAttribute('href','/changes/090111/?direction=exports&metric=dollars&period=monthly#changes-heading');
  expect(card.getByRole('link',{name:'Explore rolling country changes',exact:true})).toHaveAttribute('href','/changes/090111/?direction=exports&metric=dollars#changes-heading');
});

it.each(['missing unrelated month','classification span'] as const)('keeps monthly drilldown when only rolling is unavailable: %s',reason=>{
  const sample=portfolioSample();
  if(reason==='missing unrelated month')sample.release.observations=sample.release.observations.filter(row=>!(row.direction==='imports'&&row.geography==='world'&&row.month==='2024-06'));
  else sample.release.classificationIntervals=[{from:'2024-12',to:'2025-12',evidenceUrl:'https://example.invalid/monthly'}];
  render(<PortfolioBriefing data={preparePortfolioBriefing([sample])}/>);
  expect(screen.getByRole('link',{name:'Explore latest-month country changes',exact:true})).toBeVisible();
  expect(screen.queryByRole('link',{name:'Explore rolling country changes',exact:true})).toBeNull();
  expect(screen.getByRole('region',{name:'Rolling twelve months',exact:true})).toHaveTextContent('Comparison unavailable');
});

it.each(['missing','suppressed'] as const)('withholds unavailable matching-month links: %s',status=>{
  const sample=portfolioSample(),row=sample.release.observations.find(row=>row.direction==='imports'&&row.geography==='world'&&row.month==='2025-12')!;
  row.valueUsd=null;row.status=status;
  render(<PortfolioBriefing data={preparePortfolioBriefing([sample])}/>);
  expect(screen.queryByRole('link',{name:'Explore latest-month country changes',exact:true})).toBeNull();
  expect(screen.queryByRole('link',{name:'Explore rolling country changes',exact:true})).toBeNull();
  expect(screen.getByRole('region',{name:'Latest month',exact:true})).toHaveTextContent('Comparison unavailable');
});

it('retains an available dollar drilldown with a reported zero prior month and unavailable growth',()=>{
  const sample=portfolioSample();for(const row of sample.release.observations)if(row.direction==='imports'&&row.month==='2024-12')row.valueUsd=0;
  render(<PortfolioBriefing data={preparePortfolioBriefing([sample])}/>);
  const monthly=within(screen.getByRole('region',{name:'Latest month',exact:true}));
  expect(monthly.getByText(/No growth percentage/)).toBeVisible();
  expect(monthly.getByRole('link',{name:'Explore latest-month country changes',exact:true})).toBeVisible();
});
