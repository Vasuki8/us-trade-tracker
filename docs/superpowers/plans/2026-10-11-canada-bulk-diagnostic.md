# Canada Bulk Diagnostic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce reproducible evidence for all 48 September 2024–August 2026 Canada bulk-data contexts, while preserving failed current-reference checks and withholding country acceptance.

**Architecture:** A Node launcher projects the existing publication ledger and starts an optional Windows Python diagnostic. Separate standard-library modules own scope/storage, public retrieval, ZIP contracts, reference checks and bounded child supervision. One fresh invocation retains compressed originals and a complete outcome grid, including partial and unattempted work.

**Tech Stack:** Existing Node 24/TypeScript/Vitest; optional CPython 3.11+ standard library (`unittest`, `zipfile`, `http.client`, `html.parser`, `ctypes`). No installation, package dependency, Actions workflow or website-runtime change.

**Spec:** [Approved written design](../specs/2026-10-11-canada-bulk-diagnostic-design.md), merged in PR #55; user continued after the written-spec handoff. Planning baseline: `c8ce42bfb8217963d8a43b8eff5ab7d40235fad4`.

**Execution method:** Native: the root implements all tasks; one fresh independent reviewer checks the immutable implementation before merge. Subagents review only. This plan awaits the user's written-plan review; no implementation or live retrieval is authorized by this planning document alone.

## Global Constraints

- Country `1220`, end `2026-08`, 24 months, imports `GEN_VAL_MO`, exports `ALL_VAL_MO`; fixed 48-context grid.
- Fresh exclusive ignored output under `data/backups/canada-country-audit/`; no old-run gap filling, accepted release/pointer/archive writes, production source switch, public page, R2 write, schedule, deployment, spending or access change.
- Windows workspace only; CPython 3.11+ and Node 24 already available. Unsupported platform/missing interpreter fails before requests; never install a runtime.
- Invoke every Python process with `-B` and `PYTHONDONTWRITEBYTECODE=1`; no interpreter cache or generated file may bypass the fresh-root output accounting.
- 64 planned original requests: 48 ZIPs, nine HTML originals and seven PDFs. Maximum one request in flight, no retries, HTTPS `www.census.gov`, no redirects.
- Headers / body: 30 seconds / 120 seconds, clamped to the remaining work/finalization budget.
- ZIP / HTML / PDF observed body caps: 384 MiB / 1 MiB / 4 MiB. All original bodies, including partials: 12 GiB (12,884,901,888 bytes).
- Generated outputs, including staging, metadata, logs and reports: 128 MiB (134,217,728 bytes); reserve 8 MiB for failure/final summaries.
- Disk preflight: at least 16 GiB free. Ongoing disk guard: stop new work below 2 GiB.
- ZIP inventory: at most 100 members and 3 GiB declared uncompressed bytes per archive; at most 5,000,000 full detail keys.
- Parsing worker: at most 60 seconds, clamped to remaining work time. Sample child working set every 250 ms; terminate above 1 GiB. This is a sampled stop threshold, not an instantaneous OS limit.
- Invocation: 60 minutes, stop work at 55 minutes and reserve five minutes for one final table request and reporting; no further ZIP/PDF work in finalization.
- Exact safe integer monthly values, explicit zeros and all returned 98/99 categories survive aggregation. Missing descriptions/months are unavailable; no rescaling, inferred classification or invented revision dates.
- Both current snapshots use the existing `compareCountryReferences` nonnegative half-up rounding rule. Original-publication corroboration cannot override current-reference failure.
- `classificationStatus=unverified`, `releaseAccepted=false`, `rollingComparisonsAvailable=false`, `defaultAuditRetrievalChanged=false` always. All 21 historical evidence fields and four accepted coffee hashes remain unchanged.

## Review Focus

