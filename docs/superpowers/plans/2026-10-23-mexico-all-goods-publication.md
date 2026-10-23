# Mexico All-Goods Publication — Design and Five-Task Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root owns implementation, provider operations and integration. Independent agents perform read-only calculation/package and whole-branch reviews; no concurrent edits. Execute only after the owner reviews and approves this combined design, its pinned companion, all five tasks and the permission envelope. Steps use checkboxes.

**Status:** Owner approved all five tasks and publication, October 23, 2026. A fresh read-only builder check returned “nothing important left”; root completed the design/interface/permission self-review. Execute within the bounds below; the final PR closeout records verification, provider operations and actual cleanup.

**Goal:** Publish the existing authenticated September 2024–August 2026 Mexico all-goods snapshot in the existing public pilot, with concise qualifications, direction switching, history, period totals and sourced CSVs, keeping every product comparison withheld.

**Architecture:** Add a separately authorized Mexico public presentation and source selection, preserving the private accepted state and local preview. Extend existing static staging/assembly and bounded live verification, retaining backward compatibility with old manifests. Publish one authenticated package to the existing Pages project, with automatic restoration of the exact current verified predecessor on a confirmed regression.

**Tech Stack:** Existing locked Node 24, Astro/React/TypeScript, Vitest, installed Playwright engines, Python standard library, GitHub and Cloudflare Pages. No new dependency/service/workflow.

**Spec:** The Design and Permissions sections below are the specification. The owner requested the design, next tasks and permissions together; approval selects the recommended approach. Companion: docs/superpowers/plans/2026-10-23-mexico-all-goods-publication-inputs.json, SHA-256 5ff4868dd95f003308bd742c6a92117776a778804426fe61493e535e4eeada37. Both documents travel with execution.

## Evidence and proposed approach

Planning main is 69c0239e35a8f28691f065207a38bf5d363ca2f4, tree 9766687873c69086afe3f0fc9fecb410334514f6, after PR #149. The local profile passed independent arithmetic/provenance review, final code review, final-head CI and main CI; its worktree was actually archived. Windows Firefox remains unverified and an inherited Windows WebKit search failure is preserved. Those limits do not become passing checks.

The companion pins all 15 current accepted input files (19,168,534 bytes), the unchanged four-product selection, a deterministic public DTO, seven predecessor artifacts and the unrelated September proposal. The 48 observations, four period totals, two growth results and exact source descriptors were independently compared with the local presentation. Retained current grids match 48/48 before and after collection; dated publications have 16 matches and 32 differences. Causes, original-byte vintage and classification continuity remain unresolved. All 17 ordinary pairs remain unverified; three statistical exclusions stay in all-goods totals.

1. **Recommended: publish a clearly qualified fixed all-goods snapshot.** Add an explicit public selection/loader and reuse the Mexico presentation, calculations and browser downloads. It can coexist with Canada without changing private acceptance or pretending products are verified. Trade-off: small country-specific publication/staging additions.
2. **Expose the private preview directly.** Reject: its route, mode guards, metadata and CSVs deliberately describe an unpublished local view; simply removing a gate would cross presentation and package boundaries.
3. **Generalize every country profile or add Mexico products first.** Defer: Canada has different evidence and category qualifications. This adds work and data claims unrelated to publishing the existing all-goods snapshot.

These are engineering recommendations, not previously granted publication authority. Approval of this document chooses approach 1. No new layout study is needed: retain the existing compact Graphite profile and change only its publication wording and discoverability.

## Design

### Explicit public authority, separate from private acceptance

Create deployment/site-mexico-selection.json only after approval. Its strict schema is:
- schemaVersion: 1; selectionId: mexico-all-goods-pilot-v1; countryCode: 2010; scope: all-goods-only; from: 2024-09; to: 2026-08; source: census; productComparisonsAvailable: false; classificationAccepted: false.
- releaseId and four exact installed-file identities from the companion; each identity contains path, bytes and SHA-256. No raw envelope, owner authorization, credential, signed URL or filesystem capability is included.
- publicProfile: bytes 14,429; SHA-256 16ee47da3087dea5529de1c60fdc5f8fe9d4523203c7fe40a5725408b5149d09. Canonical bytes are UTF-8 JSON.stringify({...authenticatedLocalProfile,presentation:'public-pilot-snapshot'}), without a trailing newline. No other field changes.

