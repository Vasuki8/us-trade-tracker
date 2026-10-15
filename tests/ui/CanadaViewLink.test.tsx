// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderToStaticMarkup} from 'react-dom/server';
import '@testing-library/jest-dom/vitest';
import {CanadaViewLink,useCanadaViewLink} from '../../src/components/CanadaViewLink';
import {CanadaPreview} from '../../src/components/CanadaPreview';
import {makeCountryPreviewFixture} from '../helpers/country-preview-data';
afterEach(()=>{cleanup();vi.restoreAllMocks();window.history.replaceState(null,'','/');});
function Harness({enabled=true}:{enabled?:boolean}){
 const state=useCanadaViewLink(enabled);
 return <><p data-testid="direction">{state.selection.direction}</p><button disabled={!state.ready} onClick={()=>state.changeSelection({direction:state.selection.direction==='imports'?'exports':'imports'})}>Switch</button><CanadaViewLink {...state}/></>;
}
it('restores Exports without rewriting the incoming URL and pushes one edit with history state',async()=>{
 window.history.replaceState({position:3},'','/countries/1220/?direction=exports&utm_source=sample#country-history-heading');
 const push=vi.spyOn(window.history,'pushState'),replace=vi.spyOn(window.history,'replaceState');
 render(<Harness/>);expect(screen.getByTestId('direction')).toHaveTextContent('exports');expect(replace).not.toHaveBeenCalled();
 await userEvent.click(screen.getByRole('button',{name:'Switch'}));
 expect(push).toHaveBeenCalledTimes(1);expect(window.history.state).toEqual({position:3});
 expect(window.location.search+window.location.hash).toBe('?direction=imports#country-history-heading');
});
it('restores popstate and fragment changes and copies the current canonical URL',async()=>{
 const user=userEvent.setup();render(<Harness/>);const write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();
 window.history.replaceState(null,'','/countries/1220/?direction=exports');fireEvent.popState(window);
 expect(screen.getByTestId('direction')).toHaveTextContent('exports');
 window.history.replaceState(null,'','/countries/1220/?direction=exports#country-history-heading');fireEvent(window,new HashChangeEvent('hashchange'));
 await user.click(screen.getByRole('button',{name:'Copy view link'}));
 expect(write).toHaveBeenLastCalledWith(window.location.origin+'/countries/1220/?direction=exports#country-history-heading');
 expect(screen.getByText('View link copied.')).toBeVisible();
});
it('offers a selectable manual link that follows later direction edits',async()=>{
 const user=userEvent.setup();render(<Harness/>);vi.spyOn(navigator.clipboard,'writeText').mockRejectedValue(new Error('Denied'));
 await user.click(screen.getByRole('button',{name:'Copy view link'}));const field=screen.getByLabelText('View link') as HTMLInputElement;
 expect(field).toHaveValue(window.location.origin+'/countries/1220/?direction=imports');await user.click(field);
 expect(field.selectionStart).toBe(0);expect(field.selectionEnd).toBe(field.value.length);
 await user.click(screen.getByRole('button',{name:'Switch'}));expect(field).toHaveValue(window.location.origin+'/countries/1220/?direction=exports');
});
it.each(['direction','fragment'] as const)('does not announce a stale clipboard result after a %s change',async(change)=>{
 const user=userEvent.setup();let finish!:()=>void;render(<Harness/>);
 vi.spyOn(navigator.clipboard,'writeText').mockImplementation(()=>new Promise<void>(resolve=>{finish=resolve;}));
 await user.click(screen.getByRole('button',{name:'Copy view link'}));
 if(change==='direction')await user.click(screen.getByRole('button',{name:'Switch'}));
 else{window.history.replaceState(null,'','/countries/1220/#country-history-heading');fireEvent(window,new HashChangeEvent('hashchange'));}
 await act(async()=>finish());expect(screen.queryByText('View link copied.')).toBeNull();
});
it('shows a fixed invalid-selection notice and clears it after an edit',async()=>{
 window.history.replaceState(null,'','/countries/1220/?direction=secret');
 render(<Harness/>);expect(screen.getByText('This saved Canada view could not be restored. Showing Imports.')).toBeVisible();
 await userEvent.click(screen.getByRole('button',{name:'Switch'}));expect(screen.queryByText(/could not be restored/)).toBeNull();
});
it('has disabled static controls and installs/removes listeners only for opted-in use',()=>{
 const html=renderToStaticMarkup(<Harness/>);expect(html).toContain('disabled=""');
 const add=vi.spyOn(window,'addEventListener'),remove=vi.spyOn(window,'removeEventListener');
 const disabled=render(<Harness enabled={false}/>);expect(add.mock.calls.filter(([name])=>name==='popstate'||name==='hashchange')).toHaveLength(0);disabled.unmount();
 const active=render(<Harness/>);expect(add.mock.calls.filter(([name])=>name==='popstate'||name==='hashchange')).toHaveLength(2);
 active.unmount();expect(remove.mock.calls.filter(([name])=>name==='popstate'||name==='hashchange')).toHaveLength(2);
});
it('connects public direction restoration to figures while private previews ignore URL state',()=>{
 window.history.replaceState(null,'','/countries/1220/?direction=exports');
 const data=makeCountryPreviewFixture(),publicPage=render(<CanadaPreview data={data} presentation={{kind:'pilot-fixture'}} enableSharing/>);
 expect(screen.getByRole('radio',{name:'Exports'})).toBeChecked();expect(within(screen.getByRole('region',{name:'Country overview'})).getByText(/ALL_VAL_MO/)).toBeVisible();
 publicPage.unmount();render(<CanadaPreview data={data} presentation={{kind:'preview'}}/>);
 expect(screen.getByRole('radio',{name:'Imports'})).toBeChecked();expect(screen.queryByRole('button',{name:'Copy view link'})).toBeNull();
});
it('rejects sharing opt-in for private/local-prepared presentation contexts',()=>{
 const data=makeCountryPreviewFixture();
 expect(()=>renderToStaticMarkup(<CanadaPreview data={data} enableSharing/>)).toThrow();
 data.source='retained';data.rawVerification='previous-reviewed-replay';
 for(const kind of ['accepted-local','pilot-prepared'] as const)expect(()=>renderToStaticMarkup(<CanadaPreview data={data} presentation={{kind,releaseId:'private',acceptedAt:'2026-10-12T23:46:54.013Z'}} enableSharing/>)).toThrow();
});
