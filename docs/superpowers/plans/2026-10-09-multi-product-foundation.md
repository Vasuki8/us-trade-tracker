# Multi-product Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Reuse the verified pipeline and profile for reviewed products without mixing their releases, revision histories or private backups.

**Architecture:** A trusted registry supplies import/publication availability and duty acceptance. Shared path and archive helpers derive separate product storage, preserving coffee's legacy locations. Every production boundary receives an expected product identity; existing research calculations remain shared.

**Tech Stack:** Node.js 24, TypeScript, Astro static output, React, Vitest, Playwright and the existing AWS S3 SDK for private R2.

**Spec:** [Approved multi-product specification](../specs/2026-10-09-multi-product-foundation-design.md).

**Execution:** The user accepted this plan and the recommended native approach with “continue.” Implement in this session, followed by one independent whole-branch reviewer. The tasks depend on the same identity interfaces; one implementer avoids repeated context and coordination. Review subagents and merging after review/checks are already authorized.

## Global Constraints

- Coffee (HS 090121) is the sole real product in this milestone.
- “Existing coffee files, current pointer, archive objects and checksums are not rewritten or relocated during this milestone.”
- Coffee keeps `data/processed`, `data/raw` and `trade/v1/products/090121/`; other products use `data/products/<code>` and `trade/v1/products/<code>/`.
- “Pages and chart data remain on the same static host. CSV and PNG downloads remain browser-generated. R2 remains private backup storage.”
- Archive bundle versions 1 and 2 retain their fields and meanings; new transient run/candidate state uses version 2 with explicit product identity.
- Archive grids remain 60 merchandise months and, when present, 24 duty months. The manual workflow stays globally serialized with two fetch workers.
- “No additional services, accounts, paid dependencies, public deployment or recurring processing are included.” Keep existing package pins and secret boundaries.
- Preserve the 15,000-file planning warning, missing/suppressed values, classification qualifications and weighted duty denominators.
- The broader pilot sector, second real product, discovery/search, cross-product rankings and successive-month launch validation remain separate work.
- Work on `codex/multi-product-foundation` within the authorized workspace, using the established in-place branch fallback if managed worktree creation remains outside writable roots. Preserve canonical data and existing previews; acceptance output uses ignored isolated directories and fresh ports.

## Review Focus

1. Initialization without a baseline: product A's empty run must not stage or promote product B. Task 3 tests this before any remote write.
2. Valid hashes with a wrong product: recomputed checksums must not bypass key/manifest/query/previous-reference identity. Task 2 tests all four boundaries.
3. Legacy coffee root containing `products/`: coffee artifact selection must exclude that subtree; recovery must reject occupied destinations. Tasks 4 and 3 pin these behaviors.
4. Mixed availability: an importable unpublished product must not appear in builds, and a required published release must not silently disappear. Task 5 tests both, plus duty-acceptance enforcement.
5. Ambiguous remote acceptance: a failed backup or stale conditional write must not advance accepted remote pointers, even if the local candidate is valid. Task 3 retains transport fault tests and adds two-product pointer assertions.

## File Responsibilities

| Files | Responsibility |
| --- | --- |
| New `src/lib/trade/product-registry.ts` | Product definitions, reviewed registry and identity/availability checks; no filesystem access |
| New `scripts/product-paths.ts` | Derive local paths and private archive keys from validated HS6 identities |
| `scripts/prepare-release.ts`, `import-product.ts` | Same-product baseline checks and selected-product import |
| `scripts/archive-bundle.ts`, `archive-store.ts` | Product-bound bundle replay, references, pointers and transport |
| `scripts/archive-release.ts` | Versioned state, isolated restore/stage/promotion and offline recovery |
| `scripts/archive-inputs.ts`, `archive-product.ts`, `validate-data.ts`, import workflow | Validated selection, explicit product context and scoped artifacts |
| `src/lib/trade/load-release.ts`, product route and methods page | Published-product loading, fixtures and accurate release labels |
| Tests and new acceptance record | Cross-product failures, legacy recovery, browser checks and measured results |

