# Merchandise Download Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Root implements the four tasks; independent subagents audit bounded evidence and one fresh reviewer checks the complete branch before integration. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the original product-profile merchandise downloads as reliable during filtering, navigation and hydration as the newer duty and country-share downloads.

**Architecture:** Extract the existing merchandise PNG/CSV controls into a small lifecycle-owning component. Keep the existing chart SVG, converter, filenames, CSV serializer and financial calculations unchanged. Derive export identity from actual chart content and release provenance, and enable the existing profile controls only after saved-view restoration is ready.

**Tech Stack:** Existing Astro/React/TypeScript, Node 24, Vitest/Testing Library/Playwright, configured Python 3.12+ and the locked dependencies already used by this repository.

**Spec:** The combined design below, the launch brief at `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md` (First release, Shareable charts and tables, and acceptance), and the existing download contracts. The user requested one reviewable design/task/permission bundle; this document combines them for that review. It is a proposal, not approval to implement or publish.

## Intent, evidence and recommendation

The user wants a useful public trade-research pilot, with accurate, sourced downloads and continuous development within its existing scope. The next milestone should improve the research flow already delivered, without adding data coverage or another measure merely to keep adding features. Reader demand and willingness to pay remain unvalidated.

This is a **bounded change to existing flows**. `src/components/ProductExplorer.tsx` currently awaits merchandise PNG conversion and then downloads or sets an error without checking whether its chart context or mounted component changed. Selection changes clear the error, but a late rejection can set it again. The initial server HTML also renders the merchandise direction/window and download controls enabled before their handlers are available. New duty/share download components already guard these situations. These are findings from code inspection; Task 1 must reproduce the late-result behavior before claiming a verified fix. The existing closure captures its original direction/filename, so no mismatched-file corruption is claimed from inspection alone.

**Recommend merchandise download reliability first.** It directly supports the approved sourced-chart requirement and addresses a concrete inconsistency. Two alternatives were assessed independently:

- Share-ranked country rows could gain an explicit monthly-share-history action. That is useful navigation, but the current primary links intentionally open exact-period comparisons; this separate improvement need not precede a download reliability fix.
- A fresh profile performance audit could measure the now-larger selected-country DOM. No current speed defect or expected improvement is established; measurement should precede an optimization claim. Chart geometry/export-only markup refactoring stays separate.

The underlying success test is simple: a download belongs to the chart that requested it; obsolete work cannot affect the new view; current CSV remains usable; and controls accurately indicate when they can work. This milestone does not satisfy the still-open acceptance requirement for a second successive official data release.

## Combined design

### Merchandise download component

Create `TradeChartDownload({view,svgRef,ready})`, with props `{view:ProfileView;svgRef:RefObject<SVGSVGElement|null>;ready:boolean}`. `ProductExplorer` retains the existing ref passed to `TradeChart` and passes that ref, its current `ProfileView` and `Boolean(viewLink)` to the new component. Remove only the former merchandise download state/handler/inline controls from `ProductExplorer`; do not move link, comparison, selection or data logic.

Keep the labels **Download chart PNG** and **Download data CSV**, filenames `hs-{productCode}-{direction}.png` and `.csv`, existing button classes, PNG dimensions 1920×1080 and current displayed SVG/provenance. Do not change `TradeChart.tsx`, `src/lib/trade/downloads.ts`, the CSV schema, converter, chart geometry or existing PNG metadata layout. There is no new chart, export-only SVG, route, URL parameter or stored download.

Capture a cloned SVG and literal filename before the first asynchronous boundary. The context identity contains product code/title, reporting month, direction, ordered series code/name and every point's month/value/boundary/classification fields, plus source/measure/retrieval/version/URLs/revision provenance. It excludes comparison-period choice, ranking state, picker search, hash, link-copy feedback, summary/partner aggregates and the nominal 12/60 selector when actual series are identical. An identical rerender preserves pending work; an actual series, order, country, direction, release identity or provenance change invalidates it. An away-and-back transition must not revive the original job: use an identity-specific token, not only string equality at completion.

Allow at most one conversion per mounted component instance. A synchronous ref guard must reject duplicate activation before a React rerender. An invalidated in-flight job remains busy until it settles; it may neither download nor publish an error. Its finalizer releases busy state only while mounted. Unmount suppresses all eventual download/error/state effects. Do not add image transport, cancellation APIs, timers or a second concurrent job.

