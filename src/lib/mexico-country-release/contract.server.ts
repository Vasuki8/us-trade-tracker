import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import approved from '../../../docs/superpowers/plans/2026-10-18-mexico-all-goods-acceptance-recovery-inputs.json';
import type {MexicoIdentity,MexicoSource} from './types';
export const mexicoContract={
 policyId:'mexico-all-goods-release-v1',sourcePolicyId:'mexico-retained-all-goods-v1',countryCode:'2010',
 sourceAssessmentCommit:'52e4157ee5a223716d620804b2a9203fc49cec5c',originalProcessingCommit:'ed9bff4ce7a880f983eaf341f5b6bf8b5dc91809',
 get pins(){return approved.members.map(p=>({...p}));},get source():MexicoSource{return 'census';},
 months:Array.from({length:24},(_,i)=>new Date(Date.UTC(2024,8+i,1)).toISOString().slice(0,7)),
 limits:{member:4*1024*1024,decoded:16*1024*1024,serialized:24*1024*1024,manifest:65536,projection:65536,proof:256*1024},
 namespace:'data/backups/mexico-country-release/',
};
export function identity(bytes:Buffer):MexicoIdentity{return {bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}
export function object(x:unknown):Record<string,unknown>{if(!x||typeof x!=='object'||Array.isArray(x))throw Error('mexico-object');return x as Record<string,unknown>;}
export function array(x:unknown):unknown[]{if(!Array.isArray(x))throw Error('mexico-array');return x;}
export function usd(x:unknown):number{if(typeof x!=='number'||!Number.isSafeInteger(x)||x<0)throw Error('mexico-safe-integer');return x;}
export function equal(a:unknown,b:unknown,label='binding'):void{if(!isDeepStrictEqual(a,b))throw Error('mexico-'+label);}
export function keys(x:Record<string,unknown>,names:string[]):void{equal(Object.keys(x).sort(),[...names].sort(),'keys');}
export function parse(bytes:Buffer):Record<string,unknown>{return object(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)));}
export function json(x:unknown):Buffer{return Buffer.from(JSON.stringify(x)+'\n');}
export function checkIdentity(value:unknown,expected:MexicoIdentity):void{const v=object(value);equal(v.bytes,expected.bytes,'bytes');equal(v.sha256,expected.sha256,'sha256');}
export function falseFlags(v:Record<string,unknown>):void{equal(v.classificationAccepted,false,'classification');equal(v.releaseAccepted,false,'release');if('comparisonAvailable'in v)equal(v.comparisonAvailable,false,'comparison');}
export function contextId(value:unknown):{id:string;month:string;direction:'imports'|'exports';measure:'GEN_VAL_MO'|'ALL_VAL_MO'}{
 if(typeof value!=='string'||!mexicoContract.months.some(m=>value==='imports-'+m||value==='exports-'+m))throw Error('mexico-context');
 const direction=value.slice(0,7) as 'imports'|'exports';return {id:value,month:value.slice(8),direction,measure:direction==='imports'?'GEN_VAL_MO':'ALL_VAL_MO'};
}
export function grid(value:unknown,explicit=false):Map<string,Record<string,unknown>>{
 const rows=array(value).map(object),map=new Map<string,Record<string,unknown>>();
 for(const row of rows){const c=contextId(row.id);if(map.has(c.id))throw Error('mexico-duplicate-context');
  if(explicit){equal(row.month,c.month);equal(row.direction,c.direction);if('measure'in row)equal(row.measure,c.measure);if('countryCode'in row)equal(row.countryCode,'2010');}map.set(c.id,row);}
 if(map.size!==48)throw Error('mexico-incomplete-grid');return map;
}
export function capture(x:unknown):string{if(typeof x!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|\+00:00)$/.test(x)||!Number.isFinite(Date.parse(x)))throw Error('mexico-capture');return x;}
