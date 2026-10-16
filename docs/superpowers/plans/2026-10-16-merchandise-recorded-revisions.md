# Merchandise Recorded Revisions Design and Five-Task Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root implements; read-only auditors may authenticate evidence, and one fresh independent reviewer checks the immutable whole branch before integration. Track steps with checkbox (`- [ ]`) syntax. This is a bounded completion of existing merchandise profiles, not a new revision-history or data-refresh system.

**Goal:** Identify the exact displayed monthly merchandise observations carrying a recorded revision, without confusing a release-wide flag with a row-level mark.

**Architecture:** Project the existing canonical revision-key list into each profile point, then reuse that flag in the table, chart/PNG and matching monthly CSV. Preserve the existing release-level provenance flag, observation values, calculators, archive/transport schemas and all other CSV contracts. Publish one verified package through the existing pilot process, with bounded predecessor restoration.

**Tech Stack:** Existing Astro/React/TypeScript, Node 24, Vitest/Testing Library/Playwright and Python 3.12+ tooling. Locked dependencies only; no new action, package or service.

**Spec:** This combined bounded design and the original brief's requirement to mark revised figures in `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md` (Data foundation and reliability), alongside its shareable-chart and methods requirements (First release). The owner requested the next tasks and complete permissions together for review, overriding separate design/plan handoffs. Planning is authorized; implementation/publication waits for approval of this document.

## Assessment and alternatives

PR #113 is complete on main **fba50f9e307b6cd0fb67b2a396a7ad68db320d44**. Its actual integration, native archive, checkout/cache absence and final readback are retained under `data/backups/manual-workflow-test-runtime/verification-20261016-r1`. Authenticate preservation manifest SHA256 `33309ee6028b8872a910aa69520021ad8ebc8fe60d6ebe61091e10b610613044`, finalization SHA256 `82f005a5f228e91f3d9be58ae3cd486f2e28df2df5ffea1653f8b1324eca7400`, and final-readback SHA256 `414bd2294b8d47e890e133f6c8314e02e815205f74915a85033aaf4961de9291`. Follow authenticated input references to the seven accepted/eleven protected identities.

Two read-only assessments confirmed the gap. `findRevisedKeys` already records exact identities, and compact browser transport preserves them. `buildProfileView` drops that precision; its only revision output is true whenever any merchandise key exists anywhere in the retained release. The monthly table has no marks, and its CSV repeats that global flag on every row. A revision to another country/direction/window can therefore set a CSV's `revised` field without identifying a changed displayed figure.

Both current accepted coffee releases have empty merchandise and duty revision lists. This is a latent traceability gap, not evidence of incorrect published numbers or observed customer demand. Recommend completing merchandise attribution before a later revised release. Pausing for owner-run pilot observations remains the strongest strategic alternative. Doing duties simultaneously would enlarge the contract: amount, consumption, dutiable value, coverage and derived ratios need distinct input-attribution rules. Leave that follow-on separate. No new catalog, account, alert or navigation feature is proposed.

## Bounded design and contracts

### Recorded evidence and identity

Add required `recordedRevision:boolean` to `ChartSeries.points` in `src/lib/trade/types.ts`. Keep `ProfileView.provenance` and its `revised` boolean unchanged.

Reuse `observationKey` with the compatible narrower input signature:

`observationKey(row: Pick<Observation,'direction'|'productCode'|'month'|'geography'|'partnerCode'|'measure'>): string`

Its implementation and output stay unchanged: `direction/productCode/month/geography/partnerCode/measure`. For example: `imports/090121/2025-01/country/1220/GEN_VAL_MO`.

Inside existing `buildProfileView(release:Release, selection:ExplorerSelection):ProfileView`, create one set of `release.revisedKeys`. For every displayed month and series, test the complete canonical identity, with world/`-` versus country/code and the direction's correct measure. Do this even when that month's current observation is absent. Removed observations can carry revision keys and must remain unavailable plus marked. Do not require an observation object to construct the key, infer a world mark from a country's key, or mark an entire month's countries together.

No previous-release read, recalculation of revision history or new persistence is needed. Keys describe recorded differences against the previous retained release within overlapping history, including additions/removals and value/status changes. They do not supply old values, causes, revision dates, cumulative history or finality. No key means **no recorded mark**, not “never revised.” Initial snapshots can lack a comparison baseline. Entirely removed countries remain outside current selectable coverage; this batch does not reconstruct their names or add navigation for them.

