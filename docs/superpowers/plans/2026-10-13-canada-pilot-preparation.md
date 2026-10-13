# Canada Pilot Preparation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The owner has already chosen root implementation with subagents reviewing; preserve that method.

**Goal:** Prepare and verify a local `/countries/1220/` pilot page with truthful snapshot presentation, conditional navigation and a measured static artifact, without deploying it.

**Architecture:** A single opt-in configuration gates an adapter over the existing authenticated selected-release reader. The shared country renderer and serializers gain separate pilot contexts, while existing previews keep their behavior and CSV bytes. An isolated fixture build checks the new route and site integration; one real build in a fresh source staging directory produces a privately preserved file manifest and browser evidence.

**Tech Stack:** Node 24, TypeScript, Astro static output, React, Vitest and Playwright; existing dependencies only.

**Spec:** [Approved Canada publication readiness design](../specs/2026-10-13-canada-publication-readiness-design.md). Planning baseline is `3ff437b` on `codex/canada-publication-readiness`; ordinary runtime remains the reviewed PR #75 tree.

## Global Constraints

- Exactly Canada `1220`, September 2024–August 2026; preserve both directions, 48 monthly points, 20 selected categories, 17 qualified comparisons and three statistical exclusions.
- Imports retain `GEN_VAL_MO`, general imports/customs value; exports retain `ALL_VAL_MO`, domestic plus foreign exports/FAS value with the Canadian data-exchange qualification. Values remain nominal USD, not seasonally adjusted.
- Preserve the 33,716-byte projection / `33c7db7ec421bddaa13e36c3b2e32cd4558aa041fe17f2f3da01285b62b08fd0`, selected pointer / `9ede6a6906b0da7f85e74203d186bee7f6a8e08e37f452fb9f5a99e88e10a399`, eleven protected inputs and both coffee states.
- Preserve same-archive denominators, unknown observation revision dates, previous-review verification, reference counts and historical failed audits/availability flags. Local acceptance does not establish current revised headline agreement.
- Default builds omit the pilot route/data/navigation before private reads. Explicit fixtures remain synthetic; real mode fails without fallback. Both private preview routes are absent from pilot output.
- Pilot route stays `noindex,nofollow`. Noindex is not privacy or authorization. Actual publication status/URL/time belongs to a later deployment record.
- Pages and chart data stay on static hosting; downloads stay browser-generated; R2 stays private. Retain the 15,000-file planning alert; evaluate 20,000 files/25 MiB per asset for Wrangler and 1,000 files/25 MiB for dashboard upload.
- No new history/source request, classification review, archive transfer, accepted-pointer operation, provider/account configuration, paid service, deployment workflow or automatic publishing on merge.
- No broader country catalog/search/rankings, country duties, saved views, PNG, email/signup, billing, ads, installed analytics or scheduled processing.
- Initial public publication and acceptance across successive official releases remain separate decisions/evidence. A coffee update cannot establish Canada refresh capability.

## Review Focus

1. A caller leaves a private-preview flag set or crosses real Canada with synthetic products: reject active pilot configuration before selected reads; preserve old preview-only builds when pilot is unset. Tasks 1 and 3 own these tests.
2. A new presentation branch accidentally changes old preview metadata/CSV fields or grants unsupported comparisons: verify original contexts and all four real accepted-local CSV hashes, with statistical blanks in both directions. Tasks 2 and 5 own these checks.
3. Global navigation creates a dead or misleading Canada link when its route is omitted: derive links from the same validated gate and test normal/opted-in homepage, Methods and product pages. Task 4 owns these checks.
4. A test helper reuses a real server, leaves environment altered, follows a junction or deletes an unowned output: force isolated modes/output, refuse port fallback and restore all four variables through failure/termination. Task 3 owns these tests.
5. A staged artifact includes synthetic observations, private previews, packages or an earlier build under the right metadata: verify actual HTML/browser downloads, hash the final enumerated output and bind its source/data identities. Tasks 3 and 5 own these checks; a manifest alone is not deployment approval.

