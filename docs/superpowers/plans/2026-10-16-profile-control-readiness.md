# Profile Control Readiness Design and Three-Task Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root implements; one fresh independent whole-branch reviewer. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Keep the existing profile ranking and estimated-duty CSV controls disabled until the saved view is restored, with readable static research and unchanged downloads afterward.

**Architecture:** Reuse ProductExplorer's existing `Boolean(viewLink)` readiness. Pass it to TradeChanges' existing `controlsReady` prop and a small, fail-closed `EstimatedDuties.controlsReady` prop. No new state hook, subsystem or data format.

**Tech Stack:** Existing locked Node 24, Astro/React/TypeScript, Vitest, Playwright and Python packaging tools; existing Free Cloudflare Pages project.

**Spec:** This combined bounded design and the static/default research, country comparison, estimated-duty and sourced-download requirements in `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md`. The owner requests the next few tasks and complete permissions together for one review. This document authorizes planning only until approved; preserve root implementation with independent review.

## Assessment and alternatives

PR116 is complete on main `279d190dd9aa938bb6b0fd2422c591785b24ff89`. The evidence records actual publication and cleanup, not pending work. Authenticate `data/backups/estimated-duty-monthly-revisions/deployment-20261016-r1/post-finalization.json` against SHA256 `a799bf70e8fa6d8be39e71f08a7c579c30972979d4d3a28eb759a40d1da36683` and `post-final-readback.json` against `654b58d28f9de5d4158d3f75f07631fcc5a72e83bb0c04d37e0c9ab04363b33c`, then follow their authenticated references to proof and the seven accepted/eleven protected identities.

The source and prior static acceptance establish two omissions:

- ProductExplorer passes readiness to merchandise downloads and country selection, but renders TradeChanges without its existing readiness argument. Its default is true, so the initial ranking selector and CSV can appear active. Without JavaScript, changing the native selector can change its selected label without updating the ranking tables.
- EstimatedDuties' CSV button has no readiness condition, despite its correct JavaScript-required explanation. PR116 explicitly preserved that existing inert static action.

This is a demonstrated misleading control state, not an observed calculation error, corrupted export or harmful hydration race. Recommend fixing these two omissions. Owner-run pilot observations would provide more strategic evidence, but no sessions have been supplied; another research-preparation document would not replace them. Existing successor-release selection, candidate retention and recovery tooling is already implemented. Actual next-release acceptance remains separate, and this plan makes no fresh calendar/API availability claim. More chart/navigation features are not justified by the evidence considered here.

This is bounded existing-flow work. The owner requested a combined written design, tasks and permission envelope; review this one artifact before execution. No separate speculative subsystem or additional design-approval round is needed.

## Exact behavior and interfaces

Modify only two application files:

1. `src/components/ProductExplorer.tsx`: pass `controlsReady={Boolean(viewLink)}` into the existing TradeChanges and EstimatedDuties instances. Keep restoration, selection, URL handling, rendering order and all view builders unchanged.
2. `src/components/EstimatedDuties.tsx`: extend its existing props with `controlsReady?:boolean`, default false. Disable its CSV button when false and guard its click handler when false. When true, retain the exact existing serialization, Blob type and filename. Do not add an independent effect, timer or readiness state.

Keep TradeChanges' existing props/default and other callers unchanged; MonthlyChanges already passes readiness explicitly. Preserve its no-eligible-ranking disabled condition. SelectedCountryComparison is absent in initial profile HTML until countries restore, so it has no demonstrated initial/static defect to fix here. Existing duty/share PNG controls already disable themselves initially; do not redesign them.

Before restoration, the profile rank selector, ranking CSV and duty CSV must be disabled alongside the already guarded profile controls. Default Imports tables, existing revision labels, periods, coverage qualifications and source text remain readable. Without JavaScript, query filters do not apply and controls remain disabled. Check the real existing explanation through `page.locator('noscript p')`: Playwright's ordinary text locator excludes noscript content. Do not rewrite correct copy to satisfy a mistaken locator.

After restoration, eligible ranking controls/CSV enable, and the duty CSV enables only for the imports view that actually contains it. Restored exports remove the duty section. First downloads must use the displayed restored product/direction/partner selection. Rankings remain independent of chart country/history selections. Empty ranking results remain unavailable for download as before. Native links, static tables and chart qualification symbols retain their current behavior.

