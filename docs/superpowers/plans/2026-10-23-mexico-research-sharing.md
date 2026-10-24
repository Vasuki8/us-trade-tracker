# Mexico Research Sharing — Design and Four-Task Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root owns implementation, provider operations and integration. Independent agents perform read-only code/package and final-evidence review; no concurrent edits. Execute only after the owner reviews and approves this combined design, all four tasks and the permission envelope. Steps use checkboxes.

**Status:** Runtime implemented, independently reviewed, merged and published with verified live sharing. See [release evidence](../../validation/mexico-research-sharing.md). Evidence integration and actual owned-checkout archival follow publication; archival is recorded in the private execution closeout.

**Goal:** Let readers reopen and share the existing Mexico all-goods Imports or Exports view, with matching figures and CSVs, without expanding its data claims.

**Architecture:** Add a small Mexico-specific URL parser/writer and React sharing control, following existing saved-view patterns. Enable it only for the two existing public presentation markers, preserving the authenticated one-data-prop package contract and private-preview behavior. Publish one verified static package, with conditional restoration of the current verified Mexico-enabled predecessor.

**Tech Stack:** Existing locked Node 24, Astro/React/TypeScript, Vitest, Playwright 1.64.0, Python standard-library packaging, GitHub and Cloudflare Pages. No new dependency, service, workflow or stored download.

**Spec:** The Design, Global Constraints and Permissions sections below are the specification. The owner requested the next tasks and permissions together; approval selects the recommended approach and root implementation with independent review.

## Evidence and approaches

MexicoLocalProfile currently initializes local Imports state and never reads URL/history. Choosing Exports changes the page and CSVs, but reloads and shared addresses return to Imports. Canada already restores direction links and offers copying/manual fallback. Home already lists both countries, and the country pages cross-link them. This is an observed behavior gap, not evidence from new user research.

1. **Recommended: direction-only Mexico view links.** Add URL restoration, Back/Forward support and copying to the existing page. Trade-off: a small country-specific helper/control; no shared-framework migration.
2. **Generalize every country saved view first.** Defer: Canada's presentation and export policy differ, and its current behavior is verified. Generalization would touch working paths without being necessary here.
3. **Expand country discovery or add Mexico PNG/print tools.** Defer: existing discovery works, and additional outputs are separate features. This plan closes the saved-direction gap only.

The existing package assembler requires the Mexico island to contain exactly one `data` prop and authenticates that DTO. Therefore do not add an enableSharing prop or relax the package checker. The existing data.presentation marker already distinguishes explicitly public rendering from private/local rendering; use that exact gate.

## Design

### URL contract

- Canonical paths are `/countries/2010/?direction=imports` and `/countries/2010/?direction=exports`, followed by the current fragment when present. No direction means Imports.
- Recognize only a single lowercase imports or exports value. Duplicate, empty, unknown or case-mismatched direction, or search strings longer than 2,048 characters, fall back as a whole to Imports with this fixed notice: `This saved Mexico view could not be restored. Showing Imports.` Do not reflect rejected input.
- Ignore unrelated query fields while reading and omit them from generated links. A query cannot select a period, accepted release, product, category, duty measure or data source. Generated links stay on the current origin and fixed public Mexico path.
- Preserve the current fragment; reject a writer argument that is neither empty nor begins with #. Test real fragment behavior with the existing #main anchor. No new section navigation or anchor IDs are needed.
- Links reopen this direction in the historical snapshot available at this route. They do not authenticate or pin immutable bytes, promise a monthly refresh or resolve source-vintage differences.

### Public-only state and sharing

