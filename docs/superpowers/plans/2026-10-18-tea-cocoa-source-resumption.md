# Tea and Cocoa Source Resumption — Design and Five-Task Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root owns implementation, dispatches, integration and cleanup. Independent reviewer subagents own separate analysis/calculation outputs; never concurrently edit shared files. Planning is authorized; execution requires the owner's review and approval of this document.

**Goal:** Obtain independently verified, recoverable August 2026 source candidates for tea and cocoa, or preserve bounded evidence explaining why a member remains withheld.

**Architecture:** Reuse the repaired importer and existing manual workflows. Align these two workflows' unit-test scheduling with ordinary CI, then perform one newly authorized source-reaching execution per required operation. Keep results in isolated private evidence; successful source assessment does not install or publish an accepted product release.

**Tech Stack:** Existing locked Node 24, TypeScript, Python, GitHub Actions and Census clients. No new dependency, service, credentials or scheduled operation.

**Spec:** This combined design, task plan and permission envelope continues the source-assessment stage of `docs/superpowers/plans/2026-10-17-product-and-country-expansion.md` and the existing product research design. The owner requested one reviewable plan with all execution permissions. This narrower batch grants no archive-initialization or publication operation.

## Recommendation and baseline

Complete source evidence first. An end-to-end batch would additionally re-fetch Census during R2 initialization and require independent assessment of that second capture. Those operations are unnecessary to answer the unresolved question: can a complete, valid source candidate be obtained?

| Member | Established evidence | New work here |
| --- | --- | --- |
| Cocoa 180100 | Complete 24-month duty audit: 96 records, 784 independently matched observations, zero discrepancies. Eight later diagnostic requests verified four boundary month/direction pairs. | Reauthenticate the retained audit; one fresh full import. The boundary probe does not establish full coverage. |
| Tea 090240 | 23 complete duty-audit months. February 2026 has HS only; three other tables are missing. Its retry failed tests before retrieval. No merchandise import ran. | One complete fresh duty audit; only after independent acceptance, one fresh full import. Never fill February from another run. |

