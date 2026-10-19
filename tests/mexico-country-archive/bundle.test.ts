import {afterEach,expect,it,vi} from 'vitest';
import {authenticateMexicoAcceptance} from '../../src/lib/mexico-country-release/acceptance.server';
import {mexicoAcceptanceContract} from '../../src/lib/mexico-country-release/acceptance-contract.server';
import {identity,json} from '../../src/lib/mexico-country-release/contract.server';
import {makeMexicoAcceptanceFixture} from '../helpers/mexico-archive-data';
afterEach(()=>vi.restoreAllMocks());
async function setup(){let api:any;try{api=await import('../../src/lib/mexico-country-archive/bundle.server');}catch{}
 expect(api?.buildMexicoArchive,'portable archive builder is missing').toBeTypeOf('function');
 const f=makeMexicoAcceptanceFixture(mexicoAcceptanceContract),accepted=authenticateMexicoAcceptance(f.input),material=api.buildMexicoArchive(accepted);return {api,f,accepted,material};}
function rebindEvidence(material:any,change:(value:any)=>void){const envelope=JSON.parse(material.evidenceBytes.toString());change(envelope);material.evidenceBytes=json(envelope);
 const manifest=JSON.parse(material.manifestBytes.toString()),digest=identity(material.evidenceBytes);manifest.objects[1]={role:'evidence',key:'trade/v1/countries/2010/private-all-goods/objects/evidence/'+digest.sha256+'.json',identity:digest};material.manifestBytes=json(manifest);
 material.descriptors=[manifest.objects[0],manifest.objects[1],{role:'manifest',key:'trade/v1/countries/2010/private-all-goods/objects/manifests/'+identity(material.manifestBytes).sha256+'.json',identity:identity(material.manifestBytes)}];}
it('roundtrips exactly the retained all-goods evidence without accepting a remote marker',async()=>{
 const {api,accepted,material}=await setup(),restored=api.authenticateMexicoArchive(material);
 expect(material.descriptors.map((d:any)=>d.role)).toEqual(['candidate','evidence','manifest']);
 expect(restored.candidateBytes).toEqual(accepted.candidateBytes);expect(restored.evidenceFiles.size).toBe(28);
 expect(restored.projection.observations.length).toBe(48);expect(restored.projection.periods.imports.current.totalUsd).toBe(1200000);
 expect(restored.instrument.decision).toBe('owner-authorized-for-private-all-goods');expect(restored.projection.releaseAccepted).toBe(false);
 expect(JSON.parse(material.manifestBytes).preservationDepth).toBe('retained-all-goods-evidence-only');
 expect(material.evidenceBytes.length).toBeLessThan(3*1024*1024);
});
it.each(['instrument','projection','candidate','evidence'] as const)('reauthenticates caller mutation of %s before packaging',async kind=>{
 const {api,accepted}=await setup();
 if(kind==='instrument')(accepted.instrument as any).productComparisons.available=true;
 if(kind==='projection')(accepted.projection as any).observations[0].usd++;
 if(kind==='candidate')accepted.candidateBytes[0]^=1;
 if(kind==='evidence')accepted.evidenceFiles.get('prior/candidate-eligibility.json')![0]^=1;
 expect(()=>api.buildMexicoArchive(accepted)).toThrow();
});
it.each(['extra','duplicate','alias','base64','body','order','classification'] as const)('refuses %s envelope despite recomputed outer identities',async kind=>{
 const {api,material}=await setup();rebindEvidence(material,v=>{
 if(kind==='extra')v.extra=true;if(kind==='duplicate')v.files[1]=v.files[0];if(kind==='alias')v.files[0].name='../outside';
 if(kind==='base64')v.files[0].base64+='\n';if(kind==='body')v.files[0].base64=Buffer.from('altered prior proof').toString('base64');
 if(kind==='order')[v.files[0],v.files[1]]=[v.files[1],v.files[0]];
 if(kind==='classification')v.instrument.classificationAccepted=true;
 });expect(()=>api.authenticateMexicoArchive(material)).toThrow();
});
it.each(['duplicate-json-key','whitespace','wrong-namespace','extra-object','candidate-cross'] as const)('refuses %s manifest/material',async kind=>{
 const {api,material}=await setup();
 if(kind==='duplicate-json-key')material.manifestBytes=Buffer.from(material.manifestBytes.toString().replace('"schemaVersion":1','"schemaVersion":0,"schemaVersion":1'));
 if(kind==='whitespace')material.manifestBytes=Buffer.from(JSON.stringify(JSON.parse(material.manifestBytes),null,2));
 if(kind==='wrong-namespace'){const m=JSON.parse(material.manifestBytes);m.objects[0].key=m.objects[0].key.replace('/2010/','/1220/');material.manifestBytes=json(m);}
 if(kind==='extra-object')material.descriptors.push(material.descriptors[0]);if(kind==='candidate-cross')material.candidateBytes=Buffer.from('{}\n');
 expect(()=>api.authenticateMexicoArchive(material)).toThrow();
});
it('binds a prospective marker while preserving the candidate lifecycle flags',async()=>{
 const {api,material}=await setup(),pointer=api.proposeMexicoAcceptedPointer(material,'2026-10-19T03:00:00.000Z'),checked=api.verifyMexicoPointer(json(pointer),material);
 expect(checked.status).toBe('accepted-private-all-goods');expect(checked.allGoodsAccepted).toBe(true);expect(checked.classificationAccepted).toBe(false);expect(checked.publicMexicoProfile).toBe(false);expect(checked.productComparisons.available).toBe(false);
 expect(api.authenticateMexicoArchive(material).projection.releaseAccepted).toBe(false);
});
it.each(['classification','public','products','manifest','time','duplicate-key'] as const)('rejects %s marker',async kind=>{
 const {api,material}=await setup(),p=api.proposeMexicoAcceptedPointer(material,'2026-10-19T03:00:00.000Z');
 if(kind==='classification')p.classificationAccepted=true;if(kind==='public')p.publicMexicoProfile=true;if(kind==='products')p.productComparisons.available=true;
 if(kind==='manifest'){p.manifest.identity.sha256='3'.repeat(64);p.manifest.key='trade/v1/countries/2010/private-all-goods/objects/manifests/'+p.manifest.identity.sha256+'.json';}
 if(kind==='time')p.acceptedAt='2026-10-01T00:00:00.000Z';let bytes=json(p);if(kind==='duplicate-key')bytes=Buffer.from(bytes.toString().replace('"schemaVersion":1','"schemaVersion":0,"schemaVersion":1'));
 expect(()=>api.verifyMexicoPointer(bytes,material)).toThrow();
});
