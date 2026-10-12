import type {CountryPreview,CountryDirection} from './types';
const cell=(value:unknown)=>{
  let text=String(value??'');
  if(typeof value==='string'&&/^(?:[=+@]|-(?!$)|[\t\r])/.test(text))text="'"+text;
  return /[",\r\n]/.test(text)?`"${text.replaceAll('"','""')}"`:text;
};
const csv=(headers:string[],rows:unknown[][])=>[headers,...rows].map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
const source=(data:CountryPreview)=>data.source==='fixture'?'Synthetic development data':'U.S. Census Bureau monthly merchandise files';
const provenance=(data:CountryPreview)=>[source(data),data.captureInterval.startedAt,data.captureInterval.finishedAt,data.processingVersion,data.rawVerification];
export function countryCsvFilename(direction:CountryDirection,kind:'monthly'|'products'):string {
  return `canada-1220-${direction}-2024-09-2026-08-preview-${kind}.csv`;
}
export function serializeCountryMonthlyCsv(data:CountryPreview,direction:CountryDirection):string {
  const view=data.directions[direction];
  const headers=['country_code','country_name','direction','month','value_usd','value_status','measure','units','adjustment','period_start','period_end','source','capture_started_at','capture_finished_at','processing_version','raw_verification','original_source_url','original_source_captured_at','original_source_bytes','original_source_sha256'];
  return csv(headers,view.monthly.map(p=>[data.countryCode,data.countryName,direction,p.month,p.valueUsd,p.valueUsd===null?'unavailable':'reported',view.measure,'nominal USD','not seasonally adjusted',data.reporting.from,data.reporting.to,...provenance(data),p.originalSource?.url,p.originalSource?.capturedAt,p.originalSource?.bytes,p.originalSource?.sha256]));
}
export function serializeCountryProductsCsv(data:CountryPreview,direction:CountryDirection):string {
  const view=data.directions[direction];
  const headers=['country_code','country_name','direction','selected_rank','product_code','description','current_value_usd','prior_value_usd','current_country_total_usd','prior_country_total_usd','change_usd','growth_percent','current_share_percent','prior_share_percent','share_change_percentage_points','current_period_start','current_period_end','prior_period_start','prior_period_end','current_reported_months','prior_reported_months','classification_status','classification_from','classification_to','special_by_policy','comparison_eligible','reason','measure','units','adjustment','source','capture_started_at','capture_finished_at','processing_version','raw_verification','current_original_sources','prior_original_sources'];
  const originals=(from:string,to:string)=>JSON.stringify(view.monthly.filter(p=>p.month>=from&&p.month<=to).flatMap(p=>p.originalSource?[p.originalSource]:[]));
  return csv(headers,view.products.map((p,i)=>[data.countryCode,data.countryName,direction,i+1,p.code,p.description,p.current.observedSumUsd,p.prior.observedSumUsd,p.current.countryTotalUsd,p.prior.countryTotalUsd,p.changeUsd,p.growthPercent,p.current.sharePercent,p.prior.sharePercent,p.sharePointChange,p.current.from,p.current.to,p.prior.from,p.prior.to,p.current.reportedMonths,p.prior.reportedMonths,p.classification.status,p.classification.from,p.classification.to,p.specialByPolicy,p.comparisonEligible,p.reason,view.measure,'nominal USD; shares and growth in percent; share change in percentage points','not seasonally adjusted',...provenance(data),originals(p.current.from,p.current.to),originals(p.prior.from,p.prior.to)]));
}
