// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import {renderToStaticMarkup} from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {TradeChartDownload} from '../../src/components/TradeChartDownload';
import {buildProfileView} from '../../src/lib/trade/profile';
import {sampleRelease} from '../helpers/release';
import {exportChartPng,serializeCsv} from '../../src/lib/trade/downloads';
import type {ProfileView} from '../../src/lib/trade/types';
vi.mock('../../src/lib/trade/downloads',async importOriginal=>({...await importOriginal<typeof import('../../src/lib/trade/downloads')>(),exportChartPng:vi.fn()}));
const downloads:{name:string;blob:Blob}[]=[],blobs=new Map<string,Blob>();let serial=0;
const png=()=>new Blob(['valid png'],{type:'image/png'});
const deferred=<T,>()=>{let resolve!:(value:T)=>void,reject!:(reason:unknown)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const view=()=>buildProfileView(sampleRelease(),{direction:'imports',months:12,countryCodes:['1220']});
const ref=()=>{const node=document.createElementNS('http://www.w3.org/2000/svg','svg');node.innerHTML='<text>original chart</text>';return {current:node as SVGSVGElement|null};};
const begin=async()=>{await userEvent.click(screen.getByRole('button',{name:'Download chart PNG'}));};
const resolveJob=async(job:ReturnType<typeof deferred<Blob>>,value:Blob=png())=>{await act(async()=>{job.resolve(value);await job.promise;});};
const rejectJob=async(job:ReturnType<typeof deferred<Blob>>)=>{await act(async()=>{job.reject(new Error('conversion failed'));await job.promise.catch(()=>{});});};
beforeEach(()=>{
 vi.stubGlobal('URL',Object.assign(class extends URL{},{createObjectURL:(blob:Blob)=>{const key='blob:merch-'+(++serial);blobs.set(key,blob);return key;},revokeObjectURL:()=>{}}));
 vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(function(this:HTMLAnchorElement){downloads.push({name:this.download,blob:blobs.get(this.href)!});});
 vi.mocked(exportChartPng).mockResolvedValue(png());
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();vi.mocked(exportChartPng).mockReset();downloads.length=0;blobs.clear();});
it('keeps both actions disabled before restored readiness in server HTML and client use',async()=>{
 const props={view:view(),svgRef:ref(),ready:false};const doc=new DOMParser().parseFromString(renderToStaticMarkup(<TradeChartDownload {...props}/>),'text/html');expect([...doc.querySelectorAll('button')].every(b=>b.disabled)).toBe(true);
 render(<TradeChartDownload {...props}/>);for(const b of screen.getAllByRole('button'))expect(b).toBeDisabled();fireEvent.click(screen.getByRole('button',{name:'Download chart PNG'}));expect(exportChartPng).not.toHaveBeenCalled();expect(downloads).toHaveLength(0);
});
it.each(['imports','exports'] as const)('captures the SVG and literal %s filename before awaiting conversion',async direction=>{
 const m=view();m.selection.direction=direction;const r=ref(),job=deferred<Blob>();vi.mocked(exportChartPng).mockReturnValueOnce(job.promise);render(<TradeChartDownload view={m} svgRef={r} ready/>);await begin();
 const captured=vi.mocked(exportChartPng).mock.calls[0][0];expect(captured).not.toBe(r.current);r.current!.textContent='changed after click';expect(captured.textContent).toBe('original chart');
 expect(screen.getByRole('status')).toHaveTextContent('Creating image…');expect(screen.getByRole('button',{name:'Creating image…'})).toHaveAttribute('aria-disabled','true');expect(screen.getByRole('button',{name:'Download data CSV'})).toBeEnabled();
 await resolveJob(job);expect(downloads.map(d=>d.name)).toEqual([`hs-090121-${direction}.png`]);expect(downloads[0].blob.type).toBe('image/png');expect(screen.queryByRole('status')).toBeNull();
});
it('guards rapid duplicate activation until the first job settles',async()=>{
 const job=deferred<Blob>();vi.mocked(exportChartPng).mockReturnValueOnce(job.promise);render(<TradeChartDownload view={view()} svgRef={ref()} ready/>);const button=screen.getByRole('button',{name:'Download chart PNG'});
 act(()=>{button.click();button.click();});expect(exportChartPng).toHaveBeenCalledTimes(1);await resolveJob(job);await begin();expect(exportChartPng).toHaveBeenCalledTimes(2);expect(downloads).toHaveLength(2);
});
const changes:[string,(m:ProfileView)=>void][]=[
 ['recorded point revision',m=>{m.series[0].points[0].recordedRevision=!m.series[0].points[0].recordedRevision;}],
 ['product',m=>{m.productCode='090111';}],['title',m=>{m.title+=' renamed';}],['direction',m=>{m.selection.direction='exports';}],['reporting month',m=>{m.reportingMonth='2026-01';}],
 ['country identity',m=>{m.series[0].code='2010';m.selection.countryCodes=['2010'];}],['country name',m=>{m.series[0].name+=' extended name';}],['point value',m=>{m.series[0].points[0].valueUsd=999;}],['month',m=>{m.series[0].points[0].month='2024-01';}],
 ['classification',m=>{m.series[0].points[0].classificationVerified=false;}],['boundary',m=>{m.series[0].points[1].breakBefore=true;}],['source',m=>{m.provenance.source='census';}],['measure',m=>{m.provenance.measure='ALL_VAL_MO';}],
 ['retrieval',m=>{m.provenance.retrievedAt='2026-01-02T00:00:00.000Z';}],['version',m=>{m.provenance.codeVersion+='new';}],['URLs',m=>{m.provenance.sourceUrls.push('https://example.test/new');}],['revision',m=>{m.provenance.revised=!m.provenance.revised;}],
];
it.each(changes)('suppresses obsolete success and error after %s changes',async(_label,change)=>{
 for(const outcome of ['success','error']){
  const m=view(),r=ref(),job=deferred<Blob>();vi.mocked(exportChartPng).mockReturnValueOnce(job.promise);const mounted=render(<TradeChartDownload view={m} svgRef={r} ready/>);await begin();const next=structuredClone(m);change(next);mounted.rerender(<TradeChartDownload view={next} svgRef={r} ready/>);
  expect(screen.getByRole('button',{name:'Creating image…'})).toHaveAttribute('aria-disabled','true');if(outcome==='success')await resolveJob(job);else await rejectJob(job);expect(downloads).toHaveLength(0);expect(screen.queryByRole('alert')).toBeNull();expect(screen.getByRole('button',{name:'Download chart PNG'})).toBeEnabled();mounted.unmount();
 }
});
it('invalidates changes in ordered countries even after changing back',async()=>{
 const m=buildProfileView(sampleRelease(),{direction:'imports',months:12,countryCodes:['1220','4759']}),r=ref(),job=deferred<Blob>();vi.mocked(exportChartPng).mockReturnValueOnce(job.promise);const mounted=render(<TradeChartDownload view={m} svgRef={r} ready/>);await begin();
 const other=structuredClone(m);other.series.reverse();other.selection.countryCodes.reverse();mounted.rerender(<TradeChartDownload view={other} svgRef={r} ready/>);mounted.rerender(<TradeChartDownload view={structuredClone(m)} svgRef={r} ready/>);await resolveJob(job);expect(downloads).toHaveLength(0);
});
it.each(['success','error'])('suppresses %s after unmount',async outcome=>{
 const job=deferred<Blob>();vi.mocked(exportChartPng).mockReturnValueOnce(job.promise);const mounted=render(<TradeChartDownload view={view()} svgRef={ref()} ready/>);await begin();mounted.unmount();if(outcome==='success')await resolveJob(job);else await rejectJob(job);expect(downloads).toHaveLength(0);expect(screen.queryByRole('alert')).toBeNull();
});
it('keeps valid work through identical rerenders and unrelated comparison, ranking, search, hash and summary changes',async()=>{
 const m=view(),r=ref(),job=deferred<Blob>();vi.mocked(exportChartPng).mockReturnValueOnce(job.promise);const mounted=render(<TradeChartDownload view={m} svgRef={r} ready/>);await begin();const next=structuredClone(m);next.selection.comparisonPeriod='monthly';next.latestMonth.current=999;next.trailingYear.current=888;next.partners=[];
 window.history.replaceState(null,'','/?metric=share&search=coffee#chart-data-heading');mounted.rerender(<TradeChartDownload view={next} svgRef={r} ready/>);mounted.rerender(<TradeChartDownload view={structuredClone(next)} svgRef={r} ready/>);await resolveJob(job);expect(downloads).toHaveLength(1);
});
it('keeps work for a nominal window change with identical actual history but suppresses changed history',async()=>{
 const m=view(),r=ref(),job=deferred<Blob>();vi.mocked(exportChartPng).mockReturnValueOnce(job.promise);const mounted=render(<TradeChartDownload view={m} svgRef={r} ready/>);await begin();const next=structuredClone(m);next.selection.months=60;mounted.rerender(<TradeChartDownload view={next} svgRef={r} ready/>);await resolveJob(job);expect(downloads).toHaveLength(1);
 const second=deferred<Blob>();vi.mocked(exportChartPng).mockReturnValueOnce(second.promise);await begin();mounted.rerender(<TradeChartDownload view={buildProfileView(sampleRelease(),{direction:'imports',months:60,countryCodes:['1220']})} svgRef={r} ready/>);await resolveJob(second);expect(downloads).toHaveLength(1);
});
it.each([null,{},new Blob([],{type:'image/png'}),new Blob(['x'],{type:'text/plain'})])('shows a current error for invalid output and supports retry',async invalid=>{
 vi.mocked(exportChartPng).mockResolvedValueOnce(invalid as Blob);render(<TradeChartDownload view={view()} svgRef={ref()} ready/>);await begin();expect(downloads).toHaveLength(0);expect(screen.getByRole('alert')).toHaveTextContent('PNG export failed. You can still download the displayed data as CSV.');await begin();expect(downloads).toHaveLength(1);expect(screen.queryByRole('alert')).toBeNull();
});
it('keeps a current error through unrelated changes and clears it for a new export context',async()=>{
 vi.mocked(exportChartPng).mockRejectedValueOnce(new Error('failed'));const m=view(),r=ref(),mounted=render(<TradeChartDownload view={m} svgRef={r} ready/>);await begin();expect(screen.getByRole('alert')).toBeVisible();const same=structuredClone(m);same.selection.comparisonPeriod='monthly';mounted.rerender(<TradeChartDownload view={same} svgRef={r} ready/>);expect(screen.getByRole('alert')).toBeVisible();const next=structuredClone(same);next.series[0].name+=' other';mounted.rerender(<TradeChartDownload view={next} svgRef={r} ready/>);expect(screen.queryByRole('alert')).toBeNull();
});
it('reports a missing SVG while keeping the current CSV available',async()=>{
 const m=view();render(<TradeChartDownload view={m} svgRef={{current:null}} ready/>);await begin();expect(exportChartPng).not.toHaveBeenCalled();expect(screen.getByRole('alert')).toBeVisible();await userEvent.click(screen.getByRole('button',{name:'Download data CSV'}));expect(downloads.map(d=>d.name)).toEqual(['hs-090121-imports.csv']);expect(downloads[0].blob.size).toBe(new Blob([serializeCsv(m)]).size);
});
it('downloads the current CSV while an obsolete PNG conversion is still settling',async()=>{
 const m=view(),r=ref(),job=deferred<Blob>();vi.mocked(exportChartPng).mockReturnValueOnce(job.promise);const mounted=render(<TradeChartDownload view={m} svgRef={r} ready/>);await begin();const next=structuredClone(m);next.selection.direction='exports';mounted.rerender(<TradeChartDownload view={next} svgRef={r} ready/>);await userEvent.click(screen.getByRole('button',{name:'Download data CSV'}));expect(downloads.map(d=>d.name)).toEqual(['hs-090121-exports.csv']);await resolveJob(job);expect(downloads).toHaveLength(1);
});
it('keeps keyboard focus while marking a busy PNG action unavailable',async()=>{
 const job=deferred<Blob>();vi.mocked(exportChartPng).mockReturnValueOnce(job.promise);render(<TradeChartDownload view={view()} svgRef={ref()} ready/>);const button=screen.getByRole('button',{name:'Download chart PNG'});button.focus();await userEvent.keyboard('{Enter}');expect(button).toHaveFocus();expect(button).toHaveAttribute('aria-disabled','true');expect(button).not.toBeDisabled();await userEvent.keyboard('{Enter}');expect(exportChartPng).toHaveBeenCalledTimes(1);await resolveJob(job);expect(button).toHaveFocus();expect(button).not.toHaveAttribute('aria-disabled','true');
});

it('uses the latest recorded point flag for CSV while an earlier PNG is pending',async()=>{
 const m=view(),r=ref(),job=deferred<Blob>();vi.mocked(exportChartPng).mockReturnValueOnce(job.promise);
 const mounted=render(<TradeChartDownload view={m} svgRef={r} ready/>);await begin();
 const next=structuredClone(m);next.series[0].points[0].recordedRevision=true;mounted.rerender(<TradeChartDownload view={next} svgRef={r} ready/>);
 await userEvent.click(screen.getByRole('button',{name:'Download data CSV'}));
 const text=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsText(downloads[0].blob);});
 expect(text.split('\r\n')[0]).toContain('revised_scope,observation_recorded_revision');expect(text.split('\r\n')[1]).toMatch(/,merchandise_release,true$/);
 await resolveJob(job);expect(downloads).toHaveLength(1);
});
