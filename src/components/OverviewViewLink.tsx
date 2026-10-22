import {useEffect,useRef,useState} from 'react';
import {overviewViewPath,readOverviewSelection,type OverviewSelection} from '../lib/trade/overview-view-link';

export function useOverviewViewLink(productCodes:readonly string[]){
  const productKey=productCodes.join(',');
  const [selection,setSelection]=useState(()=>readOverviewSelection('',productCodes).selection);
  const [ready,setReady]=useState(false),[link,setLink]=useState('');
  const [notice,setNotice]=useState<string|null>(null),[copied,setCopied]=useState(false),[showLink,setShowLink]=useState(false);
  const generation=useRef(0);

  useEffect(()=>{
    const restore=()=>{
      const restored=readOverviewSelection(window.location.search,productKey.split(','));
      generation.current++;
      setSelection(restored.selection);
      setLink(new URL(overviewViewPath(restored.selection)+window.location.hash,window.location.origin).href);
      setNotice(restored.notice);setCopied(false);setShowLink(false);setReady(true);
    };
    restore();
    window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
    return ()=>{generation.current++;window.removeEventListener('popstate',restore);window.removeEventListener('hashchange',restore);};
  },[productKey]);

  const changeSelection=(next:OverviewSelection)=>{
    if(!productCodes.includes(next.productCode))throw new Error('Invalid overview product selection');
    const path=overviewViewPath(next)+window.location.hash;
    let message:string|null=null;
    try{window.history.replaceState(window.history.state,'',path);}
    catch{message='The address could not be updated. Copy the overview link to share these choices.';}
    generation.current++;
    setSelection(next);setLink(new URL(path,window.location.origin).href);
    setNotice(message);setCopied(false);
  };

  const copy=async()=>{
    if(!ready)return;
    const current=++generation.current;
    try{
      await navigator.clipboard.writeText(link);
      if(current===generation.current){setCopied(true);setShowLink(false);}
    }catch{
      if(current===generation.current){setCopied(false);setShowLink(true);}
    }
  };
  return {selection,ready,changeSelection,link,notice,copied,showLink,copy};
}

export function OverviewViewLink({ready,link,notice,copied,showLink,copy}:ReturnType<typeof useOverviewViewLink>){
  return <div className="view-link overview-view-link">
    <button type="button" className="secondary-button" disabled={!ready} onClick={copy}>Copy overview link</button>
    <p>Links reopen these choices using the latest available data.</p>
    {notice&&<p role="status">{notice}</p>}
    {copied&&<p role="status">Overview link copied.</p>}
    {showLink&&<div className="view-link-fallback">
      <p role="status">Select and copy the overview link below. Automatic copying is unavailable.</p>
      <label>Overview link<input readOnly value={link} onFocus={event=>event.currentTarget.select()}/></label>
    </div>}
  </div>;
}
