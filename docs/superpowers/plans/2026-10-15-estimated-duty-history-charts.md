# Estimated-Duty History Charts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root implements these five tasks; fresh independent reviewer subagents assess the completed immutable branch. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Help readers see monthly estimated-duty trends for the two existing coffee profiles, in dollars and as a share of imports for consumption, and download correctly sourced chart images.

**Architecture:** Project the existing DutyView into two aligned SVG charts. Preserve its calculations, tables and CSV. Reuse existing country selection, classification evidence, browser PNG conversion and authenticated staging/package/publication tools; add no query state or dependency.

**Tech Stack:** Existing Astro, React, TypeScript, Vitest/Testing Library/Playwright, Node 24 and Python 3.12+ standard library; locked dependencies.

**Spec:** The combined design below, grounded in the approved launch brief's Estimated duties and Shareable charts and tables features. The owner requested one plan for the next tasks and all execution permissions. This is a bounded extension of the existing profile, presented as a combined design/plan for that single review. Preparing this proposal authorizes no implementation or publication.

## Intended outcome and recommendation

The business reader wants to understand how estimated duties on recorded imports changed. The current profiles already provide verified latest-month/rolling comparisons and 24 monthly rows, but no duty history chart. Recommend this visual extension next: it makes sudden, sustained or intermittent changes easier to inspect using the same accepted observations. This is an improvement to an already accepted table feature, not a claim that previous acceptance was incomplete. Reader demand remains a hypothesis; no interviews are claimed.

Alternatives considered: monthly partner-share history would require new denominator projection while merchandise already has a chart; cross-product duty rankings add limited value for two products and risk misleading comparisons between different import mixes. Additional navigation-only batches offer less new research value. Keep those separate.

Success means the plotted points, table and CSV agree for the same product/countries/months; gaps and reporting qualifications remain visible; both exported images retain their own metric, identities and sources. The existing historical-data and successive-official-release limits remain explicit.

## Combined design

### Presentation and selection

Inside Estimated duties, before the per-geography latest/rolling/monthly details, add two vertically aligned figures: **Monthly estimated duties · current USD** and **Calculated duties as share of import value · %**. State that import value means imports for consumption (CON_VAL_MO). Both show the fixed 24-month duty window, currently September 2024–August 2026. The merchandise 12/60-month control does not shorten it.

Reuse DutyView's existing selection exactly: no countries selected shows All partner countries; otherwise show only the selected one to three countries, in selection order. Do not add the world line to selected-country comparisons. Use separate USD and percentage axes, the same month positions, straight segments, persistent country color/dash identities and a readable legend. No smoothing, dual axis, forecast, tariff explanation, new selector, URL parameter or route. Country selections already survive profile sharing/history; there is no additional chart selection to save.

Preserve latest/rolling figures, complete monthly tables, duty-change research link, source/methods text, existing CSV button/schema/filename/bytes and import-only visibility. Server HTML includes the default world charts/tables. Without JavaScript, the existing default-view explanation remains accurate; country changes and PNG/CSV downloads require JavaScript. New PNG controls are disabled until ready. Legacy releases without duties keep the current unavailable message and gain no chart/export.

### Values, gaps and qualifications

The new pure adapter copies monthly calculatedDutyUsd for dollars and dutySharePercent for share from DutyPeriod; it does not calculate another rate or rolling average. A reported duty zero remains a zero point. Missing/suppressed values are gaps. A zero/missing consumption denominator leaves share unavailable while reported dollar amounts remain visible. Do not cap valid shares at 100% or round a tiny positive share to a displayed zero. Point labels follow the current three-decimal/<0.001% convention; axis tick precision adapts to avoid misleading all-zero labels.

Join consecutive non-null points only when both months have verified coverage and the same reviewed classification interval contains both months. Use Release.classificationIntervals, not only each month's classificationCompatible flag: two individually verified months can sit in different intervals. Keep isolated reported points with unverified coverage/classification visible and explicitly qualified. Do not bridge a missing month. Verified RP70/79-affected months may connect but retain qualification markers.

