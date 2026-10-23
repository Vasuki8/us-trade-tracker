# Code-Check Trigger Efficiency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for root implementation and one independent whole-branch reviewer. Steps use checkbox (`- [x]`) syntax.

**Status:** Owner approved all three tasks and permissions on October 23, 2026. Root implementation with independent review; the final PR records integration and cleanup.

**Goal:** Remove duplicate feature-branch push checks while retaining the complete PR, main-branch and tag check paths.

**Architecture:** Change only the push event filter in the existing Code checks workflow. Keep the complete job, its permissions, runtime, dependencies, deadlines and assertions identical. Verify the event behavior using this work's real branch, PR and merge rather than adding a GitHub trigger simulator.

**Tech Stack:** Existing GitHub Actions, Node 24, locked YAML/Vitest/Playwright packages, Python 3.12+, Windows local tooling and the unchanged hosted Linux job.

**Spec:** The proposed short design below. Root implementation with independent review follows the execution method used for the preceding milestones.

## Proposed short design

The last milestone's final commit triggered both a push run and a PR run. One duplicate run reached the existing 15-minute job limit while downloading browser system packages; the identical PR pipeline and unchanged retry passed. The duplicated execution is confirmed. There is no evidence that changing the runner, increasing timeouts or adding a cache is required to correct the duplicate triggers.

Recommended approach: retain unrestricted `pull_request`; restrict branch `push` runs to `main`; explicitly preserve all tag pushes. A feature branch gets full remote checks once its PR opens, and later PR updates run the same suite. Main merges continue to receive a separate complete integration check. The trade-off is losing the separate pre-PR feature-branch run; existing local checks remain available.

Alternative considered: retain all branch pushes and selectively skip/cancel duplicates using PR discovery or concurrency rules. That preserves pre-PR checks but introduces extra conditions, potential cancellation of useful evidence and possibly additional API permissions. It is unnecessary for this repository's current PR-based integration.

Approval of this combined document selects the recommended approach and authorizes the three tasks and bounded permissions below. It does not claim that external download delays will disappear, that job duration will halve, or that the public website has changed.

## Evidence and references

