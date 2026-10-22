# Shareable Graphite Overview — Design and Four-Task Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root owns implementation, integration and provider operations; independent reviewers perform read-only reviews and separate checks. Execute only after the owner approves this combined design, four tasks and permission envelope. Steps use checkbox syntax. Standing merge permission applies; no routine approval pauses within this envelope.

**Goal:** Let someone copy or reload the Graphite overview and recover the same product, trade direction, comparison period and history window, with concise copy and reliable fallback behavior.

**Architecture:** Add a small overview-specific URL contract and React hook following the existing research-link patterns. Connect the existing overview controls to that selection without changing calculations or fetching data. Build and publish an authenticated static package through the existing staging, packaging and live-verification tools, retaining the verified Graphite release for restoration.

**Tech Stack:** Existing locked Node 24, Astro/React/TypeScript, Vitest, Playwright, Python standard library, GitHub and Cloudflare Pages. No new dependencies, services or workflows.

**Spec:** The Design section below is the specification. The owner requested a combined next-task plan with all execution permissions. This is a bounded extension of an existing flow, consistent with research handoff in `docs/research/pilot-task-study.md` and the launch design in `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md`.

## Recommendation and observed baseline

On October 22, 2026, `src/components/TradeOverview.tsx` stores product, direction, monthly/annual comparison and 12/60-month history solely in React state. It has no URL restoration, history listeners or copy-link action. Reloading or sharing the current homepage address therefore loses the selection. Product profiles and changes views already support saved selections and manual-copy fallbacks.

Recommend completing that existing research handoff before another feature or data intake. The measurable outcome is reproducible overview choices; this is not evidence of user demand. Owner-run pilot validation remains the broader next checkpoint. Additional products or a public Mexico profile would need a separate data/release design and are not included. The separately approved September coffee candidate plan stays unchanged and gated.

Planning inspected source, existing tests, retained publication evidence, package hashes and merged PR metadata. No implementation, installation, upload or current Production verification is claimed here.

| Baseline | Identity |
| --- | --- |
| Planning main | `91edd432aa6cd0df1124375a42a3b23fb8c3e15a` |
| Current runtime package source | `61cd985cb2040cde985fefc98a2d2c4e36908b06`, tree `9147be6f4bf6bf8bbab4206ad9ee9412f498dd3f` |
| Recorded Graphite Production deployment | `509608c8-fb7d-439d-bd6d-4498d8e09035` |
| Canonical / recorded deployment origin | `https://us-trade-tracker.pages.dev` / `https://509608c8.us-trade-tracker.pages.dev` |
| Only publication target | Existing account `2e23d873002d29a02a1427e1fa37c5cd`, Free Pages project `us-trade-tracker`, Production `main` |
| Restoration directory | `data/backups/graphite-publication/verification-20261022-r1/candidate-r2/` |
| Restoration ZIP | `site.zip`, 635,310 bytes, SHA-256 `3d279c31e50a8db1f0f95de962fc5fe5184eb6b756ba569237c4f875f3733a29` |
| Restoration manifest | `site-manifest.json`, 8,757 bytes, SHA-256 `0fcf5d789b3a8e51f2c80de32be97925a99b1ef3c6986f0211af42d7bab4eff4` |
| Restoration payload | 41 entries / 3,141,622 raw bytes; prior verification 88/88 plus eight Mexico negative-route checks |
| Existing public products | Exact `deployment/site-product-selection.json`: 090121, 090111, 090240, 180100, all through August 2026 |
| Canada / Mexico | Fixed September 2024–August 2026 Canada snapshot; Mexico all-goods private and all Mexico product comparisons withheld |

The two restoration hashes were freshly checked during planning. Today's Production assignment must still be observed before any write. Restore this Graphite package, not the earlier tea/cocoa package or a local fixture preview.

## Design

### Selection and URL contract

