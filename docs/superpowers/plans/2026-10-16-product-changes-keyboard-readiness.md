# Product Changes Keyboard Readiness Design and Three-Task Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root implements; one fresh independent reviewer checks the whole branch. Track steps with checkbox (`- [ ]`) syntax.

**Goal:** Fix a demonstrated keyboard-test timing race while preserving the existing product-changes journeys.

**Architecture:** Wait for the initial control to become enabled, then verify focus before keyboard input. Reuse existing tests and fixture builds; add no application hook, helper or dependency.

**Tech Stack:** Existing locked Node 24, TypeScript, Astro and Playwright; the existing Python prerequisite for normal CI.

**Spec:** This combined bounded design supports the original brief's working comparisons, downloads and mobile layouts in `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md`. The owner requested a combined plan and permissions for review. Implementation waits for that review; root execution with one independent reviewer remains the chosen method.

## Assessment

PR #114 is complete on main **b280bc3277f09c3eb37c75dc4ec95ada22ab465c**. Its private completion record is `data/backups/merchandise-recorded-revisions/deployment-20261016-r1/post-finalization.json`, SHA256 `16ab938f07fba09276dff2b435be4beed782e6ec93a16c1c872a39e15cb319e3`. Its authenticated references identify the prior seal, actual cleanup, seven accepted and eleven protected input identities.

The retained CI trace shows Copy changes link disabled immediately before the test attempted focus and Enter; the manual field never appeared. An unchanged retry passed. A second journey initially focuses the disabled-until-ready Imports radio without waiting; that is the same source-backed assumption, without a claimed observed failure. Application controls correctly remain disabled until browser state is restored.

