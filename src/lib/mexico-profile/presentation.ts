import type {MexicoLocalProfile,MexicoPilotProfile,MexicoProfileView} from './types';
const keys=['schemaVersion','countryCode','countryName','from','to','source','presentation','acceptance','captureInterval','directions','qualifications'];
export function projectMexicoPilotProfile(data:MexicoLocalProfile,mode:'fixture'|'snapshot'):MexicoPilotProfile {
 const real=mode==='snapshot',q=data.qualifications;
 if(!['fixture','snapshot'].includes(mode)||Object.keys(data).length!==keys.length||keys.some(k=>!Object.hasOwn(data,k))||data.schemaVersion!==1||data.countryCode!=='2010'||data.countryName!=='Mexico'||data.from!=='2024-09'||data.to!=='2026-08'||data.source!==(real?'census':'fixture')||data.presentation!==(real?'accepted-private-local':'synthetic-local'))throw Error('Invalid Mexico public projection');
 if(real?!data.acceptance||data.acceptance.scope!=='private-all-goods':data.acceptance!==null)throw Error('Invalid Mexico public acceptance');
 if(q.classificationAccepted!==false||q.productComparisonsAvailable!==false||q.currentBeforeMatched!==48||q.currentAfterMatched!==48||q.datedMatched!==16||q.datedDifferences!==32||q.differenceCause!=='not-established'||q.vintageRelationship!=='not-established'||q.verificationBasis!==(real?'prior-reviewed-retained-evidence':'synthetic')||q.historicalFailuresPreserved!==true)throw Error('Invalid Mexico public qualification');
 if(Object.values(data.directions).some(d=>d.monthly.some(r=>real?r.originalSource===null:r.originalSource!==null)))throw Error('Invalid Mexico public sources');
 const result:MexicoPilotProfile={...structuredClone(data),presentation:real?'public-pilot-snapshot':'public-pilot-fixture'};
 if(new TextEncoder().encode(JSON.stringify(result)).length>65536)throw Error('Mexico public projection exceeds limit');
 return result;
}
export function mexicoProfileDescription(profile:MexicoProfileView):string {
 if(profile.source==='fixture')return 'Synthetic Mexico all-goods development data; no accepted Mexico release.';
 if(profile.presentation==='public-pilot-snapshot')return 'Captured U.S. goods trade with Mexico, September 2024–August 2026.';
 return 'An unpublished local view of the accepted 24-month Mexico all-goods snapshot.';
}
