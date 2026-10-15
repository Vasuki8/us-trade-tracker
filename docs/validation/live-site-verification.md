# Live-site verification evidence

Verified October 15, 2026 against implementation commit 61fc508d7bf8931d5d64867c75797b365daa4ec1. This milestone adds the tracked site:verify command; it performs no publication, restoration, data change or R2 operation.

## Local verification

All 1,249 unit tests passed across 97 files, including 65 new package/HTTP/CLI cases. Astro and TypeScript diagnostics reported zero errors, warnings or hints. The separate Python package suite passed all 24 tests.

The first full unit run passed 1,248 tests but the existing both_preparation_manifests_roundtrip_with_the_tracked_packager test exceeded its default five-second timeout at 5.344 seconds. It passed unchanged in isolation in 4.45 seconds. Its timeout is now 15 seconds to allow bounded process/filesystem startup margin; assertions and production timeouts are unchanged. The subsequent complete suite passed. This adjustment can delay detecting a hung integration test by up to ten seconds.

Tests cover real ZIP verification, malformed/changed/oversized inputs, unsafe paths, forged subprocess receipts, fixed origins, constrained redirects, body/status/header mismatches, private-route responses, stream failures, stalled bodies, late-response cancellation, occupied outputs and sanitized partial failure evidence. The CLI's actual nonzero exit is exercised in a child process with networking disabled. Automated tests use fixtures/mocked HTTP and require no live provider or private accepted data.

## Existing publication checked

The read-only run used canonical https://us-trade-tracker.pages.dev and the previously observed deployment https://660d1364.us-trade-tracker.pages.dev, deployment ID 660d1364-b7c9-4220-a1b4-c66ca9eae5da.

The retained research-handoffs package contains 31 entries and 1,693,100 raw bytes. Its 386,182-byte ZIP SHA-256 is 0b2c6e5e185d5b028a2bb87162b61a899d05758391890a5085ff8566ae931f7f; the 6,556-byte manifest SHA-256 is 6fee00416d3fd12768ca68105a347f3dc57a2907910df334000d6941adc6da58. Package runtime commit remains a05bfd407b447ba48c830866e9394a6a516077ec. Both originals and their bounded copies authenticated before verification; original hashes remained unchanged afterward.

A deliberate wrong ZIP pin against the real copied package produced a failed receipt with zero HTTP attempts. The first authorized live run then passed from 04:54:41.237 to 04:54:45.435 UTC on October 15:

- 68 of 68 logical checks: 60 served asset/error-page responses and eight private/missing-route responses.
- 98 HTTP attempts including 30 allowed redirects; no retries or second live run.
- All served responses matched manifest lengths and SHA-256 values; all private routes returned the exact 404 body with HTTP 404 and no redirect.
- All 68 final responses carried exactly noindex/nofollow tokens after normalization.
- 3,391,790 accepted decoded response bytes across both origins, within the planned bounds.

The private success receipt SHA-256 is 7fd633fd33bf9331fcd9805efd27f25168b844570656c163fa8f375659dd64e6. Useful receipts, package copies, test logs and the execution ledger are preserved privately at closeout; independent review, exact-head CI and merge evidence belong to the accompanying PR and private completion record.

## Interpretation and limits

The verifier establishes response-byte/header/private-route agreement with the operator-selected artifacts at the time checked. It cannot establish package approval, source-data correctness, numerical/browser behavior or the provider's current Production assignment. Existing research acceptance remains separately applicable; this tooling-only change required no new site build or numerical/browser replay locally. Standard CI retains its existing build/browser checks.

The tool accepts site packages only and fixes the canonical project/observed deployment-origin format. It has no public URL override, authentication, retry, upload or rollback option. Fresh proof directories remain inside the executing checkout's ignored .tmp scope. Failures produce a safe code and partial evidence where that can be written safely; occupied/unsafe outputs are not overwritten. The byte limit bounds accepted decoded payload, not exact network transfer before cancellation.
