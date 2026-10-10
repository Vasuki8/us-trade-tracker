# Changes view links acceptance

Verified October 10, 2026. Baseline: `16ddd99667d6e81568f864de65b6390a170204e1`.

## Visitor behavior and scope

The existing standalone country and product ranking pages now preserve their direction and ranking measure in shareable links. `/changes/` and `/changes/090111/` accept `direction=imports|exports` and `metric=dollars|share`; `/changes/products/` accepts the same directions and `metric=dollars|growth`. Missing choices default to imports/dollars. Changing product through the existing static navigation still starts with those defaults, as its note explains.

Edits replace the current address without adding a history entry for each filter change. Browser Back/Forward and section navigation restore the filters together. Copied links contain only supported filters, preserve the section, and use the current page's product route and origin. Existing history state is preserved. The Copy changes link button becomes available after hydration, announces success, and provides a selectable current link when the clipboard is unavailable. An outdated clipboard completion cannot announce a link after filters change or the component unmounts.

Duplicate, unsupported, wrong-page or oversized filter queries produce the default with an explanation; a subsequent legitimate edit clears the explanation. Unknown unrelated parameters are ignored and omitted from copied links and edited addresses. Shared links reopen filters against the latest available reviewed release; they are not immutable historical snapshots.

Static HTML retains default import/dollar tables, source details and navigation. Without JavaScript, saved query filters are not applied, and the page explicitly explains the default and the requirement for restoring saved changes. The new link button stays disabled. The existing profile's independent country ranking controls retain their local state and calculation behavior.

This is a bounded extension of the approved sharing and Monthly changes flows. Merchandise/duty calculations, reporting months, classifications, published product registry, archive processing and deployment behavior are unchanged.

## Fresh verification

- **458 tests in 44 files passed**, including 22 new UI cases across country and product ranking flows. All 22 first failed against the missing behavior. Cases cover saved filters, direction-specific measure selection, canonical links, clipboard fallback, selection of the manual link, history state and section preservation, invalid/duplicate/wrong-page/oversized queries, notice clearing, browser navigation, stale clipboard results and honest static defaults.
- **124-file Astro/TypeScript checks passed with zero errors, warnings or hints**.
- **52 fixture browser cases passed**, including five new cases covering both product-specific country routes and product rankings, actual clipboard copying by keyboard, reload and Back navigation, direction-specific CSV downloads, mobile invalid-query recovery/manual copying and readable saved-query pages without JavaScript. Existing profile rankings, duties, downloads and navigation passed their regressions.
- **Three additional retained-Census browser cases passed**. Eight saved country-view downloads across the two accepted products, both directions and both metrics were checked against independently summed retained country/world observations for the matching twelve-month periods, including share denominators. The saved export/growth product CSV matched the independently established four current/prior totals; reload, Back, manual copying and mobile controls worked. All three actual routes retained honest static default research without JavaScript. The country-data case made no Census request and produced no browser error.
- Desktop and 375-pixel mobile screenshots were inspected, including the manual-copy field; no page overflow was observed. Browser execution covers Chromium, not a formal cross-browser or screen-reader certification.
- The accepted release and current-pointer SHA-256 hashes for both coffee profiles remain identical to the previous milestone. No data processing or archive operation ran.

An initial combined UI run exposed address leakage between existing unit cases: their former cleanup removed the component but retained its new URL filters. Resetting each case's browser address resolved that isolation defect. Existing no-JavaScript browser assertions now target their intended paragraph because the link explanation adds a second noscript paragraph. No application behavior was changed to conceal those failures. The full passing reruns are recorded above.

## Build measurements and retained evidence

The Census build contains **19 files and 1,066,951 uncompressed bytes** (1.02 MiB), compared with 18 files and 1,062,739 bytes at baseline: **one extra file and 4,212 bytes**. The shared link component adds a **2,520-byte** bundle. Roasted-country changes HTML is **99,881 bytes**, green-country changes HTML is **91,030 bytes**, and product changes HTML is **16,697 bytes**. Other affected component bundle names/references changed. Both profile HTML files retain their previous sizes, and the largest file remains `products/090121/index.html` at **283,172 bytes**. Methods' existing preparation timestamp refreshed, decreasing its HTML size by one byte; the net build delta includes that change.

Pages and chart data stay together on the static host; CSVs stay browser-generated; R2 retains its private backup role. The 15,000-file planning alert remains unchanged. Logs, isolated fixture/actual browser configurations, independent download evidence, asset comparison and screenshots are retained under `.tmp/changes-view-links-*`.

Independent review and exact-head GitHub checks must pass before merge under the owner's standing authorization. Broader country profiles, new product intake, actual successive-official-release acceptance and public deployment retain their separate status. This milestone adds no paid service, scheduled job or access change.