No existing large module is split solely for cleanup. Registry/path helpers provide the new boundary; existing calculation modules are unchanged unless a scoped defect is demonstrated.

---

### Task 1: Registry, storage paths and same-product imports

**Files:** Create `src/lib/trade/product-registry.ts`, `scripts/product-paths.ts`, `tests/trade/product-registry.test.ts`, `tests/scripts/product-paths.test.ts`, `tests/scripts/product-import.test.ts`, `tests/helpers/product-data.ts`. Modify `scripts/prepare-release.ts`, `scripts/import-product.ts`, `tests/scripts/prepare-release.test.ts`, `.gitignore`.

**Interfaces:**
- `ProductDefinition = {code:string;displayName:string;importable:boolean;published:boolean;dutiesAccepted:boolean}`; export `DEFAULT_PRODUCT_CODE='090121'`, `PRODUCTS:readonly ProductDefinition[]`, `assertProductCode(value:unknown):asserts value is string`, `validateProductRegistry(value:unknown):asserts value is ProductDefinition[]`, and `getProduct(code:string, registry:readonly ProductDefinition[]=PRODUCTS):ProductDefinition`.
- `productDataPaths(workspaceRoot:string, productCode:string):{dataDir:string;processedDir:string;classificationFile:string}` and `productArchiveKeys(productCode:string):{prefix:string;currentKey:string}` in `scripts/product-paths.ts`.
- Extend `readCurrentRelease(dir:string, expectedProductCode:string=DEFAULT_PRODUCT_CODE):Promise<Release>`; `prepareRelease` passes its requested code explicitly.
- Extract `resolveImportOptions(args:string[], env:NodeJS.ProcessEnv, workspaceRoot:string, registry:readonly ProductDefinition[]=PRODUCTS):Promise<Omit<PrepareOptions,'codeVersion'>>`; the CLI supplies the Git processing version and calls `prepareRelease`.
- Test helper `syntheticProductFetch(productCode:string, options?:{scale?:number;worldDelta?:number;duties?:boolean}):typeof fetch` returns sanitized synthetic tables with the requested commodity, distinct descriptions and values. No real requests.

- [x] **Write failing tests.** Pin registry flags/types, duplicates, blank names and malformed codes. Production `PRODUCTS` contains only coffee, with all three availability/acceptance flags true. In a temp workspace, assert:
  ```ts
  expect(productDataPaths(root,'090121').processedDir).toBe(join(root,'data/processed'));
  expect(productDataPaths(root,'090122').processedDir).toBe(join(root,'data/products/090122/processed'));
  expect(productArchiveKeys('090122').currentKey).toBe('trade/v1/products/090122/current.json');
  await expect(readCurrentRelease(coffeeDir,'090122')).rejects.toThrow(/product/i);
  ```
  Prepare both synthetic products in separate roots, revise B, and assert A's pointer/release bytes remain identical and B's revised keys contain only B. Attempt B in A's root with a spy fetcher: rejection, zero requests, original pointer bytes. Repeat failure after a valid B baseline; retain duty-downgrade and worker/lock regressions. Unknown/nonimportable CLI products fail before source retrieval; legacy coffee arguments still resolve.
- [x] **Run red verification:** `npx vitest run tests/trade/product-registry.test.ts tests/scripts/product-paths.test.ts tests/scripts/product-import.test.ts tests/scripts/prepare-release.test.ts`. New assertions fail for missing identity/path behavior, not syntax errors.
- [x] **Implement the interfaces above.** Validate codes as six digits, flags as booleans, published implies importable. Derive paths, never read them from metadata. Resolve registry availability before import. Guard CLI execution with the existing `archive-product.ts` direct-entry pattern so importing the resolver never runs an import. Preserve optional explicit `--classification` behavior and month clipping. Add `data/products/` to Git ignores; leave tracked classification files intact.
- [x] **Run green verification:** the same focused command, plus `npm run check`. All pass with zero diagnostics.
- [x] **Commit:** `feat: isolate reviewed product imports and release histories`.

