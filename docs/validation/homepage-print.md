# Homepage print readability

The [public overview](https://us-trade-tracker.pages.dev/) now separates Product monitor research links on paper and keeps each product row together when it fits on a page. Figures, sources and qualifications remain intact. Screen layouts, data and downloads are unchanged.

Published October 22, 2026 (Toronto) from reviewed merge `1505d824f130a9ea26a60df81b40a7f6389ce041`, [PR #144](https://github.com/Vasuki8/us-trade-tracker/pull/144), to [deployment a5be837a](https://a5be837a.us-trade-tracker.pages.dev/). One candidate upload succeeded; restoration was unnecessary. The verified predecessor remains preserved privately.

## Verification

Five new geometry checks failed before the fix. The final focused suite passed 32 browser cases and five overview component cases. [Standard CI](https://github.com/Vasuki8/us-trade-tracker/actions/runs/39887955713) passed 2,086 unit tests plus one existing platform skip, 350 browser cases, 24 Python packaging checks and 18 workflow checks. All 385 compiler files had zero diagnostics.

Fresh merged-source acceptance passed 31 local browser navigations and 15 downloads. Seven CSVs (four products, estimated duties, portfolio and Canada) were byte-identical to the predecessor. Four screen comparisons at 320/1280px in light/dark themes were pixel-identical. Eight A4/Letter PDFs cover imports/exports and monthly/rolling views: 24 pages retained 32 complete product rows. Independent review checked those rows against retained figures, 64 research-link destinations, 622 staged source files, 11 accepted inputs and all 41 package members.

Public verification passed 88 exact payload/header checks across canonical and deployment origins, plus eight Mexico privacy checks. Seventeen automated browser navigations and eight downloads passed; seven CSVs and one chart PNG matched final local acceptance. Eight live PDFs also retained all 32 product rows. Production was freshly read after verification and still pointed to this candidate. See the [machine-readable record](homepage-print-evidence.json).

Build: 39 files / 3,144,553 raw bytes. Prepared package: 41 files / 3,145,298 raw bytes; ZIP 636,466 bytes. Largest file: `products/090121/index.html`, 358,447 bytes. The 15,000-file planning alert did not trigger.

## Qualifications

Print acceptance covers Chromium A4/Letter with 12mm margins. Other paper sizes, printer settings and Firefox/WebKit printing remain unverified. Other sections can continue across pages; content taller than a page can still flow. Existing Windows Firefox launch limitations remain unresolved.

No imports, accepted-data changes, R2 operations, dependencies, paid services, access or indexing changes were included. Canada stays a fixed September 2024–August 2026 snapshot; Mexico remains private. Local harness setup/readiness/encoding errors were corrected and failed outputs retained; final acceptance ran again against the final ZIP. The prior [overview-link record](overview-view-links.md) remains historical.

