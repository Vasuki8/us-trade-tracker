# Retained Census Releases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the accepted coffee release between hosted imports, detect revisions against that exact baseline, and archive recoverable source data before safely promoting its replacement.

**Architecture:** A bounded JSON bundle retains the prepared release and original raw bytes. A private R2 adapter provides reads and conditional writes; a separate protocol restores the baseline, verifies a candidate, and updates the current pointer after backup. The existing manual GitHub workflow opts into these phases while the website continues reading its local release format.

**Tech Stack:** Existing Node 24, TypeScript, Vitest, Astro/React and Playwright; pinned official AWS SDK v3 for R2; pinned `yaml` development dependency for checking the actual workflow's credential and promotion boundaries.

**Spec:** [Approved retained-release design](../specs/2026-10-08-retained-census-releases-design.md).

## Global Constraints

- "Limit this milestone to HS `090121`, 60 months, the existing manual workflow and private R2 Standard storage."
- "Use the fixed namespace `trade/v1/products/090121/` in one private bucket."
- "Only `current.json` is mutable."
- "Cap the pointer at 16 KiB, manifest metadata at 256 KiB, an individual decoded file at 32 MiB, total decoded file data at 64 MiB, and serialized bundle at 96 MiB to allow base64 overhead."
- "Add `archive_to_r2` and `initialize_archive` boolean dispatch inputs, both defaulting to false."
- "Persistent imports require `main`; initialization is accepted only with archiving enabled and an absent remote pointer."
- "Configure this PUT with `maxAttempts: 1` so an automatic retry cannot obscure a lost successful response."
- "Use GitHub repository secrets `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`."
- "Use repository variables `R2_ACCOUNT_ID` and `R2_BUCKET_NAME` for noncredential settings."
- "Keep the Census secret in its existing import step."
- "The candidate's previous-bundle identity and revision comparison must both use the exact validated baseline restored at the start of that run."
- "Product discovery, deployment, scheduled imports, public bucket access, automatic deletion and additional products remain separate work."

## Review Focus

1. A bucket/authentication failure must not look like an absent current pointer and trigger initialization; Task 2 tests object absence separately from other storage errors.
2. A lost write acknowledgement must not be hidden by SDK retries or called a confirmed conflict; Tasks 2 and 3 test single-send writes and explicit outcome resolution.
3. Plausible checksums with lying sizes, unsafe filenames or mismatched source dimensions must still fail before restoration; Task 1 tests these inputs.
4. An uploaded candidate backup does not establish acceptance, and backup failure must prevent promotion; Tasks 3 and 4 test the receipt requirement and workflow ordering.
5. A changed remote pointer or local baseline must not change which history the candidate claims or compares; Task 3 tests both races and baseline tampering.

---

## File map and shared contracts

| File | Responsibility |
| --- | --- |
| `scripts/census-client.ts`, `scripts/prepare-release.ts` | Retain HTTP status, preserve HSCY 204, reuse paired-table normalization |
| `scripts/archive-bundle.ts` | Pure bundle/pointer encoding, bounds, schemas, original bytes and source agreement |
| `scripts/archive-store.ts` | R2 settings, bounded SDK transport and safe error classification |
| `src/lib/trade/revisions.ts` | Existing overlap/revision calculation shared by importer and archive validation |
| `scripts/archive-release.ts` | Filesystem staging, baseline verification, immutable upload, promotion and local recovery |
| `scripts/archive-inputs.ts`, `scripts/archive-product.ts` | Pure dispatch/input validation and thin command entry point |
| `tests/helpers/archive.ts`, `tests/helpers/archive-store.ts` | Clearly synthetic 60-month request records and conditional in-memory transport |
| `tests/scripts/archive-*.test.ts` | Bundle, transport, protocol, CLI and workflow acceptance |
| `package.json`, `package-lock.json`, `.env.example`, `playwright.config.ts` | Pinned dependencies, archive command, setting names and isolated test preview port |
| `.github/workflows/import-census.yml`, `README.md`, `docs/data-validation/090121-archive.md` | Opt-in phases, backup/recovery instructions and honest verification status |

Task 1 defines these exported contracts in `archive-bundle.ts`:

```ts
type BundleReference = {key: string; sha256: string};
type BundleManifest = {
  schemaVersion: 1; productCode: '090121'; releaseId: string;
  reportingMonth: string; retrievedAt: string; codeVersion: string;
  previous: BundleReference | null;
  files: {path: string; bytes: number; sha256: string}[];
};
type ArchiveBundle = {manifest: BundleManifest; files: {path: string; contentBase64: string}[]};
type BundleInput = {releaseId: string; releaseBytes: Buffer; rawRecords: Map<string, Buffer>; previous: BundleReference | null};
type BundlePackage = {bytes: Buffer; reference: BundleReference};
type DecodedBundle = {manifest: BundleManifest; release: Release; files: Map<string, Buffer>};
type ArchivePointer = {schemaVersion: 1; productCode: '090121'; bundleKey: string; bundleSha256: string};

function packBundle(input: BundleInput): BundlePackage;
function unpackBundle(bytes: Buffer, expectedSha256: string): DecodedBundle;
function encodePointer(reference: BundleReference): Buffer;
function decodePointer(bytes: Buffer): BundleReference;
```

All types are exported. `Release` is the existing type. Keys are full keys within the fixed product namespace, not filesystem paths. Bundle filenames are logical `release.json` and `raw/<direction>-<month>-<HS-or-HSCY>.json`. Validate UUID/month identities and agreement between a bundle's key, release ID and reporting month. Sort manifest/file entries for deterministic packing; preserve the original file bytes.

## Task 1: Recoverable bundles and complete request records

**Files:** Create `scripts/archive-bundle.ts`, `tests/helpers/archive.ts`, `tests/scripts/archive-bundle.test.ts`; modify `scripts/census-client.ts`, `scripts/prepare-release.ts`, `tests/scripts/import-product.test.ts` and `tests/scripts/prepare-release.test.ts`.

**Interfaces:** Produce the bundle contracts above. Extract `normalizeProductResponses(parts: {summary: 'HS' | 'HSCY'; httpStatus: 200 | 204; payload: unknown}[], context: {productCode: string; month: string; direction: Direction}): Observation[]` in `census-client.ts`, used by both live retrieval and bundle source replay. Extend `onRaw` to `(payload: unknown, sanitizedUrl: string, httpStatus: 200 | 204) => Promise<void>`; existing two-argument callbacks remain compatible. `tests/helpers/archive.ts` produces `syntheticCensusFetch({worldDelta?: number; partner204?: boolean}): typeof fetch` and `createArchiveFixture(): Promise<{dataDir: string; input: BundleInput}>`, using existing small Census fixtures and a temporary 60-month import ending `2026-08`. All helper data is synthetic, never live evidence; tests remove only their own verified temporary directories.

- [ ] **Step 1:** Write failing importer and bundle tests with these assertions, plus the adversarial cases below.

```ts
expect(raw204).toMatchObject({httpStatus: 204, payload: null});
expect(rowsFromPartner204.every(row => row.geography === 'world')).toBe(true);
expect(decoded.manifest.files).toHaveLength(241);
expect(decoded.manifest.productCode).toBe('090121');
expect(decoded.manifest.reportingMonth).toBe('2026-08');
expect(decoded.manifest.previous).toEqual(previousReference);
expect(decoded.files.get('release.json')).toEqual(input.releaseBytes);
expect(decoded.files.get(rawName)).toEqual(input.rawRecords.get(rawName));
expect(() => unpackBundle(corruptBytes, expectedHash)).toThrow();
expect(() => unpackBundle(lyingSizeBundle, itsHash)).toThrow(/size|length/i);
```

Name distinct tests for: legacy wrappers without `httpStatus`; explicit HSCY 204 versus absent files/world 204; reordered paired headers; exactly 60 months and all 240 request identities; wrong product/month/direction/measure/query scope; changed labels/status/value with recomputed file hashes; duplicate/missing/extra files; traversal and a release-ID mismatch; noncanonical base64; invalid UTF-8; actual encoded data over its limit despite small declared length; pointer, manifest and bundle bounds; duplicate observations; and rejection of fixture provenance. Compare observations by identity and every field, not array order.

