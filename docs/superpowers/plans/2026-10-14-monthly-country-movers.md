# Monthly Country Movers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans task by task. Root implements; one fresh whole-branch reviewer checks the finished branch. Preserve this execution method and the owner's standing reviewed-merge permission.

**Goal:** Let visitors discover which countries changed most in the latest reported month or rolling twelve months for either accepted coffee product, with matching links and sourced CSVs.

**Architecture:** Extend the existing country changes pages and shared saved-view hook with an opt-in period choice. Prepare both views using the existing buildMonthlyChangesView and buildChangesView functions, retain the existing exact ranking rules, and use the tracked local preparation/packaging tools for acceptance. Product rankings continue using their current hook mode.

**Tech Stack:** Existing Node 24, TypeScript, Astro/React, Vitest, Playwright, Python 3.12+ standard library and locked dependencies.

**Spec:** The combined bounded design and permissions below, extending the approved [launch brief](../specs/2026-10-08-us-trade-tracker-design.md), [changes-link contract](../../validation/changes-view-links.md) and [local preparation contract](2026-10-14-local-site-preparation.md). A combined written artifact is provided because the owner explicitly requested a reviewed multi-task plan.

**Status:** Owner approved this design, all five tasks and the complete permission envelope on October 14, 2026. Implementation and local acceptance are complete; one independent whole-branch review found no issues. Final CI, merge, main synchronization and proof-preservation outcomes are recorded in PR #90 and the private closeout receipt under the approved permission envelope. Planning baseline is main 6a74b7985da6d0668f6cd4b5560fdc975fe07859, merged PR #89.

## Bounded design and recommendation

The visitor's question is which partner markets changed in the most recent reported month, rather than only which changed across two whole years. The country changes pages currently prepare rolling views only. The same-month-last-year calculator already serves selected-country profile comparisons, so expose that existing calculation through the current ranking flow.

I recommend this before more preparation tooling. PR #89 already supplies authenticated staging, readback, assembly and ZIP verification. Another operator subsystem needs a demonstrated requirement. A real coffee refresh remains a separate milestone with publication, classification, source, revision and acceptance gates; this feature needs no new observations.

### Research behavior

Keep /changes/ for roasted coffee 090121 and /changes/090111/ for green coffee. Add a Comparison period fieldset with Rolling twelve months and Latest month versus the same month last year. Default to imports, rolling twelve months and dollar change. Preserve Imports/Exports and Dollar change/Country share change controls, top-ten increases/decreases and all existing unavailable/zero rules.

For the retained August 2026 releases, monthly means August 2026 versus August 2025. Rolling means September 2025–August 2026 versus September 2024–August 2025. Render one month once, rather than Aug 2026–Aug 2026. Use the release's own reporting month for other fixtures or accepted source contexts.

Shares continue using each period's official merchandise world total: GEN_VAL_MO for imports and ALL_VAL_MO for exports. Country share is distinct from calculated-duty share. Preserve the integer cross-product ranking/tie behavior; do not introduce new arithmetic or growth ranking.

### Saved state and research handoffs

Country saved links accept period=monthly or rolling alongside direction and metric. Omitted period means rolling. Canonical rolling links keep their current bytes and omit period; monthly links append period=monthly after direction/metric. Duplicate/unsupported period or an oversized query falls back to imports/rolling/dollars with an explanation. Preserve history state, fragments, clipboard fallback and stale-result handling. Product-change links keep period handling off and retain their existing behavior for unrelated parameters.

Direction/metric edits retain the selected period; period edits retain direction/metric. Product navigation still starts with the default and states that default explicitly. Initial static HTML shows imports/rolling/dollars. Period and direction controls remain disabled until hydration; pass an optional readiness flag to the standalone ranking controls. The no-JavaScript explanation identifies the displayed rolling view and saved-filter limitation.

A monthly country row opens its existing profile with months=12, the same direction/country, comparison=monthly and #selected-comparison-heading. Rolling row links remain unchanged. The profile's own broad What changed ranking remains annual; the fragment targets the matching selected-country comparison. Import-to-duty links carry monthly when selected, retaining the duty page's share-ranking default. Rolling duty links retain their existing route; exports still have no duty handoff.

