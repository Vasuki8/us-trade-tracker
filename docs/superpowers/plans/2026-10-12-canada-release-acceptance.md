# Canada Release Acceptance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare and independently verify a portable Canada release candidate, with tested local acceptance/recovery controls, without accepting the real collection or publishing it.

**Architecture:** A country-specific policy authenticates the fixed evidence and reuses the existing pure Canada projector. A separate codec creates an immutable eleven-member package; recovery uses package bytes only. Local selection logic validates package, proof, approval and expected prior state, while its real activation remains a later operation.

**Tech Stack:** Existing Node 24, TypeScript, `tsx`, Vitest and Playwright; native filesystem/crypto APIs; no new dependency or service.

**Spec:** [Approved Canada release-acceptance design](../specs/2026-10-12-canada-release-acceptance-design.md).

**Execution method:** Preserved owner preference: root implements the five tasks in this session using `superpowers:executing-plans`; one fresh whole-branch reviewer checks the result before merge. No implementation subagents. Use the most capable available reviewer, with an isolated context. Real candidate acceptance, R2 and publication remain separate owner decisions.

## Global Constraints

- Source and acceptance policies: `canada-archive-snapshot-v1` / `canada-country-release-v1`.
- September 2024–August 2026, exactly 24 months in each direction; current/prior September 2025–August 2026 / September 2024–August 2025.
- Imports `GEN_VAL_MO`; exports `ALL_VAL_MO`; nominal integer USD, not seasonally adjusted; all transport and Canada `1220`.
- Source-assessment processing commit `9c385fb94b2a36b1d07ddf9e01670c366839a83b`; raw verification basis `previous-reviewed-replay`.
- Exactly 48 contexts, 20 fixed selected categories, 17 qualified ordinary comparisons and three statistical exclusions; selected categories are a subset, not an exhaustive country catalog.
- Preserve each saved reference grid's 41 matches/seven mismatches, seven original-publication matches and 41 unreviewed checks; USD 100,000 rounding quantum; signed differences remain separate.
- Original assessment/evidence flags remain false; historical strict failures, source bodies, classification/capture metadata and the four accepted coffee files remain unchanged.
- Exactly eleven package members: ten authenticated evidence bodies and one generated projection; UTF-8 JSON serialization plus one LF for the projection.
- Limits: 16 KiB pointers, 64 KiB manifest, 1 MiB per member, 6 MiB combined decoded data, 8 MiB serialized package. Add explicit 64 KiB bounds for generated gate reports and approval records.
- A successful preparation, eligibility report, review or PR merge never selects a real release. All real acceptance, accepted-state restoration, R2 activation and publication require their own specific authorization.
- No provider fetch, raw ZIP read/decompression, new classification research, history extension, country/product intake, country duties, scheduled run, credential/access change or paid service.
- Existing website routes/product releases/archive codecs/workflows remain unchanged; pages/chart data stay on the static host, CSVs in the browser and R2 private. Retain the 15,000-file build planning alert.

## Review Focus

1. A package changed after earlier validation must be reauthenticated at recovery/selection, before any pointer or accepted directory mutation — Tasks 3/4.
2. Valid source bytes without implementation review, check results and preservation proof remain pending; candidate-embedded claims cannot supply that proof — Tasks 2/3/4.
3. Historical evidence containing missing or inaccessible scratch paths must recover using embedded bytes only; no receipt path may become a filesystem read — Task 3.
4. A locked Windows pointer destination, changed reparse ancestor or failed rename must produce an evidenced unchanged/conflict/unconfirmed outcome, never a guessed rollback — Task 4.
5. An acknowledged pointer replacement followed by failure to save its outcome must report the established selection and receipt failure separately — Task 4.

## Files and shared interfaces

Create focused server modules under `src/lib/country-release/`: `types.ts` (contracts), `contract.server.ts` (fixed pins/limits), `evidence.server.ts` (source checks/projection), `package.server.ts` (codec), `prepare.server.ts` (owned candidate output), `recovery.server.ts` (portable recovery/eligibility), `selection.server.ts` (local state). Thin CLI files are `scripts/prepare-country-release.ts` and `scripts/recover-country-release.ts`. Add no acceptance CLI or workflow in this milestone.