### Table, chart and download presentation

`TradeTable({view}:{view:ProfileView})` marks only the affected amount cell with visible inline **Revised** text, including `$0` and `Unavailable` cells. Use ordinary text and existing table/scroll behavior; do not rely on color, a hover tooltip or a new control. Add a short visible explanation: marks represent recorded changes against a previous retained release, and absence is not a final/never-revised claim.

In `TradeChart`, keep all amounts, coordinates, line connections, colors, dashes and classification gaps. Render a recorded revised reported point as an open circle (white fill, existing series-colored stroke, radius 4, stroke width 2); keep ordinary filled points at their existing radius. Append **Recorded revision** to that point's title. Missing/suppressed points still have no plotted amount or circle; the table/CSV carries their mark. The shared plot supplies desktop/mobile behavior. Explain open circles in the existing desktop SVG note so the 1,920 × 1,080 PNG retains the meaning; explain revised unavailable cells through the visible chart/table note. Check note width rather than clipping or shrinking it unreadably.

Change only the merchandise profile's source summary and merchandise PNG footer wording to **Merchandise release revisions: yes/no**, retaining the global boolean's existing meaning. Methods explains the distinction and that other existing download `revised` fields remain release-level summaries. Do not silently redefine other views' provenance or add per-observation flags to duties, shares, rankings or portfolio outputs.

`serializeCsv(view:ProfileView):string` retains its existing 19 headers, order, values, escaping, row order and filename. Always append these two columns after `source_urls`:

| Header | Value | Meaning |
| --- | --- | --- |
| `revised_scope` | Literal `merchandise_release` | Scope of the existing legacy `revised` field |
| `observation_recorded_revision` | `true` or `false` | Exact displayed point identity has a recorded merchandise key |

This is an explicitly authorized append-only download-contract change. Do not rename/repurpose `revised`, add conditional headers, introduce another download/version switch or change any other serializer. A strict column-count consumer may need adjustment; existing columns retain their meaning. Current accepted data must yield false legacy/point flags, with no invented real-data badges.

### Synthetic and retained acceptance

For browser evidence, add exactly two canonical merchandise keys to each existing synthetic profile fixture, replacing its empty top-level list only:

- `imports/<fixture product>/2025-01/world/-/GEN_VAL_MO`
- `imports/<fixture product>/2024-07/country/1220/GEN_VAL_MO`

Use existing products 090121 and test-only 090122 in `tests/fixtures/product-release.json` and `product-release-090122.json`. Preserve observations, statuses, amounts, dates, source labels, duty keys and registry. These exercise a reported world point and the existing unavailable Canada month, while Exports and the selected-country last-twelve-month view remain unmarked despite a true release summary. Adjust the existing synthetic briefing count expectation from zero to two; do not alter real accepted releases. Unit tests separately cover a removed monthly observation and other identity dimensions.

The authenticated historical compatibility set contains **139 unique CSV identities**. Exactly **16** are merchandise profile CSVs (two real products × two directions × two windows × world/three-country selections); those intentionally gain the two columns. The other **123** must remain byte-identical. For each changed file, independently parse quoting/newlines and verify the exact new headers and boolean values; reproducing only its original columns must reproduce the prior bytes. Do not compute the expected old file by invoking the changed serializer. Canada's separate projection remains exact. Preserve the extra-28 historical indirect producer-binding qualification; duplicate browser captures do not increase the unique count.

Authenticate the 139-case lineage through PR110's completed proof below. Its predecessor legacy84 receipt is `data/backups/monthly-product-changes/deployment-20261015-r1/execution/staged-compatibility-r2/legacy84/receipt.json` (16 `-profile.csv` paths); extra28 has no profile CSV. The four monthly-product cases are bound by `execution/local-reader-r5/receipt.json`, SHA256 `f7b4fffb6e32ad6089af290585b0e82c8a1bf9f97e9f6696c0829f1cb0506dc8`, under that same root. Follow existing authenticated receipts/seals; never generate trusted baseline identities from new output.

## Global constraints and complete permission envelope

Approval covers all five tasks without routine permission pauses:

1. Root implementation, read-only input auditors, one fresh whole-branch reviewer, managed worktrees/branches/commits and scoped runtime/filesystem/network permissions for these operations. Use existing Node 24/Python and locked `npm ci --ignore-scripts`. Preserve original approved plan bytes/hash before execution checkboxes change.
2. Modify the named profile types/projection, the compatible key parameter type, table/chart/source presentation, only `serializeCsv`, Methods, owning tests and exactly the two synthetic revision-list edits. Add a concise validation record and README link/status. Other test literals may receive the required point boolean only where type checking requires it. Do not change revision writers, canonical release/archive/wire schemas, other calculators/serializers, workflow files, selection/classification, dependencies, action pins, routes, data availability or accepted observations.
3. Read/authenticate prior proofs and the same seven accepted/eleven protected identities before/after. Copy only the seven existing processed accepted state files into at most three fresh ignored stages, each at most 16 MiB. No official raw replay, data import or accepted-file mutation. Private helpers, logs, compatibility receipts, package copies, screenshots and completed evidence belong under ignored `data/backups/merchandise-recorded-revisions/deployment-20261016-r1`, at most **1,000 files/128 MiB**. Preserve prior originals and proof.
4. Focused and final unit/type/browser checks, clearly synthetic and retained builds, existing stage/create/readback/assembly/Python package verification, deterministic package recreation, exclusive owned loopback previews with outside requests blocked, browser-generated PNG/CSV checks and up to twelve selected screenshots. Set the existing Python prerequisite. One final local unit run may use the already measured two-worker/30-second test allowance; repository/hosted timeouts and performance claims stay unchanged. Stop only owned preview processes and clean only owned temporary outputs.
5. Push/create/attach/update one normal public implementation PR in `Vasuki8/us-trade-tracker`, independent review, existing push/PR Code checks on its exact final head, expected-head reviewed merge and clean-main synchronization. Keep the package manifest's actual tested source commit and prove its non-documentation source matches the CI-passed/merged source; do not relabel a build or rebuild for documentation-only differences. Actual later publication/cleanup results go in private finalization and the same PR description, avoiding a bookkeeping-only PR. No data workflow dispatch.
6. Read-only signed-in Cloudflare preflight and upload of the exact reviewed/verified package to existing **Free / Production / us-trade-tracker**, account **2e23d873002d29a02a1427e1fa37c5cd**, canonical **https://us-trade-tracker.pages.dev**. Confirm target/plan/Production assignment and the pinned predecessor before upload. No new project, domain, access/indexing setting or paid change. An expired sign-in may require the owner to sign in; never request credentials in chat or preserve them in proof.
7. Bounded live verification on the canonical and dashboard-observed deployment origins only: existing `site:verify`, plus at most 32 named browser cases. Reserve 16 cases for the real profile selections and their CSVs; include four representative PNG exports within those cases. Reserve at most 16 further cases for static/mobile behavior and existing changes/portfolio/Canada/private-route smoke checks. Use at most one verifier run per predecessor/candidate/restoration transition plus one read-only retry for demonstrated propagation/transient failure. Do not guess origins, crawl unrelated routes or contact Census/source links.
8. Automatically restore the exact verified predecessor below if the candidate regresses, at most once per failed candidate, and verify restoration. Include at most **one** newly demonstrated in-scope publication repair: reproduce RED→GREEN, run affected/final checks justified by the change, independently review the new immutable repair, require exact-head CI and a reviewed follow-up merge before a second candidate. Maximum two candidate uploads. If the second fails, restore and report the feature incomplete; restoration alone is not completion. A new issue beyond this bounded profile/CSV behavior requires separate scope.
9. Preserve actual logs/proof, native archival with confirmed archived attachment and exact checkout/Git-registration absence, an independently initialized primary plan marker, completed-log preservation before deleting only owned plan caches, and final clean-main/readback. Queued archive/upload operations remain pending until confirmed. At setup reserve three native attachment slots; if needed, preserve identity/URL and confirm merged status before unlinking at most two obsolete merged standalone PR chat attachments. Actual GitHub PRs and nested archive attachments remain intact; recheck capacity for a repair PR/archive.

Excluded: new Census/source/API requests, official raw replay, imports/manual data-job dispatch, accepted-data/pointer/selection/classification replacement, new products/countries/months, Canada refresh, remote candidate staging/promotion, R2 reads/writes, per-measure duty/derived-share revision features, historical revision reconstruction, old-value/date/cause claims, new dependencies/services, paid/access/indexing changes, analytics, outreach and recurring jobs. Existing R2 capacity permission is unused. This does not close pilot-demand or successive-official-release acceptance.

