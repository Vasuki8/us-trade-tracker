# First Product Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a locally reviewable roasted coffee profile (HS 090121) using real Census observations, with import/export trends, comparison of up to three countries, and sourced PNG and CSV downloads.

**Architecture:** A Node processing command retrieves and validates one product, then creates an immutable local release and promotes a small current-release pointer. Astro renders public pages from that release; one React island controls the direction, period, country comparison, and downloads. Normal visits and builds use prepared data without calling Census.

**Tech Stack:** Astro, TypeScript, React, native SVG/canvas, npm, Node 24, Vitest, React Testing Library, Playwright, GitHub Actions for code checks.

**Spec:** [US Trade Tracker Launch Brief](../specs/2026-10-08-us-trade-tracker-design.md). This plan implements its final paragraph's first development milestone, not the entire first public release.

## Global Constraints

- "The agreed development direction is Astro with TypeScript and React for interactive charts, starting with Cloudflare free hosting."
- "Start with HS six digit product categories and national country comparisons."
- "A default chart shows five years when comparable history exists."
- "Use general import customs value and total export value as the default merchandise measures, with definitions visible."
- "Use year over year changes and rolling twelve month totals as the main comparisons."
- "Show absolute dollar changes alongside percentages; show a percentage as unavailable when its prior value is zero or missing."
- "Country share means that country's share of U.S. imports or exports for the selected product."
- "Preserve missing and suppressed values instead of converting them to zero."
- "If refresh fails, retain the last successful release and display its date."
- "Each data release should record its reporting period, retrieval date, and processing code version so published results can be checked and reproduced."
- "All first release features are public and free; accounts, billing, and personalized email delivery belong to later stages."
- "Paid services and publication require a separate deployment decision."

## Review Focus

1. Aggregate and country-group rows must never inflate national totals or appear as selectable countries; exercise this in Task 1.
2. A missing month, a zero prior value, and incompatible classification intervals must not produce misleading growth; exercise these in Task 2.
3. A partial response, authentication error, or failed refresh must preserve the current validated release; exercise these in Task 3.
4. Switching imports to exports must update values, labels, country choices, and both downloads together; exercise this in Task 4.
5. A small screen, keyboard navigation, or failed PNG conversion must leave the research task usable; exercise these in Task 5.

---

## Scope and decisions

The owner selected roasted coffee as the development sample on October 8, 2026. Use `090121` as a string so its leading zero survives. Display the official description from each direction's response; validate that the result represents roasted, non-decaffeinated coffee before using the friendly title. This sample does not select the commercial pilot sector.

Deliver `/`, `/products/090121/`, and `/methods/`. The home page explains the research purpose and links to the working profile. The profile defaults to imports and the latest available reporting month, shows monthly history, latest-month year-over-year change, trailing twelve-month totals and changes, and leading partners by trailing twelve-month value. Visitors can choose imports or exports, view the latest 12 or 60 months, and compare one to three countries from the available partner list. The same window and direction apply to every compared series. Downloads reproduce the currently displayed series and include their provenance.

Use a restrained research layout: clear product heading, release information, summary statistics, trend chart, comparison controls, partner table, and definitions. Use system fonts, light background, dark readable text, distinct series colors with text legends, and visible keyboard focus. Keep the table usable when JavaScript is unavailable. Build a readable local preview; visual polish can be refined with the working data in view.

Retrieve 60 months where coverage and classification compatibility permit. Verify the sample code's continuity against official classification references and record the evidence in the release. Unverified or changed intervals create a labeled chart break and unavailable comparisons across the break. Descriptions alone do not prove classification continuity. A shorter verified history is labeled explicitly.

Broader product search, country profile routes, changes rankings, monthly editorial briefings, R2 storage integration, scheduled data processing, advertising, accounts, and billing are later milestones. The importer refreshes its complete retained history to capture revisions; a simulated refresh test proves replacement behavior. Two successive official monthly releases remain a public-launch requirement and cannot be claimed from a simulation.

## Verified references and execution prerequisites

