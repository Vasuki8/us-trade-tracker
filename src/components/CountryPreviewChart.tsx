import type {CountryDirectionView} from '../lib/country-preview/types';
import {monthLabel,usd} from '../lib/trade/format';
export function CountryPreviewChart({view,source}:{view:CountryDirectionView;source:'fixture'|'retained'}):React.JSX.Element {
  const maximum=Math.max(1,...view.monthly.map(p=>p.valueUsd??0))*1.1;
  const x=(i:number)=>80+i/23*680,y=(value:number)=>240-value/maximum*195;
  let connected=false;
  const path=view.monthly.map((p,i)=>{if(p.valueUsd===null){connected=false;return ''; }const command=connected?'L':'M';connected=true;return `${command}${x(i)},${y(p.valueUsd)}`;}).join(' ');
  const title=`Monthly ${view.title}`;
  return <section className="chart-card" aria-label="All-goods history">
    <h2>All-goods history</h2><p>{source==='fixture'?'Synthetic monthly observations':'Captured monthly Census merchandise values'} · nominal USD, not seasonally adjusted</p>
    <svg viewBox="0 0 800 285" role="img" aria-label={title}>
      <desc>All 24 monthly all-goods values are in the table below. Gaps indicate unavailable values.</desc>
      {[0,1,2,3,4].map(i=><g key={i}><line x1="80" x2="760" y1={y(maximum*i/4)} y2={y(maximum*i/4)} stroke="#d8dfd9"/><text x="70" y={y(maximum*i/4)+4} textAnchor="end" fontSize="13">{usd(maximum*i/4,true)}</text></g>)}
      <path d={path} fill="none" stroke="#286568" strokeWidth="3"/>
      {view.monthly.map((p,i)=>p.valueUsd===null?null:<circle key={p.month} cx={x(i)} cy={y(p.valueUsd)} r="3" fill="#286568"><title>{`${monthLabel(p.month)}: ${usd(p.valueUsd)}`}</title></circle>)}
      <text x="80" y="270" fontSize="14">Sep 2024</text><text x="760" y="270" textAnchor="end" fontSize="14">Aug 2026</text>
    </svg>
    <div className="table-scroll" role="region" aria-label="Monthly country values" tabIndex={0}><table>
      <caption>{title} · nominal USD</caption><thead><tr><th scope="col">Month</th><th scope="col">All-goods value (USD)</th></tr></thead>
      <tbody>{view.monthly.map(p=><tr key={p.month}><th scope="row">{monthLabel(p.month)}</th><td>{usd(p.valueUsd)}</td></tr>)}</tbody>
    </table></div>
  </section>;
}
