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

## Hosted baseline — October 13, 2026

After the [verified public pilot deployment](canada-pilot-deployment.md#observed-public-pilot), the two hosted coffee profiles were measured at `https://us-trade-tracker.pages.dev`. This completes the previously deferred deployed measurement, without changing product code, hosted assets, accepted data or provider settings. The successful second official-release update remains a separate gate.

Five fresh Chromium contexts per product and CPU rate were visited in alternating product order, for **20 visits**. The existing test-only React commit hook requested Imports → Exports in the next task; completion required both `ALL_VAL_MO` and the rendered “Total exports” definition. Timings start at navigation; switch latency is separately measured from the requested click to its completed DOM update. Long-task observation continued through completion and the following animation frame. Viewport was 1280 × 1000, with normal CPU and simulated 4× slower CPU, and no network throttling.

Origin-only request interception kept the probe bounded and disabled the browser HTTP cache. CDN, DNS and connection state outside each fresh context were not reset. These are measurements on the development computer, with instrumented headless Chromium—not physical mobile-device measurements or real-user field data. The current published artifact includes later features; its timings are not a before/after comparison with the October 9 local build.

| Product | CPU | Median first React commit | Median navigation through completed switch | Median switch latency | Median total observed long-task time |
| --- | --- | ---: | ---: | ---: | ---: |
| Roasted coffee, 090121 | Normal | 681.3 ms | 728.5 ms | 47.0 ms | 0 ms |
| Green coffee, 090111 | Normal | 586.8 ms | 624.6 ms | 38.2 ms | 0 ms |
| Roasted coffee, 090121 | Simulated 4× slower | 1,467.0 ms | 1,714.5 ms | 246.5 ms | 455 ms |
| Green coffee, 090111 | Simulated 4× slower | 1,197.2 ms | 1,403.7 ms | 203.0 ms | 421 ms |

Median encoded HTML body sizes were 77,976 bytes for roasted coffee and 59,625 bytes for green coffee. Decoded HTML sizes were 283,215 and 227,142 bytes. Every response matched its published length/SHA-256 in the authenticated 24-entry manifest from source commit `2a7796df69629448678bca8885f842ca6ae8dceb`. All 20 visits completed Exports, with zero page errors and zero blocked external requests. These measurements describe HTML/body transfer and the recorded JavaScript/CSS resources, not a complete network-byte billing measurement.

The first attempt used the wrong completion text (“Domestic + foreign exports”) and timed out. A single diagnostic confirmed a successful React commit/export switch, the actual “Total exports” text and no website errors. That failed attempt and root-cause evidence remain in `data/backups/hosted-profile-loading/20261013-r1/`; the corrected runs and exact measurement harness are preserved separately in `20261013-r2/`. No failed timing is included in the medians.

This small baseline shows prompt switches under the tested normal-CPU conditions and more main-thread work under simulated slowdown. It does not establish a broad performance budget or justify a new optimization on its own. Keep the existing representation and use representative task/device evidence before choosing another loading change.
