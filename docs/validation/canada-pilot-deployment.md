# Canada historical-snapshot pilot preparation

Status: **published-verified**. The owner approved the concrete package/target decision, and the exact prepared package was deployed and verified on October 13, 2026. Local Tasks 1–5 were integrated through PR #77; the observed Task 6 outcome is recorded below. The earlier preparation/review evidence remains preserved.

The opt-in `CANADA_PILOT_MODE=snapshot` uses the existing authenticated selected reader. It presents Canada as a **24-month accepted historical snapshot**, September 2024–August 2026, and reports the original local acceptance time separately from capture times. It adds no observations or refresh promise. Imports remain general imports/customs value; exports remain domestic plus foreign exports/FAS value with the Canadian exchange qualification. All values remain nominal USD and not seasonally adjusted.

The Canada release remains `2026-08-2e27b39c-932b-4f3d-b2aa-3b11ca2a3cca`, accepted locally at `2026-10-12T23:46:54.013Z`. The projection remains 33,716 bytes with SHA-256 `33c7db7ec421bddaa13e36c3b2e32cd4558aa041fe17f2f3da01285b62b08fd0`; the pointer remains 466 bytes with SHA-256 `9ede6a6906b0da7f85e74203d186bee7f6a8e08e37f452fb9f5a99e88e10a399`.

Current/prior twelve-month totals remain imports $392,802,538,076/$396,982,672,171 and exports $340,916,490,818/$342,040,511,099. The 17 qualified comparisons and three statistical exclusions remain intact. The captured reference differences and historical failures remain visible and unchanged; immutable availability flags were not altered.

## Prepared artifacts

The authenticated export is source commit `2a7796df69629448678bca8885f842ca6ae8dceb`: 347 tracked Git blobs and exactly seven accepted-state files (three compact Canada files and the two coffee pointer/release pairs). Its existing dependency junction is shared locally and excluded from both upload packages. No raw archive, credential, private proof directory, preview route, Functions, worker executable or source map is included.

| Package | Entries | Uncompressed bytes | Largest entry | ZIP bytes | ZIP SHA-256 |
| --- | ---: | ---: | ---: | ---: | --- |
| Site | 24 | 1,184,475 | 283,215 | 315,733 | `7b074755b387dd9da212cc2a49ac3c9f5659107773f028e1551c22643e4fcb92` |
| Withdrawal | 3 | 1,179 | 571 | 1,075 | `af671ea2a9546b6ea76cfcd753c3286ca020cc4622c629d095fa2ae60a005932` |

Site manifest: 5,466 bytes, SHA-256 `5a8ab7cdb520162b4231ae82f309f7262278ac44ea7d7fc42489144ce5f0b9dd`. Withdrawal manifest: 1,530 bytes, SHA-256 `2745c57af61de02a702b26fda7b8d1dba4f2808895aa0448572aeae20639e371`. Each ZIP has exact root entries and authenticated decompressed payload readback. Counts include `_headers` and `404.html`; both satisfy the planned dashboard limits of 1,000 files and 26,214,400 bytes per asset. The 15,000-file planning alert remains clear.

The site adds the reviewed noindex/nofollow header rule and a standalone error page explicitly during preparation. The withdrawal package contains only the header and two standalone “Pilot temporarily unavailable” pages. Ordinary builds receive neither package's templates automatically. CSV/PNG downloads remain generated in the browser; R2 remains private and unchanged.

## Observed verification