- Store one selection: `{productCode: string, direction: 'imports' | 'exports', comparisonPeriod: 'monthly' | 'annual', months: 12 | 60}`. Product membership comes from the supplied published overview products, never an independently hardcoded four-product client list. The fixture build continues using its existing published fixtures.
- Defaults match the current page: first supplied product, imports, monthly comparison, 60 months. The supplied product-code list must be nonempty, unique and six-digit; violations are internal contract errors, not silently invented products.
- Canonical URL: `/?product=180100&direction=exports&comparison=annual&months=12`. Serialize all four keys in that order. Append the current native fragment unchanged, e.g. `#overview-history-heading`. Construct absolute copied links from the current origin; no user-supplied origin or redirect.
- Missing supported keys use defaults. Ignore unrelated query keys when reading; generated links retain only supported keys and the fragment. Reject any duplicate supported key, empty/unsupported supported value, unpublished product, or query longer than 2,048 characters. Rejection restores the entire default selection with: “Saved overview selection could not be restored. Showing the default overview.” Never partially apply a broken selection.
- Initial restoration reads the URL without rewriting it. Changing a control uses `history.replaceState`, preserving `history.state` and the fragment. Controls do not create an undo entry per click. Native back/forward and fragment navigation restore the address through `popstate`/`hashchange` listeners; listeners are removed on unmount.
- If browser history writing throws, keep the requested rendered selection and its correct canonical copy link, with a concise status that the address could not be updated. Do not crash or claim the address was saved. Subsequent native navigation follows the actual address.
- Links reopen choices against the latest available accepted dataset. They do not freeze a data release. Theme preference stays separate from the research selection.

### Controls and concise content

- Keep the existing controls, chart, KPI definitions, sources and qualifications. Add one “Copy overview link” button near the controls and one short hint: “Links reopen these choices using the latest available data.” No new explanation panel or redesign.
- Static HTML keeps the current default view. All selection and copy controls stay disabled until hydration and URL restoration are complete. No-JavaScript copy explains the default first-product imports/monthly/5Y view and that JavaScript is needed to restore or share choices.
- On successful copying show “Overview link copied.” If clipboard access is missing or denied, reveal a labelled, read-only “Overview link” field that selects its contents on focus, plus a short manual-copy instruction. Keep that field in sync while visible after a selection changes. Announce actionable statuses with `role="status"`.
- A late clipboard promise cannot announce an old link after selection/navigation/unmount. Use an operation generation guard, following the changes-view precedent. Clear stale success/invalid-selection messages when an applicable selection changes.
- Keep the existing profile/research destination contracts, including matching direction, comparison and history where already carried. Preserve exact values, zero versus unavailable, revision marks, classifications, small positive duty shares and matching consumption denominators. No CSV/PNG schema change or raw releases added to the overview payload.

### File responsibilities and interfaces

| File | Responsibility |
| --- | --- |
| New `src/lib/trade/overview-view-link.ts` | Pure selection type, query parser, canonical path builder |
| New `src/components/OverviewViewLink.tsx` | Overview hook, lifecycle/readiness, clipboard/manual-copy UI |
| `src/components/TradeOverview.tsx` | Use the hook and existing controls; render the concise link action |
| `src/styles/global.css`, only if existing classes are insufficient | Scoped wrapping/print rules for the link action; no global theme redesign |
| New `tests/trade/overview-view-link.test.ts` | Query/default/serialization contracts |
| New `tests/e2e/overview-view-links.spec.ts` | Restored controls, copy/history/fallback/readiness and numeric/link agreement |
| `playwright.compatibility.config.ts` | Include the new focused specification in the existing Firefox/WebKit projects |
| This plan, `README.md`, new `docs/validation/overview-view-links.md` and `overview-view-links-evidence.json` | Approved scope and truthful final verification/publication record |

Pure interfaces: `readOverviewSelection(search: string, productCodes: readonly string[]): {selection: OverviewSelection; notice: string | null}` and `overviewViewPath(selection: OverviewSelection): string`. The latter returns the root-relative canonical path without fragment. Reject structurally invalid runtime selections rather than constructing a misleading URL.

Hook interface: `useOverviewViewLink(productCodes: readonly string[])` returns `{selection, ready, changeSelection(next: OverviewSelection), link, notice, copied, showLink, copy(): Promise<void>}`. Treat the product-code values as the effect dependency, not a newly allocated array identity. `OverviewViewLink` renders those status/copy fields. Reuse established CSS and patterns; do not generalize or refactor the existing changes/profile hooks.

## Global constraints and permission envelope

Approval authorizes all four tasks, including:

1. Root implementation and strategic independent read-only reviewer subagents, one managed worktree, scoped filesystem/process/network execution permissions, existing Node/Python/browser runtimes, locked `npm ci` and installation of the already locked browser builds if necessary. No concurrent edits or builds in shared dependency directories. No dependency/lockfile/workflow changes. If native registration fails, use a `codex/overview-view-links` branch in the primary checkout with ignored build staging; do not create another unmanaged checkout.
2. Fresh scratch `.tmp/overview-view-links-20261022-r1/` and durable proof `data/backups/overview-view-links/verification-20261022-r1/`, using a fresh numbered sibling if occupied. Cap new task-owned copies/builds/proof at **1 GiB**, excluding reproducible locked dependencies/browser runtime. Read/copy only the existing staging tool's 11 accepted state inputs, the pinned Graphite ZIP/manifest and relevant existing proof/oracle records. No broad archive copying or raw-source replay.
3. Fresh before/after checks of the prior Graphite record's **22 protected fingerprints and four canonical private Mexico files**. Preserve the unrelated September proposal at `docs/superpowers/plans/2026-10-17-september-coffee-candidates.md`, SHA-256 `b60a52102ac4d09cb54ded1d64c993f5d9ff6203da6b71080ab60ac2d949875c`. No accepted-data/classification/selection installation or replacement. Existing public product datasets' legitimate Mexico partner rows remain allowed.
4. GitHub pushes, up to **three PRs** (feature, optional bounded repair, evidence), independent review, existing standard CI on each final reviewed head, expected-head reviewed merges under standing permission, synchronization and tree verification. Inspect all matching-head push/PR runs before retrying CI; a successful identical standard-workflow run on the reviewed immutable head is usable. Do not rerun successful full suites merely because a duplicate event run stalled. Do not weaken assertions/deadlines/skips or change workflow policy.
5. Read the existing Cloudflare account/project/Free plan/Production state and use its existing authenticated session for Direct Upload to the fixed target above. At most **two candidate uploads**, initial plus one reviewed repair, and **two automatic restorations** of the pinned Graphite package, one after each regression. Reconcile an unknown upload outcome read-only before any further write. No project/token/domain/credential/access/paid-plan change or deployment deletion. Human sign-in may still be required if the session expires; approval does not provide credentials.
6. At most **six complete `site:verify` invocations**: baseline, each candidate, each restoration, plus one shared repeat only for a demonstrated transient transport/propagation failure. Keep existing per-run limits: 128 logical checks, up to four HTTP attempts including redirects per check, 15 seconds/request, 180 seconds/run. Use canonical plus the actually observed deployment origin. No crawling or periodic verification.
7. Supplement each verification phase with at most eight anonymous GETs: both origins for `/countries/2010/`, `/preview/countries/2010/`, `/preview/accepted/countries/2010/`, `/data/countries/2010/processed/current.json`. Require 404, the authenticated error body and noindex/nofollow. Permit one shared eight-request transient repeat. These are private task checks, not shipped network functionality.
8. Per candidate, at most **45 public browser navigations and 20 user-activated downloads**; per restoration, 12 navigations/four downloads. Across both candidates/restorations, maximum **114 navigations/48 downloads**, including failed attempts and both origins. Full local acceptance is separate within the proof cap. Use fresh contexts or restore user-owned theme/clipboard preferences. Preserve unrelated localhost previews/processes.
9. After the initial feature merge, one reproduced blocking application or task-harness repair, restricted to the new overview link files, `TradeOverview.tsx`, scoped link CSS and their corresponding tests/configuration. Ordinary implementation and pre-merge review corrections remain part of Tasks 1–3. Private harness corrections stay in owned scratch. Restore a regressing public candidate before repairing. This single post-merge repair allowance does not authorize calculation/import/archive/acceptance-policy changes or extra uploads/verifier calls. Broader failures remain reported and require a new decision.
10. The chat has 100 attachments. If capacity requires it, preserve metadata, re-confirm merged status and unlink up to four obsolete standalone merged PR chat cards, only **#49–#52**, in that order. All four were confirmed attached and merged during planning. Their GitHub PRs remain intact. This reserves one worktree/archive and up to three PR attachments. Temporary detachment/reattachment of this batch's own PR cards is permitted for native archival capacity. No other historical cards or worktrees may be removed.
11. Preserve and hash-read-back proof before archiving the task's managed worktree through the native tool or deleting verified task-owned scratch under resolved safe paths. Stop only owned processes. The older unresolved Mexico native-worktree cleanup stays separate and untouched; never report it as completed by this batch.

