import {expect,it} from 'vitest';
import {mexicoViewPath,readMexicoViewSelection} from '../../src/lib/mexico-profile/view-link';
const notice='This saved Mexico view could not be restored. Showing Imports.';
it('defaults to Imports and writes the fixed direction-only public route',()=>{
 expect(readMexicoViewSelection('')).toEqual({selection:{direction:'imports'},notice:null});
 expect(mexicoViewPath({direction:'imports'})).toBe('/countries/2010/?direction=imports');
 expect(mexicoViewPath({direction:'exports'},'#main')).toBe('/countries/2010/?direction=exports#main');
});
it.each(['imports','exports'] as const)('roundtrips %s and excludes unrelated/private selectors',direction=>{
 const read=readMexicoViewSelection('?direction='+direction+'&release=private&country=1220&months=60');
 expect(read).toEqual({selection:{direction},notice:null});
 expect(mexicoViewPath(read.selection)).toBe('/countries/2010/?direction='+direction);
 expect(readMexicoViewSelection(mexicoViewPath(read.selection).split('?')[1])).toEqual(read);
});
it.each(['?direction=','?direction=Exports','?direction=IMPORTS','?direction=unknown','?direction=imports&direction=exports','?direction=imports&direction=imports'])('falls back wholly without reflecting invalid input %s',search=>{
 expect(readMexicoViewSelection(search)).toEqual({selection:{direction:'imports'},notice});
});
it('accepts exactly2048 characters and refuses longer input',()=>{
 const search='?direction=exports&x='+'x'.repeat(2027);expect(search).toHaveLength(2048);
 expect(readMexicoViewSelection(search)).toEqual({selection:{direction:'exports'},notice:null});
 expect(readMexicoViewSelection(search+'x')).toEqual({selection:{direction:'imports'},notice});
});
it('ignores unrelated query fields and never echoes rejected text',()=>{
 expect(readMexicoViewSelection('?release=private')).toEqual({selection:{direction:'imports'},notice:null});
 expect(readMexicoViewSelection('?direction=secret').notice).not.toContain('secret');
});
it('rejects runtime-invalid writer input and non-fragment suffixes',()=>{
 expect(()=>mexicoViewPath({direction:'bad' as 'imports'})).toThrow();
 expect(()=>mexicoViewPath({direction:'imports'},'?release=private')).toThrow();
});
