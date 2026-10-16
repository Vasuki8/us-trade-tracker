import {expect,it} from 'vitest';
import {readFile} from 'node:fs/promises';
import {parseSiteProductSelection} from '../../scripts/site-product-selection';

// Detect accepting an unreviewed product/path/month or silently ignoring an identity field.
const sample=()=>({schemaVersion:1,products:[
 {code:'090121',reportingMonth:'2026-08',pointer:{path:'data/processed/current.json',bytes:76,sha256:'a'.repeat(64)},release:{path:'data/processed/releases/2026-08-roasted.json',bytes:1234,sha256:'b'.repeat(64)}},
 {code:'090111',reportingMonth:'2026-08',pointer:{path:'data/products/090111/processed/current.json',bytes:76,sha256:'c'.repeat(64)},release:{path:'data/products/090111/processed/releases/2026-08-green.json',bytes:2345,sha256:'d'.repeat(64)}},
]});
it('keeps the exact reviewed identities and registry order',()=>{
 expect(parseSiteProductSelection(sample())).toEqual(sample());
 const reversed=sample();reversed.products.reverse();expect(()=>parseSiteProductSelection(reversed)).toThrow();
});
it('permits independently pinned product months rather than imposing Canada or peer coverage',()=>{
 const v=sample();v.products[0].reportingMonth='2026-09';v.products[0].release.path='data/processed/releases/2026-09-successor.json';
 expect(parseSiteProductSelection(v).products.map(p=>p.reportingMonth)).toEqual(['2026-09','2026-08']);
});
it('the initial committed selection identifies the four accepted August files',async()=>{
 const v=parseSiteProductSelection(JSON.parse(await readFile('deployment/site-product-selection.json','utf8')));
 expect(v.products.map(p=>({code:p.code,month:p.reportingMonth,pointer:p.pointer,release:p.release}))).toEqual([
 {code:'090121',month:'2026-08',pointer:{path:'data/processed/current.json',bytes:76,sha256:'5098efe55c5d712f097afaef140527c1c3636ebdd7dd0fe48b5521c5cf589bc8'},release:{path:'data/processed/releases/2026-08-5f3c2606-06a0-4c96-8fbc-a2332e0428ae.json',bytes:2977166,sha256:'eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727'}},
 {code:'090111',month:'2026-08',pointer:{path:'data/products/090111/processed/current.json',bytes:76,sha256:'d93e6e11e48c540396fee4699a0a9e58cbde0e6f6a55e20e7ba7056fb3296a39'},release:{path:'data/products/090111/processed/releases/2026-08-d6b1ed52-cd6c-4b7d-87ca-d52c9e338cae.json',bytes:2234188,sha256:'ef5d56791ad85b1b7a199829818522389a792e82cee792665be61f8e78cba0f7'}},
 ]);
});
it.each([null,[],{}, {schemaVersion:2,products:sample().products},{...sample(),extra:true},{schemaVersion:1}, {schemaVersion:1,products:[]}, {schemaVersion:1,products:sample().products.slice(0,1)}, {schemaVersion:1,products:[...sample().products,sample().products[0]]}])('rejects incomplete or unsupported selection %j',value=>expect(()=>parseSiteProductSelection(value)).toThrow());
it.each([
 ['unknown-product',(v:any)=>v.products[0].code='999999'],['duplicate-product',(v:any)=>v.products[1].code='090121'],
 ['product-field',(v:any)=>v.products[0].extra=true],['missing-month',(v:any)=>delete v.products[0].reportingMonth],
 ['invalid-month',(v:any)=>v.products[0].reportingMonth='2026-13'],['month-mismatch',(v:any)=>v.products[0].reportingMonth='2026-09'],
 ['crossed-pointer',(v:any)=>v.products[0].pointer.path=v.products[1].pointer.path],['wrong-pointer',(v:any)=>v.products[0].pointer.path='data/processed/other.json'],
 ['crossed-release',(v:any)=>v.products[0].release.path=v.products[1].release.path],['escaped-release',(v:any)=>v.products[0].release.path='data/processed/releases/../2026-08-other.json'],
 ['backslash',(v:any)=>v.products[0].release.path='data/processed/releases/2026-08-test\\evil.json'],['wrong-extension',(v:any)=>v.products[0].release.path='data/processed/releases/2026-08-test.js'],
 ['zero-size',(v:any)=>v.products[0].pointer.bytes=0],['fraction',(v:any)=>v.products[0].release.bytes=1.5],['unsafe',(v:any)=>v.products[0].release.bytes=Number.MAX_SAFE_INTEGER+1],
 ['pointer-cap',(v:any)=>v.products[0].pointer.bytes=16385],['release-cap',(v:any)=>v.products[0].release.bytes=16777217],
 ['uppercase-hash',(v:any)=>v.products[0].release.sha256='A'.repeat(64)],['short-hash',(v:any)=>v.products[0].pointer.sha256='a'.repeat(63)],
 ['identity-field',(v:any)=>v.products[0].pointer.extra=true],['missing-hash',(v:any)=>delete v.products[0].release.sha256],
] as const)('rejects %s before IO',(_name,change)=>{const v=sample();change(v);expect(()=>parseSiteProductSelection(v)).toThrow();});
it('accepts the inclusive file bounds',()=>{const v=sample();v.products[0].pointer.bytes=16384;v.products[0].release.bytes=16777216;expect(parseSiteProductSelection(v).products[0].release.bytes).toBe(16777216);});
