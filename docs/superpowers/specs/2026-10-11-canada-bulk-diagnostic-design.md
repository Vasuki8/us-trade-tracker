# Canada bulk diagnostic design

Prepared October 11, 2026, against main `3086cfd3d5267ac2122a19f3b9c1815a1783df73`. Proposed extension of the [approved country audit](2026-10-10-canada-country-audit-design.md), Task 3. This is a design for review; no bulk command, workflow or acceptance change is implemented.

## Purpose and recommendation

Establish whether fresh official monthly bulk files provide all 48 Canada total/breakdown contexts for September 2024–August 2026. Preserve the evidence needed to distinguish retrieval and aggregation failures from disagreements between published source versions. Canada profiles and rolling comparisons remain unavailable until source/reference and classification requirements are resolved separately.

Recommend a **local-first, isolated diagnostic**, retaining compressed originals on the existing workspace drive. Keep the current-reference acceptance check and pinned original-publication corroboration separate. A historical match cannot turn a current mismatch into success. The deliverable is a reproducible diagnostic report and independently replayed evidence, without a release, public page, production source switch or R2 write.

| Approach | Benefit | Limitation | Decision |
| --- | --- | --- | --- |
| Local bounded bulk diagnostic | Uses the already tested record contracts and existing local storage; avoids large Actions artifacts | Local runtime and retained files need explicit limits and recovery rules | Recommended |
| Full bulk run and original ZIP upload in GitHub Actions | Fresh hosted environment | Account allowance is unverified; multi-GB originals need runner disk and artifact budgets | Defer |
| Let an original-publication match override the current reference | Would bypass the known export mismatch | Aggregate agreement does not establish detailed observation vintages or compatible rolling periods | Do not adopt |

## Verified inputs and revision interpretation

