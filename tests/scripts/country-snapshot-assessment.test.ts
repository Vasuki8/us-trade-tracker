import {describe,expect,it} from 'vitest';
import {assessCountrySnapshot,parseSnapshotClassificationLedger} from '../../scripts/country-snapshot-assessment';
import type {ClassificationEntry,ReviewedCollection,SnapshotContext} from '../../scripts/country-snapshot-types';
import {snapshotMonths,snapshotCandidates} from '../helpers/country-snapshot-data';

export function classifications(status:ClassificationEntry['status']='compatible'):ClassificationEntry[]{
  return Object.entries(snapshotCandidates).flatMap(([direction,codes])=>codes.filter(code=>!code.startsWith('98')&&code!=='880000').map(code=>({direction:direction as ClassificationEntry['direction'],code,from:'2024-09',to:'2026-08',status,reason:'Hand-reviewed fixture scope across both windows',scopeConclusion:'No transfer of parent scope across fixture months',sources:['definition-and-notes','dated-change'].map(kind=>({kind:kind as ClassificationEntry['sources'][number]['kind'],url:'https://www.census.gov/fixture',path:'data/backups/canada-country-audit/classification-references-2026-10-11/source.html',bytes:1,sha256:'a'.repeat(64),locator:'Fixture paragraph 1'}))})));
}
export function calculationFixture(){
  const contexts:SnapshotContext[]=snapshotMonths.flatMap((month,index)=>['imports','exports'].map(direction=>{
    const isPrior=index<12,countryTotalUsd=isPrior?1000000:2000000;
    const reference={currentUsd:countryTotalUsd,quantumUsd:100000 as const,publicationUsd:direction==='exports'&&month>='2026-01'&&month<='2026-07'?countryTotalUsd:undefined,sourceFiles:[],sourceUrl:'https://www.census.gov/fixture',capturedAt:'2026-10-11T17:00:00Z',publicationSource:null,recordedComparison:{}};
    return {id:`${direction}-${month}`,month,direction,measure:direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO',countryTotalUsd,rows:[{code:'270900',description:'Crude',valueUsd:isPrior?100000:300000,detailRecordCount:1,specialAtCapture:false},{code:'880000',description:'Aircraft',valueUsd:0,detailRecordCount:1,specialAtCapture:false},{code:'000001',description:'Remainder',valueUsd:isPrior?900000:1700000,detailRecordCount:1,specialAtCapture:false}],beforeReference:{...reference},afterReference:{...reference}} as SnapshotContext;
  }));
  const collection={policyId:'canada-archive-snapshot-v1',repoRoot:process.cwd(),anchors:[],sourceProcessingCommit:'a'.repeat(40),parserProcessingCommit:'b'.repeat(40),captureInterval:{startedAt:'2026-10-11T17:00:00Z',finishedAt:'2026-10-11T18:00:00Z'},rawVerification:'previous-reviewed-replay',strictAuditVerdicts:{original:{sourceCoverage:'failed'},inventory:{sourceCoverage:'failed'}},snapshotStability:'stable',contexts:contexts.map(c=>({...c,original:{},rowsFile:{path:'rows',bytes:1,sha256:'a'.repeat(64)},receiptFile:{path:'receipt',bytes:1,sha256:'b'.repeat(64)},expectedSumUsd:c.countryTotalUsd,expectedCountryTotalUsd:c.countryTotalUsd,expectedRows:c.rows.length}))} satisfies ReviewedCollection;
  return {contexts,collection};
}
export async function* stream(contexts:readonly SnapshotContext[]){yield* contexts;}
describe('archive assessment and candidate qualification',()=>{
  it('uses summed same-archive denominators and keeps publication/release separate',async()=>{
    const f=calculationFixture();const result=await assessCountrySnapshot(f.collection,stream(f.contexts),classifications());
    expect(result).toMatchObject({completed:true,archiveIntegrity:'passed',releaseAccepted:false,rollingComparisonsAvailable:false,defaultAuditRetrievalChanged:false,classificationLedgerIdentity:null});
    expect(result.months).toHaveLength(48);expect(result.candidates).toHaveLength(20);
    expect(result.candidates[0]).toMatchObject({comparisonEligible:true,current:{observedSumUsd:3600000,reportedMonths:12,countryTotalUsd:24000000,sharePercent:15},prior:{observedSumUsd:1200000,countryTotalUsd:12000000,sharePercent:10},growthPercent:200,sharePointChange:5});
    const aircraft=result.candidates.find(c=>c.direction==='exports'&&c.code==='880000')!;
    expect(aircraft.comparisonEligible).toBe(false);expect(aircraft.months[0]).toMatchObject({valueUsd:0,specialAtCapture:false,specialByPolicy:true,sharePercent:null});
  });
  it('preserves the May mismatch despite exact arithmetic and original corroboration',async()=>{
    const f=calculationFixture(),may=f.contexts.find(c=>c.id==='exports-2026-05')!;
    may.countryTotalUsd=29790835759;may.rows=[{...may.rows[0],valueUsd:29790835759}];
    for(const reference of [may.beforeReference,may.afterReference]){reference.currentUsd=30399000000;reference.publicationUsd=29790800000;}
    const result=await assessCountrySnapshot(f.collection,stream(f.contexts),classifications());const m=result.months.find(c=>c.id===may.id)!;
    expect(m.sumUsd).toBe(29790835759);expect(m.beforeReference.currentDifferenceUsd).toBe(-608164241);expect(m.afterReference.currentDifferenceUsd).toBe(-608164241);expect(m.afterReference.publicationDifferenceUsd).toBe(35759);expect(m.afterReference.referenceCheck).toBe('mismatch');expect(m.afterReference.publicationCheck).toBe('matched');expect(result.archiveIntegrity).toBe('passed');expect(result.releaseAccepted).toBe(false);
  });
  it('weights rolling shares rather than averaging monthly shares',async()=>{
    const f=calculationFixture(),c=f.contexts.find(c=>c.id==='imports-2025-09')!;
    c.countryTotalUsd=1000000;c.rows=[{...c.rows[0],valueUsd:300000},{...c.rows[2],valueUsd:700000}];
    const result=await assessCountrySnapshot(f.collection,stream(f.contexts),classifications());expect(result.candidates[0].current.sharePercent).toBeCloseTo(15.652173913043478,10);
  });
  it.each(['missing','duplicate','residual','unsafe','measure','reference'] as const)('fails complete integrity for %s input',async(mode)=>{
    const f=calculationFixture();
    if(mode==='missing')f.contexts.pop();if(mode==='duplicate')f.contexts[1]=f.contexts[0];
    if(mode==='residual')f.contexts[0].countryTotalUsd++;
    if(mode==='unsafe')f.contexts[0].rows=[{...f.contexts[0].rows[0],valueUsd:Number.MAX_SAFE_INTEGER+1}];
    if(mode==='measure')f.contexts[0].measure='ALL_VAL_MO';
    if(mode==='reference')(f.contexts[0].beforeReference as unknown as Record<string,unknown>).currentUsd=null;
    const result=await assessCountrySnapshot(f.collection,stream(f.contexts),classifications());expect(result.completed).toBe(false);expect(result.archiveIntegrity).toBe('failed');expect(result.candidates.every(c=>!c.comparisonEligible)).toBe(true);
  });
  it('distinguishes missing product months, returned zero and zero prior growth',async()=>{
    const f=calculationFixture();for(const c of f.contexts.filter(c=>c.direction==='imports')){const product=c.rows[0],rest=c.rows[2];if(c.month<'2025-09'){c.rows=[{...product,valueUsd:0},{...rest,valueUsd:c.countryTotalUsd}];}}
    let result=await assessCountrySnapshot(f.collection,stream(f.contexts),classifications());expect(result.candidates[0].prior).toMatchObject({observedSumUsd:0,reportedMonths:12,sharePercent:0});expect(result.candidates[0].growthPercent).toBeNull();
    const c=f.contexts[0];c.rows=[{code:'000001',description:'Remainder',valueUsd:c.countryTotalUsd,detailRecordCount:1,specialAtCapture:false}];result=await assessCountrySnapshot(f.collection,stream(f.contexts),classifications());expect(result.candidates[0].prior).toMatchObject({observedSumUsd:null,reportedMonths:11,sharePercent:null});expect(result.candidates[0].months[0].valueUsd).toBeNull();
  });
  it.each(['unverified','incompatible'] as const)('blocks %s classification without failing aggregate integrity',async(status)=>{const f=calculationFixture();const r=await assessCountrySnapshot(f.collection,stream(f.contexts),classifications(status));expect(r.archiveIntegrity).toBe('passed');expect(r.candidates[0]).toMatchObject({comparisonEligible:false,growthPercent:null,sharePointChange:null});expect(r.candidates[0].current.sharePercent).toBeNull();});
  it('keeps a reconciled zero denominator unavailable',async()=>{const f=calculationFixture(),c=f.contexts[0];c.countryTotalUsd=0;c.rows=c.rows.map(r=>({...r,valueUsd:0}));c.beforeReference.currentUsd=0;c.afterReference.currentUsd=0;const r=await assessCountrySnapshot(f.collection,stream(f.contexts),classifications());expect(r.archiveIntegrity).toBe('passed');expect(r.candidates[0].prior.countryTotalUsd).toBeNull();expect(r.candidates[0].comparisonEligible).toBe(false);});
  it('fails safely when valid monthly dollars overflow a rolling total',async()=>{const f=calculationFixture();for(const c of f.contexts){c.countryTotalUsd=2000000000000000;c.rows=[{...c.rows[0],valueUsd:c.countryTotalUsd}];for(const ref of [c.beforeReference,c.afterReference]){ref.currentUsd=c.countryTotalUsd;if(ref.publicationUsd!==undefined)ref.publicationUsd=c.countryTotalUsd;}}const r=await assessCountrySnapshot(f.collection,stream(f.contexts),classifications());expect(r.completed).toBe(false);expect(r.candidates.every(c=>!c.comparisonEligible)).toBe(true);});
  it('applies inclusive classification boundaries to monthly qualification',async()=>{
    const f=calculationFixture(),entries=classifications();entries[0].from='2024-10';entries[0].to='2026-07';const r=await assessCountrySnapshot(f.collection,stream(f.contexts),entries);
    expect(r.candidates[0].comparisonEligible).toBe(false);expect(r.candidates[0].months[0].sharePercent).toBeNull();expect(r.candidates[0].months[1].sharePercent).toBe(10);expect(r.candidates[0].months[23].sharePercent).toBeNull();
  });
  it('rejects classification ledgers with wrong keys, duplicate entries or unsupported compatibility',()=>{
    const entries=classifications();const ledger={schemaVersion:1,policyId:'canada-archive-snapshot-v1',entries};expect(parseSnapshotClassificationLedger(ledger)).toHaveLength(17);
    expect(()=>parseSnapshotClassificationLedger({...ledger,entries:entries.slice(1)})).toThrow();expect(()=>parseSnapshotClassificationLedger({...ledger,entries:[...entries.slice(1),entries[1]]})).toThrow();
    expect(()=>parseSnapshotClassificationLedger({...ledger,entries:entries.map(e=>({...e,sources:e.sources.filter(s=>s.kind!=='definition-and-notes')}))})).toThrow();
    expect(()=>parseSnapshotClassificationLedger({...ledger,entries:entries.map(e=>({...e,from:'2026-13'}))})).toThrow();
  });
});
