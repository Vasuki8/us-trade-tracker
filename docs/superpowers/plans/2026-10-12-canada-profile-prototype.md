# Local Canada Profile Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. The owner has already selected native execution: root implements, with an independent subagent reviewing before merge. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an opt-in local Canada research page using the verified 24-month snapshot, with direction controls, all-goods history, leading-product comparisons and sourced browser CSVs.

**Architecture:** A gated server loader authenticates the fixed assessment and projects a small country-specific presentation model. An Astro preview route renders a React country explorer; dedicated serializers export its displayed values. Synthetic browser checks use an isolated fixture build, while ordinary builds omit the route and retained data.

**Tech Stack:** Node 24, TypeScript, Astro 7.3.8, React, Vitest/Testing Library and Playwright; existing dependencies only.

**Spec:** [Approved written design](../specs/2026-10-12-canada-profile-prototype-design.md). The owner approved the written design on October 12, 2026; this plan still requires owner review before implementation.

## Global Constraints

- Country `1220`, Canada only; national merchandise, all transport. September 2024–August 2026, 24 months per direction and 48 contexts.
- Imports `GEN_VAL_MO`, general/customs value; exports `ALL_VAL_MO`, domestic plus foreign/reported FAS. Nominal integer USD, not seasonally adjusted.
- Current period `2025-09..2026-08`; prior period `2024-09..2025-08`. Same-archive denominators; no cumulative differencing, rescaling or zero substitution.
- Fixed route `/preview/countries/1220/`; `CANADA_PREVIEW_MODE` unset omits it, `fixture` labels synthetic data, `retained` authenticates the reviewed assessment, every other value is invalid. An empty string is invalid, not unset.
- Retained path `data/backups/canada-country-audit/snapshot-classifications-2026-10-12-r1/snapshot-assessment.json`; exact 858,857 bytes/SHA-256 `2cad0dcabf353b8aec0d365bb247e5d976712a7a1ebc90cac26694322503d9f8`, within a 1 MiB read ceiling. No caller input/digest override.
- Processing commit `9c385fb94b2a36b1d07ddf9e01670c366839a83b`; classification ledger 487,985 bytes/SHA-256 `afde19b1384c0cbab8cb2f7bbbc5ed8253bc636bb7a35c6b8d5d3c599a1010fd`; policy `canada-archive-snapshot-v1`, assessment schema 1.
- Preserve the ten selected candidates/order in each direction, including imports `980100` and exports `988000`/`880000`. Seventeen ordinary candidates qualify; three statistical rows retain observed totals but null share/growth/change comparisons. No backfill or new ranking.
- Preserve before/after `41 matched / 7 mismatch`, seven original-publication matches and 41 unreviewed publication contexts. A mismatch stays a mismatch. Do not claim a uniform revision vintage or latest revised headline history.
- Project no source bodies, filesystem paths, 941 classification bindings, candidate monthly observations or 223,049 normalized rows into browser props.
- Keep all release/public/default-retrieval flags false. No accepted pointer, country archive schema, R2 operation, source request/replay, workflow option, five-year intake, broader catalog, duties, deployment, schedule, access change or paid service.
- Preserve accepted coffee files, historical reports/evidence, source originals and prior classification/capture flags. Measure builds with the existing report; CSVs generate in the browser.

## Review Focus

1. Unset or invalid preview mode: ordinary builds perform no assessment read and emit no preview page/data; invalid/empty modes fail instead of silently enabling another mode. Tasks 2 and 5.
2. Changed, oversized, crossed or reparse-point input: retained mode rejects it without fallback, provider requests or accepted-pointer writes. Task 2.
3. Duplicate/missing months, unsafe sums or zero prior totals: fail malformed contracts, withhold unavailable summaries and show no fabricated zero/growth. Task 1.
4. Statistical categories and direction switching: keep selected rows and all-goods denominators, with unavailable statistical comparisons and chart/table/download direction agreement. Tasks 3 and 4.
5. Reference/provenance/text hazards: preserve seven mismatches, keep monthly/rolling denominators explicit, export source identities and protect formula-looking CSV text without changing numeric dollars. Tasks 3–5.

## File Structure

