# Research handoffs and methods implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans task by task. Root implements; independent reviewer subagents review the completed changes. Preserve the owner's standing reviewed-merge permission.

**Goal:** Help readers move from product rankings to existing monthly figures and matching country explanations, with accurate Methods text and unchanged research calculations.

**Architecture:** Extend links and readiness handling in the existing product and portfolio components. Reuse portfolioPath, monthlyChangesPath and the existing country saved-view contract; retain all calculation, ranking, payload and CSV schemas. Use tracked local staging/packaging and the established bounded publication checks.

**Tech Stack:** Existing Node 24, Astro/React, TypeScript, Vitest, Playwright, Python 3.12+ standard library and locked dependencies.

**Spec:** The combined bounded design below, extending the [launch design](../specs/2026-10-08-us-trade-tracker-design.md), [product changes contract](../../validation/pilot-product-changes.md), [portfolio contract](../../validation/coffee-portfolio-briefing.md) and [monthly country movers contract](../../validation/monthly-country-movers.md). A combined written plan is provided because the owner requested several tasks and one permission review.

**Status:** Owner approved all five tasks and the complete permission envelope, including publication and automatic restoration, on October 14, 2026. Planning baseline: main c4adc9a74cbffbb1ef8886ec5793d980a2fb699d, merged PR #91. Execution method remains root implementation with reviewer subagents.

## Bounded design and recommendation

The existing portfolio already displays monthly and rolling figures for both coffee products. Adding monthly product rankings would duplicate much of that two-product view and require a new growth-eligibility policy: the current $10 million rule explicitly concerns the previous twelve months. Defer that new mode. Improve the existing discovery and explanation flow first, without changing that editorial rule.

1. On /changes/products/, add **Compare latest-month figures**. Use portfolioPath with every reviewed product in the current prepared view, in its existing order, and the selected Imports/Exports direction. This opens the existing portfolio report, which already displays latest-month and rolling figures. It does not carry the product ranking metric or imply a new portfolio ranking. Keep current product-profile links and rolling rankings.
2. Within each available portfolio merchandise summary, add **Explore latest-month country changes** or **Explore rolling country changes**, scoped to that product and period. Both use dollar ranking and preserve direction. Monthly links include period=monthly; rolling links omit period. They open the existing country changes heading. Keep profile links, rolling partner highlights and duty sections unchanged.
3. A portfolio summary with unavailable/incompatible merchandise comparison has no new comparison link. A stale selected product with data=null has neither summary link. Preserve its existing explanation; do not borrow another product's reporting month or imply that a world change is explained by displayed country rows.
4. Gate product-ranking direction, metric and CSV controls until Boolean(savedView.link) is true, following the existing country-page readiness pattern. Static Imports/dollars/rolling tables, sources, profile links and the new portfolio entry remain readable. Explain the static default when JavaScript is absent. Destination country pages retain their existing saved-filter limitation and static rolling default without JavaScript.
5. Correct Methods' annual-only description of country shares and changes. Shares use the matching month's official merchandise world total or matching complete twelve-month totals. Distinguish the profile's annual broad ranking from dedicated country pages' monthly/rolling choice. Keep product rankings' annual $10 million threshold, merchandise measures, consumption-based duty denominators and historical-data qualifications intact.

This batch changes navigation and explanations, not research arithmetic. It adds no dashboard, new ranking policy, period selector on product rankings, telemetry or performance subsystem. Another monthly product-ranking mode can be reconsidered after evidence of a distinct reader need.

## Global constraints

- Pilot products remain 090121 and 090111 through August 2026; Canada 1220 remains its fixed September 2024–August 2026 snapshot. Read-only fixture cases may use the already-supported synthetic product 090122.
- No calculator, classification, registry, accepted pointer/release, raw evidence, duty interpretation, eligibility threshold or CSV schema/filename/byte change. Existing product saved links still ignore unrelated period parameters.
- Country destinations use GEN_VAL_MO for imports and ALL_VAL_MO for exports. Country merchandise share and consumption-based duty share remain distinct. No combined portfolio headline or averaged duty rate.
- Use existing prepared comparisons/provenance only. No new observations, raw history payloads, API requests, backend, Functions or Worker content.
- Keep pages/chart data on the static host and downloads browser-generated; private R2 remains backup storage.
- Keep noindex,nofollow, manifest schema v1, the existing 1,000-entry package bound, 26,214,400-byte per-asset limit and 15,000-file planning alert. For this small batch, the assembled public site must also remain at or below 2,097,152 raw bytes including controls; current site is 30 entries/1,690,025 raw bytes.
- Keep Node 24, Python 3.12+ standard library and locked dependencies. Preserve staging containment, stable-read, hardlink/reparse and bound shared-dependency-link checks.
- Run focused checks during edits, one complete final check set and one retained-data rehearsal. Repeat affected checks only for changes, failures or review findings. Identical reviewed/tested and merged trees do not need duplicate full testing or another build.

