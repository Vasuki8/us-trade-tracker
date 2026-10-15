# Country-Share History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root implements these five tasks; fresh independent reviewer subagents assess the immutable completed branch. Steps use checkbox (`- [ ]`) syntax. The owner requested one combined design, plan and permission review; preserve that execution method and wait for approval before implementation.

**Goal:** Show how selected countries' shares of U.S. coffee imports or exports changed month by month, with exact values and sourced downloads.

**Architecture:** Add a country-share projection and figure to the existing product profile, using its validated merchandise view, accepted release, direction, country selection and 12/60-month history. Keep the dollar chart, duty charts, calculations, existing CSVs, browser transport and URL schema unchanged. Generate the new image and CSV in the browser.

**Tech Stack:** Existing Astro, React, TypeScript, Vitest/Testing Library/Playwright, Node 24 and Python 3.12+ standard library; locked dependencies.

**Spec:** The combined design below implements the existing launch brief's Country comparison, product history and Shareable charts and tables features: `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md`, First release and country-share definitions. Preparing this proposal authorizes no product change or publication.

## Outcome, recommendation and alternatives

The intended reader is a small import/export business or researcher asking whether a country gained share, or its dollar value simply followed the overall U.S. product market. Existing profiles plot monthly dollars and show monthly/annual endpoint shares; they do not plot the intervening share history. The accepted merchandise observations already contain the matching country and U.S. world totals. Reader demand remains a hypothesis; no interviews or willingness-to-pay evidence are claimed.

Recommend an **additional country-share figure** using the existing selections. Unlike a replacement chart metric, it preserves the legacy dollar chart/download contracts and requires no new saved-link parameter. With no countries selected, explain how to select partners; do not draw an unhelpful 100% world line. This also keeps the new selected-country SVGs and monthly table out of default server HTML.

Alternatives considered:

- A keyboard/touch month inspector improves access, but the existing tables already expose exact dollar/duty values. Share history adds a distinct research answer and will include its own exact monthly table.
- Export-only SSR omission has a measured opportunity: the two existing profiles contain 46,318 combined bytes of hidden duty-export markup. That is a separate narrow improvement, with no established speed benefit. The current package fits its caps; do not mix that optimization into this feature.
- More navigation-only work or more products/countries would respectively add less research capability or require new data acceptance. Keep both separate.

Success means every plotted share, table cell and new download agrees with the matching retained monthly numerator and denominator; unavailable values and classification boundaries remain visible; existing results/downloads and the historical Canada snapshot remain unchanged. No profitability, worldwide demand or tariff-causation conclusion is implied.

## Combined design

### Reader flow

Add **Country share over time** after the existing Trade over time/Compare countries area and before the selected-country comparison. Give it `country-share-history-heading` and one matching On this profile anchor. With one to three selected countries, render a figure named **Country share of U.S. imports · %** or **Country share of U.S. exports · %**, with the actual displayed month range, country names/codes and source/measure labels.

Use exactly the same selected-country order and actual months as the existing merchandise chart. The 12/60 control changes both merchandise charts; it still does not shorten the fixed 24-month duty history. Comparison-period/ranking/picker-search changes do not change this chart. Existing query parameters and section history already identify/share this view; add no new route, URL parameter or selector. Existing cross-page destinations remain unchanged.

With no countries selected, show: **Choose up to three countries in Compare countries to see their monthly shares.** Show no share plot or monthly table, and disable both new download controls. Explain the existing JavaScript requirement for restoring/selecting countries. Without JavaScript, default merchandise/duty research remains readable; no world-share plot is invented.

Use separate responsive percentage SVGs, straight segments and stable country colors from `seriesColor`. Current selection-relative dash patterns may supplement the colors; the previously disclosed dash-pattern limitation is not repaired or re-described as persistent identity in this batch. Keep screen/image legends consistent. Give the figure one accessible image description, with decorative SVGs hidden from assistive technology. Include an accessible **Monthly country shares** details/table containing month, country value, U.S. total, percentage, value statuses and classification status. Each table has a caption identifying its country and period. Long names must wrap without page overflow.

