import approved from '../../../docs/superpowers/plans/2026-10-18-mexico-private-acceptance-archive-inputs.json';
import type {MexicoIdentity} from './types';
export const mexicoAcceptanceContract={
 policyId:'mexico-private-all-goods-acceptance-v1' as const,
 stateRoot:'data/countries/2010/processed',
 get candidate():MexicoIdentity{return {bytes:approved.candidate.bytes,sha256:approved.candidate.sha256};},
 get projection():MexicoIdentity{return {...approved.projection};},
 get pins(){return approved.evidenceMembers.map(p=>({name:p.archiveName,bytes:p.bytes,sha256:p.sha256}));},
 get plan():MexicoIdentity{return {bytes:44906,sha256:'76ab3670efa149d6bfb59cb52bec9596ab1e51fdf975f21977dd4b3d5c3224da'};},
 get inputs():MexicoIdentity{return {bytes:14371,sha256:'3257a29089893dc24db022d0ba4e1a7bb57b2cedc854b30a5ba1abe8466103f3'};},
 get packagingCommit(){return approved.packagingCommit;},get reviewedCommit(){return approved.baselineCommit;},get releaseId(){return approved.releaseId;},
 limits:{authorization:16*1024,instrument:256*1024,evidence:3*1024*1024,pointer:16*1024,manifest:64*1024},
};
