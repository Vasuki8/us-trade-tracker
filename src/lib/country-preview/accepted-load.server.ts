import {loadCanadaPreview} from './load.server';
import {readSelectedCountryRelease} from '../country-release/selection.server';
import {canadaCountryReleaseContract as release,countrySame,digestCountryBytes,countryJsonBytes,countryTimestamp} from '../country-release/contract.server';
import {countryArchiveContract as archive} from '../country-archive/contract.server';
import type {CountryPreview,CountryPresentation} from './types';
export async function loadAcceptedCanadaPreview(options:{workspaceRoot?:string;modeValue?:string}={}):Promise<{data:CountryPreview;presentation:CountryPresentation}|null>{
  const mode=Object.hasOwn(options,'modeValue')?options.modeValue:process.env.CANADA_ACCEPTED_PREVIEW_MODE;
  if(mode===undefined)return null;
  if(mode!=='fixture'&&mode!=='selected')throw new Error('Invalid accepted Canada preview mode');
  const root=options.workspaceRoot??process.cwd();
  if(mode==='fixture')return {data:(await loadCanadaPreview({workspaceRoot:root,modeValue:'fixture'}))!,presentation:{kind:'accepted-fixture'}};
  try {
    const selected=await readSelectedCountryRelease(root);
    countrySame(digestCountryBytes(countryJsonBytes(selected.pointer)),archive.selectedPointerDigest);
    countrySame(selected.pointer.releaseId,archive.releaseId);
    countrySame(digestCountryBytes(countryJsonBytes(selected.projection)),release.projection);
    countrySame(selected.record.decision,'approved-for-local-selection');
    if(selected.projection.source!=='retained'||selected.projection.rawVerification!=='previous-reviewed-replay')throw new Error('invalid-selected-source');
    const acceptedAt=countryTimestamp(selected.record.approval.approvedAt);
    return {data:selected.projection,presentation:{kind:'accepted-local',releaseId:selected.pointer.releaseId,acceptedAt}};
  }catch{throw new Error('Accepted Canada preview unavailable or invalid');}
}
