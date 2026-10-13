# Canada accepted local preview

The opt-in route `/preview/accepted/countries/1220/` reads the already selected Canada release through its authenticated reader. It reuses the existing profile and preserves the exact research projection: 33,716 bytes / `33c7db7ec421bddaa13e36c3b2e32cd4558aa041fe17f2f3da01285b62b08fd0`. Acceptance context is a separate allowlisted presentation value; the immutable historical availability flags remain unchanged.

The loader returns before private reads when `CANADA_ACCEPTED_PREVIEW_MODE` is unset. `selected` requires the fixed real accepted pointer, source and projection; missing or changed input fails without a fixture fallback. `fixture` is visibly synthetic, has no acceptance identity and claims no local release. No pointer, acceptance record, proof, operator instruction or private path enters page props. The route is local, has `noindex,nofollow`, and is absent from ordinary builds/navigation. It does not publish the snapshot. The older retained assessment preview now says acceptance is not checked in that view, rather than asserting that no accepted release exists.

```powershell
$env:CANADA_ACCEPTED_PREVIEW_MODE = 'selected'
Remove-Item Env:TRADE_DATA_MODE -ErrorAction SilentlyContinue
npm run build -- --outDir .tmp/canada-accepted-local-preview
npm run preview -- --outDir .tmp/canada-accepted-local-preview --port 4412
```

Use `fixture` for a development sample. Remove `CANADA_ACCEPTED_PREVIEW_MODE` for ordinary builds. The original `/preview/countries/1220/` retains its separate `CANADA_PREVIEW_MODE` settings and presentation.

Both directions preserve September 2024–August 2026, same-archive all-goods denominators, 17 ordinary qualified comparisons and three statistical exclusions. The table is labeled **Selected categories and changes**. Revision mismatches remain visible and historical audits remain failed. Exports retain `ALL_VAL_MO`, FAS value and nominal/nonseasonal qualifications; the page explains the [Canadian data exchange](https://www.census.gov/foreign-trade/reference/definitions/index.html), checked October 12. Local acceptance applies to the captured snapshot and does not establish uniform revision maturity or current revised headline agreement.

Downloads remain generated in the browser. Accepted CSVs add `presentation_context`, `accepted_release_id`, `local_accepted_at` and `publication_status=not-published`. Values, original provenance, periods and unavailable comparison blanks are unchanged. Synthetic/accepted provenance combinations are rejected. Raw policy reasons remain in the CSV; the accepted view explains them in plain language.

The real accepted preview passed desktop/mobile checks at 320, 375 and 1120 pixels in both directions, keyboard direction/table controls, readable Imports with JavaScript disabled, and private metadata exclusion. All four browser-downloaded CSVs matched the selected projection's serializers byte for byte. Current/prior imports are $392,802,538,076 / $396,982,672,171; exports $340,916,490,818 / $342,040,511,099. The protected eleven files and selected pointer remained unchanged.

All 952 unit/component tests passed. Astro/tool checks had zero errors, warnings or hints. Nine isolated Canada fixture browser tests passed, including both routes and sourced CSV/mobile/keyboard behavior. The ordinary real-data build has 21 files / 1,086,547 bytes, with both Canada routes and private identities excluded. The ordinary fixture build has 21 files / 509,898 bytes. The real accepted build has 22 files / 1,178,276 bytes; largest real-data file remains the roasted-coffee page at 283,166 bytes. Independent review found no issues. [Final CI](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38337619417) passed 952 tests, clean checks/build and all 62 browser tests; [PR #73](https://github.com/Vasuki8/us-trade-tracker/pull/73) merged at `7e26c7a186365685cb7da889164b924e791e33ee`. Its tree matches the locally tested and CI-tested files exactly.

A subsequent [offline recovered-profile rehearsal](canada-recovered-profile-rebuild.md) rebuilt the same accepted Canada page from the preserved state in a fresh source export, without the original research folders. Its four browser CSVs matched the reviewed original digests, and an altered acceptance record stopped the selected build without a fallback page.

[Private R2 preservation and both fresh recoveries are complete](canada-private-archive.md). This presentation adds no source requests, storage writes, extra history, public route or deployment. Real successive official releases remain required for public launch acceptance.
