# Product release information acceptance

Checked October 10, 2026 against the two accepted August 2026 Census releases.

## Scope

The shared `/methods/` page previously described only roasted coffee's retained release. It now loads the published registry and presents a separately named, static release article for every published product. Each article shows the product and HS identity, source description, source, reporting month, full retrieval timestamp, processing version, merchandise revision count, duty-history interval and duty revision count, plus its matching profile link.

Revision counts compare with the previous retained release. A merchandise-only release states that duty history is not included and the duty revision count is not applicable. Duty definitions and reporting qualifications remain shared; the coverage statement points to each product's release information. The directory link replaces the former default-product return link.

This continues the approved Sources and methods feature using the existing validated publication flow. It adds no React island, browser data payload, new product, data import, archive operation, schedule, service or deployment. The page fails its build if a required published release is invalid or absent; existing loaders never substitute another product or synthetic data in Census mode.

## Accepted-source comparison

The actual rendered HTML was independently compared with each canonical release, including the product description, reporting-month attribute, retrieval timestamp, processing version, both revision counts, duty interval and profile URL. The actual products are roasted coffee (`090121`) and green coffee, not decaffeinated (`090111`). Both report August 2026 and duty history September 2024–August 2026, but retain their separate retrieval dates and processing versions:

- Roasted: `2026-10-09T07:32:29.685Z`; `7f76e7c6f0fb1168906956ef8517095a5e49e103`.
- Green: `2026-10-10T05:00:43.614Z`; `aff8fa4f5ff47664b49d9053a7e548f7915efe84`.

Both canonical pointers and prepared files retain the exact SHA-256 values recorded before this change. The actual page has two release articles, Census provenance, no development banner and no React island. It was visually inspected in the local in-app browser at `/methods/`.

## Browser acceptance

Two new cases first failed against the previous page because the published-release heading and separate product articles were absent. They pass after implementation. The fixture browser checks inspect both products' descriptions and release fields, matching profile links, fixture labels, absence of Census requests and browser errors, and static rendering. A 375-pixel, JavaScript-disabled context checks both articles, the duty-method heading, official calendar link, horizontal overflow, keyboard access and profile/directory navigation. The existing multi-product mobile case now checks the shared release-information flow.

All **42 browser cases** passed. All **418 data/component tests** passed, and Astro/TypeScript checked **111 files with zero errors, warnings or hints**. After adding the mobile screenshot artifact, both focused Methods cases passed again. Mobile fixture screenshots were inspected; the actual retained-data metadata comparison is separate from the synthetic browser checks. The in-app browser viewport override did not resize its actual page, so it is not claimed as actual-data mobile evidence.

## Build measurement

The actual Census build contains **15 files and 1,030,256 uncompressed bytes**. The largest file remains `products/090121/index.html`, **283,172 bytes**. The updated Methods HTML is **12,851 bytes**, an increase of **4,507 bytes**. File inventory and byte comparison with the preceding accepted build show that **only `methods/index.html` changed**; the other fourteen assets are identical. Reports and evidence stay outside deployment assets.

Retained local evidence:

- `.tmp/product-release-information-evidence.ts` and its JSON result: rendered-source comparison, unchanged canonical hashes and exact asset comparison.
- `.tmp/product-release-information-{tests,check,e2e,census-build}.log`: full checks and measured build.
- `.tmp/product-release-information-{red,focused,visual-check}.log`: expected initial failures and passing targeted checks.
- `.tmp/product-release-information-visual/desktop.png`: actual-data desktop preview.
- `.tmp/product-release-information-visual/mobile-fixture.png`: mobile fixture browser capture.

This acceptance does not establish a new official reporting month, successive-official-release publication, live R2 transport or public deployment. Those requirements retain their prior status.