- [ ] **Step 2:** Run `npm test -- tests/scripts/import-product.test.ts tests/scripts/prepare-release.test.ts tests/scripts/archive-bundle.test.ts`. Confirm RED for missing behavior, not an unrelated environment failure.
- [ ] **Step 3:** Implement the declared interfaces. Save successful wrappers with `httpStatus: 200` and partner 204 with null payload before continuing; preserve world-204 failure and abort/lock behavior. Pair and align tables using the existing strict header logic. Validate saved HTTPS Census URLs against the direction, commodity `090121`, month, `HS6`, `DET`, query summary and exact measures; reject credentials, userinfo, fragments and unknown query parameters. Normalize legacy wrappers as status 200. Apply the spec's limits to actual bytes before decoding and verify hashes afterward. Reuse `validateRelease(..., true)` and require the complete 60-month observation window.
- [ ] **Step 4:** Repeat targeted tests and run `npm run check`; require all assertions and zero diagnostics. Review Task 1 independently; fix verified findings and repeat affected checks.
- [ ] **Step 5:** Commit the focused result as `feat: package recoverable Census release bundles`.

## Task 2: Conditional R2 transport

**Files:** Create `scripts/archive-store.ts`, `tests/helpers/archive-store.ts`, `tests/scripts/archive-store.test.ts`; modify `package.json`, `package-lock.json`, `.env.example`.

**Interfaces:** Consume `BundleReference` keys. Produce:

```ts
type WriteCondition = {ifNoneMatch: '*'} | {ifMatch: string};
type StoredObject = {bytes: Buffer; etag: string};
interface ArchiveStore {
  get(key: string, maxBytes: number): Promise<StoredObject | null>;
  put(key: string, bytes: Buffer, condition: WriteCondition): Promise<void>;
}
type StoreErrorCode = 'conflict' | 'unconfirmed_write' | 'write_failed' | 'read_failed';
class ArchiveStoreError extends Error {readonly code: StoreErrorCode;}
type R2Config = {accountId: string; bucketName: string; accessKeyId: string; secretAccessKey: string};
function readR2Config(env: NodeJS.ProcessEnv): R2Config;
function createR2Store(config: R2Config, options?: Pick<S3ClientConfig, 'requestHandler'>): ArchiveStore;
```

Export the types and error class. `S3ClientConfig` comes from `@aws-sdk/client-s3`; the optional request handler enables wire-level tests without permitting callers to override retry or credential settings. The synthetic store implements actual ETag preconditions and allows failure injection; its keys, bytes and call counts are inspectable by protocol tests.

- [ ] **Step 1:** Write failing transport tests against an injected fake HTTP request handler, exercising the real SDK serialization/signing path without network access.

```ts
expect(sentPut.headers['if-match']).toBe('"original-etag"');
expect(initialPut.headers['if-none-match']).toBe('*');
expect(pointerPutCalls).toBe(1); // even when the handler loses its response
expect(await store.get(absentKey, 16 * 1024)).toBeNull();
await expect(store.get(bucketFailureKey, 16 * 1024)).rejects.toMatchObject({code: 'read_failed'});
await expect(store.get(oversizedStreamKey, 16 * 1024)).rejects.toThrow();
expect(error.message).not.toContain(testSecret);
expect(error.message).not.toContain('Authorization');
```

Also cover 403, explicit precondition failure, a transient/transport write with unknown outcome, missing/lying `Content-Length`, missing ETag/body, a stalled stream, and rejection of missing settings, invalid account/bucket names and keys outside the namespace. Only an object `NoSuchKey` response means absence; bucket errors and generic 404s do not initialize an archive.

