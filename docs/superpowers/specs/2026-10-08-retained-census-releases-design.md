# Retained Census releases

Prepared October 8, 2026. **Status: approved by the owner on October 8, 2026; the implementation plan is prepared for owner review. Cloudflare activation has not started.**

## Purpose and scope

Make repeated hosted imports of the coffee sample reliable. A fresh GitHub runner must recover the last accepted release, compare revised observations against it, preserve the new source responses, and retain the prior current release if retrieval, validation or storage fails.

The owner approved R2 as the storage direction in the launch brief. The first coffee milestone and its API correction are merged in PRs #1 and #2. The owner subsequently approved this design as the next milestone, prioritizing reliable refresh before broader product coverage.

Success means a tested storage integration ready for a separately authorized live check. Actual R2 verification requires account configuration and credentials. Offline tests cannot establish that a hosted archive works, and two imports of August 2026 cannot establish two successive official releases.

Limit this milestone to HS `090121`, 60 months, the existing manual workflow and private R2 Standard storage. Product discovery, deployment, scheduled imports, public bucket access, automatic deletion and additional products remain separate work.

## Recommendation and alternatives

| Approach | Benefit | Limitation |
| --- | --- | --- |
| Private R2 archive, with the existing GitHub artifact as a second copy | Fits the agreed architecture; source files and history survive runner disposal and artifact expiry | Requires explicit R2 activation and bucket-scoped credentials |
| Restore a prior GitHub Actions artifact and extend retention | Fewer credentials and a smaller initial change | Artifacts still expire or can be deleted; refresh would depend on locating a surviving prior run |

Recommend R2. GitHub permits configurable artifact retention, but retention is finite; increasing it does not create permanent history. The current workflow explicitly uses seven days. Keep GitHub artifacts as downloadable backups rather than the authoritative archive. [GitHub retention documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository).

## Storage layout and contracts

Use the fixed namespace `trade/v1/products/090121/` in one private bucket. A release ID is the existing reporting-month plus generated UUID. Store:

```text
current.json
releases/<release-id>.json
```

Paths above are relative to the product namespace. Each immutable JSON bundle contains its manifest and all files needed for recovery. Only `current.json` is mutable. Create a bundle with `If-None-Match: *`; a collision succeeds only if downloaded bytes exactly match the intended SHA256 and byte length. Application immutability does not protect against a person holding bucket credentials. One bundle fits this small workload and avoids coordinating hundreds of remote objects.

The version-1 bundle manifest records product, reporting month, retrieval timestamp, processing version, release ID, and the relative filename, byte length and SHA256 of the prepared release and each raw response record. It also records the previous accepted bundle key and SHA256, or null for initialization. Require exactly one `release.json` and 240 `raw/<direction>-<month>-<HS-or-HSCY>.json` request records for 60 months, two directions and two query shapes. Manifest metadata must agree with the validated prepared release. Bundle file entries hold canonical base64 of the original UTF-8 file bytes; decoding must reproduce their length and checksum exactly. Reject a mismatch between declared and included files.

The current client accepts a partner-query HTTP 204 without saving a raw file. Extend its existing raw callback narrowly to retain that response as `{retrievedAt, requestUrl, httpStatus: 204, payload: null}`. It represents unavailable country observations, never zero. World-query 204 remains an import failure. Successful tables retain their existing wrapper with `httpStatus: 200`; existing saved wrappers without this field mean 200 for archive compatibility. Do not invent a 204 record for an absent file. This small retention change is part of the milestone.

The version-1 current pointer contains the product code, bundle key and SHA256 of the exact serialized bundle. Read its object ETag as the concurrency token; ETags are not our data-integrity checksum. Preserve the returned ETag exactly when sending a conditional update.