### Downloads and compatibility

Monthly downloads use hs-<code>-<direction>-changes-monthly-<metric>.csv. Add comparison_period=monthly through an explicit serializer option used only by this new download; existing dates, amounts, share denominators, units, source, retrieval time, code version and qualifications remain present.

The default serializeChangesCsv(view, metric) output remains byte-identical, including its existing monthly caller behavior. Rolling UI filenames/schema/bytes remain unchanged. This permits fresh replay of all 84 established CSV contracts while adding an explicitly identified monthly download. Browser-generated downloads and same-host static assets remain the delivery model.

## Global Constraints

- Actual pilot products remain 090121 and 090111, reporting August 2026. Canada 1220 remains its selected September 2024–August 2026 historical snapshot.
- Use existing prepared observations and calculators. Missing/suppressed country figures are not zero; incompatible classifications withhold changes; zero prior amounts have no growth percentage; zero/missing world denominators withhold shares.
- Preserve existing merchandise/duty meanings, raw-source evidence, classification files, published registry and all accepted pointers/releases.
- Keep Node 24, Python 3.12+ standard library and locked dependencies. Use the existing shared local runtime; ignored caches can change during builds.
- ComparisonPeriod on profiles is annual|monthly. New CountryChangesPeriod is rolling|monthly. Map monthly explicitly to profile comparisonPeriod=monthly; omit the profile field for rolling. Do not rename the existing profile enum.
- Keep legacy rolling URLs, filenames and CSV bytes. Product-change sharing, profile annual rankings, selected-country data and duty arithmetic retain their behavior.
- Static payloads contain calculated views, not observation histories, credentials, pointers, private evidence or fixtures labeled as real research.
- Fresh ignored source/staging/evidence/package destinations only. Retain the staging containment, stable-read, hardlink, Windows reparse and single bound dependency-link guards.
- Keep schema-v1 site/withdrawal manifests, noindex,nofollow headers, the 1,000-entry package bound including controls, 26,214,400-byte per-asset limit and 15,000-file planning alert.
- Ordinary CI uses explicit fixtures. Real local checks use named authenticated existing accepted data, with external browser requests blocked.
- Run focused checks during implementation, one full final check set and one real local rehearsal. Repeat affected checks only when changes, failures or findings justify them. Require identical ZIP bytes for the same tree/manifest, not for separate clock-dependent builds.

## Permission envelope for all five tasks

Approval authorizes the entire bounded batch:

1. Root source/test/documentation implementation, routine in-scope fixes, a managed feature worktree and one fresh read-only reviewer subagent. Planning/research helpers may inspect independently; they do not implement tasks.
2. Read the existing accepted coffee files and the compact selected Canada state/protected hashes needed by local pilot preparation. Copy only the seven authenticated accepted-state files into each fresh ignored stage, bounded at 16 MiB total per stage. Keep originals and sealed evidence intact; retain useful private proofs/backups.
3. Existing runtime use, locked npm ci for worktree setup, fixture tests, code checks, static builds, exclusive loopback previews, browser checks/downloads/screenshots, local site/withdrawal assembly and ZIP create/readback. Shared ignored dependency caches may change.
4. Feature commits, GitHub pushes, PR create/update/attachment, existing standard-runner Code checks and reviewed expected-head merges under standing permission. Synchronize main and prove tree identity without duplicating a full suite for an identical merge.
5. Stop only task-owned preview processes. Preserve and hash-check needed private artifacts before archiving the task-owned managed worktree; safely clean only verified task-owned scratch.

Excluded: live Census/provider requests or new imports; raw archive reading/replay; R2 reads/writes; data or archive-pointer replacement/promotion; another country/product/reporting-month intake; Canada refresh; public deployment/restoration, account/domain/indexing/access changes; new dependencies, paid services or recurring jobs; accounts, billing, email and new duty claims.

