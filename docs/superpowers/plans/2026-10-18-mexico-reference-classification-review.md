# Mexico Reference-Vintage and Classification Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root implements the four tasks; independent subagents check reference extraction, classification conclusions and the final evidence. Do not delegate concurrent edits to the same files. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Establish what Mexico's retained September 2024–August 2026 totals and selected HS6 definitions can support, with explicit reference-vintage and classification findings, before designing acceptance.

**Architecture:** Authenticate the completed offline results and reuse national reference documents by their original identities. Fresh private Mexico tooling produces a fixed cohort, reference matrix and research-only continuity ledger; independently reviewed documentation records supported, conflicting and unresolved findings without altering production contracts or data.

**Tech Stack:** Existing Python standard library, bundled PDF inspection/rendering tools, existing locked Node tooling and GitHub CI. No new dependency or service.

**Spec:** The combined bounded review design and constraints in this document, prepared at the owner's request for one review and approval. Planning is authorized; execution waits for approval of this written plan.

## Intent and selected design

The owner wants the next evidence gate completed within scope and wants the necessary permissions collected now, so implementation can proceed without routine approval pauses. Success means an independently supported reference matrix and a disposition for every selected classification. Success does **not** require every reference to match or every classification to be compatible. Missing evidence remains visible.

The completed assessment independently matched 48 contexts, 200,855 context/HS6 rows and 80,011,182 global detail keys. It established retained-archive arithmetic, not a uniform revision vintage, classification continuity or Mexico acceptance. The authoritative starting point is main `2d299dce206ba1ca0134638dd6e1dd06852edc1e` and the completed proof:

- `data/backups/mexico-country-audit/reassessment-20261018-r1/final-proof-manifest.json`: 87,723 bytes; SHA-256 `810da21b17d2fdd85fbdf4a1c1d1e5e4a8a134be3ba48e45a51875f46c90e175`.
- Its external final closing receipt: 324,291 bytes; SHA-256 `520a25b9ae49e198319c074c94f2c3a037dc67dbbf457f1e395169b1ebcdd90f`.
- All 495 sealed members, prior failures and original national sources remain immutable. National trade ZIPs will not be opened, hashed, decompressed or replayed in this milestone; the authenticated generated results supply its trade observations.

**Recommended approach:** select the ten largest reported current-window categories per direction, including statistical categories, then review the 17 ordinary direction/code pairs in two tranches. First review eight exports and three vehicle imports using mostly retained reference evidence. Review the six machinery/electronics imports only within the remaining source and review budgets. Retain the entire cohort and every unresolved status; never substitute an easier category.

Two alternatives were considered. Capturing every missing HTS chapter edition first simplifies the source inventory, but chapters 84/85 have unknown physical sizes and could exhaust the allowance before yielding a complete conclusion. Endpoint books and historical-code presence alone cost less, but cannot establish intermediate semantic scope. The staged approach gives a useful, honest result under either source outcome.

## Fixed cohort and review rules

Select using reported integer USD observations in **September 2025–August 2026**, descending observed sum with ascending HS6 as the tie-breaker. Selection is a research priority rule, not a published comparable-product ranking. Preserve monthly presence separately; missing is never zero. Reproduce selection independently from the two authenticated result sets. The planning inspection suggests this exact cohort; execution must verify it before freezing it:

| Direction | Selected codes, in observed selection order |
| --- | --- |
| Imports | `847150`, `870431`, `870323`, `851762`, `870322`, `854430`, `852872`, `853710`, `980100`, `847170` |
| Exports | `847330`, `271012`, `271019`, `847150`, `854231`, `988000`, `852351`, `880000`, `271121`, `100590` |

All 20 have twelve reported current-window months in the planning inspection. If authenticated execution differs, stop the cohort gate and explain the discrepancy; do not silently change the list. Record prior-window presence without calculating growth or shares.

Imports `980100` and exports `988000`/`880000` are statistical categories. Preserve their source flags and inclusion in country totals; exclude them from ordinary classification comparisons without backfilling. The remaining nine import and eight export pairs each receive `compatible`, `incompatible` or `unverified` continuity status for the fixed 24-month interval. This is a research ledger: `classificationAccepted:false`, `releaseAccepted:false`, and public comparison availability stays false for every entry.

### Reference-vintage review

Review all 48 month/direction controls against two captures of the official Mexico goods table, taken before and after the reference collection. Select the complete 24-month dated FT900 publication grid **before** examining agreement. Reuse the seven retained January–July 2026 national PDFs after authentication and independently extract Mexico's cells; Canada's extracted numbers and context records are not Mexico evidence. At most 17 additional monthly PDFs are needed for this grid if the retained inputs authenticate.

