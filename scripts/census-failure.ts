export type CensusFailureContext={
 productCode:string;month:string;direction:'imports'|'exports'|null;dataset:'merchandise'|'duties'|'release';
 summary:'HS'|'HSCY'|'HSRP'|'HSCYRP'|null;requestUrl:string|null;
 phase:'fetch'|'http'|'content-type'|'body'|'json'|'validation'|'capture';
 attempt:number|null;httpStatus:number|null;elapsedMs:number|null;transportCode:string|null;
};
export class CensusRequestError extends Error{
 constructor(message:string,readonly requestContext:CensusFailureContext){super(message);this.name='CensusRequestError';}
}
const codes=new Set(['UND_ERR_CONNECT_TIMEOUT','UND_ERR_HEADERS_TIMEOUT','UND_ERR_BODY_TIMEOUT','ECONNRESET','ETIMEDOUT','ENOTFOUND','ECONNREFUSED','ENETUNREACH','EHOSTUNREACH','ABORT_ERR']);
export function safeTransportCode(error:unknown,signal:AbortSignal|undefined,parent?:AbortSignal){
 if(parent?.aborted)return 'canceled';
 if(signal?.aborted)return 'timeout';
 const candidate=error as {cause?:{code?:unknown};code?:unknown};
 const code=candidate?.cause?.code??candidate?.code;
 return typeof code==='string'&&codes.has(code)?code:'unknown';
}
export function credentialBearing(text:string,key:string){
 if(!key)return true;
 const escaped=JSON.stringify(key).slice(1,-1);
 const unicode=text.replace(/\\u([a-f\d]{4})/gi,(_,code:string)=>String.fromCharCode(parseInt(code,16)));
 let decoded=unicode;
 try{decoded=decodeURIComponent(unicode.replace(/\+/g,' '));}catch{/* Still check literal and JSON-escaped forms. */}
 return [text,unicode,decoded].some(value=>[key,escaped,encodeURIComponent(key)].some(secret=>value.includes(secret)));
}
export function safeValidationMessage(error:unknown,key:string,fallback:string){
 const message=error instanceof Error?error.message:'';
 return message&&message.length<=512&&!credentialBearing(message,key)?message:fallback;
}
