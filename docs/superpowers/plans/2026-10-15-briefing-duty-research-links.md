# Briefing Estimated-Duty Research Links Design and Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for these four tasks. Root implements; independent subagents may audit retained evidence, and one fresh reviewer assesses the whole immutable branch before integration. Track execution with checkbox (`- [x]`) syntax. The bounded publication-repair allowance below applies only to a newly demonstrated regression.

**Goal:** Let readers move from an existing coffee briefing's estimated-duty summary to the same product's matching monthly or rolling country share-change research.

**Architecture:** Add native links to the two world duty summaries in the static product briefing and existing interactive portfolio. Reuse `dutyChangesPath`, prepared comparisons and destination behavior. Preserve data, calculations, downloads, routes, package formats and hosting.

**Tech Stack:** Existing Astro/React/TypeScript, Vitest/Testing Library/Playwright, Node 24 and configured Python 3.12+; locked dependencies, no additions.

**Spec:** The combined bounded design below, informed by `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md` (briefings, estimated duties and supporting research), existing duty changes, and `docs/validation/briefing-research-links.md`. The user explicitly requested one reviewable plan containing the next tasks and execution permissions; this document combines them. Preparing it authorizes no implementation or publication until approval.

## Recommendation and success

PR #109 is complete on main `c58760a808cda3a621436804f2218d0c62c2c5d5`, including actual archive, checkout/cache absence and final readback in `data/backups/successor-release-readiness/verification-20261015-r1/post-seal-final-readback.json`. Do not reopen its completed cleanup or treat its rehearsal ZIP as the published restoration target.

The remaining bounded reader gap is concrete: merchandise briefing summaries already open matching country comparisons, but product duty summaries only offer generic profile history, and portfolio duty summaries have no direct country-change links. Complete that journey for the two existing coffee products. This improves coherence; it is not measured evidence of unmet demand.

Alternatives: a dedicated candidate-resume workflow has no demonstrated blocker after PR #109; new data/products or another chart feature would widen this batch. Pausing development for owner-led research sessions is the strongest strategic alternative. Recommend that learning or the next real release after this small completion, rather than inventing another feature sequence. Interviews, outreach, analytics and recurring work are not included here.

Success is eight valid journeys: two real products × product/portfolio entry point × monthly/rolling. Each opens Imports, the same product and comparison period, and share-change ranking; destination world amounts, consumption denominators, dates and CSV match the originating release. Keyboard, mobile, static HTML and unavailable behavior remain honest. Official successive-release acceptance remains open and cannot be closed by these links or synthetic tests.

## Combined design

### World summary links and eligibility

Use the existing helper:

`dutyChangesPath(productCode,{period:'monthly'|'rolling',metric:'share'},'#duties-changes-heading')`

Exact labels:

- **Explore latest-month estimated-duty changes by country**
- **Explore twelve-month estimated-duty changes by country**

Share change is the existing duty research default and matches the consumption-based rate comparison. Dollar ranking remains available through the existing destination control. Do not add duplicate metric buttons or a new link/selection helper.

Offer each new link only when that world `DutyComparison` has `change.comparable === true` and `change.dutySharePercentagePoints !== null`. This uses existing complete-period, coverage, classification and positive-consumption requirements; do not invent new arithmetic or use a truthiness check. An exact zero share change is valid. Zero prior duties may withhold growth while retaining a valid share comparison. RP70/79-qualified figures remain eligible when existing coverage is verified. Current or prior zero/missing consumption, missing/suppressed amounts, unverified coverage or incompatible comparison spans withhold that period's link independently.

Do not gate on a country ranking count: a valid world comparison may lead to no eligible movers, all unchanged countries or exclusions. The destination keeps those explanations and its independent country calculations. Withholding a world-summary link does not change destination availability or claim that all country comparisons are unavailable. Existing amounts, qualifications, sources and the generic product duty-history link remain available under their current rules.

### Product and portfolio rendering

