// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest';
import {act,cleanup,render,screen,within} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {hydrateRoot} from 'react-dom/client';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {TradeOverview} from '../../src/components/TradeOverview';
import {buildOverviewProduct} from '../../src/lib/trade/overview';
import {sampleDutyRelease} from '../helpers/duties';
afterEach(()=>{cleanup();window.history.replaceState(null,'','/');});
const product={code:'090121',displayName:'Roasted coffee',published:true,importable:true,dutiesAccepted:true};

it('retains a restored selection when a parent supplies the same products in a new array',async()=>{
  window.history.replaceState({position:2},'','/?product=090121&direction=exports&comparison=annual&months=12');
  const data=buildOverviewProduct({product,release:sampleDutyRelease()});
  const view=render(<TradeOverview products={[data]}/>);
  await userEvent.click(screen.getByRole('button',{name:'Imports'}));
  view.rerender(<TradeOverview products={[data]}/>);
  expect(screen.getByRole('button',{name:'Imports'})).toHaveAttribute('aria-pressed','true');
  expect(screen.getByRole('button',{name:'Last 12 months'})).toHaveAttribute('aria-pressed','true');
  expect(screen.getByRole('button',{name:'1Y'})).toHaveAttribute('aria-pressed','true');
  expect(window.history.state).toEqual({position:2});
});

it('hydrates the server overview without replacing the sourced initial content',async()=>{
  const products=[buildOverviewProduct({product,release:sampleDutyRelease()})];
  const container=document.createElement('div');document.body.append(container);
  container.innerHTML=renderToString(<TradeOverview products={products}/>);
  const errors:string[]=[];let root:ReturnType<typeof hydrateRoot>;
  await act(async()=>{root=hydrateRoot(container,<TradeOverview products={products}/>,{onRecoverableError:error=>errors.push(String(error))});});
  await act(async()=>root!.unmount());container.remove();expect(errors).toEqual([]);
});

it('keeps the chosen period, trade totals and matching partner shares aligned',async()=>{
  render(<TradeOverview products={[buildOverviewProduct({product,release:sampleDutyRelease()})]}/>);
  const user=userEvent.setup(),totals=screen.getByRole('region',{name:'Overview figures'});
  expect(totals).toHaveTextContent('$100');expect(totals).toHaveTextContent('5.0%');
  await user.click(screen.getByRole('button',{name:'Last 12 months'}));
  expect(totals).toHaveTextContent('$1.2K');expect(totals).toHaveTextContent('7.5%');
  await user.click(screen.getByRole('button',{name:'Exports'}));
  expect(totals).toHaveTextContent('$2.4K');expect(totals).not.toHaveTextContent('Estimated duty share');
  const partners=screen.getByRole('region',{name:'Leading partner markets'});
  expect(within(partners).getByRole('link',{name:'CANADA'})).toHaveAttribute('href','/products/090121/?direction=exports&months=12&countries=1220#trade-history-heading');
});

it('keeps missing world values unavailable and qualifies incomplete duty reporting',()=>{
  const release=sampleDutyRelease();
  const world=release.observations.find(row=>row.geography==='world'&&row.direction==='imports'&&row.month==='2025-12')!;
  world.valueUsd=null;world.status='missing';
  release.duties.observations.at(-1)!.coverage={status:'verified',uncalculatedDutiableValueUsd:5};
  render(<TradeOverview products={[buildOverviewProduct({product,release})]}/>);
  const figures=screen.getByRole('region',{name:'Overview figures'});
  expect(figures).toHaveTextContent('Unavailable');expect(figures).toHaveTextContent('Qualified · RP70/79');
  expect(screen.getByRole('region',{name:'Leading partner markets'})).toHaveTextContent('Share unavailable');
});

it('counts reported zero-valued partners beyond the five displayed leaders',async()=>{
  const release=sampleDutyRelease();
  const base=release.observations.filter(row=>row.geography==='country'&&row.partnerCode==='1220');
  for(const code of ['1000','1001'])release.observations.push(...base.map(row=>({...row,partnerCode:code,partnerName:`OTHER ${code}`,valueUsd:0})));
  render(<TradeOverview products={[buildOverviewProduct({product,release})]}/>);
  await userEvent.click(screen.getByRole('button',{name:'Exports'}));
  const figures=screen.getByRole('region',{name:'Overview figures'});
  expect(figures).toHaveTextContent('Partners with reported values6');
  expect(figures).toHaveTextContent('6 partners in history');
  expect(within(screen.getByRole('region',{name:'Leading partner markets'})).getAllByRole('link')).toHaveLength(6);
});