- Sharing is enabled exactly when data.presentation is public-pilot-snapshot or public-pilot-fixture. accepted-private-local and synthetic-local retain their existing local direction/readiness behavior and do not read query/history, register saved-view listeners or show sharing controls. Unknown markers fail closed for sharing.
- Keep MexicoLocalProfile's prop shape `{data: MexicoProfileView}` unchanged. Keep the route, loaders, public selection, DTO and package decoder unchanged.
- Server-render Imports. Before client restoration finishes, disable direction controls, both CSV buttons and Copy view link. One restored direction must drive radio state, measure/basis, all cards, chart, monthly table and both CSVs together.
- Restore on hydration, popstate and hashchange. Do not normalize or rewrite the initial address. An actual user direction change pushes one history entry, preserving window.history.state and the fragment; selecting the existing direction creates none.
- If history.pushState throws, still show the requested direction and generate its correct copyable URL. Show the fixed notice `The address could not be updated. Copy the view link to share this direction.` The existing address remains untouched; Back/Forward subsequently restores its actual direction. No exception should disable research or CSVs.
- Invalidate outstanding clipboard operations on every actual selection/URL restoration, new copy request and unmount. Late success/failure cannot announce a stale direction, even after switching away and back. Clear stale copied/manual status on selection or restored-location change. A fresh copy always uses the current canonical link.
- Clipboard failure or absence reveals a labeled, read-only selectable `View link` input and a fixed manual-copy status. Focus selects its complete value. Copy failure is separate from the existing download error; both CSVs remain usable.
- Add the existing-styled sharing block after the CSV actions, keeping their current order. It contains a `Copy view link` button and this one sentence: `Links reopen this direction in the Mexico snapshot available here; they do not pin a release.` Additional status/input content appears only when needed. The public no-JavaScript explanation becomes `Imports are shown below. Saved directions, direction switching and CSV downloads require JavaScript.` Private explanatory text stays unchanged.
- Use existing view-link styles. Add only a scoped print rule hiding the new mexico-view-link block; do not add a Mexico print feature or change shared layouts.

### Data, output and privacy invariants

All 48 monthly observations, four period totals, two growth results, plotted paths, source descriptors and qualification text remain unchanged. All four Mexico CSV outputs, including filenames and exact bytes, must match a fresh pre-edit baseline. Representative existing product/duty/portfolio/Canada CSV filenames and bytes also stay identical. Existing PNG/PDF exports retain their numerical content, periods, sources, qualifications and readable layout; PDF container-byte identity is not required.

Mexico remains September 2024–August 2026, all goods only. Every product/category/share/duty comparison stays withheld. Preserve the 17 unverified ordinary classification pairs, three statistical exclusions included in totals, 48 before/48 after current-grid matches, and 16 matches/32 dated differences across the whole snapshot. Causes and original-byte vintage remain unestablished; historical failed audits remain failed. No latest-revised-series, fresh-source-verification or update-schedule claim is added.

Keep all public/private/fixture gates and noindex,nofollow unchanged. Saved links contain direction plus fragment only; no private paths, acceptance envelopes, signed URLs or credential values. A fixture stays explicitly synthetic.

## Pinned baseline and restoration target

Planning main: 5bad71b32edb03e98f52d2e26d9403a1c3ec48f0; tree 79f99c3b3fe90ee135b9a19103b237c6cf11a6e0. CI reliability PR #152 is complete; its 3-minute browser setup and 20-minute job limits remain unchanged. Tracked files are clean. Preserve the unrelated untracked September proposal byte-for-byte.

Read only the fifteen dataFiles entries in docs/superpowers/plans/2026-10-23-mexico-all-goods-publication-inputs.json, SHA-256 5ff4868dd95f003308bd742c6a92117776a778804426fe61493e535e4eeada37, as the exact existing-data allowlist. During planning all fifteen files matched, totaling 19,168,534 bytes. Referencing it grants no authority to execute that older plan.

Protected identities:

