# Estimated-Duty Monthly Revisions Design and Four-Task Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root implements; read-only evidence audit and one fresh independent whole-branch review. Track steps with checkbox (`- [ ]`) syntax.

**Goal:** Identify the recorded inputs revised in each displayed monthly estimated-duty row, preserving all figures and existing reporting qualifications.

**Architecture:** Project existing duty revision keys into separate, sparse monthly metadata on `DutyView`. Use it in the existing monthly table and append three explicit CSV fields. Keep shared period/comparison objects, chart symbols, accepted releases and revision writers unchanged.

**Tech Stack:** Existing locked Node 24, Astro/React/TypeScript, Vitest, Playwright and Python packaging tools; existing Free Cloudflare Pages project.

**Spec:** This combined bounded design implements part of the original brief's “mark revised figures” requirement and estimated-duty definitions in `docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md`. The owner requested the design, tasks and permissions together for review. Implementation/publication waits for approval of this document. Preserve root execution with independent review.

## Assessment and boundaries

PR #115 is complete on main **1db5ccba9e026834171472caae685ae5bc9c2a69**. Authenticate its private `data/backups/product-changes-keyboard-readiness/verification-20261016-r1/post-finalization.json` against SHA256 `36f889094fd05983e07ba193c5336c31bc2fd920900c8c78e86f3da45cecfade`, then follow its authenticated references to prior proof and the seven accepted/eleven protected inputs.

The duty writer already records exact measure/coverage revisions, but `buildDutyView` collapses them into one release-wide boolean. Monthly tables and their CSV cannot identify affected inputs. This is an original-scope traceability remainder, not evidence of wrong arithmetic: both accepted coffee releases currently have empty duty revision lists. Positive acceptance must use explicitly synthetic evidence; real data must gain no invented labels.

Recommend this narrow monthly extension. Waiting for owner-run task observations or the next official release is a defensible alternative; a broader revision-history or operator-report system would add unnecessary scope now. Neither this extension nor synthetic checks close demand validation or successive-official-release acceptance.

Rolling periods, latest-summary cards, computed change/growth figures, country rankings, briefings and charts retain their existing revision context. Duty hollow markers already mean reporting/classification qualifications; do not reuse them for revisions. No previous values, revision dates/causes, cumulative history, finality or entirely removed-country reconstruction is claimed.

## Exact contracts

### Monthly metadata

Add to `src/lib/trade/duty-types.ts`:

```ts
export type DutyRevisionInput='CAL_DUT_MO'|'CON_VAL_MO'|'DUT_VAL_MO'|'coverage';
export type DutyMonthlyRevision={partnerCode:string;month:Month;inputs:DutyRevisionInput[]};
// Required property on DutyView:
monthlyRecordedRevisions:DutyMonthlyRevision[];
```

Keep `buildDutyView(release:Release,partnerCodes:string[]):DutyView` unchanged in signature. Read only `release.duties.revisedKeys`, whose existing identity is `imports/<HS6>/<YYYY-MM>/<world|country>/<partner>/<input>`; world partner is `-`. Match the view's product, selected series and displayed 24 months exactly. Include sparse records only when at least one of the four inputs matches, in series/month order, with input tokens ordered as above and deduplicated. Absent monthly observations can still have recorded keys. Legacy/no-duty views and empty key lists produce `[]`.

Do not add metadata to `DutyPeriod`, `DutyComparison` or ranking payloads; do not alter arithmetic, availability, classification, coverage, normalization, wire/archive schemas or revision writers. Compact browser round-trips must preserve the same projection.

### Monthly table and CSV

In the existing **Monthly figures** table only:

- Money cells show **Revised** only for their own `CAL_DUT_MO`, `CON_VAL_MO` or `DUT_VAL_MO` key, including zero/unavailable cells.
- Duty share shows **Revised input** when calculated-duty or consumption input is recorded revised. The reporting-coverage cell shows **Revised input** for a `coverage` or dutiable-value revision, because its affected-share denominator uses dutiable value.
- Explain that revised inputs can leave a displayed derived result unchanged, and no mark does not mean never revised or final. State that attribution here is monthly. Label the existing footer **Estimated-duty release revisions**; preserve its boolean meaning.

Only `serializeDutyCsv(view:DutyView):string` changes. Preserve every existing column/value/quote/row/filename and append:

| Field | Monthly row | Rolling row |
| --- | --- | --- |
| `revised_scope` | `estimated_duty_release` | `estimated_duty_release` |
| `recorded_revision_scope` | `monthly_inputs` | `not_assessed` |
| `recorded_revision_inputs` | Matching canonical input tokens joined by ` | `; empty if none | empty |

The existing `revised` remains release-wide. Empty rolling input text is not a false revision verdict; its explicit scope is `not_assessed`. This is an intentional append-only CSV change; strict column-count consumers may need adjustment. All other serializers retain their current contracts.

## Global constraints and complete permissions

Approval covers all four tasks without routine permission pauses:

1. Root implementation, read-only input audit, independent review, managed worktrees/`codex/` branches/commits and scoped filesystem/runtime/network permissions. Use existing locked Node 24/Python tooling and `npm ci --ignore-scripts` if needed; set `SITE_PACKAGE_PYTHON` to the pinned local interpreter for existing tests/packaging. Reuse pinned Chromium or install its existing version from the official distribution. No new dependencies/actions/services.
2. Application changes are limited to `duty-types.ts`, `duties.ts`, `downloads.ts`, `EstimatedDuties.tsx` and explanatory Methods copy. Tests cover those contracts; existing synthetic fixture revision-summary/count expectations may change only where the four added duty keys require it. No unrelated refactor or timeout/retry/configuration/workflow changes.
3. Read/hash the authenticated seven accepted/eleven protected inputs before/after. Permit bounded private copies of the existing seven processed files, at most **16 MiB per stage**, for one candidate stage and, only if needed, one repair stage. No raw-source copies/replay, accepted-data replacement or intake.
4. Permit focused RED→GREEN tests, one final full local unit/type check, targeted fixture browser checks, independent CSV compatibility calculations, existing site stage/build/package verification and bounded retained-package browser checks. Capture build file count/size/largest asset; preserve existing package/live limits and the 15,000-file planning alert. Keep pages/chart data together and browser-generated downloads.
5. Preserve proposal/logs/review/packages/completed ledgers and proof under ignored `data/backups/estimated-duty-monthly-revisions/deployment-20261016-r1`, at most **750 files/96 MiB**. Preserve originals and failed evidence; start/stop only owned processes. No large-suite repetitions without a diagnosed failure or material change.
6. Permit public GitHub push/PR/attachment/update, normal CI, reviewed expected-head-protected merge and clean-main synchronization. Require successful push/PR Code checks on the exact final reviewed head. No manual import/audit/deployment workflow dispatch. One conditional repair PR/review is allowed only for a newly demonstrated publication regression within this same contract.
7. Permit publication of the exact authenticated candidate to the existing **Free us-trade-tracker / Production / main** Pages project, account `2e23d873002d29a02a1427e1fa37c5cd`. Confirm current account/project/plan/Production assignment and predecessor before upload. Use existing authenticated access and the proven package procedure; retrieve current official provider documentation before any API operation. No new credentials, access expansion, paid change or project creation.
8. Permit one predecessor live-verification run, one candidate run and their bounded browser cases on the canonical and dashboard/provider-observed deployment origins. On regression, automatically restore the pinned verified predecessor and verify restoration. Permit at most one demonstrated repair, with fresh verification, independent review, exact-head CI and reviewed merge before a second candidate upload/live verification. If that fails, restore/verify the predecessor and report the feature incomplete. Do not infer a deployment origin from a package hash.
9. Reserve three native attachment slots at setup. If necessary, preserve identity/URL and verify merged status before unlinking at most **two obsolete merged standalone PR chat references**. Preserve completed logs, then confirm native archive and exact checkout/Git-registration absence; authenticate Windows/MSYS cache ownership and resolved targets before deleting only owned plan caches. Final readback requires actual cleanup and clean main.

Excluded: imports/source requests; accepted-data/selection/classification changes; new products/countries/months; R2 operations; new dependencies/services; paid/access/indexing changes; analytics, outreach/participant collection and recurring jobs. Existing R2 capacity permission is unused. Pause only dependent work for unexplained drift, missing required evidence or a new material boundary.

## Pinned compatibility and restoration evidence

The post-merchandise-revision baseline is PR114's authenticated `compatibility.json` (SHA256 `178574dedbc4b90fb9b3ca9ea2e6a0254078cba6c415527ed0b009e8061f52e6`). Use its **candidate** identities, not its older pre-merchandise `baseline` identities. Of 139 CSV identities, exactly four `*-duties.csv` cases intentionally gain columns: world and `1220-2010-2050` for each accepted coffee product. Independently remove only the three appended fields at quoted-record boundaries to recover all original bytes; the other **135 CSVs** and separate Canada projection must stay identical. Retain the historical extra28 group's indirect producer-binding qualification; compatibility is not fresh source validation.

