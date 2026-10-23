import {mexicoAcceptanceContract} from '../mexico-country-release/acceptance-contract.server';
import type {FileIdentity} from '../../../scripts/site-preparation-files';
export const MEXICO_PUBLIC_SELECTION_PATH='deployment/site-mexico-selection.json';
export const MEXICO_INPUT_KINDS=['pointer','candidate','evidence','manifest'] as const;
export type MexicoInputKind=typeof MEXICO_INPUT_KINDS[number];
export interface MexicoPublicationSelection {
 schemaVersion:1;selectionId:'mexico-all-goods-pilot-v1';countryCode:'2010';scope:'all-goods-only';
 from:'2024-09';to:'2026-08';source:'census';productComparisonsAvailable:false;classificationAccepted:false;
 releaseId:string;inputs:Record<MexicoInputKind,FileIdentity>;publicProfile:{bytes:number;sha256:string};
}
function fields(value:unknown,names:string[]):Record<string,unknown>{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==names.length||names.some(n=>!Object.hasOwn(value,n)))throw Error('Invalid Mexico publication selection');
 return value as Record<string,unknown>;
}
function identity(value:unknown,limit:number,path?:string):{bytes:number;sha256:string}&{path?:string}{
 const v=fields(value,path===undefined?['bytes','sha256']:['path','bytes','sha256']);
 if(typeof v.bytes!=='number'||!Number.isSafeInteger(v.bytes)||v.bytes<1||v.bytes>limit||typeof v.sha256!=='string'||!/^[a-f0-9]{64}$/.test(v.sha256)||path!==undefined&&v.path!==path)throw Error('Invalid Mexico publication identity');
 return {bytes:v.bytes,sha256:v.sha256,...(path===undefined?{}:{path})};
}
export function parseMexicoPublicationSelection(value:unknown):MexicoPublicationSelection {
 const v=fields(value,['schemaVersion','selectionId','countryCode','scope','from','to','source','productComparisonsAvailable','classificationAccepted','releaseId','inputs','publicProfile']);
 if(v.schemaVersion!==1||v.selectionId!=='mexico-all-goods-pilot-v1'||v.countryCode!=='2010'||v.scope!=='all-goods-only'||v.from!=='2024-09'||v.to!=='2026-08'||v.source!=='census'||v.productComparisonsAvailable!==false||v.classificationAccepted!==false||v.releaseId!==mexicoAcceptanceContract.releaseId)throw Error('Invalid Mexico publication selection');
 const input=fields(v.inputs,[...MEXICO_INPUT_KINDS]),base=mexicoAcceptanceContract.stateRoot;
 const limits={pointer:16384,candidate:16777216,evidence:3145728,manifest:65536};
 const inputs=Object.fromEntries(MEXICO_INPUT_KINDS.map(kind=>{
  const path=base+'/'+(kind==='pointer'?'current.json':'releases/'+v.releaseId+'/'+kind+'.json');
  return [kind,identity(input[kind],limits[kind],path) as FileIdentity];
 })) as Record<MexicoInputKind,FileIdentity>;
 return {schemaVersion:1,selectionId:'mexico-all-goods-pilot-v1',countryCode:'2010',scope:'all-goods-only',from:'2024-09',to:'2026-08',source:'census',productComparisonsAvailable:false,classificationAccepted:false,releaseId:v.releaseId as string,inputs,publicProfile:identity(v.publicProfile,65536)};
}
