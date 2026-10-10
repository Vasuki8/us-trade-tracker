import {afterAll,expect,it} from 'vitest';import {mkdtemp,readFile,writeFile,rm,stat} from 'node:fs/promises';import {join} from 'node:path';import {tmpdir} from 'node:os';import {parse} from 'yaml';
import {parseArchiveDispatch} from '../../scripts/archive-inputs';import {runArchiveCommand} from '../../scripts/archive-product';import {createProductArchiveFixture} from '../helpers/product-data';import {productDataPaths} from '../../scripts/product-paths';import {PRODUCTS,type ProductDefinition} from '../../src/lib/trade/product-registry';
const registry:ProductDefinition[]=[...PRODUCTS,{code:'090122',displayName:'Synthetic second product',importable:true,published:false,dutiesAccepted:false},{code:'090123',displayName:'Unavailable',importable:false,published:false,dutiesAccepted:false}];
const valid={REPORTING_MONTH:'2026-08',GITHUB_REF:'refs/heads/main',ARCHIVE_TO_R2:'true'};const dirs:string[]=[];afterAll(async()=>{for(const dir of dirs)await rm(dir,{recursive:true,force:true});});
it.each(['no','09012','090124','090123'])('rejects unreviewed or unavailable selection %s before creating a provider',async code=>{
 let calls=0;await expect(runArchiveCommand(['restore','--data-dir','data','--run-dir','run'],{...valid,PRODUCT_CODE:code},()=>{calls++;throw new Error('unexpected');},registry)).rejects.toThrow();expect(calls).toBe(0);
});
it('rejects explicit CLI/environment disagreement before creating a provider',async()=>{
 let calls=0;await expect(runArchiveCommand(['restore','--product','090121','--data-dir','data','--run-dir','run'],{...valid,PRODUCT_CODE:'090122'},()=>{calls++;throw new Error('unexpected');},registry)).rejects.toThrow(/product|selection/i);expect(calls).toBe(0);
});
it('exports only validated, derived paths through the preflight output file',async()=>{
 const root=await mkdtemp(join(tmpdir(),'trade workflow space-'));dirs.push(root);const output=join(root,'output');
 expect(parseArchiveDispatch({...valid,PRODUCT_CODE:'090122'},registry).productCode).toBe('090122');
 await runArchiveCommand(['preflight','--product','090122'],{...valid,GITHUB_WORKSPACE:root,GITHUB_OUTPUT:output},undefined,registry);
 const paths=productDataPaths(root,'090122');expect(await readFile(output,'utf8')).toBe(`product_code=090122\ndata_dir=${paths.dataDir}\nprocessed_dir=${paths.processedDir}\nclassification_file=${paths.classificationFile}\n`);
});
it('packs and recovers the selected product offline, and rejects wrong identity before writing',async()=>{
 const f=await createProductArchiveFixture('090122');dirs.push(f.dataDir);const run=await mkdtemp(join(tmpdir(),'trade-product-cli-'));dirs.push(run);let calls=0;const factory=()=>{calls++;throw new Error('unexpected provider');};
 const pkg=await runArchiveCommand(['pack','--product','090122','--data-dir',f.dataDir,'--run-dir',run],{},factory,registry) as {sha256:string};
 const target=join(run,'recover');await expect(runArchiveCommand(['recover','--bundle',join(run,'bundle.json'),'--sha256',pkg.sha256,'--data-dir',target],{},factory,registry)).rejects.toThrow();await expect(stat(target)).rejects.toThrow();
 await runArchiveCommand(['recover','--product','090122','--bundle',join(run,'bundle.json'),'--sha256',pkg.sha256,'--data-dir',target],{},factory,registry);const pointer=JSON.parse(await readFile(join(target,'processed/current.json'),'utf8'));expect(JSON.parse(await readFile(join(target,'processed',pointer.releaseFile),'utf8')).productCode).toBe('090122');expect(calls).toBe(0);
 await writeFile(join(run,'candidate.json'),JSON.stringify({schemaVersion:2,productCode:'090121',run:{schemaVersion:2,productCode:'090121',reportingMonth:'2026-08',baseline:null},reference:{key:`trade/v1/products/090122/releases/${f.input.releaseId}.json`,sha256:pkg.sha256},bundleFile:'bundle.json'}));
 await expect(runArchiveCommand(['verify','--product','090122','--data-dir',join(run,'wrong'),'--run-dir',run],{},factory,registry)).rejects.toThrow();await expect(stat(join(run,'wrong'))).rejects.toThrow();
});
it('uses selected product paths and excludes other products from coffee artifacts',async()=>{
 const w=parse(await readFile('.github/workflows/import-census.yml','utf8')),steps=w.jobs.import.steps as any[];expect(w.on.workflow_dispatch.inputs.product_code).toMatchObject({type:'string',default:'090121'});expect(w.jobs.import.env.PRODUCT_CODE).toBe('${{ inputs.product_code }}');
 const preflight=steps.find(s=>s.id==='preflight');expect(preflight.run).toContain('preflight');
 for(const id of ['restore','stage','recovery','promote'])expect(steps.find(s=>s.id===id).run).toContain('--product "$PRODUCT_CODE"');
 expect(steps.find(s=>s.id==='import').run).toContain('--product "$PRODUCT_CODE"');expect(steps.find(s=>s.id==='import').run).toContain('"$CLASSIFICATION_FILE"');expect(steps.find(s=>s.id==='import').run).toContain('-f "$CLASSIFICATION_FILE"');
 expect(steps.find(s=>s.id==='validate').run).toContain('--product "$PRODUCT_CODE"');
 const release=steps.find(s=>s.with?.name==='census-${{ steps.preflight.outputs.product_code }}-release');expect(release.with.path.trim().split('\n')).toEqual(['${{ steps.preflight.outputs.processed_dir }}/current.json','${{ steps.preflight.outputs.processed_dir }}/releases/*.json','${{ steps.preflight.outputs.data_dir }}/raw/**/*.json']);
 expect(release.with.path).not.toContain('data/**/*.json');const coffee=productDataPaths('/workspace','090121'),second=productDataPaths('/workspace','090122');expect(second.dataDir.startsWith(`${coffee.dataDir}/raw/`)).toBe(false);
 for(const step of steps)if(step.run)expect(step.run).not.toContain('${{');
});