| File | Responsibility |
| --- | --- |
| `src/lib/country-preview/types.ts` | Browser-safe country model types; no runtime server imports |
| `src/lib/country-preview/summary.ts` | New all-goods period summary calculation |
| `src/lib/country-preview/project.server.ts` | Fixed assessment validation and minimal projection |
| `src/lib/country-preview/contract.server.ts` | Fixed pins, candidate keys/order, periods and route |
| `src/lib/country-preview/load.server.ts` | Mode gate, authenticated retained load and explicit fixture load |
| `src/lib/country-preview/downloads.ts` | Two country CSV serializers and filenames |
| `src/components/CanadaPreview.tsx` | Direction state, overview, leading table, methods and downloads |
| `src/components/CountryPreviewChart.tsx` | Country-specific monthly chart and equivalent table |
| `src/pages/preview/countries/[code].astro` | Gated static paths, preview heading and hydration |
| `src/layouts/BaseLayout.astro` | Optional robots metadata; default product layout unchanged |
| `src/styles/global.css` | Scoped preview/table styles |
| `tests/helpers/country-preview-data.ts` | Hand-derived synthetic assessment/model factories |
| `tests/fixtures/canada-preview.json` | Small, explicit synthetic browser presentation model |
| `tests/country-preview/*.test.ts[x]` | Calculation, adapter, loader, CSV and component tests |
| `tests/e2e/canada-preview-boundary.spec.ts` | Normal-build preview absence |
| `tests/e2e-preview/canada-preview.spec.ts` | Opt-in fixture browser behavior |
| `playwright.canada-preview.config.ts` | Separate fixture suite/server configuration |
| `scripts/serve-canada-preview-fixture.ts` | Owned temporary fixture build/server for that suite |
| `README.md`, `package.json` | Usage and existing-CI browser-suite integration |
| `docs/validation/canada-profile-prototype.md` | Actual retained-preview/build/review acceptance record |

## Task 1: Country model, all-goods summaries and assessment projection

**Files:** Create `types.ts`, `summary.ts`, `project.server.ts`, `contract.server.ts`, `tests/helpers/country-preview-data.ts`, `tests/country-preview/summary.test.ts`, `tests/country-preview/projection.test.ts` in the locations above.

**Interfaces:**

- `CountryDirection = 'imports'|'exports'`; `CountryPreviewMode = 'fixture'|'retained'|null`.
- `OriginalSource = {month:string;url:string;capturedAt:string;bytes:number;sha256:string}`. Fixture points may have `originalSource:null`; retained points require the checked original ZIP metadata. No local `path`/`file` field is public.
- `CountryTotalPoint = {month:string;valueUsd:number|null;originalSource:OriginalSource|null}`.
- `CountryPeriodSummary = {from:string;to:string;reportedMonths:number;totalUsd:number|null}`; `CountryTotalSummary = {latestMonth:string;latestUsd:number|null;current:CountryPeriodSummary;prior:CountryPeriodSummary;changeUsd:number|null;growthPercent:number|null}`.
- `CountryProductPeriod = {from:string;to:string;reportedMonths:number;observedSumUsd:number|null;countryTotalUsd:number|null;sharePercent:number|null}`.
- `CountryProductSummary = {code:string;description:string|null;current:CountryProductPeriod;prior:CountryProductPeriod;comparisonEligible:boolean;reason:string;specialByPolicy:boolean;classification:{status:'compatible'|'incompatible'|'unverified'|'statistical-category';from:string|null;to:string|null};changeUsd:number|null;growthPercent:number|null;sharePointChange:number|null}`.
- `PublicReferenceSource = {url:string;capturedAt:string;bytes:number;sha256:string}`; `CountryReferenceDifference = {month:string;archiveUsd:number;currentBeforeUsd:number;currentAfterUsd:number;differenceBeforeUsd:number;differenceAfterUsd:number;publicationUsd:number|null;publicationDifferenceUsd:number|null;publicationCheck:'matched'|'mismatch'|'unavailable'|'not-reviewed'}`.
- `CountryReferenceSummary = {before:{matched:number;mismatch:number;source:PublicReferenceSource|null};after:{matched:number;mismatch:number;source:PublicReferenceSource|null};publication:{matched:number;notReviewed:number};differences:readonly CountryReferenceDifference[]}`. Fixture sources may be null; retained sources bind each saved current HTML body. Copy reviewed outcomes; do not equate a nonzero rounded-reference difference with a mismatch.
- `CountryDirectionView = {direction:CountryDirection;measure:'GEN_VAL_MO'|'ALL_VAL_MO';title:string;monthly:readonly CountryTotalPoint[];summary:CountryTotalSummary;products:readonly CountryProductSummary[];references:CountryReferenceSummary}`.
- `CountryPreview = {schemaVersion:1;countryCode:'1220';countryName:'Canada';source:'fixture'|'retained';reporting:{from:string;to:string;latest:string};captureInterval:{startedAt:string;finishedAt:string};processingVersion:string;rawVerification:'synthetic'|'previous-reviewed-replay';directions:Record<CountryDirection,CountryDirectionView>;availability:{releaseAccepted:false;rollingComparisonsAvailable:false;defaultAuditRetrievalChanged:false}}`.
- `buildCountryTotalSummary(points:readonly CountryTotalPoint[]):CountryTotalSummary` derives the fixed periods and latest month. Require unique valid months and safe nonnegative amounts; a missing/null month makes the affected period unavailable, duplicate/unsafe input throws, and zero prior total yields null growth. Check sum and signed-difference safety.
- `validateRetainedAssessment(value:unknown):SnapshotAssessment` and `projectRetainedAssessment(value:unknown):CountryPreview` live in `project.server.ts`. Use the existing `SnapshotAssessment` type only on the server. `canadaPreviewContract` in `contract.server.ts` defines the global fixed pins/periods and candidate order; imports are `270900,980100,271019,271121,870323,870340,870324,870829,271012,880240`, exports `988000,270900,880000,870431,271012,271019,870899,847150,870323,711291`.
- Test-helper named exports are `makeCountryTotalPointsFixture():CountryTotalPoint[]`, `makeCountryAssessmentFixture():SnapshotAssessment` and `makeCountryPreviewFixture():CountryPreview`. They supply the explicit synthetic amounts described below, without calling production summary, projection or assessment functions. Presentation fixtures use synthetic provenance and null original-source records.

