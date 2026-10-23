# Mexico Local All-Goods Profile — Design and Five-Task Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root owns implementation and integration; independent agents perform read-only design, calculation and final code reviews. Execute only after owner approval of this combined design, all five tasks and the permission envelope. Track execution with checkboxes.

**Status:** Owner approved all five tasks and permissions, October 23, 2026. An independent read-only builder check returned “nothing important left”; root also checked task/interface coverage and the permission envelope. Execution is authorized within this local-only envelope; publication remains excluded.

**Goal:** Make the privately accepted Mexico snapshot useful to inspect locally: Imports/Exports, monthly all-goods history, two twelve-month totals, qualified growth and sourced CSVs, with every product comparison withheld.

**Architecture:** Add a Mexico-specific, opt-in route at `/preview/mexico/2010/`. A server-only adapter calls the existing authenticated selected-release reader and creates a small presentation object; it never serializes the archive, owner authorization or evidence envelope. Normal and public-site builds omit the route. Keep Canada's fixed contracts and all acceptance policies unchanged.

**Tech Stack:** Existing locked Node 24, Astro/React/TypeScript, Vitest, Playwright, Python packaging checks and GitHub. No new dependency, service or workflow.

**Spec:** The Design section in this combined document is the specification. The owner requested a reviewable next-task plan and all permissions together. Approval selects the recommended approach below; implementation remains gated on that review.

## Recommendation and observed baseline

The next useful step is a local Mexico profile rather than another tooling-only change. Country research is part of the launch scope, and Mexico's private all-goods acceptance is complete. This recommendation is based on available verified data, not evidence of user demand. Owner-run pilot research remains available through `docs/research/pilot-task-study.md`.

- Planning main: `9a36e49933b93b9ad5b2fbd8aad7a99c0e7041d3`, after reviewed PR #148. Existing code-check trigger maintenance is complete.
- `docs/data-validation/2010-acceptance-readiness.md` and `2010-private-acceptance-evidence.json` record private acceptance, two remote recoveries and a separate selected local readback. During planning, the unchanged selected reader also passed a read-only local authentication: Census source, 48 observations, private-accepted pointer, product comparisons false and public profile false. The four installed file hashes below match. This is not a fresh independent source verification or raw-source replay.
- Mexico reporting window: September 2024–August 2026; 48 all-goods observations, four twelve-month totals and two growth results. Private selection: `2026-08-d15a1fdc-2f1c-4d39-8532-7bb8451ddf18`, accepted at `2026-10-19T04:12:15.203Z`.
- Retained current reference grids: 48/48 matching controls before collection and 48/48 after. Dated publications: 16 matches and 32 differences. Difference causes and original-byte vintage remain unestablished. These are whole-snapshot counts across both directions, not counts for each direction.
- All 20 classification dispositions remain: 17 ordinary pairs unverified; three statistical exclusions remain in all-goods totals. No product, category, share, ranking or estimated-duty comparison is authorized for this profile.
- Existing selected reader: `readAcceptedMexicoAllGoodsRelease(repoRoot)` in `src/lib/mexico-country-release/acceptance-state.server.ts`. It checks the pointer, exact installed file sets, archive identities, authorization and regenerated projection, and checks inputs did not change during the read. Reuse it without weakening or replacing its checks.
- Existing Canada routes/components assume Canada-specific qualifications and product comparisons. They are not a generic country loader. Existing package tools already reject any output under a `preview` path.
- Recorded public pilot remains four products plus Canada. The latest recorded public package has 41 files / 3,145,939 raw bytes, source `73654c24e2c21909f85d30efb0b9e3df4ea02a2e`, deployment `16b5e4f3-6741-4400-9131-a9c743a12f50`. This batch does not contact or alter that deployment.
- The unrelated untracked September coffee proposal remains unchanged and gated on actual official publication. No source job is dispatched or scheduled by this plan.

## Design

### Approaches and trade-offs

1. **Recommended: a separate local all-goods preview.** Reuse the selected Mexico verifier, existing Graphite shell and formatting/download primitives. Add only the presentation, summaries and opt-in test harness needed for this page. This delivers a usable inspection surface without changing Mexico's private-use policy. The trade-off is one small country-specific adapter and component rather than a generalized country framework.
2. **Generalize Canada's profile first.** This could reduce future presentation duplication, but its types, source proofs, classifications, product tables and public snapshot modes are country-specific. Refactoring them would broaden this milestone and risk the working Canada release. Defer until another verified country actually needs the same contract.
3. **Publish Mexico immediately.** Private acceptance alone does not authorize a public release. A public profile needs a separate content/release decision, exact package, live verification and restoration target. That is a possible later milestone after this local preview is inspected, not part of this proposal.

