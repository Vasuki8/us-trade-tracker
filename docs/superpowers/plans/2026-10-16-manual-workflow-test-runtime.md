# Manual Workflow Test Runtime Design and Three-Task Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root implements; one fresh independent reviewer checks the immutable whole branch before integration. Track steps with checkbox (`- [ ]`) syntax. This is a bounded repair to existing manual workflows, not a new readiness system or a live data run.

**Goal:** Supply the existing Python prerequisite wherever a GitHub workflow runs the full test suite, so the three manual data jobs can pass that prerequisite before reaching their existing data gates.

**Architecture:** Add the same job-level `SITE_PACKAGE_PYTHON: python3` declaration already used by Code checks to the import, country-audit and duty-audit workflows. Add one YAML configuration regression and use existing packaging fixtures to check the runtime requirement. Keep application code, existing test logic, provider operations and workflow controls unchanged.

**Tech Stack:** Existing locked Node 24, TypeScript/Vitest, existing `yaml` package, Python 3.12+ and GitHub-hosted Ubuntu. No new dependency, action or service.

**Spec:** This combined bounded design and the Data foundation and reliability / Validation and launch sequence requirements in `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md`. The owner requested the next tasks and complete permissions together for review, overriding separate design/plan handoffs. Planning is authorized; implementation waits for approval of this document.

## Assessment and recommendation

PR #112 is complete on main **318082bb5c34bdda81ad5b02658e34e5916efba1**. Its actual merge, clean-main binding, native archive, checkout/cache absence and final readback are preserved under `data/backups/candidate-verification-consistency/verification-20261016-r1`. Authenticate preservation manifest SHA256 `76c1b7c787b747acef36d504fd713f511d188e4ed4fbe979bda927c8a2949bf9`, finalization SHA256 `b24a75227d35c77e32aff622fb397c1a54d2afb335a660d8ea17749a8b7a353a` and final-readback SHA256 `1c9a1ee333e53cc9b1d253894ccb509a0ffd29af76eff61db2c1b322ef1e678c`. Follow their authenticated input references rather than trusting current files as new pins.

