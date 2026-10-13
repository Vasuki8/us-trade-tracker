# Canada publication readiness design

Prepared October 13, 2026 against `b5456adb9c93743bb5514d305c911da565456b71`. **Proposed for owner review.** The owner's latest “continue” follows the recommendation to prepare publication readiness. This stage covers the design; it does not authorize a public deployment, account configuration, new data collection or implementation.

## Purpose and recommendation

Prepare a small public pilot where visitors can research the accepted Canada snapshot alongside the two reviewed coffee products. Canada remains a historical September 2024–August 2026 collection. Visitors must be able to distinguish its reporting coverage, capture time, local acceptance and actual website publication.

The next implementation milestone should prepare and verify the Canada page **locally**, with public-facing wording and navigation, while leaving ordinary builds unchanged unless explicitly opted in. A subsequent hosting decision can authorize publishing an exact verified static artifact. Continuing Canada data into later months is a separate source and acceptance project.

| Approach | Benefit | Cost or limitation | Decision |
| --- | --- | --- | --- |
| Prepare the fixed snapshot for a bounded public pilot | Reuses the accepted data, working profile and completed preservation | Historical coverage must remain prominent; deployment needs its own decision | Recommend |
| Keep the entire pilot local until the next official release | Allows a live refresh check before any exposure | Delays user feedback, although the launch brief permits an initial pilot before that check | Available if the owner prefers |
| Extend Canada into a monthly publishing pipeline first | Could eventually support current country research | Requires a new source investigation, classification scope and successor acceptance contract | Defer |

## Initial publication and full acceptance

