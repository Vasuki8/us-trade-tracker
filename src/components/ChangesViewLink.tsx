import {useEffect,useRef,useState} from 'react';
import type {Direction} from '../lib/trade/types';

type RankingSelection<M extends 'share'|'growth'>={direction:Direction;metric:'dollars'|M};
const defaultSelection=()=>({direction:'imports' as const,metric:'dollars' as const});

function readSelection<M extends 'share'|'growth'>(search:string,alternateMetric:M):{selection:RankingSelection<M>;notice:string|null}{
  const fallback=()=>({selection:defaultSelection(),notice:'This saved changes selection could not be restored. Showing U.S. imports ranked by dollar change.'});
  if(search.length>2048)return fallback();
  const params=new URLSearchParams(search);
  if(['direction','metric'].some(key=>params.getAll(key).length>1))return fallback();
  const direction=params.get('direction')??'imports',metric=params.get('metric')??'dollars';
  if((direction!=='imports'&&direction!=='exports')||(metric!=='dollars'&&metric!==alternateMetric))return fallback();
  return {selection:{direction,metric:metric as 'dollars'|M},notice:null};
}

export function useChangesViewLink<M extends 'share'|'growth'>(path:string,alternateMetric:M){
  const [selection,setSelection]=useState<RankingSelection<M>>(defaultSelection);
  const [link,setLink]=useState(''),[notice,setNotice]=useState<string|null>(null);
  const [copied,setCopied]=useState(false),[showLink,setShowLink]=useState(false);
  const generation=useRef(0);
  const selectionPath=(value:RankingSelection<M>)=>`${path}?${new URLSearchParams(value)}${window.location.hash}`;
  useEffect(()=>{
    const restore=()=>{
      const restored=readSelection(window.location.search,alternateMetric);
      generation.current++;setSelection(restored.selection);setNotice(restored.notice);setCopied(false);setShowLink(false);
      setLink(new URL(selectionPath(restored.selection),window.location.origin).href);
    };
    restore();window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
    return ()=>{generation.current++;window.removeEventListener('popstate',restore);window.removeEventListener('hashchange',restore);};
  },[path,alternateMetric]);
  const changeSelection=(next:RankingSelection<M>)=>{
    const nextPath=selectionPath(next);
    window.history.replaceState(window.history.state,'',nextPath);
    generation.current++;setSelection(next);setNotice(null);setCopied(false);setLink(new URL(nextPath,window.location.origin).href);
  };
  const copy=async()=>{
    const current=++generation.current;
    try{await navigator.clipboard.writeText(link);if(current===generation.current){setCopied(true);setShowLink(false);}}
    catch{if(current===generation.current){setCopied(false);setShowLink(true);}}
  };
  return {selection,changeSelection,link,notice,copied,showLink,copy};
}

export function ChangesViewLink({link,notice,copied,showLink,copy}:{link:string;notice:string|null;copied:boolean;showLink:boolean;copy:()=>Promise<void>}){
  return <div className="view-link">
    <button className="secondary-button" disabled={!link} onClick={copy}>Copy changes link</button>
    <p>Links reopen this direction and ranking using the latest available dataset.</p>
    {notice&&<p role="status">{notice}</p>}{copied&&<p role="status">Changes link copied.</p>}
    {showLink&&<div className="view-link-fallback"><p role="status">Select and copy the changes link below. Automatic copying is unavailable.</p><label>Changes link<input readOnly value={link} onFocus={event=>event.currentTarget.select()}/></label></div>}
    <noscript><p className="chart-note">Enable JavaScript to restore saved changes or copy a changes link. The initial view shows U.S. imports ranked by dollar change.</p></noscript>
  </div>;
}