## Permission envelope for all five tasks

Approval of this new plan authorizes:

1. Root source/test/documentation implementation and routine in-scope fixes; managed worktrees; read-only research/reviewer subagents; existing runtime use and locked npm ci. No repeated execution-method or ordinary implementation approvals.
2. Read existing accepted coffee state and the selected compact Canada state/protected identities needed by preparation. Copy only the same seven authenticated accepted-state files into each fresh ignored stage, at most 16 MiB per stage. Preserve originals, useful private receipts, screenshots, downloads, ZIPs and bounded local backups. No raw archive reading/replay.
3. Local fixture and retained-data checks, type checks/builds, exclusive loopback previews, browser downloads/screenshots, tracked staging/readback/assembly and site/withdrawal ZIP creation/verification. Stop only task-owned preview processes; preserve required proof before native worktree archiving or verified task-owned scratch cleanup.
4. Commits, GitHub pushes, PR creation/update/attachment, existing standard-runner Code checks, reviewed expected-head merges, main synchronization/tree verification and documentation closeout. Standing merge permission continues; CI must pass for the exact final reviewed head.
5. Read-only signed-in Cloudflare dashboard preflight, then publish the generated verified site package to the existing **Free / Production / us-trade-tracker** Pages project in account **2e23d873002d29a02a1427e1fa37c5cd**, canonical https://us-trade-tracker.pages.dev. This is a newly requested publication authorization, not inherited from the earlier local-only monthly plan. The only upload content is static output from this reviewed, CI-passed, merged source and the unchanged seven authenticated inputs, within the limits above. Record and read back the exact ZIP/manifest hashes before each upload; do not substitute an unverified build. Allow at most two candidate uploads for this milestone if an in-scope repair is needed, with review/CI and local acceptance for changed runtime before another candidate.
6. Bounded anonymous live payload/hash/header/404 and research/download checks on the canonical origin and the new deployment origin actually observed in the dashboard. No guessed or arbitrary host. Preserve observed provider identity and screenshots.
7. If a candidate genuinely regresses, automatically restore the exact current verified monthly-country-movers site and verify restoration. Restoration ZIP SHA-256: **0f3ebebec1a18f7939b054e74fada2e784facc94e43f92fc9d2b20bccd4b99a9**; manifest SHA-256: **cdee04449100b9a7a779d1a80de9772387e2f75dcc2967ac6c62aed1686151f7**. Retained private location: data/backups/monthly-country-movers/deployment-20261014-r1/site.zip and site-manifest.json. At most one restoration per failed candidate. Do not replace a verified prior site with a withdrawal page for an ordinary regression.

Excluded: new imports or live Census/source requests; raw replay; accepted-data or archive-pointer replacement/promotion; new product/country/reporting-month intake; Canada refresh; all R2 operations; new dependencies, services, accounts, domains or access/indexing changes; paid changes or intentional extra charges; schedules, outreach, ads, analytics, subscriptions and billing. A required human sign-in/CAPTCHA or new terms prompt still needs the human step required by the browser policy.

Before upload, require the current public site to match Production **0a3ccb96-2d14-435a-89dd-bbb3ff0381e6** and the pinned prior package on both canonical and prior deployment origins. Unexpected concurrent production changes, failed input integrity, a paid/changed target or a materially new scope/access/terms boundary stops the dependent action. Investigate safely and ask only if it cannot be resolved within this envelope. Approval otherwise covers all five tasks without routine permission pauses.

## Review focus