- Baseline main: `aa0adbf5bbe8c8ac56062620cea1a5837296db60`, reviewed merge [PR #147](https://github.com/Vasuki8/us-trade-tracker/pull/147).
- Current `.github/workflows/checks.yml` SHA-256: `3de61e96492b825a7d842daf73d3e617eb3198a450e591d603821f795188ea64`.
- Final-head [PR run 39902654848](https://github.com/Vasuki8/us-trade-tracker/actions/runs/39902654848) and [push run 39902650471](https://github.com/Vasuki8/us-trade-tracker/actions/runs/39902650471) demonstrate duplicate execution for the same source head. The latter's first cancellation and successful unchanged second attempt are retained.
- [GitHub event filters](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushbranchestagsbranches-ignoretags-ignore) distinguish branch and tag filters. Specifying a branch filter alone would remove tag push coverage, so this plan explicitly retains tags.
- Current complete Linux baseline: 2,094 unit tests passed plus the preexisting Windows-only skip; 42 Python checks; 387 compiler files with zero diagnostics; 367 browser checks. PR #147 also passed all 2,095 Windows tests. These are baseline observations, not advance claims about this batch.

## Global constraints

- Root owns every edit. One fresh independent final reviewer; an additional independent review is permitted only for the optional post-merge repair.
- Only `.github/workflows/checks.yml`, `docs/validation/checks-trigger-efficiency.md` and this plan may change.
- Keep workflow name `Code checks`, job ID/name `check`, unrestricted `pull_request`, `contents: read`, credential persistence off, fixture mode, Python setting, all action pins, runner, Node version, steps, test commands, artifact policy and the 15-minute job deadline unchanged.
- Preserve all existing tests/assertions, Windows budgets, browser retries/settings and production guards. Add no trigger simulator or test that merely repeats the YAML.
- No path filters, concurrency/cancellation rules, extra events, manual dispatch hook, runner migration, cache, container, dependency or new service.
- No official source requests, manual data-job dispatch, accepted-data changes, R2 operations, new products/countries, Mexico publication, site packaging/publication/restoration, access/indexing changes, paid changes or recurring jobs.
- Re-read main at execution. If the workflow has drifted from the pinned hash, inspect the change before proceeding; do not overwrite it. Any materially different workflow or goal requires a revised decision.
- Preserve the unrelated September proposal, the unrelated Mexico checkout, existing accepted inputs and both existing public-release packages.
- Use the established real Python executable through `SITE_PACKAGE_PYTHON` for local checks. No global environment or credential changes.

## Review focus

1. PR checks must still run with no branch, path or job condition that can leave a required PR check pending.
2. Main pushes and all tag names, including names containing slashes, retain coverage; feature-branch push duplication is the only removed trigger class.
3. Read-only permissions, fixture mode, interpreter setting, action pins, full check commands and deadlines remain intact.
4. CI evidence must match the current PR head and merged source tree; an old green run or a cancelled installation is not a substitute.
5. A short period with no observed push run is bounded evidence, not a proof about all future events; combine it with the parsed policy and actual PR/main runs.

---

### Task 1: Narrow the trigger without changing the check job

**Files:** Modify `.github/workflows/checks.yml`; create the measured checkpoint in `docs/validation/checks-trigger-efficiency.md`; retain this approved plan in the branch.

**Interfaces:** Consumes the pinned baseline YAML. Produces exactly this event policy, with the entire rest of the parsed workflow equal to baseline:

```yaml
on:
  push:
    branches: [main]
    tags: ['**']
  pull_request:
```

- [x] Establish one managed worktree on a `codex/` branch from the reconciled main, with scoped runtime permissions and locked setup. Keep private execution evidence under ignored `data/backups/checks-trigger-efficiency/`, outside the worktree; cap retained proof at 16 MiB, excluding reconstructible installed runtimes.
- [x] Retain the baseline YAML/hash and prior same-head event evidence. Record the before-state: both unrestricted branch push and PR events launch the full job.
- [x] Apply only the proposed push filter. Using the existing Node YAML parser, verify exact event keys and values; restore only `on.push` to baseline in an in-memory copy and require deep equality of the whole remaining workflow. This checks every job/permission/step without introducing a production helper or permanent mirror test.
- [x] Run `npx vitest run tests/scripts/manual-workflow-runtime.test.ts --maxWorkers=2` with the real Python setting, and run the existing Python interpreter with `-m unittest discover -s tests/workflows -v`. Expected: all existing checks pass; no skipped or weakened assertion.
- [x] Record the trade-off and scope in the validation note. Inspect the diff and commit only the three allowlisted files.

### Task 2: Verify the real feature-branch and PR paths

**Files:** `docs/validation/checks-trigger-efficiency.md` for the local checkpoint; private event/CI evidence. No further workflow change unless a reviewed correction within Task 1's exact policy is necessary.

**Interfaces:** Consumes Task 1's committed candidate; produces a bound PR/head/CI record and an independent review disposition.

- [ ] Push the approved feature branch before opening its PR. Make three read-only event queries over approximately 60 seconds. Expected: no Code checks push run for that feature-branch head. Record the observation window and any GitHub delivery delay; do not call finite absence an absolute guarantee.
- [ ] Create and attach one PR. Observe a Code checks `pull_request` run for the current head, without a companion feature-branch `push` run. Every subsequent reviewed candidate must have its own successful complete PR run.
- [ ] Require the entire unchanged Linux job to pass: Python checks, full unit suite, compiler, fixture build, main/Canada browser suites and Firefox/WebKit compatibility. Explain any count deviation from the pinned baseline from actual evidence; do not add skips, retries or alter deadlines to obtain green output.
- [ ] Obtain one fresh-context read-only whole-branch review of event coverage, unchanged workflow safeguards, documentation and evidence binding. Root corrects material findings within the allowlisted scope, preserving unsuccessful outcomes; any changed candidate gets fresh exact-head CI.
- [ ] For an actual infrastructure failure, retain completed logs and diagnose its boundary before using an unchanged-job rerun. At most two such reruns are authorized across this entire batch, including post-merge verification. A product/test failure is investigated on its merits and is not relabeled infrastructure.
- [ ] Preserve the complete CI/review record and compare protected input/package hashes read-only. No repeat full Windows or local browser run is needed solely for a trigger/documentation change; the focused workflow checks and actual Linux pipeline verify the affected behavior.

### Task 3: Integrate, verify main coverage and complete cleanup

**Files:** Final integration/closeout in the PR and private evidence; the same three allowlisted files if the optional correction is needed.

**Interfaces:** Consumes a reviewed final head with successful full CI. Produces a verified main integration, actual archival evidence and durable proof.

- [ ] Re-read PR head/base and successful CI binding, then merge under standing permission with an expected-head guard. Fetch and fast-forward primary main, preserving unrelated work. Require the merged tree to match the PR-tested merge tree.
- [ ] Observe one automatic Code checks `push` run for the merge on `main` and require the full unchanged job to pass. Do not create test tags, direct-main commits or manual workflow dispatches. Tag coverage is verified by policy inspection and documented GitHub semantics; no live tag exercise is claimed.
- [ ] If a workflow-specific integration regression is demonstrated, approval permits one additional reviewed correction or reversion PR restricted to the same files. Use the same worktree, full CI and expected-head merge safeguards. No force-push or history rewrite. Restoring the old workflow is a safe intermediate state; it does not count as achieving the new trigger policy. A broader fix or exhausted repair allowance requires a new decision.
- [ ] Record actual PR/main runs, review disposition, merge/tree identity, changed files, limitations and unchanged data/package hashes. The final PR closeout closes the plan's execution checklist; retain failures and the full proof inventory.
- [ ] Archive only the owned managed worktree after preserving all needed proof outside it. Verify the archived artifact, physical checkout absence and Git worktree-registration absence. Keep this batch's PR(s) attached and verify primary tracked files are clean.

## Permissions requested with approval

Approval covers all three tasks without routine permission pauses:

- Root implementation; one independent final reviewer and, only if the optional post-merge repair is used, one additional independent review.
- One managed worktree, scoped process/filesystem permissions, existing locked dependency setup, temporary synthetic fixtures, normal CI system/browser downloads, read-only existing-input/package hashing and private proof up to 16 MiB.
- The named Code checks trigger change and related documentation only; GitHub feature-branch pushes, one primary public PR, normal automatically triggered CI, read-only run/log queries, at most two diagnosed unchanged-job reruns in total, reviewed merges and primary synchronization.
- One additional reviewed workflow-only correction or reversion PR if required by Task 3; no force-push, direct-main editing or new workflow.
- Proof preservation and actual native worktree cleanup. If the app's attachment limit requires space, preserve metadata and verify merged status before unlinking at most the two obsolete standalone PR chat cards #60 and #61; their GitHub PRs remain unchanged. This also permits reversible metadata-preserved handling/reattachment of this batch's own PR cards during native archival.
- The exclusions in Global constraints remain explicit. Website publication and restoration are unnecessary for this tooling batch; the verified public release stays unchanged.

## Completion criteria

The intended trigger policy is merged; the entire check job is semantically unchanged; the candidate has successful complete PR CI and actual main integration CI; independent review has no unresolved material finding; data/package fingerprints remain unchanged; proof is inventoried; the owned worktree is actually archived and removed. Record observations and limits rather than promising future runner availability or universal elimination of duplicate event deliveries.

