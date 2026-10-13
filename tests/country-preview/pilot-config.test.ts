import {expect,it} from 'vitest';
import {resolveCanadaPilotMode} from '../../src/lib/country-preview/pilot-config';
it('ignores independent preview/product modes when the pilot is disabled',()=>{
  for(const env of [{},{CANADA_PREVIEW_MODE:'retained'},{CANADA_ACCEPTED_PREVIEW_MODE:'selected',TRADE_DATA_MODE:'fixture'}])expect(resolveCanadaPilotMode(env)).toBeNull();
});
it('permits only explicit coherent real or synthetic pilot builds',()=>{
  expect(resolveCanadaPilotMode({CANADA_PILOT_MODE:'selected'})).toBe('selected');
  expect(resolveCanadaPilotMode({CANADA_PILOT_MODE:'selected',TRADE_DATA_MODE:'census'})).toBe('selected');
  expect(resolveCanadaPilotMode({CANADA_PILOT_MODE:'fixture',TRADE_DATA_MODE:'fixture'})).toBe('fixture');
});
it.each(['','retained',' Selected','selected ','Selected','true'])('refuses unknown pilot setting %s',mode=>{expect(()=>resolveCanadaPilotMode({CANADA_PILOT_MODE:mode})).toThrow();});
it.each(['CANADA_PREVIEW_MODE','CANADA_ACCEPTED_PREVIEW_MODE'] as const)('refuses even an empty active private-preview setting %s',name=>{
  for(const mode of ['selected','fixture'])for(const value of ['','fixture','selected','retained'])expect(()=>resolveCanadaPilotMode({CANADA_PILOT_MODE:mode,TRADE_DATA_MODE:mode==='fixture'?'fixture':'census',[name]:value})).toThrow();
  expect(()=>resolveCanadaPilotMode({CANADA_PILOT_MODE:'selected',CANADA_PREVIEW_MODE:'fixture',CANADA_ACCEPTED_PREVIEW_MODE:'fixture'})).toThrow();
});
it.each([['selected','fixture'],['selected',''],['selected','published'],['fixture',undefined],['fixture','census'],['fixture','']] as const)('refuses mixed pilot %s/product %s modes',(pilot,product)=>{expect(()=>resolveCanadaPilotMode({CANADA_PILOT_MODE:pilot,TRADE_DATA_MODE:product})).toThrow();});