This authorizes publication of the safe 48 all-goods observations, period results, original-source URLs/capture times/byte counts/hashes and existing safe acceptance identifiers/date/scope. It does not authorize publishing any private source/evidence/authorization envelope. The original acceptance scope remains private-all-goods; public presentation is a separate owner decision. All candidate/private false flags and historical failed verdicts stay unchanged.

Do not modify mexico-country-release, mexico-country-archive, their policy/contracts/accepted files, classification/registry, or Canada's source/presentation policy. A different accepted pointer/projection/selection is a stop condition, not an invitation to repin.

### Modes and public DTO

Add MEXICO_PILOT_MODE with only fixture and snapshot. Absence returns null before filesystem or accepted-state reads. Empty/unknown values, mixed private previews and incompatible product/Canada modes reject before reads:
- fixture requires TRADE_DATA_MODE=fixture and CANADA_PILOT_MODE=fixture.
- snapshot requires TRADE_DATA_MODE=census and CANADA_PILOT_MODE=snapshot.
- Either public mode forbids MEXICO_LOCAL_PREVIEW_MODE, CANADA_PREVIEW_MODE and CANADA_ACCEPTED_PREVIEW_MODE.
- Private Mexico mode, when set, also forbids MEXICO_PILOT_MODE. Its absent-mode fast return and existing Canada prohibition remain.
- Default, private-preview and Canada-only builds retain their previous route/data boundaries.

Keep MexicoLocalProfile as its current private/fixture data contract. Define MexicoPilotProfile = Omit<MexicoLocalProfile,'presentation'> with presentation 'public-pilot-snapshot' | 'public-pilot-fixture'; MexicoProfileView is their union. A pure projector changes only presentation after verifying the expected local source/presentation pairing. All source, acceptance and qualification fields remain identical. Both public variants stay below the existing 64 KiB DTO limit.

The public snapshot loader first validates the committed publication selection and pinned inputs, then calls the unchanged authenticated local adapter through a deliberately constructed private-read environment with no Canada/public flags. This is the one controlled server-only bridge; never relax the private gate or forward process.env into it. Verify the projected DTO hash against selection, and reread input identities before returning. No fallback to fixture/private data on error.

The fixture loader reads only the existing synthetic fixture, never the accepted-state reader, real selection input files or real acceptance/provenance. Its projected presentation is public-pilot-fixture and always says synthetic/no accepted release.

The shared presentation.ts helpers stay pure and client-safe: no filesystem, accepted-state, publication-selection or server-only imports. Real accepted-input copying is the cumulative copy budget; synthetic test controls are temporary artifacts, not extra accepted-input materializations.

### Page, navigation and downloads

Extend the existing dynamic country route to dispatch by discriminated Canada/Mexico props. Keep Canada's component, values, source statements, sharing and route behavior intact. Add /countries/2010/ only in public Mexico mode; private /preview/mexico/2010/ stays local and unavailable in the public package.

Reuse the current Mexico component/chart. Public visible copy is compact:
- Heading: Mexico — all-goods trade. Persistent badge: Historical snapshot · All goods only, with September 2024–August 2026 and Census source/basis.
- Imports is the no-JavaScript/server default. The two radios, four cards, 24-month chart, native monthly/source table and two download buttons retain their existing behavior and readiness/error handling.
- Keep the visible 32/48 dated-reference qualification and all-product-comparisons-withheld statement. Details retain whole-snapshot 48/48, 16/32 counts, 17 unverified pairs, three exclusions, collection interval, retained-evidence basis and original-vintage/revision limitations.
- Public real content never says this page is local/unpublished. Data acceptance date remains explicitly identified as private-all-goods acceptance in source details; it is not an official publication/revision date or fresh audit. No promise of monthly Mexico updates.
- Public fixture text and description explicitly identify synthetic data/no accepted release. Fix the previously deferred synthetic local-page metadata wording through the same description helper.

Add a second compact country entry on the homepage and conditional Canada/Mexico links within country pages. Keep the existing Country research sidebar destination at Canada; the homepage and in-page links make Mexico discoverable without a new country directory, global search or generalized country selector. Add a short Mexico methods section. No route/link appears when Mexico public mode is absent.

Local CSV bytes/columns/filenames remain unchanged. Public real CSVs keep acceptance_scope=private-all-goods, set existing publication_status=public-pilot-snapshot, append publication_scope=all-goods-only as the last column and use the public presentation filename suffix. Public fixture CSVs use publication_status=synthetic-public-pilot-fixture, acceptance_scope=synthetic-local and no release/date/source identities. Both retain exact numeric values, all 48 original-source descriptors across directions, missing/zero distinctions, formula protection and qualification columns. No stored downloads.

