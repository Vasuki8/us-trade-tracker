# Tea and cocoa source resumption — October 18, 2026

Both August 2026 source candidates passed independent calculation and exact offline recovery. Tea and cocoa remain unpublished and duties-unaccepted; no canonical dataset, R2 archive or site update was installed by this batch.

| HS6 | Merchandise observations | Duty observations | Fresh import captures | Exact recoveries | Source assessment |
| --- | ---: | ---: | ---: | ---: | --- |
| 090240 — other black and partly fermented tea | 4,634 | 1,056 | 336 | 2 | Ready for a separate archive/acceptance assessment |
| 180100 — cocoa beans | 2,717 | 784 | 336 | 2 | Ready for a separate archive/acceptance assessment |

Merchandise covers September 2021–August 2026 (60 months), imports and exports, world totals and reported partner countries. Estimated duties cover September 2024–August 2026 (24 months), imports only. Each import contains 240 merchandise and 96 duty contexts, plus its release and pointer: 338 authenticated files.

## Source and calculation evidence

The [fresh tea duty audit](https://github.com/Vasuki8/us-trade-tracker/actions/runs/39103300808), [cocoa import](https://github.com/Vasuki8/us-trade-tracker/actions/runs/39103740054) and [tea import](https://github.com/Vasuki8/us-trade-tracker/actions/runs/39104701711) each succeeded on attempt 1, sequentially, on reviewed commit `306ea1ab6ed196f6928f4da31b7f1e4765f96c18`. The [evidence record](tea-cocoa-resumption-20261018-evidence.json) binds runs, inputs, artifacts, captures, releases, calculators, bundles and recovery receipts by SHA-256.

Cocoa's retained October 17 duty audit was reauthenticated before import; its prior arithmetic was not rerun at that stage. Tea's entirely fresh 96-response audit passed independent replay of all 1,056 observations. It matches the 1,024 observations in the earlier partial audit and adds 32 February 2026 observations. No earlier response supplied values to the fresh candidate, and no captures were stitched together.

Independent import replay matched all 3,501 cocoa and 5,690 tea observations against each candidate's own 336 saved responses. All 192 country/world reconciliation checks per product passed. There were zero discrepancies, missing inputs or unavailable duty coverage. All saved responses in these three executions were HTTP 200; the existing 204/missingness handling was not reinterpreted.

Reported zeros remain explicit: cocoa has 1,244 merchandise and 1,593 duty input cells; tea has 2,137 and 1,807. Cocoa retains 28 RP70/79-qualified duty observations and $5,318,804 of national dutiable value lacking calculated duty. Tea retains 10 qualified observations and $205,406; positive qualifications in its capture were RP79. These are qualification amounts, not estimated duties, and zero calculated duty does not establish duty-free treatment.

All 784 cocoa import duty observations match its retained audit; all 1,056 tea import duty observations match its fresh audit. Each capture keeps its own retrieval timestamp and processing identity. Agreement between separate captures through the same August endpoint does not demonstrate successive-release behavior or erase the earlier failures.

## Recovery, limits and remaining gates

The existing offline CLI packed each candidate into 337 payload files, then recovered it twice into separate local roots. Every recovery matched all 338 original files byte for byte, including the reconstructed pointer. Five malformed-bundle controls per product rejected the wrong digest, wrong product, changed member, missing member and extra member. The independent import calculator passed 18 synthetic controls; the fresh tea-audit calculator passed 16.

The three permitted source operations consumed three workflow attempts and 768 complete logical contexts, with no replacement or source-bearing rerun. The unchanged client policy allowed a maximum of 2,304 explicit fetch attempts; actual HTTP attempt and redirected wire-request counts were not independently measured. All source allowance in this batch is exhausted. No additional Census request is authorized by this report.

The preflight change in [PR #127](https://github.com/Vasuki8/us-trade-tracker/pull/127) only aligned the two manual workflows' test commands with the existing two-worker CI setting, with two new regressions. Queries, retries, request signals, test assertions/deadlines and job limits stayed unchanged. Local checks passed 1,752 tests and 325 type-checked files; an earlier unchanged 5,000 ms archive-test timeout is retained in proof alongside its successful isolated and sequential full reruns. Both preflight CI runs passed on the reviewed head. The historical source transport cause remains unproven.

Accepted coffee/Canada inputs, deployment selection and both new-product publication/acceptance flags remain unchanged. The separate September coffee plan remains unchanged and gated. No R2 operation, accepted-data installation, site packaging, publication or restoration occurred in this batch. Archive initialization/readback, canonical acceptance and any expanded site publication require a separately reviewed scope.

Original Actions artifacts have seven-day retention in the public repository. Authenticated owner-retained originals, calculations, diagnostic logs, bundles and both recoveries are preserved separately. Raw response bodies, bundles, private paths, signed URLs and credentials are excluded from this report. The [October 17 assessment](product-expansion-20261017.md) retains its historical failures and exhausted allowances.
