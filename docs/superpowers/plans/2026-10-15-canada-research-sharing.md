# Canada research sharing design and implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans task by task. Root implements; fresh independent reviewer subagents review the completed branch. Preserve the owner's standing reviewed-merge permission.

**Goal:** Let a reader reopen the Canada snapshot in the selected trade direction and download a chart image carrying the source and historical-snapshot qualifications.

**Architecture:** Extend the existing public Canada page and its chart, reusing the product site's URL/copy conventions and browser PNG converter. Bind all displayed and exported values to the unchanged accepted Canada snapshot. Keep local/private preview behavior separate through an explicit public-route sharing opt-in.

**Tech Stack:** Existing Node 24, Astro/React, TypeScript, Vitest, Playwright, Python 3.12+ standard library and locked dependencies. No new package or service.

**Spec:** This combined bounded design and plan extends the [launch brief](../specs/2026-10-08-us-trade-tracker-design.md), [Canada pilot presentation](../../validation/canada-pilot-deployment.md), [research handoffs](../../validation/research-handoffs.md) and [live verifier](../../validation/live-site-verification.md). The combined format follows the owner's request for several tasks and one permission review.

**Status:** Owner approved all five tasks and full permission envelope on October 15, 2026. Tasks 1–4 are locally verified; Task 5 independent review, integration, publication and private closeout remain. Baseline main 099e6f25454b40c75e7fe054cfe0c7474716dd08.

## Recommendation and alternatives

The launch scope includes sharing sourced chart images and data. Product profiles already restore direction/country selections and export PNGs. Canada currently stores Imports/Exports only in component state and offers monthly/products CSVs. A direction link and qualified chart image close this concrete gap using already accepted observations.

A smaller alternative is native product-profile section navigation and links from Leading partners. It remains useful later, but Canada sharing closes a direct launch capability gap. Another release-orchestration framework would duplicate the existing stage/prepare/package/verify loop. Broader product/country intake needs separate source/classification acceptance and evidence of demand.