Last verified public predecessor: deployment `3e956f76-8c0e-42bf-9452-6ec16e5af029`, observed origin `https://3e956f76.us-trade-tracker.pages.dev`, canonical `https://us-trade-tracker.pages.dev`. Its retained PR114 package is under `data/backups/merchandise-recorded-revisions/deployment-20261016-r1/packages`: site ZIP SHA256 `a2efe7f7ca170c253c3e0aa8f4c6e22d2821c1a121b72783e3ac5bca0ff9aa81`, manifest SHA256 `19f72360e296690c9370753c36fc6304cc5645c8146f6ea94a3e90d8e87ddf86`. Authenticate and recheck actual Production before publication; unexplained drift blocks upload rather than substituting another predecessor.

## Review focus

1. Consumption-only revisions must flag the share, not calculated-duty dollars; dutiable/coverage-only revisions must not flag the duty share. Tasks 1–2.
2. Reported zero, suppressed or removed monthly inputs must retain exact key attribution without changing availability or manufacturing numbers. Tasks 1–2.
3. Unrelated product/partner/month/merchandise keys must not leak into monthly labels; a release-wide yes may coexist with no matching displayed marks. Task 1 and browser checks.
4. A revised input may leave a ratio unchanged; rolling rows remain explicitly unassessed and hollow chart qualifications retain their meaning. Tasks 2–3.
5. Real empty-key releases must show no invented labels; CSV compatibility, actual package source, provider assignment and actual cleanup must remain independently bound. Tasks 3–4.

## Task 1: Project exact monthly duty revision inputs

**Files:** Modify `src/lib/trade/duty-types.ts`, `src/lib/trade/duties.ts`, `tests/trade/duties.test.ts`, and `tests/trade/browser-release.test.ts`.

**Interfaces:** Produce the required sparse `DutyView.monthlyRecordedRevisions` contract above. Preserve all existing period/comparison/provenance values and compact release transport.

- [ ] Authenticate prior completion/input pins; establish isolated worktree/ledger and preserve the approved proposal. Read the writer and current view before editing.
- [ ] Add failing tests for exact input/product/geography/partner/month isolation; duplicate keys; zero, suppressed and removed monthly values; legacy/empty lists; and compact round-trip parity. Pin literal sample totals (30/400 = 7.5%, prior 10/200 = 5%) and unchanged comparison objects when only keys differ. Run `npm test -- tests/trade/duties.test.ts tests/trade/browser-release.test.ts --maxWorkers=2`; expect missing-projection RED.
- [ ] Implement only the projection/type contract. Run the same command; expect GREEN. Inspect scope and commit.

## Task 2: Present monthly attribution and append CSV fields

**Files:** Modify `src/components/EstimatedDuties.tsx`, only `serializeDutyCsv` in `src/lib/trade/downloads.ts`, `src/pages/methods.astro`, `tests/ui/EstimatedDuties.test.tsx`, and duty CSV tests in `tests/trade/duties.test.ts`.

**Interfaces:** Consume Task 1's metadata; produce the table labels and exact three appended fields. Other tables/serializers and all calculations remain unchanged.

- [ ] Write failing table/CSV cases for each input independently, shared dependencies, combined inputs, zero/unavailable cells, no matches, unchanged ratios, CSV escaping and rolling `not_assessed`. Assert release-level `revised` retains its meaning. Run `npm test -- tests/ui/EstimatedDuties.test.tsx tests/trade/duties.test.ts --maxWorkers=2`; expect missing labels/columns RED.
- [ ] Implement monthly-only labels, explanatory copy and appended columns. Run the same tests; expect GREEN with original numerical/qualification assertions retained. Commit all runtime/test changes before creating the real candidate.

## Task 3: Verify fixtures, retained compatibility and reviewed integration

**Files:** Create `tests/e2e/estimated-duty-recorded-revisions.spec.ts` and `docs/validation/estimated-duty-monthly-revisions.md`; modify only `duties.revisedKeys` in the two existing product JSON fixtures and, if required, their existing revision-count expectations in `tests/e2e/release-briefing.spec.ts`; update this plan's actual local progress.

**Interfaces:** Consume Tasks 1–2; produce authenticated local acceptance, tested source/package identities and one reviewed merge. Keep later documentation-only commits separate from the actual package source; never relabel its manifest.