- A server sends a body slowly or without Content-Length: actual byte and absolute phase deadlines stop it, retaining the safe partial body and marking subsequent work correctly (Task 2).
- An output ancestor is a Windows junction/reparse point, or another invocation occupies the destination: reject before network and keep accepted paths untouched (Task 1).
- A selected member has an enormous malformed record or a duplicate belongs to another country: bounded record reads and global full-grain validation reject it without a Canada-only shortcut (Task 3).
- Current-table markup changes without changing figures, or one requested figure changes during retrieval: normalize complete requested rows, retain both snapshots and distinguish stable figures from drift (Task 4).
- A worker cannot be measured, exits between samples, or its supervisor is cancelled: terminate owned children, account for staging bytes, withhold normalized success and preserve final-report headroom (Task 5).

## File Map and Shared Interfaces

| File | Responsibility |
| --- | --- |
| `scripts/project-canada-publications.ts` | Pure versioned projection of the existing seven pins; guarded stdout CLI |
| `scripts/diagnose-country-bulk.ts` | Validate CLI/interpreter/platform, supply projection and invoke Python without a shell |
| `scripts/country_bulk/__init__.py` | Package marker; no side effects |
| `scripts/country_bulk/model.py` | Fixed identities, limits, dataclasses and report schema |
| `scripts/country_bulk/storage.py` | Fresh output, safe bounded writes, byte/disk accounting and file identities |
| `scripts/country_bulk/sources.py` | Fixed source requests, observed ZIP links and retained layout contract validation |
| `scripts/country_bulk/transport.py` | Serial no-redirect streamed HTTP and partial evidence |
| `scripts/country_bulk/contracts.py` | Exact ZIP member and full-grain/HS6 record validation |
| `scripts/country_bulk/references.py` | Canada tables, pin checks, rounding, stability and coverage outcomes |
| `scripts/country_bulk/worker.py` | One private bounded archive-processing entry point |
| `scripts/country_bulk/runner.py` | Windows worker measurement, scheduling, cancellation and final reports |
| `tests/bulk/helpers.py`, `tests/bulk/test_*.py` | Small synthetic HTML/ZIP/HTTP/process fixtures and standard-library tests |
| `tests/scripts/country-bulk-launcher.test.ts` | Projection, CLI and launcher boundaries using injected process adapters |

Use dataclasses internally and JSON-compatible dictionaries only at file/child boundaries. `Context` contains `country_code`, `month`, `direction`, `measure`, `basename`, with a stable ID such as `imports-2024-09`. `RequestSpec` contains `id`, `kind`, `url`, `filename`, nullable `context_id` and `maximum_bytes`; ZIP URL is null until observed. `OriginalRecord` records planned/attempted state, complete/partial/failed/unattempted outcome, allowlisted reason, UTC times, phase duration, status/type, HTTP dates, retained bytes/hash/file and processing commit. Complete transport is separate from a valid source contract. `FileIdentity` is relative path, bytes and SHA-256.

Use request kinds `zip`, `html`, `pdf`. `HS6Row` has `commodity`, nullable `description`, `value_usd`, `detail_record_count`, `special`; `ArchiveResult` names its values `rows`, `sum_usd`, `country_total_usd`, `residual_usd`. `Comparison` has `reference_check`, `publication_check`, `reference_corroboration` and signed nullable current/publication differences. JSON serialization maps these to the existing camel-case evidence vocabulary and keeps unknown amounts null.

`Budget` owns monotonic start/deadlines and cumulative original/generated bytes. `EvidenceStore` owns only the fresh root and exclusive writes, including a separate final-summary allowance. `ArchiveResult` contains context, selected-member receipts, full-key counts, sorted HS6 rows, exact sum/country total/residual and descriptions/statistical/zero observations. `WorkerOutcome` has validated/failed/stopped state, bounded reason, sampled/peak working set and optional final `ArchiveResult` file identities. Failed staging files never become a result. Final `BulkReport` schema version 1 contains all 48 contexts, all 64 requests, both snapshot identities, comparisons and resource/acceptance flags. `ResourceSummary` records used limits, elapsed/phase time, original/generated/selected bytes, available disk, sampled peaks and stops. `RunOptions` holds the fixed scope, resolved repository/output roots and processing commit.