Create tests under `tests/country-release/` with a tracked-only synthetic helper `tests/helpers/country-release-data.ts`. Modify only `package.json` for the two offline commands, `README.md` for their operator instructions and `docs/validation/canada-release-candidate.md` for actual verification evidence. Existing preview/source/archive modules are consumed, not edited.

The following exact types belong in `types.ts`; task Interfaces blocks refer to them:

- `EvidenceName`: the ten logical names in the pin table. `MemberName = EvidenceName | 'research-data.json'`.
- `Digest = {bytes:number;sha256:string}`; `MemberPin = Digest & {name:EvidenceName;path:string}`.
- `CandidateMetadata = {releaseId:string;packagingCommit:string;preparedAt:string}`. Release IDs use `2026-08-<UUID>`; commits are full 40-character lowercase Git SHAs and timestamps are UTC ISO strings.
- `CountryPackageManifest`: strict schema version 1, country `1220`, source `census | fixture`, the two policy IDs, fixed reporting/measures, capture interval, source-assessment commit, `CandidateMetadata` and the ordered eleven `{name,bytes,sha256}` descriptors. No eligibility/approval fields or member source paths belong in the manifest.
- `VerifiedCountryEvidence = {files:ReadonlyMap<EvidenceName,Buffer>;projection:CountryPreview}`; `CountryPackage = {bytes:Buffer;digest:Digest;manifest:CountryPackageManifest}`; `DecodedCountryPackage = {digest:Digest;manifest:CountryPackageManifest;files:ReadonlyMap<MemberName,Buffer>}`.
- `GateId`: `assessmentAuthenticated`, `replayEvidenceAuthenticated`, `classificationScopeQualified`, `referenceQualificationsRecorded`, `projectionVerified`, `recoveryVerified`, `reviewAndPreservationVerified`. `GateStatus = 'passed' | 'failed' | 'pending'`.
- `CountryGateReport`: schema version 1, policy ID, candidate `Digest`, packaging commit, `source`, `gates:Record<GateId,GateStatus>`, status `ineligible | verification-pending | eligible | fixture-only`, fixed source qualifications and safe diagnostic codes. Only a real-source report with all seven gates passed is eligible.
- `CountryRecoveryReceipt`: schema version 1, candidate `Digest`, recovered projection `Digest`, policy ID, status `verified | failed`, and `historicalPathReads:0` for a verified result.
- `CountryVerificationProof`: candidate digest/packaging commit; verified recovery receipt; before/after preservation identities; actual test/type/build results; exact implementation-review commit/report/disposition; final CI identity/results and any evidence of unchanged runtime files since preparation. This is a separate trusted operator record; candidate fields are not proof, and metadata alone does not authenticate owner approval.
- `CountryApproval`: scope `local-selection-only`, actor `owner`, approval time, exact candidate digest, eligibility-report digest, explicit initialization or expected prior-pointer digest. It records separately supplied human authorization; software must not create it from eligibility or a yes-like CLI argument.
- `CountryAcceptanceRecord`: schema version 1, decision `approved-for-local-selection`, `CountryApproval`, complete eligible report and its `CountryVerificationProof`. Its SHA-256 binds all decision evidence; enforce the 64 KiB bound.
- `CountryCurrentPointer`: schema version 1, country `1220`, release ID, and relative package/acceptance-record references with byte lengths and hashes. Only fixed `releases/<id>/candidate.json` and `releases/<id>/acceptance.json` paths are permitted.
- `CountrySelectionOutcome`: status `acknowledged | confirmed-by-readback | already-selected | unchanged | conflict | unconfirmed`, candidate digest and `currentStateVerified:boolean`. `CountrySelectionReceiptError` carries this outcome if receipt persistence fails after selection.

Use these field names for the decision proof and pointer; reject extra fields, non-finite/unsafe numeric fields and incorrect digest/commit shapes. `Digest` always hashes the complete UTF-8 file bytes including any LF. The implementation review report is bounded to 16 KiB, and complete proof/report/approval records to 64 KiB.