On success require a nonempty `Blob` with type `image/png` before downloading. On a current-context conversion/missing-SVG/invalid-output failure show the existing scoped message: **PNG export failed. You can still download the displayed data as CSV.** Clear it on a new PNG attempt or actual export-identity change; unrelated summary/hash/ranking changes preserve it. Retry must work. CSV uses the current `view` and unchanged `serializeCsv`; it stays enabled during PNG conversion once ready. Zero, missing and classification behavior remains the existing merchandise contract, including an all-unavailable chart; do not introduce new availability rules.

### Readiness and accessibility

Use the existing saved-view restoration signal, `Boolean(viewLink)`, for merchandise direction/window controls and both merchandise download buttons. Before readiness, all are disabled. Once restored, direction/window/CSV remain usable during a PNG job; only the PNG button is busy-disabled. Restoring an exports/countries/monthly-comparison link must never briefly permit a default-import download.

The new component owns a scoped `role="status"` message **Creating image…** during conversion and the existing `role="alert"` error. Keep focus on the activating button and retain ordinary keyboard behavior. Update the existing noscript explanation to include changing direction/history and downloading PNG/CSV; its readable default import chart, table, source and other research links stay available. Do not add a global announcer or alter duty/share/Canada controls.

### Compatibility and verification boundaries

Use only the two accepted coffee products through August 2026 and the existing qualified September 2024–August 2026 Canada snapshot. No amounts, ratios, rankings, periods, classification rules or accepted-data pointers change. Keep all existing CSV bytes unchanged, including country-share exports. Keep the shared converter and chart source unchanged and compare their identities before/after.

Preserve unavailable values and existing line breaks. PNG acceptance compares raw-data expectations, actual SVG texts/paths/markers/geometry and output signature/dimensions/nonblank content; do not require cross-platform PNG byte equality. Long-fixture names/provenance belong in identity/race tests, not a hidden layout redesign. Existing chart-layout limitations remain separate unless this change introduces a regression.

## Global constraints

- Planning main: `63399fdae5b861bed643979af7609ec15fc811aa`; last published package source/runtime: `43de0762a4fd8b1c8e5627e55851406ad297ce3b`. Authenticate their documentation-only difference before edits.
- Root implements. Use a native managed worktree; no feature implementation on primary main. Preserve the approved proposal's original bytes/hash before committing the working copy.
- Node 24, existing Python 3.12+, locked `npm ci`, existing browser/runtime setup. No dependency, workflow, browser transport or service changes.
- Protect the seven accepted state files, eleven protected identities and six existing calculation/CSV producers listed in the pinned predecessor's `execution/baseline-authentication.json`; also protect `TradeChart.tsx`, duty/share models/components/serializers and shared converter.
- Same static host and browser-generated downloads. No new routes, query schema, public R2, stored selections or server processing.
- Unchanged package gates: 1,000 entries, 25 MiB per asset; live policy 2 MiB raw payload, 4 MiB ZIP, 1 MiB manifest and 128 logical checks. Derive actual candidate checks from its manifest. These are pilot policies, not claimed provider limits. File-count planning warning stays 15,000.
- Last verified package: 31 entries, 1,873,448 raw bytes, 408,591-byte ZIP, largest asset `products/090121/index.html` 350,466 bytes. JS 379,620 raw/114,440 gzip bytes; CSS 21,963 raw/4,510 gzip bytes. Raw-policy headroom is 223,704 bytes. Measure every candidate; do not raise caps or claim speed improvements.
- Bound copies of the seven accepted processed-state files to 16 MiB total. Keep useful new private proof, including post-seal records, within 1,000 files/64 MiB; authenticate prior proof in place and copy only needed baseline evidence. Do not copy/replay the large raw Canada preservation set.

## Permissions requested for all four tasks

Full approval covers the following work without routine approval pauses:

1. Root implementation, independent reviewer/auditor subagents, native worktree creation/reuse, scoped sandbox escalations, locked runtime setup, local fixtures/tests/builds, private evidence and bounded accepted-data/package copies, and owned loopback browser checks/downloads/screenshots.
2. Git branches/commits, pushes, creation/attachment of at most two PRs (feature and factual documentation closeout), exact-final-head push/PR Code checks, independent review and expected-head reviewed merges under standing merge permission. Synchronize clean main and bind its tree/non-documentation inputs to the staged runtime.
3. Attachment-capacity maintenance: reserve four spare chat-attachment slots before starting the worktree. If needed, preserve identity/URL and verified merged status before unlinking at most four obsolete already-merged PR chat attachments. Leave the actual GitHub PRs intact. Recheck capacity before PRs and native archive; queued is not complete.
4. Signed-in read-only Cloudflare preflight and publication of the exact reviewed, CI-passed, merged, input-bound package to existing **Workers Free / Active / Production / us-trade-tracker**, account `2e23d873002d29a02a1427e1fa37c5cd`, canonical `https://us-trade-tracker.pages.dev`. At most two candidate uploads; a runtime repair repeats required acceptance, reviewer-finding disposition and exact-head CI before its upload. The single post-review fix pass is verified by its regressions/full suite, without a second whole-source review.
5. Bounded read-only live verification at canonical and dashboard-observed predecessor/candidate/restoration origins: one existing `site:verify` run per transition, plus this plan's specified reader/download checks. Allow one affected read-only retry for demonstrated transient/propagation or private-harness readiness failure; preserve original failures. No broad crawl or guessed deployment origins. Keep request/body/redirect/deadline/private-route protections unchanged.
6. Automatic restoration of the exact pinned verified predecessor if a candidate regresses, at most once per failed candidate, followed by bounded verification. Preserve failed outcomes; ordinary regression recovery uses the working predecessor, not the withdrawal package. Claim restoration only when executed.
7. Reviewed documentation closeout, private proof sealing/readback, stopping owned previews, native managed-worktree archival, exact owned plan-cache cleanup after evidence preservation, post-archive completion/readback and final clean-main confirmation. Preserve siblings and historical evidence. Do not replace queued actions with manual deletion of the managed checkout.

**Excluded:** imports/source requests, raw-source replay/recovery, new months/products/countries, data intake/replacement, Canada refresh, R2 operations, dependencies/services/accounts/domains, paid/access/indexing changes, recurring jobs, analytics/outreach, subscriptions/billing, chart geometry/metadata redesign, dash-pattern changes, and the separate share-history navigation/performance proposals. Existing broader R2 permission does not authorize an R2 operation in this batch.

Pause only dependent work for a newly discovered material cost/access/terms/sign-in boundary, unexplained concurrent Production/input change or integrity failure; investigate read-only and finish unaffected work. Current authorization does not establish these future outcomes.

## Pinned predecessor and recovery

Last verified Production: **366dd791-fb1d-4691-8b5c-d2ea63e104ba**, observed origin **https://366dd791.us-trade-tracker.pages.dev**. Private predecessor directory: `data/backups/country-share-history/deployment-20261015-r1`.

| File | Bytes | SHA256 |
| --- | ---: | --- |
| `packages/site.zip` | 408,591 | `9d65c7a0d198faf5472f5269e6e29417f9e2cfd1d73f1b98617c75aa1c69d53a` |
| `packages/site-manifest.json` | 6,556 | `d4aae8e2edaa1c28de1730ab28bca8e206ee1869efba3d68ec1455f485f97d14` |
| `preservation-manifest.json` | 201,338 | `31e982b27191f02ecfb251fcc85823656b40ebb1e5186a4fa8b082db6d5eaf7d` |
| `completion.json` | 3,195 | `97dd9778e8d2b089a8008b3c0499c57acbf08e2a6f4d99e1e53007245a072e33` |
| `post-seal-finalization.json` | 3,185 | `e995e52357744687064e17a94dd024fe0ec4208ca3deb9ffef124acf994144cb` |
| `post-seal-final-readback.json` | 1,322 | `ace6e180be43e826e476566cc72494b2d38cf775d65342c5705d9c7c4f4ed61c` |

Planning readback matched these files and completed status. At execution authenticate the 776 sealed identities and 16 finalization-record identities and their external pins, then relevant CSV/producer/input evidence. Before upload freshly confirm actual Free/Production assignment and canonical/predecessor payload; this plan makes no fresh provider-state claim.

Retain compatibility baselines: 112 legacy CSV cases plus Canada projection, six duty-chart CSVs and 17 country-share CSVs. Authenticate those records/producer bindings; exercise the changed merchandise path and the focused coexistence checks below. The older extra-28-case indirect producer binding limitation remains disclosed; no new source-data validity claim. New merchandise matrix cases overlap existing coverage and must not be added together as distinct data observations.

## File and interface map

