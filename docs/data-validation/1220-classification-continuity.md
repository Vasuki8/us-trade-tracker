# Canada HS6 classification continuity review

Review window: **September 2024–August 2026**. Review date: October 12, 2026. All **17 ordinary direction/HS6 candidates are compatible at six digits** for this fixed window. A fresh independent reviewer supported each semantic conclusion and verified all 941 source bindings across 248 original sources. The review found one citation defect; the root corrected 72 export locators to source-specific pages and verified their bounds without changing any semantic conclusion or source body. This review changes no source values, country totals, statistical flags, reference outcomes, publication availability or release policy.

## Evidence and scope

The prior review could establish code presence and validity boundaries, but not the missing import definitions or the detailed-code transfer relationships. This follow-up adds direction-specific HTS chapters, their governing notes and authoritative dated histories. The [USITC release calendar](https://hts.usitc.gov/reststop/releaseList) identifies 54 editions overlapping the fixed window, from Revision 8 (2024), released August 15, 2024, through Revision 17 (2026), released August 24, 2026. All four relevant PDFs in each edition were retained: chapters 27, 87 and 88, plus chapter 86's opening Section XVII notes. Release metadata describes published classification editions; it does not date trade-row revisions.

The 216 original PDFs and request metadata are preserved under ignored `data/backups/canada-country-audit/classification-references-2026-10-12/`. Sixteen previously captured files were reused without change; 178,029,253 new bytes were captured serially in 147.3 seconds, within the 192 MiB/12-minute research allowance. Four HTS CSV snapshots corroborate inherited parent wording. CSV rows sometimes collapse a six-digit subheading into an eight-/ten-digit national number, so a missing standalone six-digit row is not treated as missing classification. The PDFs supply the actual definitions and notes.

Across all 54 editions, the normalized governing note blocks have six distinct forms: two for chapter 27, two for chapter 87, and one each for Section XVII and chapter 88. The only changes are the January 2025 biogenic-fuel statistical note and the July 2026 offset-steering statistical note for `8707100030`. The latter belongs to a different parent. Legal notes governing the selected HS6 families remain stable. All 486 candidate/edition contexts contain their expected parent phrases and code locators; lexical presence is corroboration, not the sole basis for compatibility.

For exports, the retained 2024/2025/2026 Schedule B chapters 27, 71, 84 and 87 and Section XVI/XVII notes were checked with all five dated Census transition guides (January/July 2025 and January/February/July 2026) and the official committee histories. [Census's transition guides](https://www.census.gov/foreign-trade/schedules/b/index.html) expressly describe their relationships as guidance, rather than an official classification manual; they do not substitute for the actual books and USITC history tables. PDF reflow/text order is distinguished from a scope change. The 2026 chapter 84 addition concerns industrial turbines in `8411828010`, while the ADP definition, unit tests and systems exclusion governing `847150` stay unchanged. Chapter 71 changes are reflow, not a change to gold scrap's scope.

## Detailed-code transitions

- **Imports `271012`:** [USITC's January 2025 history](https://www.usitc.gov/tariff_affairs/documents/484%28f%29_committee_changes_for_january_1_2025-final.pdf), PDF page 17, transfers `2710124590` into `2710124560` and `2710124595` within the same HS6. New statistical note 1 identifies the biogenic-fuel child; the inherited legal definition remains unchanged.
- **Exports `271012` and `271019`:** the same official history, PDF pages 18–20, transfers `2710124550` into `2710124560`/`2710124595`, and `2710194590` into `2710194550`/`2710194595`. New Schedule B statistical note 6 defines the subdivision. Each transfer remains within its own HS6; no cross-parent bridge or allocation is used.
- **Imports `870829`:** [USITC's July 2026 history](https://www.usitc.gov/tariff_affairs/documents/list_of_committee_changes_for_july_1_2026-final.pdf), PDF page 69, transfers `8708295160` into `8708295150`/`8708295190`, separating tonneau covers within the existing body-parts parent.
- **Exports `870323`:** the January 2025 Schedule B note defines new versus used children under heading 8703. The review retains both kinds in the same cylinder-capacity HS6; import HTS already had that distinction in the starting edition. This does not interchange direction-specific calendars.

The historical workbooks corroborate dates and parent membership. Literal `Current` and `Prior to 2007` are preserved, and no predecessor relationship is invented from common prefixes. The decisive transfer relationships above come from dated official histories and are checked in the original table layouts.

## Candidate conclusions

| Direction | HS6 | Reviewed six-digit scope | Conclusion |
| --- | --- | --- | --- |
| Imports | 270900 | Crude petroleum/bituminous oils | Compatible |
| Imports | 271019 | Other noncrude petroleum preparations, with parent exclusions | Compatible |
| Imports | 271121 | Natural gas in gaseous state | Compatible |
| Imports | 870323 | Spark-ignition passenger vehicles above 1,500 cc through 3,000 cc | Compatible |
| Imports | 870340 | Spark-ignition/electric passenger vehicles, excluding external charging | Compatible |
| Imports | 870324 | Spark-ignition passenger vehicles above 3,000 cc | Compatible |
| Imports | 870829 | Other vehicle body/cab parts under the Section XVII rules | Compatible |
| Imports | 271012 | Light petroleum preparations under unchanged parent/distillation rules | Compatible |
| Imports | 880240 | Aircraft above 15,000 kg unladen weight, excluding unmanned 8806 goods | Compatible |
| Exports | 270900 | Crude petroleum/bituminous oils | Compatible |
| Exports | 870431 | Spark-ignition goods vehicles, gross weight at most 5 tonnes | Compatible |
| Exports | 271012 | Light petroleum preparations under unchanged parent/distillation rules | Compatible |
| Exports | 271019 | Other noncrude petroleum preparations, with parent exclusions | Compatible |
| Exports | 870899 | Other vehicle parts/accessories under the Section XVII rules | Compatible |
| Exports | 847150 | ADP processing units excluding 847141/847149, under the governing unit rules | Compatible |
| Exports | 870323 | Spark-ignition passenger vehicles above 1,500 cc through 3,000 cc | Compatible |
| Exports | 711291 | Gold scrap/waste, with precious-metal and 8549 exclusions | Compatible |

The [classification ledger](1220-snapshot-classification-evidence.json) binds each direction/code, fixed interval, conclusion and original source identities/locators. Three known statistical candidates remain ineligible. Newly qualified comparisons are assessed offline with the existing calculations and same-archive denominators. The previous all-unverified assessment and all prior source/reference failures are preserved. No country release, public profile, 60-month claim, trade-source replay/download, R2 operation, deployment, access change or cost is authorized here.

## Independent review and correction

The immutable draft reviewed was `df90e03313c428e74864919a94ad281ffe3c5b49`, tree `450c937d97ace7a0d2b747fa5b6b24b64537b63b`. The 81,421-byte independent receipt has SHA-256 `5e4232f871674d07d902998b743335f0331fd0224d970295fd0d23168aab3e7a`. It records all 17 individual verdicts, source identities, inspection methods and limits. Verdict: **with fixes**, solely for finding R1, the copied export citations. Forty transition-guide bindings had referenced nonexistent pages; all 72 new export dated-change locators were made source-specific. The correction check reauthenticated all 941 bindings, checked 875 explicit PDF page locators across 246 PDFs, and confirmed that source identities and semantic conclusions did not change.

The reviewer did not judge fresh assessment calculations, raw trade-body integrity/replay, public availability, 60-month history, deployment or the broader preservation audit. Those limits remain explicit in the [versioned evidence record](1220-classification-continuity-evidence.json). The previous unverified snapshot reports remain historical evidence of their original processing versions.

## Fresh offline assessment

The existing bounded command completed once at processing commit `9c385fb94b2a36b1d07ddf9e01670c366839a83b`, with the corrected ledger's SHA-256 `afde19b1384c0cbab8cb2f7bbbc5ed8253bc636bb7a35c6b8d5d3c599a1010fd`. Outputs are retained in ignored `data/backups/canada-country-audit/snapshot-classifications-2026-10-12-r1/`: JSON 858,857 bytes, SHA-256 `2cad0dcabf353b8aec0d365bb247e5d976712a7a1ebc90cac26694322503d9f8`; Markdown 3,192 bytes, SHA-256 `9dd280b4b7a7522d3775a94aee86fc05e313315b91c3d76b9c61c910df4dd44e`. Their combined 862,049 bytes are within the existing 8 MiB allowance. No trade ZIP body was read, decompressed or downloaded.

A separate targeted independent calculation check authenticated the four anchors and 96 normalized files. All 48 contexts (223,049 rows) have exact zero residuals. All 480 candidate observations and 40 window numerator/denominator pairs agree. The 17 ordinary candidates qualify offline: 408 monthly shares, 34 rolling shares, 17 growth percentages and 17 share-point changes agree exactly with independent calculations. The three statistical candidates retain null comparisons. The 57,268-byte calculation receipt has SHA-256 `62864ebf3c55e0b01fe1e6114e3413c0674effa1fad19a0842103c1d9859c547` and reports no findings. The 43 existing snapshot regression cases pass.

Both retained current reference snapshots still show **41 matches and seven mismatches**; the seven reviewed original publications match, while the other 41 original-publication comparisons remain unreviewed. The prior strict-audit failures and capture provenance stay unchanged. The archive is not a uniform revision vintage or a latest revised headline history. The old assessment outputs, old historical documents, all 23 earlier country evidence fields and four accepted coffee files are preserved. All three availability flags remain **false**: release acceptance, public rolling comparisons and default audit retrieval change. This completes the fixed-window classification verification, not a Canada public release or longer-history qualification.