**Excluded:** Census/source requests, manual data-job dispatches, imports, raw replay, new products/countries/months, accepted-data changes, R2 operations, a public Mexico profile or Mexico product comparisons, new features beyond this design, dependencies/services/workflows, paid/access/indexing changes, outreach/participant collection, analytics and recurring jobs. Keep pages/chart data together on Pages and downloads generated in the browser. Retain `X-Robots-Tag: noindex, nofollow`; this does not make public content private.

## Review focus

1. Unpublished/duplicate/oversized saved choices must not leave a hybrid selection or silently label the wrong product. Pure parser cases in Task 1; visible fallback in Task 2.
2. Hydration, navigation and late clipboard completion must not publish or announce a link for stale/default controls. Delayed-hydration, history, clipboard-race and no-JavaScript checks in Task 2.
3. Fixture membership, changed product-array identities and blocked browser APIs must not break restoration, loop effects or overflow the mobile layout. Fixture, blocked-history/clipboard/storage and both-theme checks in Task 2.
4. A valid URL must show the existing selected numerical view and destination context, rather than merely change control labels. All 32 real selection combinations and representative source calculations in Task 3; live samples in Task 4.
5. A correctly hashed wrong package, unrelated Production change or partial live result must not be accepted or overwritten. Source/data/template bindings in Task 3; provider readbacks, exact live checks and conditional restoration in Task 4.

## Task 1: Implement and test the overview URL contract

**Files:** Create `src/lib/trade/overview-view-link.ts` and `tests/trade/overview-view-link.test.ts`. Include this approved plan in the feature branch.

**Interfaces:** Produce the pure type/parser/path builder specified above. Task 2 consumes them; no browser or server dependencies in this module.

- [ ] Confirm source/branch/owned paths, preserve the unrelated proposal and capture the protected input baseline. Create/reuse only this task's authorized isolated worktree; apply the primary-checkout fallback only if needed.
- [ ] Write `overview defaults and partial selections`, `all overview selections round trip`, `invalid saved choices restore the whole default`, `fixture membership is supplied`, and `canonical paths exclude unrelated query keys` unit cases. Enumerate two supplied fixture products × two directions × two periods × two windows; assert defaults, all four ordered keys, no loss of leading zeroes, exact membership, missing versus empty values, duplicates for each supported key, invalid enums/months, unknown tracking keys, 2,048/2,049-character boundary and invalid internal product lists/selections.
- [ ] Run `npm test -- tests/trade/overview-view-link.test.ts` before implementation. Require failure for the missing contract, not an environment/setup error.
- [ ] Implement `OverviewSelection`, `readOverviewSelection` and `overviewViewPath` in the new pure module using the exact design above.
- [ ] Re-run the focused unit specification and existing `tests/trade/view-link.test.ts`; require passes. Commit the approved plan, pure contract and tests as one reviewable change.

## Task 2: Connect existing controls and reliable copy behavior

**Files:** Create `src/components/OverviewViewLink.tsx` and `tests/e2e/overview-view-links.spec.ts`; modify `src/components/TradeOverview.tsx`, `playwright.compatibility.config.ts`, and scoped CSS only if needed.

**Interfaces:** Consume Task 1's pure functions. Produce `useOverviewViewLink` and the compact action UI described in Design; existing `OverviewProduct[]` and derived figure/link models remain unchanged.

- [ ] Write failing browser cases named `saved overview restores figures and profile context`, `control edits replace the address and survive reload and history`, `manual copying retains the current selection and fragment`, `stale copy completion cannot announce another view`, `invalid overview falls back visibly`, and `overview controls wait for restoration`. Use the supplied fixture products, exact control accessible names, selected figures and existing profile links; include delayed hydration and stable product-code values across rerenders.
- [ ] Add cases for denied/missing clipboard, a throwing `replaceState`, supported history/hash navigation, unsupported/duplicate/oversized query, tracking-key removal on generated links, keyboard copy/manual field selection, blocked theme storage, 320/390px layouts in both themes, and no-JavaScript saved-query defaults with all inactive controls disabled. Stub clipboard in cross-browser cases instead of assuming Firefox/WebKit grant Chromium clipboard permissions.
- [ ] Build the existing fixture mode, choose a fresh owned port, and run `npx playwright test tests/e2e/overview-view-links.spec.ts --project=chromium`. Require the new behavioral failures before code changes. Never test against an unrelated reused preview.
- [ ] Implement the hook/component and integrate selection into existing overview controls. Preserve current calculations, chart paths and research links; add only the button/hint/status/fallback and honest no-JavaScript copy. Handle lifecycle, stable effect dependencies and the history failure path without refactoring unrelated link hooks.
- [ ] Rebuild fixtures, run the new Chromium specification, `tests/e2e/site-theme.spec.ts` and `tests/e2e/changes-view-links.spec.ts`, then `npx playwright test --config playwright.compatibility.config.ts tests/e2e/overview-view-links.spec.ts`. Require the new cases to pass on Chromium, Firefox and WebKit with zero unexpected page errors. Run `npm run check` and the focused unit tests; commit the UI/tests/configuration.

