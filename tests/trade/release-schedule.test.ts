import {expect,it} from 'vitest';
import {nextScheduledRelease} from '../../src/lib/trade/release-schedule';

it.each([
  ['2026-10-10T12:00:00Z',{reportingMonth:'2026-09',publishesAt:'2026-11-04T08:30:00-05:00'}],
  ['2026-11-04T08:29:59.999-05:00',{reportingMonth:'2026-09',publishesAt:'2026-11-04T08:30:00-05:00'}],
  ['2026-11-04T08:30:00-05:00',{reportingMonth:'2026-10',publishesAt:'2026-12-08T08:30:00-05:00'}],
  ['2026-12-08T13:30:00Z',{reportingMonth:'2026-11',publishesAt:'2027-01-07T08:30:00-05:00'}],
  ['2027-01-07T13:30:00Z',null],
] as const)('selects only a reviewed publication still in the future at %s', (asOf,expected)=>{
  expect(nextScheduledRelease(new Date(asOf))).toEqual(expected);
});

it('rejects an invalid evaluation time instead of silently treating the calendar as exhausted',()=>{
  expect(()=>nextScheduledRelease(new Date('invalid'))).toThrow(/date/i);
});
