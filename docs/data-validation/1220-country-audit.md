# Canada country audit evidence

## October 10 first live run: incomplete, no source acceptance

[PR #36](https://github.com/Vasuki8/us-trade-tracker/pull/36) added the isolated Canada audit after independent review. Exact-head [code checks](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38092795364) passed 504 tests, zero diagnostics across 133 files, a measured 19-file fixture build and 52 browser cases.

[Audit run 38093079916](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38093079916) used main commit `2cec05736b7401d4f81b0d3d00b1d3c1e5b5b25c`, country `1220` and end `2026-08`. It reached the 20-minute job limit. Its always-run upload retained a partial artifact successfully despite job cancellation. There is no completed `audit.json` or `country-dataset.json`.

The artifact's SHA-256 matches GitHub metadata. All 75 ZIP members independently match their extracted bytes: 74 logical Census request records and one official Canada HTML record. Every Census record has one attempt, null HTTP status and body in its attempt event, and convenience status `0`. No Census observations were returned. Recorded requests span September 2024–March 2026: 38 import parts and 36 export parts. The approximately 30-second failure intervals agree with the configured request timeout, but the original records do not retain the underlying transport cause.

The [official Canada table](https://www.census.gov/foreign-trade/balance/c1220.html) returned HTTP 200, retrieved `2026-10-10T22:55:08.802Z`, with `Last-Modified: Tue, 06 Oct 2026 12:35:31 GMT`. That response establishes public-table access, not access to keyed Census API data. Separate keyless local checks reached API metadata and received the expected missing-key HTML for both a known coffee query and the Canada query; they do not verify the GitHub runner, key validity or either keyed query contract.

**Verdict:** total-row contracts, HS6 coverage, reconciliation, monthly completeness, provisional shares and classification compatibility remain unverified. This run cannot support a country release or page. Both accepted coffee releases and pointers retain their original SHA-256 values. No R2 operation, publication or recurring job occurred. See the [machine-readable evidence](1220-country-audit-evidence.json).

## Bounded diagnostic follow-up

[PR #37](https://github.com/Vasuki8/us-trade-tracker/pull/37) added a 15-minute retrieval-step cutoff within the unchanged 20-minute job budget. Setup/checks and upload share the remaining budget; it is not a guaranteed five-minute upload window. Its [exact-head checks](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38093938902) passed all 504 tests and 52 browser cases. The first run's successful upload is retained as observed evidence, rather than retroactively described as lost.

A manually selected `connectivity-probe` now checks public API variables, the existing roasted-coffee world query and Canada's import/export total and HS6 queries for August 2026. It uses six logical checks with at most two in flight, existing bounded country HTTP retries, a four-minute step limit, fresh output, original credential-safe records and allowlisted transport codes. The limit covers the permitted 213-second request/retry schedule. It does not copy exception messages, accept a dataset or establish 24-month coverage even if every check passes. Local validation passed 511 tests and zero diagnostics across 135 checked files. Live probe evidence will be recorded after review and execution.

The full audit should resume after the diagnostic provides a concrete basis for retrying or correcting retrieval. Classification compatibility also needs separate reviewed evidence using dated [Census commodity concordances](https://www.census.gov/foreign-trade/data/dataproducts/concordance); matching numeric codes alone does not establish it.
