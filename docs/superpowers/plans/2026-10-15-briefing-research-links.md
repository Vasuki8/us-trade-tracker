# Briefing Research Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement these four tasks. Root implements; fresh independent reviewer subagents assess the completed branch. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let readers follow a coffee briefing's monthly or twelve-month import/export summary into the matching country changes, without losing its product, direction or comparison period.

**Architecture:** Extend the existing static ReleaseBriefing cards with native links made by the existing countryChangesViewPath helper. Preserve the calculations, rendered summaries and destination controllers. Reuse the established retained-data staging, package, live-verification and restoration tools.

**Tech Stack:** Existing Astro, React, TypeScript, Vitest/Testing Library/Playwright, Node 24 and Python 3.12+ standard library; locked dependencies.

**Spec:** The combined design below. The owner explicitly requested one review of the next tasks and all execution permissions; this bounded extension combines design, implementation steps and permissions in that review. This is a proposal until approved, with no implementation or publication authorized merely by preparing it.

## Intended outcome and recommendation

The launch brief prioritizes a faster path from a product summary to useful country comparisons. The published product profiles now support section navigation and partner drilldowns. The existing product briefings still show monthly Imports/Exports without matching monthly country-change links. Their annual partner section has one shared See all country changes link that opens default Imports/rolling, including when the reader is studying Exports.

Recommend completing these briefing research links next. This is a concrete gap in the current flow, not measured evidence of user demand. It reuses behavior already present in the portfolio and adds no statistical model or public page. Both published products receive the same behavior.

Alternatives considered: visual estimated-duty history would help readers inspect trends but needs additional chart/qualification/export design; reusable numerical-acceptance tooling could reduce maintenance effort but is a larger operational change. Neither is necessary for this batch. Do not repeat completed pipeline/staging work as a new milestone. Successive-official-release acceptance remains separate and cannot be closed by these links.

Success: a reader follows the card they are reading, lands on the same product/direction/period ranked by dollars, and sees matching source periods and figures. Keyboard/mobile use and static briefing links remain usable. Query-driven destination selection still requires JavaScript and retains its existing explained static defaults.

## Combined design

### Monthly cards

Add one ordinary link at the end of each MonthlyTrade card after its existing measure note. Keep `MonthlyTrade({view}:{view:ProfileView})` unchanged. Use:

`countryChangesViewPath(view.productCode,{direction:view.selection.direction,period:'monthly'})`

Use the exact labels **Explore latest-month import changes by country** and **Explore latest-month export changes by country**. Offer the link only when `view.latestMonth.changeUsd !== null`: both world amounts and compatible classification are required by the existing comparison. Do not use growth availability as the gate. A reported zero prior value can have a valid dollar comparison and no growth percentage, so its link stays available. Missing/suppressed or classification-incompatible comparisons keep their reported amounts and existing unavailable text, without the new link. The destination may still exclude individual countries with unavailable observations; a link does not promise complete country coverage.

### Annual partner cards

Add one link inside each PartnerChanges card after its existing ranking/coverage note, using:

`countryChangesViewPath(view.productCode,{direction:view.direction,period:'rolling'})`

Use the exact labels **Explore twelve-month import changes by country** and **Explore twelve-month export changes by country**. Offer it only when `view.classificationComparable && available > 0`, where `available` is the existing dollar-ranking eligible count. Keep a valid all-zero/no-increase/no-decrease comparison link; missing growth percentages alone do not remove it. Preserve partner highlight links, values, ordering, period labels and exclusion counts. Remove the ambiguous shared See all country changes link and its now-unused monthlyChangesPath import.

### Exact destinations and static behavior

| Card | Roasted coffee | Green coffee |
| --- | --- | --- |
| Monthly Imports | /changes/?direction=imports&metric=dollars&period=monthly#changes-heading | /changes/090111/?direction=imports&metric=dollars&period=monthly#changes-heading |
| Monthly Exports | /changes/?direction=exports&metric=dollars&period=monthly#changes-heading | /changes/090111/?direction=exports&metric=dollars&period=monthly#changes-heading |
| Annual Import partners | /changes/?direction=imports&metric=dollars#changes-heading | /changes/090111/?direction=imports&metric=dollars#changes-heading |
| Annual Export partners | /changes/?direction=exports&metric=dollars#changes-heading | /changes/090111/?direction=exports&metric=dollars#changes-heading |