| File | SHA-256 |
| --- | --- |
| deployment/site-product-selection.json | 77f7587659e19ae7d18cd94448b1795448ae16da80ed8d45c59276fffefa2eef |
| deployment/site-mexico-selection.json | 6d1f172dff01b030bb5991d87d013bdbb02ccc31db3f381b57dab2eee3f198de |
| .github/workflows/checks.yml | 107d69377c27fb546947ba20c96b061dbc6302fe53a1f74326caba30733612fd |
| package.json | becc2f1cded5635063a3781c12e6b519cc4999235fc891510702fab13df9dd6d |
| package-lock.json | 369164d0c2c70b3bb49bd82195d361bbddf50ef71506d7498098e83e52a89f24 |
| docs/superpowers/plans/2026-10-17-september-coffee-candidates.md | b60a52102ac4d09cb54ded1d64c993f5d9ff6203da6b71080ab60ac2d949875c |

The current verified public package is retained under data/backups/mexico-all-goods-publication/verification-20261023-r1/candidate/:
- site.zip: 655,531 bytes; SHA-256 af29921140a66b527d68aafba8e652feeb1fc493c9c077ac71ee8ed6c35ad9ea.
- site-manifest.json: 10,450 bytes; SHA-256 d003fabc2af5dc53cd2a4d223c90da6cd97e99130e2aa68f04272d5a39460c71.
- 43 files / 3,215,775 raw bytes; source e8938c33f97e484c8814d989e54393b0afb897a2. Public Mexico DTO: 14,429 bytes, SHA-256 16ee47da3087dea5529de1c60fdc5f8fe9d4523203c7fe40a5725408b5149d09; unchanged by this feature.
- Recorded Production deployment 3697e575-0dd7-4b02-8919-e76c5ddd1aa3, origin https://3697e575.us-trade-tracker.pages.dev; canonical https://us-trade-tracker.pages.dev.

These are retained facts, not a fresh provider claim. At execution authenticate the package and require fresh provider assignment plus complete baseline byte/header verification. An observed different deployment ID may be recorded only if it serves this exact authenticated package and headers; different bytes or unrelated owner work stop publication. Restore this Mexico-enabled package, never the older four-product/Canada-only predecessor or a withdrawal ZIP.

## File map and interfaces

| Files | Responsibility |
| --- | --- |
| New src/lib/mexico-profile/view-link.ts; tests/mexico-profile/view-link.test.ts | Pure bounded parser/writer; existing MexicoDirection type |
| New src/components/MexicoViewLink.tsx; tests/ui/MexicoViewLink.test.tsx | URL/history lifecycle, guarded clipboard state and minimal copy/manual UI |
| Modify src/components/MexicoLocalProfile.tsx; tests/ui/MexicoLocalProfile.test.tsx | Gate on existing public markers; synchronize all direction-dependent content and CSVs; unchanged props/private behavior |
| Modify src/styles/mexico-profile.css | Scoped print hiding of new sharing block only |
| Extend tests/e2e-mexico-pilot/mexico-pilot.spec.ts and tests/e2e-mexico-profile/mexico-local-profile.spec.ts | Real browser sharing/readiness/history/keyboard/CSV checks and private negative control |
| New docs/validation/mexico-research-sharing.md and -evidence.json; this plan; README.md current-release pointer after verified publication | Actual results, immutable runtime/package/provider bindings and closeout |

Exact new exports:
- MexicoViewSelection = {direction: MexicoDirection}.
- readMexicoViewSelection(search:string): {selection:MexicoViewSelection;notice:string|null}.
- mexicoViewPath(selection:MexicoViewSelection,hash?:string): string.
- useMexicoViewLink(enabled:boolean): {selection:MexicoViewSelection;changeSelection:(next:MexicoViewSelection)=>void;ready:boolean;link:string;notice:string|null;copied:boolean;manual:boolean;copy:()=>Promise<void>}.
- MexicoViewLink(state:ReturnType<typeof useMexicoViewLink>): React.JSX.Element.

No changes to routes, BaseLayout, Canada/product sharing, serializers, calculations, source loaders, selections, package/live-verification tooling, workflow, dependencies or manifest schema. A material defect in those interfaces requires a new decision; do not loosen them to make this feature pass.

