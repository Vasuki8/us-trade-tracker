# Canada Private Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Safely preserve the accepted Canada state and complete fixed source collection in private R2, with fresh-runner recovery before archive initialization.

**Architecture:** A pinned source manifest describes 766 immutable bodies. A bounded country-only bundle carries local acceptance and owner authority. Main-only workflows mint conditional upload URLs and verify remote streams/isolated accepted recovery before a separate conditional archive pointer.

**Tech Stack:** Existing Node 24/TypeScript/Vitest/S3 SDK, matching S3 request presigner, GitHub Actions, private R2 Standard.

**Spec:** [Canada private archive design](../specs/2026-10-12-canada-private-archive-design.md).

**Authority/execution:** Owner's permission to complete required work covers this scoped design, plan, implementation and operations. Root implements in the existing checkout on `codex/canada-private-archive`; preserve the established root-implementation/subagent-review preference and avoid copying the private 8 GB collection into another checkout. One fresh whole-branch review precedes merge. Live operator steps follow merge because manual workflows must exist on main.

## Global Constraints

- Policy `canada-private-archive-v1`; country `1220`; fixed September 2024–August 2026 and existing source/acceptance qualifications.
- Manifest `docs/data-validation/1220-preservation-manifest.json`: 181256 bytes, SHA `d67abbcb1e666a4b4f2a51eefbfe8c1efc564c924c7acf944375e6fa640b84ba`, 766 files, 7944428339 source bytes.
- 1024 entries/512 KiB manifest/512 MiB source object/8 GiB source total/12 MiB bundle/64 KiB records/16 KiB pointer/4 MiB capabilities; concurrency two; per-object ten minutes; total three hours; capability lifetime three hours.
- Exactly six bundle names in the spec; existing country package/approval/pointer are immutable, production accepts only authenticated real-source selection.
- No product-key changes, source fetching/decompression, new countries/history, public delivery, credentials/access expansion, paid service, schedule or deployment.
- Current R2 selection initialization only; same exact selection is idempotent, different existing selection conflicts.
- Account-wide free-capacity/access confirmation precedes live transfer. Historical/local availability remains separate from archival/publication.

## Review Focus

1. A valid uploaded metadata hash with changed object bytes must fail full-stream verification — Task 4.
2. A signature missing `if-none-match` must never authorize an overwrite — Task 3.
3. Uploaded accepted state with another approval/pointer identity must not restore/select merely because candidate bytes match — Task 2/4.
4. A network error after pointer persistence must resolve through authenticated readback, without a guessed rollback — Task 4.
5. Capability/private file paths or URLs must not appear in logs/artifacts intended for public site output — Task 3/5.

## File map and interfaces

Create `src/lib/country-archive/types.ts`, `contract.server.ts`, `sources.server.ts`, `bundle.server.ts`, `transport.server.ts`, `upload.server.ts`, `verify.server.ts`; `scripts/country-archive.ts`; `tests/country-archive/{sources,bundle,transport,upload,verify,cli}.test.ts`; `tests/helpers/country-archive-data.ts`; two workflow files; small operator README/validation updates. Modify package manifests only for dependency/command. Keep existing country-release and product/archive implementations unchanged.

Shared types: `Digest` from country-release; `SourceEntry={id,path,bytes,sha256,role}`; `SourceManifest={schemaVersion:1,policyId,countryCode:'1220',reporting:{from,to},sourceBytes,files:SourceEntry[]}`; `ArchiveRef=Digest&{key:string}`; `CountryArchivePointer={schemaVersion:1,policyId,countryCode:'1220',releaseId,sourceManifest:ArchiveRef,bundle:ArchiveRef,localPointerDigest:Digest}`. `ArchiveStore` supplies bounded compact `get(key,maxBytes)`/conditional `put(key,bytes,{ifNoneMatch:'*'})` and `verifyStream(key,expectedDigest)`; never buffers large source objects. Verification outcome separates recovery success from `initialized|confirmed-by-readback|already-selected|unchanged|conflict|unconfirmed`. Capabilities bind exact source-index/bundle identities and per-object `key,path,bytes,sha256,url,headers`.

### Task 1: Pinned sources and streaming integrity

**Files:** types/contract/sources modules, source tests/helper.
**Interfaces:** `loadCountrySourceManifest(repoRoot):Promise<{manifest:SourceManifest,bytes:Buffer,digest:Digest}>`; `parseCountrySourceManifest(bytes):SourceManifest`; `verifyLocalSource(repoRoot,entry):Promise<void>`; fixed source/bundle/current key builders.

- [ ] Write failures for changed index bytes, extra schema fields, duplicate/conflicting IDs/paths, unsafe sizes, expanded scope, escaping/reparse paths, truncated/grown/mutated sources. Synthetic pins are overridden only through test mocks.
- [ ] Run source tests RED; implement strict canonical index authentication and 256 KiB streaming hashes with before/after file identity checks.
- [ ] Run source tests and tool types GREEN; commit the authenticated manifest/contract.

