# Monthly Product Changes Design and Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Root implements; independent subagents audit bounded evidence, and one fresh reviewer reviews the immutable complete branch before integration. Track work with checkbox (`- [ ]`) steps.

**Goal:** Let readers compare the existing reviewed products by latest-month changes as well as rolling twelve-month changes, with accurate growth qualification, saved research links and sourced CSVs.

**Architecture:** Extend the existing product-comparison model and `/changes/products/` island. Reuse the existing monthly comparison calculator, saved-ranking period controller and profile-link builder. Calculate monthly ranking values independently from their preceding-twelve-month growth qualification. Preserve rolling defaults and existing rolling CSV bytes. Keep pages/chart data on the static host and downloads generated in the browser.

**Tech Stack:** Existing Astro/React/TypeScript, Node 24, Vitest/Testing Library/Playwright, configured Python 3.12+ and locked repository dependencies.

**Spec:** This combined design, the existing launch design at `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md`, and the existing product/country comparison and saved-view contracts. The user requested a reviewable design, tasks and all execution permissions together. This proposal does not authorize implementation or publication until approved.

## Recommendation and boundaries

Recommend **latest-month product changes** next. `/changes/products/` currently supports rolling comparisons only, while country changes, selected-country comparisons and portfolio headline figures already support monthly research. Adding the missing product comparison period completes that existing flow. Independent product and pipeline assessments reached the same recommendation. This is a bounded extension: only the two accepted pilot products are covered, and reader demand remains unvalidated.

A fresh official-release refresh is a separate milestone requiring current source-availability checks and data-operation permissions. The existing candidate/archive/recovery tools should be used for that future work; this feature should not create another refresh subsystem. A broader product catalogue or new country would expand coverage. Neither is necessary here. The still-open acceptance requirement for a second successive official release remains open after this milestone.

Planning main is `22f97016bc06b53f45ac14d4987d478d268e73ea`. Prior merchandise-download work is complete in its post-archive record; its earlier sealed pending checkpoint is not unfinished implementation. No active worktree or owned preview needs carrying forward.

## Combined design

### Periods, values and eligibility

Keep **Rolling twelve months** as the default. Add **Latest month**, comparing the newest accepted product reporting month E with E minus twelve months. The current accepted inputs make these August 2026 and August 2025. Labels derive from input reporting months; this is not permission to fetch a newer month. Imports use world `GEN_VAL_MO`; exports use world `ALL_VAL_MO`. Never sum countries to manufacture the national total.

Rolling behavior remains the existing E-11 through E versus E-23 through E-12 comparison. Monthly behavior reuses `buildMonthlyChangesView` for endpoint values, compatible classification span and provenance, projecting its world comparison. Missing/suppressed endpoints remain unavailable; reported zero remains zero. Monthly comparisons require a verified compatible interval from E-12 through E, but do not require intervening observations. Older-release products remain excluded with their own reporting month stated. Preserve existing input identity/duplicate/direction validation.

**Keep the existing $10 million annual growth-ranking threshold.** In monthly mode it applies to the twelve months ending at the previous comparison month: E-23 through E-12. For the retained data this is September 2024 through August 2025. It does not apply to August 2025 alone. Monthly percentage change itself is `(current month - previous matching month) / previous matching month × 100`; the annual qualification is an eligibility rule, not that formula's denominator.

Compute that qualification separately using direction/measure/product/world-filtered observations, the existing `sumWindow(..., E-12, 12)`, and a classification interval covering that qualification window. Its states are available, incomplete period and classification unverified; an unavailable amount stays null. Do not use the availability of a full rolling comparison as qualification: missing observations in the current annual window must not hide valid monthly dollar changes or an otherwise valid previous-year qualification.

For monthly growth rankings, apply exactly one exclusion reason to each otherwise-comparable product, in this order:

1. Previous monthly value is zero: no percentage growth.
2. Previous monthly value is positive but annual qualification is unavailable: qualification unavailable.
3. Qualification is available but below $10 million: below threshold.
4. Otherwise eligible; count zero changes separately and rank nonzero changes.

