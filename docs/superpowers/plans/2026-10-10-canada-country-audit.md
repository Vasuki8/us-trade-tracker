# Canada Country Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Audit Canada's September 2024–August 2026 official monthly goods totals and complete HS6 breakdowns without accepting or publishing data.

**Architecture:** A dedicated country client validates total and breakdown responses. An isolated audit command preserves original records and computes coverage, reconciliation and candidate completeness; classification eligibility remains unverified without separate reviewed evidence. A manual GitHub workflow uses the existing Census key and returns the evidence.

**Tech Stack:** Node 24, TypeScript, Vitest, GitHub Actions; existing dependencies only.

**Spec:** [Approved design](../specs/2026-10-10-canada-country-audit-design.md).

## Global constraints

- Country `1220`, end `2026-08`, 24 months; no accepted release, R2 write, schedule or deployment.
- Imports `GEN_VAL_MO`, exports `ALL_VAL_MO`; national `DET`, totals `CY`, products `HSCY`/`HS6`.
- Preserve reported zero versus missing; never normalize a breakdown to the total.
- Original request records, sanitized URLs, status, retrieval, processing commit, byte counts and SHA-256; fresh ignored output only.
- Maximum two requests in flight; 30-second timeout and two retries on 429/5xx.
- Share denominator is matching Canada all-goods value, positive and complete; classification compatibility is independently reviewed, never inferred from matching strings.

## Review focus

- Appended predicate columns or duplicate headers: normalize valid field order; reject duplicates and crossed identities.
- Mixed aggregation or subdivision rows: reject instead of double counting.
- Missing product months or special statistical codes: retain raw evidence and withhold unsupported rolling comparisons.
- Partial failures or concurrent/occupied output: preserve evidence without modifying accepted product files.
- Credentials embedded in server errors or URLs: retain only safe diagnostics and credential-free request records.

## Task 1: Country response/client boundary

**Files:** Create `scripts/census-country-client.ts`, `scripts/country-audit-types.ts`, `tests/scripts/census-country-client.test.ts`.

**Interfaces:** `fetchCountryPart({countryCode, month, direction, kind, apiKey, onRaw}, fetchImpl)` returns a validated `CountryPart` with total or HS6 rows. `normalizeCountryPart(payload, context)` checks response dimensions; total commodity is the documented dash aggregate and total aggregation metadata is observed explicitly. Source bodies remain retained even if normalization fails.

- [x] Write tests for correct CY total/HSCY products, request predicates without duplicate headers, reported zero/missing, special codes, duplicates, unknown fields, wrong dimensions, retry/HTTP failures, and credential-safe evidence.
- [x] Run focused tests; confirm missing implementation fails.
- [x] Implement the client and dedicated types with existing request safeguards. Do not change product normalizers or releases. Total metadata not fitting the aggregate contract is an audit diagnostic, not silently coerced.
- [x] Run focused tests to green and commit.

## Task 2: Isolated audit, reference check and manual workflow

**Files:** Create `scripts/audit-country.ts`, `scripts/country-reference.ts`, `tests/scripts/country-audit.test.ts`, `.github/workflows/audit-census-country.yml`; modify `package.json`, README.

**Interfaces:** `resolveCountryAuditOptions(args, env)` validates the restricted pilot and output; `runCountryAudit(options, fetchImpl)` creates a fresh evidence directory, retrieves all 96 logical parts and the official country-table HTML, then writes `audit.json` and `country-dataset.json`. Report exact sums/residuals, availability, special rows, rounded-reference checks and candidate monthly completeness; all candidate classification status starts `unverified`.

- [x] Write failing tests for complete 24-month grid, nonzero residual, sparse series, missing/unsafe values, country-table rounding and vintage, product share ratios, zero denominators, occupied/concurrent output, safe partial-failure evidence and unchanged accepted data.
- [x] Implement audit/reference parser; keep every successful original body and per-part failure. Nonempty or existing output fails before requests. Use exclusive writes and no accepted-release paths.
- [x] Add command `data:audit-country` and manual workflow, main-only preflight with country/month validation before accessing the key. Keep secret in retrieval step only; evidence artifact on failure, seven-day retention, no R2/schedule. Source/coverage failures produce nonzero status with retained diagnostics; incomplete/classification-unverified product candidates remain explicit findings.
- [x] Run focused suite plus `npm test` and `npm run check`; inspect every result. Commit implementation and usage docs.

## Task 3: Review, integration and actual source acceptance

- [x] Run independent immutable-commit review against baseline; address substantive findings with regression tests.
- [x] Push, create/attach PR, wait for exact-head CI, merge under standing permission, update local main.
- [ ] Dispatch the audit manually through August 2026 using existing GitHub secret. Download artifacts, verify archive digest and original-file hashes, independently replay every retained response and compare totals/reference/candidate figures.
- [ ] Resolve actual source-contract failures with focused tested changes if needed; never reinterpret unexpected totals or suppress a gap to pass.
- [ ] Record live evidence and remaining classification/sparse-series questions. Do not proceed into a country-release/archive or page subsystem without the resulting design.

## Execution record

Independent review found that retry attempts lost their earlier response bodies. A regression failed for 503→200; the fix now retains every credential-safe attempt inside its logical request record, including null-body/status transport-failure events. The 503→transport regression also passes. Both focused suites now pass 36 tests, and all 133 checked files have zero diagnostics. Per-attempt envelopes preserve the logical 96-request grid without changing file identities.

Native execution with one whole-branch reviewer follows the user's standing autonomous implementation and review preference. Routine implementation details do not require another approval.

Ruling: use the existing authorized checkout on a feature branch, following the established sandbox worktree fallback. Ruling: use a fresh ignored `.tmp/country-audit/1220` evidence root; refuse an existing directory, even empty, to prevent concurrent reuse.

Tasks 1–2 implemented. Client tests first failed for absent behavior, then passed. Audit tests first failed for absent behavior, then passed. A live public-table check exposed decimal floating-point conversion; a regression with `1,024.1` failed before exact integer conversion fixed it. The parser now reads 320 official monthly rows, including August 2026. The full suite passed 503 tests with two workers after a 47-worker Windows run timed out in two unchanged archive tests; the changed audit suites passed 35 focused tests after the parser fix. Actual API source coverage remains unverified until the GitHub audit.


The first full run (38093079916) retained 75 files after the job limit, but all 74 API records had null attempt status/body and no observations. Independent replay and review verified the partial artifact; actual source acceptance remains incomplete. PRs #36–#38 are merged after independent review and exact-head CI. PR #37 bounded full retrieval to 15 minutes; PR #38 introduced a four-minute diagnostic covering the permitted 213-second retry schedule.

The first short probe (38095150145) retained seven independently matched files. Public metadata and the existing keyed coffee query returned HTTP 200; all four country queries timed out at about 30 seconds. This narrows the failure to country retrieval without proving a cause. The next documented, controlled hypothesis changes country temporal predicates from time to exact YEAR/MONTH, preserving all other source dimensions. Three regressions failed before implementation; the complete suite then passed 514 tests and all 135 checked files had zero diagnostics. Full source reconciliation and classification eligibility remain pending.
