# Canada country release-acceptance design

Prepared October 12, 2026 against repository `cdde216cc01eb779f85f0b136277efece33dbd32`. **Proposal for owner review.** The owner authorized preparation of this design. Written-design approval permits implementation planning; implementation, accepting a real candidate, deployment and R2 operations remain separate decisions.

## Objective and recommended approach

Define when the verified Canada collection can become a reproducible country research release, without changing its observations or converting the historical strict-audit failures into passes. Acceptance must identify the exact data, evidence, policy and processing versions. A reader must be able to tell which reporting period and source collection produced the figures.

Recommend an **immutable country snapshot release** under a new acceptance policy, `canada-country-release-v1`, whose first scope is September 2024–August 2026. Its source-assessment policy remains `canada-archive-snapshot-v1`. Acceptance is a new decision about a qualified collection; it does not edit the old assessment or claim agreement with current revised headlines.

| Approach | Benefit | Material limitation | Recommendation |
| --- | --- | --- | --- |
| Accept the fixed captured collection with explicit qualifications | Uses the verified same-archive values, classification review and original sources; reproducible | A bounded historical snapshot, with recorded reference differences and unknown observation revision dates | Select for the first country release |
| Require every archived month to match the current headline table | A simple headline test | The retained collection fails that test; further retrieval may still mix publication maturity and needs a new source investigation | Retain as a distinct possible future policy |
| Use current headline totals with archived product values | Could display more current headline figures | Changes product-share denominators; does not establish monthly products from the same revision basis | Reject for this release |

The first implementation plan should cover the offline candidate package, eligibility validator, recovery check and tested local acceptance mechanism. It should leave the ordinary website, actual accepted pointer and remote storage unchanged until their relevant activation decisions. A public country profile and country archive activation are later milestones.

## Evidence and source qualifications

The completed [audit handoff](../../data-validation/1220-audit-handoff.md), [classification review](../../data-validation/1220-classification-continuity.md) and [local prototype validation](../../validation/canada-profile-prototype.md) establish the starting collection. It has 48 direction/month contexts and 223,049 reconciled HS6 rows; 17 ordinary selected candidates qualify for comparisons, and three statistical candidates retain observed totals with unsupported comparisons unavailable.

Both saved current-reference snapshots retain 41 matches and seven mismatches. January–July 2026 exports retain seven original-publication matches; the other 41 original-publication checks remain unreviewed. These are historical outcomes, not a promise about a fresh reference request.