Use hollow markers for RP70/79-affected or unverified points, filled markers otherwise; explain that convention in text. Each point's title includes month, country, metric value, consumption denominator, RP70/79 affected dutiable dollars/share, coverage and classification status. Provide visible per-series counts of affected/unverified/unavailable months, pointing to the existing detailed table; titles alone are insufficient. Keep the existing statement that reported zero duties do not prove duty-free trade and duty-share changes may reflect import mix/coverage. Charts show reported estimates, not final payments, shipment quotes or a causal tariff analysis.

### Accessible SVG and sourced PNGs

Each figure has an accessible metric/period label and description referencing its existing monthly tables. Responsive SVGs use shared plotting marks; decorative variants are aria-hidden behind one named figure, avoiding duplicate announcements. Tables remain the precise keyboard/screen-reader alternative. Check 320/375/1120-pixel layouts, visible focus and three long country names. No hover-only requirement.

Add **Download duty amounts chart PNG** and **Download duty share chart PNG**. Two images retain readable plots/qualifications within the unchanged 960×540 SVG / 1920×1080 PNG converter; a combined two-panel image would crowd its source information. Filenames: `hs-{code}-imports-estimated-duties-monthly-{dollars|share}.png`. Each uses exactly the displayed model and selected country order. Include feature/product code and description, imports, country identities/legend, actual 24-month period, metric/units, CAL_DUT_MO numerator and CON_VAL_MO denominator for share, RP70/79 and missing/classification qualifications, source, retrieval timestamp, processing version/revision status and a public source/methods reference. Mark fixtures visibly as synthetic.

Wrap metadata and verify its SVG text bounds within the fixed export canvas; never silently clip, overlap or drop a qualification. Snapshot the model, filename and cloned SVG at activation. Prevent duplicate in-flight clicks; discard late results/errors if the chart identity changes or the component unmounts. Identity includes product, metric, period, ordered countries, point values/qualifications and provenance; identical rerenders and a merchandise-only 12/60-month change do not invalidate it. Surface conversion/empty-image failure with a scoped alert and keep CSV available. Reuse exportChartPng/downloadBlob unchanged; do not alter shared merchandise/Canada exports.

## Files and interfaces

- Create `src/lib/trade/duty-history.ts`: exported `DutyChartMetric = 'dollars'|'share'`, `DutyChartPoint`, `DutyChartSeries`, `DutyChartModel`, and `buildDutyHistoryChart(view: DutyView, intervals: Release['classificationIntervals'], metric: DutyChartMetric): DutyChartModel`. Model retains product/title/fromMonth/reportingMonth/provenance; series retain code/name and all 24 monthly points in order. Points carry month, copied value, consumption denominator, breakBefore, classificationVerified and copied coverage/affected-value/share fields. Empty legacy views produce no series. Use existing Month/DutyView/Release types; no release-format change.
- Create `src/components/DutyHistoryChart.tsx`: `DutyHistoryChart({model,download?}:{model:DutyChartModel;download?:ReactNode})`; export shared `DutyPlotMarks({model,size})` and `DutyPlotSize` for responsive and export layouts. It renders values/qualification summaries without recalculating financial measures.
- Create `src/components/DutyChartDownload.tsx`: `DutyChartDownload({model}:{model:DutyChartModel})`, owning ready/busy/error state, snapshot export SVG and async lifecycle. Imports shared marks, not vice versa; avoid a circular dependency.
- Modify `EstimatedDuties.tsx` to accept `{view:DutyView;classificationIntervals:Release['classificationIntervals']}`, build/render both models and inject download controls. Modify the one ProductExplorer call to pass release.classificationIntervals; update direct component tests. Preserve ProductExplorer selection/controller behavior.
- Add only scoped duty-chart styles in `src/styles/global.css`. Existing duty tables remain.
- Add `tests/trade/duty-history.test.ts`, `tests/ui/DutyHistoryChart.test.tsx`, `tests/ui/DutyChartDownload.test.tsx`, `tests/e2e/estimated-duty-history.spec.ts`; extend affected `tests/ui/EstimatedDuties.test.tsx`. Existing duty/profile tests keep their assertions.
- Add `docs/validation/estimated-duty-history-charts.md`; update README and this plan with actual results. Keep existing calculators, serializers, release/manifest schemas, shared exporter and URL helpers unchanged.

## Global constraints

