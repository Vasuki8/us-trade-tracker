# Product-specific Monthly changes acceptance

October 10, 2026. Baseline: `c09331885fba50f713dba0cb3b33af32fae4f9fd`. This bounded extension of the existing country-change pages follows the owner's continued-development instruction within the approved coffee pilot. The short design keeps the roasted-coffee default and adds shared static changes research for the second accepted product, with product-aware navigation and links. It adds no intake, ranking across products, pipeline or archive change, paid service, scheduling or deployment.

## Behavior and scope

`/changes/` remains roasted coffee (090121). Other published registry products receive `/changes/<code>/`; normal Census mode adds green coffee (090111), while explicit fixture mode adds the labeled synthetic second product (090122). Unpublished or unknown codes receive no generated changes route. The shared template derives both direction views from that page's own validated release and displays its name, code, official/sample description, reporting month and provenance. Its browser payload contains calculated changes views, without full merchandise or duty histories.

A product profile's main **Monthly changes** link retains that product. Changes pages identify the current product and link to the other reviewed products, with `aria-current` on the selected link. These links and the initial import rankings work without JavaScript. Changing product starts with imports ranked by dollars; the note explains that reset. Home and general navigation retain the roasted-coffee default. The full-profile and country-highlight links retain their selected product.

Rankings, CSVs, merchandise measures, world denominators, comparison periods, missing/incompatible behavior and zero-prior growth safeguards are unchanged. This is country ranking for one product over the latest twelve months versus the preceding twelve months. Imports use general import values; exports use total export values. It is not a cross-product ranking or a new duty calculation. The coffee briefing and methods release-information subsection keep their existing explicit scope.

## Verification

The new browser test failed against the baseline because the second profile's navigation opened `/changes/` instead of its own product route. After implementation, all **412 tests in 39 files**, Astro/TypeScript checks of **106 files with zero diagnostics**, and all **38 fixture Chromium cases** passed. The three new fixture cases cover both directions and ranking measures, exact table/CSV equivalence with the matching profile, product identity and filenames, country links, no-JavaScript navigation, product switching/defaults, an unsupported-route 404, mobile keyboard download/table scrolling and no page overflow. The interaction case made no Census request and produced no page error.

Three additional Chromium cases passed against the actual retained-Census build. In both directions and both ranking modes, green-coffee tables and CSVs match its accepted profile exactly. An independent reader sums retained integer observations with `BigInt`: every displayed CSV row's current/prior country amounts, dollar change and current/prior national-share denominators match those sums. Each listed country has twelve reported observations in each period. Product, description, measure context, period labels, source, retrieval time and processing version retain the green release identity. Movement signs match independently calculated dollar or share changes.

The independent national totals checked in the page are:

| Merchandise measure (USD) | Sep 2025–Aug 2026 | Sep 2024–Aug 2025 |
| --- | ---: | ---: |
| General imports | 9,226,121,808 | 9,142,281,740 |
| Total exports | 261,173,713 | 257,686,581 |

Real-data navigation was also checked without JavaScript; mobile controls, downloads, horizontal table scrolling and country links keep green-coffee identity. No Census requests or page errors occurred in the real CSV/identity case. Desktop and mobile screenshots were inspected. SHA256 checks confirm both accepted release/pointer pairs retain their original bytes.

The real-data harness and logs remain in ignored `.tmp/product-changes-*`; screenshots are in `test-results/product-changes-live/`. Regular regression cases are tracked in `tests/e2e/product-monthly-changes.spec.ts`.

## Build measurements

| Output | Files | Total uncompressed bytes | Green/second-product changes page |
| --- | ---: | ---: | ---: |
| Retained Census | 14 | 1,015,387 | 90,540 bytes |
| Explicit fixtures | 14 | 439,380 | Synthetic 090122 page |

The Census changes default page is 99,397 bytes; its largest asset remains `products/090121/index.html` at 283,172 bytes. Compared with the accepted directory milestone, the build adds one file and 92,223 raw bytes. Each product page carries only its own calculated views. Pages and chart data remain on the same static host, downloads remain browser-generated, and private R2's existing role is unchanged. The 15,000-file planning alert remains in place.

Independent review and exact-head GitHub checks are required before merge under the owner's standing authorization. Verification across successive official monthly releases and public deployment remain separate launch work.