## File Structure and Task Order

- `src/lib/country-preview/pilot-config.ts`: pure mode/cross-mode validation; no filesystem or network imports.
- `src/lib/country-preview/pilot-load.server.ts`: fixed adapter over `loadAcceptedCanadaPreview`; only bounded data and pilot presentation leave the server.
- Existing `types.ts`, `downloads.ts` and `CanadaPreview.tsx`: new pilot contexts with original context behavior preserved.
- `src/pages/countries/[code].astro`: fixed static path, selected/fixture props and noindex page. Existing preview routes remain distinct.
- Existing `BaseLayout.astro`, homepage and Methods: gated country links and snapshot explanation, with no extra client island.
- Existing fixture server plus a thin pilot entry/config: reuse the owned-server lifecycle and force mutually exclusive route modes.
- Browser checks and `docs/validation/canada-pilot-preparation.md`: output boundary and measured local evidence. Temporary source staging, verification harness, file manifest and screenshots remain ignored/private.

### Task 1: Fixed pilot configuration and authenticated adapter

**Files:** Create `src/lib/country-preview/pilot-config.ts`, `pilot-load.server.ts`, `tests/country-preview/pilot-config.test.ts`, `pilot-load.test.ts`; modify `src/lib/country-preview/types.ts`.

**Interfaces:**

- `CanadaPilotMode = 'fixture'|'selected'|null` and `CountryPilotPresentation = {kind:'pilot-fixture'}|{kind:'pilot-prepared';releaseId:string;acceptedAt:string}` in `types.ts`; append this union to `CountryPresentation` without changing `CountryPreview`.
- `CanadaPilotEnvironment = Readonly<Partial<Record<'CANADA_PILOT_MODE'|'CANADA_PREVIEW_MODE'|'CANADA_ACCEPTED_PREVIEW_MODE'|'TRADE_DATA_MODE',string>>>` in `pilot-config.ts`.
- `resolveCanadaPilotMode(environment:CanadaPilotEnvironment):CanadaPilotMode`: unset pilot returns null immediately. Only exact `fixture`/`selected` are active. Active pilot rejects either private-preview variable being defined, including an empty value. Fixture requires product mode `fixture`; selected requires product mode unset or `census`.
- `loadCanadaPilot(options:{workspaceRoot?:string;environment?:CanadaPilotEnvironment}={}):Promise<{data:CountryPreview;presentation:CountryPilotPresentation}|null>`: default environment is `process.env`; gate before reads, then call `loadAcceptedCanadaPreview({workspaceRoot,modeValue:mode})`. Preserve its authenticated data exactly and map its presentation into the corresponding pilot variant. Return no pointer, record, proof or filesystem path. Selected errors use `Canada pilot unavailable or invalid`.

- [ ] Before any runtime edit, preserve the baseline projection/pointer/protected hashes, four accepted-local CSV hashes and original-context component renderings in the fresh ignored verification directory named in Task 5. These are comparison evidence, not new tests or acceptance operations. Record the baseline code commit; keep all originals intact.
- [ ] Write config tests for unset mode, exact fixture/selected, empty/unknown/whitespace modes, both private flags individually/together and product-mode crossings. Include unset pilot with valid old preview modes to prove those builds remain supported.

```ts
expect(resolveCanadaPilotMode({CANADA_PREVIEW_MODE:'retained'})).toBeNull();
expect(resolveCanadaPilotMode({CANADA_PILOT_MODE:'selected'})).toBe('selected');
expect(()=>resolveCanadaPilotMode({CANADA_PILOT_MODE:'selected',TRADE_DATA_MODE:'fixture'})).toThrow();
expect(()=>resolveCanadaPilotMode({CANADA_PILOT_MODE:'fixture',TRADE_DATA_MODE:'fixture',CANADA_ACCEPTED_PREVIEW_MODE:''})).toThrow();
```

