import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import * as fs from 'node:fs/promises';
import {resolve} from 'node:path';
import {readCountryReleaseEvidence,verifyCountryEvidence} from '../../src/lib/country-release/evidence.server';
import {canadaCountryReleaseContract as contract} from '../../src/lib/country-release/contract.server';
import {makeCountryReleaseEvidenceFixture,mockCountryReleaseEvidence,fixtureDigest} from '../helpers/country-release-data';
import type {EvidenceName} from '../../src/lib/country-release/types';
vi.mock('node:fs/promises',async original=>{const actual=await original<typeof fs>();return {...actual,open:vi.fn(actual.open)};});
let files:Map<EvidenceName,Buffer>;const roots:string[]=[];
beforeEach(()=>{files=new Map(makeCountryReleaseEvidenceFixture());mockCountryReleaseEvidence(files);});
afterEach(async()=>{vi.restoreAllMocks();for(const root of roots.splice(0))await fs.rm(root,{recursive:true,force:true});});
it('authenticates_exact_fixed_evidence_and_preserves_qualifications',()=>{
  const v=verifyCountryEvidence(files),views=Object.values(v.projection.directions),products=views.flatMap(d=>d.products);
  expect(v.files.size).toBe(10);expect(views.flatMap(d=>d.monthly)).toHaveLength(48);
  expect(products).toHaveLength(20);expect(products.filter(p=>p.comparisonEligible)).toHaveLength(17);
  for(const label of ['before','after'] as const){expect(views.reduce((s,d)=>s+d.references[label].matched,0)).toBe(41);expect(views.reduce((s,d)=>s+d.references[label].mismatch,0)).toBe(7);}
  expect(views.reduce((s,d)=>s+d.references.publication.matched,0)).toBe(7);expect(views.reduce((s,d)=>s+d.references.publication.notReviewed,0)).toBe(41);
  expect(Object.values(v.projection.availability)).toEqual([false,false,false]);
  expect(v.projection.directions.imports.summary.current.totalUsd).toBe(2400000);
  files.get('bulk-report.json')![0]^=1;expect(v.files.get('bulk-report.json')![0]).not.toBe(files.get('bulk-report.json')![0]);
});
it('authenticates replay totals without converting the old strict failures into passes',()=>{const bulk=JSON.parse(files.get('bulk-report.json')!.toString());expect(bulk.contexts.every((c:{state:string;sumUsd:null})=>c.state==='failed'&&c.sumUsd===null)).toBe(true);expect(verifyCountryEvidence(files).projection.directions.imports.summary.current.totalUsd).toBe(2400000);expect(bulk.sourceCoverage).toBe('failed');});
it.each(['missing','changed','oversized','extra','crossed'] as const)('rejects %s evidence before parsing',kind=>{
  if(kind==='missing')files.delete('bulk-report.json');
  if(kind==='changed')files.get('bulk-report.json')![0]^=1;
  if(kind==='oversized')files.set('bulk-report.json',Buffer.alloc(1048577));
  if(kind==='extra')files.set('other.json' as EvidenceName,Buffer.from('{}'));
  if(kind==='crossed')files.set('bulk-report.json',files.get('offline-replay.json')!);
  expect(()=>verifyCountryEvidence(files)).toThrow();
});
it.each(['commit','ledger','scope','mismatch','publication','classification','flags','review','correction','arithmetic'] as const)('rejects semantically crossed %s even with test pins',kind=>{
  const name:EvidenceName=kind==='review'?'classification-review.json':kind==='correction'?'citation-correction.json':kind==='arithmetic'?'inventory-review.json':'assessment.json';
  const value=JSON.parse(files.get(name)!.toString());
  if(kind==='commit')value.inputProvenance.sourceProcessingCommit='f'.repeat(40);
  if(kind==='ledger')value.classificationLedgerIdentity.sha256='f'.repeat(64);
  if(kind==='scope')value.months.pop();
  if(kind==='mismatch'){const m=value.months[0];m.beforeReference.currentUsd+=100000;m.beforeReference.referenceCheck='mismatch';m.beforeReference.currentDifferenceUsd=-100000;}
  if(kind==='publication')value.months.find((m:{id:string})=>m.id==='exports-2026-01').beforeReference.publicationUsd=0;
  if(kind==='classification')value.candidates[0].classification.status='incompatible';
  if(kind==='flags')value.releaseAccepted=true;
  if(kind==='review')value.entryVerdicts[0].semanticVerdict='unverified';
  if(kind==='correction')value.semanticConclusionsChanged=true;
  if(kind==='arithmetic')value.contexts[0].sumUsd++;
  const changed=Buffer.from(JSON.stringify(value)+'\n');files.set(name,changed);
  vi.spyOn(contract,'pins','get').mockReturnValue(contract.pins.map(p=>p.name===name?{...p,...fixtureDigest(changed)}:p));
  expect(()=>verifyCountryEvidence(files)).toThrow();
});
async function setup(){await fs.mkdir(resolve('.tmp'),{recursive:true});const root=await fs.mkdtemp(resolve('.tmp/canada-release-evidence-'));roots.push(root);await fs.mkdir(resolve(root,'source'));for(const p of contract.pins)await fs.writeFile(resolve(root,p.path),files.get(p.name)!);return root;}
it('opens only ten authenticated JSON bodies',async()=>{const root=await setup();vi.mocked(fs.open).mockClear();expect((await readCountryReleaseEvidence(root)).files.size).toBe(10);expect(vi.mocked(fs.open).mock.calls.map(c=>String(c[0]))).toEqual(contract.pins.map(p=>resolve(root,p.path)));});
it('rejects changed bytes during read',async()=>{const root=await setup(),path=resolve(root,contract.pins[0].path);const open=vi.mocked(fs.open).getMockImplementation()!;vi.mocked(fs.open).mockImplementation(async(...args)=>{const h=await open(...args);if(String(args[0])===path){const b=Buffer.from(files.get('assessment.json')!);b[0]^=1;await fs.writeFile(path,b);}return h;});await expect(readCountryReleaseEvidence(root)).rejects.toThrow();});
it('rejects a real reparse ancestor',async()=>{const root=await setup();await fs.rename(resolve(root,'source'),resolve(root,'moved'));await fs.symlink(resolve(root,'moved'),resolve(root,'source'),process.platform==='win32'?'junction':'dir');await expect(readCountryReleaseEvidence(root)).rejects.toThrow();});
