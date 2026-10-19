# Private Mexico all-goods archive

This tooling handles only Mexico2010, September2024–August2026, nominal integer USD. Imports are general-import customs GEN_VAL_MO; exports are total domestic-plus-foreign FAS ALL_VAL_MO. Product comparisons, classifications and a public Mexico profile remain unavailable. Statistical exclusions remain included in country totals.

The approved execution authority is the [six-task plan](../superpowers/plans/2026-10-18-mexico-private-acceptance-archive.md) and its exact input companion. This operator contract describes the enforced boundaries; the dated outcome below links the separately observed evidence.

## State and evidence

The immutable candidate retains classificationAccepted:false, releaseAccepted:false and publicMexicoProfile:false. The new owner-authorized acceptance instrument is a separate decision. Only a fully authenticated, recovered and read-back current.json selects accepted-private-all-goods with allGoodsAccepted:true. Its product/public/classification flags stay false.

The archive preserves the exact candidate and28 reviewed records, a retained all-goods evidence archive. It omits original national ZIPs, commodity rows, original reference bodies and other historical proof members. Prior preservation/review records remain attestations; absent original bodies are not newly verified.48 current-reference controls agree; dated controls contain16matches/32differences. Original vintage, causes and continuity remain unestablished.

Three immutable JSON objects live below trade/v1/countries/2010/private-all-goods/objects/. Their exact identities determine their keys. The sole fourth write is initialize-only current.json. Nothing lists, deletes, replaces a marker, uses Canada defaults, requests Census data or activates website consumers.

## Commands

Use locked Node24 and installed dependencies. The commands accept no repo/country/endpoint/pin override. Paths may be absolute or relative to this checkout; aliases, unknown/repeated arguments, occupied outputs and symlinked ancestors fail closed. --preflight performs no writes or provider requests.

- npm run data:mexico-archive -- keygen --output .tmp/mexico-private-archive-20261018-r1/recipient
- prepare --input-dir data/backups/mexico-country-release/private-acceptance-archive-20261018-r1/inputs --authorization data/backups/mexico-country-release/private-acceptance-archive-20261018-r1/authorization.json --output data/backups/mexico-country-release/private-acceptance-archive-20261018-r1/prepared
- upload or readback: --archive-dir, --capability-artifact, --artifact-proof, --key-file, --output
- capabilities: --descriptors (compact canonical JSON, with or without one final newline), --recipient-public-key (SPKI base64), --output; actual reviewed main workflow only
- verify-initialize: --manifest-sha256, --manifest-bytes, --output; actual reviewed main workflow only
- verify-selected: --output; no identity/initialization override
- npm run data:accept-mexico-all-goods -- --archive-dir --pointer-file --verification-file --output (each followed by its exact private path)

Prepared output contains archive/ with candidate.json,evidence.json,manifest.json plus descriptors.json and preparation.json outside that exact three-file set. Readback output contains an authenticated archive/, selected-pointer.json, an isolated recovery and transfer.json. Installation consumes two separately observed remote receipts and the local readback receipt, with three distinct recovery IDs selecting the same exact marker. The verification packet has schemaVersion:1, initialization, selected and localReadback. Provider truth of those observations is an operator/independent-review gate, not established by a string claiming verification.

Canonical installation is first-only under data/countries/2010/processed. It verifies ownership, exact file sets, sync/close/staged/full readbacks and final pointer. Exact existing state is recognized only after complete authentication; any unknown occupied state conflicts. Partial or uncertain state stays preserved, and a late receipt failure carries the established outcome. No automatic rollback or repeated write follows an ambiguous result.

## Encrypted capabilities and provider authentication

The public capability workflow receives only exact descriptors and one ephemeral X25519 public key. Before credentials are read, it validates the actual main head, repository/workflow/run identity, descriptor grammar and recipient including low-order rejection. Existing R2 Secrets never leave GitHub.

Native composition: fresh X25519 sender key, HKDF-SHA256, random32-byte salt, AES256GCM, random12-byte nonce,16-byte tag. HKDF info is UTF8 us-trade-tracker/mexico-archive-capabilities/v1, a NUL byte and SHA256(canonical context). Full canonical context is also GCM authenticated data. Context binds repository, workflow path, reviewed head, run/attempt, recipient fingerprint, descriptors and3600-second validity. Issuance is normalized to the SigV4 whole second. Required PUT headers (length, JSON type, If-None-Match:*, digest metadata) are signed. Metadata is never content proof.

Encryption protects confidentiality, not sender authenticity. Independently inspect GitHub's repository/workflow/run/attempt/head/success, artifact ID/name/expiry and provider ZIP SHA256 before download/extraction or decrypting. Save the actual API observations privately. Do not copy context from the blob and label it provider-authenticated. Verify the actual runtime/file map matches the reviewed merged main.

Bounded ZIP extraction allows exactly ciphertext.json and metadata.json as ordinary root files: no paths, duplicates, links, extra entries or traversal. ZIP at most256KiB; decoded files together at most128KiB, metadata at most16KiB. Hash the downloaded ZIP against the provider digest and preserve original ciphertext. The independent artifact-proof record binds observed provider fields, zipIdentity and extraction:{zipIdentity,members}, with each member name/bytes/SHA256. The code checks internal binding to that independently observed record; it cannot prove a caller's claimed provider observation.