The batch ends with reviewed code on main and a verified local site/withdrawal package. Any later public release requires its own decision on the actual package and target; publication is not an unfinished task in this batch. Do not ask for routine task, implementation-detail, execution-method or merge approvals again after this plan is approved. Ask only for a new material scope/cost/access/publication boundary or required evidence that cannot be resolved within the envelope.

## Review Focus

1. Shared-hook opt-in, defaults and wrong-page queries: country period support must not change product-change state, old rolling URLs, history state or delayed clipboard behavior. Task 1.
2. Same-month-year-earlier versus adjacent-month or annual calculations: periods, merchandise measures, official world denominators, missing/zero/classification rules and exact ties must follow the selected existing view. Tasks 2–3.
3. Handoff context: monthly profile comparisons and import duty links must agree with the source view, while rolling links and export behavior stay compatible. Task 3.
4. CSV compatibility: only explicitly opted-in monthly downloads gain the period column/name; default serializer output and the 84 existing contracts remain exact, including quoting/formula-safe text. Tasks 3–4.
5. Static/hydrated/reloaded behavior and package evidence: small screens, keyboard, unavailable/empty rankings and no-JavaScript defaults remain truthful; measure payload growth and preserve real-data qualifications/package boundaries. Tasks 2–5.

## File responsibilities and interfaces

- src/lib/trade/changes.ts: add types only, CountryChangesPeriod='rolling'|'monthly' and CountryChangesViews=Record<CountryChangesPeriod,Record<Direction,ChangesView>>; existing calculators/ranking stay authoritative.
- src/components/ChangesViewLink.tsx: extend RankingSelection<M> with optional period?:CountryChangesPeriod; useChangesViewLink<M>(path:string, alternateMetric:M, options?:{allowPeriod?:boolean}) retains its existing return fields and old behavior when options are omitted. ChangesViewLink gains optional includePeriod?:boolean for country copy/static explanation.
- src/components/MonthlyChangesPage.astro: prepare both direction views for both periods using existing builders. src/components/MonthlyChanges.tsx: consume CountryChangesViews JSON, opt into period state and select the active view; retain its data/reportingMonth props.
- src/components/TradeChanges.tsx: monthly date formatting, profile handoffs and CSV identity; add controlsReady?:boolean defaulting true so existing profile callers retain behavior.
- src/lib/trade/downloads.ts: extend serializeChangesCsv(view:ChangesView,metric:ChangeMetric,options?:{includeComparisonPeriod?:boolean}):string. Default options preserve existing output; opt-in appends comparison_period with monthly or rolling.
- tests/helpers/country-changes.ts: makeCountryChangesData(release:Release):string constructs the two-period/two-direction fixture payload. Tests assert independent expected values rather than comparing the factory to itself.
- Existing UI/trade tests and a new tests/e2e/monthly-country-movers.spec.ts: saved state, rendered figures, handoffs, downloads and static behavior.
- README.md and docs/validation/monthly-country-movers.md: reader behavior, reproducible commands, measured build/package results and integration evidence.

## Task 1: Add backward-compatible country period state

Files: changes.ts; ChangesViewLink.tsx; tests/ui/ChangesViewLink.test.tsx.
Consumes the existing hook and existing directions/metrics. Produces the opt-in interface/types above for Task 2.

- [ ] Before any feature edits, prepare the isolated worktree and establish a private baseline of the 84 existing CSV outputs from original accepted inputs and unchanged pre-feature builders/serializers. Record the actual source commit, protected input identities and pointer/release hashes. A planning-document setup commit is allowed with an explicit unchanged-runtime diff. Preserve the baseline for Task 4.
- [ ] Write failing hook-harness cases: period=monthly restores exports/share/monthly; omitted/explicit rolling returns rolling and canonical ?direction=exports&metric=share; duplicate/invalid period returns imports/rolling/dollars with notice. Keep the existing country/product tests.
- [ ] Pin direction/metric retention, period-aware copied/manual links, fragment/history-state preservation, Back/Forward restoration, stale clipboard completion after a period edit, and product links ignoring period as before.
- [ ] Run node node_modules/vitest/vitest.mjs run tests/ui/ChangesViewLink.test.tsx --maxWorkers=2. Expected: new cases fail on missing period support, not fixture/module errors.
- [ ] Implement the optional flag/types. Depend on the primitive allowPeriod value rather than a new options object on every render; preserve the existing hook return shape and generation guard.
- [ ] Run the same command. Expected: all old/new cases pass and existing rolling/product copied URLs are exact. Commit the isolated state change.

