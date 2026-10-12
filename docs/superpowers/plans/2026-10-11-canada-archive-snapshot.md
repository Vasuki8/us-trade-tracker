# Canada Archive Snapshot Assessment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Produce and independently verify a bounded offline assessment of the reviewed Canada archive collection without enabling a country release.

**Architecture:** A fixed contract and filesystem adapter authenticate the reviewed evidence and yield one normalized context at a time. A pure assessor calculates integrity, reference outcomes and candidate eligibility using a separately reviewed classification ledger. A standalone command writes a bounded assessment and Markdown report; existing diagnostics and application consumers are unchanged.

**Tech Stack:** Node 24, TypeScript, Vitest and existing dependencies; no runtime XLSX/PDF/ZIP parser or provider access.

**Spec:** [Approved written design](../specs/2026-10-11-canada-archive-snapshot-design.md), approved by the owner with “approved.” Planning baseline: `67fad47b2059797021f9ff21c9146de55057f4a0`. Preserve the owner's execution method: root implements, subagents review.

## Global Constraints

- Canada `1220`; September 2024–August 2026; 24 months, both directions: 48 contexts. No alternate run, country, end month or window.
- Imports `GEN_VAL_MO`, general imports, customs value; exports `ALL_VAL_MO`, domestic plus foreign exports, Census's reported FAS basis including its Canada adjustments. National merchandise goods, all transport methods; nominal USD integers, not seasonally adjusted; monthly HS6 values.
- Windows: September 2025–August 2026 and September 2024–August 2025. Matching same-archive country denominators, positive and complete; rolling shares use sums of dollars, never averages of monthly percentages. Missing is not zero; zero prior product value yields no growth percentage.
- Use the four exact reviewed evidence pins in the spec's trusted-input table, including paths recorded in `bulkInventoryReplay`. Production accepts no caller-supplied pins. Preserve the prior raw-source verification label `previous-reviewed-replay`; verify normalized inputs freshly without reading trade ZIP payloads.
- The initial 20 candidates and their order are fixed in the spec. Preserve all historical `special` flags; derive the separate current rule for 98/99 and export `880000`. Known statistical categories remain in country totals and the selected list, without ordinary-product comparison eligibility.
- Retain both 48-context current-reference grids and all seven January–July 2026 export publication comparisons. The other 41 publication comparisons remain `not-reviewed`. Reference differences cannot rename an old mismatch or replace its denominator.
- Fresh ignored output under `data/backups/canada-country-audit/`; exclusive ownership/writes; 8 MiB maximum new output. No accepted pointer, source input, old report or existing evidence field is rewritten.
- Always `releaseAccepted=false`, `rollingComparisonsAvailable=false`, `defaultAuditRetrievalChanged=false`. No public profile, 60-month claim, source switch, workflow, R2, deployment, schedule, access or cost change.

## Review Focus

- A valid file hash in the wrong month/direction must still fail context binding (Task 1).
- Junction/symlink ancestors or changed files between validation and read must not escape the workspace or pass identity checks (Task 1).
- Preliminary-versus-revised reference differences must stay visible without becoming an archive arithmetic failure or an acceptance override (Task 2).
- A classification entry's end boundary, missing observation or a capture-era aircraft flag must not accidentally enable a comparison (Task 2).
- A second concurrent writer, exhausted output allowance or failure after Markdown creation must not leave a qualified partial assessment (Task 3).

---

## Task 1: Fixed contract and authenticated normalized inputs

**Files:** Create `scripts/country-snapshot-contract.ts`, `scripts/country-snapshot-types.ts`, `scripts/country-snapshot-input.ts`, `tests/helpers/country-snapshot-data.ts`, `tests/scripts/country-snapshot-input.test.ts`.

**Interfaces:**

