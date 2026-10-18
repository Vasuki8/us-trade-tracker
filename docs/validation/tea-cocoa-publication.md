# Tea and cocoa archive acceptance and publication

Verified October 18, 2026. [Tea (HS 090240)](https://us-trade-tracker.pages.dev/products/090240/) and [cocoa beans (HS 180100)](https://us-trade-tracker.pages.dev/products/180100/) join roasted and green coffee in the existing research views. All four products end in **August 2026**. Merchandise history covers September 2021–August 2026; estimated duties cover September 2024–August 2026. Reported partner countries are included; missing observations remain unavailable.

## Archive acceptance

The [tea](../data-validation/090240.md) and [cocoa](../data-validation/180100.md) records bind the original retained sources, genuine two-file backups, acknowledged conditional promotion and fresh independent accepted-reference readback. All **676 original files** and both local pointers match exactly. The [acceptance evidence](../data-validation/tea-cocoa-archive-acceptance-20261018-evidence.json) keeps source ZIP, backup ZIP, bundle, release and pointer hashes distinct. Earlier source-ready and failed-audit records remain unchanged.

Six successful manual jobs used no replacement and made **zero new Census requests**. Four PUT attempts and 16 ArchiveStore calls were reserved; these are application-operation bounds, not wire-request counts. New storage reservation was 6,117,443 bytes, within the 8 MiB cap. Preflight showed 7.98 GB in the private Standard bucket; projected total stayed below 100 GB and estimated incremental batch cost was $0, below the $5 cap. This is an estimate, not a bill. No paid upgrade or public R2 delivery was introduced.

Tea retains 10 qualified duty observations and $205,406 in national RP79 affected dutiable value; cocoa retains 28 and $5,318,804 in RP70/79 affected value over 24 months. Estimated-duty shares use matching imports for consumption. Qualifications remain visible; reported zero does not establish duty-free treatment or amounts actually paid.

## Local and independent checks

Local acceptance passed **1,764 tests**, clean type checks across 326 files, 24 packaging controls and the existing Chromium/Canada/WebKit suites. Linux CI passed 1,763 tests with its existing Windows-only test skipped; all 18 workflow controls and 197 Chromium, 11 Canada preview, 12 Canada pilot and 78 Firefox/WebKit checks passed. No skip, retry, timeout or package limit was added.

Independent calculations matched **309 CSVs / 7,811 rows / 228,301 cells**, including all 30 portfolio selections and their 60 CSVs. USD, statuses and ordering were exact; percentage tolerance was absolute 1e-9 / relative 1e-12. Real-data browser checks covered 22 routes, 44 profile views, 32 ranking views, all portfolio selections, 196 CSV/PNG downloads, 12 chart PNGs, six static journeys and eight A4/Letter PDFs (48 rendered pages). Embedded/standalone rankings and original coffee/Canada tables, source URLs and selected CSV data matched.

A historical coffee fixture assumption was corrected. An unchanged Windows directory-rename test encountered EPERM, then passed both its focused check and the complete suite. Private browser comparison failures were preserved and resolved by waiting for Canada saved-view readiness and explicitly allowing the previously reviewed `coffee-portfolio-` to `product-portfolio-` filename change; CSV data bytes remained identical. Tiny positive portfolio duty shares now show `<0.001%`, preserving zero, unavailable values and CSV precision.

Whole-change and visual reviews found no material production defect. Existing Letter portfolios can continue source or current/prior blocks onto the next page; labels, periods, sources and reading order remain recoverable. This pagination limitation is retained rather than expanding the print design.

## Verified public package

[PR #129](https://github.com/Vasuki8/us-trade-tracker/pull/129) supplied the reviewed archive workflow. [PR #130](https://github.com/Vasuki8/us-trade-tracker/pull/130) activated the accepted datasets after [PR CI](https://github.com/Vasuki8/us-trade-tracker/actions/runs/39134988429) and [push CI](https://github.com/Vasuki8/us-trade-tracker/actions/runs/39134970514) passed at `683aae40452f6440efc3d19b1aaa901559f2c8b5`. The uploaded package binds merge `a5d6e98ee29182790a7d564dd1ba0ba3c78ca44c` and source tree `b39d18aab1cb8e9410d6b6d0facb732dbff00787`.

The exact merged rebuild changed only generated island identifiers and two visible schedule-prepared timestamps. Data, serialized props and application assets matched. All 22 routes, eight saved views and all 30 portfolio selections/60 CSVs were checked again against the merged package before upload.

| Identity | Observed value |
| --- | --- |
| Files / raw bytes / largest asset | 39 / 2,817,915 / 352,232 bytes |
| Site ZIP | 570,275 bytes · `e78055997befb0fda0ed9b61a153aaa1a004b84e9fb7fda68eeff452ab9920b1` |
| Manifest | 8,442 bytes · `9f1053283b99e536db3f1195d6a5ca6c96a4543008dd744c92036f05d0e9e088` |
| Production deployment | `86671177-3725-4c05-a83c-a95b68da5d08` |
| Public origins | [Canonical site](https://us-trade-tracker.pages.dev/) · [Observed deployment](https://86671177.us-trade-tracker.pages.dev/) |

Cloudflare confirmed one upload to the existing **Free** project, Production `main`. Both origins passed **84/84** exact payload/header/private-404 checks with **130 HTTP attempts**. Public browser checks passed 22 routes, nine saved views, four static/mobile/keyboard/print journeys and 14 downloads within 35 navigations. No page error or unexpected external request occurred. Restoration was unnecessary; the exact verified `939c5821` predecessor remained available. Two of seven verifier runs and one of two expanded uploads were used.

The [machine-readable publication evidence](tea-cocoa-publication-evidence.json) records the identities and limits. Pages and chart data remain on the same static host, with browser-generated downloads and private R2 preservation. Canada remains its fixed September 2024–August 2026 snapshot. No new product beyond these two, country profile, later-month import, recurring job, access or indexing change is included. Successful refresh across successive official releases remains an open gate. Final evidence integration, native worktree archival and proof sealing are recorded separately after this evidence commit.