## Global Constraints

- Root owns all edits; one independent whole-branch/code-package reviewer, a targeted independent final-evidence review, and a fresh reviewer only if the single blocking repair is used. No parallel editing.
- Preserve the fifteen exact accepted inputs and every stated Mexico qualification/withheld comparison; no source request, replay, data acceptance/replacement/intake or R2 operation.
- One owned codex/ worktree or isolated clean-checkout fallback; scoped runtime/filesystem/process permissions and existing locked setup. Keep the unrelated mexico-private-acceptance checkout at d22122a3baefa647eb5976d73bcbcc2ce51876f5 untouched.
- At most two real-data staging materializations of those fifteen files: one candidate and one only if the single repair requires rebuilding. Each is 19,168,534 bytes; cumulative 38,337,068 bytes stays below 40 MiB. No additional real-data copy or raw archive is needed. The pre-edit baseline comes from the retained public package.
- Useful proof/packages/exports/logs under fresh ignored data/backups/mexico-research-sharing/ storage: maximum 96 MiB. Temporary owned build/stage/trace/verifier scratch: maximum 256 MiB, excluding reconstructible locked runtimes. Preserve proof before removing owned scratch; never modify older proof/inventories.
- Preserve package bounds: 1,000 entries, 25 MiB per asset, 15,000-file planning alert; live limits: 1 MiB manifest, 4 MiB ZIP, 8 MiB decoded package and 128 logical checks across two origins. With Mexico selected, each full verification plans (fileCount - 1 + 8) × 2 checks, so at most 57 package files. Measure every build; no limit bypass.
- Preserve all existing assertions, platforms, engines, retries, workers, test deadlines, workflow triggers/permissions and the new 3/20-minute CI limits. Windows Firefox's historical launch limitation stays explicit; full portable three-engine coverage must pass in Linux CI.
- Re-read main and protected identities before execution. Inspect unrelated drift rather than overwriting it; a changed accepted input, data selection, package identity or material scope requires a decision.
- Keep static pages/chart data on Pages, downloads browser-generated and R2 private. No accounts, analytics, paid/access/indexing changes, outreach, new service or recurring job. The September coffee plan remains unchanged and gated on actual official publication.

## Review Focus

1. Exports must be restored before any control or download enables; SSR/no-JavaScript still truthfully shows Imports. Task 2 tests blocked hydration, direct Exports and four active-direction CSV identities.
2. Unrelated/duplicate/oversized query values must not change data or leak into copied links; private previews must never create public share links. Tasks 1–2 test parsing/writing and private lifecycle negatives.
3. Back/Forward, fragments, denied history and late clipboard resolution must not produce stale status or mismatched figures/downloads. Task 2 tests real history plus deferred clipboard success/failure, away-and-back and unmount.
4. New props or guard relaxation must not bypass authenticated public DTO/package boundaries. Task 3 reuses the unchanged decoder, selection, DTO hash and complete packaging/privacy checks.
5. Publication drift, an unknown upload outcome or failed restoration must not overwrite unrelated owner work or count as success. Task 4 binds fresh provider assignment, exact packages, conditional restoration and final readbacks.

---

### Task 1: Implement the bounded Mexico URL contract

**Files:** New view-link.ts and its pure test file; retain this approved plan in the branch.

**Interfaces:** Produces MexicoViewSelection, readMexicoViewSelection and mexicoViewPath with the exact signatures and strings above.

