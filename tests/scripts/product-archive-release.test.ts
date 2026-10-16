import {afterAll,beforeAll,expect,it} from 'vitest';
import {mkdtemp,mkdir,readFile,writeFile,rm,stat} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {createProductArchiveFixture,syntheticProductFetch} from '../helpers/product-data';import {MemoryArchiveStore} from '../helpers/archive-store';
import {packBundle,encodePointer} from '../../scripts/archive-bundle';import {productArchiveKeys} from '../../scripts/product-paths';
import {restoreForImport,stageCandidate,promoteCandidate,parseRunState,parseCandidateState,recoverBundle,decodeCandidateBundle,type ArchiveContext} from '../../scripts/archive-release';import {prepareRelease} from '../../scripts/prepare-release';
const dirs:string[]=[];let fixtures:Awaited<ReturnType<typeof createProductArchiveFixture>>[];
beforeAll(async()=>{fixtures=await Promise.all(['090121','090122'].map(code=>createProductArchiveFixture(code)));dirs.push(...fixtures.map(f=>f.dataDir));},30_000);
afterAll(async()=>{for(const dir of dirs)await rm(dir,{recursive:true,force:true});});
const receipt={artifactId:'123',artifactDigest:'e'.repeat(64)};
async function context(code:string,store=new MemoryArchiveStore(),initial=true){
 const root=await mkdtemp(join(tmpdir(),'trade-product-protocol-'));dirs.push(root);const pkg=packBundle(fixtures[code==='090121'?0:1].input,code),key=productArchiveKeys(code).currentKey;
 if(initial){store.seed(pkg.reference.key,pkg.bytes);store.seed(key,encodePointer(pkg.reference,code));}
 return {ctx:{store,dataDir:join(root,'data'),runDir:join(root,'run'),productCode:code} as ArchiveContext,store,pkg,key};
}
async function stage(c:Awaited<ReturnType<typeof context>>,initial=true){
 const run=await restoreForImport(c.ctx,{reportingMonth:'2026-08',initialize:!initial});
 await prepareRelease({productCode:c.ctx.productCode!,end:'2026-08',months:60,apiKey:'synthetic',outputDir:join(c.ctx.dataDir,'processed'),codeVersion:'next'},syntheticProductFetch(c.ctx.productCode!,{worldDelta:100}));
 return {run,candidate:await stageCandidate(c.ctx,run)};
}
it('restores, stages and promotes two products independently on one store',async()=>{
 const store=new MemoryArchiveStore(),a=await context('090121',store),b=await context('090122',store);const original=Buffer.from(store.objects.get(a.key)!.bytes);
 const staged=await stage(b);expect(staged.run).toMatchObject({schemaVersion:2,productCode:'090122'});expect(staged.candidate).toMatchObject({schemaVersion:2,productCode:'090122'});
 expect((await promoteCandidate(b.ctx,staged.candidate,receipt)).status).toBe('acknowledged');expect(store.objects.get(a.key)!.bytes).toEqual(original);expect(store.objects.get(b.key)!.bytes).toEqual(encodePointer(staged.candidate.reference,'090122'));
 const coffee=await stage(a);await promoteCandidate(a.ctx,coffee.candidate,receipt);expect(store.pointerPutCalls).toBe(2);
},20_000);
it('rejects a crossed initial run before any local candidate or remote PUT',async()=>{
 const c=await context('090121',undefined,false),run=await restoreForImport(c.ctx,{reportingMonth:'2026-08',initialize:true});
 c.ctx.dataDir=fixtures[1].dataDir;await expect(stageCandidate(c.ctx,run)).rejects.toThrow(/product|identity/i);expect(c.store.puts).toHaveLength(0);await expect(stat(join(c.ctx.runDir,'bundle.json'))).rejects.toThrow();
});
it('normalizes legacy coffee states, and rejects mismatched run/candidate/baseline identities',()=>{
 const a=packBundle(fixtures[0].input),b=packBundle(fixtures[1].input,'090122'),legacy={schemaVersion:1,reportingMonth:'2026-08',baseline:null};
 expect(parseRunState(legacy)).toEqual({schemaVersion:2,productCode:'090121',reportingMonth:'2026-08',baseline:null});expect(()=>parseRunState(legacy,'090122')).toThrow();
 const candidate={schemaVersion:1,run:legacy,reference:a.reference,bundleFile:'bundle.json'};expect(parseCandidateState(candidate).productCode).toBe('090121');expect(()=>parseCandidateState(candidate,'090122')).toThrow();
 expect(()=>parseRunState({schemaVersion:2,productCode:'090122',reportingMonth:'2026-08',baseline:{reference:a.reference,etag:'"x"',releaseId:fixtures[0].input.releaseId,releaseSha256:'a'.repeat(64)}},'090122')).toThrow();
 expect(()=>parseCandidateState({schemaVersion:2,productCode:'090122',run:{...legacy,schemaVersion:2,productCode:'090121'},reference:b.reference,bundleFile:'bundle.json'},'090122')).toThrow();
});
it('rejects another product candidate in an empty run before transport',async()=>{
 const a=await context('090121',undefined,false),staged=await stage(a,false),b=await context('090122',a.store,false);const count=a.store.puts.length;
 await expect(promoteCandidate(b.ctx,staged.candidate,receipt)).rejects.toThrow();expect(a.store.puts).toHaveLength(count);expect(a.store.objects.has(b.key)).toBe(false);
});
it('keeps both pointers intact on missing backup and preserves a competing second-product pointer',async()=>{
 const store=new MemoryArchiveStore(),a=await context('090121',store),b=await context('090122',store),staged=await stage(b),original=Buffer.from(store.objects.get(a.key)!.bytes),prior=Buffer.from(store.objects.get(b.key)!.bytes);
 await expect(promoteCandidate(b.ctx,staged.candidate,{artifactId:'',artifactDigest:''})).rejects.toThrow();expect(store.objects.get(a.key)!.bytes).toEqual(original);expect(store.objects.get(b.key)!.bytes).toEqual(prior);
 const competing=Buffer.from('competing');store.seed(b.key,competing);expect((await promoteCandidate(b.ctx,staged.candidate,receipt)).status).toBe('conflict');expect(store.objects.get(a.key)!.bytes).toEqual(original);expect(store.objects.get(b.key)!.bytes).toEqual(competing);
});
it('rejects wrong-product offline recovery before writing and refuses occupied coffee products roots',async()=>{
 const c=await context('090121',undefined,false),path=join(c.ctx.runDir,'bundle.json');await mkdir(c.ctx.runDir,{recursive:true});await writeFile(path,c.pkg.bytes);const target=join(c.ctx.runDir,'recover');
 await expect(recoverBundle(path,c.pkg.reference.sha256,target,'090122')).rejects.toThrow();await expect(stat(target)).rejects.toThrow();
 await mkdir(join(target,'products/090122'),{recursive:true});const marker=join(target,'products/090122/marker');await writeFile(marker,'preserve');await expect(recoverBundle(path,c.pkg.reference.sha256,target)).rejects.toThrow(/empty/i);expect(await readFile(marker,'utf8')).toBe('preserve');
});
it('allows a legacy coffee candidate to promote after normalization',async()=>{
 const c=await context('090121',undefined,false),staged=await stage(c,false),legacy={schemaVersion:1,run:{schemaVersion:1,reportingMonth:'2026-08',baseline:null},reference:staged.candidate.reference,bundleFile:'bundle.json'};
 expect((await promoteCandidate(c.ctx,parseCandidateState(legacy),receipt)).status).toBe('acknowledged');
});

it('binds the selected synthetic product when decoding a candidate',async()=>{
 const c=await context('090122'),staged=await stage(c),bytes=await readFile(join(c.ctx.runDir,'bundle.json'));
 expect(decodeCandidateBundle(bytes,staged.candidate,'090122').manifest.productCode).toBe('090122');
 expect(()=>decodeCandidateBundle(bytes,staged.candidate,'090121')).toThrow(/product|identity/i);
 expect(c.store.pointerPutCalls).toBe(0);
});