- [ ] Write summary tests with 12 prior months at USD 100,000 and 12 current months at USD 200,000: prior 1,200,000; current 2,400,000; latest 200,000; change 1,200,000; growth 100. Assert missing/null yields null totals/change, reported zero remains zero, zero-prior growth is null, and duplicate/unsafe/overflow inputs throw.

```ts
it('summarizes complete fixed country periods with matching months', () => {
  const result = buildCountryTotalSummary(makeCountryTotalPointsFixture());
  expect(result.prior.totalUsd).toBe(1_200_000);
  expect(result.current.totalUsd).toBe(2_400_000);
  expect(result.latestUsd).toBe(200_000);
  expect(result.changeUsd).toBe(1_200_000);
  expect(result.growthPercent).toBe(100);
});
```
- [ ] Write projection tests using an independent synthetic assessment factory, never calling `assessCountrySnapshot` to construct expectations. For product position `i=0..9`, use prior monthly `(10-i)*1,000`, current monthly `(10-i)*2,000`, and explicit hand-derived period/share values. Assert 48 chart points, fixed 20 summaries/order, imports `270900` current/prior 240,000/120,000 and shares 10/10; growth 100; share-point change 0. Statistical comparisons stay null. Simulate seven January–July 2026 export current mismatches and original matches: imports have 24 current matches/zero mismatches and 24 unreviewed publications; exports have 17 current matches/seven mismatches, seven original matches/17 unreviewed publications. Totals across both views are 41/7 and 7/41, kept separate.
- [ ] Add rejection cases for wrong policy/commit/ledger identity, incomplete or duplicate context grid, wrong measures, unsafe values/residuals, crossed original `context_id`, invalid source metadata, candidate key/order/period/completeness mistakes, eligible statistical rows, non-finite derived values and any true availability flag. Verify the projected object contains no candidate `months`, source bodies, raw binding arrays or filesystem paths.
- [ ] Run `npm.cmd test -- tests/country-preview/summary.test.ts tests/country-preview/projection.test.ts --maxWorkers=2`; confirm missing modules/behavior produce RED.
- [ ] Implement the declared types, fixed contract, summary and projection. Map originals by `context_id`; public metadata comes from `source_url`, `retrieved_at`, `bytes`, `sha256`. Reuse existing safe scalar conventions on the server. Copy reviewed product ratios/growth/share changes; compute only the newly required all-goods summary and eligible dollar difference. Do not rerun the assessor, load source files or infer row vintages.
- [ ] Run the focused command to GREEN and `npm.cmd run check`; confirm no diagnostic failures. Commit the model/calculation/projection deliverable.