### Task 2: Bind archive bundles and storage to product identity

**Files:** Modify `scripts/archive-bundle.ts`, `scripts/archive-store.ts`, `tests/scripts/archive-bundle.test.ts`, `tests/scripts/archive-store.test.ts`, `tests/scripts/duty-archive.test.ts`, `tests/helpers/product-data.ts`. Create `tests/scripts/product-archive-bundle.test.ts`.

**Interfaces:** Consume Task 1 code/key helpers. Add expected identity to these existing interfaces:
- `releaseIdFromKey(key:string,expectedProductCode:string=DEFAULT_PRODUCT_CODE):string` and `validateReference(value:unknown,expectedProductCode:string=DEFAULT_PRODUCT_CODE):BundleReference`.
- `encodePointer(reference:BundleReference,expectedProductCode:string=DEFAULT_PRODUCT_CODE):Buffer` and `decodePointer(bytes:Buffer,expectedProductCode:string=DEFAULT_PRODUCT_CODE):BundleReference`.
- `packBundle(input:BundleInput,expectedProductCode:string=DEFAULT_PRODUCT_CODE):BundlePackage` and `unpackBundle(bytes:Buffer,expectedSha256:string,expectedProductCode:string=DEFAULT_PRODUCT_CODE):DecodedBundle`.
- `createR2Store(config:R2Config, options:Pick<S3ClientConfig,'requestHandler'>&{productCode?:string}={}):ArchiveStore` binds the selected namespace, defaulting to coffee for old callers. Existing `ARCHIVE_PREFIX`/`CURRENT_KEY` remain coffee compatibility exports.

- [x] **Write failing tests.** Add `createProductArchiveFixture(productCode:string, options?:{duties?:boolean;scale?:number}):Promise<{dataDir:string;input:BundleInput}>` to the test helper. Exercise merchandise-only and duty-enabled B bundles. Assert B's reference prefix, roundtrip prepared/raw bytes, pointer identity and stable packaging. Reject a wrong expected code and A's previous reference in B. Recompute outer and file hashes after tampering with manifest product, prepared product, merchandise query or duty query; each still rejects. A B-bound store rejects A's pointer/release keys without invoking its request handler. Existing coffee pointer serialization and request limits remain pinned.
- [x] **Run red verification:** `npx vitest run tests/scripts/product-archive-bundle.test.ts tests/scripts/archive-bundle.test.ts tests/scripts/archive-store.test.ts tests/scripts/duty-archive.test.ts`.
- [x] **Implement the interfaces above.** Thread expected identity through private file replay, URL parameter checks and references. Keep envelope fields, scope values, canonical base64, size/hash checks and ordering unchanged. Bind transport key validation and pointer byte limits to the selected `currentKey`; retain conditional writes, bounded streams, deadlines, no PUT retries and secret-safe errors.
- [x] **Run green verification:** the same command and `npm run check`. Existing v1/v2 tests and all new rejection tests pass.
- [x] **Commit:** `feat: validate product-specific archive bundles and namespaces`.

### Task 3: Versioned run identity and isolated archive protocol

**Files:** Modify `scripts/archive-release.ts`, `tests/scripts/archive-release.test.ts`, `tests/scripts/duty-archive.test.ts`, `tests/helpers/archive-store.ts`. Create `tests/scripts/product-archive-release.test.ts`.