In `src/components/ReleaseBriefing.tsx`, add `research:{href:string;label:string}|null` to the private `DutySummary` props; keep `value:DutyPeriod` and `rolling?:boolean`. Render a normal paragraph/link when research is supplied. The two calls in `ReleaseBriefing({release}:{release:Release})` use `worldDuty.latest`/`worldDuty.rolling` for eligibility and continue to render their `.current` periods. No new figures or island are added.

In `src/components/PortfolioBriefing.tsx`, extend its private `DutySummary` with optional `research?:{href:string;label:string}|null`, defaulting to null. Only the two `data.worldDuties.latest`/`.rolling` calls supply it. Merchandise-ranked partner duty summaries receive none: the destination ranks all countries and cannot restore a highlighted partner selection. The existing `direction==='imports'` and mismatched-reporting-month branches continue to prevent inappropriate summaries/links. Keep `PreparedPortfolio`, `PortfolioDirection`, `DutyComparison`, state, URLs, printing and serializers unchanged.

| Product | Latest month | Twelve months |
| --- | --- | --- |
| Roasted, 090121 | `/changes/duties/?direction=imports&period=monthly&metric=share#duties-changes-heading` | `/changes/duties/?direction=imports&period=rolling&metric=share#duties-changes-heading` |
| Green, 090111 | `/changes/duties/090111/?direction=imports&period=monthly&metric=share#duties-changes-heading` | `/changes/duties/090111/?direction=imports&period=rolling&metric=share#duties-changes-heading` |

Links are ordinary server-rendered anchors and use the latest accepted release at the destination; they do not pin an immutable snapshot or guarantee the same reporting month after a future site update. The same-package acceptance checks require matching source/destination figures and dates. Static product briefings still have zero client islands; the portfolio retains its existing island and compact data boundary. No-JavaScript navigation reaches the destination, whose existing notice explains that its static view is Imports/rolling/share; query restoration and CSV generation require JavaScript. Do not claim matching monthly restoration in that mode or modify the destination controller to add it.

## Global constraints and permission envelope

Full approval authorizes all four tasks without routine approval pauses:

1. Root implementation of the two components and owning tests/docs, ordinary in-scope fixes, independent evidence/reviewer subagents, managed worktree creation/reuse and scoped execution permissions. Use configured existing Node 24/Python and locked `npm ci --ignore-scripts` when required; no dependency/lockfile changes. Root uses one fresh whole-branch review normally, not a reviewer per task.
2. Read/authenticate the existing seven accepted state files and eleven protected identities, the committed coffee selection and retained proof. Copy only those seven accepted files into at most three fresh ignored stages, each at most 16 MiB. Originals remain unchanged. Read only required prior proof/processed state; no raw archives or raw-source replay. Preserve the approved original proposal bytes/hash before changing execution checkboxes.
3. Focused and final tests, fixture/retained builds, existing stage/create/readback/assembly/Python package commands, deterministic recreation, exclusive owned loopback previews, blocked outside requests, keyboard/mobile/no-JavaScript checks, browser-generated CSV/PNG checks and screenshots. Private proof goes to ignored `data/backups/briefing-duty-research-links/deployment-20261015-r1`, at most 1,000 files/64 MiB. Retain selected evidence rather than duplicate entire prior proof collections or reproducible caches.
4. Commits, pushes, normally one implementation PR including factual local validation, PR attachment/update, existing standard-runner Code checks, independently reviewed expected-head merge, and main synchronization/tree binding under standing merge permission. Require successful exact-final-head push and PR checks before each merge. The manifest retains its actual tested source commit; prove its non-documentation source equals the CI-passed PR/merged source rather than relabeling the build or repeating it for documentation-only differences. No data/archive workflow dispatch. Post-merge publication/archive results belong in private finalization and the final report; the same PR description may record actual public outcome without a second documentation-only PR.
5. Read-only signed-in Cloudflare preflight and publication of the exact verified package to the existing **Free / Production / us-trade-tracker** Pages project, account **2e23d873002d29a02a1427e1fa37c5cd**, canonical **https://us-trade-tracker.pages.dev**. First verify that target, plan and currently assigned Production still match the pinned predecessor. Bind the candidate to CI-passed merged source, exact inputs, ZIP and manifest. At most two candidate uploads within the repair allowance below; no new project/domain/access/indexing setting.
6. Bounded anonymous verification on the canonical and dashboard-observed deployment origins only: existing `site:verify`, the eight new journeys, existing coffee/product changes/portfolio download checks, and bounded Canada sharing/download smoke checks. Use at most one verifier run per predecessor/candidate/restoration transition, plus one read-only retry for demonstrated propagation/transient failure. Never guess deployment origins or broaden a failed check into a crawl. Preserve failures. Stop owned previews only.
7. Automatically restore the exact verified predecessor below if a candidate regresses, at most once per failed candidate, then verify the restored site. An ordinary regression restores the prior working site, not a withdrawal page. At most one newly demonstrated in-scope publication repair is included: reproduce it RED→GREEN, rerun affected acceptance and the final checks justified by runtime changes, independently review the new immutable repair, obtain exact-head CI and a reviewed follow-up merge before the second candidate. This optional second implementation PR/review is for a new defect, not bookkeeping or repeated review of already-fixed findings. If the second candidate still fails, restore, preserve evidence and report the incomplete milestone; do not label restoration alone feature completion.
8. Native worktree archive, confirmed archived attachment and exact checkout absence, useful proof sealing/readback, post-archive task completion, removal of only this plan's owned caches, and final clean-main verification. Capture actual workspace paths returned by the skill tools. When carrying a ledger from the worktree to primary, initialize primary's own plan marker and copy evidence without replacing that marker with a worktree-specific absolute path. Verify/copy the actual task-done log before removing either owned cache; never delete siblings or installed skills.
9. Check actual attachment capacity for the worktree, normal PR, possible repair PR and archive headroom before creation/PR/archive. If necessary, preserve references and verify merged status before unlinking at most two obsolete merged standalone PR chat attachments; unlinking affects only chat attachments, and the actual GitHub PRs remain intact. Do not unlink archived-worktree/nested PR records to create room. Queued archive/upload operations remain pending until actual state confirms them.

