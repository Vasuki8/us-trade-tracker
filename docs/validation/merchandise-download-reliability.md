# Merchandise download reliability

Prepared October 15, 2026. This record covers the existing roasted and green coffee merchandise downloads and their readiness controls. Local acceptance has passed; independent whole-branch review, GitHub CI, merge, publication and final preservation remain pending at this checkpoint.

## Behavior

`TradeChartDownload` owns the merchandise PNG lifecycle. It snapshots the SVG and filename at activation, prevents duplicate conversion, validates PNG output, and suppresses late success or failure after a material view change or unmount. The export identity includes product, title, reporting month, direction, ordered plotted series and provenance. Returning to an earlier selection does not revive an old job. Identical rerenders and unrelated comparison/ranking/search/hash state preserve a valid job and its current error.

The existing direction radios, history selector and merchandise PNG/CSV actions are disabled in initial HTML until saved selections restore. The noscript explanation includes those controls; default import data and tables remain readable. During PNG creation, its activating button uses `aria-disabled` plus the synchronous activation guard so it retains keyboard focus. Current CSV and independent duty/share actions remain usable. Current failures expose the existing scoped error and CSV fallback; retry is available.

The merchandise chart, shared PNG converter, CSV schema/filenames, statistical calculations, accepted releases, URL semantics, duty/share/Canada behavior and deployment templates are unchanged. This work adds no data, dependencies, source requests or R2 operations.

## Local evidence

The packaged source/runtime is `d68be022f45b04856cf30cd7cd5ae192a32b12d9`. Planning main was `63399fdae5b861bed643979af7609ec15fc811aa`. The authenticated predecessor is Production `366dd791-fb1d-4691-8b5c-d2ea63e104ba`, whose package source is `43de0762a4fd8b1c8e5627e55851406ad297ce3b`.

- Regression tests first reproduced obsolete PNG delivery and late errors after direction changes, missing initial disabled controls and keyboard focus loss. Final focused checks pass 55 unit and 19 browser tests.
- The full suite passes **1,450 unit tests in 110 files, 169 browser tests (147 ordinary, 10 private Canada preview, 12 pilot), and 24 Python packaging tests**. Type checks report zero errors, warnings and hints. Browser coverage includes no JavaScript, delayed hydration, restored first downloads and mobile keyboard use. The existing synthetic fixture registry uses 090121/090122; retained-data checks use actual 090121/090111.
- A fresh stage copies seven accepted state files, totaling 8,186,318 bytes, and verifies them before/after its real Census-mode snapshot build. Eleven protected identities, six legacy producers and nine additional chart/duty/share sources remain unchanged. Only `ProductExplorer.tsx` and the new `TradeChartDownload.tsx` change production source.
- Offline regeneration matches **112 existing CSVs plus the Canada projection** exactly. Six historical duty CSVs and 17 share CSVs retain their authenticated bindings. The inherited extra-28-case indirect historical producer binding remains disclosed; this is no new source-data audit.
- **24 merchandise cases** cover two products, Imports/Exports, 12/60-month windows and world/one/three-country selections. Their 24 CSVs contain 1,440 rows: 1,336 reported points including 128 true zeros, and 104 absent gaps. Every CSV field, SVG marker/path geometry, ordered legend, period, units and provenance agrees with pinned retained observations and predecessor output. Each case produces a valid nonblank 1,920 × 1,080 PNG.
- **Four coexistence cases** produce eight ancillary PNGs and six CSVs. Those CSVs match authenticated share/duty outputs and raw numerators, denominators, coverage and rolling arithmetic. Ancillary SVG semantics match an authenticated predecessor capture. PNG byte equality is informational, not a cross-platform requirement.
- The independent read-only capture verifier imports no application calculators and passes with zero failures. Candidate browser guards allow GET/HEAD only to manifest-listed paths on the owned origin, block service workers and record requests. No console/page errors or unexpected requests occurred. The original baseline captures had broader guards; supplementary independent raw/CSV/geometry checks and the strengthened predecessor capture address their acceptance gaps.
- Desktop, 320/375-pixel and static screenshots are preserved for both actual products. Root inspected representative merchandise/duty PNGs and mobile controls. Unchanged default/selected DOM element, table-row and plotted-point counts were verified in six views.

All 1,440 retained classification slots are verified with no boundary. Nonreported-status and classification-boundary behavior remains fixture evidence. Public acceptance will verify normal downloads, not claim local deferred-conversion injection ran on Production. Broader browser or assistive-technology execution is not claimed.

## Size and package gates

| Measure | Predecessor | Candidate |
| --- | ---: | ---: |
| Package entries | 31 | 31 |
| Total raw bytes | 1,873,448 | 1,874,543 |
| Client JavaScript raw / gzip bytes | 379,620 / 114,440 | 380,504 / 114,653 |
| CSS raw / gzip bytes | 21,963 / 4,510 | 21,963 / 4,510 |
| Roasted profile HTML raw / gzip bytes | 350,466 / 87,624 | 350,573 / 87,632 |
| Green profile HTML raw / gzip bytes | 294,325 / 69,830 | 294,431 / 69,842 |

The largest asset remains roasted profile HTML. The 1,095-byte raw increase consists of 884 JavaScript bytes, 213 profile HTML bytes and a net -2 across four other HTML files from generated Astro island identifier lengths. Hydrated profile markup adds 47 bytes for roasted and 46 for green coffee; element counts are unchanged. No loading-speed improvement is claimed. The candidate retains 222,609 bytes beneath the existing 2 MiB raw live-verification cap; no cap was raised. Existing 1,000-entry/25 MiB-asset packaging, 4 MiB ZIP, 1 MiB manifest and 128-check policies remain unchanged. The file-count planning alert remains 15,000.

Fresh site and withdrawal ZIPs pass create/readback and repeated-byte determinism. Site ZIP: 408,825 bytes, SHA256 `b260bc3aa5dc7eccc553fddd6da2ecec5abb488ca9879e71ec616ecff5c30222`. Manifest: 6,556 bytes, SHA256 `e2fde5e48e55e67bfd3442f390ff0ca3d446e936e716685f5d0540a15305fe43`.

Private evidence is staged for preservation at `data/backups/merchandise-download-reliability/deployment-20261015-r1`. Its final seal, actual publication, docs merge, native worktree archive and clean-main completion will be recorded after they happen. The preceding country-share-history evidence remains unchanged.