- Existing coffee products 090121/090111 only, retained merchandise/duty coverage through August 2026; Canada's accepted September 2024–August 2026 historical snapshot unchanged. No new data request, month, accepted-state replacement or intake.
- Preserve missing/suppressed/reported-zero distinctions, world/consumption denominators, ratio-of-sums rolling shares, RP70/79 qualifications, classification evidence and $10 million annual product-growth threshold. No calculation or CSV contract changes.
- Keep pages/chart data on the static host, downloads browser-generated and R2 private. No R2 operation belongs in this batch. No new dependency/service/account/domain, paid/indexing change, analytics or recurring job.
- Baseline main: **1b1c461586ffe2a3309e4f43236a6c29d729da4a**. Verified runtime: **93da58233d14e4d06c066999680661ab76b1e54f**. Prior completion confirms native archival, clean main and 444 sealed files/20,206,921 bytes; preservation-manifest SHA-256 **732d81ee034808fe0029210116a5dd291ef94c1914ad90a006638599fc39154c**. Authenticate these bindings before adopting the 112-CSV baseline, including its disclosed extra-28 indirect producer binding; recapture a bounded pre-edit baseline if authentication fails.
- Prior site: **31 entries / 1,712,596 raw bytes**, largest products/090121/index.html **285,044 bytes**. Measure and explain the new file/HTML/client-asset delta. Caps remain **1,000 entries**, **26,214,400 bytes/asset**, **2,097,152 total raw bytes**, **4 MiB ZIP**, existing **15,000-file planning alert**. If the chart exceeds the raw cap, reduce duplicate SVG/metadata within the design; raising caps needs a material decision.
- Preserve noindex,nofollow, provider templates, schema-v1 manifests, guarded staging/private-route exclusions, stable-read/containment/hardlink/reparse checks and bounded live-verifier rules.
- Synthetic fixtures preserve country<=world, status/value and coverage<=dutiable-value invariants. Retag every product identity when testing another code. Test failures from malformed fixtures are not evidence of a chart defect.
- Run focused checks during editing, one complete final suite and one retained-data rehearsal. Repeat affected acceptance for new changes/findings; an identical reviewed/merged runtime does not need another full build. Claim retained-data compatibility, not fresh source validity or broad browser/assistive certification.

## Permission envelope for all five tasks

Full approval authorizes the following without routine approval pauses:

1. Root source/test/docs implementation and ordinary in-scope repairs; fresh independent reviewer subagents; managed worktree creation/reuse; configured runtime setup and locked npm ci if needed. Root remains implementer; obtain one fresh whole-branch review of immutable base/head.
2. Read current accepted/protected identities and the seven compact accepted files consumed by site:stage. Make bounded private copies into at most three fresh ignored stages, each at most **16 MiB**, if repairs require rebuilding. Authenticate/reuse relevant sealed numerical/CSV/producer evidence; read only needed retained processed data/proof, with no raw archive replay or remote recovery. Preserve originals.
3. Local unit/type/fixture/build/browser checks, task-owned exclusive loopback previews with outside requests blocked, keyboard/mobile/no-JavaScript tests, actual sourced CSV/PNG downloads/screenshots and export error/race tests. Existing stage/precheck/retained build/postcheck/assembly/site-and-withdrawal ZIP creation/readback/deterministic recreation. Preserve at most **64 MiB** useful private proof excluding reproducible caches. Stop only owned processes; native archive only this batch's managed worktree after preservation/readback.
4. Commits, GitHub pushes, PR creation/update/attachment, existing standard-runner Code checks, expected-head reviewed merges under standing permission, main synchronization/tree verification and documentation closeout. Exact-final-head CI must pass before every merge. If attachments block the batch, verify/preserve references before unlinking at most four obsolete already-merged PR chat attachments; change no GitHub PR through that cleanup.
5. Signed-in read-only Cloudflare preflight, then publication of the exact accepted package to existing **Free / Production / us-trade-tracker** Pages project, account **2e23d873002d29a02a1427e1fa37c5cd**, canonical **https://us-trade-tracker.pages.dev**. Bind reviewed/CI-passed/merged runtime, unchanged inputs and package hashes immediately before upload. At most **two candidate uploads**; any repaired runtime candidate requires renewed affected acceptance, review and exact-head CI.
6. Bounded anonymous live verification on canonical and actual dashboard-observed deployment origins: one existing site:verify run per predecessor/candidate/restoration transition, plus one read-only retry only for demonstrated propagation/transient failure. Check the duty chart matrix below, existing briefing/profile and Canada sharing/download smoke journeys. Retain existing request/redirect/time/size/private-route limits; no broad crawl, guessed origin or recurring polling.
7. Automatic restoration of the exact pinned working predecessor below if a candidate regresses, at most once per failed candidate, followed by bounded restoration verification. Preserve the failed candidate and actual outcome. Do not substitute the withdrawal package for an ordinary regression. Report restoration executed only if used.

