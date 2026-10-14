import {expect,it} from 'vitest';
import {dutyChangesPath,readDutyChangesSelection} from '../../src/lib/trade/duty-changes-link';
it('restores supported selection and ignores tracking while generating canonical product links',()=>{
  expect(readDutyChangesSelection('?period=monthly&metric=dollars&direction=imports&utm_source=x')).toEqual({selection:{period:'monthly',metric:'dollars'},notice:null});
  expect(readDutyChangesSelection('')).toEqual({selection:{period:'rolling',metric:'share'},notice:null});
  expect(dutyChangesPath('090121')).toBe('/changes/duties/');expect(dutyChangesPath('090122')).toBe('/changes/duties/090122/');
  expect(dutyChangesPath('090111',{period:'monthly',metric:'dollars'},'#main')).toBe('/changes/duties/090111/?direction=imports&period=monthly&metric=dollars#main');
  expect(()=>dutyChangesPath('../bad')).toThrow();
});
it.each(['?direction=exports&period=monthly&metric=dollars','?direction=&period=monthly','?period=','?metric=','?metric=growth','?period=annual','?period=monthly&period=monthly','?metric=share&metric=dollars','?direction=imports&direction=imports','?x='+'x'.repeat(2049)])('falls back together for invalid saved selection %s',search=>{
  expect(readDutyChangesSelection(search)).toMatchObject({selection:{period:'rolling',metric:'share'},notice:expect.any(String)});
});
