# Repeatable live-site verification: design and implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans task by task. Root implements; fresh independent reviewer subagents review the completed changes. Preserve the owner's standing reviewed-merge permission.

**Goal:** Replace copied private publication-check scripts with one tracked, tested command that checks whether the existing public pilot serves the exact reviewed package, including its noindex header and private-route 404 behavior.

**Architecture:** Reuse the existing Python ZIP verifier and TypeScript filesystem guards. Port the proven anonymous HTTP checks into a small TypeScript module and CLI. Inputs are an existing site ZIP, its schema-v1 manifest, both expected SHA-256 identities and one previously observed deployment origin. The canonical origin is fixed. Write bounded private receipts; perform no provider mutation.

**Tech Stack:** Existing Node 24, TypeScript/tsx, Vitest, Python 3.12+ standard library and locked dependencies. No new package or service.

**Spec:** This combined bounded design and plan extends the [launch design](../specs/2026-10-08-us-trade-tracker-design.md), [local preparation contract](../../validation/local-site-preparation.md) and [verified research-handoffs publication](../../validation/research-handoffs.md). The combined format follows the owner's request for several tasks and one permission review.

**Status:** Owner approved all five tasks and the complete permission envelope on October 15, 2026; Tasks 1–4 locally and live verified; independent review, integration and private closeout remain at this record. Planning baseline: main af7ed78d8598984852ee73844c2507a9958efff6. The previous five-task publication milestone is complete, including private preservation and worktree cleanup.

## Recommendation and alternatives

