# Local site preparation verification

Verified October 14, 2026. This batch prepares the existing fixed pilot locally; it does not authorize publication, new data, R2 access or source replay.

## Rehearsed source and accepted inputs

Runtime source: c5a3f39d313cc6e0525f30fd11a9e3ffe471440e, based on d43c45f7e47da0741ab9a57f465edf0d80b82179. Subsequent closeout edits are documentation only.

The tracked staging command exported committed Git blobs from a clean isolated checkout. It authenticated and copied exactly seven named Canada/coffee state files (8,186,318 bytes), including the selected Canada acceptance record and projection. The eleven contract-protected original inputs and all seven originals matched their initial fingerprints after preparation. No raw Canada archive was opened or copied.

The dependency junction binds the staged project to the source checkout's existing Node 24 runtime and lockfile. Builds can update that runtime's ignored caches. This is an owned local operation with a shared runtime; it does not establish isolation from a concurrent build or authenticate an independently installed runtime.

## Commands and packages

Follow the [PowerShell preparation recipe](../../README.md#local-site-preparation). The rehearsal performed create, pre-build readback, an explicit Census/snapshot Astro build, post-build readback, assembly, Python ZIP creation and independent ZIP readback. The initial build correctly rejected empty private-preview flags: on this PowerShell/.NET runtime, SetEnvironmentVariable(null) exports an empty variable. The documented command now uses Remove-Item to make those flags absent and restores absence explicitly.

| Artifact | Entries | Raw bytes | ZIP bytes | ZIP SHA-256 |
| --- | ---: | ---: | ---: | --- |
| Site | 30 | 1,534,093 | 366,538 | 0226a29c37599b6e916aed92dfc759ae30b20a5d684e17610f712143006f3b2d |
| Withdrawal | 3 | 1,179 | 1,075 | af671ea2a9546b6ea76cfcd753c3286ca020cc4622c629d095fa2ae60a005932 |

The site manifest SHA-256 is b597ad46d94ace3afc444b6876843d195cd314613ae959aa84378ad0dcfc9d89. The withdrawal manifest SHA-256 is 4cd0d5bfb6cdf0168be3b6e3ddc0448a1728c8ae251c98221bb4655b128f30f7. Largest site entry: products/090121/index.html, 283,298 bytes. Both packages satisfy the existing 1,000-entry dashboard limit including control files, and the 25 MiB per-file limit. The 15,000-file planning alert remains clear.

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

Thirty preparation tests exercise authenticated staging/readback, unsafe/occupied paths, changed or missing inputs, forged receipts, hardlinks/runtime links, templates/private payloads, package limits and roundtrips through the existing Python packager. CI uses fixtures and Python 3; it requires no accepted private data or secrets.

The final check set is the complete unit suite with two workers, Astro/TypeScript diagnostics, the ordinary fixture build and all three existing browser suites, plus the 24 Python packaging tests. Exact results and independent review are recorded at closeout below.

Private run artifacts, fresh baselines, browser downloads/screenshots, readback receipts, fingerprints and test logs are preserved in the primary checkout's ignored .tmp/local-site-preparation-validation-20261014-r1 directory. No private evidence belongs in the served tree.