- [ ] Write adapter tests proving no selected/fixture read when disabled or crossed; source/acceptance mapping with no private fields; preserved availability/data identity; synthetic mode with no real release identity; sanitized selected failure with no fallback. Use the existing accepted-reader tests as authority for package authentication; do not duplicate its validator or invent a new acceptance record.
- [ ] Run `npm.cmd test -- tests/country-preview/pilot-config.test.ts tests/country-preview/pilot-load.test.ts --maxWorkers=2`; confirm RED before implementation.
- [ ] Implement the pure gate and thin adapter with the interfaces above. Keep `accepted-load.server.ts` unchanged and add no cache, directory discovery, provider read or publication decision.
- [ ] Run the new tests and existing `accepted-load.test.ts` to GREEN, then `npm.cmd run check`. Commit the adapter deliverable.

### Task 2: Pilot route and presentation with sourced CSVs

**Files:** Create `src/pages/countries/[code].astro`, `tests/country-preview/pilot-page.test.tsx`; modify `src/components/CanadaPreview.tsx`, `src/lib/country-preview/downloads.ts`; extend existing page/download tests only where necessary.

**Interfaces:** Consume Task 1's loader/presentation union and the existing `CanadaPreview({data,presentation})`, `countryCsvFilename`, monthly/products serializers and source guard. No new research model or calculation API.

- [ ] Add page/CSV RED tests for the real prepared and synthetic pilot variants. Real H1 is `Canada historical snapshot`; real banner is `24-month accepted snapshot · Prepared for pilot publication`. Synthetic banner is `Synthetic pilot preparation sample · No accepted country release`. Both retain the fixed periods; neither claims confirmed publication, latest revised Canada data or a future refresh.
- [ ] Test both directions, source/revision explanation, selected-category labels, acceptance/capture dates in UTC with exact `datetime` attributes, native disclosures and immutable historical flags. Compatible rows retain the accepted snapshot qualification; statistical/incomplete/incompatible rows retain unavailable comparisons in display and CSV.
- [ ] Pin pilot filenames to `canada-1220-<direction>-2024-09-2026-08-pilot-prepared-<kind>.csv` or `...-pilot-fixture-<kind>.csv`. Append `presentation_context`, `accepted_release_id`, `local_accepted_at`, `build_context` for pilot variants only. Values are `pilot-preparation`/`pilot-fixture`, real ID/time or blank synthetic fields, and `local-preparation-only`. Pilot CSVs have no `publication_status`, URL or deployment time; existing contexts keep their exact headers/values.

```ts
const data=makeCountryPreviewFixture();
data.source='retained';data.rawVerification='previous-reviewed-replay';
const pilotPresentation={kind:'pilot-prepared' as const,
  releaseId:'2026-08-2e27b39c-932b-4f3d-b2aa-3b11ca2a3cca',
  acceptedAt:'2026-10-12T23:46:54.013Z'};
const row=parseCsv(serializeCountryMonthlyCsv(data,'imports',pilotPresentation))[0];
expect(row.presentation_context).toBe('pilot-preparation');
expect(row.build_context).toBe('local-preparation-only');
expect(row).not.toHaveProperty('publication_status');
expect(countryCsvFilename('exports','products',{kind:'pilot-fixture'}))
  .toBe('canada-1220-exports-2024-09-2026-08-pilot-fixture-products.csv');
```

- [ ] Compare every original data/provenance CSV column to the existing serializer's preview output, not just a row count. Hand-derived fixture imports retain current/prior totals 2,400,000/1,200,000 USD; the first product retains 240,000/120,000 USD and 10% shares. Verify statistical dollar values remain reported while comparisons are blank; fixture provenance stays synthetic and crossed pilot/source variants throw.
- [ ] Run `npm.cmd test -- tests/country-preview/pilot-page.test.tsx --maxWorkers=2`; confirm RED.
- [ ] Add the fixed static path via Task 1's loader and `BaseLayout` with `robots="noindex,nofollow"`; render `CanadaPreview` with `client:load`. No other country code gets a path. Extend only the presentation branches/CSV context helpers needed for this variant. Preserve original preview H1/banners/timestamps, accepted-local wording, exact CSV context fields and formulas/quoting.
- [ ] Run all `tests/country-preview` to GREEN and `npm.cmd run check`; commit route/presentation. Browser verification follows Task 3's isolated server.