## Task 2: Mode-gated loader and synthetic browser fixture

**Files:** Create `src/lib/country-preview/load.server.ts`, `tests/fixtures/canada-preview.json`, `tests/country-preview/load.test.ts`; use Task 1's contract/model/helper.

**Interfaces:**

- `resolveCanadaPreviewMode(value:string|undefined):CountryPreviewMode`: only `undefined`, `fixture`, `retained` are accepted.
- `loadCanadaPreview(options?:{workspaceRoot?:string;modeValue?:string}):Promise<CountryPreview|null>` resolves the mode from `modeValue` when present, otherwise `process.env.CANADA_PREVIEW_MODE`, before I/O. This is internal build/test configuration, not a CLI source/pin override. `workspaceRoot` defaults to `process.cwd()`.
- `validateFixturePreview(value:unknown):CountryPreview` requires synthetic provenance, fixed country/grid/candidate order, safe numbers and false availability; presentation tests may clone this model to exercise unavailable values.
- Retained loading consumes `canadaPreviewContract.assessment` and `projectRetainedAssessment`. Reuse `readSnapshotFile`/safe path conventions from `scripts/country-snapshot-input.ts`, while first enforcing the 1 MiB/pinned-length constraint. Read the assessment alone; do not call `loadReviewedCollection` or open reviewer/normalized files.

- [ ] Write mode tests: undefined returns null; invalid/empty/case/whitespace variants throw; unset mode invokes no file read/path validation/provider/accepted-write operation.

```ts
it('requires an explicit recognized preview mode', () => {
  expect(resolveCanadaPreviewMode(undefined)).toBeNull();
  expect(resolveCanadaPreviewMode('fixture')).toBe('fixture');
  expect(resolveCanadaPreviewMode('retained')).toBe('retained');
  for (const value of ['', 'Fixture', ' retained', 'census'])
    expect(() => resolveCanadaPreviewMode(value)).toThrow();
});
```
- [ ] Write fixture tests: explicit fixture mode works without a retained assessment, says synthetic, supplies both 24-month directions/ten selected categories, and rejects a fixture claiming retained provenance. Store the hand-derived projected values from Task 1 in the small fixture; verify its numeric expectations, not a generated real-data copy.
- [ ] Write retained-loader tests for exact authentication and no fallback, including missing/length/hash/oversize failures and a real reparse ancestor. Test a crossed parsed contract separately through Task 1. For synthetic filesystem success tests, mock the fixed contract module internally with the synthetic body's identity, following the existing snapshot-test pattern; expose no runtime pin/input override. Verify a file changed during the bounded read is rejected by the reused reader. No API/fetch/archive calls are permitted.
- [ ] Run `npm.cmd test -- tests/country-preview/load.test.ts --maxWorkers=2`; confirm RED.
- [ ] Implement the mode/fixture validation and retained loader. Errors are fixed diagnostics without arbitrary source content or credential/environment dumps. Return null before any file operation when mode is unset; never catch a retained error and switch to fixture.
- [ ] Run all Task 1/2 tests to GREEN and `npm.cmd run check`; commit the gated-loader deliverable.

## Task 3: Country CSVs from the presentation model

**Files:** Create `src/lib/country-preview/downloads.ts`, `tests/country-preview/downloads.test.ts`.

**Interfaces:** `serializeCountryMonthlyCsv(preview:CountryPreview,direction:CountryDirection):string`, `serializeCountryProductsCsv(preview:CountryPreview,direction:CountryDirection):string`, `countryCsvFilename(direction:CountryDirection,kind:'monthly'|'products'):string`. Consume Task 1 model fields only; no server imports or filesystem reads. Reuse `downloadBlob` in the UI later, not product serializers with fabricated fields.

CSV source labels are `Synthetic development data` for fixtures and `U.S. Census Bureau monthly merchandise files` for retained data. The verification field remains `synthetic` or `previous-reviewed-replay` according to the model; neither becomes fresh source verification.

