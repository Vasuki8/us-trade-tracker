import {describe,expect,it} from 'vitest';
import selected from '../../deployment/site-mexico-selection.json';
import approved from '../../docs/superpowers/plans/2026-10-23-mexico-all-goods-publication-inputs.json';
import {resolveMexicoPilotMode} from '../../src/lib/mexico-profile/pilot-config';
import {parseMexicoPublicationSelection} from '../../src/lib/mexico-profile/pilot-contract.server';

describe('Mexico public-mode boundary',()=>{
 it('returns null with absent public mode regardless of unrelated modes',()=>{
  expect(resolveMexicoPilotMode({MEXICO_LOCAL_PREVIEW_MODE:'fixture',TRADE_DATA_MODE:'fixture'})).toBeNull();
 });
 it.each(['fixture','snapshot'] as const)('allows the matching Canada/product public combination: %s',mode=>{
  expect(resolveMexicoPilotMode({MEXICO_PILOT_MODE:mode,CANADA_PILOT_MODE:mode,TRADE_DATA_MODE:mode==='fixture'?'fixture':'census'})).toBe(mode);
 });
 it.each(['','selected','public','SNAPSHOT'])('rejects unsupported public mode %s',mode=>{
  expect(()=>resolveMexicoPilotMode({MEXICO_PILOT_MODE:mode})).toThrow();
 });
 it.each([
  {MEXICO_PILOT_MODE:'fixture',TRADE_DATA_MODE:'fixture'},
  {MEXICO_PILOT_MODE:'snapshot',TRADE_DATA_MODE:'census'},
  {MEXICO_PILOT_MODE:'fixture',CANADA_PILOT_MODE:'fixture',TRADE_DATA_MODE:'census'},
  {MEXICO_PILOT_MODE:'snapshot',CANADA_PILOT_MODE:'snapshot',TRADE_DATA_MODE:'fixture'},
  {MEXICO_PILOT_MODE:'snapshot',CANADA_PILOT_MODE:'selected',TRADE_DATA_MODE:'census'},
  {MEXICO_PILOT_MODE:'fixture',CANADA_PILOT_MODE:'snapshot',TRADE_DATA_MODE:'fixture'},
 ])('rejects a crossed or missing public pairing %j',env=>expect(()=>resolveMexicoPilotMode(env)).toThrow());
 it.each(['MEXICO_LOCAL_PREVIEW_MODE','CANADA_PREVIEW_MODE','CANADA_ACCEPTED_PREVIEW_MODE'])('rejects even empty private flag %s',key=>{
  expect(()=>resolveMexicoPilotMode({MEXICO_PILOT_MODE:'fixture',CANADA_PILOT_MODE:'fixture',TRADE_DATA_MODE:'fixture',[key]:''})).toThrow();
 });
});
describe('Mexico publication selection',()=>{
 it('committed selection binds only the approved snapshot and explicit false flags',()=>{
  const actual=parseMexicoPublicationSelection(selected);
  expect(actual).toMatchObject({schemaVersion:1,selectionId:'mexico-all-goods-pilot-v1',countryCode:'2010',scope:'all-goods-only',source:'census',from:'2024-09',to:'2026-08',releaseId:approved.mexico.releaseId,classificationAccepted:false,productComparisonsAvailable:false,publicProfile:{bytes:14429,sha256:'16ee47da3087dea5529de1c60fdc5f8fe9d4523203c7fe40a5725408b5149d09'}});
  for(const kind of ['pointer','candidate','evidence','manifest'] as const){
   const name=kind==='pointer'?'current.json':kind+'.json';
   const pin=approved.dataFiles.find(f=>f.path.startsWith('data/countries/2010/')&&f.path.endsWith('/'+name));
   expect(actual.inputs[kind]).toEqual(pin);
  }
 });
 it.each(['extra','missing','country','scope','source','from','to','release','products','classification','profile-hash','profile-size','profile-extra'])('rejects unsupported selection %s',change=>{
  const v:any=structuredClone(selected);
  if(change==='extra')v.ownerAuthorization='PRIVATE';
  if(change==='missing')delete v.scope;
  if(change==='country')v.countryCode='1220';
  if(change==='scope')v.scope='all-products';
  if(change==='source')v.source='fixture';
  if(change==='from')v.from='2024-08';
  if(change==='to')v.to='2026-09';
  if(change==='release')v.releaseId='other';
  if(change==='products')v.productComparisonsAvailable=true;
  if(change==='classification')v.classificationAccepted=true;
  if(change==='profile-hash')v.publicProfile.sha256='not-a-hash';
  if(change==='profile-size')v.publicProfile.bytes=65537;
  if(change==='profile-extra')v.publicProfile.extra=true;
  expect(()=>parseMexicoPublicationSelection(v)).toThrow();
 });
 it.each(['pointer','candidate','evidence','manifest'] as const)('rejects redirected/invalid %s identity',kind=>{
  for(const change of ['path','bytes','sha','extra']){
   const v:any=structuredClone(selected);
   if(change==='path')v.inputs[kind].path='data/countries/2010/processed/../private.json';
   if(change==='bytes')v.inputs[kind].bytes=0;
   if(change==='sha')v.inputs[kind].sha256='A'.repeat(64);
   if(change==='extra')v.inputs[kind].authorization='PRIVATE';
   expect(()=>parseMexicoPublicationSelection(v)).toThrow();
  }
 });
});