- [ ] **Step 2:** Resolve a compatible stable `@aws-sdk/client-s3` using the official registry, install with `--save-exact` and retain the lockfile. Run the targeted transport tests and confirm the new behavior is RED. Do not install unrelated runtime packages.
- [ ] **Step 3:** Implement the store with the validated account-derived default-jurisdiction endpoint, `region: 'auto'`, path-style bucket access, explicit credentials, `maxAttempts: 1` and a 30-second bound covering request plus streamed body. Use bounded async iteration rather than unbounded body conversion. Configure request/response checksum options as `WHEN_REQUIRED`; application SHA256 plus verified readback remains mandatory. The SDK defaults and R2 checksum support differ: [AWS integrity settings](https://docs.aws.amazon.com/sdkref/latest/guide/feature-dataintegrity.html), [R2 compatibility](https://developers.cloudflare.com/r2/api/s3/api/). Expose no deletion or bucket-management method. Return only safe, fixed error messages/codes; do not attach raw SDK errors to public exceptions.
- [ ] **Step 4:** Run `npm test -- tests/scripts/archive-store.test.ts` and `npm run check`; require passing wire-level tests and zero diagnostics. Independently review credential handling and conditional-write behavior.
- [ ] **Step 5:** Commit as `feat: add bounded conditional R2 archive transport`.

## Task 3: Baseline restoration, verified candidates and promotion

**Files:** Create `scripts/archive-release.ts`, `src/lib/trade/revisions.ts`, `tests/scripts/archive-release.test.ts`; modify `scripts/prepare-release.ts` to use the extracted revision calculation.

**Interfaces:** Consume Tasks 1–2, `readCurrentRelease` and `validateRelease`. Produce:

```ts
type ArchiveRunState = {
  schemaVersion: 1; reportingMonth: string;
  baseline: null | {reference: BundleReference; etag: string; releaseId: string; releaseSha256: string};
};
type ArchiveCandidate = {schemaVersion: 1; run: ArchiveRunState; reference: BundleReference; bundleFile: 'bundle.json'};
type ArchiveContext = {store: ArchiveStore; dataDir: string; runDir: string};
type BackupReceipt = {artifactId: string; artifactDigest: string};
type PromotionOutcome = {status: 'acknowledged' | 'confirmed_by_readback' | 'conflict' | 'unconfirmed'; reference: BundleReference};

function findRevisedKeys(previous: Release | undefined, next: Release): string[];
function parseRunState(value: unknown): ArchiveRunState;
function parseCandidateState(value: unknown): ArchiveCandidate;
function buildLocalBundle(dataDir: string, baseline: ArchiveRunState['baseline']): Promise<BundlePackage>;
function restoreForImport(context: ArchiveContext, request: {reportingMonth: string; initialize: boolean}): Promise<ArchiveRunState>;
function stageCandidate(context: ArchiveContext, run: ArchiveRunState): Promise<ArchiveCandidate>;
function promoteCandidate(context: ArchiveContext, candidate: ArchiveCandidate, backup: BackupReceipt): Promise<PromotionOutcome>;
function recoverBundle(bundlePath: string, expectedSha256: string, dataDir: string): Promise<{releaseFile: string}>;
```

`findRevisedKeys` lives in `revisions.ts`; extract the existing overlap/value/status/removal algorithm without changing its semantics. State/candidate JSON stays under the explicitly supplied ignored run directory. Backup recovery requires a selected bundle, expected checksum and empty destination; it performs no remote operation and never infers remote acceptance.

- [ ] **Step 1:** Write failing protocol tests that use the synthetic conditional store and separate temporary runner directories.

```ts
expect(await readCurrentRelease(freshRunnerProcessedDir)).toEqual(baselineRelease);
expect(candidateDecoded.manifest.previous).toEqual(run.baseline!.reference);
expect(candidateDecoded.release.revisedKeys).toEqual(expectedRevisedKeys);
expect((await store.get(currentKey, 16 * 1024))!.bytes).toEqual(previousPointerBytes);
expect((await promoteCandidate(context, candidate, receipt)).status).toBe('confirmed_by_readback');
expect(store.pointerPutCalls).toBe(1);
expect(outcomeAfterAcknowledgedPut.status).toBe('acknowledged');
expect(recoveredRelease).toEqual(candidateDecoded.release);
```

Pin these named scenarios: absent pointer without initialization; initialization when a pointer exists; referenced bundle missing/corrupt; older requested reporting month; same-month revision; removed-country revision; changed restored baseline bytes; competing writer after restoration; immutable upload timeout with identical bytes already stored; immutable collision with different bytes; incomplete or corrupt uploaded bundle; missing/invalid backup receipt; lost pointer response with exact/different/unreadable readback; acknowledged PUT followed by unavailable readback; and local recovery requiring explicit selection into an empty target. For every confirmed pre-promotion failure assert that the remote pointer is byte-for-byte unchanged. Do not conflate an unknown write outcome with that claim.

- [ ] **Step 2:** Run `npm test -- tests/scripts/archive-release.test.ts tests/scripts/prepare-release.test.ts` and confirm intended RED.
- [ ] **Step 3:** Implement the protocol. Validate the remote bundle against its pointer key/hash before staging any local pointer. Save the exact baseline identity, ETag, release ID and prepared-file checksum. Verify that immutable local baseline file again when packing the replacement, recompute its revised-key set with `findRevisedKeys`, and require equality with the candidate's metadata. With no baseline require empty `revisedKeys`. For upload collisions/unknown immutable writes, accept only exact downloaded bytes. Read back and verify the staged bundle before returning the candidate. Require a positive artifact ID and valid SHA256 receipt before sending one conditional pointer PUT. Resolve only uncertain write errors with explicit readback; return acknowledged success directly, conflicts as conflicts and unresolved outcomes as unconfirmed. Preserve foreign current pointers and leave unreferenced bundles for manual inspection.
- [ ] **Step 4:** Repeat protocol/importer tests and `npm run check`; independently review state transitions, recovery and revision comparisons.
- [ ] **Step 5:** Commit as `feat: retain accepted Census baselines and safely promote archives`.

## Task 4: Opt-in workflow, backup recovery and full acceptance

**Files:** Create `scripts/archive-inputs.ts`, `scripts/archive-product.ts`, `tests/scripts/archive-workflow.test.ts`, `docs/data-validation/090121-archive.md`; modify `.github/workflows/import-census.yml`, `package.json`, `package-lock.json`, `playwright.config.ts`, `README.md`.

**Interfaces:** Consume Task 3. Produce `parseArchiveDispatch(env: NodeJS.ProcessEnv): {reportingMonth: string; archive: boolean; initialize: boolean}` and `npm run data:archive -- <command>`. Commands are `preflight`, `restore`, `stage`, `promote`, `pack` and `recover`. Service commands use `--data-dir` and `--run-dir`; workflow input values arrive via `REPORTING_MONTH`, `ARCHIVE_TO_R2`, `INITIALIZE_ARCHIVE` and `GITHUB_REF`, never inline expression substitution in shell code. `pack` creates an unaccepted local bundle with no baseline or remote call; `recover` requires `--bundle`, `--sha256` and an empty `--data-dir`, also without credentials or remote calls.

Use `.tmp/archive/run.json`, `candidate.json`, `bundle.json` and `outcome.json` as fixed runner filenames. Validate persisted JSON through Task 3's parsers before use. The entry point stays thin: parse arguments, call the appropriate protocol, save safe state/outcome files and map conflict/unconfirmed outcomes to a nonzero exit. Keep secret values out of logs and state. Read the backup receipt from `BACKUP_ARTIFACT_ID` and `BACKUP_ARTIFACT_DIGEST`; it records the GitHub artifact's digest, which differs from the bundle's SHA256.

- [ ] **Step 1:** Write failing dispatch/CLI acceptance and actual-workflow boundary tests. Install a compatible stable `yaml` as an exact development dependency to parse the checked-in YAML rather than matching text fragments.

```ts
expect(parseArchiveDispatch(validDefaultEnv)).toMatchObject({archive: false, initialize: false});
expect(() => parseArchiveDispatch({...validEnv, ARCHIVE_TO_R2: 'false', INITIALIZE_ARCHIVE: 'true'})).toThrow();
expect(() => parseArchiveDispatch({...validEnv, ARCHIVE_TO_R2: 'true', GITHUB_REF: 'refs/heads/feature'})).toThrow();
expect(serviceFactoryCallsForLocalRecovery).toBe(0);
expect(remotePointerAfterFailedBackup).toEqual(previousPointerBytes);
expect(localPreviewPointerAfterAcceptance).toEqual(originalLocalPointerBytes);
```

Also test invalid boolean/month strings, initialization only with archived imports, no configuration requirement in artifact-only mode, unknown commands/options, invalid receipt settings, cancelled/failed backup preceding promotion, and malformed persisted state. Parse the actual workflow to verify dispatch-only triggering, read-only repository permissions, existing serialized concurrency, Node 24, pinned actions, defaults false, backup before promotion, main/archiving gates, exact artifact file paths and step-scoped secrets. R2 keys belong only to restore/stage/promote steps; Census key only to import. This guards externally meaningful boundaries, not step formatting.
- [ ] **Step 2:** Run `npm test -- tests/scripts/archive-workflow.test.ts` and confirm intended RED.
- [ ] **Step 3:** Implement CLI and workflow phases: credential-free preflight; conditional restore (which checks R2 settings before any Census requests); existing import/validation; conditional stage/upload/readback; candidate bundle backup; then conditional promotion only after successful backup. Supply the backup action's artifact ID and digest to `promote`; make the promotion step's success condition explicit. Preserve the existing artifact-only `census-coffee-release` upload for the default path; use `census-coffee-candidate` for archived bundles. Upload only the exact validated `.tmp/archive/bundle.json` path with `include-hidden-files: true`, never the run directory or a wildcard; the action otherwise excludes hidden paths. Keep seven-day retention. Save and upload a small `census-coffee-promotion` receipt from the exact `outcome.json` path after promotion when available, using an `always()` plus archived-input/receipt-existence gate and the same narrow hidden-file handling. Receipt-upload failure must not imply acknowledged promotion was rolled back. Preserve action pins and the 20-minute timeout. Allow a validated `PLAYWRIGHT_PORT` in the browser config, default `4321`, for a separate acceptance preview. Document candidate backups, checksum recovery, default-jurisdiction bucket/token setup, separate activation, cost assumptions and the two-official-release requirement. [Pinned upload action inputs/outputs](https://github.com/actions/upload-artifact/blob/cf430e030ddbb5b0abf93d22962f4752f3646cd9/README.md).
- [ ] **Step 4:** Run the full suite, type checks and fixture browser acceptance from a clean dependency installation. Reuse existing browser cases; add no unrelated UI tests. Stage the intended source files and copy those working-tree files, using the tracked file list, into `.tmp/archive-acceptance/` under the approved workspace; do not copy ignored data, credentials, dependencies or existing build output. Run `npm ci`, `npm test`, `npm run check`, an explicit fixture `npm run build` and `npm run test:e2e` in that isolated copy, with `PLAYWRIGHT_PORT=4322` and `CI=true` so an existing server cannot be reused. This preserves the owner's actual-data preview. Separately run the offline `pack` command against the retained August data, recover into a fresh ignored directory, and independently compare all file bytes, 9,577 observations and metadata. Record bundle bytes/hash and confirm original `data/processed/current.json` and its release checksum are unchanged. This verifies the actual-data archive format without R2 or Census calls; label it accordingly. If actual local data is unavailable, report that roundtrip as incomplete rather than fabricate it.
- [ ] **Step 5:** Have independent reviewers check the final branch's correctness, recovery and credential/workflow boundaries. Fix verified findings and rerun affected checks. Commit as `ci: verify opt-in Census archive and backup recovery`, push the reviewed implementation branch and create/attach a focused PR. Do not merge, activate R2, add credentials or run the archived workflow without the owner's relevant decision.

## Self-review and execution handoff

Coverage: Task 1 owns schemas, sizes, original bytes and raw-source agreement; Task 2 owns provider compatibility and error/credential isolation; Task 3 owns exact-baseline revisions, concurrency and recovery; Task 4 owns dispatch boundaries, backups, documentation and end-to-end offline evidence. Each Review Focus item has a named owning test. Public publishing, scheduling and live provider configuration are deliberately outside this approved design's implementation scope.

The owner already selected inline implementation with reviewer subagents. Preserve that method; the main agent implements these four sequential tasks and independent reviewers assess each task and the complete branch. Before execution use `executing-plans` and `using-git-worktrees` to establish a suitable isolated branch/workspace while preserving the actual-data preview.

**Status:** Owner approved design and implementation plan on October 8, 2026. All four implementation tasks passed offline verification, independent task reviews and fresh whole-branch review with no remaining findings. PR #3 was created and its implementation commit passed GitHub CI. Executed checks and review limitations are recorded in `docs/data-validation/090121-archive.md`. Merging and live R2 activation remain separate owner decisions; live provider acceptance is unverified.