### Task 3: Isolated browser build and private-route boundary

**Files:** Modify `scripts/serve-canada-preview-fixture.ts`, `tests/scripts/canada-preview-fixture-server.test.ts`, `tests/e2e/canada-preview-boundary.spec.ts`, `package.json`; create `scripts/serve-canada-pilot-fixture.ts`, `playwright.canada-pilot.config.ts`, `tests/e2e-pilot/canada-pilot.spec.ts`.

**Interfaces:** Preserve `serveCanadaPreviewFixture():Promise<void>` and `resolveCanadaPreviewPort(value:string|undefined):number` (default 4402). Export `serveCanadaPilotFixture():Promise<void>` and `resolveCanadaPilotPort(value:string|undefined):number` (default 4403, `PLAYWRIGHT_CANADA_PILOT_PORT`, integers 1024–65535). Factor the existing lifecycle into one private helper parameterized only by these two fixed kinds; expose no arbitrary environment/output override.

- [ ] Add server RED tests covering pilot fixture/product modes with both private modes deleted, old preview mode with pilot deleted, restoration of all four variables on success/build failure/server failure/termination, invalid/fallback ports, normal-output preservation and owned-directory/junction rejection. Retain old defaults/signatures and existing lifecycle checks.
- [ ] Run `npm.cmd test -- tests/scripts/canada-preview-fixture-server.test.ts --maxWorkers=2`; confirm RED.
- [ ] Implement the two fixed server kinds using existing Astro `build`/`preview` APIs and verified owned output under `.tmp/`. Prefixes are `canada-preview-` and `canada-pilot-`; confirm containment and the current kind's prefix before recursive removal. Preview uses old flags plus deleted pilot; pilot uses `TRADE_DATA_MODE=fixture`, `CANADA_PILOT_MODE=fixture` and deleted private flags. Bind localhost, refuse port fallback and stop only the owned server. The new script is a thin entry to the exported pilot function.
- [ ] Add pilot browser RED checks for synthetic/default Imports, noindex, both directions and two parsed CSVs per direction, statistical exclusions, reference differences, 320/375px keyboard/disclosure/table behavior, and Imports/source explanation without JavaScript. Guard network requests to localhost/blob only; switching/downloads remain disabled without JavaScript.
- [ ] Add boundary checks that both private routes return 404 in pilot mode, the `/preview/` output directory is absent and HTML/JS/JSON contains no private path/package/pointer/proof/credential sentinel. Allow intended public source metadata and shared client validation literals; do not confuse a code string naming `synthetic` with synthetic observations. Extend the ordinary boundary test with `/countries/1220/` returning 404 and no country navigation/data when pilot is unset.
- [ ] Configure the isolated pilot suite with `testDir:'tests/e2e-pilot'`, `reuseExistingServer:false` and `/countries/1220/` as readiness URL. Add `test:e2e:canada-pilot`; append its config after the unchanged normal and preview suites in `test:e2e`, so existing CI runs all three. Modify no workflow, product data setting or normal browser configuration.
- [ ] Run helper tests GREEN, `npm.cmd run test:e2e:canada`, `npm.cmd run test:e2e:canada-pilot` and `npm.cmd run check`. Save/inspect fixture desktop/mobile screenshots in the owned verification directory; commit browser/boundary deliverable.

### Task 4: Conditional country entry and Methods explanation

