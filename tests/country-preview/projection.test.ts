import {describe,it,expect} from 'vitest';
import {projectRetainedAssessment,validateRetainedAssessment} from '../../src/lib/country-preview/project.server';
import {makeCountryAssessmentFixture,previewCodes} from '../helpers/country-preview-data';
describe('reviewed Canada assessment projection',()=>{
  it('preserves selected products, statistical exclusions and same-archive amounts',()=>{
    const r=projectRetainedAssessment(makeCountryAssessmentFixture());
    expect(r.source).toBe('retained');expect(r.directions.imports.monthly).toHaveLength(24);expect(r.directions.exports.monthly).toHaveLength(24);
    expect(r.directions.imports.products.map(p=>p.code)).toEqual(previewCodes.imports);expect(r.directions.exports.products.map(p=>p.code)).toEqual(previewCodes.exports);
    expect(r.directions.imports.products[0]).toMatchObject({code:'270900',current:{observedSumUsd:240000,countryTotalUsd:2400000,sharePercent:10},prior:{observedSumUsd:120000,countryTotalUsd:1200000,sharePercent:10},changeUsd:120000,growthPercent:100,sharePointChange:0});
    expect(r.directions.imports.products[1]).toMatchObject({code:'980100',specialByPolicy:true,comparisonEligible:false,changeUsd:null,growthPercent:null,sharePointChange:null,current:{observedSumUsd:216000,sharePercent:null}});
    expect(r.directions.exports.products[2].classification.status).toBe('statistical-category');
    expect(r.directions.exports.summary).toMatchObject({prior:{totalUsd:3600000},current:{totalUsd:4600000},changeUsd:1000000});
    expect(r.directions.imports.monthly[0].originalSource).toMatchObject({month:'2024-09',url:'https://www.census.gov/trade/downloads/2024/Merch/im_m/IMDB2409.ZIP',bytes:100,sha256:'c'.repeat(64)});
  });
  it('keeps current mismatches and publication outcomes separate',()=>{
    const r=projectRetainedAssessment(makeCountryAssessmentFixture());
    expect(r.directions.imports.references).toMatchObject({before:{matched:24,mismatch:0},after:{matched:24,mismatch:0},publication:{matched:0,notReviewed:24},differences:[]});
    expect(r.directions.exports.references).toMatchObject({before:{matched:17,mismatch:7},after:{matched:17,mismatch:7},publication:{matched:7,notReviewed:17}});
    expect(r.directions.exports.references.differences[4]).toMatchObject({month:'2026-05',archiveUsd:400000,currentBeforeUsd:500000,differenceBeforeUsd:-100000,publicationCheck:'matched'});
    expect(r.directions.exports.references.differences[4]).toMatchObject({publicationSource:{url:'https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2605.pdf',bytes:100,sha256:'a'.repeat(64)}});
  });
  it('projects neither full classification bindings nor local source paths',()=>{
    const r=projectRetainedAssessment(makeCountryAssessmentFixture()),body=JSON.stringify(r);
    expect(body).not.toContain('data/backups/');expect(body).not.toContain('normalizedFiles');expect(body).not.toContain('definition.pdf');expect(body).not.toContain('specialAtCapture');
    expect(r.directions.imports.products[0]).not.toHaveProperty('months');expect(r.availability).toEqual({releaseAccepted:false,rollingComparisonsAvailable:false,defaultAuditRetrievalChanged:false});
  });
  const mutations:Record<string,(v:ReturnType<typeof makeCountryAssessmentFixture>)=>void>={
    policy:v=>{(v as unknown as Record<string,unknown>).policyId='other';},commit:v=>{v.processingCommit='a'.repeat(40);},ledger:v=>{v.classificationLedgerIdentity!.sha256='0'.repeat(64);},missing:v=>{(v.months as unknown[]).pop();},duplicate:v=>{(v.months as unknown[])[1]=v.months[0];},measure:v=>{v.months[0].measure='ALL_VAL_MO';},unsafe:v=>{v.months[0].countryTotalUsd=Number.MAX_SAFE_INTEGER+1;},residual:v=>{v.months[0].residualUsd=1;},crossed:v=>{v.inputProvenance.originals[0].context_id='exports-2024-09';},source:v=>{v.inputProvenance.originals[0].source_url='https://example.com/wrong.zip';},order:v=>{(v.candidates as unknown[])[1]=v.candidates[0];},period:v=>{v.candidates[0].prior.to='2025-07';},incomplete:v=>{v.candidates[0].current.reportedMonths=11;},statistical:v=>{v.candidates[1].comparisonEligible=true;},nonfinite:v=>{v.candidates[0].growthPercent=NaN;},availability:v=>{(v as unknown as Record<string,unknown>).releaseAccepted=true;},classification:v=>{v.candidates[0].classification!.status='unverified';},denominator:v=>{v.candidates[0].current.countryTotalUsd=123;},zeroDenominator:v=>{v.months[0].countryTotalUsd=0;v.months[0].sumUsd=0;},falseComplete:v=>{v.completed=false;},badReference:v=>{v.months[0].beforeReference.referenceCheck='mismatch';},badOriginal:v=>{v.inputProvenance.originals[0].sha256='bad';}
  };
  mutations.crossedPublication=v=>{v.months.find(m=>m.id==='exports-2026-05')!.beforeReference.publicationSource!.month='2026-04';};
  it.each(Object.keys(mutations))('rejects %s contract corruption',key=>{const v=makeCountryAssessmentFixture();mutations[key](v);expect(()=>validateRetainedAssessment(v)).toThrow();});
});
