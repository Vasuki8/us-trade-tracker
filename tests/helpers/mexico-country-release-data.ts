import {createHash} from 'node:crypto';
import {vi} from 'vitest';
import approved from '../../docs/superpowers/plans/2026-10-18-mexico-all-goods-acceptance-recovery-inputs.json';
import {mexicoContract} from '../../src/lib/mexico-country-release/contract.server';
export const bytes=(v:unknown)=>Buffer.from(JSON.stringify(v)+'\n');
export const digest=(b:Buffer)=>({bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')});
export const sourceCommit='52e4157ee5a223716d620804b2a9203fc49cec5c';
export const ids=Array.from({length:24},(_,i)=>new Date(Date.UTC(2024,8+i,1)).toISOString().slice(0,7)).flatMap(m=>['imports-'+m,'exports-'+m]);
export const pairs=[
 ['imports','847150'],['imports','870431'],['imports','870323'],['imports','851762'],['imports','870322'],
 ['imports','854430'],['imports','852872'],['imports','853710'],['imports','980100'],['imports','847170'],
 ['exports','847330'],['exports','271012'],['exports','271019'],['exports','847150'],['exports','854231'],
 ['exports','988000'],['exports','852351'],['exports','880000'],['exports','271121'],['exports','100590'],
] as const;
export function edit(files:Map<string,Buffer>,name:string,change:(value:any)=>void){
 const v=JSON.parse(files.get(name)!.toString());change(v);files.set(name,bytes(v));
}
function seals(files:Map<string,Buffer>){
 for(const anchor of ['reassessment','reference']){
  const rows=approved.members.filter(p=>p.anchor===anchor&&p.sealedMember!=='final-proof-manifest.json')
   .map(p=>({path:p.sealedMember!,...digest(files.get(p.name)!)}));
  files.set(anchor+'-seal.json',bytes({schemaVersion:1,files:rows}));
 }
}
export function installMexicoFixture(files:Map<string,Buffer>){
 seals(files);
 const pins=approved.members.map(p=>({...p,...digest(files.get(p.name)!)}));
 vi.spyOn(mexicoContract,'pins','get').mockReturnValue(pins);
 vi.spyOn(mexicoContract,'source','get').mockReturnValue('fixture');return pins;
}
export function makeMexicoEvidenceFixture():Map<string,Buffer>{
 const files=new Map(approved.members.map(p=>[p.name,bytes({})]));
 const put=(name:string,value:unknown)=>files.set(name,bytes(value));
 const flags={classificationAccepted:false,releaseAccepted:false,comparisonAvailable:false};
 put('reassessment-frozen-scripts.json',{files:[],largeMeta:'RAW_NS'});
 files.set('reassessment-frozen-scripts.json',Buffer.from(files.get('reassessment-frozen-scripts.json')!.toString().replace('"RAW_NS"','1792347899539979800')));
 const frozen=digest(files.get('reassessment-frozen-scripts.json')!);
 const source=(id:string)=>({bytes:100,sha256:createHash('sha256').update(id).digest('hex'),
  retrieved_at:'2026-10-11T00:00:00.000000+00:00',source_url:'https://www.census.gov/trade/downloads/'+id+'.ZIP'});
 const contexts=ids.map((id,i)=>({id,valid:true,state:'validated',phase:'complete',parseStatus:'completed',
  source:source(id),scriptsSha256:frozen.sha256,reason:null,jobOwnershipVerified:true,childStopped:true,
  ownedTreeStopped:true,outerWatchdog:'completed',elapsedSeconds:1,cleanupSeconds:0,
  peakWorkingSetBytes:1024,sampledWorkingSetBytes:1024,differences:[],
  sumUsd:id.startsWith('imports')?100000:200000,countryTotalUsd:id.startsWith('imports')?100000:200000,
  residualUsd:0,rowCount:i<23?4185:4184,resultIdentity:digest(Buffer.from(id))}));
 put('national-original-manifest.json',{processingCommit:'ed9bff4ce7a880f983eaf341f5b6bf8b5dc91809',
  requests:[...contexts.map(c=>({id:c.id,context_id:c.id,...c.source,kind:'zip',outcome:'complete'})),{id:'publication-2026-01',context_id:'exports-2026-01',kind:'pdf',outcome:'complete'}]});
 for(const role of ['maintained','independent']){
  const cs=contexts.map(c=>({...c,resultIdentity:digest(Buffer.from(role+c.id))}));
  for(const c of cs)put(role+'-'+c.id+'-receipt.json',c);
  put(role+'-summary.json',{countryCode:'2010',role,dryRun:false,feasibility:'internally-reconciled',
   validContexts:48,failedContexts:[],unprocessedContexts:[],contexts:cs,sourceManifest:digest(files.get('national-original-manifest.json')!),
   frozenScripts:frozen,sourceCommit,classificationAccepted:false,releaseAccepted:false,
   networkRequests:0,sourceBodyCopies:0,nationalContextAttempts:48,nationalContextsParsed:48});
  const terminal={output:role+'-run-r1',feasibility:'internally-reconciled',validContexts:48,
   summaryIdentity:digest(files.get(role+'-summary.json')!),nationalContextAttempts:48,nationalContextsParsed:48};
  const guard={state:'validated',reason:null,jobOwnershipVerified:true,childStopped:true,ownedTreeStopped:true,
   createdProcessExitCode:0,elapsedSeconds:2,result:terminal};
  put(role+'-outer-guard.json',guard);
  put(role+'-operator-completion.json',{observedNativeLauncherExitCode:0,invocationGuard:{...guard,result:{nativeExitCode:0,stdoutIdentity:digest(Buffer.from(role+'-stdout'))}},
   terminal:{outerState:'validated',reason:null,result:terminal,finalizer:{...guard,result:digest(files.get(role+'-outer-guard.json')!)}}});
 }
 const historical={date:'2026-10-17',validContexts:26,stoppedContext:'imports-2025-09',unprocessedContexts:21,
  stoppedContextSeconds:2828.093,executionLimitSeconds:60,preciseOverrunCause:'unverified'};
 put('historical-feasibility-evidence.json',{countryCode:'2010',validContexts:26,classificationAccepted:false,releaseAccepted:false});
 const pubContexts=contexts.map((c,i)=>({...c,month:c.id.slice(8),direction:c.id.slice(0,7),countryCode:'2010',
  measure:c.id.startsWith('imports')?'GEN_VAL_MO':'ALL_VAL_MO',countryControlUsd:c.countryTotalUsd,globalDetailKeys:i<30?1666900:1666899}));
 put('reassessment-public-evidence.json',{countryCode:'2010',period:{start:'2024-09',end:'2026-08',months:24,directions:['imports','exports']},
  validContexts:48,internallyVerifiedCompleteGrid:true,currentReferenceAgreementEstablished:false,
  classificationAccepted:false,releaseAccepted:false,publicMexicoProfile:false,assessmentBaseCommit:sourceCommit,
  sourceManifest:digest(files.get('national-original-manifest.json')!),contexts:pubContexts,
  historicalAssessment:{...historical,historicalEvidence:digest(files.get('historical-feasibility-evidence.json')!)}});
 put('reassessment-independent-verification.json',{status:'passed',passed:true,full48ArithmeticVerified:true,comparedContexts:48,
  unexplainedDifferences:0,exactSourceMetadataEquality:true,sourceCommit,sourceManifest:digest(files.get('national-original-manifest.json')!),
  frozenScripts:frozen,classificationAccepted:false,releaseAccepted:false,
  maintained:{role:'maintained',output:'maintained-run-r1',summaryIdentity:digest(files.get('maintained-summary.json')!),rowCount:200855,fullKeyCount:80011182,validContexts:48},
  independent:{role:'independent',output:'independent-run-r1',summaryIdentity:digest(files.get('independent-summary.json')!),rowCount:200855,fullKeyCount:80011182,validContexts:48}});
 put('reassessment-verifier-correction.json',{status:'review-finding-fixed-red-green',actualPairVerified:false,priorGateChecksAndTotalsUnaffected:true});
 put('reassessment-lifecycle.json',{status:'passed',sequential:true,nationalSourceReads:0});
 put('classification-cohort.json',{countryCode:'2010',window:['2024-09','2026-08'],classificationAccepted:false,releaseAccepted:false,
  entries:pairs.map(([direction,code])=>({direction,code,special:['980100','988000','880000'].includes(code),...flags})),
  controls:contexts.map(c=>({month:c.id.slice(8),direction:c.id.slice(0,7),exactUsd:c.sumUsd}))});
 const entries=pairs.map(([direction,code])=>({countryCode:'2010',direction,code,interval:['2024-09-01','2026-09-01'],
  status:['980100','988000','880000'].includes(code)?'statistical-excluded':'unverified',...flags}));
 put('classification-ledger.json',{countryCode:'2010',window:['2024-09','2026-08'],cohortSha256:digest(files.get('classification-cohort.json')!).sha256,
  ...flags,canadaVerdictsReused:false,nationalTradeZipOpened:false,entries,sources:{}});
 put('classification-public-evidence.json',{countryCode:'2010',window:['2024-09','2026-08'],...flags,entries,
  reviewedPrivateLedgerSha256:digest(files.get('classification-ledger.json')!).sha256});
 put('classification-review.json',{status:'passed',reviewedLedgerSha256:digest(files.get('classification-ledger.json')!).sha256,
  reviewedLedgerBytes:files.get('classification-ledger.json')!.length,entries:entries.filter(e=>e.status==='unverified').map(e=>({direction:e.direction,code:e.code,verdict:'agree-unverified'})),
  statisticalChecks:entries.filter(e=>e.status!=='unverified').map(e=>({direction:e.direction,code:e.code,verdict:'agree-statistical-excluded',sourceSpecialFlag:true,comparisonAvailable:false})),
  materialFindings:[],remainingMinorQualifications:[],allAcceptanceAvailabilityFlagsFalse:true});
 const comparison=(exact:number,displayed:number)=>({status:exact===displayed?'matched':'mismatch',reason:null,
  exactUsd:exact,displayedUsd:displayed,quantumUsd:100000,differenceUsd:exact-displayed});
 const matrixRows=contexts.map(c=>{
  const month=c.id.slice(8),direction=c.id.slice(0,7),displayed=c.sumUsd+(month<'2026-01'?100000:0);
  const publicationCell={countryCode:'2010',month,direction,basis:direction==='imports'?'general imports customs':'total exports FAS',
   seasonalAdjustment:'not seasonally adjusted',units:'millions of USD',quantumUsd:100000,period:'monthly',physicalPage:55,
   printedLocator:'Supplement Exhibit4; printed - 7 -',row:'Mexico',column:direction+' '+month+'; monthly '+(direction==='imports'?'Customs':'FAS')+' basis (not YTD or CIF)',
   sourceSha256:'c'.repeat(64),displayedUsd:displayed,vintageRelationship:'not-established'};
  return {id:c.id,month,direction,exactUsd:c.sumUsd,currentBefore:comparison(c.sumUsd,c.sumUsd),currentAfter:comparison(c.sumUsd,c.sumUsd),
   publication:comparison(c.sumUsd,displayed),publicationCell,vintageRelationship:'not-established',differenceCause:'not-established',...flags};
 });
 const currentSnapshots=Object.fromEntries(['mexico-before','mexico-after'].map(n=>[n,Object.fromEntries(contexts.map(c=>[c.id,c.sumUsd]))]));
 const snapshotSources={'mexico-before':{bytes:20,sha256:'a'.repeat(64)},'mexico-after':{bytes:21,sha256:'b'.repeat(64)}};
 put('reference-matrix.json',{schemaVersion:1,countryCode:'2010',window:['2024-09','2026-08'],snapshotStability:'stable',
  snapshotSources,currentSnapshots,publicationSources:[{bytes:100,sha256:'c'.repeat(64)}],gaps:[],rows:matrixRows,...flags});
 const independentCells=matrixRows.map(c=>({countryCode:'2010',month:c.month,direction:c.direction,
  measure:c.direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO',quantumUsd:100000,sourceSha256:'c'.repeat(64),
  sourceBytes:100,physicalPage:55,printedLocator:'- 7 -',displayedUsd:c.publication.displayedUsd,exactArchiveUsd:c.exactUsd,
  classificationAccepted:false,releaseAccepted:false}));
 const snaps=Object.entries(currentSnapshots).map(([id,values])=>({id,sourceBefore:snapshotSources[id as keyof typeof snapshotSources],
  sourceAfter:snapshotSources[id as keyof typeof snapshotSources],cells:Object.entries(values).map(([key,usd])=>({id:key,month:key.slice(8),direction:key.slice(0,7),exactArchiveUsd:usd,displayedUsd:usd}))}));
 put('reference-independent-extractions.json',{status:'independent-extraction-complete-before-root-matrix-read',countryCode:'2010',
  publicationCells:independentCells,currentSnapshots:snaps,currentExtractedGridsEqual:true,currentBodyBytesEqual:false,...flags});
 put('reference-current-grids.json',{status:'extracted',snapshots:snaps,bodyBytesEqual:false,extractedGridsEqual:true});
 put('reference-review.json',{status:'passed',rootMatrixIdentity:digest(files.get('reference-matrix.json')!),
  independentExtractionIdentity:digest(files.get('reference-independent-extractions.json')!),publicationCells:48,
  publicationOutcomes:{matched:16,mismatch:32,unavailable:0},currentCells:96,currentGridsEqual:true,currentBodyBytesEqual:false,rootDisagreementCount:0,...flags});
 put('reference-public-evidence.json',{countryCode:'2010',window:['2024-09','2026-08'],currentSnapshotStability:'stable',
  currentBasisQualification:'HTML labels Exports/Imports; FAS/customs linkage is qualified through FT900 definitions.',
  originalPublicationBytesProven:false,vintageRelationship:'not-established',differenceCause:'not-established',rows:matrixRows,...flags});
 seals(files);return files;
}