Excluded: Census/source/API requests or imports, data/selection replacement or intake, new months/products/countries, Canada refresh, remote candidate staging/promotion, R2 reads/writes, raw replay, new dependencies/services, paid changes, accounts/billing, access/indexing changes, outreach, analytics, schedules and recurring jobs. Prior general R2 storage permission does not add an R2 operation to this batch. No shipment-duty/tariff advice or new numerical model is included.

Pause only dependent work for an unexplained source/input/Production change, integrity failure, sign-in/terms/new cost boundary, or repair outside these bounds. Complete unaffected work. An expired session may require the owner to sign in; credentials never belong in chat or proof.

### Published predecessor and bounds

This is the published restoration target, independently rehashed during planning. PR #109's newer rehearsal is not a substitute. Local hashes do not establish current provider assignment; preflight must confirm that separately.

| Item | Pin |
| --- | --- |
| Production deployment | `cf52de00-46f0-44ae-b1df-36e3319c4389` |
| Observed deployment origin | `https://cf52de00.us-trade-tracker.pages.dev` |
| Published package source | `be1c911895f6601001aac7d7b4b7f36ba3d3f95d` |
| Recovery directory | `data/backups/monthly-product-changes/deployment-20261015-r1/packages` |
| Site ZIP | `site.zip`, 410,401 bytes, SHA256 `2d383eb0268069075d05ed630bb9055a29405b6f358e6a5df01dfcd23c30b587` |
| Manifest | `site-manifest.json`, 6,556 bytes, SHA256 `9db8ad151b31a21187190147fd15547c0063adc0c8e765a505d3f7b5e2c3f39b` |

Current published size: 31 entries/1,884,934 raw bytes; largest asset 350,573 bytes. Preserve schema-v1 manifests, templates and noindex,nofollow. Package caps remain 1,000 entries/26,214,400 bytes per asset. The live verifier additionally requires at most 2,097,152 total raw bytes, 4 MiB ZIP, 1 MiB manifest and 128 logical checks, with its existing redirect/time limits. Current raw headroom is 212,218 bytes; measure the candidate and do not raise caps. Preserve the 15,000-file planning alert. No new route or stored download is expected.