The [launch brief](2026-10-08-us-trade-tracker-design.md#validation-and-launch-sequence) says that a second release is necessary to verify ongoing publishing, **even if the initial pilot is already public**. An initial public pilot and full first-release acceptance therefore have separate gates. Earlier summaries that treated two successive releases as an absolute prerequisite to initial publication were too restrictive. This distinction grants no deployment permission by itself.

| Gate | Required evidence | Present status |
| --- | --- | --- |
| Accepted fixed Canada data | Authenticated local selection, qualified comparisons, preserved source collection and exact accepted recovery | Complete for this snapshot |
| Prepared public presentation | Verified route, truthful coverage, navigation, CSVs, build boundary and static artifact | Not implemented |
| Initial public pilot | Owner selects the hosting target and exact artifact; successful deployment and live verification are recorded | Not authorized or deployed |
| Full acceptance of recurring publication | Successful updates across two successive official releases, with validated sources, revisions, backup, recovery and hosted values | Open |

The [Census FT900 calendar](https://www.census.gov/foreign-trade/schedule.html), checked October 13, 2026, schedules September 2026 for **November 4, 2026 at 8:30 a.m. Eastern**. October 2026 is scheduled for December 8. These are publication schedules, not proof of API availability or accepted website updates. The existing coffee pipeline can provide the bounded August-to-September software path once the new official data and classification evidence are available; synthetic transitions do not close the live gate. See [monthly-refresh readiness](../../validation/monthly-refresh-readiness.md).

Canada's current policy accepts only the fixed 24-month snapshot. A successful coffee refresh does not prove Canada refresh capability. A pilot can retain Canada as explicitly historical research; if the owner wants a claim of monthly Canada updates, Canada needs a separately designed and verified successor pipeline before that claim or its acceptance gate can pass.

## Existing evidence to reuse

The [accepted local profile](../../validation/canada-accepted-local-preview.md), [private archive](../../validation/canada-private-archive.md) and [recovered-profile rehearsal](../../validation/canada-recovered-profile-rebuild.md) establish the starting state. They need no repeated raw download, classification review or 7.94 GB archive scan merely to approve this design.

The selected projection is **33,716 bytes**, SHA-256 `33c7db7ec421bddaa13e36c3b2e32cd4558aa041fe17f2f3da01285b62b08fd0`. Its selected pointer is **466 bytes**, SHA-256 `9ede6a6906b0da7f85e74203d186bee7f6a8e08e37f452fb9f5a99e88e10a399`. The [archive evidence](../../data-validation/1220-private-archive-evidence.json) records all 766 preserved source files and two full remote recoveries. Compact accepted state has also rebuilt the profile without the original research folders.

Preserve both directions, all 48 monthly values, the 20 selected categories, 17 ordinary qualified comparisons and three statistical exclusions. Each saved reference grid retains 41 matches and seven mismatches; original-publication checks retain seven matches and 41 unreviewed contexts. Same-archive denominators, unknown observation revision dates, previous-review verification and historical failed audits remain qualified. No comparison becomes available solely because a page becomes public.

The latest measured accepted local build has **22 files / 1,179,796 uncompressed bytes**; its largest asset is the roasted-coffee HTML, **283,166 bytes**. These are existing measurements, not measurements of the proposed public build. The ordinary real-data build has 21 files and excludes both Canada previews.

## Local preparation milestone

Prepare `/countries/1220/` as the single proposed country entry point. Reuse the authenticated selected-release reader and bounded research projection; add no generic country catalog or new source loader. The new opt-in configuration must default to omission before private reads, reject invalid modes and fail on missing, changed or incompatible selected state without a fixture fallback. An explicit synthetic mode exists only for isolated checks and stays visibly synthetic. The implementation plan must fix its exact configuration and interfaces before coding.

The page presents **Canada historical snapshot**, September 2024–August 2026, with a concise explanation that it is a captured collection. Preserve Imports/Exports, monthly history and table, selected categories and qualified changes, readable UTC dates, reference differences and source disclosures. Avoid “latest Canada data,” exhaustive top-ten claims or monthly refresh promises. Local acceptance remains distinct from publication; building the page is not a deployment receipt.

In the opted-in build, add one Canada entry to the homepage and a direct country-research navigation link. Methods gains a short Canada snapshot section describing coverage, measures, same-archive shares and revision qualifications. Ordinary builds retain their current pages and navigation. A country directory, search, broader rankings, saved views, PNG export and Canada duties remain outside this milestone.

Use a separate presentation context for the prepared pilot page. Keep existing assessment and accepted-local routes, banners and CSV bytes unchanged. The four pilot CSVs must reproduce the same numbers, periods, unavailable blanks and original provenance, while identifying the accepted snapshot and pilot presentation. Their context must not claim a confirmed deployment. Actual publication URL/time/status belongs to the later deployment record; a local build and noindex metadata cannot establish publication or access control. New presentation metadata may change pilot CSV hashes and must receive independent checks; it must not rewrite the immutable projection.

Keep the prepared route `noindex,nofollow` in the local preparation milestone. The later deployment decision must state whether the pilot stays excluded from indexing or permits indexing; noindex is not privacy. The current private preview routes must be absent from the proposed deployment artifact, even when the prepared pilot route is enabled. A malformed or crossed combination of modes must fail rather than exporting a private preview.

## Static delivery recommendation

Keep pages and chart data together on static hosting, downloads generated in the browser and R2 private. Recommend a **prebuilt Cloudflare Pages Direct Upload** artifact for the first pilot. The current GitHub code-check workflow deliberately builds fixtures, and ignored accepted datasets are absent from a fresh checkout. Connecting that ordinary build directly to production would not produce the verified real-data pilot.

[Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) supports prebuilt assets. A Direct Upload project cannot later switch to Git integration without a new project. This is a hosting choice for owner review, not an instruction to create a project now. At deployment preparation, inspect the actual account and reuse a suitable existing target where possible; do not assume that no project exists from the repository alone. Workers static assets remain an alternative if account evidence favors them; choosing one does not justify a backend rewrite.

Build from authenticated accepted state in a fresh contained staging workspace. Use the preserved compact Canada state and independently recovered accepted coffee releases; keep product and country namespaces separate. The same saved state may be reused for presentation builds when its identities still match. Neither a build nor a retry should trigger fresh Census imports, upload source archives or advance accepted pointers. Upload only the enumerated static output, with a file manifest binding paths, byte counts and hashes to the code commit and data identities. Keep source bodies, acceptance packages, approval evidence, credentials and private paths outside the upload directory.

The [Pages Free limits](https://developers.cloudflare.com/pages/platform/limits/), checked October 13, are **20,000 files** and **25 MiB per asset**. Direct Upload's dashboard drag-and-drop method has a lower **1,000-file** limit; Wrangler supports 20,000. Measure the actual chosen artifact, retain the existing 15,000-file planning alert and refuse deployment if the selected upload method's hard limits are exceeded. The current small build provides no reason to move ordinary chart data to public R2 or add paid hosting. Capacity and account usage must be checked at the actual operation; a free-plan recommendation is not a bill estimate.

No automatic deployment on merge belongs to this design. A later operational record must identify the chosen account/project, approved artifact manifest, code and release identities, deployment URL/time and live verification. Retain the previous approved static artifact for site rollback; rollback restores the site artifact and does not rewind data pointers or delete archives. Define a first-deployment withdrawal procedure when no prior site artifact exists. Do not mark a failed or uncertain upload as published without provider evidence and a matching live check.

## Verification for the local milestone

The implementation plan should cover four connected deliverables: the fixed opt-in adapter, pilot presentation/download context, conditional navigation/methods, and verified deployment-output boundary. Root implements, with one independent whole-branch reviewer under the owner's existing review preference.

Required checks are:

- Default builds omit the proposed route, its observations and country navigation; the isolated fixture has explicit synthetic provenance and no accepted identity. Missing, changed or crossed real state fails with no fallback or pointer write.
- Both directions agree across overview, all 24 monthly rows, ten selected categories, qualified comparisons and CSVs. Independent expectations preserve denominators, 17 eligible categories, three exclusions and reference counts.
- Pilot context does not claim confirmed publication. Existing four accepted-local CSV hashes and both prior preview presentations stay unchanged. Server-only record/package/path information never enters page props or deployment files.
- Homepage, navigation and Methods link to the enabled snapshot and expose its actual coverage. Mobile widths of 320/375 pixels, keyboard controls, disclosures and readable Imports without JavaScript pass. Switching and downloads keep their existing JavaScript requirement.
- The proposed deployment output contains the intended real products and Canada page, contains no private preview route or synthetic observations, and reports file count/total/largest asset against the intended hosting limits. Fixture output is never a deployable real-data artifact.
- One real local pilot build matches the selected projection and original numerical/provenance fields in all four downloaded CSVs. The projection, selected pointer, eleven protected files and original coffee states stay unchanged. Preserve the reviewed artifact manifest and exact-head check results privately.

Pure design changes need link, source, identity and scope checks; they do not require another full unit/browser/archive run. Runtime implementation will require relevant regressions, type checks, normal and opted-in browser checks, independent review and exact-head CI before merging. Deployment still requires its own concrete owner decision and live verification.

## Scope and handoff

Excluded: new Canada months or classifications, another country/product, country duties, broad catalog/rankings, accounts, signup or email delivery, billing, advertising, analytics installation, scheduled processing, permission changes, paid services, public R2, account/project creation and any deployment during this design or local preparation milestone.

Owner review of this written design decides whether to prepare the implementation plan for the **local public-pilot preparation milestone**. It does not select a hosting project or approve publication. The plan will name exact files/interfaces, failure checks and preserved identities. The owner retains the later decision to deploy an initial pilot before successive-release acceptance or wait for that evidence; no implementation check can make that strategic choice automatically.
