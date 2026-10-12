# Canada local profile prototype validation

Verified October 12, 2026 against implementation `9c7240b2de21fc5cc99893c3e33469c912389815`. This record covers the opted-in local 24-month prototype approved in the [design](../superpowers/specs/2026-10-12-canada-profile-prototype-design.md) and [implementation plan](../superpowers/plans/2026-10-12-canada-profile-prototype.md). Review and GitHub CI/integration outcomes are recorded on the implementation PR.

## Fixed data and independent checks

Retained mode authenticated the 858,857-byte assessment at `data/backups/canada-country-audit/snapshot-classifications-2026-10-12-r1/snapshot-assessment.json`, SHA-256 `2cad0dcabf353b8aec0d365bb247e5d976712a7a1ebc90cac26694322503d9f8`. Its processing version remains `9c385fb94b2a36b1d07ddf9e01670c366839a83b`; the adapter does not relabel the source as freshly verified. The classification-ledger identity remains 487,985 bytes, SHA-256 `afde19b1384c0cbab8cb2f7bbbc5ed8253bc636bb7a35c6b8d5d3c599a1010fd`.

The projection is 33,715 bytes. An independent verifier read the pinned assessment and compared all 48 monthly points, original source identities, 20 product summaries and both periods/denominators. All 17 eligible comparisons matched; all three statistical rows retained their observed totals and blank unsupported comparisons. It summed country periods using integer arithmetic, without calling the production summary calculation:

| Direction | Sep 2024–Aug 2025 USD | Sep 2025–Aug 2026 USD | Dollar change | Growth |
|---|---:|---:|---:|---:|
| Imports | 396,982,672,171 | 392,802,538,076 | -4,180,134,095 | -1.0529764617% |
| Exports | 342,040,511,099 | 340,916,490,818 | -1,124,020,281 | -0.3286219745% |

Latest August 2026 values are USD 35,980,039,950 imports and USD 30,289,552,895 exports. The before/after references each preserve 41 matches and seven mismatches. January–July 2026 exports preserve seven original-publication matches; the other 41 publication checks remain unreviewed. Source capture and original-publication links remain distinct from product observation revision dates.

## Rendering, downloads and build boundaries

The retained build was served locally on `127.0.0.1:4404` for browser verification. Both direction views were checked against all 48 displayed monthly rows and 20 product rows; four browser-generated CSVs were independently parsed and compared to displayed values, denominators, periods, verification basis and source identities. Seven reference difference rows and publication links matched the assessment. Desktop/mobile screenshots were inspected. At 375px the page stayed within the viewport, tables scrolled within focusable containers and keyboard direction controls worked. Imports research and the source explanation remained readable with JavaScript disabled. No provider request, API call or ZIP decompression was performed.

| Build | Files | Total uncompressed bytes | Largest file |
|---|---:|---:|---|
| Ordinary synthetic product fixture, preview unset | 21 | 506,382 | React client asset, 212,848 bytes |
| Isolated synthetic Canada fixture | 22 | 559,388 | React client asset, 212,848 bytes |
| Accepted product data, preview unset | 21 | 1,083,031 | Roasted coffee HTML, 283,166 bytes |
| Accepted product data with retained Canada preview | 22 | 1,169,272 | Roasted coffee HTML, 283,166 bytes |

The ordinary accepted build was restored with `CANADA_PREVIEW_MODE` and `TRADE_DATA_MODE` unset. Its output was inspected recursively: no country preview route or retained processing/verification/payload markers appeared. Shared preview client code is allowed, without retained observations. The opted-in HTML contains no raw bindings, candidate monthly arrays, filesystem paths or source bodies. These builds remain far below the 15,000-file planning alert.

## Tests and preservation

Local verification passed 688 unit tests across 64 files, 181-file type checks with zero diagnostics, 53 ordinary browser checks and four isolated Canada browser checks. Mode tests cover unset/invalid settings, synthetic provenance, missing/changed/oversized input, a real reparse ancestor and bytes changed during the bounded read. Other checks cover incomplete/null/zero-prior summaries, statistical exclusions, direction agreement, source identity binding, quoted/formula-looking CSV text and server-rendered chart tooltips.

The fresh whole-branch review independently confirmed the retained totals/projection and downloads. A tracked-only clean checkout reproduced seven loader-test setup failures because its ignored review workspace was absent; test setup now creates a standard temporary parent. The same clean checkout then passed all 15 loader tests, and the full 688-test suite and type checks passed again. The navigation-only browser assertion's missing `await` was deferred in the initial PR and repaired in the readability follow-up below.

Before and after retained verification, the four accepted coffee files, six existing snapshot outputs and classification ledger matched their recorded hashes. All 23 original country evidence fields matched their historical committed values. All 69 existing tracked source, validation and workflow files matched `cd128fe0f1fc2ecf789e74c93e2e95a5b079e781` byte for byte. The prototype introduced no changes to assessor/provider/archive scripts, historical failed audit verdicts or workflows.

Local receipts, comparison scripts, downloaded CSVs, screenshots and build measurements are retained under ignored `.superpowers/sdd/2026-10-12-canada-profile-prototype/`. The fixture server's orderly lifecycle tests verify its owned-output cleanup. Windows Playwright can forcibly terminate subprocesses without a catchable signal; the two local fixture outputs were measured and their screenshots preserved before their exact, checked workspace paths were cleaned. Normal `dist` and retained source data were preserved.

## Readability follow-up, October 12, 2026

The original desktop SVG scaled its 13px axis labels down to 4.89px at a 375px viewport (3.9975px at 320px). Desktop and mobile plot geometry now share the same monthly observations and gap handling, with CSS selecting the appropriate size. One accessible image exposes the country-specific label and table explanation; its two visual SVGs are hidden from the accessibility tree. No JavaScript is needed to select the mobile layout.

The browser regression first failed the 12px rendered-label floor, then passed at 320, 375, 680, 681 and 1024px in both directions. At 375px the real retained chart's minimum label size is 15.05px. Mobile without JavaScript, overflow, keyboard controls, direction switching and downloads pass. Local verification passed 688 unit tests, zero diagnostics across 181 checked files, all five Canada fixture browser checks and the normal route/navigation/payload boundary check.

The 33,715-byte retained projection and all four downloaded CSV files are byte-identical to the original verified prototype. All 11 protected source/assessment/coffee identities retain their lengths and hashes. Source, loader, calculation, historical evidence and workflow files are unchanged. Updated builds still contain 21 ordinary files and 22 opted-in files: ordinary synthetic 507,101 bytes; ordinary accepted-data 1,083,750 bytes; retained opt-in 1,174,866 bytes. Largest assets remain 212,848 bytes in fixture mode and 283,166 bytes with accepted product data. Desktop and real/synthetic mobile chart screenshots were inspected; receipts are under ignored `.superpowers/sdd/2026-10-12-canada-profile-readability/`.

## Scope

`/preview/countries/1220/` requires an explicit `CANADA_PREVIEW_MODE=fixture` or `retained`. Retained failures have no fallback; ordinary builds expose no route or navigation entry. Noindex metadata is a presentation control, not access protection or publication approval.

`releaseAccepted`, `rollingComparisonsAvailable` and `defaultAuditRetrievalChanged` remain false. This is an offline local prototype for September 2024–August 2026. It accepts no country release/pointer and performs no deployment, R2 operation, longer-history intake, additional-country intake or country duty calculation. A public country release and longer history remain subsequent design and acceptance work.
