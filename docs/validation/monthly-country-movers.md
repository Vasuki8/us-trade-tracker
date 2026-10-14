# Monthly country movers verification

Verified October 14, 2026. This batch adds latest-month discovery to the existing coffee research flow and prepares the fixed pilot locally. Publication, new source intake and R2 operations are outside this batch.

## Behavior and compatibility

Both accepted coffee products support imports/exports, rolling twelve months or the latest month against the same month one year earlier, and dollar/share rankings. August 2026 monthly comparisons use August 2025; rolling comparisons use September 2025–August 2026 against September 2024–August 2025. Shares use the official merchandise world totals, GEN_VAL_MO for imports and ALL_VAL_MO for exports. Existing integer cross-product ordering, tie rules and unavailable classifications/observations remain authoritative.

Country links append period=monthly only for monthly selections. Omitted or explicit rolling retains the legacy canonical direction/metric URL. Unsupported, duplicate or oversized queries explain the imports/rolling/dollars fallback. Product-change sharing stays in its original hook mode. Initial static HTML displays that rolling default and disables country direction, period, ranking, copy and CSV controls until hydration.

Monthly country drilldowns preserve the product, direction, twelve-month history and selected country, adding comparison=monthly and #selected-comparison-heading. The profile's broad What changed ranking remains annual; the fragment targets the matching selected-country monthly table. Monthly imports link to the existing duty movers page with period=monthly and its share-ranking default. Exports have no duty handoff.

Explicit monthly downloads use hs-<code>-<direction>-changes-monthly-<metric>.csv and append comparison_period=monthly. Dates, values, growth, shares, source, units and qualifications remain present. Default serializer calls, including older monthly callers, retain exact bytes.

## Checks

New tests first failed on absent period state, controls, handoffs and metadata. A browser case also failed against an isolated export/build of pre-feature source 6a74b7985da6d0668f6cd4b5560fdc975fe07859 because its monthly control was absent.

The completed checks passed:

- 1,163/1,163 unit tests across 94 files, with two workers and the existing Python executable.
- Astro/TypeScript diagnostics: zero errors, warnings or hints.
- 101 browser cases: 61 existing application cases, 23 new country mover cases, ten Canada preview cases and seven Canada pilot cases.
- 24/24 standalone Python packaging tests.

An initial concurrent final check exceeded the existing integration test's five-second timeout. The same test passed in isolation and the complete suite passed after the other heavy checks finished; no timeout or runtime code was changed. Four initial rolling browser expectations were corrected: the served fixture contains a missing Canada observation in July 2024, so its rolling ranking excludes Canada and leads with Italy. Monthly matching December observations remain eligible.

Reproduce fixture checks in PowerShell using Node 24 and existing locked dependencies:

```powershell
$env:SITE_PACKAGE_PYTHON = '<existing Python 3.12+ executable>'
npm test -- --maxWorkers=2
npm run check
$env:TRADE_DATA_MODE = 'fixture'
Remove-Item Env:CANADA_PILOT_MODE,Env:CANADA_PREVIEW_MODE,Env:CANADA_ACCEPTED_PREVIEW_MODE -ErrorAction SilentlyContinue
npm run build
npm run test:e2e
& $env:SITE_PACKAGE_PYTHON -m unittest discover -s tests/packaging -p 'test_*.py'
```

Use unused loopback ports through the existing PLAYWRIGHT_PORT, PLAYWRIGHT_CANADA_PORT and PLAYWRIGHT_CANADA_PILOT_PORT settings, with CI=true to prevent ordinary preview-server reuse. Fixture CI needs no private accepted data.

## Retained-data rehearsal

Rehearsed committed runtime source: 5a822c2568f76dc54542717b959bbc5af2cffa36. Later browser assertion and documentation edits leave src/, scripts/ and deployment/ unchanged from this source.

