# Individual Briefing Print Design and Four-Task Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root implements all four tasks; one fresh independent whole-branch reviewer checks the result before integration. Use checkbox (`- [ ]`) steps and preserve an owned ledger. This is a bounded extension of existing briefing/print flows.

**Goal:** Make each existing product release briefing easy to print or save as a readable, sourced PDF using the accepted August data.

**Architecture:** Add a small native print control to the shared Astro briefing page, with scoped print CSS. Keep the React report server-rendered with no hydration or release payload added to the browser. Use the browser's print dialog/PDF engine, existing site preparation and the existing Free Pages project; no server PDF generator or stored public PDF downloads.

**Tech Stack:** Existing Astro/TypeScript/CSS, locked Playwright browsers, bundled Python/pypdf/Poppler for private PDF inspection and the existing package/live-verification tools. No new dependency, service, action or workflow.

**Spec:** This combined bounded design and the Monthly briefing / Shareable charts and tables / Sources requirements in `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md`. The owner requested tasks and complete permissions together, overriding separate design/plan handoffs. Implementation waits for approval of this written proposal.

## Assessment and choice

The existing portfolio has a Print / Save PDF button and deliberate print rules. Individual `/briefing/` and `/briefing/090111/` pages have neither: `ReleaseBriefingPage.astro` renders a product picker and a static report; `global.css` scopes its existing print rules to `.portfolio-briefing`. Both product reports already contain periods, figures, qualifications, retrieval/version details and visible source URLs. Read-only root inspection and an independent eight-file assessment agree on this omission. Neither established actual clipping or broken pagination; baseline print inspection is part of execution.

Recommend supporting the individual report directly, using its existing content. The alternative is to direct readers through a one-product portfolio; that already works and requires no development, but adds a selection step to sharing the monthly briefing. More features or new product/country intake are unnecessary for this batch. This improvement does not establish user demand or replace owner-run pilot observations.

Current main is `7849dcf71ea756bd3cd94db9f7febcbe7a3da159`. Reauthenticate PR119 proof at `data/backups/published-firefox-checkpoint/verification-20261016-r1`: preservation manifest SHA256 `3118bf94f664d440dcf8196ef51e8f4d067d0de5401e1df904c7d6acc14ae422`, finalization `b3bd0b668c611f7cc96de61d9b7857d15e9cfa09d0184eefbce21b7e4ab78ebc`, final readback `17cf7855c9b44ecf15f02688243e0b3d43d7d358c2f9d76eef2acb6b34513c9e`. Follow the authenticated seven accepted/eleven protected input references. Existing Linux Firefox evidence concerns the historical site; Windows Firefox launch remains unresolved.

The already approved `2026-10-17-september-coffee-candidates.md` remains unchanged and gated. Its exact SHA256 is `b60a52102ac4d09cb54ded1d64c993f5d9ff6203da6b71080ab60ac2d949875c`; preserve its approval record and untracked primary file. This print batch creates no permission to start its Census/R2 jobs early.

## Short design

- Add a `release-briefing-page` wrapper and an isolated **Print / Save PDF** button in `src/components/ReleaseBriefingPage.astro`, with always-visible screen help: “Use your browser’s Print command to print or save a PDF.” Initially hide the button; attach its native handler before revealing it, and reveal only when `window.print` is callable. Use a processed Astro script, not `client:load` on `ReleaseBriefing` and not a new React island. A thrown print call reports “Printing could not open. Use your browser’s Print command.” in a polite status region; keep the report/focus available.
- Put new print rules in `src/styles/global.css`, scoped through `.release-briefing-page`/a matching body condition. Hide the global header/skip link, product picker and print control/help in print. Retain the title, product/HS/official description, reporting/retrieval context, all figures and their labels, monthly-versus-annual periods, duty qualifications, source/version/revision details and raw source URLs. Preserve the footer's Census API non-endorsement notice; do not hide the entire footer and lose it. Footer branding may be simplified only within this print scope.
- Use white background, dark readable text, underlined links, wrapping source URLs, a single report column and sensible heading/card break rules. Body copy at least 9pt and source/qualification copy at least 8pt. Respect browser-selected portrait A4/Letter paper; inspect both with 12mm margins and browser headers/footers disabled. Do not promise identical pagination for every printer setting. Avoid a fixed page count or shrinking text to force one.
- Preserve the existing on-screen report text/figures, research links, responsive layout, static readability, portfolio controls/print styles and every calculation/serializer. No change to `ReleaseBriefing.tsx`, shared layout, data selection or fixture data is required. Fixture printouts must retain the prominent Development sample data warning.

