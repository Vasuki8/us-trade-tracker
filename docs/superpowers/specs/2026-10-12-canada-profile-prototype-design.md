# Local Canada profile prototype design

Prepared October 12, 2026. The owner selected **Prepare this design** for a local Canada profile using the verified September 2024–August 2026 snapshot: Imports/Exports, all-goods history, leading products, qualified share changes and sourced CSVs. This written specification is for review before implementation planning. It approves no country release, five-year claim, deployment or R2 operation.

## Purpose and selected approach

Let a business or reader answer: how much merchandise did the U.S. trade with Canada in this captured period, which product categories led that trade, and how did their shares change? Use the reviewed collection to demonstrate the country entry point in the launch brief, with clear periods, definitions and source qualifications.

Recommend a **local, opt-in, 24-month snapshot prototype**. The all-goods chart and product-share denominators use the same captured monthly archive totals. The alternative of validating five-year totals first would delay testing the country research flow; five-year history remains later work. Mixing the current headline table's history with the snapshot's product denominators would require a second series explanation before a useful first prototype. Keep the current-reference evidence in a separate methods section here.

Success means that users can switch trade direction, read the 24-month chart and current/prior product figures, understand the share denominator and statistical categories, and download exactly the displayed data with its sources. The retained-mode page must agree with the independently verified assessment. Normal builds must omit this preview route and its data.

## Evidence basis and statistical contract

The [audit handoff](../../data-validation/1220-audit-handoff.md) and [classification review](../../data-validation/1220-classification-continuity.md) establish the fixed collection. Use the independently verified assessment at processing commit `9c385fb94b2a36b1d07ddf9e01670c366839a83b`:

| Input | Identity |
| --- | --- |
| Assessment JSON | `data/backups/canada-country-audit/snapshot-classifications-2026-10-12-r1/snapshot-assessment.json`; 858,857 bytes; SHA-256 `2cad0dcabf353b8aec0d365bb247e5d976712a7a1ebc90cac26694322503d9f8` |
| Committed classification ledger used by that assessment | 487,985 bytes; SHA-256 `afde19b1384c0cbab8cb2f7bbbc5ed8253bc636bb7a35c6b8d5d3c599a1010fd` |
| Independent calculation receipt | 57,268 bytes; SHA-256 `62864ebf3c55e0b01fe1e6114e3413c0674effa1fad19a0842103c1d9859c547` |

The assessment authenticates the reviewed normalized collection; raw ZIP integrity is based on the previous independent replay. Its 48 contexts and 223,049 HS6 rows reconcile exactly. All 17 ordinary candidates qualify offline, while imports `980100` and exports `988000`/`880000` remain statistical categories with null ordinary-product comparisons. This prototype does not repeat the audit, fetch sources, decompress ZIPs or claim fresh raw-body verification.

| Dimension | Required value |
| --- | --- |
| Geography | Canada, Census `1220`; U.S. national merchandise trade, all transport |
| Reporting grid | September 2024–August 2026, 24 months in each direction |
| Imports | `GEN_VAL_MO`, general imports, customs value |
| Exports | `ALL_VAL_MO`, domestic plus foreign exports, reported FAS basis |
| Values | Nominal integer USD, not seasonally adjusted |
| Current comparison period | September 2025–August 2026 |
| Prior comparison period | September 2024–August 2025 |
| Product grain | The existing reviewed HS6 aggregates; no new classification or allocation |

Do not rescale products, replace denominators with current headline figures, derive months from cumulative differences, or interpret missing as zero. Classification coverage ends in August 2026. The collection is not a uniform revision vintage or latest revised headline series. Exact reconciliation establishes internal arithmetic, not independent shipment-level accuracy.

## Route, modes and build boundary

Use a fixed route, `/preview/countries/1220/`, with a separate `CANADA_PREVIEW_MODE` setting:

- Unset: omit the route from generated static paths and do not read or serialize the retained assessment. Existing product modes and ordinary navigation remain unchanged.
- `fixture`: generate a clearly labeled synthetic development preview for automated checks. Do not read local retained sources.
- `retained`: generate the local preview from the fixed reviewed assessment above. A missing, changed or invalid input fails the opted-in preview build; never substitute fixtures or another assessment.
- Any other value: reject the configuration with a clear fixed diagnostic.

Use a dynamic Astro route whose static-path selection enforces this gate in both development and build. Do not add a country catalog, public country registry, accepted pointer or workflow option. An ordinary build must contain no preview HTML or retained country payload. Client code may be bundled by Astro; it must contain no retained observations, source bodies or full assessment. Measure any additional bundled assets with the existing build report.

