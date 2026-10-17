# Individual briefing printing

The existing individual coffee briefings now have a native **Print / Save PDF** control and scoped paper layouts. The report remains server rendered, with no React island or browser release payload added. Without JavaScript or callable native printing, the control stays hidden and browser-print instructions remain visible. A thrown native call announces a polite fallback and keeps the report and keyboard focus available.

Print media hides navigation, product selection and print controls. A single report column keeps short sections/cards together; body text is at least 9pt and source/qualification text at least 8pt. Titles, HS identity, periods, figures, denominators, coverage qualifications, revision/retrieval/version details, visible source URLs and the footer's Census non-endorsement notice remain. Screen report content, research destinations and the existing portfolio implementation are preserved.

## Local verification

Verified runtime source: `a9868727c27085b31c18a93ca73ebb200c31325a`. Subsequent checkpoint/progress edits are documentation only. The approved plan is [individual briefing print](../superpowers/plans/2026-10-17-individual-briefing-print.md).

- Existing focused briefing/portfolio baseline: 70 unit cases passed. Full local suite: 1,682 cases across 116 files passed using the existing pinned Python prerequisite.
- Type checks: 317 files, zero errors, warnings or hints.
- Full local browser results: 194 ordinary Chromium, 10 Canada preview and 12 Canada pilot cases passed (216 total) with no new skip/retry.
- New print controls: eight real-page cases failed before implementation and passed afterward. New print-media/PDF cases: eight failures on visible navigation before print CSS; the combined existing/new Chromium briefing checks then passed all 26 cases. All 12 semantic cases passed in the locked local WebKit build, with no added skip/retry. Native printing was intercepted only for handler/fallback tests; separate PDFs exercise the rendering engine.
- Both fixture reports retain identical heading/report/footer text and zero React islands. JavaScript-disabled, missing/throwing native printing, keyboard, mobile overflow, fixture warning and source/notice cases passed.

The PDF baseline showed monthly and duty cards splitting across pages. During layout work an actual PDF also exposed a section introduction separated from its first card. The failing output and page-text assertion were preserved; print-only section avoidance and block flow corrected it. Five final fixture PDFs (both products on A4/Letter plus a narrow-viewport, long-description/source layout case) have 15 pages total. Every page was extracted, rendered with bundled Poppler and visually inspected. The long text is test-local DOM substitution and tests layout only.

## Accepted August data and paper output

The existing stage tool exported committed source and copied only seven accepted inputs, 8,186,318 bytes total, from the existing data checkout. No raw replay or source request occurred. The unchanged product selection supplies August 2026 releases for HS 090121 and 090111 plus the accepted historical Canada snapshot. Seven accepted/eleven protected originals and the separate September proposal remain hash exact.

Both real individual reports match the authenticated predecessor's heading, full report, footer and research-link text/destinations. Desktop keyboard invocation, 320px display and 375px JavaScript-disabled/static printing passed without page errors or outside requests. All eight predecessor CSV filename/byte/hash identities remain exact: world and selected-country duty downloads for each coffee product, and imports/exports rolling country-change downloads for each.

Four real individual PDFs, each three pages, cover A4 and Letter for both products. Independent pypdf extraction matches the entire original heading/report text, including values, periods, sources and provenance; the Census notice remains. Browser headers/footers are disabled and margins are 12 mm. All twelve pages were rendered and visually inspected. The existing accepted-data portfolio export control has identical report text and retains its two-page PDF presentation; both pages were also inspected. Ten final acceptance PDFs therefore cover 29 viewed pages. One baseline and one observed failing PDF are retained separately.

These checks establish native Chromium PDF output and locked-browser semantic behavior. They do not certify arbitrary printer settings, stock Safari/Firefox, or physical printers. Windows Firefox's previously unresolved local launch remains unresolved; the added semantic Firefox cases belong to the existing Linux CI matrix. No public stored PDF or server PDF service is introduced.

## Prepared packages and deployment gate

The accepted build has 29 files/1,896,655 raw bytes, largest `products/090121/index.html` at 351,369 bytes. The assembled package has 31 entries/1,897,400 raw bytes; the 15,000-file planning alert is false. Its ZIP is 413,566 bytes, 952 bytes larger than the verified predecessor. These are measured build/package sizes, not a performance benchmark.

| Artifact | SHA256 |
| --- | --- |
| Candidate site ZIP | `8f83a92670b52899395ba27fece70a120ed214a4779d04007a47134be98da6a9` |
| Candidate site manifest | `1bda69c709225a2e9322ba311f813e9e005b37e7f17e1e52be47e3ea7dcf6099` |
| Verified predecessor ZIP | `6e63391ecc9ebe3c22432f69f620bf1e5f6d443dded47600062c92957346a283` |
| Verified predecessor manifest | `7b57293e1c354c1d384ede45ef9636d73058ab3cb38f48f0e396f8db61f948dd` |

Existing stage readbacks and Python package verification passed for the candidate site, withdrawal package and retained restoration ZIP. Assembly preserves committed headers/error templates, private-file exclusions and noindex/nofollow behavior. The actual current Production binding was observed as `2b73be66-8477-4f28-98a4-209267b6ef86`, matching the pinned predecessor; this observation alone is not live HTTP verification.

Independent branch review, final-head push/PR CI, integration and publication are subsequent gates. Local package success does not claim those operations. The implementation PR and private operational receipts carry their eventual outcomes without a bookkeeping-only PR.

Private evidence is retained under `data/backups/individual-briefing-print/verification-20261017-r1`, including authenticated inputs, failures, browser/PDF checks and candidate/restoration packages. Prior proof is unchanged despite its recorded one-byte aggregate measurement discrepancy; all individual content identities authenticate. Current proof uses independently measured file inventories.

There was no Census import, R2 operation, accepted-data/selection change, new product, dependency, workflow, access/indexing change or recurring job. The separately approved September candidate plan remains unchanged and gated until its November 4 release conditions are actually satisfied on a later on-demand run.