### Pinned predecessor and restoration

| Item | Pin |
| --- | --- |
| Production deployment | 6d1e06b1-068a-451e-acf7-9aab8b201ebe |
| Observed deployment origin | https://6d1e06b1.us-trade-tracker.pages.dev |
| Package directory | data/backups/briefing-research-links/deployment-20261015-r1/packages |
| Site ZIP | site.zip; 390,065 bytes |
| ZIP SHA-256 | f7ca0478381638b6c36d7f3296b8757b1c32e28401753c46fcc6c692ee2da9fe |
| Manifest SHA-256 | 5c754cb3c4e60f9161238ece0ebdd69a4aebd8ca92bdd9d61365fd667aad7117 |
| Package runtime | 93da58233d14e4d06c066999680661ab76b1e54f |
| Planning main | 1b1c461586ffe2a3309e4f43236a6c29d729da4a |

Planning readback confirms package/seal pins and prior completion. Before upload require the current Free target/Production identity and canonical/prior-origin payload to match. An unexplained concurrent change, input-integrity failure, changed/paid target, new access/terms obligation or material cost boundary stops dependent publication. Investigate read-only and complete unaffected work; ask only for a new material decision. Human sign-in/CAPTCHA or a new terms decision still requires that human step.

**Excluded:** imports/live source requests; raw replay/recovery; data replacement/intake; additional product/country/month; Canada refresh; any R2 operation; new dependencies/services/accounts/domains; access/indexing changes; paid changes; schedules/analytics/outreach/billing/subscriptions. Existing below-100-GB R2 preference does not authorize R2 work in this batch. No general chart refactor or new reusable acceptance subsystem.

## Review focus

1. Individually verified months across different classification intervals must not acquire a connecting segment. Keep reported isolated values and visible explanation. Tasks 1/2.
2. A reported zero, zero consumption denominator, tiny positive share or missing/suppressed measure must retain its distinct dollar/share behavior; missing dutiable coverage must not silently become a clean point. Tasks 1–3.
3. Qualified/unverified markers, country identity and full source/period/denominator information must survive mobile layout and exported image bounds; three long country names must not clip. Tasks 2–4.
4. Async export after country/history/direction navigation must never deliver a mismatched image/filename or stale alert; unchanged chart rerenders must not cancel valid downloads. Tasks 3/4.
5. New SVG/client payload must stay within package caps while unchanged 112 CSVs, accepted state, destination URLs and reviewed/merged runtime/package bindings survive publication. Tasks 4/5.

## Task 1: Build a faithful duty plotting projection

**Deliverable:** Pure chart model with exact metric values, gaps and continuity/coverage metadata.
**Files:** new duty-history.ts and tests/trade/duty-history.test.ts.
**Interfaces:** consumes unchanged DutyView and Release.classificationIntervals; produces the named chart types/buildDutyHistoryChart consumed by Tasks 2/3. All 24 month identities must align; reject malformed misaligned/duplicate monthly inputs rather than silently pairing different countries' months.

- [x] Record base, authenticate prior seal/completion/producer/runtime bindings and seven accepted/eleven protected identities before runtime edits. Verify all 112 baseline CSV bytes and Canada projection; preserve useful baseline receipt.
- [x] Write `copies_monthly_values_without_rolling_or_general_import_denominators`: sampleDutyRelease January 2025 dollars=19 and share=100*19/180; February dollars=1 and share=5. Preserve 24 months and world/selected-country order. Compare to existing table/CSV records, not a second adapter calculation.
- [x] Write `keeps_zero_gaps_tiny_shares_and_coverage` and `breaks_between_distinct_verified_intervals`: zero duty remains0; zero consumption gives null share; 3/1,000,000 implies0.0003%; missing/suppressed stays null; affected coverage copied; unknown coverage/classification isolates points; adjacent distinct reviewed intervals break even if both monthly flags are true. Include all-zero and all-null series, empty legacy data and malformed alignment.
- [x] Run `npm test -- tests/trade/duty-history.test.ts --maxWorkers=2` RED for absent adapter; implement only the projection/metadata/continuity checks, rerun GREEN and commit. Existing duties/calculators/serializers remain unchanged.