- [ ] Write monthly CSV tests for exactly 24 displayed rows in month order, selected direction/measure, correct amounts and unavailable blanks. Columns identify `country_code,country_name,direction,month,value_usd,value_status,measure,units,adjustment,period_start,period_end,source,capture_started_at,capture_finished_at,processing_version,raw_verification,original_source_url,original_source_captured_at,original_source_bytes,original_source_sha256`. Retained source metadata must agree with the matching monthly point; fixture metadata is explicitly synthetic, never a fabricated original.
- [ ] Write product CSV tests for the displayed ten rows/order and period labels, exact current/prior numerators/denominators, dollar change, growth, both shares and percentage-point change. Include classification status/covered interval, `special_by_policy`, `comparison_eligible`, reason, measure/units/adjustment, source/capture/processing/verification basis. Include ordered current/prior original-source records as JSON CSV cells with month, URL, capture, bytes/hash; derive them from the same direction's monthly points. Statistical totals remain numeric while comparisons are blank and qualified by status.
- [ ] Assert opposite directions differ in both measures/values/source records; fixture output says synthetic development data; formula-looking descriptions such as `=SUM(1,1)` are text-protected and properly quoted; quotes/newlines round-trip; numeric dollars and negative changes remain numeric. Filenames are `canada-1220-<direction>-2024-09-2026-08-preview-monthly.csv` and `...-products.csv`.

```ts
it('exports direction-specific monthly amounts with synthetic provenance', () => {
  const csv = serializeCountryMonthlyCsv(makeCountryPreviewFixture(), 'exports');
  expect(csv).toContain('1220,Canada,exports,2026-08,200000,reported,ALL_VAL_MO');
  expect(csv).toContain('Synthetic development data');
  expect(csv).not.toContain('GEN_VAL_MO');
  expect(countryCsvFilename('exports', 'monthly'))
    .toBe('canada-1220-exports-2024-09-2026-08-preview-monthly.csv');
});
```
- [ ] Run `npm.cmd test -- tests/country-preview/downloads.test.ts --maxWorkers=2`; confirm RED.
- [ ] Implement the serializers with existing quoting/formula-protection conventions, preserving null/zero and percent/percentage-point meanings. Keep downloaded source JSON limited to projected metadata, never source bodies or local paths.
- [ ] Run Tasks 1–3 tests to GREEN and `npm.cmd run check`; commit the CSV deliverable.

## Task 4: Opt-in Astro route and accessible country page

**Files:** Create `src/components/CanadaPreview.tsx`, `src/components/CountryPreviewChart.tsx`, `src/pages/preview/countries/[code].astro`, `tests/country-preview/page.test.tsx`; modify `src/layouts/BaseLayout.astro` and scoped portions of `src/styles/global.css`.

**Interfaces:** `CanadaPreview({data}:{data:CountryPreview}):React.JSX.Element` owns Imports-default state; `CountryPreviewChart({view,source}:{view:CountryDirectionView;source:'fixture'|'retained'}):React.JSX.Element` renders the country SVG/table. Both are named exports. The route's `getStaticPaths()` calls `loadCanadaPreview()` and returns either `[]` or exactly `[{params:{code:'1220'},props:{preview}}]`. `BaseLayout` gains optional `robots?:string`, default undefined; the route supplies `noindex,nofollow` without changing ordinary navigation.

- [ ] Write component tests using the per-file `@vitest-environment jsdom` pattern and Testing Library. Cover Imports default, Exports switching, overview/chart/table/source/download agreement, all 24 history rows and fixed ten candidates. Pin the hand-derived summary and ordinary values from Task 1; statistical rows remain listed with unavailable comparisons. Mock browser blob downloads to assert the two buttons invoke Task 3's serializer for the chosen direction. Clone fixtures for null/zero-prior/incompatible/incomplete display cases and assert no `$0` substitutes for unavailable values.
- [ ] Test radio labels/selected state, chart text alternative, monthly table caption/headers, both annual period labels, source capture interval, explicit synthetic versus retained labels, and separate reference outcomes/difference table. Ensure no fabricated product links or five-year selector. Use exact source copy from the spec: “These figures come from a captured set of monthly Census files. Currently revised country totals can differ. Product shares here use totals from the same files as the product values.”