- Create `src/components/TradeChartDownload.tsx`: component/props above, chart-context identity/token, PNG lifecycle and current CSV action; no new generic hook/framework or public helper API.
- Modify `src/components/ProductExplorer.tsx`: delegate merchandise downloads, readiness on direction/window controls and expanded noscript copy only. Retain the existing SVG ref, selection/link controller, calculations, other sections and navigation.
- Create `tests/ui/ProductExplorerDownloads.test.tsx` for reproducing the existing late-result failure and integration/restoration transitions; create `tests/ui/TradeChartDownload.test.tsx` for isolated lifecycle/readiness/Blob cases; extend `tests/ui/ProductExplorer.test.tsx` for server-readiness copy and controls.
- Create `tests/e2e/merchandise-download-reliability.spec.ts`: fixture keyboard/mobile/static/delayed-hydration interactions. Extend existing profile tests only where the intentional initial-disabled contract requires it.
- Create `docs/validation/merchandise-download-reliability.md`; update README current status/measurements and this plan. Private audit/browser scripts and receipts belong under this plan's ignored workspace/proof directories, outside served trees.
- No source changes to `TradeChart.tsx`, `src/lib/trade/downloads.ts`, existing calculators/serializers, URL controller, package/live tooling, CI, provider templates or data files.

## Review focus

1. Deferred success/error after direction/countries/order/release changes or away-and-back cannot affect the current view; the click's SVG and filename stay bound. Task 1.
2. Identical rerenders, summary-period/ranking/search/hash changes and nominal-window changes with identical actual history must preserve a valid pending export; an actual history change must cancel delivery. Task 1.
3. Rapid keyboard/double activation cannot start duplicate work; unmount suppresses late effects; readiness must follow restored saved filters, not initial default HTML. Tasks 1–2.
4. Current rejection, missing SVG, empty/wrong-type/non-Blob output gives the scoped error and current CSV fallback; retry and independent duty/share controls remain usable. Tasks 1–2.
5. World/one/three-country zero/gap histories keep exact PNG/CSV semantics and package limits; no shared converter/data/source drift hides behind the extraction. Tasks 3–4.

## Task 1: Guard merchandise download lifecycle

**Deliverable:** A focused download component with proven suppression of obsolete asynchronous results.
**Interfaces:** consumes existing `ProfileView`, parent SVG ref and restored-ready boolean; produces unchanged PNG/CSV actions, busy status and scoped error. Task 2 consumes the same readiness signal; Task 3 consumes its exports.

- [x] Authenticate the predecessor/proposal/source/input baseline and record baseline tests before runtime edits. Reserve attachment capacity, create/verify the native worktree at planning main, establish this plan's ledger and locked runtime, and capture the baseline merchandise matrix described in Task 3 from the verified predecessor package on owned loopback. Preserve original proposal bytes/hash and meaningful failures.
- [x] First reproduce the current behavior in `ProductExplorerDownloads.test.tsx`: start a deferred PNG on imports, change to exports, reject conversion, and assert no obsolete alert/download. Run `npm test -- tests/ui/ProductExplorerDownloads.test.tsx --maxWorkers=2`; expected RED because the existing handler publishes the late error. Also cover a deferred success after changed context.

```tsx
const job=deferred<Blob>(); // test-local promise/resolve/reject helper
vi.mocked(exportChartPng).mockReturnValueOnce(job.promise);
render(<ProductExplorer release={sampleRelease()}/>);
await user.click(screen.getByRole('button',{name:'Download chart PNG'}));
await user.click(screen.getByRole('radio',{name:'Exports'}));
await act(async()=>job.reject(new Error('conversion failed')));
expect(screen.queryByRole('alert')).toBeNull();
expect(downloads).toHaveLength(0); // intercepted browser downloads
```

- [x] Write isolated component tests before implementation: exactly one conversion on double activation; clone/filename snapshot; changed country order/direction/point/retrieval/version/source URLs/revision; A→B→A; unmount; unchanged-content rerender; unrelated comparison period/hash/ranking/search; 12→60 with identical versus different actual points. Test success, rejection, null/non-Blob/empty/wrong-type Blob, missing ref, retry and current CSV during busy. Use explicit deferred promises, not timing sleeps.
- [x] Implement `TradeChartDownload` and replace only the existing inline download owner in `ProductExplorer`. Preserve valid PNG content/CSV bytes and the busy-until-settled contract. Run the two new UI files plus `tests/ui/ProductExplorer.test.tsx` and `npm run check`; expected GREEN and zero type diagnostics. Commit the component/integration/tests/approved plan.

