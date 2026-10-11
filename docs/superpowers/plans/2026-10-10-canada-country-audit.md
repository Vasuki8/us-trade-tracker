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
- [x] Dispatch the audit manually through August 2026 using existing GitHub secret. Download artifacts, verify archive digest and original-file hashes, independently replay every retained response and compare totals/reference/candidate figures.
- [ ] Resolve actual source-contract failures with focused tested changes if needed; never reinterpret unexpected totals or suppress a gap to pass.
- [x] Record live evidence and remaining classification/sparse-series questions. Do not proceed into a country-release/archive or page subsystem without the resulting design.

## Execution record

Independent review found that retry attempts lost their earlier response bodies. A regression failed for 503→200; the fix now retains every credential-safe attempt inside its logical request record, including null-body/status transport-failure events. The 503→transport regression also passes. Both focused suites now pass 36 tests, and all 133 checked files have zero diagnostics. Per-attempt envelopes preserve the logical 96-request grid without changing file identities.

Native execution with one whole-branch reviewer follows the user's standing autonomous implementation and review preference. Routine implementation details do not require another approval.

Ruling: use the existing authorized checkout on a feature branch, following the established sandbox worktree fallback. Ruling: use a fresh ignored `.tmp/country-audit/1220` evidence root; refuse an existing directory, even empty, to prevent concurrent reuse.

Tasks 1–2 implemented. Client tests first failed for absent behavior, then passed. Audit tests first failed for absent behavior, then passed. A live public-table check exposed decimal floating-point conversion; a regression with `1,024.1` failed before exact integer conversion fixed it. The parser now reads 320 official monthly rows, including August 2026. The full suite passed 503 tests with two workers after a 47-worker Windows run timed out in two unchanged archive tests; the changed audit suites passed 35 focused tests after the parser fix. At this checkpoint, actual API source coverage remained unverified until the GitHub audit.


The first full run (38093079916) retained 75 files after the job limit, but all 74 API records had null attempt status/body and no observations. Independent replay and review verified the partial artifact; actual source acceptance was incomplete at this checkpoint. PRs #36–#38 are merged after independent review and exact-head CI. PR #37 bounded full retrieval to 15 minutes; PR #38 introduced a four-minute diagnostic covering the permitted 213-second retry schedule.

The first short probe (38095150145) retained seven independently matched files. Public metadata and the existing keyed coffee query returned HTTP 200; all four country queries timed out at about 30 seconds. This narrows the failure to country retrieval without proving a cause. The next documented, controlled hypothesis changes country temporal predicates from time to exact YEAR/MONTH, preserving all other source dimensions. Three regressions failed before implementation; the complete suite then passed 514 tests and all 135 checked files had zero diagnostics. Full source reconciliation and classification eligibility remained pending at this checkpoint.


PR #39 retained exact YEAR/MONTH queries after independent review and passing exact-head checks. Calendar probe 38095866518 passed six checks, with exact August import/export residuals of zero. Full audit 38096086464 then completed and retained all 99 files, including 97 original records and both reports. Independent archive verification, replay and review matched 87 usable API parts, 214,292 HS6 observations and all 10,255 candidate calculations. The audit failed source acceptance: nine import parts were unavailable across eight months, and seven January–July 2026 export totals disagreed with its retained official table. Forty available month/direction pairs reconciled exactly; reference counts were 34 matched, seven mismatch and seven unavailable. No country release or comparison was accepted.

Dispatch, evidence replay and recording are complete. The source-failure resolution step remains open: bounded import retrieval diagnosis and export revision/vintage investigation are needed before another acceptance attempt. Classification compatibility also remains unverified. See the [live findings](../../data-validation/1220-country-audit.md) and [machine-readable evidence](../../data-validation/1220-country-audit-evidence.json). No country release/archive or page subsystem was started.

The next bounded investigation uses a fixed `source-followup` mode: re-request the nine unavailable import parts without changing their calendar query, then observe August exports with monthly and cumulative values. Its own official reference runs first, followed by ten API requests in five pairs (at most 31 total attempts; 487.5-second permitted schedule within a nine-minute step). Independent design review confirmed this scheduling requirement and the cumulative comparison's eight-month coverage and $400,000 rounding bound. Header/body phases and safe transport codes improve failure evidence. No timeout/concurrency relaxation, accepted dataset, R2 operation or country page is introduced. Source-failure resolution remains open until actual results have been independently replayed.

