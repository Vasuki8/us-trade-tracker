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

### Live aggregate probe: equivalent returned data; no supported filter fix

[PR #43](https://github.com/Vasuki8/us-trade-tracker/pull/43) merged after independent review and [checks for its reviewed commit](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38100802335): 532 tests, zero diagnostics across 139 files and 52 browser cases. [Aggregate probe 38101045210](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38101045210) used main commit `9cdc827a11ed61555340498b6d04367e20cfe134`. Software checks passed before source retrieval. Nine logical requests made nine attempts, finishing retrieval in about 102 seconds within the seven-minute step; source checks failed and evidence upload succeeded.

The 548,324-byte ZIP matches GitHub's SHA-256 `6adc288cb2b88f39e42bc374f669e0630e899658af54455655e0fd1b1b829022`. Independent verification matched all **10 members** (3,529,166 extracted bytes), all **nine original-record manifest digests**, exact original/explicit queries, returned dimensions, row digests, sums and attempt/event identities. The report and independent replay hashes are in the [machine-readable record](1220-country-audit-evidence.json). This verifies evidence consistency, not source acceptance.

| Fixed context | Original query | Explicit aggregate query | Pair verdict |
| --- | --- | --- | --- |
| May 2025 import total | Header timeout, 30,001 ms | Header timeout, 30,000 ms | Unavailable |
| June 2025 import HS6 breakdown | 4,302 rows, $29,645,029,011; 21,890 ms | Same full rows and sum; 21,312 ms | Equivalent |
| August 2026 import total control | Header timeout, 30,001 ms | Header timeout, 30,000 ms | Unavailable |
| May 2026 export total | $29,790,835,759; 3,126 ms | Same full row; 19,457 ms | Equivalent |

The June breakdown was unavailable in both earlier runs, but both strategies returned it here. Their complete normalized rows match, including commodity identities, descriptions, values and special flags. Its sum rounds to the probe's own June import reference of $29,645.0 million; no separate June total was requested, so this is supporting corroboration rather than complete monthly API reconciliation. The August control had worked previously and failed here, showing that availability varies across runs. These results do not establish the transport failure's cause or support changing the default strategy to explicit subdivision filters. There were no HTTP 429/5xx retry responses.

Both May export rows equal the original audit's total and product sum exactly. Each remains $608,164,241 below this probe's own current-reference value of $30,399.0 million. The historical-publication checks below clarify that discrepancy without altering the failed gate. The probe reference was retrieved `2026-10-11T01:14:04.376Z`, with `Last-Modified: Tue, 06 Oct 2026 13:08:40 GMT` and `Date: Sun, 11 Oct 2026 01:14:04 GMT`; retain this original alongside both older references.

**Recommendation:** retain the original query strategy. Review a reference protocol that accounts for the documented publication revisions, and investigate an independently justified alternative for import totals before another full retrieval. Repeating this probe or widening deadlines is not justified by these results. The original full audit remains failed; this diagnostic remains unverified for source/classification acceptance. No country release, comparison or archive is accepted. Both coffee pointers and accepted releases retain their recorded hashes.

## Primary-source revision lead

The [May 2026 FT900 release](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2605.pdf#page=53), issued July 7, reports Canada exports of **$29,790.8 million** in its appended country exhibit (PDF page 53). The retained May API total, $29,790,835,759, rounds to that original published amount at $100,000 precision. The [June release](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2606.pdf#page=35), issued August 4, marks May Canada exports as revised to **$30,399 million** in Exhibit 14 (PDF page 35, $1 million precision). That revised figure agrees at its displayed precision with the current HTML reference's $30,399.0 million, rather than the API amount.

Census's [Canadian Estimates explanation](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2606.pdf#page=7) says current-month Canada exports include estimated late arrivals/corrections; the following month's news-release exhibits replace that estimate with actual receipts/corrections. This documents a publication revision for May and makes the revision/vintage explanation stronger. Inferring that this policy explains the entire API difference remains an inference: these exhibits do not identify every retained API record's vintage or account for all seven discrepancies. Historical releases used for this research are supporting references, not replacements for either audit's retained reference.

Extending that check across the seven disputed months finds **all seven retained API totals match their own original monthly FT900 releases** at $100,000 precision. The appended Exhibit 4 reports domestic and foreign exports on an FAS basis, not seasonally adjusted, in millions of dollars. Monthly values, rather than year-to-date columns, are used below. Each link points to the PDF page containing Canada's row.

| Export month | Original publication USD | Retained API minus original publication USD | Supporting release |
| --- | ---: | ---: | --- |
| 2026-01 | 24,510,300,000 | -7,177 | [January, PDF page 56](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2601.pdf#page=56) |
| 2026-02 | 28,371,300,000 | +11,032 | [February, PDF page 55](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2602.pdf#page=55) |
| 2026-03 | 31,438,900,000 | +46,691 | [March, PDF page 54](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2603.pdf#page=54) |
| 2026-04 | 29,741,100,000 | -7,127 | [April, PDF page 55](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2604.pdf#page=55) |
| 2026-05 | 29,790,800,000 | +35,759 | [May, PDF page 53](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2605.pdf#page=53) |
| 2026-06 | 30,695,500,000 | +10,012 | [June, PDF page 53](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2606.pdf#page=53) |
| 2026-07 | 29,338,600,000 | +45,167 | [July, PDF page 54](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2607.pdf#page=54) |

This corroborates the retained monthly API amounts against an appropriate historical publication; it does not assign a revision timestamp to the API or establish full coverage/classification. During this research, those PDFs were inspected as primary sources rather than archived and independently replayed as audit inputs. The later publication audit below retains reviewed originals. The current HTML mismatch remains recorded under the existing gate. A prospective vintage-compatible acceptance protocol, preserving originals and distinguishing published revisions from product arithmetic, needs review before changing acceptance.

The current-reference mismatch is real, but it does not by itself prove the API arithmetic is wrong. A future acceptance design must establish compatible reference vintages and explain Canada-specific revisions before changing that gate. Do not rescale products, widen tolerances, substitute revised totals as product denominators or mark acceptance from this research alone. The bounded query probe above continues to measure retrieval and equivalence separately.

## Product eligibility questions retained for the next design

- Review dated import HTS and export Schedule B definitions across 2024–2026, including splits, mergers and within-year changes. Matching HS6 strings or descriptions do not prove comparability.
- Require an explicitly reported value in every required month for provisional rolling product sums. Missing rows are unavailable, even when the overall breakdown reconciles; a reported zero is a valid observation.
- Keep 98/99 rows visible in audit reconciliation, but review each category's meaning separately. Returned goods, repairs and special provisions are not all estimates. Codes `999995` and `988000` specifically identify statistical low-value/late-receipt categories.
- Consider disclosure and combined or pseudo classifications when interpreting omissions, using the [Census methodology](https://www.census.gov/foreign-trade/guide/sec2.html). An absent commodity is not proof of absent trade.
- Retain the full run's own API retrieval times and Canada-table retrieval/version. August product `LAST_UPDATE` values are all `"0"`, which gives no useful revision date. Rounded official-table agreement corroborates monthly totals, not product continuity or classification eligibility.

Until those questions have reviewed evidence, every product candidate remains `classificationStatus: unverified` and `comparisonAvailable: false`, even if its arithmetic and monthly observations are complete.

## Controlled import-total endpoint probe

The explicit-subdivision probe did not provide a supported fix. The next controlled alternative compares two Census commodity-classification endpoints for the same **country all-goods import total**, rather than changing source definitions or extending timeouts.

The [official import end-use metadata](https://api.census.gov/data/timeseries/intltrade/imports/enduse/variables.json) supplies `GEN_VAL_MO` (general-import total value), `I_ENDUSE`, `I_ENDUSE_LDESC`, calendar fields, country, district and summary dimensions. It does not supply HS-only `RP` or `CTY_SUBCODE`. The [API guide](https://www.census.gov/foreign-trade/reference/guides/Guide_to_International_Trade_Datasets.pdf) distinguishes country `CY` from end-use-by-country `EUCY` and documents the dash aggregate. These facts justify testing the alternative; they do not establish its observed availability or equivalence.

Manual `total-probe` retrieves its own official Canada reference first, then these fixed pairs: May 2025 import total, June 2025 import total, and August 2026 import total control. Each pair uses original `imports/hs` and alternative `imports/enduse`, with exact `YEAR`/`MONTH`, Canada `1220`, `SUMMARY_LVL=DET`, `SUMMARY_LVL2=CY` and `GEN_VAL_MO`. The end-use result must be exactly one aggregate `I_ENDUSE=-` row with empty/dash commodity level, national district, Canada name/code and exact period. Extra, duplicate, missing, subdivided or unknown fields fail closed. The alternate has a dedicated total type; it never masquerades as an HS6 product.

The reference runs alone; then at most two API requests run concurrently. Seven logical requests permit at most nineteen attempts: a 30-second reference plus three paired 91.5-second retry schedules totals 304.5 seconds, within a six-minute step. Existing HTTP-only retry and 30-second request deadlines remain. Original credential-safe responses, all retry bodies, phase/status diagnostics, byte counts and SHA-256 records are retained under fresh output.

`total-probe.json` separates exact endpoint dollar equality from each endpoint's own rounded reference agreement. A timeout or missing total leaves the pair unavailable even if the alternate matches the reference. This is evidence for a possible retrieval strategy, not fallback acceptance. Default full-audit queries, current-reference mismatch records, classification gates and accepted coffee files remain unchanged. Actual results require independent artifact verification and replay before considering adoption.

### Reference-vintage protocol direction

The seven original-publication matches remain supporting research at this checkpoint. Before an original FT900 figure can become a validation input, retain its original publication bytes and digest, identify the release, country, measure, month, table/page and displayed precision, and independently verify the extraction. Keep current-table checks alongside original-publication checks so revisions stay visible. Never substitute revised totals into an unrevised product denominator, scale products, or widen rounding to hide a disagreement. A matched original publication can corroborate vintage; it does not prove HS6 completeness or classification continuity. The reviewed ledger and separate corroboration implemented later are recorded below; no acceptance gate changes.

## Live total probe: recovered totals and equivalent endpoints

[Run 38103215096](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38103215096), job `114363264757`, ran manual `total-probe` on merged main commit `8dcfff4e43d520f7c01d97e08c174adce43528a9`. It passed all seven logical checks in seven attempts. The workflow's 540 tests and 141 checked files passed before secret access; source retrieval took about 34 seconds within the six-minute step, and evidence upload succeeded. PR #45 had independently passed 52 browser checks and immutable-commit review.

All six API requests returned HTTP 200 and exactly one validated national Canada import total. No HTTP retry or transport failure occurred. Each pair agrees in exact dollars, and both endpoints match this run's own official reference at its displayed $100,000 precision:

| Month | HS total (USD) | End-use total (USD) | Own reference (USD) | API minus rounded reference |
| --- | ---: | ---: | ---: | ---: |
| May 2025 | 29,977,446,512 | 29,977,446,512 | 29,977,400,000 | +46,512 |
| June 2025 | 29,645,029,011 | 29,645,029,011 | 29,645,000,000 | +29,011 |
| August 2026 | 35,980,039,950 | 35,980,039,950 | 35,980,000,000 | +39,950 |

The raw end-use rows satisfy their own `I_ENDUSE=-`, national `DET/CY`, exact calendar and `GEN_VAL_MO` contract without unsupported HS subdivision fields. End-use requests completed in 723, 454 and 396 ms; matching HS requests took 12,630, 11,566 and 9,698 ms. This run supplies a tested alternative total endpoint, but the original HS route also recovered. The cause of earlier timeouts and reliability outside these three observations remain unverified; the default audit query has not changed.

Supporting cross-run corroboration is exact: May's totals equal the original full audit's 4,243-row HS6 sum; June's totals equal the aggregate probe's 4,302-row HS6 sum; August equals the original full audit's total and 4,437-row HS6 sum. These checks do not combine separate runs into an accepted audit. The original 24-month audit retains its failed coverage verdict, all classifications remain unverified, and no country release or comparison is accepted.

The official reference was retrieved at `2026-10-11T01:52:13.783Z`, with HTTP Date `Sun, 11 Oct 2026 01:52:13 GMT` and Last-Modified `Tue, 06 Oct 2026 13:08:40 GMT`. Its original raw-record SHA-256 is `354832efad0ff16bb3601915e684e6c39e316dc304e6c461f1541fd7c8b588a6`.

Artifact `11688821449` contains eight files, including seven original source records and the diagnostic report: **35,524 ZIP bytes**, **244,320 extracted bytes**, SHA-256 `e49e17146e458662647ce0c6320fdf1ad5e4e60fe7c8b4d07467782d76c6b163`. Independent replay verifies every raw-manifest digest, exact endpoint/query/aggregation identity, attempt/event, total, rounded-reference comparison and withheld release/classification flags. Report SHA-256 is `463cd1a76785e77aaf4f0b30f6aab22f9537f70c368961c375009281424458ed`; the separate replay receipt is `82ed574801b44dafd6e5141af52476824dd47469fddb3d49a8243d9e12c209d8`. Its verifier passed four valid controls and rejected six hash-consistent mutations before use. Separate read-only review independently matched the ZIP members, raw identities, totals, reference precision, cross-run corroboration and unchanged gates. All six API rows have LAST_UPDATE="0", which provides no useful revision date.

At this checkpoint, the next source-resolution step was the retained original-publication reference protocol above. Its implementation and fresh-run findings follow below. Import-total adoption, full acceptance and country classification/release/page design remain later work. Existing coffee pointer/release hashes remain unchanged, with no R2 operation, schedule, dependency or publication.

## Fresh publication audit: verified partial evidence after step timeout

[PR #47](https://github.com/Vasuki8/us-trade-tracker/pull/47) implemented the independently reviewed [original-publication ledger](1220-original-publications.md). It verifies exact PDF bytes and digests before using the pinned January–July 2026 monthly Canada export figures as separate corroboration. Current-table agreement, its strict source-coverage gate and unverified classification stay unchanged. Reviewed commit `680a4b6143a259a0d264937dddf9ee8a1ff5a979` passed [CI 38105200222](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38105200222): 551 tests, zero diagnostics across 143 files and 52 browser checks. The fixture static build contained 19 files, 490,303 bytes total and a 212,848-byte largest file.

[Run 38105445755](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38105445755), job `114369880759`, used manual `full` on merged main `92f79e90b316c073cf4b2ccf7bed8148207cada9`. Software tests/checks and secret-access preflight passed. The source step started at `2026-10-11T02:32:47.249Z` and was terminated at `02:47:59.749Z` after its 15-minute limit; evidence upload succeeded. This is a **timed-out partial audit**, not a completed source-gate verdict. Neither `audit.json` nor `country-dataset.json` exists in its artifact.

Artifact `11689967061` contains **95 original files**: 80 API records, one official HTML reference, seven PDFs and seven PDF metadata records. Its 19,782,754-byte ZIP has SHA-256 `58de22423f5fabd86cb2bb0088e3d3999d0cdaea683713fbbe4148c68db6dc78`. Safe extraction and separate read-only review matched every member byte-for-byte, totaling **55,804,616 extracted bytes**. The separate local replay receipt is not an artifact member. There is no completed raw manifest; independently computed source checksums are bound to the verified ZIP, rather than claimed as audit-manifest verification.

| Retained API parts | Usable | No usable response |
| --- | ---: | ---: |
| Export totals | 20 | 0 |
| Export HS6 breakdowns | 20 | 0 |
| Import totals | 6 | 14 |
| Import HS6 breakdowns | 4 | 16 |
| **Total** | **50** | **30** |

All 80 retained API records have one attempt and span September 2024–April 2026. Every usable response satisfies the unchanged source/calendar/measure/subdivision contract. The 24 usable breakdowns contain **115,824 HS6 observations**. Twenty-two complete month/direction pairs have **zero residual**: all 20 export pairs and February/March 2025 imports. Eighteen retained pairs are incomplete; no complete pair has a nonzero residual.

May–August's 16 expected API parts have no retained files. That does not establish whether the requests started before termination. Null status/body in the 30 failed retained records establishes no usable response, without proving a particular per-request transport cause. No old response is used to fill a gap.

All seven retained PDFs and their metadata match the reviewed pins. Only January–April export API totals are available in this run for historical comparison: **all four match their own original publication at $100,000 precision**, and all four disagree with this run's own current HTML reference. The May–July PDFs verify as sources, but their API comparisons remain unavailable. Among the 40 retained month/direction contexts, current-table checks are **22 matched, four mismatched and 14 unavailable**. Across the full expected 48-context grid, missing totals increase unavailable checks to 22. These bases are recorded separately in the [machine-readable evidence](1220-country-audit-evidence.json). No API revision date can be inferred from `LAST_UPDATE="0"`.

The official reference was retrieved at `2026-10-11T02:32:47.601Z`, with Last-Modified `Tue, 06 Oct 2026 12:31:32 GMT` and HTTP Date `Sun, 11 Oct 2026 02:32:47 GMT`. It is retained as this run's own input. The independent partial-replay receipt has SHA-256 `04d8a0786b95aeed454f619f2163f097abd9062137704f927a96dcc2fc33e3ae`. Its verifier reproduced the valid receipt and rejected six mutations of source pins, PDF bytes, country, calendar, subdivisions or inventory. Independent review matched the ZIP, all raw identities and attempts, original PDFs, arithmetic, reference comparisons and withheld acceptance flags.

**Next recommendation:** do not repeat the unchanged full audit. Sixteen failed breakdowns remain even if an alternative total endpoint addresses all fourteen failed totals. First test failed import breakdown contexts, such as September 2024 and April 2026, against a previously received February 2025 control under the existing deadlines and concurrency limits. Any smaller-query strategy must independently preserve full coverage and duplicate-free aggregation before adoption. The full-run time limit should not be widened without a supported retrieval change.

Evidence consistency is verified, while this partial run's source coverage remains **unverified**, the earlier completed full audit remains **failed**, and classification/release/comparison eligibility remain unavailable. No candidate calculations were produced by this run. Existing accepted coffee hashes are unchanged; no country release/archive/page, R2 operation, schedule, service or deployment was introduced.

## Bounded import-prefix diagnostic

The [Census API guide](https://www.census.gov/foreign-trade/reference/guides/Guide_to_International_Trade_Datasets.pdf#page=11), printed pages 11–12, recommends splitting large requests by commodity wildcard while keeping other parameters fixed. That supports a bounded retrieval experiment rather than proving request size caused the observed failures. The retained February 2025 control has 3,874 HS6 rows, of which 291 start with `0`; a `0*` query materially reduces its expected row count.

Manual `prefix-probe` requests unchanged full import HS6 breakdowns and `I_COMMODITY=0*` subsets for September 2024 and April 2026 (failed in the latest partial audit), plus February 2025 (a previously received control). Both retain Canada `1220`, `GEN_VAL_MO`, exact YEAR/MONTH, national `DET/HSCY`, `COMM_LVL=HS6` and the full existing description/identity/subdivision contract. Only the commodity predicate changes; its appended column is removed from `get` to avoid duplication. No explicit subdivision predicates are added.

The dedicated prefix result and raw record identify `commodityPrefix="0"` and `completeCountryBreakdown=false`. Returned codes must be six digits under that prefix; crossed identities, duplicate commodities or unexpected dimensions fail closed. The client keeps zero distinct from missing, retains original safe bodies and bounded HTTP retry envelopes, and refuses unsupported scopes before requesting anything. Empty/no-response inputs remain unavailable for this diagnostic's equivalence verdict.

Its own official HTML reference runs alone, followed by three full/prefix pairs at at most two requests in flight. Seven logical requests permit at most nineteen attempts; the existing 30-second deadline and HTTP-only retries give a 304.5-second permitted schedule within a six-minute step. Original requests, byte counts, hashes and safe phase/status/error codes go to fresh ignored output. Existing directories are refused before requests; unsafe credential echoes are not retained. The CLI exits nonzero for failed/incomplete/mismatched diagnostics, and the always-run artifact preserves available evidence.

Each pair compares **the complete normalized subset**, including commodity identity, descriptions, values and special flags, independent of response ordering. It records full and subset row counts, sums and equivalence separately. A received prefix paired with an unavailable full query stays unavailable for equivalence. Its sum is never compared with the all-goods HTML total, used as an all-goods denominator, or interpreted as full coverage. The fresh reference documents retrieval context rather than supplying a subset denominator.

This implements only one-prefix diagnosis, without assembling partitions or changing full-audit retrieval. Actual source evidence still requires independent archive/hash verification and replay. Later adoption would need all non-overlapping prefixes, duplicate/coverage checks and same-run all-goods reconciliation, including 98/99 categories; this probe cannot establish that. No observations from different runs are combined. Even a passing probe leaves coverage/classification unverified, comparisons unavailable and release acceptance false.

### Live prefix probe: three subsets retrieved, one exact control match

[PR #49](https://github.com/Vasuki8/us-trade-tracker/pull/49) merged after independent review and [checks for its reviewed commit](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38108233604): 560 tests, zero diagnostics across 145 files and 52 browser cases. [Prefix probe 38108488071](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38108488071), job `114378938280`, used merged main `cef6af90a50c447eea11491301d743e9fca74785`. Software checks passed before source retrieval. Seven logical requests made seven attempts without HTTP retries; the source step finished in about 88 seconds within its six-minute limit. The diagnostic failed because two full requests remained unavailable; evidence upload succeeded.

The 324,398-byte ZIP matches GitHub's SHA-256 `131c752e165543c8bf0e2478a8c16f904c86eaf2233b7e8646bc8da49837a1a7`. Independent replay and separate read-only review verified all **eight original members** (2,078,192 extracted bytes), all seven raw-record manifest digests, exact request scopes, returned calendar/national dimensions, normalized rows, sums, digests and attempt/event identities. The report SHA-256 is `0c3a187701529e94c5956cd0d1230cec00f7a840448a316720ac132810f115e6`; the separate local replay receipt is `f687b3245f89cd38400ac4b867beae728af1069aafa2fec0d9e887db2cba8ca2`. The receipt is not an original artifact member. Four synthetic controls replayed correctly and six hash-consistent mutations were rejected; those controls are separate from the live evidence. See the [machine-readable record](1220-country-audit-evidence.json).

| Import month | Unchanged full HS6 query | `0*` subset query | Same-run subset verdict |
| --- | --- | --- | --- |
| September 2024 | Header timeout, 30,000 ms | 358 rows, $1,311,255,054; 6,858 ms | Unavailable |
| April 2026 | Header timeout, 30,000 ms | 317 rows, $1,434,820,529; 4,295 ms | Unavailable |
| February 2025 control | 3,874 rows, $34,787,423,872; 27,355 ms | 291 rows, $1,098,894,051; 6,009 ms | Equivalent |

February's full response contains exactly 291 codes starting with `0`, summing to $1,098,894,051. Its complete normalized subset and the scoped response have identical SHA-256 `8d55a0da52efb24e0815b06049d97e489df5515ac0321dc326039456656961e6`, including descriptions, values and special flags. This establishes one same-run subset match. September and April have usable scoped responses but no full response for comparison; their unavailable verdicts are not row mismatches. The 4,840 returned row observations include the overlapping February full/subset requests and are not a distinct country dataset count.

The probe's own HTML reference was retrieved `2026-10-11T03:30:11.870Z` (October 10 locally), with `Last-Modified: Tue, 06 Oct 2026 12:35:31 GMT` and `Date: Sun, 11 Oct 2026 03:30:11 GMT`. It documents this retrieval's context. No subset sum was compared with its all-goods total or used as an all-goods denominator.

**Recommendation:** test all ten non-overlapping commodity prefixes `0*`–`9*` for one failed import month, retaining every original response and requiring duplicate-free assembly and exact same-run all-goods API reconciliation, including 98/99 categories. Check the complete total against that run's own official reference separately. Successful smaller retrievals support this next bounded experiment; they do not prove request size caused the earlier failures, establish full coverage, or justify changing the entire 24-month pipeline yet. Do not repeat the unchanged full audit or fill new gaps from older runs. Existing full-query and acceptance rules stay unchanged; coverage/classification remain unverified and release/rolling comparisons unavailable. The earlier completed audit retains its failed verdict and accepted coffee hashes remain unchanged.

Design that next experiment's execution budget before implementation. Ten prefix calls plus one all-goods API total require six batches at concurrency two. With the standalone reference, unchanged request deadlines and retry rules permit a 579-second schedule, exceeding this probe's six-minute step. Any follow-up needs its own explicit step limit and processing margin; this evidence change does not alter current workflow limits.

## Bounded one-month partition diagnostic

The reviewed `partition-probe` protocol fixes September 2024 imports, whose full request remained unavailable in the latest partial audit and prefix probe. It retrieves its own official Canada HTML reference first, then all ten single-digit commodity scopes `0*`–`9*` and a separate HS all-goods total. Requests preserve Canada `1220`, exact YEAR/MONTH, `GEN_VAL_MO`, national `DET/HSCY` HS6 detail or `DET/CY` total, the full returned-dimension validator and the existing 30-second request deadline and HTTP-only retries. Eleven API requests run in six batches at concurrency two. Including the reference gives twelve logical requests and at most 34 attempts; the 579-second permitted schedule leaves 81 seconds for processing within a dedicated eleven-minute step in the existing twenty-minute job.

Assembly uses only validated results from that invocation's fixed request set. It requires exactly ten distinct, matching prefix identities, explicitly partial inputs, unique in-prefix six-digit codes, known nonnegative safe integer values and consistent special-category flags. It sorts by code and retains all returned 98/99 rows in the sum without requiring particular statistical codes to exist. A reported zero is valid. For this conservative experiment, an empty/204 scope or missing value makes assembly unavailable; that rule does not assert every country/month necessarily has rows under every prefix. An unsafe aggregate sum also remains unavailable.

The report distinguishes assembly from reconciliation. Missing or invalid inputs never produce a partial country sum. A valid assembled sum differing from the independently retrieved same-run total is a mismatch; unavailable totals leave reconciliation unavailable. The total is compared separately with the run's own official reference at $100,000 display precision. Overall success requires usable inputs, exact API equality and reference agreement. Even success keeps 24-month `sourceCoverage` and classification unverified, rolling comparisons unavailable and release acceptance false.

All bounded requests finish despite an individual failure; assembly failure becomes an unavailable report outcome. The fresh ignored artifact contains up to twelve original safe records and `partition-probe.json`, with request identities, byte counts, hashes, per-prefix counts/sums/normalized hashes, aggregate count/sum/hash, special rows, exact residual, reference metadata and safe transport events. Originals preserve explicit prefix scopes; no prior files or runs can fill a gap. Source failure returns nonzero status while the always-run artifact retains evidence. This experiment does not change full-audit queries or establish a 24-month partition strategy; live originals still require independent replay and review.
