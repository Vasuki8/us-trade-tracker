# Local Site Preparation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Root implements; subagents review. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing fixed-pilot source → accepted local data → Astro build → site/withdrawal manifest → verified ZIP flow repeatable without dated private preparation scripts.

**Architecture:** Promote the proven staging and assembly operations into two narrow tracked TypeScript tools. Keep Astro's existing explicit build command between them and reuse `scripts/package_site.py` for ZIP creation/readback. Preserve the existing website, accepted releases, schema-v1 upload manifests and publication boundary.

**Tech Stack:** Existing Node 24, TypeScript/tsx, Astro, Vitest, Playwright and Python 3.12+ standard library. No added dependencies, hosted service or build coordinator.

**Spec:** The bounded design and permission envelope below, extending the existing [fixed-pilot deployment design](../specs/2026-10-13-canada-pilot-deployment-design.md) and [local packaging contract](../../../README.md#local-site-packaging). Existing source/data contracts remain authoritative.

**Status:** The owner approved all five tasks and the full bounded permission envelope on October 14, 2026. Root implementation is in progress, with independent review before integration.

## Bounded design

The current ZIP tool verifies an existing manifest and prepared tree. The earlier steps still live in ignored, dated scripts: authenticated source/data export, build readback and site/withdrawal assembly. Assembly alone would retain that dependency. Promote both operations, with the build kept as an ordinary explicit command.

Use a clean committed source checkout and a separate explicit local data root. The latter supports the existing primary checkout's accepted data while development happens in an isolated worktree. Export authenticated regular Git blobs into a fresh private preparation directory; copy exactly the existing seven accepted-state files. Record the chosen commit, source inventory, named data identities, selected Canada identity and existing dependency runtime. Verify those inputs before/after the build and assembly.

Assembly creates the site tree with its provider header/error template, and a separate three-entry withdrawal tree. Each receives the existing schema-v1 preparation manifest. ZIP creation and verification remain separate existing commands, and every receipt stays outside served trees.

This supplies a repeatable local recipe. Public upload, live verification, new source data and successive-release acceptance remain later decisions.

## Global Constraints

- Fixed coverage: roasted coffee `090121`, green coffee `090111` and Canada `1220`, with accepted reporting data through August 2026. No intake, release promotion, pointer rewrite or data-definition change.
- Read only existing local accepted/compact country data and the four coffee pointer/release files. Do not download, replay or copy the approximately 7.95 GB raw Canada preservation set.
- Keep Node 24, existing locked dependencies and Python 3.12+ standard library. Reuse existing `node_modules` locally, recording this fact; do not claim a fresh-machine install or OS isolation.
- Use fresh ignored task directories. Refuse occupied outputs, escaped paths, case collisions, nonregular/hardlinked files and source/data/output symlinks or reparse ancestors. The only dependency-link exception is the explicitly bound `project/node_modules` runtime link; it never applies to other paths or packages.
- Preserve schemaVersion `1`, status `prepared-for-owner-deployment-review`, packageKind `site|withdrawal` and current manifest field/role/template mappings. A manifest's status is preparation metadata, not publication approval.
- Package bounds remain `1,000` entries including controls and `26,214,400` uncompressed bytes per asset. Normal build reporting retains the `15,000`-file planning alert. Keep headers `noindex,nofollow`.
- Preserve current pages, browser-generated downloads, CSV contracts, data qualifications and same-host static delivery. Keep R2 private and untouched.
- Fail without a success receipt when validation fails. Preserve partial task-owned output for diagnosis; another attempt uses a fresh directory rather than overwriting it.
- A fresh build can change preparation-time metadata in `methods/index.html`. Measure new outputs and explain differences. Require byte-identical ZIP recreation only for the same prepared tree and manifest.
- Runtime/template changes after the real rehearsal require affected checks again. Later documentation-only changes require a proven diff, not another full build or raw-source scan.

## Permission envelope for the whole batch

Full approval authorizes all five tasks, with root implementation and independent reviewer subagents. It includes:

1. Source, test and documentation edits in the repository; creation/reuse and later archiving of a managed worktree; routine safe fixes needed by this batch.
2. Read-only use of the existing accepted local data and protected-input hashes; bounded copies of the seven accepted-state files into fresh ignored preparation directories. Originals, sealed evidence and accepted pointers remain intact.
3. Local source export, builds, site/withdrawal preparation, ZIP creation/readback, private receipts/backups, localhost previews, browser tests and screenshots/downloads. Stop only task-owned previews and remove only verified task-owned temporary files after preserving needed evidence.
4. Existing dependency/runtime use, locked `npm ci` when a worktree needs setup, local checks and GitHub's existing Code checks. No dependency changes or paid service activation.
5. GitHub pushes, PR creation/updates/attachment, independent review, exact-head CI and reviewed merges under the owner's standing merge permission. Do not repeat ordinary task/design/merge approvals inside this approved batch.

**Excluded:** Census/API imports or downloads, raw-source replay, R2 reads/writes, Pages/account operations, public-site deployment/restoration, accepted-data replacement, additional products/countries/months, new dependencies or services, costs, access-setting changes and recurring jobs.

Request an owner decision only for a new material scope/cost/access/publication boundary or missing accepted evidence that cannot be resolved within this scope. Failed checks and important review findings stop dependent integration while they are investigated and fixed under the batch's existing authority. Preserve progress and complete unaffected work. Any later website publication must present its actual package identities and target for a separate decision; this plan does not preapprove an unknown future upload.

## Review Focus

1. Source checkout versus data root versus preparation root: verify the requested source commit, exact allowed data identities and containment independently; a dependency link cannot excuse any other reparse path. Tasks 1–2.
2. Changed inputs during copy/build, missing members or forged receipts: reject mismatches through stable reads and pre/post readback; compare metadata within each Windows path/handle domain. Tasks 1–2.
3. Crossed templates, private/fixture output, case collisions and misplaced receipts: reject before a successful manifest/package, while allowing harmless client guard literals. Task 3.
4. Occupied directories, partial outputs, exact bounds and malformed ZIP members: preserve existing files and retain the package tool's complete-stream validation. Tasks 3–4.
5. Fresh-build clock metadata, shared runtime and actual CSV/data preservation: classify output differences, prove the original inputs unchanged and avoid broader reproducibility/publication claims. Task 4.

## File responsibilities and shared interfaces

- Create `scripts/site-preparation-files.ts` for the preparation tools' stable bounded file reads, exclusive writes and containment checks. Reuse existing digest/path helpers where their contracts suffice; leave existing data modules unchanged.
- Create `scripts/site-staging.ts` for source/data export and receipt readback; `scripts/stage-site.ts` for its `create`/`verify` CLI.
- Create `scripts/site-assembly.ts` for prepared trees and schema-v1 manifests; `scripts/prepare-site.ts` for assembly CLI.
- Create `tests/scripts/site-staging.test.ts`, `tests/scripts/site-assembly.test.ts` and `tests/scripts/site-preparation-integration.test.ts` using small disposable fixtures. Add a private test helper if shared setup warrants one.
- Modify `package.json` only for `site:stage` and `site:prepare` aliases. Extend existing CI only as needed for fixture integration; keep its two-worker unit command and Python packaging step.
- Update `README.md` and create `docs/validation/local-site-preparation.md` for the commands, limits and observed rehearsal.

Define `SiteStageOptions = {sourceRoot:string;dataRoot:string;outputRoot:string;commit:string}`. `createSiteStage(options:SiteStageOptions):Promise<SiteStageReceipt>` exports only the supplied full-SHA current HEAD from a clean source checkout. Its private schema-v1 receipt has status `staged-for-local-build`, `codeCommit`, sorted `sources` with path/Git mode/Git blob/bytes/SHA-256, named `data` identities, `country`, named `products` and `runtime` (Node major, shared dependency target and lockfile identity). File digests use the existing `{bytes,sha256}` shape; exported/staged file identities also include `path`.

`verifySiteStage(options:{sourceRoot:string;dataRoot:string;stageRoot:string}):Promise<SiteStageReceipt>` authenticates the receipt to its local Git commit and original allowed data, then verifies copied files and the runtime-link boundary. Verification uses the recorded immutable commit; it does not move HEAD.

`prepareSite(options:{sourceRoot:string;dataRoot:string;stageRoot:string;buildRoot:string;outputRoot:string}):Promise<SitePreparationReceipt>` calls stage readback itself, assembles both package kinds and returns private manifest/tree identities and measured counts. Its output contains `site/`, `withdrawal/`, `site-manifest.json` and `withdrawal-manifest.json`. Require `buildRoot` to be the preparation's `real-dist` and a fresh separate assembly `outputRoot` within that preparation. Do not invent a new public manifest schema.

CLI contracts: `stage-site.ts create --source-root --data-root --output --commit`; `stage-site.ts verify --source-root --data-root --stage-root`; `prepare-site.ts --source-root --data-root --stage-root --build-root --output`. Paths are explicit local arguments, with no network/configuration discovery. Committed source and accepted data are read-only; the documented shared dependency runtime may update its ignored build caches; output roots are owned ignored directories. Build provenance comes from the recorded build recipe and acceptance evidence, rather than treating manifest metadata as proof of how arbitrary assets were compiled.

## Task 1: Authenticate source and accepted-data staging

**Files:** Create the shared file helper, staging module/CLI and staging tests.

- [ ] Write failing tests named `exports_requested_clean_head`, `stages_only_seven_named_inputs`, `refuses_dirty_or_crossed_commit` and `refuses_occupied_or_escaped_output`. Assert Git-blob equality, exact source inventory, unchanged originals and no success receipt on failure.
- [ ] Run `npm test -- tests/scripts/site-staging.test.ts --maxWorkers=2` and confirm the failures concern the missing behavior.
- [ ] Implement `createSiteStage` and the `create` CLI. Export only Git modes `100644`/`100755`; reject links/submodules and nonportable/colliding paths. Authenticate copied bodies and save the receipt last.
- [ ] Select Canada's pointer/package/approval through the existing selected-release/pilot loaders and pins. Select the two named coffee pointer/release pairs by explicit paths and identities. Replace positional `protectedFiles.slice(0,4)`/`data.slice(3)` assumptions; permit no other accepted-state file.
- [ ] Run the tests plus `npm run check`; commit this independently testable staging change.

## Task 2: Read back staged inputs around the controlled build

**Files:** Extend staging module/CLI/tests; document the build recipe in README.

- [ ] Add failing tests `rejects_missing_changed_or_forged_stage`, `rejects_unexpected_stage_file`, `dependency_exception_is_one_bound_link` and `metadata_changes_during_read_fail`. Test input/output junction ancestors, hardlinks and the Windows metadata-domain regression as applicable.
- [ ] Run the focused staging tests; implement `verifySiteStage` and the `verify` CLI. Verify the complete recorded source inventory against Git and copied/original allowed data. Permit only expected build-generated paths (`project/.astro` and `project/dist`) after building; arbitrary extra files fail. Prefer `real-dist` outside `project`.
- [ ] Document an explicit existing Astro build from `project` with `TRADE_DATA_MODE=census`, `CANADA_PILOT_MODE=snapshot`, and `CANADA_PREVIEW_MODE`/`CANADA_ACCEPTED_PREVIEW_MODE` absent: `npm run build -- --outDir ../real-dist`. Require fresh build output and stage verification immediately before and after. Do not add a build coordinator.
- [ ] Run focused tests and code checks; commit the readback and controlled-build recipe.

## Task 3: Assemble compatible site and withdrawal manifests

**Files:** Create assembly module/CLI/tests; add the two npm aliases in package.json.

- [ ] Add failing tests `assembles_site_controls_from_git_templates`, `withdrawal_has_exact_three_entries`, `rejects_changed_templates_and_private_output`, `rejects_rendered_fixture_data` and `refuses_collisions_limits_and_occupied_output`. Ordinary client validation literals must not be mistaken for rendered fixture data.
- [ ] Run `npm test -- tests/scripts/site-assembly.test.ts --maxWorkers=2`; implement `prepareSite` and its CLI. Require verified staging before/after assembly. Read only the chosen build tree and authenticated staged templates; use exclusive stable copies.
- [ ] Preserve the current public manifest fields, country/product identities, roles, totals, largest entry, header rule and template Git-blob/SHA-256 mapping. Apply existing targeted private/fixture/signature/query-key checks and reject raw data, preview routes, receipts, source maps, Functions or worker content. Withdrawal contains only `index.html`, `404.html` and `_headers`.
- [ ] Add `tests/scripts/site-preparation-integration.test.ts` proving both produced manifests/trees are accepted by `package_site.py create`/`verify`. Use an explicit `SITE_PACKAGE_PYTHON` executable for the cross-language test; CI sets `python3`, local execution uses the existing bundled Python. No automatic Python installation or shell command construction. Reuse its current implementation and 24 malformed-package tests; change it only for a demonstrated compatibility defect with a failing regression.
- [ ] Run assembly/staging tests and code checks; commit the assembly change.

## Task 4: Run one real offline preparation rehearsal

**Files:** Update README and validation record; keep actual data/artifacts/receipts in ignored private task storage.

- [ ] On committed runtime code, fingerprint the existing seven accepted-state files and contract-protected inputs. Stage the real fixed pilot into one fresh preparation root; no raw archive, credential or source-download directory enters staging.
- [ ] Execute the documented precheck → explicit Astro build → postcheck → assembly flow. Capture automatic file count, total size and largest file; use the actual new manifest/ZIP hashes.
- [ ] Create/read back the site and withdrawal ZIPs using the tracked Python tool. Verify withdrawal's exact three entries and recreate each ZIP from the same tree/manifest to prove identical bytes.
- [ ] Reuse bounded local research/browser verification for the two coffee profiles, changes/duties/portfolio pages and Canada historical snapshot: retained values, direction/view controls, sourced CSV contracts, mobile/keyboard and absence of private routes. Establish the baseline from the unchanged accepted inputs/current reviewed source, rather than requiring a dated private baseline receipt.
- [ ] Classify fresh-build preparation-time differences; any unexplained material research/data/CSV difference fails acceptance. Recheck original/protected hashes unchanged and preserve private proof. Record the rehearsed source commit and shared-runtime limitation.
- [ ] Run the complete unit suite with two workers, `npm run check`, existing fixture build/browser acceptance and Python packaging tests once on the final runtime change set. Ensure ordinary CI requires no private accepted data. Commit commands, fixture checks and validation evidence.

## Task 5: Review and integrate the completed batch

- [ ] Self-check every design constraint, permission boundary and Review Focus item against the observed result. Request one fresh read-only whole-branch reviewer, giving exact base/head and private rehearsal evidence; root implements fixes. Rule explicitly on declined-to-judge items.
- [ ] Fix important findings with meaningful regressions and only affected reruns. Obtain exact-head Code checks for the final reviewed commit, including both preparation fixture coverage and the existing application/browser/packaging suites.
- [ ] Push, create/attach/update the PR and merge with expected-head protection under standing permission. Synchronize main and prove its source tree matches the reviewed/tested tree; no duplicate full-suite run for an identical merge.
- [ ] Preserve receipts and useful local artifacts, archive the task-owned managed worktree and close the validation record. Report commands, review/CI evidence and the preparation boundary. Perform no provider operation.

## Self review and execution handoff

The existing stage/build/assemble flow owns every planned operation. Five tasks cover source/data binding, readback, assembly, local acceptance and integration; the five Review Focus classes have explicit tests or rehearsal checks. Named data identities remove the private scripts' positional assumptions. The explicit existing build command avoids a new coordinator. Rehearsal claims distinguish fixed accepted data, clock-dependent build metadata and deterministic packaging of the same tree.

After owner review, approval of this combined design/plan authorizes the whole permission envelope and all five tasks. Preserve root implementation with reviewer subagents; no execution-method or routine merge decision is needed again. Material exceptions retain the owner's final authority.
