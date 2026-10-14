# Estimated-duty Country Movers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Root implements; subagents review. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let readers rank partner-country changes in estimated-duty dollars and consumption-based duty shares for the two accepted coffee products.

**Architecture:** Reuse the existing duty comparison builder at build time and add an imports-only ranking flow. Prepare only displayed-country comparisons, rankings, world summaries/counts and provenance; the browser selects these prepared views. Existing merchandise comparisons and duty/download contracts remain intact.

**Tech Stack:** Existing Astro 7, React 19, TypeScript 6, Node 24, Vitest and Playwright; no new dependency or hosted service.

**Spec:** `docs/superpowers/specs/2026-10-13-estimated-duty-country-movers-design.md`

**Status:** The owner approved all five tasks and the full permission envelope. Implementation, independent review, exact-head CI, reviewed merge, merged-source publication and live verification are complete; final evidence closeout is being recorded. See [validation](../../validation/estimated-duty-country-movers.md#observed-public-update). Approval is for this batch, not recurring or future milestone authority.

## Global Constraints

- Use only existing accepted 090121/090111 releases through August 2026; fixture mode uses its published synthetic registry. No new product, month, country release, Census data-API request, audit dispatch, accepted-pointer replacement, promotion or R2 operation. Read-only official documentation checks are permitted.
- Monthly compares the reporting month with the month twelve months earlier; rolling compares twelve current months with twelve preceding months. Use the release's embedded classification intervals.
- Every share is 100 × matching CAL_DUT_MO sums / CON_VAL_MO sums; DUT_VAL_MO is the coverage denominator. No GEN_VAL_MO denominator, monthly-rate average, country/world mixture, combined product total, shipment liability calculator or export duties.
- Preserve missing/suppressed/zero values and RP70/79 qualifications. Dollar eligibility uses existing comparison validity; share eligibility additionally requires both positive consumption denominators. No new growth threshold or qualified-only exclusion.
- Only displayed-country comparison records, ranking references, world summaries/counts and provenance reach the browser. No raw observation/history arrays or client data-provider calls.
- Keep all existing routes/CSV contracts/accepted data and fixed Canada snapshot intact. Node 24, installed dependencies, existing Free Pages target, static page/chart delivery, browser CSVs and private R2's existing role remain.
- Measure every build: files, total bytes, largest file; planning alert at 15,000. Dashboard package must have at most 1,000 entries, at most 26,214,400 bytes per asset, and no private/raw/fixture/secret/function/source-map content.
- Full approval includes reviewed GitHub merge, existing-project production upload/live verification and automatic prior-verified restoration on regression. Local-only approval stops after Task 4. No extra ordinary merge/design/task approvals; stop only for the spec's material exceptions.

## Review Focus

1. Nearly equal rational share changes, rounded zero, ratios above 100%, exact ties and stable ordering: the ranking must follow underlying integers, not display rounding. Task 1 pins this.
2. Valid country data with unavailable world figures or merchandise history: country eligibility/statuses stay independent, and research links explain unavailable country history. Tasks 1–3 pin this.
3. Complete amounts with RP70/79 affected value versus missing coverage, zero denominators, classification breaks, and a missing non-latest month: qualify or withhold exactly as specified, separately for each period/metric. Task 1 pins this.
4. Saved export/duplicate/invalid filters, Back/Forward and delayed clipboard completions: controls, displayed rankings and downloads restore together, while SSR remains an honest default. Tasks 2–3 pin this.
5. Reused HTML IDs, narrow keyboard/table navigation, invalid public package inputs or unexpected current production: avoid collisions/overflow and reject unsafe publication; old research/downloads remain available. Tasks 2, 4 and 5 pin this.

## File responsibilities

Create `src/lib/trade/duty-changes.ts` for build-time comparison/ranking/compaction and pure prepared selection; `src/lib/trade/duty-changes-link.ts` for route/query validation; `src/components/DutyChanges.tsx` for the selected tables/controls; `src/components/DutyChangesPage.astro` and the two route templates for published/fixture data. Extend `src/lib/trade/downloads.ts` for one serializer, and add links in `EstimatedDuties.tsx`/`MonthlyChanges.tsx`, definitions in `methods.astro` and scoped styles in `global.css`. Keep the core duty builder, importer/archive modules and old serializers unchanged.

## Task 1: Qualified rankings and compact preparation

**Files:** Create `src/lib/trade/duty-changes.ts`, `tests/helpers/duty-changes.ts`, `tests/trade/duty-changes.test.ts`.

**Interfaces:** Export `DutyChangePeriod = 'rolling'|'monthly'`, `DutyChangeMetric = 'share'|'dollars'`, `DutyChangesSelection = {period:DutyChangePeriod;metric:DutyChangeMetric}`. `buildDutyChangesView(release:Release,period:DutyChangePeriod):DutyChangesView` supplies product/title/month, dataset availability, combined classification compatibility, matching periods, world `DutyComparison|null`, country records `{code,name,comparison:DutyComparison,profileCountryAvailable:boolean}` and duty provenance. `rankDutyChanges(view:DutyChangesView,metric:DutyChangeMetric):DutyChangesRanking` supplies top-ten country records per movement and comparable/excluded/unchanged/qualified counts. `prepareDutyChanges(release:Release):PreparedDutyChanges` keeps each period's union of displayed records and ranking code references. `selectDutyChanges(data:PreparedDutyChanges,selection:DutyChangesSelection):SelectedDutyChanges` expands references into those same ranked records, with selected periods/counts/world/provenance; later consumers do no arithmetic.

Pin field names: `DutyChangesView` has `productCode`, `title`, `reportingMonth`, `available`, `classificationComparable`, `periods:{current:{from,to},previous:{from,to}}`, `world`, `countries` and `provenance` (the existing duty provenance shape). A ranking has `increases`, `decreases`, `totalCountryCount`, `comparableCount`, `unavailableCount`, `unchangedCount`, `qualifiedCount` and `exclusions:{classification_unverified,incomplete_period,coverage_unavailable,denominator_unavailable}`. Comparable count includes unchanged records; qualified count covers comparable countries with affected value in either period. Excluded countries are counted once, by precedence. Prepared data keeps identity/availability/provenance once and `views` keyed by period, each with periods/classification/world, a displayed-union `countries` array and `rankings` keyed by metric (same counts, code arrays instead of row arrays). Selected data has identity/provenance, `selection`, periods/classification/world and one expanded `ranking`.

- [ ] Write literal fixtures anchored at December 2025, using 24 months of World/Canada/Italy duties. Canada prior CAL/CON=1/10 each month and current=6/20; Italy prior=5/10 and current=1/20. World is their separate retained source total (6/20 then 7/40); merchandise world values remain distinct. Assert rolling Canada current/prior duties 72/12, consumption 240/120, shares 30%/10%, change +60 USD/+20 pp; Italy change -48 USD/-45 pp. Latest Canada is +5 USD/+20 pp. World rolling share is 17.5%, rather than any rate based on merchandise value.
- [ ] Add uneven-current-month test: Canada December CAL/CON=9/50, other current months=6/20. Assert current rolling 75/270, share `100*75/270` (not 29% monthly average), latest share18% versus10%, and monthly +8 pp. Keep World fixture source amounts consistent.
- [ ] Add status tests: missing non-latest month removes rolling but not a complete latest comparison; suppressed duty/consumption, missing coverage and split classification intervals withhold rankings; positive verified affected value remains qualified. A reported zero prior duty keeps dollar delta but growth is null; zero consumption stays dollar-eligible when existing validity allows it but share-ineligible. Assert mutually exclusive exclusion precedence and counts.
- [ ] Add exact rational near-tie/zero/tie and >100% tests with safe integer source amounts; signs and order are literal expectations. Assert top ten limits and unchanged counts. With unavailable World amounts, valid country rows stay eligible; with absent merchandise country history, the record has `profileCountryAvailable:false`. Schema-one data has no invented country rows. Assert input immutability and identical selected values before/after compaction, with no observations/monthly-history arrays and no non-displayed rows serialized.
- [ ] Run `npm.cmd test -- tests/trade/duty-changes.test.ts --maxWorkers=2`. Expected: new behavior fails before implementation. Implement the interfaces using existing `buildDutyView` in batches up to three and exact integer fraction ranking; no duty-builder API change. Re-run focused tests: expected green. Run the full unit gate at task completion, read failures, then commit model/fixtures/tests.

## Task 2: Imports-only pages, selection links and discovery

**Files:** Create `src/lib/trade/duty-changes-link.ts`, `src/components/DutyChanges.tsx`, `src/components/DutyChangesPage.astro`, `src/pages/changes/duties/index.astro`, `src/pages/changes/duties/[code].astro`, `tests/trade/duty-changes-link.test.ts`, `tests/ui/DutyChanges.test.tsx`. Modify `src/components/EstimatedDuties.tsx`, `src/components/MonthlyChanges.tsx`, `src/styles/global.css`.

**Interfaces:** Consume Task 1 `PreparedDutyChanges`/`selectDutyChanges`. Component props `{data:PreparedDutyChanges}`. Export `dutyChangesPath(productCode:string,selection?:DutyChangesSelection,hash?:string):string` (default 090121 route, other codes explicit), and `readDutyChangesSelection(search:string):{selection:DutyChangesSelection;notice:string|null}`. Defaults are rolling/share; canonical links include `direction=imports&period=rolling&metric=share`. Use existing `profileViewPath` for available country history, with imports/months12 and comparisonPeriod monthly when appropriate; append `#duties-heading`. Unavailable merchandise history uses an unfiltered product link plus explanatory text.

- [ ] Write URL/component tests first: valid monthly/dollars restoration, duplicate known parameters, direction exports, invalid/empty values, >2,048-character query, ignored tracking parameters, route validation, default missing parameters and explanation reset after edits. Assert invalid values restore rolling/share together; product links derive from published accepted-duty registry options.
- [ ] Write component tests for all four period/metric selections, matched headings/periods/denominators and coverage, world-unavailable country independence, unavailable dataset, profile link/fallback, unique IDs, pushState plus popstate/hash restoration, blocked clipboard fallback and stale completion suppression. Server rendering remains Imports/rolling/share with honest no-JS copy and disabled interactive controls.
- [ ] Run focused tests before implementation, expected failure. Implement the page/controls/tables and product links using existing patterns; only accepted-duty published products enter routes, and fixtures remain visibly synthetic. Links in the existing duty section and Imports changes view retain product identity; old controls/metrics are unchanged. No new graph or portfolio/print feature.
- [ ] Re-run focused tests and `npm.cmd run check`; expected green, zero diagnostics. Commit page/link/discovery changes after the unit gate.

## Task 3: Sourced ranking CSV and definitions

**Files:** Modify `src/lib/trade/downloads.ts`, `src/components/DutyChanges.tsx`, `src/pages/methods.astro`; create `tests/trade/duty-changes-downloads.test.ts` and extend `tests/ui/DutyChanges.test.tsx`.

**Interfaces:** Add `serializeDutyChangesCsv(view:SelectedDutyChanges):string`; consume only Task 1's exact selected ranked records. No old serializer/header changes. Filename `hs-<code>-imports-estimated-duty-changes-<period>-<metric>.csv`.

- [ ] Write parsed CSV tests first using independent `tests/helpers/parse-csv.ts`: Canada rolling row CAL72/12, CON240/120, shares30/10, changes60/+20pp and current/prior periods; monthly row6/1 and20/10. Assert only selected top-ten rows, exact ranks/movements, source/product/country identity, units/measure names, retrieval/code version/revisions/source URLs and ranking/exclusion counts.
- [ ] Assert current/prior DUT values, source statuses, completeness/classification, coverage/affected values and qualified flags. Test zero denominator in dollar ranking gives blank share with a qualification, while share ranking excludes it; zero prior duty gives blank growth. Country statuses remain reported when World is suppressed. Quoted/newline/formula-like strings round-trip safely and numeric negative differences stay numeric.
- [ ] Run focused tests, expected failure. Implement with existing CSV escaping and browser `downloadBlob`, using the same selected view as the tables. Include explicit denominator and estimate/coverage definitions on the page and Methods. No pre-generated combinations or server download endpoint.
- [ ] Verify both controls change the CSV along with the view and saved link. Re-run focused tests/check and unit gate; expected green and all prior serializer outputs unchanged. Commit.

## Task 4: Retained-data evidence, independent review and merge

**Files:** Create `tests/e2e/duty-changes.spec.ts`, `docs/validation/estimated-duty-country-movers.md`; use fresh ignored `.tmp/estimated-duty-country-movers-20261013-r1/` and `data/backups/estimated-duty-country-movers/20261013-r1/` for bounded proof. Update README after validated outcome.

**Interfaces:** Tasks 1–3 against real accepted releases and existing output contracts. Produce a reviewed exact-head CI-tested source commit and local evidence. Root implements; one fresh whole-branch reviewer handles code judgment, without implementation delegation or child reviewers.

- [ ] Browser tests on explicit fixture build: both published fixture routes, both controls/four selections, invalid links and real Back/Forward, downloads parsed against literal fixtures, available/fallback research links, unique IDs, no provider calls/raw observations, no-JS default, keyboard table scrolling and 320/375px layout. Watch the new behavior fail before writing its missing implementation/fixes.
- [ ] Run full units, `npm.cmd run check`, fixture build and all ordinary/private-Canada/pilot browser suites. Use bounded local workers/owned ports; summarize actual counts rather than fixing them to a future total. Expected: green, zero diagnostics, every build measured. Repeat broad suites only after a new change/failure or required CI gate.
- [ ] Stage accepted source/data separately from fixture output. Independently calculate each real country's monthly/rolling CAL/CON/DUT sums, coverage qualifications and exact ranking order from retained observations, without calling the ranking builder for expected values. Check all displayed rows, exclusion counts and eight CSV selections across two products, periods and metrics; compare browser/download source metadata and link destinations. Save observed totals and rounding tolerances (amounts/statuses/periods exact, floating display percentages bounded).
- [ ] Verify accepted coffee/Canada pointer, projection and protected hashes; compare prior CSV bytes, including portfolio and existing duty/merchandise serializers, with a pre-change baseline. Check existing Canada/profile/portfolio flows and coverage. Preserve only bounded source/prepared/evidence files, not raw archive collections or dependency junctions.
- [ ] Fresh whole-branch review of the immutable range and this spec/plan, covering the five Review Focus cases. Root verifies/regrades findings and fixes important defects with failing reproductions and green checks. Create/attach PR, run exact-head CI, confirm test/base/tree identity and merge under standing permission. Sync main and verify the merged tree; record local completion. If approval was local-only, stop here and report public publication as deferred.

## Task 5: Public update, verified recovery and closeout

**Files:** Fresh ignored `.tmp/estimated-duty-country-movers-deployment-20261013-r1/`; `data/backups/estimated-duty-country-movers/deployment-20261013-r1/`; new `docs/validation/estimated-duty-country-movers-publication.json` and documentation/README evidence updates after the actual result.

**Interfaces:** Task 4 merged source, unchanged seven accepted state files, existing Pages project `us-trade-tracker`, canonical `https://us-trade-tracker.pages.dev`, previous public receipt `docs/validation/coffee-portfolio-publication.json` and prior verified ZIP at `data/backups/coffee-portfolio-briefing/deployment-20261013-r1/site.zip`. Initial expected production is `713cf8e5-4894-4083-ba77-be2b534bcc4d`; verify current identity/content before any upload. This task requires the full-publication approval, not local-only approval.

- [ ] Authenticate the production baseline and prior restoration ZIP/manifest before mutation. Unexpected independent production changes, expired sign-in, new terms/charges or unresolved integrity failure stop the affected release step; keep useful local work within the permission envelope. No setting, permission or credential change is authorized.
- [ ] Export actual merged source and copy the seven accepted state inputs with readback hashes into a fresh stage. Build with Census data and `CANADA_PILOT_MODE=snapshot`, private preview flags absent. Apply explicit existing Pages header/404 templates; verify no private/raw/fixture/secret/function/source-map files, file/size bounds, complete manifest and ZIP payload readback. Reuse the bounded package probes/operators as local adapted copies; do not create a shared deployment framework. Run final real-site audits on this exact package, including new CSV selections and old research/outputs.
- [ ] Upload this verified package to the existing Free project without changing domain/indexing/access/billing. Verify canonical and deployment origins against all served hashes, noindex/nofollow and private/unknown-path 404s. Check all eight real duty-selection CSVs/controls plus existing portfolio/Canada/product checks and no-JS availability.
- [ ] If live regression occurs, restore the exact prior verified package to the same project immediately, verify restoration, then fix/review as warranted, rebuild and re-verify within scope. Do not delete the project or deploy the withdrawal placeholder as a substitute for the authorized prior-site restoration. If restoration itself cannot be verified, report the actual state and pause further mutation.
- [ ] Preserve final source/data/package/CI/review/live evidence with hashes and an outcome receipt; update the release record from those receipts, reviewed CI-tested merge included. Capture the live page. Seal the ledger before removing only this plan's owned temporary workspace; leave accepted sources and previous evidence intact. Report the delivered URL, tests, scope limits and any genuine unresolved findings; finish this batch.

## Approval package

Review this plan and its linked design together. **Full approval** permits all five tasks, local backups/tests, reviewer subagents, commits/pushes/PRs/CI, reviewed merges, production upload to the current Free Pages project, live verification and automatic prior-verified restoration/repair. **Local-only approval** permits Tasks 1–4 and their reviewed merge, with no public upload. No new Census/R2 operation, data promotion/replacement, recurring task, product/country intake, paid service, account/domain/access/indexing change, analytics/email/signup/billing or destructive action is included.

Execution method is already chosen: root implements inline with independent review. The owner can approve the entire package once; no additional spec/plan/task/merge approval round is required for the selected envelope. Material exceptions are those in the spec, not routine implementation choices.

## Plan self-review

Spec coverage mapped to Tasks 1–5. Builders/selectors/types are defined before consumers; prepared rows/ranking references supply both UI and CSV. Every Review Focus case has an owning test or release preflight. The existing duty builder and old serializer contracts are reused without widening them. Permission variants differ only at public Task 5. No source import, R2 operation, release promotion, new dependency or unresolved design placeholder is required.
