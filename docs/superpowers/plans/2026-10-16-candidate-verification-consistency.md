# Candidate Verification Consistency Design and Three-Task Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root implements the three tasks; one fresh independent reviewer assesses the immutable branch before integration. Track steps with checkbox (`- [ ]`) syntax. This is a small existing-pipeline reliability batch, not a new release system or reader feature.

**Goal:** Make offline candidate verification reject a candidate/bundle identity mismatch before it creates recovered data.

**Architecture:** Share the local identity checks already used by promotion with the existing offline `verify` path. Keep bare-bundle `recover`, archive formats, workflow gates and remote promotion behavior unchanged. Use synthetic fixtures and existing tests; no official source or R2 operation is needed.

**Tech Stack:** Existing locked Node 24, TypeScript and Vitest; existing Python for private evidence and configured GitHub Code checks. No new dependency or service.

**Spec:** This combined bounded design and the pipeline/archive-recovery requirements in `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md`. The owner requested the next tasks and complete permissions together for review, overriding separate design/plan handoffs. This proposal authorizes planning only until approved.

## Assessment and alternatives

PR #111 completed the owner-run study guide, blank scorecard and checked coffee example. Main is **7966baa58d61d468426aed61faedfbb238b314b4**. Actual completion is authenticated under `data/backups/pilot-validation-checkpoint/preparation-20261015-r1`: preservation manifest SHA256 `61a779a8a36a030f2abc9cd7a3e8bb6b8ecf0ec87f29e9304fda6ef7c68067e3`, post-finalization SHA256 `8556a3bdbee80bd992fc5d344ca71c1aeb826161d7dddb76f3ac95a4b24b69ae`, final-readback SHA256 `6c95b367ff52052bf2b30e3d962854984ca080463426ab5e163851c205684f3a`. No participant observations have been supplied.

Independent reader inspection found no demonstrated new UI gap worth a feature batch. A separate operational inspection identified a small consistency gap in `scripts/archive-product.ts`: `verify` parses candidate state but passes only its checksum to `recoverBundle`. It does not bind the bundle's release identity and previous reference to the candidate. `promoteCandidate` in `scripts/archive-release.ts` already enforces those checks and rejects such mismatches safely.

For example, a candidate whose baseline-reference checksum has been replaced by another syntactically valid checksum can pass offline recovery and create a local pointer, yet fail later promotion. Similarly, a valid same-month candidate key can name a different release from the actual bundle. Existing changed-baseline tests exercise promotion, not offline `verify`. This is additional consistency checking, not an unfinished promise from the previous milestone or an urgent release blocker.

Recommend this compact fix while the owner gathers observations. Alternatives are to leave verification's narrower behavior documented, since promotion already protects acceptance, or to add another reader feature. The first leaves avoidable disagreement between the local gates; the second lacks user evidence. Do not enlarge this into another readiness tool. Real-user observations and successful updates across successive official releases remain higher-level open requirements.

## Bounded design and interfaces

In `scripts/archive-release.ts`, add `decodeCandidateBundle(bytes:Buffer, candidate:ArchiveCandidate, expectedProductCode:string=DEFAULT_PRODUCT_CODE):DecodedBundle`. Normalize candidate state through the existing parser, unpack with its expected checksum/product, enforce the existing bundle-key/release identity check, and require `manifest.previous` to match `candidate.run.baseline?.reference ?? null` using the existing promotion comparison semantics. This helper performs no IO.

Replace only the corresponding local unpack/identity/baseline checks inside `promoteCandidate` with that helper. Keep backup-receipt validation order, remote identical-byte readback, original ETag/initialization conditions, conflict handling and outcome persistence unchanged.

Add `recoverCandidate(bundlePath:string, candidate:ArchiveCandidate, dataDir:string, expectedProductCode:string=DEFAULT_PRODUCT_CODE):Promise<{releaseFile:string}>`. Read once within `LIMITS.bundle`, decode and bind the candidate before calling the existing `restoreDecoded`. Route CLI `verify` through this function after its existing bounded state parse. Keep its options and successful result shape. Bare `recoverBundle` and CLI `recover` continue to accept an independently supplied bundle checksum with no candidate requirement.

This checks agreement between supplied local files. It does not authenticate an artifact receipt, prove the candidate's source data correct, establish that its saved ETag is still current, or authorize promotion. A matching pair remains subject to the existing source validation, artifact receipt, remote readback and conditional promotion gates. There is no way to verify remote freshness offline.

## Global constraints and permission envelope

Approval covers all three tasks without routine approval pauses:

1. Root implementation, read-only audit/reviewer subagents, one fresh whole-branch review, managed worktree creation/reuse, named branch/commits and scoped runtime/filesystem/network escalations necessary for the listed operations. Use the existing locked Node 24/Python runtime and `npm ci --ignore-scripts`; no dependency/lockfile change.
2. Read-only authentication of the completed PR111 proof and its linked seven accepted/eleven protected input identities before/after. No accepted-data copy is required. Tests may create synthetic source records/bundles in isolated owned temporary directories and clean up only their own outputs. Do not replay retained official raw responses or change canonical data.
3. Private logs, approved-original-plan bytes/hash, review package, numerical/file-identity receipts and completed-task evidence under ignored `data/backups/candidate-verification-consistency/verification-20261016-r1`, at most **500 files/32 MiB**. Preserve originals and historical proof.
4. Local focused archive tests, one final full unit run and type checks; existing normal push/PR Code checks. No local website package, browser preview or live-site verification is required because application output does not change. Tests must use injected synthetic fetch/store implementations; provider-construction spies must remain zero for offline paths.
5. GitHub pushes, one public implementation PR including code/tests/local validation documentation, PR attachment/update, successful exact-final-head push and PR Code checks, expected-head reviewed merge under standing merge permission, and clean-main synchronization. No separate bookkeeping-only PR. Normal CI may run its existing fixture build/browser suite; no import/archive workflow dispatch.
6. Check attachment capacity before worktree/PR/archive, reserving three spare slots at start. If needed, preserve attachment identity/URL and confirm merged status before unlinking at most **two obsolete merged standalone PR chat attachments**. Do not alter actual GitHub PRs or nested archived-worktree attachments.
7. Preserve completed logs and useful proof, native worktree archive with actual archived attachment and exact checkout absence, independent primary plan marker, cleanup of only this plan's authenticated caches, and final clean-main/readback. Queued operations stay pending until confirmed. Record full batch completion only after actual cleanup.

Excluded: new UI features or application edits; imports/Census API/source requests; retained official raw replay; candidate workflow dispatch/staging/promotion; accepted-data, pointer, classification or site-selection replacement; new products/countries/months; R2 reads/writes; deployment/restoration/live-site requests; workflow/trigger/secret/permission changes; archive/state schema or CLI option changes; new dependencies/services; paid/access/indexing changes; analytics, outreach/participant-data collection and recurring jobs. The existing R2 capacity permission is not needed for this batch.

Pause only dependent work for unexplained input drift, integrity failure, unavailable required evidence or a new material cost/access boundary. Complete unaffected work. A genuine issue outside these exact functions/tests is a finding for separate scope, not permission for a broader fix.

## Review focus

1. Same-month but different candidate release key must fail before any recovered file or pointer is created. Tasks 1–2.
2. A changed, missing or unexpected baseline reference must fail even when the bundle checksum remains correct; an unverifiable remote ETag must never be described as verified offline. Tasks 1–2.
3. Valid legacy roasted states, version 1/2 bundles, another synthetic product, and null-baseline initialization must retain their existing meaning; bare recovery must stay compatible. Tasks 1–2.
4. Offline verify must construct no provider and preserve occupied destinations, accepted pointers and downloaded candidate/bundle bytes; failed checks must have no recovery-write side effects. Task 2.
5. Promotion receipt ordering, conditional writes and unknown/conflict outcomes must remain unchanged; no source/R2/publication operation or completion claim may slip into testing/closeout. Tasks 1–3.

## Task 1: Share the existing candidate/bundle identity checks

**Files:** Modify `scripts/archive-release.ts`, `tests/scripts/archive-release.test.ts` and `tests/scripts/product-archive-release.test.ts`. Use existing synthetic helpers; adjust a helper only when the owning tests need a reusable synthetic variant.

**Interfaces:** Consumes existing `ArchiveCandidate`, `DecodedBundle`, `parseCandidateState`, `unpackBundle`, `verifyIdentity` and promotion semantics. Produces `decodeCandidateBundle` above, with no IO. Promotion continues to return the existing `PromotionOutcome`.