These are proposed engineering choices. Approval of the combined document chooses approach 1; none has been silently treated as owner-approved during planning.

### Page and concise content

Reuse the current Graphite layout and light/dark theme. The local route is reachable by its exact URL only; do not add Mexico to navigation, search, product/country registries, overview, changes, briefings, methods or production selection. Do not create `/countries/2010/`.

Visible content, in order:

1. **Mexico — all-goods trade**, with the exact September 2024–August 2026 window and a persistent **Local preview · Accepted for private all-goods use · Unpublished** label. Fixture mode instead says **Synthetic development sample · No accepted Mexico release**.
2. Imports/Exports radios, with Imports as the server-rendered default. Imports means `GEN_VAL_MO`, general imports on a customs-value basis. Exports means `ALL_VAL_MO`, domestic plus foreign exports on an FAS basis. Both use nominal USD, all transport modes and no seasonal adjustment.
3. Four compact summary cards: August 2026; September 2025–August 2026 total; September 2024–August 2025 total; dollar change with percentage growth. Put exact periods and reported-month counts beside totals. These are captured figures, not a claim to the latest revised Census series.
4. One responsive 24-month line chart. Its accessible description points to the monthly values table. Missing values create gaps. A collapsed, keyboard-accessible **Monthly values and sources** section contains all 24 values and their original source links. No five-year window, country selection, chart image export, new print action or share-link flow.
5. **Download monthly CSV** and **Download summary CSV**, generated in the browser for the selected direction.
6. A short visible qualification: **Dated publication checks differ in 32 of 48 observations; causes and original-byte vintage are not established. Product comparisons are unavailable pending classification verification.** A single details section explains the two matching retained current grids, the 16/32 dated checks across both directions, collection interval, private acceptance date, prior reviewed evidence basis and preserved historical failures. Link the existing Census definitions page. Do not reuse Canada's data-exchange explanation.

Do not expose a product table, category values, per-product duties, product-growth ranking, country-share denominator or trade-balance comparison. Statistical exclusions remain included in the already verified all-goods totals; do not subtract them. Qualifications are not optional UI filters.

Controls remain disabled until hydration is ready. Without JavaScript, show Imports, all summary figures, the chart, qualifications and an operable native details/table; explain that switching and CSV downloads need JavaScript. Download errors are visible and retryable. Changing direction updates every direction-dependent card, table, chart label, filename and CSV without changing the reporting window.

### Opt-in gate and authenticated data boundary

Add `MEXICO_LOCAL_PREVIEW_MODE`, with only these states:

| Setting | Result |
| --- | --- |
| Absent | Return `null` before reading Mexico state or fixtures; no Mexico route. |
| `fixture` with `TRADE_DATA_MODE=fixture` | Validate a small synthetic presentation fixture; no accepted-state reader call. |
| `selected` with `TRADE_DATA_MODE=census` | Call the existing selected Mexico reader; use its authenticated projection and candidate metadata. |
| Empty, unknown, mismatched trade mode, or combined with any `CANADA_PILOT_MODE`, `CANADA_PREVIEW_MODE` or `CANADA_ACCEPTED_PREVIEW_MODE` | Reject the build; no fallback or mixed private/public mode. |

All non-absent modes bind only to loopback when served by this batch's harness. `noindex,nofollow` marks the preview but is not an access control. Private output must never be uploaded. Existing package rejection of `preview` files remains mandatory.

`loadMexicoLocalProfile({workspaceRoot?, environment?})` defaults to the current workspace and actual process environment. Test overrides are explicit; no environment-controlled arbitrary file path. Selected failures produce a generic unavailable/invalid error, never a fixture fallback or a dump of archive contents. A selected reader result must have source `census`, country `2010`, the pinned release ID/window, private-accepted pointer status, withheld flags and existing qualified reference counts. Do not modify old `releaseAccepted:false`, `classificationAccepted:false` or `publicMexicoProfile:false` candidate flags. Display private acceptance from the selected instrument/pointer, separately from those historical candidate flags.