Use strict schemas and allowlisted keys within the fixed namespace. Reject traversal, duplicate entries, unexpected filenames, invalid hashes, noncanonical base64, wrong products, private request URLs and inconsistent dates. Cap the pointer at 16 KiB, manifest metadata at 256 KiB, an individual decoded file at 32 MiB, total decoded file data at 64 MiB, and serialized bundle at 96 MiB to allow base64 overhead. Bound downloaded streams before buffering. Check actual encoded lengths before decoding, then verify actual decoded lengths and checksums rather than trusting manifest declarations. These limits cover the measured sample with headroom and must fail clearly if later scope exceeds them.

Keep storage orchestration separate from transport: a small object-store interface provides bounded reads and conditional writes; a pinned official AWS SDK v3 adapter connects it to R2's S3 endpoint. Local tests exercise the same orchestration using a deterministic in-memory store. Reuse existing Census normalization, release validation and local pointer handling. Astro continues to consume the existing local release shape.

## Manual workflow

Add `archive_to_r2` and `initialize_archive` boolean dispatch inputs, both defaulting to false. The current artifact-only import continues to work. Persistent imports require `main`; initialization is accepted only with archiving enabled and an absent remote pointer.

For an archived import:

1. Validate inputs and storage configuration before making Census requests. Fetch the current pointer and its bundle. Verify bundle/file hashes, metadata, raw-source agreement and Census provenance, then restore the prepared release into the ignored local processed directory. Write into a staging directory and change the local pointer only after complete validation. Preserve the remote pointer ETag and bundle identity in ignored runner state. Only a confirmed missing current pointer permits explicitly requested initialization; authentication errors, malformed state and a missing referenced bundle fail the run.
2. Reject a requested reporting month older than the restored release. Permit the same month for revised-source checks. Import the complete 60-month window using the existing Census command so `revisedKeys` reflects overlapping history. Do not extend classification evidence beyond its reviewed end.
3. Verify the new release and its raw response records: every expected request shape/month must be present. Align the world and partner table headers for each month/direction as the client already does, then normalize the combined table; a recorded partner-query 204 contributes no rows. Require the complete normalized observations to match the prepared release by identity, dimensions, descriptions, status and value. Create and upload the immutable bundle, then download it to verify its complete bytes and checksum before promotion.
4. Upload the same bundle as a downloadable GitHub candidate-backup artifact. If this backup step fails, keep the remote current pointer unchanged. Its manifest records its baseline, but the presence of this artifact does not prove remote acceptance: promotion can still conflict or be cancelled. Backup recovery requires explicit selection of a bundle and must not automatically designate an arbitrary candidate as current.
5. Update the remote pointer with `If-Match` against the ETag read in step 1, or `If-None-Match: *` for initialization. Configure this PUT with `maxAttempts: 1` so an automatic retry cannot obscure a lost successful response. A confirmed precondition conflict prevents this promotion; never retry against a newly fetched ETag. On a transport error with uncertain write outcome, read the pointer: an exact candidate match confirms success; a different or unreadable pointer leaves the outcome explicitly unconfirmed. Do not report that the previous pointer survived an unconfirmed outcome. [AWS retry configuration](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html).