### Values, denominator and gaps

For each selected country/month, use `100 * countryValueUsd / worldValueUsd` only when both values are reported and the matching world value is positive. Imports use **GEN_VAL_MO** for both numerator and world denominator; exports use **ALL_VAL_MO** for both. Never use consumption value, duties, a sum of selected countries or an annual average. This feature creates no rolling/annual share calculation or new ranking policy.

Reported country zero with positive world value is 0%. Missing/suppressed country or world data, an absent month, or a zero world denominator gives an unavailable share. Preserve the separate source statuses; do not coerce them to zero. Reuse the existing profile validation that rejects a country's recorded value exceeding its world total; do not clamp inconsistent values into a plausible percentage.

Copy selected country values/months/names and classification flags from the validated ProfileView; resolve source statuses and matching world rows from the same release/product/direction/measure. An absent country/world row has status missing. Reject a mismatched release/view product, reporting month, source, retrieval/version identity or direction-specific measure, or duplicate matching world-month row. An unavailable share breaks the line. Adjacent non-null points connect only when both classifications are verified and the existing profile's boundary flag permits it. Individually verified points across different reviewed intervals remain disconnected. Preserve isolated points, with hollow markers for unverified classification and a visible explanation.

Keep full numerical precision in the model/CSV. Display shares to three decimals, with `<0.001%` for smaller positive values. Axis precision must distinguish a tiny positive series from zero; use compact/scientific labels where necessary. All-zero data is a valid chart/export. All-unavailable selected data retains the table and CSV, with a clear message and disabled PNG.

### New downloads and lifecycle

Add **Download country share chart PNG** and **Download country share data CSV**, with filenames `hs-{productCode}-{direction}-country-share-history.png` and `.csv`. Existing filenames, bytes and meanings remain unchanged.

The PNG is 1920×1080 from a 960×540 source SVG. Include metric, full product description/code, direction, actual period, ordered countries/codes, monthly numerator/world denominator definition, measure/units, missing/classification explanation and counts, source URLs, retrieval timestamp, processing version, revision status and methods URL. Label fixtures visibly synthetic. Reuse the existing converter/download functions; use measured wrapping and text-bounds/overlap checks as in the duty exports. Do not truncate metadata or shrink it below readability to force a pass.

The new source SVG exists only when a selected-country model is ready for export. Disable controls during SSR/hydration; the first enabled click must have a usable SVG. Snapshot model/content/filename together. Guard duplicate activation, changed model identity, away/back, release metadata change and unmount so stale completion/error is suppressed. Identical rerenders, picker search, section hash changes and monthly/annual summary changes retain a valid in-flight export. History changes cancel only when actual chart content/period changes. Conversion rejection, empty/wrong-type Blob or unsafe metadata shows a scoped error with the new CSV fallback; retry remains usable.

The new CSV has this exact column order:

`feature,product_code,product_description,direction,partner_code,partner_name,month,country_value_usd,country_value_status,world_value_usd,world_value_status,country_share_percent,numerator_measure,denominator_measure,units,period_start,period_end,classification_verified,classification_break_before,source,retrieved_at,code_version,revised,source_urls`

Use `feature=Country share history`; numerator/denominator measures are the same direction-specific merchandise measure. Units state current USD/not seasonally adjusted for amounts and percent for share. Emit selected-country order, then chronological months, including unavailable rows. Null numerical cells are empty; reported zeros are `0`. Preserve source URLs and existing CSV quoting/CRLF conventions in the new serializer; do not modify an existing serializer to add these columns.

## Global constraints

