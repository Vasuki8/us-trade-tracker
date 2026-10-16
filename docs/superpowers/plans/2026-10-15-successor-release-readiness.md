# Successor Release Readiness Design and Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Root implements; independent subagents audit retained evidence and one fresh reviewer reviews the complete immutable branch before integration. Track steps with checkbox (`- [ ]`) syntax.

**Goal:** Make the existing local publication tools capable of staging explicitly reviewed successor coffee releases, and retain the state required to review and later resume an exact candidate.

**Architecture:** Select coffee inputs through a small contract read from the requested committed source tree, independently of Canada's fixed historical acceptance evidence. Keep the existing staging receipt, package formats and CLI arguments. Extend the existing import backup artifact to contain its candidate state alongside its bundle; reuse the current offline verification and conditional-promotion APIs.

**Tech Stack:** Existing Node 24, TypeScript, Vitest, Astro, Playwright, Python 3.12+ and pinned GitHub Actions. No new dependency or service.

**Spec:** This combined design, the data-foundation and successive-release requirements in `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md`, the existing staging/package contracts, and `docs/validation/monthly-refresh-readiness.md`. The user requested a combined plan and permission envelope for review. This proposal authorizes planning only until approved.

## Outcome and recommendation

The public monthly product comparison milestone is complete. Main is `c889f179f252de359922717e1a68c82835f35f70`; actual operational completion is recorded in `data/backups/monthly-product-changes/deployment-20261015-r1/post-seal-finalization.json` and its final readback. The older public checkpoint's pending archive wording is not unfinished implementation.

Two existing handoffs need correction before the next official update:

1. `scripts/site-staging.ts` obtains the four coffee pointer/release identities from Canada's historical `protectedFiles` and explicitly requires August 2026 filenames. September coffee cannot pass this staging path even if independently accepted. Canada's original evidence must stay fixed.
2. `.github/workflows/import-census.yml` backs up `bundle.json` alone, while the existing `verify` and `promote` commands require `candidate.json`. That state includes the original baseline reference and ETag used for conditional promotion. Re-running an import creates another candidate rather than resuming the reviewed one.

Recommend fixing these two handoffs together. A smaller alternative is to address staging only, leaving exact-candidate review incomplete. Another alternative is another reader feature, such as period-matched duty links from briefings; that is a discoverability improvement rather than a release blocker. Additional reader features and broader intake should follow evidence from users or the next release.

