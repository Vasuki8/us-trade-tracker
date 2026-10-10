# Pilot product directory acceptance

October 10, 2026. This bounded extension implements the approved launch brief's product name/description/code search for the profiles already accepted in the pilot. Baseline: `3d458af1e110a6b7f9aa33062af5ffca863e798a`. It adds no product intake, paid dependency, provider request, archive write, public deployment or cross-product ranking.

## Behavior

`/products/` loads the same published registry and validated releases as the profile routes. Main navigation's **Product research** link opens the directory from every page. Each card supplies the registry display name, six-digit code, description from that release, reporting month, retrieval date and source, with a link to its own profile. Census descriptions are labeled **Official description**; synthetic descriptions are labeled **Sample description**, with a prominent development banner.

Search checks product names, descriptions and codes. It preserves leading zeroes, ignores case and extra whitespace, and requires all space-separated terms to match the same card. It is a literal text search: for example, `roasted` also appears in `NOT ROASTED`; users must confirm the displayed description. A count announces the visible results, an unmatched search explains the limited pilot coverage, and **Clear search** restores the list and focuses the input. The clear button is hidden when the input is empty. Filtering makes no network request and creates no additional page for a query.

The cards and links are static HTML. Without JavaScript, search controls stay hidden and an explanatory note accompanies the complete list. Native controls, focus indicators and a one-column mobile layout preserve keyboard use and prevent page overflow. Monthly changes, briefing and the methods release-information subsection retain their explicit roasted-coffee scope.

## Verification

- The first directory browser test failed against the baseline because main navigation still opened `/products/090121/`. It passed after the directory and navigation change.
- All **412 tests across 39 files** passed. Astro/TypeScript checked **103 files with zero errors, warnings or hints**.
- All **35 fixture Chromium cases** passed, including the three new directory cases. They check name/code/source-description search, case/whitespace, unmatched terms, result counts, clear-button visibility and focus, matching profile identity, no Census requests or page errors, both links without JavaScript, and mobile keyboard navigation without overflow. Existing chart, duties, comparisons, shared links and downloads passed their existing checks.
- Three additional Chromium cases passed against the actual two-profile Census build. Both cards' descriptions, reporting months and retrieval dates match their own retained releases; each link opens the correct description and latest world import value. Both profiles open without JavaScript. Mobile green-coffee search and keyboard navigation work without overflow. No Census requests or page errors occurred in the search/identity case.
- Desktop and mobile screenshots were inspected. The initial visual check found a globally styled button overriding its HTML `hidden` attribute; a scoped hidden-button rule and a regression assertion corrected it. The no-JavaScript text check targets the rendered paragraph because the browser test text engine skips the `noscript` element itself.
- SHA256 checks confirmed both accepted release/pointer pairs retained their original bytes. No source, classification or archive data changed.

The real-data harness and logs remain in ignored `.tmp/product-directory-*`; desktop/mobile images remain in `test-results/product-directory-live/`. The regular browser regression cases are tracked in `tests/e2e/product-directory.spec.ts`.

## Build measurements and limits

| Output | Files | Total uncompressed bytes | Directory HTML bytes | Largest file |
| --- | ---: | ---: | ---: | --- |
| Retained Census | 13 | 923,164 | 7,738 | `products/090121/index.html`, 283,172 bytes |
| Explicit fixtures | 13 | 419,769 | 7,917 | `_astro/client.EoSUrE1U.js`, 212,848 bytes |

Compared with the accepted two-profile Census baseline, this adds one file and 7,696 raw bytes. Search uses a small inline script, without a React island or canonical release payload on the directory. Pages and chart data remain on the same static host; browser downloads and private R2's existing role are unchanged. The 15,000-file planning alert remains in place.

This is discovery within the reviewed pilot coverage. It does not search unreviewed Census products or infer shipment classifications. Verification across successive official monthly releases, broader coverage and deployment remain separate launch work. Independent review and exact-head GitHub checks are required before merge under the owner's standing authorization.
