import {afterEach,describe,expect,it,vi} from 'vitest';
import {readFile,writeFile,unlink,symlink,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import * as fs from 'node:fs/promises';
import {snapshotFixture,consumeContexts} from '../helpers/country-snapshot-data';
vi.mock('node:fs/promises',async(importOriginal)=>{const actual=await importOriginal<typeof fs>();return {...actual,open:vi.fn(actual.open)};});

const fixtures:Awaited<ReturnType<typeof snapshotFixture>>[]=[];
afterEach(async()=>{vi.restoreAllMocks();vi.mocked(fs.open).mockReset();for(const f of fixtures.splice(0))await f.cleanup();});
async function setup(options:Parameters<typeof snapshotFixture>[0]={}){const f=await snapshotFixture(options);fixtures.push(f);return {f, input:await f.input()};}
describe('reviewed snapshot input authentication',()=>{
  it('reads all 48 bound contexts and keeps capture-era flags and provenance',async()=>{
    const {f,input}=await setup();const c=await input.loadReviewedCollection(f.repoRoot);
    const values=await consumeContexts(c);expect(values).toHaveLength(48);
    expect(values[0]).toMatchObject({id:'imports-2024-09',countryTotalUsd:200000});
    expect(values[1].rows[1]).toMatchObject({code:'880000',specialAtCapture:false});
    expect(c).toMatchObject({sourceProcessingCommit:'a'.repeat(40),parserProcessingCommit:'b'.repeat(40),rawVerification:'previous-reviewed-replay'});
    expect(values.find(x=>x.id==='exports-2026-05')?.afterReference.publicationUsd).toBe(29790800000);
  });
  it.each(['crossedReceipt','duplicateContext','wrongMeasure','invalidTimestamp','duplicateRow','unsafeValue','nullValue','traversal'] as const)('rejects %s even when fixture hashes match',async(option)=>{
    const {f,input}=await setup({[option]:true});await expect((async()=>consumeContexts(await input.loadReviewedCollection(f.repoRoot)))()).rejects.toThrow();
  });
  it.each(['missing','changed','length'] as const)('rejects %s anchors',async(mode)=>{
    const {f,input}=await setup();const path=resolve(f.repoRoot,f.contract.anchors.bulk.path);
    if(mode==='missing')await unlink(path);else {const bytes=await readFile(path);if(mode==='changed')bytes[0]^=1;await writeFile(path,mode==='length'?Buffer.concat([bytes,Buffer.from(' ')]):bytes);}
    await expect(input.loadReviewedCollection(f.repoRoot)).rejects.toThrow();
  });
  it('rejects normalized bytes changed after collection loading',async()=>{
    const {f,input}=await setup();const c=await input.loadReviewedCollection(f.repoRoot);
    await writeFile(resolve(f.repoRoot,f.contract.normalizedRoot,'imports-2024-09-hs6.json'),'[]');
    await expect(consumeContexts(c)).rejects.toThrow();
  });
  it('rejects bytes changed between path validation and the bounded read',async()=>{
    const {f,input}=await setup();const originalOpen=vi.mocked(fs.open).getMockImplementation()!;
    vi.mocked(fs.open).mockImplementation(async(...args)=>{
      const handle=await originalOpen(...args);
      if(String(args[0]).endsWith('bulk-report.json')) {
        const body=await readFile(args[0]);body[0]^=1;await writeFile(args[0],body);
      }
      return handle;
    });
    await expect(input.loadReviewedCollection(f.repoRoot)).rejects.toThrow();
  });
  it('rejects junction ancestors rather than reading their targets',async()=>{
    const {f,input}=await setup();const source=resolve(f.repoRoot,f.contract.sourceRoot), moved=source+'-moved';
    await rename(source,moved);await symlink(moved,source,process.platform==='win32'?'junction':'dir');
    await expect(input.loadReviewedCollection(f.repoRoot)).rejects.toThrow();
  });
});
