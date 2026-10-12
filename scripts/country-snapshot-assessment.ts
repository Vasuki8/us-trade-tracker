import {canadaSnapshotContract as contract} from './country-snapshot-contract';
import {compareCountryReferences} from './country-publications';
import {snapshotObject,snapshotArray,snapshotUsd,snapshotFileIdentity} from './country-snapshot-input';
import type {ClassificationEntry,ClassificationSource,ReviewedCollection,SnapshotContext,SnapshotAssessment,MonthlySnapshotAssessment,CandidateMonth,CandidatePeriod,ReferenceEvidence,SnapshotDirection} from './country-snapshot-types';

export function specialSnapshotCode(direction:SnapshotDirection,code:string):boolean {
  return /^(98|99)/.test(code)||(direction==='exports'&&code==='880000');
}
export function parseSnapshotClassificationLedger(value:unknown):readonly ClassificationEntry[]{
  const ledger=snapshotObject(value);
  if(ledger.schemaVersion!==1||ledger.policyId!==contract.policyId)throw new Error('classification-version');
  const expected=new Set(Object.entries(contract.candidates).flatMap(([d,codes])=>codes.filter(c=>!specialSnapshotCode(d as SnapshotDirection,c)).map(c=>d+'-'+c)));
  const seen=new Set<string>();
  const entries=snapshotArray(ledger.entries).map(value=>{
    const e=snapshotObject(value),key=e.direction+'-'+e.code;
    if(!expected.has(key)||seen.has(key)||!['compatible','incompatible','unverified'].includes(String(e.status)))throw new Error('classification-key');
    seen.add(key);
    if(typeof e.from!=='string'||typeof e.to!=='string'||!contract.months.includes(e.from)||!contract.months.includes(e.to)||e.from>e.to||typeof e.reason!=='string'||!e.reason.trim()||typeof e.scopeConclusion!=='string'||!e.scopeConclusion.trim())throw new Error('classification-interval');
    const sources=snapshotArray(e.sources).map(value=>{
      const s=snapshotObject(value),identity=snapshotFileIdentity(s);
      if(typeof s.url!=='string'||!/^https:\/\/(www\.)?(census\.gov|usitc\.gov|hts\.usitc\.gov)\//.test(s.url)||typeof s.locator!=='string'||!s.locator.trim()||!['definition-and-notes','dated-change','historical-code-screen','annual-concordance'].includes(String(s.kind))||!identity.path.startsWith('data/backups/')||identity.path.split(/[\\/]/).includes('..'))throw new Error('classification-source');
      return {...identity,url:s.url,locator:s.locator,kind:s.kind as ClassificationSource['kind']};
    });
    if(!sources.length||(e.status==='compatible'&&(!sources.some(s=>s.kind==='definition-and-notes')||!sources.some(s=>s.kind==='dated-change'))))throw new Error('classification-scope-evidence');
    return {direction:e.direction as SnapshotDirection,code:String(e.code),from:e.from,to:e.to,status:e.status as ClassificationEntry['status'],reason:e.reason,sources,scopeConclusion:e.scopeConclusion};
  });
  if(seen.size!==expected.size)throw new Error('classification-incomplete');return entries;
}
function sumUsd(values:readonly number[]):number {
  let total=0;for(const value of values)total=snapshotUsd(total+snapshotUsd(value));return total;
}
function referenceOutcome(total:number,e:ReferenceEvidence){
  snapshotUsd(e.currentUsd);if(e.publicationUsd!==undefined)snapshotUsd(e.publicationUsd);
  if(e.quantumUsd!==100000||e.currentUsd%100000||(e.publicationUsd!==undefined&&e.publicationUsd%100000))throw new Error('reference-precision');
  return {...e,...compareCountryReferences(total,e.currentUsd,e.publicationUsd),currentDifferenceUsd:total-e.currentUsd,publicationDifferenceUsd:e.publicationUsd===undefined?null:total-e.publicationUsd};
}
export async function assessCountrySnapshot(collection:ReviewedCollection,contexts:AsyncIterable<SnapshotContext>,classifications:readonly ClassificationEntry[]):Promise<SnapshotAssessment>{
  const entries=parseSnapshotClassificationLedger({schemaVersion:1,policyId:contract.policyId,entries:classifications});
  const months:MonthlySnapshotAssessment[]=[],seen=new Set<string>(),observations=new Map<string,CandidateMonth[]>(),descriptions=new Map<string,string|null>();
  let completed=true;
  try {
    if(collection.policyId!==contract.policyId||collection.contexts.length!==48)throw new Error('collection-contract');
    for await(const c of contexts){
      const id=`${c.direction}-${c.month}`;
      if(c.id!==id||!contract.months.includes(c.month)||!['imports','exports'].includes(c.direction)||seen.has(id)||c.measure!==(c.direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO')||!collection.contexts.some(x=>x.id===id))throw new Error('context-grid');
      seen.add(id);const keys=new Set<string>();
      for(const r of c.rows){
        if(!/^\d{6}$/.test(r.code)||keys.has(r.code)||typeof r.specialAtCapture!=='boolean'||!Number.isSafeInteger(r.detailRecordCount)||r.detailRecordCount<1)throw new Error('invalid-row');
        keys.add(r.code);snapshotUsd(r.valueUsd);
      }
      const total=snapshotUsd(c.countryTotalUsd),sum=sumUsd(c.rows.map(r=>r.valueUsd));
      if(sum!==total)throw new Error('arithmetic-residual');
      const requiredPublication=c.direction==='exports'&&c.month>='2026-01'&&c.month<='2026-07';
      if((c.beforeReference.publicationUsd!==undefined)!==requiredPublication||(c.afterReference.publicationUsd!==undefined)!==requiredPublication)throw new Error('publication-grid');
      months.push({id:c.id,month:c.month,direction:c.direction,measure:c.measure,sumUsd:sum,countryTotalUsd:total,residualUsd:0,beforeReference:referenceOutcome(total,c.beforeReference),afterReference:referenceOutcome(total,c.afterReference)});
      for(const code of contract.candidates[c.direction]){
        const key=c.direction+'-'+code,row=c.rows.find(r=>r.code===code),entry=entries.find(e=>e.direction===c.direction&&e.code===code);
        const specialByPolicy=specialSnapshotCode(c.direction,code),qualified=entry?.status==='compatible'&&c.month>=entry.from&&c.month<=entry.to&&!specialByPolicy&&total>0;
        const retained=observations.get(key)??[];
        retained.push({month:c.month,valueUsd:row?.valueUsd??null,countryTotalUsd:total,specialAtCapture:row?.specialAtCapture??null,specialByPolicy,sharePercent:qualified&&row?100*row.valueUsd/total:null});
        observations.set(key,retained);if(row&&!descriptions.has(key))descriptions.set(key,row.description);
      }
    }
    if(seen.size!==48||contract.months.some(m=>['imports','exports'].some(d=>!seen.has(d+'-'+m))))throw new Error('incomplete-grid');
    for(const direction of ['imports','exports'])for(const current of [false,true]){
      const selected=months.filter(m=>m.direction===direction&&(m.month>='2025-09')===current);
      sumUsd(selected.map(m=>m.countryTotalUsd));
    }
  }catch{completed=false;}
  const candidates=Object.entries(contract.candidates).flatMap(([d,codes])=>codes.map(code=>{
    const direction=d as SnapshotDirection,key=d+'-'+code,classification=entries.find(e=>e.direction===direction&&e.code===code)??null;
    const retained=observations.get(key)??[];
    const rows=contract.months.map(month=>retained.find(m=>m.month===month)??{month,valueUsd:null,countryTotalUsd:null,specialAtCapture:null,specialByPolicy:specialSnapshotCode(direction,code),sharePercent:null});
    if(!completed)for(const m of rows)m.sharePercent=null;
    function period(from:string,to:string):CandidatePeriod {
      const selected=rows.filter(m=>m.month>=from&&m.month<=to),reportedMonths=selected.filter(m=>m.valueUsd!==null).length;
      const boundedSum=(values:readonly number[])=>{try{return sumUsd(values);}catch{return null;}};
      const observedSumUsd=reportedMonths===12?boundedSum(selected.map(m=>m.valueUsd!)):null;
      const countryTotalUsd=selected.length===12&&selected.every(m=>m.countryTotalUsd!==null&&m.countryTotalUsd>0)?boundedSum(selected.map(m=>m.countryTotalUsd!)):null;
      const qualified=completed&&selected.every(m=>m.sharePercent!==null)&&observedSumUsd!==null&&countryTotalUsd!==null;
      return {from,to,reportedMonths,observedSumUsd,countryTotalUsd,sharePercent:qualified?100*observedSumUsd/countryTotalUsd:null};
    }
    const prior=period('2024-09','2025-08'),current=period('2025-09','2026-08');
    const comparisonEligible=prior.sharePercent!==null&&current.sharePercent!==null;
    const reason=!completed?'archive-integrity-failed':specialSnapshotCode(direction,code)?'statistical-category':classification?.status!=='compatible'?`classification-${classification?.status??'unverified'}`:classification.from>'2024-09'||classification.to<'2026-08'?'classification-interval-incomplete':prior.reportedMonths!==12||current.reportedMonths!==12?'missing-product-months':prior.countryTotalUsd===null||current.countryTotalUsd===null?'invalid-country-denominator':'eligible-offline-only';
    return {direction,code,description:descriptions.get(key)??null,months:rows,classification,comparisonEligible,reason,current,prior,growthPercent:comparisonEligible&&prior.observedSumUsd!>0?100*(current.observedSumUsd!-prior.observedSumUsd!)/prior.observedSumUsd!:null,sharePointChange:comparisonEligible?current.sharePercent!-prior.sharePercent!:null};
  }));
  return {schemaVersion:1,policyId:contract.policyId,completed,archiveIntegrity:completed?'passed':'failed',failureReason:completed?null:'invalid-or-incomplete-archive',processingCommit:null,inputProvenance:{policyId:collection.policyId,anchors:collection.anchors,sourceProcessingCommit:collection.sourceProcessingCommit,parserProcessingCommit:collection.parserProcessingCommit,captureInterval:collection.captureInterval,rawVerification:collection.rawVerification,strictAuditVerdicts:collection.strictAuditVerdicts,snapshotStability:collection.snapshotStability,originals:collection.contexts.map(c=>c.original),normalizedFiles:collection.contexts.flatMap(c=>[c.rowsFile,c.receiptFile])},strictAuditVerdicts:collection.strictAuditVerdicts,months,candidates,classificationLedgerIdentity:null,releaseAccepted:false,rollingComparisonsAvailable:false,defaultAuditRetrievalChanged:false};
}