- [x] Establish the owned checkout/ledger and locked setup. Authenticate protected inputs, selections, current package and proposal; record observed main/tree. Verify the existing focused Mexico tests before editing.
- [x] Write failing cases: absent direction -> Imports/no notice; exports -> Exports; duplicate/empty/uppercase/invalid or >2,048-character search -> Imports/fixed notice; exactly 2,048 valid characters accepted; unrelated fields ignored/omitted; writer emits only the fixed Mexico path/direction/fragment; invalid direction/hash rejects. Run `npx vitest run tests/mexico-profile/view-link.test.ts --maxWorkers=2` and observe RED.
- [x] Implement only the declared pure parser/writer. Run the new tests and existing Mexico summary/download/presentation cases to GREEN. No data lookup, browser access or shared-country refactor belongs here. Commit the focused change.

### Task 2: Connect public sharing with robust readiness and history

**Files:** New MexicoViewLink.tsx/tests; MexicoLocalProfile.tsx and existing UI tests; scoped CSS rule; existing public/private Mexico browser suites.

**Interfaces:** Consumes Task 1's parser/writer. Produces the declared hook/control and public-only behavior, with the existing `{data}` component prop contract unchanged.

- [ ] Write failing UI cases for exact public-marker enablement; no private URL/history/clipboard activity; direct Exports and all coupled content/CSV updates; duplicate/invalid fallback notice; no initial address rewrite; one push per actual change with history.state/fragment preserved; Back/Forward/hash restore; denied push keeps requested direction and correct copy URL with fixed notice.
- [ ] Add deferred clipboard success/failure tests across selection change, away-and-back, fragment restoration, newer copy and unmount. Assert fixed statuses/manual fallback, full-value selection and that CSV download failure/retry remains independent. Run the focused UI cases to observe RED, then implement the minimal public gate, hook/control and print rule.
- [ ] Extend the existing three-engine public browser suite: direct/reloaded Exports, actual Back/Forward, #main fragment, clipboard success/manual fallback, keyboard, 320/390px light/dark, invalid queries, no-JavaScript Exports URL showing explained Imports, and delayed hydration keeping all three actions disabled until Exports is restored. Check the restored cards/chart/table and both CSVs together. Assert the new sharing block is hidden in print without losing source/qualification content.
- [ ] Add the private-preview negative journey: an Exports query still starts Imports, no sharing UI/URL mutation appears, and private CSV context remains unchanged. Preserve existing keyboard assertions; adjust only genuine new control-order expectations. Run the focused unit/UI cases plus `npm run test:e2e:mexico-profile` and `npm run test:e2e:mexico-pilot`. Required three-engine coverage also runs through unchanged Linux CI. Commit once checks pass.

### Task 3: Verify the real candidate, independently review and integrate

**Files:** Allowed runtime/tests and initial docs/validation/mexico-research-sharing.md. Private package/evidence only; no staging/packaging/runtime-policy edits.

**Interfaces:** Consumes Tasks 1–2's committed source. Produces a reviewed, fully checked immutable package bound to the tested head/tree and its matching reviewed main merge.

