# Coffee selected country comparison

Validated October 9, 2026. The approved change adds an annual summary for up to three selected countries and labels the existing national headline cards **U.S. total**. It reuses the verified country-change view rather than introducing another calculation or data format.

## Behavior

The summary follows the profile's country selection and Imports/Exports choice, preserving selection order. It shows current and prior annual values, dollar change, growth, each period's U.S. share and share change in percentage points. Both rolling periods are explicit. The chart history window, picker search and ranking choice do not alter these annual figures. Removing a country updates the summary and CSV; clearing the selection hides the summary. A direction change clears countries through the existing profile behavior.

Shares use the official U.S. total for the same product, direction and annual period. Incomplete periods remain unavailable, while any individually verified amount remains visible. Comparisons across incompatible classifications stay unavailable. A zero prior amount has no growth percentage; a zero or missing U.S. denominator has no country share. An unchanged selected country remains in the summary even when excluded from a change ranking.

The CSV includes one row per selected country, both U.S. denominators, periods, measure, units, source URLs, retrieval date, processing version, revision state and classification comparability. Null figures are blank and reported zeros are retained. Existing spreadsheet text protection and quoting apply. Downloads continue to generate in the browser; no stored file is added per selection.

Without JavaScript, national figures remain explicitly labeled and the existing explanation describes the default imports view. Saved selections and the selected-country summary appear after JavaScript restores the profile filters.

## Verification

- Nineteen new calculation/CSV and component cases failed for the missing behavior before implementation and then passed. They cover order, unknown/world/duplicate/excess selections, unchanged countries, missing history, incompatible classifications, zero prior values, provenance, CSV quoting and spreadsheet text protection, annual stability, removal and direction changes. The complete code suite passed **323 tests across 27 files**.
- Code/type checks covered **84 files**, with zero errors, warnings or hints. Patch whitespace checks passed.
- All **25 fixture browser cases** passed across the initial run and the targeted rerun. Three new flows check literal annual amounts, missing-country retention, CSV metadata, chart/search/ranking stability, copied links and reload, removal/direction changes, horizontal keyboard scrolling, keyboard download, mobile overflow and the no-JavaScript view. The new mobile test initially used `End`, which did not change horizontal scroll position in Chromium; replacing it with the existing tables' supported right-arrow navigation made the focused case pass. No application change was needed for that test correction.
- Two retained-Census browser cases independently sum twelve distinct monthly records per selected country and official world total for each annual period, without using application calculations. They verify import/export amounts, dollar changes, growth, shares and percentage-point changes in the CSV, displayed amounts and growth, provenance, reload and filter stability. No browser page errors or Census API requests occurred. Desktop and 375-pixel mobile screenshots were inspected.

The current comparison is **September 2025–August 2026** against **September 2024–August 2025**. Independently summed examples:

| Direction | Country | Current USD | Previous USD | Dollar change | Growth | Current U.S. share | Previous U.S. share | Share change |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Imports | Italy (4759) | 231,293,502 | 175,352,984 | +55,940,518 | +31.9% | 13.7% | 7.9% | +5.7 pp |
| Imports | Canada (1220) | 389,861,804 | 484,146,492 | −94,284,688 | −19.5% | 23.0% | 21.9% | +1.1 pp |
| Exports | Italy (4759) | 474,283 | 862,573 | −388,290 | −45.0% | 0.1% | 0.1% | −0.047 pp |
| Exports | Canada (1220) | 419,091,755 | 479,054,561 | −59,962,806 | −12.5% | 52.1% | 59.1% | −7.0 pp |

Official world annual denominators are **1,692,814,074 / 2,207,669,569 USD** for current/prior imports and **804,440,300 / 811,100,933 USD** for current/prior exports. Small nonzero percentage-point changes retain significant digits rather than rounding to zero. CSV numbers retain full calculation precision.

The accepted source identity and bytes are unchanged: prepared SHA-256 `eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727`; pointer `releases/2026-08-5f3c2606-06a0-4c96-8fbc-a2332e0428ae.json`; reporting month August 2026; retrieved `2026-10-09T07:32:29.685Z`; processing version `7f76e7c6f0fb1168906956ef8517095a5e49e103`.

The retained-Census build contains **11 files**, **683,407 uncompressed bytes**, and a largest file of **283,179 bytes**, the coffee profile. Profile gzip size is **80,398 bytes**. Output increased by **5,671 bytes** from the country-picker milestone, with no added deployment files. These local size measurements do not establish deployed performance.

Fixture and Census outputs are isolated under ignored `.tmp/selected-comparison-fixture-dist` and `.tmp/selected-comparison-live-dist`. The independent Census tests and evidence remain in `.tmp/selected-comparison-live.spec.ts` and `.tmp/selected-comparison-evidence.json`; screenshots are under ignored `test-results/selected-comparison-visual/` and `test-results/selected-comparison-live-visual/`.

The work changes no data retrieval, canonical release, archive protocol, hosting service, schedule or public deployment. Pages and chart data remain on the same static host, with private R2 backups. Two successive official reporting months remain a separate launch requirement.
