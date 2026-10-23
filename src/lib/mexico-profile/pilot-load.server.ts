import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {readSiteFile} from '../../../scripts/site-preparation-files';
import {loadMexicoLocalProfile} from './load.server';
import {resolveMexicoPilotMode,type MexicoPilotEnvironment} from './pilot-config';
import {projectMexicoPilotProfile} from './presentation';
import {MEXICO_PUBLIC_SELECTION_PATH,MEXICO_INPUT_KINDS,parseMexicoPublicationSelection,type MexicoPublicationSelection} from './pilot-contract.server';
import type {MexicoPilotProfile} from './types';
const digest=(bytes:Buffer)=>({bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
export async function loadMexicoPilot(options:{workspaceRoot?:string;environment?:MexicoPilotEnvironment;selection?:MexicoPublicationSelection}={}):Promise<MexicoPilotProfile|null> {
 try{
  const mode=resolveMexicoPilotMode(options.environment??process.env);
  if(mode===null)return null;
  const root=resolve(options.workspaceRoot??process.cwd());
  if(mode==='fixture'){
   const local=await loadMexicoLocalProfile({workspaceRoot:root,environment:{MEXICO_LOCAL_PREVIEW_MODE:'fixture',TRADE_DATA_MODE:'fixture'}});
   if(!local)throw Error('Missing Mexico fixture');
   return projectMexicoPilotProfile(local,'fixture');
  }
  const selectionBytes=options.selection===undefined?await readSiteFile(root,resolve(root,MEXICO_PUBLIC_SELECTION_PATH),16384):undefined;
  const selection=parseMexicoPublicationSelection(options.selection??JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(selectionBytes!)));
  const checkInputs=async()=>{for(const kind of MEXICO_INPUT_KINDS){const f=selection.inputs[kind];await readSiteFile(root,resolve(root,f.path),f.bytes,f);}};
  await checkInputs();
  // Only this authenticated server-side bridge reads private state for publication.
  const local=await loadMexicoLocalProfile({workspaceRoot:root,environment:{MEXICO_LOCAL_PREVIEW_MODE:'selected',TRADE_DATA_MODE:'census'}});
  if(!local||local.acceptance?.releaseId!==selection.releaseId)throw Error('Missing Mexico selected snapshot');
  const profile=projectMexicoPilotProfile(local,'snapshot'),identity=digest(Buffer.from(JSON.stringify(profile),'utf8'));
  if(identity.bytes!==selection.publicProfile.bytes||identity.sha256!==selection.publicProfile.sha256)throw Error('Mexico public projection changed');
  await checkInputs();
  if(selectionBytes)await readSiteFile(root,resolve(root,MEXICO_PUBLIC_SELECTION_PATH),16384,digest(selectionBytes));
  return profile;
 }catch{throw Error('Mexico public pilot unavailable or invalid');}
}
