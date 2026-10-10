import {afterEach,expect,it} from 'vitest';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadPublishedReleases} from '../../src/lib/trade/load-release';
import {prepareRelease} from '../../scripts/prepare-release';
import {productDataPaths} from '../../scripts/product-paths';
import {syntheticProductFetch} from '../helpers/product-data';
const roots:string[]=[];afterEach(async()=>{await Promise.all(roots.splice(0).map(root=>rm(root,{recursive:true,force:true})));});
it('requires the published green coffee release and preserves distinct product values in the real registry',async()=>{
 const workspaceRoot=await mkdtemp(join(tmpdir(),'trade-green-profile-'));roots.push(workspaceRoot);
 async function prepare(code:string,scale:number){return prepareRelease({productCode:code,end:'2026-08',months:24,apiKey:'synthetic',codeVersion:'synthetic-registry-test',includeDuties:code==='090111',classificationIntervals:[{from:'2024-09',to:'2026-08',evidenceUrl:'https://example.invalid/synthetic'}],outputDir:productDataPaths(workspaceRoot,code).processedDir},syntheticProductFetch(code,{scale,duties:code==='090111'}));}
 await prepare('090121',1);
 await expect(loadPublishedReleases({workspaceRoot,mode:'census'})).rejects.toThrow(/090111/);
 await prepare('090111',2);const profiles=await loadPublishedReleases({workspaceRoot,mode:'census'});
 expect(profiles.map(({product})=>product.code)).toEqual(['090121','090111']);
 expect(profiles.map(({release})=>release.observations.find(row=>row.geography==='world'&&row.direction==='imports')?.valueUsd)).toEqual([1000,2000]);
 expect(profiles.every(({product,release})=>product.code===release.productCode)).toBe(true);
 expect(profiles.find(({product})=>product.code==='090111')!.release.schemaVersion).toBe(2);
},20_000);
