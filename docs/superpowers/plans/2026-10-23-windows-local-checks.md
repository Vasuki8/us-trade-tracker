# Windows Local-Check Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for root implementation and one independent whole-branch reviewer. Steps use checkbox syntax.

**Goal:** Make the measured Windows filesystem integration checks dependable while preserving their assertions and all runtime safeguards.

**Architecture:** Reproduce unchanged checks, profile real test boundaries, then attach explicit Windows-only budgets to justified integration cases. The global Vitest configuration, Linux defaults, production code and short deadline checks stay unchanged.

**Tech Stack:** Existing Node24, locked Vitest5/TypeScript6, Windows Git/PowerShell, standard Linux GitHub CI. No new dependency.

**Spec:** Owner-approved three-task in-chat design, October23,2026: measurement; justified test budgets capped30000ms; full verification/review/merge/documentation/cleanup. Scope/permissions are recorded in private execution evidence.

## Global Constraints

- Root owns all edits; one independent final reviewer. No concurrent implementation.
- Preserve every assertion, fixture isolation, cleanup and existing deadline behavior. No skips/retries/global timeout increase.
- Explicit Windows integration budgets must be justified by measurement and never exceed30000ms. Non-Windows cases inherit the existing default.
- No production code, dependency, workflow, accepted data, source request, R2 or deployment changes. Broader runtime defects require a new decision.
- Existing protected inputs and published package bytes must remain unchanged. Preserve the unrelated untracked September proposal.
- Authorized: one isolated worktree, scoped test/process permissions, synthetic temporary fixtures, locked setup, read-only existing package checks, one PR/standard CI/reviewed merge and cleanup. Up to2 obsolete merged PR chat cards may be unlinked only if capacity requires it, after metadata preservation.

## Review Focus

- Mexico freezes Date: measurements must use a monotonic clock; its25ms hanging-body and read-only transport controls must retain their existing limits.
- Timed-out async cases can continue: all repaired cases must complete real assertions and cleanup, with no cross-test fixture sharing.
- Windows real path/junction/hardlink/mutation checks must still fail closed; no mocking away their filesystem behavior.
- Explicit budgets must affect only the named measured Windows integration cases, with global/Linux defaults and existing30000ms large-fixture case unchanged.
- Test/docs-only scope must preserve all runtime, dependency, workflow, accepted-input and published-package fingerprints.

### Task1: Reproduce and measure

**Files:** Read the three affected test files and their existing helpers/runtime; private diagnostics only.
**Interfaces:** Produces per-case status/duration and representative fixture/stage/prepare/recovery spans, tied to the unchanged base.

- [x] Run all 58 cases in tests/scripts/site-staging.test.ts, tests/scripts/site-assembly.test.ts and tests/mexico-country-archive/upload.test.ts with maxWorkers2 and original defaults, retaining JSON and logs. Expected: known5000ms timeout failures, not changed assertions.
- [x] Temporarily instrument representative successful operations using performance.now; run only those named cases with a bounded30000ms measurement window. Restore exact source bytes afterward. Expected: real operations complete and every assertion remains active.
- [x] Separate fixture setup from filesystem preparation/recovery and record evidence before choosing budgets. If a runtime defect appears, report it and do not alter runtime code.

### Task2: Apply narrow test budgets

**Files:** Modify only measured cases in the three test files; optionally create tests/helpers/windows-integration-timeout.ts.
**Interfaces:** Export windowsIntegrationTimeoutMs:number|undefined, using the measured20000ms Windows budget, below the30000ms approved ceiling; undefined elsewhere inherits the unchanged Vitest default.

- [x] Use Task1's observed failing checks as the regression baseline; do not create tests that merely assert a timeout constant.
- [x] Add the test-only budget argument only to measured slow filesystem/Git integration cases. Keep each assertion/body/cleanup identical; keep short failure/deadline cases and global config unchanged.
- [x] Run all 58 original cases without a CLI timeout override and inspect JSON outcomes; run a second affected-suite pass to check stability. Expected:58passed and completed real assertions.
- [x] Commit the narrow test change with measured rationale.

### Task3: Verify, review, integrate and clean up

**Files:** README.md; docs/validation/windows-local-checks.md; this plan's status. Private proof remains ignored.
**Interfaces:** Consumes Task1/2 measurements and actual full-suite results; produces reviewed source/CI evidence and cleanup record.

- [x] Run npm test -- --maxWorkers=2 on Windows and npm run check, without CLI timeout overrides. Expected: full suite green, zero compiler diagnostics. Name and investigate any failure without changing scope silently.
- [x] Authenticate existing candidate/restoration ZIPs read-only and recheck runtime/config/dependency/workflow/accepted-input fingerprints.
- [x] Document measured checks, exact budgets, limitations and normal commands. Refresh README's current release pointer from the existing verified PR146/deployment16b5e4f3 evidence; keep historical records dated.
- [ ] Obtain one fresh-context read-only whole-branch review. Correct material findings within scope; preserve all failed outcomes.
- [ ] Push one PR, attach it, require complete exact-head standard Linux CI and merge under standing permission. No site publication.
- [ ] Synchronize primary main, preserve proof, archive the owned worktree and verify physical/Git-registration removal. Preserve metadata before any permitted card unlinking.

**Local verification:** all 58 affected cases passed twice; full Windows 2,095 passed/0failed/0skipped; 387 compiler files, zero diagnostics. The implementation PR carries final review, exact-head CI, merge and actual cleanup status.