- Existing accepted products only: roasted coffee (HS 090121) and green coffee (HS 090111) through August 2026. Canada's September 2024–August 2026 historical release/qualifications remain unchanged.
- Node 24; configured Python 3.12+; `npm ci` with the existing lockfile. No dependency or browser transport change.
- No changes to existing financial calculators, archive/import tools, shared PNG converter, accepted-data pointers, URL controller/schema, existing CSV bytes, provider templates or indexing policy.
- Same static host and browser-generated downloads. No stored per-selection downloads, new routes, R2 delivery or new service.
- Keep the existing package gates: 1,000 entries, 25 MiB per asset; live-verifier policy 2 MiB total raw payload, 4 MiB ZIP, 1 MiB manifest and 128 logical checks. These pilot verifier policies are distinct from provider limits. Do not raise any cap to fit this feature. File-count planning warning stays 15,000.
- Current verified package:31 entries/1,855,036 raw bytes, largest090121 HTML 349,768 bytes; client JS 363,790 bytes/CSS 20,778 bytes. Raw live-policy headroom 242,116 bytes. Measure the candidate and explain all deltas; no speed improvement claim without paired evidence.
- Root implements; fresh independent whole-branch review. Follow existing test/build/stage/package/live proof tooling. Reuse existing numerical/reader harnesses rather than build a new acceptance subsystem.

## Permission envelope for all five tasks

Approval of this combined plan authorizes the following without routine approval pauses:

1. Root source/test/docs implementation and ordinary in-scope repairs; independent read-only reviewer/audit subagents; managed worktree creation/reuse; configured runtime setup and locked dependencies. Preserve planning originals before integrating their tracked copy.
2. Read/authenticate the current accepted/protected identities and prior compact evidence. Copy only the seven accepted files consumed by staging into at most **three fresh ignored stages**, each at most **16 MiB**. Reuse retained processed observations and sealed evidence; no raw archive/source replay, remote recovery or source request.
3. Local unit/type/fixture/retained builds, browser/keyboard/mobile/static checks, test-only export error/race probes, task-owned exclusive loopback previews with outside requests blocked, actual CSV/PNG downloads and screenshots. Existing stage/precheck/postcheck/assembly, site/withdrawal ZIP creation/readback and deterministic recreation. Preserve at most **64 MiB** useful private proof excluding reproducible caches; stop only owned processes and native-archive only this batch's worktree after preservation/readback.
4. Commits, GitHub pushes, PR creation/update/attachment, existing standard-runner Code checks, reviewed expected-head merges under standing merge permission, main synchronization/tree/runtime verification and documentation closeout. Require successful exact-final-head CI before each merge. If attachment capacity blocks this batch, verify merged status and preserve references before unlinking at most **four obsolete already-merged PR chat attachments**; do not modify those GitHub PRs.
5. Signed-in read-only Cloudflare preflight and publication of the exact reviewed/CI-passed/merged/data-bound package to existing **Workers Free / Active / Production / us-trade-tracker**, account **2e23d873002d29a02a1427e1fa37c5cd**, canonical **https://us-trade-tracker.pages.dev**. At most **two candidate uploads**; any runtime repair requires affected acceptance, review and exact-head CI before its upload.
6. Bounded anonymous live verification on canonical and dashboard-observed deployment origins: one existing site:verify run per predecessor/candidate/restoration transition, with one read-only retry only for demonstrated propagation/transient failure. Retain current redirect/request/time/body/private-route limits. Run only the specified share matrix and bounded existing reader checks; no broad crawl or guessed origin.
7. Automatic restoration of the exact pinned verified predecessor below if a candidate regresses, at most **once per failed candidate**, followed by bounded verification. Preserve failed candidates and actual outcomes. Do not substitute the withdrawal package for ordinary regression recovery; claim restoration only if executed.

**Excluded:** new imports/source requests/months/products/countries, raw replay/recovery, accepted-data replacement/intake, Canada refresh, R2 operations, new dependencies/services/accounts/domains, access/indexing changes, paid changes, schedules, analytics, outreach, billing or subscriptions. Prior below 100 GB R2 permission does not authorize R2 in this batch. Broad chart refactoring, old export optimization and the deferred dash-pattern fix remain separate.

Stop dependent publication for an unexplained concurrent Production/input change, integrity failure, changed/paid target, new material cost/access/terms boundary, or required human sign-in/CAPTCHA/terms step. Investigate read-only and complete unaffected work; ask only for that new boundary. Existing authorization covers ordinary implementation, review, merge and the specified publication/restoration.

