import {useEffect,useRef,useState,type RefObject} from 'react';
import type {ProfileView} from '../lib/trade/types';
import {downloadBlob,exportChartPng,serializeCsv} from '../lib/trade/downloads';

export function TradeChartDownload({view,svgRef,ready}:{view:ProfileView;svgRef:RefObject<SVGSVGElement|null>;ready:boolean}){
 const identity=JSON.stringify([view.productCode,view.title,view.reportingMonth,view.selection.direction,view.series,view.provenance]);
 const latest=useRef({identity}),active=useRef(false),mounted=useRef(false);
 if(latest.current.identity!==identity)latest.current={identity};
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 useEffect(()=>{setError('');},[identity]);
 const stem=`hs-${view.productCode}-${view.selection.direction}`;
 const download=async()=>{
  if(!ready||active.current)return;
  const context=latest.current,filename=stem+'.png';active.current=true;setBusy(true);setError('');
  try{
   if(!svgRef.current)throw new Error('Chart unavailable');
   const snapshot=svgRef.current.cloneNode(true) as SVGSVGElement;
   const png=await exportChartPng(snapshot);
   if(!(png instanceof Blob)||png.size===0||png.type!=='image/png')throw new Error('Invalid image');
   if(mounted.current&&latest.current===context)downloadBlob(png,filename);
  }catch{if(mounted.current&&latest.current===context)setError('PNG export failed. You can still download the displayed data as CSV.');}
  finally{active.current=false;if(mounted.current)setBusy(false);}
 };
 return <>
  <div className="download-actions"><button className="primary-button" disabled={!ready||busy} onClick={download}>{busy?'Creating image…':'Download chart PNG'}</button><button className="secondary-button" disabled={!ready} onClick={()=>{if(ready)downloadBlob(new Blob([serializeCsv(view)],{type:'text/csv;charset=utf-8'}),stem+'.csv');}}>Download data CSV</button></div>
  {busy&&<p role="status" className="chart-note">Creating image…</p>}
  {error&&<p role="alert" className="download-error">{error}</p>}
 </>;
}
