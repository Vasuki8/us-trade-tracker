import {createHash} from 'node:crypto';
import {canadaPreviewContract} from '../country-preview/contract.server';
import {canadaSnapshotContract} from '../../../scripts/country-snapshot-contract';
import type {Digest,MemberPin,CandidateMetadata,MemberName} from './types';
const reviewRoot='.tmp/canada-classification-review-20261012/';
export const canadaCountryReleaseContract={
  policyId:'canada-country-release-v1' as const,sourcePolicyId:'canada-archive-snapshot-v1' as const,
  backupRoot:'data/backups/canada-country-release',stateRoot:'data/countries/1220/processed',
  limits:{pointer:16*1024,manifest:64*1024,member:1024*1024,decoded:6*1024*1024,package:8*1024*1024,record:64*1024,review:16*1024},
  get pins():readonly MemberPin[]{return [
    {name:'assessment.json',...canadaPreviewContract.assessment},
    {name:'classification-ledger.json',...canadaPreviewContract.ledger},
    {name:'bulk-report.json',...canadaSnapshotContract.anchors.bulk},
    {name:'original-manifest.json',...canadaSnapshotContract.anchors.manifest},
    {name:'offline-replay.json',...canadaSnapshotContract.anchors.replay},
    {name:'inventory-review.json',...canadaSnapshotContract.anchors.verification},
    {name:'classification-review.json',path:reviewRoot+'independent-classification-review-receipt.json',bytes:81421,sha256:'5e4232f871674d07d902998b743335f0331fd0224d970295fd0d23168aab3e7a'},
    {name:'citation-correction.json',path:reviewRoot+'citation-correction-receipt.json',bytes:36634,sha256:'40b245d0ab0e12c9875b8fed2178b76b75af5c01955de1f944a3fcc94f1739ca'},
    {name:'calculation-review.json',path:'.superpowers/sdd/2026-10-11-canada-archive-snapshot/independent-qualified-calculation-receipt.json',bytes:57268,sha256:'62864ebf3c55e0b01fe1e6114e3413c0674effa1fad19a0842103c1d9859c547'},
    {name:'continuity-evidence.json',path:'docs/data-validation/1220-classification-continuity-evidence.json',bytes:150904,sha256:'12bfab9a0638a24c4cfd399d3235064ad0e28a8037670c244a2ee7d3ecf9492d'},
  ];},
  get projection():Digest{return {bytes:33716,sha256:'33c7db7ec421bddaa13e36c3b2e32cd4558aa041fe17f2f3da01285b62b08fd0'};},
  get protectedFiles(){return [
    {path:'data/processed/current.json',bytes:76,sha256:'5098efe55c5d712f097afaef140527c1c3636ebdd7dd0fe48b5521c5cf589bc8'},
    {path:'data/processed/releases/2026-08-5f3c2606-06a0-4c96-8fbc-a2332e0428ae.json',bytes:2977166,sha256:'eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727'},
    {path:'data/products/090111/processed/current.json',bytes:76,sha256:'d93e6e11e48c540396fee4699a0a9e58cbde0e6f6a55e20e7ba7056fb3296a39'},
    {path:'data/products/090111/processed/releases/2026-08-d6b1ed52-cd6c-4b7d-87ca-d52c9e338cae.json',bytes:2234188,sha256:'ef5d56791ad85b1b7a199829818522389a792e82cee792665be61f8e78cba0f7'},
    {path:'data/backups/canada-country-audit/snapshot-assessment-2026-10-11-r1/snapshot-assessment.json',bytes:432821,sha256:'db33209e879b4230353d197b6a1050d374b6ef970c1f0bd93d66202a4664ff8e'},
    {path:'data/backups/canada-country-audit/snapshot-assessment-2026-10-11-r1/snapshot-assessment.md',bytes:3277,sha256:'cbed3fb5b8e743b5646d3bf4049f3998836e5d0e38a902084b72b96ae15fd169'},
    {path:'data/backups/canada-country-audit/snapshot-assessment-2026-10-11-r2/snapshot-assessment.json',bytes:432821,sha256:'a013869f92ca5525eceaa35ef8d59bb635732b18b258960ed691a1d7219d132e'},
    {path:'data/backups/canada-country-audit/snapshot-assessment-2026-10-11-r2/snapshot-assessment.md',bytes:3277,sha256:'5f569b6286f261acd38423f60cf257eef991abb9283a97ba8161fdfde5318719'},
    {path:'data/backups/canada-country-audit/snapshot-classifications-2026-10-12-r1/snapshot-assessment.json',bytes:858857,sha256:'2cad0dcabf353b8aec0d365bb247e5d976712a7a1ebc90cac26694322503d9f8'},
    {path:'data/backups/canada-country-audit/snapshot-classifications-2026-10-12-r1/snapshot-assessment.md',bytes:3192,sha256:'9dd280b4b7a7522d3775a94aee86fc05e313315b91c3d76b9c61c910df4dd44e'},
    {path:'docs/data-validation/1220-snapshot-classification-evidence.json',bytes:487985,sha256:'afde19b1384c0cbab8cb2f7bbbc5ed8253bc636bb7a35c6b8d5d3c599a1010fd'},
  ];},
};
export const digestCountryBytes=(body:Buffer):Digest=>({bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')});
export const countryJsonBytes=(value:unknown):Buffer=>Buffer.from(JSON.stringify(value)+'\n','utf8');
export function countryObject(value:unknown):Record<string,unknown>{if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('country-invalid-object');return value as Record<string,unknown>;}
export function countryKeys(value:unknown,keys:readonly string[]):Record<string,unknown>{const obj=countryObject(value);if(Object.keys(obj).sort().join('|')!==[...keys].sort().join('|'))throw new Error('country-unexpected-fields');return obj;}
export function countryJson(body:Buffer,limit:number):unknown{if(!Buffer.isBuffer(body)||body.length<1||body.length>limit)throw new Error('country-size-limit');return JSON.parse(new TextDecoder('utf8',{fatal:true}).decode(body));}
export function countryInteger(value:unknown,min=0,max=Number.MAX_SAFE_INTEGER):number{if(typeof value!=='number'||!Number.isSafeInteger(value)||value<min||value>max)throw new Error('country-invalid-number');return value;}
export function countryHash(value:unknown):string{if(typeof value!=='string'||!/^[a-f0-9]{64}$/.test(value))throw new Error('country-invalid-hash');return value;}
export function countryCommit(value:unknown):string{if(typeof value!=='string'||!/^[a-f0-9]{40}$/.test(value))throw new Error('country-invalid-commit');return value;}
export function countryTimestamp(value:unknown):string{if(typeof value!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString()!==value)throw new Error('country-invalid-timestamp');return value;}
export function countryReleaseId(value:unknown):string{if(typeof value!=='string'||!/^2026-08-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value))throw new Error('country-invalid-release-id');return value;}
export function parseCountryDigest(value:unknown,limit=canadaCountryReleaseContract.limits.package):Digest{const v=countryKeys(value,['bytes','sha256']);return {bytes:countryInteger(v.bytes,1,limit),sha256:countryHash(v.sha256)};}
function ordered(value:unknown):unknown{if(Array.isArray(value))return value.map(ordered);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,ordered(v)]));return value;}
export function countrySame(actual:unknown,expected:unknown){if(JSON.stringify(ordered(actual))!==JSON.stringify(ordered(expected)))throw new Error('country-evidence-binding');}
export function validateCountryMetadata(value:CandidateMetadata):CandidateMetadata{countryKeys(value,['releaseId','packagingCommit','preparedAt']);return {releaseId:countryReleaseId(value.releaseId),packagingCommit:countryCommit(value.packagingCommit),preparedAt:countryTimestamp(value.preparedAt)};}
export function countryMemberNames():MemberName[]{return [...canadaCountryReleaseContract.pins.map(p=>p.name),'research-data.json'];}
