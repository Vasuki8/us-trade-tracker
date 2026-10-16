# Pilot Validation Checkpoint Design and Three-Task Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root prepares the materials and numerical evidence; independent subagents may audit inputs and one fresh reviewer assesses the whole immutable branch before integration. Track steps with checkbox (`- [ ]`) syntax. This is a documentation and research-preparation batch, with no application implementation or website publication.

**Goal:** Give the owner a small, usable kit for observing whether the existing pilot helps prospective users complete recurring trade-research tasks, and a checked sample briefing they can discuss.

**Architecture:** Reuse the current public routes, accepted coffee observations, fixed Canada snapshot and verified site package. Produce generic research documents in the repository and retain answer keys/calculations privately. Actual participant observations determine later development; preparation alone establishes neither demand nor willingness to pay.

**Tech Stack:** Markdown, existing Node 24/Python and existing browser tooling only. No new dependency, service, data model or runtime feature.

**Spec:** This combined bounded design and the Audience, Revenue strategy, and Validation and launch sequence sections of `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md`. The user requested one reviewable plan containing the next tasks and all execution permissions. That request overrides the usual separate design/plan handoffs. This document authorizes planning only until approved.

## Assessment and recommendation

PR #110 is complete on main **7d712d63a755ab5426c64b81392220fc2fc43dcd**. Its deployment, actual archive, checkout/cache absence and final readback are recorded under `data/backups/briefing-duty-research-links/deployment-20261015-r1`. The committed local checkpoint's pending wording is historical, not unfinished implementation.

Two independent read-only audits found no demonstrated missing reader flow or release-tooling blocker that merits another feature batch. Product discovery, country comparisons, monthly/rolling changes, duty research, briefings, sharing and downloads already exist. Committed successor selection and exact candidate backup/recovery/promotion are implemented. This is a bounded preparation step within the brief's original validation sequence, not a new subsystem.

Recommend validating usefulness before choosing another feature. More UI now has no observed task failure behind it; another readiness tool would duplicate existing capabilities. Waiting entirely for the next official release would leave useful research time unused. Preparing these materials is proportionate, but the owner must still obtain real observations.