No Mexico products/categories/rankings/shares/duties, new months, five-year claim, saved-view/copy-link feature, PNG/print feature or new data intake is included. Existing product partner observations for Mexico remain legitimate.

### Stage, manifest and HTTP verifier boundaries

Extend staging with an optional, separate Mexico selection/receipt; preserve existing Canada country fields and old-receipt behavior. Read the selection from the committed source blob, not an untracked replacement. Authenticate the four allowed Mexico files through the public loader and exact companion identities before/after copying. Only those four plus the existing 11 product/Canada inputs may enter ignored staging. No raw archives, backup tree, owner envelope copy beyond the already-authenticated four installed files, or credential is added.

A source commit with the publication selection requires one real public Mexico route in the prepared site; absence is an assembly error. A legacy source without that selection must have neither Mexico staged input nor a public Mexico route and must verify unchanged. Normal fixture builds still omit Mexico. Stage build environment is census + Canada snapshot + Mexico snapshot, with every private flag absent.

Add optional manifest.mexico containing selectionId, countryCode, scope, releaseId, reporting window, classificationAccepted:false, productComparisonsAvailable:false, committed selection identity, four input identities and publicProfile identity. This metadata stays in the package manifest outside the uploaded site tree. Withdrawal remains its existing three files; uploading it is excluded.

Retain all preview/data/functions/credential/path bans, template and ZIP checks. Validate public Mexico HTML appears only with its matching selected receipt and exact route. Inspect rendered hydration data for the explicit public DTO and private-envelope sentinels. The public release/date and safe source descriptors are deliberately allowed; private input digests, authorization material and source paths are not allowed in served assets. Do not reject legitimate Mexico partner data or static shared-component strings as if they were private observations.

Extend loadLiveSitePackage with fixed private negatives, retaining the four current paths:
- /preview/mexico/2010/
- /preview/countries/2010/
- /preview/accepted/countries/2010/
- /data/countries/2010/processed/current.json
- Additionally /countries/2010/ is negative only when manifest.mexico is absent.

Require a matching Mexico manifest binding iff the public Mexico HTML exists; reject forged/missing/mismatched bindings before requests. For a selected package the Mexico HTML is a normal positive hashed asset. Legacy predecessor has 9 negatives and 98 logical checks across two origins; candidate has 8 negatives and (fileCount - 1 + 8) × 2 checks, at most 128, so at most 57 files under the unchanged limit. Do not change provider/header/body/redirect restrictions, limits, CLI flags or the historically pinned published-Firefox workflow.

### Current restoration target

Use PR #146's candidate package, not the older homepage-print/Graphite packages or its sibling restoration directory. Companion artifacts were authenticated read-only during planning:
- data/backups/overview-monitor-handoffs/verification-20261022-r1/candidate/site.zip: 636,517 bytes; a24d330caf67a49826f393a19512d92dbbf47977b0c8d1b5708f871f994e405c.
- site-manifest.json in that directory: 8,757 bytes; f851b8562ba7010ecbecbc1ce4fd0a2922475f08bd8c5985e691e6f994e875bc.
- Payload: 41 files / 3,145,939 raw bytes; source 73654c24e2c21909f85d30efb0b9e3df4ea02a2e, tree 8219e718725af4a9ba6ff56b212ee1735b70bc9a.
- Recorded Production main deployment: 16b5e4f3-6741-4400-9131-a9c743a12f50, https://16b5e4f3.us-trade-tracker.pages.dev, retained provider readback 2026-10-23T04:07:59.358Z.

These are retained facts, not a fresh live claim. At execution require fresh provider assignment and complete exact verification on canonical https://us-trade-tracker.pages.dev and the actual observed predecessor origin. An alternative deployment ID with identical authenticated bytes/headers may be bound with recorded provenance. Different bytes, changed project/account/plan or unrelated owner work requires a decision before writing.

## File map and interfaces