The client receives an explicit `MexicoLocalProfile` object, not a spread of `MexicoAcceptanceMaterial` or its projection. Define its exact schema in `types.ts`:

- Country `2010` / Mexico; fixed window; source `fixture|census`; presentation `synthetic-local|accepted-private-local`; optional real release ID/accepted-at only for the latter; collection interval.
- Two directions, each with exactly 24 unique ordered months, correct measure/basis and nullable USD values. Each real observation has original URL, capture time, byte count and SHA-256; fixture observations have no purported real source identities.
- A small qualification object holding the fixed whole-snapshot counts, unresolved cause/vintage, classification/product-comparison false flags and an explicit prior-reviewed-evidence verification basis. Do not serialize classification dispositions or historical logs.

Cap serialized presentation JSON at 64 KiB; reject oversize rather than truncate. Source metadata is joined by exact context ID to the already authenticated candidate's `national-original-manifest.json` ZIP entries. Use `decodeMexicoCandidate(material.candidateBytes)` to obtain that authenticated manifest/capture interval; reject missing, duplicate or mismatched entries. Real source URLs must use HTTPS, hostname `www.census.gov`, a `/trade/downloads/` path and no credentials/query/fragment; preserve the exact retained URL, capture string, positive safe-integer byte count and 64-character lowercase SHA-256. Do not construct URLs from a guessed month pattern, contact those URLs or infer observation revision dates from capture times. Source URL/date/hash show which original bytes were used; this page performs no fresh raw-source replay.

Fixture data must be visibly synthetic, have no accepted ID/date, and validate the same presentation shape without modifying acceptance-contract getters outside test-only spies. The retained production candidate/authorization and policy files remain untouched.

### Summary and CSV contracts

`summarizeMexicoDirection(view)` is pure and returns `latest`, `prior`, `current`, `changeUsd` and `growthPercent`. Prior is September 2024–August 2025; current is September 2025–August 2026. A period total requires all 12 numeric observations. Missing stays unavailable, never zero. Growth is `(current-prior)/prior*100` only when both totals exist and prior is greater than zero; a zero prior yields no growth percentage, although dollar change may be available. Reject invalid month grids, negative/non-finite/unsafe integer values and unsafe sums. Never round inputs or sums; existing formatting may round display only.

Selected loading compares all four recalculated period totals and both growth results with the verified projection. Tests exercise missing/zero controls synthetically; they do not manufacture holes in the accepted installation.

`serializeMexicoMonthlyCsv(profile, direction)` emits 24 rows; `serializeMexicoSummaryCsv(profile, direction)` emits one comparison row. Filenames include Mexico/2010, direction, September 2024–August 2026, local context and monthly/summary. Share the existing `downloadBlob` primitive; no stored CSV variants.

Monthly columns include country code/name, direction, month, value/status, measure/basis, nominal USD/adjustment, source label, source URL/capture/bytes/hash, snapshot start/end, collection interval, private acceptance scope, release/acceptance identity when real, unpublished status, verification basis and the withheld/reference qualifications above. The summary row includes exact prior/current boundaries and reported counts, totals, dollar change/growth, latest month/value, the same provenance/qualification fields, and a quoted JSON array of the 24 source descriptors. Empty numeric cells mean unavailable; zero remains numeric zero. Fixture files say synthetic, with empty real acceptance/source identities. Use standard CSV quoting, CRLF and formula protection for string cells; do not turn negative numeric changes into text or add spreadsheet formulas.

### File responsibilities

Create:

- `src/lib/mexico-profile/types.ts`: explicit client presentation and summary types.
- `src/lib/mexico-profile/load.server.ts`: mode validation, selected readback, provenance projection, fixture validation and size limit.
- `src/lib/mexico-profile/summary.ts`: fixed-window calculations and missing/zero handling.
- `src/lib/mexico-profile/downloads.ts`: monthly/summary CSV serialization and filenames.
- `src/components/MexicoLocalProfile.tsx`: concise page, ready controls, summary, native details and downloads.
- `src/components/MexicoAllGoodsHistory.tsx`: responsive theme-compatible SVG chart/table, with gaps and accessible labels; accepts only monthly history props. Do not generalize Canada's chart to support this page.
- `src/pages/preview/mexico/[code].astro`: gated static paths, BaseLayout and `noindex,nofollow`.
- `tests/fixtures/mexico-local-profile.json`: small, plainly synthetic presentation fixture.
- `tests/mexico-profile/{load,summary,downloads}.test.ts`, `tests/ui/MexicoLocalProfile.test.tsx`: meaningful boundary/calculation/UI controls.
- `scripts/serve-mexico-profile-fixture.ts`, `playwright.mexico-profile.config.ts`, `tests/e2e-mexico-profile/mexico-local-profile.spec.ts`, `tests/scripts/mexico-profile-fixture-server.test.ts`: isolated fixture browser checks and lifecycle guards.
- `tests/e2e/mexico-preview-boundary.spec.ts`: default-build route/observation exclusion.
- `docs/validation/mexico-local-profile.md`: observed verification, limitations and reproducible opt-in local instructions without private data dumps.

