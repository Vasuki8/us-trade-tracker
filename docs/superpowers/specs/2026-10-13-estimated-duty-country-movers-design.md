# Estimated-duty country movers design

**Status:** The owner approved the full five-task package and permission envelope. Implementation was independently reviewed, CI-tested and merged; the existing Free Pages project was updated and live verification passed. See [validation and publication evidence](../../validation/estimated-duty-country-movers.md#observed-public-update). The recorded approval authorizes this batch only.

## Purpose and recommendation

Complete the launch scope's country ranking by changes in estimated duties and their share of import value. Small import businesses should be able to find the largest observed increases/decreases, inspect the matching amounts and denominators, and follow the source/product research. These are research leads from reported Census figures, not shipment quotations or claims about why tariffs changed.

The current changes pages rank general merchandise dollars and country shares. The product profiles and portfolio briefing already show qualified duty comparisons, but do not rank all comparable countries by duty-share change. The recommended addition is a separate imports-only duty-changes flow, preserving existing merchandise URLs, measures and CSV contracts.

Alternatives considered: adding a duty metric to the merchandise table would make one control switch between different measures, denominators and eligibility rules; a dedicated flow keeps those distinctions visible. Adding products would require new source/classification/intake work without completing this remaining feature. Portfolio polish is useful but offers less additional research value than the missing ranking.

## Evidence available now

Repository base: `b18c43b9e5dbdc66d9fdb2b17124c4d5b4211aab`. Both coffee releases remain accepted through August 2026. A read-only check on October 13 using the existing duty builder found:

| Product | Duty countries observed | Comparable rolling share changes | Rolling increases / decreases | Comparable latest-month share changes |
| --- | ---: | ---: | ---: | ---: |
| Roasted coffee, 090121 | 95 | 40 | 20 / 20 | 45 |
| Green coffee, 090111 | 91 | 32 | 12 / 19 | 32 |

Of the comparable rolling records, 25 roasted and 20 green records have an RP70/79 qualification in at least one period. This makes visible coverage qualifications essential. These counts are planning observations from existing accepted data, not a new source audit or release acceptance. Green's rolling set includes one unchanged share comparison.

The [official calendar](https://www.census.gov/foreign-trade/schedule.html), checked October 13, schedules September 2026 for November 4 at 8:30 a.m. Eastern. This batch uses existing releases and does not wait for or attempt that import. The [Census definitions](https://www.census.gov/foreign-trade/guide/sec2.html) describe calculated duties as estimates that may differ from amounts paid and omit antidumping/countervailing duties. [RP70 and RP79](https://www.census.gov/foreign-trade/reference/rpcodes.html) carry dutiable value without a calculated duty.

## Visitor flow

Add `/changes/duties/` for the roasted default and `/changes/duties/090111/` for green coffee. Static product links come from the published registry with accepted duties; fixture mode uses its existing synthetic registry rather than hardcoded real codes.

Heading: **Estimated-duty changes**. State **U.S. imports only**, the selected product/source description and reporting month. Controls:

- **Comparison period:** Rolling twelve months (default), or Latest month versus the same month last year.
- **Rank estimated-duty changes by:** Share change in percentage points (default), or Dollar change.

Show up to ten increases and ten decreases, current/prior calculated-duty dollars, current/prior consumption values and duty shares, duty-dollar change/growth, share change, and qualified coverage. A horizontally scrollable table may be used on mobile, with a keyboard-accessible region. Period labels and the denominator stay visible; detailed qualification text may sit below each country's figures. Count unavailable comparisons, unchanged values and comparable records even when only ten per movement are shown.

The official world duty/consumption comparison is a separate summary from the same periods; it is not a sum of the displayed countries. A missing world summary does not withhold a valid independent country comparison. No export duty view, combined product total, averaged rate, shipment calculator or new chart is included.

Link to matching product/country research with Imports, twelve-month history and the matching merchandise comparison period. If a duty country lacks merchandise history, link to the unfiltered product profile and state that limitation instead of presenting a country-specific chart link as available.

Add discovery links from the profile's existing estimated-duty section and the Imports view of each existing country-changes page. Product switching starts with rolling/share defaults. Existing merchandise/portfolio flows keep their meaning.

## Data and ranking contract

Reuse `buildDutyView` and the accepted release's embedded classification intervals. Build country comparisons in groups of at most three, respecting its existing API. World data uses its existing separate world call. Do not widen that API, reprocess source observations, alter acceptance flags, or refactor the importer/archive pipeline.

- Monthly compares the reporting month with the month twelve months earlier.
- Rolling compares twelve consecutive current months with the preceding twelve months. At August 2026 these are September 2025–August 2026 and September 2024–August 2025.
- A share is `100 × CAL_DUT_MO sum / CON_VAL_MO sum` for that country/product/period. Never use GEN_VAL_MO, world trade or an average of monthly percentages.
- Dollar eligibility requires the existing comparison's complete amounts, verified reporting coverage and compatible classification span. Share eligibility additionally requires positive consumption denominators in both periods.
- A reported zero duty remains zero. A zero prior duty has no growth percentage; a zero denominator has no share. Missing/suppressed amounts and coverage remain unavailable.
- Complete, verified but positive RP70/79 affected values qualify reported comparisons; include them with explicit current/prior affected dollars and shares of DUT_VAL_MO. Do not treat them as complete assessments of duties paid or silently exclude all qualified records.
- Rank dollar differences as exact integers. Rank share differences as exact rational fractions using BigInt cross-products of safe integer amounts. Choose sign/ties before floating-point display conversion; tie by English country name, then code. Do not clamp a reported ratio above 100%.
- Exclusion reasons are mutually exclusive in this order: incompatible classification span, incomplete amounts, unavailable coverage, and (share ranking only) zero/missing denominator. Count each unavailable country once. A schema-one release gives a clearly unavailable dataset, without fictional country rows.

Build-time preparation keeps only the union of displayed countries for the two metrics in each period, plus ranking code references, world summaries/counts and provenance. No raw observations, monthly histories, all-country source arrays or browser Census requests enter the page. Selection reads prepared values; it does not recompute duty arithmetic.

## Links, CSV and qualifications

Saved parameters are `direction=imports`, `period=rolling|monthly` and `metric=share|dollars`. Missing values use defaults; duplicate known parameters, invalid values, `direction=exports`, or query strings over 2,048 characters fall back together with an explanation. Unknown tracking parameters may be ignored and are omitted from copied links. User edits create history entries; Back/Forward restores controls, rankings and CSV together. Guard stale clipboard results and offer a selectable manual fallback. Links reopen the latest accepted release, rather than freezing a past one.

CSV contains exactly the displayed increase/decrease rows, with rank/movement, product/country identity, reporting month, period type and both period bounds, current/prior CAL/CON/DUT values and statuses, shares/changes, completeness/classification flags, RP coverage/affected values/qualifications, exact measures/units, retrieval date, processing version, duty revisions and source URLs. Unavailable values are blank; numeric negatives and formula-like text follow existing escaping. Country statuses come from that country's comparison, independently of world status. Include ranking/exclusion counts so exported subsets are identifiable.

The source/definition panel states that these are estimated duties, that import mix and reporting coverage can affect the comparison, that reported zero does not establish duty-free treatment, and that these figures do not calculate an importer's shipment liability. Sources include the accepted endpoint URLs and the shared Methods definitions.

Without JavaScript, each product's default rolling/share tables and provenance remain readable. Explain that changing filters, restoring saved filters, copying links and generating CSV require JavaScript; those controls start disabled until hydration. Browser print remains available, but no new PDF/print-report feature is part of this batch.

## Delivery and success

Use the existing Astro/React/TypeScript stack, Node 24 and installed dependencies. Preserve accepted dataset/pointer/archive bytes, old CSV outputs, Canada component/data qualifications, all existing routes, noindex/nofollow and the Free static hosting arrangement. Canada remains the fixed September 2024–August 2026 snapshot.

After meaningful unit/UI/browser tests and a real retained-data audit, obtain one fresh independent whole-branch review, fix important findings, run exact-head CI and merge. Stage the actual merged source with the same seven accepted state files, measure count/total/largest, and authenticate the upload manifest/ZIP without private/raw/fixture/secret/source-map/function content.

Publish to the existing `us-trade-tracker` Pages project only after verification; check canonical/deployment hashes, headers/private 404s and real controls/downloads, plus current portfolio and Canada/product regressions. If the new deployment regresses, automatically restore the prior verified site, verify restoration, repair the change and re-verify. Preserve local evidence and the final release record. Stop after this batch; no later milestone is implied.

The general planning alert remains 15,000 files. The current [dashboard upload method](https://developers.cloudflare.com/pages/get-started/direct-upload/) has a 1,000-file limit and 25 MiB per asset (26,214,400 bytes); those stricter method bounds are preflight gates. [Pages Free's general limit](https://developers.cloudflare.com/pages/platform/limits/) is 20,000 files. Exceeding a bound does not authorize a new delivery system.

## Permission envelope for the one review

Approval of the full package authorizes root implementation and routine in-scope fixes; local tests/browser previews, source/data reading and bounded backups; reviewer subagents; GitHub commits/pushes/PRs/CI and reviewed merges; publication of the verified feature and existing pilot to the current Free `us-trade-tracker` Pages project; live checks; automatic restoration of its exact prior verified package on regression; and documentation/evidence closeout. Root implements, with a fresh whole-branch reviewer, preserving the previously chosen execution method. No per-task, PR-merge or routine deployment permission question is needed within this envelope.

Approval may instead cover local Tasks 1–4 only, including reviewed merge; then public Task 5 is deferred. Local-only approval must not be treated as public-upload approval.

Excluded: new products/countries/reporting months; live Census imports or audit dispatches; accepted release/pointer replacement or promotion; any R2 operation; recurring jobs/reminders or Canada refresh; accounts/login credentials/domains/access-policy/indexing changes; paid services, purchases or intentional additional charges; signup/email/outreach/ads/analytics/billing; destructive operations or deletion of accepted evidence.

Pause only for material new scope, expired required sign-in, unexpected terms/charges, an integrity failure that cannot be resolved within the approved work, or unexpected production/concurrent changes that make publication/restoration unsafe. Continue unaffected local work. Existing production reference: deployment `713cf8e5-4894-4083-ba77-be2b534bcc4d`, with receipt `docs/validation/coffee-portfolio-publication.json`; recheck it immediately before upload. The prior verified ZIP is locally preserved in `data/backups/coffee-portfolio-briefing/deployment-20261013-r1/site.zip`. No date-triggered or background continuation is authorized.