The next strategic evidence remains owner-run pilot tasks and a successful update across successive official releases. No participant observations were supplied. Do not invent another reader feature or claim that another synthetic rehearsal closes either gate. The [Census schedule](https://www.census.gov/foreign-trade/schedule.html), checked October 16, 2026, lists September reporting data for November 4, 2026 at 8:30 a.m. Eastern; that is neither proof of API availability nor permission for a live run.

Read-only inspection found a concrete prerequisite defect worth fixing now. `package.json` runs unfiltered Vitest, and `vitest.config.ts` includes all script tests. `tests/helpers/live-site.ts:27` and `tests/scripts/site-preparation-integration.test.ts:11` require `SITE_PACKAGE_PYTHON`. Code checks supplies `python3`; the three manual workflows run `npm test` without that setting at any environment level. Their ordinary later source/provider steps therefore cannot be reached successfully under their declared environment. PR112's retained local failure corroborates the missing-setting behavior. No hosted failure or manual run was inspected or dispatched during this assessment.

Recommend the three declarations plus a regression. Alternatives are to inject the setting only at each test step, or add test-side interpreter discovery. Job scope follows the existing Code-check convention; fallback logic would hide configuration drift and add an unnecessary runtime policy. Keep the current test commands and timeouts. A separate inspection found imprecise revision attribution in reader tables/CSVs, but both accepted coffee releases currently have no revision keys; assess that separately before a real revised release, without adding it to this repair.

## Global constraints and permission envelope

Approval covers all three tasks without routine approval pauses:

1. Root implementation, read-only input audit and one fresh independent whole-branch reviewer; managed worktree/branch/commits and scoped filesystem/runtime/network permissions for these operations. Use the existing Node 24/Python runtime and `npm ci --ignore-scripts`; do not change dependencies or action pins.
2. Edit only the three workflows named in Task 1 to add the Python environment declaration, the new regression, README, the validation document and this plan. Workflow triggers, job/step conditions, concurrency, permissions, secrets, inputs, retention, command order, commands and timeouts remain unchanged. No change to `checks.yml`, application/runtime source or test fixtures/helpers.
3. Authenticate prior completion and the same seven accepted/eleven protected file identities before/after, using hash-only reads. No accepted-data copy or official raw-source replay. Create synthetic test outputs only in owned temporary directories. Preserve prior proof and the original approved proposal bytes/hash.
4. Preserve private logs, diagnostics, diff/review and completion receipts under ignored `data/backups/manual-workflow-test-runtime/verification-20261016-r1`, at most **300 files/32 MiB**. Run the named small missing-setting probe, focused workflow tests, one final full unit suite and type checks. No local website build, browser preview or public-site check is needed. Existing push/PR CI may run its normal fixture build/browser checks.
5. Push/create/attach/update one public implementation PR in `Vasuki8/us-trade-tracker`; require independent review and successful push/PR Code checks on its exact final head, merge with expected-head protection under standing merge permission, and synchronize clean main to the actual merge. No bookkeeping-only second PR. Normal Code checks are the only GitHub jobs this batch may cause to run; do not dispatch manual data workflows.
6. Check native attachment capacity before adding worktree/PR/archive, retaining three free slots at setup. If necessary, preserve identity/URL and confirm merged status before unlinking at most **two obsolete merged standalone PR chat attachments**. Do not alter GitHub PRs or nested archived-worktree attachments.
7. Preserve actual completed logs and useful proof, confirm native archival and exact checkout/Git registration absence, initialize the primary plan marker independently, delete only this plan's authenticated caches after preserving completed logs, and perform final clean-main/proof readback. Queued operations remain pending until confirmed.

Excluded: manual import/audit/archive workflow dispatch; Census API or source retrieval; R2 reads/writes; credentials or access changes; accepted-data/pointer/classification/site-selection changes; new products, countries or months; reader revision features; deployment/restoration/live-site verification; new actions/dependencies/services; paid changes, indexing, analytics, outreach and recurring jobs. Existing R2 capacity permission is unused. Correcting this setting does not establish successful source import, remote recovery or successive-release acceptance.

Pause only dependent work for unexplained integrity/input drift, unavailable required evidence or a new material access/cost boundary. A failure outside this configuration and its checks becomes a separate finding, not permission for unrelated fixes.

## Review focus

1. All actual full-suite jobs are found; a zero-match discovery or omission of one manual workflow must fail. Task 1.
2. Workflow/job/step environment precedence must not let an empty or conflicting test-step override hide a missing interpreter. Task 1.
3. The configuration must resolve the real packaging-fixture prerequisite, rather than merely satisfy a string assertion; absence fails and the pinned interpreter passes the same unchanged fixture. Task 2.
4. Import candidate-only/backup/promotion gates and country/duty source guards remain identical; no live operation is used to test configuration. Tasks 1–3.
5. Missing-setting correction must not become a timeout increase, fallback, dependency change, accepted-data mutation or claim of hosted data-run success. Tasks 2–3.

## Task 1: Repair and pin the workflow runtime contract

**Files:** Create `tests/scripts/manual-workflow-runtime.test.ts`; modify only job `env` in `.github/workflows/import-census.yml`, `.github/workflows/audit-census-country.yml` and `.github/workflows/audit-census-duties.yml`.

**Interfaces:** Consume existing YAML files and existing `yaml.parse`. In test-local code only, define `effectiveEnvironment(workflowEnv: Record<string, unknown> | undefined, jobEnv: Record<string, unknown> | undefined, stepEnv: Record<string, unknown> | undefined): Record<string, unknown>` using workflow then job then step precedence. Discover jobs/steps invoking the existing full unit command across workflow YAML files. Produce no exported application/tool API.

- [x] Authenticate prior completion/input pins, preserve the approved proposal, establish the native isolated worktree and ledger, and inspect the clean base. Expected: exact identities and no unfinished prior cleanup.
- [x] Add regression coverage discovering the current four full-suite jobs (Code checks plus the three manual jobs). Require nonzero discovery, assert each known job is included, and require its effective test environment to select literal `python3`. Add small test-local precedence cases: step wins over job, job over workflow, and empty or conflicting step values remain invalid. Run `npm test -- tests/scripts/manual-workflow-runtime.test.ts --maxWorkers=2`. Expected RED: the three manual job declarations are missing; Code checks is the valid control.
- [x] Add `SITE_PACKAGE_PYTHON: python3` to each affected job's existing `env`. Do not change test invocations or any other workflow property. Run the new regression again. Expected GREEN.
- [x] Run `npm test -- tests/scripts/manual-workflow-runtime.test.ts tests/scripts/archive-workflow.test.ts tests/scripts/product-workflow.test.ts tests/scripts/country-audit.test.ts tests/scripts/product-duty-audit.test.ts --maxWorkers=2`. Expected all pass. Compare parsed before/after workflows after removing only the added declaration; structures must be identical. Record actual results and commit.

## Task 2: Check the real prerequisite and document the boundary

**Files:** Create `docs/validation/manual-workflow-test-runtime.md`; narrowly update README's existing test-runtime instructions and this plan's completed local checkboxes. All diagnostic helpers/logs remain private.

**Interfaces:** Consume Task 1's effective environment and unchanged existing fixture test `authenticates a real ZIP and plans served and private routes without the control file` in `tests/scripts/live-site-package.test.ts`. Produce a local runtime receipt, full-suite/type results and a concise operator explanation; no new command or readiness tool.

- [x] In one credential-free child process with `SITE_PACKAGE_PYTHON` explicitly removed, run `npm test -- tests/scripts/live-site-package.test.ts -t "^authenticates a real ZIP and plans served and private routes without the control file$" --maxWorkers=2`. Expected FAIL with `SITE_PACKAGE_PYTHON is required`. Then supply the existing pinned Python executable and run the identical command. Expected PASS. Keep both logs; no HTTP, source, R2 or real site package is used. This confirms the prerequisite and local remedy, not execution of GitHub's manual jobs.
- [x] Set `SITE_PACKAGE_PYTHON` to the pinned local interpreter and run `npm test -- --maxWorkers=2 --testTimeout=30000` once, then `npm run check`. Expected all tests pass (at least the existing 1,566 plus the new cases), zero errors/warnings/hints. The 30-second local allowance follows the measured PR112 environment limitation; do not change repository/hosted test timeouts or call this a performance check.
- [x] Rehash the original seven/eleven identities. Document the three corrected declarations, unchanged existing test commands, the RED/GREEN probe and exact scope. Explain that CI validates configuration/fixtures, not a successful manual import/audit or current hosted Python behavior. Record any distinct failure honestly; do not rerun large suites without a diagnosed reason.
- [x] Self-review the five focus points and allowed-file diff; mark only actual completed local steps, preserve logs and commit the local checkpoint. Actual review/CI/merge/archive/cache completion belongs to the one PR and private finalization after it occurs.

## Task 3: Review, integrate and finish actual cleanup

**Files:** No further runtime changes expected. Private review/integration/cleanup receipts; public PR description is the completed operational record.

**Interfaces:** Consume Tasks 1–2 and the immutable base/head. Produce one reviewed, exact-head-CI-tested merge and preserved completion evidence. No website or data release is produced.

- [ ] Obtain one fresh whole-branch review of the exact diff, plan/spec, effective-environment regression, actual probe/full-suite results and unchanged workflow controls. Resolve material findings in one verified pass and record rulings/deferred minors. No re-review unless a material change warrants it.
- [ ] Push/create/attach the one PR, require successful push and PR Code checks on its exact final head, then merge using expected-head protection. Do not dispatch any corrected manual workflow to prove this fix.
- [ ] Synchronize clean main to the actual merge and bind its tree to the reviewed head. Preserve the complete proof, actual task logs and independently marked primary ledger; authenticate input identities again.
- [ ] Confirm native archive, checkout/Git registration absence and owned-cache deletion after completed-log preservation. Final readback must bind the proof, actual merge, CI, unchanged inputs and actual cleanup before marking all tasks complete.
- [ ] Hand off the repaired prerequisite and remaining boundaries. Recommend owner-run task observations and a separately reviewed exact-candidate September refresh after publication/API/classification checks. Precise revision attribution remains separate; neither this fix nor a synthetic run closes actual successive-release acceptance.

## Self-review and approval handoff

This fixes a demonstrated mismatch between the required test environment and three existing jobs. The plan names all edited files and the only production configuration delta, defines environment precedence, covers the real prerequisite with an unchanged synthetic fixture, and preserves existing source/provider controls. No user research, reader feature, live run or publication is smuggled into the repair. It needs no additional service or R2 storage.

Review this combined design and three-task permission envelope. Full approval authorizes root implementation with one independent review, GitHub integration and actual cleanup without routine permission pauses. It authorizes none of the excluded follow-on operations.
