# Failed-import evidence

The importer now retains a separate diagnostic artifact when retrieval or pre-promotion validation fails. This addresses the earlier cocoa failures' missing request identity and lost partial captures. It does not establish their historical cause or authorize another source run.

Request failures carry only allowlisted context: product, month, direction, dataset, summary, credential-free request URL, phase, attempt, HTTP status, elapsed time and transport code. Native JSON syntax errors are distinguished from body-read failures. Pair/duty reconciliation failures use task-level context rather than blaming the last response. Existing Census error messages, queries, three-attempt retry policy, 30-second signals and two-worker execution remain.

The CLI stages failure evidence under `.tmp/import-failure/<run-id>/`. Programmatic callers can opt in with `failureEvidenceRoot`. The producer records a capture only after its raw write completes. After both workers settle, it copies only that run's completed-write allowlist, rechecking file type, size, SHA256 and credentials. Raw envelopes and archive request grids remain unchanged; diagnostics never enter `raw/<release-id>/`.

The report plus retained captures cannot exceed 64 MiB, with 256 KiB reserved for metadata. Whole files that exceed the remaining budget are omitted and identified by a fixed reason code. Modified, missing, non-regular or credential-bearing files are withheld. Reports contain no response bodies, arbitrary exception messages, stacks, headers or absolute local paths. Completed raw captures are source evidence and can still fail validation; this artifact never constitutes an accepted release.

A fresh `report.json` is written last. Only then may the CLI emit a validated relative Actions path. The existing import workflow uploads a separately named seven-day `census-<product>-import-failure` artifact only when preflight succeeded, the import step failed and its ready output is nonempty. No credential is supplied to the upload step. The normal release artifact remains success-only.

The original failure stays authoritative if report creation, output emission or later lock cleanup fails. Worker cancellation and lock lifetime are preserved. A cleanup failure after successful pointer replacement still rejects the operation as before; it produces no false `releaseAccepted:false` report. Hard termination or unavailable storage can prevent diagnostics from being ready; an absent artifact does not imply no requests occurred.

Synthetic checks cover transport/status/body/JSON errors, unchanged retries, both-direction first-error cancellation, late siblings, duty validation, credential echoes, byte budgets, file tampering, run/path binding, ready output and pointer preservation. This milestone includes no live Census request, accepted-data change, R2 operation or website publication.
