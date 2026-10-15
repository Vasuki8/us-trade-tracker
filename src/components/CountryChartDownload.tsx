import {useEffect,useRef,useState} from 'react';
import type {CountryPreview,CountryDirection,CountryPresentation} from '../lib/country-preview/types';
import {buildCountryChartExport} from '../lib/country-preview/chart-export';
import {downloadBlob,exportChartPng} from '../lib/trade/downloads';
import {monthLabel} from '../lib/trade/format';
import {CountryPlotMarks,countryDesktopPlotSize} from './CountryPreviewChart';

function wrap(text:string):string[]{
 const lines:string[]=[];
 while(text.length>70){const boundary=text.lastIndexOf(' ',70),end=boundary>0?boundary:70;lines.push(text.slice(0,end));text=text.slice(end).trimStart();}
 if(text)lines.push(text);return lines;
}
export function CountryChartDownload({data,direction,presentation,ready}:{data:CountryPreview;direction:CountryDirection;presentation:CountryPresentation;ready:boolean}){
 const metadata=buildCountryChartExport(data,direction,presentation),view=data.directions[direction];
 const svg=useRef<SVGSVGElement>(null),active=useRef(false),mounted=useRef(false);
 const latest=useRef({data,direction,kind:presentation.kind});
 if(latest.current.data!==data||latest.current.direction!==direction||latest.current.kind!==presentation.kind)latest.current={data,direction,kind:presentation.kind};
 const [busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 useEffect(()=>{setError(null);},[data,direction,presentation.kind]);
 const download=async()=>{
  if(!ready||active.current||!svg.current)return;
  const context=latest.current,filename=metadata.filename,node=svg.current.cloneNode(true) as SVGSVGElement;
  active.current=true;setBusy(true);setError(null);
  try{
   const image=await exportChartPng(node);
   if(!(image instanceof Blob)||image.size===0)throw new Error('Empty chart image');
   if(mounted.current)downloadBlob(image,filename);
  }catch{
   if(mounted.current&&latest.current===context)setError('PNG export failed. You can still download the monthly data as CSV.');
  }finally{active.current=false;if(mounted.current)setBusy(false);}
 };
 const footer=[
  'Source: '+metadata.sourceLabel,
  'Captured UTC: '+metadata.captureStartedAt+' to '+metadata.captureFinishedAt,
  'Capture times describe saved files, not observation revision dates.',
  'Processing version: '+metadata.processingVersion,
  metadata.qualification,
  'Gaps indicate unavailable values.',
  'Monthly sources and CSV: '+metadata.sourcePageUrl,
 ].flatMap(wrap);
 return <div className="country-chart-download">
  <div hidden aria-hidden="true"><svg ref={svg} data-country-export="" viewBox="0 0 960 540" fontFamily="Segoe UI, Arial, sans-serif" fill="#172e35">
   <rect width="960" height="540" fill="white"/>
   <text x="34" y="35" fontSize="24" fontWeight="600">{metadata.title}</text>
   <text x="34" y="62" fontSize="14">{monthLabel(metadata.from)}–{monthLabel(metadata.to)} · {metadata.measure} · nominal USD, not seasonally adjusted</text>
   <g transform="translate(80,80)"><CountryPlotMarks view={view} size={countryDesktopPlotSize}/></g>
   <g data-export-footer="">{footer.map((line,index)=><text key={index} x="34" y={378+index*13} fontSize="11">{line}</text>)}</g>
  </svg></div>
  <div className="download-actions"><button className="secondary-button" disabled={!ready||busy} onClick={download}>{busy?'Creating image…':'Download chart PNG'}</button></div>
  {busy&&<p role="status">Creating image…</p>}{error&&<p role="alert">{error}</p>}
 </div>;
}
