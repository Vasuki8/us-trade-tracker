// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {renderToStaticMarkup} from 'react-dom/server';
import '@testing-library/jest-dom/vitest';
import {MexicoViewLink,useMexicoViewLink} from '../../src/components/MexicoViewLink';

afterEach(()=>{cleanup();vi.restoreAllMocks();window.history.replaceState(null,'','/');});
function Harness({enabled=true}:{enabled?:boolean}){
 const state=useMexicoViewLink(enabled);
 return <><p data-testid="direction">{state.selection.direction}</p>
  <button disabled={!state.ready} onClick={()=>state.changeSelection({direction:'imports'})}>Show Imports</button>
  <button disabled={!state.ready} onClick={()=>state.changeSelection({direction:'exports'})}>Show Exports</button>
  <MexicoViewLink {...state}/></>;
}
it('restores Exports without address rewriting and pushes only actual changes with preserved history state',async()=>{
 window.history.replaceState({position:3},'','/countries/2010/?direction=exports&release=private#main');
 const push=vi.spyOn(window.history,'pushState'),replace=vi.spyOn(window.history,'replaceState');
 const user=userEvent.setup();render(<Harness/>);
 expect(screen.getByTestId('direction')).toHaveTextContent('exports');expect(replace).not.toHaveBeenCalled();
 await user.click(screen.getByRole('button',{name:'Show Imports'}));
 await user.click(screen.getByRole('button',{name:'Show Imports'}));
 expect(push).toHaveBeenCalledTimes(1);expect(window.history.state).toEqual({position:3});
 expect(window.location.pathname+window.location.search+window.location.hash).toBe('/countries/2010/?direction=imports#main');
});
it('restores actual location state on popstate and hashchange and copies the canonical URL',async()=>{
 const user=userEvent.setup();render(<Harness/>);const write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();
 window.history.replaceState(null,'','/countries/2010/?direction=exports&private=omit');fireEvent.popState(window);
 expect(screen.getByTestId('direction')).toHaveTextContent('exports');
 window.history.replaceState(null,'','/countries/2010/?direction=exports&private=omit#main');fireEvent(window,new HashChangeEvent('hashchange'));
 await user.click(screen.getByRole('button',{name:'Copy view link'}));
 expect(write).toHaveBeenLastCalledWith(window.location.origin+'/countries/2010/?direction=exports#main');
 expect(screen.getByText('View link copied.')).toBeVisible();
});
it('keeps requested research usable when history updates are denied',async()=>{
 window.history.replaceState({position:1},'','/countries/2010/?direction=imports#main');
 const user=userEvent.setup();render(<Harness/>);
 vi.spyOn(window.history,'pushState').mockImplementation(()=>{throw Error('denied');});
 const write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();
 await user.click(screen.getByRole('button',{name:'Show Exports'}));
 expect(screen.getByTestId('direction')).toHaveTextContent('exports');expect(window.location.search).toBe('?direction=imports');
 expect(screen.getByText('The address could not be updated. Copy the view link to share this direction.')).toBeVisible();
 await user.click(screen.getByRole('button',{name:'Copy view link'}));
 expect(write).toHaveBeenCalledWith(window.location.origin+'/countries/2010/?direction=exports#main');
 fireEvent.popState(window);expect(screen.getByTestId('direction')).toHaveTextContent('imports');
});
it.each(['denied','missing'] as const)('offers a complete selectable manual URL when clipboard is %s',async(reason)=>{
 const user=userEvent.setup();render(<Harness/>);
 const descriptor=Object.getOwnPropertyDescriptor(navigator,'clipboard');
 if(reason==='denied')vi.spyOn(navigator.clipboard,'writeText').mockRejectedValue(Error('blocked'));
 else Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined});
 try{
  await user.click(screen.getByRole('button',{name:'Copy view link'}));
  const input=screen.getByLabelText('View link') as HTMLInputElement;
  expect(input).toHaveValue(window.location.origin+'/countries/2010/?direction=imports');expect(input.readOnly).toBe(true);
  await user.click(input);expect(input.selectionStart).toBe(0);expect(input.selectionEnd).toBe(input.value.length);
  await user.click(screen.getByRole('button',{name:'Show Exports'}));expect(screen.queryByLabelText('View link')).toBeNull();
 }finally{if(reason==='missing'&&descriptor)Object.defineProperty(navigator,'clipboard',descriptor);}
});
it.each(['?direction=secret','?direction=imports&direction=exports'])('uses a fixed invalid-input notice for %s and clears it on edit',async(search)=>{
 window.history.replaceState(null,'','/countries/2010/'+search);const user=userEvent.setup();render(<Harness/>);
 expect(screen.getByText('This saved Mexico view could not be restored. Showing Imports.')).toBeVisible();
 expect(screen.getByTestId('direction')).toHaveTextContent('imports');
 await user.click(screen.getByRole('button',{name:'Show Exports'}));expect(screen.queryByText(/could not be restored/)).toBeNull();
});
it.each(['success','failure'] as const)('ignores stale clipboard %s after a direction or URL restoration',async(outcome)=>{
 for(const change of ['direction','away-and-back','fragment'] as const){
  const user=userEvent.setup();const mounted=render(<Harness/>);let resolve!:()=>void,reject!:(e:Error)=>void;
  vi.spyOn(navigator.clipboard,'writeText').mockImplementation(()=>new Promise<void>((yes,no)=>{resolve=yes;reject=no;}));
  await user.click(screen.getByRole('button',{name:'Copy view link'}));
  if(change==='fragment'){window.history.replaceState(null,'','/countries/2010/?direction=imports#main');fireEvent(window,new HashChangeEvent('hashchange'));}
  else{await user.click(screen.getByRole('button',{name:'Show Exports'}));if(change==='away-and-back')await user.click(screen.getByRole('button',{name:'Show Imports'}));}
  await act(async()=>{if(outcome==='success')resolve();else reject(Error('late denial'));});
  expect(screen.queryByText('View link copied.')).toBeNull();expect(screen.queryByLabelText('View link')).toBeNull();
  mounted.unmount();vi.restoreAllMocks();window.history.replaceState(null,'','/');
 }
});
it.each(['success','failure'] as const)('a newer copy result wins over an older %s',async(older)=>{
 const user=userEvent.setup();render(<Harness/>);let resolve!:()=>void,reject!:(e:Error)=>void;
 const write=vi.spyOn(navigator.clipboard,'writeText').mockImplementationOnce(()=>new Promise<void>((yes,no)=>{resolve=yes;reject=no;}));
 if(older==='success')write.mockRejectedValue(Error('new denial'));else write.mockResolvedValue();
 await user.click(screen.getByRole('button',{name:'Copy view link'}));await user.click(screen.getByRole('button',{name:'Copy view link'}));
 await act(async()=>{if(older==='success')resolve();else reject(Error('old denial'));});
 if(older==='success'){expect(screen.getByLabelText('View link')).toBeVisible();expect(screen.queryByText('View link copied.')).toBeNull();}
 else{expect(screen.getByText('View link copied.')).toBeVisible();expect(screen.queryByLabelText('View link')).toBeNull();}
});
it.each(['success','failure'] as const)('removes lifecycle listeners and discards pending clipboard %s on unmount',async(outcome)=>{
 const user=userEvent.setup(),remove=vi.spyOn(window,'removeEventListener');let resolve!:()=>void,reject!:(e:Error)=>void;
 const mounted=render(<Harness/>);vi.spyOn(navigator.clipboard,'writeText').mockImplementation(()=>new Promise<void>((yes,no)=>{resolve=yes;reject=no;}));
 await user.click(screen.getByRole('button',{name:'Copy view link'}));mounted.unmount();
 expect(remove.mock.calls.filter(([name])=>name==='popstate'||name==='hashchange')).toHaveLength(2);
 await act(async()=>{if(outcome==='success')resolve();else reject(Error('late denial'));});expect(screen.queryByRole('status')).toBeNull();
});
it('keeps static actions disabled and registers no URL lifecycle for disabled/private use',()=>{
 expect(renderToStaticMarkup(<Harness/>)).toContain('disabled=""');
 window.history.replaceState(null,'','/preview/mexico/2010/?direction=exports');
 const add=vi.spyOn(window,'addEventListener');render(<Harness enabled={false}/>);
 expect(screen.getByTestId('direction')).toHaveTextContent('imports');expect(screen.getByRole('button',{name:'Copy view link'})).toBeDisabled();
 expect(add.mock.calls.filter(([name])=>name==='popstate'||name==='hashchange')).toHaveLength(0);
});