## Review focus

1. A monthly/rolling anchor must come from the same world comparison and product it describes, including after portfolio restoration/product switching; imports-only state must never follow Exports or an older excluded release. Tasks 1–2.
2. Zero share change and zero prior duties are valid link cases; unavailable denominators, incomplete periods, coverage and classification must withhold only the affected link, preserving figures and qualifications. Tasks 1–2.
3. World research must not be attached to merchandise-ranked partner summaries or depend on available mover rows; empty/unchanged country rankings and no-JavaScript navigation must remain truthful. Tasks 1–3.
4. Navigation-only edits must preserve the compact payload boundary, numerical producers and all 139 existing CSV identities, seven accepted files, eleven protected files and Canada's fixed snapshot. Task 3.
5. Publication must use the reviewed merged package and actual target/origin; a regression must restore the exact prior verified package. Completion must follow actual archive, preserved final logs, owned-cache absence and clean main. Task 4.

## Task 1: Static product briefing links

**Files:** Modify `src/components/ReleaseBriefing.tsx`, `tests/ui/ReleaseBriefing.test.tsx`. Reuse unchanged `src/lib/trade/duty-changes-link.ts` and duty comparison types/calculators.

**Interfaces:** Consume `worldDuty.latest`/`.rolling: DutyComparison` and `dutyChangesPath(productCode,selection,hash)`. Produce native anchors through private `DutySummary({value,rolling=false,research}:{value:DutyPeriod;rolling?:boolean;research:{href:string;label:string}|null})`; exported `ReleaseBriefing` remains unchanged.

- [x] Add failing `briefing_duty_links_keep_product_period_and_share_metric` cases for 090121/090111, asserting the exact four hrefs above, link placement inside its world monthly/rolling card, and unchanged displayed amounts/periods. Existing generic history and merchandise links remain exact.
- [x] Add failing cases for `zero_share_change_keeps_duty_research`, `zero_prior_duties_keeps_share_research`, `qualified_verified_coverage_keeps_research`, legacy absence, missing/suppressed amounts, unavailable coverage, zero current/prior consumption and unverified classification. Test monthly available/rolling unavailable using an unrelated missing month or narrower classification span; withhold only rolling. Preserve valid status/value/coverage and country<=world invariants when mutating fixtures.
- [x] Assert an otherwise valid world summary retains its link with no country rows or only unchanged countries. Use the existing synthetic helpers; do not pass malformed source fixtures off as navigation failures.
- [x] Run `npm test -- tests/ui/ReleaseBriefing.test.tsx --maxWorkers=2`. Expected RED: new links absent. Implement only the specified rendering/props/helper import, then rerun expecting all cases pass and commit.

## Task 2: Portfolio world duty links

**Files:** Modify `src/components/PortfolioBriefing.tsx`, `tests/ui/PortfolioBriefing.test.tsx`. Prepared portfolio/model/download code stays unchanged.

**Interfaces:** Consume unchanged `PortfolioDirection.worldDuties:{latest:DutyComparison;rolling:DutyComparison}|null`. Extend private `DutySummary({label,value,id,research=null}:{label:string;value:DutyComparison;id:string;research?:{href:string;label:string}|null})`. Existing partner calls omit research. Exported `PortfolioBriefing({data}:{data:PreparedPortfolio})` remains unchanged.

- [x] Add failing `portfolio_world_duty_links_keep_product_and_period` cases scoped to both real product cards and world monthly/rolling sections. Assert exact hrefs/labels, then deselect/reselect products and restore saved selection/history without crossed product links.
- [x] Assert no new duty-research links in Exports, a legacy release, an older/mismatched product card or the Partner highlights region. Imports restored after Exports gets the correct two links. Static default HTML contains anchors with unique existing IDs and the existing no-JavaScript explanation.
- [x] Apply the same zero/qualified/unavailable/independent-period boundary cases as Task 1 to world summaries; partner highlights and portfolio CSVs/figures remain unchanged. Do not gate on highlighted partners or add observations to `PreparedPortfolio`.
- [x] Run `npm test -- tests/ui/PortfolioBriefing.test.tsx tests/ui/ReleaseBriefing.test.tsx tests/trade/duty-changes-link.test.ts tests/trade/portfolio-briefing.test.ts tests/trade/portfolio-downloads.test.ts --maxWorkers=2`. Expected new portfolio cases RED, then GREEN after the specified props/call-site changes. Commit.