- [ ] Add four explicitly synthetic keys to each fixture, substituting its own HS code: `imports/<code>/2024-02/world/-/CAL_DUT_MO`, `imports/<code>/2025-02/world/-/CON_VAL_MO`, `imports/<code>/2024-07/country/1220/DUT_VAL_MO`, `imports/<code>/2024-08/country/1220/coverage`. February 2024 world duties are reported zero; July 2024 Canada is absent. Preserve every observation, existing merchandise key and other fixture property.
- [ ] Add browser checks for both products' world/country labels and CSVs, Imports/Exports isolation, country selection and restored views, 320/375px keyboard/table behavior and no-JavaScript defaults. Wait for enabled controls before keyboard focus. Build explicit fixture mode and run `npx playwright test tests/e2e/estimated-duty-recorded-revisions.spec.ts tests/e2e/estimated-duty-history.spec.ts tests/e2e/release-briefing.spec.ts --retries=0` on a verified unused loopback port; expect all cases pass and no altered chart-marker meanings.
- [ ] Run one final `npm test -- --maxWorkers=2 --testTimeout=30000` and `npm run check`; expect all tests pass and zero diagnostics. The established local allowance changes no repository/CI timeout. Recheck allowed-file/fixture deltas and original seven/eleven hashes.
- [ ] Commit tested code/fixtures, stage existing processed inputs through the current selection contract, and build/package/verify/read back site and withdrawal outputs. Recreate ZIPs deterministically. Check all 139 CSV identities with the four append-only exceptions; preserve Canada projection and inspected duty/merchandise PNGs. Exercise all four real duty CSV cases, both static defaults and both mobile views, plus bounded merchandise/changes/duty-chart/Canada coexistence and private-route checks. Real monthly revision lists must be empty.
- [ ] Document actual local evidence and limits. Obtain one fresh whole-branch review, resolve material findings in one verified pass, then require successful push/PR CI on the final reviewed head before expected-head merge and clean-main synchronization. No bookkeeping-only PR; later actual publication/cleanup results go in the same PR/private closeout.

## Task 4: Publish, verify and complete actual cleanup

**Files:** Private publication/restoration/finalization records; same PR description.

**Interfaces:** Consume the exact reviewed-source candidate, authenticated predecessor and confirmed existing provider target. Produce a verified public update and actual cleanup, or an honest incomplete outcome after bounded restoration.

- [ ] Confirm target/Free plan/Production/predecessor and authenticate the pinned site before upload. Publish only the verified candidate, observe actual Production/deployment origin, and run existing served-file/header/404 verification plus the named monthly-table/CSV, static/mobile and coexistence checks on the observed public site. Existing real figures and qualifications must remain exact, with no invented revision labels.
- [ ] On regression, restore and verify the pinned predecessor. Use only the authorized one demonstrated repair/second candidate after proper tests/review/CI/merge; otherwise preserve the failure and report incomplete.
- [ ] Stop owned previews; preserve/read back bounded proof and completed logs. Confirm native archive, checkout/Git-registration absence and authenticated owned-cache deletion, then verify clean main and unchanged inputs. Queued operations remain pending. Record actual results in the same PR.
- [ ] Hand off monthly-only attribution, the three-column CSV addition and remaining limits. No new source validity, customer-demand or successive-release acceptance claim.

## Self-review and approval handoff

The four tasks address a known original-scope remainder without changing amounts or broadening revision history. Metadata stays outside shared comparisons, derived labels describe inputs, and rolling CSV applicability is explicit. Four synthetic keys cover all input kinds, a real zero and a missing row. Compatibility uses post-PR114 identities; restoration uses the exact last verified public package. Root execution, review, publication/restoration and actual cleanup are covered; imports, accepted-data changes and R2 remain excluded.

Review this combined design, four tasks and full permission envelope. Full approval authorizes execution through reviewed publication and actual cleanup without routine approval pauses.

## Execution correction from authenticated inventory

The retained 139-identity inventory contains ten duty CSV cases: four legacy84 cases and six duty-group world/one/three selections. The original four-exception/135-unchanged count omitted the latter six. The single approved duty serializer necessarily appends the same three columns to all ten; independent verification strips only those fields and requires the original bytes to match in every case. The other 129 identities remain byte-identical. This corrects acceptance accounting and does not add another exporter, data change or feature. The exact approved proposal is preserved privately.
