# Retained coffee releases

The implementation adds optional private R2 persistence to the manual coffee workflow. Its transport, protocol and workflow boundaries are tested without provider credentials. After owner setup, live R2 archiving, fresh-runner restoration, conditional promotion and offline recovery of both GitHub backups passed for August 2026. The website's validated August preview remains intact. The live evidence is recorded below.

## Storage and acceptance

The fixed namespace is `trade/v1/products/090121/`. Each immutable `releases/<month>-<UUID>.json` bundle contains the prepared Census release, original bytes for 240 request records, file hashes and the previous accepted bundle identity. The bounded mutable `current.json` pointer identifies the accepted bundle and its SHA256. HSCY HTTP 204 is an explicit null record; missing files cannot stand in for empty responses. Legacy successful records without a status remain readable.

Archived imports run only on `main`. They restore and validate the accepted baseline before making Census requests, retain its ETag and prepared-file checksum, and recompute revisions against that exact baseline. Same-month refreshes are allowed; earlier months fail. Immutable upload is conditional and must read back identically. A successful `census-coffee-candidate` artifact backup precedes one conditional pointer PUT. Conflicting writers cannot replace the restored pointer using a new ETag.

An uploaded candidate is not evidence of acceptance. `census-coffee-promotion` retains the outcome and the backup artifact ID/digest. `acknowledged` and `confirmed_by_readback` establish acceptance at that point; another writer may subsequently supersede it. `conflict` records a failed precondition. `unconfirmed` means a lost write response could not be resolved; check remote evidence before retrying. A receipt-save/upload failure does not roll back a known accepted write; if local saving fails, the CLI reports the established outcome with `receiptPersisted: false`. Artifact digests describe the GitHub artifact archive, not the inner bundle checksum. Backups expire after seven days; retain downloaded bundles separately.

## Configure a new archive

After review/merge and authorization for provider activation:

1. Create or select a private R2 Standard bucket in the default jurisdiction. Keep public access disabled. This code derives `https://<account-id>.r2.cloudflarestorage.com` and uses region `auto`; jurisdiction-specific endpoints require a separately reviewed change. [R2 S3 compatibility](https://developers.cloudflare.com/r2/api/s3/api/).
2. Use an Object Read & Write token scoped to that bucket. Save `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` as GitHub repository **secrets**, and `R2_ACCOUNT_ID` and `R2_BUCKET_NAME` as repository **variables**. Keep `CENSUS_API_KEY` in its existing secret. The program exposes no deletion method, but the token itself permits deletion and does not guarantee append-only storage. [R2 token setup](https://developers.cloudflare.com/r2/api/tokens/).
3. Dispatch **Import Census data** on `main` with a confirmed reporting month and `archive_to_r2=true`. Use `initialize_archive=true` only for the first run when the current object is genuinely absent; bucket/authentication errors never count as absence. Later runs use initialization false. Leaving both archive inputs false preserves the existing artifact-only behavior and needs no R2 settings.
4. Download both candidate and promotion artifacts. Verify the inner bundle checksum against the candidate reference in the promotion receipt. The receipt also links the backup artifact identity. A failed or cancelled backup prevents promotion.

R2 credentials are exposed only to restore, stage and promote steps; the Census key only to import. Ordinary checks, fixture builds, source data, browser exports and artifacts receive neither secret. SDK retries are disabled for storage calls. Raw response streams, including SDK error parsing, are bounded and aborted after 30 seconds. Application SHA256 and readback provide integrity checks; SDK checksum options use `WHEN_REQUIRED` to avoid unsupported default CRC32 behavior. [AWS retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html), [AWS S3 integrity settings](https://docs.aws.amazon.com/sdkref/latest/guide/feature-dataintegrity.html).

The measured bundle is 4.65 MB; twelve similar bundles would be about 56 MB, with two PUTs and several GETs per import. This is below R2's current Standard free allowance if other account usage leaves it available. The allowance is shared usage, not a spending cap; archive count grows until manually managed. No bucket lifecycle or automatic deletion is configured. [R2 pricing](https://developers.cloudflare.com/r2/pricing/).

## Recover a selected backup offline

Extract `bundle.json` from the selected candidate artifact and independently confirm its expected inner SHA256. The recovery command requires an empty destination and does not contact Census/R2 or change the remote pointer:

```text
npm run data:archive -- recover --bundle PATH_TO_BUNDLE --sha256 EXPECTED_BUNDLE_SHA256 --data-dir .tmp/selected-recovery
```

Recovery creates `processed/current.json`, `processed/releases/<release-id>.json` and `raw/<release-id>/*.json` beneath that destination. Validate the chosen recovered release before selecting it for a preview. Keep the known local data separately; never overwrite it to investigate an uncertain remote outcome.

For an unaccepted local archive of an initial release with empty `revisedKeys`:

```text
npm run data:archive -- pack --data-dir data --run-dir .tmp/local-bundle
```

This verifies the source grid and reports the bundle checksum. A release with recorded revisions requires its retained baseline through the archived import protocol; the offline pack command cannot invent that history.

## Actual-data offline evidence

On October 8, 2026, the CLI packed the locally retained August release and recovered it into a fresh ignored directory. An independent comparison checked every original file byte, prepared metadata and all 9,577 observations. No Census or R2 calls occurred. The original data pointer and release bytes remained unchanged.

| Item | Measured value |
| --- | --- |
| Release ID | `2026-08-6e3642ed-9fb9-4893-80b5-4a7d77bf691b` |
| Original files compared | 241 (one release and 240 request records) |
| Bundle bytes | 4,653,013 |
| Bundle SHA256 | `0de1cb535caf370adaf3da556a9433d6ffd7967e31501d35b9f335c79230a844` |
| Prepared release SHA256 | `79955703ac1acb78e60b8e7d5d6dab9f46e4c873defaddb50424aa6981d9ddb3` |
| Original local pointer SHA256 | `e60b1938b07a6ea6418da981c4458620fb7bd3493b15134ccbf34cf858e526e9` |

Execution evidence is retained locally in `.tmp/archive-offline-2026-10-08/evidence.json`; the bundle/recovered datasets remain ignored. This proves the archive format and offline recovery of actual source bytes, not live R2 acceptance.

An isolated copy of 68 tracked working-tree files under `.tmp/archive-acceptance/` passed a fresh `npm ci`, all 147 unit/component tests, `npm run check` with zero diagnostics, an explicit fixture build of three routes, and all five existing browser acceptance cases. Browser acceptance used `PLAYWRIGHT_PORT=4322` and `CI=true`, preserving the actual-data preview on port 4321. Independent task reviewers checked bundle integrity, SDK transport, restoration/promotion and workflow credential boundaries; their verified findings were fixed with failing-then-passing regressions.

A fresh whole-branch reviewer examined immutable range `ec682bebd873968dd3c95c413880b6b69f6320e3..ebd7c11f4c3999d50aea9d3fca9203f4cb2d6e13`, deliberately checked all five plan review-focus classes, and independently unpacked the actual offline bundle. It reported no Critical, Important or Minor findings. [GitHub Code checks run 37873244445](https://github.com/Vasuki8/us-trade-tracker/actions/runs/37873244445) also passed install, tests, type checks, fixture build and browser acceptance for that implementation commit. [PR #3](https://github.com/Vasuki8/us-trade-tracker/pull/3) contains the implementation and this documentation-only results update. A subsequent localhost request returned HTTP 200 for the actual August profile, and its original pointer checksum still matched the value above.

## Implementation execution decisions

These decisions describe the implementation milestone before owner activation. The two deferred live checks were subsequently completed in the separately authorized runs recorded below.

| Ruling | Reason | Cost if wrong |
| --- | --- | --- |
| Use the authorized root on an isolated feature branch | The prior managed worktree path was outside writable roots; preserve the actual preview and local data | Weaker checkout isolation requires care during later branch changes |
| Keep a Windows-native ledger in ignored `.tmp` | Execute the same verification directly rather than POSIX workflow helper scripts | Manual bookkeeping could omit a detail; committed checks and this record preserve the outcome |
| Install the exact `yaml` dev dependency alongside the SDK pin | Avoid rebuilding the index solely to split related dependency edits; consume it in workflow tests | Slightly broader transport commit; no production runtime use of `yaml` |
| Leave live provider compatibility/account permissions unverified | Provider configuration and calls require separate activation authorization | A provider-specific issue could surface in the live acceptance check |
| Leave archived manual dispatch/artifact execution unverified | Code CI ran; the owner has not activated the archive workflow | Hosted import wiring still needs its live acceptance check |
| Keep two successive official releases as a launch requirement | Same-month offline evidence cannot satisfy it | Launch remains gated until those releases are validated |
| Keep broader products, scheduling, deletion and deployment outside this milestone | Approved scope is the manual coffee persistence implementation | Those capabilities require separate implementation and decisions |

No minor review findings were deferred.

## Live R2 acceptance evidence

On October 8, 2026 (America/Toronto), after the owner configured the R2 bucket and GitHub settings, two manual **Import Census data** runs completed successfully on `main` at `d68af0d3abae18219f829a96fe62fbcf86590b47`. Each run passed all 147 tests, retrieved and validated the 60-month Census window through August 2026, uploaded/read back an immutable candidate, backed it up to GitHub, conditionally promoted it and retained an `acknowledged` promotion receipt.

| Evidence | Initial archive | Repeat import |
| --- | --- | --- |
| GitHub run | [37879833510](https://github.com/Vasuki8/us-trade-tracker/actions/runs/37879833510) | [37880534571](https://github.com/Vasuki8/us-trade-tracker/actions/runs/37880534571) |
| Hosted job | `113656736091` | `113658966738` |
| Initialize archive | `true` | `false` |
| Release ID | `2026-08-824e2648-14cc-4821-a340-1deb4cc5d1fe` | `2026-08-b4463154-08a9-450c-9b49-d1c45a2d6b52` |
| Bundle bytes | 4,658,362 | 4,658,527 |
| Bundle SHA256 | `375360dc66f259a36659e22ead06063e2a5416167d24b4ab51f3be5841a1c02c` | `d998ec26cbb82456992e49ef41265ee3984c2894c580fefafe9dc22da4c1faf1` |
| Prepared release SHA256 | `d5460ad50d7ead5e8a9402df526043175b259155b5f333bae1cbf841af5a83d7` | `112a539c6006b58189462279d0f04878cc18a764a66c3e08b9c736995a62c8f7` |
| Candidate backup artifact | `11593704049` | `11594395544` |
| Promotion receipt artifact | `11594057734` | `11594380616` |
| Verified observations | 9,577 | 9,577 |
| Recovered original files compared | 241 | 241 |
| Revised value/status keys | 0 | 0 |

The first restore recorded a null baseline. The second restore retrieved the first accepted bundle, verified its SHA256 and restored its prepared release with the exact first release ID and prepared-file SHA256 above. Its stage state retained the same baseline and the quoted ETag `"f60620486ca102785a633ba01f8358e8"` for conditional promotion. The second bundle's `previous` reference identifies the first bundle and its checksum exactly.

Both candidate ZIP digests and both promotion ZIP digests matched GitHub's artifact metadata. Each receipt links the corresponding candidate artifact ID/digest and inner bundle checksum; the ZIP digest and inner bundle checksum are separate values. The official recovery CLI restored each downloaded bundle to a separate fresh directory without Census or R2 calls. An independent Python verifier checked the unique 241-file manifest, every declared length/hash, the complete 240-request grid, all source-derived observation fields, the exact 242-file recovered inventory including its local pointer, and every original retained file byte. These original files are the importer's retained JSON request records and prepared release, rather than raw HTTP response bytes.

The independent comparison confirmed 120 reported world observations across 60 months. August world imports were $140,980,739 and exports were $66,393,173 in both releases. Zero revisions demonstrate an unchanged same-month comparison; these runs do not provide a positive live revision-detection example.

Downloaded ZIPs, extracted bundles, receipts and verification evidence are retained outside GitHub's seven-day artifact window under ignored `data/backups/r2-2026-08/<run-id>/`. Working recovery directories and the independent verifier remain under ignored `.tmp/archive-live-2026-10-08/`. No credentials or signed download URLs are included in those evidence files. The original local August pointer and prepared-release checksums still match the earlier offline evidence, preserving the known preview data.

Same-month persistence does not satisfy the separate requirement for two successive official monthly releases before public launch. Broader products, scheduling, deletion and deployment remain outside this milestone.