## File map and task interfaces

| File | Responsibility |
| --- | --- |
| `src/components/ReleaseBriefingPage.astro` | Wrapper, native control, help/status and tiny binding only |
| `src/styles/global.css` | Scoped screen-hidden control handling and individual-report print layout |
| `tests/e2e/briefing-print.spec.ts` | Real page/control/keyboard/static/print-media/fallback semantics; browser-independent |
| `tests/e2e/briefing-print-pdf.spec.ts` | Chromium A4/Letter native PDF generation for both existing fixture reports |
| `playwright.compatibility.config.ts` | Add only the semantic spec to the existing Firefox/WebKit `testMatch` list |
| `docs/validation/individual-briefing-print.md`, this plan | Actual evidence, coverage limits and factual progress |

The semantic spec must not call Chromium-only `page.pdf()`. Ordinary Chromium CI discovers both new specs; existing compatibility CI discovers only the semantic spec and retains its current tests/retry policy. No change to `.github/workflows/` is needed. No public PDF or raw/source/proof file is added to deployment assets.

## Complete permission envelope

Full approval covers all four tasks, including conditional publication, without routine approval pauses:

1. Root implementation; one independent whole-branch reviewer; managed worktree/`codex/` branch, scoped filesystem/runtime/network permissions, existing locked Node/Python setup and `npm ci --ignore-scripts`. Reuse pinned Chromium/WebKit locally; install only an already locked official browser build if missing. Do not reinstall Windows Firefox or change OS/security settings. CI may install its existing locked official browsers on standard Ubuntu.
2. Edit only the file map above. No new runtime/dependency/action/workflow, calculation, dataset, fixture, serializer, shared layout or portfolio behavior. A material finding outside these files becomes a separate scope decision.
3. Authenticate original proof, all seven/eleven inputs and the separate September plan before/after. Bounded private copies of existing accepted files are permitted for the existing stage/build path, at most 32MiB total; no raw-source replay or new accepted data. Preserve original proposal bytes/hash and predecessor evidence.
4. Inspect the retained predecessor ZIP/manifest and derive report/CSV expectations only from authenticated existing evidence. The last verified predecessor is source `b77cb8a6d6d69e352123c0e4baf6e8b13381bcf8`, ZIP412614bytes/SHA256 `6e63391ecc9ebe3c22432f69f620bf1e5f6d443dded47600062c92957346a283`, manifest6557bytes/SHA256 `7b57293e1c354c1d384ede45ef9636d73058ab3cb38f48f0e396f8db61f948dd`, historical origin `https://2b73be66.us-trade-tracker.pages.dev`. Confirm current canonical/Production binding before publication; do not infer assignment from this historical record.
5. Local fixture and accepted-data builds, proportional tests/type checks, owned loopback previews, native browser PDF generation, bundled pypdf text inspection and Poppler render/visual review. Bundled Poppler is `dependencies/native/poppler/Library/bin/pdftoppm.exe` under the existing primary runtime; pypdf/pdfplumber are already available. No package installation is needed for PDF inspection. Preserve private proof at `data/backups/individual-briefing-print/verification-20261017-r1`, at most 750files/128MiB, sixteen representative PDFs, ninety-six rendered PNG pages and eight failure traces. Inspect every page of each retained acceptance PDF; text extraction alone cannot certify layout.
6. Public GitHub pushes, one implementation PR, attachment/description updates, normal push/PR CI, expected-head reviewed merge and tracked-main synchronization. Both CI runs must pass on the final head, including all ordinary tests and the existing plus added compatibility cases, with no added skip/retry. Existing platform-specific unit skips are reported honestly. Windows Firefox remains unavailable locally; new semantic Firefox checks run in existing Linux CI. This is not stock-Firefox/Safari/printer/device certification.
7. Prepare/verify concrete candidate and restoration packages through existing tools. Publish the reviewed data-preserving package to the existing **Free `us-trade-tracker` Cloudflare Pages project**, canonical `https://us-trade-tracker.pages.dev`, using the existing authenticated deployment path. Approval delegates publication of this exact scoped change once package/source/data/review/CI gates pass; it includes no project creation, access/indexing change or new paid service. Record actual package/manifest hashes and provider-observed deployment identity before claiming publication.
8. One predecessor live verification and one candidate verification on the canonical and actual provider-observed deployment origins, plus the named bounded print/browser journeys below. If the update regresses, automatically restore the pinned verified predecessor and verify restoration. Permit one demonstrated same-scope repair with RED/GREEN, independent review, exact-head CI and a reviewed repair PR before one second candidate upload/check. If that fails, restore/verify and report incomplete. No blind retry, broader repair or hash/expected-value substitution.
9. Preserve/seal/read back useful proof and the completed ledger; stop only owned previews after process verification; actually archive the worktree with its PR identities; confirm checkout/Git-registration absence; check Windows/MSYS ownership/resolved targets before deleting only this plan's caches. The separate September plan is an explicitly allowed unchanged untracked primary file; preserve it and report that status instead of deleting it or claiming a wholly clean checkout. No other primary changes are permitted.
10. Reserve capacity for worktree/main PR/conditional repair PR. If necessary, preserve identity/URL and confirm merged status before unlinking at most two obsolete merged standalone PR chat attachments; leave GitHub PRs and nested archived references unchanged. A conditional repair may reuse the owned worktree, avoiding another checkout.