Keep the existing helper's omission of the default rolling query field. Targets use the existing persistent changes-heading. Links are rendered in server HTML, with no client island, new query field, router, route, API, analytics or dependency. Existing destination code restores direction/period after hydration. Without JavaScript, briefing links still navigate, and the destination explains/shows Imports/dollars/rolling defaults; do not claim monthly or Exports restoration in that mode. Do not add duplicate notices or change destination copy/controllers for this feature.

## Global constraints

- Only existing reviewed coffee products 090121 and 090111; no added reporting month. Preserve accepted five-year merchandise/24-month duty coverage through August 2026 and Canada's accepted September 2024–August 2026 historical snapshot.
- Preserve calculators, classifications, missing/suppressed/reported-zero distinctions, world and consumption denominators, RP70/79 qualifications, existing $10 million annual product-growth threshold, and CSV schemas/filenames/bytes. Estimated duties and portfolio behavior are unchanged.
- Downloads stay browser-generated; pages and chart data stay on the static host. No R2 operation is needed.
- Preserve noindex,nofollow, schema-v1 manifests, provider templates and live-verifier limits. Package caps: 1,000 entries; 26,214,400 bytes per asset; 2,097,152 total raw bytes; ZIP at most 4 MiB. Retain the 15,000-file planning alert.
- Baseline main: 77663f3ae46606e5717e2ede3177c97b2ba4a012. Last verified package: 31 entries/1,711,447 raw bytes; largest products/090121/index.html, 285,046 bytes. Measure the new package and explain changed assets; no new route or stored-download combination is expected. Existing build-time metadata may change under its established behavior.
- Reuse current locked dependencies, Node 24/Python 3.12+, stable-read/containment/hardlink/reparse guards and accepted-state staging. No unrelated controller or shared-chart refactoring.
- Synthetic failure fixtures must preserve country<=world and status/value invariants: zero matching country amounts when zeroing a world total, and use null values with missing/suppressed status. A failed fixture invariant is not evidence of a navigation defect.
- Run focused checks while editing, one complete final check set and one retained-data rehearsal. Repeat affected acceptance only for new changes, failures or findings. Identical accepted and merged runtime does not need another full build/test cycle.
- These checks establish compatibility with retained accepted data, not fresh Census validity, OS isolation, broad assistive/browser certification or successive-release acceptance.

## Files and interfaces

- Modify src/components/ReleaseBriefing.tsx only for runtime behavior. Preserve `ReleaseBriefing({release}:{release:Release})`, private MonthlyTrade and PartnerChanges interfaces; reuse their existing values/eligibility. No new calculator is needed.
- Reuse unchanged src/lib/trade/view-link.ts `countryChangesViewPath(productCode:string,selection:{direction:Direction;period:'rolling'|'monthly'}):string`.
- Extend tests/ui/ReleaseBriefing.test.tsx; update existing old-link expectations in tests/e2e/release-briefing.spec.ts and tests/e2e/product-release-briefings.spec.ts; add tests/e2e/briefing-research-links.spec.ts for the new journeys. Do not weaken existing numerical/source assertions.
- Add docs/validation/briefing-research-links.md; update README and this plan with actual evidence. Current styles should suffice; a demonstrated wrapping/focus issue permits only a scoped briefing style repair with an affected check.

## Permission envelope for all four tasks

Approval authorizes the following without routine approval pauses:

1. Root source/test/documentation implementation and ordinary in-scope repairs; managed worktree creation/reuse; read-only research and independent reviewer subagents; configured existing runtime setup and locked npm ci if required. Preserve root implementation with one fresh whole-branch review.
2. Read current accepted/protected identities and the compact seven-file accepted state consumed by site:stage. Make bounded private copies into at most three fresh ignored stages, each at most 16 MiB, only if repairs need rebuilding. Authenticate/reuse the last batch's sealed CSV/producer evidence; read only needed preserved source/processed data and proof, with no raw-archive replay or remote recovery. Preserve originals.
3. Local unit/type/fixture/build/browser checks, exclusive task-owned loopback previews with outside requests blocked, keyboard/mobile/no-JavaScript journeys, sourced CSV/PNG downloads and screenshots; existing stage/precheck/build/postcheck/assembly/site-and-withdrawal ZIP creation/readback. Preserve at most 64 MiB of useful private proof excluding reproducible caches. Stop only owned processes and use native worktree archive after proof preservation/readback.
4. Commits, GitHub pushes, PR creation/update/attachment, existing standard-runner Code checks, fresh independent review, expected-head reviewed merges under standing permission, main synchronization/tree verification and documentation closeout. Exact-final-head CI must pass before every merge. If attachment limits block this batch, verify and preserve references before removing at most four obsolete already-merged PR chat attachments; do not change or delete any GitHub PR.
5. Signed-in read-only Cloudflare preflight, then upload the exact verified package to the existing **Free / Production / us-trade-tracker** Pages project, account **2e23d873002d29a02a1427e1fa37c5cd**, canonical **https://us-trade-tracker.pages.dev**. Bind it to reviewed, CI-passed, merged runtime and unchanged inputs; immediately read back candidate/restoration ZIP and manifest pins. At most two candidate uploads, with renewed affected acceptance, review and exact-head CI before any repaired runtime candidate.
6. Bounded anonymous live checks on canonical and the actual dashboard-observed deployment origin, all eight briefing/product/direction/period journeys, representative coffee profile downloads, and the existing bounded Canada sharing/download smoke verifier. Use one existing site:verify run per predecessor/candidate/restoration transition, plus one read-only retry only for demonstrated propagation/transient failure. Retain existing request/redirect/time/size/private-route bounds. No guessed origins, broad crawl or recurring polling.
7. Automatically restore the exact pinned verified predecessor below if a candidate regresses, at most once per failed candidate, then verify restoration and preserve failure evidence. Restore the working site for an ordinary regression; do not substitute a withdrawal page.

### Verified predecessor and restoration pins

| Item | Pin |
| --- | --- |
| Production deployment | fcaf0070-6031-4308-ad9d-ee45e0a84558 |
| Observed deployment origin | https://fcaf0070.us-trade-tracker.pages.dev |
| Package directory | data/backups/profile-research-navigation/deployment-20261015-r1/packages |
| Site ZIP | site.zip; 389,951 bytes |
| ZIP SHA-256 | 7031ac55d7a47f901b31d04e72fbe09e1cab182e8cbd0a8322335467f6e69ef6 |
| Manifest SHA-256 | 9e8534b8dc19e7274ea185cd325dbeefad269ae7a50f5f453c3fe68f5a9d4a17 |
| Package runtime source | 1318d54b0b7a331418dbbb103aef0dc89f308162 |
| Planning main | 77663f3ae46606e5717e2ede3177c97b2ba4a012 |

Planning read-back confirms these package pins, the prior completion record and archived worktree. Before upload, independently require the current Free target/Production identity and canonical/prior-origin payload to match them. An unexplained concurrent change, input-integrity failure, changed/paid target, new access/terms obligation or material cost boundary stops dependent publication. Investigate read-only and complete unaffected work; ask only if a new material decision is required. A human sign-in/CAPTCHA or new terms decision still needs that human step.

**Excluded:** live Census/source requests or imports; accepted-state replacement/promotion; raw replay or recovery from R2; new products/countries/months; Canada refresh; any R2 reads/writes; new dependencies/services/accounts/domains; access or indexing changes; paid changes; schedules, analytics, outreach, advertising, subscriptions or billing. The standing below-100-GB R2 preference is retained but no R2 use belongs in this batch. Do not start duty charts or a new acceptance-tooling subsystem.

## Review focus

1. Monthly Exports must not land on Imports or rolling periods after hydration; both product codes keep exact literal URLs and matching monthly figures. Tasks 1 and 3.
2. Zero prior values or all-zero countries must retain valid dollar research while growth stays unavailable; missing/classification-incompatible periods must not acquire implied comparisons. Tasks 1–3.
3. Annual cards need their own direction-specific link, including no-increase/no-decrease cases, while existing partner links and exclusion counts remain unchanged. Tasks 2 and 3.
4. Static briefing links remain server-rendered with no island; no-JavaScript destinations explain their defaults without claiming query restoration. Keyboard/mobile and actual back/forward preserve product identity. Task 3.
5. Unchanged numerical/download contracts and exact reviewed/merged runtime/input/package bindings must survive publication; recovery is only claimed executed if used. Tasks 3 and 4.

