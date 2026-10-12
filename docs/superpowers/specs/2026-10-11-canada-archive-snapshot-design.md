# Canada archive snapshot assessment design

Prepared October 11, 2026, against main `24e8451c9ec8b667e54df3a17dbdf9c15b147934`. The owner approved preparing this design with “continue,” after reviewing the proposed snapshot rules, and approved the independently reviewed written specification with “approved.” The implementation plan remains subject to review before execution. It extends the reference/classification work in [country audit Task 3](../plans/2026-10-10-canada-country-audit.md), without accepting or publishing a country release.

## Purpose and decision

Assess a clearly identified collection of official Census monthly files for Canada, September 2024–August 2026. Answer three separate questions: do the retained detailed observations reconcile; how do their totals compare with other publications; and which products have enough classification and monthly evidence for a comparison?

Recommend an **as-retrieved archive snapshot** contract. Identify the collection by reporting context, capture interval and immutable content hashes. Do not describe it as a uniform revision vintage, an original-publication dataset, or the latest revised headline series. Unknown row revision dates do not establish incompatible definitions; they remain an explicit limitation. Exact reconciliation establishes internal arithmetic consistency, not independent statistical accuracy.

The alternative is to keep current-headline equality mandatory for any future use of the detailed series. That remains appropriate if the intended output requires uniformly revised headline history. It has no demonstrated completion guarantee for these retained files and does not resolve product classifications. Selecting whichever publication happens to match is not an acceptable alternative.

The first implementation creates a separate offline assessment. It does not replace the existing bulk/API diagnostic's `sourceCoverage`, failure exit or historical verdicts. A later release design must decide how to publish qualified observations and their limitations.

## Evidence supporting the distinction

