import {mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {parseArgs} from 'node:util';
import {createR2Store,readR2Config,R2ConfigurationError,type ArchiveStore} from './archive-store';
import {parseArchiveDispatch} from './archive-inputs';
import {runArchiveCommand} from './archive-product';
import type {ArchiveRunState} from './archive-release';
import {productDataPaths} from './product-paths';
import {readCurrentRelease} from './prepare-release';

export type ArchiveVerification={schemaVersion:1;status:'verified';productCode:string;reportingMonth:string;retrievedAt:string;codeVersion:string;archive:NonNullable<ArchiveRunState['baseline']>;merchandiseObservations:number;dutyObservations:number;dutyFromMonth:string|null};
export async function verifyArchive(options:{productCode:string;reportingMonth:string;workspaceRoot?:string},env:NodeJS.ProcessEnv,storeFactory?:(productCode:string)=>ArchiveStore):Promise<ArchiveVerification>{
  const dispatchEnv={...env,PRODUCT_CODE:options.productCode,REPORTING_MONTH:options.reportingMonth,ARCHIVE_TO_R2:'true',INITIALIZE_ARCHIVE:'false'};
  const dispatch=parseArchiveDispatch(dispatchEnv),root=options.workspaceRoot??process.cwd();
  const paths=productDataPaths(root,dispatch.productCode),runDir=join(root,'.tmp/archive-verification');
  const readOnlyProvider=(productCode:string):ArchiveStore=>{
    const store=storeFactory?storeFactory(productCode):createR2Store(readR2Config(env),{productCode});
    return {get:(key,maxBytes)=>store.get(key,maxBytes),put:async()=>{throw new Error('Archive verification cannot write to storage');}};
  };
  const run=await runArchiveCommand(['restore','--product',dispatch.productCode,'--data-dir',paths.dataDir,'--run-dir',runDir],dispatchEnv,readOnlyProvider) as ArchiveRunState;
  const release=await readCurrentRelease(paths.processedDir,dispatch.productCode);
  if(!run.baseline||release.reportingMonth!==dispatch.reportingMonth)throw new Error('Accepted archive reporting month differs from requested reporting month');
  const receipt:ArchiveVerification={schemaVersion:1,status:'verified',productCode:dispatch.productCode,reportingMonth:release.reportingMonth,retrievedAt:release.retrievedAt,codeVersion:release.codeVersion,archive:run.baseline,merchandiseObservations:release.observations.length,dutyObservations:release.schemaVersion===2?release.duties.observations.length:0,dutyFromMonth:release.schemaVersion===2?release.duties.fromMonth:null};
  await mkdir(runDir,{recursive:true});await writeFile(join(runDir,'verification.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  return receipt;
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  try{
    const {values}=parseArgs({options:{product:{type:'string'},month:{type:'string'}}});
    if(!values.product||!values.month)throw new Error('Product and expected reporting month are required');
    console.log(JSON.stringify(await verifyArchive({productCode:values.product,reportingMonth:values.month},process.env)));
  }catch(error){console.error(error instanceof R2ConfigurationError?error.message:'Archive verification failed; no success receipt was established.');process.exitCode=1;}
}
