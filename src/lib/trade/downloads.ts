import type {ProfileView} from './types';
import {rankChanges,type ChangeMetric,type ChangesView} from './changes';
const csvCell=(value:unknown)=>{let text=String(value??'');if(typeof value==='string'&&/^(?:[=+@]|-(?!$)|[\t\r])/.test(text))text="'"+text;return /[",\r\n]/.test(text)?`"${text.replaceAll('"','""')}"`:text;};
export function serializeChangesCsv(view:ChangesView,metric:ChangeMetric):string{
  const ranking=rankChanges(view,metric);
  const headers=['ranking_metric','movement','rank','product_code','product_description','direction','partner_code','partner_name','current_value_usd','previous_value_usd','change_usd','growth_percent','current_share_percent','previous_share_percent','share_change_percentage_points','current_period_start','current_period_end','previous_period_start','previous_period_end','measure','units','source','retrieved_at','code_version','revised','classification_comparable','source_urls'];
  const rows=([['increase',ranking.increases],['decrease',ranking.decreases]] as const).flatMap(([movement,countries])=>countries.map((country,index)=>[
    metric,movement,index+1,view.productCode,view.title,view.direction,country.code,country.name,country.currentUsd,country.previousUsd,country.changeUsd,country.changePercent,country.currentSharePercent,country.previousSharePercent,country.shareChangePoints,
    view.periods.current.from,view.periods.current.to,view.periods.previous.from,view.periods.previous.to,view.provenance.measure,'current USD, not seasonally adjusted; shares in percent; share change in percentage points',view.provenance.source==='fixture'?'Development sample data':'U.S. Census Bureau',view.provenance.retrievedAt,view.provenance.codeVersion,view.provenance.revised,view.classificationComparable,view.provenance.sourceUrls.join(' | ')
  ]));
  return [headers,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
}
export function serializeCsv(view:ProfileView):string{
  const headers=['month','product_code','product_description','direction','partner_code','partner_name','value_usd','value_status','measure','units','period_start','period_end','source','retrieved_at','code_version','revised','classification_verified','classification_break_before','source_urls'];
  const period=view.series[0]?.points;
  const rows=view.series.flatMap(series=>series.points.map(point=>[point.month,view.productCode,view.title,view.selection.direction,series.code,series.name,point.valueUsd,point.valueUsd===null?'unavailable':'reported',view.provenance.measure,'current USD, not seasonally adjusted',period?.[0]?.month,period?.at(-1)?.month,view.provenance.source==='fixture'?'Development sample data':'U.S. Census Bureau',view.provenance.retrievedAt,view.provenance.codeVersion,view.provenance.revised,point.classificationVerified,point.breakBefore,view.provenance.sourceUrls.join(' | ')]));
  return [headers,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
}
export async function exportChartPng(svg:SVGSVGElement):Promise<Blob>{
  const clone=svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns','http://www.w3.org/2000/svg');clone.setAttribute('width','1920');clone.setAttribute('height','1080');
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'}));
  try{
    const image=new Image();await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('PNG conversion failed. Download the CSV instead.'));image.src=url;});
    const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1080;
    const context=canvas.getContext('2d');if(!context)throw new Error('PNG export is unavailable. Download the CSV instead.');
    context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
    return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG conversion failed. Download the CSV instead.')),'image/png'));
  }finally{URL.revokeObjectURL(url);}
}
export function downloadBlob(blob:Blob,filename:string){
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=filename;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
