// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderToStaticMarkup} from 'react-dom/server';
import '@testing-library/jest-dom/vitest';
import {CountryChartDownload} from '../../src/components/CountryChartDownload';
import {CountryPreviewChart} from '../../src/components/CountryPreviewChart';
import {CanadaPreview} from '../../src/components/CanadaPreview';
import {makeCountryPreviewFixture} from '../helpers/country-preview-data';
import {exportChartPng,downloadBlob} from '../../src/lib/trade/downloads';
vi.mock('../../src/lib/trade/downloads',async original=>({...await original<typeof import('../../src/lib/trade/downloads')>(),exportChartPng:vi.fn(),downloadBlob:vi.fn()}));
const sample={kind:'pilot-fixture' as const};
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.mocked(exportChartPng).mockReset();vi.mocked(downloadBlob).mockReset();window.history.replaceState(null,'','/');});
it('reuses screen plot paths and gaps in a self-contained hidden-parent export',()=>{
 const data=makeCountryPreviewFixture();data.directions.imports.monthly[5].valueUsd=null;data.processingVersion='W'.repeat(140);
 const {container}=render(<><CountryPreviewChart view={data.directions.imports} source="fixture"/><CountryChartDownload data={data} direction="imports" presentation={sample} ready/></>);
 const svg=container.querySelector<SVGSVGElement>('svg[data-country-export]')!;
 expect(svg).toHaveAttribute('viewBox','0 0 960 540');expect(svg).not.toHaveAttribute('hidden');expect(svg.style.display).not.toBe('none');expect(svg.parentElement).toHaveAttribute('hidden');
 expect(svg.querySelector('path')?.getAttribute('d')).toBe(container.querySelector('.country-chart-desktop path')?.getAttribute('d'));
 expect(svg.querySelectorAll('circle')).toHaveLength(23);expect(svg.querySelector('path')?.getAttribute('d')?.match(/M/g)).toHaveLength(2);
 const text=svg.textContent!;expect(text).toContain('SYNTHETIC DEVELOPMENT DATA');expect(text).toContain('Capture times describe saved files, not observation revision dates.');expect(text).toContain('UTC');expect(text).toContain('GEN_VAL_MO');
 const footer=Array.from(svg.querySelectorAll('[data-export-footer] text'));expect(footer.length).toBeGreaterThan(7);
 for(const row of footer){expect(row.textContent!.length).toBeLessThanOrEqual(70);expect(Number(row.getAttribute('y'))).toBeLessThan(540);}
 expect(svg.querySelector('foreignObject,image,style')).toBeNull();
});
it('does not enable PNG before readiness',()=>{
 render(<CountryChartDownload data={makeCountryPreviewFixture()} direction="imports" presentation={sample} ready={false}/>);
 expect(screen.getByRole('button',{name:'Download chart PNG'})).toBeDisabled();
});
it('exports one image with a captured direction and matching filename during a direction change',async()=>{
 const user=userEvent.setup(),data=makeCountryPreviewFixture();let finish!:(b:Blob)=>void;
 vi.mocked(exportChartPng).mockImplementation(()=>new Promise<Blob>(resolve=>{finish=resolve;}));
 const page=render(<CountryChartDownload data={data} direction="imports" presentation={sample} ready/>);
 await user.click(screen.getByRole('button',{name:'Download chart PNG'}));expect(screen.getByRole('button',{name:'Creating image…'})).toBeDisabled();
 fireEvent.click(screen.getByRole('button',{name:'Creating image…'}));expect(exportChartPng).toHaveBeenCalledTimes(1);
 page.rerender(<CountryChartDownload data={data} direction="exports" presentation={sample} ready/>);
 const png=new Blob(['image'],{type:'image/png'});await act(async()=>finish(png));
 expect(downloadBlob).toHaveBeenCalledWith(png,'canada-1220-imports-2024-09-2026-08-pilot-fixture-chart.png');
 expect(screen.getByRole('button',{name:'Download chart PNG'})).toBeEnabled();expect(screen.queryByRole('alert')).toBeNull();
});
it('ignores an old-direction conversion failure and allows a later export',async()=>{
 const user=userEvent.setup(),data=makeCountryPreviewFixture();let fail!:(e:Error)=>void;
 vi.mocked(exportChartPng).mockImplementationOnce(()=>new Promise<Blob>((_,reject)=>{fail=reject;}));
 const page=render(<CountryChartDownload data={data} direction="imports" presentation={sample} ready/>);
 await user.click(screen.getByRole('button',{name:'Download chart PNG'}));page.rerender(<CountryChartDownload data={data} direction="exports" presentation={sample} ready/>);
 await act(async()=>fail(new Error('old request')));
 expect(screen.queryByRole('alert')).toBeNull();
 vi.mocked(exportChartPng).mockResolvedValueOnce(new Blob(['export'],{type:'image/png'}));
 await user.click(screen.getByRole('button',{name:'Download chart PNG'}));expect(downloadBlob).toHaveBeenLastCalledWith(expect.any(Blob),'canada-1220-exports-2024-09-2026-08-pilot-fixture-chart.png');
});
it.each(['reject','null','empty'] as const)('keeps CSV available after %s PNG conversion',async(kind)=>{
 const user=userEvent.setup();
 if(kind==='reject')vi.mocked(exportChartPng).mockRejectedValueOnce(new Error('canvas private diagnostic'));
 else vi.mocked(exportChartPng).mockResolvedValueOnce(kind==='null'?null as never:new Blob([]));
 render(<CanadaPreview data={makeCountryPreviewFixture()} presentation={sample} enableSharing/>);
 await user.click(screen.getByRole('button',{name:'Download chart PNG'}));
 expect(screen.getByRole('alert')).toHaveTextContent('PNG export failed. You can still download the monthly data as CSV.');
 expect(screen.queryByText(/canvas private diagnostic/)).toBeNull();expect(screen.getByRole('button',{name:'Download monthly CSV'})).toBeEnabled();
 await user.click(screen.getByRole('button',{name:'Download monthly CSV'}));expect(downloadBlob).toHaveBeenLastCalledWith(expect.any(Blob),'canada-1220-imports-2024-09-2026-08-pilot-fixture-monthly.csv');
});
it('has no PNG or saved-link controls in a private preview and retains its static explanation',()=>{
 render(<CanadaPreview data={makeCountryPreviewFixture()}/>);
 expect(screen.queryByRole('button',{name:'Download chart PNG'})).toBeNull();expect(screen.queryByRole('button',{name:'Copy view link'})).toBeNull();
 expect(renderToStaticMarkup(<CanadaPreview data={makeCountryPreviewFixture()}/>)).toContain('Imports are shown below. Direction switching and CSV downloads require JavaScript.');
});
it('does not download after the owning component unmounts',async()=>{
 let finish!:(b:Blob)=>void;vi.mocked(exportChartPng).mockImplementation(()=>new Promise<Blob>(resolve=>{finish=resolve;}));
 const page=render(<CountryChartDownload data={makeCountryPreviewFixture()} direction="imports" presentation={sample} ready/>);
 await userEvent.click(screen.getByRole('button',{name:'Download chart PNG'}));page.unmount();await act(async()=>finish(new Blob(['image'])));
 expect(downloadBlob).not.toHaveBeenCalled();
});

it('ignores a conversion failure even after leaving and returning to its original direction',async()=>{
 const user=userEvent.setup(),data=makeCountryPreviewFixture();let fail!:(e:Error)=>void;
 vi.mocked(exportChartPng).mockImplementationOnce(()=>new Promise<Blob>((_,reject)=>{fail=reject;}));
 const page=render(<CountryChartDownload data={data} direction="imports" presentation={sample} ready/>);
 await user.click(screen.getByRole('button',{name:'Download chart PNG'}));
 page.rerender(<CountryChartDownload data={data} direction="exports" presentation={sample} ready/>);
 page.rerender(<CountryChartDownload data={data} direction="imports" presentation={sample} ready/>);
 await act(async()=>fail(new Error('stale first Imports view')));
 expect(screen.queryByRole('alert')).toBeNull();
});