Comparison-unavailable and different-reporting-month products are counted before these growth reasons and never counted again. Dollar rankings require only the monthly comparison; annual qualification never excludes them. A valid monthly growth percentage remains visible in a dollar-ranked row even if that row cannot enter the growth ranking. Preserve current rolling eligibility/count behavior, including its existing below-threshold treatment of zero annual baselines.

Keep exact integer-fraction growth ordering, dollar ordering, product-name/code ties, and up to ten increases and ten decreases. Do not rank by rounded display percentages.

### Model contracts

In `src/lib/trade/product-changes.ts`:

- Add `ProductChangesPeriod = 'rolling' | 'monthly'` and `ProductChangesViews = Record<ProductChangesPeriod, Record<Direction, ProductChangesView>>`.
- Add `periodType: ProductChangesPeriod` to `ProductChangesView`. Keep the existing public `buildProductChangesView(profiles, direction)` as the rolling builder; add `buildMonthlyProductChangesView(profiles, direction)` with the same input validation.
- Add optional row `growthQualification: {from:string;to:string;valueUsd:number|null;availability:'available'|'incomplete_period'|'classification_unverified'}`. Populate it for monthly products at the common reporting month. Rolling and older-reporting-month rows need no qualification object; older rows are already excluded before qualification.
- Retain `rankProductChanges(view, metric)` and its existing result fields. Add `growthQualificationUnavailableCount`, `zeroPriorMonthCount`, and `growthExclusions: {product:ProductChange;reason:'below_threshold'|'qualification_unavailable'|'zero_prior_month'}[]`. Derive counts and UI exclusion lists from that single eligibility decision. New counts are zero for dollar and rolling rankings; rolling below-threshold rows can use the existing reason. No duplicate eligibility formula in JSX.

Do not modify `changes.ts`, `profile.ts`, `metrics.ts` or `portfolio-briefing.ts`; their existing functions supply the required behavior. A new generic calculation or ranking framework is unnecessary.

### Page, saved links and research handoffs

Build all four compact calculated views in `src/pages/changes/products.astro`; send no raw release histories to this island. `ProductChanges` consumes `ProductChangesViews` and calls the existing `useChangesViewLink('/changes/products/', 'growth', {allowPeriod:true})`. Reuse that hook unchanged.

Add a **Comparison period** control with Rolling twelve months and Latest month. Direction/metric/period changes preserve the other selections. Old URLs retain the rolling default; monthly links add `period=monthly`. Existing validation handles invalid/duplicate parameters, copied links, clipboard fallback, reload, native history and hash behavior. Controls and CSV stay disabled until saved-view restoration is ready. Without JavaScript the page remains a readable rolling/import/dollar view and explains that interactive period changes and downloads need JavaScript.

State both selected comparison periods and, in monthly mode, the separate dated annual growth-qualification window. Explain the threshold's editorial role and limited pilot coverage. Show the monthly qualification amount/status per product in its existing source details, including unavailability; list excluded product names and their single reason when ranking by growth. No new panel or route is needed. Update the Product changes methods paragraphs and the page introduction to describe both periods accurately.

Both ranked-row and source-detail profile links retain direction, twelve-month history and no selected countries. Monthly links additionally use `comparisonPeriod:'monthly'` through `profileViewPath`, producing the existing `comparison=monthly` profile query. Rolling destinations remain byte-identical to the old paths. The existing portfolio action becomes **Open portfolio briefing**, retaining all reviewed product codes and direction; it uses the portfolio's existing view and does not invent a portfolio period parameter. No other incoming navigation needs changing.

### CSV contract

Keep `serializeProductChangesCsv(view, metric)` as the interface and preserve **all existing rolling headers, field order, values, CRLF/escaping and filenames**. A monthly view selects its explicit new schema; no default/options ambiguity or separate download system is needed.

Monthly rows remain exactly the displayed increase/decrease rankings with their sources. Use the rolling column order, except replace the ambiguous `minimum_previous_value_usd` column with `minimum_growth_qualification_value_usd`. This new threshold is $10 million for growth ranking and blank for dollar ranking. Append these fields, in order:

`comparison_period`, `growth_qualification_basis`, `growth_qualification_period_start`, `growth_qualification_period_end`, `growth_qualification_value_usd`, `growth_qualification_availability`, `growth_qualification_unavailable_count`, `zero_prior_month_count`.

Use `monthly` and `preceding_twelve_months` for the first two fields. Each included monthly row carries its actual qualification dates/value/status even in dollar mode; null stays blank. Existing `previous_value_usd` is always the previous matching month's value. Exclusion counts correspond to the selected ranking, so qualification/zero-prior exclusion counts are zero for dollar rankings. Use `pilot-products-{direction}-changes-monthly-{metric}.csv`; retain existing rolling `pilot-products-{direction}-changes-{metric}.csv`. Empty rankings keep the current disabled-download behavior.

Only the product-changes serializer body and its necessary imports change in `downloads.ts`. All other serializer/converter/download functions retain their source and bytes. No PNG, chart layout or duty/share logic changes.

## Permissions requested for all five tasks

Full approval covers these actions without routine approval pauses:

1. Root implementation, independent reviewer/auditor subagents, native managed-worktree creation/reuse, scoped sandbox escalations, locked runtime setup, local fixtures/tests/builds, bounded private accepted-data/package copies, owned loopback previews, browser checks/downloads/screenshots and private evidence scripts. Dependencies and lockfiles remain unchanged.
2. Branches/commits, pushes, at most two PRs (feature and factual closeout), attaching every created PR, exact-final-head successful push/PR Code checks, independent review, expected-head reviewed merges under standing merge permission, clean-main synchronization and package/runtime/input binding.
3. Reserve four spare chat-attachment slots before starting. If necessary, preserve identity/URL and verify merged status before unlinking up to four obsolete merged PR chat attachments. Actual GitHub PRs remain intact. Recheck capacity before PR creation and native archive; a queued action is not completion.
4. Signed-in read-only Cloudflare preflight and publication of the exact reviewed, CI-passed, merged, input-bound package to existing **Workers Free / Active / Production / us-trade-tracker**, account `2e23d873002d29a02a1427e1fa37c5cd`, canonical `https://us-trade-tracker.pages.dev`. At most two candidate uploads. Any runtime repair receives affected regression/full-suite checks, reviewer-finding disposition and exact-head CI before upload.
5. Bounded read-only live verification at canonical and dashboard-observed predecessor/candidate/restoration origins: one existing `site:verify` run per transition plus the reader/CSV cases in Tasks 3–4. Allow one affected read-only retry for demonstrated propagation/transient or private-harness readiness failure, preserving the original failure. No broad crawl or guessed deployment origin; keep existing request/body/redirect/deadline/private-route protections.
6. Automatic restoration of the exact pinned verified predecessor on candidate regression, at most once per failed candidate, followed by bounded verification. Use the working predecessor, not the withdrawal package, for ordinary recovery. Claim restoration only if executed.
7. Reviewed factual closeout, proof sealing/readback, stopping only owned previews, native managed-worktree archival, exact owned plan-cache cleanup after evidence preservation, post-archive completion/readback and final clean-main confirmation. Preserve historical evidence and sibling work; never substitute manual checkout deletion for native archive.

**Excluded:** new imports/source requests, raw-source replay/recovery, data intake/replacement, new reporting months/products/countries, Canada refresh, R2 operations, new dependencies/services/accounts/domains, paid/access/indexing changes, recurring jobs, analytics/outreach, subscriptions/billing, chart/PNG redesign, and unrelated performance refactoring. Broader historical R2 permission is not an R2 operation in this batch.

Pause only dependent work for a newly discovered material cost/access/terms/sign-in boundary, unexplained concurrent Production/input change or integrity failure. Investigate read-only and complete unaffected work. Approval authorizes the bounded operations, not assumptions about their eventual outcomes.

## Recovery pins, limits and file ownership

Last verified Production is **23cbd1b1-5294-4e26-b4b4-8fd626dd6713**, with observed origin **https://23cbd1b1.us-trade-tracker.pages.dev**. Predecessor proof directory is `data/backups/merchandise-download-reliability/deployment-20261015-r1`. Planning readback matched these pins:

| File under predecessor | Bytes | SHA256 |
| --- | ---: | --- |
| `packages/site.zip` | 408,825 | `b260bc3aa5dc7eccc553fddd6da2ecec5abb488ca9879e71ec616ecff5c30222` |
| `packages/site-manifest.json` | 6,556 | `e2fde5e48e55e67bfd3442f390ff0ca3d446e936e716685f5d0540a15305fe43` |
| `preservation-manifest.json` | 131,657 | `63eaa43bc1ad3b6e7ad09ff0bf78f6c5a458d89d33c3a2fda14550e1cf462e03` |
| `completion.json` | 4,783 | `45410e0a10991f88f527b5bc9f123c8ff09005a28e89c44b5925bdc8027b33f0` |
| `post-seal-finalization.json` | 2,321 | `8dfeb2559db5373e491f08a575773f0a3de0831cd64a754b43399b109aa75127` |
| `post-seal-final-readback.json` | 998 | `d13e26e459649ffcd437f87bfecbd15d9cbda19d5f80bbb360bc94ad7087769e` |

At execution authenticate its 651 sealed identities and 11 post-seal finalization identities, then relevant input/CSV producer evidence. The final-readback record is outside those inventories. Fresh provider/current Production verification is required before upload; this proposal makes no fresh Cloudflare-state claim.

- Use only the seven existing accepted state files, currently 8,186,318 bytes; at most seven files/16 MiB per fresh stage. Recheck all eleven protected identities before/after staging and publication. Do not copy raw archives.
- Preserve useful new proof under ignored `data/backups/monthly-product-changes/deployment-20261015-r1`, at most 1,000 files/64 MiB. Stage/package/evidence caches stay outside served trees; ledger records owned paths and cleanup boundaries. Preserve original proposal bytes/hash before editing execution checkboxes.
- Keep existing package caps: at most 1,000 entries, 25 MiB per asset, and stricter live verifier limits of 2 MiB aggregate raw assets, 4 MiB ZIP, 1 MiB manifest and 128 logical checks. Keep the 15,000-build-file planning alert; dashboard/live limits remain the binding gates for this batch.
- Prior measured site: 31 entries/1,874,543 aggregate raw bytes; largest asset roasted profile HTML 350,573 bytes. Raw JS 380,504 bytes and CSS 21,963 bytes; remaining 2 MiB raw budget is 222,609 bytes. Measure actual deltas, including product-changes HTML; no performance improvement is promised.

Production edits are limited to `src/lib/trade/product-changes.ts`, the product serializer/imports in `src/lib/trade/downloads.ts`, `src/pages/changes/products.astro`, `src/components/ProductChanges.tsx`, and the Product changes paragraphs in `src/pages/methods.astro`. Existing URL controller, other calculators/serializers, chart/download components, source/data files, CI and packaging/live tools remain unchanged.

Tests: extend `tests/trade/product-changes.test.ts`, `tests/ui/ProductChanges.test.tsx`, `tests/e2e/pilot-product-changes.spec.ts`, and product-page cases in `tests/e2e/changes-view-links.spec.ts`; update only the renamed portfolio-action locator in existing `tests/e2e/research-handoffs.spec.ts` and the nested product fixtures/monthly expectation plus generic opt-out coverage in `tests/ui/ChangesViewLink.test.tsx`; extend `tests/helpers/product-changes.ts` only with a deliberately uneven-month fixture helper while retaining its existing helper behavior. If serializer tests belong in an existing download test file, add only the relevant cases there. Add `docs/validation/monthly-product-changes.md` and update the relevant README/this plan facts. All evidence-only acceptance helpers stay private.

## Review focus