**Files:** Modify `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `src/pages/methods.astro`, `tests/e2e-pilot/canada-pilot.spec.ts`, `tests/e2e/pilot-research-home.spec.ts` and README usage. Scoped page styles may be added beside the new homepage section; no design-system refactor.

**Interfaces:** Layout consumes only Task 1's pure `resolveCanadaPilotMode(process.env)` to gate a direct `Country research` link to `/countries/1220/`. Homepage and Methods call `loadCanadaPilot()` for checked presentation data. Repeated bounded reads on these three static pages are acceptable; add no mutable singleton cache.

- [ ] Add browser RED cases for homepage `Canada historical snapshot` card/link, selected coverage/source, navigation from country/product/Methods pages, and a `Canada snapshot` Methods section. Test explicit fixture provenance, no-JavaScript links, 320/375px navigation without page overflow, and normal-build absence of all new links/section.
- [ ] Run `npm.cmd run test:e2e:canada-pilot`; confirm failure on missing entry/Methods copy.
- [ ] Add the one fixed homepage country entry, preserving product count, existing product cards/links and ordinary copy. Add the conditional main navigation link and Methods section stating the fixed coverage, import/export valuation, same-archive shares, selected subset, statistical exclusions and captured revision qualification. Keep acceptance distinct from public publication and avoid a monthly Canada refresh claim. Synthetic entry/Methods copy explicitly identifies sample data.
- [ ] Document PowerShell opt-in/removal, `CANADA_PILOT_MODE=selected` with product mode unset/`census` and both private flags removed; document fixture mode requiring product fixtures. Explain no fallback/no deployment, noindex's limits and the new isolated test command. New CLI flags/secrets/upload commands are not part of README changes.
- [ ] Run pilot suite GREEN and the ordinary homepage/boundary checks against an unset-pilot fixture build. Stop/restore only an owned CLI preview if it blocks the ordinary test server; do not reuse a preview with the wrong data/output. Run `npm.cmd run check`; commit site integration.

### Task 5: Real staged artifact, independent review and integration

**Files:** Create `docs/validation/canada-pilot-preparation.md`. Use ignored `.tmp/canada-pilot-preparation-20261013-r1/` for the source staging directory/harness and fresh `data/backups/canada-country-pilot/prepared-20261013-r1/` for privately preserved evidence. Occupied destinations require a new suffix; never overwrite prior proof. No reusable deployment tool, SDK or workflow is required.

- [ ] Use Task 1's saved baseline to verify original private previews remain unchanged in their own isolated builds; compare numerical/presentation outputs independently of pilot mode. If baseline proof is missing, reconstruct it from an authenticated read-only export of the planning baseline before claiming preservation.
- [ ] Run final `npm.cmd test -- --maxWorkers=2` and `npm.cmd run check`; run an ordinary fixture build with all three Canada modes unset followed by all three browser suites through `npm.cmd run test:e2e`. Record actual counts/results, not estimates. Use the existing sandbox-approved host approach if browser/process/junction tests need it; do not change application behavior to satisfy the sandbox.
- [ ] Commit the runtime implementation before the real build. Export exactly its tracked source into a fresh contained staging project, authenticate every exported Git blob and record its commit. Share the existing dependency runtime explicitly; this is not a clean-machine or operating-system-isolation claim. Stage only the exact three compact Canada accepted-state files plus the two coffee pointer/release pairs, validating their paths/bytes/hashes against the preserved accepted/recovery evidence. Original research folders, raw archives, credentials and `.git` stay outside staging.
- [ ] In staging use real product data, `CANADA_PILOT_MODE=selected` and unset private modes; build to its fresh owned output. Preserve automatic file count/size/largest report. A staging failure leaves original state untouched and produces no deployment. Check the route/home/Methods/navigation and the absence of private previews/source packages/synthetic observations.
- [ ] Run one localhost real browser verification in both directions at 320/375/1120px and with JavaScript disabled. Independently compare all 48 displayed monthly values, 20 category summaries/order, 17 qualified comparisons, three exclusions, all-goods current/prior totals and reference counts to the selected projection. Verify readable/exact dates, keyboard controls/disclosures, default Imports research, Canadian exchange/source qualifications and the fixed historical coverage.
- [ ] Parse all four downloaded pilot CSVs and compare every original numeric/provenance column to the reviewed original accepted-local CSVs, with only Task 2's context differences. Recheck the original four hashes separately; their bytes must remain exact. Real current/prior imports are 392,802,538,076 / 396,982,672,171 USD; exports 340,916,490,818 / 342,040,511,099 USD. Do not derive expected summary values with the implementation's calculation functions.
- [ ] In the ignored harness enumerate only regular contained static output files, reject reparse ancestors/links and forbidden private routes/data, and record sorted relative path/byte/SHA-256 identities. Bind the complete list to the staged-source commit, authenticated Canada pointer/projection/release and both exact coffee pointer/release identities. Save the manifest outside static output, labeled `prepared-locally-not-deployed`; it contains no owner instructions, credentials, source bodies or publication claim. Measure/check the complete count and each asset against both named upload methods, record eligibility and retain the 15,000 alert. Deployment must later reverify the exact manifest and enforce the chosen method's hard limits; this record cannot authorize upload.
- [ ] Confirm all eleven protected files, selected pointer and original coffee states unchanged. Save screenshots, browser CSVs, hashes, source-export manifest, static manifest, logs and actual receipts privately; authenticate their saved copies. Record measured normal/fixture/real builds and limitations in the validation document. Keep source and prior evidence intact; no 7.94 GB scan, source fetch, decompression or R2 operation is justified by this presentation check.
- [ ] Bind the artifact to its actual source-export commit. Later validation/checklist-only commits may differ only in `docs/validation/canada-pilot-preparation.md` and this plan, with an explicit Git comparison proving identical runtime files. A subsequent runtime fix requires a fresh staged build and updated affected browser/manifest evidence; it cannot inherit the old artifact's readiness from CI alone.
- [ ] Self-check all spec sections against the five tasks and proof. Dispatch one fresh immutable whole-branch reviewer (root implements, reviewer read-only); include real evidence and require independent CSV/display/manifest comparison, original-context preservation and mode/output checks. Address Critical/Important findings with meaningful RED/GREEN regressions and focused checks; do not obtain a second whole review for routine fixes.
- [ ] Create/attach the PR, push the final reviewed branch, verify exact-head CI and merge with expected-head protection under the owner's standing permission. Synchronize main and prove the merged tree matches the tested tree; do not repeat all tests after an identical-tree merge. Preserve an owned localhost pilot preview for the owner and archive only task-owned scratch after required proof is safe. No artifact is uploaded publicly and no accepted data pointer is changed.

## Self Review and Execution Handoff

Spec coverage: fixed selected state/configuration is Task 1; historical page/CSV context and unchanged previews are Task 2; mode isolation, private-route exclusion and browser lifecycle are Task 3; entry/navigation/Methods are Task 4; real projection/CSV/artifact evidence, limits, preservation/review/CI are Task 5. All five Review Focus cases have an owning check. Runtime signatures and mode/context names are defined once and reused; no new numerical model or hosting integration is hidden in the plan.

The real artifact and upload-limit record are bounded operator evidence, not a new acceptance schema or deployment subsystem. Hosting choice, account capacity/project suitability, actual upload/withdrawal, indexing decision, live verification and successive-release acceptance belong to the later deployment/refresh scope. This plan prepares a local artifact without claiming those gates pass.

Self-review confirmed all approved local-milestone requirements have an owning task, the five Review Focus conditions have explicit checks, and the type/mode/context signatures agree across tasks. Baseline preservation occurs before runtime edits, and final evidence distinguishes the artifact's source commit from later documentation-only commits. Existing file paths and local document links were checked; no code or external operation has run during planning.

The owner approved this written plan on October 13, 2026. Root implemented Tasks 1–4 and completed the local verification work in Task 5; the [validation record](../../validation/canada-pilot-preparation.md) binds the real artifact and checks. Independent whole-branch review, final CI and integration remain the last Task 5 steps at this checkpoint. The preserved execution method is root implementation with subagents reviewing. Standing merge permission applies; deployment and account/source changes remain excluded.