Each extraction binds country, month, direction, measure/basis, seasonal-adjustment status, units, precision, original file hash, physical PDF page, printed locator and exact row/column. Require monthly figures; YTD columns cannot stand in for monthly observations. Imports must match the retained general-import/customs basis and exports the retained total-export/FAS basis. Record each source's actual labels before deciding it is a valid comparator.

The current Mexico table displays nominal, unadjusted values in millions to one decimal. Compare exact archive dollars at the documented display quantum, retaining the signed unrounded difference. With a $100,000 quantum, use integer nearest-quantum comparison; an exact $50,000 tie remains rounding-ambiguous unless the publisher's tie rule is established. No floating-point tolerance or rescaling is permitted. A different source precision needs its own evidenced quantum or remains unavailable.

Keep current-table and dated-publication outcomes separate: `matched`, `mismatch`, `unavailable`, with `not-reviewed` additionally available for publication cells. Missing or crossed evidence cannot pass. Keep both current snapshots if the target grid changes. A matching current grid is not proof that the archive has that revision vintage. A dated URL, document title, Last-Modified header or later retrieval cannot alone prove unchanged original-publication bytes. Attribute a difference to a revision only with evidence; otherwise record the vintage relationship or cause as `not-established`.

### Classification review

Authenticate and reuse relevant national classification originals, including historical-code workbooks, dated committee histories, Schedule B definitions/notes/change guides and the retained HTS edition inventory. Reusing national source bytes is allowed; copying Canada's cohort, verdicts, reference values or acceptance policy is not.

Start with the eight ordinary exports and imports `870431`, `870323`, `870322`. Retained HTS chapters 87 and 86's opening Section XVII notes cover the vehicle source family. Exports need Schedule B chapters 10/27/84/85 and applicable Section II/XVI notes, effective definitions and dated changes. Annual browsing URLs may identify July editions; do not project those definitions backward without sufficient dated evidence.

Then review imports `847150`, `847170`, `851762`, `854430`, `852872`, `853710`. The retained inventory identifies 54 HTS editions overlapping the window. Chapters 84/85 are missing: up to 108 additional chapter PDFs under that inventory, with governing Section XVI notes verified in the actual sources. Their physical sizes are unknown. Authenticate the inventory and inspect actual effective-date coverage; later-published evidence with an in-window effective change cannot be ignored merely to keep the count at 54. Inspect source coverage and, where useful, bounded size metadata before capture. Complete one evidential tranche before starting another. Do not spend beyond the cap to finish a partially captured family.

A compatible conclusion requires direction-specific parent scope, inherited headings, governing legal/section notes, applicable effective dates and adequately evidenced in-window changes/transfers. Code presence, common prefixes, a stable description, annual endpoints or cumulative additions/deletions alone do not suffice. Preserve literal `Current`/`Prior to 2007` meanings and never invent predecessor allocations. Cross-parent transfers or missing effective coverage remain incompatible/unverified as appropriate. Release dates do not automatically establish a legal effective date or a trade-row revision date. Inspect original table layout where extraction order matters.

## Global constraints and permissions requested

Full approval authorizes the following bounded execution through reviewed integration and actual cleanup:

- Root implementation, independent research/reviewer subagents with separate output ownership, **one native managed worktree**, scoped filesystem/runtime/process/network permissions, and existing locked runtime/dependency setup. No new production feature, reusable subsystem or generalization of Canada-hardcoded production parsers.
- Create fresh private tooling, fixtures, source manifests and reports under `data/backups/mexico-country-audit/reference-classification-20261018-r1/`. Authenticate/read existing generated Mexico results, accepted-input identities and retained official reference originals in place. Never write to sealed proof or existing reference directories. New captures go only into the new batch directory.
- Public official-reference retrieval only from `www.census.gov`, `www.usitc.gov` and `hts.usitc.gov`, over HTTPS. Maximum **160 logical fetch intents**, **320 HTTP transactions** including HEAD, redirects and retries, **512 MiB of newly received reference bodies** including failed/partial/retried bodies, and **30 minutes cumulative retrieval elapsed** including startup, waits, writing and finalization. Existing authenticated local reuse consumes no request allowance. The two current-table captures are separate intents. At most two same-allowlist redirects and one transient 429/5xx/transport retry per intent, all inside the shared caps; no retry to seek matching data. Respect a bounded Retry-After or leave the source unavailable.
- Maximum per original: PDF **64 MiB**, HTML **2 MiB**, XLSX **8 MiB**, JSON/catalog **4 MiB**. Stream to fresh files, preserve failed/partial outcomes, record canonical source URL, response metadata, actual bytes/hash and capture time. Do not treat absent Content-Length as zero or a size estimate as a guarantee. Reject unapproved redirect origins, wrong content and expired budgets.
- Use verified owned-process supervision for new blocking retrieval/extraction operations. Per fetch: **60 seconds execution plus at most three seconds cleanup**; cumulative observed retrieval invocations must fit the 30-minute allowance. Capture actual native completion and conservative operator lifecycle windows, separately labelled from guarded-subprocess durations. Source-free control/extraction test invocations: **ten minutes maximum**. Memory cap **1 GiB per controlled worker**, **16 GiB free-disk preflight**, **2 GiB disk guard**. Represent unmeasured memory as unavailable, not measured zero.
- Maximum **256 MiB generated outputs** and **1 GiB total new batch proof**, including new sources, bounded local copies, fixtures, renderings and external closing receipts; existing locked dependencies are excluded. Reuse existing originals in place. Stop the affected activity before exhausting the allowance required for failure evidence.
- One bounded private harness/citation repair pass with reproduced regression evidence and independent review is permitted. Recapture/retry consumes the same source/time/byte allowances, never a reset. Insufficient sources, inaccessible origins, unresolved differences or budget exhaustion produce a partial/unverified report; continue unaffected tasks and integrate that honest outcome without routine approval pauses.
- Existing public GitHub repository pushes, at most **two evidence/documentation PRs** (one principal and one bounded reviewed correction if needed), attachment, existing full push/PR CI on exact reviewed heads, and reviewed merges under standing permission. Preserve CI logs. No manual data-workflow dispatch or new CI job.
- Preserve/verify metadata before unlinking at most **three obsolete merged standalone PR chat references from PR36–131**, only if attachment capacity requires it. Do not alter those GitHub PRs or other worktree attachments. Own merged batch PR cards may be temporarily detached for native archival and must be restored afterward.
- Preserve proof and the owned plan workspace, stop only owned processes, native-archive only this worktree, observe archived attachment plus actual checkout/Git-registration absence, and remove only byte-preserved disposable batch scratch. Seal the final proof and independently read back every member. Preserve final task completion/log bytes and closing-workspace deletion in a non-circular external receipt without rewriting sealed proof.

Excluded: Census API or national trade ZIP requests/replays, credential use/change, accepted-data installation/replacement, canonical classification registration, product/country intake, growth/share rankings, R2 operations, website packaging/publication/restoration, paid services/upgrades, access/indexing changes, outreach, analytics and recurring jobs. The separately approved September coffee plan remains unchanged and gated. This approval grants only the reference allowance above; previous data-job/replay allowances stay closed.

## Review focus

1. Correct-looking numbers with crossed country/month/direction, YTD, valuation basis, adjustment or precision must fail the reference gate (Tasks 1–2).
2. Mutable current snapshots or dated-publication paths must not erase a mismatch or imply an unproved revision vintage (Task 2).
3. Canada's verdicts, annual URLs, lexical presence and within-prefix transitions must not substitute for Mexico-specific effective scope/notes evidence (Task 3).
4. Large/missing sources, retry/redirect loops or blocked finalization must stop within the shared caps and leave explicit unavailable/unverified findings (Tasks 1–3).
5. Successful research findings must not enable canonical acceptance, comparisons or deployment; old proof and actual cleanup must remain verifiable (Task 4).

## Task 1: Authenticate inputs, freeze the cohort and prove private controls

**Files:** Read the sealed Mexico manifest/closing receipt and generated result files, existing reference/source contracts and classification evidence. Create private `tooling/cohort.py`, `tooling/capture.py`, `tooling/verify_inputs.py`, `tooling/tests/`, `cohort.json`, `reuse-inventory.json`, `operations.json` and the owned plan ledger. No production edits.

**Interfaces:** `derive_cohort(maintained_dir: Path, independent_dir: Path) -> dict` returns the exact ordered 20 pairs, presence, source-result identities and selection rule. `capture_reference(spec: dict, budget: dict) -> dict` consumes `id`, canonical `url`, reference `kind`, expected country/month/direction or chapter/edition, and `maximumBytes`; it returns outcome/reason, observed source metadata and bytes/hash when captured. New hashes are observed, never planning placeholders. The shared budget records `logicalIntents`, `httpTransactions`, `receivedBodyBytes`, `retrievalElapsedSeconds`, `generatedBytes` and `totalProofBytes`. `verify_inputs() -> dict` authenticates original/pinned inputs without reading national ZIPs. Later tasks consume frozen cohort/source identities and the same cumulative budget.