- `SnapshotDirection = 'imports' | 'exports'`; `FileIdentity = {path:string;bytes:number;sha256:string}`.
- `SnapshotRow = {code:string;description:string|null;valueUsd:number;detailRecordCount:number;specialAtCapture:boolean}`.
- `ReviewedCollection` contains the fixed policy identifier `canada-archive-snapshot-v1`, 48 source context identities, four verified anchor identities, original request provenance/capture interval, reference provenance and original strict-audit verdicts. It does not contain all normalized rows in memory.
- `SnapshotContext` contains `id`, `month`, `direction`, `measure`, `countryTotalUsd`, `rows`, and separate `beforeReference`/`afterReference` evidence. `ReferenceEvidence` contains `currentUsd:number|null`, `publicationUsd:number|null|undefined`, `quantumUsd:100000`, source identities and recorded comparison results. An undefined publication amount means `not-reviewed`, not missing required evidence.
- `loadReviewedCollection(repoRoot:string):Promise<ReviewedCollection>` authenticates fixed anchors/supporting references. `readReviewedContexts(collection:ReviewedCollection):AsyncIterable<SnapshotContext>` verifies and yields one context's normalized rows/receipt at a time.
- Export `canadaSnapshotContract` from the contract file: the exact 48-context grid, 20 candidate keys, spec anchor pins/paths, output limit `8*1024*1024` and the required reference contexts. Unit fixtures may mock this module; production signatures/CLI provide no pin override.

- [x] Write failing input tests using a synthetic full grid and hashed fixtures. Authenticate four anchors, then row/receipt files; reject changed bytes/lengths, missing anchors, duplicate or crossed contexts, incompatible measure/receipt metadata, duplicate HS6 rows, null/unsafe dollars and invalid capture timestamps. Assert the original retrieval/parser commits stay distinct from assessment processing version.

```ts
it('rejects a hash-valid receipt bound to another direction', async () => {
  const fixture = await snapshotFixture({crossedReceipt: true});
  await expect(consumeContexts(await loadReviewedCollection(fixture.repoRoot)))
    .rejects.toThrow();
});
```

`snapshotFixture(overrides?:SnapshotFixtureOverrides)` and `consumeContexts(collection:ReviewedCollection)` live in the test helper. The helper mocks only the trusted contract for synthetic inputs; it does not create a production escape hatch.

- [x] Run `node node_modules/vitest/vitest.mjs run tests/scripts/country-snapshot-input.test.ts --maxWorkers=2`; observe missing behavior fail before implementation.
- [x] Implement the interfaces. Resolve inputs from fixed trusted relative roots; reject traversal and reparse/symlink escapes. Read bounded bytes, verify bytes and SHA-256, and parse those same buffers. Do not validate one path then reopen unchecked content. Map the existing snake-case receipt/request fields to the normalized types; validate all 48 identities explicitly. Hash the retained before/after HTML and request metadata through their authenticated `sourceFiles` identities; use `parseCountryReference` to bind amounts. Preserve publication evidence through the pinned ledger/retained verified metadata without fresh PDF-body verification. Keep old failed reports as historical evidence rather than requiring their old worker outcomes to pass.
- [x] Add the path-escape/change-during-read tests, using disposable workspace-local directories. Production remains Node 24; Windows junction ownership checks can run locally where the platform supports them. Run the focused suite to green and `npm.cmd run check`.
- [x] Commit this independently testable adapter and its fixtures.

## Task 2: Classification evidence and pure assessment

**Files:** Create `scripts/country-snapshot-assessment.ts`, `docs/data-validation/1220-snapshot-classification-evidence.json`, `docs/data-validation/1220-snapshot-classification.md`, `tests/scripts/country-snapshot-assessment.test.ts`; extend `scripts/country-snapshot-types.ts` and the Task 1 test helper only as needed.

**Interfaces:**

- `ClassificationEntry = {direction:SnapshotDirection;code:string;from:string;to:string;status:'compatible'|'incompatible'|'unverified';reason:string;sources:readonly ClassificationSource[];scopeConclusion:string}`. `ClassificationSource = {url:string;path:string;bytes:number;sha256:string;locator:string;kind:'definition-and-notes'|'dated-change'|'historical-code-screen'|'annual-concordance'}` binds the inspected primary evidence. The ledger has schema/policy version and exactly the 17 nonflagged direction/code keys selected in the spec; the three known statistical candidates are handled explicitly by the assessor.
- `parseSnapshotClassificationLedger(value:unknown):readonly ClassificationEntry[]` validates keys, intervals, statuses and evidence identities. A compatible entry requires reviewed scope evidence, not an annual-code-presence statement.
- `assessCountrySnapshot(collection:ReviewedCollection, contexts:AsyncIterable<SnapshotContext>, classifications:readonly ClassificationEntry[]):Promise<SnapshotAssessment>` consumes Task 1 inputs.
- `SnapshotAssessment` has schema/policy version, `completed`, processing/input provenance, `archiveIntegrity`, unchanged strict-audit verdicts, `months:readonly MonthlySnapshotAssessment[]` (48 outcomes), 20 candidates, `classificationLedgerIdentity:FileIdentity|null` and the three literal-false availability fields. The pure assessor leaves that identity null; the command binds the committed ledger's actual identity before writing a successful artifact. `MonthlySnapshotAssessment` has `id`, `month`, `direction`, `sumUsd`, `countryTotalUsd`, `residualUsd`, `beforeReference` and `afterReference`. Both reference results retain amounts/identities and use existing `referenceCheck`/`publicationCheck`, plus `currentDifferenceUsd` and `publicationDifferenceUsd`.
- Each candidate retains monthly reported values and capture/policy flags, complete current/prior observed sums, reported counts, classification reason/interval and `comparisonEligible`. Ordinary monthly/rolling shares, growth and share-point change remain null where the corresponding completeness/classification/denominator prerequisite fails. Unqualified period sums are labeled retained observations, not accepted comparisons.

