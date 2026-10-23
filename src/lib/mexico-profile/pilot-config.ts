export type MexicoPilotEnvironment=Readonly<Record<string,string|undefined>>;
export function resolveMexicoPilotMode(environment:MexicoPilotEnvironment):null|'fixture'|'snapshot' {
 const mode=environment.MEXICO_PILOT_MODE;
 if(mode===undefined)return null;
 if(mode!=='fixture'&&mode!=='snapshot')throw Error('Invalid Mexico public mode');
 if(['MEXICO_LOCAL_PREVIEW_MODE','CANADA_PREVIEW_MODE','CANADA_ACCEPTED_PREVIEW_MODE'].some(k=>environment[k]!==undefined))throw Error('Mexico public mode cannot include private previews');
 if(environment.CANADA_PILOT_MODE!==mode||environment.TRADE_DATA_MODE!==(mode==='fixture'?'fixture':'census'))throw Error('Mexico public/Canada/product modes differ');
 return mode;
}
