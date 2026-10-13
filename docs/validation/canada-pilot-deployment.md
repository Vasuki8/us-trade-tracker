# Canada historical-snapshot pilot preparation

Status: **prepared-for-owner-deployment-review**. Local Tasks 1–4 passed on October 13, 2026. Independent review and integration are Task 5; project creation, public upload and live checks remain gated Task 6. Nothing in this record claims publication.

The opt-in `CANADA_PILOT_MODE=snapshot` uses the existing authenticated selected reader. It presents Canada as a **24-month accepted historical snapshot**, September 2024–August 2026, and reports the original local acceptance time separately from capture times. It adds no observations or refresh promise. Imports remain general imports/customs value; exports remain domestic plus foreign exports/FAS value with the Canadian exchange qualification. All values remain nominal USD and not seasonally adjusted.

The Canada release remains `2026-08-2e27b39c-932b-4f3d-b2aa-3b11ca2a3cca`, accepted locally at `2026-10-12T23:46:54.013Z`. The projection remains 33,716 bytes with SHA-256 `33c7db7ec421bddaa13e36c3b2e32cd4558aa041fe17f2f3da01285b62b08fd0`; the pointer remains 466 bytes with SHA-256 `9ede6a6906b0da7f85e74203d186bee7f6a8e08e37f452fb9f5a99e88e10a399`.

Current/prior twelve-month totals remain imports $392,802,538,076/$396,982,672,171 and exports $340,916,490,818/$342,040,511,099. The 17 qualified comparisons and three statistical exclusions remain intact. The captured reference differences and historical failures remain visible and unchanged; immutable availability flags were not altered.

## Prepared artifacts

The authenticated export is source commit `2a7796df69629448678bca8885f842ca6ae8dceb`: 347 tracked Git blobs and exactly seven accepted-state files (three compact Canada files and the two coffee pointer/release pairs). Its existing dependency junction is shared locally and excluded from both upload packages. No raw archive, credential, private proof directory, preview route, Functions, worker executable or source map is included.

| Package | Entries | Uncompressed bytes | Largest entry | ZIP bytes | ZIP SHA-256 |
| --- | ---: | ---: | ---: | ---: | --- |
| Site | 24 | 1,184,475 | 283,215 | 315,733 | `7b074755b387dd9da212cc2a49ac3c9f5659107773f028e1551c22643e4fcb92` |
| Withdrawal | 3 | 1,179 | 571 | 1,075 | `af671ea2a9546b6ea76cfcd753c3286ca020cc4622c629d095fa2ae60a005932` |

Site manifest: 5,466 bytes, SHA-256 `5a8ab7cdb520162b4231ae82f309f7262278ac44ea7d7fc42489144ce5f0b9dd`. Withdrawal manifest: 1,530 bytes, SHA-256 `2745c57af61de02a702b26fda7b8d1dba4f2808895aa0448572aeae20639e371`. Each ZIP has exact root entries and authenticated decompressed payload readback. Counts include `_headers` and `404.html`; both satisfy the planned dashboard limits of 1,000 files and 26,214,400 bytes per asset. The 15,000-file planning alert remains clear.

The site adds the reviewed noindex/nofollow header rule and a standalone error page explicitly during preparation. The withdrawal package contains only the header and two standalone “Pilot temporarily unavailable” pages. Ordinary builds receive neither package's templates automatically. CSV/PNG downloads remain generated in the browser; R2 remains private and unchanged.

## Observed verification

- Relevant configuration/reader tests went from seven expected failures to 37 passes. Presentation tests went from four expected failures to 142 passing country tests. Type checking examined 227 files with zero diagnostics.
- The final full suite passed 1,014 tests across 81 files. All 70 existing browser tests passed (53 ordinary, ten private Canada, seven prepared-pilot). The ordinary fixture build remains 21 files/512,194 bytes and omits the Pages templates. The real snapshot build is 22 files/1,183,730 bytes before the two explicit templates.
- The private ZIP operator passed 13 probes, including changed/extra files, bad provider controls, wrapper/traversal/absolute/drive/backslash paths, duplicates/case collisions, ZIP symlinks, input/output junctions, occupied destinations, 1,001 entries and a file exceeding 25 MiB. On Windows, path and handle timestamp queries differed for one unchanged file. A failing regression established that comparison issue; the operator now compares each metadata domain before/after while retaining cross-domain file identity, exact length and payload hashes. A separate probe rejects a handle timestamp change during reading.
- Against the exact assembled package on strict localhost port 4422, independent arithmetic and baseline columns verified all 48 monthly values/chart labels, 20 ordered category summaries, 17 qualified/three excluded comparisons, all four actual Canada CSV downloads and fixed totals. New CSVs identify the historical snapshot and original accepted release/time, without a publication status/time.
- Six direction/viewport checks at 320/375/1120 pixels passed, with native keyboard disclosure, UTC acceptance display, no-JavaScript Imports and zero page errors or external browser requests. Home, Methods and navigation identify the bounded snapshot. Four private/missing paths returned the standalone 404 locally.
- Both staged real coffee profiles matched latest world imports/exports, latest world calculated duties/consumption values, and weighted rolling duty shares using matching sums. A valid Canada/12-month shared coffee view restored its filters; its actual sourced CSV matched stored observations and its 1920×1080 PNG retained chart/source provenance. Desktop/mobile screenshots and the PNG were visually inspected.
- All 24 old CSVs and six renderings remain byte-identical. All eleven protected files, selected projection/pointer and both coffee states remain unchanged.

The early operator and browser-proof failures were retained privately. They exposed a Windows metadata comparison and proof expectations for removed publication columns/coffee pointer paths; they did not justify changes to research values or production behavior.

## Limits and remaining decision

Localhost cannot establish Cloudflare's header handling, real HTTP error behavior, public hostname availability, deployment identity or serving state at canonical/older deployment URLs. Those checks remain mandatory after concrete authorization of the exact package and target. No Cloudflare project has been created or uploaded by this preparation. Public access differs from search indexing exclusion; a canonical withdrawal replacement may leave older deployment URLs accessible. Permanent project removal needs action-time confirmation.

Private evidence is preserved under `data/backups/canada-country-pilot/deployment-20261013-r1/`, with a sorted digest seal. It includes upload/withdrawal entries, manifests, ZIPs/readback receipts, source/data export, original baselines, operator/proof harnesses, screenshots/downloads and execution logs. Provider/account inspection and later review/integration receipts are supplemental private evidence rather than modifications to the original seal.
