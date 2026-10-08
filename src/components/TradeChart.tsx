import {forwardRef} from 'react';
import type {ProfileView} from '../lib/trade/types';
import {usd,monthLabel,seriesColor} from '../lib/trade/format';
export const TradeChart=forwardRef<SVGSVGElement,{view:ProfileView}>(function TradeChart({view},ref){
  const points=view.series[0]?.points??[];
  const maximum=Math.max(1,...view.series.flatMap(s=>s.points.map(p=>p.valueUsd??0)))*1.12;
  const x=(i:number)=>80+i/Math.max(1,points.length-1)*830;
  const y=(value:number)=>350-value/maximum*220;
  return <svg ref={ref} viewBox="0 0 960 540" role="img" aria-label={`Monthly U.S. ${view.selection.direction} chart`} fontFamily="Segoe UI, Arial, sans-serif">
    <rect width="960" height="540" fill="white"/>
    <text x="34" y="36" fill="#172e35" fontSize="20" fontWeight="600">{view.title}</text>
    <text x="34" y="64" fill="#50636b" fontSize="15">HS {view.productCode} · U.S. {view.selection.direction} · monthly value in current USD</text>
    {view.provenance.source==='fixture'&&<text x="34" y="90" fontSize="13" fill="#9a492b">DEVELOPMENT SAMPLE DATA — synthetic observations</text>}
    {[0,1,2,3,4].map(i=><g key={i}><line x1="80" x2="910" y1={y(maximum*i/4)} y2={y(maximum*i/4)} stroke="#e1e7e4"/><text x="66" y={y(maximum*i/4)+4} textAnchor="end" fontSize="12" fill="#50636b">{usd(maximum*i/4,true)}</text></g>)}
    {view.series.map(series=>{
      let connected=false;
      const path=series.points.map((point,index)=>{if(point.valueUsd===null){connected=false;return '';}
        const command=connected&&!point.breakBefore?'L':'M';connected=true;return `${command}${x(index)},${y(point.valueUsd)}`;
      }).join(' ');
      return <g key={series.code}><path d={path} fill="none" stroke={seriesColor(series.code)} strokeWidth="3" strokeLinejoin="round"/>
        {series.points.map((point,i)=>point.valueUsd===null?null:<circle key={point.month} cx={x(i)} cy={y(point.valueUsd)} r="2.7" fill={seriesColor(series.code)}><title>{monthLabel(point.month)}: {usd(point.valueUsd)}</title></circle>)}
      </g>;
    })}
    {points.length>0&&<><text x="80" y="377" fontSize="13" fill="#50636b">{monthLabel(points[0].month)}</text><text x="910" y="377" textAnchor="end" fontSize="13" fill="#50636b">{monthLabel(points.at(-1)!.month)}</text></>}
    {view.series.map((series,i)=><g key={series.code}><line x1={34+i*300} x2={54+i*300} y1="407" y2="407" stroke={seriesColor(series.code)} strokeWidth="3"/><text x={62+i*300} y="412" fontSize="13" fill="#172e35">{series.name}</text></g>)}
    <text x="34" y="448" fontSize="12" fill="#50636b">Source: {view.provenance.source==='fixture'?'Development sample data':'U.S. Census Bureau'} · {view.provenance.measure} · not seasonally adjusted</text>
    <text x="34" y="469" fontSize="12" fill="#50636b">Period: {points[0]?.month??'Unavailable'} to {points.at(-1)?.month??'Unavailable'} · retrieved {view.provenance.retrievedAt}</text>
    <text x="34" y="490" fontSize="12" fill="#50636b">Processing version: {view.provenance.codeVersion} · revised observations: {view.provenance.revised?'yes':'no'}</text>
    <text x="34" y="513" fontSize="11" fill="#50636b">Sources: api.census.gov/data/timeseries/intltrade/imports/hs and /exports/hs · us-trade-tracker</text>
  </svg>;
});
