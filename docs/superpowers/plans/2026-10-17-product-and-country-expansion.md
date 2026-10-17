# Product and Country Expansion Design and Six-Task Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root implements and operates the batch; independent reviewers verify source/recovery evidence and the final branch. Track the checkbox steps. Planning is authorized now; execution requires the owner's review and approval of this document.

**Goal:** Add two independently verified product profiles and their reported partner-country data, and establish whether the retained national sources support a subsequent Mexico country profile.

**Architecture:** Reuse the existing product importer, archive, profiles, comparisons, briefings and static delivery. Add no new product interface or public country system. Assess Mexico offline in isolated private evidence, first at four boundary contexts, then at the remaining 44 only if those pass. Product publication and Mexico feasibility are separate outcomes; a passing arithmetic diagnostic does not accept a country release.

**Tech Stack:** Existing locked Node 24, TypeScript/Astro/React, bundled Python and Windows worker controls, GitHub Actions, private R2 Standard storage and the existing Free Cloudflare Pages project. No new dependency, service or recurring job.

**Spec:** This combined design, permission envelope and task plan implements the product/country research requirements in `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md`. The owner explicitly requested a concrete plan with all execution permissions for one review, overriding separate design/plan handoffs. Execution method remains root implementation with independent reviewer subagents.

## Recommendation and intended outcome

The goal is useful breadth for people researching U.S. goods trade, while preserving the minimal-content presentation and existing numerical qualifications. Product choice is delegated to the agent; commercial demand for this particular cohort remains unproven.

| Proposed item | Scope of this batch | Acceptance boundary |
| --- | --- | --- |
| HS 090240: other black and partly fermented tea | 60 merchandise months, 24 duty months, both trade directions and all reported partner countries | Publish only after its own classification, source, recovery, archive and browser checks pass |
| HS 180100: cocoa beans | The same product-specific intake and checks | The same acceptance boundary |
| Mexico, Census country 2010 | Offline September 2024–August 2026 national-source assessment | Four boundary contexts first; remaining 44 conditional on their success. No accepted Mexico pointer, public page or R2 country archive |