The [official FT900 calendar](https://www.census.gov/foreign-trade/schedule.html), checked October 15, 2026 in America/Toronto, lists September 2026 publication for November 4 at 8:30 a.m. Eastern. Calendar publication is not API coverage or acceptance. This batch uses retained August inputs and synthetic successors; the requirement to update successfully across successive official releases remains open.

## Design

### Coffee selection belongs to the publication source

Create `deployment/site-product-selection.json`, containing a strict version-1 object with `schemaVersion` and `products`. Each product has exactly `code`, `reportingMonth`, `pointer` and `release`; each file identity has exactly `path`, `bytes` and `sha256`. Include exactly the two existing published codes, in registry order: `090121`, then `090111`.

The initial contract records the existing accepted August pointers/releases byte for byte. Copy their four identities from the authenticated prior acceptance record and independently read back the actual files. Do not derive new trusted pins from whatever files happen to be present during staging.

Create the pure parser and types in `scripts/site-product-selection.ts`:

- `SiteProductSelection`: `{schemaVersion:1; products:{code:string; reportingMonth:string; pointer:FileIdentity; release:FileIdentity}[]}`.
- `parseSiteProductSelection(value:unknown):SiteProductSelection`.

Reject unknown/missing fields, duplicate or additional products, invalid months, unsafe or mismatched paths, unsafe integers and invalid hashes. Pointer paths must be the existing product-specific `processed/current.json` paths; release paths must be contained in the same product's `processed/releases/`, have a valid month prefix matching `reportingMonth`, and use the existing safe filename convention. Apply the existing 16 KiB pointer and 16 MiB release bounds. Reuse `validMonth`, product path helpers and existing file-identity types; no general release registry is needed.

Read the contract's exact bytes from `siteSources(sourceRoot, commit)`, not the mutable working copy, data root or an unpinned external file. It is already bound by the existing source inventory's Git blob and SHA256. Future selection changes require a reviewed source commit identifying the actual accepted release; possession of a valid JSON contract is not independent source acceptance or owner permission to promote data.

Products may have different reporting months. Existing application rules decide which older product comparisons are unavailable. The fixed Canada snapshot remains September 2024–August 2026 and continues to describe its own reporting period.

### Integrate without changing package formats

In `scripts/site-staging.ts`, extend `siteData(root, selection)` so an explicit parsed selection authenticates each pointer and release, checks the pointer names the exact selected release, runs existing `validateRelease(value, true)`, and requires release product/month metadata to match the selection. New selections require the existing duty-enabled schema version 2 for these two published duty profiles. A hash match must not excuse invalid release metadata, missing duties or fixture provenance. An explicit null selection is reserved for legacy verification; creation never passes null.

`stageInformation` resolves the selection from committed source before reading coffee data. Add an explicit internal policy argument, `'require-committed' | 'allow-legacy'`, defaulting to `'require-committed'`. Creation uses the default for both initial and final readback. Verification uses `'allow-legacy'` for both readbacks.

Legacy means the requested source commit has no selection file. Only verification may then apply the original, exact August identity/path rules. Missing selection in new creation fails; malformed or changed selection never falls back. This preserves readback of historical version-1 receipts without allowing unpinned successor data. Keep `SiteStageReceipt` schema/version/field shape and `SiteManifest` unchanged: the source inventory already authenticates the selection contract, and `data`/`products` already authenticate the seven actual inputs. No additional served file, runtime flag or CLI option is necessary.

Keep the existing three Canada state files and their selected-pointer, package, acceptance, projection and coverage checks. Do not edit Canada's contracts, original protected identities or historical evidence. Keep clean-source, contained ignored output, non-reparse paths, hardlink rejection, the single bound dependency link, occupied-output rejection and before/after identity checks.

### Retain the exact candidate state

Change the existing backup step's explicit file list to:

```text
.tmp/archive/bundle.json
.tmp/archive/candidate.json
```

Keep the artifact name, seven-day retention, error-on-missing behavior, hidden-file handling, pinned action, permissions, manual dispatch, concurrency and credential boundaries. Add one credential-free `candidate_files` step between successful staging and backup, gated by archive mode on main, that runs `test -s .tmp/archive/bundle.json` and `test -s .tmp/archive/candidate.json`. Both members must exist and be nonempty; the action's no-files-found option alone does not enforce each member. Use no glob or directory upload. `candidate.json` already contains the run/baseline metadata, so a separate `run.json` is unnecessary. Preserve candidate JSON bytes, including its baseline ETag, rather than rebuilding state later.

Keep offline recovery before readiness/promotion, and keep `candidate_only=true` incapable of promotion. Do not add a resume workflow, new dispatch input, credential, approval flag or automatic acceptance. The existing `promote` command remains available for a later operator-authorized exact candidate with the original backup identity and baseline condition.

Document that future operators must preserve both downloaded files, their hashes and the actual artifact ID/digest before expiry, verify them offline, and obtain authorization for that exact candidate before remote promotion. Retaining two files does not create indefinite storage or establish approval. Existing immutable bundle contents, archive formats and prior artifacts remain unchanged.

## Global constraints and permissions

Full approval covers all five tasks without routine approval pauses:

1. Root implementation, independent auditor/reviewer subagents, managed worktree creation/reuse, scoped execution escalations, the existing locked Node 24/Python runtime, fixture tests, local builds, owned loopback previews and package/browser checks. Dependencies and lockfiles remain unchanged.
2. Bounded private copies of the seven existing accepted state files, at most seven files/16 MiB per fresh stage; read-only authentication of the prior proof and eleven protected identities; generated synthetic test data in isolated owned test directories. Preserve original proposal bytes/hash before editing execution checkboxes.
3. Branches/commits, pushes, one implementation PR including local validation/documentation, attaching it to this chat, successful exact-final-head push/PR **Code checks**, independent review, expected-head reviewed merge under standing merge permission, and clean-main binding to tested source. Final integration/archive outcomes are recorded in private completion evidence and the final report, avoiding a second full CI cycle for bookkeeping. Normal Code CI may run; no data-import/archive workflow may be dispatched in this batch.
4. The narrowly specified backup file list and credential-free member-presence check in the existing manual import workflow, plus their owning tests/documentation. No change to workflow triggers, permissions, secrets, job scheduling, remote promotion conditions or archive formats.
5. Proof preservation under ignored `data/backups/successor-release-readiness/verification-20261015-r1`, at most 1,000 files/64 MiB; owned preview shutdown; native worktree archival and actual archived attachment/checkout-absence checks; post-archive completion/readback; cleanup of only this plan's owned caches.
6. Reserve three spare chat-attachment slots before starting, for the managed worktree, single PR and archive headroom. If needed, preserve identity/URL and verify merged status before unlinking up to two obsolete merged PR chat attachments. Actual GitHub PRs remain intact. Recheck capacity before PR creation and archive; queued operations remain pending.

Excluded: Census imports/API/source requests, raw-source replay, R2 reads/writes, remote candidate staging/promotion, accepted local data/pointer replacement, new reporting months/products/countries, Canada refresh, public upload/restoration/live-site verification, new dependencies/services, paid/access/indexing changes, outreach, analytics and recurring jobs. Editing future workflow behavior does not authorize running its data operations. This tooling-only milestone requires no site publication.

Pause dependent work only for an unexplained source/input change, integrity failure or a new material cost/access/sign-in/terms boundary. Complete unaffected work. If a fix would require widening a format or authorization boundary beyond this design, present that concrete issue before proceeding.

Existing limits remain: 1,000 package entries, 25 MiB per asset; live-verifier policy of 2 MiB aggregate raw assets, 4 MiB ZIP, 1 MiB manifest and 128 logical checks; 15,000-file planning alert. Prior measured site is 31 entries/1,884,934 raw bytes, with a 350,573-byte largest file. Measure the new rehearsal rather than claiming identical output in advance.

## Files and review focus

Create `deployment/site-product-selection.json`, `scripts/site-product-selection.ts`, `tests/scripts/site-product-selection.test.ts` and `docs/validation/successor-release-readiness.md`.

Modify `scripts/site-staging.ts`, `.github/workflows/import-census.yml`, `tests/helpers/site-preparation.ts`, `tests/scripts/site-staging.test.ts`, `tests/scripts/site-preparation-integration.test.ts`, `tests/scripts/archive-workflow.test.ts`, README and this plan. Adjust an existing assembly/product-workflow test only if its concrete selection/backup expectation changes; record that dependency. Do not edit application code under `src/`, deployment templates, package/live verification tools, import/calculation logic, acceptance contracts or source/data files.

Review deliberately:

1. Committed selection versus mutable working/data-root substitutions; missing or malformed manifests must not silently select a newer release. Tasks 1–2.
2. Valid hashes with crossed product/month/path/provenance; all identities and metadata must agree, while legitimate mixed-month products remain stageable. Tasks 1–2.
3. Legacy readback must retain exact historical identity checks and never become a fallback for new creation or invalid new manifests. Task 2.
4. Downloaded candidate state must retain the original baseline ETag and bundle reference; absent/swapped state, changed bundle and stale baseline must fail without promoting a different candidate. Task 3.
5. Canada evidence and accepted pointers must remain unchanged; explicit artifact contents must exclude credentials/unrelated files, and final operational completion must follow actual native archive and clean-main checks. Tasks 3–5.

## Task 1: Define the committed coffee selection

**Files:** New selection JSON/parser/tests; `tests/helpers/site-preparation.ts` for reusable valid synthetic metadata only.

**Interfaces:** Consumes existing `FileIdentity`, product paths and month validation. Produces `SiteProductSelection` and `parseSiteProductSelection(value)` with the exact fields above. No IO, data mutation or acceptance decision.

- [x] Authenticate prior completion/seal/package/input identities and preserve the unedited proposal. Confirm clean baseline and native worktree; install with locked `npm ci --ignore-scripts`. Baseline checks may use the authenticated previous passing runtime plus the changed-tool tests, with full final checks in Task 4.
- [x] Write failing parser tests for the four actual August pins, duplicate/unknown/missing products or fields, invalid months/hashes/sizes, crossed/escaped paths, mismatched filename months, deterministic registry order and a permitted August/September mixed selection. Expected initially FAIL: parser absent.
- [x] Implement the pure parser and initial committed August contract; compare all four identities directly with accepted originals. Extend test fixtures with valid synthetic releases and a committed selection file; preserve their existing Canada mock behavior.
- [x] Run `npm test -- tests/scripts/site-product-selection.test.ts --maxWorkers=2`. Expected all cases pass. Commit the contract/parser/owning tests.

## Task 2: Stage selected successors and preserve legacy readback

**Files:** `scripts/site-staging.ts`, `tests/scripts/site-staging.test.ts`, fixture helper.

**Interfaces:** Consumes Task 1's parser and contract bytes from `siteSources`. Produces the unchanged seven-file `SiteStageReceipt` consumed by existing assembly/packaging. `createSiteStage`/`verifySiteStage` and CLI arguments stay unchanged; only internal `siteData`/`stageInformation` signatures change as designed.

- [x] Add failing tests that stage synthetic September products alongside fixed August Canada, stage a mixed-month product selection, and authenticate all seven input bytes. Verify current August behavior remains exact.
- [x] Test missing selection during creation, malformed committed selection, valid-hash but invalid Census metadata/fixture provenance/merchandise-only schema, crossed product/month/pointer/release, changed original/staged selection or data bytes, source-commit mismatch and mutation during the second read. Dirty-source creation fails; historical verification continues to use its committed contract rather than a mutable working-copy substitute. Expected rejected creations must precede a success receipt; original pointers remain exact.
- [x] Add a legacy fixture with an old committed source tree/receipt and exact old pins. Verification must pass; fresh creation without a selection and legacy readback against successor/mutated pins must fail. A malformed new contract must never invoke legacy mode.
- [x] Implement source-bound selection and its explicit creation/readback policies. Preserve receipt/manifest shapes, Canada checks and filesystem safeguards; introduce no external selection override.
- [x] Run `npm test -- tests/scripts/site-product-selection.test.ts tests/scripts/site-staging.test.ts tests/scripts/site-assembly.test.ts tests/scripts/site-preparation-integration.test.ts --maxWorkers=2` with `SITE_PACKAGE_PYTHON` set. Expected all pass; existing source/path/reparse/package regressions remain green. Commit.

## Task 3: Preserve and rehearse the exact candidate handoff

**Files:** `.github/workflows/import-census.yml`, `tests/scripts/archive-workflow.test.ts`, README; product-workflow owning assertion only if needed.

**Interfaces:** Consumes unchanged `ArchiveCandidate`, `parseCandidateState`, `runArchiveCommand`, `recoverBundle` and `promoteCandidate`. Produces the existing named backup artifact with exactly `bundle.json` and `candidate.json`, retaining original artifact ID/digest semantics and seven-day expiry.

- [x] Write a failing actual-workflow contract assertion for the exact two-file backup list and both credential-free `candidate_files` checks after stage/before backup. Retain assertions on manual dispatch, permissions, credentials, order, recovery and candidate-only promotion prohibition.
- [x] Add offline fixture tests that copy the two files to a fresh handoff directory, recover using existing `verify`, and compare original candidate bytes/baseline ETag/bundle/recovered release. Each missing/empty member must prevent verification and readiness. Use the in-memory store only to show that a separately authorized synthetic promotion uses that exact original candidate, rejects stale baseline/crossed or changed bundle/state, and never starts a Census request. Candidate-only still rejects promotion before provider construction. No real provider factory or key is available to these tests.
- [x] Change the backup file list and add its two explicit member-presence checks, then document preserving/reading back both files before expiry and the later exact-candidate authorization requirement. Do not add a promotion workflow or imply a backup receipt authenticates human approval.
- [x] Run `npm test -- tests/scripts/archive-workflow.test.ts tests/scripts/product-workflow.test.ts tests/scripts/archive-release.test.ts tests/scripts/monthly-refresh.test.ts --maxWorkers=2`. Expected all pass, zero real provider/source requests. Commit the workflow/tests/docs.

## Task 4: Verify the complete local preparation flow

**Files:** Existing preparation integration test, private evidence helpers; new validation document, relevant README and plan facts. Application/runtime sources remain unchanged.

**Interfaces:** Consumes committed final tooling, Task 1's actual August contract, seven copied accepted state files and unchanged package commands. Produces authenticated local acceptance, measurements and source/input/package bindings for review.

- [x] Run full `npm test -- --maxWorkers=2`, `npm run check`, explicit fixture-mode `npm run build`, all three `npm run test:e2e` suites, and configured Python `-m unittest discover -s tests/packaging -v`. Expected all pass, zero compiler errors/warnings/hints. Prior baseline is 1,465 unit, 172 browser and 24 Python tests, not a required final count. Do not repeat full suites absent a new change/failure.
- [x] Run the README's existing stage-create/readback, retained Census/snapshot build, post-build readback, assembly and Python site/withdrawal create/verify recipes in fresh owned directories. Copy only the seven accepted state files, never raw archives. Require exact input/source readback before/after and deterministic package recreation.
- [x] Independently authenticate the selection from committed blobs, seven accepted files, eleven protected originals and Canada's projection. Compare staged originals exactly. Verify synthetic successors solely as fixtures, not new accepted data or actual September coverage.
- [x] Confirm all `src/` files and existing deployment templates match planning main. Compare retained served assets with the prior package, explaining any exact Methods preparation-time or generated-ID differences instead of claiming unmeasured byte identity. Replay the 135 existing CSV identities with the accepted/staged releases using unchanged serializers, plus Canada projection; retain the existing historical extra-28-case indirect producer-binding qualification. No new raw-source audit.
- [x] Serve only the assembled real retained package on owned loopback. Check both product profiles, monthly/rolling product comparisons and CSVs, the fixed Canada period/CSV, and disabled/private routes; inspect representative desktop/mobile/static screenshots. Existing full fixture suites cover the wider unchanged UI. Enforce allowlisted loopback requests, no external fetches, no page errors, and exact CSV/source/period checks.
- [x] Measure entries/raw size/largest file and JS/CSS size against caps. Record actual passing and failed evidence, limits and pending review/integration/cleanup. Correct the acknowledged README action-label mismatch to “Open portfolio briefing”; no prose-only test is needed. Commit factual local verification.

## Task 5: Review and merge with actual cleanup

**Interfaces:** Consumes immutable completed branch and Task 4 evidence. Produces reviewed exact-head merges, final main/tool/input binding, sealed proof and confirmed native archive/owned-cache cleanup.

- [ ] Self-review all design contracts, then obtain one fresh whole-branch review on the most capable available model with the five Review focus points and ledger rulings. Root grades findings by user effect, fixes Critical/Important issues in one bounded RED→GREEN/full-suite pass and records deferred minors. No second review of fixes; rebind affected local acceptance after runtime/tool changes.
- [ ] Push/create/attach implementation PR; require successful exact-final-head push and PR Code checks, then expected-head reviewed merge. Synchronize clean main; prove its non-documentation tooling and unchanged application/data match the tested source. No site/data workflow is dispatched.
- [ ] Record actual review/CI/merge and final source/input identities in private completion evidence. The single PR already contains independently reviewed local validation and documentation; its pre-merge operational checkpoint remains historical. A second documentation-only PR is unnecessary for this tooling-only batch. Do not edit tracked files after the reviewed merge merely to mark subsequent private operations complete.
- [ ] Stop only owned previews; preserve useful proof within limits and read back its seal before archive. Request native archive and verify the actual archived_worktree attachment and exact checkout absence; queued is not complete. After those gates, run the private final verifier, preserve completed ledger/log/finalization metadata, remove only the exact owned plan cache and read back seal plus post-seal records. Confirm final clean main and report actual remaining limitations.

## Self review and approval handoff

The two fixes share the existing release lifecycle rather than creating another importer or deployment system. Selection is committed-source evidence, not dynamically trusted local state; a future month still needs separate source acceptance and permission. Canada historical evidence stays immutable. Receipt/package formats and CLI interfaces remain stable, with a narrowly confined legacy verification path. The candidate artifact retains the missing exact state without introducing automatic promotion or longer-term storage claims.

Each Review focus has an owning failing-test step. Parser and staging types agree; both readbacks apply the same policy; old receipt equality does not gain new fields. The initial real rehearsal uses only August data, while September and stale-baseline behavior are explicitly synthetic. Proof, CI, native archive and final cache cleanup have separate factual completion gates.

Review this combined design, five tasks and permission envelope. Full approval selects root implementation with independent review, reviewed merges and actual cleanup, without routine approval pauses. Live imports, candidate promotion, R2 and site publication remain later decisions based on a concrete official successor.
