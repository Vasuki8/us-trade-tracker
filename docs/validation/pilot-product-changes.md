# Pilot product changes acceptance

October 10, 2026. Baseline: `42282b91d5b52c7585c65f75153774bdf8f23b3c`.

## Scope and behavior

The launch brief calls for ranking product changes by dollars or percentage growth, separately for imports and exports, over the latest rolling twelve months versus the preceding twelve months. `/changes/products/` implements that part of the existing Monthly changes feature for the reviewed, published pilot products. The existing per-product country rankings remain available, with a static link to the new comparison.

The page shows up to ten increases and ten decreases, current/prior official U.S. product totals, dollar changes and percentage growth. Growth rankings require **at least $10 million in the preceding twelve months**, including the exact boundary. The page and methods identify this as an initial editorial threshold. Dollar rankings can include a reported zero baseline, with growth unavailable. Exact integer fraction comparisons preserve growth ordering; ties use product name, then HS code. Unchanged products are counted separately.

All products must use the same comparison periods. The comparison reporting month is the newest published release month. Older releases are excluded and named with their own reporting month; their totals are not mixed into the target periods. Incomplete or classification-unverified comparisons are also excluded and explained. Below-threshold growth products are named separately. Product coverage is stated explicitly: current Census mode contains the two accepted coffee profiles, while fixture mode contains two labeled synthetic profiles. These are pilot rankings, not nationwide catalog rankings or evidence of profitability.

Profile links retain the product and selected direction and open a twelve-month view. Imports remain general import customs value (`GEN_VAL_MO`); exports remain total export value (`ALL_VAL_MO`). The feature reuses the existing annual comparison calculation and never combines product totals into a national headline or ranks duty measures. Its browser payload contains calculated product comparisons and provenance, without full merchandise or duty histories.

The CSV is generated in the browser and reproduces the displayed ranking for the selected direction and measure. It records each product's identity, current/prior totals, changes, both common periods, merchandise measure, units, applied growth threshold, coverage/exclusion counts, source, retrieval date, processing version, revision flag and retained source URLs. Missing growth is blank; the download is disabled when there are no displayed moves. Shared CSV escaping remains in use.

Default import/dollar tables, source information and profile links work without JavaScript. A visible no-JavaScript notice explains that changing direction/ranking and downloading requires JavaScript. The page is reachable from both product-specific Monthly changes pages and the default coffee changes page. It adds no intake, new official month, data pipeline/archive operation, hosting service, schedule or public deployment.

## Independent retained-data checks

The actual Census browser checks downloaded all four direction/ranking combinations and compared every displayed CSV record with independent `BigInt` sums of twelve retained, reported world observations per period. They checked source/product identity, measure, periods, threshold, movement, rank, retrieval date, processing version, coverage counts, displayed totals and matching profile URL. Both accepted canonical pointer/release pairs retained their recorded SHA-256 hashes.

Current period: **September 2025–August 2026**. Previous period: **September 2024–August 2025**.

| Product and direction | Current USD | Previous USD | Change USD | Displayed growth |
| --- | ---: | ---: | ---: | ---: |
| Roasted coffee imports | 1,692,814,074 | 2,207,669,569 | -514,855,495 | -23.3% |
| Green coffee imports | 9,226,121,808 | 9,142,281,740 | +83,840,068 | +0.9% |
| Roasted coffee exports | 804,440,300 | 811,100,933 | -6,660,633 | -0.8% |
| Green coffee exports | 261,173,713 | 257,686,581 | +3,487,132 | +1.4% |

All four prior totals exceed the growth threshold. The current real pilot consequently has green coffee as its increase and roasted coffee as its decrease in both directions and ranking measures. This is a description of the two reviewed products, not a claim about all traded products. Raw CSV growth retains calculation precision; displayed growth rounds to one decimal place.

## Verification

- **430 tests in 42 files passed**, including nine calculation/CSV cases and three UI cases. Cases cover direction-specific world values, threshold boundaries, zero baseline, exact growth ordering/ties, missing/suppressed months, classification breaks, mismatched reporting months, top-ten limits, invalid identities/metrics, sourced CSV and controls/explanations.
- **118-file Astro/TypeScript checks passed with zero errors, warnings or hints**.
- **45 fixture browser cases passed**, including three new product-change cases for directions, rankings, empty growth results, CSV contents/filename, profile identity, no JavaScript, keyboard controls/download and mobile table scrolling without page overflow.
- **Three retained-Census browser cases passed**, covering every direction/ranking CSV, actual mobile controls/growth download/profile link, and actual mobile import research/navigation without JavaScript. The CSV verification case made no Census request and produced no browser error. Desktop and mobile screenshots were inspected.

The initial calculation and UI cases failed against unimplemented behavior; the initial browser cases failed because the comparison link/page was absent. During verification, the no-JavaScript test was corrected to inspect its actual paragraph rather than the enclosing `noscript` element. A test-only unsupported locator option was corrected before clean type checking. One initial full browser run lost a trace file when two suites shared an output directory; separate output directories and the full passing rerun resolved that verification collision. No product logic was changed to conceal those failures.

## Build measurements and retained evidence

The actual Census build contains **18 files and 1,057,424 uncompressed bytes (1.01 MiB)**, compared with fifteen files and 1,030,256 bytes at the preceding milestone. The increase is **three files and 27,168 bytes**. The new product-change HTML is **16,340 bytes**; its component bundle is **7,004 bytes**. The largest file remains `products/090121/index.html`, **283,172 bytes**. Pages/data stay on the static host, downloads stay browser-generated, and private R2 retains its existing backup role.

Ignored local evidence includes `.tmp/pilot-product-changes-{tests,check,e2e,census-build,live-browser}.log`, `.tmp/pilot-product-changes-live.spec.ts`, its configuration and JSON results, and `.tmp/pilot-product-changes-visual/{desktop,mobile}.png`. The committed regression cases are in `tests/trade/product-changes.test.ts`, `tests/ui/ProductChanges.test.tsx` and `tests/e2e/pilot-product-changes.spec.ts`.

Independent review and required exact-head GitHub checks must pass before merge under the owner's standing authorization. Broader product intake, country-wide profiles, successive-official-release acceptance and public deployment retain their separate status.
