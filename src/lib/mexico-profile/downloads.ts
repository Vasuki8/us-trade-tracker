import type {MexicoDirection,MexicoProfileView} from './types';
import {summarizeMexicoDirection} from './summary';
const cell=(value:unknown)=>{let text=String(value??'');if(typeof value==='string'&&/^(?:[=+@]|-(?!$)|[\t\r])/.test(text))text="'"+text;return /[",\r\n]/.test(text)?'"'+text.replaceAll('"','""')+'"':text;};
function csv(rows:Record<string,unknown>[]):string {
 const headers=Object.keys(rows[0]);
 return [headers,...rows.map(row=>headers.map(h=>row[h]))].map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
}
function context(p:MexicoProfileView,d:MexicoDirection):Record<string,unknown> {
 const q=p.qualifications,real=p.source==='census';
 if(p.countryCode!=='2010'||p.from!=='2024-09'||p.to!=='2026-08'||q.classificationAccepted!==false||q.productComparisonsAvailable!==false||q.datedMatched!==16||q.datedDifferences!==32||q.differenceCause!=='not-established'||q.vintageRelationship!=='not-established')throw Error('Mexico CSV qualification mismatch');
 if(real?!['accepted-private-local','public-pilot-snapshot'].includes(p.presentation)||!p.acceptance||p.acceptance.scope!=='private-all-goods'||q.verificationBasis!=='prior-reviewed-retained-evidence':p.source!=='fixture'||!['synthetic-local','public-pilot-fixture'].includes(p.presentation)||p.acceptance!==null||q.verificationBasis!=='synthetic')throw Error('Mexico CSV presentation mismatch');
 const view=p.directions[d];summarizeMexicoDirection(view);
 if(view.monthly.some(row=>real?row.originalSource===null:row.originalSource!==null))throw Error('Mexico CSV source mismatch');
 const status=p.presentation==='public-pilot-snapshot'?'public-pilot-snapshot':p.presentation==='public-pilot-fixture'?'synthetic-public-pilot-fixture':'unpublished';
 return {country_code:p.countryCode,country_name:p.countryName,direction:d,measure:view.measure,valuation_basis:view.basis,currency:'nominal USD',seasonal_adjustment:'not seasonally adjusted',source:real?'U.S. Census Bureau monthly merchandise files':'Synthetic development data',snapshot_start:p.from,snapshot_end:p.to,collection_started_at:p.captureInterval.startedAt,collection_finished_at:p.captureInterval.finishedAt,acceptance_scope:real?'private-all-goods':'synthetic-local',release_id:p.acceptance?.releaseId??'',accepted_at:p.acceptance?.acceptedAt??'',publication_status:status,verification_basis:q.verificationBasis,classification_accepted:q.classificationAccepted,product_comparisons_available:q.productComparisonsAvailable,current_before_matches:q.currentBeforeMatched,current_after_matches:q.currentAfterMatched,dated_reference_matches:q.datedMatched,dated_reference_differences:q.datedDifferences,vintage_relationship:q.vintageRelationship,difference_cause:q.differenceCause};
}
function publicationScope(p:MexicoProfileView):Record<string,string>{
 return p.presentation==='public-pilot-snapshot'||p.presentation==='public-pilot-fixture'?{publication_scope:'all-goods-only'}:{};
}
export function serializeMexicoMonthlyCsv(profile:MexicoProfileView,direction:MexicoDirection):string {
 const base=context(profile,direction);
 return csv(profile.directions[direction].monthly.map(p=>({...base,month:p.month,value_usd:p.valueUsd,value_status:p.valueUsd===null?'unavailable':'reported',original_source_url:p.originalSource?.url??'',original_source_captured_at:p.originalSource?.capturedAt??'',original_source_bytes:p.originalSource?.bytes??'',original_source_sha256:p.originalSource?.sha256??'',...publicationScope(profile)})));
}
export function serializeMexicoSummaryCsv(profile:MexicoProfileView,direction:MexicoDirection):string {
 const base=context(profile,direction),s=summarizeMexicoDirection(profile.directions[direction]);
 return csv([{...base,latest_month:s.latest.month,latest_value_usd:s.latest.valueUsd,prior_period_start:s.prior.from,prior_period_end:s.prior.to,prior_reported_months:s.prior.reportedMonths,prior_total_usd:s.prior.totalUsd,current_period_start:s.current.from,current_period_end:s.current.to,current_reported_months:s.current.reportedMonths,current_total_usd:s.current.totalUsd,change_usd:s.changeUsd,growth_percent:s.growthPercent,original_sources_json:JSON.stringify(profile.directions[direction].monthly.map(p=>({month:p.month,...p.originalSource}))),...publicationScope(profile)}]);
}
export function mexicoCsvFilename(profile:MexicoProfileView,direction:MexicoDirection,kind:'monthly'|'summary'):string {
 context(profile,direction);return 'mexico-2010-'+direction+'-2024-09-2026-08-'+profile.presentation+'-'+kind+'.csv';
}