The public pilot is verified through August 2026. A successful update across successive official releases remains a launch gate. The [Census release calendar](https://www.census.gov/foreign-trade/schedule.html), checked October 15, lists September 2026 data for November 4, 2026 at 8:30 a.m. Eastern. Monthly refresh, revision comparison and recovery tooling already exist; importing September now would not establish that gate.

The remaining practical tooling gap is live verification: the latest successful asset/header/404 checker lives in ignored private evidence and contains task-specific paths and package identities. Keeping copied scripts is possible, but makes subsequent publication checks harder to reproduce and review. A deployment automation system or broader hosting migration would be unnecessary. Promote only this proven read-only check into tracked tooling now; continue using the existing preparation, publication and research-validation procedures.

This is a bounded extension of an existing procedure. It changes no reader-facing behavior and needs no new public deployment. A successful receipt means that the observed responses match the selected package and header/404 policy at the time checked. It does not independently prove source-data correctness, numerical/browser behavior, owner approval, CI status or current Production assignment in Cloudflare.

## Design and global constraints

1. **Bind the local package first.** Accept only packageKind=site and the existing schema-v1 manifest. Require lowercase 64-character expected ZIP and manifest SHA-256 values. Read with existing containment/stability/reparse/hardlink guards, invoke scripts/package_site.py verify without a shell, validate its successful receipt, and read back the pinned files before constructing the immutable request plan. Reuse its duplicate-key, path, template, private-file and ZIP-member checks rather than creating a second ZIP implementation. Read input files only; do not extract or rebuild the site.
2. **Fix the destination policy.** Always check https://us-trade-tracker.pages.dev and exactly one distinct https://<eight-lowercase-hex>.us-trade-tracker.pages.dev deployment origin supplied by the operator from observed evidence. Reject other hosts, credentials, ports, paths, query strings and fragments before any request. The CLI exposes no arbitrary URL, authorization-header or cookie option. A syntactically valid deployment origin is not proof that it is the desired production release; the operator supplies that provenance separately.
3. **Check the exact served bytes.** Request every manifest entry except provider-control _headers. Require HTTP 200 for served assets; direct 404.html may return 200 or 404. Hash and count the decoded response stream against the expected manifest entry. Require the X-Robots-Tag tokens to be exactly noindex and nofollow, ignoring case/order/whitespace. Preserve Node fetch's standard decompression behavior; do not compare a compressed wire Content-Length to the decoded file length. Do not add unrelated header policies.
4. **Constrain redirects before following them.** Use manual redirects, GET, omitted credentials and no application retries. Accept only 301/302/303/307/308 redirects on the same exact origin. For an HTML entry, allow only its original path and the corresponding extensionless/trailing-slash forms; other assets keep their original path. Reject credentials, query/fragment additions, unrelated paths and cross-origin redirects before the next request. Allow at most three redirects per logical check; reject loops. Cancel unused redirect bodies.
5. **Keep private-route checks explicit.** Also request /preview/countries/1220/, /preview/accepted/countries/1220/, /countries/9999/ and /data/countries/1220/processed/current.json on both origins. Each must return 404 without redirection, the exact manifest 404.html body and the same noindex header. A successful byte check does not constitute a general site security scan.
6. **Bound this small pilot.** Retain the existing 1,000-entry and 26,214,400-byte per-asset package limits. Additionally cap the manifest at 1 MiB, ZIP at 4 MiB, total manifest payload at 2 MiB and the planned logical checks at 128 across both origins, rejecting excess before network activity. This covers the current 31-entry, 1,693,100-byte site and its 68 logical checks. Stream sequentially; cancel immediately if the next decoded chunk would exceed the expected length, without retaining that overflow chunk or buffering the whole response. Accepted decoded bytes are bounded by the request plan; transport/decompression may deliver an excess chunk before cancellation, so this is not an exact wire-transfer quota. Apply a 15-second timeout across each request's headers and body, a three-minute overall network deadline, and at most four HTTP attempts per logical check including redirects. Cancel streams and timers on all exits. No caller-adjustable limit bypass in this version.
7. **Report failure honestly.** Create a fresh, ignored, owned proof directory; reject an occupied destination. On success write a read-back-verified receipt.json; on a failure after a safe proof directory exists write failed.json with partial results and a stable error code. Never write a success receipt for partial checks. Do not record arbitrary exception messages, rejected Location URLs, response bodies, cookies, credentials or query strings. An unsafe output path must fail without creating output. Existing proof is never overwritten.

The tool supports this public site and its existing site packages, including a previously reviewed site restored later. Withdrawal-package support, provider identity discovery, browser/numerical verification migration, unattended monitoring and upload/rollback automation are outside this batch. Existing schema, staging/packaging behavior, accepted inputs, static hosting, browser downloads, indexing policy and dependencies remain unchanged.

## Permission envelope for all five tasks

Approval authorizes:

1. Root implementation of the specified tooling, meaningful tests and documentation, plus routine in-scope repairs; managed worktrees; read-only independent reviewer subagents; existing runtime use and locked npm ci when needed. No repeated execution-method approval.
2. Read the existing private verifier and receipts for reference. Make one bounded local copy of the pinned current ZIP and manifest into fresh ignored task storage, at most 8 MiB combined. Preserve originals. No accepted dataset, raw archive or R2 copy is needed. Write mock fixtures, test logs and bounded verification receipts locally.
3. Run local mock/fixture/integration tests, type checks and the existing standard CI checks. No real network calls from automated tests or CI. Tests may inject an in-memory HTTP transport; the production CLI has no unrestricted target mode.
4. Perform one anonymous, read-only live acceptance run against the two pinned origins below, after local checks pass. Permit at most one additional full run if a demonstrated transient failure or reviewed in-scope repair justifies it; preserve the failed attempt. Each run is limited to the exact 68 planned checks, at most 272 HTTP attempts including redirects, and the design's byte/time limits. No guessed deployment, new origin or periodic polling. Read-only Cloudflare dashboard inspection is allowed if production identity needs reconciliation; no provider settings change.
5. Commit, push, create/update/attach PRs, run existing standard-runner GitHub Code checks, obtain fresh independent review, merge the reviewed exact head under standing permission, synchronize main and verify tree identity. Resolve in-scope review findings and rerun affected checks. Preserve/hash-read-back useful private proof before archiving owned worktrees or removing verified task-owned scratch files. Documentation closeout is included.

**Live acceptance pins:**

| Item | Required value |
| --- | --- |
| Canonical origin | https://us-trade-tracker.pages.dev |
| Previously observed deployment origin | https://660d1364.us-trade-tracker.pages.dev |
| Deployment ID recorded at prior acceptance | 660d1364-b7c9-4220-a1b4-c66ca9eae5da |
| Retained directory | data/backups/research-handoffs/deployment-20261015-r1 |
| ZIP | site.zip; 386,182 bytes |
| ZIP SHA-256 | 0b2c6e5e185d5b028a2bb87162b61a899d05758391890a5085ff8566ae931f7f |
| Manifest | site-manifest.json |
| Manifest SHA-256 | 6fee00416d3fd12768ca68105a347f3dc57a2907910df334000d6941adc6da58 |
| Package runtime commit | a05bfd407b447ba48c830866e9394a6a516077ec |

Excluded: publication or automatic restoration; imports/live Census requests; new products, countries or months; data/pointer replacement; raw replay; all R2 operations; new dependencies/accounts/services, access/indexing changes, paid changes, schedules and outreach. Existing standard CI use is authorized; stop if an unexpected paid-only requirement appears.

The owner's preference for R2 usage below 100 GB is retained for future necessary storage work; this milestone needs no R2 storage and does not change the budget or hosting architecture. A production mismatch is a diagnostic failure, not permission to upload, restore or silently substitute another package. Preserve evidence and investigate read-only; request a new decision only for an unresolved material boundary. Human sign-in or a new terms prompt may still require the human's action.

## Review focus

1. Wrong or changed local package must fail before HTTP, including forged verifier receipts, manifest changes, unsafe paths and malformed ZIPs. Tasks 1 and 4.
2. No request may escape the fixed origins/path plan, including redirects containing credentials or sensitive query strings. Task 2.
3. Decompression, body truncation/overflow, stalled streams, timeouts and cancellation must not produce false success or unbounded work. Tasks 2 and 4.
4. Header, private-route and receipt failures must remain visible without overwriting evidence or leaking untrusted strings. Tasks 2–4.
5. The real run must use the exact existing package, preserve source/provider state and accurately describe the limits of byte verification. Tasks 4–5.

## Task 1: Bind the reviewed package and construct its request plan

**Files:** Add scripts/live-site-package.ts and tests/scripts/live-site-package.test.ts. Reuse scripts/package_site.py, scripts/site-preparation-files.ts and the SiteManifest type in scripts/site-assembly.ts without changing their existing contracts.

**Interface:** loadLiveSitePackage({workDir,manifestPath,zipPath,manifestSha256,zipSha256}) returns the immutable validated manifest, verified identities and expected served/private-route checks. Require workDir beneath the executing checkout's Git-ignored .tmp directory, with both input files inside that owned directory; verify containment and ignored status instead of trusting a path prefix. Task 2 applies the same containment to proofRoot. Use SITE_PACKAGE_PYTHON for the existing Python runtime. Resolve the tracked packager beside the running scripts, pass separate arguments without a shell, bound its output and set a 30-second subprocess timeout. An injected test adapter must not become a CLI bypass.

- [x] Record the clean execution baseline and authenticate the original two package files against the pins before copying. Establish ignored, fresh task storage and preserve original identities for final readback.
- [x] Add failing tests for valid schema-v1 input, wrong expected digests, duplicate keys/entries, changed input during verifier invocation, wrong/failed verifier receipt, malformed ZIP, unsafe/reparse/hardlinked paths and the stated size/check limits. Assert zero HTTP calls for every preflight rejection.
- [x] Implement the binding using existing stable reads and the Python verifier. Validate the verifier's entriesVerified, entryCount, bytes and sha256 against the pinned ZIP/manifest; do not treat subprocess exit zero alone as verification. Build checks from the exact manifest bytes already authenticated.
- [x] Run npm test -- tests/scripts/live-site-package.test.ts --maxWorkers=2 with SITE_PACKAGE_PYTHON set. Include at least one actual Python integration roundtrip with a small valid fixture ZIP, plus an invalid ZIP/duplicate-key case, rather than mocking every package decision. Commit the passing package preflight.

## Task 2: Port and test the bounded HTTP verifier

**Files:** Add scripts/live-site-verification.ts and tests/scripts/live-site-verification.test.ts.

**Interface:** verifyLiveSite(options) returns a LiveSiteVerificationReceipt after local binding and the two-origin run. Options are the Task 1 inputs plus deploymentOrigin and proofRoot. Internally allow injected fetch/clock/timers for deterministic tests. Receipt schema v1 records status, start/end times, package identities, origins, planned/completed counts and each completed check's allowed paths, status, decoded bytes/SHA-256 and normalized robots tokens. Failure records carry an allowlisted code and the failed planned path when safe.

- [x] Write failing transport tests for both exact target origins, valid HTML redirects, hash/length/status/header mismatches and each private-route requirement. Verify _headers is validated locally but never fetched as an asset.
- [x] Cover cross-origin/HTTP/credential/query/fragment/unrelated-path redirect rejection before follow-up fetch, loops and redirect-count exhaustion. Require absence of authentication/cookies and manual redirect handling.
- [x] Port the proven checks. Add stream tests for early EOF, overflow, an error after headers, a stalled body, abort at the overall deadline and compressed-response semantics. A mock may represent already-decoded bytes; explicitly check that compressed Content-Length is not used as decoded length. Cover cancellation and non-retry behavior with fake timers.
- [x] Implement fresh proof creation and exclusive read-back-verified receipts. Test failure on the second check preserving the first result, missing/occupied/unsafe output handling, failure-write errors yielding nonzero status, and redaction of a malicious Location/error string. Run the focused suite and commit.

## Task 3: Expose the command and document its limits

**Files:** Add scripts/verify-live-site.ts and tests/scripts/verify-live-site.test.ts; modify package.json and README.md; start docs/validation/live-site-verification.md.

**Interface:** Add npm run site:verify -- --work-dir <owned-root> --manifest <path> --zip <path> --manifest-sha256 <sha> --zip-sha256 <sha> --deployment-origin <observed-origin> --proof-root <fresh-path>. Reuse the existing strict argument convention. No arbitrary origins list, headers, cookies, limit overrides or package approval discovery. Exit zero only after a passed receipt is saved and read back; otherwise exit nonzero with a stable safe diagnostic.

- [x] Add tests for required/duplicate/unknown arguments, malformed pins/origin, passed and failed runs, and exact option forwarding. These CLI tests must never reach the internet.
- [x] Document the workflow: independently review source/data/build → authenticate the package → observe/authorize the deployment target → run site:verify → retain separate browser/numerical acceptance. Explain that hashes match bytes, not the truth of statistics or the provider's Production assignment.
- [x] Include a runnable PowerShell recipe using an existing SITE_PACKAGE_PYTHON runtime and fresh owned storage. Keep private local absolute paths and secrets out of tracked documentation. Explain limits, failure receipts and the absence of automatic restoration.
- [x] Run the CLI tests and npm run check; inspect the diff for accidental changes to src/, deployment/, data/, dependencies or existing preparation contracts. Commit the command/docs.

## Task 4: Verify against the existing real publication

**Files:** Complete docs/validation/live-site-verification.md with actual results. Keep private receipts under fresh ignored task storage; do not commit copied private scripts or live response bodies.

- [x] Run the complete unit suite with two workers, npm run check and Python packaging discovery once on the final implementation; run existing CI checks later on the exact reviewed head. No new product build or numerical/browser replay is necessary for this tooling-only local acceptance. Existing CI retains its normal build/browser checks.
- [x] Authenticate originals and the bounded copied ZIP/manifest again. Require the real preflight to report 31 entries, 1,693,100 raw bytes and exactly 68 planned HTTP checks. Verify a deliberately wrong pin fails without network before the authorized live run.
- [x] Run site:verify once against the pinned canonical and deployment origins. Require all 60 served asset/error checks and eight private-route checks to pass. Inspect receipt identities, normalized noindex header, redirect chains, status/size/hash evidence and request bounds. This is a fresh observation, not reuse of an earlier receipt.
- [x] If a transient failure or in-scope implementation repair occurs, retain failure evidence and use at most the one additional authorized run after affected tests/review. A real content/production mismatch remains failed; do not publish or change the pins to obtain a pass.
- [x] Read back originals unchanged and record counts, checked commit, receipt identities and limitations truthfully. Commit the verification record. If external state prevents the intended live acceptance, complete safe development/review but report the missing acceptance rather than declaring all five tasks complete.

## Task 5: Independent review, integration and preservation

- [ ] Self-review the final diff against this design and all five Review Focus items. Request one fresh read-only whole-branch review with exact base/head and access to the bounded private proof. Root verifies/resolves findings, adds reproducing tests for defects and reruns affected checks. No implementer subagents.
- [ ] Create/push/attach the PR, require all existing Code checks on the final reviewed head, merge with expected-head protection under standing permission, synchronize main and prove reviewed/merged tree identity. An unchanged implementation does not need another live run just because it was merged.
- [ ] Preserve/hash-read-back the compact ZIP/manifest copy, receipts and useful test/review logs. Archive the owned worktree only after proof preservation, verify cleanup and leave main clean. Report the actual verification result and that the public deployment and data are unchanged.

## Self review and execution handoff

Coverage: package identity, request confinement, streamed-response correctness, receipt safety and one real acceptance each have an explicit owning task and test. The plan reuses the existing ZIP and filesystem contracts, leaves research semantics untouched and uses only two already observed public origins. The current package fits all proposed limits. Automated checks remain offline; the separately authorized live run is bounded and read-only.

Root implementation plus independent review is already the selected execution method. Approval covers all five tasks and the full permission envelope without routine permission pauses. September ingestion/successive-release acceptance remains a later decision after the official release is available; this plan neither schedules nor starts that work.