1. Monthly pair and annual qualification are different inputs: a missing current-year intermediate observation cannot invalidate a valid monthly pair or prior-year qualification. Task 1.
2. Monthly growth ordering uses the previous month, while eligibility uses the complete compatible prior twelve months; zero prior month, unavailable qualification and below threshold are distinct nonoverlapping reasons. Exact ties, negative changes and the inclusive $10 million boundary remain correct. Task 1.
3. Missing/suppressed endpoints, classification spans and older releases preserve availability semantics; dollar rankings do not depend on growth qualification. Fixture coverage distinguishes these from actual retained-data cases. Tasks 1–3.
4. Restored period/direction/metric controls, both profile-link locations, portfolio handoff, CSV identity and no-JavaScript defaults agree. No first-enabled action can export the wrong default view. Task 2.
5. Rolling CSV bytes and unrelated serializers remain unchanged; measured package/source/input identity, independent numerical checks, exact-head CI, live acceptance and actual native archive completion support the final claim. Tasks 3–5.

## Task 1: Model monthly changes and annual growth qualification

**Deliverable/interface:** The two builders produce `ProductChangesView`; ranking supplies one eligibility decision and reasons; the same view drives table and CSV.

- [x] Authenticate proposal/predecessor/main/input baselines, reserve attachment headroom, create/verify the native managed worktree at planning main, establish the owned-path ledger and locked runtime, and record baseline checks before runtime edits. If main differs, assess the diff read-only and update bindings only when consistent with approved scope. Do not silently replace a changed recovery target/input.
- [x] Add failing tests for a monthly builder and monthly CSV first. Use uneven monthly values so the monthly sign/winner differs from rolling; the existing evenly distributed annual helper alone cannot detect the error. Run `npm test -- tests/trade/product-changes.test.ts --maxWorkers=2`, expecting RED for missing monthly functionality.
- [x] Cover both directions and January/year boundaries; exact endpoints with absent intermediate data; missing/suppressed endpoints; zero versus absent; older reporting month; duplicate/product identity errors; incompatible classification; exact BigInt growth ties/order and top-ten limits. Qualification tests cover inclusive $10 million, $9,999,999, missing/suppressed/zero reported values, classification-unverified qualification, and a zero prior month despite a qualifying annual total. Missing current annual data must not affect qualification; missing prior-year intermediate data must affect only growth eligibility. Assert exclusion partitions and dollar-mode independence.
- [x] Implement the contracts above with existing monthly calculator and `sumWindow`, keeping rolling behavior intact. Add exact monthly serializer-header/order/escaping/provenance/status/count tests and a byte-identical rolling serializer regression. Monthly dollar rows retain available percentage changes and unavailable qualification metadata correctly. Run the focused tests and `npm run check`, expecting GREEN and zero diagnostics. Commit model/serializer/tests/approved plan.

## Task 2: Add period selection, saved views and matching research links

**Deliverable/interface:** The Astro page prepares four views; the existing island selects one through the unchanged saved-view hook and passes its period into CSV and both profile-link locations.

- [x] First add failing UI tests for the nested view shape, period labels/control and dated qualification text/statuses; retain existing rolling fixtures/default assertions. Include monthly growth exclusions with named reasons and dollar-mode availability. Run `npm test -- tests/ui/ProductChanges.test.tsx --maxWorkers=2`, expecting RED for the new behavior.
- [x] Implement page/island/methods changes exactly within the file map. Preserve period when changing direction/metric, name the portfolio action accurately, and make monthly table/source links open the monthly profile comparison. Keep controls disabled before saved selection is restored; no-JavaScript output remains readable annual defaults.
- [x] Extend browser tests for all two-period/two-direction/two-metric states, directly opened monthly URLs, copied URL/reload, blocked-clipboard fallback, native history/hash and invalid/duplicate parameter fallback. Test annual links unchanged, monthly profile summary/selected comparison state, and portfolio product/direction preservation. At 320/375 pixels verify table scrolling, keyboard controls/CSV/link activation, disabled initial hydration and static default copy. Preserve fixture labeling and assert no page errors.
- [x] Run the focused trade/UI files, `npx playwright test tests/e2e/pilot-product-changes.spec.ts tests/e2e/changes-view-links.spec.ts`, and `npm run check`; expected GREEN. Commit integration and acceptance tests. Do not modify the shared URL hook merely to fit tests.

## Task 3: Independently verify retained values, compatibility and packages

**Deliverable/interface:** A measured local candidate, independent expected rankings/CSV fields, and authenticated runtime/input/package pins for publication.

