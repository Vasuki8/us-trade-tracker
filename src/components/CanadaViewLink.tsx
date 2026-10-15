import {useEffect,useRef,useState} from 'react';
import {canadaViewPath,readCanadaViewSelection,type CanadaViewSelection} from '../lib/country-preview/view-link';

export function useCanadaViewLink(enabled:boolean){
 const [selection,setSelection]=useState<CanadaViewSelection>({direction:'imports'});
 const [ready,setReady]=useState(false),[link,setLink]=useState(''),[notice,setNotice]=useState<string|null>(null);
 const [copied,setCopied]=useState(false),[manual,setManual]=useState(false);
 const generation=useRef(0);
 useEffect(()=>{
  if(!enabled)return;
  const restore=()=>{
   const restored=readCanadaViewSelection(window.location.search);
   generation.current++;setSelection(restored.selection);setNotice(restored.notice);setCopied(false);setManual(false);
   setLink(new URL(canadaViewPath(restored.selection,window.location.hash),window.location.origin).href);setReady(true);
  };
  restore();window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
  return ()=>{generation.current++;window.removeEventListener('popstate',restore);window.removeEventListener('hashchange',restore);};
 },[enabled]);
 const changeSelection=(next:CanadaViewSelection)=>{
  if(!enabled||!ready||next.direction===selection.direction)return;
  const path=canadaViewPath(next,window.location.hash);
  window.history.pushState(window.history.state,'',path);
  generation.current++;setSelection(next);setNotice(null);setCopied(false);
  setLink(new URL(path,window.location.origin).href);
 };
 const copy=async()=>{
  if(!enabled||!ready)return;
  const current=++generation.current;
  try{await navigator.clipboard.writeText(link);if(current===generation.current){setCopied(true);setManual(false);}}
  catch{if(current===generation.current){setCopied(false);setManual(true);}}
 };
 return {selection,changeSelection,ready:enabled&&ready,link,notice,copied,manual,copy};
}
export function CanadaViewLink(state:ReturnType<typeof useCanadaViewLink>){
 return <div className="view-link"><button className="secondary-button" disabled={!state.ready} onClick={state.copy}>Copy view link</button>
  <p>Links reopen this direction in the Canada historical snapshot available on this site; they do not pin an immutable release.</p>
  {state.notice&&<p role="status">{state.notice}</p>}{state.copied&&<p role="status">View link copied.</p>}
  {state.manual&&<div className="view-link-fallback"><p role="status">Select and copy the view link below. Automatic copying is unavailable.</p>
   <label>View link<input readOnly value={state.link} onFocus={event=>event.currentTarget.select()}/></label>
  </div>}
 </div>;
}