- [ ] Establish native isolation and capacity handling; record approved plan bytes, execution HEAD, prior seal/closing pins, accepted pointers, old evidence, retained-reference identities and the separate September proposal. Expected: preserved baselines, no Mexico canonical root and no raw trade-body read.
- [ ] Write and observe RED tests for crossed/duplicate rows, missing-versus-zero, tie order, partial current-window presence, altered results and changed cohort; implement selection and independent reproduction. Expected: the fixed 20 pairs, 17 ordinary/three statistical, with identical selection from both result sets. No comparison eligibility is enabled.
- [ ] Test source-free wrong origins/types, oversize/chunked bodies, redirect/retry accounting, stale manifests, output collision, disk/memory/deadline stops and blocked finalization using independent elapsed cutoffs. Implement the smallest private capture/control adapters; copy authenticated reusable supervision into the new directory if needed, never import a writer rooted in sealed proof. Expected: all controls GREEN; failure receipts contain no successful source/semantic verdict.
- [ ] Freeze private code/source contracts and validate a no-network dry run. Run `python -B -m unittest discover -s <new-proof>/tooling/tests -v` and read the results. Expected: budget counters zero, complete provenance and a tested gate for reference capture.

**Deliverable:** Authenticated cohort and reuse inventory with bounded reference-only controls. A failed integrity gate yields a negative handoff through Task 4 rather than new source repair or silent substitution.

## Task 2: Build the complete reference-vintage matrix

**Files:** Private `tooling/references.py`, `tooling/publications.py`, reference fixtures/tests, original captures, extraction records and `reference-matrix.json` under the new proof. Read old national PDF originals by identity; do not reuse Canada extraction values.

**Interfaces:** `parse_mexico_table(raw: bytes) -> dict[str, int]` validates Mexico, units/columns and all 48 target cells. `compare_control(exact_usd: int | None, displayed_usd: int | None, quantum_usd: int) -> dict` preserves signed differences and ambiguous ties. Publication records additionally bind source identity, actual table/page/row/column, monthly period and measure. The matrix retains two current snapshots and 48 separate publication outcomes.

- [ ] Write failing fixtures for Review Focus 1–2: Canada title, swapped columns, YTD, consumption/CIF/adjusted basis, duplicate/missing months, changed snapshots, precision/tie cases and an unverified dated-file vintage. Implement strict parsing/extraction validation. Expected: wrong or incomplete evidence is rejected/unavailable, never zero-filled or relabelled matched.
- [ ] Predeclare the 24-month PDF grid and existing reuse identities; capture Mexico-before, missing dated references and Mexico-after under the shared budget. Authenticate originals before/after local use. Expected: immutable source/attempt records, zero API/national ZIP requests, and explicit unavailable entries for any failed capture.
- [ ] Extract Mexico's two monthly controls from every available dated publication, verify basis/units and page bounds, and compare against exact retained controls. Independently review all extracted cells and both current grids. Expected: a complete 48-row status matrix even when evidence is unavailable, with no assumed match count or automatic revision explanation.
- [ ] Run offline matrix/identity/cap checks. Expected: all match/difference/vintage claims trace to actual source bindings; unresolved attribution and snapshot changes remain explicit. Preserve any negative finding for Task 4.

**Deliverable:** A sourced reference-vintage assessment, not a correction to retained trade values or an acceptance override.

## Task 3: Review the fixed classification cohort in staged tranches

**Files:** Private `tooling/classification.py`, semantic-review records, source/locator fixtures, newly captured reference originals and `classification-ledger.json`. Read the frozen cohort, reused national sources and observed capture records. No production classification file or country policy changes.

**Interfaces:** Each `(direction, HS6)` entry records the fixed interval, continuity status, reason, scope, definition/note/effective-change sources, exact source-specific locators, remaining gaps and independent semantic verdict. Structural validation is distinct from human semantic review; a keyword match cannot generate compatibility. All acceptance/availability flags stay false.

