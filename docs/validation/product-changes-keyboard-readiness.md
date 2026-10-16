# Product changes keyboard readiness

Local acceptance checkpoint: October 16, 2026. This test-only repair makes two existing product-changes keyboard journeys wait for their initial control to become enabled, then confirms focus before sending keyboard input. Application controls, calculations, downloads, data and hosting are unchanged.

## Observed failure and correction

The retained first PR114 CI attempt failed the monthly manual-copy journey: Copy changes link was disabled immediately before the test attempted focus, then Enter. The manual field never appeared. A later enabled snapshot cannot establish that the earlier focus succeeded. The original trace/log, unchanged retry and independent input audit remain preserved; no new flaky failure was manufactured for this batch.

The 375px keyboard journey similarly focused its Imports radio immediately after navigation. Its correction follows the same disabled-until-ready contract; no observed failure is claimed for that second journey. In both cases, the existing controls correctly remain disabled until the saved browser state and link are restored.

The repair adds only four assertions in `tests/e2e/pilot-product-changes.spec.ts`: enabled before initial focus and focused before initial ArrowRight or Enter. Every original keyboard action and functional assertion remains, including scrolling, CSV filename, manual-link URL/hash, period switching, duplicate-query recovery and no-JavaScript defaults. No application hook, sleep, retry, timeout increase, forced enabling or duplicate test harness was added.

## Local verification

- The existing seven-case browser spec passed once with zero retries on a verified unused loopback port. Its owned preview server stopped afterward.
- Astro/TypeScript checked 308 files with zero errors, warnings or hints.
- The explicit synthetic fixture build succeeded: 28 files, 847,400 uncompressed bytes; largest asset `_astro/client.EoSUrE1U.js`, 212,848 bytes. These are fixture-build measurements, not a new public package.
- The exact patch check preserves all other test code. Only the test file, this record and the approved plan change. Application source, fixtures, workflows, configuration and locked dependencies remain identical to the base.
- All seven accepted and eleven protected input identities match their authenticated prior records. No accepted-data copies, raw replay or provider/source operations were needed.

The observed prior CI failure supplies the existing RED; the seven passing cases verify their asserted outcomes after the synchronization correction. This does not prove every timing failure is eliminated or claim a user-facing production defect. A redundant local full-unit run was omitted under the approved test-only scope; normal push/PR CI still runs its full checks.

## Integration boundary

Independent whole-branch review, exact-head CI, reviewed merge and actual archive/cache cleanup follow this committed local checkpoint. The single implementation PR and private finalization will record their actual results. No website publication is required or included.

Private proof is retained under ignored `data/backups/product-changes-keyboard-readiness/verification-20261016-r1`. Owner-run pilot observations and a successful update across successive official releases remain separate strategic gates.