The [five-context record](../../data-validation/1220-country-audit.md#five-context-bulk-validation-exact-totals-vintage-difference-retained) and its `bulkBoundaryValidation` evidence verified both record formats and every HS6 output at September 2024/August 2026 boundaries plus May 2026 exports. All five breakdowns sum exactly to their same-archive country totals. Four current-table comparisons match rounding. May exports are $29,790,835,759, versus $30,399,000,000 in their own current table and $29,790,800,000 in the retained original publication.

The [Census statistical guide, section 19](https://www.census.gov/foreign-trade/guide/sec2.html) distinguishes monthly end-use/aggregate revisions from annual detail revisions. It says revisions received from Canada are applied at detail level with the annual revision release. The [June FT900, physical page 7](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2606.pdf) explains that Canada's current-month estimate is replaced the following month in news-release exhibits. These procedures support a revision explanation for May; they do not label the vintage of every API or ZIP observation. A matching aggregate is corroboration, not proof of compatible revisions across all detailed products or periods.

The protocol therefore keeps four separate outcomes per month/direction:

1. **Retrieval contract:** a complete, identified original and valid text records, or unavailable with the actual reason.
2. **Exact aggregation:** HS6 sum versus the separate country member from that ZIP, with a signed residual. Missing/invalid inputs give null amounts and an unavailable check; valid unequal amounts give a mismatch. No rescaling.
3. **Current reference:** the matching monthly nominal USD goods total from this invocation's Canada table, compared at $100,000 precision and a $50,000 rounding bound.
4. **Original publication:** a separately pinned January–July 2026 export reference, verified from freshly retained original bytes under the [existing ledger](../../data-validation/1220-original-publications.md). Other contexts are not reviewed for this comparator. A changed or missing PDF makes it unavailable; it cannot reuse an old extraction without verified bytes.

Current and publication comparison outcomes must match the existing `compareCountryReferences` rounding rule, including half-quantum ties. Implement nonnegative dollar rounding with exact integers, avoiding Python's default half-to-even rounding or a wider inclusive tolerance. Keep the signed dollar differences alongside the checks.

May's known control must retain a current-reference mismatch alongside its original-publication match if the fresh inputs reproduce it. Neither metadata timestamps nor numerical agreement may assign an observation an invented revision date. No current figure is substituted as an HS6 share denominator. Future shares would use only the exact matching detailed source total after a separate release design.

## Retrieval and originals

Restrict the diagnostic to country `1220`, end `2026-08`, 24 months, imports `GEN_VAL_MO` and exports `ALL_VAL_MO`. Preflight validates these identities, the available interpreter, the output location and free space before any request. Create a fresh ignored directory exclusively under `data/backups/canada-country-audit/`; refuse an existing path. One invocation owns its entire evidence grid. Older runs, including the five samples, cannot fill gaps.

Retain nine official HTML originals: the data-products page; import/export historical indexes; import/export record layouts; country-subcode reference; statistical guide; and Canada tables before and after the ZIP work. Each expected ZIP URL must be uniquely observed in that invocation's retained official index, with HTTPS origin `www.census.gov` and the expected basename. Reject ambiguous links, alternate origins and redirects rather than inventing a download path. Request 48 ZIPs in chronological month order, imports then exports, and the seven fixed original-publication PDFs. There are **64 planned original requests**, with no retries and maximum one request in flight.

Hash and record every safe retained original or partial body, including its source URL, context, HTTP status/type, observed bytes, SHA-256, retrieval time, Last-Modified/HTTP Date where present, processing commit and outcome. Partial bodies are explicitly incomplete and never parsed as successful archives. Record actual attempts separately from requests skipped after a budget or source-preflight failure. A bad individual ZIP or PDF does not abort the remaining requests while the global budget permits them; a missing/invalid source index prevents only downloads whose links cannot be verified. Preserve diagnostic evidence on failure.

Both Canada tables are retained as full originals. Compare normalized requested monthly rows, not whole-page hashes, for reference stability. If an applicable figure changes or the final table is unavailable, retain both snapshots and their individual comparisons, but mark reference stability unavailable/mismatched and withhold overall strict-reference success. Never assemble one reference grid from selected rows of different snapshots. Stable displayed rows still do not prove an atomic revision vintage across 48 ZIPs.

## Processing contract

Use an optional **CPython 3.11+ standard-library diagnostic tool**, with no installed package or change to the Node website/import runtime. The first execution target is this Windows workspace; unsupported platforms fail preflight rather than using untested memory controls. Python's existing ZIP reader supplies streaming decompression and selected-member CRC verification; adding a JavaScript ZIP dependency or writing a new ZIP parser is unnecessary for this local audit. The development environment already supplied Python for the reviewed research replay. If the interpreter is absent, preflight fails without installation or requests. Implementation is a maintained audit tool only after review, not adoption of the earlier ignored research scripts.

Use the existing Node 24 runtime to emit a read-only JSON projection of `canadaReviewedPublications` for the diagnostic preflight. Validate its fixed seven contexts and retain its hash; do not duplicate the reviewed pins in Python, parse TypeScript source text or change the ledger to make an unverified PDF usable. The projection is generated metadata, not another original HTTP request.

Process one archive at a time in a separate child. Inventory all members, then stream only the unique root `IMP_CTY.TXT`/`EXP_CTY.TXT`, `IMP_DETL.TXT`/`EXP_DETL.TXT` and `HSDESC.TXT`, matching names case-insensitively. Validate safe unambiguous names, no encryption, size limits, selected-member CRC/SHA-256, ASCII/CRLF widths, calendar identity and nonnegative safe monthly integers. Other member CRCs are outside this contract; no extraction, executable, installer, summary or duplicate DBF contributes.

Imports use 688-byte detail records, value positions 179–193, and 580-byte country records, positions 131–145. Full-grain uniqueness includes HTS10, country, both source subcode characters, entry/unlading districts, rate provision, year and month. Retain documented alphabetic program subcodes. Exports use 323-byte detail records, positions 69–83, and 280-byte country records, positions 56–70. Their full grain includes domestic/foreign flag, Schedule B10, country, district, year and month; sum flags 1 and 2 exactly once. Check full-grain uniqueness across all countries before claiming a valid Canada aggregation.

Filter country `1220`, aggregate by the first six commodity digits, and retain all returned 98/99 statistical categories and explicit zeros. Use only unique exact six-digit descriptions from the 206-byte description member; parent entries do not contribute. An absent/blank description remains explicitly unavailable and does not delete a value. An absent product-month is not zero. Descriptions and matching codes do not verify classification continuity. The single separate Canada country member remains a **same-archive control**, not an independently compiled statistical source.

Write per-context normalized rows and receipts only after a full validated read; use exclusive staging files and record final file identities after successful completion. A killed or failed worker leaves any staging file explicitly incomplete. Root reporting ignores it as a successful normalized result. Complete originals survive worker failure. No accepted product/country pointer, release, archive or dataset path is writable by this diagnostic.

## Resource and retention budget

The five samples downloaded 697,503,386 original bytes in 108.987 seconds. ZIP sizes range from 156,371,524 to 227,480,759 bytes for imports and 72,005,838 to 123,408,639 for exports. Multiplying the observed smallest/largest directional pair by 24 gives **5,481,056,688–8,421,345,552 bytes**, roughly 5.5–8.4 GB, for 48 ZIPs. This is a sizing estimate, not a guarantee. The largest observed selected replay peaked at 387,104,768 bytes of Windows process working set; local child parsing took 3.057–14.757 seconds. Neither measure establishes Linux runner performance or committed memory.

| Proposed local limit | Exact value and behavior |
| --- | --- |
| Download concurrency | 1; no automatic retries |
| Headers / body | 30 seconds / 120 seconds, clamped to remaining work/finalization budget |
| ZIP / HTML / PDF body | 384 MiB / 1 MiB / 4 MiB; enforce observed bytes, not only Content-Length |
| All original bodies | 12 GiB (12,884,901,888 bytes), including partial bodies and references; stop further downloads at the cap |
| Generated outputs | 128 MiB (134,217,728 bytes), including rows, metadata, logs and reports; reserve 8 MiB of this for failure/final summaries |
| Disk preflight | At least 16 GiB free on the output volume before requests: 12 GiB originals plus output allowance and headroom |
| Ongoing disk guard | Stop new work if free space falls below 2 GiB; report the actual stopped/unavailable grid |
| ZIP inventory | At most 100 members and 3 GiB declared uncompressed bytes per archive |
| Full detail keys | At most 5,000,000 per archive |
| Parsing worker | At most 60 seconds, clamped to remaining work time |
| Child working set | Monitor at 250 ms intervals; terminate above 1 GiB; report sampled and peak values. This stop threshold is not an instantaneous OS memory limit |
| Invocation wall clock | 60 minutes: stop work at 55 minutes, reserve the final 5 minutes for the second reference and report. An exhausted budget yields a partial diagnostic, not promised completion |

Enforce caps during writes and retain bounded failure records if a source or output exceeds a cap. If the 55-minute work deadline arrives during a request/worker, cancel that operation, record its partial outcome and mark remaining contexts unattempted. Finalization performs at most one final-table request, then writes the report within its reserved time/bytes; it cannot start another ZIP or PDF. The permitted individual worst-case request schedule exceeds the overall budget, so the overall limit intentionally takes precedence.

Retain originals compressed in the fresh local directory; do not delete successful ZIPs after processing, automatically clean old runs, recompress the entire directory or upload it to GitHub/R2. Summaries and normalized outputs are smaller, but their hashes are not substitutes for originals needed by independent replay. Record actual complete/partial original bytes, selected streamed bytes, generated bytes, available disk, per-request and per-context time, child peak working set and stop reasons. No account spending, service, storage permission or schedule change is included.

GitHub currently documents **14 GB storage and 8 GB RAM** for private-repository `ubuntu-latest` runners; this is a runner specification, not a guarantee of free disk after setup. Its Free/Pro plans include **500 MB/1 GB** of artifact storage, shared with Packages, and additional storage can be billed. Account plan, current usage and available allowance have not been verified. Those limits support local originals for this diagnostic; they do not establish a paid Actions cost or justify changing the website host. See [runner specifications](https://docs.github.com/en/actions/reference/runners/github-hosted-runners) and [Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions), checked October 11, 2026.

## Report and acceptance boundaries

Create a versioned bulk-diagnostic report, a fixed 48-context outcome grid, the original manifest and per-context HS6 outputs/receipts. Include retrieval completeness, record-contract validity, exact residuals, current and publication comparisons, reference stability, description availability, statistical categories and resource outcomes. Counts distinguish planned, attempted, retained-complete, failed-partial and unattempted requests. No ranking or growth becomes a public result.

The report's overall `sourceCoverage` stays failed unless all 48 originals/contracts are usable, every exact residual is zero, every current comparison matches and reference stability passes. A nonzero residual or current mismatch remains a failure even with a matching original publication. Missing inputs or a resource stop cannot create a partial country total or a successful coverage claim. Always keep `classificationStatus=unverified`, `releaseAccepted=false`, `rollingComparisonsAvailable=false` and `defaultAuditRetrievalChanged=false`; even strict-source success does not accept a release. The earlier completed API audit and all 21 existing evidence fields retain their historical verdicts and values.

Report `diagnosticOutcome` separately: it passes only when all 64 planned originals are complete, their required source/reference/pin contracts validate, no budget is exhausted and strict source coverage passes. A missing or changed publication keeps its corroboration unavailable and the diagnostic failed even if the 48 data contexts meet the narrower strict-reference coverage check. This prevents a successful exit from hiding missing supporting evidence without substituting a historical amount into the current-reference gate.

The command exits nonzero for contract, coverage, resource, reference or stability failure while retaining the report. A fully reconciled grid with seven historical matches and seven current mismatches is still a failed strict-source audit, with useful narrower findings. This design deliberately does not redefine acceptance to make the known discrepancy pass. A future publication policy must explicitly address comparable detailed revisions and obtain the user's review before enabling a country release.

## Verification and handoff

Implementation follows written design review and a separate reviewed plan, with the root agent implementing and one fresh independent reviewer. Test controlled downloads and synthetic ZIPs for the two field/grain formats, all statistical/zero/missing cases, duplicate global keys, malformed/truncated/CRC-failing members, wrong calendars, unsafe values, missing descriptions, unexpected URLs/redirects, changed PDF pins and fresh-output protection. Exercise byte/time/disk/output limits, worker termination, partial-manifest retention and unattempted-context accounting with injected controls; do not consume the live budget to test failures.

Pin May's exact residuals, rounding (including both half-quantum boundaries), original-only corroboration and unchanged strict-source failure. Check both reference snapshots, including irrelevant HTML changes versus changed requested figures. Test all 48 context identities and all 64 original request identities without live network, plus the projection's exact agreement with the existing seven publication pins. Recheck accepted coffee hashes and existing audit workflow/code, run the existing suite/check/build/browser validation, and independently review the immutable implementation before merging.

Only then run a fresh local diagnostic. Independently verify every complete original and replay all complete contexts, with separate review of partial/unattempted outcomes. Record actual results before claiming full coverage, considering pipeline adoption, or designing the country release/archive/page. If the May mismatch persists as expected, report it directly and address source-version compatibility; do not repeat the same run to seek a different verdict.