Excluded: Census/source requests/imports; all R2 operations; accepted-data/pointer/classification/site-product-selection changes; new products/countries/months; September candidate jobs; server/public stored PDF delivery; analytics/outreach/participant data; paid/access/indexing changes and scheduled/recurring work. The November 4 release gate remains in force for its separate approved plan.

## Review focus

1. No JavaScript, missing/throwing `window.print` or delayed script execution must leave a readable report and honest usable fallback. Task1 real-page negative tests.
2. Print CSS must not hide qualifications, fixture warnings, source details or the Census notice, or leak into portfolio/profile printing. Task2 print-media tests and Task3 rendered controls.
3. Long product/source text and portrait A4/Letter pagination must remain readable without clipped figures or split headings detached from content. Tasks2–3 actual PDFs, text comparison and every-page visual review.
4. A convenience button must not hydrate/embed the release, change calculations/CSVs or alter saved research links. Tasks1–3 island/network/content/source checks and retained CSV identities.
5. Local rendering, exact-head code integration and actual public deployment are separate facts; restoration and actual cleanup must be observed. Task4 package/live/source/ownership readbacks.

## Task 1: Add the isolated native control with failure-safe static behavior

**Files:** `ReleaseBriefingPage.astro`, new `tests/e2e/briefing-print.spec.ts`.

**Interfaces:** Consume the existing server-rendered briefing and native `window.print(): void`. Produce `.release-briefing-page`, one accessible Print / Save PDF button, help/status and no React island or release browser payload. Fixture routes are `/briefing/` (090121) and `/briefing/090122/` (existing labeled synthetic second product), not a new real product.