### Pinned predecessor and restoration

| Item | Pin |
| --- | --- |
| Production | 21ce0245-1c26-4a23-8dff-4a0101922287 |
| Observed origin | https://21ce0245.us-trade-tracker.pages.dev |
| Package directory | data/backups/estimated-duty-history-charts/deployment-20261015-r1/packages |
| Site ZIP | site.zip; 405,972 bytes |
| ZIP SHA256 | 1356ba9d9b8ba8354bc59e88abedf0b7ad304c85dd95c6dde30c440bcd90174a |
| Manifest SHA256 | 278f298fd4bc6d9d118babc15623708773a16989a73237f93618ce60a0dc9add |
| Packaged source | f03250b9e757a3d9ea0fb458efac02fa8c19d2c9 |
| Last runtime change | 67c031a9d3d09f78ae58e1c57e1c1989eefad1d3 |
| Planning main | d8f1e50fbce9fdc5b1d1fe15ca9a1e35232991ef |
| Prior seal | 84e4282d343c090b71f79f1e4db41f98fbfca1e39af1ab45e0c8bd5cf9baf96e |
| Prior completion | 261a1dc635aa4d9cfe0ed27b3bf94680e19260efca3d1c5e0fddb4818d8ac615 |

Planning readback matched package/seal/completion pins and completed status. Before edits authenticate the relevant sealed evidence and source/runtime binding; before upload freshly verify current Free/Production assignment and canonical/predecessor payload. The prior 112 CSV/Canada projection audit and six producer pins remain the compatibility baseline, with the extra 28-case indirect producer-binding limitation disclosed. Preserve the six additional exact duty-chart CSV cases separately; do not inflate the112-case count or claim fresh source validity.

## File and interface map

- Create `src/lib/trade/country-share-history.ts`: `CountryShareHistoryPoint`, `CountryShareHistorySeries`, `CountryShareHistoryView`; `buildCountryShareHistory(release:Release,profile:ProfileView):CountryShareHistoryView`. Point fields:month,countryValueUsd,countryStatus,worldValueUsd,worldStatus,sharePercent,classificationVerified,breakBefore. Amounts/shares are number|null; statuses are ValueStatus. Series fields:code,name,points. View fields:productCode,title,direction,fromMonth:string|null,reportingMonth,series,provenance; copy existing ProfileView provenance and actual period.
- Create `src/components/CountryShareHistory.tsx`: `CountryShareHistory({view,download?}:{view:CountryShareHistoryView;download?:ReactNode})`, exported `CountrySharePlotSize` with width,height,left,right,top,bottom,fontSize numeric fields, and `CountrySharePlotMarks({view,size}:{view:CountryShareHistoryView;size:CountrySharePlotSize})` for consistent screen/export geometry. No import from the download component; accept the outlet to avoid a cycle.
- Create `src/lib/trade/country-share-downloads.ts`: `serializeCountryShareHistoryCsv(view:CountryShareHistoryView):string`; only the new CSV contract.
- Create `src/components/CountryShareHistoryDownload.tsx`: `CountryShareHistoryDownload({view})`; both new controls, measured source SVG and scoped lifecycle/error handling. Import shared plot marks and existing exportChartPng/downloadBlob; leave those functions unchanged.
- Modify `src/components/ProductExplorer.tsx`: project once per render from existing release/view; pass the same model to figure/downloads, add its section anchor. Modify only scoped new styles in `src/styles/global.css`.
- Tests: new `tests/trade/country-share-history.test.ts`, `tests/trade/country-share-downloads.test.ts`, `tests/ui/CountryShareHistory.test.tsx`, `tests/ui/CountryShareHistoryDownload.test.tsx`, `tests/e2e/country-share-history.spec.ts`; extend existing ProductExplorer integration tests.
- Acceptance/docs: `docs/validation/country-share-history.md`, current README pilot measurements/status and this plan. Correct README's currently stale latest-package summary while recording the new actual package; historical milestone figures remain historical.

## Review focus