## Task 1: Link monthly briefing cards to matching country research

**Deliverable:** Each available monthly import/export summary opens its matching latest-month country comparison.
**Files:** ReleaseBriefing.tsx and tests/ui/ReleaseBriefing.test.tsx.
**Interfaces:** Consume unchanged ProfileView/latestMonth and countryChangesViewPath; produce the two monthly card links/eligibility above without changing view models.

- [x] Before runtime edits, record execution base and authenticate seven accepted/eleven protected identities. Authenticate the previous 424-file seal, relevant producer/runtime bindings and all 112 preserved CSV outputs before adopting that baseline. Runtime src/scripts/tests at planning main matches the accepted package runtime except documentation; verify the applicable comparison/export modules again. If a baseline cannot be bound, capture a fresh pre-edit baseline with the retained bounded harnesses before editing.
- [x] Add `briefing_monthly_links_keep_product_direction_and_period` with literal monthly URLs for 090121 and 090111, scoped to Monthly imports/Monthly exports. Retag all synthetic merchandise/duty observation identities when testing the second real code; browser fixture coverage uses existing 090122 separately.
- [x] Add `briefing_monthly_links_preserve_zero_and_unavailable_rules`: reported prior zero retains link/dollar change with no growth; missing or suppressed matching world amount and unverified/split classification interval remove only the new link, preserving existing reported figures/qualifications.
- [x] Run `npm test -- tests/ui/ReleaseBriefing.test.tsx --maxWorkers=2`. Expected RED: the new literal-link assertions fail because the links are absent. Implement the design using the existing helper, then rerun GREEN and commit the monthly links.

## Task 2: Link annual partner cards without the shared Imports default

**Deliverable:** Each annual partner card opens the matching product/direction rolling country ranking.
**Files:** ReleaseBriefing.tsx and tests/ui/ReleaseBriefing.test.tsx; affected old-link browser expectations.
**Interfaces:** Consume unchanged ChangesView and rankChanges(view,'dollars') eligibility; produce two annual card links and remove only the ambiguous shared link.

- [x] Add `briefing_annual_links_keep_card_direction` for both product codes using literal rolling URLs. Pin existing highlight names/hrefs/order, amounts, period labels and excluded counts; require the old shared link absent.
- [x] Add `briefing_annual_links_follow_dollar_eligibility`: zero prior amounts and equal/no-change countries retain a valid link; all-country missing/suppressed or incompatible classification removes it. Do not replace a dollar eligibility test with changePercent availability.
- [x] Run the focused UI file RED, add the annual links and remove the shared link/import, then rerun GREEN. Update only affected old-link expectations in existing briefing browser tests to the new scoped direction-specific link and literal destination. Commit this independently testable change.

## Task 3: Verify briefing journeys and prepare the exact retained-data package

**Deliverable:** Locally accepted, measured static package with matching-period reader journeys and unchanged numerical/export contracts.
**Files:** New tests/e2e/briefing-research-links.spec.ts, validation record and README.
**Interfaces:** Consume Task 1/2 links, existing fixture builds and accepted staging inputs; produce immutable runtime/package pins and acceptance evidence for Task 4.