## Task 3: Independently review, merge and authenticate a real publication package

**Reads:** Feature branch, existing accepted state and pinned restoration evidence. **Produces:** reviewed/merged source identity, successful CI gate, authentic package and local acceptance receipts.

- [ ] Request one independent whole-branch review of requirements, lifecycle/query contracts, accessibility, regressions and boundaries. Root resolves material findings within the design, reproduces any defect before its fix and reruns affected checks. Open/attach the feature PR; require independent review and successful existing standard CI for the final immutable head before the expected-head merge. Verify merged tree identity.
- [ ] Run appropriate local checks and preserve actual results. The prior full Windows run had seven unchanged five-second filesystem timeouts; do not call that green, change unrelated archive timing or weaken tests. Existing Linux CI remains the full-suite gate. Inspect all matching-head push/PR workflow runs before repeating a run; keep failed/stalled evidence.
- [ ] Hash-check and copy the Graphite restoration ZIP/manifest into fresh owned proof, then run `scripts/package_site.py verify` with explicit `SITE_PACKAGE_PYTHON`. Require original hashes/41 entries; preserve originals. Use `--work-dir`, `--manifest` and `--zip` explicitly.
- [ ] Stage from a completely clean checkout at the reviewed merged runtime commit. Use `npm run site:stage -- create --source-root <checkout> --data-root <primary> --output <owned-stage> --commit <runtime-merge>` and `site:stage -- verify` before/after build. The approved plan must already be committed. In the primary fallback only, temporarily relocate the named untracked September proposal into verified owned storage, restore byte-for-byte immediately after staging in a `finally` block, and verify its hash; stop rather than overwrite concurrent contents. Do not stash/delete/ignore other work.
- [ ] Build the staged project with `TRADE_DATA_MODE=census`, `CANADA_PILOT_MODE=snapshot`, preview flags unset and `npm run build -- --outDir ../real-dist`. Restore environment afterward. Assemble via `npm run site:prepare -- --source-root <checkout> --data-root <primary> --stage-root <stage> --build-root <stage>/real-dist --output <stage>/packages`, then create/verify only the site ZIP with `package_site.py`. Keep recorded source/data roots consistent through assembly. Serve only the prepared site for acceptance.
- [ ] Authenticate the full source/data/template/package inventory and protected inputs. Measure file count, total bytes, ZIP size and largest file. Retain the 15,000-file planning alert, 1,000-entry/25 MiB-per-file packager limits and smaller live limits: 8 MiB payload, 4 MiB ZIP, 1 MiB manifest, 128 logical checks. Expect a few changed frontend assets, not new routes. Reject fixtures, source/proof/private inputs, signed URLs or public Mexico routes. Never enlarge limits merely to pass this batch.
- [ ] Locally restore all **32** real product/direction/comparison/history combinations through URLs and reloads. Check four control values, history point counts, KPI/source/qualification text and existing destination-link context. Compare the 16 unique numerical views to the retained independently calculated Graphite oracle after verifying its accepted-input bindings; an independent checker directly recomputes representative monthly/rolling import/export totals, shares and duty denominators from unchanged accepted data. A mismatch fails acceptance.
- [ ] Check all 22 existing routes, theme/search/research navigation, source disclosures, Canada static-history wording and homepage print. Inspect 320/390/736/1024/1280px in both themes. Compare four product merchandise CSVs, one duty CSV, one Canada CSV and representative merchandise/share/duty PNGs against the pinned unchanged inputs/predecessor behavior. No new export feature/schema is introduced.
- [ ] Have an independent reviewer check the final source/package/data binding, query/readiness results, real-view evidence and restoration readiness. Pin the exact accepted ZIP/manifest hashes and runtime source in a read-back-verified publication decision. This approval delegates publication of that passing package without another routine question.