| Files | Responsibility |
| --- | --- |
| New deployment/site-mexico-selection.json; src/lib/mexico-profile/pilot-contract.server.ts | Strict MexicoPublicationSelection parser and constant selection path; four exact identities/public DTO pin, never owner authorization |
| New src/lib/mexico-profile/pilot-config.ts, pilot-load.server.ts, presentation.ts | Pure mode resolution, authenticated public loading/projector and accurate descriptions; extend types.ts with public/view types without changing private shape |
| Modify load.server.ts, downloads.ts, MexicoLocalProfile.tsx; new src/styles/mexico-profile.css | Preserve private gate, reuse public rendering, public CSV context and shared scoped styles; summary/chart calculations unchanged |
| Modify src/pages/countries/[code].astro, index.astro, methods.astro and preview/mexico/[code].astro | One public route, compact discoverability, source text and fixture metadata correction |
| Modify scripts/site-staging.ts, site-assembly.ts, live-site-package.ts | Optional strict Mexico bindings, private input/output boundary and conditional public-route HTTP policy |
| Modify scripts/serve-mexico-profile-fixture.ts; new serve-mexico-pilot-fixture.ts, playwright.mexico-pilot.config.ts | Share signal-safe owned fixture lifecycle; separate loopback public fixture with Canada; default existing local fixture behavior unchanged |
| Extend package.json test scripts only | Append new public fixture suite to existing test:e2e; add test:e2e:mexico-pilot; no dependencies/lock/workflow changes |
| New tests/mexico-profile/{pilot-config,pilot-load,presentation}.test.ts and tests/e2e-mexico-pilot/mexico-pilot.spec.ts; extend existing loader/CSV/UI/server tests | Mode/source/DTO/label/CSV and local/public separation plus real browser controls across existing engines |
| Extend tests/scripts/{site-staging,site-assembly,live-site-package,live-site-verification,verify-live-site}.test.ts; tests/helpers/{site-preparation,live-site}.ts; tests/packaging/test_package_site.py | Optional receipt/manifest compatibility, zero-request rejection, correct negatives and unchanged package guard |
| Add docs/validation/mexico-all-goods-publication.md and -evidence.json; update README.md and docs/data-validation/2010-acceptance-readiness.md | Actual runtime/package/provider/live/cleanup evidence; keep historical records dated and private proof out of Git |

Exact new exports:
- parseMexicoPublicationSelection(value:unknown): MexicoPublicationSelection; MEXICO_PUBLIC_SELECTION_PATH.
- resolveMexicoPilotMode(environment:Readonly<Record<string,string|undefined>>): null|'fixture'|'snapshot'.
- projectMexicoPilotProfile(data:MexicoLocalProfile,mode:'fixture'|'snapshot'): MexicoPilotProfile.
- loadMexicoPilot(options?:{workspaceRoot?:string;environment?:Readonly<Record<string,string|undefined>>;selection?:MexicoPublicationSelection}): Promise<MexicoPilotProfile|null>. Optional selection is revalidated and used only by staged committed-source validation.
- mexicoProfileDescription(profile:MexicoProfileView): string.
- Existing summary and download export names remain; download/profile props accept MexicoProfileView. Existing local call sites need no new option.
- siteData(root,productSelection,mexicoSelection?:MexicoPublicationSelection) produces existing fields plus optional mexico. SiteStageReceipt and SiteManifest acquire optional Mexico fields, omitted entirely for legacy sources. Existing stage/preparation CLI signatures remain unchanged.
- serveMexicoProfileFixture(options?:{presentation?:'local'|'pilot'}):Promise<void>; serveMexicoPilotFixture():Promise<void>. Local port uses existing setting; pilot uses validated PLAYWRIGHT_MEXICO_PILOT_PORT, default 4416, same 1024–65535 range, owned prefix mexico-pilot-. Clear private flags, set Canada fixture and Mexico fixture, restore every modified environment key, reject reused/alternate ports and never delete ordinary dist.

## Global constraints and permissions requested

