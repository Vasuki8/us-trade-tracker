# Tea and cocoa expansion — October 17, 2026

Status: classification intake is ready, but source acceptance failed. Tea and cocoa remain unpublished. No accepted new-product release, archive initialization or site publication occurred.

October 18 follow-up: the separately approved [source-resumption assessment](tea-cocoa-resumption-20261018.md) obtained and verified both complete source candidates. Acceptance and publication remain gated; the October 17 failures below remain the record of that earlier batch.

| HS6 | Scope | Reviewed interval | Import classification |
| --- | --- | --- | --- |
| 090240 | Other black and partly fermented tea | September 2021–August 2026 | 0902400000 throughout |
| 180100 | Cocoa beans, whole or broken, raw or roasted | September 2021–August 2026 | 1801000000 through January 2026; 1801000010 (certified organic) and 1801000090 (other) from February 2026 |

Both export classifications retain their original ten-digit code throughout. The cocoa import split stays inside HS 180100. Use the reported HS6 total; summing retired and replacement detail codes as if they were concurrent would double count.

Evidence: the full 2021–2026 Census import/export concordances were authenticated against the retained original SHA-256 identities and independently extracted for these two prefixes. Census's historical code workbooks corroborate the code dates. The USITC January/February 2026 committee changes, page 10, explicitly transfer cocoa's detail codes effective February 1, 2026. The July 2026 committee changes contain neither reviewed prefix. Annual concordances can include both retired and replacement codes, so an annual listing alone does not establish the active monthly detail set.

Sources and row identities are recorded in [tea evidence](090240-classification-evidence.json) and [cocoa evidence](180100-classification-evidence.json):

- [Census reference and annual concordances](https://www.census.gov/foreign-trade/reference/index.html)
- [Historical import codes](https://www.census.gov/foreign-trade/reference/codes/Import_Historical_HS_Numbers.xlsx)
- [Historical export codes](https://www.census.gov/foreign-trade/reference/codes/Export_Historical_HS_Numbers.xlsx)
- [USITC January/February 2026 changes](https://www.usitc.gov/tariff_affairs/documents/list_of_committee_changes_for_january-1-2026-and-february-1-2026.pdf)
- [USITC July 2026 changes](https://www.usitc.gov/tariff_affairs/documents/list_of_committee_changes_for_july_1_2026-final.pdf)

The historical workbooks were retrieved October 17. The authenticated committee originals were retained October 12 and reused without relabeling their retrieval date. The original import workbook has malformed core date metadata; its cells were read directly from unchanged ZIP/XML rather than repairing the original. A fresh USITC PDF request returned HTTP 403; the authenticated retained original supplied the evidence instead.

Registry flags permit intake only. Publication and duties acceptance remain false. Classification intervals stop at August 2026 even though the historical workbook labels some detail codes “Current.” No September or later import is authorized by these intervals. Existing coffee and Canada accepted inputs remain unchanged.

## Source assessment outcome

| Product | Duty audit | Source import | Decision |
| --- | --- | --- | --- |
| Tea 090240 | 23 of 24 months complete; February 2026 incomplete. Its one retry stopped in an existing test before Census retrieval. | Omitted because the separate required audit cannot pass within this batch. | Withhold acceptance and publication. |
| Cocoa 180100 | All 24 months independently verified, 96 raw records and 784 normalized observations, with no discrepancies. | Both permitted attempts failed during Census retrieval and retained no import artifact. | Withhold acceptance and publication. |

The [tea audit](https://github.com/Vasuki8/us-trade-tracker/actions/runs/39045756732), [cocoa audit](https://github.com/Vasuki8/us-trade-tracker/actions/runs/39046703861) and [cocoa import](https://github.com/Vasuki8/us-trade-tracker/actions/runs/39047019854) ran on reviewed commit `28f761a77c445a87b5a56586b0d20244335cde2e`. The [sanitized evidence record](product-expansion-20261017-evidence.json) binds artifact identities, attempts and independent calculations. Authenticated originals and failure logs were preserved separately.

Independent replay also matched all 1,024 normalized tea observations in its 23 complete months. This verifies the retained arithmetic, not complete coverage. Missing February inputs stay unavailable; captures were not stitched together. Reported zero duties remain explicit zeros. RP70/79 qualifications remain: dutiable value lacking a calculated duty sums to $205,406 across tea's complete months and $5,318,804 across cocoa's 24 months. Neither amount implies duty-free treatment.

Both cocoa import attempts reported “Census request failed or timed out; the current release is unchanged.” Their exact transport cause and failed request identity are unverified. No complete 60-month merchandise artifact exists to replay or recover. The tea retry instead failed an existing `round_trips_exactly_eleven_members` test at its 5,000 ms timeout. No further retries, workflow changes, timeout increases or acceptance exceptions were used.

The five workflow attempts made no R2 write. No canonical new-product data, publication flags or selection pins were installed. Archive initialization/readback, accepted-source recovery, expanded site packaging and publication remain gated. The retained 31-file predecessor package was authenticated, and no upload or restoration was attempted. Existing coffee and Canada accepted inputs remain unchanged.

The generic portfolio wording/CSV filenames and tested 8 MiB aggregate verification ceiling are preparation changes only. They do not establish source acceptance and have not been deployed. The ZIP, manifest, request-count, timeout, hash, same-origin and private-path checks retain their existing limits. Synthetic non-coffee loader tests are fixtures, not official accepted observations.

Mexico's separate [offline feasibility assessment](2010-feasibility.md) independently verified 26 of 48 contexts and retained its resource-stop exception. It establishes no accepted Mexico release or public profile.

Recommended next step: separately scope a retrieval-reliability repair that retains bounded, sanitized failed-request identity and partial capture evidence, then reassess a new intake batch. This report authorizes no additional source request or retry.
