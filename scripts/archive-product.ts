import {mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createR2Store,readR2Config,R2ConfigurationError,type ArchiveStore} from './archive-store';
import {parseArchiveDispatch} from './archive-inputs';
import {buildLocalBundle,restoreForImport,stageCandidate,promoteCandidate,recoverBundle,parseRunState,parseCandidateState,readLocalFileBounded,PromotionReceiptError} from './archive-release';
import {parseArchiveJson,LIMITS} from './archive-bundle';
export async function runArchiveCommand(args:string[],env:NodeJS.ProcessEnv,storeFactory:()=>ArchiveStore=()=>createR2Store(readR2Config(env))):Promise<unknown>{
  const [command,...rest]=args;
  const allowed:Record<string,string[]>={preflight:[],restore:['data-dir','run-dir'],stage:['data-dir','run-dir'],promote:['data-dir','run-dir'],pack:['data-dir','run-dir'],recover:['bundle','sha256','data-dir']};
  if(!Object.hasOwn(allowed,command??''))throw new Error('Unknown archive command');
  const options=new Map<string,string>();
  for(let i=0;i<rest.length;i+=2){const key=rest[i]?.slice(2),value=rest[i+1];if(!rest[i]?.startsWith('--')||!allowed[command].includes(key)||!value||value.startsWith('--')||options.has(key))throw new Error('Invalid archive command options');options.set(key,value);}
  if(options.size!==allowed[command].length)throw new Error('Missing archive command options');
  const dataDir=options.get('data-dir')!,runDir=options.get('run-dir')!;
  if(command==='recover')return recoverBundle(options.get('bundle')!,options.get('sha256')!,dataDir);
  if(command==='pack'){
    const pkg=await buildLocalBundle(dataDir,null);await mkdir(runDir,{recursive:true});await writeFile(join(runDir,'bundle.json'),pkg.bytes,{flag:'wx'});
    return {bundleFile:join(runDir,'bundle.json'),sha256:pkg.reference.sha256,bytes:pkg.bytes.length,accepted:false};
  }
  const dispatch=parseArchiveDispatch(env);if(command==='preflight')return dispatch;
  if(!dispatch.archive)throw new Error('Remote archive commands require archive mode');
  // Parse persisted input before creating a provider client.
  if(command==='restore')return restoreForImport({store:storeFactory(),dataDir,runDir},{reportingMonth:dispatch.reportingMonth,initialize:dispatch.initialize});
  const state=parseArchiveJson(await readLocalFileBounded(join(runDir,command==='stage'?'run.json':'candidate.json'),LIMITS.pointer),LIMITS.pointer);
  if(command==='stage'){const run=parseRunState(state);if(run.reportingMonth!==dispatch.reportingMonth)throw new Error('Run month differs from dispatch');return stageCandidate({store:storeFactory(),dataDir,runDir},run);}
  const candidate=parseCandidateState(state);if(candidate.run.reportingMonth!==dispatch.reportingMonth)throw new Error('Candidate month differs from dispatch');
  const outcome=await promoteCandidate({store:storeFactory(),dataDir,runDir},candidate,{artifactId:env.BACKUP_ARTIFACT_ID??'',artifactDigest:env.BACKUP_ARTIFACT_DIGEST??''});
  if(['conflict','unconfirmed'].includes(outcome.status))process.exitCode=1;return outcome;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  runArchiveCommand(process.argv.slice(2),process.env).then(result=>console.log(JSON.stringify(result))).catch(error=>{if(error instanceof PromotionReceiptError){console.log(JSON.stringify({...error.outcome,receiptPersisted:false}));console.error('The reported promotion outcome stands; its local receipt could not be saved.');}else if(error instanceof R2ConfigurationError)console.error(error.message);else console.error('Archive command failed; inspect available outcome evidence before inferring acceptance.');process.exitCode=1;});
}