## Task 2: Add accessible monthly duty charts to the profile

**Deliverable:** Both SVG figures and visible qualifications follow the existing import/country selection.
**Files:** new DutyHistoryChart.tsx/UI tests; EstimatedDuties.tsx, ProductExplorer.tsx, scoped CSS and affected direct UI tests.
**Interfaces:** consumes Task1 DutyChartModel; produces DutyHistoryChart and shared DutyPlotMarks/DutyPlotSize. The optional download ReactNode lets Task3 inject controls without a circular import.

- [x] Write UI tests RED for literal headings/metric labels, exact sample point titles, same 24-month x positions, separate scales and zero/gap/interval segments. Pin hollow/filled marker meaning, visible per-series qualification counts, tiny-share labels and all-null explanatory state. A fully empty metric has no misleading line; valid all-zero values remain plotted.
- [x] Add selection tests: world→three countries→clear, preserve selected order, 12/60-month merchandise control leaves duty chart history unchanged; Exports removes duty figures and returning Imports restores default world behavior. A rerender/copy action does not create chart-specific URL state.
- [x] Implement shared SVG marks and responsive figures, pass classificationIntervals through the one ProductExplorer call, and render both within the existing duty section. Keep tables/summaries/source/CSV assertions. Initial server HTML contains world figures; legacy data has none.
- [x] Run `npm test -- tests/ui/DutyHistoryChart.test.tsx tests/ui/EstimatedDuties.test.tsx tests/ui/ProductExplorer.test.tsx --maxWorkers=2` GREEN, run `npm run check`, inspect the scoped diff and commit.

## Task 3: Add reliable sourced PNG downloads

**Deliverable:** Two browser images that match the displayed metric/selection and remain usable through failures/navigation.
**Files:** new DutyChartDownload.tsx/UI tests, injection in EstimatedDuties, new tests/e2e/estimated-duty-history.spec.ts.
**Interfaces:** consumes Task1 model, Task2 shared plot marks and unchanged exportChartPng/downloadBlob; produces the exact labels/filenames above and a bounded self-contained export SVG.

- [x] Write UI tests RED for both literal filenames/metadata, synthetic label, disabled-before-ready, duplicate-click guard and nonempty success. Use a deferred PNG conversion to verify changed chart identity/unmount suppresses late download/error; identical-data rerenders and merchandise-only history changes preserve a valid in-flight result. Empty/conversion failure shows scoped alert and leaves CSV enabled; error clears on changed model/retry.
- [x] Implement snapshot export and metadata wrapping with no shared exporter change. Include actual qualification counts and explanatory limitations; verify every text bounding box lies inside960×540 without overlap, using three long country names, long description/version and current source strings. If metadata cannot fit safely, fail export visibly and retain CSV; do not truncate meaning.
- [x] Add fixture browser cases for both products090121/090122, world/one/three-country selections and both images: actual download signature/nonblank1920×1080, metric/period/country/source SVG metadata and inspected PNGs, keyboard activation,320/375/1120 widths, no page overflow. No-JavaScript world figures remain readable and new controls disabled. Preserve merchandise/duty CSV buttons, profile shared links/history and imports-only behavior.
- [x] Run focused new UI/browser cases RED→GREEN around implementation. Run `npm run check`; commit once scoped acceptance passes. Keep fixture identity distinct from actual090111 retained-data acceptance.

## Task 4: Verify retained values and prepare the measured package

**Deliverable:** Accepted local package with independently checked points/images and unchanged data/download contracts.
**Files:** validation record, README and plan; existing staging/packaging tools reused.
**Interfaces:** consumes Tasks1–3 runtime and authenticated predecessor evidence; produces source/input/package pins and local receipts for Task5.

