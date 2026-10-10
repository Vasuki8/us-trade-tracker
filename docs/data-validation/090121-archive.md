# Retained coffee releases

The implementation adds optional private R2 persistence to the manual coffee workflow. Its transport, protocol and workflow boundaries are tested without provider credentials. After owner setup, live R2 archiving, fresh-runner restoration, conditional promotion and offline recovery of both GitHub backups passed for August 2026. The website's validated August preview remains intact. The live evidence is recorded below.

## Storage and acceptance

The coffee namespace is `trade/v1/products/090121/`. Version 1 bundles retain their original 240 merchandise request records plus the prepared release. Version 2 adds 96 duty request records across 24 months, for 337 files, and declares both month scopes in its manifest. Both versions replay their own source queries and preserve original file bytes. The bounded mutable `current.json` pointer identifies the accepted bundle and its SHA256. HSCY HTTP 204 is an explicit null record; missing files cannot stand in for empty responses. Legacy successful records without a status remain readable.

Archived imports run only on `main`. They restore and validate the accepted baseline before making Census requests, retain its ETag and prepared-file checksum, and recompute merchandise and duty revisions against that exact baseline. Same-month refreshes are allowed; earlier months fail. Immutable upload is conditional and must read back identically. A successful `census-090121-candidate` artifact backup and credential-free offline recovery precede one conditional pointer PUT. Conflicting writers cannot replace the restored pointer using a new ETag.

An uploaded candidate is not evidence of acceptance. `census-090121-promotion` retains the outcome and the backup artifact ID/digest. `acknowledged` and `confirmed_by_readback` establish acceptance at that point; another writer may subsequently supersede it. `conflict` records a failed precondition. `unconfirmed` means a lost write response could not be resolved; check remote evidence before retrying. A receipt-save/upload failure does not roll back a known accepted write; if local saving fails, the CLI reports the established outcome with `receiptPersisted: false`. Artifact digests describe the GitHub artifact archive, not the inner bundle checksum. Backups expire after seven days; retain downloaded bundles separately.

## Configure a new archive

After review/merge and authorization for provider activation:

1. Create or select a private R2 Standard bucket in the default jurisdiction. Keep public access disabled. This code derives `https://<account-id>.r2.cloudflarestorage.com` and uses region `auto`; jurisdiction-specific endpoints require a separately reviewed change. [R2 S3 compatibility](https://developers.cloudflare.com/r2/api/s3/api/).
2. Use an Object Read & Write token scoped to that bucket. Save `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` as GitHub repository **secrets**, and `R2_ACCOUNT_ID` and `R2_BUCKET_NAME` as repository **variables**. Keep `CENSUS_API_KEY` in its existing secret. The program exposes no deletion method, but the token itself permits deletion and does not guarantee append-only storage. [R2 token setup](https://developers.cloudflare.com/r2/api/tokens/).
3. Dispatch **Import Census data** on `main` with a confirmed reporting month and `archive_to_r2=true`. Use `initialize_archive=true` only for the first run when the current object is genuinely absent; bucket/authentication errors never count as absence. Later runs use initialization false. Select `include_duties=true` for the audited 24-month duty extension. Once the accepted baseline includes duties, omitting this option fails rather than dropping its duty history. Leaving both archive inputs false preserves the existing artifact-only behavior and needs no R2 settings.
4. Download both candidate and promotion artifacts. Verify the inner bundle checksum against the candidate reference in the promotion receipt. The receipt also links the backup artifact identity. A failed or cancelled backup prevents promotion.

R2 credentials are exposed only to restore, stage and promote steps; the Census key only to import. Ordinary checks, fixture builds, source data, browser exports and artifacts receive neither secret. SDK retries are disabled for storage calls. Raw response streams, including SDK error parsing, are bounded and aborted after 30 seconds. Application SHA256 and readback provide integrity checks; SDK checksum options use `WHEN_REQUIRED` to avoid unsupported default CRC32 behavior. [AWS retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html), [AWS S3 integrity settings](https://docs.aws.amazon.com/sdkref/latest/guide/feature-dataintegrity.html).

The measured bundle is 4.65 MB; twelve similar bundles would be about 56 MB, with two PUTs and several GETs per import. This is below R2's current Standard free allowance if other account usage leaves it available. The allowance is shared usage, not a spending cap; archive count grows until manually managed. No bucket lifecycle or automatic deletion is configured. [R2 pricing](https://developers.cloudflare.com/r2/pricing/).

## Recover a selected backup offline

Extract `bundle.json` from the selected candidate artifact and independently confirm its expected inner SHA256. The recovery command requires an empty destination and does not contact Census/R2 or change the remote pointer:

```text
npm run data:archive -- recover --product 090121 --bundle PATH_TO_BUNDLE --sha256 EXPECTED_BUNDLE_SHA256 --data-dir .tmp/selected-recovery
```

Recovery creates `processed/current.json`, `processed/releases/<release-id>.json` and `raw/<release-id>/*.json` beneath that destination. Validate the chosen recovered release before selecting it for a preview. Keep the known local data separately; never overwrite it to investigate an uncertain remote outcome.

For an unaccepted local archive of an initial release with empty `revisedKeys`:

```text
npm run data:archive -- pack --product 090121 --data-dir data --run-dir .tmp/local-bundle
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

## Version 2 estimated-duty archive evidence

Two approved duty-enabled runs on October 9, 2026 passed on `main` at `7f76e7c6f0fb1168906956ef8517095a5e49e103`. Both jobs restored the baseline, passed 204 tests, retrieved the 60-month merchandise and 24-month duty windows, verified immutable upload, backed up the candidate, recovered it offline, conditionally promoted it, and retained an `acknowledged` receipt. The new offline recovery step receives no Census or R2 credentials.

| Evidence | First version 2 import | Fresh-runner repeat |
| --- | --- | --- |
| GitHub run | [37898525667](https://github.com/Vasuki8/us-trade-tracker/actions/runs/37898525667) | [37899540773](https://github.com/Vasuki8/us-trade-tracker/actions/runs/37899540773) |
| Hosted job | `113715390551` | `113718618480` |
| Release ID | `2026-08-f9577783-512d-4966-9ec2-7696b84c7df9` | `2026-08-5f3c2606-06a0-4c96-8fbc-a2332e0428ae` |
| Bundle bytes | 6,518,765 | 6,518,765 |
| Bundle SHA256 | `1cee5f3a9b2c53d81001c5b5e2687682b3b96fd78033c05b04f6c55da5de6c35` | `44c03004da6a76b031cd70997491c97221ecc9c0289cf7f9b426e42208394adf` |
| Prepared SHA256 | `864249c836f67e9328edba5c690bd60705e3b5a6d9513b380a27d62bb7a55a4d` | `eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727` |
| Candidate artifact | `11601533302` | `11602250588` |
| Candidate ZIP SHA256 | `6db96a56cbedc93a7908a9d87a816088e376d10f5de2fad5a9c21be58ef42027` | `fdb92aca763937693ea38dade94ece2220d97234c8f75c6a5723a0eabc7fe46e` |
| Promotion artifact | `11601637680` | `11602430265` |
| Promotion ZIP SHA256 | `38dfbcb4314a5b920c2eff96722f0dc3156cda45c50255b9bac83eeca00b01a0` | `663d0f4c7a2a1e7f06f351d064a6a99ab2903d380f572afc078eb39ef3f3b383` |
| Original files recovered and byte-compared | 337 | 337 |
| Merchandise / duty observations | 9,577 / 1,887 | 9,577 / 1,887 |
| Merchandise / duty revisions | 0 / 0 | 0 / 0 |

Both downloaded artifact digests matched GitHub metadata. Independent checks reproduced all original file lengths/hashes and recovery bytes, then every duty-source amount and rate-provision aggregation without importing production normalizers. The first bundle's predecessor is the accepted version 1 bundle `2026-08-b4463154-08a9-450c-9b49-d1c45a2d6b52`, checksum `d998ec26cbb82456992e49ef41265ee3984c2894c580fefafe9dc22da4c1faf1`. The repeat bundle identifies the first version 2 bundle and checksum exactly. Its matching source-derived values and empty revision lists independently confirm an unchanged same-month refresh.

The updated recovery CLI also restored that real version 1 predecessor separately; all 241 original file bytes matched. Legacy bundles and the pointer namespace were preserved. Backups, receipts and independent evidence are retained under ignored `data/backups/duty-r2/<run-id>/`; recovery directories remain under ignored `.tmp/duty-live-recovered-<run-id>/`. These checks establish version 2 recovery and acceptance, not public launch or two successive official reporting months.

## Product selection update

The multi-product foundation keeps coffee's original paths, objects and both bundle formats. New manual runs select product_code=090121 and use code-bearing artifact names; previously downloaded artifacts retain their historical names. Legacy run/candidate state is validated only as coffee. Offline recovery rejects wrong product identity and occupied destinations, including coffee roots containing products/. Other reviewed products use separate local roots and private archive namespaces. Roasted coffee was the only real enabled product at the foundation milestone; green coffee subsequently passed its own [source acceptance](090111.md) and [private archive recovery](090111-archive.md). See [foundation acceptance](../validation/multi-product-foundation.md).

## October 10 read-only recovery workflow

The new manual **Verify private archive recovery** workflow passed its roasted-coffee default on a fresh GitHub runner, using `main`, product `090121` and expected accepted month `2026-08`. This complements the green-coffee run and verifies the original `data/` restoration and artifact paths. It uses the existing private R2 configuration, supplies no Census key and permits only GETs through the verifier's write-blocking wrapper. No initialization, import, staging or promotion steps run.

| Evidence | Value |
| --- | --- |
| Recovery run | [38090726807](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38090726807) |
| Hosted job | `114326433567` |
| Workflow commit on `main` | `ea22910d339c85ba2992732e1240495dafe6613d` |
| Receipt result | `verified` |
| Accepted release ID | `2026-08-5f3c2606-06a0-4c96-8fbc-a2332e0428ae` |
| Accepted bundle SHA256 | `44c03004da6a76b031cd70997491c97221ecc9c0289cf7f9b426e42208394adf` |
| Prepared SHA256 | `eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727` |
| Pointer ETag | `"a25bd98e6927ab36d7ceb863c495bcb3"` |
| Restored artifact | `11682968676` (`census-090121-restored`) |
| Restored ZIP SHA256 | `54245e158899f960f3caed9ae47e1b496ac24074c1c9f3292f38362fbde45a7f` |
| Verification artifact | `11683932925` (`census-090121-verification`) |
| Verification ZIP SHA256 | `ab66e3a4096159f9476bb6f6e71154cd853ca414dd60409dd7eadc7abdf42452` |
| Originals independently byte-compared | 337 |
| Merchandise / duty observations | 9,577 / 1,887 |

Both downloaded ZIPs matched GitHub's digests before extraction. Strict inventory checks found exactly 338 restored files, including the local pointer, and exactly `run.json` and `verification.json` in the receipt artifact. Duplicate entries and unexpected paths were rejected before extraction. Independent comparison checked all 337 original files (336 retained JSON request records and the prepared release) against the accepted October 9 bundle's unique manifest, declared lengths, SHA256s and original contents. The restored prepared file also matches the canonical profile file byte for byte.

The receipt and run baseline match the accepted promotion reference from [run 37899540773](https://github.com/Vasuki8/us-trade-tracker/actions/runs/37899540773). They preserve the original retrieval timestamp `2026-10-09T07:32:29.685Z`, original processing version `7f76e7c6f0fb1168906956ef8517095a5e49e103` and duty start month `2024-09`; the verification workflow's newer commit does not replace those metadata. All four canonical local pointer/release hashes for roasted and green coffee were rechecked and remain unchanged.

Downloaded artifacts, extracted files and independent results remain under ignored `data/backups/roasted-coffee-recovery/38090726807/`. The small [recovery evidence index](090121-recovery-evidence.json) retains run/artifact identities and checksums after GitHub's seven-day artifact expiry. This proves recovery of the accepted pointer observed during this run, not indefinite remote immutability or acceptance of two successive official reporting months. The original preview data remain intact.
