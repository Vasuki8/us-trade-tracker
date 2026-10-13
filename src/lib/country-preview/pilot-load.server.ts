import {loadAcceptedCanadaPreview} from './accepted-load.server';
import {resolveCanadaPilotMode,type CanadaPilotEnvironment} from './pilot-config';
import type {CountryPreview,CountryPilotPresentation} from './types';
export async function loadCanadaPilot(options:{workspaceRoot?:string;environment?:CanadaPilotEnvironment}={}):Promise<{data:CountryPreview;presentation:CountryPilotPresentation}|null>{
  const mode=resolveCanadaPilotMode(options.environment??process.env);
  if(mode===null)return null;
  try {
    const result=await loadAcceptedCanadaPreview({workspaceRoot:options.workspaceRoot,modeValue:mode});
    if(!result)throw new Error('Missing pilot data');
    if(mode==='fixture'&&result.presentation.kind==='accepted-fixture')return {data:result.data,presentation:{kind:'pilot-fixture'}};
    if(mode==='selected'&&result.presentation.kind==='accepted-local')return {data:result.data,presentation:{kind:'pilot-prepared',releaseId:result.presentation.releaseId,acceptedAt:result.presentation.acceptedAt}};
    throw new Error('Crossed pilot presentation');
  }catch{throw new Error('Canada pilot unavailable or invalid');}
}
