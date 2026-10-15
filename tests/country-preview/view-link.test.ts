import {expect,it} from 'vitest';
import {canadaViewPath,readCanadaViewSelection} from '../../src/lib/country-preview/view-link';
const notice='This saved Canada view could not be restored. Showing Imports.';
it('defaults to Imports and writes the fixed direction-only route',()=>{
 expect(readCanadaViewSelection('')).toEqual({selection:{direction:'imports'},notice:null});
 expect(canadaViewPath({direction:'imports'})).toBe('/countries/1220/?direction=imports');
 expect(canadaViewPath({direction:'exports'},'#country-history-heading')).toBe('/countries/1220/?direction=exports#country-history-heading');
});
it.each(['imports','exports'] as const)('roundtrips %s while omitting unrelated fields',direction=>{
 expect(readCanadaViewSelection('?direction='+direction+'&utm_source=test')).toEqual({selection:{direction},notice:null});
 expect(readCanadaViewSelection(canadaViewPath({direction}).split('?')[1])).toEqual({selection:{direction},notice:null});
});
it.each(['?direction=','?direction=Exports','?direction=invalid','?direction=imports&direction=exports','?direction=imports&direction=imports'])('falls back as a whole for %s',search=>{
 expect(readCanadaViewSelection(search)).toEqual({selection:{direction:'imports'},notice});
});
it('accepts exactly 2048 characters and rejects a longer search',()=>{
 const search='?direction=exports&x='+'x'.repeat(2027);
 expect(search).toHaveLength(2048);
 expect(readCanadaViewSelection(search)).toEqual({selection:{direction:'exports'},notice:null});
 expect(readCanadaViewSelection(search+'x')).toEqual({selection:{direction:'imports'},notice});
});
it('does not interpret an unrelated query or echo rejected text',()=>{
 expect(readCanadaViewSelection('?tracking=secret')).toEqual({selection:{direction:'imports'},notice:null});
 expect(readCanadaViewSelection('?direction=secret').notice).not.toContain('secret');
});
it('rejects runtime-invalid writer input and nonfragment suffixes',()=>{
 expect(()=>canadaViewPath({direction:'bad' as 'imports'})).toThrow();
 expect(()=>canadaViewPath({direction:'imports'},'?private=1')).toThrow();
});
