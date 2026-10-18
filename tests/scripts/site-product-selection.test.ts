import {expect,it} from 'vitest';
import {readFile} from 'node:fs/promises';
import {parseSiteProductSelection} from '../../scripts/site-product-selection';

// Detect accepting an unreviewed product/path/month or silently ignoring an identity field.
const sample=()=>({schemaVersion:1,products:[
 {code:'090121',reportingMonth:'2026-08',pointer:{path:'data/processed/current.json',bytes:76,sha256:'a'.repeat(64)},release:{path:'data/processed/releases/2026-08-roasted.json',bytes:1234,sha256:'b'.repeat(64)}},
 {code:'090111',reportingMonth:'2026-08',pointer:{path:'data/products/090111/processed/current.json',bytes:76,sha256:'c'.repeat(64)},release:{path:'data/products/090111/processed/releases/2026-08-green.json',bytes:2345,sha256:'d'.repeat(64)}},
 {code:'090240',reportingMonth:'2026-08',pointer:{path:'data/products/090240/processed/current.json',bytes:76,sha256:'e'.repeat(64)},release:{path:'data/products/090240/processed/releases/2026-08-tea.json',bytes:3456,sha256:'f'.repeat(64)}},
 {code:'180100',reportingMonth:'2026-08',pointer:{path:'data/products/180100/processed/current.json',bytes:76,sha256:'1'.repeat(64)},release:{path:'data/products/180100/processed/releases/2026-08-cocoa.json',bytes:4567,sha256:'2'.repeat(64)}},
]});
it('keeps the exact reviewed identities and registry order',()=>{
 expect(parseSiteProductSelection(sample())).toEqual(sample());
 const reversed=sample();reversed.products.reverse();expect(()=>parseSiteProductSelection(reversed)).toThrow();
});
it('permits independently pinned product months rather than imposing Canada or peer coverage',()=>{
 const v=sample();v.products[0].reportingMonth='2026-09';v.products[0].release.path='data/processed/releases/2026-09-successor.json';
 expect(parseSiteProductSelection(v).products.map(p=>p.reportingMonth)).toEqual(['2026-09','2026-08','2026-08','2026-08']);
});
it('the committed selection identifies eight exact August files for four accepted products',async()=>{
 const v=parseSiteProductSelection(JSON.parse(await readFile('deployment/site-product-selection.json','utf8')));
 expect(v.products.map(p=>({code:p.code,month:p.reportingMonth,pointer:p.pointer,release:p.release}))).toEqual([
 {code:'090121',month:'2026-08',pointer:{path:'data/processed/current.json',bytes:76,sha256:'5098efe55c5d712f097afaef140527c1c3636ebdd7dd0fe48b5521c5cf589bc8'},release:{path:'data/processed/releases/2026-08-5f3c2606-06a0-4c96-8fbc-a2332e0428ae.json',bytes:2977166,sha256:'eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727'}},
 {code:'090111',month:'2026-08',pointer:{path:'data/products/090111/processed/current.json',bytes:76,sha256:'d93e6e11e48c540396fee4699a0a9e58cbde0e6f6a55e20e7ba7056fb3296a39'},release:{path:'data/products/090111/processed/releases/2026-08-d6b1ed52-cd6c-4b7d-87ca-d52c9e338cae.json',bytes:2234188,sha256:'ef5d56791ad85b1b7a199829818522389a792e82cee792665be61f8e78cba0f7'}},
 {code:'090240',month:'2026-08',pointer:{path:'data/products/090240/processed/current.json',bytes:76,sha256:'30c72e757df9279c5fe980bb656ef4b3f741b9c2389cfd468082ed761e462b01'},release:{path:'data/products/090240/processed/releases/2026-08-b5434067-131b-4337-87c1-b380f2face50.json',bytes:1599531,sha256:'861ba7228fb6f6363445df2c0eb6ef76f946c839df75afdd2dcc07d899b09d51'}},
 {code:'180100',month:'2026-08',pointer:{path:'data/products/180100/processed/current.json',bytes:76,sha256:'301abc654e1afb60e31c4792d6d8254bcd4bc9ad0ee2776543eeb0aab1171f6e'},release:{path:'data/products/180100/processed/releases/2026-08-4b642c26-0e76-4c20-9606-032bd5e0dd01.json',bytes:957381,sha256:'96a51a19b968dc574a8692fe1be02d2974704186960bd97ac697356253b83300'}},
 ]);
});
it.each([null,[],{}, {schemaVersion:2,products:sample().products},{...sample(),extra:true},{schemaVersion:1}, {schemaVersion:1,products:[]}, {schemaVersion:1,products:sample().products.slice(0,1)}, {schemaVersion:1,products:[...sample().products,sample().products[0]]}])('rejects incomplete or unsupported selection %j',value=>expect(()=>parseSiteProductSelection(value)).toThrow());
it.each([
 ['unknown-product',(v:any):unknown=>v.products[0].code='999999'],['duplicate-product',(v:any):unknown=>v.products[1].code='090121'],
 ['product-field',(v:any):unknown=>v.products[0].extra=true],['missing-month',(v:any):unknown=>delete v.products[0].reportingMonth],
 ['invalid-month',(v:any):unknown=>v.products[0].reportingMonth='2026-13'],['month-mismatch',(v:any):unknown=>v.products[0].reportingMonth='2026-09'],
 ['crossed-pointer',(v:any):unknown=>v.products[0].pointer.path=v.products[1].pointer.path],['wrong-pointer',(v:any):unknown=>v.products[0].pointer.path='data/processed/other.json'],
 ['crossed-release',(v:any):unknown=>v.products[0].release.path=v.products[1].release.path],['escaped-release',(v:any):unknown=>v.products[0].release.path='data/processed/releases/../2026-08-other.json'],
 ['backslash',(v:any):unknown=>v.products[0].release.path='data/processed/releases/2026-08-test\\evil.json'],['wrong-extension',(v:any):unknown=>v.products[0].release.path='data/processed/releases/2026-08-test.js'],
 ['zero-size',(v:any):unknown=>v.products[0].pointer.bytes=0],['fraction',(v:any):unknown=>v.products[0].release.bytes=1.5],['unsafe',(v:any):unknown=>v.products[0].release.bytes=Number.MAX_SAFE_INTEGER+1],
 ['pointer-cap',(v:any):unknown=>v.products[0].pointer.bytes=16385],['release-cap',(v:any):unknown=>v.products[0].release.bytes=16777217],
 ['uppercase-hash',(v:any):unknown=>v.products[0].release.sha256='A'.repeat(64)],['short-hash',(v:any):unknown=>v.products[0].pointer.sha256='a'.repeat(63)],
 ['identity-field',(v:any):unknown=>v.products[0].pointer.extra=true],['missing-hash',(v:any):unknown=>delete v.products[0].release.sha256],
] as const)('rejects %s before IO',(_name,change)=>{const v=sample();change(v);expect(()=>parseSiteProductSelection(v)).toThrow();});
it('accepts the inclusive file bounds',()=>{const v=sample();v.products[0].pointer.bytes=16384;v.products[0].release.bytes=16777216;expect(parseSiteProductSelection(v).products[0].release.bytes).toBe(16777216);});
