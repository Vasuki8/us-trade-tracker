import {useEffect,useRef,useState} from 'react';
import type {DutyChartModel} from '../lib/trade/duty-history';
import {downloadBlob,exportChartPng} from '../lib/trade/downloads';
import {DutyPlotMarks,dutyMetricHeading,dutySeriesDash} from './DutyHistoryChart';
import {seriesColor} from '../lib/trade/format';
const exportSize={width:960,height:540,left:90,right:928,top:96,bottom:272,fontSize:11};
const ns='http://www.w3.org/2000/svg';
function prepareExport(svg:SVGSVGElement){
 const measure=svg.ownerDocument.createElementNS(ns,'text');svg.append(measure);
 const wrap=(value:string,font:string,width:number)=>{
  measure.setAttribute('font-size',font);const result:string[]=[];let remaining=value;
  while(remaining){
   let end=0;for(const char of remaining){measure.textContent=remaining.slice(0,end)+char;const length=measure.getComputedTextLength();if(!Number.isFinite(length)||length<=0)throw new Error('Cannot measure export text');if(length>width)break;end+=char.length;}
   if(end===0)throw new Error('Export text exceeds width');
   if(end<remaining.length){const space=remaining.lastIndexOf(' ',end);if(space>0)end=space;}
   result.push(remaining.slice(0,end).trimEnd());remaining=remaining.slice(end).trimStart();if(result.length>32)throw new Error('Export metadata exceeds canvas');
  }
  return result;
 };
 const group=(selector:string,start:number,legend=false)=>{
  const target=svg.querySelector(selector)!;const originals=[...target.querySelectorAll('text')];target.replaceChildren();let y=start;
  for(const source of originals){
   const font=source.getAttribute('font-size')??'11',x=legend?64:32;
   const lines=wrap(source.textContent??'',font,928-x);
   if(legend){const line=svg.ownerDocument.createElementNS(ns,'line');for(const [key,value]of Object.entries({x1:'32',x2:'52',y1:String(y-4),y2:String(y-4),stroke:source.getAttribute('data-color')!,'stroke-width':'3'}))line.setAttribute(key,value);const dash=source.getAttribute('data-dash');if(dash)line.setAttribute('stroke-dasharray',dash);target.append(line);}
   for(const text of lines){const row=source.cloneNode(false) as SVGTextElement;row.setAttribute('x',String(x));row.setAttribute('y',String(y));row.textContent=text;target.append(row);y+=legend?16:Number(font)+4;}
  }
  return y;
 };
 group('[data-duty-header]',26);const legendBottom=group('[data-duty-legend]',318,true);group('[data-duty-footer]',Math.max(370,legendBottom));measure.remove();
 const boxes=[...svg.querySelectorAll('text')].map(text=>({text,box:text.getBBox()}));
 for(const {text,box}of boxes){
  if(![box.x,box.y,box.width,box.height].every(Number.isFinite)||box.width<=0||box.height<=0||box.x<0||box.y<0||box.x+box.width>960||box.y+box.height>534)throw new Error('Export text exceeds canvas');
  if(text.closest('[data-duty-header]')&&box.y+box.height>88)throw new Error('Export header overlaps plot');
  if(text.closest('[data-duty-legend]')&&box.y<306)throw new Error('Export legend overlaps plot');
 }
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
  const a=boxes[i].box,b=boxes[j].box;if(Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)>0.5&&Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)>0.5)throw new Error('Export text overlaps');
 }
}
export function DutyChartDownload({model}:{model:DutyChartModel}){
 const svg=useRef<SVGSVGElement>(null),active=useRef(false),mounted=useRef(false);
 const identity=JSON.stringify(model),latest=useRef({identity});if(latest.current.identity!==identity)latest.current={identity};
 const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null);
 useEffect(()=>{mounted.current=true;setReady(true);return()=>{mounted.current=false;};},[]);
 useEffect(()=>{setError(null);},[identity]);
 const enabled=ready&&model.series.some(s=>s.points.some(p=>p.value!==null));
 const download=async()=>{
  if(!enabled||active.current||!svg.current)return;
  const context=latest.current,node=svg.current.cloneNode(true) as SVGSVGElement,filename=`hs-${model.productCode}-imports-estimated-duties-monthly-${model.metric}.png`;
  const host=document.createElement('div');Object.assign(host.style,{position:'fixed',left:'-10000px',top:'0',visibility:'hidden',pointerEvents:'none',width:'960px',height:'540px'});host.setAttribute('aria-hidden','true');host.append(node);
  active.current=true;setBusy(true);setError(null);
  try{
   document.body.append(host);await document.fonts?.ready;prepareExport(node);
   if(!mounted.current||latest.current!==context)return;
   const png=await exportChartPng(node);if(!(png instanceof Blob)||png.size===0||png.type!=='image/png')throw new Error('Invalid image');
   if(mounted.current&&latest.current===context)downloadBlob(png,filename);
  }catch{if(mounted.current&&latest.current===context)setError('PNG export failed. You can still download the estimated duties CSV.');}
  finally{host.remove();active.current=false;if(mounted.current)setBusy(false);}
 };
 const footer=[
  'Consumption value: CON_VAL_MO; reporting coverage: DUT_VAL_MO.',
  'Hollow markers: RP70/79 affected or coverage/classification unverified; counts can overlap.',
  'Gaps: missing/suppressed values; zero/missing consumption has no share.',
  'Lines connect only verified coverage within one reviewed classification interval.',
  'RP70/79 report dutiable value without calculated duties; zero is not proof of duty-free trade.',
  'Estimates may differ from payments; excludes antidumping and countervailing duties.',
  'Share changes may reflect import mix/coverage; not causal tariff analysis or a shipment quote.',
  'Source: '+(model.provenance.source==='fixture'?'Development sample data':'U.S. Census Bureau')+' · Retrieved UTC: '+model.provenance.retrievedAt,
  'Processing version: '+model.provenance.codeVersion+' · Duty revisions: '+(model.provenance.revised?'yes':'no'),
  ...model.provenance.sourceUrls.map(url=>'Census: '+url),
  'Sources and methods: https://us-trade-tracker.pages.dev/methods/',
 ];
 return <div className="duty-chart-download">
  <div hidden aria-hidden="true"><svg ref={svg} data-duty-export="" viewBox="0 0 960 540" width="960" height="540" fontFamily="Segoe UI, Arial, sans-serif" fill="#172e35">
   <rect width="960" height="540" fill="white"/>
   <g data-duty-header=""><text fontSize="20">{dutyMetricHeading(model.metric)}</text><text fontSize="13">HS {model.productCode} · {model.title}</text><text fontSize="12">U.S. imports · {model.fromMonth} to {model.reportingMonth} · {model.metric==='dollars'?'CAL_DUT_MO · current USD, not seasonally adjusted':'100 × CAL_DUT_MO / CON_VAL_MO · imports for consumption · percent'}</text>{model.provenance.source==='fixture'&&<text fontSize="11" fill="#9a492b">SYNTHETIC DEVELOPMENT DATA</text>}</g>
   <DutyPlotMarks model={model} size={exportSize}/>
   <g data-duty-legend="">{model.series.map((s,i)=><text key={s.code} fontSize="10.5" data-color={seriesColor(s.code)} data-dash={dutySeriesDash(i)}>{s.name} ({s.code}) · RP70/79 affected {s.points.filter(p=>p.coverage.qualified).length}/24 · coverage unverified {s.points.filter(p=>p.coverage.status!=='verified').length}/24 · classification unverified {s.points.filter(p=>!p.classificationVerified).length}/24 · unavailable {s.points.filter(p=>p.value===null).length}/24</text>)}</g>
   <g data-duty-footer="">{footer.map((text,i)=><text key={i} fontSize="10.5">{text}</text>)}</g>
  </svg></div>
  <div className="download-actions"><button className="secondary-button" disabled={!enabled||busy} onClick={download}>{busy?'Creating image…':model.metric==='dollars'?'Download duty amounts chart PNG':'Download duty share chart PNG'}</button></div>
  {busy&&<p role="status">Creating image…</p>}{error&&<p role="alert">{error}</p>}
 </div>;
}