Planning main is `1559e0233216ba206afbc43e3659588225e7731d`, merged [PR #126](https://github.com/Vasuki8/us-trade-tracker/pull/126). Its failure-evidence repair did not prove the historical transport cause. Completed repair proof seal: SHA-256 `82a2819eef313332006598bd22ed2ff96af3039008ce976221fd7c667bcfc4ad`.

Both products are already importable, unpublished and duties-unaccepted. Their reviewed classification intervals cover September 2021–August 2026. Reuse authenticated evidence; no new classification downloads or interval extensions.

Previous intake retries and the eight-request diagnostic allowance remain exhausted. Approval creates only the new budget below.

## Global constraints

- Merchandise: September 2021–August 2026, 60 months, imports/exports, HS/HSCY. Duties: September 2024–August 2026, 24 months, imports, HS/HSCY/HSRP/HSCYRP.
- Preserve queries, two import workers, audit sequencing, 30-second request signals, existing HTTP retries/backoff, validation, cancellation, locks, raw envelopes and atomic promotion.
- Change only the two named manual workflows' unit-test commands to `npm test -- --maxWorkers=2`. Keep assertions, deadlines, action pins, interpreters, permissions, triggers, concurrency and 20-minute job limits.
- Preserve seven accepted/eleven protected input identities and previous proof. The separate September plan retains SHA-256 `b60a52102ac4d09cb54ded1d64c993f5d9ff6203da6b71080ab60ac2d949875c`.
- Keep `published=false`, `dutiesAccepted=false`, deployment selection, canonical new-product roots, coffee/Canada inputs and the live site unchanged. Runner-local and isolated recovery pointers are not project acceptance.
- Use fresh ignored proof under `data/backups/tea-cocoa-resumption/verification-20261018-r1/`. Refuse occupied output; record a fresh numbered sibling if necessary.
- Retain artifacts before seven-day expiry. Originals: at most 512 MiB per product. All new local proof/copies: at most 2 GiB. Stop before exceeding caps.
- Validate ZIP paths, duplicates, links, member counts and declared/actual lengths before extraction. Complete import inputs retain archive limits: 32 MiB/member, 64 MiB decoded aggregate, 96 MiB encoded bundle. Audit/failure extraction also stays within 64 MiB decoded per artifact.
- A complete source-import artifact has 338 files: pointer, release and 336 captures. A complete audit has 98 files: report, dataset and 96 captures. The separate failure artifact has a report plus at most 336 captures. Directory entries do not count as files; reject unexpected file identities.
- The import failure cap is 64 MiB for retained report plus captures. It is not a streaming-response, runner-memory or successful-artifact cap. Hard termination/storage failure may prevent diagnostics.

## New data-job budget

Dispatch existing workflows on reviewed `main`, verifying the actual run commit and exact inputs. Run at most one source data job at a time, including across the different audit/import concurrency groups; check for an existing source job before each dispatch.

| Operation | Exact inputs beyond reviewed main | Source-reaching executions | Logical contexts | Client fetch-attempt ceiling |
| --- | --- | ---: | ---: | ---: |
| Cocoa import — `import-census.yml` | `product_code=180100`, `reporting_month=2026-08`, `include_duties=true`, `archive_to_r2=false`, `initialize_archive=false`, `candidate_only=false` | 1 | 336 | 1,008 |
| Tea audit — `audit-census-duties.yml` | `product_code=090240`, `reporting_month=2026-08` | 1 | 96 | 288 |
| Tea import — `import-census.yml`, only after independent acceptance of its fresh audit | Same import flags as cocoa, `product_code=090240` | 1 | 336 | 1,008 |
| Maximum | No fresh cocoa audit or diagnostic probe | **3** | **768** | **2,304** |

Each import has 240 merchandise plus 96 duty contexts. A context permits at most three explicit client fetch attempts, only retrying 429/5xx responses. Transport/body/JSON/validation failures gain no retry. These are ceilings, not actual-count claims. Existing default redirect following is unchanged; redirected wire requests are not independently counted, so 2,304 is not a guaranteed wire-request count. No new redirect policy or wire-request counter is introduced.

**Pre-source replacement:** Permit one replacement dispatch per table row only when authenticated terminal step metadata/logs prove retrieval was skipped after installation/test failure, with zero Census requests. First reproduce/pass unchanged prerequisite checks and verify reviewed main. Maximum six data workflow attempts, still only three source-reaching executions/2,304 explicit client fetch attempts. A missing artifact, cancellation, uncertain execution or started retrieval step does not qualify. No retry after any source-reaching failure, even without an artifact.

Keep each workflow's existing 20-minute whole-job limit, including setup/tests. Six attempts bound active data-job time to 120 job-minutes; queue, ordinary CI and human authentication time are separate. This does not promise completion when requests approach their deadlines.

A member's source failure consumes its source allowance. Preserve its evidence and continue only other eligible operations within this table. Credential exposure, explicit account/access restrictions or an unsafe shared environment stop all further dispatches. A failed month/status alone does not prove a transient service incident.

## Complete permission envelope

Approval covers all five tasks without routine permission pauses:

1. Root execution and independent reviewers; one managed worktree reused across two `codex/` branch/PR phases; scoped filesystem/runtime/network permissions; existing pinned runtime/locked installs; offline tests and bounded private copies/calculations.
2. The exact two-workflow scheduling change and regression checks in Task 1. No importer/query/retry/timeout change or broader reliability redesign.
3. Existing GitHub dispatches and narrowly conditional pre-source replacements within the table. Use existing `CENSUS_API_KEY` only in existing retrieval steps. Do not reveal, create, copy into chat/local files or broaden credentials.
4. Authenticated run/log/artifact reads and bounded downloads; safe private extraction; read-only retained cocoa/classification evidence; replay of new captures; offline bundling and two isolated recoveries per complete candidate. No provider calls during replay/recovery.
5. Public sanitized code/documents, GitHub pushes, up to two PRs, existing exact-head CI, independent review and reviewed merges under standing permission. Do not describe public-repository Actions artifacts as private.
6. Proof preservation; stopping owned processes; removal of owned disposable caches after preservation; recoverable native archive of the owned worktree. If capacity requires it, preserve and unlink up to three obsolete merged standalone PR chat references; never modify/delete their GitHub PRs. Temporary detachment/restoration of this batch's own merged PR cards is permitted.
7. Existing standard GitHub runner/artifact usage under current repository policy. No billing change, paid-runner upgrade or new paid service; stop if one is required.

Excluded: R2 reads/writes or initialization/readback jobs; canonical data installation/replacement; product activation; site packaging/publication/restoration; Mexico/another product/country; September/later requests; new reference campaigns, dependencies/actions/services; source-bearing reruns or extra probes; timeout/cap increases; access/indexing changes; outreach, analytics and recurring jobs. The separate November coffee plan remains unchanged and gated.

Human-only authentication, changed scope/identity or exhausted caps can still require input. Elapsed time is not approval.

## Review focus

1. Prove skipped retrieval before using the zero-source replacement allowance (Tasks 1–3).
2. Never stitch tea's partial audit or cocoa's boundary probe into complete coverage (Tasks 2–4).
3. Verify same-August captures against their own responses and preserve legitimate revision differences (Tasks 2–4).
4. Preserve missingness, 204 country responses, unique grain and RP70/79 qualifications; zero duty does not imply duty-free treatment (Tasks 2–4).
5. Withhold readiness for unsafe/truncated artifacts, wrong product/run binding, unavailable evidence or failed recovery (Tasks 3–5).

## Task 1: Prepare the manual jobs without source access

**Files:** Modify `.github/workflows/import-census.yml`, `.github/workflows/audit-census-duties.yml` and `tests/scripts/manual-workflow-runtime.test.ts`. Include this approved plan in the preflight PR. Consume existing failure-evidence/product/archive tests without weakening contracts.

**Interface:** Both affected test steps run `npm test -- --maxWorkers=2` with existing `SITE_PACKAGE_PYTHON=python3`. Source commands/inputs remain byte-identical. Output: an observed reviewed-main commit/tree.

- [ ] Authenticate repair proof/input pins; verify previous worktree and canonical new-product roots are absent. Record hashes, budget and owned paths in fresh proof. Preserve the separate September plan.
- [ ] Add two parsed-workflow regression cases asserting exactly one test command per named job, the two-worker command and retained interpreter/job limits. Run RED before changing YAML; keep discovery of other workflows intact.
- [ ] Change only those two `run` values. Verify the parsed workflow diff has no other behavioral change. Run focused manual-runtime, failure-context/evidence/workflow and product-workflow suites GREEN, then `npm run check` and the full suite. One worker locally is permitted for existing disk contention; assertions/deadlines stay unchanged. Ordinary CI stays at two.
- [ ] Obtain independent review; push/attach the preflight PR; require successful push/PR CI on its exact head; merge with expected-head protection. Verify merged source-step/runtime hashes match the reviewed tree before dispatch. Create the evidence branch from that main in the same worktree.

**Deliverable:** Reviewed setup and a fixed processing identity; zero source requests so far.

## Task 2: Establish independent duty-audit prerequisites

**Inputs:** Retained cocoa audit run `39046703861`, original digest `e498b4f8cd9e72611c404f123b794d9138f0635a74a59889eb5f7524242ccd23`; retained classification evidence; one fresh tea audit.

**Interface:** Product-specific readiness receipts bind window, run/attempt/commit, artifact/member hashes, independent review and qualifications. They authorize only Task 3's source import.

- [ ] Reauthenticate retained complete cocoa audit and independent calculation receipt against previous proof, preserving capture dates/processing commit. If authentication fails, withhold cocoa; do not dispatch another audit.
- [ ] Run the fresh tea audit, recording actual head, inputs, steps and outcome. Authenticate its original artifact promptly and inspect all 96 expected contexts. Incomplete results withhold tea; only the documented zero-source replacement is allowed.
- [ ] An independent calculator verifies each fresh tea record without production normalizers: product/month/summary, unique headers/grains, exact integers, world/country and RP reconciliation, zeros/missingness and qualifications. Synthetic controls cover duplicate grain, missing table, unavailable value and RP qualification. Root owns originals; reviewer owns separate `independent/090240/` calculator/results.
- [ ] Preserve old tea findings and every failed month. The audit retains completed captures and generic month errors; the new detailed import-failure report is not wired to this audit. Do not extend it here.

**Deliverable:** Reauthenticated cocoa audit and passing fresh tea audit, or explicit member-specific withholding. No accepted product/R2 change.

## Task 3: Run one fresh instrumented import per eligible member

**Operations:** Existing artifact-only workflow with exact table inputs. Cocoa proceeds after retained-audit authentication; tea only after independent fresh-audit acceptance. Run cocoa first among eligible imports. Offline audit analysis may overlap a source job; source jobs never overlap.

**Interface:** Success supplies original artifact, runner-local pointer/release and 336 raw records bound to observed run/attempt/commit. Failure supplies actual outcome and any authenticated bounded diagnostic, never a synthetic complete release.

- [ ] Check ledger, reviewed main, exact flags, secret boundary and absence of another source job. Dispatch once. Record known attempts without inferring exact HTTP counts from retained captures.
- [ ] On success, authenticate digest/member paths/sizes; check for credential-bearing URLs, tokens/header patterns and private paths without retrieving the secret. The producer's exact-key guards remain in force. Stage only that product in a fresh isolated input root; require one referenced schema-v2 release and complete 336-record grid. Canonical roots remain absent.
- [ ] On failure, preserve logs/outcome and any separately named ready failure artifact. Verify report/capture hashes, bytes, run/product binding and omissions before diagnosis. Missing/truncated diagnostics remain a limitation, not proof of zero requests.
- [ ] Consume that member's source allowance on any source-reaching failure/uncertain execution. No old probe rerun, capture stitching, query/retry/deadline change or hidden source retry. Continue only other eligible operations within the ledger.

**Deliverable:** Complete authenticated candidates or bounded failure evidence; no further source attempt implied.

## Task 4: Independently assess and recover candidates offline

**Interfaces:** Consume `scripts/archive-product.ts`, `scripts/archive-release.ts` and `scripts/archive-bundle.ts` unchanged. Root owns packing/recovery; independent reviewers own arithmetic in separate per-product directories. A schema-v2 bundle contains 337 payload files: one release plus 336 captures. The original Actions artifact additionally has its separate pointer.

- [ ] Independently replay all 240 merchandise/96 duty records per complete import: requested contexts, descriptions, statuses, integer measures, unique grains, world/country totals and RP aggregation. Compare every normalized observation/qualification to this capture's responses. Never copy old values or force agreement between dates.
- [ ] Run existing offline commands with proof-owned fresh paths:

      npm run data:archive -- pack --product <code> --data-dir <isolated-data-root> --run-dir <fresh-package-root>
      npm run data:archive -- recover --product <code> --bundle <bundle.json> --sha256 <observed-sha256> --data-dir <fresh-recovery-root>

  Recover twice into different new roots. Compare all raw/release/pointer bytes/hashes and product/window binding. Reject corruption, wrong identity and extra/missing files. Confirm these paths create no provider client and make no network request.
- [ ] Bind independent results, calculator/packer/recovery identities and actual data/code hashes. Preserve missingness and RP70/79 qualifications. Readiness requires zero unexplained discrepancies and two exact recoveries.
- [ ] Any mismatch/resource failure withholds readiness. Preserve the result; no canonical installation, initialization, flag change or public route follows.

**Deliverable:** Independently verified recoverable source-ready candidates, or explicit failures. This is not an accepted archived/public release.

## Task 5: Report, integrate and complete actual cleanup

**Files:** Create `docs/data-validation/tea-cocoa-resumption-20261018.md` and `tea-cocoa-resumption-20261018-evidence.json` beside it. Add a short follow-up link to `product-expansion-20261017.md` without rewriting its historical failures. Private proof retains originals, ledger, calculations, diagnostics and recoveries.

- [ ] Report actual outcomes with run/attempt/head/digest identities, coverage, discrepancies, qualifications, recovery and source-ready status. Keep archive acceptance/publication false. Name failed gates/uncertainties; never publish raw bodies, bundles, private paths, signed URLs, credentials or invented request counts.
- [ ] Self-review all five Review Focus cases and obtain independent whole-branch/evidence review. Integrate findings; run relevant JSON/binding checks and existing exact-head CI; merge only the reviewed tested report head. No data reruns while fixing report/test feedback.
- [ ] Reauthenticate accepted/protected inputs, prior proof seals and separate September plan. Confirm canonical new-product roots, flags and selection were untouched, and the operation ledger contains no site/R2 operation. Make no live-site request or deployment claim about changes by others. Preserve proof outside the worktree before stopping owned processes/removing disposable caches.
- [ ] Natively archive only the owned worktree. Resolve capacity with preserved authorized references, restore temporarily detached current PR cards, and verify archived attachment plus checkout/Git-registration absence. Seal final proof after those observations.

**Deliverable:** Reviewed merged results, durable proof and actual cleanup. Passing members can proceed to a separately reviewed archive-initialization/readback/publication scope; none of those operations execute here.

## Self-review and handoff

Duty prerequisites → Task 2; fresh complete retrieval → Task 3; independent arithmetic/exact recovery → Task 4; setup/integration/cleanup → Tasks 1 and 5. Every Review Focus condition has an owning check. Old failures/budgets remain distinct; same-release captures do not prove a successive release.

Independent read-only plan review found no blocking issues. Its precision clarification—count explicit client fetch attempts rather than unobserved redirect wire requests—is incorporated. Planning ran no imports, source replay, tests or provider operations.

Approval covers this design, all five tasks, root-plus-independent-review execution and complete permission envelope. Execute applicable tasks without routine approval pauses. No implementation, dispatch, new source replay, R2 operation or publication starts during planning.
