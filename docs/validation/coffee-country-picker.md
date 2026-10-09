# Coffee country picker

Validated October 9, 2026. The approved bounded change adds country name/code search to the existing comparison picker and keeps selected countries visible with removal controls. The retained coffee release has 105 import partners and 121 export partners; the former picker required scrolling through the entire alphabetical list.

## Behavior

Search accepts case-insensitive partial names or country codes and ignores surrounding spaces. A result count and clear no-match message explain the filtered list. Selected countries stay above the results in selection order, even when hidden by the search. Removing a country or clearing all selections returns focus to the search field; clear-search does the same. The three-country limit applies across all search results, and removing a selection enables another country.

Search is local to the picker. Typing or clearing it does not change selected countries, the profile URL, trade/duty CSV bytes or annual rankings. It also does not cause the parent profile to recalculate trade figures on each keystroke. Selecting or removing countries uses the existing atomic profile selection and shared-link behavior. A direction change clears selections and starts with an empty search. Reloading a saved view restores its countries with a fresh search.

Before JavaScript restoration, the picker controls are disabled while all country names and the default research remain readable. The no-JavaScript explanation includes finding/selecting countries. Native search, checkbox and button controls retain keyboard access.

## Verification

- Seven new component cases first failed against the old picker and then passed against the implementation. They exercise partial-name and code search, selected-view stability, ordered saved selections, removal and focus, the limit across searches, empty results, direction changes and server-rendered controls. The complete suite passed **304 tests across 25 files**.
- Final code/type checks report **80 files**, with no errors, warnings or hints. Patch whitespace checks passed.
- All **22 fixture browser cases** passed, including three new picker flows for restored selections, byte-identical trade/duty downloads during searching, ranking stability, selection limits, copied links and reload, keyboard removal/clear search, mobile overflow and no-JavaScript controls.
- An existing mobile download test failed because its 30-forward-tab cap no longer reached the preceding PNG button after adding picker controls. A focused browser probe measured 31 forward tabs and confirmed that one backward tab reaches PNG. The test now uses that actual adjacent-button navigation and verifies focus before activating the PNG download; its rerun passed. Product focus order was not altered to satisfy a test cap.
- Three retained-Census browser cases passed. The picker case checks both complete partner universes, search by name and code, visible hidden selections, identical trade/duty CSVs during search, removal followed by the matching Canada monthly value and duty selection, and mobile clearing/direction changes. The two saved-view cases independently compare selected import/export observations, displayed chart/table values, monthly duty amounts and rolling denominators directly with the retained release. No browser page errors or Census API requests occurred. Desktop and 375-pixel mobile picker screenshots were inspected.

The accepted source identity is unchanged: prepared SHA-256 `eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727`; current pointer `releases/2026-08-5f3c2606-06a0-4c96-8fbc-a2332e0428ae.json`; reporting month August 2026; retrieved `2026-10-09T07:32:29.685Z`; processing version `7f76e7c6f0fb1168906956ef8517095a5e49e103`.

The retained-Census build contains **11 files**, **677,736 uncompressed bytes (0.65 MiB)**, and a largest file of **283,107 bytes**, the coffee profile. Profile gzip size is **80,376 bytes**. Total output increased by **3,708 bytes** from the saved-view milestone, with no added deployment files. These are local byte measurements, not deployed performance timings.

Fixture and Census outputs are isolated under `.tmp/country-picker-fixture-dist` and `.tmp/country-picker-live-dist`. Supplemental Census checks and the focus probe remain in ignored `.tmp/`; screenshots are under ignored `test-results/country-picker-visual/` and `test-results/country-picker-live-visual/`.

Pages and chart data stay on the same static host, browser-generated downloads retain their formats, and R2 remains private backup storage. No new data retrieval, service, schedule or public deployment was added. Validation across two successive official reporting months remains a separate launch requirement.
