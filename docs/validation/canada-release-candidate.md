# Offline Canada release candidate verification

Prepared October 12, 2026. This record covers the approved offline milestone under `canada-country-release-v1`, with source policy `canada-archive-snapshot-v1`. It authorizes no real country selection, accepted-state restoration, R2 operation or public publication.

## Candidate identity and footprint

| Field | Verified value |
| --- | --- |
| Release ID | `2026-08-2e27b39c-932b-4f3d-b2aa-3b11ca2a3cca` |
| Packaging commit | `603027e811b958f857d1ab612c74e44c3e217f75` |
| Preparation time | `2026-10-12T23:23:27.180Z` |
| Source-assessment commit | `9c385fb94b2a36b1d07ddf9e01670c366839a83b` |
| Package bytes, including final LF | 2,960,916 |
| Package SHA-256 | `337d25eeb94c87d9dbfdc4c9a21a20e7e50f416a6599cd0699f028eee0349818` |
| Members / decoded bytes | 11 / 2,218,749 |
| Generated projection bytes | 33,716 |
| Projection SHA-256 | `33c7db7ec421bddaa13e36c3b2e32cd4558aa041fe17f2f3da01285b62b08fd0` |

The private local candidate is `data/backups/canada-country-release/candidate-20261012-r2/candidate.json`. Its ten evidence bodies match the fixed size/hash table in the [implementation plan](../superpowers/plans/2026-10-12-canada-release-acceptance.md); the eleventh member is the generated projection. No raw ZIP, normalized source-row array or original classification document is packaged. Individual members fit 1 MiB; decoded content fits 6 MiB; the serialized package fits 8 MiB. The manifest, reports, proof and approval records have separate bounded contracts. The earlier r1 package remains immutable and unaccepted; r2 supersedes it because implementation review fixes changed the packaging runtime, while all eleven member bodies remain identical.

The immutable preparation report passes gates 1–5 and leaves recovery/review pending. Recovery has since been independently verified; the final complete eligibility report and trusted operator proof are assembled only after whole-branch review and final-head CI. Neither report selects a country release. Final integration evidence will be recorded on the associated PR and in the owned private candidate directory, without a further runtime/documentation commit.

## Portable recovery and independent calculations

Recovery ran in `data/backups/canada-country-release/portable-20261012-r2/`, an isolated root with all ten historical input locations absent. Observed filesystem opens comprised one input package and generated-output readbacks; there were zero other source opens. The package, projection and verified receipt were reproduced in its fresh nested country-backup output. No receipt-internal path was followed, no provider request or ZIP replay occurred, and no country pointer was created.

A separate Python checker used explicit fixed member hashes, independent integer sums and binary64 quotient comparisons, without importing production calculations. It verified:

- All 48 monthly values, corresponding original-source metadata and zero residuals.
- All 20 selected product summaries and their ordering, 40 matching period numerator/denominator pairs, 408 qualified monthly shares and 34 period shares.
- The 17 qualified growth/share-point comparisons and three statistical exclusions, with unavailable comparisons kept null.
- Both saved reference grids: 41 matches/seven mismatches. Original-publication checks: seven matches/41 unreviewed.
- Four generated CSVs byte-for-byte against the verified prototype, including all 68 data rows and unavailable comparison fields.
- The identical prototype projection and all 11 protected source/history/accepted-coffee identities before/after; the real country pointer remains absent.

| Direction | Sep 2024–Aug 2025 all-goods USD | Sep 2025–Aug 2026 all-goods USD |
| --- | ---:| ---:|
| Imports | 396,982,672,171 | 392,802,538,076 |
| Exports | 342,040,511,099 | 340,916,490,818 |

| Private receipt | Bytes | SHA-256 |
| --- | ---:| --- |
| `candidate-report.json` | 1,064 | `860dcf801c4c91ca084c0497b8154b0fbccf98c9e5202c93347b5dc03070598c` |
| `portability-check.json` | 1,190 | `e98f898d3b4b8d034a6f0cd9c4bb26aacdf48fc0cf5ef458baf0ee070a51afaf` |
| `independent-candidate-check.json` | 6,298 | `afd1d81db62ef19d66075e32293b11f6069556da411a7359bb6effa8e5c43d06` |

The original strict bulk report's 48 failed contexts retain null totals. Arithmetic is authenticated against the separately reviewed complete replay; context identity and pinned original bytes preserve that failed history. ZIP request binding uses unique request IDs because publication requests can share the same export-month context. The classification continuity record carries the complete original `with fixes` verdict object and its independently verified citation correction. Those source records were not edited to satisfy the new validator.

## Implementation and build checks

All 836 unit tests pass across 70 files. Astro/tool type checks cover 197 files with zero errors, warnings or hints. The ordinary build boundary browser check passes; all six existing Canada fixture browser checks pass. Selection/accepted-recovery writes ran only against isolated synthetic temporary state with a test-only authentication-boundary mock; production rejects fixture/unauthenticated candidates. Cases include stale baselines, held locks, changed/reparse inputs, interrupted writes, failed/uncertain rename, different or unreadable readback, and receipt failure after an acknowledged replacement.

One fresh independent whole-branch review examined `da51b6d5b25b269671e253cee6bfd09be13d812e`, reran 138 country-release tests, authenticated the real r1 package/protected identities and reported three Important findings, with no Critical or Minor issue. Root resolved all three in `603027e811b958f857d1ab612c74e44c3e217f75`: cleanup preserves established outcomes and primary errors; accepted recovery stages all outputs before atomic pointer visibility and reports an acknowledged but unreadable state explicitly; the exact selection receipt survives restoration and supports a second generation after original inputs are removed. Six regression cases failed before the fixes and then passed, with the full 836-test suite and clean type checks. The original review report and explicit fix dispositions remain part of the final proof; no second review or real acceptance operation occurred.

| Build | Files | Total uncompressed bytes | Largest file |
| --- | ---:| ---:| --- |
| Ordinary product fixtures | 21 | 507,881 | React client: 212,848 bytes |
| Isolated Canada/product fixtures | 22 | 565,708 | React client: 212,848 bytes |
| Ordinary accepted-product data, preview unset | 21 | 1,084,530 | `products/090121/index.html`: 283,166 bytes |

The ordinary accepted-product `dist` remains restored and contains no Canada preview route, retained processing identity, replay label or synthetic Canada observations. The existing retained local preview at `http://127.0.0.1:4404/preview/countries/1220/` returns HTTP 200 and retains its unaccepted qualification. Website routes, charts, browser-generated downloads, coffee releases and private R2 role are unchanged. Every build retains the 15,000-file planning alert.

## Later operational boundary

Eligible means the exact candidate passed all seven gates; it means no selection or public availability. The offline proof is an operator audit record of actual review/CI/checks, not independent authentication of GitHub or owner consent. A runtime change after packaging requires a newly prepared/verified candidate; only README and this validation record may differ under a recorded Git comparison.

Later local selection requires separate owner authorization for the exact candidate and eligibility-report digests, with explicit initialization or the expected prior pointer digest. Selection outcomes additionally bind the complete selected-pointer digest, including its approval-record identity, so accepted-state recovery cannot confuse two approval records for the same package. Recovery also requires a confirmed selection receipt and explicit authorization. No acceptance CLI, current country pointer, site consumer, deployment or storage activation is introduced by this milestone. The separate original private source collection remains necessary for any future raw-source re-verification or durable publication arrangement.