Approval covers all five tasks without routine approval pauses:
1. Root implementation in the file map, one read-only independent calculation/package checker, one fresh whole-branch reviewer, targeted final evidence review and a fresh reviewer for the single optional repair. No parallel editing.
2. One managed worktree on a codex/ branch from reconciled main; one clean isolated checkout fallback only if native creation/registration fails. Scoped runtime/filesystem/process permissions, existing locked npm installation and existing pinned browser engines. No force-push/history rewrite or unrelated worktree reuse.
3. At most one owned materialization and two staging materializations of the exact 15 companion files: cumulative 57,505,602 bytes below a 64 MiB cap. Prefer fewer copies; all copied bytes count, and no fourth materialization is allowed. No raw-source replay, new data/policy selection or credential copy.
4. Private proof/packages/exports/logs under ignored data/backups/mexico-all-goods-publication, capped at 96 MiB. Temporary owned stages/builds/traces/verifier workdirs capped at 256 MiB; reconstructible locked runtimes are excluded. Hash originals and needed proof; never alter an older batch's proof/inventory. Preserve primary protected inputs/packages and the unrelated September proposal byte-for-byte.
5. Keep existing package limits (1,000 entries, 25 MiB per asset), 15,000-file planning alert and smaller live limits (1 MiB manifest, 4 MiB ZIP, 8 MiB decoded payload, 128 logical checks across two origins). Measure before upload; do not expand limits just to pass.
6. Public GitHub pushes, at most three PRs: implementation, one optional bounded repair, and evidence closeout. Each needs appropriate independent review, complete existing CI at its final head, expected-head merge, source/tree readback, primary synchronization and successful automatic main CI. At most two diagnosed infrastructure-only reruns across the whole batch. Existing application assertions, retries, deadlines, workflow permissions and trigger policy stay unchanged.
7. Read the existing Cloudflare account 2e23d873002d29a02a1427e1fa37c5cd, Free project us-trade-tracker, Production main; publish the approved safe Mexico data/metadata in the verified static site through existing authenticated Direct Upload. At most two candidate write attempts and two conditional predecessor restorations. No new project, account, integration, credential or paid upgrade. Human sign-in may still be needed; never request passwords/keys in chat.
8. At most six full verifier runs: baseline, two candidate checks, two restoration checks and one shared repeat only for demonstrated transient transport/propagation failure. Each run targets canonical plus its observed exact deployment origin and retains existing 4 HTTP attempts including redirects/check, 15-second request and 180-second run limits. No crawling/source fetching; negative checks are integrated, not an extra unbounded checker.
9. Per candidate, at most 60 public browser navigations / 24 user-activated CSV/PNG/PDF exports; per restoration, 12 navigations / four exports. Batch maximum 144 navigations / 56 exports across both origins, including failed attempts. Provider dashboard operations remain limited to target readbacks and the four allowed writes. Use fresh contexts or restore user-owned theme/clipboard preferences.
10. One shared reproduced blocking repair within the file map, whether discovered in local acceptance, packaging, the bounded verifier/browser harness or live checks. Root reproduces it, independently reviews, tests and merges a repair PR, and rebuilds/reaccepts only within the existing copy/upload/run budgets. A live regression must first be restored. No second repair, unrelated shared-layout fix, policy change or silent repinning.
11. Native worktree archival and verified owned-scratch/process cleanup after evidence preservation; keep the older Mexico checkout and unrelated localhost work untouched. The chat has 99 attachments. If necessary, preserve metadata, reconfirm merged status and unlink at most old standalone PR chat cards #64–#67 (all observed merged during planning), without changing their GitHub PRs. Preserve/reversibly detach and reattach this batch's own PR cards for native archival as needed; retain them at completion. No other historical removals.
12. No new official-source/Census/API/reference/ZIP requests, source job dispatch, R2 reads/writes, raw replay, accepted-data installation/replacement, classification or product/country/month intake beyond this existing Mexico presentation, new feature/dependency/service/workflow, paid/access/indexing change, analytics/outreach/participant collection or recurring job. The separately approved September plan stays unchanged and gated. Pages/chart data stay together on Pages, downloads stay browser-generated, X-Robots-Tag noindex,nofollow stays unchanged; that header does not make public data private.

Missing sign-in, changed input/Production identities, exhausted limits or necessary work outside these boundaries are real stop conditions. Continue independent local work while waiting for sign-in; never treat elapsed time as authorization. Completion requires verified publication or an accurately reported unresolved failure; restoration alone is a safe intermediate result.

## Review Focus

1. Public authority must never rewrite private/candidate acceptance or expose the envelope: Task 1 source/selection/projection tests and Task 3 injection/serialization tests.
2. Absent/fixture/mixed modes must not read real state, leak data or remove Canada: Tasks 1–2 mode matrix, default-build privacy and coexistence tests.
3. Public figures, qualifications and CSVs must agree without claiming product verification or new-source accuracy: Tasks 1–2 source/CSV/UI cases and Task 4 independent 48-observation comparison.
4. A valid ZIP with the wrong selection, public/private route policy or source binding must reject before upload/network: Task 3 receipt/manifest/negative/legacy controls and Task 4 exact-package review.
5. A changed Production assignment or failed/unknown upload must not overwrite unrelated work or count as success: Task 5 fresh readbacks, conditional restoration, complete receipts and actual cleanup.