The [Census FT900 calendar](https://www.census.gov/foreign-trade/schedule.html), checked October 15, 2026, schedules September 2026 for **November 4, 2026 at 8:30 a.m. Eastern**. That schedule is not proof of API coverage. The separate successive-official-release acceptance gate remains open. This batch adds no timer, reminder, polling or later automatic execution.

## Design and deliverables

Create `docs/research/pilot-task-study.md`: an approximately 20–30 minute owner-run session guide, a blank observation scorecard and a decision rubric. Start with a recent task the participant actually performed, their existing alternative and whether the pilot's coverage fits. If their product is absent, record a coverage limitation; do not call it a usability failure or authorize intake.

Use four task prompts, adjusted for the participant's role. The participant-facing prompts state goals without naming buttons or supplying answers:

1. Confirm the roasted or green coffee classification and find the relevant U.S. sourcing or export comparison, identifying the direction and period.
2. Investigate which partner countries gained or lost share, distinguishing the latest month from rolling twelve months and identifying the matching world denominator.
3. For an import-relevant task, explain an estimated-duty change using duties, consumption value, the comparison period and reporting qualifications. Record this task as not relevant for an export-only participant. Do not frame the result as shipment liability or proof of a tariff change.
4. Save/share/download a finding for another person and explain what that person can restore. Offer the fixed Canada snapshot as an optional country-research branch; require recognition of its historical coverage rather than implying monthly refresh.

The scorecard fields are: anonymous session ID, role, pilot fit, recent task, existing alternative, task ID, outcome (`completed`, `completed with help`, `not completed`, `not relevant`), assistance given, observed confusion, period/measure/source interpretation, shared/downloaded result, recurrence, consequence of error and follow-up question. Time is optional and descriptive; do not invent a speed benchmark or representative conversion rate. Separate observations, participant statements and owner interpretation.

The rubric distinguishes a reproducible correctness/accessibility failure, a navigation or interpretation difficulty, a coverage limitation and an untested feature request. It produces a ranked evidence list and the next decision, not an automatic development backlog. Actual numerical errors or data-quality concerns receive priority over convenience requests. A few exploratory sessions are not statistical demand validation; the original broader interview objective remains unchanged.

Create `docs/research/coffee-sample-briefing.md`: a concise, clearly labeled example using only the existing August 2026 coffee releases. Include the two products' own latest-month import/export comparisons, one rolling country-change lead per relevant direction and a qualified world estimated-duty comparison. Every figure carries its product, period, measure, source/retrieval identity and supporting existing route. Keep products separate; no combined total or averaged duty share. Do not invent commercial conclusions, future prices, supplier identities or willingness to pay.

Keep a facilitator answer key and calculation receipt in ignored private proof. Public repository materials contain generic prompts and the sourced example, never real participant notes, contact details or recordings. The owner conducts/recruits sessions separately and can later provide anonymized observations. Their availability is an external dependency, not an approval the agent can infer or fabricate.

## Global constraints and permissions

Approval covers all three tasks without routine permission pauses:

1. Root execution; independent input-audit and final reviewer subagents; managed worktree creation/reuse and scoped runtime permissions; the existing locked runtime. Use one fresh whole-branch review. No implementer/reviewer pair per document.
2. Read-only authentication of the previous completed proof and the same seven accepted/eleven protected identities. Read only required processed releases, metadata and retained verification records, with no raw archive/source replay. At most one private copy of the seven accepted files, totaling at most 16 MiB, only if isolation requires it. Do not modify originals or historical proof.
3. Generate private answer keys, independent calculations, link inventories and representative screenshots under ignored `data/backups/pilot-validation-checkpoint/preparation-20261015-r1`, at most **300 files/32 MiB**. Authenticate inputs before/after. Preserve the original approved plan bytes/hash before editing execution checkboxes.
4. Read/serve the already verified site package on one exclusive owned loopback preview if needed for material checking; block outside requests and stop only that preview. No new retained build is required for documentation. A maximum of twelve named route/selection walkthroughs and four screenshots is sufficient; these are author verification, not participant research. Existing accepted calculations and serializers remain unchanged.
5. Commits, pushes, one PR containing the generic research materials, sourced example and factual documentation corrections to the existing **public** `Vasuki8/us-trade-tracker` repository; PR attachment/update; existing Code checks; expected-head merge after independent review and successful exact-final-head push/PR checks under standing merge permission; clean-main binding. No separate bookkeeping-only PR. Do not repeat the full local application suite for documentation-only changes; use numerical/link/document checks and the existing configured CI.
6. Preserve useful proof, native worktree archive with actual archived attachment and exact checkout absence, completed ledger/log preservation, removal of only this plan's authenticated caches, and final clean-main/readback. Initialize the primary plan marker independently rather than copying the worktree's absolute marker. Queued operations stay pending until confirmed.
7. Check attachment capacity before worktree/PR/archive. If necessary, preserve identities/URLs and verify merged status before unlinking up to **two obsolete merged standalone PR chat attachments**. Actual GitHub PRs remain intact; do not unlink nested archived-worktree records.

Excluded: outreach or recruitment, messages to prospective users, interviews conducted on the owner's behalf, collecting real participant notes/recordings/contact data, analytics or tracking, paid recruiting, pricing/billing/accounts, new UI/code features or bug fixes, imports/Census API requests, candidate workflow dispatch or promotion, data/selection replacement or intake, raw replay, R2 reads/writes, Canada refresh, site upload/restoration, access/indexing changes, new dependencies/services and recurring jobs. Generic GitHub research documents are the only publication authorized here. Later observed fixes and real September acceptance need their own concrete scope; this batch does not preauthorize unknown changes.

Pause only dependent work for unexplained input/source drift, integrity failure, unavailable required evidence or a new material cost/access boundary. Complete unaffected preparation. If the existing data cannot support a proposed example, omit that example and record why rather than weaken its qualifications or fetch replacement data.

## Baseline and review focus

Authenticate the previous preservation manifest SHA256 `57e64ad4ad41b9767e09bae6478179900e12b75d549f12c9cab71aa2f683e79f`, finalization SHA256 `c7be72f8c33bbe482d3dd64be1694fa42201db9fa8585a544057f68661912747` and final-readback SHA256 `0ede92b86c84a7f91ecc7b79846d69502944f40f9bb314c9145610a2b4b9303a`. Follow their authenticated references to input identities. Do not derive trusted pins from whichever files happen to be present.

The existing published package has **31 entries/1,886,967 raw bytes**, source `d4695cba3ffa19be13eb6d28dd86314ec8be5584`, ZIP SHA256 `ef971ea96a86c8baa7092b50df0aeb1a4e9aecac8eb17d19e306e7a2efcbabba`, manifest SHA256 `b52340cfb95b1bdc54bd201cbf60caf6131f190b37b77eedb9729da26d915482`. Root implementation and reviewed main must have no application/runtime delta from planning main. No deployment package is created in this batch.

Review deliberately:

1. Prompts must not disclose answers, imply the participant needs the feature, or treat coffee coverage as evidence about the broader catalog. Task 1.
2. Expected answers and examples must preserve product/direction/month/measure identity, missing versus zero, weighted duty denominators and RP70/79 qualifications. Task 2.
3. Historical Canada, saved latest-release views and shipment-duty limitations must remain explicit; no false automatic refresh or immutable-share claim. Tasks 1–2.
4. Rehearsals, blank scorecards and example output must never become fabricated participant findings, demand evidence, completion rates or willingness-to-pay claims. Tasks 1–3.
5. Public materials must exclude participant/private state, runtime/data remain unchanged, and completion must follow actual archive, preserved logs, cache absence and clean main. Task 3.

## Task 1: Prepare the task study and observation rubric

**Files:** Create `docs/research/pilot-task-study.md`. Private artifacts: input receipt, route inventory and facilitator answer-key outline under this batch's proof directory.

**Interfaces:** Consume the four task definitions, scorecard fields and existing routes above. Produce the participant prompts, facilitator-only guidance, blank scorecard and evidence-to-decision rubric. No application function/interface changes.

- [x] Authenticate the baseline completion and inputs, preserve the approved proposal, and record the isolated source/base. Expected: exact identities, actual prior completion and no source/data drift.
- [x] Write the four goal-based prompts and a separate facilitator section. Include role/pilot-fit screening, assistance recording and the optional Canada branch. Expected: no named-control hints in participant prompts and no assumption that every task matters to every participant.
- [x] Add the scorecard's exact fields/outcomes and decision rubric. Add illustrative records labeled **fictional formatting example** only if a blank template is otherwise ambiguous; never report them as observations.
- [x] Inspect the named routes in the authenticated retained package, optionally using the bounded loopback preview. Record whether each prompt is achievable within the current coverage. Expected: correct routes, direction/period restoration and honest static defaults, with no outside requests or data changes.
- [x] Review against focus points 1, 3 and 4, record limitations, and commit the generic study document. Verification is a private checklist/link receipt; no new product tests or runtime edits.

## Task 2: Prepare and independently check the sample briefing

**Files:** Create `docs/research/coffee-sample-briefing.md`. Private artifacts: facilitator answer key and numerical/source receipt; optional small calculation helper only in ignored proof.

**Interfaces:** Consume the authenticated accepted coffee releases and Task 1 task IDs. Produce a sourced example plus private expected-answer records with fields `taskId`, `productCode`, `direction`, `period`, `measure`, `value`, `sourceIdentity`, `supportingPath` and `qualification`. Use separate records for distinct measures and periods.

- [x] Define the example's bounded questions and reporting windows before calculating. Expected: latest month August 2026 versus August 2025; rolling September 2025–August 2026 versus September 2024–August 2025 where required; existing coffee product identities only.
- [x] Derive expected values directly from authenticated processed observations, independently of application calculators. Compute rolling duty shares as matching summed duties divided by summed consumption values. Preserve unavailable comparisons and reported zero; retain coverage/classification qualifications.
- [x] Compare the example's figures, country leads, periods and links against the existing prepared views/retained package. Expected: exact integer amounts and comparison identities; documented display rounding only. A genuine mismatch stops that example and becomes a concrete finding, not an authorized product fix.
- [x] Write the concise manual briefing with supporting paths, source/retrieval identity and interpretation limits. Keep answer keys private and products separate. Expected: no unsupported profitability, demand, tariff-cause, shipment-liability or combined-portfolio claim.
- [x] Run a private numerical/link/content verification against both documents, authenticate the seven/eleven identities again, and commit the sourced example. Preserve the compatibility limitation of the historical extra28 evidence; no fresh source audit is claimed.

## Task 3: Review, integrate and hand off the owner-run checkpoint

**Files:** Update README to link the research kit and correct the current PR110 public-status summary using authenticated completed evidence. Append a concise actual-completion reference to `docs/validation/briefing-duty-research-links.md`, preserving its historical local checkpoint. Update this plan's execution checkboxes. Private finalization contains actual integration/cleanup results.

**Interfaces:** Consume Tasks 1–2, private evidence and unchanged runtime/data identities. Produce reviewed repository materials, a short owner handoff and confirmed operational cleanup. Actual participant findings are not an output of this batch.

- [x] Self-review all five focus points and check that no factual statement claims sessions occurred. Correct current README metrics/status to the authenticated published 31-entry/1,886,967-byte package and PR110 completion; do not relabel the historical build source or reopen completed cleanup.
- [ ] Obtain one fresh whole-branch review of the immutable base/head, materials, answer-key checks and scope. Resolve material content/calculation issues; record deferred minors and rulings. Verify corrections directly. No application code fix is included.
- [ ] Push/create/attach the single PR. Require successful exact-final-head push/PR Code checks, then merge with expected-head protection and synchronize clean main. Prove no changes under `src/`, runtime scripts, deployment configuration/selection, classification inputs, dependencies or workflows.
- [ ] Give the owner the guide, sourced example and blank scorecard. Recommend a small first set of relevant volunteers as exploratory work within the original broader interview objective. Ask for anonymized observed failures and real task context when available; do not recruit/contact people or infer permission to do so.
- [ ] Stop any owned preview, preserve bounded proof and actual completed logs, confirm native archival/checkout absence, remove only owned plan caches and verify clean main. Record all three tasks complete only after these gates. Report that real-user validation and successive-release acceptance remain open.

## Self review and approval handoff

The three tasks produce usable research materials with a numerical check, rather than a speculative feature or another release subsystem. Each input/output is defined, review focus points have owning checks, and the permissions distinguish generic public materials from private answer keys and real participant information. There is no automatic fix, intake, promotion or deployment path hidden behind a research result.

After this batch, the next development decision should use observed task failures or the real September release. The owner must supply participant access/observations; the agent cannot substitute a browser rehearsal for people. The November 4 schedule can change and still requires publication/API/classification confirmation before a separately scoped live update.

Review this combined design and three-task permission envelope. Approval authorizes root execution with independent review and reviewed merges, without routine approval pauses, through actual proof/cleanup. It does not authorize the excluded follow-on work.

## Execution checkpoint

Tasks 1–2 and the local documentation self-review are complete at this committed checkpoint. Remaining Task 3 operational boxes are intentionally pending here. Actual independent review, CI, merge, archive, completed logs, cache absence and clean-main results will be preserved in this batch’s private finalization and the single implementation PR description; this avoids a second bookkeeping-only PR. No participant sessions or website deployment are claimed.
