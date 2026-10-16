# Browser Compatibility Checkpoint Design and Three-Task Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root implements; one fresh independent whole-branch reviewer. Steps use checkbox (`- [ ]`) syntax. This combined bounded proposal was requested by the owner; execution waits for approval.

**Goal:** Verify existing profile research/downloads in pinned Firefox and WebKit, fix only reproduced failures within the bounds below, and preserve honest engine-specific results.

**Architecture:** Run three existing profile acceptance files through a separate two-engine Playwright configuration; keep existing Chromium acceptance as the control. Use the authenticated retained site for real-data checks. Prepare/publish a replacement only if a permitted application repair changes served behavior.

**Tech Stack:** Existing locked Node 24, Playwright 1.64.0, Astro/React/TypeScript, Python packaging, existing GitHub CI and existing Free Cloudflare Pages project. No upgrades or new services.

**Spec:** This bounded design and the first-release/static/research/download requirements in `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md`. The owner wants useful tasks within current scope and all execution permissions reviewed together, with root implementation and independent review.

## Recommendation and alternatives

PR117 is complete on main `c2a73514f5a2c713509997a8fc8e8061f86ec8d5`, including publication and cleanup. Read-only assessment found no new demonstrated profile defect. Successor selection, exact candidate backup/identity, synthetic transitions, recovery and conditional promotion already exist; another release subsystem or rehearsal would add little.

