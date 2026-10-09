# Estimated Duties Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The main agent implements; independent subagents review completed changes, as previously selected by the owner.

**Goal:** Add verified monthly and rolling estimated-duty comparisons to the coffee profile, with recoverable source data and compatible existing archives.

**Architecture:** Keep merchandise observations unchanged and attach a separate duty dataset to a version 2 release. Fetch product and country totals plus their rate-provision breakdowns, retaining exact source records and publishing only the checked totals and coverage indicators. A version 2 archive carries the additional records, while the existing version 1 archive reader remains supported.

**Tech Stack:** Node 24, TypeScript, Astro, React, Vitest, Playwright, manual GitHub Actions and the existing private R2 archive.

**Spec:** [Approved launch scope](../specs/2026-10-08-us-trade-tracker-design.md), especially Estimated duties, Data foundation and reliability, and Launch resources and hosting direction.

## Global Constraints

- Use **Estimated duties** as the feature label and **Calculated duties as share of import value** for the derived percentage, identifying the denominator as imports for consumption.
- Monthly duty share is `100 × CAL_DUT_MO / CON_VAL_MO`.
- A rolling duty share is `100 × sum(CAL_DUT_MO) / sum(CON_VAL_MO)` over the same complete period, product and geography.
- Incomplete or classification-incompatible periods make their comparisons unavailable.
- A zero or missing consumption denominator makes the duty share unavailable.
- Monthly year-over-year comparisons use the matching month one year earlier. Duty growth is unavailable when its prior value is zero or missing.
- Reporting coverage shows RP70/79 affected dutiable dollars and their share of total dutiable value; a zero or unavailable dutiable denominator leaves that coverage share unavailable.
- Preserve immutable existing archives and provide recovery for both the existing trade-value format and the extended duty format.
- The initial audit is coffee HS 090121, September 2024–August 2026. Keep the existing 60-month merchandise history; add 24 months of duty history initially.
- Census credentials stay in GitHub secrets and processing environments. No credentials enter query records, error messages, artifacts, downloads or browser code.
- Retain at most two concurrent Census requests, 30-second request timeouts and at most two retries for 429/5xx responses.
- A failed validation, backup or recovery check must preserve the last accepted release.
- Keep manual workflows, existing private R2 access and static hosting. No deployment, public bucket, billing, additional permissions or recurring schedule is part of this plan.

## Review Focus

1. RP70/79 records with reported zero duties and positive dutiable value must remain qualified, rather than being described as duty-free; test in Tasks 1 and 4.
2. A missing country-month or rate-provision breakdown must not become a manufactured zero or a usable complete comparison; test in Tasks 1 and 4.
3. Extending a release must neither change existing merchandise calculations nor classify the first duty history as a merchandise revision; test in Task 2.
4. Older archives must still recover their exact original bytes, and source/processed mismatches must fail before promotion; test in Task 3.
5. Export selection, country selection, CSV output and research without JavaScript must present the same scope and qualifications; test in Task 5.

## Proposed Data Contracts

These contracts describe the implementation choice for review. Live responses must establish the query shape and reporting coverage before the extended release is accepted.

```ts
type DutyMoney = {valueUsd: number | null; status: ValueStatus};
type DutyObservation = {
  productCode: string; month: Month;
  geography: 'world' | 'country'; partnerCode: string; partnerName: string;
  calculatedDuty: DutyMoney; consumptionValue: DutyMoney; dutiableValue: DutyMoney;
  coverage: {
    status: 'verified' | 'unavailable';
    uncalculatedDutiableValueUsd: number | null;
  };
};
type DutyDataset = {
  schemaVersion: 1; fromMonth: Month;
  observations: DutyObservation[]; revisedKeys: string[];
};
```

`Release` becomes a discriminated union: the existing version 1 shape, or the same merchandise fields with `schemaVersion: 2` and `duties: DutyDataset`. Do not broaden `Observation.measure` to place duty and consumption values in the merchandise array. Existing profiles and country rankings continue selecting their merchandise measure explicitly.

The private archive pointer and object-key namespace stay unchanged; the bundle manifest version distinguishes the old and extended layouts. Version 1 retains its exact 240-request grid. Version 2 records 60 merchandise months and 24 duty months, with four duty summary levels per month: 336 raw records plus the prepared release, or 337 files. RP breakdowns remain in source records for replay; they do not need to be serialized into the browser's prepared dataset.

## Task 1: Collect and Audit Live Coffee Duty Data