- [x] Authenticate the prior completion/input pins, preserve the proposal hash, establish the native isolated worktree and ledger, and run the existing focused archive baseline. Expected: exact input identities, clean base and existing tests pass.
- [x] Add direct decoder tests for a valid baseline-aware pair and null-baseline pair, unchanged hash with a different same-month candidate key, changed baseline checksum/reference, non-null-to-null and null-to-non-null baseline mismatches, wrong product, malformed state and checksum corruption. Expected initially FAIL because the helper is absent; failed decoding performs no IO.
- [x] Implement the helper and use it for only promotion's existing local checks. Retain original remote gates/order/outcomes. Expected: new helper cases pass and existing receipt, stale ETag, lost response, conflict, readback and outcome-write-failure tests pass unchanged.
- [x] Run `npm test -- tests/scripts/archive-release.test.ts tests/scripts/product-archive-release.test.ts --maxWorkers=2`; inspect outputs, mark the task complete only on PASS and commit.

## Task 2: Enforce identity before offline recovery writes

**Files:** Modify `scripts/archive-release.ts`, `scripts/archive-product.ts`, `tests/scripts/archive-workflow.test.ts` and `tests/scripts/duty-archive.test.ts`; use `tests/helpers/archive.ts`, `tests/helpers/product-data.ts` and `tests/helpers/duties.ts` for synthetic inputs.

**Interfaces:** Consumes Task 1's decoder. Produces `recoverCandidate` and routes existing CLI `verify` through it. Bare `recoverBundle`/`recover`, options and result shape stay unchanged.

- [ ] Add credential-free CLI regression cases for the same-month key and baseline-reference mismatches using an otherwise valid downloaded pair. Assert rejection, zero provider-factory calls, absent recovery destination/current pointer and unchanged original pair bytes. Expected initially FAIL: current verify accepts the inconsistent pair.
- [ ] Add `recoverCandidate`, then switch only verify's recovery call. All validation precedes `restoreDecoded`. Expected: mismatches reject before writes; valid pairs recover byte-identical release/raw fixture files and the expected pointer.
- [ ] Check legacy roasted state normalization, version 1 and duty-enabled version 2 bundles, null-baseline initialization and a second synthetic product using existing test fixtures. Keep reported zeros/missing data untouched. Preserve occupied-destination markers, source/accepted pointers and bare checksum recovery. Do not introduce real product intake or source-validity claims.
- [ ] Run `npm test -- tests/scripts/archive-workflow.test.ts tests/scripts/archive-release.test.ts tests/scripts/product-archive-release.test.ts tests/scripts/duty-archive.test.ts --maxWorkers=2`. Expected all cases pass, including unchanged workflow backup ordering/candidate-only/conditional-promotion contracts. Commit.

## Task 3: Verify, review, integrate and clean up

**Files:** Add `docs/validation/candidate-verification-consistency.md`; update README's tooling summary and this plan's execution checkboxes. Private finalization records actual integration/cleanup after the committed local checkpoint. No application or deployment-file changes.

**Interfaces:** Consumes Tasks 1–2 and exact before/after input pins. Produces one reviewed/CI-tested merge, a concise operator explanation and actual preserved completion evidence.

- [ ] Run `npm test -- --maxWorkers=2` once and `npm run check`. Expected full unit suite green and zero type diagnostics. Recheck seven/eleven original identities and tracked diff scope. Do not repeat local browser/package checks without a demonstrated dependency.
- [ ] Document what candidate verification now binds and what it cannot prove, its unchanged command usage, valid/invalid synthetic outcomes and unchanged promotion safeguards. Self-review all five focus points; no real import, accepted-source validation or remote verification is claimed.
- [ ] Obtain one fresh independent whole-branch review of exact base/head, plan/spec, tests and scope. Resolve material findings in one verified pass; record rulings/deferred minors. Push/create/attach one PR and require successful push/PR Code checks on its exact final head before expected-head merge.
- [ ] Synchronize clean main to the actual merge and bind its tree to the reviewed code. Preserve proof and actual completed logs, confirm native archive/checkout absence, remove only owned caches, and perform final readback. No site publication is required for this tooling change.
- [ ] Hand off the unchanged operator command and explain that a passed offline check is not remote acceptance or owner permission to promote. Real-user observations and successive-release acceptance remain open; choose later features from observed tasks rather than another speculative batch.

## Self-review and approval handoff

Spec coverage: the original archive-recovery requirement owns this small change; no reader or data-intake scope is added. Steps have named functions, owning tests and observable outcomes. Interfaces agree across tasks, and each review focus has an owning check. All validation uses synthetic inputs; hash-only reads protect existing accepted files. Permissions cover implementation through actual cleanup while excluding remote data/site operations. Three tasks are proportionate; no new readiness abstraction, workflow or package format is introduced.

Review this combined design and complete permission envelope. Full approval authorizes root execution with independent review and reviewed merge through actual cleanup, without routine approval pauses. It does not authorize any excluded follow-on operation.
