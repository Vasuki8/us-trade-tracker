import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {vi} from 'vitest';
import {countryArchiveContract as archive} from '../../src/lib/country-archive/contract.server';
import {canadaCountryReleaseContract as release,countryJsonBytes,digestCountryBytes} from '../../src/lib/country-release/contract.server';
import {packCountryRelease,decodeCountryRelease} from '../../src/lib/country-release/package.server';
import {verifyCountryEvidence} from '../../src/lib/country-release/evidence.server';
import {authenticateCountryCandidate} from '../../src/lib/country-release/recovery.server';
import {selectLocalCountryRelease} from '../../src/lib/country-release/selection.server';
import {makeCountryReleaseEvidenceFixture,makeCountryReleaseMetadataFixture,makeCountryVerificationProofFixture,makeCountryReleaseWorkspaceFixture,mockCountryReleaseEvidence} from './country-release-data';
export const syntheticArchiveInstruction='Synthetic test owner authorizes this isolated fixture archive and recovery only.';
export async function makeCountryArchiveWorkspaceFixture(){
  mockCountryReleaseEvidence(makeCountryReleaseEvidenceFixture());
  const packed=packCountryRelease(verifyCountryEvidence(makeCountryReleaseEvidenceFixture()),makeCountryReleaseMetadataFixture());
  const w=await makeCountryReleaseWorkspaceFixture(packed.bytes),proof=makeCountryVerificationProofFixture(decodeCountryRelease(packed.bytes));
  const report=authenticateCountryCandidate(packed.bytes,proof).report;
  await selectLocalCountryRelease({...w,proof,approval:{scope:'local-selection-only',actor:'owner',approvedAt:'2026-10-12T01:00:00.000Z',candidateDigest:packed.digest,eligibilityReportDigest:digestCountryBytes(countryJsonBytes(report)),baseline:{kind:'initialize'}}});
  const pointerBytes=await readFile(resolve(w.repoRoot,release.stateRoot,'current.json'));
  vi.spyOn(archive,'releaseId','get').mockReturnValue(packed.manifest.releaseId);
  vi.spyOn(archive,'selectedPointerDigest','get').mockReturnValue(digestCountryBytes(pointerBytes));
  const sourceBody=Buffer.from('synthetic preserved source\n'),sourceManifest=countryJsonBytes({schemaVersion:1,policyId:archive.policyId,countryCode:'1220',reporting:{from:'2024-09',to:'2026-08'},sourceBytes:sourceBody.length,files:[{id:'0000',path:'data/backups/preserved.bin',...digestCountryBytes(sourceBody),role:'original'}]});
  vi.spyOn(archive,'manifestPin','get').mockReturnValue({path:'manifest.json',...digestCountryBytes(sourceManifest)});
  vi.spyOn(archive,'expectedSources','get').mockReturnValue({files:1,bytes:sourceBody.length});
  await writeFile(resolve(w.repoRoot,'manifest.json'),sourceManifest);await writeFile(resolve(w.repoRoot,'data/backups/preserved.bin'),sourceBody);
  await mkdir(resolve(w.repoRoot,archive.backupRoot),{recursive:true});await mkdir(resolve(w.repoRoot,archive.selectionEvidenceRoot),{recursive:true});
  await writeFile(resolve(w.repoRoot,archive.selectionEvidenceRoot,'selection-receipt.json'),await readFile(w.outcomeFile));
  await writeFile(resolve(w.repoRoot,archive.selectionEvidenceRoot,'completion.json'),countryJsonBytes({schemaVersion:1,status:'local-acceptance-complete',selectedPointerDigest:digestCountryBytes(pointerBytes),candidateDigest:packed.digest}));
  return {...w,packed,pointerBytes,sourceBody,sourceManifest,outputDir:resolve(w.repoRoot,archive.backupRoot,'prepared'),operatorInstruction:syntheticArchiveInstruction};
}