Modify only `package.json` to append the new fixture browser suite to existing `test:e2e` (and add `test:e2e:mexico-profile`), this plan, and `docs/data-validation/2010-acceptance-readiness.md` to record the local-preview stage after completion. All dependencies and lockfile remain unchanged. Keep styling scoped inside the new component/route using existing theme tokens; no global theme/layout changes. Existing packaging code stays unchanged; add the focused Mexico-preview rejection case in the existing `tests/packaging/test_package_site.py` module. Do not create a substitute packaging test framework.

The fixture harness follows the existing Canada fixture server's ownership checks: a fresh owned directory under `.tmp`, loopback only, validated `PLAYWRIGHT_MEXICO_PROFILE_PORT` (default 4410, allowed 1024–65535), no reused server, signal-safe stop, environment restoration and cleanup limited to the owned non-link output. It never builds into or deletes ordinary `dist`. Preserve existing browser retries, worker/deadline policies, job budget, workflow permissions and trigger filters. No `.github/workflows` change is included; the existing CI command will include the appended suite.

## Global constraints and execution bounds

- No new Census/API/reference download, national ZIP access/replay, official-source request, manual data workflow dispatch, R2 operation, credential/access change, accepted-data installation/replacement, new product/country intake, public Mexico profile, site upload/deployment/restoration, paid change, analytics, outreach or recurring job.
- No acceptance-policy change, altered historical verdict, inferred classification continuity, five-year claim or assertion that captured values are the latest revised series. Keep all product comparisons unavailable.
- One owned managed worktree on a `codex/` branch from reconciled main. If native creation/registration fails, one clean isolated Git checkout fallback is allowed; preserve/record ownership before writes. Never repurpose the unrelated older Mexico checkout. No force-push or history rewrite.
- Root owns all edits. One read-only independent calculation/provenance check and one fresh whole-branch final review; the planning builder check is separate. No concurrent edits by agents. One additional final review is allowed only for the bounded corrective PR below.
- Existing locked dependencies/runtimes/browser builds only. `SITE_PACKAGE_PYTHON` must identify the actual Python executable, with UTF-8 output. Scoped filesystem/process permissions may cover the owned checkout, runtime downloads/caches and loopback servers, without global environment changes.
- Private input copies are capped at 32 MiB cumulative across this batch: the four installed Mexico files below; the eight product files named by the unchanged `deployment/site-product-selection.json`; and the selected Canada pointer/package/acceptance only. These 15 unique files currently total 19,168,534 bytes. Permit one materialization in the owned checkout and a second materialization of only the 11 product/Canada files in the normal site's staging project (10,743,382 additional bytes; 29,911,916 bytes combined). No Mexico input is copied to that public-build staging project. Prefer fewer copies when possible, but count every copied byte toward the cap. No raw national data, whole backup directory, R2 download or recursive archive copy. Verify fingerprints before copying; do not follow links or copy credentials.
- Retain proof outside the worktree under ignored `data/backups/mexico-local-profile/`, capped at 32 MiB including screenshots, exports and inventory. Temporary owned builds/test traces are bounded to 128 MiB total and removed after useful proof is preserved; reconstructible locked runtime installations are excluded. If limits cannot be met without discarding useful failure evidence, stop that operation and report the constraint.
- Preserve primary accepted-data/policy/classification/registry/selection hashes and existing verified site-package fingerprints before/after. Never edit a previous batch's proof/inventory. Preserve the unrelated untracked September proposal byte-for-byte.
- At most one primary public GitHub PR and one corrective/reversion PR for a demonstrated integration regression within these same file/feature boundaries. Each needs fresh independent review and successful CI at its final head before merge. At most two diagnosed infrastructure-only reruns in total; never relabel a failed application assertion or weaken it to obtain green output.