- [x] Write failing calculation tests for exact reconciliation, duplicate/missing grid contexts, complete periods, zero versus absent observations, positive complete denominators, classification boundaries and statistical categories. Pin the known May distinction:

```ts
expect(may.sumUsd).toBe(29790835759);
expect(may.beforeReference.currentDifferenceUsd).toBe(-608164241);
expect(may.afterReference.currentDifferenceUsd).toBe(-608164241);
expect(may.afterReference.publicationDifferenceUsd).toBe(35759);
expect(may.afterReference.referenceCheck).toBe('mismatch');
expect(result.archiveIntegrity).toBe('passed');
expect(result.releaseAccepted).toBe(false);
expect(result.rollingComparisonsAvailable).toBe(false);
```

The fixture supplies current reference `30399000000` and publication `29790800000`. Also assert weighted rolling share equals `100*sum(product)/sum(country)`, zero-prior growth is null, a missing month is null rather than zero, incompatible/unverified classification blocks comparison, and legacy export `880000.specialAtCapture=false` remains unchanged while its policy flag is true.

- [x] Run the focused assessment suite and observe failure before implementation.
- [x] Review the 17 candidate keys using retained annual concordances/historical workbooks plus primary HS6 definitions, relevant section/chapter notes and dated changes across the fixed interval. Retain any additional small primary classification references with source identity/provenance in the existing ignored classification-reference directory; do not download trade datasets or add a runtime spreadsheet dependency. Record one explicit conclusion per direction/code. If the available evidence does not establish semantic continuity, use `unverified` with the precise missing evidence; do not force all entries compatible to finish. The ledger remains separate from accepted coffee classification files. Document that begin/end-month screening and shared prefixes do not prove transfers or unchanged scope.
- [x] Implement ledger validation and the streaming pure assessor. Check safe integer sums and same-archive controls before qualification; retain current/publication checks separately using the existing reviewed publication definitions and `compareCountryReferences`. Keep the 20 fixed candidates/order, including special categories, without backfilling. Apply inclusive classification month boundaries and both complete 12-month windows. Return unsuccessful integrity/completion for malformed or partial inputs, never a qualified partial grid.
- [x] Run Task 1/2 focused suites to green and type checks; commit the assessor, tests and evidence conclusions. Whole-branch review must independently inspect the classification conclusions before they are relied on.

## Task 3: Standalone command and bounded two-artifact output

**Files:** Create `scripts/assess-country-snapshot.ts`, `scripts/country-snapshot-output.ts`, `tests/scripts/country-snapshot-command.test.ts`; modify `package.json`, `README.md`.

**Interfaces:**

- `resolveSnapshotOptions(args:string[],repoRoot:string):SnapshotOptions` accepts only required `--output <fresh-path>` and optional `--preflight`; reject unknown/duplicate options. Repository root is derived from the command location; there is no country/input/pin/classification-ledger override.
- `SnapshotOptions = {repoRoot:string;outputDir:string;preflight:boolean}`.
- `renderSnapshotReport(result:SnapshotAssessment):string`; `writeSnapshotOutputs(outputDir:string,result:SnapshotAssessment):Promise<readonly FileIdentity[]>` writes `snapshot-assessment.json` and `snapshot-assessment.md` under the owned directory.
- `runCountrySnapshot(options:SnapshotOptions):Promise<{exitCode:0|1;result:SnapshotAssessment|null}>` loads the fixed collection and committed classification ledger, calls Task 2, binds ledger hash/current processing commit and writes output. Read the ledger from its committed Git blob, with no working-copy or caller-provided override; record that blob's bytes/hash. Safe failure reasons do not include arbitrary exception text. Failures before a full assessment use a minimal versioned report with `completed=false`, `archiveIntegrity='failed'`, a fixed reason code and the three false availability flags; never assert a complete grid in that report.
- Add `data:assess-country-snapshot`: `node --import tsx scripts/assess-country-snapshot.ts`. Preflight verifies options/paths without creating output or reading the dataset.

