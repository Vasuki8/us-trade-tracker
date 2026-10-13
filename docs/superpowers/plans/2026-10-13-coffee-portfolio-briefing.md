# Coffee portfolio briefing

Approved in conversation on October 13, 2026. This document records the approved five-task package and its permission envelope; it does not request a new approval.

## Design and constraints

Add `/briefing/portfolio/`, defaulting to both published coffee products and Imports. Allow one or both registry products, with Imports/Exports and validated `products`/`direction` URL parameters. Links restore the selection against the latest accepted data. Invalid selections fall back with an explanation; at least one product remains selected. Browser Back/Forward restores the selection. No accounts or saved personal portfolios.

Keep products separate: no portfolio total or averaged duty rate. Each selected product shows latest month versus the same month a year earlier and rolling twelve months versus the preceding twelve months, with current/prior USD, dollar change and growth. Highlight the largest rolling dollar increase and decrease among partners, their share changes in percentage points, and links to their product research. Preserve missing/suppressed values, zero-prior growth, incomplete periods and classification qualifications.

The reporting month is the newest among selected products. Older selected releases are visibly unavailable for that month's comparisons; CSVs must not export their stale values under a common period. Imports include world monthly/rolling estimated duties and rolling duties for highlighted partners, using matched `CAL_DUT_MO`/`CON_VAL_MO` sums and existing coverage rules. Exports contain no U.S. duties. Estimated duties may differ from duties paid and exclude antidumping/countervailing duties; reported zero does not establish duty-free treatment.

Prepare compact results at build time, without shipping raw observation arrays or making browser Census requests. Provide a summary CSV (one row per selected product and comparison period) and partner changes CSV (displayed highlights), preserving identity, values/status, periods, measures, units, retrieval, processing revision and source. Unavailable amounts are blank. Use existing CSV escaping. Print/Save PDF includes the selection and provenance with controls hidden and readable wrapping/pagination. Without JavaScript, default Imports research remains readable and limitations are explained.

Preserve existing routes, old CSV outputs, accepted releases and Canada snapshot. Measure build file count, total bytes and largest file; alert around 15,000 files. Keep pages/data on the static host, browser-generated downloads and private R2 backups.

## Authorization

Root implements; subagents review. Authorized: local code/evidence/backups, tests, commits, pushes, PR creation and reviewed merges; update the existing Free Cloudflare Pages `us-trade-tracker` project after verification; verify live; automatically restore its prior verified pilot if the new deployment regresses, repair and verify again. No routine approval pauses.

No paid service, new account/domain, access-policy change, intentional extra charge, new Census import, R2 operation, release promotion or recurring Canada update. Signup/outreach/billing/ads/analytics remain deferred. Pause only for material new scope, expired required authentication, unexpected charges/terms, failed data integrity, or unexpected concurrent production changes that make deployment/restoration unsafe.

## Task 1: Compact briefing model

Interfaces: produce prepared product data in `src/lib/trade/portfolio-briefing.ts`, with both directions, monthly/rolling comparisons, compact world/highlight duties and provenance; selection produces a common reporting month and hides mismatched release values. Consume existing profile, monthly/rolling changes and duties calculations.

1. Write literal fixture tests for periods/amounts/rankings, imports/exports, missing/suppressed values, zero prior/denominator, classification boundaries, mismatched reporting months and immutability.
2. Run focused tests before implementation. Expected: failure for absent portfolio model.
3. Implement compact preparation/selection without raw arrays.
4. Run focused tests and the unit suite with bounded workers. Expected: green, no changed old contracts. Commit the model and tests.

## Task 2: Selectable page and links

Interfaces: consume Task 1 prepared data. Produce the `/briefing/portfolio/` route and validated selection URL helpers, readable SSR Imports, hydrated selection controls, unique IDs, research links and discovery links.

1. Write URL and real component tests, including invalid/duplicate/unknown values, at least one product, restoration, history and stale clipboard results. Run before implementation. Expected: absent helpers/component fail.
2. Implement the page, controls and compact cards, with honest no-JS limitations. Preserve current briefing/profile routes.
3. Run focused unit/UI tests and check. Expected: green and zero diagnostics. Commit.

## Task 3: Downloads and print

Interfaces: consume the exact selected Task 1 view for both CSVs and rendered print content. Extend existing downloads module without changing old serializers.

1. Write parsed CSV tests with literal values, blanks/status, duty qualifications, periods/provenance, export direction and hostile quoted/formula text. Run before implementation. Expected: absent serializers fail.
2. Add browser-generated summary/partner downloads and print styles/action. No stored combinations or new PDF backend.
3. Run focused tests. Expected: CSV rows match selected cards, unavailable fields blank and export duty fields empty. Commit.

## Task 4: Verification, review and merge

Interfaces: Tasks 1–3 feature against existing accepted coffee releases and unchanged Canada/CSV contracts. Produce a reviewed CI-tested commit for publication.

1. Browser tests: URL/history, downloads, keyboard, 320/375px, no-JS, unique IDs, no raw observation payload/browser Census calls; print media and visual PDF checks.
2. Run full unit/check/fixture build/browser suites. Expected: all green; build measured.
3. Independently sum retained real coffee monthly/rolling values and duty denominators; compare rendered/download results. Verify protected hashes and existing CSV bytes unchanged. Preserve local evidence.
4. Fresh whole-branch subagent review; resolve important findings with reproductions and verification. Create/attach PR, verify exact-head CI, merge under standing permission and sync main.

## Task 5: Public pilot update and recovery

Interfaces: merged Task 4 source, same accepted seven-state-file input set, existing authenticated Pages project and prior verified package. Produce authenticated site package, live checks and preservation receipt.

1. Capture current production identity/content before mutation; unexpected concurrency, auth/cost changes or failed data integrity stop publication. Use a fresh bounded source/data staging area and existing snapshot build/template/package checks. Expected: no private/raw/fixture/secret/function/source-map content and provider file/size bounds satisfied.
2. Upload the exact verified package to the existing Free Pages project. Verify canonical and deployment origins, manifest payload hashes, headers/private 404s, source/date/selection/download behavior and Canada snapshot.
3. On regression, automatically restore the prior verified package to the same project, then repair/re-verify. Preserve evidence and report the actual deployed result. No project deletion or provider-policy changes.

## Review Focus

Check common-period gating across selection changes, missing versus zero values, coverage/classification qualifications in rendered and downloaded duties, highlighted partner identity/direction, no combined product rates/totals, compact payload size, duplicate IDs, URL/clipboard history races, print provenance/readability, existing output compatibility, and deployment/rollback source/data integrity. Do not implement unrelated improvements.
