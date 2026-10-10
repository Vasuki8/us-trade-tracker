# Canada country-data audit design

Prepared October 10, 2026. The written design was approved with “continue.” This specification is not a record of live data acceptance. Baseline: main commit `bc22faf08e329bbd123885530df775da8b8be335`.

## Purpose and recommendation

Develop the launch brief's country-profile entry point, starting with Canada (Census country code `1220`). Businesses should be able to understand total U.S. goods imports from and exports to Canada, the leading six-digit products, and changes in those products' shares.

The next implementation milestone is a **24-month source audit**, not the full profile. It will establish whether the official totals and detailed products support those comparisons before designing the retained country release and public-facing page. It will not accept or publish a dataset, update a current pointer, or write to R2.

The existing coffee releases cover individual products. Adding them together would not produce Canada's all-goods total. The current product normalizer also requires an HS6 product and a world observation, so country totals need a distinct audit contract rather than a fabricated product identifier.

An all-country intake would increase coverage and validation work before one country is proven. Two-digit chapters would reduce detail, but the approved brief starts with HS6 product categories. Recommend one country's HS6 audit first, using the existing source-request safeguards and evidence conventions.

## Documentary evidence and remaining uncertainty

The [Census International Trade API guide](https://www.census.gov/foreign-trade/reference/guides/Guide_to_International_Trade_Datasets.pdf) documents country totals (`CY`), HS6 country breakdowns (`HSCY`, `COMM_LVL=HS6`), country `1220`, and the import/export monthly measures. It recommends small requests instead of retrieving all countries and commodities together. Its current instructions require an API key.

The [official Canada table](https://www.census.gov/foreign-trade/balance/c1220.html), checked October 10, contains monthly figures through August 2026. It supplies a separate presentation of goods totals, in nominal millions of U.S. dollars, not seasonally adjusted. It can corroborate API totals at its displayed precision; it cannot validate the full product breakdown.

The [Census statistical methodology](https://www.census.gov/foreign-trade/guide/sec2.html), sections 14 and 18, warns that an omitted commodity need not mean no trade and that disclosure protection can combine classifications. It identifies export and import low-value statistical codes. Their actual appearance at HS6 and their contribution to Canada totals must be observed, not assumed.

The exact total-row fields, response completeness, request partitioning needs, reconciliation residuals, sparse-series meaning and classification compatibility remain **unverified until a live audit**. Matching a numeric product code across years is insufficient classification evidence.

## Audit inputs and retrieval

- Restrict the first audit to reviewed country `1220` and reporting month `2026-08`, covering September 2024–August 2026. Validate the country, month and a fresh output directory before requesting data.
- Retrieve country all-goods totals and the complete HS6 country breakdown separately for both directions and every month. Imports use `GEN_VAL_MO`; exports use `ALL_VAL_MO`, including domestic and foreign exports.
- Use national country detail (`SUMMARY_LVL=DET`) with no district, rate-provision, domestic/foreign or country-subcode subdivisions. Check returned dimensions and identities. The live total response determines its exact commodity/aggregation representation.
- Start with one country/month per request. There are 96 logical request sets: 24 months × two directions × total/breakdown. If a breakdown requires partitioning, use explicit non-overlapping commodity prefixes, prove coverage and detect duplicates before combining it. Record every request actually made.
- Retain the established timeout, bounded retries and maximum two in-flight requests. Do not repeat predicate fields in the requested columns when Census appends them. Unknown fields or unexpected dimensions must not silently become accepted observations.
- Use the existing GitHub secret only in a new manually dispatched audit step. Keep the workflow read-only to the repository, and retain evidence even on validation failure. No scheduled processing, R2 settings, public hosting or new services are needed.

## Evidence and acceptance checks

Write a fresh ignored country-audit directory with original response records, sanitized request parameters, HTTP status, retrieval time, processing commit, byte counts and SHA-256 digests. Existing evidence is never overwritten. Retain all returned HS6 rows, including statistical and pseudo classifications, rather than only leaders.

For each month and direction, report the independently retrieved country total, full HS6 sum, residual, row count, special-code observations, unavailable values, duplicate identities and dimension/coverage failures. Do not combine parent and child commodity levels, country groupings, or subdivisions. A reported numeric zero remains distinct from an absent row or unavailable value.

Compare country totals against the official Canada table at its stated million-dollar precision, recording that table's retrieval and vintage. A disagreement requires investigation of rounding, revisions or definitions. Never rescale products to force agreement. An unexplained residual prevents claiming complete product coverage and must not be called ordinary “other products.”

Evaluate leading-product eligibility separately: require the relevant monthly values and reviewed classification compatibility before using a rolling comparison. Preserve the distinction between reconciled aggregate coverage and known values for each product/month. Record unresolved or incompatible candidates with explanations.

The audit's result is a source-backed recommendation with explicit passed, failed and unresolved checks. It does not itself authorize publication or constitute an accepted country release.

## Intended comparisons after successful audit

Compare September 2025–August 2026 with September 2024–August 2025, separately for imports and exports. A product share uses its period dollar sum divided by Canada's **all-goods total for the same direction and months**; a rolling share is a ratio of sums. Require complete, available periods and a positive denominator for shares. Display share changes in percentage points, dollar changes alongside growth, and unavailable growth for a zero or missing prior value.

Label this as “Product share of U.S. imports from Canada” or “Product share of U.S. exports to Canada.” It differs from the existing product profiles' partner share of U.S. trade for one product. Statistical aggregates remain accounted for and visibly distinguished from ordinary business products.

The audit provides only 24 months. A subsequent accepted country pipeline would validate 60 monthly country totals before supplying the brief's five-year default chart. Five-year detail for every HS6 product is not required for this first country page. Browser-generated sourced downloads, static page/chart delivery, private R2 backups and measured builds retain the agreed hosting approach.

## Verification and handoff

Use meaningful fixtures for valid totals/breakdowns, appended predicate fields, duplicate or overlapping responses, wrong country/month/direction, unexpected aggregation, missing versus zero, special codes, unsafe or unknown values, and incomplete periods. Test credential removal, fresh-output protection and preservation of existing product releases. Independently review the implementation before merging.

After merging the audit code, run it with the existing GitHub Census secret, verify downloaded evidence and independently replay the retained source records. Report the resulting coverage and unresolved questions before committing to a country-release/archive architecture or page implementation. A failed check preserves existing accepted data and supplies a concrete diagnosis.

## Scope boundaries

This milestone adds no broader country catalog, new product profiles, country-level estimated-duty feature, account/billing system, public deployment, storage permission changes, paid service or recurring job. It preserves existing accepted product releases and archives. Country page design and release/archive implementation follow the audit evidence.
