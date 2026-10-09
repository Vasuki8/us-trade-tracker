# Coffee release briefing

Validated October 9, 2026. The approved bounded addition is `/briefing/`, linked from the homepage and main navigation. It summarizes the existing coffee release, HS 090121, and links to the full profile, country changes and estimated-duty history. It adds no retrieval, archive, classification, calculation, download or deployment behavior.

The page renders at build time and sends no React island or interactive payload. Its initial figures, qualifications, sources and research links work without JavaScript. The briefing is a factual summary rather than an explanation of causes, a profitability assessment or a cross-product ranking. It does not claim a separate editorial review has occurred for future data releases.

## Periods and source identity

Monthly trade compares August 2026 with August 2025. Country changes compare September 2025–August 2026 with September 2024–August 2025, ranked by dollar change. These annual highlights are explicitly distinguished from monthly movements. Incomplete and classification-incompatible country comparisons remain unavailable; a zero prior monthly value has no growth percentage.

The retained version 2 release is `2026-08-5f3c2606-06a0-4c96-8fbc-a2332e0428ae`, retrieved at `2026-10-09T07:32:29.685Z`, processing version `7f76e7c6f0fb1168906956ef8517095a5e49e103`. Prepared SHA-256 remains `eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727`. Independent sums from the previously source-verified observations, without importing application calculation modules, reproduced the briefing's monthly figures, all 226 country comparisons used to select the four highlights, and both displayed duty periods. Their acceptance checks are in ignored `.tmp/briefing-evidence.json` and `.tmp/briefing-live.spec.ts`.

| Monthly merchandise measure | August 2026, USD | August 2025, USD | Dollar change | Growth |
| --- | ---: | ---: | ---: | ---: |
| General imports, GEN_VAL_MO | 140,980,739 | 154,404,658 | -13,423,919 | -8.7% |
| Total exports, ALL_VAL_MO | 66,393,173 | 65,926,363 | 466,810 | +0.7% |

The largest comparable annual import increase is Italy, $55,940,518; the largest decrease is Switzerland, -$460,354,718. The export highlights are South Korea, $32,946,689, and Canada, -$59,962,806. Forty import partners and 42 export partners have complete comparable data; 65 and 79 respectively remain unavailable. These are partners seen in the retained history, not a claim of complete coverage of every possible country.

## Estimated duties

The summary uses official world imports-for-consumption amounts, with no selected country aggregation. It displays the latest month and current rolling twelve months, with their consumption denominators. It reuses the accepted duty calculation and coverage rules. The full profile supplies prior-period comparisons, complete monthly history and the sourced CSV.

| Period | Calculated duties, USD | Consumption value, USD | Duty share | RP70/79 affected dutiable value, USD | Share of dutiable value |
| --- | ---: | ---: | ---: | ---: | ---: |
| August 2026 | 200,343 | 140,881,214 | 0.142% | 0 | 0.000% |
| September 2025–August 2026 | 139,784,199 | 1,692,328,304 | 8.260% | 6,660,936 | 1.527% |

The rolling period has qualified reported figures because affected dutiable value is positive. Monthly figures are not assigned that qualification when the verified affected amount is zero. The page explains that reported zero duties do not prove duty-free trade, shares use consumption value rather than general imports, and rolling shares divide sums. Missing denominators and unverified reporting coverage stay visibly unavailable. Amounts remain visible when reported, with missing/classification qualifications stated separately. Tiny positive duty shares retain their magnitude through the existing `<0.001%` convention.

## Acceptance

- All 262 unit/component tests passed. Eight briefing cases cover direction-specific monthly totals, dollar-ranked annual highlights, missing country coverage, zero-prior growth, unverified classification periods, consumption denominators, ratio-of-sums rolling shares, affected reporting coverage, missing duty shares, legacy releases, source labels and revisions.
- Astro/TypeScript checks passed across 73 files with no errors, warnings or hints.
- All fourteen fixture browser cases passed, including two new cases for the route, research links, monthly/annual labels, static output, mobile overflow and keyboard navigation without JavaScript. Existing profile controls and browser downloads remained green.
- Two retained-Census browser cases matched the independently recomputed monthly values, four annual highlights, both duty summaries and source identity. Desktop and 375-pixel mobile screenshots were inspected. The no-JavaScript mobile page remained readable without page-level overflow; its research links worked by keyboard. No browser page errors or Census API requests occurred.
- A source-note contradiction found during self-review was reproduced with a failing assertion and corrected: synthetic fixture values are identified as synthetic throughout, while Census values retain their actual attribution.

The real-data build contains **11 files**, **666,681 uncompressed bytes (0.64 MiB)**, and a largest file of **279,693 bytes**, the coffee profile. The briefing is **7,159 uncompressed bytes**, or **2,400 bytes with gzip**. Gzip is a local size estimate, not a deployed timing measurement. Fixture output is isolated under `.tmp/briefing-fixture-dist`; the Census preview uses `.tmp/briefing-live-dist`. Screenshots and browser evidence remain under ignored `test-results/briefing-live-visual/` and `test-results/briefing-fixture/`.

Pages and data remain on the same static host, downloads still generate in the browser, and R2 remains private backup storage. Source bytes and the accepted data pointer were preserved. No new official reporting month, automatic schedule or public publication was added. The successive-release launch requirement remains open.
