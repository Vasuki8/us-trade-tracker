// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderToStaticMarkup} from 'react-dom/server';
import '@testing-library/jest-dom/vitest';
import {sampleRelease} from '../helpers/release';
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
  expect(within(card).queryByRole('link',{name:'Explore latest-month country changes'})).toBeNull();
  expect(within(card).queryByRole('link',{name:'Explore rolling country changes'})).toBeNull();
});


it('country research links retain the summary period and changed direction',async()=>{
  render(<PortfolioBriefing data={prepared}/>);
  const card=within(screen.getByRole('article',{name:'Green coffee · HS 090111'}));
  expect(card.getByRole('link',{name:'Explore latest-month country changes'})).toHaveAttribute('href','/changes/090111/?direction=imports&metric=dollars&period=monthly#changes-heading');
  expect(card.getByRole('link',{name:'Explore rolling country changes'})).toHaveAttribute('href','/changes/090111/?direction=imports&metric=dollars#changes-heading');
  await userEvent.setup().click(screen.getByRole('radio',{name:'Exports'}));
  expect(card.getByRole('link',{name:'Explore latest-month country changes'})).toHaveAttribute('href','/changes/090111/?direction=exports&metric=dollars&period=monthly#changes-heading');
  expect(card.getByRole('link',{name:'Explore rolling country changes'})).toHaveAttribute('href','/changes/090111/?direction=exports&metric=dollars#changes-heading');
});

it.each(['missing unrelated month','classification span'] as const)('keeps monthly drilldown when only rolling is unavailable: %s',reason=>{
  const sample=portfolioSample();
  if(reason==='missing unrelated month')sample.release.observations=sample.release.observations.filter(row=>!(row.direction==='imports'&&row.geography==='world'&&row.month==='2024-06'));
  else sample.release.classificationIntervals=[{from:'2024-12',to:'2025-12',evidenceUrl:'https://example.invalid/monthly'}];
  render(<PortfolioBriefing data={preparePortfolioBriefing([sample])}/>);
  expect(screen.getByRole('link',{name:'Explore latest-month country changes'})).toBeVisible();
  expect(screen.queryByRole('link',{name:'Explore rolling country changes'})).toBeNull();
  expect(screen.getByRole('region',{name:'Rolling twelve months'})).toHaveTextContent('Comparison unavailable');
});

it.each(['missing','suppressed'] as const)('withholds unavailable matching-month links: %s',status=>{
  const sample=portfolioSample(),row=sample.release.observations.find(row=>row.direction==='imports'&&row.geography==='world'&&row.month==='2025-12')!;
  row.valueUsd=null;row.status=status;
  render(<PortfolioBriefing data={preparePortfolioBriefing([sample])}/>);
  expect(screen.queryByRole('link',{name:'Explore latest-month country changes'})).toBeNull();
  expect(screen.queryByRole('link',{name:'Explore rolling country changes'})).toBeNull();
  expect(screen.getByRole('region',{name:'Latest month'})).toHaveTextContent('Comparison unavailable');
});

it('retains an available dollar drilldown with a reported zero prior month and unavailable growth',()=>{
  const sample=portfolioSample();for(const row of sample.release.observations)if(row.direction==='imports'&&row.month==='2024-12')row.valueUsd=0;
  render(<PortfolioBriefing data={preparePortfolioBriefing([sample])}/>);
  const monthly=within(screen.getByRole('region',{name:'Latest month'}));
  expect(monthly.getByText(/No growth percentage/)).toBeVisible();
  expect(monthly.getByRole('link',{name:'Explore latest-month country changes'})).toBeVisible();
});