---

### Task 1: Add the public selection and authenticated presentation

**Files:** New selection/contract/config/load/presentation files; extend types.ts, private load.server.ts and downloads.ts; corresponding tests/mexico-profile files.

**Interfaces:** Produces MexicoPublicationSelection, MexicoPilotProfile/MexicoProfileView and the five loader/projector/description exports above. Consumers receive the same safe observations/qualifications, a distinct public presentation and accurate CSV context.

- [ ] Establish the owned checkout/ledger and real locked dependency installation; verify main/companion/15 inputs/predecessor fingerprints before copying. Source root must use a real node_modules directory; the previous milestone correctly rejected a dependency junction during staging. Commit this approved plan/companion with the implementation work, preserving the unrelated proposal.
- [ ] Write tests named public mode returns before reads, public mode matrix, committed selection is exact, public snapshot uses the authenticated bridge, snapshot errors never fall back, fixture never reads accepted state, projected DTO identity is exact, private preview rejects public mixing, and descriptions distinguish synthetic-local/public/real. Assert the exact mode combinations, fixed periods/false flags, wrong/extra/missing fields, all four identity substitutions, swapped/changed source/value, 64 KiB bound and the companion public DTO hash.
- [ ] Run: npx vitest run tests/mexico-profile --maxWorkers=2. Expected: new missing-export/contract assertions fail before implementation; existing local tests are retained.
- [ ] Implement the declared strict selection/config/projector/load helpers and view types; keep accepted readers/policies unchanged. Read staged selection from its committed source binding and revalidate optional supplied selections. Local adapter's absent fast return stays first.
- [ ] Write/run failing CSV cases public snapshot retains private acceptance scope, public fixture cannot claim accepted or real sources, local CSV bytes remain identical, public scope is last column, and both directions preserve values/denominators/source counts. Extend the existing serializers/filename/description helpers minimally.
- [ ] Rerun all tests/mexico-profile plus existing Mexico release/archive unit suites. Expected: all pass, private acceptance files/contracts unchanged, local bytes unchanged. Review diff and commit Task 1 only.

### Task 2: Integrate the public page and prove coexistence

**Files:** Existing Mexico component and scoped styles, public/private route, homepage/methods; shared fixture lifecycle + new pilot wrapper/config; package scripts; UI/lifecycle/new public browser tests.

**Interfaces:** Consumes Task 1 view union and public loader. Produces the public route and isolated three-engine synthetic proof; existing default/local/Canada suites remain.

- [ ] Add failing UI assertions public snapshot has no unpublished label, public fixture is synthetic in body/metadata/CSV, public all-goods comparisons remain withheld, all direction-dependent cards/history/downloads change together, and Canada is unchanged. Move existing scoped styles into the shared CSS file without a shell/search redesign.
- [ ] Add failing lifecycle tests for local versus pilot environment restoration, both owned prefixes/ports, no reuse, alternate-port rejection, links/containment, signal cleanup and ordinary-dist preservation. Run the focused UI/server cases to observe RED, then minimally implement the declared lifecycle extension and route dispatch/labels.
- [ ] Create the new public fixture config with existing Chromium, Firefox and WebKit engines, one worker, retained failure trace, reuseExistingServer:false and its own output. Append its command to test:e2e without changing existing suites/settings/workflow. New dedicated suite uses no retry to hide failure.
- [ ] Add browser cases both directions match cards and four sourced CSVs, Canada and Mexico remain discoverable and distinct, source qualifications stay accessible, keyboard switch/download/details, 320/390px both themes have no overflow, no-JavaScript Imports is honest, hydration disables controls, and download failure can be retried. Check accurate description/noindex and all product controls/comparisons absent.
- [ ] Run new browser assertions before the behavior change, then after implementation. Run: npm run test:e2e:mexico-pilot. Expected in Linux CI: all three projects pass. On Windows run explicit Chromium/WebKit projects; preserve/report the known Firefox launch boundary rather than adding a skip or claiming full Windows compatibility.
- [ ] Re-run unchanged default privacy and local fixture tests with public mode absent: neither Mexico public route/data/navigation nor mixed modes appear in the normal build; private preview remains private and its synthetic metadata is corrected. Run npm run check. Expected: no diagnostics, no new data/policy/lock/workflow diff. Commit Task 2.

### Task 3: Extend staging and package/live guards

**Files:** site-staging.ts, site-assembly.ts, live-site-package.ts and named helper/packaging/script tests. No transport/provider/workflow refactor.

