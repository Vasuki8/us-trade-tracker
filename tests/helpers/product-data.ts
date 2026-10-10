import {syntheticCensusFetch} from './archive';
import {syntheticDutyFetch} from './duties';
import {mkdtemp,readFile,readdir} from 'node:fs/promises';import {join} from 'node:path';import {tmpdir} from 'node:os';
import {prepareRelease} from '../../scripts/prepare-release';
import type {BundleInput} from '../../scripts/archive-bundle';

// Independent synthetic identities and amounts; this never contacts Census.
export function syntheticProductFetch(productCode:string,{scale=1,worldDelta=0,duties=false}:{scale?:number;worldDelta?:number;duties?:boolean}={}):typeof fetch{
  const base=duties?syntheticDutyFetch():syntheticCensusFetch();
  return (async(input:RequestInfo|URL,init?:RequestInit)=>{
    const response=await base(input,init);if(response.status!==200)return response;
    const table:string[][]=await response.json(),header=table[0];
    for(const row of table.slice(1))for(let i=0;i<header.length;i++){
      if(['I_COMMODITY','E_COMMODITY'].includes(header[i]))row[i]=productCode;
      if(['I_COMMODITY_LDESC','E_COMMODITY_LDESC'].includes(header[i]))row[i]=`SYNTHETIC PRODUCT ${productCode}`;
      if(['GEN_VAL_MO','ALL_VAL_MO','CAL_DUT_MO','CON_VAL_MO','DUT_VAL_MO'].includes(header[i])){
        row[i]=String(Number(row[i])*scale+(['GEN_VAL_MO','ALL_VAL_MO'].includes(header[i])&&row[header.indexOf('CTY_CODE')]==='-'?worldDelta:0));
      }
    }
    return Response.json(table);
  }) as typeof fetch;
}
export async function createProductArchiveFixture(productCode:string,{duties=false,scale=1}:{duties?:boolean;scale?:number}={}):Promise<{dataDir:string;input:BundleInput}>{
  const dataDir=await mkdtemp(join(tmpdir(),'trade-product-archive-'));
  await prepareRelease({productCode,end:'2026-08',months:60,apiKey:'synthetic',outputDir:join(dataDir,'processed'),codeVersion:'synthetic-product-fixture',includeDuties:duties,classificationIntervals:[{from:'2021-09',to:'2026-08',evidenceUrl:'https://example.invalid/synthetic'}]},syntheticProductFetch(productCode,{scale,duties}));
  const pointer=JSON.parse(await readFile(join(dataDir,'processed/current.json'),'utf8')),releaseId=pointer.releaseFile.slice(9,-5);
  const names=await readdir(join(dataDir,'raw',releaseId));
  const rawRecords=new Map(await Promise.all(names.map(async name=>[`raw/${name}`,await readFile(join(dataDir,'raw',releaseId,name))] as [string,Buffer])));
  return {dataDir,input:{releaseId,releaseBytes:await readFile(join(dataDir,'processed',pointer.releaseFile)),rawRecords,previous:null}};
}