Pinned Mexico installation (all under `data/countries/2010/processed/`):

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `current.json` | 1,355 | `36fcc241eed959e216359c4178445e1859cfe85d2f3a69aace7f038ad88fead2` |
| `releases/2026-08-d15a1fdc-2f1c-4d39-8532-7bb8451ddf18/candidate.json` | 6,443,203 | `e9317cfb9269d0641613c0cfda5f97941d66e8cc68b1842f566c2e5b9f426454` |
| `releases/2026-08-d15a1fdc-2f1c-4d39-8532-7bb8451ddf18/evidence.json` | 1,979,509 | `da972a41c3dc9f92145a79b1afc54ec67bf142e6c79e458fff4c9e9da25d6fde` |
| `releases/2026-08-d15a1fdc-2f1c-4d39-8532-7bb8451ddf18/manifest.json` | 1,085 | `6f700b9067695a146f3f233982401b59cd5ad9f5364d957953068363d41b35a0` |

Reconcile main and input fingerprints before executing. Documentation-only drift can be recorded; a changed accepted snapshot, policy or release boundary requires a revised decision rather than repinning silently.

## Review focus

1. Absent or invalid mode never reads/serializes Mexico data into a normal build; public Canada mode cannot be combined with the private preview.
2. Private acceptance is distinct from candidate-stage false flags, classification verification and publication. Fixture data never impersonates real acceptance/provenance.
3. The selected source mapping binds the exact 48 direction/month contexts; an import/export swap, duplicate month, missing source or period mismatch rejects the presentation.
4. Missing and zero values remain distinct; totals use exactly 12 months and growth uses the prior total. CSV, chart and cards agree after direction changes.
5. All qualifications remain available on mobile, by keyboard and without JavaScript. Private evidence/authorization/path/secret material never enters HTML, JS, CSV, logs or public proof.

---

### Task 1: Build the gated authenticated presentation adapter

**Files:** `types.ts`, `load.server.ts`, fixture JSON and `tests/mexico-profile/load.test.ts` from the file map; this plan and private baseline fingerprints.

**Interfaces:** `loadMexicoLocalProfile(options?: {workspaceRoot?: string; environment?: Readonly<Record<string,string|undefined>>}): Promise<MexicoLocalProfile|null>`. The adapter calls the unchanged `readAcceptedMexicoAllGoodsRelease(root)`; downstream consumers receive only the explicit presentation schema. Summary functions are supplied by Task 2; final selected period comparison is integrated there.

- [ ] Establish the owned checkout and locked setup, reconcile baseline inputs and retain hashes; copy only the bounded allowlist when needed. Preserve unrelated work.
- [ ] Write failing tests for absent mode/no reader call; valid fixture/no reader call; invalid/empty/mismatched/Canada-combined modes; wrong country/window/source/status/withheld flag; missing or duplicate source/context; malformed source URL; invalid or oversize DTO; selected errors without fallback. Selected-reader unit tests may mock its return, while real reader failure controls continue to run unchanged in the full suite.
- [ ] Run `npx vitest run tests/mexico-profile/load.test.ts --maxWorkers=2`; confirm the new assertions fail for the missing adapter.
- [ ] Implement mode validation, explicit projection, selected provenance join and fixture validation. Keep all accepted-state readers/contracts unchanged. Never ship Node/archive objects to the client.
- [ ] Re-run the focused tests and existing Mexico release/archive tests; require all to pass and inspect the boundary diff before committing only Task 1 files.

### Task 2: Add exact summaries and sourced browser CSVs

**Files:** `summary.ts`, `downloads.ts`, their two test files; integrate the selected total comparison in `load.server.ts` and its tests.

**Interfaces:** `summarizeMexicoDirection(view: MexicoDirectionProfile): MexicoDirectionSummary`; `serializeMexicoMonthlyCsv(profile: MexicoLocalProfile, direction: MexicoDirection): string`; `serializeMexicoSummaryCsv(profile: MexicoLocalProfile, direction: MexicoDirection): string`; `mexicoCsvFilename(profile, direction, kind: 'monthly'|'summary'): string` with typed profile/direction parameters.