- [ ] Write failing structural/evidence tests for a copied Canada conclusion, wrong-direction definition, July-only annual evidence, missing section note, unproved within-prefix transfer, invalid page locator and uncovered effective interval. Implement the research-ledger validator. Expected: incomplete evidence remains unverified; statistical categories stay excluded.
- [ ] Review the eight ordinary exports and three vehicle imports first, authenticating reused sources and capturing only missing official chapters/notes/change evidence. Expected: 11 explicit supported/incompatible/unverified findings, with dated semantics and actual page locators rather than an assumed compatible count.
- [ ] Preflight the remaining machinery/electronics source requirements and source budgets, then review complete source tranches for the six remaining imports. Full in-window definition/note coverage is required; if it cannot be established within the caps, record the exact missing editions/evidence and keep those entries unverified. Expected: 17 ordinary dispositions plus three statistical exclusions, with no backfill, extrapolation or raised cap.
- [ ] Obtain independent semantic review of every ordinary entry and all decisive source/page/effective-date bindings. Fix reproduced material citation/harness defects within the approved pass and budget; otherwise qualify the finding. Run source-identity/page-bound/ledger tests. Expected: every positive conclusion independently supported, or explicitly downgraded, with all raw originals and previous conclusions preserved.

**Deliverable:** A Mexico-specific research continuity ledger and actionable evidence gaps. No growth/share calculation, classification registration or release acceptance is produced.

## Task 4: Reviewed evidence handoff, integration and actual cleanup

**Files:** Create `docs/data-validation/2010-reference-vintage.md`, `2010-reference-vintage-evidence.json`, `2010-classification-review.md` and `2010-classification-review-evidence.json`. Update only the current gate/status in `2010-acceptance-readiness.md` and a targeted README link. Include this approved plan in the documentation PR. Keep the old feasibility/reassessment documents and JSON byte-identical; preserve their historical timing/memory qualifications.

**Interfaces:** Public evidence is an allowlisted projection of observed source/semantic records, without private paths, credentials or unqualified product rankings. It distinguishes supported continuity from country acceptance and preserves every mismatch/unverified status. Final proof binds actual PR/head/CI/merge, budget and native-cleanup observations.

- [ ] Derive concise documentation and exact identity records from Tasks 1–3, including partial/negative outcomes. Independently check reference values, semantic conclusions, public projection/privacy, false availability flags and original evidence preservation. Expected: no unsupported revision explanation, compatibility claim or ready-to-publish implication.
- [ ] Self-check JSON, source/locator bindings, links and the seven-file documentation scope. Run relevant private offline controls and existing `npm run check`; require full existing push/PR CI on the exact independently reviewed head before merge. Do not repeat the full local application suite for a documentation-only delta without a new failure/concern.
- [ ] Push/attach, review and merge under standing permission; safely synchronize main. Preserve the original approved plan before reconciling its identical untracked copy. Never stage the separate September proposal. Expected: actual passing head/merge identities, no website action and no accepted-input changes.
- [ ] Preserve originals, failed captures, review artifacts, code/tests, budgets, CI logs and the owned plan ledger. Verify source/proof preservation and owned-process absence, then native-archive the owned worktree and observe actual checkout/registration absence. Restore own temporarily detached PR cards. Seal/read back every final member, close the completion ledger externally and remove only verified preserved scratch. Expected: independent seal readback and a non-circular closing receipt with no pending owned cleanup.

**Deliverable:** Merged, independently reviewed Mexico reference/classification findings and the smallest evidence-based next-stage recommendation. Acceptance/projection/recovery design remains a later owner decision; profile/archive/publication remains later still.

## Planning basis, self-review and handoff

Planning inspected repository contracts, completed proof metadata and generated result JSON only; it performed no national replay, comparison batch, classification conclusion, worktree creation or execution implementation. Public catalog browsing confirmed the [Mexico goods table](https://www.census.gov/foreign-trade/balance/c2010.html), [Schedule B index](https://www.census.gov/foreign-trade/schedules/b/index.html) and [2026 chapter index](https://www.census.gov/foreign-trade/schedules/b/2026/index.html), whose banner specifies use after July 1. The [USITC archive route](https://www.usitc.gov/harmonized_tariff_information/hts/archive/list) did not load through the planning browser; retained authoritative edition metadata is available, and live capture availability must be observed under the approved execution allowance. No future download identity, vintage relationship or compatibility result is invented.

Independent read-only inventory research confirmed the national sources available for reuse and the missing chapter families. Plan self-review mapped all five Review Focus conditions to explicit task checks; interfaces, counters, source rules, partial-result behavior and cleanup boundaries are consistent. The staged result remains useful if the expensive source tranche cannot be completed.

**Execution method:** root implementation with independent reviewers, preserving the owner's established preference. Full approval covers all four tasks and the permissions above, including bounded official-reference retrieval and reviewed GitHub merges, without routine approval pauses. No implementation, capture batch or provider action begins until the owner reviews and approves this written plan. Approval creates no scheduled run.