No serializer, view/calculation model, accepted data, synthetic fixture, classification, selection contract, workflow, configuration or dependency changes. All 139 retained CSV identities and the separate Canada projection must remain byte-identical to PR116's candidate identities, including its already-added duty revision columns.

## Complete permission envelope

Approval covers all three tasks without routine permission pauses:

1. Root implementation; one read-only input audit if useful and one fresh independent whole-branch reviewer; managed worktree creation/reuse, `codex/` branch/commits and scoped filesystem/runtime/network escalations. Reuse existing locked Node 24/Python and pinned Chromium. If needed, run `npm ci --ignore-scripts` or install only the already-pinned browser version from its official distribution. No new dependencies/actions/services.
2. Read/hash authenticated prior proof and all seven accepted/eleven protected entries before/after. Permit bounded private copies of only the existing seven processed inputs, at most 16 MiB per stage, for one candidate and only if needed one repair stage. No raw-source copying/replay or accepted-data replacement.
3. Application changes limited to the two files above; owning unit/browser tests, this plan's actual progress and `docs/validation/profile-control-readiness.md`. Existing test expectations may change only when directly required by the new disabled-until-restored state. Keep fixtures, figures, CSV schemas/content, rankings and chart behavior exact.
4. Focused RED-to-GREEN tests, one final full local unit/type run, targeted fixture browser checks, independent retained CSV replay, existing stage/build/package/deterministic-recreation checks, bounded local browser checks and PNG inspection. Use the established local `--testTimeout=30000` allowance without changing repository/CI settings. Set `SITE_PACKAGE_PYTHON` to the pinned interpreter. Do not repeat large suites without a diagnosed failure or material change.
5. Preserve original proposal, logs, failures, review, packages, completed ledgers and proof under ignored `data/backups/profile-control-readiness/deployment-20261016-r1`, at most 750 files/96 MiB. Use fresh owned output paths; start/stop only owned previews. Preserve originals before editing execution checkboxes or correcting evidence.
6. Public GitHub pushes, one implementation PR/attachment/description updates, normal CI, successful exact-final-head push/PR Code checks, reviewed expected-head merge under standing permission and clean-main synchronization. No manual import/audit/deployment job dispatch. Record later publication and cleanup in the same PR/private proof; no bookkeeping-only PR.
7. Publication of the exact authenticated candidate to existing **Free us-trade-tracker / Production / main**, account `2e23d873002d29a02a1427e1fa37c5cd`, using existing authenticated access and the proven procedure. Confirm target/Free plan/current Production predecessor before upload. Retrieve current official provider documentation before any direct provider API operation. No new credential, access expansion, project or paid change.
8. One predecessor verification and one candidate verification on the canonical and actual dashboard/provider-observed deployment origins, plus the named bounded browser journeys. Automatically restore the pinned verified predecessor if the candidate regresses, and verify restoration. Permit one demonstrated same-scope repair with fresh tests, independent review, exact-head CI and merge before one second candidate upload/check. If that also fails, restore/verify and report incomplete. Never infer deployment origin from a ZIP hash.
9. Reserve three native attachment slots at setup. If capacity requires it, preserve identity/URL and verify merged status before unlinking at most two obsolete merged standalone PR chat references; leave GitHub PRs and archived nested references intact. Preserve completed logs before native archive; confirm actual archived attachment, checkout/Git-registration absence, authenticated Windows/MSYS cache ownership and deletion of only owned caches. Queued operations remain pending. Final readback requires clean main and unchanged protected inputs.

Excluded: imports/Census/source requests, accepted-data/pointer/selection/classification changes, raw replay, R2 operations or remote candidate staging/promotion, new products/countries/months, Canada refresh, new UI features, new dependencies/services, paid/access/indexing changes, analytics, outreach/participant collection and recurring jobs. Existing R2 storage permission is unused. Pause only dependent work for unexplained drift, missing evidence or a new material boundary.

## Compatibility and restoration pins

PR116 `compatibility.json` SHA256 is `f95e995f817812f6c8803e6765f0eb1da5e702dcc6a7003f85383c5a8fef1b42`. Use **candidate** identities for all 139 cases, including ten duty exports. All 139 must now remain exact; there are no append-only exceptions in this milestone. Preserve the separate Canada projection and the extra28 group's historical indirect producer-binding qualification. Compatibility is not new source validation.