- [ ] Write failing calculation tests for the two exact fixed periods, 12 reported counts, real zeros, one missing month, zero prior, wrong month/direction, unsafe/negative/non-finite values and unsafe sum. Add tests that selected projection discrepancies reject loading.
- [ ] Run `npx vitest run tests/mexico-profile/summary.test.ts tests/mexico-profile/load.test.ts --maxWorkers=2`; confirm the newly added failure cases before implementing the minimal pure calculation and selected comparison.
- [ ] Write failing CSV tests: 24 monthly rows/one summary row; both directions; exact numeric values/periods/denominator; null versus zero; all source/qualification fields; fixture cannot claim acceptance; comma/quote/newline and formula-string controls; negative numeric change stays numeric.
- [ ] Implement serializers and filenames without stored downloads or changes to existing product/Canada exporters. Run all `tests/mexico-profile` checks and require pass before committing.

### Task 3: Build the compact local profile

**Files:** New component/chart/route and `tests/ui/MexicoLocalProfile.test.tsx` from the file map. Scoped styles only.

**Interfaces:** `<MexicoLocalProfile data={profile}/>` consumes Task 1's DTO and Task 2's summaries/exporters. `<MexicoAllGoodsHistory view={directionView}/>` consumes the monthly presentation only. `getStaticPaths()` produces `[{params:{code:'2010'},props:{profile}}]` only when loading is enabled, otherwise `[]`.

- [ ] Write failing UI tests for concise visible labels, Imports default, disabled-before-ready controls, complete direction switch, qualification counts marked as whole-snapshot, withheld products, export filename/body, and retryable visible download failure.
- [ ] Implement the specified page with existing BaseLayout/formatting and `downloadBlob`; keep accepted-date versus capture-date meanings separate. Do not refactor Canada or introduce product values/links to this preview elsewhere.
- [ ] Implement the gap-aware chart and native monthly table/details, with direction-specific accessible names and source anchors; theme colours use existing tokens.
- [ ] Run `npx vitest run tests/ui/MexicoLocalProfile.test.tsx tests/mexico-profile --maxWorkers=2` and `npm run check`; require pass before committing the UI/route.

### Task 4: Verify fixture behaviour, real values and build privacy

**Files:** New fixture harness, Playwright config, browser/server/boundary tests, package scripts, validation note and readiness note; focused existing packaging test only as specified above.

**Interfaces:** `serveMexicoProfileFixture(): Promise<void>` builds a fresh owned fixture output and serves loopback; `resolveMexicoProfilePort(value: string|undefined): number` implements the specified range/default. `test:e2e:mexico-profile` runs its dedicated config. Existing `test:e2e` appends this suite after all current suites.

- [ ] Write and run failing lifecycle tests for invalid ports, unexpected alternate port, no server reuse, normal-dist preservation, owned-output containment/non-link checks, signal cleanup and environment restoration. Implement the minimal harness using established Astro APIs.
- [ ] Add focused fixture browser checks: desktop Imports/Exports figures and CSV readback; keyboard-only switch/download/details; 375px mobile without document overflow; light/dark chart legibility; no-JavaScript Imports/details; pre-hydration disabled controls and download error/retry. Tests await readiness; no arbitrary delay or blanket retries.
- [ ] Add normal-build boundary checks: `/preview/mexico/2010/` and `/countries/2010/` are absent/404; no Mexico preview navigation/search link; no serialized Mexico fixture observations or real release/acceptance/authorization sentinels in HTML/JS/JSON. Scope numeric leak checks to identifiable records rather than prohibiting a value that legitimately occurs in product partner data. Existing partner-country observations remain allowed.
- [ ] Verify a selected-mode build from the bounded local installation, with `TRADE_DATA_MODE=census` and every Canada flag absent. Serve only loopback, inspect both directions/mobile/keyboard and read back both CSVs. Retain a sanitized screenshot and export proof privately; no source URL is fetched. Product pages in this preview build continue to use existing accepted product data.
- [ ] An independent checker reads the authenticated projection and manifest offline, recomputes all 48 observation bindings, four period totals, two growth results and 48 source descriptors, then compares with rendered/CSV values. No policy change, raw-source replay or network verification is claimed. Preserve findings; root resolves defects within scope.
- [ ] Run the full unit suite with two workers, `npm run check`, normal fixture build, full `npm run test:e2e`, existing Firefox/WebKit compatibility and the existing Python packaging/workflow suites with the real interpreter. Report actual counts/failures; do not weaken existing checks. Run `build:report` on the clean normal output; report count/size/largest file and preserve the 15,000-file planning alert.
- [ ] Build a normal four-product/Canada snapshot through existing site staging/preparation using the bounded inputs and Mexico mode absent. Verify no Mexico country route or presentation data is present. Exercise existing package rejection of a private-preview path using a tiny synthetic fixture; do not create or upload a real Mexico site package. Hash-check inputs/packages after all builds.
- [ ] Record reproducible local commands, privacy behaviour, arithmetic/provenance results and limitations in the validation note. Readiness remains private accepted/local preview only; every product comparison and publication gate stays open. Commit the verification additions after focused and full checks pass.