PR #41 merged after independent review and exact-head checks (523 tests, 137 files without diagnostics, 52 browser cases). Fixed followup 38098594901 then completed all eleven attempts and retained all twelve files; the source diagnostic failed, with upload successful. Independent archive verification, raw replay and separate review matched every file/hash, request identity and cumulative calculation. March and June 2026 import totals returned and exactly equal the original audit's HS6 sums; seven other import parts timed out before headers at the existing 30-second deadline. The export cumulative value of $234,176,187,252 exactly equals the original January–August monthly API sum and remains $1,796,212,748 below its own rounded official reference sum. This rejects using ALL_VAL_YR alone as a correction. Both reference vintages are retained; all eight 2026 export months match despite different Last-Modified values. Evidence consistency is verified; the full audit remains failed, classification remains unverified and no country release is accepted. Source-failure resolution remains open pending narrowed aggregate-query and API/public-table vintage investigation; no new full audit is justified yet.

PR #42 records the independently reviewed followup evidence without changing the failed full-audit verdict. The next bounded source-resolution test adds manual `aggregate-probe`: four original/explicit-subdivision pairs plus their own official reference, with unchanged source dimensions and validator. Design review required leaving commodity predicates unchanged, comparing full normalized rows by identity rather than sums, and separating retrieval from reference agreement. The permitted 396-second schedule fits a seven-minute step. Source and classification status stay unverified, no accepted release is produced, and a full audit remains premature. See the [controlled probe](../../data-validation/1220-country-audit.md#controlled-aggregate-query-probe) for the fixed contexts and limitations.

PR #43 merged after independent review and passing checks (532 tests, 139 files with zero diagnostics, 52 browser cases). Aggregate probe 38101045210 finished nine attempts in about 102 seconds and retained all ten files; its source checks failed and upload succeeded. Independent archive verification, raw replay and review matched all original identities, rows, hashes, sums and events. Both June 2025 import breakdown queries returned the same 4,302 rows and $29,645,029,011, matching their own rounded reference; both May 2025 total queries and the previously working August 2026 total control timed out before headers. Both May export queries matched each other and the original API amount, retaining the current-reference mismatch. Explicit subdivision filters are not a supported retrieval fix and the default query remains unchanged.

Supporting primary-source research independently confirmed that all seven retained January–July 2026 export totals round to their original monthly FT900 publications. The June release explicitly revised May's publication, consistent with Census's documented Canada estimate replacement in subsequent exhibits. This supports a reference-vintage explanation without identifying every API record's revision metadata or replacing retained inputs. Source-failure resolution stays open: review a compatible-reference protocol and an independently justified import-total alternative before another full audit. Existing source/classification gates and accepted coffee hashes remain unchanged; no country release/archive or page subsystem was started.

Ruling: Task 3 now tests the documented imports/enduse country-total route against imports/hs for May/June 2025 and August 2026, with a dedicated endpoint contract and unchanged acceptance rules. Public metadata confirms the same GEN_VAL_MO measure and supported dimensions; this bounded diagnostic reduces uncertainty before adopting any strategy. It costs seven logical requests (nineteen maximum attempts), no dependency or service. Reference-vintage validation requires retained original-publication bytes and independently reviewed extraction; manually researched values do not silently become accepted references. The new eight behavioral tests failed for absent functions/workflow before implementation, then passed individually. A Windows sandbox temporary-file failure affected full-suite module loading, so full verification runs outside that sandbox; no runtime fix was inferred from that environment error.

PR #45 merged after final independent review and exact-head CI (540 tests, 141 files without diagnostics, 52 browser checks). Live total-probe 38103215096 then passed seven requests/attempts, retaining all eight files. Independent replay matched both endpoint totals and their own rounded references for May/June 2025 and August 2026. May and June totals are now recovered in isolated diagnostic evidence; cross-run HS6 sums also match exactly. Both HS and end-use returned, so the evidence supports a tested alternate endpoint and observed faster end-use retrieval without identifying the prior timeout cause. Default queries and acceptance gates remain unchanged. Full coverage, compatible original-publication reference validation and classification eligibility remain open; no observations were combined into an accepted country dataset.

Ruling: original-publication validation is separate corroboration, not a replacement acceptance gate. Independently retained/extracted/visually reviewed January–July 2026 original PDFs confirm all seven preliminary figures, with exact digests, cover dates, supplemental monthly columns and physical pages. Runtime retrieval verifies these immutable source pins and retains the originals; no PDF dependency is added. Current-table mismatches, strict sourceCoverage/failure exit and unverified classification remain intact. Cost if this conservative ruling is wrong: a later explicit vintage policy is still needed before a country release; no inaccurate current-vintage claim is introduced. See the [reviewed protocol](../../data-validation/1220-original-publications.md). Seven additional public requests run in pairs, separately from the 96 API parts, with the existing 30-second deadline and fresh output protection. A new full audit follows code review/CI, without adopting a different total query or combining old runs.