1. Context retention: direction, product and comparison period must survive the actual discovery-to-country journey; a growth ranking must not be silently mapped to country share. Tasks 1–2 and Task 4 browser journeys.
2. Availability and source vintage: absent/stale/incompatible portfolio data must not offer a misleading matching-period link. Task 2 fixtures and Task 4 retained checks.
3. Static and pre-hydration truth: controls stay disabled until ready; default tables and links remain useful; no-JavaScript monthly query destinations explain their rolling default. Tasks 1–2 and Task 4.
4. Numerical/export compatibility: navigation must not alter existing rankings, amounts, source qualifications or download bytes. Task 4 baseline replay and independent retained checks.
5. Publication identity/recovery: exact source/input/package/target binding, truthful Methods denominators, payload limits, noindex/private-route behavior and safe restoration remain verifiable. Tasks 3–5.

## Task 1: Link product rankings to the existing monthly figures

**Files:** Modify src/components/ProductChanges.tsx, tests/ui/ProductChanges.test.tsx and tests/e2e/pilot-product-changes.spec.ts.
**Interface:** Reuse portfolioPath({productCodes:string[],direction:Direction}) from src/lib/trade/portfolio-link.ts. Preserve the existing ProductChanges props and hook mode; readiness is Boolean(savedView.link).

- [ ] Before any runtime edit, record baseline commit c4adc9a74cbffbb1ef8886ec5793d980a2fb699d, the seven accepted/eleven protected identities, and current download bytes in fresh ignored task storage. Reuse the established 84 default-CSV cases plus all sixteen country-mover selections; retain both sets explicitly even where cases overlap. Task 4 must compare against these pre-edit outputs, not a baseline generated after implementation.
- [ ] Write failing tests named product_monthly_entry_preserves_direction_and_coverage and static_product_controls_wait_for_hydration. Pin the literal destination /briefing/portfolio/?products=090121%2C090111&direction=exports after choosing Exports/growth, with no metric or period parameter. Assert static imports/dollars tables and profile links remain readable, while direction/select/CSV controls are disabled before hydration and without JavaScript.
- [ ] Run npm test -- tests/ui/ProductChanges.test.tsx --maxWorkers=2; confirm the new assertions fail for missing behavior. Add the link/readiness handling and clear static-default explanation; preserve existing URLs, threshold, rows and CSV calls.
- [ ] Run the focused UI suite and the existing product browser cases, extending no-JavaScript/keyboard assertions meaningfully. Confirm the entry uses all current reviewed products, including explained unavailable products, rather than just displayed movers. Commit this deliverable.

## Task 2: Add matching country drilldowns to portfolio summaries

**Files:** Modify src/lib/trade/view-link.ts, src/components/PortfolioBriefing.tsx, tests/trade/view-link.test.ts, tests/ui/PortfolioBriefing.test.tsx and tests/e2e/portfolio-briefing.spec.ts.
**Interface:** Add countryChangesViewPath(productCode:string,selection:{direction:Direction;period:'rolling'|'monthly'}):string beside monthlyChangesPath. Reuse that route helper; validate direction/period/code, serialize direction then metric=dollars, append period=monthly only when selected, then #changes-heading. No portfolio prepared-data schema change.

- [ ] Write failing literal URL assertions: countryChangesViewPath('090121',{direction:'exports',period:'monthly'}) equals /changes/?direction=exports&metric=dollars&period=monthly#changes-heading; green rolling Imports equals /changes/090111/?direction=imports&metric=dollars#changes-heading. Cover all eight real product/direction/period combinations, the existing fixture route and invalid selection rejection; old profile/link assertions remain exact.
- [ ] Add failing portfolio cases for both summary links and their direction updates; missing/suppressed/classification-incompatible summary hides only that period's new link. A mismatched release with data=null exposes neither new link. Zero-prior growth remains unavailable without hiding an otherwise available dollar comparison.
- [ ] Run the focused view-link and portfolio UI suites, implement the helper and scoped links, then rerun green. Keep existing profile links, partner highlights, duty sections, print behavior and CSV calls intact.
- [ ] Extend browser cases to follow each period link and assert destination product, direction, selected period and dollar metric after hydration. Without JavaScript, confirm readable portfolio defaults and the existing destination's explicit static rolling/default explanation. Commit the links and checks.

## Task 3: Align Methods with the shipped comparison modes

**Files:** Modify src/pages/methods.astro; start docs/validation/research-handoffs.md and update README only as needed to describe the feature accurately.
**Interface:** Documentation of existing calculator behavior; no code/data contract change.