Inject `Controls` with monotonic/UTC clock, `free_space(path)->int`, transfer/worker factories and `sample_memory(pid)->tuple[int,int]`. `Budget.remaining_work()->float`, `remaining_overall()->float`, `charge_original(bytes)->None`, `charge_generated(bytes, final=False)->None` and `stop(reason)->None` are shared; production caps never come from public CLI overrides. `LauncherAdapters` supplies platform/version/clock and argument-array interpreter/supervisor operations so Vitest can test boundaries without an installed Python runtime or network.

## Task 1: Fixed Scope, Publication Projection and Output Boundary

**Files:** Create `scripts/project-canada-publications.ts`, `scripts/country_bulk/__init__.py`, `model.py`, `storage.py`, `tests/bulk/helpers.py`, `tests/bulk/test_scope_storage.py`, and projection tests in `tests/scripts/country-bulk-launcher.test.ts`. Read `scripts/country-publications.ts`; do not modify its ledger.

**Interfaces:** `projectCanadaPublications(): {schemaVersion:1; countryCode:'1220'; publications:ReviewedPublication[]}` returns copies of the existing seven entries. Python `contexts() -> tuple[Context, ...]`, `validate_projection(payload: dict) -> tuple[PublicationPin, ...]`, `preflight_output(repo_root: Path, output: Path, free_bytes: int) -> Path`, and `EvidenceStore.create(root: Path, budget: Budget) -> EvidenceStore` establish later inputs. `EvidenceStore.write_json(name: str, payload: object, final: bool=False) -> FileIdentity` and `open_bounded(name: str, category: str, maximum_bytes: int) -> BoundedWriter` account for every byte, including failed writes.

- [ ] Write `test_fixed_grid_and_limits`: assert 48 ordered unique contexts, first September 2024 imports/exports, last August 2026 imports/exports, exact measures and every global limit. Reject another country/end/window and missing, duplicate or crossed publication contexts.

```python
grid = contexts()
assert len(grid) == 48
assert (grid[0].month, grid[0].direction, grid[0].measure) == ('2024-09', 'imports', 'GEN_VAL_MO')
assert (grid[-1].month, grid[-1].direction, grid[-1].measure) == ('2026-08', 'exports', 'ALL_VAL_MO')
```

- [ ] Write projection tests: exact deep agreement with `canadaReviewedPublications`, seven export months, no duplicate pin copy, no import side effects and no network. Write output tests for existing empty/nonempty paths, traversal, sibling-prefix confusion, junction/reparse ancestors, concurrent creation, low space and byte caps including the 8 MiB reserve.

```typescript
expect(projectCanadaPublications().publications).toEqual(canadaReviewedPublications);
expect(projectCanadaPublications().publications).toHaveLength(7);
```

- [ ] Run `node --import tsx node_modules/vitest/vitest.mjs run tests/scripts/country-bulk-launcher.test.ts` and `& $bulkPython -B -m unittest discover -s tests/bulk -p 'test_scope_storage.py' -v`; confirm missing implementation fails. `$bulkPython` is the already available absolute interpreter path, not a WindowsApps stub.
- [ ] Implement the named interfaces. Use resolved containment plus reparse checks for existing ancestors and exclusive fresh creation; never follow output links or overwrite. Validate projection fields/safe integers/HTTPS identities and seven fixed month identities; values/digests come exclusively from the projection. Store its generated-file hash under output accounting.
- [ ] Run those focused tests to green; commit the Task 1 files. Keep the public diagnostic command absent until Task 5.

## Task 2: Official Source Discovery and Bounded Original Retrieval

**Files:** Create `sources.py`, `transport.py`, `tests/bulk/test_sources_transport.py`; extend `model.py`/`storage.py` only for the above request records and budget interface.

**Interfaces:** `planned_requests(pins: tuple[PublicationPin, ...]) -> tuple[RequestSpec, ...]` defines 64 identities; `discover_archive_url(pages: dict[str, bytes], context: Context) -> str` uses only same-invocation retained indexes; `validate_layout(html: bytes, direction: str) -> LayoutContract` pins required fields/widths. `retrieve(spec: RequestSpec, store: EvidenceStore, budget: Budget, transport: Transport) -> OriginalRecord` retains safe complete/partial bytes. `Transport.start(spec)->Transfer`; `Transfer.poll(seconds)->TransferEvent|None` returns bounded headers/body/end/error events and `Transfer.stop_and_join()->None` ends its owned child. Production performs `http.client.HTTPSConnection` with standard verified TLS in a private child; the parent owns original writes/hashes and absolute phase cancellation, so blocking DNS or slow headers cannot bypass its deadline. One transfer must end before another starts.

