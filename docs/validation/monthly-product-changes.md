# Monthly product changes verification

The local retained-data package passed acceptance on October 15, 2026. Independent branch review, GitHub CI/merge, publication and operational closeout are pending at this checkpoint.

## Reader behavior

The existing Product changes page offers rolling twelve-month comparisons and latest-month comparisons. Saved links preserve period, direction and ranking. Both product-link locations open matching monthly profile comparisons; the portfolio action retains product coverage and direction. Static output remains rolling import dollar changes, with controls disabled before saved-view restoration.

Monthly figures compare August 2026 with August 2025. Percentage growth uses the previous matching month as denominator. Growth eligibility separately requires at least $10 million over September 2024–August 2025 and a positive prior month. Missing annual qualification does not withhold valid monthly dollar comparisons. Zero baselines, unavailable qualification and below-threshold totals have nonoverlapping growth exclusions. Imports use GEN_VAL_MO and exports ALL_VAL_MO official world observations.

Monthly CSVs carry the comparison period, qualification basis/dates/amount/availability, correctly named threshold and exclusion counts. Rolling CSV schema, bytes and filenames remain unchanged. All downloads are generated in the browser.

## Verification performed

- Final runtime: 1,465 unit tests and zero compiler errors/warnings/hints across 301 checked files. Full browser suites passed 150 ordinary, 10 Canada preview and 12 Canada pilot cases (172 total). After the final explanatory hint wiring, all 16 affected browser cases passed again; the full unit/compiler/fixture-build checks also passed again. Python packaging passed 24 tests. No new prose-only test was added for that reversible copy wiring.
- Final staged compatibility: 112 legacy CSVs plus Canada projection, six duty CSVs and 17 share CSVs remain byte-identical (135 CSVs total). Seven accepted files and eleven protected identities remain unchanged. Other downloads exports and calculators/chart/duty/share/Canada source bindings are unchanged; product model/serializer edits are intentional.
- Independent packaged browser acceptance: 24 checks, eight exact ranking CSVs plus six profile coexistence CSVs, four monthly profile handoffs and both portfolio directions. Copy/reload/history/fallback, 320/375-pixel keyboard/mobile behavior, no-JavaScript defaults and local delayed hydration passed. 243 allowlisted loopback requests, zero rejected requests/page errors; five screenshots visually inspected. DOM counts/body bytes and details-open state are in the receipt.
- Expected values and ranking/qualification totals were derived directly from authenticated retained observations and classification intervals, without application calculators. All four real product/direction cases qualify; missing/suppressed/zero-prior/below-threshold behavior is fixture coverage, not newly observed real data.

| Product | Direction | Aug 2026 USD | Aug 2025 USD | Change USD | Sep 2024–Aug 2025 qualification USD |
| --- | --- | ---: | ---: | ---: | ---: |
| 090121 | Imports | 140,980,739 | 154,404,658 | -13,423,919 | 2,207,669,569 |
| 090121 | Exports | 66,393,173 | 65,926,363 | +466,810 | 811,100,933 |
| 090111 | Imports | 761,982,573 | 732,404,352 | +29,578,221 | 9,142,281,740 |
| 090111 | Exports | 19,387,454 | 23,576,145 | -4,188,691 | 257,686,581 |

## Package and source binding

Packaged source/runtime: `be1c911895f6601001aac7d7b4b7f36ba3d3f95d`. Package creation/readback and deterministic recreation passed for site and withdrawal trees. No new route or stored download was added.

| Metric | Prior verified site | Candidate |
| --- | ---: | ---: |
| Entries | 31 | 31 |
| Aggregate raw bytes | 1,874,543 | 1,884,934 |
| Client JS raw / gzip bytes | 380,504 / 114,653 | 384,037 / 115,543 |
| CSS raw / gzip bytes | 21,963 / 4,510 | 21,963 / 4,510 |
| Product changes HTML raw / gzip bytes | 16,970 / 5,216 | 22,801 / 5,628 |

Largest asset: `products/090121/index.html`, 350,573 bytes. Raw growth: 10,391 bytes; remaining 2 MiB verifier headroom: 212,218 bytes. Existing entry/asset/ZIP/manifest/check limits remain binding. Profile markup differs only in generated asset references/island IDs, with source data/behavior preserved; final normalization readback is retained privately. No performance improvement is claimed.

Site ZIP: 410,401 bytes, SHA256 `2d383eb0268069075d05ed630bb9055a29405b6f358e6a5df01dfcd23c30b587`. Manifest: 6,556 bytes, SHA256 `9db8ad151b31a21187190147fd15547c0063adc0c8e765a505d3f7b5e2c3f39b`.

## Evidence and limits

Private evidence is under `data/backups/monthly-product-changes/deployment-20261015-r1`: original approval proposal, predecessor/input authentication, numerical audit, staged compatibility, package/measurement receipts and `local-reader-r5/receipt.json` with screenshots/downloads. Initial environment/private-harness failures are preserved; repaired harness checks are distinguished from runtime defects. The initial package passed reader acceptance, then the saved-link helper text was corrected and the final package restaged and rechecked.

This adds no reporting month, product/country coverage, import/source request, data replacement, R2 operation, dependency/service, paid/access/indexing change or recurring job. Existing historical qualifications remain; the predecessor's extra-28-case indirect producer-binding limitation remains disclosed. This is Chromium coverage, not a broader browser/assistive-technology claim. Clipboard success capture is instrumented at the browser boundary; monthly link payload/restoration and fallback are verified, without claiming an operating-system clipboard compatibility audit. Successive official-release acceptance remains separate. Restoration has not been exercised at this local checkpoint.