- Relevant configuration/reader tests went from seven expected failures to 37 passes. Presentation tests went from four expected failures to 142 passing country tests. Type checking examined 227 files with zero diagnostics.
- The final full suite passed 1,014 tests across 81 files. All 70 existing browser tests passed (53 ordinary, ten private Canada, seven prepared-pilot). The ordinary fixture build remains 21 files/512,194 bytes and omits the Pages templates. The real snapshot build is 22 files/1,183,730 bytes before the two explicit templates.
- The private ZIP operator passed 13 probes, including changed/extra files, bad provider controls, wrapper/traversal/absolute/drive/backslash paths, duplicates/case collisions, ZIP symlinks, input/output junctions, occupied destinations, 1,001 entries and a file exceeding 25 MiB. On Windows, path and handle timestamp queries differed for one unchanged file. A failing regression established that comparison issue; the operator now compares each metadata domain before/after while retaining cross-domain file identity, exact length and payload hashes. A separate probe rejects a handle timestamp change during reading.
- Against the exact assembled package on strict localhost port 4422, independent arithmetic and baseline columns verified all 48 monthly values/chart labels, 20 ordered category summaries, 17 qualified/three excluded comparisons, all four actual Canada CSV downloads and fixed totals. New CSVs identify the historical snapshot and original accepted release/time, without a publication status/time.
- Six direction/viewport checks at 320/375/1120 pixels passed, with native keyboard disclosure, UTC acceptance display, no-JavaScript Imports and zero page errors or external browser requests. Home, Methods and navigation identify the bounded snapshot. Four private/missing paths returned the standalone 404 locally.
- Both staged real coffee profiles matched latest world imports/exports, latest world calculated duties/consumption values, and weighted rolling duty shares using matching sums. A valid Canada/12-month shared coffee view restored its filters; its actual sourced CSV matched stored observations and its 1920×1080 PNG retained chart/source provenance. Desktop/mobile screenshots and the PNG were visually inspected.
- All 24 old CSVs and six renderings remain byte-identical. All eleven protected files, selected projection/pointer and both coffee states remain unchanged.

The early operator and browser-proof failures were retained privately. They exposed a Windows metadata comparison and proof expectations for removed publication columns/coffee pointer paths; they did not justify changes to research values or production behavior.

## Limits

Localhost did not establish Cloudflare's header handling, HTTP error behavior, hostname availability, deployment identity or public serving state. The subsequent observed live checks below now establish the recorded publication outcome. Public access differs from search indexing exclusion; a canonical withdrawal replacement may leave older deployment URLs accessible. Permanent project removal still needs action-time confirmation.

Private evidence is preserved under `data/backups/canada-country-pilot/deployment-20261013-r1/`, with a sorted digest seal. It includes upload/withdrawal entries, manifests, ZIPs/readback receipts, source/data export, original baselines, operator/proof harnesses, screenshots/downloads and execution logs. Provider/account inspection and later review/integration receipts are supplemental private evidence rather than modifications to the original seal.

## Independent review and integration boundary

One fresh read-only reviewer examined `b6ea8f823d138a65f881754845dad343e24731ad` through `2b2ff9fd14fe6963ef05980a8fde4a7053b922e6` and found no Critical, Important or Minor defects. The reviewer independently matched every ZIP payload/directory/manifest and reviewed template identities, all 347 exported sources/seven state files, the 491-file preservation seal, four CSV column comparisons, summary/category arithmetic, mode conflicts/failures and all old-context identities. The source artifact differs from that reviewed head only in the plan and this validation record; subsequent review-status documentation does not change package bytes.

The reviewer's sandbox denied a direct localhost browser connection. It fulfilled browser requests from authenticated upload bytes and independently verified both directions' 48 monthly/20 category renderings and arithmetic. Root's strict localhost check separately establishes the recorded local status behavior. Neither proves Cloudflare status/headers. The reviewer inspected retained mobile/coffee evidence instead of rerunning the broader suite; root retains that observed proof.

Root rulings on declined-to-judge items: current account/name/capacity is a bounded read-only preflight; actual provider headers, HTTP 404s, deployment identity, serving state and withdrawal effectiveness remain Task 6 gates. Exact-head CI and merge-tree checks are integration gates, recorded only after observation. Raw-source validity and successive-release acceptance remain outside this presentation milestone and rely on prior evidence without a new source scan. No declined item is silently treated as passing.