### Task 2: Accepted bundle and explicit owner record

**Files:** bundle module/tests, helper additions.
**Interfaces:** `prepareCountryArchive({repoRoot,outputDir,operatorInstruction}):Promise<{bundleFile,bundleDigest,sourceManifestDigest,localPointerDigest}>`; `decodeCountryArchive(bytes):DecodedArchive`; `restoreCountryArchive({repoRoot,bundleBytes,outputDir}):Promise<{root,receipt,pointerDigest,projectionDigest}>`.

- [ ] Write canonical round-trip, missing/duplicate/extra/oversized/base64/changed-member failures; rejected synthetic or crossed approval/report/pointer/receipt; no source path traversal; isolated exact accepted recovery using explicit owner authority.
- [ ] Run bundle tests RED; implement six-member package, fresh private output, root-supplied owner record and existing accepted-state restoration API. Never modify original selected state.
- [ ] Run bundle/source tests GREEN and inspect unchanged protected identities; commit.

### Task 3: Conditional capability transport and local uploader

**Files:** transport/upload modules and tests; SDK presigner dependency.
**Interfaces:** `createCountryArchiveStore(config):ArchiveStore`; `createCountryUploadCapabilities({config,sourceManifest,bundleDigest,localBundlePath,now}):Promise<Capabilities>`; `uploadCountryObjects({repoRoot,capabilityFile,bundleFile,outputDir}):Promise<UploadReceipt>`.

- [ ] Write signed conditional-header assertions, fixed host/key/path/header validation, expired/tampered capabilities, changed local files, 412 existing-object handling, partial/timeout/redirect/truncated stream, two-stream bound and sanitized diagnostics tests.
- [ ] Run RED; add matching-version presigner and implement specific immutable keys, required signed headers, no redirects, deadlines and bounded local streaming. No pointer-write capability exists.
- [ ] Run GREEN and inspect no URL/secret leakage in diagnostics; commit.

### Task 4: Full remote recovery before initialization

**Files:** verify module/tests; transport tests.
**Interfaces:** `verifyCountryArchive({store,repoRoot,outputDir,bundleDigest,initialize:boolean}):Promise<ArchiveVerificationReceipt>`; `verifySelectedCountryArchive({store,repoRoot,outputDir}):Promise<ArchiveVerificationReceipt>`.

- [ ] Write zero-pointer-write tests for missing/corrupt/truncated source or invalid bundle/owner record, full stream verification despite matching metadata, exact isolated recovery/backup bindings, existing identical/different selection, uncertain PUT/readback and receipt persistence failures.
- [ ] Run RED; implement source-index/bundle authentication, all-source stream hashing, accepted recovery, and conditional initialization only after those pass. Selected verification uses read-only store behavior.
- [ ] Run full archive suite and types GREEN; commit.

### Task 5: Manual workflows, CLI and local acceptance evidence

**Files:** CLI/tests, `.github/workflows/canada-archive-capabilities.yml`, `.github/workflows/verify-canada-archive.yml`, package commands, README, `docs/validation/canada-private-archive.md`.
**Interfaces:** `npm run data:country-archive -- prepare|capabilities|upload|verify|verify-selected ...` with exact bundle SHA/bytes and fresh output, fixed country/manifest, explicit owner text for prepare; workflow bundle metadata only, no source bodies in inputs.

- [ ] Write CLI refusal of unknown flags/modes, unsafe output, fake yes-like authority and write modes during selected verification; workflow tests for main/private guards, existing secrets only in transport steps, explicit concurrency/timeouts, short private artifacts and no capability logs.
- [ ] Run RED; implement thin CLI plus workflows using repository's pinned action versions. Capability artifact expires after one day; verification artifact after seven days; preserve full receipts.
- [ ] Run unit/type/browser checks and normal build/report; preserve 11 protected identities, clean default-build exclusion and fixture provenance. Commit actual local evidence.
- [ ] Self-review spec coverage/interfaces, run one fresh whole-branch review, resolve Important/Critical findings with RED/GREEN in one pass, run final CI and merge under standing permission.

## Live operator phase after merge

1. Verify account capacity and existing secret-backed workflow access. Preserve current local pointer and coffee/R2 identities.
2. Prepare one fresh real bundle/owner record; record hashes. Dispatch capability workflow on exact main and authenticate its private downloaded artifact.
3. Stream the 766 original/output objects, fixed index and compact bundle from this machine. Preserve all per-object outcomes; no overwrite/deletion or provider refetch.
4. Run a fresh runner's verify/initialize for those exact identities, inspect real logs/receipts and downloaded output, then run separate read-only selected recovery. Confirm exact source bytes, accepted recovery and selected remote pointer.
5. Preserve operator/CI identities and receipts privately, update the evidence record with actual outcomes, compare all 11 local protected files and coffee pointers. Do not claim remote completion from implementation/CI alone.

The accepted-profile presentation is a following bounded change using the existing renderer/reader. Its design and verification must preserve data bytes and source qualifications; public activation remains gated on this live archive evidence.
