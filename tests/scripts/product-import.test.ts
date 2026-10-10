import {afterEach,expect,it,vi} from 'vitest';
import {mkdtemp,readFile,rm} from 'node:fs/promises';import {join} from 'node:path';import {tmpdir} from 'node:os';
import {resolveImportOptions} from '../../scripts/import-product';
import {prepareRelease,readCurrentRelease} from '../../scripts/prepare-release';
import {productDataPaths} from '../../scripts/product-paths';
import {syntheticProductFetch} from '../helpers/product-data';
const second={code:'090122',displayName:'Synthetic second product',importable:true,published:false,dutiesAccepted:false};
const dirs:string[]=[];afterEach(async()=>{for(const dir of dirs.splice(0))await rm(dir,{recursive:true,force:true});});
const options=(productCode:string,outputDir:string)=>({productCode,outputDir,end:'2026-08',months:24,apiKey:'synthetic',codeVersion:'synthetic-test'});
it('revises and fails a second product without changing coffee',async()=>{
  const root=await mkdtemp(join(tmpdir(),'trade-products-'));dirs.push(root);
  const a=productDataPaths(root,'090121').processedDir,b=productDataPaths(root,'090122').processedDir;
  await prepareRelease(options('090121',a),syntheticProductFetch('090121'));
  const aPointer=await readFile(join(a,'current.json')),aRelease=await readCurrentRelease(a,'090121');
  await prepareRelease(options('090122',b),syntheticProductFetch('090122',{scale:2}));
  const revised=await prepareRelease(options('090122',b),syntheticProductFetch('090122',{scale:2,worldDelta:10}));
  expect(revised.observations.find(r=>r.geography==='world'&&r.direction==='imports')?.valueUsd).toBe(2010);
  expect(revised.revisedKeys).toHaveLength(48);expect(revised.revisedKeys.every(k=>k.includes('/090122/'))).toBe(true);
  const bPointer=await readFile(join(b,'current.json'));
  await expect(prepareRelease(options('090122',b),(async()=>new Response(null,{status:204})) as typeof fetch)).rejects.toThrow();
  expect(await readFile(join(b,'current.json'))).toEqual(bPointer);
  expect(await readFile(join(a,'current.json'))).toEqual(aPointer);expect(await readCurrentRelease(a,'090121')).toEqual(aRelease);
},20_000);
it('rejects a wrong-product baseline before retrieving requests or replacing the pointer',async()=>{
  const root=await mkdtemp(join(tmpdir(),'trade-wrong-product-'));dirs.push(root);
  await prepareRelease(options('090121',root),syntheticProductFetch('090121'));
  const pointer=await readFile(join(root,'current.json')),fetcher=vi.fn(syntheticProductFetch('090122'));
  await expect(readCurrentRelease(root,'090122')).rejects.toThrow(/product/i);
  await expect(prepareRelease(options('090122',root),fetcher)).rejects.toThrow(/product/i);
  expect(fetcher).not.toHaveBeenCalled();expect(await readFile(join(root,'current.json'))).toEqual(pointer);
});
it('resolves only reviewed importable identities and retains legacy coffee arguments',async()=>{
  const args=['--product','090122','--end','2026-08'];
  await expect(resolveImportOptions(args,{CENSUS_API_KEY:'synthetic'},'workspace')).rejects.toThrow(/product/i);
  await expect(resolveImportOptions(args,{},'workspace',[{...second,importable:false}])).rejects.toThrow(/import/i);
  const b=await resolveImportOptions([...args,'--duties'],{CENSUS_API_KEY:'synthetic'},'workspace',[second]);
  expect(b).toMatchObject({productCode:'090122',outputDir:join('workspace','data/products/090122/processed'),months:60,includeDuties:true});
  expect(await resolveImportOptions(['--product','090121','--end','2026-08'],{},'workspace')).toMatchObject({productCode:'090121',outputDir:join('workspace','data/processed'),includeDuties:false});
});