**Files:**
- Create: `scripts/census-duty-client.ts`, `scripts/audit-duties.ts`, `src/lib/trade/duty-normalize.ts`, `src/lib/trade/duty-types.ts`
- Create: `.github/workflows/audit-census-duties.yml`, `tests/scripts/census-duties.test.ts`
- Create: `tests/fixtures/census-duty-hs.json`, `tests/fixtures/census-duty-hscy.json`, `tests/fixtures/census-duty-hsrp.json`, `tests/fixtures/census-duty-hscyrp.json` with visibly synthetic data
- Create: `docs/data-validation/090121-duties.md`
- Modify: `package.json` for `data:audit-duties`

**Interfaces:**
- Produces: `DutyMoney`, `DutyObservation`, `DutyDataset` from `duty-types.ts`.
- Produces: `fetchDutyMonth(options: FetchDutyOptions, fetchImpl?: typeof fetch): Promise<DutyRawPart[]>`.
- `FetchDutyOptions` supplies `productCode`, `month`, `apiKey`, `retrievedAt`, optional `signal` and optional `onRaw(part): Promise<void>`.
- `DutyRawPart` contains `summary: 'HS' | 'HSCY' | 'HSRP' | 'HSCYRP'`, `httpStatus: 200 | 204`, `payload`, credential-free `requestUrl` and `retrievedAt`.
- Produces: `normalizeDutyMonth(parts: DutyRawPart[], context: {productCode: string; month: Month}): DutyObservation[]`.
- Produces: `runDutyAudit(options: {productCode: '090121'; end: Month; months: 24; outputDir: string; apiKey: string}, fetchImpl?: typeof fetch): Promise<DutyAuditReport>`.
- `DutyAuditReport` records the month range, request checksums, available national/country months, reconciliation results and RP70/79 affected values. It does not promote a release.

- [x] Write tests against four real-shaped synthetic tables. Include total rows and component rows, an extra country grouping, reordered headers, unknown markers, missing tables and duplicate dimensions. Test JSON-only responses, secret-free source URLs/errors, timeouts and retry behavior.

  Hand-checked assertions must include:
  ```ts
  expect(world.calculatedDuty.valueUsd).toBe(12);
  expect(world.consumptionValue.valueUsd).toBe(200);
  expect(world.coverage.uncalculatedDutiableValueUsd).toBe(40);
  expect(world.coverage.status).toBe('verified');
  ```
  The input has $12 in calculated duty, $200 in consumption value, and $40 in RP70/79 dutiable value. The $40 stays a reporting qualification even when those duty cells are zero.
- [x] Run `npx vitest run tests/scripts/census-duties.test.ts`; observe failures for the missing behavior.
- [x] Implement the four scoped queries for `CAL_DUT_MO`, `CON_VAL_MO`, `DUT_VAL_MO` and their dimensions. Respect `SUMMARY_LVL=DET`, `COMM_LVL=HS6`; exclude country groupings. Validate the returned dimensions and values before accepting totals. Keep reported zeros distinct from missing cells; reject undocumented markers.
- [x] Reconcile each available total against its disjoint RP breakdown for all three measures. Never add totals to breakdown rows. Infer no RP70/79 contribution only when the breakdown is present and reconciles; an absent country-month stays absent. Missing/unreconciled breakdowns produce unavailable coverage or a failed audit, not a clean zero. Record discrepancies explicitly for investigation.
- [x] Add a manual, coffee-only audit workflow with a required confirmed reporting month, `contents: read`, no R2 credentials, pinned existing Actions versions, and seven-day artifact retention. Pass the Census secret only to retrieval. Retain raw source responses and the audit report without changing the accepted dataset or R2 pointer.
- [x] Run focused tests and `npm run check`, obtain independent review and passing CI, then merge this independently useful audit tool under standing merge authorization.
- [x] Run the workflow through August 2026, download and retain the artifact locally, independently verify all 24 months and record the findings. Confirm actual field population and aggregation before proceeding to Task 2. A failed audit is a reason to investigate and adjust the implementation, not to mark duty coverage verified.

## Task 2: Prepare Version 2 Releases Without Merchandise Regressions

**Files:**
- Modify: `src/lib/trade/types.ts`, `scripts/prepare-release.ts`, `scripts/import-product.ts`, `src/lib/trade/revisions.ts`
- Modify: `src/lib/trade/profile.ts`, `src/lib/trade/changes.ts` for explicit measure selection
- Modify: `tests/scripts/prepare-release.test.ts`, `tests/scripts/import-product.test.ts` (the existing revision assertions live in the preparation suite)
- Create: `tests/scripts/duty-release.test.ts`

