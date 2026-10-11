# Canada country audit evidence

**Latest verdict:** the completed 24-month audit failed source acceptance. A separately retained followup retrieved two of its nine missing import parts; seven still timed out. The export cumulative value equals the original API monthly sum and remains $1,796,212,748 below the followup's official reference sum, so substituting `ALL_VAL_YR` does not resolve the discrepancy. Independent replay and review verify both runs' evidence, not source acceptance. No Canada release or country comparison is accepted. Earlier runs below are historical checkpoints.

## October 10 first live run: incomplete, no source acceptance

[PR #36](https://github.com/Vasuki8/us-trade-tracker/pull/36) added the isolated Canada audit after independent review. Exact-head [code checks](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38092795364) passed 504 tests, zero diagnostics across 133 files, a measured 19-file fixture build and 52 browser cases.

[Audit run 38093079916](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38093079916) used main commit `2cec05736b7401d4f81b0d3d00b1d3c1e5b5b25c`, country `1220` and end `2026-08`. It reached the 20-minute job limit. Its always-run upload retained a partial artifact successfully despite job cancellation. There is no completed `audit.json` or `country-dataset.json`.

The artifact's SHA-256 matches GitHub metadata. All 75 ZIP members independently match their extracted bytes: 74 logical Census request records and one official Canada HTML record. Every Census record has one attempt, null HTTP status and body in its attempt event, and convenience status `0`. No Census observations were returned. Recorded requests span September 2024–March 2026: 38 import parts and 36 export parts. The approximately 30-second failure intervals agree with the configured request timeout, but the original records do not retain the underlying transport cause.

The [official Canada table](https://www.census.gov/foreign-trade/balance/c1220.html) returned HTTP 200, retrieved `2026-10-10T22:55:08.802Z`, with `Last-Modified: Tue, 06 Oct 2026 12:35:31 GMT`. That response establishes public-table access, not access to keyed Census API data. Separate keyless local checks reached API metadata and received the expected missing-key HTML for both a known coffee query and the Canada query; they do not verify the GitHub runner, key validity or either keyed query contract.

**Verdict:** total-row contracts, HS6 coverage, reconciliation, monthly completeness, provisional shares and classification compatibility remain unverified. This run cannot support a country release or page. Both accepted coffee releases and pointers retain their original SHA-256 values. No R2 operation, publication or recurring job occurred. See the [machine-readable evidence](1220-country-audit-evidence.json).

## Bounded diagnostic follow-up

[PR #37](https://github.com/Vasuki8/us-trade-tracker/pull/37) added a 15-minute retrieval-step cutoff within the unchanged 20-minute job budget. Setup/checks and upload share the remaining budget; it is not a guaranteed five-minute upload window. Its [exact-head checks](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38093938902) passed all 504 tests and 52 browser cases. The first run's successful upload is retained as observed evidence, rather than retroactively described as lost.

A manually selected `connectivity-probe` checks public API variables, the existing roasted-coffee world query and Canada's import/export total and HS6 queries for August 2026. [PR #38](https://github.com/Vasuki8/us-trade-tracker/pull/38) passed independent review and [exact-head checks](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38094915666): 511 tests, zero diagnostics across 135 checked files and 52 browser cases. The probe uses six logical checks with at most two in flight, existing bounded country HTTP retries, a four-minute step limit, fresh output, original credential-safe records and allowlisted transport codes. The limit covers the permitted 213-second request/retry schedule. It does not copy exception messages, accept a dataset or establish 24-month coverage even if every check passes.

## First probe: controls received, country queries timed out

[Probe run 38095150145](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38095150145) used main commit `259322fc56dd8315407699c976d2bbfe6c3e869d`. All 511 code tests and type checks passed before retrieval. The six checks made six HTTP attempts and finished within the diagnostic deadline; the workflow failed because four country checks failed validation through transport timeout. Upload succeeded.

The 5,104-byte ZIP matches GitHub's SHA-256 `9b37b82a9bc8d214c427129c8a15fe684aede2965e8788cb8c03e5f343710f9f`. Independent review matched all seven ZIP members and six raw-file manifest hashes (21,478 extracted bytes), plus event/result identities. Public API variables returned HTTP 200 in 226 ms. The keyed roasted-coffee control returned HTTP 200 in 3,770 ms with the expected August 2026 HS6 world observation of $140,980,739. Each Canada total/breakdown query timed out after approximately 30 seconds, before any retained HTTP status or body.

This rules out a blanket claim that this runner could not reach the API or that the key failed every data request. The underlying cause of Canada's four timeouts remains unverified. No country dimensions, totals, product coverage or residuals were observed.

The [Census API guide, page 7](https://www.census.gov/foreign-trade/reference/guides/Guide_to_International_Trade_Datasets.pdf) warns that native `time` uses additional processing resources and recommends `YEAR`/`MONTH` for larger requests. The next controlled change uses these exact calendar predicates for country requests while keeping country, aggregation, returned subdivisions, timeout and concurrency checks intact. Both legacy `time` evidence and paired `YEAR`/`MONTH` evidence require an exact matching month; mixed or incomplete temporal columns are rejected. This is a documented hypothesis test, not a proven explanation. A short probe must establish usable responses before a full audit retry.

## Calendar probe: usable August contracts, full coverage pending

[PR #39](https://github.com/Vasuki8/us-trade-tracker/pull/39) passed independent review and [exact-head checks](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38095661373): 514 tests, zero diagnostics across 135 checked files and 52 browser cases. [Calendar probe 38095866518](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38095866518) then used main commit `2cd1b077387b8cd4ee22acf24ee13986493609d1` and passed all six checks with six HTTP 200 responses.

The 708,137-byte ZIP matches GitHub's SHA-256 `61ae69a54ccef22ce877a740c536bf32842aeecbaee080ff210d6ae4e5d9f15e`. Independent review matched all seven members (3,612,699 extracted bytes), all six manifest digests, event/result identities and original country dimensions. August rows have exact `YEAR=2026`, `MONTH=08`, Canada identity, DET/CY or DET/HSCY aggregation, and aggregate `-` subdivisions. Total rows have commodity `-` and `COMM_LVL=-`.

Independent integer sums of 4,437 import HS6 rows equal the separate total of **$35,980,039,950**. The 5,111 export rows equal the separate total of **$30,289,552,895**. Both August residuals are exactly $0. The result supports retaining the documented calendar query change, but different runs do not prove the earlier timeout's underlying cause. A successful one-month probe establishes neither 24-month source coverage nor classification compatibility.

The August breakdown explicitly reports 869 zero-valued import rows and 462 zero-valued export rows, with no unavailable value markers in returned rows. An omitted product/month still remains unavailable. Special rows include import code `999995` (estimated low-valued transactions, $250,245,952) and export code `988000` (low-value shipments/Canadian estimated late receipts, $1,533,311,008). These are retained for reconciliation and flagged as special; ordinary product eligibility cannot be inferred from them.

## Full calendar audit: complete evidence, source acceptance failed

[Full audit 38096086464](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38096086464) used the same reviewed main commit for September 2024–August 2026. It completed retrieval within the 15-minute step cutoff and wrote both reports. The workflow failed on source checks, rather than a job or step timeout; artifact upload succeeded. All 514 code tests and type checks passed before retrieval. Passing software checks do not establish source acceptance.

The 23,117,921-byte ZIP matches GitHub's SHA-256 `2acbe7419576b9e19f1c574b78c4e65f798b664f3fac35b552f5e7826ad1550c`. Independent verification matched all **99 members** (117,546,289 extracted bytes) and all **97 original-record manifest digests**. Independent replay and separate review matched the original response dimensions, integer sums, 48 monthly checks, every candidate period sum/share/completeness flag and dataset contents. Evidence consistency is verified; source coverage is **failed**.

Of 96 logical API parts and 96 attempts, **87 parts were usable**: 41 total responses and 46 HS6 breakdowns, containing 214,292 product/month observations. Exports returned all 24 totals and breakdowns. Imports returned 17 totals and 22 breakdowns. Eight import parts had no retained HTTP response; the June 2025 import breakdown had HTTP 200 but no retained body. Those nine parts stay unavailable. The underlying retrieval failure cause is unverified.

| Import month | Unavailable part |
| --- | --- |
| May 2025 | Total |
| June 2025 | Total and HS6 breakdown |
| August 2025 | Total |
| September 2025 | HS6 breakdown |
| December 2025 | Total |
| March 2026 | Total |
| April 2026 | Total |
| June 2026 | Total |

The independent integer sums equal separate API totals in **40 month/direction pairs**, with exactly $0 residual. Eight import pairs are incomplete; their residuals are unavailable, not zero. No available pair has a nonzero residual. Against the retained official table, **34 totals match at its displayed $100,000 precision, seven export totals mismatch and seven missing import totals are unavailable**. September 2025 imports match the table but lack a product breakdown.

The full run's own reference was retrieved `2026-10-10T23:45:54.735Z`, with `Last-Modified: Tue, 06 Oct 2026 13:08:40 GMT` and `Date: Sat, 10 Oct 2026 23:45:54 GMT`. Its original HTML, not a replacement fetched later or another run's reference, underlies these checks. Differences below are API total minus the rounded official reference, in dollars; each affected API product sum independently equals its API total.

| Export month | API total USD | Official reference USD | Difference USD |
| --- | ---: | ---: | ---: |
| 2026-01 | 24,510,292,823 | 24,461,200,000 | +49,092,823 |
| 2026-02 | 28,371,311,032 | 28,417,800,000 | -46,488,968 |
| 2026-03 | 31,438,946,691 | 31,654,800,000 | -215,853,309 |
| 2026-04 | 29,741,092,873 | 30,197,100,000 | -456,007,127 |
| 2026-05 | 29,790,835,759 | 30,399,000,000 | -608,164,241 |
| 2026-06 | 30,695,510,012 | 31,007,100,000 | -311,589,988 |
| 2026-07 | 29,338,645,167 | 29,545,800,000 | -207,154,833 |

These gaps exceed display rounding and must not be hidden with a wider tolerance, normalized product values or substituted denominators. [Census's revision procedure](https://www.census.gov/foreign-trade/guide/revisions.html) says revisions received from Canada can correct cumulative export totals while detailed revisions wait for the annual revision release. The [2026 annual revision notice](https://www.census.gov/foreign-trade/Press-Release/final_revisions/index.html) documents corrections to Census-basis goods statistics. This makes source revision/vintage a plausible lead, **not a demonstrated cause of these seven differences**. The retained API rows do not establish a revision date.

There are **10,255 provisional candidates**: 4,916 imports, all incomplete, and 5,339 exports, of which 4,427 have complete arithmetic and reported observations. All import period shares are unavailable because both 12-month country denominators contain gaps. Arithmetic completeness does not override failed source acceptance. Every candidate retains `classificationStatus: unverified` and `comparisonAvailable: false`; matching numeric codes alone does not establish compatibility across dated [Census commodity concordances](https://www.census.gov/foreign-trade/data/dataproducts/concordance).

**Recommendation:** retain this failed audit as the baseline. Diagnose import retrieval with bounded, focused requests and investigate the export revision/vintage discrepancy before another acceptance attempt. Any retry must preserve its own original records and reference vintage. Increasing timeouts, repeating all requests blindly or relaxing validation is not justified by this evidence. Country release/archive and page work should wait. Both accepted coffee releases and pointers retain their recorded hashes; no R2 operation, publication or schedule was added. Exact run, artifact, report and replay hashes are in the [machine-readable evidence](1220-country-audit-evidence.json).

## Fixed source followup

The manual `source-followup` diagnostic tests the two observed problems separately. It retries only the nine unavailable import identities from full run 38096086464, preserving their exact reviewed calendar queries, and requests the August export CY total with both `ALL_VAL_MO` and `ALL_VAL_YR`. A fresh official reference runs first; ten API calls then run in five pairs, with the existing 30-second deadline and HTTP 429/5xx retry rule. The worst permitted reference/API schedule is 487.5 seconds, within a nine-minute step and the unchanged 20-minute job budget. There are eleven logical requests and at most 31 attempts, not another 96-part audit.

Original credential-safe bodies and every attempt remain retained, with header/body failure phase, elapsed time and allowlisted transport codes. The cumulative comparison requires all eight January–August 2026 reference rows. It reports the signed difference from their rounded sum with a $400,000 accumulated rounding bound; an unavailable input remains unavailable. Agreement within that bound corroborates cumulative values only. It cannot repair the seven monthly discrepancies, prove a revision cause, substitute monthly denominators or establish classification compatibility.

The followup writes an isolated diagnostic report, not a country release or combined accepted dataset. It never overwrites the original failed audit. Its source and classification statuses stay unverified regardless of diagnostic outcome. The latest full-audit verdict above remains failed.

### Live followup: two import totals retrieved; cumulative correction hypothesis rejected

[PR #41](https://github.com/Vasuki8/us-trade-tracker/pull/41) passed independent review and [exact-head checks](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38098183253): 523 tests, zero diagnostics across 137 checked files and 52 browser cases. [Followup run 38098594901](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38098594901) used merged main commit `5ea158b79c0409bb64678db7a3bfe6db07cf2be4`. Its code checks passed before retrieval. Eleven logical requests made eleven attempts; retrieval finished in about 129 seconds, inside the nine-minute step. The workflow failed its source diagnostic, rather than timing out, and upload succeeded.

The 37,405-byte ZIP matches GitHub's SHA-256 `915ab060f10c8f1700ca47c65d1b7094bc33ce39aa67f438813a17d98b32b3c0`. Independent verification and separate review matched all **12 members** (244,586 extracted bytes), all **11 original-record manifest digests**, request/attempt/event identities, original response contracts and the cumulative calculation. This verifies evidence consistency only.

Seven import requests timed out before response headers at 30,000–30,001 ms: May 2025 total; June 2025 total and breakdown; August 2025 total; September 2025 breakdown; December 2025 total; April 2026 total. Each retained attempt has null status/body and the allowlisted `timeout` code. There were no HTTP 429/5xx responses triggering a retry. This establishes the observed failure phase and deadline, but not the underlying server or network cause. The two remaining import totals returned HTTP 200 with the expected Canada CY aggregate contract:

| Import month | Followup total USD | Original audit HS6 sum USD | Followup rounded reference USD |
| --- | ---: | ---: | ---: |
| 2026-03 | 34,089,317,327 | 34,089,317,327 | 34,089,300,000 |
| 2026-06 | 37,216,785,546 | 37,216,785,546 | 37,216,800,000 |

Both exact cross-run residuals are $0 and both totals match the followup reference at its displayed precision. This corroborates those two totals without overwriting the original audit, creating a combined accepted dataset or establishing complete import coverage. No missing HS6 breakdown was retrieved.

August exports returned monthly `ALL_VAL_MO = $30,289,552,895` and cumulative `ALL_VAL_YR = $234,176,187,252`. The cumulative value **exactly equals the original audit's January–August API monthly sum**. The followup's own eight rounded official export months sum to **$235,972,400,000**. Their signed difference is **-$1,796,212,748**, outside the **$400,000** accumulated rounding bound. Thus the specific hypothesis that the API cumulative field already supplies a corrected total is rejected for this retrieval. Census's documented revision process remains relevant background, but the cause of the API/public-table discrepancy is still unverified. Neither cumulative values nor statistical adjustments may be substituted for monthly product denominators.

The followup reference was retrieved `2026-10-11T00:30:34.037Z` (October 10 in the local timezone), with `Last-Modified: Tue, 06 Oct 2026 12:35:31 GMT` and `Date: Sun, 11 Oct 2026 00:30:34 GMT`. Its Last-Modified differs from the original full audit's `13:08:40 GMT`, but all eight displayed 2026 export months are identical across the two references. Retain both originals; the timestamp difference alone does not establish a revision or caching cause. The export API row again reports `LAST_UPDATE = "0"`, which provides no useful revision date.

**Next recommendation:** investigate a narrower aggregate request against the retained import query under unchanged month, country, validation and deadline controls, and investigate the common API/public-table source vintage. Do not repeat all 96 requests or implement an `ALL_VAL_YR` correction. The original full audit remains failed, this diagnostic remains unverified for source/classification acceptance, and country release/archive and page work should wait. All accepted coffee hashes remain unchanged. See the exact report/replay hashes and findings in the [machine-readable evidence](1220-country-audit-evidence.json).

## Controlled aggregate-query probe

The next fixed `aggregate-probe` tests whether explicit aggregate-subdivision predicates improve the persistent retrieval failures. The [Census API guide](https://www.census.gov/foreign-trade/reference/guides/Guide_to_International_Trade_Datasets.pdf), pages 7 and 11, describes how requested dimensions affect returned data and recommends smaller calls to avoid unpredictable timeouts. That supports a controlled experiment, not a claim that this query shape caused the observed failures.

Four contexts each receive an original query and an explicitly filtered query: May 2025 import total, June 2025 import HS6 breakdown, August 2026 import total control, and May 2026 export total. The only query change is to constrain `DISTRICT`, import `RP`/`CTY_SUBCODE` or export `DF` to the observed aggregate `-`, removing those columns from `get` because the predicates return them. Commodity predicates stay unchanged, including no added all-commodity filter for totals. Country, exact calendar, summary level, returned full contract, deadline and retry rules remain unchanged. A fresh official reference runs alone, then four API pairs run with at most two requests in flight. Nine logical calls can make at most 25 attempts; the 396-second worst permitted schedule fits a seven-minute step.

All original bodies, attempt phases, safe codes, query identities and hashes stay in fresh ignored output. Each usable pair compares all normalized rows by commodity identity, including descriptions, values and special flags; response ordering does not affect equivalence. Missing or unsafe inputs are unavailable, rather than equal totals. The report separates retrieval, paired equivalence and May export-reference agreement at $100,000 precision. A reference mismatch can leave the overall probe failed even if narrower queries retrieve usable responses. Paired differences alone cannot prove a cause because retrieval times may differ.

Older diagnostic modes keep their original queries and validation. This probe does not combine runs, change accepted data, access R2, schedule retrieval or publish a country page. Live evidence must be independently replayed before changing the source strategy; full acceptance and classification remain unresolved.

## Primary-source revision lead

The [May 2026 FT900 release](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2605.pdf#page=53), issued July 7, reports Canada exports of **$29,790.8 million** in its appended country exhibit (PDF page 53). The retained May API total, $29,790,835,759, rounds to that original published amount at $100,000 precision. The [June release](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2606.pdf#page=35), issued August 4, marks May Canada exports as revised to **$30,399 million** in Exhibit 14 (PDF page 35, $1 million precision). That revised figure agrees at its displayed precision with the current HTML reference's $30,399.0 million, rather than the API amount.

Census's [Canadian Estimates explanation](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2606.pdf#page=7) says current-month Canada exports include estimated late arrivals/corrections; the following month's news-release exhibits replace that estimate with actual receipts/corrections. This documents a publication revision for May and makes the revision/vintage explanation stronger. Inferring that this policy explains the entire API difference remains an inference: these exhibits do not identify every retained API record's vintage or account for all seven discrepancies. Historical releases used for this research are supporting references, not replacements for either audit's retained reference.

The current-reference mismatch is real, but it does not by itself prove the API arithmetic is wrong. A future acceptance design must establish compatible reference vintages and explain Canada-specific revisions before changing that gate. Do not rescale products, widen tolerances, substitute revised totals as product denominators or mark acceptance from this research alone. The bounded query probe above continues to measure retrieval and equivalence separately.

## Product eligibility questions retained for the next design

- Review dated import HTS and export Schedule B definitions across 2024–2026, including splits, mergers and within-year changes. Matching HS6 strings or descriptions do not prove comparability.
- Require an explicitly reported value in every required month for provisional rolling product sums. Missing rows are unavailable, even when the overall breakdown reconciles; a reported zero is a valid observation.
- Keep 98/99 rows visible in audit reconciliation, but review each category's meaning separately. Returned goods, repairs and special provisions are not all estimates. Codes `999995` and `988000` specifically identify statistical low-value/late-receipt categories.
- Consider disclosure and combined or pseudo classifications when interpreting omissions, using the [Census methodology](https://www.census.gov/foreign-trade/guide/sec2.html). An absent commodity is not proof of absent trade.
- Retain the full run's own API retrieval times and Canada-table retrieval/version. August product `LAST_UPDATE` values are all `"0"`, which gives no useful revision date. Rounded official-table agreement corroborates monthly totals, not product continuity or classification eligibility.

Until those questions have reviewed evidence, every product candidate remains `classificationStatus: unverified` and `comparisonAvailable: false`, even if its arithmetic and monthly observations are complete.