- [ ] Write tests asserting eight initial HTML requests, seven pin PDFs, 48 chronological ZIPs and one final HTML request, exactly 64 identities. Pin URLs for data-products `/foreign-trade/data/dataproducts.html`, histories `/foreign-trade/data/IMDB.html` and `/foreign-trade/data/EXDB.html`, layouts `/foreign-trade/reference/products/layouts/imdb.html` and `exdb.html`, subcodes `/foreign-trade/reference/codes/csc.html`, guide `/foreign-trade/guide/sec2.html` and before/after table `/foreign-trade/balance/c1220.html`, all at `https://www.census.gov`.

```python
requests = planned_requests(pins)
assert len(requests) == 64
assert [r.kind for r in requests].count('zip') == 48
assert [r.kind for r in requests].count('html') == 9
assert [r.kind for r in requests].count('pdf') == 7
```

- [ ] Test unique observed URL resolution across applicable data-products/history indexes, repeated identical links versus two distinct URLs, missing links, wrong basename/month, userinfo/port/query/fragment/alternate origins, redirects and wrong HTTP/type. Test complete EOF, truncated declared length, missing length, unsafe header text, stalled headers/body and a slow trickle exceeding the absolute 120-second body deadline.
- [ ] Test observed per-kind/global byte caps including retained partials, cancelled in-flight work, disk guard and generated metadata limits. Assert no retries, one in-flight operation, failed individual requests preserve progress, and index failure skips only unverifiable ZIP identities. Distinguish attempted-but-no-body from unattempted.
- [ ] Run `& $bulkPython -B -m unittest discover -s tests/bulk -p 'test_sources_transport.py' -v`; confirm red before implementing.
- [ ] Implement the interfaces with `html.parser` for links/layout tables; resolve observed relative links against their retained source URL, deduplicate identical canonical URLs and require exactly one allowed URL. Validate fresh layout widths and used field positions against Task 3's fixed contract, retaining incompatible originals without adopting new positions. Preserve documented alphabetic subcodes. Source-page/PDF contract failures remain explicit; no synthesized ZIP URL or old original.
- [ ] Stream events with body chunks at most 64 KiB over a bounded pipe; the parent polls/cancels at the absolute header/body/global deadlines and enforces actual byte/disk/output allowances before writing. Reject oversized/malformed IPC messages. Disable redirects and content decompression; stop/join the transfer child on every failure. Parent-owned incremental hashes identify retained partial bytes even after child termination. Keep bounded allowlisted errors/provenance; no arbitrary exception text or response headers beyond fixed metadata. Real Windows child ownership is integrated and exercised in Task 5; Task 2 uses injected transfers.
- [ ] Run focused tests to green and the Task 1 tests; commit.

## Task 3: Streaming ZIP Contracts and Exact HS6 Aggregation

**Files:** Create `contracts.py`, `worker.py`, `tests/bulk/test_contracts.py`; use synthetic ZIP helpers in `tests/bulk/helpers.py`.

**Interfaces:** `parse_archive(path: Path, context: Context, layout: LayoutContract, limits: Limits) -> ArchiveResult` reads only selected text members; `write_worker_result(result: ArchiveResult, store: EvidenceStore, output_allowance: int) -> dict[str, FileIdentity]` stages bounded rows/receipt and publishes identities only after all reads validate. `worker.main(args: list[str]) -> int` accepts private context/root/manifest/granted-output inputs, not arbitrary accepted-data paths.

