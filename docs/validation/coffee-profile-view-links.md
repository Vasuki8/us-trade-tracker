# Coffee profile view links

Validated October 9, 2026. The approved bounded milestone saves trade direction, a twelve-month or up-to-five-year history window, and up to three countries in the coffee profile URL. It adds “Copy view link” and matching country links from the profile rankings, Monthly changes page and coffee release briefing.

## Link behavior

Example: `/products/090121/?direction=exports&months=12&countries=4759%2C1220` opens exports for Italy and Canada, preserving the selected order. Country highlights open their own direction and country with twelve months of chart history. The existing annual country rankings stay independent of chart country and history selection.

Links reopen filters using the latest available dataset; they do not pin a historical release. Recognized query fields are validated together. Duplicate fields, invalid direction/window values, duplicate or excessive country selections, and countries absent from the requested direction fall back to default imports with a visible notice. Present countries with missing period observations remain selected, with unavailable figures and gaps intact. Unrelated parameters are omitted from generated links, and raw invalid query text is never inserted into the notice.

Restoration applies the complete selection together after hydration and on browser back/forward navigation. Filter edits replace the current address while retaining browser history state and the section fragment. Copy success is cleared after an edit; a delayed clipboard result cannot announce an outdated view as copied. When clipboard copying is blocked or unsupported, a read-only, keyboard-selectable link stays visible and follows subsequent filter edits.

The server-rendered view remains default U.S. imports. A visible no-JavaScript explanation states that saved selections require JavaScript and that the initial view is the default. The copy button stays disabled without hydration, and the original research remains readable.

## Verification

- Twenty-six pure link cases cover restoration, ordered selection, direction-specific country membership, missing coverage, deterministic generation and invalid/ambiguous queries. Nine component cases cover restored filters, copying and its fallback, address alignment, history state and section preservation, navigation, stale copy responses, country links and server rendering.
- The complete code suite has 297 cases across 24 files. Code and type checks report 77 files with no errors, warnings or hints.
- All nineteen fixture browser cases passed, including five saved-view cases. Real clipboard copying, reopened/reloaded CSV byte equality, country gaps, ordinary and same-document browser history, country highlight navigation, blocked clipboard copying, mobile keyboard selection, and no-JavaScript behavior were checked. Desktop and mobile fallback screenshots were inspected.
- Two additional retained-Census browser cases restore Italy and Canada in both directions. All 24 selected monthly merchandise CSV rows per direction agree directly with retained observations. The displayed latest-month table and chart values agree as well. Both selected countries' 24-month duty CSV rows and current rolling duty sums/consumption denominators were checked directly, without application calculation modules. Trade and duty CSV bytes stay identical after reload. No browser page errors or Census API requests occurred.

The accepted prepared release SHA-256 remains `eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727`, and the current pointer remains `releases/2026-08-5f3c2606-06a0-4c96-8fbc-a2332e0428ae.json`. Its reporting month is August 2026, retrieval time `2026-10-09T07:32:29.685Z`, and processing version `7f76e7c6f0fb1168906956ef8517095a5e49e103`. Existing release, calculation, archive and download formats were preserved.

The retained-Census build contains **11 files**, **674,028 uncompressed bytes (0.64 MiB)**, and a largest file of **281,554 bytes**, the coffee profile. Profile gzip size is **80,125 bytes**. The briefing remains static with no React island; it is **7,459 bytes** before compression and **2,458 bytes** with gzip. These are local byte measurements, not deployed performance timings. Compared with the preceding briefing milestone, total output increased by 7,347 bytes without creating a file for each saved view.

Fixture output is isolated under `.tmp/view-links-fixture-dist`, and the Census preview uses `.tmp/view-links-live-dist`. Supplemental real-data assertions are in ignored `.tmp/view-links-live.spec.ts`; screenshots remain under ignored `test-results/view-links-visual/` and `test-results/view-links-live-visual/`.

Pages and chart data stay on the same static host, downloads generate in the browser, and R2 stays private backup storage. No accounts, new service, automatic schedule or public deployment was added. Verification across two successive official reporting months remains a separate launch requirement.