**Interfaces:**
- Consumes: the checked query and normalization contracts from Task 1.
- Extends: `PrepareOptions` with optional `includeDuties: boolean`; the default continues producing version 1.
- Extends: `validateRelease` and `readCurrentRelease` to accept both release versions.
- Produces: `findDutyRevisedKeys(previous: DutyDataset | undefined, next: DutyDataset): string[]`, using product/month/geography/partner/measure identity and overlapping history only. Track changed coverage as a distinct `coverage` key as well as the three money measures.

- [x] Write tests proving a version 2 release retains the original merchandise profile/rankings; an old version 1 release still loads; first-added duty coverage does not revise merchandise history; changed or removed overlapping duty values are tracked; malformed/misaligned duty rows fail validation.
- [x] Run the owning test files and observe the failures.
- [x] Add optional `--duties` CLI support. Fetch all duty and merchandise data into one candidate under the existing import lock. Validate the full candidate before atomically moving the local pointer. Keep the default importer behavior unchanged until the archive extension is ready.
- [x] Validate product, reporting month, 24-month duty window, unique total identities, value statuses, coverage metadata and classification compatibility. Allow missing country coverage to remain visible as unavailable; require a complete usable national duty window for a duty-enabled release.
- [x] Run the relevant suites, `npm test` and `npm run check`; commit the compatible release extension.

## Task 3: Recover Both Archive Formats and Gate Promotion

**Files:**
- Modify: `scripts/archive-bundle.ts`, `scripts/archive-release.ts`, `scripts/archive-product.ts`, `scripts/archive-inputs.ts`
- Modify: `.github/workflows/import-census.yml`
- Modify: `tests/scripts/archive-bundle.test.ts`, `tests/scripts/archive-release.test.ts`, `tests/scripts/archive-workflow.test.ts`
- Modify: `tests/helpers/archive.ts`
- Modify: `docs/data-validation/090121-archive.md`

**Interfaces:**
- Consumes: version 1 and version 2 releases and `normalizeDutyMonth`.
- Extends: `BundleManifest` as versions 1/2, with version 2 declaring its 60-month merchandise and 24-month duty scope.
- Keeps: `packBundle`, `unpackBundle`, `recoverBundle`, `stageCandidate` and `promoteCandidate` public signatures, existing pointer/reference shape and conditional-write semantics.
- Version 2 raw file paths add `raw/duties-{month}-{summary}.json` for the four duty summaries. Other source paths and exact legacy query definitions stay unchanged.

- [x] Write tests recovering a version 1 bundle byte-for-byte and a version 2 bundle containing 337 files. Tamper with a duty value, RP record, query scope, checksum or required file and assert rejection before pointer mutation. Restore the previous release after a failed candidate.
- [x] Run archive tests and observe failures for the new format.
- [x] Implement version dispatch in packing and recovery. Replay both source formats with their own strict query/file-grid validators; compare replayed prepared values and coverage with the saved release. Preserve original version 1 archives rather than rewriting them.
- [x] Add optional duty-enabled import input to the existing manual workflow, defaulting to false initially. Retain backup-before-promotion and main-only R2 mutation gates. A version 2 bundle can refer to the existing version 1 accepted predecessor.
- [x] Run archive and workflow tests, `npm test` and `npm run check`; obtain independent review and CI before merging the pipeline/archive extension.
- [x] Retain the current real version 1 bundle, create a real duty-enabled candidate, recover its backup offline and reproduce its processed figures before accepting it. Exercise fresh-runner restoration of the accepted version 2 archive. Keep current preview data in place until this validation succeeds. Record the live receipts and checksums; no public deployment occurs.

## Task 4: Calculate Monthly and Rolling Duty Comparisons

**Files:**
- Create: `src/lib/trade/duties.ts`, `tests/trade/duties.test.ts`
- Modify: `src/lib/trade/duty-types.ts` for view types

**Interfaces:**
- Consumes: `Release`, `DutyObservation` and existing classification intervals.
- Produces: `buildDutyView(release: Release, partnerCodes: string[]): DutyView`.
- `DutyView` contains product/reporting metadata, available history, selected monthly series, latest month and its matching year-earlier comparison, current/prior twelve-month summaries, dollar and percentage-point changes, coverage qualifications and source provenance. A version 1 release returns an explicit not-available view. Each selected country is a separate series; do not pool the selected countries or replace world totals with their sum.

- [x] Write tests using unequal monthly consumption values so an average-of-percentages implementation fails. Include literal assertions:
  ```ts
  // Twelve current months total $30 duty on $400 consumption.
  expect(current.dutySharePercent).toBe(7.5);
  // Twelve prior months total $10 duty on $200 consumption.
  expect(previous.dutySharePercent).toBe(5);
  expect(change.dutySharePercentagePoints).toBe(2.5);
  expect(change.calculatedDutyUsd).toBe(20);
  ```
