import {createHash} from 'node:crypto';

export type ReviewedPublication={
  countryCode:'1220';month:string;direction:'exports';measure:'ALL_VAL_MO';url:string;publicationDate:string;
  pdfPage:number;printedPage:string;table:string;column:string;units:string;quantumUsd:100000;valueUsd:number;bytes:number;sha256:string;
};
export type CountryPublicationEvidence={
  reviewed:ReviewedPublication;retrievedAt:string;httpStatus:number|null;contentType:string|null;
  lastModified:string|null;httpDate:string|null;bytes:number|null;sha256:string|null;
  verification:'verified'|'unavailable';referenceUsd:number|null;error:string|null;
};
// Independently checked original publications, not extracted from the current country table.
// Updating a pin requires reviewing the original page and retaining its source evidence.
const entries=[
  ['01','2026-03-12',56,24510300000,1719702,'3c18b43ee3e6e91a9a90dc159ef44f33972745ea38b892ebbc77823b1bf418d9','January'],
  ['02','2026-04-02',55,28371300000,1741412,'96c04f834b91c12887264c81590e5bc614f4d6f6b6b2d3bcd9345365de79a2d0','February'],
  ['03','2026-05-05',54,31438900000,1745935,'9f71de167044d2d4c5d3d81271a5311173be1e67c9eda4c52779b2bf8de22b72','March'],
  ['04','2026-06-09',55,29741100000,1754536,'11947b2eed8dc87414cfc2ec89b73d7f01282a1d10c70452684b9736ee284b87','April'],
  ['05','2026-07-07',53,29790800000,1798284,'9ab9737e0c84a679dec653de9ca1223de3004e0d0d074ef3a2dec33cb63c70ec','May'],
  ['06','2026-08-04',53,30695500000,1817223,'a67052e2f6f97dcd8a4fb46530464dc093eea26251b9ca153f658a09957e7eef','June'],
  ['07','2026-09-03',54,29338600000,1826911,'c122b8ccee947c58859597a7549bb5dcb6691add3e405180ab915d43f6c43aa0','July'],
] as const;
export const canadaReviewedPublications:readonly ReviewedPublication[]=entries.map(([month,publicationDate,pdfPage,valueUsd,bytes,sha256,name])=>({
  countryCode:'1220',month:`2026-${month}`,direction:'exports',measure:'ALL_VAL_MO',
  url:`https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_26${month}.pdf`,publicationDate,pdfPage,
  table:'FT900 supplement, Exhibit 4',printedPage:'- 5 -',column:`${name} exports, domestic and foreign, FAS`,units:'nominal USD millions, not seasonally adjusted',quantumUsd:100000,valueUsd,bytes,sha256,
}));

export async function fetchReviewedPublication(reviewed:ReviewedPublication,apiKey:string,fetchImpl:typeof fetch=fetch):Promise<{evidence:CountryPublicationEvidence;body:Buffer|null}>{
  const evidence:CountryPublicationEvidence={reviewed,retrievedAt:new Date().toISOString(),httpStatus:null,contentType:null,lastModified:null,httpDate:null,bytes:null,sha256:null,verification:'unavailable',referenceUsd:null,error:'Original publication unavailable or changed; inspect retained evidence'};
  let body:Buffer|null=null;
  try{
    const response=await fetchImpl(reviewed.url,{signal:AbortSignal.timeout(30_000),redirect:'error'});
    evidence.httpStatus=response.status;evidence.contentType=response.headers.get('content-type');evidence.lastModified=response.headers.get('last-modified');evidence.httpDate=response.headers.get('date');
    if(apiKey&&[evidence.contentType,evidence.lastModified,evidence.httpDate].some(value=>value?.includes(apiKey)||value?.includes(encodeURIComponent(apiKey)))){
      evidence.contentType=null;evidence.lastModified=null;evidence.httpDate=null;await response.body?.cancel().catch(()=>{});throw new Error('Unsafe publication metadata');
    }
    const reader=response.body?.getReader();if(!reader)throw new Error('Missing publication body');
    const chunks:Uint8Array[]=[];let length=0;
    try{while(true){const chunk=await reader.read();if(chunk.done)break;length+=chunk.value.byteLength;if(length>4*1024*1024)throw new Error('Oversized publication');chunks.push(chunk.value);}}finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
    const candidate=Buffer.concat(chunks);
    if(apiKey&&(candidate.includes(apiKey)||candidate.includes(encodeURIComponent(apiKey))))throw new Error('Unsafe publication body');
    body=candidate;evidence.bytes=body.length;evidence.sha256=createHash('sha256').update(body).digest('hex');
    if(!response.ok||evidence.contentType?.split(';')[0].trim().toLowerCase()!=='application/pdf'||!body.subarray(0,5).equals(Buffer.from('%PDF-'))||body.length!==reviewed.bytes||evidence.sha256!==reviewed.sha256)throw new Error('Unverified publication');
    evidence.verification='verified';evidence.referenceUsd=reviewed.valueUsd;evidence.error=null;
  }catch{/* Never retain exception text or a credential-echoed body. */}
  evidence.retrievedAt=new Date().toISOString();return {evidence,body};
}

export function compareCountryReferences(totalUsd:number|null,currentUsd:number|null,publicationUsd:number|null|undefined){
  const check=(reference:number|null)=>totalUsd===null||reference===null?'unavailable' as const:Math.round(totalUsd/100000)===Math.round(reference/100000)?'matched' as const:'mismatch' as const;
  const referenceCheck=check(currentUsd);const publicationCheck=publicationUsd===undefined?'not-reviewed' as const:check(publicationUsd);
  const referenceCorroboration=referenceCheck==='matched'?'current-table' as const:publicationCheck==='matched'?'original-publication-only' as const:'none' as const;
  return {referenceCheck,publicationCheck,referenceCorroboration};
}