The [2026 tea schedule](https://www.census.gov/foreign-trade/schedules/b/2026/c09.pdf), [cocoa schedule](https://www.census.gov/foreign-trade/schedules/b/2026/c18.pdf) and [Census country list](https://www.census.gov/foreign-trade/schedules/c/countrycode.html) establish the current identities, checked October 17, 2026, America/Toronto. They do not establish historical classification continuity or complete observations. Tea 090240 is not the small-pack tea category 090230; retain the official description beside its short display name.

Recommended over adding more coffee variants: two non-coffee products exercise existing shared behavior and offer broader research coverage with a small named cohort. Recommended over several new country profiles: the current country contracts explicitly bind Canada and its evidence. Generalizing them before observing Mexico would add substantial unproven work. No substitute product or country is authorized if a selected item fails.

Each published new product brings reported partner-country comparisons, including Mexico when its observations exist. This is distinct from a country-wide Mexico profile. A later Mexico acceptance/profile design will use the observed results and actual selected classifications. The November 4 coffee successor plan stays separately approved, unchanged and release-gated; this batch targets August and creates no wakeup or scheduled operation.

## Planning baseline and constraints

- Planning main: `81c05bbd87ddf70100b3426b48c5e97d671ad22b` (merged PR121). Its runtime is `ca10173f7597ce7000dc6944525c4d824e23f82c`; the remainder adds validation documentation.
- Content-pass worktree cleanup is complete. Native archive, checkout absence and Git-registration absence are recorded in private `data/backups/minimal-content/verification-20261017-r1/post-finalization.json`, SHA-256 `01f01023e5c109e9dc692b60f7cb35a42798904af143c504d18b3e33cf0db570`. It authenticates the earlier seal `61d98e6800c1fcc4d8bdd523966a50dd8b64f607870d3b86e9a8610b5118c3f2` and all 243 sealed files. Reauthenticate at execution start.
- Preserve the seven existing accepted inputs, eleven protected inputs, previous private proof and all existing coffee/Canada R2 state. Existing coffee reporting month stays August 2026; Canada's accepted historical snapshot stays September 2024–August 2026.
- The separate untracked September candidate plan must retain SHA-256 `b60a52102ac4d09cb54ded1d64c993f5d9ff6203da6b71080ab60ac2d949875c`. Never accidentally add it to this batch's commits.
- Latest verified production at planning: `939c5821-40a3-40c2-9433-4353a97f9d00`; canonical origin `https://us-trade-tracker.pages.dev`. Current package: 31 files, 1,909,036 raw bytes, ZIP SHA-256 `0c9e7f43877fe654bd8bef5402fb301e4085f4be9d5033ac9229346a38b036aa`, manifest SHA-256 `63ceca7f3f5896631ff59a97fead24a673f2b659fcf7d8dbf426684bc207f2ff`. Observe the production binding again before uploading. Unexpected unrelated source/data/deployment changes require reassessment.
- Pages/chart data stay together on the static host. Downloads remain generated in the browser. R2 stays private backup storage. Preserve concise introductions, expandable reference detail, visible sources/critical caveats, keyboard/static behavior and complete print explanations.
- Missing observations remain missing. Duties use matching consumption-value denominators; rolling shares divide sums. RP70/79 qualifications remain. Never relax a source, classification, recovery or comparison check to obtain a passing result.
- Publish only independently accepted members of the named two-product cohort. A failed member remains unpublished and its failure is reported; no automatic replacement. If neither passes, do not publish an expanded site.

## Complete permission envelope for review

Full approval permits all six tasks without routine approval pauses:

1. Root execution, independent reviewer subagents, managed worktrees and `codex/` branches, scoped filesystem/runtime/network permissions, existing pinned runtime setup and locked installs, local previews, tests, browser/PDF/package checks, private evidence and backups. No dependency/action version changes.
2. Review retained classification records and up to 24 additional official Census/USITC reference documents, at most 128 MiB downloaded. Establish September 2021–August 2026 compatibility separately for the two products. Add only their registry/evidence/interval entries; do not extend existing coffee intervals.
3. Dispatch the existing two manual workflows for the exact products/month and the existing archive readback workflow, as specified below. Use the existing GitHub secrets, including CENSUS_API_KEY and existing R2 credentials, within their workflows. Do not reveal, copy into chat, create or broaden credentials.
4. Prepare isolated new-product candidates, independently replay all retained source records, perform offline recovery and, after source acceptance, initialize only their new private product archives. Permit fresh source retrieval during those initialization jobs and independently assess the actual resulting releases before publication. Write accepted local data only under `data/products/090240/` and `data/products/180100/` after their gates pass; existing accepted files remain byte-identical.
5. Before R2 writes, check current account/bucket storage and current Standard pricing. Allow at most 256 MiB new stored bytes across this batch, including failed candidates, at most 20,000 combined storage requests, and projected bucket storage strictly below 100,000,000,000 bytes (100 GB). Existing-account metered R2 usage is authorized up to US$5 incremental charges for this batch; this is a ceiling, not an expected bill. Continued retention of those bounded backups uses existing Standard storage rates. Stop if the caps cannot be verified. No billing-plan, storage-class, account-budget, lifecycle, public-access, bucket or domain change.
6. Authenticate/read the retained national ZIPs and layouts locally for the Mexico assessment. No Mexico source download, API query, full ZIP extraction, duplicate ZIP-body copy, R2 operation, accepted-data write, classification acceptance or public profile. Private worker scripts and synthetic controls may be created for this single bounded assessment; do not generalize the production Canada interfaces.
7. Commit/push public code and sanitized evidence, create/attach PRs, run existing CI, fix in-scope failures, obtain independent review and merge tested heads under standing merge permission. No raw bodies, bundles, private paths, signed URLs or secrets in public Git/Actions evidence. The two existing import/audit workflows already retain product-source artifacts; use their existing artifact policy without broadening permissions or claiming artifacts are private.
8. Publish one verified expanded package to the existing Free `us-trade-tracker` Pages project; preserve and authenticate the observed verified predecessor first. Run bounded read-only canonical/deployment verification and public browser checks. Restore that predecessor automatically if the update regresses; verify restoration, then allow one in-scope reviewed publication repair and one republish. If it still fails, retain the restored site and report the failure.
9. Preserve proof before stopping owned processes, removing owned caches and natively archiving owned worktrees. If attachment capacity blocks operations, preserve and unlink up to four obsolete merged standalone PR chat references. Never delete or change those GitHub PRs, other worktrees, original archives or previous proof. Observe actual checkout/registration absence; a queued result is not cleanup completion.

No additional products/countries, full Mexico release acceptance, import beyond August, coffee/Canada replacement, new UI feature, public R2 delivery, paid service/plan upgrade, outreach, analytics, account/access/indexing change or recurring job is included. Authentication that requires the human and a materially different source/contract/capacity situation can still require input; elapsed time is not approval.

The [R2 price page](https://developers.cloudflare.com/r2/pricing/), checked October 17, lists Standard storage at US$0.015/GB-month, metered operations, monthly allowances and billable-unit rounding. Account-wide allowance availability is unverified. Do not promise free operation or infer current usage from the historical 7.98 GB observation.

## Fixed data-job contract

Run only on reviewed `main`, with `product_code` 090240 or 180100 and `reporting_month=2026-08`:

| Operation | Workflow and exact additional inputs | Primary dispatches |
| --- | --- | ---: |
| Independent 24-month duty audit | `audit-census-duties.yml` | 1 per product |
| Source-acceptance import | `import-census.yml`: `include_duties=true`, `archive_to_r2=false`, `initialize_archive=false`, `candidate_only=false` | 1 per product |
| New archive initialization, after source acceptance | `import-census.yml`: `include_duties=true`, `archive_to_r2=true`, `initialize_archive=true`, `candidate_only=false` | 1 per accepted product |
| Independent archive readback | `verify-archive.yml`: `product_code`, `reporting_month=2026-08` | 1 per initialized product |

At most eight primary dispatches. One retry of a failed operation is permitted only after a verified in-scope tooling/transport repair or confirmed transient service failure; never retry to hide a source mismatch. At most sixteen dispatches total. Reassess after one repair if the same failure persists. Keep existing workflow timeouts/concurrency/transport retries unchanged.

For both products, primary Census work is at most 1,536 logical source requests: two 96-record audits plus four 336-record imports. Existing clients permit three HTTP attempts on retryable responses; the full dispatch retry allowance therefore bounds those Census attempts at 9,216. Reference reads, CI and R2 operations have their separate limits. Merchandise covers September 2021–August 2026 (60 months, two directions); duty history covers September 2024–August 2026 (24 months, imports only). Preserve actual attempt and response identities, including 204 country responses.

Initialization re-fetches Census data and can conditionally select a new-product archive pointer before the later independent assessment. This is authorized only for the previously absent new namespace; it is not authorization to publish that release. If later assessment fails, quarantine the product, leave it unpublished and preserve the remote outcome; do not overwrite or delete the evidence. Never run initialization against an existing unexpected current pointer. Candidate-only mode cannot bootstrap an absent archive.

## Review focus

1. A current HS6 description is not historical continuity: wrong-year/code and cross-boundary transfers must withhold the compatibility interval (Task 1).
2. Zero duty or absent country rows must not become duty-free/completeness claims; retain rate-provision aggregation, integer arithmetic and matching consumption denominators (Tasks 2–3).
3. A second August capture can contain revisions: recover and independently assess the exact initialized bundle rather than silently reusing earlier audit values or pins (Task 3).
4. Another country's detailed records must never enter Mexico totals, and duplicate global grain keys must fail even outside Mexico; country-wide classification acceptance remains withheld (Task 4).
5. A larger package must retain every authenticity, same-origin, private-404 and timeout check; rejected or unpublished products must not leak into routes, selections or briefings (Tasks 5–6).

## Task 1: Review the two identities and enable intake only

**Files:** Modify `src/lib/trade/product-registry.ts`; create `data/classification/090240.json`, `data/classification/180100.json`, and separate `docs/data-validation/090240-classification-evidence.json`, `docs/data-validation/180100-classification-evidence.json`; create `docs/data-validation/product-expansion-20261017.md`. Tests: `tests/trade/product-registry.test.ts`, `tests/scripts/product-workflow.test.ts` and `tests/scripts/classification.test.ts`. A wording-only change to the duty workflow input description may name the expanded reviewed set; no workflow behavior/action/permission/timeout changes.

**Interface:** Append `{code,displayName,importable:true,published:false,dutiesAccepted:false}` in cohort order 090240,180100. Each interval has the existing `[{from:'2021-09',to:'2026-08',evidenceUrl:...}]` shape, only after evidence supports it. Existing entries stay unchanged.

- [ ] Authenticate the completed content-pass proof, seven accepted/eleven protected identities and separate September plan. Record planning/working heads and owned paths in a fresh ignored expansion proof directory. Revalidate current import/archive contracts before dispatching anything.
- [ ] Authenticate retained 2021–2026 import/export concordances using their recorded pins, independently extract both new prefixes, and review relevant official changes within the reference budget. Document code transfers, exact descriptions, sources and interval limits. If five-year compatibility cannot be established, withhold that member; do not shorten coverage or substitute a product silently.
- [ ] Add synthetic assertions that both new products permit import while remaining unpublished/duties-unaccepted; unknown codes still fail; wrong-year/cross-HS6 classification evidence does not establish continuity; August clipping does not authorize September.
- [ ] Run `npm test -- tests/trade/product-registry.test.ts tests/scripts/product-workflow.test.ts tests/scripts/classification.test.ts` RED/GREEN for changed behavior. Run `npm run check` and independent review, then push one intake PR, attach it, require passing push/PR CI on its exact head and merge. No data job before that merge.

**Deliverable:** Reviewed intake identities and historical intervals, with no new public profile.

## Task 2: Retrieve and independently accept product source evidence

**Files/operations:** Existing `.github/workflows/audit-census-duties.yml`, `.github/workflows/import-census.yml`, `scripts/census-client.ts`, `scripts/census-duty-client.ts`, `scripts/prepare-release.ts`, `scripts/archive-bundle.ts`; private `data/backups/product-expansion/verification-20261017-r1/<code>/`; sanitized report from Task 1. Production importer changes are limited to one reproduced in-scope defect if encountered, with focused tests/review before any retry.

**Interface:** Each product supplies its own authenticated duty-audit artifact and source-import artifact, raw identities, exact normalized observations, release/pointer and an independently verified offline recovery. Artifact/run/source commits must be recorded explicitly; source artifacts are not assumed to be private. Original product evidence is capped at 512 MiB per product locally and all new private files at 2 GiB across this batch; shared national ZIP bodies are excluded because they are neither created nor copied. Stop and reassess if originals alone exceed this bound.

- [ ] Dispatch the duty audit and artifact-only import per the fixed contract. Run sequentially, preserving failures and actual URLs/run IDs. Authenticate original artifact digests and member paths before extraction; download before existing retention expires. Scan produced evidence for credential leakage before public reuse.
- [ ] Independently replay all 240 merchandise and 96 duty records per source import, plus the separate 96-record audit. Verify product/month/direction/grain, exact integer values, country/world reconciliation, RP aggregation, descriptions, zeros and missingness. A duty audit and import are separate captures of the same reporting release, not successive releases.
- [ ] Build an offline bundle from the accepted source import and recover twice into fresh isolated roots. Compare every member, release and pointer byte for byte; require zero source/provider calls. Do not write canonical new-product files yet.
- [ ] Have an independent reviewer check the source/recovery arithmetic and evidence binding. Report any differences between captures against their own original responses. Failed members do not progress to archive initialization.

**Deliverable:** Independently assessed source candidates with retained originals, or explicit failures. Existing accepted state remains unchanged.

## Task 3: Initialize and verify only the new product backups

**Files/operations:** Existing `scripts/archive-inputs.ts`, `scripts/archive-product.ts`, product archive libraries and the two existing import/readback workflows. New R2 namespaces only: `trade/v1/products/090240/`, `trade/v1/products/180100/`. New local canonical roots only: `data/products/<code>/`. Extend the sanitized acceptance report with actual identities.

**Interface:** A ready product provides `code`, actual August reporting month, exact canonical pointer/release `{path,bytes,sha256}`, processing commit, recovered bundle/candidate identities, R2 outcome and independent selected-state readback. These observed identities become Task 5's committed selection pins.

- [ ] Observe current private bucket capacity, Standard class and account usage/rates; calculate projected bytes and operation/charge ceilings including retries. Verify each target current pointer is absent. If capacity, cost or namespace identity is uncertain, stop this operation and preserve Task 2 results.
- [ ] Dispatch the initialization import. Retain its backed-up bundle/candidate and promotion outcome; do not infer remote acceptance from upload success. Authenticate and independently replay/recover the actual initialized release, including every source record. Preserve any revisions against the earlier capture instead of forcing equality.
- [ ] Dispatch read-only archive verification, authenticate the returned artifact and match remote selected identity, recovered pointer/release/raw bytes and the actual initialized bundle. Repeat recovery into an independent fresh local root. Require the same integrity and missingness rules as Task 2.
- [ ] Obtain independent source/archive review. Install passing canonical inputs only in their new product roots; freeze their exact pointers/releases for publication. Reauthenticate all existing seven/eleven identities. Failed members stay unpublished; do not delete their archive evidence.

**Deliverable:** Durable verified new-product inputs, independently recoverable and ready for an explicitly pinned site build.

## Task 4: Assess Mexico from retained national sources

**Files:** New private scripts/tests/results under `data/backups/mexico-country-audit/expansion-20261017-r1/`; public summary `docs/data-validation/2010-feasibility.md` and sanitized `2010-feasibility-evidence.json`. Read existing `scripts/country_bulk/{contracts,model,sources,runner}.py` as reference. Do not edit or weaken the production Canada parser, workers, acceptance contracts, country registry/routes or archive system.

**Interface:** The private probe accepts only country 2010 and the 48 fixed direction/month contexts. `probe_context(path,context,layout,limits)` returns identity-bound HS6 rows, exact separate country control, residual, selected-member identities, global detail-key count, zero/special counts and limitations. A summarized result contains `feasibility`, `validContexts`, `failedContexts`, `residuals`, `sourceManifest`, `resources`, `classificationAccepted:false` and `releaseAccepted:false`. Bind the maintained and independent private scripts' SHA-256 hashes and relevant source commit to every run; do not change a script between the first four and remaining contexts without invalidating the run.

- [ ] Authenticate `data/backups/canada-country-audit/bulk-diagnostic-2026-10-11-r1/original-manifest.json` against SHA-256 `66acdc59057211575cf8b659f853460e1d279d624677f41fd880da6827865535`. Select only completed originals and their matching retained layouts; verify each chosen file length/hash before processing and again afterward. These ZIPs contain national data; Canada-specific normalized outputs are not Mexico inputs.
- [ ] Implement the private probe and synthetic controls before a real replay. Reuse existing layout rules and Windows job/memory supervision where applicable, without importing Canada identity as Mexico's authority. Test exact Mexico aggregation (Canada/other rows excluded), required Mexico control/name/month, duplicate global keys, district/RP/import/export grain, framing, unsafe values, missing descriptions, explicit zeros, 98/99 and export880000 handling. Test corrupted/hash-consistent malformed ZIPs, crossed contexts and resource-stop receipts. Run `python -m unittest discover -s <private-root>/tests -v` RED/GREEN.
- [ ] Enforce no network or archive extraction, fresh output only, one owned worker at a time, 1 GiB worker working set, 60 seconds per context, 60 minutes per complete maintained/reviewer run, 128 archive members, 3 GiB declared uncompressed bytes, 5,000,000 global keys, 128 MiB generated evidence per run, 16 GiB preflight free disk and a 2 GiB disk guard. Preserve nonzero failure/stop receipts; no automatic cap increases. Read originals in place or through verified same-volume hard links, never write their content/attributes. Verify child job ownership before it reads source bodies.
- [ ] Replay imports/exports for September 2024 and August 2026 first. Require all four to validate with exact HS6 sum equal to their separate same-archive Mexico control. If any fail, preserve and stop the Mexico assessment. If all pass, process the remaining 44 contexts within the same fixed limits, retaining the first four outputs instead of recomputing them.
- [ ] Have an independent reviewer use a separate calculation path to verify every observed row/control and selected-member identity for the processed contexts, within a separate identical resource budget. Bind the output to the originals' historical retrieval dates; do not label it newly retrieved/current data. Preserve missingness and special categories. Authenticate inputs afterward and report every failure/limitation.
- [ ] Publish only a sanitized feasibility record. Exact same-archive sums establish internal arithmetic; they do not establish current-reference agreement, code continuity, monthly country-release eligibility or a valid product-share comparison. Canada revision mismatches and earlier failures remain untouched. End with a concrete recommendation for a separate Mexico acceptance/profile design, not an automatically enabled country page.

**Deliverable:** A bounded, independently checked Mexico data assessment, potentially all 48 historical contexts, with no new public country profile or R2 copy of the national archive.

## Task 5: Integrate accepted products into the existing concise site

**Files:** `src/lib/trade/product-registry.ts`; `deployment/site-product-selection.json`; `scripts/live-site-package.ts`; `src/pages/briefing/portfolio.astro`, `src/components/PortfolioBriefing.tsx`, `src/components/ReleaseBriefingPage.astro`, `src/pages/index.astro`, `src/pages/methods.astro`; new product validation records. Tests: `tests/trade/product-registry.test.ts`, `tests/scripts/{site-product-selection,site-staging,live-site-package}.test.ts`, `tests/helpers/live-site.ts`, `tests/e2e/portfolio-briefing.spec.ts` and existing affected profile/changes/briefing/static/print cases. No calculation/serializer change.

**Interfaces:** Published registry order remains 090121, 090111 followed by passing 090240, 180100. Selection retains schemaVersion 1 and each exact Task 3 pointer/release identity in registry order. Reject missing, rejected, wrong-code, wrong-month or changed inputs. Existing coffee pins remain exact. Preserve default product 090121 and existing route URLs.

- [ ] Add regression cases for an unpublished/rejected member never getting a public route/selection, multiple accepted non-coffee products loading their own data, wrong product hashes being rejected, shared links reopening the selected product and duty denominators remaining unchanged. Use synthetic fixture data in ordinary CI, clearly labeled.
- [ ] Generalize portfolio title/links to “Product portfolio briefing” / “Build a product briefing” and CSV filenames to `product-portfolio-<direction>-<month>-<summary|partners>.csv`. Change only the named portfolio labels, not accurate coffee product names or historical proof. Existing saved product/direction links and serializers retain their contracts. Test the deliberate filename change; CSV data bytes/columns stay unchanged for the original selections.
- [ ] Change the authenticated aggregate live-package ceiling only, from 2,097,152 to 8,388,608 raw bytes. Add `liveFixtureWithTotal(totalBytes:number)` in `tests/helpers/live-site.ts`, padding one asset after subtracting template bytes. Assert exactly 8,388,608 passes, 8,388,609 fails, changed hashes/forged receipts still fail and 4,194,305-byte ZIP inputs still fail. Assert the two-origin check plan accepts 128 checks and rejects 130 (the next realizable even count). Keep ZIP cap 4 MiB, manifest cap 1 MiB, 128 checks, 15-second requests, 180-second run limit, same-origin/credential-free networking, header and private 404 checks unchanged. These limits remain hard stops if the real build exceeds them.
- [ ] Enable publication/duties flags only for Task 3-passing members and write their observed selection pins. Build using the tracked staging/preparation/packaging tools against bounded copies of accepted inputs. Verify all members, source/data bindings, templates and private-file exclusions. Record actual file count, total/largest file and 15,000-file alert; do not infer a public-R2 need from hypothetical growth.
- [ ] Verify each new profile, import/export history, country comparison/share history, monthly/rolling movers, duties, individual briefing, portfolio, methods and browser downloads against independently replayed values. Check both new products, both directions, a reported Mexico selection if present and an unavailable-country case. Preserve existing coffee/Canada figures, tables, sources and original-selection CSV data bytes. Inspect375px layouts, keyboard/static detail, saved views and representative PNGs; render/inspect individual A4/Letter and expanded portfolio PDFs. No new route family or explanatory page sprawl.

**Deliverable:** Authenticated expanded site/withdrawal packages and numerical/browser/print evidence, still unpublished until Task 6.

## Task 6: Independently review, merge, publish and clean up

**Files/operations:** All prior task diffs, reviewed data records, private proof and existing Pages project. No additional features or data intake.

- [ ] Self-review the complete diff and obtain a fresh independent whole-branch review, alongside the source/recovery review. Reproduce/fix actionable findings and rerun affected checks. Require the final head's existing packaging, unit, type, build, ordinary browser and Firefox/WebKit CI checks to pass; retain the existing Windows-only Linux skip accurately. Never add retries/skips to hide failures. Push/attach PRs and merge only reviewed exact heads with expected-head protection. Verify merged source matches the tested runtime.
- [ ] Observe the existing Free Pages project's current production binding and authenticate its retained package. If the observed predecessor differs unexpectedly from planning's verified 939c5821, resolve its provenance before upload; never restore an unrelated old site. Preserve both authenticated expanded and restoration packages before publication.
- [ ] Upload only the verified site ZIP to Production on `us-trade-tracker`. Observe the new deployment identity. Run `npm run site:verify` with both exact ZIP/manifest hashes on canonical and observed deployment origins; retain every planned check and actual request count. Perform bounded browser readback of all new routes, affected portfolio/methods/home and the existing coffee/Canada routes, CSV/PNG/static/mobile/print journeys. Maximum two verification attempts per publication, second only after a demonstrated transient failure; allow one reviewed repair/republish and automatic predecessor restoration as authorized above.
- [ ] On regression, restore and verify the pinned predecessor first. Never leave a broken expanded site live while developing a repair. Do not roll back raw source evidence, shared coffee/Canada data or a new product's immutable backup objects to disguise a publication failure.
- [ ] Preserve source/artifact/data/package/review/CI/merge/publication receipts, actual screenshots, resource/cost accounting and failure evidence with hashes. Reauthenticate protected inputs and separate September plan. Stop only owned processes; remove only owned caches after preservation; archive the owned worktree natively. Resolve capacity using preserved obsolete references if necessary and verify actual checkout/registration absence before marking cleanup complete.

**Deliverable:** Verified expanded public product coverage or an explicitly preserved predecessor; independently assessed Mexico feasibility; durable proof and actual cleanup.

## Self-review and approval

Coverage: product definitions/classification → Task 1; source intake/replay → Task 2; durable independent archive recovery → Task 3; bounded country evidence → Task 4; concise site/size/selection correctness → Task 5; whole-branch integration/publication/restoration/cleanup → Task 6. All five Review Focus cases have owning tests or evidence gates. New observed data identities are outputs to bind, not invented placeholders. Product publication can proceed if Mexico fails because it does not consume the Mexico diagnostic. Source failures cannot be converted into publication permission.

Approve this combined design, all six tasks, the listed operations/caps and the preserved root-plus-reviewers execution method to begin. Approval authorizes passing new-product archive selection, local acceptance and public publication within these boundaries; it does not authorize a Mexico country release or expand the separate November coffee plan. Until review, no implementation, new data job, raw replay, R2 operation or publication is started.
