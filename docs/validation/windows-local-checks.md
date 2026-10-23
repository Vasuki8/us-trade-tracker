# Windows local-check reliability

This checkpoint gives 35 existing filesystem integration cases an explicit 20-second budget on Windows. Other platforms inherit the existing Vitest default. Test callbacks, assertions, fixture isolation and cleanup are unchanged; the global configuration is unchanged.

The scope is 20 staged-file/readback cases in `site-staging.test.ts`, 14 assembly cases in `site-assembly.test.ts` and one synthetic Mexico selected-recovery case in `upload.test.ts`. Mexico transport deadlines and other short failure checks retain their original limits. The existing 1001-file assembly check keeps its separate 30-second limit on every platform.

## Measurement and rationale

At unchanged base `73654c24e2c21909f85d30efb0b9e3df4ea02a2e`, the three affected files ran 58 cases: 44 passed and 14 hit the default 5000ms timeout. The named failures shifted from the preceding full Windows run, where 14 checks in these same files timed out. Some successful checks also approached five seconds.

Temporary test-only instrumentation used `performance.now()` because the Mexico tests intentionally freeze `Date`. It retained all assertions and restored the exact original test bytes after each diagnostic. Three representative operations completed successfully within a bounded 30-second measurement window:

| Check | Measured phases | Total |
| --- | --- | --- |
| Accepted-input staging | Fixture 0.75s; staging 2.31s; remaining full-byte assertions/checks 1.88s | 4.94s |
| Site assembly | Fixture/staging setup 3.07s; preparation 2.43s | 5.50s |
| Synthetic Mexico selected recovery | Fixture 0.49s; recovery 2.26s | 2.75s |

The first diagnostic completed but did not retain successful-test console timing output; the corrected diagnostic wrote private timing receipts directly. Both outcomes are preserved. These are developer-machine observations, not performance guarantees or a benchmark improvement claim.

A 20-second Windows-only budget allows bounded headroom for the real filesystem/Git operations and byte assertions. It does not speed them up. An integration failure may take longer to report. Production's 10-second Windows-attribute helper guard, the tested 25ms hanging-body deadline, hash/path/reparse checks and all rejection assertions are unchanged. No new mocks, retries, fixture sharing or skips were introduced.

## Running the checks

Use Node 24 and the locked dependencies from `npm ci`. Ensure Python 3.12 or newer is available for packaging tests. If the default `python` command is unavailable or opens a launcher, set `SITE_PACKAGE_PYTHON` to a real Python executable in your environment. The verification here uses the existing bundled runtime; no dependency was added.

Run the normal full suite and compiler checks; no CLI timeout override is required:

```powershell
npm test -- --maxWorkers=2
npm run check
```

For the affected integration cases alone:

```powershell
npx vitest run tests/scripts/site-staging.test.ts tests/scripts/site-assembly.test.ts tests/mexico-country-archive/upload.test.ts --maxWorkers=2
```

Both normal affected-suite runs passed all 58 cases. The full Windows run then passed all 2,095 tests with zero failures or skips, including the actual junction-attribute check and the short hanging-body deadline check. These runs used two workers and no CLI timeout override. All 387 compiler files passed with zero errors, warnings or hints. Independent review and exact-head Linux CI are required before merge; the implementation PR records those results and actual cleanup evidence.

## Boundaries

The tests use isolated synthetic Git/filesystem fixtures and mocked archive transport; they make no official source or R2 requests. Accepted inputs and the two existing 41-member site packages are checked read-only. This checkpoint changes tests and documentation only. The public deployment remains 16b5e4f3, including its fixed Canada snapshot and unpublished Mexico country pages; no production package build, upload or restoration is part of this work. Standard CI may build labeled fixture pages for its browser checks. Windows Firefox launch limitations remain separate.