**Interfaces:** Consumes committed Task 1 selection and Task 2 route. Produces optional staged/manifest Mexico binding and an immutable live-check plan that supports both predecessor and candidate.

- [ ] Write failing tests named selected Mexico stages exactly four authenticated files, legacy stage does not read Mexico, receipt binds selection and projection, mutated/linked/untracked selection rejects, and copied inputs are rechecked. Assert old receipt fields/legacy verification remain unchanged. Run: npx vitest run tests/scripts/site-staging.test.ts --maxWorkers=2. Expected RED on new behavior.
- [ ] Extend staged data kinds with mexico-pointer/candidate/evidence/manifest and separate optional mexico receipt. Reuse existing safe filesystem/Git-blob checks and complete reader; copy no additional private tree. Re-run staging cases to GREEN.
- [ ] Write failing assembly/package cases selected route required, unselected public Mexico rejects, every preview/data path rejects, real public DTO allowed, fixture or owner envelope injection rejects, and withdrawal remains three files. Bind manifest.mexico as specified; keep the manifest outside site tree. Run focused assembly and Python packaging tests RED then GREEN.
- [ ] Add live-package cases old predecessor has nine negatives, selected package has eight negatives and a positive Mexico asset, missing/forged/crossed Mexico binding rejects before fetch, old private controls survive, conditional 128-check boundary is exact, and immutable plans retain timeout/redirect/header/body behavior. Update synthetic helpers/expected plans rather than remove old assertions. Historical published-Firefox fixtures/commands stay untouched.
- [ ] Run: npx vitest run tests/scripts/site-staging.test.ts tests/scripts/site-assembly.test.ts tests/scripts/live-site-package.test.ts tests/scripts/live-site-verification.test.ts tests/scripts/verify-live-site.test.ts --maxWorkers=2. Run the existing Python packaging/workflow suites with explicit SITE_PACKAGE_PYTHON. Expected: all applicable cases pass; tests exercise 98 predecessor checks and the selected-package limit, no network/source operation. Commit Task 3.

### Task 4: Independently review, merge and accept the exact real package

**Files:** Complete implementation branch and private validation/review/package records. Public evidence documents are drafted only after provider verification so they do not dirty the staged source.

**Interfaces:** Produces a reviewed merged runtime commit, matching tree, authenticated candidate ZIP/manifest and a read-back-verified publication decision under this owner's delegated permission.

