import {describe,expect,it} from 'vitest';
import fixture from '../fixtures/mexico-local-profile.json';
import {parseCsv} from '../helpers/parse-csv';
import {mexicoCsvFilename,serializeMexicoMonthlyCsv,serializeMexicoSummaryCsv} from '../../src/lib/mexico-profile/downloads';
import type {MexicoLocalProfile} from '../../src/lib/mexico-profile/types';
const profile=()=>structuredClone(fixture) as MexicoLocalProfile;
describe('Mexico local CSVs',()=>{
 it.each(['imports','exports'] as const)('exports all 24 %s months with explicit synthetic provenance',direction=>{const text=serializeMexicoMonthlyCsv(profile(),direction),rows=parseCsv(text);expect(rows).toHaveLength(24);expect(text.endsWith('\r\n')).toBe(true);expect(rows[0]).toMatchObject({country_code:'2010',country_name:'Mexico',direction,month:'2024-09',value_usd:direction==='imports'?'1000':'2000',value_status:'reported',currency:'nominal USD',seasonal_adjustment:'not seasonally adjusted',source:'Synthetic development data',acceptance_scope:'synthetic-local',release_id:'',accepted_at:'',publication_status:'unpublished',verification_basis:'synthetic',classification_accepted:'false',product_comparisons_available:'false',dated_reference_matches:'16',dated_reference_differences:'32',vintage_relationship:'not-established',difference_cause:'not-established',original_source_url:'',original_source_sha256:''});expect(rows[23].month).toBe('2026-08');expect(rows[23].value_usd).toBe(direction==='imports'?'3300':'6600');});
 it.each(['imports','exports'] as const)('exports one %s summary with exact periods and unrounded growth',direction=>{const rows=parseCsv(serializeMexicoSummaryCsv(profile(),direction));expect(rows).toHaveLength(1);const factor=direction==='imports'?1:2;expect(rows[0]).toMatchObject({direction,prior_period_start:'2024-09',prior_period_end:'2025-08',current_period_start:'2025-09',current_period_end:'2026-08',prior_reported_months:'12',current_reported_months:'12',prior_total_usd:String(18600*factor),current_total_usd:String(33000*factor),change_usd:String(14400*factor),growth_percent:String(14400/18600*100),latest_month:'2026-08'});expect(JSON.parse(rows[0].original_sources_json)).toHaveLength(24);});
 it('preserves missing versus zero and unavailable totals in CSV',()=>{const x=profile();x.directions.imports.monthly[0].valueUsd=0;x.directions.imports.monthly[1].valueUsd=null;const rows=parseCsv(serializeMexicoMonthlyCsv(x,'imports'));expect(rows[0]).toMatchObject({value_usd:'0',value_status:'reported'});expect(rows[1]).toMatchObject({value_usd:'',value_status:'unavailable'});expect(parseCsv(serializeMexicoSummaryCsv(x,'imports'))[0]).toMatchObject({prior_total_usd:'',prior_reported_months:'11',change_usd:'',growth_percent:''});});
 it('exports exact real acceptance and all original source descriptors without private envelopes',()=>{const x=profile();x.source='census';x.presentation='accepted-private-local';x.acceptance={scope:'private-all-goods',releaseId:'2026-08-d15a1fdc-2f1c-4d39-8532-7bb8451ddf18',acceptedAt:'2026-10-19T04:12:15.203Z'};x.qualifications.verificationBasis='prior-reviewed-retained-evidence';for(const d of ['imports','exports'] as const)for(const p of x.directions[d].monthly)p.originalSource={url:'https://www.census.gov/trade/downloads/'+d+'-'+p.month+'.ZIP',capturedAt:'2026-10-11T13:08:24.810529-04:00',bytes:123,sha256:'a'.repeat(64)};const rows=parseCsv(serializeMexicoMonthlyCsv(x,'exports'));expect(rows[0]).toMatchObject({acceptance_scope:'private-all-goods',release_id:x.acceptance.releaseId,accepted_at:x.acceptance.acceptedAt,original_source_bytes:'123',original_source_sha256:'a'.repeat(64),original_source_captured_at:'2026-10-11T13:08:24.810529-04:00'});const summary=parseCsv(serializeMexicoSummaryCsv(x,'exports'))[0];expect(JSON.parse(summary.original_sources_json)[0]).toMatchObject({month:'2024-09',url:rows[0].original_source_url});expect(JSON.stringify(summary)).not.toMatch(/authorization|candidateBytes|evidenceFiles/);});
 it('rejects fixture data pretending to be privately accepted',()=>{const x=profile();x.acceptance={scope:'private-all-goods',releaseId:'fake',acceptedAt:'2026-10-19T00:00:00.000Z'};expect(()=>serializeMexicoMonthlyCsv(x,'imports')).toThrow();expect(()=>serializeMexicoSummaryCsv(x,'imports')).toThrow();});
 it('rejects a presentation with product comparisons enabled',()=>{const x:any=profile();x.qualifications.productComparisonsAvailable=true;expect(()=>serializeMexicoMonthlyCsv(x,'imports')).toThrow();});
 it('quotes commas, double quotes and embedded newlines, and protects string formula cells',()=>{const x=profile();x.captureInterval.startedAt='=1+2';x.captureInterval.finishedAt='test, "quoted"\nline';const rows=parseCsv(serializeMexicoMonthlyCsv(x,'imports'));expect(rows[0].collection_started_at).toBe("'=1+2");expect(rows[0].collection_finished_at).toBe('test, "quoted"\nline');});
 it('keeps negative numeric changes numeric',()=>{const x=profile();for(const p of x.directions.imports.monthly.slice(12))p.valueUsd=1;expect(parseCsv(serializeMexicoSummaryCsv(x,'imports'))[0].change_usd).toBe('-18588');});
 it('names downloads with exact country, window, direction and local context',()=>{expect(mexicoCsvFilename(profile(),'exports','monthly')).toBe('mexico-2010-exports-2024-09-2026-08-synthetic-local-monthly.csv');});
});