**Interfaces:** Canonical `ArchiveRunState` becomes `{schemaVersion:2;productCode:string;reportingMonth:string;baseline:null|{reference:BundleReference;etag:string;releaseId:string;releaseSha256:string}}`. Canonical `ArchiveCandidate` becomes `{schemaVersion:2;productCode:string;run:ArchiveRunState;reference:BundleReference;bundleFile:'bundle.json'}`. `parseRunState(value:unknown,expectedProductCode:string=DEFAULT_PRODUCT_CODE):ArchiveRunState` and `parseCandidateState(value:unknown,expectedProductCode:string=DEFAULT_PRODUCT_CODE):ArchiveCandidate` normalize legacy v1 coffee state to canonical v2; other identities reject it. Add optional `productCode:string` to `ArchiveContext`, defaulting to coffee for old callers; production passes it explicitly. Extend `buildLocalBundle(dataDir:string,baseline:ArchiveRunState['baseline'],expectedProductCode:string=DEFAULT_PRODUCT_CODE):Promise<BundlePackage>` and `recoverBundle(bundlePath:string,expectedSha256:string,dataDir:string,expectedProductCode:string=DEFAULT_PRODUCT_CODE):Promise<{releaseFile:string}>`.

- [x] **Write failing tests.** Initialize two products against the same `MemoryArchiveStore` with separate local/run directories. Assert emitted v2 identities, distinct pointers and preserved A bytes while B stages/promotes. Give an empty B run A's candidate; reject before any PUT. Also reject crossed baseline, legacy v1 state for B and mismatched candidate/context identities. A legacy v1 coffee candidate remains usable after validation. Stale B promotion leaves A untouched and preserves B's competing pointer. Backup failure before promotion leaves both remote pointers intact. Offline wrong-product recovery creates no generated destination; occupied roots, including coffee roots containing `products/`, reject without changing existing files.
- [x] **Run red verification:** `npx vitest run tests/scripts/product-archive-release.test.ts tests/scripts/archive-release.test.ts tests/scripts/duty-archive.test.ts`.
- [x] **Implement the interfaces above.** Validate before local generated-file writes and remote mutations; use the selected key in every restore/promotion/readback. Check candidate baseline and recovered identity against context. Preserve receipts, ETag preconditions, conflict/unconfirmed outcomes, empty-destination rules and revision reconciliation. Update the memory helper's pointer counting to recognize exact product pointer keys while retaining coffee assertions.
- [x] **Run green verification:** the same command and `npm run check`; existing lost-response and receipt-failure tests continue passing.
- [x] **Commit:** `feat: bind archive state and recovery to the selected product`.

### Task 4: Product selection through CLI and manual workflow

**Files:** Modify `scripts/archive-inputs.ts`, `scripts/archive-product.ts`, `scripts/validate-data.ts`, `.github/workflows/import-census.yml`, `tests/scripts/archive-workflow.test.ts`. Create `tests/scripts/product-workflow.test.ts`.

**Interfaces:** `parseArchiveDispatch(env:NodeJS.ProcessEnv,registry:readonly ProductDefinition[]=PRODUCTS):{productCode:string;reportingMonth:string;archive:boolean;initialize:boolean;includeDuties:boolean}`, resolving identity from `PRODUCT_CODE` or coffee. Extend `runArchiveCommand(args:string[],env:NodeJS.ProcessEnv,storeFactory?:(productCode:string)=>ArchiveStore,registry:readonly ProductDefinition[]=PRODUCTS):Promise<unknown>`; add optional `--product` to command parsing without making it required for old invocations. Explicit CLI/environment selections must agree. Default provider creation passes `{productCode}` to Task 2's store.

Preflight exports only derived `product_code`, `data_dir`, `processed_dir`, `classification_file` to `GITHUB_OUTPUT` when supplied. The workflow uses those outputs in step environment/artifact fields, never inline shell source. `data:validate` accepts optional `--product`, defaults to coffee and uses Task 1 path/identity resolution.