Census documents monthly and annual revisions, with some Canadian corrections applied to detail only at annual revision. This supports treating saved publications and detailed files as distinct evidence; it does not prove the revision date or cause of each retained difference. [Census revision procedure, section 19](https://www.census.gov/foreign-trade/guide/sec2.html).

Imports use general-import customs values. Exports include domestic and foreign goods. Canadian export statistics use the U.S.–Canada data exchange and reported adjustments; retain the published values, without adding a freight or exchange-rate adjustment ourselves. [Census trade definitions](https://www.census.gov/foreign-trade/reference/definitions/index.html), [Canada valuation and data exchange, sections 2 and 6](https://www.census.gov/foreign-trade/guide/sec2.html).

The release must describe itself as a **captured monthly Census merchandise collection**. It must state that capture timestamps identify saved files, not observation revision dates; the collection is not a uniform revision vintage or latest-revised headline history. Exact internal reconciliation supports arithmetic consistency, not independent shipment-level accuracy. The raw verification basis remains `previous-reviewed-replay`.

## Fixed first-release contract

| Dimension | Required value |
| --- | --- |
| Geography | Canada, Census code `1220`; U.S. national merchandise trade, all transport |
| Reporting grid | September 2024–August 2026, exactly 24 months in each direction |
| Imports | `GEN_VAL_MO`, general imports, reported customs value |
| Exports | `ALL_VAL_MO`, domestic plus foreign exports, reported FAS basis with the Canada data-exchange qualification |
| Units | Nominal integer USD, not seasonally adjusted |
| Current/prior periods | September 2025–August 2026 / September 2024–August 2025 |
| Research content | All-goods monthly totals plus the fixed ten selected HS6 categories in each direction |
| Classification | The reviewed direction-specific six-digit scope through August 2026 |
| Source and acceptance policies | `canada-archive-snapshot-v1` / `canada-country-release-v1` |

The fixed candidate keys/order come from `canadaSnapshotContract`. They are a selected subset, not a complete product catalog or a claim of exhaustive top-ten ranking across every HS6. Rank the selected categories by their current-period observed value as the prototype does.

Keep imports `980100` and exports `988000`/`880000` in the selected list and all-goods totals. Their ordinary-product shares, growth, dollar changes and share-point changes remain unavailable. Null values never become zero. Ordinary product shares use the corresponding all-goods archive total; period shares use matching sums. Unsupported comparisons must be unavailable in both tables and CSVs.

An additional month, direction, country, candidate or classification interval is outside version 1. It requires a new scoped policy and evidence decision. Successful preparation must not silently extend the window, replace a source pin or treat a new collection as a routine refresh.

## Acceptance gates

Every gate must pass for **eligibility**. The report identifies the candidate digest and distinguishes a failed gate from a permitted, explicitly recorded source qualification.

1. **Authenticated inputs:** require the exact assessment and ledger identities below, the source-assessment processing commit `9c385fb94b2a36b1d07ddf9e01670c366839a83b`, and authenticated historical review/replay evidence. Reject a missing, changed, oversized or crossed input; allow no CLI digest or source override and no fixture fallback.
2. **Source coverage and arithmetic:** require the completed/passed offline assessment, exact 48 unique contexts, expected measures, safe integer amounts and zero residuals. Bind originals and normalized-file identities to their reviewed contexts through the saved replay evidence. Carry forward the 223,049-row count. This gate authenticates prior verification; it performs no new ZIP replay.
3. **Classification and comparison scope:** require the corrected ledger, all 17 compatible ordinary entries within the fixed interval, the reviewed semantic conclusions and the disposition of the citation correction. Preserve the three statistical exclusions and capture-era metadata. An unreviewed or incompatible ordinary selected candidate blocks this version's eligibility.
4. **References and bounded qualifications:** authenticate the complete saved before/after grids and seven original-publication records. Require the recorded seven export mismatch contexts, their exact values and source identities; require no additional mismatch, unavailable context or conflicting reviewed publication. Preserve the existing rounding quantum of USD 100,000 for publication checks and retain signed differences separately. The other 41 publication checks remain `not-reviewed`; they do not become matches. This is a fixed, evidence-backed exception set, not a general mismatch waiver.
5. **Research projection agreement:** independently compare all 48 monthly totals, 20 selected summaries/order, periods, numerators, denominators and reference outcomes with the pinned assessment. Verify all-goods period sums and growth, the 17 qualified comparison results and the three exclusions. Verify the four browser CSVs against the same displayed data and provenance. Reuse the completed calculation evidence; do not re-run the original classification research or source decompression merely to repackage unchanged data.
6. **Portable recovery:** verify a fresh-directory recovery of the complete candidate package and its derived research data, with the original `.tmp`, `.superpowers` and `data/backups` paths unavailable. Recovery must reproduce authenticated evidence bytes and the same display/CSV values. A missing external scratch file cannot be an implicit recovery prerequisite.
7. **Preservation and review:** require passing relevant tests, type checks, normal-build exclusion, independent implementation review and a recorded comparison against the existing prototype. All original assessment availability flags, historical failures/evidence, source bodies and four accepted coffee files remain unchanged. The candidate introduces no current country pointer, publication flag or R2 operation by itself.

The gate report should use distinct names such as `assessmentAuthenticated`, `replayEvidenceAuthenticated`, `classificationScopeQualified`, `referenceQualificationsRecorded`, `projectionVerified`, `recoveryVerified` and `preservationVerified`. It must also report the historical strict-audit verdicts unchanged. Do not reuse `sourceCoverage: passed` as shorthand for the old failed strict audit.

## Candidate package and trusted evidence

Country releases have their own schema and namespace. Do not encode Canada as an HS6 product or broaden the product `Release`/archive validators. Those validators currently require product-specific observations and 60-month request grids; the country collection has a different source and evidence contract.

Use an immutable private candidate package containing a strict manifest and the original UTF-8 bytes of an allowlisted set of JSON files. Follow the existing canonical base64, byte-length and SHA-256 conventions, with a separate country codec. The manifest records schema version, country, release ID, fixed scope/measures, capture interval, source/acceptance policy IDs, source-assessment and packaging commits, preparation time, and each packaged file's logical name, byte length and digest. Preparation time is never a source capture or observation revision time.

The research payload is the authenticated assessment and its bounded projection, not all 223,049 source rows. Package the original assessment, corrected classification ledger, four source-collection anchor/replay records, independent classification receipt, citation-correction receipt, independent qualified-calculation receipt and the committed continuity evidence record. This ten-file evidence set preserves the earlier review's `with fixes` verdict together with its implemented correction; it does not rename that historical verdict. The implementation's fixed identity table must bind these exact files from the existing contracts/evidence, not accept hashes supplied by the candidate itself.

Add one generated `research-data.json` member: the bounded projection from the authenticated assessment, serialized with a trailing newline. It must match the already verified 33,715-byte prototype projection and preserve its source/assessment qualifications. The package therefore has **exactly eleven members**, ten original evidence files plus one derived data file. Its historical availability fields describe the source assessment; the separate acceptance/publication records determine later availability. Recovery must authenticate all evidence, regenerate this projection with the identified adapter and compare its bytes before returning it.

| Core input | Bytes | SHA-256 |
| --- | ---:| --- |
| Assessment JSON | 858,857 | `2cad0dcabf353b8aec0d365bb247e5d976712a7a1ebc90cac26694322503d9f8` |
| Corrected classification ledger | 487,985 | `afde19b1384c0cbab8cb2f7bbbc5ed8253bc636bb7a35c6b8d5d3c599a1010fd` |
| Independent inventory replay receipt | 228,778 | `0279468121f2164f007b0338f0ff5cd9babc49c67e16cf31cfbd6e28c3d20927` |
| Independent classification receipt | 81,421 | `5e4232f871674d07d902998b743335f0331fd0224d970295fd0d23168aab3e7a` |
| Citation-correction receipt | 36,634 | `40b245d0ab0e12c9875b8fed2178b76b75af5c01955de1f944a3fcc94f1739ca` |
| Independent calculation receipt | 57,268 | `62864ebf3c55e0b01fe1e6114e3413c0674effa1fad19a0842103c1d9859c547` |
| Committed continuity evidence | 150,904 | `12bfab9a0638a24c4cfd399d3235064ad0e28a8037670c244a2ee7d3ecf9492d` |

The other three anchor identities are the pinned bulk report, original manifest and offline replay in `canadaSnapshotContract`. Full current file locations and review bindings are in [continuity evidence](../../data-validation/1220-classification-continuity-evidence.json) and [snapshot evidence](../../data-validation/1220-archive-snapshot-evidence.json). Bind these file bodies before packing; do not follow historical filesystem paths inside them during recovery.

Use fixed logical file names, with no arbitrary member paths, URLs-to-fetch or recursive source discovery. Reject duplicates, extra members, path traversal, symlinks/reparse ancestors, malformed UTF-8, noncanonical base64, hash/length mismatch, unsafe numbers and unsupported schemas. Bound reads before allocating/decoding. Initial limits: 16 KiB pointers, 64 KiB manifest, 1 MiB per member, 6 MiB combined decoded data and 8 MiB serialized package. The ten measured evidence files total 2,185,033 bytes; the existing projection adds 33,715 bytes. Implementation must measure actual serialized output and fail if limits are crossed.

Raw trade ZIPs, normalized row arrays and the 248 original classification sources remain in their existing private retained collection. This compact package preserves reviewed evidence and the derived research release; it is not a replacement raw-source archive and cannot support a claim of fresh source re-verification after restoration. The later storage/publication decision must address preservation of that separate source collection.

## Lifecycle, authorization and local selection

| State | Meaning | Effect on availability |
| --- | --- | --- |
| Prepared candidate | Immutable package exists, with its measured digest | None |
| Eligible candidate | All acceptance gates pass for that exact package | None; still a candidate |
| Accepted local release | The owner approves the specific package and an authorized selection operation confirms the local pointer | Local accepted-release consumers may read it; public website unchanged |
| Published country profile | Separately approved publication gate and deployment select the accepted release | Country route/navigation can become public |

The first implementation creates candidate and validation outputs in a fresh ignored directory and tests the selection mechanism with isolated temporary state. It must not select the real retained collection automatically after a successful validator, CI run or PR merge. A proposal, owner approval of this design, implementation approval, a copied candidate, or the presence of a backup are each insufficient proof that a real candidate has been accepted.

For a later explicitly authorized local acceptance, require the candidate SHA-256, a complete validation/recovery receipt bound to it, the approved policy/version, independent review disposition and the exact expected prior pointer digest (or explicit initialization when absent). Record owner approval for that exact candidate and scope. Historical immutable assessment flags remain false; the new country selection record owns the new acceptance state. Do not mutate the assessment to fit an acceptance schema.

Use `data/countries/1220/processed/` for future local state, with immutable release directories and a bounded `current.json` pointing to both the candidate package and an approval/validation record by relative path, length and hash. Validate the complete set before selecting. Use exclusive staging writes, reject occupied destinations and validate containment/reparse behavior. An approval record left unreferenced after a failed selection means approved candidate, not a confirmed current release.

Serialize cooperating local writers with an exclusive lock, re-read and compare the expected current pointer while holding that lock, then replace the pointer atomically from a temporary file on the same filesystem. Reject a competing baseline or regression; this policy permits only its fixed reporting scope. Retrying an already selected identical package is idempotent. Do not retry a conflict against a new baseline. The local lock does not claim protection against arbitrary external filesystem writers.

On interrupted or uncertain selection, inspect the validated pointer: an exact candidate/reference match confirms selection; a confirmed unchanged baseline means no selection; different or unreadable state is conflict/unconfirmed. Do not report rollback without evidence. A pointer write confirmed successful followed by a receipt-write failure must report the established selection plus failed receipt persistence. Leave staging/unreferenced candidates for deliberate recovery; add no automatic deletion.

Restore a candidate into a fresh directory as a candidate. Restoring accepted local state additionally requires the recorded accepted identity/selection evidence and explicit recovery authorization; never designate the newest discovered package as current. Keep separate approval/selection evidence with independent backup copies. The first offline implementation tests these behaviors without touching the actual country pointer or storage service.

## Consumer and publication boundary

Future accepted-country loading must validate the selected country package, policy/scope, approval/validation record and pointer identities before projecting browser data. There is no fallback to an unaccepted candidate, product release or synthetic fixture. Fixtures have explicit synthetic provenance and cannot produce a real accepted pointer.

Keep the existing opt-in `/preview/countries/1220/` and its fixed input unchanged during the first implementation milestone. A future `/countries/1220/` route and country navigation require their own publication implementation and activation approval. They must show the reporting window, captured-collection qualification, reference results and same-archive denominator definition, and consume only the bounded projection. Full assessments, receipts, local paths, raw bodies, credentials and candidate/member metadata stay server-side.

Reuse formatting/calculation/download conventions where the contracts match. An accepted-country adapter must preserve the already verified 48 monthly values, 20 selected summaries and four CSVs; it must not render an accepted release through an unchanged component that claims `No accepted country release`. Classification scope and comparison availability remain direction/category-specific, with statistical and unsupported fields unavailable in both the page and CSV.

Acceptance does not extend the local prototype's schema or globally flip `releaseAccepted`, `rollingComparisonsAvailable` or `defaultAuditRetrievalChanged` in historical evidence. Public availability belongs to the new publication configuration and its validated accepted release. No five-year selector, additional country/product, duty estimate, broader ranking, saved-view or PNG feature is included.

## Storage and operational gates

Pages/chart data stay on the same static host and CSV downloads remain browser-generated. R2 remains private backup storage. Measure file count, total bytes and largest file for every implemented build, retaining the 15,000-file planning alert. No public R2 delivery system is needed for this release design.

The product R2 archive currently has product-specific keys, request counts and validation. Do not place country packages in those keys or call product promotion with a fake product code. A country archive activation needs a separate scoped namespace, conditional-pointer/concurrency behavior, durable backup and exact recovery evidence. This design defines the data/acceptance contract that such an archive must preserve; it does not authorize its implementation or operation.

Before public activation, require durable retention and independent recovery of the selected package, approval/selection evidence and a defined preservation arrangement for the original private sources. A temporary CI artifact alone is not the long-term backup. Keep activation blocked until the owner selects and validates that arrangement through a separate storage milestone. This avoids claiming public readiness from an offline local acceptance test.

No new account, paid service, permissions, secrets, source downloads, scheduled refreshes or deployment are part of this design. Existing coffee imports, archive workflows and release consumers remain unchanged.

## Verification and deliverables for implementation planning

Plan one offline milestone: fixed country policy/schema; bounded evidence packer/validator; safe local state/restore logic; synthetic failure tests; one real candidate preparation, independent projection/recovery comparison and review. Deliver the package identity, gate report, recovery receipt, measured footprint and clear operator instructions before requesting any real acceptance operation.

Meaningful checks must cover:

- Missing/changed/crossed evidence, wrong source/processing/ledger identity, additional mismatches, conflicting publication evidence and any attempt to extend the scope or allow an unqualified candidate.
- Preserved 41/7 reference counts for each saved grid, seven reviewed publication matches, 41 unreviewed publication checks, 17 qualified ordinary categories and three statistical exclusions.
- All monthly and period values, null/zero distinctions, same-archive denominators, percent versus percentage-point units, display/CSV agreement and source/capture/verification labels.
- Corrupt/oversized/duplicate/extra/traversal/link-bearing package members, changed inputs during read and incomplete writes, with bounded safe diagnostics.
- Synthetic data never entering real accepted state; eligibility/review/PR merge never automatically selecting a release; initialization requiring explicit intent; stale baseline, interrupted write, idempotent retry, uncertain readback and failed selection-receipt persistence.
- Fresh-directory recovery without access to the original scratch locations; failed recovery leaves candidate/unaccepted state and never advances the current pointer.
- Byte/hash preservation of the original evidence, assessment flags and coffee files; normal builds still omit country preview observations unless explicitly opted in; current profile behavior and downloads remain verified.

No new tests or runtime changes are required merely to approve this document. The implementation plan must identify the exact fixed evidence members/identities and interfaces, and keep the real acceptance operation, remote archive and publication gates explicit.

## Owner decisions and handoff

The requested written-design decision is whether to adopt this versioned captured-snapshot acceptance policy and prepare the offline implementation plan. Approval does not select a candidate or publish a country profile. The plan will receive its own review before implementation begins.

After the offline candidate is verified, a later candidate-specific decision can authorize local acceptance. Remote storage activation and public publication remain separately designed/verified operations. Longer history, a different collection or broader country coverage require their own evidence scope; the old strict source audit remains failed under its original policy throughout.