Pause only dependent work for unexplained input/Production drift, integrity failure, unavailable evidence/sign-in or a new material access/cost boundary. Complete unaffected work; do not weaken verification to fit an unexpected result.

## Published predecessor and fixed bounds

PR110's completed public proof is `data/backups/briefing-duty-research-links/deployment-20261015-r1`: preservation manifest SHA256 `57e64ad4ad41b9767e09bae6478179900e12b75d549f12c9cab71aa2f683e79f`, post-seal finalization SHA256 `c7be72f8c33bbe482d3dd64be1694fa42201db9fa8585a544057f68661912747`, final-readback SHA256 `0ede92b86c84a7f91ecc7b79846d69502944f40f9bb314c9145610a2b4b9303a`. Planning rehashed the finalization and the following package pair. Existing local pins do not establish current provider assignment; signed-in/live preflight must confirm it.

| Item | Pinned predecessor |
| --- | --- |
| Production deployment | `1643f232-a3e0-4f85-baf9-21d0b54a7ba0` |
| Previously observed deployment origin | `https://1643f232.us-trade-tracker.pages.dev` |
| Actual tested package source | `d4695cba3ffa19be13eb6d28dd86314ec8be5584` |
| Package directory | `data/backups/briefing-duty-research-links/deployment-20261015-r1/packages` |
| Site ZIP | `site.zip`, 410,664 bytes, SHA256 `ef971ea96a86c8baa7092b50df0aeb1a4e9aecac8eb17d19e306e7a2efcbabba` |
| Manifest | `site-manifest.json`, 6,557 bytes, SHA256 `b52340cfb95b1bdc54bd201cbf60caf6131f190b37b77eedb9729da26d915482` |

The published package has 31 entries/1,886,967 raw bytes; measure the candidate rather than copy these metrics. Preserve schema-v1 manifests, provider templates and `noindex,nofollow`. Existing local package caps stay 1,000 entries and 26,214,400 bytes per asset; live-verifier caps stay 2,097,152 raw bytes, 4 MiB ZIP, 1 MiB manifest and 128 logical checks across its two origins. Keep its redirect/time bounds and the existing 15,000-file planning alert. Do not raise caps or add public R2 delivery. No new route or stored download is expected.

## Review focus

1. Exact identity and selection isolation: another product/direction/measure/geography/partner/month or out-of-window key must not mark the displayed cell, even when the global release flag is true. Task 1.
2. Zero, missing, suppressed and removed monthly observations retain their values/availability and can carry a recorded mark; absence of a key or initial baseline must never imply finality, old values, dates or causes. Tasks 1–2.
3. CSV compatibility is intentionally 16 append-only changes plus 123 exact outputs, not a broad waiver. Legacy `revised` retains scope, new fields are explicit, and quoting/newlines and source provenance remain exact. Tasks 2–3.
4. Markers are accessible in server HTML and after saved-view restoration; PNGs retain their legend and latest-view identity, while gaps/classification lines and unrelated duty/share outputs stay unchanged. Tasks 2–3.
5. Current real data has no recorded keys: do not invent badges. Publish only the reviewed merged-source package to the confirmed existing target; regressions restore the pinned predecessor, and completion follows actual evidence/cleanup. Tasks 3–5.

## Task 1: Preserve precise revision identity in profile points

**Files:** Modify `src/lib/trade/types.ts`, `src/lib/trade/normalize.ts`, `src/lib/trade/profile.ts`, `tests/trade/profile.test.ts` and `tests/trade/browser-release.test.ts`. No browser transport implementation or revision-writer change.

**Interfaces:** Consume existing `Release.revisedKeys` and the canonical `observationKey` above. Produce required `ChartSeries.points[].recordedRevision:boolean`; existing `buildProfileView` signature/provenance remains unchanged.

- [x] Authenticate completed PR113/public predecessor proof and trusted input/CSV identities, preserve the approved proposal, and establish isolated worktree/ledger. Expected clean base and unchanged originals.
- [x] Add failing `profile_recorded_revision_matches_all_identity_dimensions` cases with canonical keys, testing selected world/country, both directions/products/measures, multiple countries and window isolation. Assert global provenance can be true while every displayed point is false. Run `npm test -- tests/trade/profile.test.ts --maxWorkers=2`; expected RED because point attribution is absent.
- [x] Add `removed_month_retains_recorded_revision_without_a_value`, missing/suppressed/zero and empty-initial-key cases. Keep the country selectable through other retained months. Assert numeric observations, comparisons, classification breaks and source metadata do not change when only revision keys change.
- [x] Narrow only the compatible key parameter type, add the point boolean, and calculate exact set membership for each displayed identity including absent monthly rows. Use canonical nonempty browser-roundtrip keys and assert identical precise flags after decode, without a wire/schema change. Run `npm test -- tests/trade/profile.test.ts tests/trade/browser-release.test.ts --maxWorkers=2`; expected GREEN. Commit.

