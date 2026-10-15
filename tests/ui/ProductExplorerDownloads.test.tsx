// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {ProductExplorer} from '../../src/components/ProductExplorer';
import {sampleRelease} from '../helpers/release';
import {exportChartPng} from '../../src/lib/trade/downloads';
vi.mock('../../src/lib/trade/downloads',async importOriginal=>({...await importOriginal<typeof import('../../src/lib/trade/downloads')>(),exportChartPng:vi.fn()}));
const downloads:{name:string;blob:Blob}[]=[],blobs=new Map<string,Blob>();let serial=0;
const png=()=>new Blob(['valid png'],{type:'image/png'});
const deferred=<T,>()=>{let resolve!:(value:T)=>void,reject!:(reason:unknown)=>void;const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
beforeEach(()=>{
 window.history.replaceState(null,'','/products/090121/');
 vi.stubGlobal('URL',Object.assign(class extends URL{},{createObjectURL:(blob:Blob)=>{const key='blob:merch-'+(++serial);blobs.set(key,blob);return key;},revokeObjectURL:()=>{}}));
 vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(function(this:HTMLAnchorElement){downloads.push({name:this.download,blob:blobs.get(this.href)!});});
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();vi.mocked(exportChartPng).mockReset();downloads.length=0;blobs.clear();window.history.replaceState(null,'','/');});
it('suppresses a failed merchandise conversion after changing direction',async()=>{
 const job=deferred<Blob>();vi.mocked(exportChartPng).mockReturnValueOnce(job.promise);
 render(<ProductExplorer release={sampleRelease()}/>);const user=userEvent.setup();
 await user.click(screen.getByRole('button',{name:'Download chart PNG'}));
 await user.click(screen.getByRole('radio',{name:'Exports'}));
 await act(async()=>{job.reject(new Error('conversion failed'));await job.promise.catch(()=>{});});
 expect(screen.queryByRole('alert')).toBeNull();expect(downloads).toHaveLength(0);
});
it('suppresses a successful merchandise conversion after changing direction',async()=>{
 const job=deferred<Blob>();vi.mocked(exportChartPng).mockReturnValueOnce(job.promise);
 render(<ProductExplorer release={sampleRelease()}/>);const user=userEvent.setup();
 await user.click(screen.getByRole('button',{name:'Download chart PNG'}));
 await user.click(screen.getByRole('radio',{name:'Exports'}));
 await act(async()=>{job.resolve(png());await job.promise;});
 expect(downloads).toHaveLength(0);expect(screen.queryByRole('alert')).toBeNull();
 expect(screen.getByRole('button',{name:'Download chart PNG'})).toBeEnabled();
});

it('binds the first enabled downloads to restored exports, history and ordered countries',async()=>{
 window.history.replaceState(null,'','/products/090121/?direction=exports&months=12&countries=4759%2C1220%2C2010&comparison=monthly');vi.mocked(exportChartPng).mockResolvedValue(png());
 render(<ProductExplorer release={sampleRelease()}/>);await userEvent.click(screen.getByRole('button',{name:'Download chart PNG'}));
 expect(downloads[0].name).toBe('hs-090121-exports.png');const svg=vi.mocked(exportChartPng).mock.calls[0][0];expect(svg.textContent).toContain('U.S. exports');expect(svg.querySelectorAll('circle')).toHaveLength(36);
 await userEvent.click(screen.getByRole('button',{name:'Download data CSV'}));expect(downloads[1].name).toBe('hs-090121-exports.csv');expect(screen.getByRole('table',{name:'Selected country monthly comparison'})).toBeVisible();
});
it('keeps valid pending work and current errors when only the comparison period changes',async()=>{
 const job=deferred<Blob>();vi.mocked(exportChartPng).mockReturnValueOnce(job.promise);render(<ProductExplorer release={sampleRelease()}/>);const user=userEvent.setup();await user.click(screen.getByRole('checkbox',{name:'CANADA'}));await user.click(screen.getByRole('button',{name:'Download chart PNG'}));await user.selectOptions(screen.getByLabelText('Country comparison period'),'monthly');await act(async()=>{job.resolve(png());await job.promise;});expect(downloads).toHaveLength(1);
 vi.mocked(exportChartPng).mockRejectedValueOnce(new Error('current failure'));await user.click(screen.getByRole('button',{name:'Download chart PNG'}));expect(screen.getByRole('alert')).toBeVisible();await user.selectOptions(screen.getByLabelText('Country comparison period'),'annual');expect(screen.getByRole('alert')).toBeVisible();await user.click(screen.getByRole('radio',{name:'Exports'}));expect(screen.queryByRole('alert')).toBeNull();
});
it('keeps CSV and sibling share/duty downloads independent while merchandise PNG is pending',async()=>{
 const {sampleDutyRelease}=await import('../helpers/duties'),job=deferred<Blob>(),release=sampleDutyRelease();
 release.duties.observations.push(...release.duties.observations.map(row=>{const country=structuredClone(row);country.geography='country';country.partnerCode='1220';country.partnerName='CANADA';for(const field of ['calculatedDuty','consumptionValue','dutiableValue'] as const)country[field].valueUsd=Math.floor(country[field].valueUsd!/10);return country;}));
 vi.mocked(exportChartPng).mockReturnValueOnce(job.promise);render(<ProductExplorer release={release}/>);const user=userEvent.setup();await user.click(screen.getByRole('checkbox',{name:'CANADA'}));await user.click(screen.getByRole('button',{name:'Download chart PNG'}));
 for(const name of ['Download data CSV','Download country share chart PNG','Download country share data CSV','Download duty amounts chart PNG','Download duty share chart PNG','Download estimated duties CSV'])expect(screen.getByRole('button',{name})).toBeEnabled();
 await user.click(screen.getByRole('button',{name:'Download data CSV'}));expect(downloads[0].name).toBe('hs-090121-imports.csv');await act(async()=>{job.resolve(png());await job.promise;});expect(downloads.map(d=>d.name)).toEqual(['hs-090121-imports.csv','hs-090121-imports.png']);
});
