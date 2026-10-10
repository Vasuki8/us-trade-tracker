# Read-only private archive verification

The manual **Verify private archive recovery** workflow checks whether an existing accepted product archive can be restored on a fresh runner. It reuses the validated archive protocol rather than repeating a Census import and promotion. This is within the approved pipeline validation and archive recovery scope; it does not publish a site or schedule future work.

## Operation

1. Open the workflow in GitHub Actions and choose `main`.
2. Enter a reviewed, importable product code (`090121` or `090111`) and the archive's expected accepted reporting month, for example `2026-08`.
3. Run the workflow using the existing private R2 repository settings.
4. Retain both successful artifacts before their seven-day expiry: `census-<code>-restored` contains the original source records and prepared release; `census-<code>-verification` contains `run.json` and `verification.json`.

The restored files stay in the product's derived data directory: `data/` for roasted coffee or `data/products/090111/` for green coffee. The checkout contains no generated data, so these are fresh recovery destinations. Existing classification evidence is allowed. An occupied generated-data destination is rejected; local verification must use a fresh workspace containing the code and installed dependencies. The command is `npm run data:verify-archive -- --product 090111 --month 2026-08`, with `GITHUB_REF=refs/heads/main` and the existing R2 configuration in its environment. Do not replace a known local release to run this check.

## Contract and limits

Dispatch validates the reviewed product, month and main-branch restriction before creating the provider. Initialization is forced off even if an inherited environment requests it. A read-only wrapper permits the protocol's two GETs (accepted pointer and referenced bundle) and throws on any PUT. No Census key is provided and no Census requests, staging or promotion occur. The workflow shares the import concurrency group and has a ten-minute timeout.

The existing decoder verifies the selected product namespace, pointer and bundle identity, SHA256, full source grid, source replay, prepared release and original file bytes before restoration. Version 1 merchandise-only archives remain readable; their receipt explicitly records zero duty observations and a null duty start month. Version 2 retains duties. A successful receipt requires the restored reporting month to equal the requested month exactly. Missing archives, crossed product identities, invalid inputs and mismatched months produce no new successful verification receipt.

The receipt records the accepted reference, pointer ETag, release ID and prepared checksum together with the original retrieval timestamp, processing version and observation counts. It describes the accepted pointer read during that verification. Another authorized writer can later supersede it; this check does not reaccept a release or compare the data to a later Census publication. A requested newer month cannot invent an unaccepted release. Same-month recovery does not satisfy the launch requirement for two successive official releases.

R2 settings are limited to the restoration step. Checkout disables persisted credentials; actions are pinned and repository permissions are read-only. Ordinary code checks have no provider credentials. Existing R2 tokens retain their previously configured capabilities; the verifier's write protection is an application boundary, not an account permission change.

## Local implementation evidence

Ten focused tests cover both real product identities using synthetic source fixtures, exact restored bytes, GET-only access, retained archive identity, legacy version 1 recovery, absent archives, crossed namespaces, inherited initialization, invalid dispatch and incorrect accepted months. Workflow checks cover manual-only execution, branch/concurrency restrictions, credentials and artifact paths. The initial stub failed the positive verification cases before implementation; all ten now pass. The full suite passed **468 tests**, and type checks reported **zero diagnostics across 126 files**.

Independent review of commit `9134e0de0bf1d6d930c705646494c14d05cf16e8` reported no blocking or minor findings and independently passed 90 archive tests. [Code checks run 38083309097](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38083309097) passed all 468 tests, zero diagnostics across 126 checked files, the fixture build and all 52 browser cases. The separate actual-data build remained **19 files / 1,066,951 uncompressed bytes**, with a 283,172-byte largest file. [PR #33](https://github.com/Vasuki8/us-trade-tracker/pull/33) merged the implementation.

The workflow requires its file on the default branch for manual dispatch. After that merge, [live recovery run 38083542577](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38083542577) passed on a fresh runner for green coffee's accepted August 2026 version 2 archive. Both downloaded artifact digests matched GitHub metadata. Independent comparison verified all 337 original files, the accepted bundle/prepared checksums, observation counts, source timestamp and original processing version. Neither local profile release changed. This is live proof for the green-coffee version 2 path; version 1 and roasted-coffee behavior in this new verifier are covered by the focused tests, with earlier live roasted-coffee archive evidence recorded separately. See [green coffee archive acceptance](../data-validation/090111-archive.md).