| Record | Fixed byte contract (one-based inclusive) |
| --- | --- |
| Import detail | 688 bytes; HTS10 1–10, country 11–14, subcode 15–16, entry 17–18, unlading 19–20, rate 21–22, year 23–26, month 27–28, `GEN_VAL_MO` 179–193; full key first 28 bytes |
| Export detail | 323 bytes; DF 1, Schedule B10 2–11, country 12–15, district 16–17, year 18–21, month 22–23, `ALL_VAL_MO` 69–83; full key first 23 bytes |
| Import/export country | 580 / 280 bytes; code 1–4, name 5–34, year 35–38, month 39–40; monthly value 131–145 / 56–70 |
| Description | 206 bytes; code 1–6, description 7–156; exact six-digit entries only contribute descriptions |

- [ ] Write positive import/export fixtures with multiple full-grain rows per HS6, alphabetic program codes, both export DF flags, explicit zero details/HS6, all returned 98/99 rows, other countries and absent/blank descriptions. Assert every normalized row, dimensions/counts and exact separate country residual, without manufacturing absent products.

The smallest import fixture has Canada values `090111=0`, `090121=10`, `980110=2`, with `090121` split across two distinct full-grain rows; another country's value does not contribute. Pin these assertions on its parsed result:

```python
assert {r.commodity: r.value_usd for r in result.rows} == {'090111': 0, '090121': 10, '980110': 2}
assert result.sum_usd == result.country_total_usd == 12
assert result.residual_usd == 0
```

- [ ] Write rejection fixtures for global duplicates outside Canada, crossed month/year, malformed identities/DF/subcode, blank/negative/unsafe values or unsafe sums, duplicate/missing country totals, duplicate description identities, missing/case-colliding/nested selected members, unsafe inventory names, encryption, member/declared-size/key limits, truncated/bad CRC ZIPs, non-ASCII, wrong width/CRLF and a huge no-newline record.
- [ ] Run `& $bulkPython -B -m unittest discover -s tests/bulk -p 'test_contracts.py' -v`; verify red.
- [ ] Implement fixed-size `width+2` record reads with EOF/CRC completion, streamed selected-member SHA-256/actual-byte counts and ZIP inventory checks before parsing. Match unique root names case-insensitively; normalize slash identities for unsafe/ambiguous-name detection. Use exact full-key byte sets across all countries, safe integer sums and DF 1+2 exactly once. Retain nullable descriptions and all reported values; no other TXT/DBF/summary contributes and no member is extracted or executed.
- [ ] Verify the input original is complete and still matches its manifest bytes/hash before processing. Bound staging writes by the granted allowance, include them in generated usage on failure, and expose only final successful rows/receipt identities. Worker reports and progress are bounded; no raw row logging or unbounded stderr capture.
- [ ] Run focused tests to green and Tasks 1–2 tests; commit.

## Task 4: Separate Reference Comparisons and Failure-Preserving Reports

**Files:** Create `references.py`, `tests/bulk/test_references_report.py`; finalize `BulkReport` definitions in `model.py`.

**Interfaces:** `parse_reference(html: bytes, expected: tuple[Context, ...]) -> ReferenceSnapshot`, `compare_references(total: int|None, current: int|None, publication: int|None, reviewed: bool) -> Comparison`, `verify_publication(record: OriginalRecord, pin: PublicationPin, store: EvidenceStore) -> PublicationEvidence`, `reference_stability(before: ReferenceSnapshot|None, after: ReferenceSnapshot|None, contexts: tuple[Context, ...]) -> str`, and `build_report(contexts: tuple[Context, ...], outcomes: dict[str, WorkerOutcome], originals: tuple[OriginalRecord, ...], before: ReferenceSnapshot|None, after: ReferenceSnapshot|None, publications: tuple[PublicationEvidence, ...], resources: ResourceSummary) -> BulkReport` are pure apart from pin file verification.

- [ ] Write exact-integer rounding tests for zero, May total `29_790_835_759`, current `30_399_000_000`, original `29_790_800_000`, differences `-608_164_241` and `35_759`, positive half-quantum mismatch and negative half-quantum match. Assert current mismatch remains despite original-only corroboration; unreviewed and missing/changed pin states differ.

```python
check = compare_references(29_790_835_759, 30_399_000_000, 29_790_800_000, True)
assert (check.reference_check, check.publication_check) == ('mismatch', 'matched')
assert check.reference_corroboration == 'original-publication-only'
assert compare_references(29_790_850_000, 29_790_800_000, None, False).reference_check == 'mismatch'
assert compare_references(29_790_750_000, 29_790_800_000, None, False).reference_check == 'matched'
```