The [official FT900 calendar](https://www.census.gov/foreign-trade/schedule.html), rechecked October 16, still schedules September data for November 4, 2026 at 8:30 a.m. Eastern. A schedule does not establish source publication/API availability. Actual successive-release acceptance remains a later authorized operation. Owner task observations would be the best basis for new features, but none have been supplied; research remains owner-run.

Recommend a small compatibility checkpoint now because current acceptance explicitly covers Chromium only. Further charts/navigation lack a demonstrated need. If this checkpoint passes without application changes, stop feature expansion until owner observations or the next real release gives a concrete reason.

[Playwright browser documentation](https://playwright.dev/docs/browsers) and [projects documentation](https://playwright.dev/docs/test-projects) describe version-specific engine builds. Passing these checks is not certification of stock Safari, every Firefox release, real iOS devices, screen readers or participant usability.

## Global constraints and exact interfaces

1. Scope stays the two accepted coffee products and Canada's fixed September 2024-August 2026 snapshot. No source/import/R2/accepted-data/selection/classification changes or new intake.
2. Reuse exactly these existing files: `tests/e2e/merchandise-download-reliability.spec.ts`, `tests/e2e/estimated-duty-recorded-revisions.spec.ts`, `tests/e2e/product-profile.spec.ts`. Their 24 cases cover static/held controls, saved-view restoration, unavailable values, first CSV identity, rankings, PNG, revision labels and keyboard/mobile behavior.
3. Create `playwright.compatibility.config.ts` importing the existing base config. Preserve its validated loopback port/baseURL, test directory, server and one-worker behavior. Override only an explicit three-file testMatch whitelist, retries=0, outputDir=`test-results/compatibility`, and projects `firefox`/`webkit` using `devices['Desktop Firefox']`/`devices['Desktop Safari']`. Retain base use settings. No extra Chromium project; do not multiply all 200 browser cases across engines.
4. Compatibility command: `npx playwright test --config playwright.compatibility.config.ts --retries=0`; expected 48 cases, 24 per engine. `--list` must confirm exactly that whitelist/count before execution. A skipped case, unsupported host or launch failure is unavailable evidence, never a pass.
5. Modify only `.github/workflows/checks.yml` to install the locked Chromium/Firefox/WebKit distributions with the existing CLI and run that command after existing browser acceptance. Keep action pins, permissions, original checks, 15-minute timeout and seven-day failure-artifact retention. No new job, secrets or manual data dispatch; existing `test-results/` artifact includes compatibility failures. Do not raise the timeout or drop cases if the matrix cannot fit.
6. Test portability corrections are limited to those three owning files, preserving behavior/assertions. Capture the original failure first. No sleeps, retries, relaxed timeouts, engine skips or success mocks for unavailable APIs. No configuration-mirroring unit test: existing behavioral cases provide meaningful verification.
7. A single pre-publication runtime repair pass is allowed only for reproduced existing CSV/PNG export or profile readiness/restoration failures in these journeys. Allowed files: `src/lib/trade/downloads.ts` (only `downloadBlob`/`exportChartPng`, never serializers), `src/components/TradeChartDownload.tsx`, `DutyChartDownload.tsx`, `ProductExplorer.tsx`, `EstimatedDuties.tsx`, and directly owning existing unit tests. Preserve figures, formats/filenames/MIME types, qualifications, existing readiness and cancellation contracts. No edits if tests pass. A broader required change remains a failed/out-of-scope gate; complete independent work and report it rather than guessing a redesign.
8. Runtime fixes require preserved behavioral RED, minimal repair and GREEN. Keep the final-review material-fix pass within the same boundaries. Root executes inline with one fresh final reviewer; no implementer agent per task or duplicate review. Only a demonstrated publication repair permits another review.

## Complete permission envelope

Approval covers all three tasks without routine approval pauses:

- Native managed worktree/`codex/` branch, commits, root execution, independent reviewer and scoped filesystem/runtime/network escalations. Reuse locked Node/Python; `npm ci --ignore-scripts` only if setup is needed. Install only Firefox/WebKit builds selected by locked Playwright 1.64.0 from its official distribution into the usual cache; require at least 2 GiB free first. Existing ephemeral CI may install their official system dependencies. No OS/global browser replacement or project dependency upgrades.
- Authenticate PR117 proof and original seven accepted/eleven protected entries. For unchanged runtime, copy only its ZIP/manifest, at most 5 MiB, into fresh private output and verify entries before serving/extracting. Only a runtime repair permits the standard seven processed inputs, at most 16 MiB per stage, for one candidate and one conditional publication-repair candidate. No raw copies/replay.
- The exact config/test/CI/doc changes and conditional runtime repair above; Chromium control, 48 fixture cases, 32 retained engine journeys, focused/type checks and conditional package/139-CSV checks. A full local unit suite is needed for runtime changes, not ceremonial test-only repetition. Use pinned `SITE_PACKAGE_PYTHON` and the established local `--maxWorkers=2 --testTimeout=30000` allowance without changing CI/repository settings. Repeat large suites only for diagnosed failures/material changes.
- Preserve proposal, failures, logs, browser/version receipts, review, packages and completed ledgers under ignored `data/backups/browser-compatibility-checkpoint/verification-20261016-r1`, at most 750 files/96 MiB. Preserve up to eight representative traces and 24 representative images; record other download hashes and complete bounded failure summaries. Limit mobile screenshots to one per engine per stage and omit duplicate captures. Never remove a failure to claim success. Use fresh owned outputs and start/stop only owned previews; do not copy browser binaries into proof/Git.
- One public PR/attachment/description updates, normal CI with both exact-final-head push/PR runs successful, reviewed expected-head merge under standing permission and clean-main/source binding. Reserve three attachment slots; if needed, verify merged status and preserve identity/URL before unlinking at most two obsolete merged standalone PR chat references. Leave GitHub PRs and nested archived references unchanged.
- **Only if runtime changes:** exact-source site/withdrawal staging/build/package/recreation/readback and publication to existing **Free us-trade-tracker / Production / main**, account `2e23d873002d29a02a1427e1fa37c5cd`. Reconfirm Free/target/current pinned predecessor before upload; use current official docs before any direct provider API. One predecessor and one candidate served-file/header/404 check on canonical and actual observed origins, plus bounded named engine journeys. Observe deployment identity; never infer origin from package hash. No new credentials/project/access/payment.
- Automatically restore/verify the pinned prior site if publication regresses. Permit one demonstrated same-scope publication repair with fresh tests/review/CI/merge before one second candidate/check; if it fails or exceeds scope, restore/verify and report incomplete. If runtime is unchanged, publish nothing.
- Preserve/read back proof/completed logs, then native archive and actual checkout/Git-registration absence. Authenticate Windows/MSYS ownership markers and resolved absolute paths before deleting only owned caches. Record actual integration, publication-or-no-publication, clean main and original protected hashes in the same PR/final readback.

Excluded: source/Census/API requests or imports, raw replay, accepted-data/pointer/selection/classification changes, R2, new products/countries/months, new UI features, serializer/calculation changes, dependency/action/service upgrades, paid/access/indexing changes, analytics, outreach/participant collection and recurring jobs. Existing R2 storage permission is unused. Calendar/documentation reads for this proposal are not data-import authorization.

## Authentication and conditional restoration pins

Authenticate PR117 root `data/backups/profile-control-readiness/deployment-20261016-r1`: `post-finalization.json` SHA256 `b61151ecab52e319305c3180ad8fccb0d8f19e53675c74f920a1f80be78d2ce7`; `post-final-readback.json` SHA256 `21c338fbd5d4e9496e5e8521d9895dd91d59e83b7ae2a7cbdd5664e21f524856`; follow their recorded references. Planning reauthenticated 288 sealed entries, eight post records and all seven/eleven current identities without drift. Do not execute old finalizers or modify sealed old proof.

Retained `packages/site.zip`: 412,614 bytes, SHA256 `6e63391ecc9ebe3c22432f69f620bf1e5f6d443dded47600062c92957346a283`; manifest SHA256 `7b57293e1c354c1d384ede45ef9636d73058ab3cb38f48f0e396f8db61f948dd`. Actual package source `b77cb8a6d6d69e352123c0e4baf6e8b13381bcf8`; 31 assets/1,893,276 raw bytes. Do not relabel historical source with a new test/docs commit.

Conditional restoration: deployment `2b73be66-8477-4f28-98a4-209267b6ef86`, observed origin `https://2b73be66.us-trade-tracker.pages.dev`, canonical `https://us-trade-tracker.pages.dev`. These pins do not establish current assignment at a future upload; unexplained drift blocks the dependent upload.

`compatibility.json` SHA256 `6b974446724d7bda58e37095499fbd48faf59af83ae4d13a4c92ced8ba19a63b` binds all 139 candidate CSVs and Canada's projection. All remain byte-identical after any runtime repair. Preserve historical extra28 indirect producer-binding qualification; exact bytes are not new source acceptance.

## Review focus

1. Distinguish real browser defects from test assumptions; unavailable/skipped/retried evidence cannot count as compatibility. Tasks 1-2.
2. Static/held controls stay disabled; first active downloads use restored direction/country order and preserve unavailable values. Tasks 1-2.
3. Existing PNG/CSV contracts and qualifications remain exact; no serializer/data change is hidden in a repair. Task 2.
4. Evidence/package source remains authentic; new packaging happens only for runtime changes, with protected inputs and 139 CSVs exact. Tasks 2-3.
5. CI adds only 48 cases; publication/rollback/cleanup require actual observed results, not queued requests. Tasks 1,3.

## Task 1: Add the bounded fixture checkpoint

**Files:** Create `playwright.compatibility.config.ts`; modify `.github/workflows/checks.yml`; only evidenced portability corrections in the three named acceptance files.

**Interfaces:** Consume the existing 24 cases/base config. Produce the exact two-engine, three-file, 48-case command; original Chromium stays the control.

- [ ] Authenticate baseline/proof/input pins; preserve original approval; reserve capacity; create native worktree and owned execution ledger. Check locked setup/browser cache/free space before permitted installation. Expected: no unexplained drift or accepted-data changes.
- [ ] Build explicit fixture mode without Canada flags on an unused loopback port. Run `npx playwright test tests/e2e/merchandise-download-reliability.spec.ts tests/e2e/estimated-duty-recorded-revisions.spec.ts tests/e2e/product-profile.spec.ts --retries=0`. Expected: 24 Chromium passes; diagnose any baseline failure first.
- [ ] Add configuration and CI step as specified; run `npx playwright test --config playwright.compatibility.config.ts --list`. Expected: exactly 48 cases/two engines/three files. No configuration-mirroring test.
- [ ] Run the compatibility command with retries=0. Preserve versions, results/failures/traces. Expected: 48 passes or precise reproducible failures for Task 2; unavailable launch is not success. This task records matrix execution, not compatibility acceptance: authenticate enumeration and all reported outcomes before recording its completion. Commit the configuration/workflow and any evidenced owning test correction, preserving failed engine results.

## Task 2: Verify retained data and resolve only reproduced failures

**Files:** The specified owning tests and conditional runtime files; create `docs/validation/browser-compatibility-checkpoint.md`; update this plan's actual progress. Private harnesses remain ignored.

**Interfaces:** Consume actual fixture results and authenticated PR117 package. Produce engine-specific acceptance or preserved failures, plus explicit `runtimeChanged` controlling Task 3 publication.

- [ ] Classify fixture failures: test assumption, unsupported environment or permitted runtime defect. Preserve RED; gather the retained-package outcomes before starting the single application repair pass. Out-of-bound failures remain reported and block a passing verdict. No opportunistic refactoring.
- [ ] Verify/read every retained ZIP entry and serve only the authenticated extracted site on one owned loopback preview. Reuse PR117's 16 named journeys per new engine: four duty CSV selections, four direction/product ranking CSVs, both static/mobile profiles, changes/Canada coexistence and private404s. Verify duty/merchandise PNG dimensions (1920x1080), readable provenance/qualifications, exact CSVs, focus/overflow and no page errors/external source requests. Expected: 32 checks, with engine/OS and limitations recorded.
- [ ] Combine fixture/retained failures into the one permitted application repair pass: preserve each RED, correct only demonstrated causes and verify GREEN. Test-only assumptions may be corrected without weakening behavior. After a material correction rerun affected checks and final fixture control/matrix. Run `npm run check`. With unchanged runtime, authenticate retained identities and do no new data staging/replay/package. With runtime changes, run focused tests and one final full local suite, commit runtime/tests, then use current stage/prepare/package tools with only seven processed inputs. Verify site/withdrawal recreation/readback and existing 1,000-entry/2 MiB served-payload/25 MiB asset limits/15,000-file alert; preserve actual source across later test/docs commits. Replay all 139 CSVs and Canada projection exactly; rerun existing Chromium and 32 new-engine retained journeys on that candidate.
- [ ] Document actual counts, failures/unavailable results, runtimeChanged, source/input identities and whether publication is required. Expected: no invented broader browser/source/demand claim. Commit scoped evidence/docs.

## Task 3: Review, integrate, conditionally publish and clean up

**Files:** One PR description, permitted material review fixes, plan progress and private completion records.

**Interfaces:** Consume exact final source/evidence/runtimeChanged. Produce reviewed integration, publication only when required, and actual cleanup.

- [ ] Obtain one fresh whole-branch review covering all Review focus items. Regrade by user effect; fix material findings in one verified RED-to-GREEN pass within scope. Require successful ordinary push/PR CI on exact final reviewed head, including original checks and all 48 compatibility cases without skips/retries. Expected: review/CI pass, or preserved honest failure; do not merge a falsely passing checkpoint.
- [ ] Expected-head merge and clean-main synchronization; bind source/application trees to tested candidate if one exists. If runtimeChanged=false, retain existing deployment unchanged and record publication not required.
- [ ] Only if runtimeChanged=true: authenticate pinned predecessor/current Free/Production/main, verify predecessor once, upload exact candidate, observe actual identity/origin and verify served bytes/headers/private404s plus named bounded Chromium/Firefox/WebKit journeys. Restore/verify on regression; use only the authorized single publication repair. Expected: fully verified update or prior site restored and incomplete status.
- [ ] Stop owned previews; preserve/seal/read back proof and completed logs. Actually archive native worktree and confirm checkout/Git-registration absence. Authenticate cache markers/resolved targets, then delete only owned caches. Record actual results in same PR/final readback, with clean main/original seven-eleven hashes. Expected: all three tasks and actual cleanup complete, or explicit unresolved gate.
- [ ] Hand off actual engine/OS coverage. Further features should follow owner observations or a separately authorized real successive-release update.

## Self-review and handoff

The matrix extends existing behavioral coverage without promising every browser/device. Runtime repairs have reproduced failures and named boundaries; serialization/data/new features are excluded. No-runtime execution skips new packaging/publication; the runtime path includes exact-source proof, restoration and actual cleanup. Counts, source pins, interfaces and preservation bounds were checked. Planning only: no browser installation, code/config edit, test run, CI change, import, R2 operation or deployment has started for this proposal.

## Execution assessment

Task1 matrix collection complete: Chromium24 and WebKit24 pass; Firefox24 fail before launch. Task2 produced WebKit16 retained passes, preserved Firefox host-unavailability evidence and16 unexecuted retained checks, with no runtime edit. Acceptance is partial and remains explicitly open; same-build reinstall did not repair the host, and OS/binary changes are excluded. Task3 review/exact-head CI/integration/actual cleanup remain pending. If those independent gates pass, integrate test tooling with this limitation; publish no site because runtimeChanged=false. Actual results go in the same PR/private closeout.

Independent review found no actionable findings at 8311495. Initial CI preserved two failures: an ordinary Chromium history protocol error (isolated reproduction passes), and Firefox keyboard traversal (47/48 compatibility passed). The bounded owning-test correction takes the short reverse keyboard path, with all assertions retained; focused Chromium/WebKit checks pass 2/2 and type diagnostics remain zero. Final corrected-head push/PR CI, integration and cleanup remain pending. The original review head is distinct from the root-verified correction head.