## Task 2: Match controls to hydration and restored selection

**Deliverable:** Honest initial disabled controls, correct first enabled download and accessible progress/fallback.
**Interfaces:** consumes Task 1's `ready` prop; produces the existing controls after saved-view restoration without changing URL/selection contracts.

- [x] Add failing server-markup tests for disabled direction radios/history selector and both merchandise download buttons, readable default trade data, and the expanded noscript explanation. Run focused UI tests; expected RED for the old enabled direction/window controls and incomplete explanation.
- [x] Apply `Boolean(viewLink)` readiness to those existing controls and verify Task 1's scoped busy status/error behavior. Verify saved exports/12-month/three-country/monthly-comparison restoration, invalid URL fallback, popstate/hash changes and first enabled PNG/CSV identity. An error from an old view never reappears; an unrelated current summary change does not silently dismiss a valid current error.
- [x] Add fixture browser coverage for both products, keyboard activation, 320/375-pixel mobile use, no JavaScript and delayed hydration. Block the existing client script loading only inside local tests; assert controls disabled until restoration, then enabled and matching the restored chart. No public-page runtime injection is needed for these race claims.
- [x] Run `npm test -- tests/ui/TradeChartDownload.test.tsx tests/ui/ProductExplorerDownloads.test.tsx tests/ui/ProductExplorer.test.tsx --maxWorkers=2`, `npx playwright test tests/e2e/merchandise-download-reliability.spec.ts tests/e2e/profile-view-links.spec.ts tests/e2e/product-profile.spec.ts`, and `npm run check`. Expected GREEN with no page errors or type diagnostics. Commit.

## Task 3: Prove retained-data compatibility and package readiness

**Deliverable:** A fully measured, authenticated local candidate and bounded reader acceptance for Task 4.
**Interfaces:** consumes Tasks 1–2 runtime and predecessor pins; produces actual source/runtime/data/package hashes, numerical/download proof and unchanged-source identities.

- [ ] Run final runtime `npm test -- --maxWorkers=2`, `npm run check`, explicit fixture-mode `npm run build`, `npm run test:e2e` and configured Python `-m unittest discover -s tests/packaging -v`. Set `SITE_PACKAGE_PYTHON` explicitly. Expected all pass with zero type errors/warnings/hints; baseline is 1,411 unit/164 browser/24 Python tests, and new totals are recorded honestly. Keep full suites separate from staging deadlines.
- [ ] Fresh `site:stage create --source-root <owned-worktree> --data-root <primary> --output <fresh-stage> --commit <actual-committed-head>`, then `site:stage verify --source-root <owned-worktree> --data-root <primary> --stage-root <fresh-stage>`. Use README's exact retained-build recipe with `TRADE_DATA_MODE=census`, `CANADA_PILOT_MODE=snapshot` and private preview flags removed; verify again and use existing `site:prepare` plus `scripts/package_site.py create/verify`. Expected all receipts/readbacks pass; create/verify repeated ZIPs deterministically, without reusing a failed output directory.
- [ ] Authenticate 112 existing CSV cases/Canada projection, six duty CSVs and 17 share CSVs and their producer bindings against the sealed baseline. Recheck seven accepted/eleven protected files, six existing producer files, chart/converter source and all duty/share/Canada code/data identities unchanged. Byte-compare new merchandise/coexistence downloads below to matching authenticated cases, capturing any extra predecessor cases before edits. New fixture-only race coverage must not be called real-data evidence.
- [ ] Run **24 merchandise cases = two products × two directions × two windows (12/60) × three selection modes (world/one/three)**. For 090121 use one1220/three1220,2010,2050; for 090111 imports one4419/three4419,2010,2050; for 090111 exports one2010/three4419,2010,2050. Each case produces one PNG and one CSV. Derive expectations directly from retained observations/statuses/classification, not application calculators. Compare unchanged SVG text/path/marker/geometry semantics and exact CSV to the predecessor; verify PNG signature, 1920×1080, nonblank plot, identities/source/period/units and readable representative images. Include existing zeros/gaps; no zero-filling. Counts overlap other baselines.
- [ ] Add focused coexistence checks within four of those profile cases: both products' imports/12/three-country views export their two duty PNGs plus share PNG/CSV and duties CSV; both products' exports/60/one-country views have no duty section and export share PNG/CSV. This is **eight ancillary PNGs/six ancillary CSVs**, compared with matching retained expectations and exact CSV baselines. Verify those controls remain independent during a deferred merchandise job in fixture tests. Capture desktop/mobile/static readiness screenshots and inspect representative PNGs; require no console/page errors or unexpected requests. Full public briefing/Canada/share/duty matrices are unnecessary for unchanged runtime/data; existing fixture suites, authenticated records and package/live asset checks cover those boundaries. Private geometry checks must await load/fonts when needed; preserve failures and retry only evidenced harness/transient causes.
- [ ] Measure entry count, raw/gzip profile HTML/client JS/CSS, largest asset and default/selected DOM. Explain all deltas and enforce unchanged caps; do not promise performance gains. Record actual local outcomes in the validation page/README/ledger, then commit factual acceptance docs. Expected ready-for-review candidate, not a public-completion claim.