- [x] On final runtime run `npm test -- --maxWorkers=2`, `npm run check`, explicit fixture `npm run build`, `npm run test:e2e`, configured Python `-m unittest discover -s tests/packaging -v`. Expected: all pass; zero type errors/warnings/hints. Preserve meaningful failures and diagnose before correcting; do not overlap complete suites with staging deadlines.
- [x] Fresh site:stage/precheck/retained-Census-and-Canada-snapshot build/postcheck/assembly; recheck seven/eleven identities and exact replay of112CSV cases/Canada projection. No raw replay or new source call.
- [x] On task-owned assembled-package preview, independently derive monthly duties/consumption/share, coverage counts and continuity from retained processed observations, without application calculators. Matrix:090121/090111 × world/one country/three countries × two metrics =12 chart cases; inspect every point's metadata/coordinates against24months and capture **12PNG +6existing dutyCSV** actual downloads. Select observed eligible country codes from authenticated releases and record literal choices before checking; include an actually incomplete/qualified country when available, with fixture coverage otherwise explicitly distinguished.
- [x] Verify exact sourced CSV bytes, PNG dimensions/nonblank plot/metadata bounds and visually inspect representative world/three-country/qualified/zero-or-gap images plus desktop/mobile. Check saved country views/reload/history/12-vs60 independence, new export lifecycle tests, existing eight briefing handoffs, representative merchandise profile downloads and five Canada sharing/six-download smoke journeys. Block outside requests and retain errors/origin receipts.
- [x] Measure count/raw size/largest file/client payload and explain deltas; require unchanged caps/no extra route/stored downloads. Create/read back site/withdrawal ZIPs and deterministic recreations. Record local results with review/CI/publication pending, then commit acceptance. Rebuild/recheck affected cases for any runtime repair.

## Task 5: Review, merge, publish and close out

**Deliverable:** Verified public duty history charts, or a recorded failed candidate with the pinned working predecessor restored.
**Interfaces:** consumes Task4 source/data/package pins; produces actual review/CI/merge/deployment/live/preservation/archive outcomes.

- [ ] Self-check design/envelope; obtain fresh read-only whole-branch review of immutable base/head, exact Review focus and acceptance evidence. Root dispositions/repairs and affected verification; no unreviewed runtime candidate proceeds.
- [ ] Push/create/attach feature PR, require exact-final-head Code checks, expected-head merge, main synchronization/reviewed-tree and staged-runtime binding. Do not rerun full acceptance for identical merged runtime.
- [ ] Verify Free/Production and pinned predecessor with bounded site:verify. Immediately read back candidate/restoration ZIP+manifest and all accepted/protected identities. Upload only bound candidate, observe actual Production UUID/origin, then run candidate bounded payload/header/byte/private404 verification.
- [ ] Repeat the twelve-chart/twelvePNG/six-dutyCSV matrix publicly against retained expectations, plus bounded existing briefing/profile/Canada smoke checks; inspect saved public screenshot and actual image. On regression restore/verify pinned predecessor under the envelope and preserve failed candidate. A repaired candidate repeats its required gates.
- [ ] Record actual outcomes in reviewed documentation closeout with exact-head CI/expected-head merge/main tree/runtime binding. Preserve useful proof under `data/backups/estimated-duty-history-charts/deployment-20261015-r1`, seal/readback before native worktree archive, then confirm archived attachment/path absence, all preserved identities and clean main. Queued archive stays pending; post-seal completion metadata closes operational steps without rewriting earlier sealed pending status. Stop owned previews, preserve all rulings/limits and report completion truthfully.

## Self-review and execution handoff

This plan covers the existing profile flow without a new data/model subsystem. Monthly values come directly from accepted DutyPeriod; release intervals supply cross-month continuity. Unknown coverage does not silently become a clean connected trend, while reported points remain accessible in existing tables. Separate SVG axes and two sourced images avoid dual-unit ambiguity/crowded exports. File/interface dependency direction is acyclic; each Review focus has owning tests and publication gates. No CSV/calculator/shared-exporter/controller change is necessary. Package growth and historical-data limits remain bounded. Root implementation with fresh independent whole-branch review is retained from the established workflow.

Approval is requested for this complete combined design, five tasks and permission envelope. After approval execute all five without routine permission pauses; stop only for a new material boundary or required human authentication/terms step. Until then, only this proposal has been prepared.
