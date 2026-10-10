# Multi-product release foundation

The approved foundation reuses the verified importer, private archive protocol and profile for reviewed products while keeping their identities and histories separate. Coffee (HS 090121) remains the sole real enabled product. HS 090122 appears only in explicit synthetic fixture mode; it is not accepted real coverage. No new provider calls, public deployment or scheduled processing were performed.

## Verified behavior

- A trusted registry controls import/publication availability, display names and duty acceptance. Unknown or unavailable selections fail before source/provider access. Each published product requires its own validated release; missing releases fail the build rather than disappearing or loading sample data.
- Coffee retains `data/processed`, `data/raw` and `trade/v1/products/090121/`. Other reviewed products use `data/products/<code>/` and `trade/v1/products/<code>/`. Local revisions and accepted remote pointers cannot cross products.
- Bundle versions 1 and 2 keep their envelopes, file grids and coffee serialization. Product identity is checked against keys, manifests, prepared data, source queries and predecessors even with recomputed hashes. Transport rejects keys outside the selected namespace.
- New run/candidate state uses version 2 with explicit identity. Legacy version 1 state is validated only as coffee and normalized. An initial run with no baseline rejects a different product before local candidate writes or remote PUTs.
- Restore, immutable upload/readback, successful backup, offline recovery and conditional promotion retain their ordering. Missing backup receipts and stale writes preserve acceptance. Lost responses and receipt failures retain established or unconfirmed outcome semantics.
- Recovery requires an empty generated-data destination. Wrong-product input fails before creating output. A coffee root containing `products/` is occupied and cannot be overwritten.
- Published version 2 duties require registry acceptance. Valid merchandise-only version 1 remains usable with duties unavailable. Fixtures visibly say **Development sample data**. Homepage, changes, briefing and methods release metadata remain coffee-specific.

## Checks and browser acceptance

Implementation code is recorded at `3552e01` after five focused commits. Every task used failing then passing regression tests. The complete suite passed **393/393 tests across 36 files**, with two local workers to reduce Windows disk contention. `npm run check` reported zero errors, warnings or hints across 98 files.

The explicit fixture build passed **31/31 browser cases**: both profiles, direction switching, saved country selections, product/value CSV metadata, CSV/PNG filenames, mobile overflow, keyboard controls and readable research without JavaScript. Coffee's original fixture values were retained. The separate Census build passed **6/6 retained-data browser cases** covering both directions for monthly and annual selected-country comparisons, chart records and monthly/rolling duty exports. Matching world denominators, exact source amounts, period labels and provenance were checked against retained observations. Retained-data acceptance reported no browser page errors or Census requests.

Acceptance used fresh ports 4342/4343, separate ignored output folders and `CI=true`. The installed Astro `--ignore-lock` option allowed foreground test servers beside existing previews; no server was replaced. Local evidence remains under ignored `.tmp/multi-product-*` and `test-results/`.

## Retained data and offline recovery

The canonical pointer remained `releases/2026-08-5f3c2606-06a0-4c96-8fbc-a2332e0428ae.json`, with prepared SHA256 `eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727`. August 2026 world imports were **$140,980,739** and exports **$66,393,173**. It contains 9,577 merchandise and 1,887 duty observations. Original pointer and release bytes were checked before and after acceptance.

Selected retained bundles were recovered through the product-aware offline command into fresh destinations. An independent inventory compared every decoded original against its declared length/hash and recovered bytes, plus the generated pointer; provider clients were forbidden.

| Format | Bundle SHA256 | Original files compared | Recovered files including pointer | Bundle bytes |
| --- | --- | --- | --- | --- |
| Version 1 | `0de1cb535caf370adaf3da556a9433d6ffd7967e31501d35b9f335c79230a844` | 241 | 242 | 4,653,013 |
| Version 2 | `44c03004da6a76b031cd70997491c97221ecc9c0289cf7f9b426e42208394adf` | 337 | 338 | 6,518,765 |

Version 1 prepared SHA256 was `79955703ac1acb78e60b8e7d5d6dab9f46e4c873defaddb50424aa6981d9ddb3`; version 2 matched the canonical checksum. Wrong-product recovery was rejected before output existed. These are retained JSON request/prepared records, not raw HTTP byte streams. This milestone validates offline compatibility; earlier live R2 acceptance remains in [archive evidence](../data-validation/090121-archive.md).

## Static hosting measurements

| Build | Files | Total raw bytes | Largest file | Coffee profile gzip bytes |
| --- | --- | --- | --- | --- |
| Previous monthly-comparison Census baseline | 11 | 687,195 | Coffee profile: 283,179 bytes | 80,396 |
| This Census coffee build | 11 | 687,309 | Coffee profile: 283,179 bytes | 80,396 |
| Two-product synthetic fixture build | 12 | 410,834 | Shared client: 212,848 bytes | Not a Census performance comparison |

The retained build grew **114 raw bytes**, entirely in the methods page's coffee-specific release wording. Profile raw/gzip bytes stayed identical. A second synthetic route adds one page and shares browser assets; its smaller dataset does not predict real product size. Every build still reports file count, raw total and largest file, with the 15,000-file planning alert. Chart data stays with static pages, browser downloads remain generated, and R2 stays private backup storage.

## Operator changes and remaining limits

Manual **Import Census data** accepts `product_code`, default `090121`, and derives paths from the trusted registry before exposing credentials. New artifact names are `census-<code>-release`, `census-<code>-candidate` and `census-<code>-promotion`. Artifact-only output contains only the selected current pointer, releases and raw records; coffee artifacts exclude `data/products/`.

Use `--product <code>` explicitly for archive pack/verify/recover and validation. Legacy commands default to coffee. CLI/environment selections must agree. A newly approved real product needs independent source/classification/duty evidence, a registry change and its own release. A real second product, discovery/search, cross-product rankings, successive official-month validation, public deployment and recurring processing remain separate work.

## Execution decisions

- Windows-native ledger bookkeeping replaced POSIX helper scripts. Manual bookkeeping can omit evidence; task commands, results and commit ranges were recorded.
- Two local workers replaced default parallelism after an existing file-heavy baseline test timed out. Isolated and controlled full runs passed without relaxing assertions or timeouts; the cost is longer local runs.
- Separate ignored browser configs used Astro's installed `--ignore-lock` option to preserve previews. Only startup differed from the normal config. Loader tests established failure before implementation; new browser cases were checked against the completed fixture build.

Independent whole-branch review and exact-head GitHub checks are required before integration. Their final result is recorded in the integration update.