## Task 2: Render and export the precise marks

**Files:** Modify `src/components/TradeTable.tsx`, `src/components/TradeChart.tsx`, `src/components/ProductExplorer.tsx`, only `serializeCsv` in `src/lib/trade/downloads.ts`, and the Revisions/downloads explanation in `src/pages/methods.astro`. Create `tests/ui/TradeTable.test.tsx` and `tests/trade/profile-revisions-csv.test.ts`; extend `tests/ui/ProductExplorer.test.tsx` and `tests/ui/TradeChartDownload.test.tsx`.

**Interfaces:** Consume Task 1's `recordedRevision`. Table/chart exported signatures stay unchanged; `serializeCsv(view:ProfileView):string` produces the same 19 original columns plus the two exact appended columns above. Keep `TradeChartDownload` runtime unchanged unless its existing generic identity demonstrably fails.

- [x] Add failing cell/SSR cases for only the matching amount, unavailable marked cells, zero and mixed selected countries; add chart assertions for revised open circles/titles/legend and unmarked filled points. New presentation assertions must fail before implementation. Implement visible text and the specified shared plot styling, retaining all numerical/line behavior.
- [x] Add failing parsed CSV cases asserting exact header order, scope literal, true/false per identity and unchanged legacy release-wide values, including quoted descriptions/newlines. Implement only `serializeCsv`'s appended fields; preserve filenames and every other serializer.
- [x] Clarify profile source/PNG footer and Methods wording. Add a point-revision-only context change to the existing stale-PNG tests: old success/error must be suppressed and CSV must use the latest view. The existing generic `view.series` identity should already handle it; do not manufacture a runtime rewrite.
- [x] Run `npm test -- tests/ui/TradeTable.test.tsx tests/ui/ProductExplorer.test.tsx tests/ui/TradeChartDownload.test.tsx tests/trade/profile-revisions-csv.test.ts tests/trade/browser-release.test.ts --maxWorkers=2`. Expected all pass, including existing readiness/focus/unmount/CSV quoting safeguards. Commit.

## Task 3: Verify synthetic behavior and retained compatibility/package

**Files:** Modify only top-level revision lists in `tests/fixtures/product-release.json` and `product-release-090122.json`, and the corresponding count in `tests/e2e/release-briefing.spec.ts`; create `tests/e2e/profile-recorded-revisions.spec.ts`. Add `docs/validation/merchandise-recorded-revisions.md`, update README and execution checkboxes. All large evidence/helpers remain private.

**Interfaces:** Consume Tasks 1–2, the two exact synthetic keys per fixture, trusted 139-CSV lineage, seven accepted files and the existing stage/prepare/package APIs. Produce checked fixture behavior and one immutable retained candidate/withdrawal package pair with numerical, compatibility and source binding.

- [x] Add failing fixture-browser cases for reported world marks in the 60-month view, unavailable Canada July 2024, unmarked Exports and last-twelve-month Canada, both existing fixture identities, copied links/reload, keyboard, 320/375px layouts and no-JavaScript defaults. Add only the specified fixture keys/count expectation; preserve fixture observations/duties/registry.
- [x] Commit runtime/tests/fixture changes before exporting/staging the tested source. Set the existing `SITE_PACKAGE_PYTHON` prerequisite and run one final `npm test -- --maxWorkers=2 --testTimeout=30000`, `npm run check`, `npm run build` with explicit `TRADE_DATA_MODE=fixture`, and `npm run test:e2e` (all three existing configurations). Run configured Python `-X utf8 -m unittest discover -s tests/packaging -v`. Expected all current and new checks pass, zero type diagnostics, no outside/source requests. Preserve actual failed and passing evidence rather than changing expected numbers to hide a mismatch.
- [x] Stage only authenticated accepted state with private preview modes unset, explicit Census product mode and Canada `snapshot`; run existing pre/post-build readback, assembly, site/withdrawal create/verify and deterministic recreation. Bind manifests to the actual committed tested source and inputs; measure count/raw/gzip/largest/JS/CSS against fixed caps. Do not publish this step.
- [x] Reproduce the 139 unique CSV identities: verify the 16 intentional append-only changes with independently preserved original-column bytes, `revised_scope=merchandise_release`, and false legacy/point revision flags for these accepted releases; require all other 123 outputs and Canada's projection exact. Use independent expected keys/amounts, not application calculators as their own oracle. Rehash all originals.
- [x] Use one exclusive retained-package preview to check both real profiles/directions/windows/world and three-country selections, all 16 profile CSV cases, zero invented markers, four representative PNGs/footers and bounded existing duty/share/changes/portfolio/Canada/private-route coexistence. Inspect selected screenshots and PNGs; verify actual dimensions, SVG note bounds, table scrolling and static defaults. Record scope/limits and commit the local validation checkpoint. Later docs must preserve the tested non-documentation source.

