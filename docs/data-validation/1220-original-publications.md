# Canada original-publication references

Reviewed October 10, 2026 (sources retrieved October 11 UTC). This is an audit reference ledger, not a country release or an approval of classification continuity.

The original FT900 PDFs were retained, hashed, extracted and visually checked by the implementer and a separate read-only reviewer. All seven figures below are **monthly** U.S. goods exports to Canada, domestic and foreign, on an FAS basis, not seasonally adjusted, in nominal U.S. dollars. They come from **supplemental Exhibit 4**, printed page `- 5 -`; the physical PDF pages below distinguish it from the main release's exhibits. The displayed quantum is $100,000 (USD millions with one decimal).

| Reporting month | Cover release date | Physical PDF page | Monthly exports (USD million) | Original PDF bytes | Original PDF SHA-256 |
| --- | --- | ---: | ---: | ---: | --- |
| January 2026 | March 12, 2026 | 56 | 24,510.3 | 1,719,702 | `3c18b43ee3e6e91a9a90dc159ef44f33972745ea38b892ebbc77823b1bf418d9` |
| February 2026 | April 2, 2026 | 55 | 28,371.3 | 1,741,412 | `96c04f834b91c12887264c81590e5bc614f4d6f6b6b2d3bcd9345365de79a2d0` |
| March 2026 | May 5, 2026 | 54 | 31,438.9 | 1,745,935 | `9f71de167044d2d4c5d3d81271a5311173be1e67c9eda4c52779b2bf8de22b72` |
| April 2026 | June 9, 2026 | 55 | 29,741.1 | 1,754,536 | `11947b2eed8dc87414cfc2ec89b73d7f01282a1d10c70452684b9736ee284b87` |
| May 2026 | July 7, 2026 | 53 | 29,790.8 | 1,798,284 | `9ab9737e0c84a679dec653de9ca1223de3004e0d0d074ef3a2dec33cb63c70ec` |
| June 2026 | August 4, 2026 | 53 | 30,695.5 | 1,817,223 | `a67052e2f6f97dcd8a4fb46530464dc093eea26251b9ca153f658a09957e7eef` |
| July 2026 | September 3, 2026 | 54 | 29,338.6 | 1,826,911 | `c122b8ccee947c58859597a7549bb5dcb6691add3e405180ab915d43f6c43aa0` |

Primary sources: [January](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2601.pdf), [February](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2602.pdf), [March](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2603.pdf), [April](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2604.pdf), [May](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2605.pdf), [June](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2606.pdf), [July](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2607.pdf). Their initial safe HTTP capture records include status, retrieval, Last-Modified, HTTP Date, exact bytes and digest. Every response returned HTTP 200 with PDF content type. The cover date is publication evidence; HTTP dates alone do not establish a data revision.

## Protocol and limits

The full audit retrieves these seven fixed public URLs without an API credential, in at most two concurrent requests, with a 30-second deadline, no redirects and a 4 MiB retained-body limit. Each source produces `raw/ft900-YYYY-MM.json` with the reviewed extraction, HTTP metadata, observed digest/bytes and verification result. A complete credential-safe body is retained unchanged as `raw/ft900-YYYY-MM.pdf`, even when its format or hash is incompatible. Failed/oversized/credential-echoed bodies remain unavailable and are not persisted; safe diagnostics survive.

The executable ledger in `scripts/country-publications.ts` binds a figure to the exact source file, country `1220`, exports `ALL_VAL_MO`, cover date, supplemental table, physical/printed page, monthly column, valuation, adjustment basis and precision. A figure is usable only after successful PDF status/content-type/magic checks and exact byte-length/SHA-256 agreement. A changed source requires a new independent page review before changing the ledger; it cannot pass using the old extraction. This avoids adding a general PDF parser to the application runtime.

Every month retains the existing `referenceUsd` and `referenceCheck` for its own current Canada HTML table. Separate `publicationReferenceUsd` and `publicationCheck` say `matched`, `mismatch`, `unavailable`, or `not-reviewed`; `referenceCorroboration` distinguishes `current-table`, `original-publication-only`, and `none`. Imports and unreviewed export months never borrow a publication value. Both comparisons use the same $100,000 display rounding, without rescaling API values or relaxing exact HS6 reconciliation.

**Existing `sourceCoverage` and the failure exit remain unchanged**: historical agreement cannot override a current-table mismatch, API failure or nonzero residual. Classification is still `unverified`, every candidate comparison stays unavailable, and no accepted pointer, R2 write or page is produced. Publication agreement corroborates an aggregate amount at displayed precision; it does not prove the revision date of an API observation or the completeness/continuity of its detailed products.

The June release's physical page 7 documents replacing Canada's current-month estimate in the next month's news-release exhibits. Its physical page 35 marks May exports revised to $30,399 million, at whole-million precision. That supports a publication-vintage explanation for May's original $29,790.8 million versus the later table. It does not assign vintages to API rows with `LAST_UPDATE="0"`. The `Canada**` marker concerns free-trade-agreement inclusion, not estimate status.

A fresh full audit is needed to observe all 48 total/breakdown pairs together. Prior diagnostic observations remain separate and do not form an accepted dataset. A later country-release design must explicitly settle how the public product explains differing publication and API vintages.
