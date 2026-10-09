import {afterAll,beforeAll,expect,it} from 'vitest';
import {rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {packBundle,unpackBundle,encodePointer,decodePointer,type ArchiveBundle,type BundleInput} from '../../scripts/archive-bundle';
import {createArchiveFixture,syntheticCensusFetch} from '../helpers/archive';
import {prepareRelease} from '../../scripts/prepare-release';
import {join} from 'node:path';
import {readFile,readdir} from 'node:fs/promises';
const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
let fixture:Awaited<ReturnType<typeof createArchiveFixture>>;
beforeAll(async()=>{fixture=await createArchiveFixture();});
afterAll(async()=>{if(fixture)await rm(fixture.dataDir,{recursive:true,force:true});});
const previous={key:'trade/v1/products/090121/releases/2026-07-12345678-1234-4123-8123-123456789012.json',sha256:'a'.repeat(64)};
const input=():BundleInput=>({...fixture.input,rawRecords:new Map(fixture.input.rawRecords),previous});
function mutate(change:(bundle:ArchiveBundle)=>void):()=>unknown{
  const bundle:ArchiveBundle=JSON.parse(packBundle(input()).bytes.toString());change(bundle);
  const bytes=Buffer.from(JSON.stringify(bundle));return ()=>unpackBundle(bytes,sha(bytes));
}
function editFile(bundle:ArchiveBundle,path:string,edit:(v:any)=>void){
  const f=bundle.files.find(f=>f.path===path)!;const value=JSON.parse(Buffer.from(f.contentBase64,'base64').toString());edit(value);
  const bytes=Buffer.from(JSON.stringify(value));f.contentBase64=bytes.toString('base64');
  Object.assign(bundle.manifest.files.find(f=>f.path===path)!,{bytes:bytes.length,sha256:sha(bytes)});
}
it('roundtrips all 241 original files and the exact previous identity deterministically',()=>{
  const packaged=packBundle(input());const decoded=unpackBundle(packaged.bytes,packaged.reference.sha256);
  expect(decoded.manifest.files).toHaveLength(241);expect(decoded.manifest.previous).toEqual(previous);
  expect(decoded.manifest.reportingMonth).toBe('2026-08');expect(decoded.manifest.productCode).toBe('090121');
  expect(decoded.files.get('release.json')).toEqual(fixture.input.releaseBytes);
  for(const [name,bytes] of fixture.input.rawRecords)expect(decoded.files.get(name)).toEqual(bytes);
  expect(packBundle(input()).bytes).toEqual(packaged.bytes);
  expect(decodePointer(encodePointer(packaged.reference))).toEqual(packaged.reference);
});
it('rejects corruption even when JSON remains plausible',()=>{const p=packBundle(input());expect(()=>unpackBundle(Buffer.concat([p.bytes,Buffer.from(' ')]),p.reference.sha256)).toThrow();});
it('roundtrips a valid multi-MiB file below the file limit without exhausting the regex stack',()=>{
  const i=input(),name='raw/imports-2026-08-HS.json';i.rawRecords.set(name,Buffer.concat([Buffer.alloc(6*1024*1024,32),i.rawRecords.get(name)!]));
  const p=packBundle(i);expect(unpackBundle(p.bytes,p.reference.sha256).files.get(name)!.equals(i.rawRecords.get(name)!)).toBe(true);
});
it('accepts legacy 200 wrappers and reordered paired headers',()=>{
  const i=input();for(const [name,bytes] of i.rawRecords){const r=JSON.parse(bytes.toString());delete r.httpStatus;if(name.endsWith('HSCY.json'))r.payload=r.payload.map((row:unknown[])=>row.toReversed());i.rawRecords.set(name,Buffer.from(JSON.stringify(r)));}
  expect(unpackBundle(packBundle(i).bytes,packBundle(i).reference.sha256).release.observations).toHaveLength(300);
});
it.each(['bytes','sha256'] as const)('rejects lying file %s with a recomputed bundle checksum',field=>{
  expect(mutate(b=>{if(field==='bytes')b.manifest.files[0].bytes=1;else b.manifest.files[0].sha256='a'.repeat(64);})).toThrow();
});
it.each(['missing','extra','duplicate','traversal','release-id','base64','utf8','fixture','duplicate-observation','label','value','status','month','product','direction','measure','scope','credentials','unknown-param','world204'])( 'rejects %s even with recomputed hashes',kind=>{
  expect(mutate(b=>{
    const path='raw/imports-2026-08-HS.json';
    if(kind==='missing')b.files.pop();
    else if(kind==='extra'||kind==='duplicate')b.files.push({...b.files[0],path:kind==='extra'?'raw/extra.json':b.files[0].path});
    else if(kind==='traversal')b.files[0].path='../current.json';
    else if(kind==='release-id')b.manifest.releaseId='2026-07-12345678-1234-4123-8123-123456789012';
    else if(kind==='base64')b.files[0].contentBase64+='\n';
    else if(kind==='utf8'){const f=b.files[0],bytes=Buffer.from([0xff]);f.contentBase64=bytes.toString('base64');Object.assign(b.manifest.files.find(m=>m.path===f.path)!,{bytes:1,sha256:sha(bytes)});}
    else if(['fixture','duplicate-observation','label','value','status'].includes(kind))editFile(b,'release.json',r=>{if(kind==='fixture')r.source='fixture';else if(kind==='duplicate-observation')r.observations.push(r.observations[0]);else if(kind==='label')r.observations[0].partnerName='CHANGED';else if(kind==='value')r.observations[0].valueUsd++;else {r.observations[0].status='missing';r.observations[0].valueUsd=null;}});
    else editFile(b,path,r=>{const u=new URL(r.requestUrl);if(kind==='month')u.searchParams.set('time','2026-07');if(kind==='product')u.searchParams.set('I_COMMODITY','090122');if(kind==='direction')u.pathname=u.pathname.replace('imports','exports');if(kind==='measure')u.searchParams.set('get','ALL_VAL_MO');if(kind==='scope')u.searchParams.set('SUMMARY_LVL','CGP');if(kind==='credentials')u.searchParams.set('key','synthetic-secret');if(kind==='unknown-param')u.searchParams.set('foo','bar');if(kind==='world204'){r.httpStatus=204;r.payload=null;}r.requestUrl=u.toString();});
  })).toThrow();
});
it('rejects a partial month grid before packaging',()=>{const i=input();i.rawRecords.delete('raw/imports-2026-08-HSCY.json');expect(()=>packBundle(i)).toThrow();});
it('retains explicit partner 204 records as distinct from missing files',async()=>{
  const release=await prepareRelease({productCode:'090121',end:'2026-08',months:60,apiKey:'synthetic',outputDir:join(fixture.dataDir,'processed'),codeVersion:'synthetic-test'},syntheticCensusFetch({partner204:true}));
  const pointer=JSON.parse(await readFile(join(fixture.dataDir,'processed/current.json'),'utf8'));const id=pointer.releaseFile.slice(9,-5);
  const raw=new Map<string,Buffer>();for(const file of await readdir(join(fixture.dataDir,'raw',id)))raw.set(`raw/${file}`,await readFile(join(fixture.dataDir,'raw',id,file)));
  expect(JSON.parse(raw.get('raw/imports-2026-08-HSCY.json')!.toString())).toMatchObject({httpStatus:204,payload:null});
  const p=packBundle({releaseId:id,releaseBytes:Buffer.from(JSON.stringify(release)),rawRecords:raw,previous});
  expect(unpackBundle(p.bytes,p.reference.sha256).release.observations.every(o=>o.geography==='world')).toBe(true);
});
it('bounds actual encoded length before decoding a file with a small declared length',()=>{expect(mutate(b=>{b.files[0].contentBase64='A'.repeat(4*Math.ceil(32*1024*1024/3)+4);b.manifest.files.find(f=>f.path===b.files[0].path)!.bytes=1;})).toThrow(/size|length|limit/i);});
it('bounds pointer and manifest metadata and rejects an outside-namespace pointer',()=>{
  expect(()=>decodePointer(Buffer.alloc(16*1024+1))).toThrow();
  expect(()=>encodePointer({...previous,key:'other/current.json'})).toThrow();
  expect(mutate(b=>{b.manifest.codeVersion='x'.repeat(256*1024);})).toThrow();
});
it.each(['private-source','extra-observation','extra-release','extra-interval'])('rejects retained private or undeclared prepared metadata: %s',kind=>{
  expect(mutate(b=>editFile(b,'release.json',r=>{
    if(kind==='private-source')r.sourceUrls[0]='https://user:synthetic-secret@api.census.gov/data/timeseries/intltrade/imports/hs#private-fragment';
    if(kind==='extra-observation')r.observations[0].apiKey='synthetic-secret';
    if(kind==='extra-release')r.apiKey='synthetic-secret';
    if(kind==='extra-interval')r.classificationIntervals=[{from:'2021-09',to:'2026-08',evidenceUrl:'https://example.invalid/synthetic',apiKey:'secret'}];
  }))).toThrow();
});
