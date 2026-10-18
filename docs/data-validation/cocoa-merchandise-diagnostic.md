# Fixed cocoa merchandise diagnostic

This manual diagnostic investigates the earlier artifact-only cocoa import failures without accepting a new product release. Those failures did not identify a month, HTTP status or transport phase; their original cause remains unverified.

The command probes HS 180100 for September 2021 and August 2026, imports and exports, with separate HS and HSCY responses: at most eight requests, one attempt per context. It preserves the production merchandise query, including its `time` predicate. It does not call the retrying production fetcher, follow redirects, request duty data, or change accepted data.

Each request has one 30-second deadline covering response headers and streamed body reads. A complete body must fit within 1 MiB. The combined retained bodies and report stay below 8 MiB; 64 KiB is reserved for the report. Oversized, incomplete, invalid UTF-8 or credential-bearing bodies are withheld. Error status and safe non-JSON bodies are retained when they pass these controls. Exception messages, stacks, credential-bearing URLs and arbitrary response headers are excluded. Reports contain fixed request context, credential-free URLs, status, phase, allowlisted transport code, elapsed time, byte counts and SHA256 identities.

The fresh private output is `.tmp/cocoa-diagnostic/`, with `probe.json` and bounded `raw/*.body` files. Existing output is refused before any request. Safe reports are checkpointed after each attempt; a failed diagnostic still retains partial evidence. Each HS/HSCY pair is checked against the existing normalizer, with an additional check that rows match their requested summary. A passing pair is diagnostic evidence only. An empty HSCY 204 is explicitly marked, and neither that response nor normalization success proves source coverage, continuity or release acceptance.

The tracked workflow is manual and main-only, with no dispatch inputs. Tests, type checks and fixed-output preflight run without the Census credential. Only the retrieval step receives the existing `CENSUS_API_KEY` secret. The artifact contains only the fixed private output, retained for seven days.

Local checks without source access:

```text
npm test -- tests/scripts/cocoa-probe.test.ts tests/scripts/manual-workflow-runtime.test.ts --maxWorkers=2
npm run check
npm run data:probe-cocoa -- --preflight
```

The approved operation permits one dispatch from reviewed main and at most eight source requests. It does not reset the exhausted product-import retries. Do not rerun the source workflow under that allowance. Downloaded evidence must be checked against the Actions artifact digest, its declared member sizes and the report's per-body hashes before offline analysis. No R2 operation, product acceptance, accepted-data replacement or website publication is part of this diagnostic.