- [ ] Authenticate/copy the pinned predecessor ZIP/manifest into fresh owned proof and existing verifier workdir; use Python package verification and an owned loopback preview. Before runtime edits, or from the immutable predecessor after edits, capture all four actual Mexico CSV filenames/bytes, all 48 values, cards/qualifications and representative existing product/duty/portfolio/Canada exports for comparison. Do not fetch Census or follow source URLs.
- [ ] Run the complete local unit suite with the real SITE_PACKAGE_PYTHON and maxWorkers=2, `npm run check`, explicit fixture builds/browser suites and Python packaging/workflow suites. Keep existing platform skips honest. Commit a clean candidate; each changed final candidate head needs complete automatic Linux CI and full required main CI after merge.
- [ ] From that clean committed candidate, use existing site:stage create/verify with explicit source/data/output/commit, reading accepted data only from the primary data root. Build only the exported project with TRADE_DATA_MODE=census, CANADA_PILOT_MODE=snapshot and MEXICO_PILOT_MODE=snapshot; private preview flags absent and process environment restored afterward. Run existing site:prepare and Python package create/verify. Record exact source/head/tree, manifest/ZIP hashes, file count/raw size/largest file, DTO/selection/data bindings and planned HTTP count.
- [ ] Serve the exact assembled site on loopback. Require identical DTO and all four Mexico CSV bytes/filenames; compare all 48 rendered monthly values, four totals and both growth results against the authenticated predecessor. Exercise saved directions, all statuses/readiness/private negatives, keyboard and both themes at 320/390/736/1024/1280px. Recheck all 23 content routes, existing saved overview/product/Canada/monitor views and representative CSV/PNG/briefing/overview print exports. Preserve the inherited overview Letter attribution-page limitation; do not repair unrelated print/layout work.
- [ ] Have the fresh independent reviewer inspect the immutable whole diff and accepted package, including the unchanged strict one-data-prop decoder, safe DTO, privacy guards, CSV identities, restoration inputs, scope and real evidence. Root fixes material findings within the allowlist; changes require affected/full gates and a fresh package within the two-stage budget. Pin the accepted publication decision before any upload.
- [ ] Push/create/attach the implementation PR; require full exact-head Linux CI and no unresolved material review finding. Expected-head merge under standing permission, then require actual main CI and equal tested/merged source trees. Bind that merge to the already accepted immutable candidate; do not substitute a rebuild. Synchronize primary without losing the original untracked approved plan or unrelated proposal.

### Task 4: Publish, verify, restore if needed and finish actual cleanup

**Files:** New public validation/evidence files, README current-release pointer and this plan's closeout. Runtime changes only under the single repair allowance. Final evidence PR stays separate from the uploaded runtime.

**Interfaces:** Consumes Task 3's immutable candidate and exact predecessor. Produces verified live sharing or an accurately reported unresolved failure, with proof preserved and owned checkout removed.

- [ ] Read the existing Cloudflare account 2e23d873002d29a02a1427e1fa37c5cd, Free us-trade-tracker project, Production main assignment. Run existing site:verify with the pinned predecessor manifest/ZIP on canonical plus the observed exact origin; all 100 baseline logical checks must pass. Freshly confirm assignment again immediately before upload. Changed bytes/account/project/plan or unrelated work stop writes.
- [ ] Reauthenticate candidate ZIP/manifest, source/tree and all protected inputs. Direct Upload only its site.zip to Production main. Record actual outcome/ID/origin. Count any attempt after transmission may have begun; reconcile unknown outcomes using read-only provider/package state before another write, never blind retry.
- [ ] Run the unchanged bounded site:verify against canonical plus actual candidate origin; require every planned hash/status/header/private-path check. Browser-check saved Mexico Imports/Exports/reload/Back/Forward/fragment/copy/manual/readiness/no-JavaScript/keyboard/mobile and all four CSVs, preserving qualified snapshot text. Smoke all content routes and representative existing research/CSV/PNG/print behavior; compare results to accepted local evidence. Require no unexpected page error/outside request and freshly confirm candidate Production assignment after acceptance.
- [ ] A confirmed figure, qualification, withheld-data, view/history/copy/download, asset/header/privacy or layout regression fails acceptance. First require Production still points to this batch's failing candidate, then restore only the pinned Mexico-enabled predecessor ZIP. Record its actual new origin; fully verify it and smoke home/four products/both countries and representative exports. Never overwrite unrelated owner work. Preserve all failed/unknown outcomes; restoration alone is not completion of this feature.
- [ ] After successful restoration, one unused shared blocking repair may be reproduced, independently reviewed/tested, merged with full PR/main checks and repackaged within the remaining stage/write/check budgets. A second candidate must pass the same full acceptance; restore again if it regresses, then stop further publication. No broader redesign, policy relaxation or third data stage is implicit.
- [ ] Record actual local/CI/source/package/provider/live/repair/restoration outcomes in sanitized public evidence. Obtain targeted independent evidence review; create/attach/CI/expected-head merge its evidence PR and require main CI. Do not rebuild or republish for this documentation merge alone.
- [ ] Recheck protected inputs and current assignment; preserve/hash-read-back useful proof and complete ledger outside the owned checkout. Archive it natively and verify archived attachment, physical absence and Git-registration absence; handle an owned fallback checkout with exact-root verification. Remove only owned scratch/processes after preservation and retain this batch's PR cards. Leave the older Mexico checkout, historical proof and unrelated localhost sessions untouched.

