import {expect,it} from 'vitest';
import {readPortfolioSelection,portfolioPath} from '../../src/lib/trade/portfolio-link';
const codes=['090121','090111'];
it('defaults and canonicalizes only published selections',()=>{
  expect(readPortfolioSelection('',codes)).toEqual({selection:{productCodes:codes,direction:'imports'},notice:null});
  expect(readPortfolioSelection('?products=090111,090121&direction=exports&utm_source=x',codes)).toEqual({selection:{productCodes:codes,direction:'exports'},notice:null});
  expect(portfolioPath({productCodes:['090111'],direction:'exports'},'#research')).toBe('/briefing/portfolio/?products=090111&direction=exports#research');
});
it.each(['?products=','?products=999999','?products=090121,090121','?products=090121&products=090111','?direction=exports&direction=imports','?direction=outbound',`?padding=${'x'.repeat(2049)}`])('explains invalid saved selection %s',search=>{
  expect(readPortfolioSelection(search,codes)).toMatchObject({selection:{productCodes:codes,direction:'imports'},notice:expect.any(String)});
});
