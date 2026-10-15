# Estimated-duty history charts verification

Local acceptance passed October 15, 2026 (America/Toronto). Both existing coffee profiles now show fixed September 2024–August 2026 monthly estimated duties in current USD and calculated duties as a percentage of imports for consumption. The existing zero-to-three-country selection controls both charts. Merchandise 12/60-month selection does not shorten the duty period. Review, CI, merge and publication are pending at this checkpoint.

The adapter copies existing monthly DutyView values. It changes no calculation, table, CSV schema or byte, data, route, URL controller, dependency or shared image converter. Gaps preserve missing/suppressed observations; zero consumption has no percentage. Connections require consecutive reported values, verified reporting coverage and one common reviewed classification interval. Hollow markers identify RP70/79 affected or unverified points, with overlapping qualification counts explained. No-JavaScript HTML retains default world charts/tables and disabled PNG controls. Legacy releases retain their unavailable message.

Two browser-generated 1920×1080 PNGs retain metric, product/description, period, country order, qualification counts, denominators, source URL, retrieval/version/revision metadata and caveats. Text is measured/wrapped and checked for clipping/overlap before conversion. Unchanged rerenders/history-only changes preserve valid exports; changed identity, away/back or unmount suppress stale results/errors. Actual export failure retains the duties CSV fallback.

## Tests and retained-data acceptance

Baseline: 1,312 tests in 101 files passed. Final runtime: **1,352 unit tests in 104 files**, **140 browser tests** (118 ordinary, ten private Canada, twelve pilot Canada), **24 Python packaging tests**, and **zero type errors/warnings/hints**. Nine new browser cases cover both products, world/one/three countries, both actual PNGs, keyboard activation, mobile layout, source/bounds checks and static defaults. Fourteen export UI cases cover readiness, duplicate/identity/ABA/unmount/history/error states. Adapter/chart tests include zero, missing/suppressed, unknown coverage, tiny positive percentages, shares above 100% and interval boundaries.

Meaningful initial failures were diagnosed and retained. Baseline setup omitted required SITE_PACKAGE_PYTHON; with bundled Python, focused 39 and full baseline passed. Real browser glyph height exposed overlapping three-country legend rows; a failing geometry regression led to 16px spacing and measured footer placement, followed by all focused/full checks. The existing merchandise gap test counted the new duty circles globally; scoping it to its original merchandise chart preserved the expected 23 points. Type checks and full 140-case browser repeat passed. No expected data values were changed.

Before edits, root and an independent auditor authenticated all 444 predecessor sealed files, 112 CSVs plus Canada projection, seven accepted/eleven protected identities, six producer pins and unchanged 93da582..1b1c461 runtime. The extra 28-case baseline retains its disclosed indirect shared-stage/producer binding. This does not certify new source data.

Fresh stage/precheck/retained-Census-and-Canada-snapshot build/postcheck/assembly and deterministic site/withdrawal creation/readback passed. Independent readback confirmed all **112 CSVs and Canada projection byte-identical**, seven accepted/eleven protected identities unchanged, and serialized data props/routes/destination links unchanged.

Actual-data choices were recorded before checking: roasted world/Canada/Canada–Mexico–Guatemala; green world/Switzerland/Switzerland–Mexico–Guatemala. Roasted Canada has eleven qualified months; green Switzerland supplies 23 reported zero observations plus one actual gap; green Guatemala has three qualified months.

The independent loopback verifier derives arithmetic, coverage/classification and continuity directly from retained processed observations without application calculators. It passed **12 chart cases / 446 plotted points / 12 actual PNGs / six exact duty CSVs**, checking every point title, coordinate, hollow state, path break, ordered legend/count, exported marks and full source metadata. Both figures retain exact snapshots across 12/60, reload and back/forward; copy and two static-default journeys passed. Images are nonblank with correct dimensions and measured text bounds. World/three-country/qualified/zero-gap PNGs and desktop/mobile layouts were visually inspected.

The private verifier itself was strengthened after independent review to check exported values/metadata, both-chart transition snapshots and finite download timeouts. Its first attempts exposed a syntax typo, tsx nested-function serialization and an immediate saved-state hydration race; those harness issues were corrected without application changes. Partial failure artifacts remain distinct from the final passing receipt.

Existing checks passed: eight briefing handoffs/eight exact CSVs/two static journeys; four merchandise-profile journeys/48 monthly values/eight downloads; five Canada-sharing journeys/six downloads including two PNGs/four exact CSVs. No browser page errors or unexpected outside requests occurred.

## Candidate identity and measurements

Staged source **f03250b9e757a3d9ea0fb458efac02fa8c19d2c9**; last runtime change **67c031a9d3d09f78ae58e1c57e1c1989eefad1d3**. Later reviewed documentation/merge trees must bind the same runtime before upload.

| Measure | Predecessor | Candidate | Delta |
| --- | ---: | ---: | ---: |
| Entries | 31 | 31 | 0 |
| Raw bytes | 1,712,596 | 1,855,036 | +142,440 |
| Client JS bytes | 351,646 | 363,790 | +12,144 |
| CSS bytes | 19,855 | 20,778 | +923 |
| Largest: 090121 HTML | 285,044 | 349,768 | +64,724 |

Green profile HTML grows 64,647 bytes. New server-rendered charts/export markup explain profile growth; other HTML changes reduce to stylesheet references, generated island UIDs and the existing Methods schedule-evaluation timestamp. No stored downloads or route was added. The existing 2 MiB raw package cap has 242,116 bytes of headroom; future additions must continue measuring. All current caps and file-count planning thresholds pass.

Site ZIP: **405,972 bytes**, SHA-256 **1356ba9d9b8ba8354bc59e88abedf0b7ad304c85dd95c6dde30c440bcd90174a**. Manifest SHA-256 **278f298fd4bc6d9d118babc15623708773a16989a73237f93618ce60a0dc9add**. Withdrawal bytes are unchanged. Pinned recovery: Production **6d1e06b1-068a-451e-acf7-9aab8b201ebe**, ZIP **f7ca0478381638b6c36d7f3296b8757b1c32e28401753c46fcc6c692ee2da9fe**, manifest **5c754cb3c4e60f9161238ece0ebdd69a4aebd8ca92bdd9d61365fd667aad7117**.

No import, raw replay, accepted-data replacement/intake, R2, new dependency/service, paid/indexing change or recurring job occurred. Historical-data and successive-official-release limitations remain unchanged. Review/public/operational outcomes will be recorded only after they occur.
