import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {parsePublishedFirefoxPlan,readPublishedFirefoxPlan,publishedFirefoxChecks} from '../../scripts/published-firefox-plan';
const bytes=readFileSync(new URL('../fixtures/published-firefox-2026-08.json',import.meta.url));
const record=()=>JSON.parse(bytes.toString('utf8'));
it('derives exactly the fixed served and private checks from authenticated bytes',()=>{
 const plan=readPublishedFirefoxPlan(bytes),checks=publishedFirefoxChecks(plan);
 expect(checks).toHaveLength(38);
 expect(checks.find(x=>x.path==='/products/090121/index.html')).toMatchObject({bytes:351370,statuses:[200],privateRoute:false,allowedPaths:['/products/090121/index.html','/products/090121/index','/products/090121/index/','/products/090121/','/products/090121']});
 expect(checks.filter(x=>x.privateRoute)).toHaveLength(8);
 expect(checks.find(x=>x.path==='/.git/config')).toMatchObject({statuses:[404],bytes:708,sha256:'9cc9807dec9aca40cfe1ea36e10c11ba3ba0b5dbc5a7724e99c54e6b8eca7ec0',privateRoute:true,allowedPaths:['/.git/config']});
 expect(checks.some(x=>x.path==='/_headers')).toBe(false);
});
it('rejects changed record bytes even when JSON remains structurally valid',()=>{
 expect(()=>readPublishedFirefoxPlan(Buffer.from(bytes.toString('utf8')+' '))).toThrow('published-plan');
});
it('prevents changing a trusted plan between validation and use',()=>{
 const plan=parsePublishedFirefoxPlan(record());
 expect(()=>{plan.files[0].path='elsewhere.html';}).toThrow();
});
const invalid:[string,(x:any)=>void][]=[
 ['unknown key',x=>x.secret='never'],['other origin',x=>x.origin='https://us-trade-tracker.pages.dev'],
 ['other subject',x=>x.package.codeCommit='a'.repeat(40)],['other ZIP',x=>x.package.zip.sha256='b'.repeat(64)],
 ['other manifest',x=>x.package.manifest.bytes++],['missing asset',x=>x.files.pop()],
 ['unsafe asset',x=>x.files[0].path='../secret'],['encoded traversal',x=>x.files[0].path='%2e%2e/secret'],
 ['duplicate asset',x=>x.files[1]=x.files[0]],['unknown asset key',x=>x.files[0].token='secret'],
 ['zero bytes',x=>x.files[0].bytes=0],['nonfinite bytes',x=>x.files[0].bytes=NaN],
 ['wrong total',x=>x.files[0].bytes++],['malformed hash',x=>x.files[0].sha256='g'.repeat(64)],
 ['provider control',x=>x.files[0].role='provider-control'],['missing error page',x=>x.files.find((f:any)=>f.path==='404.html').path='error.html'],
 ['missing CSV',x=>x.csvs.pop()],['duplicate CSV',x=>x.csvs[1]=x.csvs[0]],
 ['crossed filename',x=>x.csvs[0].filename='hs-090111-imports-estimated-duties.csv'],
 ['unknown CSV case',x=>x.csvs[0].case='other.csv'],['CSV overflow',x=>x.csvs[0].bytes=131073],
];
it.each(invalid)('rejects %s before a request list can be used',(_label,change)=>{
 const value=record();change(value);expect(()=>publishedFirefoxChecks(parsePublishedFirefoxPlan(value))).toThrow('published-plan');
});