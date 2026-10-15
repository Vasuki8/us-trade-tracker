// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest';
import {cleanup,render,screen,within} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {DutyHistoryChart} from '../../src/components/DutyHistoryChart';
import {buildDutyHistoryChart} from '../../src/lib/trade/duty-history';
import {buildDutyView} from '../../src/lib/trade/duties';
import {sampleDutyRelease} from '../helpers/duties';
afterEach(cleanup);
const chart=(r=sampleDutyRelease(),metric:'dollars'|'share'='dollars')=>buildDutyHistoryChart(buildDutyView(r,[]),r.classificationIntervals,metric);
const figure=(name='Monthly estimated duties · current USD')=>screen.getByRole('figure',{name});
const plot=(f:HTMLElement)=>f.querySelector('svg.duty-chart-desktop')!;
it('names each metric and period with one accessible chart and a precise table alternative',()=>{
 const r=sampleDutyRelease();render(<><DutyHistoryChart model={chart(r)}/><DutyHistoryChart model={chart(r,'share')}/></>);
 const amount=figure(),share=figure('Calculated duties as share of import value · %');
 expect(within(amount).getByRole('img')).toHaveAccessibleName(/Monthly estimated duties/);expect(within(amount).getAllByRole('img')).toHaveLength(1);
 expect(amount).toHaveTextContent('Jan 2024–Dec 2025');expect(share).toHaveTextContent('imports for consumption');expect(amount).toHaveTextContent(/monthly tables/);
 const a=plot(amount).querySelectorAll('circle'),s=plot(share).querySelectorAll('circle');expect(a).toHaveLength(24);expect(s).toHaveLength(24);
 expect(a[12].getAttribute('cx')).toBe(s[12].getAttribute('cx'));expect(a[12].getAttribute('cy')).not.toBe(s[12].getAttribute('cy'));
 expect(a[12].querySelector('title')?.textContent).toMatch(/Jan 2025.*All partner countries.*\$19.*\$180/);
 expect(s[12].querySelector('title')?.textContent).toContain('10.556%');
});
it('marks qualified points and exposes qualification counts without relying on hover',()=>{
 const r=sampleDutyRelease();r.duties.observations[12].coverage.uncalculatedDutiableValueUsd=90;
 render(<DutyHistoryChart model={chart(r)}/>);const f=figure(),circles=plot(f).querySelectorAll('circle');
 expect(circles[12].getAttribute('fill')).toBe('white');expect(circles[11].getAttribute('fill')).not.toBe('white');
 expect(circles[12].querySelector('title')?.textContent).toMatch(/RP70\/79.*\$90.*50.000%/);
 expect(f).toHaveTextContent(/RP70\/79 affected 1 of 24/);expect(f).toHaveTextContent(/coverage unverified 0 of 24/);expect(f).toHaveTextContent(/classification unverified 0 of 24/);expect(f).toHaveTextContent(/Hollow markers/);expect(f).toHaveTextContent(/zero.*not.*duty-free/i);
});
it('breaks at unavailable values and separate reviewed intervals',()=>{
 const r=sampleDutyRelease();r.duties.observations[5].calculatedDuty={valueUsd:null,status:'suppressed'};r.classificationIntervals=[{from:'2024-01',to:'2024-12',evidenceUrl:'https://example.invalid/a'},{from:'2025-01',to:'2025-12',evidenceUrl:'https://example.invalid/b'}];
 render(<DutyHistoryChart model={chart(r)}/>);const path=plot(figure()).querySelector('path')!;
 expect(path.getAttribute('d')?.match(/M/g)).toHaveLength(3);expect(plot(figure()).querySelectorAll('circle')).toHaveLength(23);expect(figure()).toHaveTextContent(/unavailable 1 of 24/);
});
it('keeps unverified monthly points isolated and explained',()=>{
 const r=sampleDutyRelease();r.duties.observations[12].coverage={status:'unavailable',uncalculatedDutiableValueUsd:null};r.classificationIntervals=[{from:'2024-01',to:'2024-12',evidenceUrl:'https://example.invalid/a'},{from:'2025-02',to:'2025-12',evidenceUrl:'https://example.invalid/b'}];
 render(<DutyHistoryChart model={chart(r)}/>);const p=plot(figure());expect(p.querySelectorAll('circle')).toHaveLength(24);expect(p.querySelector('path')?.getAttribute('d')?.match(/M/g)).toHaveLength(3);expect(figure()).toHaveTextContent(/coverage unverified 1 of 24/);expect(figure()).toHaveTextContent(/classification unverified 1 of 24/);
});
it('renders tiny positive share labels and distinct nonzero axis ticks',()=>{
 const r=sampleDutyRelease();for(const row of r.duties.observations){row.calculatedDuty.valueUsd=3;row.consumptionValue.valueUsd=1_000_000;}
 render(<DutyHistoryChart model={chart(r,'share')}/>);const f=figure('Calculated duties as share of import value · %');
 expect(plot(f).querySelector('circle title')?.textContent).toContain('<0.001%');const labels=[...plot(f).querySelectorAll('text')].map(t=>t.textContent);expect(labels).toContain('0.000084%');expect(labels).toContain('0.000336%');
});
it.each(['zero','missing'] as const)('renders fully %s amounts truthfully without invalid coordinates',kind=>{
 const r=sampleDutyRelease();for(const row of r.duties.observations)row.calculatedDuty=kind==='zero'?{status:'reported',valueUsd:0}:{status:'missing',valueUsd:null};
 render(<DutyHistoryChart model={chart(r)}/>);const f=figure();expect(f.innerHTML).not.toMatch(/NaN|Infinity/);
 expect(plot(f).querySelectorAll('circle')).toHaveLength(kind==='zero'?24:0);
 if(kind==='missing')expect(f).toHaveTextContent(/No reported monthly values/);else expect(plot(f).querySelector('circle title')?.textContent).toContain('$0');
});
it('retains full ordered country identities and matching dash legend marks',()=>{
 const model=chart();model.series=[['2010','A VERY LONG MEXICO COUNTRY NAME'],['1220','CANADA'],['4759','ITALY']].map(([code,name])=>({...structuredClone(model.series[0]),code,name}));
 render(<DutyHistoryChart model={model}/>);const f=figure();const names=[...f.querySelectorAll('.duty-chart-legend li')].map(li=>li.textContent);
 expect(names).toEqual(['A VERY LONG MEXICO COUNTRY NAME · 2010','CANADA · 1220','ITALY · 4759']);
 const paths=plot(f).querySelectorAll('path');expect(paths[1].getAttribute('stroke-dasharray')).toBe('8 5');expect(paths[2].getAttribute('stroke-dasharray')).toBe('2 5');
});
it('renders both metric figures in server HTML without an extra interactive state',()=>{
 const html=renderToStaticMarkup(<DutyHistoryChart model={chart()}/>);expect(html).toContain('Jan 2024');expect(html).toContain('Dec 2025');expect(html).toContain('All partner countries');expect(html).not.toContain('astro-island');expect(html).not.toContain('<input');
});
it('uses compact scientific axis labels for extremely small positive shares',()=>{
 const model=chart(sampleDutyRelease(),'share');for(const p of model.series[0].points){p.value=0.0000000000001;p.consumptionValueUsd=1_000_000_000_000_000;}
 render(<DutyHistoryChart model={model}/>);const labels=[...plot(figure('Calculated duties as share of import value · %')).querySelectorAll('text')].map(t=>t.textContent);
 expect(labels).toContain('2.8E-14%');expect(labels).toContain('1.12E-13%');
});