```ts
type CountryVerificationProof = {
  schemaVersion: 1;
  policyId: 'canada-country-release-v1';
  candidateDigest: Digest;
  packagingCommit: string;
  recovery: CountryRecoveryReceipt;
  preservation: {before: readonly FileIdentity[]; after: readonly FileIdentity[]};
  checks: {
    unit: {passed: number; failed: 0; logSha256: string};
    types: {files: number; errors: 0; warnings: 0; hints: 0; logSha256: string};
    browser: {ordinaryPassed: number; canadaPassed: number; failed: 0; logSha256: string};
    normalBuild: {previewAbsent: true; fileCount: number; totalBytes: number; logSha256: string};
  };
  review: {reviewedHead: string; verdict: 'passed' | 'with-fixes-resolved';
    report: string; reportSha256: string; unresolvedFindingIds: readonly [];
    findingDispositions: readonly {id: string; decision: 'fixed' | 'outside-scope';
      reason: string; evidenceSha256: string}[]};
  ci: {repository: 'Vasuki8/us-trade-tracker'; runId: number; headCommit: string;
    testedMergeCommit: string; testedTree: string; conclusion: 'success'; logSha256: string};
  runtimeComparison: {fromCommit: string; toCommit: string; changedPaths: readonly string[]};
};
type CountryCurrentPointer = {
  schemaVersion: 1; countryCode: '1220'; releaseId: string;
  package: Digest & {path: string};
  acceptance: Digest & {path: string};
};
type CountryApproval = {
  scope: 'local-selection-only'; actor: 'owner'; approvedAt: string;
  candidateDigest: Digest; eligibilityReportDigest: Digest;
  baseline: {kind: 'initialize'} | {kind: 'existing'; pointerDigest: Digest};
};
```

`FileIdentity` is the existing `{path,bytes,sha256}` type from `scripts/country-snapshot-types.ts`. Proof preservation arrays must contain the exact eleven protected identities recorded by the completed prototype validation; the source reader still opens only the ten release-evidence files. The runtime comparison runs from `packagingCommit` to CI's final head; only `README.md` and `docs/validation/canada-release-candidate.md` may differ. Other tracked changes require a freshly prepared/verified candidate. A passed implementation review or explicit verified finding dispositions must cover the final runtime code; unresolved findings always block sealing. The operator record must link to the final successful CI run and preserve its actual results; the offline parser does not fetch or independently authenticate GitHub results.

### Task 1: Fixed policy and authenticated evidence

**Files:** Create `src/lib/country-release/types.ts`, `src/lib/country-release/contract.server.ts`, `src/lib/country-release/evidence.server.ts`, `tests/country-release/evidence.test.ts` and `tests/helpers/country-release-data.ts`.

**Interfaces:**
- Produce `readCountryReleaseEvidence(repoRoot:string):Promise<VerifiedCountryEvidence>` and `verifyCountryEvidence(files:ReadonlyMap<EvidenceName,Buffer>):VerifiedCountryEvidence`.
- Consume `readSnapshotFile`/`assertSnapshotPath` from `scripts/country-snapshot-input.ts`, `validateRetainedAssessment`/`projectRetainedAssessment` from `src/lib/country-preview/project.server.ts`, and the existing serializers for agreement checks.
- Helper exports `makeCountryReleaseEvidenceFixture():ReadonlyMap<EvidenceName,Buffer>` and `makeCountryReleaseMetadataFixture():CandidateMetadata`. Keep every fixture visibly synthetic; mock fixed contract pins/projection only inside tests, following the existing loader-test pattern. No production pin override, source selector or fixture CLI is added.

The fixed table must contain these ten bodies. All hashes are lowercase SHA-256:

| Logical name | Existing input path | Bytes | SHA-256 |
| --- | --- | ---:| --- |
| `assessment.json` | `data/backups/canada-country-audit/snapshot-classifications-2026-10-12-r1/snapshot-assessment.json` | 858857 | `2cad0dcabf353b8aec0d365bb247e5d976712a7a1ebc90cac26694322503d9f8` |
| `classification-ledger.json` | `docs/data-validation/1220-snapshot-classification-evidence.json` | 487985 | `afde19b1384c0cbab8cb2f7bbbc5ed8253bc636bb7a35c6b8d5d3c599a1010fd` |
| `bulk-report.json` | `data/backups/canada-country-audit/bulk-diagnostic-2026-10-11-r1/bulk-report.json` | 91396 | `7a306222bf6be80eae1c938341661e353b08cb4a5ab4e50c6466702f704ad00c` |
| `original-manifest.json` | `data/backups/canada-country-audit/bulk-diagnostic-2026-10-11-r1/original-manifest.json` | 51828 | `66acdc59057211575cf8b659f853460e1d279d624677f41fd880da6827865535` |
| `offline-replay.json` | `data/backups/canada-country-audit/bulk-diagnostic-2026-10-11-r1-offline-inventory-128/offline-replay.json` | 139962 | `9157869192cef9b14d542de8ce772ddea146167dbe7d510aa45eb4919735ca6d` |
| `inventory-review.json` | `.tmp/canada-inventory-independent-review-20261011/independent-inventory128-receipt.json` | 228778 | `0279468121f2164f007b0338f0ff5cd9babc49c67e16cf31cfbd6e28c3d20927` |
| `classification-review.json` | `.tmp/canada-classification-review-20261012/independent-classification-review-receipt.json` | 81421 | `5e4232f871674d07d902998b743335f0331fd0224d970295fd0d23168aab3e7a` |
| `citation-correction.json` | `.tmp/canada-classification-review-20261012/citation-correction-receipt.json` | 36634 | `40b245d0ab0e12c9875b8fed2178b76b75af5c01955de1f944a3fcc94f1739ca` |
| `calculation-review.json` | `.superpowers/sdd/2026-10-11-canada-archive-snapshot/independent-qualified-calculation-receipt.json` | 57268 | `62864ebf3c55e0b01fe1e6114e3413c0674effa1fad19a0842103c1d9859c547` |
| `continuity-evidence.json` | `docs/data-validation/1220-classification-continuity-evidence.json` | 150904 | `12bfab9a0638a24c4cfd399d3235064ad0e28a8037670c244a2ee7d3ecf9492d` |

Derived `research-data.json` is `Buffer.from(JSON.stringify(projection)+'\n','utf8')`: 33716 bytes, SHA-256 `33c7db7ec421bddaa13e36c3b2e32cd4558aa041fe17f2f3da01285b62b08fd0`. There is no read of a historical projection file in production.

- [ ] Write `authenticates_exact_fixed_evidence_and_preserves_qualifications`: assert ten authenticated files; 48 months; 20 categories; 17 eligible/three excluded; each reference grid 41/7; publication 7/41; historical flags false. Synthetic expectations remain hand-derived; real pins are checked only in Task 5's local run.

```ts
it('authenticates_exact_fixed_evidence_and_preserves_qualifications',()=>{
  const verified=verifyCountryEvidence(makeCountryReleaseEvidenceFixture());
  expect(verified.files.size).toBe(10);
  expect(verified.projection.directions.imports.monthly).toHaveLength(24);
  expect(verified.projection.directions.exports.monthly).toHaveLength(24);
  const products=Object.values(verified.projection.directions).flatMap(v=>v.products);
  expect(products).toHaveLength(20);
  expect(products.filter(p=>p.comparisonEligible)).toHaveLength(17);
  expect(verified.projection.availability.releaseAccepted).toBe(false);
});
```
- [ ] Write parameterized failures for missing/changed/oversized/extra/crossed members, changed input during read, real reparse ancestor, wrong source processing/ledger, added mismatch, conflicting publication, unsupported scope and an ordinary incompatible candidate. The reader must open only the ten listed JSON files, never ZIPs or original classification bodies.
- [ ] Run `npm.cmd test -- tests/country-release/evidence.test.ts --maxWorkers=2`; observe RED before implementation.
- [ ] Implement the fixed contract and two interfaces. Authenticate bytes before parsing, clone owned buffers before asynchronous use, cross-bind saved review/correction/calculation evidence to the assessment and ledger, then call the existing pure projector. Verify the generated projection identity and display/CSV qualification rules; do not re-run the assessor or research.
- [ ] Run the focused tests and `npm.cmd run check` to GREEN; commit `feat: authenticate fixed Canada release evidence`.

### Task 2: Canonical package and owned preparation

**Files:** Create `src/lib/country-release/package.server.ts`, `src/lib/country-release/prepare.server.ts`, `tests/country-release/package.test.ts`, `tests/country-release/prepare.test.ts`; extend `tests/helpers/country-release-data.ts` only as needed.

**Interfaces:**
- Consume Task 1's evidence and types.
- Produce `packCountryRelease(evidence:VerifiedCountryEvidence,metadata:CandidateMetadata):CountryPackage`, `decodeCountryRelease(bytes:Buffer):DecodedCountryPackage` and `verifyCountryRelease(decoded:DecodedCountryPackage):VerifiedCountryEvidence`.
- Produce `prepareCountryRelease(options:{repoRoot:string;outputDir:string;metadata:CandidateMetadata}):Promise<{package:CountryPackage;report:CountryGateReport}>`.
- Use exact output names `candidate.json` and `candidate-report.json` in a fresh directory under `data/backups/canada-country-release/`. A failure after exclusive directory ownership may write bounded `failure.json`; do not remove a caller-owned or pre-existing directory.