## Task 4: Review and integrate the exact candidate source

**Files:** Private review/integration evidence and the same public PR description; no further runtime change expected.

**Interfaces:** Consume Tasks 1–3 and immutable base/head/source/package identities. Produce one independently reviewed and exact-head-CI-passed merge bound to the candidate. Publication remains the separately gated Task 5 within this approval.

- [ ] Self-review the five focus points, then obtain one fresh whole-branch review of code, exact CSV contract, recorded-key semantics, fixtures, compatibility, package and planned target. Resolve material findings in one verified pass; record rulings/deferred minors. Do not repeat review or large checks without a material reason.
- [ ] Push/create/attach the implementation PR. Require successful push and PR Code checks on the exact final reviewed head, merge with expected-head protection and synchronize clean main. Confirm the candidate's tested non-documentation source equals the merged implementation; retain its actual manifest commit.
- [ ] Preserve local acceptance/review/CI/integration receipts and authenticate prior/candidate package pairs. Record no public success until Task 5's actual upload and verification. Keep the worktree available for the bounded repair allowance.

## Task 5: Publish, verify, restore if necessary and finish cleanup

**Files:** Private deployment, live-check, restoration and finalization records; update the same PR description with actual results. No bookkeeping-only PR.

**Interfaces:** Consume the CI-passed merged-source candidate, pinned predecessor, confirmed existing Free Production project and observed origins. Produce a verified public update plus actual preserved completion evidence; or honest incomplete outcome after bounded restoration if a regression cannot be resolved within scope.

- [ ] Confirm account/project/Free plan/Production assignment, observed origin and predecessor package/site before uploading. Stop dependent publication for unexplained drift, missing proof or a new cost/access boundary; do not guess or substitute another rehearsal ZIP.
- [ ] Upload the exact verified candidate; wait for actual Production assignment, observe its deployment origin, then run the bounded verifier and named live merchandise/CSV/PNG/static/mobile/coexistence checks. Expected new columns/labels with the same accepted numbers, no invented real revision marks, exact package/header/404 checks and preserved Canada/duty/share behavior.
- [ ] If the candidate regresses, restore the exact verified predecessor and verify it. Use at most the one authorized newly demonstrated repair/second candidate, with RED→GREEN, review, exact-head CI and reviewed merge before republishing. Retain all failed evidence and never call restoration alone feature completion.
- [ ] Stop owned previews, seal/read back bounded proof and actual completed logs, confirm native archive and exact checkout/Git-registration absence, remove only authenticated owned caches after preserving logs, and verify clean main. Full completion requires actual successful publication plus cleanup, not a queued operation or historical checkpoint wording.
- [ ] Hand off the explicit CSV addition and remaining limits. Markers expose recorded retained-baseline differences, not final data or historical revision dates/causes. Duties' per-measure attribution, real pilot observations and successive-official-release acceptance remain separate work.

## Self-review and approval handoff

The five tasks complete an existing traceability requirement with a small point projection, explicit presentation and a compatible append-only CSV change. Exact interfaces/key order agree across tasks; removed values and release-vs-row scope have owning tests. Compatibility is split deliberately rather than waived, and fixtures cannot manufacture real-data revision claims. Permissions cover implementation through reviewed publication/restoration and actual cleanup while excluding source/R2/data-intake operations. Root implementation with one final reviewer remains the preserved execution method.

Review this combined design, five tasks and full permission envelope. Full approval authorizes execution through publication and actual cleanup without routine approval pauses; it authorizes none of the excluded follow-on work.