[Census revision methodology](https://www.census.gov/foreign-trade/guide/sec2.html#revisions) documents monthly aggregate revisions and annual detailed recompilation. Canada's estimate replacement in subsequent news exhibits is also described in the retained June release. These procedures support differences in revision maturity, without identifying every detailed observation's revision date. The [reviewed source-method findings](../../data-validation/1220-country-audit.md#revision-method-review-and-aircraft-aggregate-correction) explain the Canada exception and why monthly and cumulative publication columns cannot be interchanged.

The [inventory replay](../../data-validation/1220-country-audit.md#inventory-limit-replay-all-archives-reconcile-current-mismatches-remain) independently verifies 48 detailed/control pairs and 223,049 HS6 rows. Every same-archive residual is zero. Forty-one contexts match both retained current references; seven January–July 2026 export contexts mismatch. Those seven separately match their reviewed original monthly publications. This is evidence for a useful captured collection, not permission to rewrite the strict audit result.

## Fixed statistical contract

| Dimension | Required value |
| --- | --- |
| Partner | Canada, Census country `1220` |
| Period grid | All 24 reporting months, September 2024–August 2026, both directions: 48 contexts |
| Scope | National merchandise goods, all transport methods; no districts or mixed aggregation levels |
| Imports | `GEN_VAL_MO`, general imports, customs value |
| Exports | `ALL_VAL_MO`, domestic plus foreign exports, Census's reported FAS basis including its Canada adjustments |
| Units and adjustment | Nominal USD integers, not seasonally adjusted |
| Time grain | Monthly values; no cumulative differences or annual-to-month allocation |
| Product grain | The already reviewed HS6 aggregates of unique detailed records |

Do not convert currencies, reapply Canada freight adjustments, rescale products to headline totals, replace general imports with consumption imports, or infer absent product-months as zero. Preserve returned zeros, unavailable observations and known statistical categories distinctly.

For a monthly product share, divide its reported value by the positive country total from the **same archive and context**. For a rolling share, divide the sum of the product's complete monthly values by the sum of the corresponding complete archive totals. Never average monthly percentages. The two windows are September 2025–August 2026 and September 2024–August 2025. Missing months, unsafe values, incompatible classifications or zero denominators make the affected result unavailable. Zero prior product value yields no growth percentage.

## Trusted input collection and provenance

Use only the existing, independently reviewed inventory replay selected in `bulkInventoryReplay` within [the evidence record](../../data-validation/1220-country-audit-evidence.json). The initial assessor accepts no alternative run, country, end month or window. Its source anchors are fixed before assessing amounts:

| Evidence | Bytes | SHA-256 |
| --- | ---: | --- |
| Original maintained bulk report | 91,396 | `7a306222bf6be80eae1c938341661e353b08cb4a5ab4e50c6466702f704ad00c` |
| Original source manifest | 51,828 | `66acdc59057211575cf8b659f853460e1d279d624677f41fd880da6827865535` |
| Inventory replay report | 139,962 | `9157869192cef9b14d542de8ce772ddea146167dbe7d510aa45eb4919735ca6d` |
| Independent inventory verification receipt | 228,778 | `0279468121f2164f007b0338f0ff5cd9babc49c67e16cf31cfbd6e28c3d20927` |

The adapter verifies these identities and every referenced normalized rows/receipt file before using its contents. Reject missing, changed, duplicate or crossed context/file identities. Input paths come from the trusted fixed collection and must resolve within the workspace without path traversal or reparse-point escapes. Do not scan arbitrary directories or accept a caller-supplied digest as equivalent review evidence.

Record each original ZIP's URL, reporting context, capture time, bytes and recorded digest, plus the original retrieval commit, parser commit and new assessment commit. Derive the collection's capture interval from the retained request records. HTTP Last-Modified and file-property timestamps are transport/document metadata, not observation revision dates.

This assessment checks the retained normalized outputs against their reviewed hashes. It relies on the previously reviewed raw-source replay and says so explicitly; it does **not** freshly verify or decompress the original ZIP bodies. Retain their historical identities and verification-receipt links without claiming that their current local bytes were checked by this command. Another collection requires new reviewed evidence, rather than silently changing these pins.

## Assessment flow and outputs

Use the existing Node 24/TypeScript tooling and validation/calculation conventions, with no new dependencies. The new command reads the fixed reviewed collection, validates its normalized values and exact monthly arithmetic, carries forward both reference snapshots and publication evidence, and evaluates a bounded set of candidates. It makes no network/provider calls and reads no trade ZIP payloads.

Write a versioned JSON assessment and a concise Markdown report in a fresh ignored directory under `data/backups/canada-country-audit/`. Reject an occupied output, including an empty directory, before doing assessment work. Use exclusive writes. Read one normalized context at a time, bound reads by the pinned file lengths, and cap new output at 8 MiB. Write only the assessment and its report; do not copy another full dataset. An input, arithmetic or output failure produces a nonzero exit and a safe failure report when writable, with no successful qualification. No accepted pointer is touched.

The report contains separate results:

- **Archive integrity:** passes only with the complete fixed context grid, verified normalized-file identities, valid statistical dimensions/integers, unique HS6 rows and exact country reconciliation. Original-body verification is labeled `previous-reviewed-replay`, never fresh verification.
- **Reference evidence:** retains the current-before/current-after comparisons, reference stability and the seven pinned publication comparisons. Each comparator keeps its own source context, precision and result. A current mismatch stays `mismatch`; publication corroboration cannot rename it.
- **Candidate comparability:** reports monthly completeness and classification eligibility independently of archive integrity. Values may be inspected as retained observations while comparison eligibility remains unavailable.
- **Availability:** `releaseAccepted=false`, `rollingComparisonsAvailable=false`, `defaultAuditRetrievalChanged=false`. Passing this assessment never enables a public country comparison.

The command's successful exit means the fixed offline assessment completed and archive integrity passed. It does not mean the old strict source audit passed, all classifications passed, or a release was accepted. Required reference evidence is the before/after current-reference grid for all 48 contexts and the seven pinned January–July 2026 export publication comparisons; the other 41 publication comparisons remain `not-reviewed`. Missing or incompatible required reference evidence prevents a complete assessment; a preserved, valid-context reference **difference** does not fail archive integrity. Report these distinctions prominently.

## Classification work and statistical categories

Freeze the initial review set to the ten largest current-window categories in each direction, ranked by complete reported current-window dollar total with code ascending for ties. All 20 selected candidates have 24 reported months in this fixed reviewed collection; this is not a general ranking rule for sparse products. Keep known statistical categories in that list and in the all-goods denominator; do not silently backfill them with lower-ranked products. Imports select `270900`, `980100`, `271019`, `271121`, `870323`, `870340`, `870324`, `870829`, `271012`, `880240`; exports select `988000`, `270900`, `880000`, `870431`, `271012`, `271019`, `870899`, `847150`, `870323`, `711291`. The known special categories are imports `980100` and exports `988000`/`880000`. Other candidates remain unverified until reviewed; `special=false` does not prove ordinary HS validity.

Preserve every historical `special` flag. The assessment may derive a separate classification under its documented current rule, including export `880000`; it must show the distinction from capture-era metadata rather than rewriting retained rows. Known statistical categories do not acquire ordinary-product comparison eligibility in this milestone.

For each remaining candidate, a reviewed classification entry must bind direction, HS6 code, the covered monthly interval, primary evidence identities and the scope conclusion. Check the actual HS6 definitions and relevant section/chapter notes across the interval, dated detailed-code additions/deletions, and any transfers across HS6 boundaries. A split wholly within a parent can support continued comparability only after its scope is reviewed. No invented bridging, allocation or sum of obsolete and replacement codes is permitted. Use the reviewed HS6 values already present in each monthly source.

[Census's historical-code sources](https://www.census.gov/foreign-trade/reference/index.html) provide descriptions and begin/end month text. The newly captured workbooks give useful validity-date screening; they do not supply predecessor mappings or a history of every semantic change. Preserve literal `Current` and `Prior to 2007` labels, and never extend evidence beyond this fixed August 2026 window. Annual concordances and unchanged observed descriptions are corroboration, not sufficient continuity proof. Full workbook metadata can be malformed; read-only extraction must preserve original bytes and document the method.

Retain these original reference captures and their own request metadata under ignored `data/backups/canada-country-audit/classification-references-2026-10-11/`. The workbooks are review inputs; the assessor consumes reviewed classification entries and does not need an XLSX parser. Each workbook's `Data!A1:E1` is `hs`, `salpha`, `lalpha`, `begdate`, `enddate`. Direct worksheet/shared-string XML inspection avoids malformed core-property timestamps without altering either original. The root and independent reviewer verified both identities and 12 selected date rows; that date check does not accept semantic continuity.

| Reference capture | Bytes | SHA-256 |
| --- | ---: | --- |
| [Import historical HS numbers](https://www.census.gov/foreign-trade/reference/codes/Import_Historical_HS_Numbers.xlsx) | 1,117,590 | `d13be8bd5755a9237f8c1d1f0cf49d29e9141413d845dc39728f98ab534bade6` |
| [Export historical HS numbers](https://www.census.gov/foreign-trade/reference/codes/Export_Historical_HS_Numbers.xlsx) | 531,257 | `ce57b7594132292bef7e5c1c501574636e290604367d707d5e8b22c8d4292776` |

Classification entries use `compatible`, `incompatible` or `unverified` with specific evidence/reasons. Unsupported candidates remain unavailable without preventing a truthful aggregate-integrity result. A complete product window and compatible classification are necessary for candidate comparison eligibility; public availability remains false in this assessment.

## Validation and preservation

Meaningful tests must reject changed or missing reviewed inputs, crossed/duplicate contexts, duplicate HS6 rows, unsafe/null values, incorrect country totals and occupied outputs. Verify exact monthly and rolling denominators, zero versus missing, zero-prior growth, classification interval boundaries and statistical-category retention. Cover a valid archive with a current-reference mismatch and original-publication match: archive integrity may pass while the old reference mismatch remains visible and all release flags remain false. A failure midway must not produce an apparently qualified partial collection.

Independently verify one real offline assessment against the retained normalized observations and pinned receipts, without another ZIP decompression or source download. Reconcile all 48 monthly values, 20 candidate summaries and their availability reasons. Check source-capture interval/provenance and preservation of 223,049 rows, historical reports, all 23 existing evidence fields and the four accepted coffee files. Run appropriate project checks when implementation changes code; do not build duplicate tests for this design document.

## Handoff and excluded work

Written-spec review precedes implementation planning. The root agent implements the approved plan, with subagents reviewing. This specification authorizes no public country profile, five-year history claim, country release/archive schema, R2 operation, production retrieval switch, new download service, deployment, schedule, access change or paid service. The 24-month audit cannot supply a separately required 60-month chart.

All previous strict diagnostics remain failed where they failed. Original country Task 3 remains open until the new assessment and the required classification evidence have been implemented and independently verified. Any later country release requires its own resulting design and acceptance decision.