1. A constant country value and changing U.S. total must change share correctly; selected-country totals, other direction/product/month and consumption denominators must never leak into it. Task1.
2. Adjacent individually verified months in different reviewed intervals remain disconnected; a missing country/world month breaks continuity without hiding other reported points. Tasks1/2.
3. A country zero, zero world denominator, tiny positive share or all-unavailable selection retains distinct display/export behavior; full identities/statuses survive mobile/PNG wrapping. Tasks1–3.
4. A conversion settling after country/window/direction/release navigation or away/back must not deliver stale output/error; identical rerenders and unrelated summary/hash changes preserve valid work. Task3.
5. Added client/selected-country UI must fit unchanged package policies while112 existing CSV cases, six duty-chart CSV cases, Canada projection, accepted/protected identities and reviewed/merged package binding remain intact. Tasks4/5.

## Task 1: Project independently testable monthly country shares

**Deliverable:** Pure typed projection preserving monthly country/world values, statuses and classification continuity.
**Interfaces:** consumes Release+validated ProfileView; produces the model consumed by Tasks2/3. Do not modify ProfileView or existing calculators.

- [x] Before runtime edits, create/verify the managed worktree, preserve the original approved proposal/hash, configure locked runtime, authenticate the predecessor seal/completion and relevant source/input/CSV producer evidence, and record the baseline test result. Recheck seven accepted/eleven protected identities. This is setup for Task1, not work to postpone until Task4.
- [x] Write adapter tests first. For the existing sampleRelease and imports/12 months/Canada, change only December 2025 world value from100 to200: November country 25/world 100/share 25, December country 25/world 200/share 12.5. Three selected countries each25/world100 must each be25%, not33.333%. Test both directions/measures/product identities and selection order/empty selection.

```ts
const release=sampleRelease();
release.observations.find(r=>r.direction==='imports'&&r.partnerCode==='-'&&r.month==='2025-12')!.valueUsd=200;
const profile=buildProfileView(release,{direction:'imports',months:12,countryCodes:['1220']});
const points=buildCountryShareHistory(release,profile).series[0].points;
expect(points.at(-2)).toMatchObject({countryValueUsd:25,worldValueUsd:100,sharePercent:25});
expect(points.at(-1)).toMatchObject({countryValueUsd:25,worldValueUsd:200,sharePercent:12.5});
```
- [x] Cover reported0/world100→0; missing/suppressed/absent country or world→null with original statuses; world0→null (set all fixture country rows to0 in that month to respect existing country≤world validation); tiny country1/world1,000,000,000→0.0000001%; all-zero/all-unavailable series; actual-window clipping/single month; interval boundary/unverified month/missing denominator; identity/duplicate-world rejection. Preserve existing rejection of country>world.
- [x] Run `npm test -- tests/trade/country-share-history.test.ts --maxWorkers=2`. Expected RED for absent projection, then implement the declared interfaces and run GREEN. Assert input immutability and no new duty/annual calculations. Commit adapter/tests plus approved plan.

## Task 2: Add readable profile share history and exact monthly data

**Deliverable:** Responsive accessible figure/table following existing filters without altering old charts/results.
**Interfaces:** consumes Task1 model; produces shared marks/geometry and an optional download outlet for Task3.

- [x] Write component/integration tests first: no-selection prompt/no100%world line/disabled outlets; imports/exports heading and measure, actual12/60 period, ordered one/three series, exact numerator/world/share cells and statuses, zero/null/tiny cases, classification path commands and isolated markers, all-unavailable message/table, accessible figure/image/table captions and unique section anchor. Existing duty24-month period and existing dollar chart remain unchanged.
- [x] Run the new UI file and `tests/ui/ProductExplorer.test.tsx`; expected RED, implement the declared component/marks/integration/scoped styles, then GREEN. Use percentage axes and separate names/classes so old merchandise/duty tests cannot accidentally count new SVG marks. Commit.

## Task 3: Add sourced share PNG/CSV and navigation-safe export behavior

**Deliverable:** Two new downloads with complete identities/values and no stale async effects.
**Interfaces:** consumes Task1 model and Task2 shared marks; produces new CSV bytes and an image snapshot without modifying old serializers/converter.