The preview page identifies itself as a development preview and uses a noindex instruction. These are presentation/build controls, not access control or publication approval. No deployment is part of this work.

## Server adapter and browser projection

Keep country data distinct from product releases. Add a small server-side loader and projection for this fixed prototype; do not fabricate a product code, world observation, `Release`, `ProfileView` or accepted country release to reuse product components.

The retained loader checks the configured mode before filesystem work. It reads only the fixed assessment path, within its pinned byte length and a 1 MiB ceiling, authenticates its bytes/hash and validates the assessment contract before projection. Enforce workspace containment and regular-file/no-reparse behavior with the existing safe path conventions. No caller-supplied input or digest override and no directory scan is supported.

Require the expected schema/policy, processing commit and classification-ledger identity; complete/passed archive integrity; the exact 48 unique direction/month contexts; valid safe amounts and zero residuals; the fixed 20 candidate keys/order; exact comparison periods and completeness; the 17 compatible eligible entries and three statistical exclusions; the expected reference grid; and all three availability flags still false. Any violation fails retained mode. The pinned artifact and saved independent verification remain the numerical authority; the adapter is not another source acceptance engine.

Project only the fields needed by the page and CSVs:

- Monthly all-goods values for both directions, with measure and original source URL/capture/hash metadata.
- Ten selected candidate summaries per direction: code, retained description, current/prior observed totals and denominators, qualified shares, growth, share-point change, comparison reason and current statistical-policy status.
- Fixed periods, source/capture interval, assessment processing version, classification scope and verification basis.
- Separate current-reference and publication outcomes, including the seven difference rows and source attribution.

Exclude the 223,049 source rows, candidate monthly observations not displayed by this prototype, 941 detailed classification bindings, filesystem paths and original source bodies from client props. Do not freshly load normalized inputs or reviewer receipts on every build: reuse their verification through the pinned assessment and recorded evidence basis. Fixture mode supplies the same presentation shape, with explicit synthetic provenance.

## Page and interactions

Start with Imports. One Imports/Exports control changes the chart, summaries, product table and downloads together. Keep direction-specific wording visible: **U.S. imports from Canada** and **U.S. exports to Canada**. Display the reporting window and source capture interval prominently. Do not offer a five-year history selector.

The page contains:

1. **Country overview:** Canada, development-preview label, reporting coverage, latest captured monthly all-goods value and complete current/prior twelve-month totals for the selected direction. Dollar and percentage changes for these all-goods periods use matching archive totals; percentage growth is unavailable for a zero prior value. This extra country-summary calculation receives a hand-derived test and independent real-value check.
2. **All-goods history:** an accessible monthly chart and equivalent data table for all 24 months. Use country-specific chart labels and sources; the existing product chart's hard-coded HS/API wording cannot be reused unchanged.
3. **Leading products and changes:** the fixed ten selected categories for that direction, ranked by their current-period reported dollar totals. Show current/prior totals, qualified product shares and share change in percentage points, alongside dollar change and percentage growth where comparison eligibility permits. Keep the two period labels visible. Do not rank by growth, add a new top-gainers list or backfill statistical categories with lower-ranked products.
4. **Sources and revision explanation:** describe the captured collection and same-archive denominators, show the separate reference results, and link to the official sources and methodology.

Product share means a category's share of all U.S. imports from Canada, or all U.S. exports to Canada. It differs from a country's share of U.S. trade for one product on the existing product pages. Use a concise explanation near the share columns.

Known statistical rows remain in the ten-category list and all-goods denominator. Show their retained observed dollar totals with a statistical-category label, while share/growth/change comparisons remain unavailable under the reviewed policy. Preserve the distinction from capture-era flags; the page does not rewrite retained metadata. Ordinary unsupported, incomplete or zero-denominator results remain unavailable. Formatting never substitutes zero for a null result.

The selected candidates cover a subset of trade. Do not imply that their values sum to all goods or call the remaining trade an unexplained residual. Do not link an HS6 to a product profile unless that profile actually exists. Broader product intake is outside this design.

## Reference explanation

The retained before/after reference snapshots each have 41 matches and seven mismatches. January–July 2026 exports have original-publication corroboration; the other 41 original-publication comparisons remain unreviewed. Render those outcomes from the checked input, without renaming mismatches or choosing whichever publication matches.

