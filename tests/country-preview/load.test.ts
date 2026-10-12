import {afterEach,describe,expect,it,vi} from 'vitest';
import * as fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {makeCountryAssessmentFixture,makeCountryPreviewFixture} from '../helpers/country-preview-data';
import {canadaPreviewContract} from '../../src/lib/country-preview/contract.server';
import {loadCanadaPreview,resolveCanadaPreviewMode,validateFixturePreview} from '../../src/lib/country-preview/load.server';
vi.mock('node:fs/promises',async(original)=>{const actual=await original<typeof fs>();return {...actual,open:vi.fn(actual.open)};});
const roots:string[]=[];
afterEach(async()=>{vi.restoreAllMocks();vi.unstubAllEnvs();for(const root of roots.splice(0))await fs.rm(root,{recursive:true,force:true});});
async function setup(){
  const root=await fs.mkdtemp(resolve('.superpowers/sdd/2026-10-12-canada-profile-prototype/loader-'));roots.push(root);
  const body=Buffer.from(JSON.stringify(makeCountryAssessmentFixture()));
  vi.spyOn(canadaPreviewContract,'assessment','get').mockReturnValue({path:'source/assessment.json',bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')} as unknown as typeof canadaPreviewContract.assessment);
  await fs.mkdir(resolve(root,'source'));await fs.writeFile(resolve(root,'source/assessment.json'),body);
  return {root,path:resolve(root,'source/assessment.json'),body};
}
describe('explicit Canada preview input',()=>{
  it('requires an explicit recognized preview mode',()=>{
    expect(resolveCanadaPreviewMode(undefined)).toBeNull();expect(resolveCanadaPreviewMode('fixture')).toBe('fixture');expect(resolveCanadaPreviewMode('retained')).toBe('retained');
    for(const v of ['','Fixture',' retained','retained ','census'])expect(()=>resolveCanadaPreviewMode(v)).toThrow();
  });
  it('returns before file operations or path validation when unset',async()=>{
    vi.stubEnv('CANADA_PREVIEW_MODE',undefined);const open=vi.mocked(fs.open);open.mockClear();
    expect(await loadCanadaPreview({workspaceRoot:'Z:/missing-workspace'})).toBeNull();expect(open).not.toHaveBeenCalled();
  });
  it('loads synthetic fixture independently of the retained assessment',async()=>{
    const data=await loadCanadaPreview({modeValue:'fixture'});
    expect(data).toEqual(makeCountryPreviewFixture());expect(data?.directions.exports.monthly).toHaveLength(24);expect(data?.directions.imports.products).toHaveLength(10);
  });
  it.each(['provenance','grid','candidates','number','availability'] as const)('rejects a crossed synthetic %s',kind=>{
    const data=makeCountryPreviewFixture();if(kind==='provenance')data.source='retained';if(kind==='grid')data.directions.imports.monthly=[];if(kind==='candidates')data.directions.exports.products=[];if(kind==='number')data.directions.imports.summary.latestUsd=NaN;if(kind==='availability')(data.availability as Record<string,boolean>).releaseAccepted=true;
    expect(()=>validateFixturePreview(data)).toThrow();
  });
  it('authenticates one bounded assessment without other source reads',async()=>{
    const {root}=await setup();vi.mocked(fs.open).mockClear();const result=await loadCanadaPreview({workspaceRoot:root,modeValue:'retained'});
    expect(result?.source).toBe('retained');expect(result?.directions.exports.monthly).toHaveLength(24);expect(vi.mocked(fs.open).mock.calls).toHaveLength(1);
  });
  it.each(['missing','length','hash','oversize'] as const)('fails retained %s without fallback',async(kind)=>{
    const {root,path,body}=await setup();if(kind==='missing')await fs.unlink(path);if(kind==='length')await fs.writeFile(path,Buffer.concat([body,Buffer.from(' ')]));if(kind==='hash'){body[0]^=1;await fs.writeFile(path,body);}if(kind==='oversize')vi.spyOn(canadaPreviewContract,'assessment','get').mockReturnValue({...canadaPreviewContract.assessment,bytes:1048577} as unknown as typeof canadaPreviewContract.assessment);
    await expect(loadCanadaPreview({workspaceRoot:root,modeValue:'retained'})).rejects.toThrow('Canada preview assessment unavailable');
  });
  it('rejects a real reparse ancestor',async()=>{
    const {root}=await setup();const source=resolve(root,'source'),moved=resolve(root,'moved');await fs.rename(source,moved);await fs.symlink(moved,source,process.platform==='win32'?'junction':'dir');
    await expect(loadCanadaPreview({workspaceRoot:root,modeValue:'retained'})).rejects.toThrow();
  });
  it('rejects changed bytes during the bounded read',async()=>{
    const {root,path,body}=await setup();const actual=vi.mocked(fs.open).getMockImplementation()!;
    vi.mocked(fs.open).mockImplementation(async(...args)=>{const handle=await actual(...args);if(String(args[0])===path){body[0]^=1;await fs.writeFile(path,body);}return handle;});
    await expect(loadCanadaPreview({workspaceRoot:root,modeValue:'retained'})).rejects.toThrow();
  });
});