- [x] Write serializer/UI tests first for the exact CSV columns/order, per-country chronological rows, full-precision ratios/zero/empty cells/source statuses, both measure directions, Unicode/commas/quotes/newlines and provenance. Test SSR-disabled controls/no new export SVG, first-enabled-click readiness, no-selection disabling, all-null PNG disabled with CSV available, all-zero PNG enabled, duplicate activation, reject/empty/wrong-type result/retry, changed identity/release, A→B→A, unmount, identical rerender and unrelated comparison/hash state. CSV fallback must download the current model.
- [x] Run the two new files, expected RED; implement serializer/download component and its ProductExplorer outlet; run GREEN. Check measured full metadata/long-country/version wrapping, plot/text bounds and nonoverlap; oversized unsafe metadata fails visibly with CSV fallback. Commit.
- [x] Add fixture browser matrix for two labeled fixture products×Imports/Exports×12/60×one/three countries, with actual keyboard PNG/CSV activation, dimensions/nonblank marks, model/filename/source, 320/375/1120 layouts, copy/reload/native history/removal/search and both static-default journeys. Exercise injected export failure and preserve fixture labeling. Run explicit fixture build and `playwright test tests/e2e/country-share-history.spec.ts`; expected all pass. Commit test acceptance.

## Task 4: Verify retained observations, old contracts and measured package

**Deliverable:** Locally accepted, authenticated package with independent new share arithmetic/download proof.
**Interfaces:** consumes Tasks1–3 runtime and pinned predecessor evidence; produces source/input/package pins for Task5.

- [x] Confirm Task1's native-worktree/setup/authenticated baseline records; preserve meaningful failures honestly. On final runtime run `npm test -- --maxWorkers=2`, `npm run check`, explicit `TRADE_DATA_MODE=fixture npm run build`, `npm run test:e2e` and configured Python `-m unittest discover -s tests/packaging -v`. Set SITE_PACKAGE_PYTHON explicitly. Expected all pass, zero type errors/warnings/hints. Do not overlap full suites with staging deadlines.
- [x] Fresh `site:stage create --source-root <worktree> --data-root <primary> --output <fresh-stage> --commit <accepted-head>`, verify, retained build with TRADE_DATA_MODE=census/CANADA_PILOT_MODE=snapshot/private preview flags removed, verify again, then existing site:prepare. Follow README's exact owned-path commands. Replay112 existing CSV cases, Canada projection and the six duty-chart CSV cases; recheck seven accepted/eleven protected identities and unchanged data props/destinations. No raw replay or source request.
- [x] Serve only the assembled package on owned loopback origins. Derive expected shares/rows/statuses/continuity directly from retained processed observations without application calculators. Pin literal selections before acceptance:090121 both directions one1220/three1220,2010,2050;090111 imports one4419/three4419,2010,2050;090111 exports one2010/three4419,2010,2050. Verify both12/60 windows: **16 chart cases,16PNG+16CSV**. Also verify green exports/12 months/4419 alone: all 12 country months absent, PNG disabled and a 17th CSV with 12 unavailable rows. Green imports4419 has57/60 records with 33 zeros; green exports4419 has27/60 records and no last 12 records; preserve these observed gaps/zeros rather than fabricating completeness.
- [x] Check every available plotted point's raw ratio, numerator/denominator, title, geometry, hollow state, path break, ordered legend and table/CSV agreement. Check actual PNG signature/1920×1080/nonblank plot/full source metadata/text bounds and no overlap. Verify copy/reload/history,12/60/direction/country removal, keyboard/mobile/static defaults and no page errors/outside requests. Visually inspect world/default prompt, three-country, zero/gap and long-name images/mobile. Unavailable values, classification edge cases or suppressed data absent in real releases must be distinguished as fixture coverage.
- [x] Reuse bounded existing acceptance:12 duty-chart/12 PNG/six exact CSV matrix, eight briefing handoffs/eight exact CSV/two static journeys, four merchandise-profile journeys/48 monthly values/eight downloads, and five Canada-sharing/six-download journeys. Preserve useful failures; repair only demonstrated in-scope defects and repeat affected acceptance.
- [x] Measure entry count/raw/gzip profile HTML/clientJS/CSS/largest asset and explain all changes, separating default markup from selected-country DOM. No new HTML route/stored download; unchanged live/package caps must pass. Create/read back site/withdrawal ZIPs and deterministic recreations. Derive candidate logical check count from its actual manifest; do not assume the predecessor's 68 checks if bundling changes asset count. Record actual results in validation/README/plan with review/CI/publication pending; commit.

