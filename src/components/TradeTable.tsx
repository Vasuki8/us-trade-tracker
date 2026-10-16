import type {ProfileView} from '../lib/trade/types';import {usd,monthLabel} from '../lib/trade/format';
export function TradeTable({view}:{view:ProfileView}){
  const points=view.series[0]?.points??[];
  return <><div className="table-scroll" tabIndex={0} role="region" aria-label="Scrollable monthly data">
    <table><caption>Monthly trade values · current U.S. dollars</caption><thead><tr><th scope="col">Month</th>{view.series.map(s=><th key={s.code} scope="col">{s.name}</th>)}</tr></thead>
      <tbody>{points.map((point,index)=><tr key={point.month}><th scope="row">{monthLabel(point.month)}</th>{view.series.map(s=><td key={s.code}>{usd(s.points[index].valueUsd)}{s.points[index].recordedRevision&&<> <span>Revised</span></>}</td>)}</tr>)}</tbody>
    </table>
  </div><p className="chart-note">Revised marks a recorded change against the previous retained release. No mark does not mean never revised or final.</p></>;
}