Before feature edits, source f13a1decc8c6b56f13cadf157f9529e01a736282 preserved 84 default CSV outputs and the original identities; that setup commit changes only the approved plan from the pre-feature baseline. All 84 outputs matched those original bytes after replay using the staged accepted data and updated default serializers. Four fixture golden hashes independently pin default monthly/rolling CSV compatibility.

The tracked [preparation recipe](../../README.md#local-site-preparation) exported clean committed source and authenticated exactly seven existing accepted state files, 8,186,318 bytes. Pre-build readback, an explicit Census/snapshot build, post-build readback, assembly and Python ZIP create/verify all passed. Eleven contract-protected original identities and all seven accepted original identities remained unchanged. No raw source archive was read or copied.

An exclusive loopback server served only the assembled site. Browser requests outside that origin were blocked. All sixteen actual product/direction/period/metric selections passed against independent retained-observation monthly lookups and twelve-month sums, exact integer share numerators, ordering/signs/exclusions and all displayed/downloaded rows. All sixteen downloads were eligible and checked for dates, ranks, amounts, growth, shares, provenance, units and period-specific handoffs. Green coffee monthly exports demonstrate the distinction: Canada falls $2,028,322 in value while ranking first among share increases.

Canada rechecks preserved all 48 monthly values, 20 category summaries, 17 eligible and three unavailable comparisons, revision explanations, fixed acceptance time, four sourced Canada CSVs, small-screen/keyboard/static defaults and historical-snapshot qualifications. Existing coffee totals, duties, selected-country CSV and chart PNG checks also passed. The rehearsal is not a new Census source audit.

Desktop and 320/375-pixel monthly screenshots were inspected. Controls wrap within the viewport; ranking tables retain keyboard-accessible scrolling. Saved query pages without JavaScript explain the static rolling default. No browser errors or external requests occurred.

## Measured build and packages

The explicit fixture build contains 27 files and 663,151 uncompressed bytes, compared with 651,515 bytes for the isolated pre-feature fixture build: 11,636 additional bytes. Its largest asset remains 212,848 bytes.

| Local package | Entries including controls | Raw bytes | ZIP bytes | ZIP SHA-256 |
| --- | ---: | ---: | ---: | --- |
| Site | 30 | 1,690,025 | 385,151 | 0f3ebebec1a18f7939b054e74fada2e784facc94e43f92fc9d2b20bccd4b99a9 |
| Withdrawal | 3 | 1,179 | 1,075 | af671ea2a9546b6ea76cfcd753c3286ca020cc4622c629d095fa2ae60a005932 |

The site manifest SHA-256 is cdee04449100b9a7a779d1a80de9772387e2f75dcc2967ac6c62aed1686151f7. Largest entry: products/090121/index.html, 283,300 bytes. Both packages satisfy the 1,000-entry/25-MiB asset limits and remain below the 15,000-file planning alert. Repeated ZIP creation from each identical tree/manifest produced identical hashes.

Against the previous retained preparation, total served bytes grow 155,931. Roasted changes HTML grows 100,007 → 181,865 bytes; its decoded calculated-view JSON grows 50,480 → 101,071 bytes. Green changes HTML grows 91,163 → 163,728 bytes; its view JSON grows 44,014 → 87,817 bytes. These are four calculated views, with no observation history or extra requests. Ordinary pages/data stay on the static host and downloads remain browser-generated.

Other explained differences are changed/repartitioned JavaScript chunks and their references, generated Astro island IDs, two shared saved-link hydration comment separators on the product changes page, and the Methods preparation timestamp. Eleven served paths are byte-identical; six additional HTML pages match after normalizing island IDs and bundle references. Templates and the withdrawal ZIP remain identical.

Private baselines, retained inputs, receipts, downloads, screenshots, scripts and logs are preserved under the primary checkout's ignored .tmp/monthly-country-movers-validation-20261014-r1 directory at closeout. Review, exact-head CI and merge evidence follow in the integration record. No public site was uploaded by this batch.