import {createHash} from 'node:crypto';
import {projectMexicoPilotProfile} from '../../src/lib/mexico-profile/presentation';
const legacyHashes:Record<string,string>={
 'imports-monthly':'3131cc9767c1c00e8832bd7aad5060279de1465455775d2f75d4c0212b70e341',
 'imports-summary':'2fb4a2cea42d4f10cdf1336c366244bfc9bf17da3fcf73a9be1b7c861fb42e1f',
 'exports-monthly':'dbb29ef9482f697c76e2479f4ec66517364719525035cfd0272844be09812efd',
 'exports-summary':'d4653828eb7a29c868f1841e965d5b4050960ea19326100b75619da8fbca2e39',
};
function pilotReal(){
 const p=profile();p.source='census';p.presentation='accepted-private-local';p.acceptance={scope:'private-all-goods',releaseId:'2026-08-d15a1fdc-2f1c-4d39-8532-7bb8451ddf18',acceptedAt:'2026-10-19T04:12:15.203Z'};p.qualifications.verificationBasis='prior-reviewed-retained-evidence';
 for(const d of ['imports','exports'] as const)for(const row of p.directions[d].monthly)row.originalSource={url:'https://www.census.gov/trade/downloads/'+d+'-'+row.month+'.ZIP',capturedAt:'2026-10-01T00:00:00.000Z',bytes:123,sha256:'a'.repeat(64)};
 return projectMexicoPilotProfile(p,'snapshot');
}
describe('Mexico public CSV context',()=>{
 it.each(['imports','exports'] as const)('preserves exact existing local CSV bytes: %s',direction=>{
  for(const kind of ['monthly','summary'] as const){const text=kind==='monthly'?serializeMexicoMonthlyCsv(profile(),direction):serializeMexicoSummaryCsv(profile(),direction);expect(createHash('sha256').update(text).digest('hex')).toBe(legacyHashes[direction+'-'+kind]);}
 });
 it.each(['imports','exports'] as const)('publishes both sourced %s CSVs with explicit separate scope',direction=>{
  const p=pilotReal(),monthly=serializeMexicoMonthlyCsv(p,direction),summary=serializeMexicoSummaryCsv(p,direction);
  const rows=parseCsv(monthly),s=parseCsv(summary)[0];
  expect(rows).toHaveLength(24);expect(monthly.split('\r\n')[0].split(',').at(-1)).toBe('publication_scope');expect(summary.split('\r\n')[0].split(',').at(-1)).toBe('publication_scope');
  expect(rows[0]).toMatchObject({direction,acceptance_scope:'private-all-goods',publication_status:'public-pilot-snapshot',publication_scope:'all-goods-only',product_comparisons_available:'false',classification_accepted:'false',value_usd:direction==='imports'?'1000':'2000',original_source_bytes:'123'});
  expect(rows[23]).toMatchObject({month:'2026-08',value_usd:direction==='imports'?'3300':'6600'});
  expect(s).toMatchObject({publication_status:'public-pilot-snapshot',publication_scope:'all-goods-only',prior_total_usd:direction==='imports'?'18600':'37200',current_total_usd:direction==='imports'?'33000':'66000'});
  expect(JSON.parse(s.original_sources_json)).toHaveLength(24);
  expect(mexicoCsvFilename(p,direction,'summary')).toBe('mexico-2010-'+direction+'-2024-09-2026-08-public-pilot-snapshot-summary.csv');
 });
 it('public fixture cannot claim real acceptance or source identities',()=>{
  const p=projectMexicoPilotProfile(profile(),'fixture'),rows=parseCsv(serializeMexicoMonthlyCsv(p,'imports'));
  expect(rows[0]).toMatchObject({publication_status:'synthetic-public-pilot-fixture',publication_scope:'all-goods-only',acceptance_scope:'synthetic-local',release_id:'',accepted_at:'',original_source_url:'',original_source_captured_at:'',original_source_bytes:'',original_source_sha256:''});
  expect(JSON.parse(parseCsv(serializeMexicoSummaryCsv(p,'exports'))[0].original_sources_json)[0]).toEqual({month:'2024-09'});
 });
 it.each(['source','presentation','acceptance','products'])('rejects crossed public CSV semantics: %s',change=>{
  const p:any=pilotReal();if(change==='source')p.source='fixture';if(change==='presentation')p.presentation='public-pilot-fixture';if(change==='acceptance')p.acceptance.scope='public-products';if(change==='products')p.qualifications.productComparisonsAvailable=true;
  expect(()=>serializeMexicoMonthlyCsv(p,'imports')).toThrow();expect(()=>serializeMexicoSummaryCsv(p,'exports')).toThrow();
 });
});
