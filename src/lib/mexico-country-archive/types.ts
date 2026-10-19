import type {MexicoIdentity} from '../mexico-country-release/types';
export type MexicoArchiveRole='candidate'|'evidence'|'manifest';
export interface MexicoArchiveDescriptor {role:MexicoArchiveRole;key:string;identity:MexicoIdentity}
export interface MexicoArchiveReference {key:string;identity:MexicoIdentity}
export interface MexicoArchiveMaterial {candidateBytes:Buffer;evidenceBytes:Buffer;manifestBytes:Buffer;descriptors:readonly MexicoArchiveDescriptor[]}
export interface MexicoArchiveManifest {
 schemaVersion:1;policyId:'mexico-private-all-goods-archive-v1';acceptancePolicyId:'mexico-private-all-goods-acceptance-v1';
 countryCode:'2010';scope:'all-goods';source:'census';from:'2024-09';to:'2026-08';releaseId:string;
 preservationDepth:'retained-all-goods-evidence-only';projection:MexicoIdentity;authorization:MexicoIdentity;objects:readonly MexicoArchiveDescriptor[];
}
export interface MexicoAcceptedPointer {
 schemaVersion:1;policyId:'mexico-private-all-goods-archive-v1';acceptancePolicyId:'mexico-private-all-goods-acceptance-v1';
 countryCode:'2010';scope:'all-goods';source:'census';from:'2024-09';to:'2026-08';releaseId:string;status:'accepted-private-all-goods';
 candidate:MexicoArchiveReference;evidence:MexicoArchiveReference;manifest:MexicoArchiveReference;authorization:MexicoIdentity;acceptedAt:string;
 allGoodsAccepted:true;classificationAccepted:false;publicMexicoProfile:false;productComparisons:{available:false};
}
export interface MexicoArchiveStore {get(key:string,maxBytes:number):Promise<{bytes:Buffer;etag:string}|null>;put(key:string,bytes:Buffer,condition:{ifNoneMatch:'*'}):Promise<void>}
export interface MexicoAcceptedRecoveryReceipt {schemaVersion:1;policyId:'mexico-private-all-goods-archive-v1';countryCode:'2010';status:'recovered';verificationStage:'prospective'|'selected';recoveryId:string;recoveredAt:string;candidate:MexicoIdentity;projection:MexicoIdentity;pointer:MexicoIdentity;historicalPathReads:0;sourceRequests:0}
export interface MexicoArchiveReceipt {
 schemaVersion:1;policyId:'mexico-private-all-goods-archive-v1';countryCode:'2010';mode:'initialize'|'selected'|'local-readback';
 status:'verified'|'conflict'|'unconfirmed'|'failed';archiveOutcome:'initialized'|'confirmed-by-readback'|'already-selected'|'read-only-verified'|'conflict'|'unconfirmed'|'failed';
 currentStateVerified:boolean;pointer:MexicoAcceptedPointer|null;pointerIdentity:MexicoIdentity|null;recovery:MexicoAcceptedRecoveryReceipt|null;
}
export type MexicoVerifyOptions={store:MexicoArchiveStore;repoRoot:string;outputDir:string}&({mode:'initialize';expectedManifest:MexicoIdentity}|{mode:'selected';expectedManifest?:never});
export interface MexicoInstallationVerification {schemaVersion:1;initialization:MexicoArchiveReceipt;selected:MexicoArchiveReceipt;localReadback:MexicoArchiveReceipt}
export interface MexicoInstallationOutcome {schemaVersion:1;countryCode:'2010';status:'installed'|'already-installed'|'conflict'|'unconfirmed';currentStateVerified:boolean;pointer:MexicoIdentity|null;candidate:MexicoIdentity}
