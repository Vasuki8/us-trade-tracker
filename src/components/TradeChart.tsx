import {forwardRef} from 'react';
import type {ProfileView} from '../lib/trade/types';
import {usd,monthLabel,seriesColor} from '../lib/trade/format';
const seriesDash=(index:number)=>[undefined,'8 5','2 5'][index];

function Plot({view,left,right,top,bottom}:{view:ProfileView;left:number;right:number;top:number;bottom:number}){
  const points=view.series[0]?.points??[];
  const maximum=Math.max(1,...view.series.flatMap(s=>s.points.map(p=>p.valueUsd??0)))*1.12;
  const x=(i:number)=>left+i/Math.max(1,points.length-1)*(right-left);
  const y=(value:number)=>bottom-value/maximum*(bottom-top);
  return <>
    {[0,1,2,3,4].map(i=><g key={i}><line x1={left} x2={right} y1={y(maximum*i/4)} y2={y(maximum*i/4)} stroke="#e1e7e4"/><text x={left-10} y={y(maximum*i/4)+4} textAnchor="end" fontSize="12" fill="#50636b">{usd(maximum*i/4,true)}</text></g>)}
    {view.series.map((series,seriesIndex)=>{
      let connected=false;
      const path=series.points.map((point,index)=>{if(point.valueUsd===null){connected=false;return '';}
        const command=connected&&!point.breakBefore?'L':'M';connected=true;return `${command}${x(index)},${y(point.valueUsd)}`;
      }).join(' ');
      return <g key={series.code}><path d={path} fill="none" stroke={seriesColor(series.code)} strokeWidth="3" strokeDasharray={seriesDash(seriesIndex)} strokeLinejoin="round"/>
        {series.points.map((point,i)=>point.valueUsd===null?null:<circle key={point.month} cx={x(i)} cy={y(point.valueUsd)} r="2.7" fill={seriesColor(series.code)}><title>{`${monthLabel(point.month)}: ${usd(point.valueUsd)}`}</title></circle>)}
      </g>;
    })}
    {points.length>0&&<><text x={left} y={bottom+25} fontSize="13" fill="#50636b">{monthLabel(points[0].month)}</text><text x={right} y={bottom+25} textAnchor="end" fontSize="13" fill="#50636b">{monthLabel(points.at(-1)!.month)}</text></>}
  </>;
}

export const TradeChart=forwardRef<SVGSVGElement,{view:ProfileView}>(function TradeChart({view},ref){
  const points=view.series[0]?.points??[];
  const label=`Monthly U.S. ${view.selection.direction} chart`;
  const mobileHeight=280+view.series.length*24;
  return <>
    <svg className="desktop-chart" ref={ref} viewBox="0 0 960 540" role="img" aria-label={label} fontFamily="Segoe UI, Arial, sans-serif">
      <rect width="960" height="540" fill="white"/>
      <text x="34" y="36" fill="#172e35" fontSize="20" fontWeight="600">{view.title}</text>
      <text x="34" y="64" fill="#50636b" fontSize="15">HS {view.productCode} · U.S. {view.selection.direction} · monthly value in current USD</text>
      {view.provenance.source==='fixture'&&<text x="34" y="90" fontSize="13" fill="#9a492b">DEVELOPMENT SAMPLE DATA — synthetic observations</text>}
      <Plot view={view} left={80} right={910} top={130} bottom={350}/>
      {view.series.map((series,i)=><g key={series.code}><line x1={34+i*300} x2={54+i*300} y1="407" y2="407" stroke={seriesColor(series.code)} strokeWidth="3" strokeDasharray={seriesDash(i)}/><text x={62+i*300} y="412" fontSize="13" fill="#172e35">{series.name}</text></g>)}
      <text x="34" y="436" fontSize="11" fill="#50636b">Gaps: unavailable values; lines also break at incompatible or unverified classifications.</text>
      <text x="34" y="459" fontSize="12" fill="#50636b">Source: {view.provenance.source==='fixture'?'Development sample data':'U.S. Census Bureau'} · {view.provenance.measure} · not seasonally adjusted</text>
      <text x="34" y="480" fontSize="12" fill="#50636b">Period: {points[0]?.month??'Unavailable'} to {points.at(-1)?.month??'Unavailable'} · retrieved {view.provenance.retrievedAt}</text>
      <text x="34" y="501" fontSize="12" fill="#50636b">Processing version: {view.provenance.codeVersion} · revised observations: {view.provenance.revised?'yes':'no'}</text>
      <text x="34" y="523" fontSize="11" fill="#50636b">Sources: api.census.gov/data/timeseries/intltrade/imports/hs and /exports/hs · us-trade-tracker</text>
    </svg>
    <svg className="mobile-chart" viewBox={`0 0 320 ${mobileHeight}`} role="img" aria-label={label} fontFamily="Segoe UI, Arial, sans-serif">
      <rect width="320" height={mobileHeight} fill="white"/>
      <text x="0" y="18" fontSize="13" fill="#50636b">Monthly U.S. {view.selection.direction} · current USD</text>
      <Plot view={view} left={52} right={308} top={40} bottom={202}/>
      {view.series.map((series,i)=><g key={series.code}><line x1="0" x2="20" y1={249+i*24} y2={249+i*24} stroke={seriesColor(series.code)} strokeWidth="3" strokeDasharray={seriesDash(i)}/><text x="28" y={253+i*24} fontSize="13" fill="#172e35">{series.name}</text></g>)}
      <text x="0" y={mobileHeight-8} fontSize="12" fill="#50636b">{view.provenance.source==='fixture'?'Development sample data':'U.S. Census Bureau'} · {view.provenance.measure}</text>
    </svg>
  </>;
});