- [x] Add missing-month, suppressed-cell, zero-denominator, zero-prior-duty, incompatible-classification and unverified-coverage cases. All complete-period comparisons require 24 matching months. Reported duty dollars can remain visible when the derived share or comparison is unavailable.
- [x] Pin monthly year-over-year behavior: a $6 duty on $100 consumption compared with $2 on $50 one year earlier gives a $4 duty increase, 200% duty growth and a 2-percentage-point duty-share increase. A missing intervening month does not invalidate this matching-month comparison, while a classification boundary between the two dates does.
- [x] Run focused tests, observe failures, then implement weighted sums with safe arithmetic and explicit null handling. For positive RP70/79 affected values, show qualified reported comparisons and both periods' coverage; with unavailable coverage, withhold the comparison. Do not introduce an unsupported percentage cutoff.
- [x] Run focused and complete suites; commit the calculation module.

## Task 5: Add the Profile Section and Browser-Generated CSV

**Files:**
- Create: `src/components/EstimatedDuties.tsx`, `tests/ui/EstimatedDuties.test.tsx`
- Modify: `src/components/ProductExplorer.tsx`, `src/lib/trade/downloads.ts`, `src/styles/global.css`, `src/pages/methods.astro`, `README.md`
- Modify: `tests/ui/ProductExplorer.test.tsx`, `tests/e2e/product-profile.spec.ts`; put duty CSV assertions in `tests/trade/duties.test.ts`
- Create: `tests/helpers/duties.ts` for a clearly synthetic version 2 release; extend the default browser fixture to version 2 and preserve its original version 1 shape through `tests/helpers/release.ts` for compatibility tests

**Interfaces:**
- Consumes: `buildDutyView` and the profile's existing selected partner codes.
- Produces: `EstimatedDuties({view}: {view: DutyView})` and `serializeDutyCsv(view: DutyView): string`.

- [x] Write tests for imports-only visibility, world totals when no partner is selected, the same selected countries as the profile, unavailable country history and version 1 releases, monthly/rolling period labels, RP70/79 qualifications and zero-prior behavior.
- [x] Run tests to observe failures, then add an Estimated duties section after the country changes section for Imports. Show the latest month, a current/prior rolling comparison table and monthly figures. Country selection follows the existing comparison controls; duty history shows its actual 24-month coverage. Existing Imports/Exports charts and rankings keep their current behavior.
- [x] Add a browser-generated CSV for the displayed monthly and rolling records, including duty and consumption amounts, shares, period boundaries, reporting qualifications and existing source/retrieval/version provenance. Test formula-looking names, quotes, line breaks and unavailable values without changing valid numeric fields.
- [x] Add mobile and keyboard acceptance for the section and download, plus an initial server-rendered world view without JavaScript. Explain that controls/downloads require JavaScript. Update methods and README only after live verification supports the stated status.
- [x] Run `npm test`, `npm run check`, the fixture build/browser suite and a separate retained-Census acceptance build/browser suite. Check CSV figures independently against restored source totals. Record the automatic build report; avoid writing fixture output over either active real-data preview.

## Task 6: Final Acceptance and Integration

**Files:**
- Update: `docs/data-validation/090121-duties.md`, `docs/data-validation/090121-archive.md`, `README.md`

- [x] Verify each approved scope requirement against the completed artifacts: labels, monthly and rolling formulas, matching denominators, coverage qualifications, unavailable behavior, legacy recovery and new recovery.
- [x] Have fresh independent reviewers inspect calculation/data integrity and UI/download behavior; resolve material findings and rerun only affected checks.
- [ ] Obtain passing GitHub CI for the final head, then merge using the standing authorization and synchronize local main. Verify the merged tree matches the reviewed/tested head.
- [x] Open the real-data preview and report the live validation result, recovery evidence and any limitations. Two runs of the same reporting month verify recovery, not two successive official monthly releases; keep the public-launch gate distinct. Do not add a schedule or deploy the site.

## Review and Execution Status

- The owner approved this implementation plan on October 9, 2026. Tasks 1–5 are complete, including both live archive formats and displayed comparisons; Task 6 review and acceptance are complete; the final-head CI and merge gate is tracked in PR #10.
- The main agent remains the implementer, with subagents used for independent reviews.
- Live duty source data was audited using the existing GitHub secret; two duty-enabled releases have been backed up, recovered and promoted successfully. The evidence is recorded in `docs/data-validation/090121-duties.md`.