- [ ] Write `round_trips_exactly_eleven_members`: check original byte equality, ordered descriptors, generated projection, all limits, fixed metadata and canonical base64. Test malformed UTF-8/JSON, unknown schema/fields, duplicate/extra/missing members, traversal/link-like member names, inconsistent descriptor lengths/hashes, encoded-size excess before decoding and total size excess. Require canonical serialization so duplicated JSON keys or whitespace variants do not become silently accepted packages.

```ts
it('round_trips_exactly_eleven_members',()=>{
  const evidence=verifyCountryEvidence(makeCountryReleaseEvidenceFixture());
  const packed=packCountryRelease(evidence,makeCountryReleaseMetadataFixture());
  const decoded=decodeCountryRelease(packed.bytes);
  expect(decoded.files.size).toBe(11);
  for(const [name,body] of evidence.files)expect(decoded.files.get(name)).toEqual(body);
  expect(decoded.files.get('research-data.json')).toEqual(
    Buffer.from(JSON.stringify(evidence.projection)+'\n','utf8'));
});
```
- [ ] Write `preparation_never_self_approves`: valid preparation reports gates 1–5 passed and gates 6–7 pending, status `verification-pending`; no accepted path is read/written. Reject candidate-embedded eligibility/review/approval fields. Fixture packages remain `fixture-only` and cannot become real eligible releases.
- [ ] Write occupied/escaped/reparse/missing-parent output and interrupted-write cases. A file created by another actor between preflight and reservation prevents ownership; a changed input before packaging is reauthenticated. Output contains the same eleven bodies and no raw ZIP or normalized source-row payload.
- [ ] Run `npm.cmd test -- tests/country-release/package.test.ts tests/country-release/prepare.test.ts --maxWorkers=2`; observe RED.
- [ ] Implement the country codec with explicit property order, fixed logical names, canonical base64 and SHA-256 from native crypto. Do not modify the product codec. Validate bounded inputs before allocation; reconstruct and compare canonical serialized bytes on decoding. Reauthenticate evidence during packing and generate projection from its authenticated assessment.
- [ ] Implement fresh contained directory reservation and exclusive file writes, reusing the existing path-safety conventions. A package write alone never means complete preparation. Save the partial gate report only after readback verifies the exact package bytes.
- [ ] Run focused tests and type checks to GREEN; commit `feat: prepare bounded Canada release candidates`.

### Task 3: Portable recovery and complete eligibility reporting

**Files:** Create `src/lib/country-release/recovery.server.ts`, `tests/country-release/recovery.test.ts`; extend `src/lib/country-release/types.ts` and `tests/helpers/country-release-data.ts` with the proof fixture.

**Interfaces:**
- Consume Task 2's decoder and verifier.
- Produce `recoverCountryCandidate(options:{repoRoot:string;candidateFile:string;outputDir:string}):Promise<CountryRecoveryReceipt>` and `sealCountryEligibility(candidate:DecodedCountryPackage,proof:CountryVerificationProof):CountryGateReport`.
- Recovery writes only `candidate.json`, `research-data.json`, `recovery-receipt.json` in a fresh contained directory under `data/backups/canada-country-release/`; it does not create selected state.
- Produce `parseCountryVerificationProof(value:unknown):CountryVerificationProof`. The proof is a trusted operator's record of actual independent/check outcomes, not a claim inside the candidate. The real record is created only after Task 5's checks/review/CI; it cannot be synthesized by preparation. Reject unsupported/missing fields, failed/unresolved review, incorrect candidate/processing/policy bindings and false preservation or failed check results.
- Test helper exports `makeCountryVerificationProofFixture(candidate:DecodedCountryPackage):CountryVerificationProof` for deliberately plausible synthetic proof, and `makeCountryReleaseWorkspaceFixture(packageBytes:Buffer):Promise<{repoRoot:string;candidateFile:string;outputDir:string;outcomeFile:string;dispose:()=>Promise<void>}>`. The latter creates only an owned temporary test workspace/input package, with a fresh recovery output; its teardown removes that owned root only. Neither helper creates real approval or selected state.