```tsx
it('switches the country monthly table and measure with trade direction', async () => {
  render(<CanadaPreview data={makeCountryPreviewFixture()}/>);
  expect(screen.getByRole('radio', {name:'Imports'})).toBeChecked();
  await userEvent.click(screen.getByRole('radio', {name:'Exports'}));
  expect(screen.getByRole('radio', {name:'Exports'})).toBeChecked();
  const table = screen.getByRole('table', {
    name:'Monthly U.S. exports to Canada · nominal USD',
  });
  expect(within(table).getAllByRole('row')).toHaveLength(25);
  expect(screen.getByText(/ALL_VAL_MO/)).toBeVisible();
});
```

Use the monthly-table caption `Monthly U.S. imports from Canada · nominal USD` or its export equivalent; the chart's accessible name is the corresponding `Monthly U.S. ...` phrase without the units suffix. All measure metadata includes the adjustment/valuation basis in adjacent explanatory text.
- [ ] Run `npm.cmd test -- tests/country-preview/page.test.tsx --maxWorkers=2`; confirm RED.
- [ ] Implement route and page. Keep default Imports SSR-readable, with a noscript explanation that switching/downloads need JavaScript. Render country-specific measure/source labels, same-archive share definition, selected-subset qualification, statistical status and unchanged seven export differences. Derive no new product ranking; do not reuse `TradeChart`'s product/world/HS/API contract. Use generic USD/month formatting and `downloadBlob` only where compatible.
- [ ] Add scoped mobile/table styles and optional robots metadata. Tables may scroll inside labeled keyboard-accessible containers; the page must not overflow. Keep original product HTML/navigation behavior unchanged apart from absent optional metadata.
- [ ] Run all country-preview tests to GREEN and `npm.cmd run check`; commit the page deliverable.

## Task 5: Normal-build boundary and isolated fixture browser checks

**Files:** Create `tests/e2e/canada-preview-boundary.spec.ts`, `tests/e2e-preview/canada-preview.spec.ts`, `playwright.canada-preview.config.ts`, `scripts/serve-canada-preview-fixture.ts`, `tests/scripts/canada-preview-fixture-server.test.ts`; modify `package.json` and README usage only. Do not modify `.github/workflows/` or the existing `playwright.config.ts`.

**Interfaces:** `resolveCanadaPreviewPort(value:string|undefined):number` defaults to 4402, accepts integer port strings 1024–65535, rejects other inputs. `serveCanadaPreviewFixture():Promise<void>` forces `TRADE_DATA_MODE=fixture` and `CANADA_PREVIEW_MODE=fixture`, creates an owned temporary output under workspace `.tmp/`, uses installed Astro `build` and `preview` APIs with the same explicit `root`/`outDir`, and serves only `127.0.0.1:<port>`. Use `PLAYWRIGHT_CANADA_PORT`; `reuseExistingServer:false` prevents attaching to the wrong data mode. Confirm the actual listening port equals the requested port and reject any fallback. Stop its own server on termination; delete only its verified owned temporary directory, never normal `dist/` or arbitrary computed paths.

- [ ] Add normal-suite RED check: `/preview/countries/1220/` returns 404 after an unset-mode build; no navigation link enables it. Inspect the normal build's generated HTML/client assets for preview payload/assessment-processing markers and route absence, allowing shared client code assets without observations.

