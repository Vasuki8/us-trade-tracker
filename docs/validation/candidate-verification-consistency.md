# Candidate verification consistency

Prepared October 16, 2026. This local checkpoint covers the existing coffee archive tooling, using synthetic fixtures only. It changes no application output, accepted data, workflow, schema, CLI option or remote promotion condition. Actual independent review, exact-head CI, merge and archive/cache cleanup are recorded later in the single implementation PR and private completion/readback evidence.

## Problem and resulting behavior

Previously, offline `verify` parsed `candidate.json` and recovered `bundle.json` using its checksum. A syntactically valid candidate could name a different same-month release key or a different predecessor reference while still supplying the correct bundle checksum. Offline recovery could then create a local pointer even though promotion's existing identity checks would reject that pair. This was a disagreement between local checks; remote promotion already rejected it safely.

`decodeCandidateBundle` now normalizes candidate state, validates the bundle checksum/product and checks the exact release identity and predecessor reference against the bundle manifest. `recoverCandidate` completes those checks before calling the existing recovery writer. CLI `verify` uses that path. A mismatch rejects before creating any recovery directory, raw file, processed release or pointer.

Promotion uses the same decoder for its existing local checks. It still validates the backup receipt before reading the candidate bundle, reads back identical remote candidate bytes before a pointer write, and uses the original baseline ETag or initialization condition. Conflicts, unreadable/lost responses and local receipt failures retain their existing outcomes.

Bare `recoverBundle` and CLI `recover` retain their independently supplied checksum contract. They do not require a candidate file. Legacy roasted candidate states, version 1 and duty-enabled version 2 bundles, valid initialization and product-specific recovery remain supported.

## Unchanged operator command and limits

Preserve the original downloaded pair, file hashes and artifact receipt. In a fresh run directory containing both files, use:

```text
npm run data:archive -- verify --product 090121 --data-dir <fresh-recovery-directory> --run-dir <downloaded-run-directory>
```

Choose the intended product explicitly. The recovery destination must be empty or absent. Successful output keeps the existing `{releaseFile}` shape; recovered fixture files remain byte-identical to the originals and the generated pointer names the verified release. Occupied destinations are refused without overwriting their contents.

If verification rejects a pair, retain the failed inputs and recover the matching original state/bundle from its recorded backup. Do not edit metadata to make a mismatched pair pass. Re-running an import creates a different candidate. Verification itself constructs no provider client, needs no credentials and performs no Census or R2 request.

A passed check establishes agreement between these supplied local files. It does not authenticate their artifact receipt or independently prove official-source validity. The baseline reference is checked against the manifest; the saved ETag's current remote validity cannot be established offline. Promotion still needs its own authorized exact candidate, successful artifact receipt, identical remote bytes and conditional pointer write. Offline success is neither acceptance nor permission to promote.

## Verification

The focused baseline passed **31 tests**. Three new direct decoder tests failed with the helper absent and passed after implementation: **34/34** owning tests. They cover exact release/predecessor binding, null-baseline initialization, malformed or crossed state, checksum corruption and another synthetic product, while existing promotion failure/outcome tests remain green.

Credential-free CLI regressions then reproduced five accepted mismatches before the fix: changed same-month release key, changed predecessor checksum, changed predecessor key, missing predecessor and unexpected predecessor. After the fix, all **85 tests across four focused suites** passed. Each invalid case requires rejection, no recovery destination/pointer, zero provider-factory calls and unchanged supplied pair/source bytes. Corrupted bundle bytes also reject.

Valid baseline-aware, initialization and legacy-state cases check exact release and all 240 synthetic source-record bytes plus the pointer. A second synthetic product uses explicit test-only registry selection. The duty-enabled case checks all 337 original fixture members. Occupied markers, bare recovery, candidate-only behavior, workflow backup ordering, backup receipts, stale ETags, conflict/unknown outcomes and receipt persistence safeguards remain covered by their existing tests. All source fixtures are synthetic; no retained official raw responses were replayed.

Full local verification passed **1,566 tests across 111 files** and `npm run check` reported zero errors, warnings or hints. The first full run had 64 failures caused by the omitted required `SITE_PACKAGE_PYTHON` setting and five-second staging/assembly test limits. Three unchanged diagnostic cases passed after supplying the locked Python path and a 30-second local Vitest test allowance; the complete rerun then passed. No source or test logic changed to address those setup failures, and no production deadline changed. Actual failed and passing logs are preserved.

The seven accepted and eleven protected input identities are independently authenticated before/after, using the completed PR111 evidence. Private proof is bounded under `data/backups/candidate-verification-consistency/verification-20261016-r1` to 500 files/32 MiB. No canonical data copy, new source validity claim, remote archive operation or website publication is included. Real-user observations and successful updates across successive official releases remain open.

## Integration checkpoint

This committed record is the local verification checkpoint. The one PR and private finalization will record actual review, exact-final-head push/PR Code checks, expected-head merge, clean-main binding, native archive/checkout absence and completed-log/cache cleanup. Queued archival is not completion. No second bookkeeping-only PR or website deployment is needed for this tooling change.
