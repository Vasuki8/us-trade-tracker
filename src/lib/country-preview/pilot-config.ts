import type {CanadaPilotMode} from './types';
export type CanadaPilotEnvironment=Readonly<Partial<Record<'CANADA_PILOT_MODE'|'CANADA_PREVIEW_MODE'|'CANADA_ACCEPTED_PREVIEW_MODE'|'TRADE_DATA_MODE',string>>>;
export function resolveCanadaPilotMode(environment:CanadaPilotEnvironment):CanadaPilotMode {
  const mode=environment.CANADA_PILOT_MODE;
  if(mode===undefined)return null;
  if(mode!=='fixture'&&mode!=='selected'&&mode!=='snapshot')throw new Error('Invalid Canada pilot mode');
  if(environment.CANADA_PREVIEW_MODE!==undefined||environment.CANADA_ACCEPTED_PREVIEW_MODE!==undefined)throw new Error('Canada pilot cannot include private previews');
  const productMode=environment.TRADE_DATA_MODE;
  if(mode==='fixture'?productMode!=='fixture':productMode!==undefined&&productMode!=='census')throw new Error('Canada pilot/product data modes differ');
  return mode;
}
