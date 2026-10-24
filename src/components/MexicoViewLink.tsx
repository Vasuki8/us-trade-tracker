import {useEffect,useRef,useState} from 'react';
import {mexicoViewPath,readMexicoViewSelection,type MexicoViewSelection} from '../lib/mexico-profile/view-link';

export function useMexicoViewLink(enabled:boolean){
 const [selection,setSelection]=useState<MexicoViewSelection>({direction:'imports'});
 const [ready,setReady]=useState(false),[link,setLink]=useState(''),[notice,setNotice]=useState<string|null>(null);
 const [copied,setCopied]=useState(false),[manual,setManual]=useState(false);
 const generation=useRef(0);
 useEffect(()=>{
  if(!enabled){setReady(false);return;}
  const restore=()=>{
   const restored=readMexicoViewSelection(window.location.search);
   generation.current++;setSelection(restored.selection);setNotice(restored.notice);setCopied(false);setManual(false);
   setLink(new URL(mexicoViewPath(restored.selection,window.location.hash),window.location.origin).href);setReady(true);
  };
  restore();window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
  return ()=>{generation.current++;window.removeEventListener('popstate',restore);window.removeEventListener('hashchange',restore);};
 },[enabled]);
 const changeSelection=(next:MexicoViewSelection)=>{
  if(!enabled||!ready||next.direction===selection.direction)return;
  const path=mexicoViewPath(next,window.location.hash);
  let message:string|null=null;
  try{window.history.pushState(window.history.state,'',path);}
  catch{message='The address could not be updated. Copy the view link to share this direction.';}
  generation.current++;setSelection(next);setNotice(message);setCopied(false);setManual(false);
  setLink(new URL(path,window.location.origin).href);
 };
 const copy=async()=>{
  if(!enabled||!ready)return;
  const current=++generation.current;setCopied(false);setManual(false);
  try{await navigator.clipboard.writeText(link);if(current===generation.current){setCopied(true);setManual(false);}}
  catch{if(current===generation.current){setCopied(false);setManual(true);}}
 };
 return {selection,changeSelection,ready:enabled&&ready,link,notice,copied,manual,copy};
}
export function MexicoViewLink(state:ReturnType<typeof useMexicoViewLink>):React.JSX.Element{
 return <div className="view-link mexico-view-link">
  <button type="button" className="secondary-button" disabled={!state.ready} onClick={state.copy}>Copy view link</button>
  <p>Links reopen this direction in the Mexico snapshot available here; they do not pin a release.</p>
  {state.notice&&<p role="status">{state.notice}</p>}{state.copied&&<p role="status">View link copied.</p>}
  {state.manual&&<div className="view-link-fallback"><p role="status">Select and copy the view link below. Automatic copying is unavailable.</p>
   <label>View link<input readOnly value={state.link} onFocus={event=>event.currentTarget.select()}/></label>
  </div>}
 </div>;
}