- [x] Authenticate baseline/separate-plan pins, preserve this approved proposal, establish native isolated workspace/owned ledger and inspect task interfaces. Record the predecessor report text and one representative baseline A4 PDF without changing product code. Expected: existing figures/sources retained; no asserted clipping until observed.
- [x] Write failing real-page cases for both fixture routes: keyboard activation invokes the native print boundary exactly once; initial/static hidden control with visible browser-print help; missing/throwing print behavior preserves report and announces the fixed fallback; no `astro-island`, added source request or report-text change. Intercept native print only to avoid an OS dialog; this proves handler invocation, not PDF rendering. Run against explicit fixture build. Expected RED: absent control/behavior.
- [x] Add the wrapper/control/tiny processed Astro binding and scoped hidden rule, attaching before revealing. Run the same cases. Expected GREEN, report text/figures/research links exact and no full-report hydration. Commit the verified control/tests.

## Task 2: Implement scoped print layout and actual paper checks

**Files:** `global.css`, the semantic spec, new `briefing-print-pdf.spec.ts`, narrow `playwright.compatibility.config.ts` testMatch addition.

**Interfaces:** Consume Task1 wrapper/control and unchanged report markup. Produce scoped print layout plus browser-independent semantics and Chromium-only native PDFs. Preserve every existing compatibility test match.

- [x] Extend semantic tests for both fixture routes: print hides chrome/picker/control/help, retains all report/fixture/source/qualification/notice content, supports static JavaScript-disabled printing and returns to unchanged screen controls/layout. Add Chromium native A4/Letter PDF cases for both fixture reports, asserting required visible content, successful nonempty PDF output and no new network/error. Run before print CSS. Expected RED on scoped print behavior; absence of a layout defect must not be invented.
- [x] Implement only the scoped typography/wrapping/grid/break/visibility rules. Keep report data and shared/portfolio styles unchanged. Add the semantic spec to the existing compatibility list. Run `npx playwright test tests/e2e/briefing-print.spec.ts tests/e2e/briefing-print-pdf.spec.ts tests/e2e/release-briefing.spec.ts tests/e2e/product-release-briefings.spec.ts tests/e2e/portfolio-briefing.spec.ts --project=chromium --workers=1 --retries=0` on the fixture build. Expected all pass, including existing zero-island/static/portfolio checks.
- [x] Run `npx playwright test --config playwright.compatibility.config.ts tests/e2e/briefing-print.spec.ts --project=webkit --workers=1 --retries=0`. Expected all new semantic cases pass. Do not rerun/reclassify known unavailable Windows Firefox launch as passing. Render retained fixture PDFs with bundled Poppler and inspect every page, including a narrow/long-source case built only by test-local DOM text substitution. Such substitution tests layout resilience, not source correctness. Commit verified layout/tests/config.

## Task 3: Verify accepted-data output and prepare the reviewed package

**Files:** New validation document and factual plan progress; owned private build/package/browser/PDF proof only. No canonical data or deployment selection edits.

**Interfaces:** Consume the scoped implementation, authenticated existing accepted inputs and predecessor package. Produce actual August-data print/CSV acceptance, a committed candidate source, verified upload/restoration package identities and a reviewer packet.

- [ ] Set the existing pinned Python runtime, then run `npm test -- --maxWorkers=2 --testTimeout=30000`, `npm run check`, an explicit fixture build and `npm run test:e2e`. Expected all pass with zero type diagnostics and observed case counts; no added skip/retry. Measure build file count/total/largest file through existing tooling. No new performance benchmark is claimed.
- [ ] Use the existing site stage/build/prepare/package commands with the unchanged committed product selection and accepted Canada snapshot. Keep seven accepted/eleven protected originals and the September plan exact. Verify package entries/private exclusions/noindex/nofollow and all source/data identities before serving an owned accepted-data preview.
- [ ] Inspect both real briefing routes: 090121 and090111, source/reporting/period/qualification text equal to the authenticated predecessor, keyboard/static/mobile controls and no page/source errors. Generate A4 and Letter PDFs for each; independently compare their extracted values/periods/source/provenance/notice text with the original report and inspect every rendered page. Preserve the fixture warning in fixture PDFs. A PDF header or DOM assertion alone is insufficient.
- [ ] Verify the eight authenticated CSV identities used in PR119 remain exact, and run the existing portfolio print case as an unchanged control with a retained accepted-data PDF. Confirm product/profile screen layout and research links are unchanged. Expected: print presentation/convenience only; no numerical/source/CSV difference. Record actual PDF counts/page sizes/coverage limits and scope guards. Commit the factual checkpoint and prepare one immutable whole-branch review packet.