- [x] Write failing command tests for exact options, occupied/empty output, concurrent creation, outside-root/reparse output, input failure midway, output failure and exhausted allowance. Spy on `fetch`/provider entry points and assert zero calls. An unverified classification must not change the command's successful archive-integrity assessment into release acceptance.

```ts
it('rejects options that could replace the reviewed collection', () => {
  const root = process.cwd();
  const args = ['--output', 'data/backups/canada-country-audit/test-run'];
  expect(resolveSnapshotOptions([...args, '--preflight'], root))
    .toMatchObject({preflight: true});
  for (const option of ['--input', '--pins', '--country', '--end', '--classification']) {
    expect(() => resolveSnapshotOptions([...args, option, 'other'], root)).toThrow();
  }
});
```

- [x] Run the command suite to RED.
- [x] Implement exclusive fresh-directory ownership before assessment. Preserve workspace-safe input/output roots. Bound success artifacts together below `8*1024*1024`, reserve 8 KiB within that allowance for a failure report, and count staged bytes. Stage within the owned directory and publish the success JSON last only after both artifacts are fully written; on a failure, leave no final JSON claiming a completed/passed assessment. A safe failed JSON/report is attempted only within remaining allowance and ownership; otherwise use a fixed failure message and nonzero exit. Do not overwrite a foreign occupied path or accepted pointer. Document that exit zero means a complete offline integrity assessment, with reference differences/classification blockers still visible.
- [x] Run all three focused suites and `npm.cmd run check`; check the failure-after-Markdown and concurrent-writer assertions. Commit the command and usage docs.

## Task 4: Real offline verification, review and integration

**Files:** Create `docs/data-validation/1220-archive-snapshot.md`, `docs/data-validation/1220-archive-snapshot-evidence.json`; append the original country plan's execution record. Do not edit its earlier evidence record.

- [ ] Run `npm.cmd test -- --maxWorkers=2` and `npm.cmd run check`. Confirm all checks pass on the implementation tree; build/browser checks can use normal GitHub CI because no UI flow changes. Verify no workflow/application/retrieval changes and all prior protected hashes/23 evidence fields remain unchanged. Commit before the real run so provenance identifies its actual processing version.
- [ ] Run once with a fresh owned path, for example `npm.cmd run data:assess-country-snapshot -- --output data/backups/canada-country-audit/snapshot-assessment-2026-10-11-r1`. This reads retained normalized/reference files only. Verify zero provider/ZIP reads, 48 context outcomes, 20 candidates, exact dollar totals and reasons, collection capture interval and all unavailable release flags. A run failure is diagnosed locally; never redownload unchanged trade sources or relax pins/gates to obtain success.
- [ ] Have an independent reviewer recalculate all 48 monthly sums/controls and 20 candidate summaries from the retained normalized records without importing the new assessor's calculation functions. Check ratios from their exact numerators/denominators, missing/classification reasons, reference precision/results, original versus current-policy flags and source/output identities. Reuse prior raw-source attestations; do not decompress ZIPs again. Record the reviewer receipt/digest and preservation checks in the new versioned evidence files.
- [ ] Record actual results and limitations, including current-reference failures, unverified/incompatible classifications and the prior raw-verification basis. Do not mark original Task 3 complete merely because archive integrity passes; document any remaining required classification work.
- [ ] Complete one fresh immutable whole-branch implementation review, including classification source conclusions and live-output evidence. The data recalculation and whole-branch review may be performed by one fresh reviewer. Address substantive findings with targeted RED/GREEN regressions and appropriate full checks. Create/attach the PR, verify passing CI for the final reviewed tree, merge under standing permission and synchronize local main. Preserve the authorized checkout and ledger while original Task 3 remains unfinished.

## Plan review and execution handoff

Self-review maps every design requirement to Tasks 1–4, including all five Review Focus cases. Interface names/types are shared explicitly; new ledger/report filenames are separate from accepted data and historical verdicts. No new classifier subsystem, public flow or delivery service is included.

The owner has already selected native execution: root implements with subagents reviewing. Review this written plan before implementation; after approval, use `superpowers:executing-plans` and retain that method.
