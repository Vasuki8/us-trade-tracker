import type {Readable} from 'node:stream';
import type {Digest,CountryApproval,CountryRecoveryReceipt} from '../country-release/types';
export type SourceEntry=Digest&{id:string;path:string;role:'original'|'normalized'|'classification'|'capture'};
export type SourceManifest={schemaVersion:1;policyId:'canada-private-archive-v1';countryCode:'1220';reporting:{from:'2024-09';to:'2026-08'};sourceBytes:number;files:SourceEntry[]};
export type ArchiveRef=Digest&{key:string};
export type CountryArchivePointer={schemaVersion:1;policyId:'canada-private-archive-v1';countryCode:'1220';releaseId:string;sourceManifest:ArchiveRef;bundle:ArchiveRef;localPointerDigest:Digest};
export interface ArchiveStore{
  get(key:string,maxBytes:number):Promise<{bytes:Buffer;etag:string}|null>;
  put(key:string,bytes:Buffer,condition:{ifNoneMatch:'*'}):Promise<void>;
  source(key:string,maxBytes:number):Promise<{stream:Readable;contentLength:number|null}>;
}
export type OperatorAuthorization={schemaVersion:1;scope:'private-country-archive-and-isolated-recovery';actor:'owner';recordedAt:string;instruction:string;localPointerDigest:Digest;sourceManifestDigest:Digest;recovery:CountryApproval};
export type ArchiveMemberName='candidate.json'|'acceptance.json'|'local-pointer.json'|'selection-receipt.json'|'local-completion.json'|'operator-authorization.json';
export type DecodedArchive={digest:Digest;releaseId:string;sourceManifestDigest:Digest;files:Map<ArchiveMemberName,Buffer>;authorization:OperatorAuthorization};
export type UploadCapability=SourceEntry&{key:string;url:string;headers:Record<string,string>};
export type Capabilities={schemaVersion:1;policyId:'canada-private-archive-v1';accountId:string;bucketName:string;issuedAt:string;expiresAt:string;sourceManifestDigest:Digest;bundleDigest:Digest;objects:UploadCapability[]};
export type UploadReceipt={schemaVersion:1;status:'complete'|'incomplete';sourceManifestDigest:Digest;bundleDigest:Digest;capabilityDigest:Digest;outcomes:{id:string;status:'uploaded'|'existing'|'failed'}[]};
export type ArchiveVerificationReceipt={schemaVersion:1;policyId:'canada-private-archive-v1';status:'verified';sourceManifestDigest:Digest;bundleDigest:Digest;localPointerDigest:Digest;sourceCount:number;sourceBytes:number;projectionDigest:Digest;recovery:CountryRecoveryReceipt;originalSourceFetches:0;archiveOutcome:'initialized'|'confirmed-by-readback'|'already-selected'|'read-only-verified'|'unchanged'|'conflict'|'unconfirmed';currentStateVerified:boolean;archivePointerDigest:Digest|null};