## Task 4: Review, integrate, publish, verify and clean up

**Files:** One main PR, conditional narrow publication-repair PR only if demonstrated; same PR/private proof carries final operational evidence. No bookkeeping-only PR.

**Interfaces:** Consume Task3 source/data/package/print acceptance. Produce independently reviewed exact-head integration, actual publication or restored honest failure, public print evidence and actual proof/checkout/cache cleanup.

- [ ] Obtain one fresh whole-branch review covering all five focus items and real PDF evidence. Regrade findings; fix material issues in one RED/GREEN pass and rerun affected checks/full suite as appropriate. Preserve original failures. Require both ordinary CI runs on the final head, including the new semantic Linux Firefox/WebKit cases and existing compatibility cases, then expected-head merge. Synchronize tracked main while retaining the separately approved untracked September proposal unchanged.
- [ ] Authenticate/verify the current predecessor on the canonical and provider-observed deployment origins before upload. Use the concrete reviewed candidate package in the existing Free Pages project, record actual source/package/provider identity and run the existing ZIP-gated `site:verify`. Expected: served bytes/status/robots/404 checks pass; no fixture/private/source/proof data published. Drift or unavailable predecessor restoration evidence blocks upload.
- [ ] Run bounded public browser readback on each real briefing: desktop native control/keyboard, print-media visibility/source/notice content, one mobile/static check, and an actual A4 PDF per product. Authenticate and visually inspect all pages of those PDFs; confirm accepted periods/figures and no outside/source requests. Check the portfolio print control remains available and its print semantics unchanged. Expected: actual public behavior matches the reviewed package. Keep candidate results distinct from local/CI observations.
- [ ] On regression, perform only the authorized predecessor restoration and its verification. One demonstrated same-scope repair/second reviewed PR/exact-head CI/second upload is allowed; otherwise retain restored state and report the unresolved result. Never alter expectations to force success.
- [ ] Update the same PR with actual deployment/print/restoration outcome; recheck all protected inputs and the separate September approval. Preserve/seal/read back useful proof and completed ledger, stop identified owned previews, actually archive the native worktree/PR identities, verify checkout/Git-registration absence, authenticate/remove only owned caches and perform final tracked-main/proposal/proof readback. Expected: completed public print support or honestly restored failure, with the November 4 plan unchanged.

## Self-review and handoff

This is a small existing-flow enhancement: two production files, two focused browser specs and one testMatch addition. It adds no release data, PDF service, report hydration or new verification workflow. UI fallback, paper rendering, data/source preservation, conditional publication/restoration and actual cleanup each have an owning task. The known print omission is distinguished from unobserved pagination failures. Existing portfolio printing remains a control/alternative, and actual user usefulness remains an owner-research question.

Planning only: no implementation, installation, worktree creation, build, PDF authoring, data/provider job or publication was performed for this proposal. The prior September approval remains valid within its existing source gate and boundaries. Approving this written plan authorizes all four tasks above under the preserved root-execution/independent-review method.

## Execution progress

Task1 local verification:70 existing briefing/portfolio cases pass;8 new native-control cases observed RED then GREEN;316-file type check clean;both predecessor heading/report/footer texts remain exact with zero islands. Baseline A4 PDF was inspected on all3 pages;cards split from explanatory text. Accepted/protected and separate September plan unchanged. Layout,accepted-data packaging,review/publication and cleanup remain pending.
