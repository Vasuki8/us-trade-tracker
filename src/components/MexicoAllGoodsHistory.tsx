import type {MexicoDirectionProfile} from '../lib/mexico-profile/types';
import {monthLabel,usd} from '../lib/trade/format';
function Plot({view,width,className}:{view:MexicoDirectionProfile;width:number;className:string}){
 const left=width===320?68:88,right=width-20,bottom=220,top=24;
 const maximum=Math.max(1,...view.monthly.map(p=>p.valueUsd??0))*1.1;
 const x=(i:number)=>left+i/23*(right-left),y=(value:number)=>bottom-value/maximum*(bottom-top);
 let connected=false;
 const path=view.monthly.map((p,i)=>{if(p.valueUsd===null){connected=false;return '';}const command=connected?'L':'M';connected=true;return command+x(i)+','+y(p.valueUsd);}).join(' ');
 return <svg className={className} viewBox={'0 0 '+width+' 270'} aria-hidden="true" focusable="false">
  {[0,1,2,3,4].map(i=><g key={i}><line x1={left} x2={right} y1={y(maximum*i/4)} y2={y(maximum*i/4)} stroke="var(--grid)"/><text x={left-8} y={y(maximum*i/4)+5} textAnchor="end" fontSize="16" fill="var(--muted)">{usd(maximum*i/4,true)}</text></g>)}
  <path data-monthly-line="true" d={path} fill="none" stroke="var(--teal)" strokeWidth="3"/>
  {view.monthly.map((p,i)=>p.valueUsd===null?null:<circle key={p.month} cx={x(i)} cy={y(p.valueUsd)} r="3" fill="var(--teal)"><title>{monthLabel(p.month)+': '+usd(p.valueUsd)}</title></circle>)}
  <text x={left} y="252" fontSize="16" fill="var(--muted)">{monthLabel(view.monthly[0].month)}</text><text x={right} y="252" textAnchor="end" fontSize="16" fill="var(--muted)">{monthLabel(view.monthly[23].month)}</text>
 </svg>;
}
export function MexicoAllGoodsHistory({view}:{view:MexicoDirectionProfile}):React.JSX.Element{
 const title=view.direction==='imports'?'Monthly U.S. imports from Mexico':'Monthly U.S. exports to Mexico';
 return <section className="chart-card" aria-label="All-goods history">
  <h2>All-goods history</h2>
  <div role="img" aria-label={title} aria-description="All 24 monthly all-goods values and source links are in Monthly values and sources. Gaps indicate unavailable values.">
   <Plot view={view} width={800} className="mx-chart-desktop"/><Plot view={view} width={320} className="mx-chart-mobile"/>
  </div>
  <details className="content-details"><summary>Monthly values and sources</summary>
   <div className="table-scroll" role="region" aria-label="Monthly Mexico values" tabIndex={0}><table>
    <caption>{title} — nominal USD</caption><thead><tr><th scope="col">Month</th><th scope="col">All-goods value (USD)</th><th scope="col">Original source</th></tr></thead>
    <tbody>{view.monthly.map(p=><tr key={p.month}><th scope="row">{monthLabel(p.month)}</th><td>{usd(p.valueUsd)}</td><td>{p.originalSource?<a href={p.originalSource.url}>Census source</a>:'Synthetic development data'}</td></tr>)}</tbody>
   </table></div>
  </details>
 </section>;
}
