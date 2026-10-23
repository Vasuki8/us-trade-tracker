import {describe,expect,it} from 'vitest';
import fixture from '../fixtures/mexico-local-profile.json';
import {projectMexicoPilotProfile,mexicoProfileDescription} from '../../src/lib/mexico-profile/presentation';
import type {MexicoLocalProfile} from '../../src/lib/mexico-profile/types';
const synthetic=()=>structuredClone(fixture) as MexicoLocalProfile;
function real():MexicoLocalProfile{
 const p=synthetic();p.source='census';p.presentation='accepted-private-local';p.acceptance={releaseId:'2026-08-d15a1fdc-2f1c-4d39-8532-7bb8451ddf18',acceptedAt:'2026-10-19T04:12:15.203Z',scope:'private-all-goods'};p.qualifications.verificationBasis='prior-reviewed-retained-evidence';
 for(const d of ['imports','exports'] as const)for(const row of p.directions[d].monthly)row.originalSource={url:'https://www.census.gov/trade/downloads/'+d+'-'+row.month+'.ZIP',capturedAt:'2026-10-01T00:00:00.000Z',bytes:123,sha256:'a'.repeat(64)};
 return p;
}
describe('Mexico pilot presentation',()=>{
 it('changes only presentation and leaves private acceptance and withheld flags intact',()=>{
  const p=real(),out=projectMexicoPilotProfile(p,'snapshot');
  expect(out).toEqual({...p,presentation:'public-pilot-snapshot'});
  expect(p.presentation).toBe('accepted-private-local');expect(out.acceptance?.scope).toBe('private-all-goods');
  expect(out.qualifications).toMatchObject({datedMatched:16,datedDifferences:32,classificationAccepted:false,productComparisonsAvailable:false});
  out.directions.imports.monthly[0].valueUsd=99;expect(p.directions.imports.monthly[0].valueUsd).toBe(1000);
 });
 it('public fixture remains synthetic with no accepted release or source identities',()=>{
  const out=projectMexicoPilotProfile(synthetic(),'fixture');
  expect(out.presentation).toBe('public-pilot-fixture');expect(out.acceptance).toBeNull();
  expect(Object.values(out.directions).flatMap(d=>d.monthly).every(r=>r.originalSource===null)).toBe(true);
 });
 it.each(['crossed','private-field','products','acceptance','oversize'])('rejects unsafe public projection %s',change=>{
  const p:any=real();
  if(change==='crossed')p.presentation='synthetic-local';
  if(change==='private-field')p.authorization={instruction:'PRIVATE_OWNER_INSTRUCTION'};
  if(change==='products')p.qualifications.productComparisonsAvailable=true;
  if(change==='acceptance')p.acceptance.scope='public-all-products';
  if(change==='oversize')p.countryName='x'.repeat(65536);
  expect(()=>projectMexicoPilotProfile(p,'snapshot')).toThrow();
 });
 it('does not allow real data into public fixture mode or fixtures into real mode',()=>{
  expect(()=>projectMexicoPilotProfile(real(),'fixture')).toThrow();
  expect(()=>projectMexicoPilotProfile(synthetic(),'snapshot')).toThrow();
 });
 it('descriptions distinguish synthetic local/public and real local/public',()=>{
  for(const p of [synthetic(),projectMexicoPilotProfile(synthetic(),'fixture')]){
   const text=mexicoProfileDescription(p);expect(text).toMatch(/synthetic/i);expect(text).toMatch(/no accepted/i);
  }
  expect(mexicoProfileDescription(real())).toMatch(/unpublished.*local|local.*unpublished/i);
  const text=mexicoProfileDescription(projectMexicoPilotProfile(real(),'snapshot'));
  expect(text).toMatch(/Mexico/);expect(text).toMatch(/2024/);expect(text).toMatch(/2026/);expect(text).not.toMatch(/unpublished|local preview/i);
 });
});
