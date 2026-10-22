# Graphite website redesign

Local implementation at `f390d9e`, October 22, 2026. This record does not claim a public deployment.

The approved Koyfin-inspired sample is implemented in the existing Astro/React app. Shared navigation, search, panels, tables, controls and charts use light and dark theme tokens. Light is the initial theme; a guarded localStorage preference restores the selected theme before rendering. Switching themes preserves research state and works when storage is unavailable. Print uses a light palette.

The homepage now provides product/direction/period controls, four numerical summaries, monthly trade history, leading partner bars, a product monitor and release context. Its summaries reuse the existing profile, monthly-change and duty calculations. Only the five displayed partner leaders are sent to this page, with independent counts retained for all reported and unavailable partners. Reported zero values still count. The directory presents compact product rows with monthly import/export values and growth figures; descriptions and source details remain in native disclosures.

Existing product, changes, briefing, country and methods routes retain their research tools. Screen chart colors follow the theme; serialized PNG SVGs retain their explicit export palette and provenance. Chart layout responds to its panel width. Native source disclosures remain readable without JavaScript and expand in print.

No source-data import, release replacement, country/product expansion, dependency, external service, paid upgrade, public deployment or indexing change is included. The retained-data preview covers the four existing August 2026 products and the fixed Canada historical snapshot. Mexico remains private.

Verification completed:

- Unit suite: 2,039 tests in 143 files passed on the final source. An intervening Windows run had four filesystem/rename failures; all 87 cases in the affected suites passed in isolation, then the complete suite passed after the temporary debug watcher was stopped. No tests were weakened or skipped.
- Compiler: zero errors, warnings or hints across 379 files. Fixture and retained-data snapshot builds passed.
- Chromium: 201 ordinary, 11 Canada preview and 12 Canada pilot cases passed. The final directory/theme subset passed again after the neutral treatment of unavailable growth values.
- WebKit: all 39 configured compatibility cases passed. Firefox failed before assertions because its installed Windows executable could not launch (`spawn UNKNOWN`); no local Firefox compatibility result is claimed. The combined compatibility run was stopped, and the existing Linux CI configuration remains unchanged.
- Python packaging: 24 tests passed.
- Real-data browser checks matched the four retained monthly import totals, the small positive cocoa duty share, and filter preservation across theme changes, with zero page errors. Light/dark overview, directory, product and mobile screenshots were inspected. Focused independent review verified print disclosures, Escape focus, directory reflow and chart sizing from 320px to 1280px and reported no remaining findings.

The final local retained-data build contains 39 files / 3,139,597 raw bytes, before adding deployment templates or packaging. Its homepage is 174,975 raw bytes. This is a local build measurement, not a new public package or publication receipt. The real-data preview is served locally on port 4333; fixture verification uses port 4331.

## Review follow-up

Independent review found that the homepage's closed Canada coverage disclosure omitted its source and fixed-history qualification in print. The disclosure now uses the existing print-expansion rules. A browser regression failed before the repair and passed afterward; ordinary browsing still uses a native closed disclosure.

The existing Firefox/WebKit check now also selects the four new theme tests: persistent preferences and research state, blocked storage, global search and narrow/print layout. Test discovery confirms eight added cases across both engines while retaining all 78 existing cases. The workflow and dependencies are unchanged; actual execution results remain a separate gate.

A fresh two-worker Windows run passed 2,032 tests and timed out in seven existing filesystem-heavy cases at their unchanged 5,000ms deadline. No assertions or deadlines were weakened, and the timing failures are not claimed fixed. Follow-up verification and integration outcomes are recorded in [PR #139](https://github.com/Vasuki8/us-trade-tracker/pull/139).

## Verified public update — October 22, 2026

The Graphite redesign and the scoped Canada print repair were published from reviewed merge `61cd985cb2040cde985fefc98a2d2c4e36908b06`. Live verification passed 88/88 exact checks, eight additional Mexico checks, all 22 public routes and ten downloads; the final Production assignment remained `509608c8-fb7d-439d-bd6d-4498d8e09035`. Restoration was unnecessary. This later result does not revise the local history or resolve the Windows timing gap above. See the [publication evidence, identities and limitations](graphite-publication.md).
