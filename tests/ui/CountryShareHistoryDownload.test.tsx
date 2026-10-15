// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderToStaticMarkup} from 'react-dom/server';
import '@testing-library/jest-dom/vitest';
import {CountryShareHistoryDownload} from '../../src/components/CountryShareHistoryDownload';
import {ProductExplorer} from '../../src/components/ProductExplorer';
import {buildProfileView} from '../../src/lib/trade/profile';
import {buildCountryShareHistory} from '../../src/lib/trade/country-share-history';
import {exportChartPng} from '../../src/lib/trade/downloads';
import {sampleRelease} from '../helpers/release';
vi.mock('../../src/lib/trade/downloads',async original=>({...await original<typeof import('../../src/lib/trade/downloads')>(),exportChartPng:vi.fn()}));
const model=()=>{const r=sampleRelease();return buildCountryShareHistory(r,buildProfileView(r,{direction:'imports',months:12,countryCodes:['1220','2010','4759']}));};
const png=()=>new Blob(['png conversion result'],{type:'image/png'});
const downloads:{name:string;blob:Blob}[]=[],blobs=new Map<string,Blob>();let serial=0;
const originalBBox=Object.getOwnPropertyDescriptor(SVGElement.prototype,'getBBox'),originalLength=Object.getOwnPropertyDescriptor(SVGElement.prototype,'getComputedTextLength');
beforeEach(()=>{
 Object.defineProperty(SVGElement.prototype,'getComputedTextLength',{configurable:true,value:function(this:SVGElement){return (this.textContent?.length??0)*Number(this.getAttribute('font-size')??11)*0.48;}});
 Object.defineProperty(SVGElement.prototype,'getBBox',{configurable:true,value:function(this:SVGElement){const font=Number(this.getAttribute('font-size')??11),width=(this.textContent?.length??0)*font*0.48,x=Number(this.getAttribute('x')??0),y=Number(this.getAttribute('y')??0);return {x:x-(this.getAttribute('text-anchor')==='end'?width:0),y:y-(font===10.5?11:font*0.8),width,height:font===10.5?14:font};}});
 vi.stubGlobal('URL',Object.assign(class extends URL{},{createObjectURL:(blob:Blob)=>{const key='blob:share-'+(++serial);blobs.set(key,blob);return key;},revokeObjectURL:()=>{}}));
 vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(function(this:HTMLAnchorElement){downloads.push({name:this.download,blob:blobs.get(this.href)!});});vi.mocked(exportChartPng).mockResolvedValue(png());window.history.replaceState({},'','/');
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();vi.mocked(exportChartPng).mockReset();downloads.length=0;blobs.clear();if(originalBBox)Object.defineProperty(SVGElement.prototype,'getBBox',originalBBox);else delete (SVGElement.prototype as unknown as Record<string,unknown>).getBBox;if(originalLength)Object.defineProperty(SVGElement.prototype,'getComputedTextLength',originalLength);else delete (SVGElement.prototype as unknown as Record<string,unknown>).getComputedTextLength;});
const button=()=>screen.getByRole('button',{name:'Download country share chart PNG'});
it('keeps both controls disabled and omits export SVG from initial server markup',()=>{
 const doc=new DOMParser().parseFromString(renderToStaticMarkup(<CountryShareHistoryDownload view={model()}/>),'text/html');expect([...doc.querySelectorAll('button')].every(b=>b.disabled)).toBe(true);expect(doc.querySelector('svg')).toBeNull();
});
it('downloads the first enabled keyboard activation with complete sourced metadata and literal filenames',async()=>{
 render(<CountryShareHistoryDownload view={model()}/>);button().focus();await userEvent.keyboard('{Enter}');expect(downloads.map(d=>d.name)).toEqual(['hs-090121-imports-country-share-history.png']);const svg=vi.mocked(exportChartPng).mock.calls[0][0];expect(svg.querySelectorAll('circle')).toHaveLength(36);expect(svg).toHaveAttribute('viewBox','0 0 960 540');
 for(const value of ['Country share of U.S. imports','090121','2025-01','2025-12','1220','2010','4759','GEN_VAL_MO','100','U.S. total','SYNTHETIC DEVELOPMENT DATA','Sources and methods','Retrieved UTC','Processing version','revisions'])expect(svg.textContent).toContain(value);
 expect(svg.querySelector('image,foreignObject,style')).toBeNull();await userEvent.click(screen.getByRole('button',{name:'Download country share data CSV'}));expect(downloads[1].name).toBe('hs-090121-imports-country-share-history.csv');expect(downloads[1].blob.type).toContain('text/csv');
});
it('disables no-selection exports and permits CSV but no PNG for all-null data, while zero shares permit PNG',()=>{
 const m=model(),page=render(<CountryShareHistoryDownload view={{...m,series:[]}}/>);expect(button()).toBeDisabled();expect(screen.getByRole('button',{name:/data CSV/})).toBeDisabled();expect(page.container.querySelector('svg')).toBeNull();m.series.forEach(s=>s.points.forEach(p=>p.sharePercent=null));page.rerender(<CountryShareHistoryDownload view={m}/>);expect(button()).toBeDisabled();expect(screen.getByRole('button',{name:/data CSV/})).toBeEnabled();m.series.forEach(s=>s.points.forEach(p=>p.sharePercent=0));page.rerender(<CountryShareHistoryDownload view={structuredClone(m)}/>);expect(button()).toBeEnabled();
});
it('prevents duplicates and retains a valid snapshot across identical rerenders',async()=>{
 let finish!:(b:Blob)=>void;vi.mocked(exportChartPng).mockImplementation(()=>new Promise(r=>{finish=r;}));const m=model(),page=render(<CountryShareHistoryDownload view={m}/>);await userEvent.click(button());fireEvent.click(screen.getByRole('button',{name:'Creating image…'}));page.rerender(<CountryShareHistoryDownload view={structuredClone(m)}/>);await act(async()=>finish(png()));expect(downloads.map(d=>d.name)).toEqual(['hs-090121-imports-country-share-history.png']);
});
it.each(['selection','window','direction','release','ABA','unmount'] as const)('discards stale success after %s changes',async kind=>{
 let finish!:(b:Blob)=>void;vi.mocked(exportChartPng).mockImplementation(()=>new Promise(r=>{finish=r;}));const m=model(),page=render(<CountryShareHistoryDownload view={m}/>);await userEvent.click(button());const other=structuredClone(m);
 if(kind==='selection')other.series.reverse();if(kind==='window')other.series.forEach(s=>s.points.shift());if(kind==='direction')other.direction='exports';if(kind==='release')other.provenance.codeVersion='replacement';if(kind==='ABA')other.series=[];
 if(kind==='unmount')page.unmount();else{page.rerender(<CountryShareHistoryDownload view={other}/>);if(kind==='ABA')page.rerender(<CountryShareHistoryDownload view={structuredClone(m)}/>);}
 await act(async()=>finish(png()));expect(downloads).toHaveLength(0);expect(screen.queryByRole('alert')).toBeNull();
});
it('discards a stale failure after changing away and back',async()=>{
 let fail!:(e:Error)=>void;vi.mocked(exportChartPng).mockImplementation(()=>new Promise((_,r)=>{fail=r;}));const m=model(),page=render(<CountryShareHistoryDownload view={m}/>);await userEvent.click(button());page.rerender(<CountryShareHistoryDownload view={{...m,series:[]}}/>);page.rerender(<CountryShareHistoryDownload view={structuredClone(m)}/>);await act(async()=>fail(new Error('private diagnostic')));expect(screen.queryByRole('alert')).toBeNull();expect(button()).toBeEnabled();
});
it.each(['reject','empty','wrong-type'] as const)('shows a scoped %s error with current CSV fallback and allows PNG retry',async kind=>{
 if(kind==='reject')vi.mocked(exportChartPng).mockRejectedValue(new Error('private error'));else vi.mocked(exportChartPng).mockResolvedValue(kind==='empty'?new Blob([],{type:'image/png'}):new Blob(['jpeg'],{type:'image/jpeg'}));
 render(<CountryShareHistoryDownload view={model()}/>);await userEvent.click(button());expect(screen.getByRole('alert')).toHaveTextContent('PNG export failed. You can still download the country share data CSV.');await userEvent.click(screen.getByRole('button',{name:/data CSV/}));expect(downloads[0].name).toBe('hs-090121-imports-country-share-history.csv');vi.mocked(exportChartPng).mockResolvedValue(png());await userEvent.click(button());expect(downloads[1].name).toContain('.png');expect(screen.queryByRole('alert')).toBeNull();
});
it('wraps full long metadata and refuses unsafe overflow with CSV fallback',async()=>{
 const m=model();m.series[0].name='A long country name with islands and territories';m.provenance.codeVersion='reviewed-processing-version-1234567890';const page=render(<CountryShareHistoryDownload view={m}/>);await userEvent.click(button());expect(downloads).toHaveLength(1);m.title='W'.repeat(2000);page.rerender(<CountryShareHistoryDownload view={structuredClone(m)}/>);await userEvent.click(button());expect(screen.getByRole('alert')).toBeVisible();await userEvent.click(screen.getByRole('button',{name:/data CSV/}));expect(downloads.at(-1)?.name).toContain('.csv');
});
it('preserves in-flight share export across picker search, summary-period and hash-only changes',async()=>{
 let finish!:(b:Blob)=>void;vi.mocked(exportChartPng).mockImplementation(()=>new Promise(r=>{finish=r;}));window.history.replaceState({},'','/?direction=imports&months=12&countries=1220');render(<ProductExplorer release={sampleRelease()}/>);await userEvent.click(button());await userEvent.type(screen.getByRole('searchbox',{name:'Find a country'}),'Mex');await userEvent.selectOptions(screen.getByLabelText('Country comparison period'),'monthly');window.history.replaceState({},'','/?direction=imports&months=12&countries=1220&comparison=monthly#country-share-history-heading');await act(async()=>window.dispatchEvent(new HashChangeEvent('hashchange')));await act(async()=>finish(png()));expect(downloads.map(d=>d.name)).toEqual(['hs-090121-imports-country-share-history.png']);
});
