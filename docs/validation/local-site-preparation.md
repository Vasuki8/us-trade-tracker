# Local site preparation verification

Verified October 14, 2026. This batch prepares the existing fixed pilot locally; it does not authorize publication, new data, R2 access or source replay.

## Rehearsed source and accepted inputs

Final rehearsed runtime source: 1a7466496dafb64a6688a697a95ab1d55065b007, based on d43c45f7e47da0741ab9a57f465edf0d80b82179. The initial rehearsal used c5a3f39d313cc6e0525f30fd11a9e3ffe471440e; the final rehearsal includes the independently reviewed filesystem fixes. Subsequent closeout edits are documentation only.

The tracked staging command exported committed Git blobs from a clean isolated checkout. It authenticated and copied exactly seven named Canada/coffee state files (8,186,318 bytes), including the selected Canada acceptance record and projection. The eleven contract-protected original inputs and all seven originals matched their initial fingerprints after preparation. No raw Canada archive was opened or copied.

The dependency junction binds the staged project to the source checkout's existing Node 24 runtime and lockfile. Builds can update that runtime's ignored caches. This is an owned local operation with a shared runtime; it does not establish isolation from a concurrent build or authenticate an independently installed runtime.

## Commands and packages

Follow the [PowerShell preparation recipe](../../README.md#local-site-preparation). The rehearsal performed create, pre-build readback, an explicit Census/snapshot Astro build, post-build readback, assembly, Python ZIP creation and independent ZIP readback. The initial build correctly rejected empty private-preview flags: on this PowerShell/.NET runtime, SetEnvironmentVariable(null) exports an empty variable. The documented command now uses Remove-Item to make those flags absent and restores absence explicitly.

| Artifact | Entries | Raw bytes | ZIP bytes | ZIP SHA-256 |
| --- | ---: | ---: | ---: | --- |
| Site | 30 | 1,534,094 | 366,534 | f8ba67e6179b494d0e90495e107b8c86fd27e6dbdc0afbfa699c9597122f833c |
| Withdrawal | 3 | 1,179 | 1,075 | af671ea2a9546b6ea76cfcd753c3286ca020cc4622c629d095fa2ae60a005932 |

The site manifest SHA-256 is c27bcf583255f06211210a85263c41ca0b8ec6337340e0fc0f6fdb02b83b01b5. The withdrawal manifest SHA-256 is b5a1ccb7b032335119a47079b56b1501cb6397561b8c77b6a3312ac665476b2c. Largest site entry: products/090121/index.html, 283,300 bytes. Both packages satisfy the existing 1,000-entry dashboard limit including control files, and the 25 MiB per-file limit. The 15,000-file planning alert remains clear.

Recreating each ZIP from the same tree and manifest produced identical ZIP bytes. Comparing the new served tree with the retained prior preparation found 20 identical entries, nine HTML pages differing only in generated Astro island identifiers, and the Methods page differing only in its preparation timestamp. Fresh hashes are recorded rather than copied from prior evidence.

## Local research rehearsal

An exclusive loopback server served only the assembled site tree. Browser contexts blocked external requests. These checks verify local behavior; provider headers, public upload and live verification are outside this batch.

- Canada: all 48 monthly values, 20 category summaries, 17 eligible and three unavailable comparisons, both directions, revision qualifications, four sourced CSV downloads, fixed acceptance time, keyboard disclosure, mobile widths and no-JavaScript behavior.
- Coffee: both products and directions, retained world values, monthly/rolling estimated duties with consumption-value denominators, shared country selection, sourced CSV and 1920 × 1080 chart PNG.
- Portfolio: six selections, twelve CSV downloads and independently summed retained trade/duty values, mobile layout and print behavior.
- Duty movers: eight product/period/metric selections, eight downloaded CSVs, independent retained-observation sums, rational ordering, qualification/exclusion counts, and no-JavaScript behavior.
- Existing changes pages: import/export switches. Private preview routes, invalid country and accepted-data paths returned the standalone local 404.
- All 84 existing coffee/change/portfolio CSV outputs matched byte-for-byte between original accepted state and staged state. The Canada CSV baseline was freshly generated from original accepted state. This is a preparation/data-contract rehearsal, not a new independent audit of Census source data or unchanged serializers.

Source under src/ and deployment/ is unchanged from the pre-batch commit. Screenshots were inspected for Canada mobile, shared coffee and duty movers mobile. Original evidence/pointers remain unchanged.

## Automated checks and private evidence

Thirty-seven preparation tests on Windows exercise authenticated staging/readback, unsafe/occupied paths, changed or missing inputs, forged receipts, hardlinks/runtime links, templates/private payloads, package limits and roundtrips through the existing Python packager. CI uses fixtures and Python 3; it requires no accepted private data or secrets.

The final check set is the complete unit suite with two workers, Astro/TypeScript diagnostics, the ordinary fixture build and all three existing browser suites, plus the 24 Python packaging tests. Initial results: 1,117/1,117 unit tests across 92 files; Astro/TypeScript diagnostics with zero errors, warnings or hints; 78/78 browser tests (61 ordinary, ten private-preview fixtures and seven pilot fixtures); 24/24 Python packaging tests. Fixture build: 27 files, 651,511 bytes; largest asset 212,848 bytes. Independent review and CI integration are recorded at closeout.

Private run artifacts, fresh baselines, browser downloads/screenshots, readback receipts, fingerprints and test logs are preserved in the primary checkout's ignored .tmp/local-site-preparation-validation-20261014-r1 directory. No private evidence belongs in the served tree.

## Independent review and integration

A fresh read-only whole-branch review covered d43c45f..f8e9954. It found two Important filesystem boundary defects and no Critical or Minor findings. Root reproduced the defects before fixing them: relocated/no-longer-ignored stages, assembly outside the preparation boundary, and non-symlink Windows reparse attributes or incomplete attribute results.

Readback now applies the same ignored source-root/.tmp boundary as creation, before reading the receipt and again before success. On Windows, a hidden read-only PowerShell helper queries [native file attributes](https://learn.microsoft.com/en-us/dotnet/api/system.io.fileattributes), including the 1024 reparse flag, for every inspected component. Paths travel as JSON data; the single bound dependency link remains the only exception. The helper installs no dependency and fails closed on missing/invalid attribute results. A real Windows junction/missing-path test verifies the adapter.

Seven added regressions pass. The fix pass passed the full Windows suite (1,124/1,124 tests in 93 files) and clean diagnostics. CI also runs the existing application/browser/Python checks; its Windows-specific adapter test is skipped on Linux while the platform-neutral reparse and containment regressions still run.

The corrected runtime was committed as 1a7466496dafb64a6688a697a95ab1d55065b007. A second fresh staging/build/readback/assembly/ZIP/browser rehearsal passed on that exact source. It again preserved all original/protected hashes and 84 CSV outputs. New served-tree differences are limited to the documented Astro identifiers and Methods timestamp. Subsequent edits are documentation only.

Decisions on the reviewer's excluded behaviors:

- Public deployment/provider behavior/live headers remain outside the authorized local batch; local proof cannot establish live provider behavior.
- Accepted input/source correctness is preserved without an unauthorized new Census/raw replay; existing source errors could persist.
- Dependency installation purity and concurrent-build isolation remain outside the shared-runtime guarantee; ignored caches could interfere with another build.
- Arbitrary substituted build assets are not independently attested by a successful manifest; rely on the controlled build and research rehearsal, with the risk that benign manual substitutions could pass structural checks.

No deferred minor findings. Exact-head CI, protected merge, main-tree identity and evidence-preservation results are recorded in the batch pull request and private closeout receipt. This record makes no deployment claim.