Decrypt only in memory. Public artifacts contain ciphertext/public metadata (one day) or an allowlisted verification summary (seven days,16KiB); no signed URL, private key, raw recovery, error object or private local path. CLI stdout/stderr are bounded status/generic errors. Redirects/foreign hosts/extra headers or permissions fail closed. Presigned URLs can be reused until expiry; durable per-object admissions and one-attempt transport enforce this batch's no-repeat-write rule.

The key directory is owned and restricted before key writing (Unix0700/0600; Windows owner-SID ACL without inherited access). Dispose of the owned private-key file immediately after the final required decryption, or at expiry when stopped, after verifying its owned path/identity. Retain only fingerprint, expiry and actual disposal receipt. This is file disposal, not a claim of secure physical erasure.

## Bounded real execution

No real operation is authorized by a unit test. Before each actual dispatch/operation, durably record admission, actual protected pins, remaining counts/time/bytes, process ownership, disk and target/cost observations. The external operator/checker authenticates provider truth and keeps failed attempts.

Batch: four manual dispatches maximum (three primary, one shared replacement);32HTTP attempts/64MiB bodies; three immutable PUT attempts plus one marker PUT attempt;16MiB/four objects growth; account storage below100GB and estimated incremental charges at mostUS$5. No automatic SDK/HTTP retry. Uncertain writes consume their attempts and are resolved only by GET. A mismatch in data/pins/scope stops advancement.

Transport reservations allocate at most8attempts/24MiB to upload,8/12MiB each to initialize, selected and independent local readback:32attempts/60MiB, within the batch caps. Each write reserves two GET attempts/body allowance. Actual counts include error bodies; unknown outcomes consume reserved allowances. Any replacement must fit unused allowance under the single shared failure rule; it does not reset any ceiling or permit a second object PUT.

Three real recoveries plus first installation; one shared replacement, at most five admissions. Per-operation300s plus3s cleanup, cumulative1200s, preparation/transfer30active minutes excluding review/CI waits. Remote commands use external timeout; Linux heap512MiB plus recorded peakRSS is not a native1GiB RSS enforcement claim. Local Windows operator must enforce a1GiB owned process-tree ceiling and303-second wall ceiling; record admissions/time/termination honestly. New durable private proof at most256MiB; at least512MiB free after writes.

A marker is selected only after complete object/member authentication and prospective isolated recovery, one conditional initialization and exact full marker GET. A fresh runner independently follows the marker with PUT blocked; local readback uses four GETs and a third selected recovery before installation. Missing/unreadable post-write markers remain unconfirmed; only an observed differing marker establishes conflict. Neither ETags nor caller booleans establish acceptance.

## Current outcome

**October 19, 2026:** private all-goods acceptance, archive verification and first canonical installation are confirmed. [Sanitized evidence](../data-validation/2010-private-acceptance-evidence.json) records the exact object/marker hashes, three recoveries, independent checks and resource use. The immutable candidate retains its historical false flags; the separate selected marker has allGoodsAccepted:true. Every classification/product/public-profile flag remains false.

| Observed stage | Evidence |
| --- | --- |
| Encrypted capabilities | [Run 39198002594](https://github.com/Vasuki8/us-trade-tracker/actions/runs/39198002594), reviewed merged runtime 3ff5cec |
| Initialization | [Run 39198257368](https://github.com/Vasuki8/us-trade-tracker/actions/runs/39198257368), prospective recovery before the sole marker PUT and full selected-marker readback |
| Fresh read-only verification | [Run 39198421800](https://github.com/Vasuki8/us-trade-tracker/actions/runs/39198421800), distinct runner/recovery, zero PUTs |
| Local readback and installation | Four GETs, third recovery, then first installation; exact four-file closure and 22 protected pins independently checked |

The closed transfer batch used 21 HTTP attempts (17 GET / 4 PUT), 42,125,887 combined body bytes and 8,425,152 stored bytes, within every approved ceiling. Three dispatches and four real state admissions used no replacement. The shared repair allowance was spent on [PR 137](https://github.com/Vasuki8/us-trade-tracker/pull/137), accepting the GitHub form’s canonical descriptor input with an optional terminal newline. The owned private-key file was disposed after final use and before expiry; no physical-erasure claim is made.

Post-install checks passed 2,035 unit tests, static checks and 220 existing browser tests. The fixture build has 28 files/867,534 bytes; the bounded real four-product/Canada build has 37 files/2,817,164 bytes, largest 352,232 bytes. Both are below the 15,000-file alert and exclude Mexico country routes/private archive output. Existing accepted datasets and product selection remain unchanged. No site package, website upload or public Mexico profile was created. Final evidence integration, preservation and cleanup are recorded separately after observation; this outcome does not preclaim them.

References: [Node crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html), [R2 presigning](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [R2 S3 compatibility](https://developers.cloudflare.com/r2/api/s3/api/), [artifact authentication](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts).
