import {mkdtemp,readFile,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import imports from '../fixtures/census-imports.json';
import exports from '../fixtures/census-exports.json';
import {prepareRelease} from '../../scripts/prepare-release';
import type {BundleInput} from '../../scripts/archive-bundle';
// Entirely synthetic: these small tables are repeated over 60 requested months.
export function syntheticCensusFetch({worldDelta=0,partner204=false}:{worldDelta?:number;partner204?:boolean}={}):typeof fetch{
  return (async(input:RequestInfo|URL)=>{
    const url=new URL(String(input));const summary=url.searchParams.get('SUMMARY_LVL2');
    if(partner204&&summary==='HSCY')return new Response(null,{status:204});
    const source=structuredClone(url.pathname.includes('exports')?exports:imports);
    const h=source[0];const rows=source.slice(1).filter(r=>r[h.indexOf('SUMMARY_LVL2')]===summary);
    for(const row of rows){row[h.indexOf('time')]=url.searchParams.get('time')!;if(row[h.indexOf('CTY_CODE')]==='-'){const m=h.findIndex(v=>v.endsWith('_VAL_MO'));row[m]=String(Number(row[m])+worldDelta);}}
    return Response.json([h,...rows]);
  }) as typeof fetch;
}
export async function createArchiveFixture():Promise<{dataDir:string;input:BundleInput}>{
  const dataDir=await mkdtemp(join(tmpdir(),'trade-archive-test-'));
  const processed=join(dataDir,'processed');
  await prepareRelease({productCode:'090121',end:'2026-08',months:60,apiKey:'synthetic-secret',outputDir:processed,codeVersion:'synthetic-test'},syntheticCensusFetch());
  const pointer=JSON.parse(await readFile(join(processed,'current.json'),'utf8'));
  const releaseId=pointer.releaseFile.slice('releases/'.length,-5);
  const rawRecords=new Map<string,Buffer>();
  for(const file of await readdir(join(dataDir,'raw',releaseId)))rawRecords.set(`raw/${file}`,await readFile(join(dataDir,'raw',releaseId,file)));
  return {dataDir,input:{releaseId,releaseBytes:await readFile(join(processed,pointer.releaseFile)),rawRecords,previous:null}};
}
