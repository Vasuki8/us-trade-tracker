import type {CountryDirectionView} from '../lib/country-preview/types';
import {monthLabel,usd} from '../lib/trade/format';
type PlotSize={width:number;height:number;left:number;right:number;top:number;bottom:number;fontSize:number};
const desktop:PlotSize={width:800,height:285,left:88,right:760,top:35,bottom:238,fontSize:18};
const mobile:PlotSize={width:320,height:250,left:70,right:308,top:25,bottom:212,fontSize:16};
function CountryPlot({view,size,className}:{view:CountryDirectionView;size:PlotSize;className:string}){
  const maximum=Math.max(1,...view.monthly.map(p=>p.valueUsd??0))*1.1;
  const x=(i:number)=>size.left+i/Math.max(1,view.monthly.length-1)*(size.right-size.left);
  const y=(value:number)=>size.bottom-value/maximum*(size.bottom-size.top);
  let connected=false;
  const path=view.monthly.map((p,i)=>{if(p.valueUsd===null){connected=false;return ''; }const command=connected?'L':'M';connected=true;return `${command}${x(i)},${y(p.valueUsd)}`;}).join(' ');
  return <svg className={className} viewBox={`0 0 ${size.width} ${size.height}`} aria-hidden="true" focusable="false">
    {[0,1,2,3,4].map(i=><g key={i}><line x1={size.left} x2={size.right} y1={y(maximum*i/4)} y2={y(maximum*i/4)} stroke="#d8dfd9"/><text x={size.left-10} y={y(maximum*i/4)+5} textAnchor="end" fontSize={size.fontSize}>{usd(maximum*i/4,true)}</text></g>)}
    <path d={path} fill="none" stroke="#286568" strokeWidth="3"/>
    {view.monthly.map((p,i)=>p.valueUsd===null?null:<circle key={p.month} cx={x(i)} cy={y(p.valueUsd)} r="3" fill="#286568"><title>{`${monthLabel(p.month)}: ${usd(p.valueUsd)}`}</title></circle>)}
    <text x={size.left} y={size.bottom+30} fontSize={size.fontSize}>{monthLabel(view.monthly[0].month)}</text><text x={size.right} y={size.bottom+30} textAnchor="end" fontSize={size.fontSize}>{monthLabel(view.monthly.at(-1)!.month)}</text>
  </svg>;
}
export function CountryPreviewChart({view,source}:{view:CountryDirectionView;source:'fixture'|'retained'}):React.JSX.Element {
  const title=`Monthly ${view.title}`;
  return <section className="chart-card" aria-label="All-goods history">
    <h2>All-goods history</h2><p>{source==='fixture'?'Synthetic monthly observations':'Captured monthly Census merchandise values'} · nominal USD, not seasonally adjusted</p>
    <div role="img" aria-label={title} aria-description="All 24 monthly all-goods values are in the table below. Gaps indicate unavailable values.">
      <CountryPlot view={view} size={desktop} className="country-chart-desktop"/>
      <CountryPlot view={view} size={mobile} className="country-chart-mobile"/>
    </div>
    <div className="table-scroll" role="region" aria-label="Monthly country values" tabIndex={0}><table>
      <caption>{title} · nominal USD</caption><thead><tr><th scope="col">Month</th><th scope="col">All-goods value (USD)</th></tr></thead>
      <tbody>{view.monthly.map(p=><tr key={p.month}><th scope="row">{monthLabel(p.month)}</th><td>{usd(p.valueUsd)}</td></tr>)}</tbody>
    </table></div>
  </section>;
}