- [x] On final runtime run `npm test -- --maxWorkers=2`, `npm run check`, explicit fixture-mode `npm run build`, `npm run test:e2e`, and configured Python `-m unittest discover -s tests/packaging -v`. Set `SITE_PACKAGE_PYTHON` to the existing Python 3.12+ executable. Expected all pass with zero type errors/warnings/hints; baseline is 1,450 unit/169 browser/24 Python tests, not a required final count. Keep full suites separate from staging deadlines.
- [x] Use README's exact `site:stage create/verify`, retained census/snapshot build with private preview flags removed, post-build stage verification, `site:prepare`, and Python `scripts/package_site.py create/verify` recipes in fresh owned destinations. Record the actual committed source. Read back site and withdrawal ZIPs; repeat package creation to prove deterministic bytes. No altered packaging/provider tool is needed.
- [x] Authenticate/replay the 112 existing legacy CSV cases plus Canada projection, six duty CSVs and 17 share CSVs, requiring old bytes unchanged. Recheck seven accepted/eleven protected identities. `product-changes.ts` and `downloads.ts` intentionally change; do not falsely claim all six old producer files unchanged. Verify the other four producer files and other serializer/converter bodies, chart/duty/share/Canada sources unchanged. Preserve the predecessor's disclosed extra-28-case indirect producer-binding limitation; this is not a new source audit.
- [x] Derive expected monthly endpoint values, prior-year qualification totals, growth and ordering directly from retained world observations/statuses/classification, without importing application calculators. Also derive rolling totals/rankings independently. Verify **eight local ranking views = two periods × two directions × two metrics**, with eight CSVs, displayed rows/counts/periods/source fields and correct profile/portfolio handoffs. All four retained monthly product/direction cases qualify; unavailable/zero-prior/below-threshold cases are fixture coverage, not claimed observations in this real matrix.

Planning cross-checks from the existing retained observations (recompute at execution):

| Product | Direction | Aug 2026 USD | Aug 2025 USD | Change USD | Sep 2024–Aug 2025 qualification USD |
| --- | --- | ---: | ---: | ---: | ---: |
| 090121 roasted coffee | Imports | 140,980,739 | 154,404,658 | -13,423,919 | 2,207,669,569 |
| 090121 roasted coffee | Exports | 66,393,173 | 65,926,363 | +466,810 | 811,100,933 |
| 090111 green coffee | Imports | 761,982,573 | 732,404,352 | +29,578,221 | 9,142,281,740 |
| 090111 green coffee | Exports | 19,387,454 | 23,576,145 | -4,188,691 | 257,686,581 |

- [x] Serve only the assembled package on owned loopback. Cover copy/reload/restoration, first-enabled CSV identity, keyboard/mobile/desktop/no-JavaScript, each product/direction monthly profile handoff and both portfolio directions. Inspect representative saved screenshots and compare all new CSV fields to independent expectations. For each product's imports/twelve-month/three-country profile, download its merchandise, duties and share CSVs: six focused coexistence CSVs total, compared with the authenticated baselines. Use 1220/2010/2050 for 090121 and 4419/2010/2050 for 090111. Full unrelated PNG/Canada matrices are unnecessary with unchanged runtime and exact legacy replay. No unexpected requests/page errors.
- [x] Measure file count, aggregate raw bytes, largest asset, raw/gzip JS/CSS and product-changes/profile HTML, plus default and selected DOM where affected. Explain deltas and enforce existing caps. Record actual local results in validation/README/ledger with review/publication still pending. Commit factual local acceptance documentation.

## Task 4: Review, merge and publish the bound update

**Deliverable/interface:** Verified public monthly product comparisons, or an honest failed-candidate outcome with the pinned working predecessor restored.

