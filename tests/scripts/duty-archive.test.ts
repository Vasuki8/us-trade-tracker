import {afterAll,beforeAll,expect,it} from 'vitest';
import {mkdtemp,readFile,readdir,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {prepareRelease,readCurrentRelease} from '../../scripts/prepare-release';
import {syntheticDutyFetch} from '../helpers/duties';
import {createArchiveFixture} from '../helpers/archive';
import {MemoryArchiveStore} from '../helpers/archive-store';
import {packBundle,unpackBundle,sha256,encodePointer,CURRENT_KEY,type BundleInput,type ArchiveBundle} from '../../scripts/archive-bundle';
import {restoreForImport,stageCandidate,promoteCandidate,recoverBundle} from '../../scripts/archive-release';
import {runArchiveCommand} from '../../scripts/archive-product';
const dirs:string[]=[];afterAll(async()=>{for(const dir of dirs)await rm(dir,{recursive:true,force:true});});
let input:BundleInput;
const classificationIntervals=[{from:'2021-09',to:'2026-08',evidenceUrl:'https://example.invalid/synthetic'}];
beforeAll(async()=>{
 const dataDir=await mkdtemp(join(tmpdir(),'trade-duty-archive-'));dirs.push(dataDir);
 await prepareRelease({productCode:'090121',end:'2026-08',months:60,apiKey:'synthetic',outputDir:join(dataDir,'processed'),codeVersion:'synthetic-duty-archive',includeDuties:true,classificationIntervals},syntheticDutyFetch());
 const p=JSON.parse(await readFile(join(dataDir,'processed/current.json'),'utf8')),id=p.releaseFile.slice(9,-5),rawRecords=new Map<string,Buffer>();
 for(const name of await readdir(join(dataDir,'raw',id)))rawRecords.set(`raw/${name}`,await readFile(join(dataDir,'raw',id,name)));
 input={releaseId:id,releaseBytes:await readFile(join(dataDir,'processed',p.releaseFile)),rawRecords,previous:null};
});
function edit(bundle:ArchiveBundle,path:string,change:(value:any)=>void){
 const f=bundle.files.find(f=>f.path===path)!,value=JSON.parse(Buffer.from(f.contentBase64,'base64').toString());change(value);
 const bytes=Buffer.from(JSON.stringify(value));f.contentBase64=bytes.toString('base64');Object.assign(bundle.manifest.files.find(f=>f.path===path)!,{bytes:bytes.length,sha256:sha256(bytes)});
}
it('recovers all 337 v2 original files offline and keeps a v1 predecessor identity',async()=>{
 const legacy=await createArchiveFixture();dirs.push(legacy.dataDir);const old=packBundle(legacy.input),pkg=packBundle({...input,previous:old.reference}),decoded=unpackBundle(pkg.bytes,pkg.reference.sha256);
 expect(decoded.manifest).toMatchObject({schemaVersion:2,scope:{merchandiseMonths:60,dutyMonths:24},previous:old.reference});expect(decoded.files.size).toBe(337);
 const dir=await mkdtemp(join(tmpdir(),'trade-duty-recovery-'));dirs.push(dir);await writeFile(join(dir,'bundle.json'),pkg.bytes);await recoverBundle(join(dir,'bundle.json'),pkg.reference.sha256,join(dir,'data'));
 expect(await readCurrentRelease(join(dir,'data/processed'))).toEqual(decoded.release);
 expect(await readFile(join(dir,'data/processed/releases',`${input.releaseId}.json`))).toEqual(input.releaseBytes);
 for(const [path,bytes] of input.rawRecords)expect(await readFile(join(dir,'data/raw',input.releaseId,path.slice(4)))).toEqual(bytes);
 expect(unpackBundle(old.bytes,old.reference.sha256).files.get('release.json')).toEqual(legacy.input.releaseBytes);
});
it.each(['duty','rp','query','checksum','missing','coverage','extra-money','scope','version'])('rejects v2 %s tampering even when outer hashes are recomputed',kind=>{
 const pkg=packBundle(input),b:ArchiveBundle=JSON.parse(pkg.bytes.toString());
 if(kind==='missing')b.files.pop();
 else if(kind==='checksum')b.manifest.files[0].sha256='a'.repeat(64);
 else if(kind==='scope')(b.manifest as any).scope.dutyMonths=12;
 else if(kind==='version')b.manifest.schemaVersion=1;
 else if(['duty','coverage','extra-money'].includes(kind))edit(b,'release.json',r=>{if(kind==='duty')r.duties.observations[0].calculatedDuty.valueUsd++;if(kind==='coverage')r.duties.observations[0].coverage.uncalculatedDutiableValueUsd++;if(kind==='extra-money')r.duties.observations[0].calculatedDuty.privateKey='synthetic';});
 else edit(b,'raw/duties-2026-08-HSRP.json',r=>{if(kind==='query'){const u=new URL(r.requestUrl);u.searchParams.set('SUMMARY_LVL2','HS');r.requestUrl=u.toString();}else r.payload[1][r.payload[0].indexOf('DUT_VAL_MO')]='999';});
 const bytes=Buffer.from(JSON.stringify(b));expect(()=>unpackBundle(bytes,sha256(bytes))).toThrow();
});
it('stages v2 against v1, verifies its backup without credentials and restores it on a fresh runner',async()=>{
 const legacy=await createArchiveFixture();dirs.push(legacy.dataDir);const old=packBundle(legacy.input),store=new MemoryArchiveStore();store.seed(old.reference.key,old.bytes);store.seed(CURRENT_KEY,encodePointer(old.reference));
 const root=await mkdtemp(join(tmpdir(),'trade-duty-protocol-'));dirs.push(root);const ctx={store,dataDir:join(root,'data'),runDir:join(root,'run')};
 const run=await restoreForImport(ctx,{reportingMonth:'2026-08',initialize:false});
 await prepareRelease({productCode:'090121',end:'2026-08',months:60,apiKey:'synthetic',outputDir:join(ctx.dataDir,'processed'),codeVersion:'next',includeDuties:true,classificationIntervals},syntheticDutyFetch());
 const candidate=await stageCandidate(ctx,run);expect(store.pointerPutCalls).toBe(0);
 let calls=0;await runArchiveCommand(['verify','--data-dir',join(root,'offline'),'--run-dir',ctx.runDir],{},()=>{calls++;throw new Error('No credentials');});expect(calls).toBe(0);
 expect((await promoteCandidate(ctx,candidate,{artifactId:'123',artifactDigest:'e'.repeat(64)})).status).toBe('acknowledged');
 const next={store,dataDir:join(root,'next/data'),runDir:join(root,'next/run')};const nextRun=await restoreForImport(next,{reportingMonth:'2026-08',initialize:false});
 const release=await readCurrentRelease(join(next.dataDir,'processed'));expect(release.schemaVersion).toBe(2);
 await prepareRelease({productCode:'090121',end:'2026-08',months:60,apiKey:'synthetic',outputDir:join(next.dataDir,'processed'),codeVersion:'next2',includeDuties:true,classificationIntervals},syntheticDutyFetch());
 const pointer=JSON.parse(await readFile(join(next.dataDir,'processed/current.json'),'utf8')),path=join(next.dataDir,'processed',pointer.releaseFile),forged=JSON.parse(await readFile(path,'utf8'));forged.duties.revisedKeys=['forged'];await writeFile(path,JSON.stringify(forged));
 const accepted=store.objects.get(CURRENT_KEY)!.bytes;await expect(stageCandidate(next,nextRun)).rejects.toThrow(/duty revisions/);expect(store.objects.get(CURRENT_KEY)!.bytes).toEqual(accepted);
});