- [x] **Write failing tests.** With a trusted injected test registry, assert unknown, malformed, nonimportable and conflicting selections cause zero provider calls; offline pack/verify/recover remain provider-free and reject wrong-product state before writing. Existing coffee invocations still work. Parse the actual workflow: `product_code` input defaults to `'090121'`; permissions/concurrency, pinned actions, two-worker behavior, credential placement, main-only archives, explicit initialization and backup-before-recovery-before-promotion gates remain intact. Assert selected artifact patterns are exactly current pointer, releases and raw records beneath derived paths; a coffee raw glob cannot match `data/products/090122/raw/...`. Validate preflight output derivation with a temporary output file, including a workspace path with spaces.
- [x] **Run red verification:** `npx vitest run tests/scripts/product-workflow.test.ts tests/scripts/archive-workflow.test.ts`.
- [x] **Implement the interfaces above.** Resolve selection before creating a provider. Workflow scripts pass quoted `PRODUCT_CODE`/derived paths; optional classification arguments use the derived file only if present. Artifact names become `census-<validated-code>-candidate`, `census-<validated-code>-promotion`, and `census-<validated-code>-release`. Include hidden bundle/receipt files as before. Do not broaden coffee's artifact path to `data/**/*.json`. Keep the separate coffee duty-audit workflow unchanged in this milestone.
- [x] **Run green verification:** the same command and `npm run check`. Confirm offline verification gets the selected identity despite having no credentials.
- [x] **Commit:** `feat: select reviewed products in the manual Census workflow`.

### Task 5: Generate published profiles with honest fixture separation

**Files:** Modify `src/lib/trade/load-release.ts`, `src/pages/products/[code].astro`, `src/pages/methods.astro`, `tests/fixtures/README.md`. Create `tests/fixtures/product-registry.json`, `tests/fixtures/product-release-090122.json`, `tests/trade/load-release.test.ts`, `tests/e2e/multi-product-profile.spec.ts`.

**Interfaces:** `LoadReleaseOptions={workspaceRoot?:string;mode?:'census'|'fixture';registry?:readonly ProductDefinition[]}`. Extend `loadRelease(productCode:string=DEFAULT_PRODUCT_CODE,options:LoadReleaseOptions={}):Promise<Release>`. Add `loadPublishedReleases(options:LoadReleaseOptions={}):Promise<{product:ProductDefinition;release:Release}[]>`. Mode defaults from validated `TRADE_DATA_MODE`, otherwise Census; registry defaults to `PRODUCTS` in Census mode or the trusted fixture registry in explicit fixture mode. Fixture file names are derived from validated codes: existing coffee `product-release.json`, otherwise `product-release-<code>.json`.

- [x] **Write failing tests.** Fixture registry contains coffee and `090122` labeled “Synthetic second product,” with distinct prepared values: latest fixture world imports `$300`, exports `$600`, and matching internally consistent partner/duty data. Test both published profiles, unknown/unknown-mode rejection, importable unpublished exclusion, missing/wrong-code published release failures and Census rejection of fixture provenance. A v2 published release with `dutiesAccepted=false` fails; v1 remains valid with duties unavailable. Browser checks B's code, display/official descriptions, sample banner, imports/exports, selected-country link, CSV/PNG filenames and CSV product/value metadata. On mobile, no horizontal overflow; keyboard controls and no-JavaScript sample/source labels remain usable. Default homepage/changes/briefing stay coffee-focused.
- [x] **Run red verification:** `npx vitest run tests/trade/load-release.test.ts`; then an explicit fixture build and focused `npx playwright test tests/e2e/multi-product-profile.spec.ts` on an isolated available port. Failures must show missing route/identity behavior, not a reused preview server.
- [x] **Implement the interfaces above.** Product static paths come from `loadPublishedReleases`; route props carry definition and release. Use the registry display name and retain the release's official description. Errors identify the required code. Fixtures never load as a Census fallback. Label `/methods/` release information explicitly as coffee, while general definitions remain shared; each profile retains its own metadata. No directory/search or generalized briefing is added.
- [x] **Run green verification:** the focused loader/browser checks, `npm run check`, and existing coffee browser acceptance against the same fixture build. Keep coffee fixture values intact.
- [x] **Commit:** `feat: build validated profiles from the reviewed product registry`.

### Task 6: Retained-data acceptance, review and integration