## Task 2: Expose monthly and rolling merchandise rankings

Files: MonthlyChangesPage.astro; MonthlyChanges.tsx; TradeChanges.tsx (controlsReady and period formatting only); tests/helpers/country-changes.ts; tests/ui/MonthlyChanges.test.tsx; update country payload fixtures in ChangesViewLink.test.tsx.
Consumes CountryChangesPeriod and the opt-in hook. Produces both computed views, period-consistent rendering and the optional controlsReady prop defaulting true; no new calculator.

- [ ] Write failing UI cases using the current payload before migrating factories, so the initial failure identifies missing Comparison period controls. Pin the single-month label Dec 2025 compared with Dec 2024 in the standard fixture: import world 100/50, Canada 25/12, dollar change 13 and share change +1 pp. Rolling remains world 1200/600 and Canada 300/144.
- [ ] Pin direction/metric retention on period changes, source measure change to ALL_VAL_MO for exports, and corrected view/provenance binding on both product routes. Test missing/suppressed matching months, zero world denominator, zero prior country amount, incompatible classification, exact share ties and empty rankings with the existing functions/fixtures.
- [ ] Run node node_modules/vitest/vitest.mjs run tests/ui/MonthlyChanges.test.tsx --maxWorkers=2. Expected: the new period behavior fails against the current component.
- [ ] Prepare CountryChangesViews in Astro and update client/fixture consumers coherently. Format equal from/to dates as one month in TradeChanges. Add the period fieldset, hydration gating for direction/period and standalone ranking/download controls through controlsReady, explicit static default explanation and copy describing both periods without promising automatic publishing. Existing profile callers retain controlsReady=true.
- [ ] Run the UI cases plus ChangesViewLink.test.tsx. Expected: displayed amounts, dates, rankings and measures switch together; legacy defaults/product sharing pass. Commit.

## Task 3: Preserve period in drilldowns and monthly CSVs

Files: TradeChanges.tsx; MonthlyChanges.tsx; downloads.ts; tests/ui/TradeChanges.test.tsx; tests/ui/MonthlyChanges.test.tsx; tests/trade/changes.test.ts; create tests/trade/monthly-country-movers-downloads.test.ts.
Consumes the selected ChangesView; produces matching period labels, handoffs and explicit monthly downloads.

- [ ] Write failing cases for a monthly profile query with the same direction, 12-month history, country, comparison=monthly and #selected-comparison-heading; pin unchanged rolling profile links.
- [ ] Pin monthly imports duty href through dutyChangesPath(code,{period:'monthly',metric:'share'}), unchanged rolling duty href and no duty link for exports.
- [ ] Pin monthly filename hs-090121-imports-changes-monthly-share.csv and comparison_period=monthly, both actual date pairs, source measure/units/qualification fields, ranks and formula-safe partner text. Pin default serializeChangesCsv output against pre-feature golden bytes for rolling and existing monthly calls; include empty/unavailable and zero-prior cases.
- [ ] Run the relevant UI/download tests. Expected: new labels/handoffs/opt-in column fail before changes; legacy golden tests pass before and after.
- [ ] Implement the opt-in serializer and monthly-only filename/handoff logic; retain profile callers' behavior and unchanged rolling outputs.
- [ ] Run the same tests plus tests/trade/changes.test.ts. Expected: all tests pass, including exact legacy bytes and source/date consistency. Commit.

## Task 4: Verify the full research flow and prepare one real local package

