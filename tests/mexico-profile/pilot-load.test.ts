import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import fixture from '../fixtures/mexico-local-profile.json';
import selection from '../../deployment/site-mexico-selection.json';
import {loadMexicoPilot} from '../../src/lib/mexico-profile/pilot-load.server';
import {parseMexicoPublicationSelection} from '../../src/lib/mexico-profile/pilot-contract.server';
import type {MexicoLocalProfile} from '../../src/lib/mexico-profile/types';
const mocks=vi.hoisted(()=>({load:vi.fn()}));
vi.mock('../../src/lib/mexico-profile/load.server',()=>({loadMexicoLocalProfile:mocks.load}));
const env={MEXICO_PILOT_MODE:'snapshot',CANADA_PILOT_MODE:'snapshot',TRADE_DATA_MODE:'census'};
const roots:string[]=[];
const sha=(b:Uint8Array|string)=>createHash('sha256').update(b).digest('hex');
function real():MexicoLocalProfile{
 const p=structuredClone(fixture) as MexicoLocalProfile;p.source='census';p.presentation='accepted-private-local';p.acceptance={releaseId:selection.releaseId,acceptedAt:'2026-10-19T04:12:15.203Z',scope:'private-all-goods'};p.qualifications.verificationBasis='prior-reviewed-retained-evidence';
 for(const d of ['imports','exports'] as const)for(const row of p.directions[d].monthly)row.originalSource={url:'https://www.census.gov/trade/downloads/'+d+'-'+row.month+'.ZIP',capturedAt:'2026-10-01T00:00:00.000Z',bytes:123,sha256:'a'.repeat(64)};
 return p;
}
async function setup(){
 const root=await mkdtemp(resolve(tmpdir(),'mexico-public-loader-'));roots.push(root);
 const data=real(),expected={...data,presentation:'public-pilot-snapshot'},s=parseMexicoPublicationSelection(structuredClone(selection));
 for(const kind of ['pointer','candidate','evidence','manifest'] as const){
  const body=Buffer.from('synthetic-installed-'+kind),f=s.inputs[kind];f.bytes=body.length;f.sha256=sha(body);
  const path=resolve(root,f.path);await mkdir(dirname(path),{recursive:true});await writeFile(path,body);
 }
 const bytes=JSON.stringify(expected);s.publicProfile={bytes:Buffer.byteLength(bytes),sha256:sha(bytes)};
 await mkdir(resolve(root,'deployment'));await writeFile(resolve(root,'deployment/site-mexico-selection.json'),JSON.stringify(s));
 mocks.load.mockImplementation(async (options:any)=>{
  if(JSON.stringify(options.environment)!==JSON.stringify({MEXICO_LOCAL_PREVIEW_MODE:'selected',TRADE_DATA_MODE:'census'}))throw Error('Crossed bridge');
  return structuredClone(data);
 });
 return {root,data,selection:s,expected};
}
beforeEach(()=>{vi.resetAllMocks();vi.stubGlobal('fetch',()=>{throw Error('Unexpected source fetch');});});
afterEach(async()=>{vi.unstubAllGlobals();for(const root of roots.splice(0))await rm(root,{recursive:true,force:true});});
describe('Mexico public loader',()=>{
 it('absent mode returns before reading configuration or accepted state',async()=>{
  expect(await loadMexicoPilot({workspaceRoot:'/missing-public-root',environment:{MEXICO_LOCAL_PREVIEW_MODE:'fixture'}})).toBeNull();expect(mocks.load).not.toHaveBeenCalled();
 });
 it('fixture mode never reads real selection or accepted state',async()=>{
  mocks.load.mockImplementation(async({environment}:any)=>{
   if(JSON.stringify(environment)!==JSON.stringify({MEXICO_LOCAL_PREVIEW_MODE:'fixture',TRADE_DATA_MODE:'fixture'}))throw Error('Selected read forbidden');
   return structuredClone(fixture);
  });
  const p=await loadMexicoPilot({workspaceRoot:'/missing-public-fixture-root',environment:{MEXICO_PILOT_MODE:'fixture',CANADA_PILOT_MODE:'fixture',TRADE_DATA_MODE:'fixture'}});
  expect(p?.source).toBe('fixture');expect(p?.presentation).toBe('public-pilot-fixture');expect(p?.acceptance).toBeNull();
 });
 it('binds the authenticated bridge, exact input files and public projection',async()=>{
  const f=await setup(),p=await loadMexicoPilot({workspaceRoot:f.root,environment:env});
  expect(p).toEqual(f.expected);expect(p?.directions.exports.monthly[23].valueUsd).toBe(6600);
  expect(mocks.load).toHaveBeenCalledWith({workspaceRoot:f.root,environment:{MEXICO_LOCAL_PREVIEW_MODE:'selected',TRADE_DATA_MODE:'census'}});
  expect(JSON.stringify(p)).not.toMatch(/authorization|candidateBytes|PRIVATE_OWNER/);
 });
 it.each(['pointer','candidate','evidence','manifest'] as const)('rejects changed installed %s before projecting',async kind=>{
  const f=await setup();await writeFile(resolve(f.root,f.selection.inputs[kind].path),'changed private input');
  await expect(loadMexicoPilot({workspaceRoot:f.root,environment:env})).rejects.toThrow(/^Mexico public pilot unavailable or invalid$/);
  expect(mocks.load).not.toHaveBeenCalled();
 });
 it.each(['value','source','products','private-envelope','oversize'])('rejects projected drift: %s',async change=>{
  const f=await setup();mocks.load.mockImplementation(async()=>{
   const p:any=structuredClone(f.data);
   if(change==='value')p.directions.imports.monthly[0].valueUsd++;
   if(change==='source')p.directions.imports.monthly[0].originalSource.url=p.directions.exports.monthly[0].originalSource.url;
   if(change==='products')p.qualifications.productComparisonsAvailable=true;
   if(change==='private-envelope')p.authorization='PRIVATE_OWNER_INSTRUCTION';
   if(change==='oversize')p.countryName='x'.repeat(65536);
   return p;
  });
  await expect(loadMexicoPilot({workspaceRoot:f.root,environment:env})).rejects.toThrow(/^Mexico public pilot unavailable or invalid$/);
 });
 it('rechecks installed inputs after the authenticated read',async()=>{
  const f=await setup();mocks.load.mockImplementation(async()=>{await writeFile(resolve(f.root,f.selection.inputs.evidence.path),'changed during read');return structuredClone(f.data);});
  await expect(loadMexicoPilot({workspaceRoot:f.root,environment:env})).rejects.toThrow();
 });
 it('rechecks a filesystem selection after the authenticated read',async()=>{
  const f=await setup();mocks.load.mockImplementation(async()=>{await writeFile(resolve(f.root,'deployment/site-mexico-selection.json'),JSON.stringify({...f.selection,classificationAccepted:true}));return structuredClone(f.data);});
  await expect(loadMexicoPilot({workspaceRoot:f.root,environment:env})).rejects.toThrow();
 });
 it('accepts an explicitly supplied committed selection without reading an unrelated selector file',async()=>{
  const f=await setup();await rm(resolve(f.root,'deployment/site-mexico-selection.json'));
  expect(await loadMexicoPilot({workspaceRoot:f.root,environment:env,selection:f.selection})).toEqual(f.expected);
  await expect(loadMexicoPilot({workspaceRoot:f.root,environment:env,selection:{...f.selection,scope:'products'} as any})).rejects.toThrow();
 });
 it('retains a generic read failure and never falls back to fixture',async()=>{
  const f=await setup();mocks.load.mockRejectedValue(new Error('PRIVATE_OWNER_INSTRUCTION'));
  await expect(loadMexicoPilot({workspaceRoot:f.root,environment:env})).rejects.toThrow(/^Mexico public pilot unavailable or invalid$/);
  expect(mocks.load.mock.calls).toHaveLength(1);
 });
 it('rejects mixed public/private modes before configuration and state reads',async()=>{
  await expect(loadMexicoPilot({workspaceRoot:'/missing',environment:{...env,MEXICO_LOCAL_PREVIEW_MODE:'selected'}})).rejects.toThrow();
  expect(mocks.load).not.toHaveBeenCalled();
 });
});