Use plain language: **These figures come from a captured set of monthly Census files. Currently revised country totals can differ. Product shares here use totals from the same files as the product values.** The methods detail shows the seven affected months, archived total, retained current figure and signed dollar difference. Explain that documented revision procedures support differing publication maturity, but do not establish each product observation's revision date.

Source URLs, capture interval and processing version remain available in methods and CSVs. File-property and HTTP timestamps are not labeled observation revision dates. Keep earlier failed audit verdicts intact; an offline comparison becoming eligible does not accept a release.

## Browser-generated CSVs

Provide two downloads for the selected direction: monthly all-goods chart data, and the displayed leading-product/period-comparison data. Generate both in the browser from the same projected values; store no downloadable combinations or bulk source files on another service.

Each CSV includes country/code/name, direction, measure, nominal USD/adjustment basis, reporting or comparison periods, capture interval, processing version, source URLs and original source identity/verification basis. Comparison rows include exact numerator and same-archive denominator values, classification interval/status, statistical-policy status, eligibility/reason and percent versus percentage-point units. Statistical rows retain observed totals with blank unsupported comparisons and an explicit status. Fixture CSVs say synthetic development data.

Use existing quoting and formula-text protection conventions while retaining numeric dollars as numeric fields. Keep rows in the displayed order and qualify the file names with Canada, direction, window and preview status. Do not use a product CSV schema with fabricated product/world fields. PNG export and saved-view URLs are later prototype improvements.

## Rendering, accessibility and performance

Use the current Astro/React/layout/styles and number/month-formatting conventions. Keep server-rendered default Imports data and the source explanation readable without JavaScript; note that direction switching/downloads require JavaScript. Reuse generic formatting and download helpers where their contracts fit, with a country-specific chart/table and serializer.

Direction controls need explicit labels, keyboard operation and selected state. The chart has a readable text alternative and data table. Tables have captions and headers, with a keyboard-accessible scroll container where needed; the page itself must not overflow at mobile widths. Null results are clearly labeled unavailable. Sources and preview qualifications remain visible at mobile widths.

Measure normal and opted-in builds with the existing file-count/total-size/largest-file report. The unflagged build must omit preview HTML and retained payload; the opted-in build adds only this one country route and its bounded presentation data. Keep ordinary pages/chart data on the same static host and R2 private. Add no library or paid service.

## Verification and preservation

Test meaningful failures at the mode/loader boundary: unset mode performs no assessment read, fixture mode remains independent of retained files, retained input missing/changed/oversized or crossed contract fails, and there is no fallback or accepted-pointer write. Verify that unflagged builds omit the route/data and both explicit preview modes render truthful provenance.

Use hand-derived synthetic values for the newly added all-goods period summary, zero-prior growth and unavailable handling. Test same-archive denominator display, statistical exclusions, incomplete/incompatible comparisons, direction switching, CSV periods/numerators/denominators/source labels and safe text quoting. Existing assessment calculation tests remain the authority for the unchanged product ratios; do not duplicate them with tests that merely restate implementation.

Browser checks cover the default rendered Imports view, Exports switching, two CSV downloads, keyboard controls, mobile table behavior, no-JavaScript default research, visible reference qualifications and the normal-build route boundary. Synthetic fixtures remain small and versioned; no real trade ZIP, secret or 223,049-row dataset enters Git or CI.

Verify one local retained preview against the pinned assessment: all 48 chart points, 20 summaries/order, 17 eligible comparisons, three statistical exclusions, period totals and reference outcomes. Independently check the new all-goods summary figures and displayed/downloaded projection; do not re-decompress sources or repeat the completed classification review. Record the concrete local preview and measured build results before claiming completion.

Preserve historical reports/evidence, all source files, classification/capture flags, the four accepted coffee files, current product workflows/pages and private R2 behavior. The prototype creates no accepted country pointer and leaves `releaseAccepted`, `rollingComparisonsAvailable` and `defaultAuditRetrievalChanged` false.

## Handoff and excluded work

After the owner reviews this written design, prepare the implementation plan. The root implements the approved plan, with subagents reviewing. Written-design approval permits planning; it does not itself approve implementation or publication.

Excluded: country release/archive schema, R2 writes, five-year history intake, another country, broader HS6 intake, country-level estimated duties, accounts/billing, deployment, scheduled processing, source-policy/default-query changes and any paid service. A later accepted country pipeline/profile requires its own design and acceptance decision. This prototype tests the research flow with already reviewed data.