- [ ] Add eight fixture journeys (090121/090122 × Imports/Exports × monthly/rolling), following the actual card link. Await destination readiness; verify selected direction/period/dollars, product identity, changes-heading, matching source periods/world figures, reload and back/forward. Monthly card world figures must match the destination; annual card highlights/periods must match the rolling ranking. Keep copy/CSV metadata tied to the destination selection.
- [ ] Add keyboard navigation and 320/375/1120-pixel overflow/focus checks. Without JavaScript, both briefing routes have all applicable native links and no astro-island; following a monthly Exports link retains its href but the destination truthfully shows/explains static Imports/dollars/rolling defaults. Do not infer restored query values from the address alone. Preserve duty/source/profile/other-product links and unknown-route 404 checks.
- [ ] On final runtime run `npm test -- --maxWorkers=2`, `npm run check`, explicit fixture `npm run build`, `npm run test:e2e`, and configured Python `-m unittest discover -s tests/packaging -v`. Expected: all pass; zero type errors/warnings/hints. Retain meaningful failures and diagnose before correcting. Do not run full suites concurrently with staging if this risks existing integration deadlines.
- [ ] Use existing documented site:stage/site:prepare precheck/census-and-Canada-snapshot build/postcheck/assembly. Private preview modes remain absent. Recheck seven/eleven identities; replay all 112 authenticated CSV cases and the Canada projection against final runtime and require exact bytes.
- [ ] Serve the assembled package on an exclusive owned loopback origin, blocking outside requests. Independently derive expected monthly world values and annual world/partner changes from retained processed observations, without application calculators. Follow all eight actual real-product briefing links (090121/090111); verify target controls/periods/figures and matching CSV bytes/source metadata. Reuse bounded representative profile PNG/CSV and Canada sharing checks, retaining useful screenshots/downloads/error/origin receipts. Keep fixtures distinct from real acceptance.
- [ ] Measure package count/raw size/largest asset/delta; explain changed assets and require all caps. Create/read back site and withdrawal ZIPs and deterministic recreations using existing package_site.py. Assert briefing pages still contain no React island and no new route/dependency. Record local results truthfully with review/CI/publication pending, then commit acceptance.

## Task 4: Review, merge, publish, verify and preserve

**Deliverable:** Verified public briefing research links, or a recorded failed candidate with the pinned working site restored.
**Interfaces:** Consume Task 3's accepted runtime/package/data pins; produce actual review/CI/merge/deployment/live receipts and confirmed operational closeout.

- [ ] Self-check design/permission coverage. Obtain a fresh read-only whole-branch review of immutable base/head and acceptance evidence. Resolve findings and record review limits/dispositions; run affected checks. Any runtime repair requires renewed affected browser/build/package acceptance before publication.
- [ ] Push/create/attach the feature PR, require Code checks on its exact final head, merge with expected-head protection, synchronize main and verify reviewed-tree and staged-runtime binding. Do not duplicate the complete acceptance run for an identical merged runtime.
- [ ] Preflight Free/Production, the pinned predecessor and canonical/prior-origin payload with existing site:verify. Immediately read back candidate/restoration ZIP/manifest and accepted/protected input identities. Upload only the bound candidate, observe its actual deployment ID/origin and Production status, then run bounded live payload/header/byte/private-404 verification.
- [ ] Execute all eight public briefing handoffs, checking actual post-hydration controls, reporting periods/world/highlight values and matching eight country-changes CSVs against retained expectations. Check keyboard/mobile/static-default behavior and representative profile/Canada sharing/download smoke journeys. Save and visually inspect a public result screenshot. On regression, restore and verify the pinned predecessor under the envelope; preserve the failed candidate. No second candidate skips its gates.
- [ ] Record actual review/CI/merge/source/input/package/upload/restoration and live outcomes through a reviewed documentation closeout PR as needed, with exact-head CI/expected-head merge and main tree verification. Clearly distinguish local-only checks from public executions; do not claim restoration was exercised when unnecessary.
- [ ] Preserve useful evidence under data/backups/briefing-research-links/deployment-20261015-r1, seal/hash-read-back it before native worktree archival, then verify the archived attachment/path, preserved files and clean main. Keep any queued archive pending until confirmed. Post-seal archive/completion metadata closes operational steps outside the immutable seal, without rewriting earlier pending records. Report actual results and remaining historical/source/browser limits.

## Self-review and handoff

All four links have exact labels, helpers, availability conditions and literal destinations; zero prior values are distinguished from missing comparisons. Monthly world-based availability and annual country-based eligibility deliberately reuse the cards' existing meaning. New links do not claim every destination country is comparable. The static destination limitation is explicitly tested rather than adding another notice or island. The five Review focus risks each have owning tests/action-time gates. Existing calculations/export schemas remain untouched; Task 3 binds numerical acceptance to unchanged retained inputs, and Task 4 binds publication to reviewed CI-passed merged runtime and a verified restoration predecessor.

Execution remains root implementation with independent reviewer subagents. Approval of this combined design/four-task plan/permission envelope is the requested review gate; no routine merge or publication approval pauses follow inside it. Planning changed only this proposal, not runtime, accepted data or the public site.
