# Browser Setup Containment — Design and Three-Task Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root owns implementation and integration; one independent reviewer checks the whole branch. No concurrent edits. Execute only after the owner reviews and approves this combined design, all three tasks and the permission envelope. Steps use checkbox syntax.

**Status:** Owner approved all three tasks and permissions, October 23, 2026. A fresh read-only builder check returned “nothing important left”; root completed the requirements, task-interface, verification and permission self-review. Execute within the approved limits; the implementation PR records actual CI, integration and cleanup.

**Goal:** Detect stalled browser prerequisite installation early and leave enough room for the complete existing code checks, without changing application behavior or accepted data.

**Architecture:** Keep the existing single Code checks job, runner and test matrix. Move its unchanged browser installer immediately after npm ci, give that step a three-minute deadline, and change the job deadline from fifteen to twenty minutes. Verify the exact configuration delta locally and require complete real PR and main checks.

**Tech Stack:** Existing GitHub Actions, Node 24, locked Playwright 1.64.0/Vitest/YAML packages, Python 3.12+ and Windows local tooling. No new dependency, service, workflow, cache or container.

**Spec:** The Design, Global Constraints and Permissions sections below constitute the specification. The owner requested the next tasks and permissions together; approval selects the recommended approach and root implementation with independent review.

## Why this is next

Mexico publication and its owned worktree cleanup are complete. The current public release is deployment 3697e575-0dd7-4b02-8919-e76c5ddd1aa3, with four products, Canada and the qualified Mexico all-goods snapshot. Home and country pages already link both countries; an additional country directory would add little immediately. Every Mexico product/category/share/duty comparison remains withheld.

The Mexico batch recorded two browser-setup stalls before any browser assertions: PR #150 run 40024557537 reached the existing fifteen-minute job deadline, and PR #151 run 40033143332 was cancelled after setup had stalled for over six minutes with insufficient time left for the browser suites. Both were downloading Ubuntu prerequisites; unchanged-head reruns subsequently passed. These are preserved failures, not application-test failures or passing runs.

Four retained successful runs give these approximate group-to-next-group spans:

| Phase | Observed range |
| --- | --- |
| Unit suite | 204–210 seconds |
| Compiler | 25–27 seconds |
| Fixture build | About 2 seconds |
| Browser prerequisites and binary installation | 35–50 seconds |
| Main browser command | 336–379 seconds |

The latest successful main job took about thirteen minutes overall, with both browser commands together taking about eight minutes. Group boundaries include small logging/setup overheads; they are not instrumented per-process timings. These samples justify bounded setup and modest job headroom, not a claim that the package mirror is fixed or that all future runs will be faster.

## Approaches

1. **Recommended: early bounded setup in the existing environment.** Move setup ahead of the expensive checks, fail it after three minutes and allow twenty minutes for the complete job. A three-minute setup window is more than three times the slowest retained successful sample; twenty minutes leaves room for that window and roughly twelve minutes of remaining work. Trade-off: a genuinely slow but progressing installation can fail, and a later hung job can run five minutes longer than today.
2. **Use an official prebuilt Playwright container.** This could remove per-run Ubuntu prerequisite installation, but adds image identity/version management and changes the filesystem/runtime environment used by integration tests. Defer until measurements show the smaller change insufficient; it is not authorized as an automatic fallback.
3. **Only enlarge the job timeout or cache browser binaries.** A larger timeout alone spends longer on a stuck setup. A browser-binary cache would not address the observed Ubuntu-package download. Neither is the selected approach.

