# Pilot research homepage acceptance

Verified October 10, 2026. This improves the existing homepage entry points within the launch brief's public product-research scope.

## Visitor behavior

The main action now opens Product research, where visitors can search by name, description or HS code. The homepage states the number of reviewed pilot profiles and their limited coverage. Each published profile has its own name/code, source description, reporting month and source, alongside matching Country changes and Release briefing links. A separate link opens the reviewed cross-product changes page.

The existing roasted-coffee Monthly changes and briefing entry points remain usable. Product-specific links use the existing shared route helpers, including their default-coffee compatibility paths. The page derives availability and metadata from validated published releases; fixture mode explicitly labels the synthetic observations. No product registry or release-loader behavior changed.

All homepage research links and profile metadata work without JavaScript. The downstream directory retains its existing static profile links when search is unavailable. The homepage adds no browser payload, React island or client script.

## Fresh verification

- All **436 tests in 43 files** passed. The process used a writable workspace temporary directory to avoid the already diagnosed Windows sandbox cache issue.
- Astro/TypeScript checks covered **121 files**, with **zero errors, warnings or hints**.
- All **47 fixture browser cases** passed. Two new cases first failed because the homepage lacked the profile cards. They check each card's description, source, reporting month and exact profile/changes/briefing paths; product-search and cross-product navigation; explicit sample coverage; mobile keyboard navigation without JavaScript; and no page overflow, Census requests or React islands.
- One additional real-data case passed on desktop and 375-pixel mobile without JavaScript. It compared both coffee cards with their own accepted release files, searched for green coffee and opened its profile, opened cross-product changes, and followed green coffee's country changes and release briefing by keyboard. The no-JavaScript directory path also kept both product links available.
- Desktop and mobile screenshots were inspected: `.tmp/pilot-research-home-visual/desktop.png` and `mobile.png`. Product names, descriptions and metadata remain readable, and mobile cards stack without page overflow.
- All four accepted release/pointer SHA-256 hashes remain identical to the preceding milestone. No data processing or archive operation ran.

## Build measurements and limits

The Census build has **18 files and 1,062,739 uncompressed bytes**, an increase of **3,693 bytes**. Homepage HTML grew from **3,212 to 6,905 bytes**. The Methods page's existing build-evaluation timestamp refreshed, with its size unchanged at **15,629 bytes**. All other retained assets remain byte-identical. No additional routes or assets were generated. The largest file remains `products/090121/index.html` at **283,172 bytes**.

Logs and isolated fixture/real browser configurations are retained under `.tmp/pilot-research-home-*`. Browser execution covers Chromium; Firefox, Safari and screen-reader execution were not performed. These checks establish working research journeys, not measured usability improvements with actual customers. Broader country profiles, additional product intake, official successive-release acceptance and public deployment remain separate work. This milestone adds no paid service, automated schedule, public R2 delivery or access change.