- [x] Self-review the complete design/constraints, then obtain one fresh immutable whole-branch review with Review focus and numerical/compatibility/package evidence. Root dispositions and fixes required findings in one bounded pass; preserve RED→GREEN and affected/full-suite evidence. Runtime fixes restage/rebind packages and repeat affected acceptance. Do not upload an unreviewed candidate; a new material design problem stops dependent work for a scope decision.
- [x] Push/create/attach the feature PR. Require successful exact-final-head push and PR Code checks, then expected-head merge. Synchronize clean main and prove reviewed/merged non-documentation runtime/build inputs equal the packaged source. An identical merged runtime does not need another full local acceptance cycle.
- [x] Fresh signed-in Free/Active/existing-account/project/Production preflight and bounded canonical/pinned-origin verification. Immediately re-read candidate/recovery ZIP/manifest and accepted/protected identities. Upload only the bound package and observe its actual Production UUID/origin. Run existing bounded `site:verify`; derive logical checks from the actual manifest rather than assuming the predecessor's 68 checks.
- [x] On canonical, repeat the eight-view/eight-CSV monthly/rolling product acceptance against the retained expectations, monthly profile handoffs, both portfolio directions, source details and representative mobile/keyboard/static journeys. Inspect saved public screenshots. Exact asset checks cover unchanged site payload; avoid repeating unrelated full feature matrices. Preserve failures. If needed execute and verify the pinned restoration within the permission limits; an approved second candidate repeats repair/CI/package/affected acceptance gates before upload.

## Task 5: Close out evidence and actual worktree cleanup

**Deliverable/interface:** Reviewed factual documentation, completed proof ledger, native archived checkout and clean main, with all outcomes and limits reported honestly.

- [ ] Record actual review, CI/merge, provider/live and restoration outcomes through the factual closeout PR; obtain an independent immutable documentation review, exact-head Code checks and expected-head merge. Rebind final clean main to the deployed runtime/inputs. Keep operationally unfinished gates marked pending in this public checkpoint.
- [ ] Preserve useful proof within this plan's ignored backup limit; seal and read back identities before archival. Preserve review dispositions, failed runs, prior pins, numerical/CSV records and final source/data/package/provider identities. Stop only owned servers and confirm attachment headroom. Do not rewrite already sealed pending evidence to manufacture completion.
- [ ] Request native managed-worktree archive; verify an actual `archived_worktree` attachment and exact owned checkout absence. A queued return remains pending. Only after those gates run a private post-archive Task 5 completion verifier, preserve its completed ledger/log/finalization metadata, clean only this owned plan cache and confirm clean main. Read back seal plus post-seal identities and report actual completion or the precise unresolved gate.

## Self-review and approval handoff

Self-review distinguishes the monthly percentage denominator from annual growth eligibility, keeps qualification independent of current-year completeness, makes exclusion reasons nonoverlapping, and retains annual CSV bytes. Model/serializer contracts, nested page inputs, saved-link period, both profile-link locations and named tests agree across tasks. A monthly CSV threshold column was explicitly renamed so it cannot imply a $10 million single-month rule. Old product URL/CSV contracts and unrelated shared-file bodies have owning compatibility checks.

Retained numerical checks use independent observations rather than the implementation as oracle. The public package has authenticated recovery pins, measured headroom and bounded verification/recovery permissions. Task 5 includes actual native archive and post-archive readback, rather than stopping at a pending documentation checkpoint. No data/service/access/cost operation is hidden in the milestone.

Review this combined design, five tasks and permission envelope. Full approval selects root implementation with independent reviewers and the specified publication/restoration/cleanup, without routine approval pauses. Writing this proposal alone authorizes none of those execution operations.

## Execution checkpoint

Tasks 1–2 passed their model/UI/compiler/fixture browser gates. Task 2 final-runtime full unit suite is recorded in the private ledger. Period selection and qualification explanations are implemented; independent retained-data browser/package acceptance, review, CI, publication and operational closeout remain pending.

Task 3 local acceptance passed: 1,465 final unit tests, 172 full browser cases plus 16 final affected cases, 24 Python tests and zero compiler diagnostics; final eight-view/14-CSV retained browser acceptance and 135-CSV compatibility passed. Final package metrics and source/data pins are in docs/validation/monthly-product-changes.md. Branch review, CI, merge, publication and Task 5 remain pending.

Task 4 passed independent review, exact-head Code checks, feature merge, bound one-upload publication and public acceptance. Task 5 documentation review/CI/merge, seal and actual archive/cache cleanup remain pending at this checkpoint; completion is recorded after those operations.