```ts
test('normal static build omits the Canada preview route', async ({page}) => {
  const response = await page.goto('/preview/countries/1220/');
  expect(response?.status()).toBe(404);
});
```
- [ ] Add fixture-suite RED checks: default Imports/overview/tables and noindex; Exports update; two downloaded CSVs independently parsed and matched to displayed periods/values/metadata; statistical rows/unchanged reference differences; keyboard radio/download controls; 375px mobile viewport without page overflow and usable table scrolling; no-JavaScript Imports research/source explanation. Assert zero Census/USITC/provider requests. Save desktop/mobile screenshots for visual inspection.
- [ ] Test helper port rejection and owned-output/server lifecycle, including failure before server start. Validate output containment before cleanup; no shell deletion or detached background server. Inspect installed Astro API types during implementation rather than assuming an old CLI entry path. The installed version exposes `build`/`preview`; its CLI bin is `bin/astro.mjs`, not `astro.js`.
- [ ] Implement helper/config and connect the existing CI command: keep `test:e2e` as the normal `playwright test` followed, on success, by `playwright test --config playwright.canada-preview.config.ts`. Add `test:e2e:canada` for the separate config. The separate suite lives outside `tests/e2e`; the normal build/dist remains untouched by the owned fixture build. Fixtures use no ignored real dataset or credential, and both suites report failures to the existing test-results artifact path.
- [ ] Document PowerShell local opt-in commands for fixture/retained modes and removal of the preview setting for ordinary builds. Keep product `TRADE_DATA_MODE` separate. State the 24-month limit, fixed retained input, no fallback and no publication approval.
- [ ] With preview unset and `TRADE_DATA_MODE=fixture`, run `npm.cmd run build` and `npm.cmd run test:e2e`; expected normal suite and the isolated fixture suite both pass. Run `npm.cmd test -- --maxWorkers=2` and `npm.cmd run check` for final implementation verification. Inspect screenshots and normal/fixture build reports. If the Windows sandbox isolates Vitest temp modules or prevents junction checks, use the already authorized host-execution approach and record that environment limitation without changing production behavior to make tests pass.
- [ ] Commit the browser/build/usage deliverable after the checks pass.

## Task 6: Retained preview verification, independent review and integration

**Files:** Create `docs/validation/canada-profile-prototype.md`; preserve prior source/evidence documents byte for byte. Save local execution/review receipts under ignored `.superpowers/sdd/2026-10-12-canada-profile-prototype/`.

- [ ] Record baseline hashes of the four coffee files, all 23 existing country evidence fields, previous snapshot outputs and classification ledger before real-preview verification. Confirm no assessor/source/workflow/R2 changes. Commit implementation before the retained build so evidence names its actual version.
- [ ] Perform one opted-in local retained build using the exact pinned assessment, with `CANADA_PREVIEW_MODE=retained` and existing accepted product data. Record build file count/total/largest asset and projected payload size; verify the country route exists, no source bodies/bindings/paths leak, and nothing accepts or promotes a release. The source's processing version remains `9c385fb...`; record preview implementation version separately.
- [ ] Open the retained page locally and check both directions, periods, sources, all-goods chart and two CSVs; inspect mobile/keyboard behavior. Compare all 48 monthly points, 20 product summaries/order, 17 eligible comparisons, three statistical exclusions and reference results to the pinned assessment. Check new all-goods period sums/growth and displayed/CSV projection independently, without calling `buildCountryTotalSummary` to derive expectations, repeating classification review, fetching providers or decompressing ZIPs.
- [ ] Restore the prior environment settings and perform a final unset-preview build. Verify absence of preview HTML/payload and unchanged accepted files/source/evidence. Record normal and opted-in measurements in the acceptance document, with the prototype's scope and unresolved public/longer-history work.
- [ ] Complete one fresh immutable whole-branch review on the most capable available reviewer model, including the actual retained preview/projection evidence. Root implements; the reviewer recalculates only new summary/projection outputs and checks integration/boundaries, reusing previous source/classification attestations. Address substantive findings in one fix pass with meaningful RED/GREEN regressions and required checks. Do not obtain a second full review after routine fixes.
- [ ] Create/attach the PR, verify final CI covers the reviewed implementation tree plus normal and fixture browser suites, merge with expected-head protection under standing permission, and synchronize local main. Confirm the merged tree equals the tested tree; no duplicate full test run is needed after a pure fast-forward with identical-tree proof. Preserve required source/reference/receipt files and the authorized checkout. Public Canada availability remains unchanged.

## Self-Review and Execution Handoff

Spec coverage maps the fixed statistical/input contract to Tasks 1–2, CSVs to Task 3, route/UI/SSR/accessibility to Task 4, normal/opt-in isolation and browser/build measurements to Task 5, and real retained evidence/preservation/review/integration to Task 6. Each Review Focus item has an explicit owning test. Browser types carry no server/path/raw-body fields; later tasks consume the interfaces declared above. The helper/config belongs to the browser deliverable, rather than a separate infrastructure milestone.

The owner has already selected native execution: root implements with subagents reviewing. Ask the owner to review this plan and confirm it captures the approved design; do not ask for the execution method again. Only after that review use `superpowers:executing-plans`. No implementation, accepted country release, deployment or R2 operation is authorized by plan preparation alone.