## Task 4: Publish, verify, restore if needed and finish actual cleanup

**Files:** Add `docs/validation/overview-view-links.md` and `docs/validation/overview-view-links-evidence.json`; update only relevant current-pilot/overview status in `README.md`. Preserve private packages, bodies, screenshots and logs in ignored evidence.

- [ ] Observe the existing provider target/Free plan/Production assignment. Require the authenticated Graphite baseline, run `site:verify` against canonical plus the actual baseline deployment origin, and pass all planned checks (currently 88) plus eight Mexico checks. A different deployment ID with identical authenticated payload/headers may be bound after recording provenance; different bytes or unrelated owner work requires a decision before writing. Read Production again after baseline checks.
- [ ] Immediately before upload, require unchanged baseline assignment and re-authenticate the candidate ZIP/manifest. Direct Upload only the accepted ZIP to the fixed Production main target. Record actual deployment ID/origin and outcome; never infer the provider URL or blindly retry an unknown outcome.
- [ ] Run `site:verify` using the new package pins and actual origin; require every planned payload/hash/header/negative-route check plus the eight supplemental Mexico checks. Retain exact counts and failures. The one shared repeat is only for demonstrated transient failure, never a partial-success claim.
- [ ] Within the live browser budget, visit the 22 existing routes, then eight saved overview samples covering every product/direction with both comparison periods and history windows represented. Check clipboard/manual copy, reload, native history, profile-link context, theme persistence, mobile/readiness/static defaults and representative accepted figures; use client control changes for additional combinations without expanding navigation counts. Smoke-test the deployment origin too. Check one CSV per product, representative PNGs and Canada/portfolio downloads. Require no page errors, broken assets or unexpected source requests. After all checks, freshly read Production and require this exact candidate deployment before recording acceptance; sequential checks do not freeze Production.
- [ ] Any confirmed figure/link/readiness/clipboard/asset/header/private-route/download/layout regression fails acceptance. Before restoration, freshly require Production still belongs to this batch's failing candidate; otherwise preserve evidence and request a decision without overwriting someone else's update. Restore the pinned Graphite ZIP, record its actual new deployment origin, pass predecessor `site:verify` and supplemental Mexico checks, smoke-test homepage/all four products/Canada and a download, then freshly require that restoration assignment. If restoration cannot be verified, report promptly rather than claim completion.
- [ ] After successful restoration only, the single allowed reproduced repair may be reviewed/tested/merged, rebuilt and reaccepted under Tasks 2–3, then uploaded as the second candidate. Restore again if it regresses and stop further publication. No withdrawal package or broader provider/data repair is authorized.
- [ ] Record actual source/tree/package/deployment identities, build measurements, test/browser/live counts, any failure/repair/restoration and remaining limitations. Distinguish the runtime upload commit from later documentation-only merges. Independently review/attach/CI/merge the evidence PR; do not rebuild or republish just to embed a documentation commit.
- [ ] Hash-read-back useful proof, reviews, packages, provider/verifier/browser receipts and final fingerprints into durable storage. Stop only task-owned processes, preserve evidence, archive the owned managed worktree natively and remove only resolved verified task-owned scratch. Verify actual path/process cleanup, attachment reattachment, main synchronization and clean tracked state, preserving the unrelated September proposal. Report any native archival blocker precisely; older Mexico cleanup remains separate.

## Self-review and execution handoff

Self-review checked design coverage, exact parser/hook interfaces, all five review-focus cases, task boundaries and permission accounting. The design uses the current default product order and supplied fixture membership; ignored tracking keys are distinct from invalid supported keys. Initial URLs are read without rewriting, later edits replace history, and clipboard state cannot outlive its selection. Local 32-state coverage is separate from the bounded live samples. Six verifier calls cover baseline + two candidates + two restorations + one transient repeat; browser totals and four attachment slots cover the maximum authorized path.

No new source/data/R2/Mexico release authority is inferred. Current Graphite, not the older predecessor, is pinned for restoration. Production and clean-source readbacks remain execution gates. Implementation stays root-owned with strategic independent review, as previously requested. After owner approval execute all four tasks without routine permission pauses; pause only for missing human sign-in, unresolved identity/target changes, exhausted allowances or material scope expansion.