- [ ] Read the current monthly/rolling country calculators and shipped page defaults. Correct only the Comparisons and shares, Country changes and relevant navigation explanations. Name matching official world totals and monthly/rolling periods; distinguish the profile's annual ranking, product rankings' annual threshold and portfolio's unranked monthly/rolling figures.
- [ ] Keep duty denominators/coverage, missing-versus-zero rules, raw-vintage limitations and fixed pilot dates unchanged. Review prose against current code and fixture/retained examples; do not add tests that merely mirror wording.
- [ ] Inspect rendered Methods with the research journeys, record the substantive checks in the validation record, and commit the correction.

## Task 4: Verify unchanged research and prepare the release package

**Files:** Add meaningful cross-page cases to tests/e2e/research-handoffs.spec.ts; update the validation record. Existing tracked staging/assembly/packager modules remain unchanged unless a demonstrated in-scope compatibility defect requires a failing regression.

- [ ] Authenticate and replay the pre-edit baseline from Task 1 against the final runtime. Require exact bytes for both CSV case sets and unchanged accepted/protected identities. No new source retrieval or dated raw archive is required.
- [ ] On the final runtime commit, run npm test -- --maxWorkers=2, npm run check, explicit fixture npm run build, npm run test:e2e and Python packaging unit discovery once. New browser journeys cover both directions, real/fixture products, monthly/rolling destinations, keyboard controls, 320/375-pixel layouts, no-JavaScript defaults and unavailable/stale examples.
- [ ] Stage the same seven existing authenticated inputs using the documented site:stage flow. Perform precheck → TRADE_DATA_MODE=census/CANADA_PILOT_MODE=snapshot build with both private preview modes absent → postcheck → site:prepare assembly, using fresh destinations and existing documented CLI flags. Measure file count, total bytes, largest file and payload delta against the current 30-entry/1,690,025-byte package.
- [ ] Use an exclusive loopback origin and block outside requests. Follow product rankings → monthly portfolio figures → country changes for both coffee products/directions/periods. Compare displayed periods/figures to retained observations; recheck existing country, duty, portfolio, profile and Canada flows/downloads with bounded existing verifiers. Authenticate the baseline CSV pairs and original seven/eleven identities unchanged.
- [ ] Create and read back site/withdrawal ZIPs using scripts/package_site.py; require deterministic recreation from the same tree/manifest, private-file guards and the stated limits. Inspect desktop/mobile screenshots and update evidence. Keep the existing verified public package intact for restoration. Commit the local acceptance record.

## Task 5: Review, merge, publish and close out

- [ ] Self-check the design, Review Focus and permission boundaries. Obtain one fresh read-only whole-branch review of exact base/head plus private acceptance evidence. Root resolves findings and explicitly rules on excluded judgments; rerun affected checks for fixes.
- [ ] Push/create/attach the feature PR; require exact-head Code checks, merge with expected-head protection, synchronize main and prove tree identity. The package runtime source must match reviewed/tested/merged runtime paths; otherwise rebuild and reverify before any upload.
- [ ] Preflight existing Free project and exact prior production identity/package; authenticate generated ZIP/manifest and original input identities again. Publish only the bound candidate package under the permission envelope. Observe its actual deployment ID/origin and run bounded live hashes/sizes/status/noindex/404 checks plus new handoffs and existing research/download checks. Save a screenshot showing the result.
- [ ] On regression, restore and verify the pinned previous working site. An in-scope repair may use the second candidate only after affected local checks, renewed independent review and exact-head CI for changed runtime. If safe success cannot be reached within the envelope, retain the verified prior site and report the precise remaining blocker.
- [ ] Record actual publication or restoration evidence in README/validation through a reviewed documentation closeout PR if needed; CI/merge are covered by the same approval. Preserve and hash-read-back useful private evidence/packages before archiving task-owned worktrees, confirm main is clean and report actual outcomes. Do not claim successive-release acceptance or newer reporting data.

## Self review and execution handoff

The five tasks cover entry/navigation, period-specific drilldowns, Methods accuracy, local compatibility/package acceptance and reviewed publication. Each Review Focus class has an explicit owning check. Baseline capture precedes Task 1 runtime edits; Task 4 replays those retained bytes. Interfaces and test paths match existing code. Existing figures, annual product-growth eligibility and all CSV contracts remain authoritative; there is no unresolved monthly-threshold decision. The added publication permission is specific to this fixed-data change, existing Free target and verified restoration package, with bounded candidates and no access/indexing changes.

Please review this combined design and all five tasks. Approval of the complete permission envelope authorizes execution through publication, verification, reviewed merges and private closeout without routine approval pauses. The owner's requested review remains the decision point; implementation has not begun.