## Task 5: Review, merge, publish and close out

**Deliverable:** Verified public share history or a failed-candidate record with the pinned working predecessor restored.
**Interfaces:** consumes Task4 source/data/package pins; produces actual review/CI/merge/deployment/live/preservation/archive outcomes.

- [ ] Self-review combined design/constraints; obtain one fresh read-only immutable whole-branch review with the exact Review focus and evidence/ledger. Root dispositions/required repairs and affected checks; no unreviewed runtime candidate proceeds.
- [ ] Push/create/attach feature PR, require successful exact-final-head Code checks, expected-head merge, main synchronization/reviewed-tree and staged-runtime binding. Do not repeat complete local acceptance for identical merged runtime.
- [ ] Fresh signed-in Free/Active/Production preflight and bounded canonical/current-predecessor verification. Immediately read back candidate/recovery ZIP+manifest pins and all accepted/protected identities, then upload only the bound candidate. Observe actual Production UUID/origin; run existing bounded site:verify using actual manifest-derived check counts.
- [ ] Repeat the16-chart/16-PNG/17-CSV share acceptance publicly against retained expectations, plus the specified duty/briefing/profile/Canada checks. Inspect saved public screenshots/downloaded PNGs. On regression execute and verify the pinned restoration within the envelope; preserve failed candidates and honest outcomes. Repaired candidates repeat affected acceptance/review/exact-headCI before upload.
- [ ] Record actual public outcomes through reviewed documentation closeout with exact-headCI/expected-head merge/final-main-tree/source/input binding. Preserve useful proof under `data/backups/country-share-history/deployment-20261015-r1`, seal/read back before native archival, stop owned previews and confirm archived attachment/path absence and clean main. Queued archive remains pending. Post-seal completion/ledger/archive metadata closes actual operations without rewriting earlier sealed pending records. Preserve all rulings/minors/limits and report truthfully.

## Self-review and execution handoff

The new model uses existing direction-specific monthly merchandise/world values; old calculators/CSV/controller contracts are untouched. Empty/default and all-unavailable selections have distinct behavior, while tiny positive and zero shares remain distinct. Point/line continuity, exact data access and sourced exports have explicit owning tests. The chart/download dependency direction is acyclic. Selected-only rendering controls default markup growth without an unrelated loading refactor; unchanged measured caps remain publication gates. Current predecessor pins were read back, and all expected local/GitHub/publication/restoration/preservation permissions are bundled above.

This document is a proposal only. Review the combined design, five tasks and permission envelope. Full approval permits root implementation with independent review and the specified publication/restoration, without routine approval pauses; it does not authorize excluded data/service/access/cost changes.

## Execution checkpoint

Tasks1–4 local acceptance passed:1409unit/161browser/24Python tests,zero type diagnostics;112 unchanged CSVs/projection and six duty CSVs;16share charts/1048points/128zeros/104unavailable/16PNG/17CSV/1164rows independently verified. Candidate31files/1,873,449rawbytes/408,596byte ZIP;publication/review/CI and operational closeout pending Task5. See docs/validation/country-share-history.md.

Task5 reviewed-fix checkpoint: original immutable review d8f1e50..d17d257; root one-pass tiny-axis fix43de076 RED→GREEN and1411unit/164browser/24Python/0diagnostics. Fresh second-stage retained matrix/legacy compatibility pass; final candidate31entries/1,873,448rawbytes/408,591byte ZIP. Initial candidate never uploaded. CI/merge/publication/closeout remain pending.
