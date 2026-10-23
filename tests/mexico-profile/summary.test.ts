import {describe,expect,it} from 'vitest';
import fixture from '../fixtures/mexico-local-profile.json';
import {summarizeMexicoDirection} from '../../src/lib/mexico-profile/summary';
import type {MexicoDirectionProfile} from '../../src/lib/mexico-profile/types';
const view=()=>structuredClone(fixture.directions.imports) as MexicoDirectionProfile;
describe('fixed Mexico all-goods periods',()=>{
 it('uses 12 months per period and the prior total as growth denominator',()=>{expect(summarizeMexicoDirection(view())).toEqual({latest:{month:'2026-08',valueUsd:3300},prior:{from:'2024-09',to:'2025-08',reportedMonths:12,totalUsd:18600},current:{from:'2025-09',to:'2026-08',reportedMonths:12,totalUsd:33000},changeUsd:14400,growthPercent:14400/18600*100});});
 it('keeps zero and missing values distinct',()=>{const x=view();x.monthly[0].valueUsd=0;expect(summarizeMexicoDirection(x).prior).toMatchObject({reportedMonths:12,totalUsd:17600});x.monthly[0].valueUsd=null;expect(summarizeMexicoDirection(x)).toMatchObject({prior:{reportedMonths:11,totalUsd:null},current:{totalUsd:33000},changeUsd:null,growthPercent:null});});
 it('requires a complete current period including the latest month',()=>{const x=view();x.monthly[23].valueUsd=null;expect(summarizeMexicoDirection(x)).toMatchObject({latest:{month:'2026-08',valueUsd:null},current:{reportedMonths:11,totalUsd:null},changeUsd:null,growthPercent:null});});
 it('does not invent percentage growth for a zero prior total',()=>{const x=view();for(const p of x.monthly.slice(0,12))p.valueUsd=0;expect(summarizeMexicoDirection(x)).toMatchObject({prior:{totalUsd:0},current:{totalUsd:33000},changeUsd:33000,growthPercent:null});});
 it.each(['missing','duplicate','order','month','direction','measure','basis'])('rejects an incompatible grid: %s',change=>{const x:any=view();if(change==='missing')x.monthly.pop();if(change==='duplicate')x.monthly[1].month=x.monthly[0].month;if(change==='order')x.monthly.reverse();if(change==='month')x.monthly[0].month='2024-08';if(change==='direction')x.direction='other';if(change==='measure')x.measure='ALL_VAL_MO';if(change==='basis')x.basis='domestic-plus-foreign-exports-fas-value';expect(()=>summarizeMexicoDirection(x)).toThrow();});
 it.each([-1,NaN,Infinity,1.5,Number.MAX_SAFE_INTEGER+1])('rejects invalid USD %s',value=>{const x=view();x.monthly[0].valueUsd=value;expect(()=>summarizeMexicoDirection(x)).toThrow();});
 it('rejects unsafe period sums even when each observation is a safe integer',()=>{const x=view();for(const p of x.monthly)p.valueUsd=Number.MAX_SAFE_INTEGER;expect(()=>summarizeMexicoDirection(x)).toThrow();});
 it('handles negative changes without changing sign or rounding inputs',()=>{const x=view();for(const p of x.monthly.slice(12))p.valueUsd=1;expect(summarizeMexicoDirection(x)).toMatchObject({changeUsd:-18588,growthPercent:-18588/18600*100});});
});