- [ ] Write table tests matching `scripts/country-reference.ts`: Canada goods heading, nominal USD millions, not seasonally adjusted, Month/Exports/Imports/Balance order, one-decimal values converted exactly, duplicates/missing/crossed months rejected. Mark incomplete snapshots unavailable without borrowing rows. Test irrelevant HTML drift as stable, requested-figure drift as mismatch, absent final table as unavailable and distinct comparisons against both snapshots.
- [ ] Write 48-context/64-request report tests: all usable/zero residual/current matches/stable snapshots can pass narrower `sourceCoverage`; a single failed/missing/duplicate context, residual, current mismatch or stability failure cannot. Missing PDF/source contract or exhausted budget fails `diagnosticOutcome` even if narrower coverage passes. Always assert all four acceptance flags withheld, nullable failed totals and accurate attempted/partial/unattempted counts.
- [ ] Run `& $bulkPython -B -m unittest discover -s tests/bulk -p 'test_references_report.py' -v`; verify red.
- [ ] Implement nonnegative rounding as integer `(value + 50_000) // 100_000`, preserving the existing comparator's ties. Verify fresh PDF status/type/magic/bytes/SHA against the projection before using its reviewed figure; no PDF extraction dependency. Compare normalized requested rows from each whole snapshot and retain per-snapshot comparisons; never mix selected rows into a replacement table.
- [ ] Implement report schema version 1 and bounded JSON/Markdown summaries with exact residuals, requested identities, original/output/member hashes, resource observations and explicit failure reasons. No public ranking/growth, classification proof or share denominator substitution. Run focused tests and prior tasks to green; commit.

## Task 5: Windows Supervision, Orchestration and Optional CLI

**Files:** Create `runner.py`, `scripts/diagnose-country-bulk.ts`, `tests/bulk/test_runner.py`; extend launcher tests; modify `package.json` and README for the optional command only. Existing audit code, publication ledger, workflows, accepted data and website files are read-only.

**Interfaces:** `sample_working_set(pid: int) -> tuple[int, int]` returns current/peak bytes via Win32; `run_worker(context: Context, original: OriginalRecord, store: EvidenceStore, budget: Budget, controls: Controls) -> WorkerOutcome`; `run_diagnostic(options: RunOptions, projection: dict, controls: Controls) -> BulkReport`; `main(args: list[str]) -> int`. Node `resolveBulkOptions(args:string[]): BulkOptions` accepts required `--python <absolute-exe>` and `--output <fresh-path>` plus `--preflight`; no public budget/scope overrides. `runBulkDiagnostic(options:BulkOptions, adapters:LauncherAdapters):Promise<number>` verifies Windows/Node/interpreter then invokes the Python module with argument arrays and no shell, supplying the bounded projection on stdin.

- [ ] Write fake-clock/connection/process tests proving one operation in flight, continued unrelated work after an individual failure, no old-run lookup, exact 64 planned identities and 48 results, and no ZIP/PDF starts in finalization. Cancel at 55 minutes, record partial/unattempted work and allow at most one final table with 150 seconds for its header/body and 150 seconds for reports, within the remaining overall budget.
- [ ] Test worker limits at 60 seconds/remaining work and above 1 GiB sampled working set every 250 ms. Measurement failure terminates a still-running child and withholds results; an already exited child still requires complete valid output identities. Test termination/join, staging byte accounting, missing/corrupt receipts and 8 MiB final headroom after output exhaustion. Free-space guard stops new work; test an I/O failure while recording a bounded final diagnostic. Verify actual Windows supervisor termination leaves no owned transfer/parser child running, including cancellation while a child is waiting for input.
- [ ] Write launcher tests rejecting unsupported platform, absent/old/non-CPython interpreter, nonabsolute interpreter, wrong options and occupied/unsafe output before network. `--preflight` makes no requests or output files. Assert sanitized environment without Census/R2 credentials, `shell:false`, Node 24, no runtime installation, correct module args/projection, disabled bytecode writes and bounded supervisor timeout covering the entire invocation, including launcher preflight time.

