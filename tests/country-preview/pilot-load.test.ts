import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {loadCanadaPilot} from '../../src/lib/country-preview/pilot-load.server';
import {loadAcceptedCanadaPreview} from '../../src/lib/country-preview/accepted-load.server';
import {makeCountryPreviewFixture} from '../helpers/country-preview-data';
vi.mock('../../src/lib/country-preview/accepted-load.server',()=>({loadAcceptedCanadaPreview:vi.fn()}));
beforeEach(()=>{vi.mocked(loadAcceptedCanadaPreview).mockReset();});
afterEach(()=>vi.unstubAllEnvs());
it('returns before any upstream read when unset or crossed',async()=>{
  expect(await loadCanadaPilot({workspaceRoot:'Z:/missing',environment:{}})).toBeNull();
  for(const environment of [{CANADA_PILOT_MODE:'selected',TRADE_DATA_MODE:'fixture'},{CANADA_PILOT_MODE:'selected',CANADA_PREVIEW_MODE:''}])await expect(loadCanadaPilot({environment})).rejects.toThrow();
  expect(loadAcceptedCanadaPreview).not.toHaveBeenCalled();
});
it('defaults to current environment without changing it',async()=>{
  vi.stubEnv('CANADA_PILOT_MODE',undefined);expect(await loadCanadaPilot()).toBeNull();expect(loadAcceptedCanadaPreview).not.toHaveBeenCalled();
});
it('maps authenticated selected presentation only, preserving projection identity and flags',async()=>{
  const data=makeCountryPreviewFixture();data.source='retained';data.rawVerification='previous-reviewed-replay';
  const input={data,presentation:{kind:'accepted-local' as const,releaseId:'accepted-release',acceptedAt:'2026-10-12T23:46:54.013Z'},proof:'owner-private-evidence'};
  vi.mocked(loadAcceptedCanadaPreview).mockResolvedValue(input);
  const result=await loadCanadaPilot({workspaceRoot:'staged-project',environment:{CANADA_PILOT_MODE:'selected'}});
  expect(loadAcceptedCanadaPreview).toHaveBeenCalledExactlyOnceWith({workspaceRoot:'staged-project',modeValue:'selected'});
  expect(result).toEqual({data,presentation:{kind:'pilot-prepared',releaseId:'accepted-release',acceptedAt:input.presentation.acceptedAt}});expect(result?.data).toBe(data);expect(JSON.stringify(result)).not.toContain('owner-private-evidence');expect(data.availability.releaseAccepted).toBe(false);
});
it('maps explicit fixtures without a selected identity',async()=>{
  const data=makeCountryPreviewFixture();vi.mocked(loadAcceptedCanadaPreview).mockResolvedValue({data,presentation:{kind:'accepted-fixture'}});
  const result=await loadCanadaPilot({environment:{CANADA_PILOT_MODE:'fixture',TRADE_DATA_MODE:'fixture'}});
  expect(result).toEqual({data,presentation:{kind:'pilot-fixture'}});expect(result?.data).toBe(data);
});
it.each(['failure','null','crossed'] as const)('refuses %s reader outcome without fallback or leaking diagnostics',async kind=>{
  if(kind==='failure')vi.mocked(loadAcceptedCanadaPreview).mockRejectedValue(Error('private-path secret'));
  if(kind==='null')vi.mocked(loadAcceptedCanadaPreview).mockResolvedValue(null);
  if(kind==='crossed')vi.mocked(loadAcceptedCanadaPreview).mockResolvedValue({data:makeCountryPreviewFixture(),presentation:{kind:'accepted-fixture'}});
  await expect(loadCanadaPilot({environment:{CANADA_PILOT_MODE:'selected'}})).rejects.toThrow('Canada pilot unavailable or invalid');expect(loadAcceptedCanadaPreview).toHaveBeenCalledTimes(1);
});
it('snapshot maps to selected without changing research',async()=>{
  const data=makeCountryPreviewFixture();data.source='retained';data.rawVerification='previous-reviewed-replay';
  const before=JSON.stringify(data),acceptedAt='2026-10-12T23:46:54.013Z';
  vi.mocked(loadAcceptedCanadaPreview).mockImplementation(async options=>{
    if(options?.modeValue!=='selected')throw Error('Unsupported reader mode private-path');
    return {data,presentation:{kind:'accepted-local',releaseId:'accepted-release',acceptedAt},proof:'owner-private-evidence'};
  });
  const result=await loadCanadaPilot({workspaceRoot:'staged-project',environment:{CANADA_PILOT_MODE:'snapshot'}});
  expect(loadAcceptedCanadaPreview).toHaveBeenCalledExactlyOnceWith({workspaceRoot:'staged-project',modeValue:'selected'});
  expect(result).toEqual({data,presentation:{kind:'pilot-snapshot',releaseId:'accepted-release',acceptedAt}});
  expect(result?.data).toBe(data);expect(JSON.stringify(data)).toBe(before);expect(data.availability.releaseAccepted).toBe(false);
  expect(Object.keys(result!)).toEqual(['data','presentation']);expect(JSON.stringify(result)).not.toContain('owner-private-evidence');
});
it.each(['failure','null','accepted-fixture','fixture-source','synthetic-replay'] as const)('snapshot %s never falls back or leaks diagnostics',async kind=>{
  const data=makeCountryPreviewFixture();data.source='retained';data.rawVerification='previous-reviewed-replay';
  if(kind==='fixture-source')data.source='fixture';if(kind==='synthetic-replay')data.rawVerification='synthetic';
  if(kind==='failure')vi.mocked(loadAcceptedCanadaPreview).mockRejectedValue(Error('private-path secret'));
  else if(kind==='null')vi.mocked(loadAcceptedCanadaPreview).mockResolvedValue(null);
  else vi.mocked(loadAcceptedCanadaPreview).mockResolvedValue({data,presentation:kind==='accepted-fixture'?{kind:'accepted-fixture'}:{kind:'accepted-local',releaseId:'accepted-release',acceptedAt:'2026-10-12T23:46:54.013Z'}});
  await expect(loadCanadaPilot({environment:{CANADA_PILOT_MODE:'snapshot'}})).rejects.toThrow('Canada pilot unavailable or invalid');
  expect(loadAcceptedCanadaPreview).toHaveBeenCalledTimes(1);
});
it('rejects crossed snapshot configuration before any upstream read',async()=>{
  for(const environment of [{CANADA_PILOT_MODE:'snapshot',TRADE_DATA_MODE:'fixture'},{CANADA_PILOT_MODE:'snapshot',CANADA_PREVIEW_MODE:''},{CANADA_PILOT_MODE:'snapshot',CANADA_ACCEPTED_PREVIEW_MODE:''}])await expect(loadCanadaPilot({environment})).rejects.toThrow();
  expect(loadAcceptedCanadaPreview).not.toHaveBeenCalled();
});
