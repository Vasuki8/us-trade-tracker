// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderToStaticMarkup} from 'react-dom/server';
import '@testing-library/jest-dom/vitest';
import {DutyChartDownload} from '../../src/components/DutyChartDownload';
import {EstimatedDuties} from '../../src/components/EstimatedDuties';
import {ProductExplorer} from '../../src/components/ProductExplorer';
import {buildDutyHistoryChart} from '../../src/lib/trade/duty-history';
import {buildDutyView} from '../../src/lib/trade/duties';
import {exportChartPng} from '../../src/lib/trade/downloads';
import {sampleDutyRelease} from '../helpers/duties';
vi.mock('../../src/lib/trade/downloads',async original=>({...await original<typeof import('../../src/lib/trade/downloads')>(),exportChartPng:vi.fn()}));
const model=(metric:'dollars'|'share'='dollars')=>{const r=sampleDutyRelease();return buildDutyHistoryChart(buildDutyView(r,[]),r.classificationIntervals,metric);};
const png=()=>new Blob(['png conversion result'],{type:'image/png'});
const downloads:{name:string;blob:Blob}[]=[],blobs=new Map<string,Blob>();let serial=0;
const originalBBox=Object.getOwnPropertyDescriptor(SVGElement.prototype,'getBBox'),originalLength=Object.getOwnPropertyDescriptor(SVGElement.prototype,'getComputedTextLength');
beforeEach(()=>{
 // jsdom has no font geometry/canvas; only these browser boundaries are doubled.
 Object.defineProperty(SVGElement.prototype,'getComputedTextLength',{configurable:true,value:function(this:SVGElement){return (this.textContent?.length??0)*Number(this.getAttribute('font-size')??11)*0.48;}});
 Object.defineProperty(SVGElement.prototype,'getBBox',{configurable:true,value:function(this:SVGElement){const font=Number(this.getAttribute('font-size')??11),width=(this.textContent?.length??0)*font*0.48,x=Number(this.getAttribute('x')??0),y=Number(this.getAttribute('y')??0);return {x:x-(this.getAttribute('text-anchor')==='end'?width:0),y:y-(font===10.5?11:font*0.8),width,height:font===10.5?14:font};}});
 vi.stubGlobal('URL',Object.assign(class extends URL{},{createObjectURL:(blob:Blob)=>{const key='blob:duty-'+(++serial);blobs.set(key,blob);return key;},revokeObjectURL:()=>{}}));
 vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(function(this:HTMLAnchorElement){downloads.push({name:this.download,blob:blobs.get(this.href)!});});
 vi.mocked(exportChartPng).mockResolvedValue(png());
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();vi.mocked(exportChartPng).mockReset();downloads.length=0;blobs.clear();if(originalBBox)Object.defineProperty(SVGElement.prototype,'getBBox',originalBBox);else delete (SVGElement.prototype as unknown as Record<string,unknown>).getBBox;if(originalLength)Object.defineProperty(SVGElement.prototype,'getComputedTextLength',originalLength);else delete (SVGElement.prototype as unknown as Record<string,unknown>).getComputedTextLength;});
it('keeps both PNG controls disabled in initial server HTML',()=>{
 for(const metric of ['dollars','share'] as const){const doc=new DOMParser().parseFromString(renderToStaticMarkup(<DutyChartDownload model={model(metric)}/>),'text/html');expect(doc.querySelector('button')?.hasAttribute('disabled')).toBe(true);}
});
it.each(['dollars','share'] as const)('downloads a sourced %s image with the matching literal filename',async metric=>{
 const m=model(metric);render(<DutyChartDownload model={m}/>);const name=metric==='dollars'?'Download duty amounts chart PNG':'Download duty share chart PNG';
 const b=screen.getByRole('button',{name});b.focus();await userEvent.keyboard('{Enter}');
 expect(downloads).toHaveLength(1);expect(downloads[0].name).toBe(`hs-090121-imports-estimated-duties-monthly-${metric}.png`);expect(downloads[0].blob.type).toBe('image/png');
 const svg=vi.mocked(exportChartPng).mock.calls[0][0];expect(svg).toHaveAttribute('viewBox','0 0 960 540');expect(svg.querySelectorAll('circle')).toHaveLength(24);
 for(const text of ['HS 090121','COFFEE, ROASTED, NOT DECAFFEINATED','2024-01','2025-12','CAL_DUT_MO','CON_VAL_MO','RP70/79','SYNTHETIC DEVELOPMENT DATA','2026-01-01T00:00:00.000Z','synthetic','https://us-trade-tracker.pages.dev/methods/'])expect(svg.textContent).toContain(text);
 expect(svg.textContent).toMatch(/antidumping.*countervailing/);expect(svg.querySelector('image,foreignObject,style')).toBeNull();expect(screen.queryByRole('alert')).toBeNull();
});
it('prevents duplicate conversion and preserves an identical rerender snapshot',async()=>{
 let finish!:(b:Blob)=>void;vi.mocked(exportChartPng).mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));
 const m=model(),page=render(<DutyChartDownload model={m}/>);await userEvent.click(screen.getByRole('button',{name:'Download duty amounts chart PNG'}));
 fireEvent.click(screen.getByRole('button',{name:'Creating image…'}));expect(exportChartPng).toHaveBeenCalledTimes(1);
 page.rerender(<DutyChartDownload model={structuredClone(m)}/>);await act(async()=>finish(png()));expect(downloads.map(d=>d.name)).toEqual(['hs-090121-imports-estimated-duties-monthly-dollars.png']);
});
it.each(['success','failure'] as const)('discards a stale %s after changing away and back to the original chart',async outcome=>{
 let finish!:(b:Blob)=>void,fail!:(e:Error)=>void;vi.mocked(exportChartPng).mockImplementation(()=>new Promise((resolve,reject)=>{finish=resolve;fail=reject;}));
 const m=model(),page=render(<DutyChartDownload model={m}/>);await userEvent.click(screen.getByRole('button',{name:'Download duty amounts chart PNG'}));
 const other=structuredClone(m);other.series[0].code='1220';other.series[0].name='CANADA';page.rerender(<DutyChartDownload model={other}/>);page.rerender(<DutyChartDownload model={structuredClone(m)}/>);
 await act(async()=>{if(outcome==='success')finish(png());else fail(new Error('private diagnostic'));});expect(downloads).toHaveLength(0);expect(screen.queryByRole('alert')).toBeNull();
 expect(screen.getByRole('button',{name:'Download duty amounts chart PNG'})).toBeEnabled();
});
it('does not deliver an image after the chart unmounts',async()=>{
 let finish!:(b:Blob)=>void;vi.mocked(exportChartPng).mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));const page=render(<DutyChartDownload model={model()}/>);
 await userEvent.click(screen.getByRole('button',{name:'Download duty amounts chart PNG'}));page.unmount();await act(async()=>finish(png()));expect(downloads).toHaveLength(0);
});
it.each(['reject','empty','wrong-type'] as const)('leaves the real CSV usable after a %s image failure',async kind=>{
 if(kind==='reject')vi.mocked(exportChartPng).mockRejectedValue(new Error('private converter error'));else vi.mocked(exportChartPng).mockResolvedValue(kind==='empty'?new Blob([],{type:'image/png'}):new Blob(['jpeg'],{type:'image/jpeg'}));
 const r=sampleDutyRelease();render(<EstimatedDuties view={buildDutyView(r,[])} classificationIntervals={r.classificationIntervals}/>);
 await userEvent.click(screen.getByRole('button',{name:'Download duty amounts chart PNG'}));expect(screen.getByRole('alert')).toHaveTextContent('PNG export failed. You can still download the estimated duties CSV.');expect(screen.queryByText(/private converter/)).toBeNull();
 await userEvent.click(screen.getByRole('button',{name:'Download estimated duties CSV'}));expect(downloads.map(d=>d.name)).toEqual(['hs-090121-imports-estimated-duties.csv']);
});
it('rejects an export whose complete metadata cannot fit and clears its error for a new model',async()=>{
 const m=model();m.title='W'.repeat(2000);const page=render(<DutyChartDownload model={m}/>);await userEvent.click(screen.getByRole('button',{name:'Download duty amounts chart PNG'}));
 expect(screen.getByRole('alert')).toBeVisible();expect(downloads).toHaveLength(0);expect(exportChartPng).not.toHaveBeenCalled();page.rerender(<DutyChartDownload model={model()}/>);expect(screen.queryByRole('alert')).toBeNull();
 await userEvent.click(screen.getByRole('button',{name:'Download duty amounts chart PNG'}));expect(downloads).toHaveLength(1);
});
it('disables an all-unavailable chart but allows a fully reported zero chart',()=>{
 const m=model();m.series.forEach(s=>s.points.forEach(p=>p.value=null));const page=render(<DutyChartDownload model={m}/>);expect(screen.getByRole('button',{name:'Download duty amounts chart PNG'})).toBeDisabled();
 const zero=model();zero.series.forEach(s=>s.points.forEach(p=>p.value=0));page.rerender(<DutyChartDownload model={zero}/>);expect(screen.getByRole('button',{name:'Download duty amounts chart PNG'})).toBeEnabled();
});

it('preserves an in-flight image across a merchandise-only history change',async()=>{
 let finish!:(b:Blob)=>void;vi.mocked(exportChartPng).mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));
 render(<ProductExplorer release={sampleDutyRelease()}/>);const user=userEvent.setup();await user.click(screen.getByRole('button',{name:'Download duty amounts chart PNG'}));
 await user.selectOptions(screen.getByLabelText('History window'),'12');await act(async()=>finish(png()));expect(downloads.map(d=>d.name)).toEqual(['hs-090121-imports-estimated-duties-monthly-dollars.png']);
});

it('fits three country legend rows with the browser measured fourteen-pixel glyph height',async()=>{
 const m=model();m.series=[['2010','MEXICO'],['1220','CANADA'],['4759','ITALY']].map(([code,name])=>({...structuredClone(m.series[0]),code,name,points:m.series[0].points.map(p=>({...p,value:0,consumptionValueUsd:1}))}));
 render(<DutyChartDownload model={m}/>);await userEvent.click(screen.getByRole('button',{name:'Download duty amounts chart PNG'}));expect(downloads.map(d=>d.name)).toEqual(['hs-090121-imports-estimated-duties-monthly-dollars.png']);expect(screen.queryByRole('alert')).toBeNull();
});