- [Census international trade documentation](https://www.census.gov/data/developers/data-sets/international-trade.html): monthly data and API-key requirement. The key belongs in ignored local `.env` as `CENSUS_API_KEY`, never in browser code or recorded request URLs.
- [Import variables](https://api.census.gov/data/timeseries/intltrade/imports/hs/variables.html): `I_COMMODITY`, `I_COMMODITY_LDESC`, `GEN_VAL_MO`, `CTY_CODE`, `CTY_NAME`, `COMM_LVL`, `LAST_UPDATE`.
- [Export variables](https://api.census.gov/data/timeseries/intltrade/exports/hs/variables.html): `E_COMMODITY`, `E_COMMODITY_LDESC`, `ALL_VAL_MO` and the corresponding common fields.
- [Census query guide, especially pages 7, 15, 25 and 26](https://www.census.gov/foreign-trade/reference/guides/Guide%20to%20International%20Trade%20Datasets.pdf): `-` denotes totals, `DET` distinguishes detail from `CGP` groupings, and `SUMMARY_LVL2=HS` / `HSCY` separate product totals from national product-by-country observations. Verify these query shapes against a real keyed response before accepting the first release.
- [Astro setup](https://docs.astro.build/en/install-and-setup/) and [React integration](https://docs.astro.build/en/guides/integrations-guide/react/): use a strict TypeScript configuration and the official React integration. Node 24.20.0 and npm 11.19.0 were available during planning. Resolve compatible stable dependencies when executing and commit the lockfile.
- [Astro Cloudflare guide](https://docs.astro.build/en/guides/deploy/cloudflare/): static output can later be served by Cloudflare. This milestone needs no server adapter or deployment command.

Execution starts on an isolated `codex/first-product-profile` branch/worktree using the repository workflow. Keep the existing brief and repository settings. No paid service, publication, or account configuration is part of this plan.

## File map and shared contracts

| Files | Responsibility |
| --- | --- |
| `package.json`, `package-lock.json`, `.nvmrc`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts` | Local scripts, compatible dependencies, static Astro, React, strict types, test harness |
| `src/lib/trade/types.ts`, `normalize.ts`, `metrics.ts`, `profile.ts` | Observation/release types, Census parsing, calculations, display model |
| `scripts/census-client.ts`, `prepare-release.ts`, `import-product.ts` | Private keyed retrieval, validated immutable release storage, CLI |
| `src/lib/trade/load-release.ts` | Build-time release selection and explicit fixture mode |
| `src/layouts/BaseLayout.astro`, `src/styles/global.css` | Shared document, navigation, responsive styles, attribution |
| `src/pages/index.astro`, `products/[code].astro`, `methods.astro` | Static pilot pages and methods |
| `src/components/ProductExplorer.tsx`, `TradeChart.tsx`, `TradeTable.tsx` | Controls, SVG chart, accessible matching table |
| `src/lib/trade/downloads.ts` | CSV serialization and PNG conversion of the sourced SVG |
| `tests/fixtures/census-imports.json`, `census-exports.json`, `product-release.json`, `README.md` | Small clearly documented test samples, including adversarial cases |
| `tests/trade/normalize.test.ts`, `metrics.test.ts`, `profile.test.ts`, `tests/scripts/import-product.test.ts`, `prepare-release.test.ts` | Data and refresh correctness |
| `tests/ui/ProductExplorer.test.tsx`, `tests/e2e/product-profile.spec.ts`, `tests/setup.ts`, `playwright.config.ts` | Interactive and browser behavior |
| `.env.example`, `.github/workflows/checks.yml`, `README.md`, `docs/data-validation/090121.md` | Credential names, offline code checks, run instructions, actual value verification |

Contracts in `src/lib/trade/types.ts`:

```ts
type Direction = 'imports' | 'exports';
type Month = string; // Runtime-validated YYYY-MM.
type Measure = 'GEN_VAL_MO' | 'ALL_VAL_MO';
type ValueStatus = 'reported' | 'missing' | 'suppressed';
type Observation = {
  productCode: string; description: string; direction: Direction;
  month: Month; partnerCode: string; partnerName: string;
  geography: 'world' | 'country'; measure: Measure;
  valueUsd: number | null; status: ValueStatus;
};
type Comparison = { current: number | null; previous: number | null;
  changeUsd: number | null; changePercent: number | null };
type Release = {
  schemaVersion: 1; productCode: string; reportingMonth: Month;
  retrievedAt: string; codeVersion: string;
  source: 'census' | 'fixture'; sourceUrls: string[];
  observations: Observation[]; revisedKeys: string[];
  classificationIntervals: { from: Month; to: Month; evidenceUrl: string }[];
};
type ExplorerSelection = {
  direction: Direction; months: 12 | 60; countryCodes: string[];
};
type ChartSeries = { code: string; name: string;
  points: { month: Month; valueUsd: number | null; breakBefore: boolean }[] };
type ProfileView = {
  title: string; selection: ExplorerSelection; reportingMonth: Month;
  latestMonth: Comparison; trailingYear: Comparison;
  partners: { code: string; name: string; valueUsd: number | null;
    sharePercent: number | null }[];
  series: ChartSeries[]; provenance: {
    source: Release['source']; measure: Measure; retrievedAt: string;
    codeVersion: string; sourceUrls: string[]; revised: boolean;
  };
};
```

All reported dollar values must be finite, nonnegative safe integers. Validate additions as well as parsing. Missing and recognized suppression tokens remain null with distinct statuses; unrecognized tokens fail validation. Use the source's world total rather than summing country rows. Compute share only from complete matching country and world windows; reject country values above the matching world total. Preserve raw responses locally for investigation.

## Task 1: Normalized, validated Census observations

**Files:** Create the project/test configuration, `types.ts`, `normalize.ts`, both Census fixtures and fixture notes, and `tests/trade/normalize.test.ts`.

**Interfaces:** Produce `normalizeCensusResponse(payload: unknown, direction: Direction): Observation[]`. Return only HS6 national world/country records; reject duplicate observation keys and wrong dimensions. The identity key is direction/product/month/geography/partner/measure. World partner code is `-`.

- [ ] **Step 1:** Set up only the dependency and test harness required to execute the normalization tests. Define `test` as `vitest run`, `check` as `astro check` plus a dedicated TypeScript check for scripts/tests, `build` as `astro build`, and `dev`/`preview` as the corresponding Astro commands. Use Node 24 in `.nvmrc`; no generated starter content.
- [ ] **Step 2:** Write failing parser tests with these assertions:

```ts
expect(importRows[0].productCode).toBe('090121');
expect(importRows.find(r => r.geography === 'world')?.valueUsd).toBe(1000);
expect(importRows.filter(r => r.geography === 'country')).toHaveLength(2);
expect(exportRows[0].measure).toBe('ALL_VAL_MO');
expect(missingRow.valueUsd).toBeNull();
expect(zeroRow.valueUsd).toBe(0);
```

Fixtures include reordered headers/rows, world 1000, countries 600 and 400, an excluded CGP row, and a district detail row. Test rejection of repeated keys, malformed months, HS10 rows in an HS6 response, unsafe numbers, unknown numeric markers, and a response using the other direction's measure. Header names determine columns, not column positions. Document synthetic rows as synthetic; real snippets record their source and retrieval date.
- [ ] **Step 3:** Run `npm test -- tests/trade/normalize.test.ts`; confirm failure comes from the missing parser or its assertions, not harness failure.
- [ ] **Step 4:** Implement `normalizeCensusResponse` and runtime shape checks, retaining actual zero and status information. Exclude non-national and grouping records; fail if filtering leaves no required world observations.
- [ ] **Step 5:** Repeat the targeted command and run `npm run check`; require passing tests and zero type errors. Commit as `feat: validate national HS6 Census observations`.

## Task 2: Trustworthy metrics and comparison models

**Files:** Create `metrics.ts`, `profile.ts`, `metrics.test.ts`, `profile.test.ts`, and the small fixture release.

**Interfaces:** Consume Task 1 types. Produce `compareValues(current: number | null, previous: number | null): Comparison`, `sumWindow(observations: Observation[], end: Month, months: 12): number | null`, and `buildProfileView(release: Release, selection: ExplorerSelection): ProfileView`.

- [ ] **Step 1:** Write failing tests for exact arithmetic and calendar windows:

```ts
expect(compareValues(120, 100)).toEqual({current: 120, previous: 100,
  changeUsd: 20, changePercent: 20});
expect(compareValues(120, 0).changePercent).toBeNull();
expect(compareValues(null, 100).changeUsd).toBeNull();
expect(completeTrailingTotal).toBe(1200); // Twelve distinct months of 100.
expect(partnerSharePercent).toBe(25); // Matching country 300 / world 1200.
expect(missingMonthTrailingTotal).toBeNull();
```

Build synthetic 24-month inputs in tests: current trailing year 1200, previous 600, expected change 600 and 100%. The latest-month comparison uses the same month one year earlier. Test December/January boundaries, unsorted input, duplicate months, missing/suppressed months, overflow, and zero world totals. Profile tests reject four country codes, deduplicate repeated selections, prohibit world/grouping selections, show breaks at incompatible classification intervals, and avoid computing cross-interval growth. Rank complete partner windows descending and incomplete ones after them, labeled unavailable.
- [ ] **Step 2:** Run `npm test -- tests/trade/metrics.test.ts tests/trade/profile.test.ts`; confirm the expected failures.
- [ ] **Step 3:** Implement the three interfaces. `sumWindow` handles one already selected observation series and requires every calendar month. The profile builds both national metrics and matching comparison series, defaults an empty country selection to world, and marks unverified classification spans as unavailable for comparisons.
- [ ] **Step 4:** Repeat targeted tests and `npm run check`; require success. Commit as `feat: calculate trade trends and country comparisons`.

## Task 3: Real-data import with recoverable releases

**Files:** Create the three scripts, `load-release.ts`, `.env.example`, importer/release tests, and `docs/data-validation/090121.md`. Extend `package.json` with `data:import` and `data:validate`.

**Interfaces:** Produce `fetchProductMonth(options: {productCode: string; month: Month; direction: Direction; apiKey: string}, fetchImpl?: typeof fetch): Promise<Observation[]>`; `prepareRelease(options: {productCode: string; end: Month; months: number; apiKey: string; outputDir: string; codeVersion: string}, fetchImpl?: typeof fetch): Promise<Release>`; and `loadRelease(): Promise<Release>` for Astro build-time use. The CLI requires `--product 090121 --end YYYY-MM`; do not infer the reporting month from today's date.

- [ ] **Step 1:** Write failing mocked HTTP and temporary-directory tests. Cover import/export parameter names, `HS` and `HSCY` requests, all months present, HTTP 204 as absent data rather than zero, wrong content type, 401/403, 429, 5xx, malformed JSON, missing world month, and key redaction. Use a 30-second request timeout; retry 429/5xx at most twice after the initial attempt. Process requests with maximum concurrency two.

```ts
expect(await readCurrentReleaseAfterFailedRefresh()).toEqual(previousRelease);
expect(await readCurrentReleaseAfterSuccessfulRefresh()).toEqual(nextRelease);
expect(capturedLogs.join(' ')).not.toContain('test-secret-key');
expect(nextRelease.revisedKeys).toContain(changedObservationKey);
```

- [ ] **Step 2:** Run `npm test -- tests/scripts/import-product.test.ts tests/scripts/prepare-release.test.ts`; confirm failures.
- [ ] **Step 3:** Implement retrieval and release preparation. Request exact HS6 code, month, measure, descriptions, country identifiers, summary levels and last-update metadata. Store responses plus sanitized request metadata under ignored `data/raw/`. Validate a complete national window for both directions, distinct countries, comparable intervals, sums and shares. Store each release in its own directory under ignored `data/processed/`; replace the current pointer by an atomic same-directory operation only after all files pass validation. A failed run exits nonzero and preserves the pointer. Re-fetch the full retained window, compare with the previous release, and record changed observation keys. `loadRelease` permits test fixture mode only through explicit `TRADE_DATA_MODE=fixture`; normal mode fails clearly when no valid release exists.
- [ ] **Step 4:** Repeat targeted tests and `npm run check`. Add CLI instructions to fixture notes, including the visible fixture banner requirement. Commit as `feat: prepare validated Census releases without losing current data`.
- [ ] **Step 5:** With the existing owner key supplied locally through ignored `.env`, choose a reporting month confirmed by the official release information and run `npm run data:import -- --product 090121 --end YYYY-MM --months 60`. Verify classification continuity against official code references; record evidence URLs and intervals. If a verified span is shorter, retain and label only that span. Never substitute invented observations for a failed keyed import.
- [ ] **Step 6:** Record an actual live comparison in `docs/data-validation/090121.md`: at least five raw Census values covering both directions, world and country observations, two manually calculated trailing totals and a country share, the sanitized queries, reporting month, retrieval time, and code revision. Commit only small public snippets if needed; no large dataset or key. Without this successful live check, report the milestone's real-data requirement as incomplete.

## Task 4: Working product profile and sourced downloads

**Files:** Create the layout/styles, three page routes, three React components, `downloads.ts`, `ProductExplorer.test.tsx`, and `tests/setup.ts`.

**Interfaces:** Consume `loadRelease` and `buildProfileView`. Produce `ProductExplorer({release}: {release: Release})`, `TradeChart({view}: {view: ProfileView})`, `TradeTable({view}: {view: ProfileView})`, `serializeCsv(view: ProfileView): string`, and `exportChartPng(svg: SVGSVGElement): Promise<Blob>`.

- [ ] **Step 1:** Write failing interactive tests: switch to exports and assert `ALL_VAL_MO` provenance, export title and matching values; select three countries and disable adding a fourth; select a 12-month window and assert the corresponding dates; make a value missing and assert a chart gap plus unavailable table cell. Verify CSV values match the active view and escape embedded quotes, commas and newlines in descriptions. Fixture mode must show `Development sample data` prominently.

```ts
expect(csv).toContain('ALL_VAL_MO');
expect(csv).toContain(view.provenance.retrievedAt);
expect(screen.getByRole('table')).toBeVisible();
expect(screen.getByText('Development sample data')).toBeVisible();
```

- [ ] **Step 2:** Run `npm test -- tests/ui/ProductExplorer.test.tsx`; confirm the intended failures.
- [ ] **Step 3:** Implement the static pages and hydrated React explorer. Put the official description, classification code, reporting period, dollar basis, source and retrieval date next to the research content. Include source, direction, measure, period, USD units, retrieval date and revision information inside the exported SVG/PNG and CSV rows. Use monthly SVG lines with explicit gaps, matching table data, text legends, and a stable color per country. Export a white-background PNG through native canvas, with an actionable error if conversion fails; CSV remains available. Revoke temporary object URLs after download. Keep navigation and the initially rendered table available without JavaScript.
- [ ] **Step 4:** Add methods explaining goods/current dollars, no seasonal adjustment, import/export measures, share, missing values, classification breaks, revisions, and the latest retained release. Display the exact Census notice from the brief. Avoid supplier discovery, profitability and destination-demand claims.
- [ ] **Step 5:** Repeat targeted tests, `npm run check`, and `npm run build` using explicit fixture mode for offline checks. Require passing tests, zero type errors and generated routes. Commit as `feat: add coffee profile with comparisons and sourced downloads`.

## Task 5: Browser acceptance and reproducible code checks

**Files:** Create `playwright.config.ts`, `tests/e2e/product-profile.spec.ts`, `.github/workflows/checks.yml`; update `README.md` and `.gitignore` for browser artifacts.

**Interfaces:** Produce `npm run test:e2e`, offline GitHub code checks, and a documented local real-data preview. No deployment job or live API key is needed by CI.

- [ ] **Step 1:** Write browser tests on an explicit fixture build: default imports, exports switch, comparison limit, missing-data display, PNG signature and nonempty image, CSV contents matching current filters, definitions and source labels, and a simulated failed PNG conversion that leaves CSV usable. Run a 375-pixel mobile viewport and keyboard-only controls; assert no page-level horizontal overflow. Also load the page with JavaScript disabled and verify the initial research table and methods link.
- [ ] **Step 2:** Run `npm run test:e2e`; confirm any acceptance failure before fixing it. Inspect a desktop and mobile screenshot, and inspect an actual downloaded PNG at readable size. Retain screenshots under ignored test artifacts.
- [ ] **Step 3:** Fix only issues demonstrated by acceptance tests or visual inspection. Use a local preview of the real release for final user review. Confirm no API key appears in generated assets and no browser requests go to the Census API.
- [ ] **Step 4:** Add code CI for push/PR: Node 24, `npm ci`, unit/component tests, type checks, explicit fixture build, and Chromium acceptance tests. Set workflow permissions to `contents: read`. CI makes no external data import and cannot publish. Document environment setup, fixture versus real modes, commands, manual refresh, storage locations, provenance checks, and the later release/deployment milestones.
- [ ] **Step 5:** From a clean dependency installation run `npm ci`, `npm test`, `npm run check`, fixture `npm run build`, and `npm run test:e2e`. Then build and preview the actual validated local release. Require exit code zero, successful real-value verification from Task 3, readable downloaded charts, and no unexplained acceptance gaps. Commit as `ci: verify the first product research workflow`.

## Completion and handoff

The local milestone is complete only when a genuine Census release drives the working profile, comparison and exports, the relevant checks pass, and the recorded live values match. Report remaining external prerequisites precisely if credentials or a live response are unavailable. Fixture-only success does not complete the real-data milestone. Share the preview and focused change summary for review. Publishing, broader coverage, storage services and the second official release remain separate work.

**Execution recommendation:** Native execution in this chat is appropriate for five sequential tasks that share the same small data contract. A fresh whole-branch reviewer should check the finished change. Subagent-driven execution is also available if the owner prefers review after every task; select the method after reviewing this plan.