- [ ] Run full unit tests with two workers and the real Python interpreter, compiler, default fixture build, all applicable local browser/packaging checks and the new public suite. Preserve actual Windows limits and failed outcomes. Require complete existing Linux Code checks, including all engines/new suite, at final PR head.
- [ ] Obtain a fresh whole-branch review against this design/companion. Root resolves material findings through reproduced tests within the file map. Open/attach the implementation PR, require successful exact-head CI and expected-head merge; synchronize primary and bind reviewed/PR-tested/merged trees. Require automatic main CI before publication. No application failure may be labeled infrastructure to obtain a rerun.
- [ ] Verify/copy the exact PR146 predecessor ZIP/manifest into fresh owned proof and existing verifier workdir; Python-verify its 41 entries and pins. Preserve originals. Prepare the candidate from a clean committed checkout using existing site:stage create/verify, site:prepare and Python create/verify commands with explicit roots/commit/interpreter. Build census + Canada snapshot + Mexico snapshot, private flags absent; restore environment. Use a fresh owned stage, never ordinary dist or an unrelated preview.
- [ ] Authenticate full source/data/selection/template/manifest/ZIP inventory, measure files/size/largest file and planned checks. Enforce all current caps; expect roughly one new page/assets, not a new delivery system. Verify /preview/** and source/data/proof/envelope material absent while the deliberately authorized public DTO/source descriptors are present.
- [ ] Serve only the prepared site on loopback. Inspect every content route, both country profiles, all four product profiles, homepage saved views, monitor links, methods, themes/search, 320/390/736/1024/1280px and no-JavaScript/readiness/keyboard/download-error states. Compare existing four product CSVs, representative duty/portfolio CSVs, Canada CSV and merchandise/share/duty PNGs with unchanged input/predecessor behavior. Check existing homepage/briefing/Canada print output (A4/Letter locally); add no Mexico print feature.
- [ ] Independent checker reauthenticates the four original Mexico inputs and independently recomputes all 48 monthly values/source bindings, four period totals/two growth results, then compares public rendered values and all four browser CSVs. Check public versus private acceptance/publication fields, 16/32 whole-snapshot counts and every withheld comparison. Reuse prior calculation evidence only after checking current input identities; do not substitute it for this public readback.
- [ ] Have the independent checker also review candidate source/data/selection binding, absence of private material, predecessor identity and restoration readiness. Root pins accepted ZIP/manifest hashes, runtime source/tree, measured limits and complete checks in a private publication-decision record and reads it back. Any material mismatch fails acceptance; a local repair uses the one shared reviewed repair allowance and a fresh bounded stage. No upload until every gate passes.

### Task 5: Publish, verify, restore if needed and finish actual cleanup

**Files:** Public validation/evidence/README/readiness updates after runtime acceptance; private provider/live/browser/cleanup receipts.

**Interfaces:** Consumes accepted candidate and predecessor. Produces a fully verified public pilot with retained limits, source/package/provider bindings, reviewed evidence merge and actual owned-worktree removal.

- [ ] Read the fixed existing provider account/project/Free plan/Production main assignment. Require predecessor bytes, then run the updated site:verify on canonical plus the observed baseline origin: all 98 planned logical checks must pass. Read Production again immediately before the upload; an unrelated assignment/byte change stops writing.
- [ ] Reauthenticate the accepted candidate ZIP/manifest, Direct Upload only site.zip to Production main and record actual ID/origin/outcome. Count unknown write attempts; reconcile them with read-only provider state and hashes before any further write. Never assume success, infer an origin, or blindly repeat an upload.
- [ ] Run updated site:verify on canonical plus actual candidate origin; require every planned asset/hash/body/status/header/negative check. Within the browser budget visit all content routes and both origins, exercise Mexico Imports/Exports, four CSVs, mobile/keyboard/qualifications/no-JS/readiness and Canada navigation, then representative saved overview/product/monitor links, CSV/PNG/print behavior. Match representative displayed values against the independently accepted local package. Require no unexpected page errors, broken assets or source requests. Freshly require Production still assigned to this candidate after all checks.
- [ ] Any confirmed figure/label/withheld-data/link/control/export/asset/header/privacy/layout regression fails acceptance. Before restoration freshly require Production still belongs to this batch's failing candidate; never overwrite unrelated owner work. Restore only the pinned PR146 ZIP, record its actual new origin, pass full predecessor verification (including Mexico public 404), smoke-test home/four products/Canada and exports, then freshly verify restoration assignment. Preserve failure evidence; if restore cannot be verified, report accurately.
- [ ] Only after successful restoration may the unused shared repair allowance produce one reproduced, independently reviewed/tested/CI-passing repair merge, fresh authenticated stage/package and second candidate upload. Re-run full acceptance and restore again if it regresses, then stop further publication. Restoration alone is not completed Mexico publication.
- [ ] Record actual runtime source/tree, input/selection/DTO pins, package/deployment/Production readbacks, build/check/browser/export counts, failures/retry/repair/restoration and remaining limits. Public docs contain safe summaries and hashes, not owner/source envelopes or machine paths. Update readiness to public all-goods snapshot only, with every product comparison withheld; no claim of fresh source verification or scheduled updates.
- [ ] Independently review/attach/CI/guard-merge the evidence PR and require main CI; distinguish its documentation merge from the immutable uploaded runtime, and do not rebuild/republish for documentation alone. Preserve/hash-read-back all needed proof and a final inventory within caps.
- [ ] Stop only owned processes. Archive this managed worktree natively after preservation, verify native archived state, physical path and Git-registration absence, and retain this batch's PR cards. Verify primary tracked-clean, protected inputs/packages unchanged, unrelated September proposal exact and older Mexico checkout untouched. Remove only resolved verified task-owned scratch; report any cleanup blocker precisely.

## Self-review and handoff

Before presenting this draft, root checks design coverage, all signatures/types, the five review-focus failure classes, every task's RED/GREEN and final gates, current predecessor selection, conditional live-count math, all copy/repair/CI/attachment budgets and code-versus-evidence source identity. A fresh read-only builder checks for questions that would materially change execution; root incorporates project-answered questions and sensible routine choices before owner review.

Approval covers the combined design, companion, five tasks and permissions together. Implementation remains root-owned with strategic independent review. No routine merge/publication question is needed within those exact bounds; changed identities, missing human sign-in, exhausted bounds or scope expansion still require an explicit decision.