### Task 5: Independently review, merge and actually clean up

**Files:** Final review/integration/cleanup evidence and the public PR closeout; same implementation allowlist only if a demonstrated correction is necessary.

**Interfaces:** Consumes the final candidate and Task 4 proof. Produces a reviewed merge with exact-head CI, private proof inventory, unchanged protected inputs and actual owned-checkout removal.

- [ ] Obtain a fresh read-only whole-branch review covering the design, gates, fixture/selected separation, client serialization, arithmetic/CSV, keyboard/mobile and CI integration. No unresolved material finding is allowed; root owns repairs and reruns the affected checks. Preserve all failed outcomes.
- [ ] Push and attach one public PR. Require the complete existing Code checks pipeline, including the appended Mexico fixture suite, to pass for the final PR head. Validate unchanged job deadline/permissions/trigger semantics; do not copy the real accepted installation to CI or publish private fixtures/evidence.
- [ ] Merge with an expected-head guard under standing permission, synchronize primary main and bind the integrated tree to the tested/reviewed tree. Observe and require the automatic main integration run. At most two infrastructure-only reruns are authorized across the batch after diagnosis.
- [ ] If a demonstrated integration regression needs it, one further independently reviewed corrective or reversion PR restricted to this feature/files is permitted, with final-head CI and guarded merge. Reversion is a safe intermediate outcome, not completion of the preview; a broader change or exhausted allowance requires a new decision. No deployment/restoration operation is authorized or needed.
- [ ] Preserve a final proof inventory and public closeout with PR/head/merge/run identities, actual results, limitations, protected-input/package equality and cleanup. Private source envelopes, owner authorization and machine paths remain out of public documents/logs.
- [ ] Archive only this batch's owned worktree after preserving needed private proof. Verify native archived state, physical checkout absence and Git registration absence. If a clean-checkout fallback was used, remove only that verified owned checkout and branch using native filesystem/Git operations after preservation. Retain the PR card(s) and verify primary tracked files are clean; leave the unrelated September proposal and older Mexico checkout untouched.

## Permissions requested with approval

Approval covers all five tasks without routine approval pauses:

- Root implementation of the named local-only feature; independent calculation/provenance checking and final code review, plus a reviewer for the optional corrective PR.
- One managed worktree or the one clean-checkout fallback; scoped filesystem/process permissions; existing locked dependency/browser setup; temporary synthetic controls; loopback previews; bounded existing accepted-data copies, build/CSV/browser/package checks and private proof within the stated byte caps.
- Public GitHub branch pushes, one primary PR, automatic CI, read-only metadata/log retrieval, up to two diagnosed infrastructure reruns, reviewed expected-head merges, main synchronization and one bounded corrective/reversion PR if needed. The new test suite is integrated through `package.json`; no workflow/secret/permission change.
- Sanitized public documentation/checkpoint evidence, private proof preservation and actual cleanup. The app currently has 99 attachments; if capacity requires it, preserve metadata and verify merged status before unlinking at most the obsolete standalone PR chat cards #62 and #63. Their GitHub PRs are unchanged. Reversible, metadata-preserved handling/reattachment of this batch's own PR cards during archival is also permitted.
- No source requests or R2 operations, no accepted-data changes, no public Mexico selection or website publication/restoration, no paid services/access/indexing changes, no recurring jobs. These exclusions apply even if a previous milestone allowed those operations elsewhere. Publication can be planned separately after inspection of this prototype.

## Completion criteria

The opt-in local profile presents authenticated or clearly synthetic all-goods history and qualified summaries/CSVs; all product comparisons stay withheld. Normal/public builds omit it, and private output fails packaging guards. Independent checks and final-head/main CI pass; all protected data/policies/packages remain unchanged; proof is preserved and the owned checkout is actually removed. The final report states verified limits and does not claim Mexico has been published or freshly reverified against official sources.
