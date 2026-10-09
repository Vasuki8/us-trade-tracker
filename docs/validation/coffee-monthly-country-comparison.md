# Coffee monthly country comparisons

Validated October 9, 2026. The approved bounded change adds **Latest month / Latest twelve months** to the selected-country summary, with annual comparisons remaining the default. The monthly choice compares the reporting month with the same month one year earlier. No data retrieval or canonical release changes were needed.

## Behavior and definitions

Both monthly amounts and their U.S. denominators refer to the same product, direction and calendar month. Monthly dollar change subtracts the prior matching month; growth divides that change by a positive prior amount. Each month's country share divides its amount by that month's positive official U.S. total. Share change is the difference in percentage points, with the existing integer cross-products retaining small changes accurately.

Missing or suppressed current/prior country observations remain unavailable. Reported zero is retained, but a zero prior amount has no growth percentage and a zero or unavailable U.S. total has no share. Incompatible or unverified classification continuity withholds dollar/growth/share changes while preserving individually reported monthly amounts and within-month shares. Missing months elsewhere in an annual period do not invalidate a complete monthly pair. Annual calculations and the annual country-change rankings retain their existing rules.

The period choice follows country selection, removal, direction changes and saved-link restoration. A direction change clears countries and retains the preferred comparison period for the next selection. Chart history, picker search and change-ranking controls do not alter this period. The summary's monthly view is memoized; picker searches remain local.

Saved monthly views use `comparison=monthly` alongside the existing direction/history/country parameters. Annual views omit this parameter, preserving older URL formats and the annual default. Explicit `comparison=annual` also resolves to that default. Unsupported or duplicate period parameters explain the same complete-selection fallback as other invalid filters. Browser back/forward and clipboard fallback restore or reproduce the period with the other filters.

The selected-country CSV adds `comparison_period` (`annual` or `monthly`) and includes exact current/prior U.S. denominators, periods, measures, units and provenance. Annual filenames retain their existing form; monthly files end in `-selected-countries-monthly.csv`. Other merchandise, duty and ranking CSV formats remain unchanged. Without JavaScript, the existing default imports view and saved-selection explanation remain readable.

## Verification

- Nineteen new calculation/link and component cases failed before implementation and then passed. They cover matching monthly denominators, order, unrelated annual gaps, missing/suppressed comparison months, zero baselines, zero/missing world denominators, classification incompatibility, exports, CSV periods/provenance, old/new/invalid links, period switching, selection/direction changes and history restoration. The full suite passed **342 tests across 29 files**.
- Code/type checks covered **87 files**, with zero errors, warnings or hints. Initial diagnostics identified four test-only uses of Playwright's `exact` option in Testing Library queries. Removing that unsupported option preserved Testing Library's default exact-name behavior; the focused component checks and final type check passed. Whitespace checks passed.
- All **28 fixture browser cases** passed. Three new flows exercise monthly display and CSV against literal fixture values, a valid monthly pair for Canada's incomplete annual history, identical chart/duty/ranking CSVs when switching periods, copied links and reload, chart/search/ranking independence, export direction, mobile keyboard selection/scrolling/download, back/forward restoration, invalid-period fallback and clipboard fallback. The existing no-JavaScript annual-summary case now includes a monthly saved URL.
- Independent retained-source calculations matched the application view for **all 105 import and 121 export partners**, checking current/prior amounts, dollar changes, growth, each matching monthly U.S. share and share change, including unavailable values. **76 import and 77 export partners** have both months reported; other partners remain present with unavailable comparisons. These pair counts do not imply that a zero prior amount can support percentage growth.
- Two retained-Census browser cases verify Italy and Canada in both directions: exact source amounts and monthly world denominators, full-precision CSV calculations and provenance, all displayed comparison cells, annual/monthly switching, identical chart CSVs during switching, history/search stability and reload. No browser page errors or Census API requests occurred. Desktop and 375-pixel mobile screenshots were inspected.

The monthly comparison is **August 2026 versus August 2025**:

| Direction | Country | Aug 2026 USD | Aug 2025 USD | Dollar change | Growth | Current U.S. share | Previous U.S. share | Share change |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Imports | Italy (4759) | 28,647,855 | 13,290,918 | +15,356,937 | +115.5% | 20.3% | 8.6% | +11.7 pp |
| Imports | Canada (1220) | 33,155,513 | 26,154,227 | +7,001,286 | +26.8% | 23.5% | 16.9% | +6.6 pp |
| Exports | Italy (4759) | 44,787 | 88,394 | −43,607 | −49.3% | 0.1% | 0.1% | −0.067 pp |
| Exports | Canada (1220) | 36,480,679 | 36,622,181 | −141,502 | −0.4% | 54.9% | 55.6% | −0.6 pp |

Official current/prior monthly U.S. denominators are **140,980,739 / 154,404,658 USD** for imports and **66,393,173 / 65,926,363 USD** for exports. CSV values retain full precision; small nonzero share changes retain significant digits in the display.

The accepted prepared source and current pointer bytes are unchanged: SHA-256 `eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727`; pointer `releases/2026-08-5f3c2606-06a0-4c96-8fbc-a2332e0428ae.json`; retrieved `2026-10-09T07:32:29.685Z`; processing version `7f76e7c6f0fb1168906956ef8517095a5e49e103`.

The retained-Census build contains **11 files**, **687,195 uncompressed bytes**, and a largest file of **283,179 bytes**, the coffee profile. Profile gzip size is **80,396 bytes**. Output grew **3,788 bytes** from the annual-summary milestone without adding static files. These are local byte measurements, not deployed performance timings.

Isolated builds, independent source/browser checks and evidence remain under ignored `.tmp/monthly-comparison-*`; screenshots are under ignored `test-results/monthly-comparison-visual/` and `test-results/monthly-comparison-live-visual/`. Pages and chart data remain on the same static host, downloads generate in the browser, and R2 stays private backup storage. Public deployment and validation across two successive official reporting months remain separate work.