```typescript
expect(() => resolveBulkOptions(['--python', 'python', '--output', 'data/backups/canada-country-audit/new-run'])).toThrow();
// The successful preflight fixture then asserts its injected network and output-write spies were never called.
```

- [ ] Run focused Vitest and `& $bulkPython -B -m unittest discover -s tests/bulk -p 'test_runner.py' -v`; confirm red.
- [ ] Implement Win32 process measurement with correctly typed `OpenProcess`, `GetProcessMemoryInfo` and closed handles. Use an owned kill-on-close Windows Job Object for transfer/parser children, registered before they receive work, with no inherited job handle; inability to establish ownership fails preflight. A 250 ms supervision loop enforces timeout/memory/disk/output budgets and kills/joins owned children. Abrupt root termination closes the job and ends owned children. Task 2's parent cancellation governs blocking HTTP phases. Validate/re-hash successful worker files before using them. Account for every retained complete/partial byte and any budget stop, including finalization.
- [ ] Implement fixed retrieval scheduling: eight initial HTML originals, seven PDFs, each chronological import/export ZIP followed by its private worker, then the final Canada table. Source-contract/index failures skip affected processing/downloads explicitly while unrelated work continues. Finalize manifest/report from recorded facts in `finally`; report failure exits nonzero. Stop on global resource failure, preserve originals compressed and never automatically delete/recompress/upload runs.
- [ ] Add `data:diagnose-country-bulk` as `node --import tsx scripts/diagnose-country-bulk.ts`. Document the absolute interpreter requirement, Windows-only target, fresh output, preflight, limits, expected nonzero May mismatch and separate source/classification gates. Run all Python tests plus a small actual Windows child/measurement smoke test with synthetic data and no live network; run launcher tests and `npm run check`; commit.

## Task 6: Verification, Independent Review and One Fresh Diagnostic

**Files:** Update the existing audit progress ledger during execution. After independently verified live results, append a new diagnostic entry to `docs/data-validation/1220-country-audit-evidence.json` and record findings in `docs/data-validation/1220-country-audit.md`, README and the original country-audit execution record. Existing 21 fields are preserved byte-value-equivalent; do not revise the earlier failed verdict.

**Interfaces:** Use Tasks 1–5 unchanged. Independent replay consumes retained originals/manifests/layouts; it must not import the maintained parser as its arithmetic implementation. Review receipts identify immutable processing commit and all complete/partial/unattempted outcomes.

- [ ] Run all standard-library tests locally using the existing CPython interpreter, then `npm test -- --maxWorkers=2`, `npm run check`, fixture `npm run build` and `npm run test:e2e`. Keep local temporary files under ignored `.tmp/`; address any test failure by diagnosis, not relaxed timeouts/acceptance. Inspect build file count/total/largest file. Verify four accepted coffee hashes and all 21 evidence fields against this planning baseline, plus no default audit/workflow/source-gate changes.
- [ ] Commit the complete implementation; dispatch one fresh read-only whole-branch reviewer with exact base/head and this spec/plan. Review network/ZIP contracts, output containment, actual Windows controls, rounding and failure gates. Fix material findings, rerun affected verification and obtain final immutable review before PR integration.
- [ ] Push/attach the implementation PR, wait for required CI on its exact final tree and merge under standing authorization. Sync main and verify merge tree equals the reviewed/tested tree; do not ask again for merge permission. No code implementation or live run occurs before this written plan is reviewed by the user.
- [ ] Run read-only live preflight on merged main with a fresh local destination, verifying platform/interpreter, 16 GiB free, projection and scope. Then perform **one** fresh local diagnostic with the fixed 64-request protocol. A nonzero source verdict is a reportable diagnostic result, not a reason to rerun unchanged. Do not fill gaps with prior samples or change limits to obtain success.
- [ ] Independently verify every complete original/selected member and replay every complete context's full-grain validation, every HS6 row, exact country residual and both current comparisons. Separately review partial/unattempted identities and reason/count accounting. Verify publication pins and original-only corroboration from this invocation. Record measured runtime/storage/working set and all stop reasons, without claiming complete coverage for partial evidence.
- [ ] Record only independently confirmed results, append a new versioned evidence entry, protect historical fields/coffee hashes, and obtain immutable evidence review/CI before merging those documentation changes. If May still mismatches, state it directly and leave country release/classification/rolling comparisons unavailable. Source-version policy and production adoption require later explicit designs; this plan ends with diagnostic findings.