The [Census release calendar](https://www.census.gov/foreign-trade/schedule.html), checked October 15, schedules September 2026 merchandise data for November 4 at 8:30 a.m. Eastern. The existing synthetic refresh/recovery checks cannot establish live successive-release acceptance, and that future gate is outside this batch.

## Bounded design

1. **Scope sharing to the public country route.** Add enableSharing?:boolean, default false, to CanadaPreview. Only src/pages/countries/[code].astro opts in, and only when presentation.kind is pilot-snapshot or pilot-fixture; its existing pilot-prepared rendering explicitly leaves sharing disabled. Opt-in requires a validated pilot-snapshot or pilot-fixture presentation; reject a crossed presentation. Private preview, accepted-local and pilot-prepared flows retain their current controls, context and CSVs. Fixture sharing is development-only and must remain unmistakably synthetic.

2. **Save the direction, not a new data selection.** Public links are /countries/1220/?direction=imports or ?direction=exports, optionally followed by the current fragment. No query means Imports. Reject duplicate direction fields, empty/unknown/case-mismatched direction and search strings longer than 2,048 characters as a whole; fall back to Imports with a fixed notice. Ignore unrelated query fields when reading and omit them when generating a link. Do not reflect rejected input in notices. Links reopen this direction in the historical snapshot available at that route; they do not authenticate or pin an immutable release.

3. **Restore and copy consistently.** Restore on hydration, popstate and hashchange. A deliberate direction change pushes one history entry, preserving existing browser history state and the current fragment. It clears stale copied/error state. Do not rewrite the address merely to normalize initial input. Copy the generated same-origin URL; if clipboard access fails, show a read-only, selectable manual link. Generation checks prevent a late clipboard result from announcing an obsolete direction or fragment. Before hydration, all new controls are disabled and the static page truthfully shows Imports. The no-JavaScript explanation must cover saved links, direction switching and downloads.

4. **Export the all-goods history already shown.** Add Download chart PNG near All-goods history on the opted-in page. Use the existing exportChartPng converter at 1,920 × 1,080 from a self-contained 960 × 540 SVG. Share the existing country plot marks between screen and export; preserve plotted values, gaps, axes and monthly table. Do not include product-category rankings or compute new statistics. Keep the existing accessible chart/table relationship and screen dimensions.

5. **Make the image stand on its own.** Include Canada, U.S. imports from/exports to Canada, GEN_VAL_MO/ALL_VAL_MO, September 2024–August 2026, nominal USD and not seasonally adjusted, Census monthly merchandise attribution, capture interval in explicitly labeled UTC, processing version, and the qualified snapshot context. Required retained-data wording: “Accepted historical snapshot; not a uniform or latest-revised series. No monthly-update claim.” Required sample wording: “SYNTHETIC DEVELOPMENT DATA — no accepted country release.” State “Capture times describe saved files, not observation revision dates.” Include a readable direction-aware canonical page URL for the full monthly source identities and CSV. Preserve the existing source/revision explanation on the page; an image does not certify current headline agreement or resolve the failed historical audits. Do not expose owner-private acceptance/archive/package identifiers.

6. **Keep export behavior tied to the click.** Snapshot the SVG, direction and filename at activation. Use countryCsvFilename(direction,'monthly',presentation) with the final -monthly.csv suffix replaced by -chart.png, preserving the existing historical-snapshot versus pilot-fixture distinction. A busy export blocks duplicate image requests. A direction change may proceed; the in-flight image retains its original direction and matching filename, and a late completion/error cannot overwrite the new view's status. A conversion failure shows a fixed error and leaves both CSV downloads usable. No server-generated images, PDF dependency, external font/image fetch, canvas library or stored download combinations.

## Global constraints

- Pilot products remain 090121 and 090111 through August 2026. Canada 1220 remains its fixed September 2024–August 2026 snapshot.
- Preserve all 48 Canada monthly values, 20 ordered category summaries, 17 qualified comparisons and three exclusions, source/revision explanations, classification evidence and statistical-category rules.
- No accepted pointer/release, source record, calculation, registry, CSV schema/filename/byte or archive-format changes. PNG is the only new download type for Canada.
- Keep pages and chart data on the static host, downloads generated in the browser and R2 private backup storage.
- Preserve noindex,nofollow, manifest schema v1, the 1,000-entry package bound, 26,214,400-byte per-asset limit and 15,000-file planning alert.
- The assembled site must remain at or below 2,097,152 raw bytes, ZIP at or below 4 MiB and the verifier's existing 128-check bound; no limit bypass. Current site: 31 entries / 1,693,100 raw bytes.
- Keep locked dependencies and existing runtimes. No changes to packaging, source/data acceptance or deployment templates unless a demonstrated compatibility defect blocks this batch; stop for a material interface change.
- Run focused checks while editing, one complete final check set and one retained-data rehearsal. Repeat affected checks only for changed runtime, failures or review findings. An identical merged tree does not need a duplicate full build/test cycle.
- The shared local runtime remains trusted; this work does not establish OS isolation. Browser/number checks and observed Production identity remain separate from a successful site:verify receipt.

## Permission envelope for all five tasks

Approval of the complete plan authorizes:

1. Root source/test/documentation implementation and routine in-scope repairs; managed worktrees; read-only independent reviewer subagents; existing runtime setup and locked npm ci if needed. Root remains the implementer.
2. Read existing accepted/protected identities and compact state needed by site:stage. Copy only its same seven authenticated files into each fresh ignored stage, at most 16 MiB per stage; at most three retained-data stages if a repair requires rebuilding. Preserve originals. No raw archive read/replay or remote recovery.
3. Local unit/type/fixture/build/browser checks, exclusive loopback previews with outside requests blocked, screenshots and PNG/CSV downloads, stage pre/post checks, site assembly and site/withdrawal ZIP create/readback. Authenticate a pre-edit baseline before source edits. Preserve useful proof, accepted-input copies, packages, logs and screenshots under fresh ignored task storage, with a 64 MiB useful-proof cap excluding reproducible dependency/build caches. Stop only owned processes; preserve proof before native archive or verified task-owned scratch cleanup.
4. Commits, GitHub pushes, PR creation/update/attachment, existing standard-runner Code checks, fresh independent review, reviewed expected-head merges under standing permission, main synchronization/tree verification and documentation closeout. Fix important in-scope findings and rerun affected checks. Final CI must pass for the exact head being merged.
5. Signed-in read-only Cloudflare preflight and publication of the generated, verified package to the existing **Free / Production / us-trade-tracker** Pages project in account **2e23d873002d29a02a1427e1fa37c5cd**, canonical **https://us-trade-tracker.pages.dev**. Upload only static output derived from the reviewed, CI-passed, merged source and unchanged seven accepted inputs. Bind the actual runtime source commit to the reviewed tree and read back the exact ZIP/manifest identities before upload. At most two candidate uploads for this batch, with fresh affected acceptance/review/CI before a repaired runtime candidate.
6. Bounded anonymous live verification on canonical and the deployment origin actually observed in Cloudflare. Use the existing site:verify limits unchanged for one preflight and one check of each candidate/restoration; one extra read-only run is allowed per transition only for demonstrated propagation/transient failure. Browser checks are limited to the Canada sharing/direction/download journeys, existing Canada figures/qualifications, a coffee-profile/download smoke check and existing private-route boundaries. No guessed host, Census retrieval or recurring polling.
7. If a candidate regresses, automatically restore the exact currently verified site pinned below, at most once per failed candidate, and verify restoration. Preserve the failed-candidate evidence. An ordinary regression uses the prior working site, not a withdrawal page.

### Current site and restoration pins

| Item | Required value |
| --- | --- |
| Current Production deployment | 660d1364-b7c9-4220-a1b4-c66ca9eae5da |
| Observed current deployment origin | https://660d1364.us-trade-tracker.pages.dev |
| Retained prior package directory | data/backups/research-handoffs/deployment-20261015-r1 |
| Prior ZIP | site.zip; 386,182 bytes |
| Prior ZIP SHA-256 | 0b2c6e5e185d5b028a2bb87162b61a899d05758391890a5085ff8566ae931f7f |
| Prior manifest SHA-256 | 6fee00416d3fd12768ca68105a347f3dc57a2907910df334000d6941adc6da58 |
| Prior runtime source | a05bfd407b447ba48c830866e9394a6a516077ec |

Before upload, confirm the Free target and observed Production identity and require the canonical/prior deployment origins to match these pins with site:verify. A mismatching or concurrently changed Production site is not permission to overwrite it or substitute a different restoration package. Investigate read-only and seek a new decision only if the discrepancy cannot be resolved inside this envelope.

**Excluded:** new imports/live Census or source requests; raw replay; data replacement/intake/promotion; additional products/countries/months; Canada refresh; R2 reads/writes; new dependencies, services, accounts/domains or access/indexing changes; paid changes or intentional extra charges; schedules, outreach, analytics, ads, subscriptions and billing. The owner's below-100-GB R2 preference is retained; this batch needs no R2 operation.

A required human sign-in/CAPTCHA or new terms decision still requires the human step. Stop dependent consequential work for a material scope/cost/access/target boundary; complete unaffected work. Failed tests and in-scope review findings authorize diagnosis and repair, not repeated routine approval requests.

## Review focus

1. Direction, URL, radio state, figures, CSVs, PNG and browser history must agree after hydration, navigation and delayed clipboard/export results. Tasks 1–3 and 4.
2. A saved Exports URL without JavaScript must show and explain static Imports; disabled controls cannot pretend to apply the saved direction. Tasks 2 and 4.
3. Synthetic/private/local-prepared presentations must not gain accepted-public claims, public sharing controls or leaked private metadata. Tasks 2–4.
4. Image source/capture/series qualifications, missing values and long labels must remain legible and truthful without changing arithmetic or CSV bytes. Tasks 3–4.
5. The exact reviewed source/accepted inputs/package/Free target must be bound, and restoration must use the verified predecessor. Tasks 4–5.

## File responsibilities and interfaces

- Add src/lib/country-preview/view-link.ts with CanadaViewSelection={direction:CountryDirection}, readCanadaViewSelection(search:string):{selection:CanadaViewSelection;notice:string|null}, and canadaViewPath(selection:CanadaViewSelection,hash?:string):string. Runtime-invalid direction throws in the writer; optional hash is empty or begins with #. Generated paths have exactly the direction query followed by that fragment.
- Add src/components/CanadaViewLink.tsx. Export useCanadaViewLink(enabled:boolean), returning selection, changeSelection(next:CanadaViewSelection):void, ready, link, notice, copied, manual and copy():Promise<void>. Export CanadaViewLink using that returned state for copy/status/fallback rendering. Disabled mode must install no URL listeners or rewrite history.
- Modify CanadaPreview.tsx and the public country route for opt-in and integration. Preserve the private direction path when disabled.
- Add src/lib/country-preview/chart-export.ts with buildCountryChartExport(data:CountryPreview,direction:CountryDirection,presentation:CountryPresentation):CountryChartExport. The model contains title, direction, measure, from, to, sourceLabel, captureStartedAt, captureFinishedAt, processingVersion, context ('historical-snapshot'|'pilot-fixture'), qualification, sourcePageUrl and filename. Validate source/presentation with the existing assertCountryPresentationSource and reject other presentation kinds. Derive labels only; no data calculation.
- Modify CountryPreviewChart.tsx to share CountryPlotMarks and its CountryPlotSize type, preserving screen wrappers/sizes. Add optional download?:React.ReactNode content near the history chart.
- Add CountryChartDownload.tsx with CountryChartDownload({data,direction,presentation,ready}); it renders an export SVG in a hidden parent, the PNG action and local status/error. The SVG itself must not carry hidden/display:none styling that would make its serialized clone blank. Reuse exportChartPng and downloadBlob without changing their existing callers.
- Add focused tests below. Update README and add docs/validation/canada-research-sharing.md with observed evidence. No new package.json command is needed.

## Task 1: Define and test Canada direction links

**Files:** Add src/lib/country-preview/view-link.ts and tests/country-preview/view-link.test.ts.
**Deliverable:** A deterministic fixed-route reader/writer with no DOM or network dependency.

- [x] Before runtime source edits, pin the planning source, authenticate all seven accepted inputs and eleven protected identities, and capture pre-edit Canada CSVs for both directions and both kinds. Preserve the existing 84 default coffee/change/portfolio CSV cases, sixteen merchandise-mover selections and eight duty-mover selections using the retained baseline harnesses, with their actual case lists/hashes. Baselines must precede edited runtime.
- [x] Add failing tests for defaults, both directions, duplicate/empty/invalid/case-mismatched direction, 2,048/2,049-character input, ignored unrelated fields, preserved fragments and runtime-invalid writer input. Pin canadaViewPath({direction:'exports'},'#country-history-heading') to /countries/1220/?direction=exports#country-history-heading.
- [x] Run npm test -- tests/country-preview/view-link.test.ts --maxWorkers=2 and confirm failure for the missing interface/behavior.
- [x] Implement the interfaces above and the fixed fallback notice “This saved Canada view could not be restored. Showing Imports.” Do not introduce a release/version query or arbitrary country route.
- [x] Rerun the focused cases, confirm canonical import/export roundtrips and commit the deliverable.

## Task 2: Integrate restored/copied views into the public Canada page

**Files:** Add CanadaViewLink.tsx and tests/ui/CanadaViewLink.test.tsx; modify CanadaPreview.tsx, src/pages/countries/[code].astro, tests/country-preview/pilot-page.test.tsx and relevant private presentation tests.
**Consumes:** Task 1's reader/writer.
**Deliverable:** The public page restores/copies direction and fragment while private previews retain existing behavior.

- [x] Read back Task 1's pre-edit baseline and original accepted/protected identities before integration; preserve them for Task 4's comparison.
- [x] Write failing cases for Exports restoration, invalid fallback, one-entry direction changes, back/forward, fragment updates, clipboard denial/manual selection, stale clipboard completion, static disabled controls and effect cleanup. Add cross-presentation tests that opt-in is absent from both private routes and rejected with local/prepared context.
- [x] Run the focused tests RED; implement the hook/component and public-only opt-in. Reuse existing view-link styling. Add id=country-history-heading to the existing history heading for stable fragment tests.
- [x] Update the no-JavaScript explanation: saved directions require JavaScript and the initial page shows Imports. Keep default research, source details and native disclosures readable.
- [x] Run the affected link/UI/presentation tests GREEN and commit. No calculation or CSV change.

## Task 3: Add a qualified browser-generated chart PNG

**Files:** Add chart-export.ts, CountryChartDownload.tsx, tests/country-preview/chart-export.test.ts and tests/ui/CountryChartDownload.test.tsx; modify CountryPreviewChart.tsx and public sharing integration.
**Consumes:** Task 2's current restored direction/readiness and the existing accepted view.
**Deliverable:** A sourced image whose plot, direction, context and filename match the action taken.

- [x] Write failing tests for import/export measure and filename, retained versus synthetic labels, crossed/private context rejection, exact capture metadata, no private IDs, long footer wrapping, and unavailable-month line breaks. Assert the same plot points/path are used by screen and export; do not derive expected observed values through the new helper.
- [x] Add controlled asynchronous tests for duplicate clicks, direction change during conversion, stale success/error, null/failed conversion and CSV usability after PNG failure. Pin a fixed failure message: “PNG export failed. You can still download the monthly data as CSV.”
- [x] Run the focused cases RED, implement metadata/plot reuse and self-contained SVG text with explicit inline fonts/colors, white background and deterministic wrapping. Use no external resources or foreignObject.
- [x] Keep the download absent from private/local-prepared presentations, disabled before readiness, and announce Creating image… while busy. A prior-direction export must retain its captured filename; never pair current filename with old image content.
- [x] Run focused cases GREEN, inspect rendered SVG bounds/text and commit. The real PNG pixel/readability check belongs to Task 4.

## Task 4: Verify retained research and prepare the exact candidate

**Files:** Extend tests/e2e-pilot/canada-pilot.spec.ts; add docs/validation/canada-research-sharing.md; update README's existing Canada usage section.
**Consumes:** Tasks 1–3 and existing stage/prepare/package tools.
**Deliverable:** A measured locally accepted package and preserved predecessor, without new observations.

- [x] Add browser journeys for direct/reloaded Exports, Imports/Exports back/forward, fragment-aware copy and denied-clipboard fallback, keyboard use, 320/375/1120-pixel layouts, PNG failure/recovery, and no-JavaScript saved Exports showing explained Imports. Preserve fixture synthetic labels in downloaded images.
- [x] On the final runtime, run npm test -- --maxWorkers=2, npm run check, explicit fixture npm run build, npm run test:e2e and py -3 -m unittest discover -s tests/packaging -v using the configured Python 3.12+ runtime. Require all suites to pass and no type diagnostics. Retain focused evidence for any platform failure/repair.
- [x] Follow the existing README PowerShell site:stage recipe: fresh stage → precheck → TRADE_DATA_MODE=census/CANADA_PILOT_MODE=snapshot build with both private preview modes absent → postcheck → site:prepare. Read back all seven accepted/eleven protected identities before and after.
- [x] Replay the authenticated pre-edit CSV cases against the staged runtime and require exact bytes. Independently compare all 48 Canada monthly values, 20 category summaries, 17 qualified/three excluded comparisons and four Canada CSVs to retained accepted inputs, without calling application calculation modules for expected values.
- [x] On an exclusive loopback origin, download both real PNGs; check PNG signature, 1,920×1,080 dimensions, distinct import/export content and matching filenames. View both images at full resolution: inspect title/measure/period, axis/line gaps, capture/source/version footer, qualification, contrast and clipping. Check source SVG text against retained metadata; pixel dimensions alone do not prove legibility or numeric correctness.
- [x] Record file count, total raw bytes, largest file and payload delta from 31/1,693,100. Enforce global package limits. Create/read back site and withdrawal ZIPs with scripts/package_site.py and verify deterministic recreation. Keep private proof outside public output; preserve current restoration pins. Commit actual evidence and docs.

## Task 5: Review, merge, publish and close out

**Deliverable:** A reviewed public Canada sharing update, or an accurately recorded failure with the prior verified site restored.

- [ ] Self-review the final branch against the design and permission envelope. Obtain a fresh independent whole-branch review of an immutable base/head range; resolve important findings and record explicit dispositions and limits. Root implements repairs.
- [ ] Push/create/attach the PR and require existing CI to pass on the exact final reviewed head. Merge under standing permission; synchronize main and verify its tree matches the accepted runtime/source plus classified non-runtime changes. A runtime repair requires fresh affected acceptance/package evidence.
- [ ] Confirm the current Free project/Production identity and run site:verify against the pinned predecessor. Read back upload/restoration ZIP+manifest hashes, accepted-input identities and actual candidate commit binding immediately before upload.
- [ ] Publish the verified candidate to the exact existing target. Observe the actual new deployment ID/origin; run site:verify on canonical and that origin. Use the existing redirects, byte/header/private-404 and timeout limits unchanged.
- [ ] Verify the new public Canada direction links, manual-copy behavior and both PNGs, four unchanged CSVs, historical/revision/synthetic boundaries, 48 monthly/20 category figures and 17/three comparison split. Include mobile/keyboard and a coffee-profile/download smoke check. Block unexpected external requests and record browser errors.
- [ ] If a candidate regresses, restore the pinned predecessor once and verify payload/header/private-route behavior and prior research. Preserve every failed candidate/run; allow a repaired second candidate only within the envelope and after its required review/CI/acceptance.
- [ ] Record truthful publication/restoration results, CI/review identities, final source/data/package bindings and limitations. Seal/hash-read-back useful private proof under data/backups/canada-research-sharing/, synchronize main, archive the owned worktree natively, then check preserved proof again. Keep post-seal completion metadata separate from sealed files.

## Self review and handoff

All design requirements map to Tasks 1–5 and each Review focus item has explicit link/UI/browser/package checks. A successful PNG is not a new source audit; a site:verify receipt is not browser/numerical or Production-identity acceptance. Existing accepted data, failure records and ownership boundaries remain intact.

Root implementation with independent reviewer subagents is the preserved execution method. Owner review of this combined design, five-task plan and full permission envelope is the only routine approval pause before execution. Planning does not publish anything; approval would include this exact target and constrained restoration policy.
