import {mkdir,writeFile,appendFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createR2Store,readR2Config,R2ConfigurationError,type ArchiveStore} from './archive-store';
import {parseArchiveDispatch} from './archive-inputs';
import {buildLocalBundle,restoreForImport,stageCandidate,promoteCandidate,recoverBundle,parseRunState,parseCandidateState,readLocalFileBounded,PromotionReceiptError} from './archive-release';
import {parseArchiveJson,LIMITS} from './archive-bundle';
import {DEFAULT_PRODUCT_CODE,getProduct,PRODUCTS,type ProductDefinition} from '../src/lib/trade/product-registry';
import {productDataPaths} from './product-paths';
export async function runArchiveCommand(args:string[],env:NodeJS.ProcessEnv,storeFactory?:(productCode:string)=>ArchiveStore,registry:readonly ProductDefinition[]=PRODUCTS):Promise<unknown>{
  const [command,...rest]=args;
  const allowed:Record<string,string[]>={preflight:[],restore:['data-dir','run-dir'],stage:['data-dir','run-dir'],promote:['data-dir','run-dir'],pack:['data-dir','run-dir'],verify:['data-dir','run-dir'],recover:['bundle','sha256','data-dir']};
  if(!Object.hasOwn(allowed,command??''))throw new Error('Unknown archive command');
  const options=new Map<string,string>();
  for(let i=0;i<rest.length;i+=2){const key=rest[i]?.slice(2),value=rest[i+1];if(!rest[i]?.startsWith('--')||!(key==='product'||allowed[command].includes(key))||!value||value.startsWith('--')||options.has(key))throw new Error('Invalid archive command options');options.set(key,value);}
  if(allowed[command].some(key=>!options.has(key)))throw new Error('Missing archive command options');
  if(options.has('product')&&env.PRODUCT_CODE!==undefined&&options.get('product')!==env.PRODUCT_CODE)throw new Error('Conflicting product selections');
  const product=getProduct(options.get('product')??env.PRODUCT_CODE??DEFAULT_PRODUCT_CODE,registry);if(!product.importable)throw new Error('Product is not available for import');const productCode=product.code;
  const provider=()=>storeFactory?storeFactory(productCode):createR2Store(readR2Config(env),{productCode});
  const dataDir=options.get('data-dir')!,runDir=options.get('run-dir')!;
  if(command==='recover')return recoverBundle(options.get('bundle')!,options.get('sha256')!,dataDir,productCode);
  if(command==='verify'){
    const candidate=parseCandidateState(parseArchiveJson(await readLocalFileBounded(join(runDir,'candidate.json'),LIMITS.pointer),LIMITS.pointer),productCode);
    return recoverBundle(join(runDir,'bundle.json'),candidate.reference.sha256,dataDir,productCode);
  }
  if(command==='pack'){
    const pkg=await buildLocalBundle(dataDir,null,productCode);await mkdir(runDir,{recursive:true});await writeFile(join(runDir,'bundle.json'),pkg.bytes,{flag:'wx'});
    return {bundleFile:join(runDir,'bundle.json'),sha256:pkg.reference.sha256,bytes:pkg.bytes.length,accepted:false};
  }
  const dispatch=parseArchiveDispatch({...env,PRODUCT_CODE:productCode},registry);if(command==='preflight'){
    if(env.GITHUB_OUTPUT){const paths=productDataPaths(env.GITHUB_WORKSPACE??process.cwd(),productCode),outputs={product_code:productCode,data_dir:paths.dataDir,processed_dir:paths.processedDir,classification_file:paths.classificationFile};if(Object.values(outputs).some(v=>/[\r\n]/.test(v)))throw new Error('Invalid workflow path');await appendFile(env.GITHUB_OUTPUT,Object.entries(outputs).map(([k,v])=>`${k}=${v}\n`).join(''));}return dispatch;
  }
  if(!dispatch.archive)throw new Error('Remote archive commands require archive mode');
  if(command==='promote'&&dispatch.candidateOnly)throw new Error('Candidate-only review forbids promotion');
  // Parse persisted input before creating a provider client.
  if(command==='restore')return restoreForImport({store:provider(),dataDir,runDir,productCode},{reportingMonth:dispatch.reportingMonth,initialize:dispatch.initialize});
  const state=parseArchiveJson(await readLocalFileBounded(join(runDir,command==='stage'?'run.json':'candidate.json'),LIMITS.pointer),LIMITS.pointer);
  if(command==='stage'){const run=parseRunState(state,productCode);if(run.reportingMonth!==dispatch.reportingMonth)throw new Error('Run month differs from dispatch');if(dispatch.candidateOnly&&!run.baseline)throw new Error('Candidate-only review requires an accepted baseline');return stageCandidate({store:provider(),dataDir,runDir,productCode},run);}
  const candidate=parseCandidateState(state,productCode);if(candidate.run.reportingMonth!==dispatch.reportingMonth)throw new Error('Candidate month differs from dispatch');
  const outcome=await promoteCandidate({store:provider(),dataDir,runDir,productCode},candidate,{artifactId:env.BACKUP_ARTIFACT_ID??'',artifactDigest:env.BACKUP_ARTIFACT_DIGEST??''});
  if(['conflict','unconfirmed'].includes(outcome.status))process.exitCode=1;return outcome;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  runArchiveCommand(process.argv.slice(2),process.env).then(result=>console.log(JSON.stringify(result))).catch(error=>{if(error instanceof PromotionReceiptError){console.log(JSON.stringify({...error.outcome,receiptPersisted:false}));console.error('The reported promotion outcome stands; its local receipt could not be saved.');}else if(error instanceof R2ConfigurationError)console.error(error.message);else console.error('Archive command failed; inspect available outcome evidence before inferring acceptance.');process.exitCode=1;});
}
