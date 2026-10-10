# Product-specific release briefings

Validated October 10, 2026. The bounded continuation extends the existing factual briefing to the two accepted coffee profiles. Green coffee's Briefing link previously opened roasted coffee; it now opens its own source-backed summary at `/briefing/090111/`. `/briefing/` preserves the roasted-coffee default and its existing heading.

## Behavior and scope

- Static routes derive from the published, reviewed registry and each product's validated release. Explicit fixture mode uses its separately labeled synthetic profiles; unknown products have no briefing route.
- A shared template displays the product name, HS code, official source description, reporting month, retrieval date and processing version. Named product links identify the current briefing and work without JavaScript.
- Profile and Monthly changes navigation retain the product. Annual country highlights, full-profile links, duty-history links and the country-changes link open the matching product research.
- Monthly trade compares August 2026 with August 2025. Annual highlights compare September 2025–August 2026 with September 2024–August 2025, ranked by dollars within one product.
- Estimated duties use official world imports-for-consumption values. Monthly and rolling shares use matching consumption denominators; rolling shares divide sums. Reporting qualifications and unavailable behavior remain those of the accepted component.
- No calculation, canonical data, pipeline, archive, provider, scheduling or deployment behavior changed. The methods release-information subsection remains explicitly roasted-coffee research. Verification across successive official releases remains a separate launch requirement.

## Independent source checks

The retained source data was previously accepted for [roasted coffee](../data-validation/090121.md) and [green coffee](../data-validation/090111.md). This milestone's browser checks independently calculate all displayed monthly values, available annual country comparisons and world duty summaries using native BigInt sums of those canonical observations, without importing application calculation helpers. They check the rendered amounts, growth, annual leaders and availability counts, duty denominators, shares, RP70/79 qualifications, source identity and matching links for both products.

| Green-coffee monthly trade, USD | August 2026 | August 2025 | Dollar change | Growth |
| --- | ---: | ---: | ---: | ---: |
| General imports, GEN_VAL_MO | 761,982,573 | 732,404,352 | 29,578,221 | +4.0% |
| Total exports, ALL_VAL_MO | 19,387,454 | 23,576,145 | -4,188,691 | -17.8% |

Green coffee's annual import highlights are Peru, +$302,195,208, and Brazil, -$922,225,006. Its export highlights are Canada, +$13,462,832, and China, -$3,791,466. There are 32 comparable import countries and 75 unavailable; exports have 10 comparable and 90 unavailable. Missing country months stay unavailable.

| Green-coffee estimated duties, USD | Calculated duties | Consumption value | Duty share | RP70/79 affected dutiable value | Affected share of dutiable value |
| --- | ---: | ---: | ---: | ---: | ---: |
| August 2026 | 107,018 | 761,982,573 | 0.014% | 211,277 | 20.272% |
| September 2025–August 2026 | 276,010,844 | 9,251,021,338 | 2.984% | 9,452,053 | 0.625% |

Both green-coffee periods have qualified reported figures because affected dutiable value is positive. The denominator for affected share is dutiable value, distinct from the consumption denominator for duty share. Roasted-coffee figures reproduce the [original briefing evidence](coffee-release-briefing.md).

All four canonical pointer/release SHA-256 hashes remain unchanged. Green coffee retains retrieval `2026-10-10T05:00:43.614Z` and processing version `aff8fa4f5ff47664b49d9053a7e548f7915efe84`. The ignored acceptance harness, native evidence and screenshots are `.tmp/product-briefings-live.spec.ts`, `.tmp/product-briefings-evidence.json` and `.tmp/product-briefings-visual/`.

## Verification and delivery size

- All 412 unit/component/script tests passed with four local workers. The initial parallel run had one five-second timeout in `recovers all 337 v2 original files offline and keeps a v1 predecessor identity`; all eleven archive cases then passed in isolation, and the complete suite passed with bounded concurrency. Archive code and assertions were unchanged.
- Astro/TypeScript checked 109 files with zero errors, warnings or hints.
- All 40 fixture Chromium checks passed. New cases catch wrong-product figures and routes, static publication boundaries, matching partner/profile/duty/changes links, selected-product labels, mobile overflow and keyboard navigation without JavaScript. The initial new browser case failed because the second profile opened `/briefing/`; it passed after implementation.
- Both real-data Chromium acceptance cases passed. They cover independently calculated figures for both products and green-coffee mobile research links without JavaScript. No page errors or browser Census requests occurred. Desktop and 375-pixel mobile captures were visually inspected.
- The actual Census build contains **15 files**, **1,025,749 uncompressed bytes (0.98 MiB)** and a largest file of **283,172 bytes**, the unchanged roasted-coffee profile. Green coffee's briefing is **8,949 bytes**; roasted coffee's is **8,851 bytes**. Neither briefing contains a React island. Compared with the preceding build, this adds one file and 10,362 bytes.

Pages and chart data remain on the same static host, downloads remain browser-generated and R2 retains its private backup role. These are local and retained-data checks; they do not establish deployed performance or successive-release acceptance.