GitHub concurrency remains an additional guard; conditional storage writes protect against writers outside that workflow. R2 documents conditional S3 writes and strong consistency for direct bucket access. Use the authenticated S3 endpoint rather than a cached public domain. [S3 compatibility](https://developers.cloudflare.com/r2/api/s3/api/), [consistency](https://developers.cloudflare.com/r2/reference/consistency/), [Node SDK example](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/).

An uploaded bundle can remain unreferenced; it is never automatically current. Log a safe release ID and stage for recovery. This milestone does not delete abandoned bundles. An acknowledged successful conditional PUT confirms that promotion was accepted. A failed subsequent status read means current-state verification failed, rather than making that acknowledged write uncertain; another writer may subsequently supersede it.

## Credentials and activation

Use GitHub repository secrets `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`. Use repository variables `R2_ACCOUNT_ID` and `R2_BUCKET_NAME` for noncredential settings. Derive the HTTPS endpoint from a validated account ID; this initial adapter targets a default-jurisdiction bucket. Jurisdiction-specific buckets require an explicit design change before connection.

Use a token with Object Read & Write scoped to the selected bucket. Cloudflare supports that scope for the S3 API. The program exposes no deletion or bucket-management operation; the token itself must not be described as enforcing append-only history. Never print SDK errors containing headers, credentials or signed requests. [R2 authentication and permissions](https://developers.cloudflare.com/r2/api/tokens/).

Keep the Census secret in its existing import step. Give R2 secrets only to restore/upload/promotion steps, never to fixture CI, builds, browser assets or artifacts. Offline pull-request checks need no credentials. Missing configuration must produce a clear setting-name error without revealing values.

Implementation approval authorizes code, offline checks and review, while live activation remains a separate action. Creating a subscription or bucket, changing account permissions, installing secrets, running an archived import and publishing a site require the owner's relevant authorization. Credentials should be entered directly in the provider and GitHub interfaces, not chat.

## Cost and backup assumptions

The retained August sample contains 1,120,615 raw bytes and 2,334,758 prepared bytes: about 3.46 MB before packaging. Base64 plus metadata makes an estimated bundle about 4.7 MB; twelve equally sized monthly bundles would occupy about 56 MB, excluding repeated imports and other account usage. A successful run writes two objects and needs a few reads for restoration and verification. These are workload estimates, not forecasts of broad product coverage.

R2 Standard currently includes 10 GB-month storage, one million Class A operations and ten million Class B operations per month. Usage above the allowance is billed; free allowances are not a spending cap and may be shared with other account workloads. Activation requires an R2 subscription checkout. Confirm the actual account state and allowance before a live run. [Pricing](https://developers.cloudflare.com/r2/pricing/), [getting started](https://developers.cloudflare.com/r2/get-started/).

Retain every accepted snapshot during this small pilot. Continue downloading verified GitHub bundles into the owner's separate local archive; seven-day artifacts alone do not establish a lasting independent backup. Record checksums and the workflow's promotion outcome alongside each bundle, and test recovery into a fresh directory. Retention changes and automated cleanup require a later decision.

## Verification and deliverables

Tests must establish restoration in a fresh directory, revision detection against the restored baseline, initialization requiring explicit opt-in, and refusal to regress reporting month. Exercise a competing pointer update, a lost promotion response, an acknowledged promotion followed by failed readback, truncated/oversized bodies, corrupt checksums, wrong products, missing raw responses, a retained partner-query 204, failed uploads, backup failure and interruption before promotion. Prove the accepted pointer remains correct in each confirmed failure case, mutable PUTs are sent only once, unaccepted backup candidates are not silently promoted, and diagnostics contain no test credentials.

The candidate's previous-bundle identity and revision comparison must both use the exact validated baseline restored at the start of that run. Test that link explicitly, including a remote pointer change after restoration.

Run the existing unit/component checks, type checks and fixture browser acceptance on the resulting branch. Keep the verified local Census preview intact. Independent reviewer subagents review correctness, recovery and credential handling before a pull request is marked ready.

Deliver a focused reviewed PR, setup and recovery instructions, and a measured offline verification record. A separately approved live test must demonstrate initial archiving, recovery on a new runner, a repeat import compared against that baseline, and restoration from the independent backup. Label that result as same-month persistence verification. Keep the requirement for two successive official monthly releases open until genuine evidence satisfies it.

Proposed code boundaries: `scripts/archive-store.ts` for transport, `scripts/archive-release.ts` for bundle/restore/promotion logic, a small archive CLI, focused tests under `tests/scripts/`, the narrow raw-retention extension in the importer, opt-in steps in `import-census.yml`, and README/setup evidence. No product UI or public deployment changes are needed for this milestone.

Independent design review found no remaining architecture blocker after the bundle simplification and promotion/backup corrections. This is a design assessment, not verification of implementation or live R2 behavior. Owner design review is complete; the implementation plan must be reviewed before execution.