const monthlyDutyResearch='Explore latest-month estimated-duty changes by country';
const rollingDutyResearch='Explore twelve-month estimated-duty changes by country';
it('portfolio_world_duty_links_keep_product_and_period',async()=>{
 render(<PortfolioBriefing data={prepared}/>);const user=userEvent.setup();
 for(const [code,name,base]of [['090121','Roasted coffee','/changes/duties/'],['090111','Green coffee','/changes/duties/090111/']]){
  const card=within(screen.getByRole('article',{name:`${name} · HS ${code}`}));
  const monthly=card.getByRole('region',{name:'Monthly estimated duties'}),rolling=card.getByRole('region',{name:'Rolling estimated duties'});
  expect(within(monthly).getByRole('link',{name:monthlyDutyResearch})).toHaveAttribute('href',base+'?direction=imports&period=monthly&metric=share#duties-changes-heading');
  expect(within(rolling).getByRole('link',{name:rollingDutyResearch})).toHaveAttribute('href',base+'?direction=imports&period=rolling&metric=share#duties-changes-heading');
  expect(monthly).toHaveTextContent('Current · Dec 2025');expect(monthly).toHaveTextContent('Prior · Dec 2024');expect(monthly).toHaveTextContent('Estimated duties: $12');expect(monthly).toHaveTextContent('Consumption value: $80');
  expect(rolling).toHaveTextContent('Current · Jan 2025–Dec 2025');
  expect(within(card.getByRole('region',{name:'Partner highlights'})).queryByRole('link',{name:/estimated-duty changes by country/})).toBeNull();
 }
 await user.click(screen.getByRole('checkbox',{name:/Roasted coffee/}));expect(screen.getAllByRole('link',{name:monthlyDutyResearch})).toHaveLength(1);expect(screen.getByRole('link',{name:monthlyDutyResearch})).toHaveAttribute('href',expect.stringContaining('/090111/'));
 await user.click(screen.getByRole('checkbox',{name:/Roasted coffee/}));expect(screen.getAllByRole('link',{name:monthlyDutyResearch})).toHaveLength(2);
 window.history.replaceState(null,'','/briefing/portfolio/?products=090121&direction=imports');fireEvent.popState(window);
 expect(screen.getAllByRole('link',{name:monthlyDutyResearch})).toHaveLength(1);expect(screen.getByRole('link',{name:monthlyDutyResearch})).toHaveAttribute('href','/changes/duties/?direction=imports&period=monthly&metric=share#duties-changes-heading');
});
it('duty_research_follows_imports_and_never_attaches_to_partner_summaries',async()=>{
 render(<PortfolioBriefing data={prepared}/>);const user=userEvent.setup();await user.click(screen.getByRole('radio',{name:'Exports'}));expect(screen.queryByRole('link',{name:/estimated-duty changes by country/})).toBeNull();
 await user.click(screen.getByRole('radio',{name:'Imports'}));expect(screen.getAllByRole('link',{name:/estimated-duty changes by country/})).toHaveLength(4);
 for(const partners of screen.getAllByRole('region',{name:'Partner highlights'}))expect(within(partners).queryByRole('link',{name:/estimated-duty changes by country/})).toBeNull();
});
it('static_portfolio_retains_default_duty_anchors_and_unique_ids',()=>{
 const html=renderToStaticMarkup(<PortfolioBriefing data={prepared}/>);expect(html.match(/estimated-duty changes by country/g)).toHaveLength(4);expect(html).toContain('Enable JavaScript');
 render(<PortfolioBriefing data={prepared}/>);const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);expect(new Set(ids).size).toBe(ids.length);
});
it('legacy_and_mismatched_portfolio_cards_offer_no_duty_research',()=>{
 const legacy=portfolioSample(),old=portfolioSample('090111','Green coffee');old.release.reportingMonth='2025-11';
 render(<PortfolioBriefing data={preparePortfolioBriefing([{product:legacy.product,release:sampleRelease()},old])}/>);
 expect(screen.queryByRole('link',{name:/estimated-duty changes by country/})).toBeNull();expect(screen.getByRole('article',{name:'Green coffee · HS 090111'})).toHaveTextContent('Comparisons unavailable');
});
it.each(['zero change','zero prior duties','qualified zero','missing','suppressed','coverage','zero current consumption','zero prior consumption','classification','split classification','unrelated missing month','classification span'] as const)('portfolio_world_duty_eligibility: %s',kind=>{
 const sample=portfolioSample(),release=sample.release,month=kind==='zero prior consumption'||kind==='zero prior duties'?'2024-12':'2025-12';
 const rows=release.duties.observations.filter(r=>r.month===month),world=rows.find(r=>r.geography==='world')!;
 if(kind==='zero change')world.calculatedDuty.valueUsd=8;
 if(kind==='zero prior duties'||kind==='qualified zero')for(const row of rows)row.calculatedDuty.valueUsd=0;
 if(kind==='qualified zero')world.coverage.uncalculatedDutiableValueUsd=2;
 if(kind==='missing'||kind==='suppressed'){world.calculatedDuty={valueUsd:null,status:kind};world.coverage={status:'unavailable',uncalculatedDutiableValueUsd:null};}
 if(kind==='coverage')world.coverage={status:'unavailable',uncalculatedDutiableValueUsd:null};
 if(kind==='zero current consumption'||kind==='zero prior consumption')for(const row of rows){for(const key of ['calculatedDuty','consumptionValue','dutiableValue'] as const)row[key].valueUsd=0;row.coverage.uncalculatedDutiableValueUsd=0;}
 if(kind==='classification')release.classificationIntervals=[];
 if(kind==='split classification')release.classificationIntervals=[{...release.classificationIntervals[0],to:'2024-12'},{...release.classificationIntervals[0],from:'2025-01'}];
 if(kind==='classification span')release.classificationIntervals=[{...release.classificationIntervals[0],from:'2024-12'}];
 if(kind==='unrelated missing month')release.duties.observations=release.duties.observations.filter(r=>r.geography!=='world'||r.month!=='2024-06');
 render(<PortfolioBriefing data={preparePortfolioBriefing([sample])}/>);
 const monthlyAvailable=['zero change','zero prior duties','qualified zero','unrelated missing month','classification span'].includes(kind),rollingAvailable=['zero change','zero prior duties','qualified zero','zero current consumption','zero prior consumption'].includes(kind);
 if(monthlyAvailable)expect(screen.getByRole('link',{name:monthlyDutyResearch})).toBeVisible();else expect(screen.queryByRole('link',{name:monthlyDutyResearch})).toBeNull();
 if(rollingAvailable)expect(screen.getByRole('link',{name:rollingDutyResearch})).toBeVisible();else expect(screen.queryByRole('link',{name:rollingDutyResearch})).toBeNull();
 if(kind==='zero prior duties')expect(screen.getByRole('region',{name:'Monthly estimated duties'})).toHaveTextContent('Duty growth: Unavailable');
 if(kind==='zero change')expect(screen.getByRole('region',{name:'Monthly estimated duties'})).toHaveTextContent('Share change: 0.0 pp');
 if(kind==='qualified zero')expect(screen.getByRole('region',{name:'Monthly estimated duties'})).toHaveTextContent('Qualified: some dutiable value has no calculated duty.');
});
it.each(['no duty countries','unchanged duty countries','no partner highlights'] as const)('portfolio_world_research_does_not_depend_on_partner_results: %s',kind=>{
 const sample=portfolioSample();
 if(kind==='no duty countries')sample.release.duties.observations=sample.release.duties.observations.filter(r=>r.geography==='world');
 if(kind==='unchanged duty countries')for(const row of sample.release.duties.observations)if(row.geography==='country')row.calculatedDuty.valueUsd=0;
 if(kind==='no partner highlights')for(const row of sample.release.observations)if(row.geography==='country')row.valueUsd=10;
 render(<PortfolioBriefing data={preparePortfolioBriefing([sample])}/>);expect(screen.getByRole('link',{name:monthlyDutyResearch})).toBeVisible();expect(screen.getByRole('link',{name:rollingDutyResearch})).toBeVisible();
});

it.each([[1,'<0.001%'],[0,'0.000%'],[null,'Unavailable']] as const)('distinguishes tiny positive estimated duty shares from zero and unavailable: %s', (duty,label)=>{
 const sample=portfolioSample('180100','Synthetic cocoa');
 for(const row of sample.release.duties.observations)if(row.geography==='world'){
  row.calculatedDuty={valueUsd:duty,status:duty===null?'missing':'reported'};
  row.consumptionValue={valueUsd:1_000_000,status:'reported'};
 }
 render(<PortfolioBriefing data={preparePortfolioBriefing([sample])}/>);
 expect(screen.getByRole('region',{name:'Monthly estimated duties'})).toHaveTextContent(`Duty share: ${label}`);
 if(duty===1)expect(screen.getByRole('region',{name:'Monthly estimated duties'})).not.toHaveTextContent('Duty share: 0.000%');
});