## Self-Review and Handoff

The six tasks cover the written spec: fixed source/projection/output preflight (1), original retrieval and contract discovery (2), selected-member/grain/aggregation receipts (3), independent reference/stability/failure outcomes (4), resource supervision/finalization/CLI (5), and regression/review/fresh-source evidence (6). Every Review Focus item has a named owning test. Shared types/signatures above are the sole interfaces; tests use small controlled inputs and injected limits, never the live budget to exercise failures.

This is a planning deliverable. The root will implement natively after the user reviews this file, using the preserved independent-review method. No country release, production query adoption, R2 operation, deployment or new account cost is part of the handoff.

## Execution Record: October 11, 2026

The owner approved this plan. Tasks 1–5 were implemented by the root and independently reviewed; Task 6 completed code verification, merge, one fresh bounded retrieval and independent evidence verification. The implementation is merged in [PR #57](https://github.com/Vasuki8/us-trade-tracker/pull/57); a live-discovered ASCII-space padding defect was reproduced with revised fixtures, corrected and independently reviewed in [PR #58](https://github.com/Vasuki8/us-trade-tracker/pull/58). Final parser verification passed 47 local Python tests, 574 project tests, zero diagnostics across 150 files and 52 GitHub browser tests. Fixture builds produced 19 files, 490,302–490,303 bytes total, with largest file 212,848 bytes.

The single live invocation completed all 64 original requests but retained its failed outcome: 25 padding failures and 23 archive-member cap failures. The separate corrected-parser offline replay made no network requests and preserved every original live file, validating 25 contexts without relaxing the inventory cap. All 115,290 HS6 rows and 75 selected-member receipts matched the independent raw replay, with 25 exact country residuals of zero. Eighteen current comparisons matched, seven mismatched (including May) and 23 stayed unavailable. All seven reviewed original-publication comparisons matched; current mismatches still fail. No complete arithmetic coverage is claimed for capped archives.

The [diagnostic findings](../../data-validation/1220-country-audit.md#bounded-24-month-bulk-diagnostic-retrieval-complete-acceptance-withheld) and new `bulkDiagnostic` evidence entry record identities, full-grid outcomes, measured resources, storage interpretation and verification limits. All 21 earlier evidence fields and the four accepted coffee files are preserved. Diagnostic implementation and verification are complete; country source/reference/classification resolution and production adoption remain outside this completed substep. The recommendation is to review inventory budgets and a reference-vintage policy before another acceptance attempt, using the retained originals.

### October 11: inventory budget and 48-context arithmetic verified

The owner approved the bounded inventory follow-up. [PR #60](https://github.com/Vasuki8/us-trade-tracker/pull/60) raises only the optional archive-member limit from 100 to 128, after independent inventory review; every other resource and acceptance rule is unchanged. The separately reviewed offline replay reused retained originals with zero network requests and preserved all 132 source and 101 prior-replay files. All 48 contexts reconcile exactly; independent validation matched all 223,049 HS6 rows and 144 selected-member receipts, independently replaying the new 23 contexts and reusing the earlier 25 results. Both current snapshots give 41 matches and the same seven export failures, including May.

The [inventory replay findings](../../data-validation/1220-country-audit.md#inventory-limit-replay-all-archives-reconcile-current-mismatches-remain) record identities, resources and verification limits. The versioned `bulkInventoryReplay` entry preserves all 22 earlier root fields and four accepted coffee files. This bounded follow-up is complete; original country Task 3 remains open for reference-vintage and classification resolution. Source coverage stays failed and country release/rolling comparisons remain unavailable. No default retrieval, workflow, R2 operation, deployment, schedule or account cost changed.
