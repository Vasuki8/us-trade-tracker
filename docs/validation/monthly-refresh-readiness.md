# Monthly-refresh readiness

Validated October 10, 2026. This bounded pipeline check prepares the two accepted coffee identities for the next reporting month. It fixes a local month-regression gap and tests the existing month-to-month archive protocol. It does not accept a new official reporting month.

## Available official releases

The accepted datasets report August 2026. The [Census FT900 release calendar](https://www.census.gov/foreign-trade/schedule.html), checked October 10, schedules September 2026 for **November 4, 2026 at 8:30 a.m. Eastern**. A synthetic September transition can test the software now but cannot prove a successful update across two official releases. That launch requirement remains open.

Before the real September import, confirm publication and API coverage and review classification continuity through September. Current classification evidence for both accepted products ends in August. The importer does not extend it automatically; a duty-enabled future snapshot without compatible evidence fails validation and retains the accepted pointer.

## Importer correction

Archive restoration already rejected an earlier reporting month. The local importer did not: a valid July request could replace an accepted August pointer. Three failing tests reproduced this using synthetic legacy roasted coffee, duty-enabled roasted coffee and duty-enabled green coffee.

The importer now checks the requested month immediately after loading the accepted baseline and before creating raw records or fetching Census. An earlier month fails with a clear error; the pointer and original prepared bytes stay unchanged. Initial historical snapshots in a separate workspace, same-month revisions and later-month imports remain supported. Lock handling and archive formats are unchanged.

## Synthetic transition checks

The committed `tests/scripts/monthly-refresh.test.ts` has six cases. Its generated September observations are explicitly synthetic and never become published data. The two end-to-end transitions use roasted coffee and green coffee identities with an in-memory conditional archive transport, not R2.

- The 60-month merchandise window advances from September 2021–August 2026 to October 2021–September 2026. The 24-month duty window advances from September 2024–August 2026 to October 2024–September 2026.
- July fixture values are deliberately revised, while September has distinct new merchandise amounts. Exactly five merchandise and twelve duty revision keys identify July. New September rows and the oldest months dropping out of the windows are not revisions.
- Hand-derived latest imports/exports are 1,037/837 USD. Current rolling totals are 13,037/10,437 USD, versus 12,000/9,600 USD. World duty sums are 156/2,600 USD in the current period and 144/2,400 USD in the prior period; both consumption-based shares are 6%.
- Retrieval failure and unreviewed future classification preserve the accepted local pointer and archive pointer. Original baseline prepared bytes remain exact after a successful later import.
- A staged successor identifies its predecessor, contains 337 original files, and recovers from a separate local backup without Census or R2 credentials. All 336 request records and the prepared release match the original candidate bytes. Missing backup evidence prevents pointer promotion. With valid synthetic backup evidence, conditional promotion succeeds and a fresh runner restores the successor and its revisions.

The synthetic windows and amounts prove these exercised software behaviors, not September source availability, actual revisions or provider compatibility. Existing live R2 evidence remains recorded separately in [coffee archive acceptance](../data-validation/090121-archive.md). No real archive initialization or promotion occurred in this milestone.

## Retained-data guard checks and verification

The regression guard was also exercised against isolated copies of both actual August releases. Each July request failed before any fetch. Copied and canonical pointer/release bytes stayed unchanged. The ignored harness and evidence are `.tmp/monthly-refresh-real-guard.ts` and `.tmp/monthly-refresh-real-guard-evidence.json`.

| Product | Canonical prepared-release SHA-256, unchanged |
| --- | --- |
| Roasted coffee, 090121 | `eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727` |
| Green coffee, 090111 | `ef5d56791ad85b1b7a199829818522389a792e82cee792665be61f8e78cba0f7` |

All **418 unit/component/script tests** passed with four local workers. Astro/TypeScript checked **110 files** with zero errors, warnings or hints. The Census build has **15 files and 1,025,749 uncompressed bytes**, with a largest file of **283,172 bytes**. Every static asset matches the previously browser-verified briefing build byte-for-byte; no UI, calculation or delivery change was added.

Accepted datasets, source responses, private R2 storage, hosted import settings, schedules and deployment remain unchanged. Live successive-release acceptance must be recorded after the next official reporting month is available, including retained baseline identity, source validation, revisions, backup, recovery and displayed values.
