# Coffee Monthly changes page

Validated October 9, 2026. The approved standalone page is `/changes/`, linked from the homepage and main navigation. Pilot coverage is explicitly roasted coffee, HS 090121. Visitors choose Imports or Exports and rank up to ten country increases and decreases by dollar change or country-share change in percentage points. The reporting month and both rolling twelve-month periods are visible. A link opens the full product profile.

The page reuses the verified comparison calculations, ranking table and browser CSV exporter. Only precomputed comparison views are embedded for the interactive controls; full merchandise and duty histories are not sent to this page. The existing profile retains its chart-selection independence explanation, while the standalone page omits that irrelevant sentence. The ranking choice is retained when switching trade direction.

Incomplete or classification-incompatible periods remain unavailable. A zero prior value has no growth percentage. Country shares use the official world merchandise total for the same direction and period: `GEN_VAL_MO` for imports and `ALL_VAL_MO` for exports. These denominators are separate from consumption value used by estimated duties. The page compares rolling annual periods, rather than claiming to show month-to-month movements or a ranking across all products.

## Retained Census evidence

The page uses the accepted version 2 release `2026-08-5f3c2606-06a0-4c96-8fbc-a2332e0428ae`, retrieved at `2026-10-09T07:32:29.685Z`. Prepared-file SHA-256: `eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727`. It retains 9,577 merchandise observations and the separately verified duty history.

Independent sums from retained merchandise observations reproduced both annual periods, all country comparison values and all four rankings. The current period is September 2025–August 2026; the previous period is September 2024–August 2025.

| Direction | Current world value, USD | Previous world value, USD | Change, USD | Countries checked | Unavailable comparisons |
| --- | ---: | ---: | ---: | ---: | ---: |
| Imports | 1,692,814,074 | 2,207,669,569 | -514,855,495 | 105 | 65 |
| Exports | 804,440,300 | 811,100,933 | -6,660,633 | 121 | 79 |

Absent country months remain unavailable. The country universe includes partners observed during the retained history, so a country need not have all 24 comparison months. The page shows the number excluded. Independent evidence is retained in ignored `.tmp/monthly-changes-evidence.json`.

## Acceptance and size

- All 254 unit/component tests passed. Four new UI cases cover provenance, direction and ranking state, unavailable classification periods and fixture/Census labels.
- Astro/TypeScript checks passed across 69 files with no errors, warnings or hints.
- All twelve fixture browser cases passed, including three new standalone cases. They compare the page's tables and CSV downloads directly with the profile, exercise navigation and mobile keyboard controls, and check server-rendered research without JavaScript. Existing chart, country, history, PNG and duty checks remain green.
- Three retained-Census browser cases passed. All four displayed rankings and CSV downloads match the independent sums and country checks; mobile scrolling preserves country identity; reporting/source labels and the initial comparison remain readable without JavaScript. No browser page errors occurred in the four-download check.

The real-data build has **10 files**, **658,679 uncompressed bytes (0.63 MiB)**, and a largest file of **279,660 bytes**, the coffee profile. The new changes page is **96,195 uncompressed bytes**, with **16,174 gzip bytes** and an estimated **13,860 Brotli quality 6 bytes**. These compressed sizes are local file estimates; deployed performance is unmeasured. The profile hydration attribute remains 217,803 bytes, preserving the previous loading improvement. Every build continues to report file count, total size and largest file.

Browser evidence is retained under ignored `test-results/monthly-changes-live/` and `test-results/monthly-changes-visual/`; size evidence is in `.tmp/monthly-page-sizes.json`. Pages and data stay on the same static host, CSV downloads generate in the browser, and R2 remains private archive storage. No Census retrieval, data promotion, deployment or automatic schedule was added. Cross-product discovery and growth rankings remain later work.
