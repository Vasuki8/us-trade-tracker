# Canada private archive and recovery design

Prepared October 12, 2026 at `33671adc7c7cce83dfefc984d2aac328b69a1664`. The owner has authorized completing the required Canada development work and supplied permission to proceed. Root chooses and implements this scoped design, with independent review before merge. No additional routine design/plan/merge approval is required under that instruction. Live access and free-capacity checks are facts to verify, not approvals inferred from eligibility.

## Outcome and existing authority

The selected Canada release must survive loss of this machine without losing the original collection, its capture metadata, classification evidence or the separately recorded acceptance. Use the existing private R2 bucket and existing GitHub secrets. Keep the selected local state and all coffee archives unchanged. A fresh runner verifies remote bytes, restores the accepted country state in isolation under recorded owner authority, and only then initializes a separate private country archive pointer.

The owner approved initial local selection of candidate `337d25eeb94c87d9dbfdc4c9a21a20e7e50f416a6599cd0699f028eee0349818`. The selected local pointer is 466 bytes, SHA-256 `9ede6a6906b0da7f85e74203d186bee7f6a8e08e37f452fb9f5a99e88e10a399`. Its acceptance record is 13,430 bytes, SHA-256 `b64cdaf9b33c7604d9b069852351c64759ee713f397c8c087201cd7a09320f75`. These identities remain immutable. The full completion evidence is privately retained under `data/backups/canada-country-release/local-selection-20261012-r1/`.

Keep September 2024–August 2026, imports `GEN_VAL_MO`, exports `ALL_VAL_MO`, all 48 monthly values, 20 selected categories, 17 qualified ordinary comparisons and three statistical exclusions. Both retained reference grids keep 41 matches/seven mismatches; publication keeps seven matches/41 unreviewed. Historical failed audits and historical availability flags retain their meaning. Archival integrity does not establish a newly revised series or a fresh raw-source replay.

## Recommendation and alternatives

Use short-lived presigned PUT URLs issued by a main-only GitHub workflow. The local uploader streams existing authenticated bodies directly to private R2; the keys remain in GitHub. A separate workflow reads every object and restores the selected release before pointer initialization. This avoids copying credentials to the workstation and accommodates the large retained collection.

Copying a long-lived key locally is simpler but changes the owner's established credential arrangement. Re-fetching public sources on the runner could retrieve a different capture and waste bandwidth. Neither is required. A private carrier Git branch would leave dataset bodies in Git history; use small committed identity metadata and direct object transfer instead.

## Fixed preservation set

The committed `docs/data-validation/1220-preservation-manifest.json` is canonical JSON with one LF: **181,256 bytes**, SHA-256 **`d67abbcb1e666a4b4f2a51eefbfe8c1efc564c924c7acf944375e6fa640b84ba`**. Root freshly streamed and authenticated every listed body before producing this index, without decompression or source requests.

| Selection | Files | Bytes |
| --- | ---: | ---: |
| Pinned replay's original collection and capture metadata | 132 | 7,686,974,980 |
| Its normalized rows and per-context receipts | 96 | 39,036,486 |
| Union of corrected classification sources and continuity references | 266 | 218,095,715 |
| Existing classification-body request sidecars | 264 | 145,926 |
| Six October 12 and two October 11 capture manifests | 8 | 175,232 |
| **Total** | **766** | **7,944,428,339** |

The largest object is December 2025 imports, 292,255,561 bytes. Retaining normalized arrays costs only 39 MB and removes a parser-environment prerequisite from recovery. Preserve unsuccessful capture records too. The index maps stable four-digit logical IDs to normalized repository-relative paths, roles, exact lengths and SHA-256. Paths never become R2 keys or browser data. Reject missing, conflicting, changed, linked or escaping inputs; no discovery outside this fixed index.

## Objects and contracts

Policy is `canada-private-archive-v1`. Country is always `1220`; source/acceptance policies remain the existing v1 policies. Product keys/validators are untouched.

- Sources: `trade/v1/countries/1220/source-collections/<manifestSha>/files/<fourDigitId>`.
- Source index: `trade/v1/countries/1220/source-collections/<manifestSha>/manifest.json`.
- Compact accepted bundle: `trade/v1/countries/1220/releases/<releaseId>/<bundleSha>.json`.
- Archive selection: `trade/v1/countries/1220/current.json`.

The compact bundle has strict schema/version, policy/country/release, fixed source-index digest, and exactly six canonical base64 members: `candidate.json`, `acceptance.json`, `local-pointer.json`, `selection-receipt.json`, `local-completion.json`, and `operator-authorization.json`. Member descriptors authenticate full bytes. The operator record preserves the owner's new instruction, authorizes private initial archival and isolated recovery of this exact local pointer/source index, and includes a separately generated `CountryApproval` for recovery with the existing pointer digest. It is a trusted operator record of actual human authority, not authority generated from a validator or a yes-like CLI flag.