- [ ] Write `recovers_without_historical_workspace_paths`: package recovery succeeds with embedded historical paths nonexistent/inaccessible, records zero historical-path reads, regenerates the identical projection and four serializers, and leaves no selected pointer. Observe source reads: only the provided package may be opened; evidence members are verified in memory.
- [ ] Write `changed_package_fails_before_recovery_output` and `review_proof_is_required_for_eligibility`: prove byte changes after earlier validation fail; missing/wrong/stale candidate proof leaves gate 7 pending or failed and can never return `eligible`. A fixture remains `fixture-only` even with plausible proof. Proof metadata is an audit trail for the trusted operator, not independent authentication of CI or owner consent.

```ts
it('synthetic_proof_does_not_make_a_fixture_eligible',()=>{
  const packageBytes=packCountryRelease(
    verifyCountryEvidence(makeCountryReleaseEvidenceFixture()),
    makeCountryReleaseMetadataFixture()).bytes;
  const candidate=decodeCountryRelease(packageBytes);
  const report=sealCountryEligibility(candidate,makeCountryVerificationProofFixture(candidate));
  expect(report.status).toBe('fixture-only');
  expect(()=>parseCountryVerificationProof({})).toThrow();
});
```
- [ ] Test failed recovery receipt, occupied/escaped/linked output, incorrect projection bytes, wrong recovery digest and attempted accepted-state restoration through the candidate API. Recovery failure never creates or selects an accepted release.
- [ ] Run `npm.cmd test -- tests/country-release/recovery.test.ts --maxWorkers=2`; observe RED.
- [ ] Implement recovery using bounded package reads, in-memory pinned evidence verification and regenerated projection comparison. Never open receipt-internal paths, fetch their URLs or require original scratch folders.
- [ ] Implement sealing only when all seven gates pass, real-source evidence is authenticated and the exact recovery/operator proof is bound to the package. The caller/operator must verify external review/CI results before supplying the record; software cannot assert those results from a Boolean in the package.
- [ ] Run focused tests and type checks to GREEN; commit `feat: verify portable Canada candidate recovery`.

### Task 4: Tested local selection and accepted-state recovery

**Files:** Create `src/lib/country-release/selection.server.ts`, `tests/country-release/selection.test.ts`; define the listed selection types/error in `src/lib/country-release/types.ts`.

**Interfaces:**
- Consume the decoder, evidence verifier, proof parser and eligibility sealer; re-run them at selection rather than trusting a cached object.
- Produce `selectLocalCountryRelease(options:{repoRoot:string;candidateFile:string;proof:CountryVerificationProof;approval:CountryApproval;outcomeFile:string}):Promise<CountrySelectionOutcome>`.
- Produce `readSelectedCountryRelease(repoRoot:string):Promise<{pointer:CountryCurrentPointer;record:CountryAcceptanceRecord;projection:CountryPreview}>` and `recoverSelectedCountryRelease(options:{repoRoot:string;candidateFile:string;recordFile:string;selectionReceiptFile:string;expectedPointer:CountryCurrentPointer;outputDir:string;recoveryAuthorization:CountryApproval}):Promise<CountryRecoveryReceipt>`.
- Default real state is only `data/countries/1220/processed/`, with `releases/<id>/candidate.json`, `acceptance.json`, bounded `current.json`, an exclusive `.accept.lock` and owned temporary pointer. Accepted-state recovery reconstructs this layout under `outputDir/data/countries/1220/processed/`, so the reader can verify it with `repoRoot=outputDir`; selecting it as actual current in the original workspace is a separate explicit selection operation.
- Add no executable acceptance command, workflow option, site consumer or automatic activation. All selection writes exercised during this implementation use isolated synthetic temporary state. Tests may mock the authenticated-candidate boundary to exercise storage outcomes; the production boundary always rejects synthetic/unauthenticated data. Add no production test bypass or relaxed source pin.

- [ ] Write `selection_requires_explicit_exact_candidate_approval`: reject missing/wrong approval digest, wrong scope, missing/ineligible proof, fixture input, implicit initialization and mismatched prior pointer before state mutation. Assert package preparation, report sealing and candidate recovery alone perform no selection.