## Permissions requested with approval

Approval covers all four tasks without routine permission pauses:

1. Root implementation/provider operations, read-only independent code/package and final-evidence reviewers, plus a fresh reviewer only for the single optional repair; one managed worktree or clean isolated fallback and scoped runtime/filesystem/process permissions; existing locked npm/browser setup and normal CI downloads.
2. The exact source/test/docs file map, bounded accepted-data staging copies, local tests/builds/browser/PDF/package/CSV checks and owned loopback previews with outside requests blocked. Proof/scratch/copy caps above apply to failed attempts too. No source URL following or raw-source replay.
3. GitHub pushes and at most three public PRs: implementation, one optional blocking repair and evidence closeout. Each needs appropriate independent review, full final-head CI, expected-head merge and successful automatic main CI. Up to two diagnosed unchanged-job infrastructure reruns across the whole batch; no assertion failure reclassification, force-push or direct-main editing. The completed CI batch's unused allowances are not reused.
4. Read the fixed existing Cloudflare account/project/Free plan and publish to its Production main only. At most two candidate write attempts and two conditional exact-predecessor restorations. No new project/integration/credential/paid upgrade. Human sign-in may still be needed; keep passwords/keys out of chat.
5. At most six full HTTP-verifier runs: baseline, two candidate checks, two restoration checks and one shared repeat only for demonstrated transient transport/propagation failure. Each targets canonical plus the observed exact origin, retaining the existing four HTTP attempts including redirects per check, 15-second request and 180-second run limits, and 128 logical checks. No transport or verifier changes.
6. Public browser acceptance per candidate: at most 50 navigations/20 activated CSV/PNG/PDF exports; per restoration: 12 navigations/four exports. Batch ceiling 124 navigations/48 exports across both origins, including failed attempts. Provider dashboard use is limited to target readbacks and allowed writes. Use fresh test contexts or restore user-owned theme/clipboard preferences.
7. One shared reproduced blocking repair within the listed runtime/tests or private acceptance harness, counted from the first real candidate materialization. Ordinary Tasks 1–2 RED/GREEN development fixes are part of implementation, not extra repair attempts. One reviewed repair pass may address the blocking findings together; it uses the same copy/upload/CI/check budgets, and a live regression must be restored first. No second repair or unrelated shared-layout/tooling/policy change is implicit.
8. Preserve useful proof, public safe documentation and actual cleanup. If the 100-attachment limit requires space, preserve metadata and reconfirm merged status before unlinking at most three old standalone PR chat cards #69–#71; their GitHub PRs remain unchanged. Reversible metadata-preserved handling/reattachment of this batch's own PR cards during native archival is permitted; retain them at completion.
9. Excluded: new official-source/Census/API/reference/ZIP requests, manual data-job dispatch, R2 reads/writes, raw replay, accepted-data/classification installation or replacement, other product/country/month intake, product comparisons for Mexico, PNG/PDF feature additions, country-directory/navigation redesign, new dependencies/services/workflows, paid/access/indexing changes, analytics/outreach/participant collection and recurring jobs. The September plan remains independently gated.

## Completion criteria

The direction-only sharing feature is reviewed and merged; complete final-head and main checks pass; the immutable package is published and fully verified with unchanged data/CSV/privacy/qualification boundaries; restoration inputs and actual outcomes are recorded; final evidence is independently reviewed and integrated; and proof plus actual owned-worktree/scratch cleanup are verified. A restored predecessor or exhausted allowance is reported honestly as an unresolved feature outcome, not a completed publication.