The official [Playwright CI guide](https://playwright.dev/docs/ci#caching-browsers) explains that Linux operating-system prerequisites still need installation when browser binaries are cached. Its supported CI setup includes the existing install --with-deps command. [GitHub runner documentation](https://docs.github.com/en/actions/reference/runners/github-hosted-runners) explains that latest is a maintained image label. This batch preserves ubuntu-latest; it does not infer that Ubuntu 26.04 caused the stalls.

## Design

Change only .github/workflows/checks.yml and the two documentation files named below:

- jobs.check.timeout-minutes becomes 20, from 15.
- Move the existing `npx playwright install --with-deps chromium firefox webkit` step immediately after the existing `npm ci` step, before unit/compiler/build/browser checks. Keep its command byte-for-byte identical.
- Give that step the name `Install browser prerequisites` and timeout-minutes: 3. Do not add continue-on-error, retries, shell fallback, background installation or partial-engine success.

Keep the preexisting packaging and retained-artifact Python checks in their current positions before npm ci. Keep all other steps in their current relative order. A failed setup is an ordinary failed job: application checks have not run, and the branch is not mergeable. A setup pass must be followed by every existing unit, compiler, build and browser command. The larger job window does not change individual test timeouts, worker counts, retries, assertions or the existing platform-specific skip.

Successful final-head PR checks and successful automatic main checks are required. Report actual setup/job durations and all outcomes, including unsuccessful attempts. Two successful jobs are a bounded checkpoint, not proof that external stalls can never recur. No artificial failure job, test tag, manual data dispatch or deliberately stalled network experiment is needed.

## Pinned baseline and protected state

Planning main: ac0335669902879c60bb25acc8276cea3ced7f73; tree e090298e69dd03cddf35766dc8f80f4c7cc70607. Tracked files are clean. The unrelated September proposal remains untracked and must stay byte-identical.

| Protected file | SHA-256 |
| --- | --- |
| .github/workflows/checks.yml, before this change | 905b7c03ea1b801413f97948f3f0f54791db8b06b132d3d3c8056a5e0c0ecba5 |
| package.json | becc2f1cded5635063a3781c12e6b519cc4999235fc891510702fab13df9dd6d |
| package-lock.json | 369164d0c2c70b3bb49bd82195d361bbddf50ef71506d7498098e83e52a89f24 |
| docs/superpowers/plans/2026-10-17-september-coffee-candidates.md | b60a52102ac4d09cb54ded1d64c993f5d9ff6203da6b71080ab60ac2d949875c |

Use only the dataFiles entries of docs/superpowers/plans/2026-10-23-mexico-all-goods-publication-inputs.json (SHA-256 5ff4868dd95f003308bd742c6a92117776a778804426fe61493e535e4eeada37) as the existing accepted-input hash allowlist. All fifteen files, totaling 19,168,534 bytes, matched during planning. This reference grants read-only identity checks, not re-execution of that older plan, data copying, recovery or provider operations.

The current verified package is retained under data/backups/mexico-all-goods-publication/verification-20261023-r1/candidate/: site.zip is 655,531 bytes, SHA-256 af29921140a66b527d68aafba8e652feeb1fc493c9c077ac71ee8ed6c35ad9ea; site-manifest.json is 10,450 bytes, SHA-256 d003fabc2af5dc53cd2a4d223c90da6cd97e99130e2aa68f04272d5a39460c71. Hash these read-only; do not rebuild, extract, upload or restore them for this tooling task.

Retained diagnosis and timing logs live under data/backups/mexico-all-goods-publication/verification-20261023-r1/: ci-pr150-attempt1-diagnosis.json, ci-pr151-attempt1-diagnosis.json and ci-pr150-attempt2.log, ci-main-runtime.log, ci-pr151-attempt2.log, ci-main-evidence.log. Read them without modifying the completed proof.

## Global Constraints

- Root owns all edits and integration; an independent whole-branch reviewer is read-only. A separate review is permitted only for the optional correction/reversion.
- Only .github/workflows/checks.yml, this plan and new docs/validation/browser-setup-containment.md may change. No tracked helper or new mirrored configuration test is needed.
- Preserve workflow name Code checks, job ID check, all events, contents: read, credential persistence off, action pins, ubuntu-latest, Node 24, Python setting, fixture mode, npm cache, all commands and artifact policy.
- The only job changes are the 20-minute job deadline and the install step's placement/name/three-minute deadline. Preserve every other step and its relative order exactly.
- Preserve all test assertions, engine coverage, retry/worker/test-timeout settings and platform guards. No skip, continue-on-error, cancellation policy, concurrency rule, path filter, extra job, cache, container or manual trigger.
- No application, data, classification, registry, deployment-template, package, lockfile, manual-data-workflow or live-site-verifier change.
- No official source request/replay, data-job dispatch, accepted-data operation, R2 operation, intake, public-site check/upload/restoration, new service, paid/access/indexing change, outreach or recurring job.
- Preserve the current public release and all accepted inputs. Keep Mexico comparisons withheld and leave the on-demand September plan's official-publication gate unchanged.
- Use one isolated codex/ worktree or clean-checkout fallback. Never reuse or remove the unrelated mexico-private-acceptance checkout at d22122a3baefa647eb5976d73bcbcc2ce51876f5.
- New private proof is capped at 16 MiB under an ignored data/backups/browser-setup-containment/ run directory, outside the owned worktree. Installed locked runtimes and reconstructible caches are excluded; no real-data copies are required.
- Re-read main and the workflow at execution. Inspect unrelated drift rather than overwriting it; changed protected data or a materially different workflow requires a revised decision.

## Review Focus

1. A prerequisite timeout must fail the job before expensive tests; absence of browser assertions cannot be reported as a test pass. Task 2 checks placement and real step conclusions.
2. Installer success must retain Chromium, Firefox and WebKit and all 411 current browser cases. Task 2 compares every preserved command and reads complete CI results.
3. A new step name or deadline must not silently alter interpreter, permissions, events, action pins or other step order. Task 2 reverses only the allowlisted delta and compares the entire parsed workflow with baseline.
4. An old green run or a cancelled same-head attempt cannot authorize merge. Tasks 2–3 bind the final PR head, merged tree and main push results explicitly.
5. Main can expose an integration failure after PR success. Task 3 preserves failure evidence and allows one narrowly reviewed correction/reversion without changing application code or test requirements.

---

### Task 1: Establish the measured boundary

**Files:** Create the baseline portion of docs/validation/browser-setup-containment.md; retain this approved plan in the isolated branch. Read the pinned workflow, package/input identities and prior logs. Private timing receipts only.

**Interfaces:** Produces a baseline receipt containing the source commit/tree, workflow identity, preserved command/order inventory, timing spans and protected-state identities. No production API or tracked helper is introduced.

- [x] Create one owned isolated checkout from reconciled main and set up only existing locked runtimes. Preserve any preexisting primary changes. Read back the approved plan before work.
- [x] Authenticate the baseline workflow, dependencies, fifteen accepted inputs, September proposal and current public ZIP/manifest. Expected: exact identities above; no accepted-data or package copy/write.
- [x] Read the two failed-setup diagnoses and four successful logs; extract setup, unit, compiler/build, browser and overall spans with UTC boundaries. Distinguish group-to-group estimates from true per-step durations. Preserve the earlier failures unchanged.
- [x] Record the evidence, proposed three-minute/20-minute budgets and limitations in the validation note. No additional baseline remote run is needed; existing successful main evidence is sufficient.

### Task 2: Apply and verify the narrow workflow change

**Files:** Modify .github/workflows/checks.yml; update the local checkpoint in docs/validation/browser-setup-containment.md. Private configuration-comparison evidence only.

**Interfaces:** Consumes Task 1's exact baseline. Produces the same workflow with only the three documented changes and a reviewed PR head whose complete required checks pass.

- [x] Move the unchanged three-engine install directly after npm ci; set its name to Install browser prerequisites and step timeout to 3; set job timeout to 20. Make no other YAML policy or command change.
- [x] With the existing YAML parser, require exactly one npm ci and one unchanged installer command, the expected new placement/name/deadlines, then normalize only those changes back to baseline: restore job timeout 15, remove the install name/timeout and return it to its original index. Require deep equality of the entire parsed workflow. Inspect the textual diff as well. This is an operator comparison, not a new permanent test mirroring the YAML.
- [x] Run `npx vitest run tests/scripts/manual-workflow-runtime.test.ts --maxWorkers=2` with SITE_PACKAGE_PYTHON pointing to the existing real Python 3.12+ executable. Run that interpreter with `-m unittest discover -s tests/workflows -v`. Expected: existing runtime checks pass; the existing POSIX-only control remains skipped only on Windows and must execute in Linux CI. Do not change tests to obtain green output.
- [ ] Commit only the three allowlisted files, push one branch and create/attach one public PR. Require the complete automatic final-head PR job: both Python suites, full unit suite, compiler, fixture build, all main/Canada/Mexico browser suites and Firefox/WebKit compatibility. Baseline: 2,324 Linux unit passes plus one existing platform skip; 25 packaging/18 workflow checks; 411 browser passes. Explain any legitimate count drift rather than forcing historical counts.
- [ ] Obtain a fresh-context whole-branch review of preserved checks, deadline/placement semantics, evidence and scope. Root resolves material findings within the allowlist. Any changed final head needs its own complete green PR check; a timeout remains failed even if a later attempt passes.
- [ ] Preserve step conclusions and setup/job durations. At most two infrastructure-only unchanged-job reruns are allowed across the whole batch, after completed logs establish the failure boundary. Do not retry an assertion failure as if it were a package-mirror stall. The earlier Mexico batch's exhausted allowances are not reused.

### Task 3: Integrate, verify main and complete cleanup

**Files:** The same three allowlisted files if the bounded repair is needed; final integration/evidence in the PR and ignored proof. No separate documentation PR is required merely to record post-merge outcomes.

**Interfaces:** Consumes a reviewed, fully passing PR head. Produces verified main integration or a documented reviewed reversion, protected-state readback, proof inventory and actual checkout cleanup.

- [ ] Re-read PR/head/base and full CI conclusions; merge under standing permission only after independent review and exact-head success. Record the tested head/tree and merged tree relationship.
- [ ] Require the actual automatic main Code checks job to complete successfully with the full preserved suite. Record its runner image, prerequisite duration, overall duration, source identity and every non-successful attempt; confirm early setup and the unchanged test matrix. No manual dispatch or extra measurement-only run is authorized.
- [ ] If a demonstrated workflow regression remains, permit one additional reviewed correction/reversion PR limited to this plan's exact delta or restoration of the baseline workflow. Require complete final-head PR and main success again. No further timeout increase, runner migration, assertion weakening or production-code repair is implicit. If the allowed repair/reruns cannot resolve the issue, preserve evidence and report the limit; do not claim completion or a fixed upstream mirror.
- [ ] Hash protected data/dependencies/proposal/package again; require unchanged identities. Synchronize primary main without disturbing unrelated work. Preserve actual outcomes and a read-back proof inventory outside the owned checkout, within 16 MiB.
- [ ] Archive the owned managed worktree and verify the archived attachment, physical checkout absence and Git-registration absence. For a clean-checkout fallback, preserve needed proof, verify its exact resolved owned root and remove only that checkout; verify filesystem/Git cleanup. Keep this batch's PR cards attached. Leave the unrelated Mexico checkout and historical proof untouched.

## Permissions requested with approval

Approval covers all three tasks without routine permission pauses:

- Root implementation, one independent final reviewer, and one additional independent review only if the optional correction/reversion is needed.
- One managed worktree or isolated clean-checkout fallback, a codex/ branch, scoped filesystem/runtime/process permissions, existing locked npm setup and normal CI browser/system-package downloads. No machine-wide settings, credentials or new dependencies.
- Read-only local hash checks of the named accepted inputs and retained package; read-only existing GitHub metadata/log queries; private receipts/logs up to 16 MiB and temporary synthetic test files created by existing suites.
- The named existing Code checks workflow edits, one primary public PR, automatic PR/main CI, reviewed merge and main synchronization. Up to four distinct candidate heads across the primary and optional repair PRs; up to two diagnosed unchanged-job infrastructure reruns in total. No forced pushes, direct-main edits, test tags or new workflow.
- One additional narrowly reviewed workflow correction/reversion PR under Task 3's failure rule, with complete required checks and standing merge permission.
- Public, sanitized validation documentation and GitHub closeout evidence; preserve private filesystem/credential/owner envelopes outside Git and served files.
- Actual cleanup of owned temporary files/processes/checkout after preserving needed proof. At the current 99-attachment count, if capacity requires it, verify merged status and preserve metadata before unlinking at most three obsolete standalone PR chat cards: #67, #68 and #69. Their GitHub PRs stay available and unchanged. Reversible metadata-preserved handling/reattachment of this batch's own PR cards during native archival is also permitted.
- No imports, source requests, raw replay, data acceptance/replacement/intake, R2 operations, website publication/restoration, paid upgrade, access/indexing change, outreach or recurring job. The public Mexico all-goods qualification and withheld comparisons stay unchanged.

## Completion criteria

The reviewed workflow delta is merged; final-head PR and actual main CI execute every required check successfully; timing and all failed attempts are recorded honestly; all protected identities remain unchanged; proof is inventoried and read back; and the owned checkout is actually cleaned up. A reviewed reversion is reported as a reversion rather than delivery of the proposed improvement. If external setup delays persist, report that limit without promising network reliability.
