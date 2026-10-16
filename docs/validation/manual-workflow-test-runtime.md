# Manual workflow test runtime verification

Prepared October 16, 2026. This local checkpoint repairs an existing test prerequisite in the manual import, Canada audit and product estimated-duty audit jobs. It runs no manual data job and changes no accepted observations or website output. Actual independent review, exact-head CI, merge and cleanup are recorded later in the single PR and private completion evidence.

## Defect and correction

The complete unit suite includes real synthetic packaging fixtures that require `SITE_PACKAGE_PYTHON`. Code checks already supplies `python3`, while the three manual jobs ran the same suite without that environment variable. Under their declared environments, the suite fails before their existing preflight/source/provider steps. This assessment uses configuration and runtime-fixture evidence; it does not claim an inspected hosted failure.

Each affected job now supplies `SITE_PACKAGE_PYTHON: python3`, following the existing Code-check convention. Parsed workflows are identical to their baseline after removing only those three declarations. Triggers, conditions, permissions, secrets, inputs, concurrency, artifact retention, action pins, commands, timeouts and candidate-only/backup/promotion gates remain unchanged. No interpreter discovery or test-side fallback was added.

## Local checks

The existing four-suite baseline passed 82 tests. The new configuration regression first failed for exactly the three missing manual-job settings while its seven other cases passed, including the existing Code-check control. All ten cases passed after the correction; the combined focused gate passed 92 tests. Discovery pins all four current full-suite jobs, and effective-environment cases cover workflow/job/step precedence and empty/conflicting overrides.

One unchanged synthetic ZIP fixture was run in a child process with source/provider credentials removed. With the Python setting absent it failed with `SITE_PACKAGE_PYTHON is required`; with the pinned local interpreter it passed (one selected case, eighteen skipped). This exercises the real prerequisite without HTTP or a retained real site package.

Full local verification passed **1,576 tests across 112 files**. Astro/TypeScript checked 305 files with zero errors, warnings or hints. The pinned interpreter and explicitly approved 30-second local Vitest allowance were used; repository and hosted timeouts remain unchanged. This establishes functional completion, not unchanged performance.

The seven accepted and eleven protected file identities remained unchanged under independent before/after authentication and root readback. No accepted files were copied. Private proof is bounded under `data/backups/manual-workflow-test-runtime/verification-20261016-r1` to 300 files/32 MiB.

## Limits and remaining work

Passing configuration checks, the real local fixture and existing CI establishes this test prerequisite. It does not establish a successful hosted manual import/audit, current hosted interpreter version, official-source availability, remote archive behavior or successful updates across successive official releases. Those require their separately authorized operations and exact evidence. No data workflow, Census/source request, R2 operation or site publication occurred in this batch.

Real pilot-task observations remain owner-run. Precise reader revision attribution is separate; a synthetic check cannot substitute for participant evidence or official successive-release acceptance.

## Integration checkpoint

This committed record is the local checkpoint. The single PR and private finalization will record actual independent review, exact-final-head push/PR Code checks, expected-head merge, clean-main tree binding, native archival/checkout absence, completed-log preservation and owned-cache cleanup after they occur. Queued archive operations remain pending until confirmed; no second bookkeeping PR or website deployment is required.
