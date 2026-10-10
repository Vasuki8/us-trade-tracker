# Official release schedule acceptance

Verified October 10, 2026. This completes the launch brief's next-official-release information within the existing Sources and methods page.

## Source and behavior

The [Census FT900 calendar](https://www.census.gov/foreign-trade/schedule.html), checked October 10, lists these reviewed entries:

| Reporting month | Scheduled publication | Time |
| --- | --- | --- |
| September 2026 | November 4, 2026 | 8:30 a.m. Eastern |
| October 2026 | December 8, 2026 | 8:30 a.m. Eastern |
| November 2026 | January 7, 2027 | 8:30 a.m. Eastern |

Only these reviewed dates are retained in `src/lib/trade/release-schedule.ts`. The static Methods page selects the first future publication at build time, shows the reporting month separately from publication, links to the calendar and records both the source-check date and evaluation timestamp. These winter entries use explicit UTC−05:00 instants; display formatting names America/New_York rather than relying on the build machine's zone.

The page says the date is scheduled as of page preparation and can change. It distinguishes scheduled publication from this website accepting new data. Both actual pilot profiles still report August 2026. At or after the final retained publication instant, a new build explains that no future date is included and directs the reader to the official calendar. An existing static build keeps its stated evaluation timestamp; it does not update itself or poll Census. Maintaining the reviewed snapshot remains a release-preparation task. Unreviewed dates and TBD entries are never inferred.

## Fresh verification

- Six schedule cases passed: a normal evaluation, one millisecond before publication, the exact publication instant, the next winter publication, snapshot exhaustion, and invalid-date rejection. The empty API scaffold first failed five assertions; the exhaustion case already passed.
- All **436 tests in 43 files** passed. An initial sandbox run failed 41 suite imports because its temporary SSR cache files could not be read. A process-only writable workspace temporary directory resolved the runner error; the complete rerun passed without application changes.
- Astro/TypeScript checks covered **120 files**, with **zero errors, warnings or hints**.
- All **45 fixture browser cases** passed. The two release-information cases first failed because the schedule section was absent. They now check the scheduled month/date/time, source and timestamps, unavailable fallback, separation from accepted releases, and mobile navigation without JavaScript.
- One additional real-data browser case passed, covering desktop and 375-pixel mobile with JavaScript disabled. It verified the scheduled September publication alongside both accepted August profile records, official source links, keyboard access and the matching green-coffee profile link. No Census requests, page errors or React islands were present. The first diagnostic used an incorrect green-coffee display label; using the registry's published label fixed the check.
- Desktop and mobile screenshots were inspected: `.tmp/official-release-schedule-visual/desktop.png` and `mobile.png`. No page overflow was found.
- All four accepted release/pointer SHA-256 hashes remain identical to the previous milestone. No data import or archive operation ran.

## Build measurements and limits

The actual Census build has **18 files and 1,059,046 uncompressed bytes**, an increase of **1,622 bytes** with no additional assets or routes. Only `methods/index.html` changed compared with the retained preceding build; it is **15,629 bytes**. The largest file remains `products/090121/index.html` at **283,172 bytes**. The page has no browser calendar payload or client script.

Logs and isolated fixture/real browser configurations are retained under `.tmp/official-release-schedule-*`. Local browser evidence covers Chromium; Firefox, Safari and screen-reader execution were not performed. The official successive-release acceptance requirement remains open. This change adds no product intake, refreshed reporting data, scheduled job, hosted deployment, R2 delivery, paid service or access change.