## Task 4: Review, merge, publish and finish actual closeout

**Deliverable:** Verified public reliability update, or an honest failed-candidate record with the pinned working predecessor restored.
**Interfaces:** consumes Task 3's authenticated runtime/data/package; produces actual review/CI/merge/provider/live/proof/archive/completion outcomes.

- [ ] Self-review combined design/constraints, obtain one fresh immutable whole-branch review with this Review focus and evidence/ledger, grade findings by reader impact, and complete the one bounded required fix pass with RED→GREEN/full-suite evidence. Record rulings and deferred minors. Any runtime repair restages and repeats affected acceptance; do not upload an unreviewed candidate.
- [ ] Push/create/attach the feature PR. Require successful exact-final-head push/PR Code checks and expected-head merge. Synchronize clean main; prove its reviewed tree and all non-documentation build inputs equal the packaged source/runtime. Identical merged runtime does not need a redundant full local test cycle.
- [ ] Fresh signed-in Free/Active/Production and prior-origin verification, then immediate candidate/recovery ZIP+manifest and accepted/protected readback. Upload only the bound package, observe its actual Production UUID/origin, and run existing bounded `site:verify` with manifest-derived check counts. Repeat the 24-case merchandise matrix and four focused coexistence cases publicly; compare exact CSV and retained numerical expectations, inspect saved public screenshots/PNGs. Public success does not claim the local delayed-conversion probes ran on Production. On regression restore and verify the pinned predecessor within the approved limits; preserve true outcomes.
- [ ] Create factual documentation closeout, independently review that immutable documentation diff, require exact-head CI/expected-head merge and final-main/runtime/input binding. Preserve useful proof under `data/backups/merchandise-download-reliability/deployment-20261015-r1`, seal/read back before native archival, and stop owned previews. Confirm attachment headroom and native `archived_worktree` plus exact checkout absence; queued is still pending. Only after those gates run the post-archive Task 4 completion verifier/helper, preserve completed ledger/log and post-seal metadata, clean only this owned plan cache and confirm clean main. Earlier sealed pending checkpoints remain truthful and unchanged. Report all actual outcomes, rulings/minors and limits.

## Self-review and handoff

The design fixes one existing download/control flow; its tasks add no financial calculations or generic framework. Task 1's component consumes existing data/ref/readiness; Task 2 does not change those interfaces; Tasks 3–4 authenticate exactly that runtime and its unchanged data/producers. Identity excludes unrelated view state while retaining all chart/filename/provenance inputs and an ABA-safe token. SSR controls and first enabled export have explicit tests. Compatibility, package headroom, publication/restoration, attachment capacity and real native archive completion are explicit gates.

Self-review corrected duplicate busy/error ownership between Tasks 1 and 2 and clarified the one post-review fix-pass verification. It also reduced unchanged-feature acceptance to authenticated baselines plus four focused coexistence cases; full public matrices are reserved for an actual regression or relevant new change. The test-first integration reproduces the existing failure; extraction is not treated as proof by itself. File map, props, CSV/PNG contracts, private-copy limits, package caps and four-task handoff match throughout. No scope requirement lacks an owning task.

Review this combined design, four tasks and permission envelope. Full approval selects the preserved execution method: root implementation with independent review and the specified publication/restoration, without routine approval pauses. No implementation, GitHub change, new service, data operation or publication is authorized merely by writing this proposal.