Read-only preflight found no existing trade Pages project and the expected Pages Direct Upload form. It states the project name generates a permanent `pages.dev` hostname, but availability and the assigned hostname cannot be established before creation. Visible account limits match the Free tier; no paid activation was submitted. The proposal remains Free Pages in the existing account with no paid upgrade, custom domain, access-policy change or repository auto-deployment. Current official [Direct Upload limits](https://developers.cloudflare.com/pages/get-started/direct-upload/) and [Pages limits](https://developers.cloudflare.com/pages/platform/limits/) were checked; the measured package fits. Any different target or unexpected paid/legal commitment stops the provider operation for an owner decision.

[PR #77](https://github.com/Vasuki8/us-trade-tracker/pull/77) contains this implementation and evidence summary. Exact-head CI, expected-head merge, synchronized-main tree proof and the concrete operator proposal are preserved as separate private integration receipts after their observed outcomes. This review record grants no public upload approval.

## Observed public pilot

The owner's subsequent “continue” followed the exact public-upload/conditional-withdrawal decision and authorized that presented operation. The existing signed-in dashboard created the exact approved Direct Upload project and reported successful upload of all 24 package entries. Production deployment `f8e060b4-1767-4276-b991-a6a0a2bc87da` reported **success**, with provider creation time `2026-10-13T14:56:47.680446Z` from the visible timestamp's `datetime`/`title` attributes.

The pilot is available at [Canada historical snapshot](https://us-trade-tracker.pages.dev/countries/1220/), on canonical origin `https://us-trade-tracker.pages.dev`. The provider-reported deployment origin is `https://f8e060b4.us-trade-tracker.pages.dev`; no additional aliases were reported in the inspected deployment views. The fixed snapshot and both coffee profiles retain their original accepted data. Source capture, local acceptance, artifact preparation, provider creation and live verification remain separate recorded events.

All **54 finite live requests** passed across both origins: each of 23 served payloads matched its manifest length/SHA-256 after transport decompression, with expected same-origin HTML redirects only. Every tested response carried `X-Robots-Tag: noindex, nofollow`. The eight missing/private-path probes returned HTTP 404 and the exact standalone error payload, including both private Canada previews, country `9999` and the private state-pointer path. The provider's 23 served-files count is expected: the 24th uploaded entry, `_headers`, is a provider control rather than a served asset.

The reused anonymous research proof passed on the canonical site: all 48 monthly values/chart labels, 20 category summaries, fixed totals, 17 qualified comparisons/three exclusions, four actual Canada CSV downloads, six direction/viewport checks, UTC/native keyboard disclosures and no-JavaScript Imports. Both real coffee profiles' trade/duty denominator/weighted rolling figures and a shared-view sourced CSV/1920×1080 PNG passed. There were zero browser errors or external browser requests. Live desktop/mobile screenshots and the existing retained chart provenance were visually checked.

The bounded live verifier first passed one positive and eight negative probes: it rejects cross-origin/unexpected redirects before following them, wrong payloads, missing header directives, a 200 private path, oversized actual/declared bodies and malformed origins; a failure produces no passing receipt. The actual live asset verification completed at `2026-10-13T14:58:35.103Z`.

No withdrawal was needed because all required checks passed. The separately authenticated withdrawal package remains private and available under the approved conditional permission; no deletion or older-URL retraction is claimed. No paid activation, custom domain, analytics, Git automatic deployment, access/token change, R2/Census operation or pointer rewrite was performed. All eleven protected inputs and the Canada pointer were rechecked unchanged after live verification.

Publication evidence is preserved separately at `data/backups/canada-country-pilot/deployment-20261013-r1/publication-20261013-r1/`, retaining the original preparation and integration seals. It contains the provider receipt/screenshots, asset/header/404 records, anonymous research results/downloads/screenshots and local verifier/operator evidence. Publication establishes this fixed historical pilot; it does not establish automatic refresh or full recurring-release acceptance.