**Files:** Create `docs/validation/multi-product-foundation.md`. Modify `README.md`, `docs/data-validation/090121-archive.md`, `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md` and completion checkboxes in `docs/superpowers/plans/2026-10-09-multi-product-foundation.md`. Temporary recovery/evidence/build files remain under ignored `.tmp/multi-product-*`; no canonical data is rewritten.

**Interfaces:** Consume Tasks 1–5; no new runtime API. Record exact tested/reviewed commit, test totals, source hashes, recovery inventory, build measurements and limitations.

- [x] **Capture source identities before acceptance.** Verify canonical pointer `releases/2026-08-5f3c2606-06a0-4c96-8fbc-a2332e0428ae.json` and prepared SHA256 `eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727`. Locate the already retained immutable v1/v2 bundles; verify their known hashes before using them.
- [x] **Run complete checks:** `npm test` and `npm run check`; require zero failures/diagnostics. Build with explicit `TRADE_DATA_MODE=fixture`, then run `npm run test:e2e` with a fresh port and `CI=true`. Record static file metrics. Never reuse a browser server showing different data.
- [x] **Recover actual bundles offline.** Use `data:archive recover --product 090121` into separate fresh destinations. Known v1: `.tmp/archive-offline-2026-10-08/bundle.json`, SHA256 `0de1cb535caf370adaf3da556a9433d6ffd7967e31501d35b9f335c79230a844`. Known v2: `data/backups/duty-r2/37899540773/candidate/bundle.json`, SHA256 `44c03004da6a76b031cd70997491c97221ecc9c0289cf7f9b426e42208394adf`. Compare all 241/337 original file bytes and expected local pointer; perform no Census/R2 calls or remote writes. Reject wrong-product recovery before generated output exists.
- [x] **Build retained Census coffee separately.** Explicit Census mode with output `.tmp/multi-product-live-dist`; verify August 2026 imports `$140,980,739`, exports `$66,393,173`, both monthly/rolling selected-country comparisons and duty CSV against retained observations. Use the previous monthly-comparison acceptance checks as evidence references, adapted only to the separate build. Record file count, total size, largest file and gzip size; compare with baseline 11 files/687,195 bytes. Explain measured changes rather than impose an invented performance threshold. Recheck original pointer/hash.
- [x] **Write acceptance/operator documentation.** Record verified behavior, product selection and code-bearing artifact names, empty recovery destinations, strict build failures, private R2 and second-product limitations. Update launch status without claiming product discovery, real second-product coverage or public deployment. Review placeholders and whitespace; stage only intentional source/test/documentation files.
- [ ] **Commit the tested branch.** Run `git diff --cached --check` before committing; record the resulting immutable head. Request an independent whole-branch review against main, with particular attention to the five Review Focus cases and spec acceptance evidence. Verify and fix actionable findings; rerun affected checks after fixes.
- [ ] **Create/attach PR and integrate.** Push `codex/multi-product-foundation`, create and attach its PR, require GitHub checks for the exact reviewed head, then merge under standing user authorization. Refresh main, verify merge tree matches the tested feature tree and working tree is clean. Report the actual results and remaining launch work; no provider activation/deployment is part of merging.

## Plan Self-Review and Handoff

Registry, local isolation and ignored generated storage map to Task 1. Archive replay and bounded namespace access map to Task 2. Versioned state, legacy compatibility and recovery/acceptance guarantees map to Task 3. Dispatch, scoped artifacts and existing secret/concurrency gates map to Task 4. Publication availability, fixture separation and profile/source labels map to Task 5. All nine spec acceptance items, retained-byte evidence, measurements and independent reviewed integration map to Task 6.

New helpers and signatures are defined above before their consumers. All five Review Focus cases have an owning test cycle. The plan changes the foundation only; real product selection, expanded discovery and deployment remain outside it.

The written specification and this plan are approved. Use native implementation here, followed by independent subagent review of the complete branch.
