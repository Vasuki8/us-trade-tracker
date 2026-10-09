# Coffee profile loading

Measured October 9, 2026. The loading change reduces the embedded browser payload while retaining the existing server-rendered profile, calculations and downloads. It uses dictionaries for months, descriptions and partner identities, with compact numeric observation rows inside a single JSON string. The browser reconstructs the canonical release once per island. Names that change between observations remain distinct. Reported zero, missing and suppressed amounts remain distinct; duty coverage and revision evidence are retained.

This is an internal page representation. Canonical release files, archive formats, source validation and private R2 storage are unchanged. Pages and chart data stay together on the static host; downloads still generate in the browser.

## Measurements

Both builds use the same retained version 2 Census release, `2026-08-5f3c2606-06a0-4c96-8fbc-a2332e0428ae`, retrieved at `2026-10-09T07:32:29.685Z`. Its prepared-file SHA-256 is `eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727`. It contains 9,577 merchandise observations and 1,887 duty observations. The baseline code is `d234a71c32f30d6a795483741245ce3ab31aa05f`.

| Local build measurement | Before | After |
| --- | ---: | ---: |
| Product HTML, uncompressed bytes | 5,906,861 | 279,613 |
| Embedded hydration attribute, bytes | 5,845,068 | 217,803 |
| Product HTML, gzip bytes | 211,606 | 79,716 |
| Product HTML, estimated Brotli quality 6 bytes | 105,336 | 74,846 |
| Complete build, uncompressed bytes | 6,185,520 | 560,230 |
| Build files | 7 | 7 |
| Compressed JavaScript and CSS loaded per visit, bytes | 82,214 | 82,778 |

The product HTML is **95.3% smaller before compression** and **62.3% smaller with gzip**. The small decoder increases compressed JavaScript by 564 bytes. Every normal build continues to report its file count, raw total size and largest file.

Five fresh Chromium contexts per variant and CPU setting were visited in alternating order on local Astro preview servers. A test-only React DevTools hook recorded the first root commit, then requested a direction change from Imports to Exports in the next task. A DOM observer recorded completion when the displayed merchandise measure changed to `ALL_VAL_MO`. Long tasks used PerformanceObserver, collected through the completed interaction and following animation frame. Viewport: 1280 × 1000. There was no network throttling. The browser ran on the development computer; these measurements do not establish deployed performance or real mobile-device timing.

| Median local timing | Before | After |
| --- | ---: | ---: |
| First React commit, normal CPU | 355.5 ms | 222.1 ms |
| First completed direction change, normal CPU | 404.4 ms | 270.8 ms |
| First React commit, simulated 4× slower CPU | 1,599.1 ms | 1,214.3 ms |
| First completed direction change, simulated 4× slower CPU | 1,887.7 ms | 1,493.1 ms |
| Total long-task time, normal CPU | 106 ms | 0 ms |
| Total long-task time, simulated 4× slower CPU | 983 ms | 648 ms |

Normal-CPU median time through the first completed direction change improved by **33.0%**; the simulated slower-CPU median improved by **20.9%**. All 20 visits retained 1,456 initial DOM elements, completed the direction change and produced no browser page errors. Compression and corrected timing evidence is retained locally in ignored `.tmp/loading-interaction-comparison.json`.

Independent review caught an incorrect boundary in the first timing report: removing Astro's server-rendered marker indicates hydration scheduling and can precede React's completed render. Those earlier scheduling timings and truncated long-task totals are superseded by the commit/interaction measurements above. The correction required no product-code change.

## Acceptance

- All 250 unit/component tests passed. Seventeen new transport tests cover both release versions, changing names and descriptions, observation ordering, missing/suppressed/zero values, coverage, classification and revision evidence, malformed transport rows, and exact calculations and CSV contents.
- Astro/TypeScript checks passed with no errors, warnings or hints. Fixture and retained-Census builds passed.
- All nine fixture browser cases passed, including direction/country/history controls, CSV and PNG downloads, missing data, mobile/keyboard behavior, PNG failure recovery and research without JavaScript.
- All five retained-Census browser cases passed. A direct before/after comparison matched the initial visible profile and byte-identical merchandise, changes and duty CSV downloads for world and selected-country views, both trade directions and both change-ranking measures. The other cases verified independently replayed duty records, tiny positive shares, mobile downloads and server-rendered research.

The normal local data pointer was separately advanced to this previously verified, acknowledged archive recovery. The legacy version 1 release and original pointer were retained under ignored local backup storage. Merchandise values did not change. No fresh Census request, remote archive promotion, deployment, public R2 delivery or schedule was required for this loading work. Public launch still requires the separate successive-official-release and deployment checks.
