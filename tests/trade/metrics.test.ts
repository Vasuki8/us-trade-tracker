import {expect, it} from 'vitest';
import {compareValues, sumWindow, shiftMonth} from '../../src/lib/trade/metrics';
import {sampleRelease} from '../helpers/release';
const worlds=()=>sampleRelease().observations.filter(r=>r.direction==='imports'&&r.geography==='world');
it('calculates absolute and percentage changes independently',()=>{
  expect(compareValues(120,100)).toEqual({current:120,previous:100,changeUsd:20,changePercent:20});
  expect(compareValues(0,100).changePercent).toBe(-100);
  expect(compareValues(120,0).changePercent).toBeNull();
  expect(compareValues(null,100).changeUsd).toBeNull();
});
it('uses twelve consecutive calendar months, not twelve rows',()=>{
  expect(sumWindow(worlds().reverse(),'2025-12',12)).toBe(1200);
  expect(sumWindow(worlds(),'2024-12',12)).toBe(600);
  expect(sumWindow(worlds().filter(r=>r.month!=='2025-06'),'2025-12',12)).toBeNull();
  expect(shiftMonth('2025-01',-1)).toBe('2024-12');
});
it('does not turn missing or suppressed months into zero',()=>{
  const rows=worlds(); rows[12].valueUsd=null; rows[12].status='suppressed';
  expect(sumWindow(rows,'2025-12',12)).toBeNull();
});
it('rejects duplicated months, mixed series, invalid periods and overflowing totals',()=>{
  const rows=worlds();
  expect(()=>sumWindow([...rows,rows[12]],'2025-12',12)).toThrow(/duplicate/i);
  expect(()=>sumWindow(sampleRelease().observations,'2025-12',12)).toThrow();
  expect(()=>shiftMonth('2025-00',1)).toThrow();
  expect(()=>sumWindow(rows.map(r=>({...r,valueUsd:Number.MAX_SAFE_INTEGER})),'2025-12',12)).toThrow();
});