```ts
it('fixture_input_cannot_create_selected_state',async()=>{
  const packed=packCountryRelease(verifyCountryEvidence(makeCountryReleaseEvidenceFixture()),
    makeCountryReleaseMetadataFixture());
  const candidate=decodeCountryRelease(packed.bytes);
  const proof=makeCountryVerificationProofFixture(candidate);
  const report=sealCountryEligibility(candidate,proof);
  const workspace=await makeCountryReleaseWorkspaceFixture(packed.bytes);
  const approval:CountryApproval={scope:'local-selection-only',actor:'owner',
    approvedAt:'2026-10-12T00:00:00.000Z',candidateDigest:packed.digest,
    eligibilityReportDigest:{bytes:Buffer.byteLength(JSON.stringify(report)+'\n'),
      sha256:createHash('sha256').update(JSON.stringify(report)+'\n').digest('hex')},
    baseline:{kind:'initialize'}};
  try{
    await expect(selectLocalCountryRelease({repoRoot:workspace.repoRoot,
      candidateFile:workspace.candidateFile,proof,approval,outcomeFile:workspace.outcomeFile})).rejects.toThrow();
    await expect(lstat(resolve(workspace.repoRoot,'data/countries/1220/processed/current.json')))
      .rejects.toMatchObject({code:'ENOENT'});
  }finally{await workspace.dispose();}
});
```
- [ ] Write initialization, same-month repeat/new package, already-selected idempotence, occupied release directory, stale baseline, concurrent cooperating writer and held/stale lock cases. An existing lock is never forcibly removed. Copy/verify immutable release files before pointer change; an unreferenced approval record is not confirmed selected state.
- [ ] Write the Review Focus fault cases: input swapped after validation, ancestor becoming a reparse, locked Windows destination, rename failing before replacement, rename taking effect but throwing, inaccessible/different readback, acknowledged replacement followed by failed outcome write. Use real temporary filesystem operations plus narrow `node:fs/promises` fault mocks; preserve and compare the old pointer bytes in every confirmed failure.
- [ ] Write `restoring_an_approved_candidate_is_not_accepted_recovery`: accepted-state recovery requires exact recorded selected identity, valid approval/proof and selection evidence plus explicit authorization; no newest-file discovery or fallback. Validate wrong record/receipt/package/expected pointer and incomplete recovery. Candidate-only recovery remains candidate-only.
- [ ] Run `npm.cmd test -- tests/country-release/selection.test.ts --maxWorkers=2`; observe RED.
- [ ] Implement bounded state reads, fixed relative reference validation and exclusive staging. Under the owned lock, re-read and compare the expected pointer, replace via same-filesystem rename, then persist a safe outcome. A successful rename is acknowledged even if subsequent current-state verification fails; use `currentStateVerified:false`. A thrown/uncertain write is resolved only through validated readback. A failed outcome-file write throws `CountrySelectionReceiptError` carrying the known outcome, with no automatic rollback.
- [ ] Release only owned locks/temporary files; retain unreferenced release artifacts for deliberate recovery. The lock serializes cooperating writers and makes no claim about arbitrary external writes. Accepted readers require the full policy/proof/record set, never fallback or fixture data.
- [ ] Run focused tests and type checks to GREEN; commit `feat: guard local Canada release selection`.

### Task 5: Offline commands, real candidate evidence and integration review

**Files:** Create `scripts/prepare-country-release.ts`, `scripts/recover-country-release.ts`, `tests/country-release/cli.test.ts`, `docs/validation/canada-release-candidate.md`; modify `package.json` and `README.md`. Keep proposed operator/checking helpers and resulting artifacts in a newly owned ignored directory, not Git.

**Interfaces:**
- `resolveCountryReleasePrepareOptions(args:string[],repoRoot:string):{repoRoot:string;outputDir:string;preflight:boolean}`; `runCountryReleasePrepare(options:ReturnType<typeof resolveCountryReleasePrepareOptions>):Promise<{exitCode:0|1;candidateDigest:Digest|null}>`.
- Preparation accepts only required `--output` and optional `--preflight`; derive packaging commit from the current Git HEAD, release UUID and UTC preparation time locally. Preflight checks safe paths/availability without creating output. No API key, source/digest override, fixture, accept, publish or R2 option.
- `resolveCountryReleaseRecoveryOptions(args:string[],repoRoot:string):{repoRoot:string;candidateFile:string;outputDir:string}`; `runCountryReleaseRecovery(options:ReturnType<typeof resolveCountryReleaseRecoveryOptions>):Promise<{exitCode:0|1;receipt:CountryRecoveryReceipt|null}>`.
- Recovery accepts only `--candidate` and `--output` inside the allowed workspace/backup namespace. CLI entry guards require Node 24 and fixed safe diagnostics.
- Add scripts `data:prepare-country-release` and `data:recover-country-release`, each invoking its CLI via existing `node --import tsx`; no `.env` or storage connection is needed.

