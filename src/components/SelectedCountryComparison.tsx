import {selectCountryChanges,type ChangesView} from '../lib/trade/changes';
import {downloadBlob,serializeSelectedCountriesCsv} from '../lib/trade/downloads';
import {monthLabel,percent,usd,countryShare,percentagePoints,usdChange} from '../lib/trade/format';

export function SelectedCountryComparison({view,countryCodes}:{view:ChangesView;countryCodes:string[]}){
  const countries=selectCountryChanges(view,countryCodes);
  if(countries.length===0)return null;
  const period=(value:{from:string;to:string})=>`${monthLabel(value.from)}–${monthLabel(value.to)}`;
  const unavailable=countries.some(country=>[country.currentUsd,country.previousUsd,country.changeUsd,country.currentSharePercent,country.previousSharePercent,country.shareChangePoints].some(value=>value===null));
  return <section className="selected-comparison-card" aria-labelledby="selected-comparison-heading">
    <div className="section-heading"><div><p className="eyebrow">YOUR SELECTED COUNTRIES</p><h2 id="selected-comparison-heading">Selected country comparison</h2></div><span className="measure-tag">{view.provenance.measure}</span></div>
    <p className="changes-period"><strong>{period(view.periods.current)}</strong> compared with <strong>{period(view.periods.previous)}</strong> · U.S. {view.direction}</p>
    <p className="changes-description">Share of U.S. {view.direction} for this product uses the official U.S. total for each period. The history window changes the chart; this summary always compares the latest twelve months with the previous twelve months.</p>
    <div className="table-scroll" role="region" aria-label="Scrollable selected country annual comparison" tabIndex={0}>
      <table aria-label="Selected country annual comparison"><thead><tr><th scope="col">Country</th><th scope="col">Current USD</th><th scope="col">Previous USD</th><th scope="col">Dollar change</th><th scope="col">Growth</th><th scope="col">Current share</th><th scope="col">Previous share</th><th scope="col">Share change (pp)</th></tr></thead>
        <tbody>{countries.map(country=><tr key={country.code}><th scope="row">{country.name}<small>{country.code}</small></th><td>{usd(country.currentUsd)}</td><td>{usd(country.previousUsd)}</td><td>{usdChange(country.changeUsd)}</td><td>{percent(country.changePercent)}</td><td>{countryShare(country.currentSharePercent)}</td><td>{countryShare(country.previousSharePercent)}</td><td>{percentagePoints(country.shareChangePoints)}</td></tr>)}</tbody>
      </table>
    </div>
    {unavailable&&<p className="changes-status">Some figures or comparisons are unavailable because a period is incomplete, classification continuity is unverified, or a U.S. total is zero or unavailable.</p>}
    <p className="chart-note">Values are current USD, not seasonally adjusted. Share change is measured in percentage points (pp). A zero prior value has no growth percentage. The CSV includes each selected country, both periods, U.S. totals and source details.</p>
    <button className="secondary-button" onClick={()=>downloadBlob(new Blob([serializeSelectedCountriesCsv(view,countryCodes)],{type:'text/csv;charset=utf-8'}),`hs-${view.productCode}-${view.direction}-selected-countries.csv`)}>Download selected countries CSV</button>
    <p className="selected-comparison-source">Source: {view.provenance.source==='fixture'?'Development sample data':'U.S. Census Bureau'} · retrieved {view.provenance.retrievedAt}</p>
  </section>;
}