The archive pointer references the exact source index and compact bundle by key/size/hash, and binds the accepted local pointer digest. Initial version supports explicit initialization only, plus an idempotent exact selection. A different existing selection is a conflict; it is never silently replaced. Future source collections or successors require a new scoped decision.

Limits: 1,024 source entries, 512 KiB source index, 512 MiB per source object, 8 GiB aggregate source bodies, 12 MiB compact bundle, 64 KiB compact records, 16 KiB pointers, 4 MiB capability document. Transfers use at most two streams, 256 KiB local chunks, ten minutes per object and three hours overall. No multipart is needed. Validate paths before opening and after reading; check size, file identity and timestamps across streaming. A changed upload cannot advance the pointer.

## Transport and credentials

Add the matching-version `@aws-sdk/s3-request-presigner` dependency to the existing S3 SDK. Use Standard storage in the existing bucket. Validate every key against the country namespace and fixed manifest; sign `If-None-Match: *`, exact content length and digest metadata. Confirm in tests that the conditional header is included in signed headers. Capabilities expire after three hours. They permit only the fixed immutable uploads; they grant no list/delete/pointer write. Uploads include the signed required headers and refuse redirects, unexpected hosts, changed paths, altered signature parameters or expired capability documents.

Capability files contain bearer access and stay in fresh ignored local output and a private one-day GitHub artifact. Never print URLs, secret settings, response bodies or SDK request/error stacks. The workflow must refuse public repositories, non-main dispatches and unrecognized manifests before using secrets. It does not upload or select anything merely by minting URLs.

A 412 upload is an existing-object conflict. The uploader may record it and continue collecting outcomes; it never assumes identical bytes. The fresh verifier must authenticate every resulting remote object before any selection. Interrupted uploads can rerun with newly issued capabilities for the same immutable objects; no automatic deletion or overwrite is allowed.

## Remote verification and initialization

The second main-only workflow uses the existing R2 credentials to GET the pinned source index, compact bundle and all 766 source objects. It stream-checks exact lengths/hashes with bounded memory, even when metadata claims agreement. It performs no Census/USITC request, ZIP decompression or classification research. Any absent, oversized, corrupt or unavailable object blocks initialization.

Stage the bounded bundle members in a fresh owned output, invoke `recoverSelectedCountryRelease` with the recorded recovery authorization, and verify `readSelectedCountryRelease` from the recovered root. Require byte-identical package, acceptance record, local pointer and selection receipt, the fixed projection digest, and all original qualifications. Save a complete verification receipt and recovered compact files as short-lived private artifacts; these are verification evidence, not the durable backup.

After full verification, write the archive pointer with `If-None-Match: *`. Re-read/authenticate it after acknowledged or uncertain writes. Report initialized/confirmed/already-selected/unchanged/conflict/unconfirmed with the established state separately from receipt persistence. Never guess rollback or steal a pointer. A later read-only invocation validates the selected remote pointer and complete recovery again, with storage writes disabled.

## Operating sequence and capacity

Prepare a fresh local compact bundle and operator authorization; record their identities. Merge reviewed code with passing CI under standing owner permission. Issue the capabilities on main, authenticate/download the private artifact, run the local streaming uploader, then run fresh-runner verification/initialization and an independent read-only recovery. Compare all eleven protected local identities and product pointers before/after.

The full collection and accepted state need approximately 7.95 GB before small metadata. Confirm account-wide existing Standard storage leaves enough of the 10 GB allowance before live transfer. Check GitHub jobs' actual secret configuration without printing values. A failed access/capacity check leaves live transfer pending while implementation and local validation continue. No new account, permission grant, paid service, public bucket, source refetch or schedule is required.

## Later profile/publication work

After archive recovery succeeds, reuse the existing profile renderer through an explicit lifecycle presentation layer and a strictly authenticated accepted loader. Do not flip historical projection flags. A separate opt-in accepted local preview can be completed while live storage is pending; it must omit private metadata and accurately distinguish local acceptance from publication. Public route/navigation and hosting deployment follow verified durable retention and an explicit publication configuration. This archive milestone creates no route or deployment.

The first-release acceptance requirement for two successive official releases stays open until actual source/update evidence exists. The FT900 calendar currently schedules September 2026 for November 4, 2026; earlier October dates on that page belong to other products. Do not represent synthetic readiness as live acceptance.

Primary references: [R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [conditional S3 operations](https://developers.cloudflare.com/r2/api/s3/api/), [Standard allowance](https://developers.cloudflare.com/r2/pricing/), [FT900 calendar](https://www.census.gov/foreign-trade/schedule.html). These were checked October 12, 2026.
