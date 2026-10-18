import {resolve} from 'node:path';
import {readMexicoAllGoodsEvidence} from './evidence.server';
import {encodeMexicoCandidate,verifyMexicoCandidate} from './package.server';
import {reserveMexicoOutput,writeMexicoExclusiveFile} from './io.server';
import {json} from './contract.server';
import type {MexicoCandidateMetadata,MexicoPreparedCandidate} from './types';
export async function prepareMexicoCandidate(opts:{repoRoot:string;outputDir:string;metadata:MexicoCandidateMetadata}):Promise<MexicoPreparedCandidate>{
 const evidence=await readMexicoAllGoodsEvidence(opts.repoRoot),pack=encodeMexicoCandidate(evidence,opts.metadata),{report}=verifyMexicoCandidate(pack),out=await reserveMexicoOutput(opts.repoRoot,opts.outputDir);
 // The pending report is last; interruption cannot leave a success claim ahead of the candidate.
 await writeMexicoExclusiveFile(opts.repoRoot,resolve(out,'candidate.json'),pack.bytes);await writeMexicoExclusiveFile(opts.repoRoot,resolve(out,'candidate-report.json'),json(report));return {package:pack,report};
}