- [ ] Write argv/Node-version/duplicate/unknown/escaped path tests, preflight no-write behavior, preparation's pending status and recovery's candidate-only status. Prove neither CLI can reach local selection, remote SDK, network, ZIP/decompression, product import or publication operations. Run the CLI tests to RED.

```ts
it('preparation_has_no_acceptance_flag',()=>{
  expect(()=>resolveCountryReleasePrepareOptions([
    '--output','data/backups/canada-country-release/run-1','--accept'
  ],process.cwd())).toThrow();
});
```
- [ ] Implement the thin commands and operator README: evidence/output prerequisites, source qualifications, pending/eligible/accepted distinction, candidate recovery and safe diagnosis; state explicitly that there is no real acceptance command in this milestone. Include the actual seven gates and later acceptance/storage/publication decisions.
- [ ] Run all new `tests/country-release` tests, the full `npm.cmd test -- --maxWorkers=2` suite and `npm.cmd run check`. Build ordinary fixture output and run the existing boundary browser check; run the six existing Canada fixture browser tests. Keep build runs sequential because they share Astro caches. Commit the complete implementation before the real candidate run.
- [ ] Before the real run, create only the fixed `data/backups/canada-country-release/` parent if missing, after checking containment and non-reparse ancestors; revalidate it after creation. Preflight itself creates nothing. Prepare one real candidate in a fresh ignored child output using the fixed ten files; record its exact package bytes/hash, eleven member identities, packaging commit and gate report. The two later gates remain pending until their evidence exists. No real pointer is created.
- [ ] Recover that package into a fresh directory with the original input locations unavailable to the recovery invocation; prove recovery reads only the candidate and the generated output. A separate checker uses authenticated packaged data and integer arithmetic to compare all 48 monthly values, 20 summary/order pairs, periods/denominators, 17 comparison results/three exclusions and four CSVs. Compare the prototype baseline and all 11 protected identities. Do not re-open raw ZIPs or re-run closed classification research.
- [ ] Record actual preparation/recovery footprint and safe receipt identities in the validation document. Restore ordinary accepted-product `dist` with preview mode unset and measure file count/total/largest asset. Verify no retained country observations leak into that build and the existing local Canada preview remains usable. Commit this pre-integration validation record before requesting the immutable whole-branch review.
- [ ] Request one fresh whole-branch review of immutable code and the real verification receipts. Root resolves meaningful findings with focused RED/GREEN checks. Use standing merge authority once final-head GitHub CI passes; attach the created PR and verify the merged tree matches the tested tree.
- [ ] Record the actual independent review, checks/CI and unchanged-runtime proof in `CountryVerificationProof`, then call the eligibility sealer for this exact candidate. If implementation fixes changed runtime code after preparation, supersede the candidate with a freshly prepared/verified one rather than attach unrelated proof. Documentation-only changes can be bound by an explicit tracked-file comparison. Keep candidate and complete gate report unaccepted, with historical/source availability flags false and the real country pointer absent.
- [ ] Finalize the post-integration proof and complete gate report in the owned ignored candidate workspace; record final review/CI/merge outcomes on the PR. Deliver the candidate digest/report/recovery proof and concise acceptance instructions, and stop at the candidate-specific acceptance boundary. The tracked validation record already contains the pre-integration measurements; no additional post-merge documentation commit is required. No separate acceptance/storage/publication operation is authorized by completing this plan.

## Plan self-review and handoff

Before implementation, check every spec requirement against Tasks 1–5; check all Interfaces/type names, exact eleven member bindings/limits and each Review Focus test. The raw-source archive, public consumer/routes, country R2 namespace and activation operations remain explicit later gates, not missing tasks in this offline milestone. Placeholder, path/link and pin/size checks must pass for this plan itself; do not run runtime tests for a documentation-only planning change.

Owner plan review is still required. If approved, use the preserved root-native execution method and one independent whole-branch review. A later real acceptance request will refer to a concrete candidate identity and complete verification record; this plan does not grant that request in advance.