## Task 3: Browser, numerical compatibility and packages

**Files:** Create `tests/e2e/briefing-duty-research-links.spec.ts`, `docs/validation/briefing-duty-research-links.md`; update README and this plan with factual local evidence. Use ignored bounded proof helpers. No production files beyond Tasks 1–2 unless a demonstrated scoped wrapping/focus repair is required.

**Interfaces:** Consume the new native anchors, unchanged destination radios/copy/CSV behavior, existing stage/prepare/package commands and exact accepted selection. Produce a committed local checkpoint, tested runtime/package/input identities and preservation evidence for Task 4.

- [x] Add browser journeys for two fixture products × two entry points × two periods; expected to pass after Tasks 1–2's RED→GREEN unit cycles. Ordinary fixture routes use 090121/090122; retained/live checks use real 090121/090111. Scope source links to the correct world card, reach by keyboard and follow them; assert product, Imports, period, Share change in percentage points and `#duties-changes-heading`. Match current/prior dates, duties, consumption and world shares. Existing sample monthly country rankings may be empty: assert the explanation and valid CSV header rather than inventing rows.
- [x] Download each journey's unchanged `hs-<code>-imports-estimated-duty-changes-<period>-share.csv`, verify its provenance/period fields and bytes against independent fixture/retained expectations; an empty ranking requires the unchanged header-only CSV and visible source/period, not nonexistent row fields. Check copy/reload and native Back/Forward. Test 320/375px geometry/focus, zero product-briefing islands, no raw observation payload growth, no page errors and no outside requests.
- [x] Follow product/default-portfolio anchors with JavaScript disabled. Destination explicitly shows its existing Imports/rolling/share default and explanation; monthly query restoration is not claimed. Keep generic history, merchandise links and profile/portfolio downloads working.
- [x] Run focused owning tests and `npx playwright test tests/e2e/briefing-duty-research-links.spec.ts` after explicit fixture build as needed. Then one final `npm test -- --maxWorkers=2`, `npm run check`, explicit fixture `npm run build`, all three `npm run test:e2e` suites, and configured Python `-m unittest discover -s tests/packaging -v`. Expect all pass and zero diagnostics. Baseline is 1,516 unit/172 browser/24 Python; record actual new counts rather than treating baseline as the target. Repeat broader checks only for a new failure/change.
- [x] From a clean committed source, run stage-create/readback, explicit Census/snapshot build, post-build readback, assembly and Python site/withdrawal create/verify plus deterministic recreation. Authenticate before/after the seven copied files (currently 8,186,318 bytes), eleven protected originals, committed selection, Canada projection, producer files and source inventory. Only the two intended runtime components may differ from planning main; serializers/calculators/templates remain exact.
- [x] Replay **139 unique existing CSV outputs**: the prior 135 matrix (112 legacy + six duty + 17 share) and four monthly product outputs. Authenticate the predecessor seal `9da2967e5b91eabebabc8a7a302e9b02767c9a240f65059042890853468efcc6`; the four additional files/identities are in `execution/local-reader-r5/receipt.json` (SHA256 `f7b4fffb6e32ad6089af290585b0e82c8a1bf9f97e9f6696c0829f1cb0506dc8`) and corresponding downloads, with public equivalents in `execution/live-reader-r1/receipt.json`. Do not count duplicate captures or Canada projection as additional CSVs. Retain the extra-28 legacy cases' indirect producer-binding qualification. Adapt only private source allowlists to permit the two component changes; do not loosen input/serializer/hash expectations.
- [x] Serve only the assembled retained tree on owned loopback; verify all eight real journeys/CSVs, representative unchanged product/portfolio/product-changes downloads and bounded Canada/private-route smoke checks. Inspect representative desktop/mobile/static screenshots. Measure entries/raw/gzip/largest/JS/CSS and compare served assets against the pinned predecessor, explaining component HTML/portfolio JS, generated IDs and Methods preparation-time differences. Record failures, limits and pending review/publication/cleanup truthfully; commit local validation/README/plan.