[Playwright's actionability documentation](https://playwright.dev/docs/actionability), checked October 16, 2026, confirms focus/press do not wait for enabled state. This small maintenance repair is preferable to a new feature or another speculative data-readiness subsystem. Existing successor staging/recovery already has synthetic coverage.

A real successor update and owner-run pilot observations remain the strategic gates. The [Census schedule](https://www.census.gov/foreign-trade/schedule.html), checked October 16, lists September reporting data for November 4, 2026. That establishes neither API availability nor acceptance and creates no permission for an import or future job.

## Bounded contract

Modify only these two tests in `tests/e2e/pilot-product-changes.spec.ts`:

- `pilot product controls, table scrolling and download work by keyboard on mobile`: before initial Imports focus, await that exact radio's `toBeEnabled()`; after focus, await `toBeFocused()`, then retain ArrowRight.
- `monthly product manual copy, duplicate fallback and static period choices work on small screens`: before initial Copy changes link focus, await that exact button's `toBeEnabled()`; after focus, await `toBeFocused()`, then retain Enter.

Preserve every existing keyboard action, scrolling/width check, CSV filename, manual-link URL/hash, period switch, duplicate-query fallback and no-JavaScript assertion. Keep exact accessible names and inline locators. No clicks replacing keyboard input, sleeps, retries, timeout changes, forced enabling, new test-source assertions or unrelated refactoring.

The authenticated prior CI failure is the observed RED. Inspect it before editing; do not manufacture another flaky failure or duplicate the journeys in a timing harness. The second correction is source-backed consistency. Passing the existing seven-case spec verifies its outcomes, not elimination of all timing failures.

## Global constraints and permission envelope

Approval covers all three tasks without routine approval pauses:

1. Root implementation, one fresh independent reviewer, managed worktree/`codex/` branch/commits and scoped filesystem/runtime/network permissions. Preserve the approved proposal and prior evidence.
2. Existing locked runtime and `npm ci --ignore-scripts` if needed. Reuse Chromium; if absent, install only repository-pinned Playwright Chromium from its official distribution. No dependency, action, workflow or configuration edits.
3. Only three tracked paths may change: the existing test file, new `docs/validation/product-changes-keyboard-readiness.md`, and this plan. Hash the authenticated seven/eleven inputs before/after; no accepted-data copies or raw replay.
4. One fixture build, its existing file-count/size/largest-file report, the seven-case spec with zero retries on a verified unused loopback port, and type checks. No redundant local full-unit or three-configuration browser run; existing CI still runs normally. Repeat/broaden checks only after a diagnosed failure or material edit.
5. Private proof under ignored `data/backups/product-changes-keyboard-readiness/verification-20261016-r1`, at most **500 files/64 MiB**; fixture builds stay in the owned worktree. Start/stop only owned local processes.
6. One public PR in `Vasuki8/us-trade-tracker`, including push/attach/update, normal push/PR CI, independent review, one verified material-finding repair pass, expected-head-protected reviewed merge and clean-main synchronization. Require successful CI on the final reviewed head. No manual data/deployment workflow dispatch or unrelated repair.
7. At setup retain three free native attachment slots. If necessary, preserve identity/URL and verify merged state before unlinking at most **two obsolete merged standalone PR chat references**; leave GitHub PRs and nested archive references intact.
8. Preserve completed logs/ledger/proof, natively archive the owned worktree with its PR, confirm actual archive and checkout/Git-registration absence, then delete only authenticated owned plan caches after preservation. Initialize the primary marker independently; authenticate exact Windows/MSYS ownership paths before deletion. Final readback must verify proof, unchanged inputs and clean main. Queued cleanup remains pending.

Excluded: application/UI/calculation/CSV changes; accepted-data/selection/classification changes; intake; imports/source requests; R2; publication/restoration/live-site checks; new dependencies/services; paid/access/indexing changes; outreach/participant collection; recurring jobs. Existing R2 capacity permission is unused.

Pause only dependent work for unexplained integrity drift, missing evidence, a material out-of-scope failure or a new access/cost boundary.

## Review focus

1. A checked server-rendered radio can still be disabled: wait for enabled before focus.
2. A later enabled snapshot cannot prove earlier focus: verify focus before initial keyboard input.
3. Preserve keyboard interaction rather than substitute clicks or forced DOM actions.
4. Preserve blocked clipboard, monthly URL/hash, duplicate-filter and static-default behavior.
5. Distinguish test maintenance from a production fix, data refresh or universal flake guarantee.

Tasks 1–2 exercise these through the existing journeys and exact diff checks; Task 3 independently reviews all five.

## Task 1: Repair and verify the two keyboard journeys

**Files:** Modify only the two named tests in `tests/e2e/pilot-product-changes.spec.ts`.

**Interfaces:** Consume existing disabled-until-ready controls; produce inline enabled/focused assertions before first keyboard input. No application/helper API changes.

- [x] Authenticate prior completion and retained CI failure, establish the native isolated worktree/ledger, preserve the approved proposal and hash original inputs. Expected: completed PR114, clean base and unchanged identities.
- [x] Inspect both tests and the disabling contracts in `ProductChanges.tsx`/`ChangesViewLink.tsx`; record observed RED versus source-backed consistency accurately.
- [x] Add the four specified assertions while preserving all existing actions/outcomes.
- [x] Set `TRADE_DATA_MODE=fixture` and a verified unused `PLAYWRIGHT_PORT`; run `npm run build`. Expected: synthetic build succeeds with its normal build measurements.
- [x] Run `npx playwright test tests/e2e/pilot-product-changes.spec.ts --project=chromium --workers=1 --retries=0`. Expected: **7 passed**, including both keyboard journeys. Preserve actual output, inspect the narrow diff and commit the repair.

## Task 2: Record proportional acceptance and scope preservation

**Files:** Create `docs/validation/product-changes-keyboard-readiness.md`; update completed local steps in this plan.

**Interfaces:** Consume Task 1's unchanged seven-case result and immutable test diff; produce type diagnostics, scope/input verification and a concise local checkpoint.

- [x] Run `npm run check`. Expected: zero errors/warnings/hints. Reuse the unchanged browser result rather than repeat suites for documentation.
- [x] Rehash the original seven/eleven identities and verify only the three permitted tracked paths differ from base. Expected: no protected-input, application, fixture, workflow, dependency or configuration changes.
- [x] Document the observed failure, consistency correction, actual checks/build measurements and test-only limits; distinguish the local checkpoint from pending review/integration/cleanup. Preserve logs and commit.

## Task 3: Independently review, integrate and complete cleanup

**Files:** Private review/integration/cleanup records and the same PR description; no further source changes expected.

**Interfaces:** Consume the immutable branch and actual acceptance; produce one reviewed, exact-head-CI-tested merge and completed cleanup proof. No website/data release.

- [ ] Obtain one fresh whole-branch review against the contract, five focus points and actual results. Re-grade findings; fix material findings in one verified pass and record rulings/deferred minors.
- [ ] Push/create/attach the PR, require successful push/PR Code checks on its exact final reviewed head, then merge with expected-head protection and synchronize clean main. Diagnose failures; do not repeat the target failure merely to get green.
- [ ] Preserve completed task logs/ledger/proof and actual CI/merge identities; confirm native archival and exact checkout/Git-registration absence. Authenticate cache targets, preserve completed contents and remove only owned caches. Verify proof/input integrity and clean main in final readback; update the same PR with actual closeout. No bookkeeping-only PR.
- [ ] Hand off the resolved known race and remaining pilot/official-refresh gates. No deployment is needed.

## Self-review and approval handoff

The three tasks preserve all existing user-outcome assertions with a four-assertion synchronization repair, one validation note and one reviewed PR. Interfaces, permitted paths, checks and cleanup agree; no new subsystem, redundant harness or public/data operation is included.

Review this combined design and complete permission envelope. Approval authorizes root execution through reviewed merge and actual cleanup without routine approval pauses.

