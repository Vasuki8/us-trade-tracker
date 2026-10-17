import {afterAll,beforeAll,expect,it} from 'vitest';import {copyFile,mkdir,mkdtemp,writeFile,rm} from 'node:fs/promises';import {join} from 'node:path';import {tmpdir} from 'node:os';
import {loadRelease,loadPublishedReleases} from '../../src/lib/trade/load-release';import {PRODUCTS,type ProductDefinition} from '../../src/lib/trade/product-registry';import {productDataPaths} from '../../scripts/product-paths';import {createProductArchiveFixture} from '../helpers/product-data';
const registry:ProductDefinition[]=[PRODUCTS.find(product=>product.code==='090121')!,{code:'090122',displayName:'Synthetic second product',importable:true,published:true,dutiesAccepted:true}],dirs:string[]=[];let prepared:any;
beforeAll(async()=>{const f=await createProductArchiveFixture('090122',{duties:true});dirs.push(f.dataDir);prepared=JSON.parse(f.input.releaseBytes.toString());},30_000);afterAll(async()=>{for(const dir of dirs)await rm(dir,{recursive:true,force:true});});
async function root(){const dir=await mkdtemp(join(tmpdir(),'trade-loader-'));dirs.push(dir);await mkdir(join(dir,'tests/fixtures'),{recursive:true});for(const name of ['product-release.json','product-release-090122.json'])await copyFile(join(process.cwd(),'tests/fixtures',name),join(dir,'tests/fixtures',name));return dir;}
async function save(root:string,code:string,release:any){const {processedDir}=productDataPaths(root,code);await mkdir(join(processedDir,'releases'),{recursive:true});await writeFile(join(processedDir,'releases/test.json'),JSON.stringify(release));await writeFile(join(processedDir,'current.json'),JSON.stringify({releaseFile:'releases/test.json'}));}
function forCode(code:string){const r=structuredClone(prepared);r.productCode=code;for(const row of [...r.observations,...r.duties.observations])row.productCode=code;return r;}
it('loads both explicitly synthetic published profiles with distinct world totals',async()=>{
 const workspaceRoot=await root(),all=await loadPublishedReleases({workspaceRoot,mode:'fixture'});expect(all.map(x=>x.product.code)).toEqual(['090121','090122']);const b=all[1].release;expect(b.source).toBe('fixture');for(const [direction,value] of [['imports',300],['exports',600]])expect(b.observations.find(x=>x.month===b.reportingMonth&&x.geography==='world'&&x.direction===direction)?.valueUsd).toBe(value);
});
it('rejects unknown modes and unreviewed product identities',async()=>{
 await expect(loadRelease('090122',{mode:'census'})).rejects.toThrow(/reviewed/i);await expect(loadPublishedReleases({mode:'mystery' as any})).rejects.toThrow(/mode/i);await expect(loadRelease('090124',{mode:'fixture'})).rejects.toThrow(/reviewed/i);
});
it('excludes an importable unpublished product without requiring its file',async()=>{
 const workspaceRoot=await root(),all=await loadPublishedReleases({workspaceRoot,mode:'fixture',registry:registry.map(product=>product.code==='090122'?{...product,published:false}:product)});expect(all.map(x=>x.product.code)).toEqual(['090121']);
});
it('fails the published set when a required Census release is missing or belongs to another product',async()=>{
 const workspaceRoot=await root();await save(workspaceRoot,'090121',forCode('090121'));await expect(loadPublishedReleases({workspaceRoot,mode:'census',registry})).rejects.toThrow(/090122/);
 await save(workspaceRoot,'090122',forCode('090121'));await expect(loadPublishedReleases({workspaceRoot,mode:'census',registry})).rejects.toThrow(/090122/);
});
it('rejects fixture provenance in Census mode and wrong fixture product identity',async()=>{
 const workspaceRoot=await root(),a=await loadRelease('090121',{workspaceRoot,mode:'fixture'});await save(workspaceRoot,'090121',a);await expect(loadRelease('090121',{workspaceRoot,mode:'census'})).rejects.toThrow();await writeFile(join(workspaceRoot,'tests/fixtures/product-release-090122.json'),JSON.stringify(a));await expect(loadRelease('090122',{workspaceRoot,mode:'fixture'})).rejects.toThrow(/product/i);
});
it('requires acceptance for published v2 duties while preserving merchandise-only v1 profiles',async()=>{
 const workspaceRoot=await root(),restricted=[{...registry.find(product=>product.code==='090122')!,dutiesAccepted:false}];await save(workspaceRoot,'090122',prepared);await expect(loadPublishedReleases({workspaceRoot,mode:'census',registry:restricted})).rejects.toThrow(/duties/i);
 const v1=structuredClone(prepared);v1.schemaVersion=1;delete v1.duties;await save(workspaceRoot,'090122',v1);expect((await loadPublishedReleases({workspaceRoot,mode:'census',registry:restricted}))[0].release.schemaVersion).toBe(1);
});
it('loads separate non-coffee inputs and excludes a rejected intake member',async()=>{
 // Synthetic normalized sources exercise the generic loader; these are not intake acceptance.
 const workspaceRoot=await root(),codes=['090240','180100'];
 const selected:ProductDefinition[]=codes.map((code,index)=>({code,displayName:index===0?'Synthetic tea':'Synthetic cocoa',importable:true,published:true,dutiesAccepted:true}));
 selected.push({code:'090122',displayName:'Rejected synthetic intake',importable:true,published:false,dutiesAccepted:false});
 for(const [index,code]of codes.entries()){
  const release=forCode(code),factor=index+1;
  for(const row of release.observations)if(row.valueUsd!==null)row.valueUsd*=factor;
  for(const row of release.duties.observations){for(const key of ['calculatedDuty','consumptionValue','dutiableValue'])if(row[key].valueUsd!==null)row[key].valueUsd*=factor;if(row.coverage.uncalculatedDutiableValueUsd!==null)row.coverage.uncalculatedDutiableValueUsd*=factor;}
  await save(workspaceRoot,code,release);
 }
 const all=await loadPublishedReleases({workspaceRoot,mode:'census',registry:selected});expect(all.map(p=>p.product.code)).toEqual(codes);
 const a=all[0].release.observations.find(r=>r.geography==='world')!,b=all[1].release.observations.find(r=>r.geography==='world')!;
 expect(a.productCode).toBe('090240');expect(b.productCode).toBe('180100');expect(b.valueUsd).toBe(a.valueUsd!*2);
 const paths=productDataPaths(workspaceRoot,'180100');await writeFile(join(paths.processedDir,'releases/test.json'),JSON.stringify(forCode('090240')));
 await expect(loadPublishedReleases({workspaceRoot,mode:'census',registry:selected})).rejects.toThrow(/180100/);
});
