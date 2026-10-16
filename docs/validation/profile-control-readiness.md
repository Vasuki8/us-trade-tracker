# Profile control readiness

Local acceptance: October 16, 2026. Final full-suite, independent review, exact-head CI, integration, publication and actual cleanup are recorded in the associated pull request/private closeout; this document does not claim those later gates in advance.

Profile ranking selection, ranking CSV and estimated-duty CSV now use the parent profile's existing restored-view readiness. They remain disabled in initial HTML and without JavaScript. Default Imports research tables, revision labels, links and qualifications remain readable. Restored imports enable eligible actions for the displayed country order; restored exports remove the duty section. Ranking exports remain independent of chart countries/history. Empty rankings keep the existing unavailable-download condition.

Only ProductExplorer and EstimatedDuties application code changes. EstimatedDuties' optional readiness defaults false and guards both its button and click handler. No new state, timer or effect; TradeChanges' shared default and other callers remain unchanged. Calculation models, CSV serialization, fixtures, selection contracts, configuration, workflows and dependencies are unchanged.

## Verification

- The new focused tests reproduced three failures before the fix; all 49 focused tests passed afterward. They cover static markup with a saved exports query and omitted/false/true duty readiness.
- All 24 targeted fixture browser cases passed, including both synthetic products with held JavaScript, restored imports/exports, first duty CSV partner order, first ranking CSV identity, chart-selection independence, readable static defaults, existing monthly revision attribution and 320/375px keyboard behavior. No sleeps or retries were added.
- Astro/TypeScript reported zero errors, warnings or hints.
- The first full suite exposed three existing PNG-fallback cases that directly rendered EstimatedDuties without declaring readiness. Each expects an already-restored view. Only their owning setup now supplies controlsReady=true; all 14 DutyChartDownload tests passed afterward. The failure log is preserved and successful final full-suite verification remains an integration gate.
- Independent retained-data replay verified all **139 CSVs byte-identical** to authenticated PR116 candidate identities, with no append-only exceptions. The separate Canada projection remains exact. Historical extra28 cases retain their indirect shared-stage/producer-binding qualification; compatibility is not new official-source validation.
- All **16 retained-package browser checks** passed: four duty CSV selections, four default-dollar ranking CSVs across both products/directions, both mobile profiles/static defaults, changes/duty-chart/Canada coexistence and private-route 404s. First CSVs match independently generated retained bytes. Ten downloads include visually inspected 1920x1080 duty and merchandise PNGs. No external requests or page errors occurred.

## Candidate and limits

Actual package source is `b77cb8a6d6d69e352123c0e4baf6e8b13381bcf8`. A later owning-test correction and documentation changes do not alter application code or relabel the manifest. Seven copied processed inputs total **8,186,318 bytes**; all seven accepted/eleven protected identities remain unchanged. Both real releases retain their existing empty duty revision lists; positive revision marks use existing synthetic fixtures.

The deterministic, independently read-back site package has **31 entries / 1,893,276 raw bytes / 409,170 summed gzip bytes**. Largest asset: `products/090121/index.html`, 351,370 bytes. ZIP: 412,614 bytes, SHA256 `6e63391ecc9ebe3c22432f69f620bf1e5f6d443dded47600062c92957346a283`. Manifest SHA256 `7b57293e1c354c1d384ede45ef9636d73058ab3cb38f48f0e396f8db61f948dd`. Withdrawal content remains exact. Existing 1,000-entry/2 MiB served-payload/25 MiB asset limits and the 15,000-file planning alert remain; downloads are generated in the browser.

Pinned predecessor `eae71877-8b84-43d5-925d-cf6518a583b6` passed 68 live checks / 98 HTTP attempts across canonical and observed origins. The authenticated dashboard shows the existing Free project, Production/main and that predecessor; assignment must be reconfirmed before upload.

Ignored bounded proof: `data/backups/profile-control-readiness/deployment-20261016-r1`. This milestone includes no imports/source requests, accepted-data changes, R2 operations, new features/dependencies/services, paid/access/indexing changes, outreach or recurring jobs. It establishes neither fresh official-source validity, successive-release acceptance nor participant demand. Those remain separate strategic gates.