## Task 4: Independent review, publication and actual cleanup

**Interfaces:** Consume immutable completed source, Task 3 evidence, the pinned predecessor and existing Free project. Produce exact-head reviewed merge, verified public update or a restored predecessor with truthful incomplete status, bounded sealed proof and confirmed cleanup.

- [ ] Self-review the design and five Review focus points. Obtain one fresh most-capable-model whole-branch review with immutable base/head, plan/spec/evidence and ledger rulings. Root grades findings by user effect, fixes Critical/Important findings in one bounded RED→GREEN/full-suite pass, records deferred minors/rulings and rebinds affected retained acceptance. No per-task or duplicate fix reviews.
- [ ] Push/create/attach the implementation PR with accurate local evidence. Require successful exact-final-head push and PR Code checks, merge using the expected head, synchronize clean main and prove reviewed/tested non-documentation source equality. Build/package only if runtime changed; documentation-only merge differences do not justify repeating the full rehearsal. Preserve actual source/input/package bindings and the original proposal before main synchronization.
- [ ] Read back the predecessor ZIP/manifest pins, verify the existing signed-in Free project/Production/origins and bounded prior live health, and upload only the authorized verified candidate. Capture actual dashboard assignment/origin; run bounded existing verifier and numerical/browser acceptance for eight new journeys, unchanged coffee/product-changes/portfolio downloads and Canada sharing/private routes. Record actual counts and any propagation retry. A successful upload alone is not acceptance.
- [ ] On regression, execute the automatic exact predecessor restoration and readback before diagnosing a bounded repair. Apply the explicitly authorized optional repair/second-candidate cycle only for a demonstrated in-scope defect. Preserve failed evidence and truthfully distinguish a verified updated site from a restored prior site; no speculative retries, guessed origins or silent cap increases.
- [ ] Stop only owned previews. Resolve/record primary's own plan workspace marker before carrying evidence across checkouts. Preserve useful proof within caps, seal and read it back; request native archive and confirm actual archived attachment plus exact checkout absence. Then run the private post-archive verifier, preserve the actual completed ledger/logs, remove only exact authenticated plan-owned caches and read back the seal/post-seal records. Confirm clean main and actual public assignment. Report all rulings/deferred minors and remaining launch limitations. No bookkeeping-only PR is planned.

## Self review and approval handoff

This is one bounded extension of existing flows, not a new subsystem. Interfaces consume comparisons already prepared; no raw data crosses a new boundary. Eligibility explicitly treats zero as valid, keeps reporting qualifications and separates monthly from rolling availability. Only world cards link to all-country rankings; legacy/Exports/mismatched products retain existing behavior. Static defaults remain explicit. Tests own every Review focus, while retained compatibility distinguishes 139 unique outputs from duplicate captures and preserves historical limitations.

Publication/restoration authority names the exact existing project and published predecessor, separately from PR #109's rehearsal. Native archive, actual log locations and final cache absence are completion gates. Broader data intake, recurring processing and demand validation remain later decisions.

Review the combined design, four tasks and permission envelope. Approval authorizes root implementation, independent review, reviewed merges, bounded publication/restoration and actual cleanup without routine approval pauses.

## Execution checkpoint

Tasks 1–3 completed locally at tested source d4695cba3ffa19be13eb6d28dd86314ec8be5584; 1,552 unit/184 browser/24 packaging tests, zero diagnostics, all 139 CSV identities and seven/eleven input protections passed. Exact package and retained-browser evidence are in the validation record. Task 4 review/CI/merge/publication/live verification/actual cleanup are pending at this committed checkpoint. The original approved proposal is preserved byte-for-byte in private evidence.