Files: tests/e2e/monthly-country-movers.spec.ts; affected existing e2e assertions only where added controls/copy require it; README.md; docs/validation/monthly-country-movers.md.
Consumes completed period/state/download behavior and tracked PR #89 preparation tooling.

- [ ] Read back the pre-feature 84-CSV baseline and original/protected identities established before Task 1 edits. Missing or changed evidence fails this acceptance step; do not generate a replacement baseline from the modified serializer.
- [ ] Write browser cases for both fixture country routes, imports/exports, monthly/rolling and dollars/share. Cover real clipboard/manual fallback, reload/Back/Forward, invalid/duplicate queries, matching profile-selected comparison and import duty handoff, mobile widths 320/375 and keyboard operation. Disable downloads for empty/unavailable rankings rather than requiring artificial rows.
- [ ] Pin no-JavaScript monthly-query behavior: visible imports/rolling/dollars, explicit explanation, disabled saved-link/period controls and readable source/tables/navigation. Check product-change flow and annual profile ranking remain compatible.
- [ ] Observe new browser cases fail against pre-feature behavior using a prior isolated fixture build if needed; then run explicit fixture build and the new cases against implementation. Expected: no unexpected browser error or external request.
- [ ] On clean committed final runtime, fingerprint originals and run the documented create -> precheck -> explicit census/snapshot Astro build -> postcheck -> assembly -> Python ZIP create/verify flow into fresh ignored directories. Create/read back both site and withdrawal ZIPs; repeated packaging of each identical tree/manifest must match.
- [ ] Use loopback-only retained-data checks for all 16 actual product/direction/period/metric selections. Independently sum retained monthly/rolling world/country figures and recompute integer ranking numerators, signs/ties/exclusions; check displayed/downloaded ranks, dates, growth, source and period-correct profile/duty links. Download wherever eligible; document empty cases honestly. Recheck Canada qualifications/defaults and the 84 legacy CSV hashes.
- [ ] Run the final full suite with two workers, npm run check, explicit fixture build/all existing e2e suites and python packaging unit tests, with SITE_PACKAGE_PYTHON pointing to the existing executable locally. Expected: all checks pass; private data is unnecessary in CI.
- [ ] Record original hashes unchanged, source commit, file count, raw size/largest file and ZIP identities, measured payload delta and only explained build differences. Inspect desktop/mobile screenshots. Preserve useful private evidence; commit commands and validation documentation.

## Task 5: Independently review and integrate the batch

Consumes final runtime/test/package evidence. Produces reviewed code on main, a preserved local package and a closed batch.

- [ ] Self-check the five Review Focus classes and permission boundaries; request one fresh read-only whole-branch reviewer with exact base/head, this combined design and private acceptance evidence. Root grades and fixes important findings with reproducing regressions; record any excluded judgments/minors.
- [ ] Run affected verification after findings/changes. Obtain successful exact-head Code checks, including new period/CSV regressions and existing application/browser/Python checks. Test-only or documentation-only closeout edits need a proven unchanged-runtime diff rather than another retained build.
- [ ] Push, create/attach/update the PR, merge with expected-head protection under standing authorization, synchronize main and prove the merged source tree equals the tested tree.
- [ ] Hash-check preserved inputs/packages/downloads/screenshots/test/review/CI receipts before archiving the owned worktree. Report the integrated commands/research behavior, actual test/build evidence and local-preparation boundary. No public upload is part of completion.

## Self review and execution handoff

The five tasks cover state compatibility, period selection/rendering, matching handoffs/downloads, real acceptance/package evidence and integration. All interfaces name their consumers/producers; the rolling versus annual profile mapping is explicit. New monthly CSV metadata is opt-in, so the 84 default legacy contracts can remain exact. All five Review Focus classes have corresponding checks. Existing calculators, static delivery, compact accepted data and the tracked packager do the work; no new data/provider subsystem is introduced.

The owner requested a combined multi-task review and permission envelope. Approval of this actual written design/plan authorizes root execution of all five tasks with reviewer subagents and no routine permission pauses. Public publication, fresh Census intake and R2 operations remain separate scope decisions.
