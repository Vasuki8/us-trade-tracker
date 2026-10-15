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