Current verified predecessor: deployment `eae71877-8b84-43d5-925d-cf6518a583b6`, observed origin `https://eae71877.us-trade-tracker.pages.dev`, canonical `https://us-trade-tracker.pages.dev`. Retained PR116 package: `data/backups/estimated-duty-monthly-revisions/deployment-20261016-r1/packages/site.zip`, SHA256 `7d78c9714021a9164799a62e74010716e4d6870c70b05338162a79dc7aad9539`; manifest SHA256 `0c2fc7c4653fd4f9791bac1b76a48c7a471ec8ed79dc20f63cf2bd5673b4eb8f`. Actual package source is `32a25bec5b5dee3e4ea1dafe08bd9f09ad4f3518`. Authenticate these pins and verify actual assignment before publishing; unexplained drift blocks upload rather than substituting another predecessor.

## Review focus

1. With JavaScript absent or held, ranking selection cannot disagree with unchanged static tables, and all three newly guarded controls stay disabled. Tasks 1-2.
2. Restored imports/countries and restored exports must reach the correct first enabled download; no enabling on an independent child timer/effect. Tasks 1-2.
3. No-eligible-country rankings remain disabled after restoration; native research links and default tables remain usable. Tasks 1-2.
4. New duty revision labels/qualifications remain intact and all existing CSV bytes, schemas and filenames remain exact. Tasks 1-2.
5. The served candidate must bind to its actual tested source and current provider target; rollback and actual cleanup cannot be inferred from a queued request. Tasks 2-3.

## Task 1: Correct profile control readiness

**Files:** Modify `src/components/ProductExplorer.tsx`, `src/components/EstimatedDuties.tsx`, `tests/ui/EstimatedDuties.test.tsx`, `tests/ui/ProfileViewLink.test.tsx` and, only as needed for owning readiness assertions, `tests/ui/TradeChanges.test.tsx`.

**Interfaces:** Consume existing `Boolean(viewLink)` and TradeChanges `controlsReady?:boolean`; produce the exact optional fail-closed EstimatedDuties prop above. Preserve all supplied data/view objects and current downloads once ready.

- [ ] Authenticate prior completion/input pins; preserve approved proposal and establish the isolated worktree/ledger. Inspect existing readiness, static-render tests and callback behavior before editing.
- [ ] Add failing server-rendered ProductExplorer assertions for a saved-exports query: initial static Imports remain readable, while Rank changes by, Download changes CSV and Download estimated duties CSV are disabled. Inspect rendered HTML with an actual DOM reader, not source-text grep. Add EstimatedDuties omitted/false/true readiness cases; verify explicit ready state enables the existing keyboard CSV journey, while false remains inert. Preserve unavailable/empty-ranking cases and numerical/revision-label assertions.
- [ ] Run `npm test -- tests/ui/EstimatedDuties.test.tsx tests/ui/ProfileViewLink.test.tsx tests/ui/TradeChanges.test.tsx --maxWorkers=2`; Expected: failures on the currently active static controls, not unrelated setup errors.
- [ ] Wire the parent readiness and fail-closed duty prop only. Run the same command; Expected: all tests pass. Keep existing direct interactive EstimatedDuties tests explicit about `controlsReady={true}` where they exercise downloads. Review scope and commit.

## Task 2: Verify restored views, package compatibility and reviewed integration

**Files:** Modify `tests/e2e/merchandise-download-reliability.spec.ts`, `tests/e2e/estimated-duty-recorded-revisions.spec.ts` and, if needed for its owning static assertions, `tests/e2e/product-profile.spec.ts`; create `docs/validation/profile-control-readiness.md`; update this plan's actual local progress.

**Interfaces:** Consume Task 1's readiness behavior and existing saved-view restoration. Produce exact-source candidate/package proof, independent review and one clean reviewed merge.

