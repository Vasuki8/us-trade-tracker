import {afterAll,beforeAll,expect,it} from 'vitest';
import {rm} from 'node:fs/promises';import {Readable} from 'node:stream';
import {createProductArchiveFixture} from '../helpers/product-data';
import {packBundle,unpackBundle,encodePointer,decodePointer,sha256,type BundleInput,type ArchiveBundle} from '../../scripts/archive-bundle';
import {createR2Store} from '../../scripts/archive-store';
const dirs:string[]=[];let a:BundleInput,b:BundleInput,duty:BundleInput;
beforeAll(async()=>{
  const fixtures=await Promise.all([createProductArchiveFixture('090121'),createProductArchiveFixture('090122',{scale:2}),createProductArchiveFixture('090122',{scale:3,duties:true})]);
  for(const f of fixtures)dirs.push(f.dataDir);[a,b,duty]=fixtures.map(f=>f.input);
},30_000);
afterAll(async()=>{for(const dir of dirs)await rm(dir,{recursive:true,force:true});});
it.each(['merchandise','duties'])('roundtrips a second product with original %s bytes',kind=>{
  const input=kind==='duties'?duty:b,pkg=packBundle(input,'090122'),decoded=unpackBundle(pkg.bytes,pkg.reference.sha256,'090122');
  expect(pkg.reference.key).toBe(`trade/v1/products/090122/releases/${input.releaseId}.json`);
  expect(decoded.release.productCode).toBe('090122');expect(decoded.files.size).toBe(kind==='duties'?337:241);
  expect(decoded.files.get('release.json')).toEqual(input.releaseBytes);
  for(const [path,bytes] of input.rawRecords)expect(decoded.files.get(path)).toEqual(bytes);
  expect(packBundle(input,'090122').bytes).toEqual(pkg.bytes);
  const pointer=encodePointer(pkg.reference,'090122');expect(JSON.parse(pointer.toString()).productCode).toBe('090122');expect(decodePointer(pointer,'090122')).toEqual(pkg.reference);
  expect(()=>decodePointer(pointer,'090121')).toThrow();expect(()=>unpackBundle(pkg.bytes,pkg.reference.sha256,'090121')).toThrow();
});
it('rejects a predecessor or pointer from another product',()=>{
  const old=packBundle(a);expect(()=>packBundle({...b,previous:old.reference},'090122')).toThrow();
  expect(()=>encodePointer(old.reference,'090122')).toThrow();
});
function editFile(bundle:ArchiveBundle,path:string,change:(record:any)=>void){
  const f=bundle.files.find(f=>f.path===path)!,record=JSON.parse(Buffer.from(f.contentBase64,'base64').toString());change(record);
  const bytes=Buffer.from(JSON.stringify(record));f.contentBase64=bytes.toString('base64');Object.assign(bundle.manifest.files.find(f=>f.path===path)!,{bytes:bytes.length,sha256:sha256(bytes)});
}
it.each(['manifest','release','merchandise-query','duty-query','previous'])('rejects cross-product %s even with valid recomputed hashes',kind=>{
  const pkg=packBundle(duty,'090122'),bundle:ArchiveBundle=JSON.parse(pkg.bytes.toString());
  if(kind==='manifest')bundle.manifest.productCode='090121';
  if(kind==='previous')bundle.manifest.previous=packBundle(a).reference;
  if(kind==='release')editFile(bundle,'release.json',r=>{r.productCode='090121';for(const row of [...r.observations,...r.duties.observations])row.productCode='090121';});
  if(kind==='merchandise-query'||kind==='duty-query')editFile(bundle,kind==='duty-query'?'raw/duties-2026-08-HS.json':'raw/imports-2026-08-HS.json',r=>{const u=new URL(r.requestUrl);u.searchParams.set('I_COMMODITY','090121');r.requestUrl=u.toString();});
  const bytes=Buffer.from(JSON.stringify(bundle));expect(()=>unpackBundle(bytes,sha256(bytes),'090122')).toThrow();
});
it('binds storage reads and writes to the selected product before transport',async()=>{
  const requests:any[]=[];
  const store=createR2Store({accountId:'a'.repeat(32),bucketName:'trade-test',accessKeyId:'b'.repeat(32),secretAccessKey:'c'.repeat(64)},{productCode:'090122',requestHandler:{handle:async(request:any)=>{requests.push(request);return {response:{statusCode:200,headers:{etag:'"etag"'},body:Readable.from(['{}'])}};},destroy(){}}});
  await expect(store.get('trade/v1/products/090121/current.json',100)).rejects.toThrow();
  await expect(store.put(packBundle(a).reference.key,Buffer.from('{}'),{ifNoneMatch:'*'})).rejects.toThrow();expect(requests).toHaveLength(0);
  await store.put('trade/v1/products/090122/current.json',Buffer.from('{}'),{ifNoneMatch:'*'});
  expect(requests[0].path).toBe('/trade-test/trade/v1/products/090122/current.json');
});