- [ ] Strengthen both products' no-JavaScript cases to require disabled ranking selector/ranking CSV/duty CSV, readable default Imports tables and the correct existing noscript explanation. Preserve PR116 monthly revision labels. Extend the existing held-`**/*.js` gate with both products' restored-import duty/ranking cases and the existing restored-export journey. Hold modules before navigation, use `waitUntil:'commit'`, inspect SSR controls, and release the gate in `finally`. After readiness, verify product/direction/country order, duty-section absence for exports and first duty/ranking CSV identities. Check 320/375px keyboard focus after enabled, no page overflow and no artificial sleeps/retries.
- [ ] Build explicit fixture mode and run `npx playwright test tests/e2e/merchandise-download-reliability.spec.ts tests/e2e/estimated-duty-recorded-revisions.spec.ts tests/e2e/product-profile.spec.ts --retries=0` on a verified unused loopback port. Expected: all cases pass, including static and held/restored phases; actual figures and monthly revision attribution are unchanged.
- [ ] Run `npm test -- --maxWorkers=2 --testTimeout=30000` and `npm run check` with pinned Python configured. Expected: all tests pass and zero errors/warnings/hints. Recheck two-application-file scope, unchanged fixtures/serializers/configuration/workflows and seven/eleven original input hashes. Commit tested runtime/tests before staging.
- [ ] Stage the seven existing processed inputs through the current committed selection contract, build, package and verify site/withdrawal outputs; recreate ZIPs deterministically and read every entry back. Capture file count/raw/gzip size/largest asset; preserve existing 1,000-entry/2 MiB served-payload/25 MiB per-asset verification limits and the 15,000-file planning alert. Bind manifests to the actual source commit; later test/documentation corrections must not relabel the package or silently change runtime.
- [ ] Independently replay all 139 CSV cases against authenticated PR116 candidate identities; Expected: all byte-identical, with unchanged Canada projection and historical extra28 qualification retained. In the retained-package browser, cover four duty CSV cases (world and 1220/2010/2050 per coffee product), four default-dollar ranking CSV cases (both products/directions), both static defaults and mobile profiles, plus bounded changes/duty-chart/Canada/private-route coexistence. Check static disabled controls and visible noscript explanations directly. Preserve and inspect one duty and one merchandise PNG; do not treat an unavailable selection as zero.
- [ ] Document actual local results and limits. Obtain one fresh whole-branch review; fix material findings in one verified pass, preserve failures and require successful push/PR Code checks on the exact final reviewed head. Merge with expected-head protection and synchronize clean main, binding its application tree to the tested package source. Expected: independent review/CI/integration pass; publication and actual cleanup remain pending in the same PR.

## Task 3: Publish, verify and finish actual cleanup

**Files:** Private publication/finalization records and the same PR description.

**Interfaces:** Consume the exact reviewed-source candidate, authenticated predecessor and confirmed existing provider target. Produce verified corrected controls and actual cleanup, or an honest incomplete result after bounded restoration.

- [ ] Authenticate and verify the pinned predecessor; confirm existing account/project/Free/Production/main and current deployment assignment. Upload only the exact candidate, then observe the real deployment ID/origin. Run existing served-file/header/404 verification on canonical and observed origins and the bounded static/restored/mobile/CSV/coexistence journeys. Expected: all checks pass with identical data/CSV bytes, disabled inactive static controls, correct first active downloads and unchanged qualifications. Preserve a public screenshot.
- [ ] If the update regresses, automatically restore/verify the pinned predecessor. Use only the authorized one demonstrated same-scope repair/second candidate after appropriate tests/review/CI/merge; if it fails, restore/verify and report incomplete. Do not add a new feature or repair an unrelated issue under this allowance.
- [ ] Stop owned previews; preserve/read back bounded proof and completed logs. Confirm actual native archive, checkout/Git-registration absence and authenticated owned-cache deletion. Record actual results in the same PR; verify clean main and original seven/eleven hashes in final readback. Expected: all three tasks complete with actual cleanup, or explicit incomplete status for any unresolved gate.
- [ ] Hand off the corrected readiness behavior and remaining strategic gates. This change does not establish new official-source validity, successive-release acceptance, participant findings or demand. Further features should follow owner observations or a separately authorized real release update.

## Self-review and approval handoff

The plan changes two existing application files and reuses the current readiness signal; it does not introduce another lifecycle or delivery system. Tests exercise misleading static controls, held restoration, first downloads, exclusions, keyboard/mobile and the newly added revision attribution. All 139 CSVs remain exact, and package/publication/rollback/actual-cleanup requirements are explicit. The owner can approve all three tasks and permissions together; root implementation and independent review remain the execution method. No implementation or publication has started for this proposal.
