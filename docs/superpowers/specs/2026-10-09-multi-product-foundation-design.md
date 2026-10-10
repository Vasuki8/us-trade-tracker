# Multi-product release foundation

Prepared October 9, 2026. The conversational design was accepted with “continue development.” The written specification was approved with “approved what is recommended.” The implementation plan and recommended native execution were accepted with “continue.”

## Purpose and scope

Make the verified product profile and data pipeline safe to reuse for a small, reviewed set of products. Each product must have its own accepted release, source records, revision history and private backup. A refresh or recovery for one product must never replace another product's data.

This supports the approved launch brief's product profiles and pipeline validation. The immediate deliverable is the foundation, initially retaining coffee (HS 090121) as the sole real product. A second verified product and product discovery follow separately. This milestone does not select a commercial pilot sector, retrieve a broad catalog, add cross-product rankings, or change the coffee research calculations.

Pages and chart data remain on the same static host. CSV and PNG downloads remain browser-generated. R2 remains private backup storage. Existing build measurements and the 15,000-file planning warning continue. No additional services, accounts, paid dependencies, public deployment or recurring processing are included.

## Existing behavior and gaps

The baseline is main commit `71874bdb48722d9f9727bef62d556aff9436f4a7`, which includes the accepted monthly selected-country comparison.

- `prepareRelease` already accepts an HS6 code, but `import-product.ts` always writes to `data/processed`. A previous release is loaded without checking it belongs to the requested product.
- `load-release.ts` reads one release. Product page generation therefore produces one profile.
- Archive manifests, pointers, key parsing and source replay assume HS 090121. Transient archive state has no explicit product identity when its baseline is absent.
- The manual import workflow and its artifact names assume coffee. Classification evidence is retained separately for coffee.
- Homepage, Monthly changes, briefing and methods are coffee entry points. The profile calculations and browser payload already carry a product code.

These are code observations, not evidence that a second real product has adequate merchandise, duty or classification coverage.

## Selected approach

Use one shared implementation, a small reviewed product registry, and separate storage for each product. Preserve coffee's existing storage as a compatibility exception rather than migrating its retained data.

Duplicating the coffee pipeline for every product would multiply maintenance and allow validation rules to diverge. Importing a broad catalog would create a larger data-validation and delivery task before there is evidence of demand. Neither alternative is included.

## Reviewed product registry

A server-side registry supplies the six-digit code, a human-readable display name, import availability, publication availability and whether estimated duties have been accepted for that product. It contains coffee initially. Import and publication availability are distinct: a future product can be reviewed for an audit/import without appearing on the site before its evidence is accepted.

Registry validation rejects duplicate codes, malformed codes, empty names and a published product that is not importable. A product's official description continues to come from its validated release; the display name does not replace it or establish classification continuity.

Generated paths are derived from the code by shared helpers. Registry entries and workflow inputs cannot supply arbitrary local paths or R2 prefixes. Classification evidence retains the existing `data/classification/<code>.json` convention and is clipped to the requested reporting month. Unverified periods retain the existing unavailable-comparison behavior.

The production registry does not include a second real product in this milestone. An explicit fixture registry may contain two synthetic products solely for development acceptance. Fixture values and provenance must remain visibly labeled, and fixture configuration must never silently replace missing production data.

## Product storage and identity

| Storage | Coffee, HS 090121 | Other reviewed products |
| --- | --- | --- |
| Generated data root | `data` | `data/products/<code>` |
| Prepared releases and pointer | `data/processed` | `data/products/<code>/processed` |
| Original request records | `data/raw/<release-id>` | `data/products/<code>/raw/<release-id>` |
| Import lock | `data/processed/.import.lock` | `data/products/<code>/processed/.import.lock` |
| Private archive prefix | `trade/v1/products/090121/` | `trade/v1/products/<code>/` |

New generated product directories are ignored by Git. Registry and classification evidence remain tracked. Existing coffee files, current pointer, archive objects and checksums are not rewritten or relocated during this milestone.

Production callers supply the expected product identity when reading a current release. Before a refresh retrieves source data or calculates revisions, it checks that the baseline belongs to the requested product. A mismatch fails without changing the accepted pointer. Revisions compare only releases of the same product, with the existing separate merchandise and duty revision rules.

Atomic local promotion, import locking, incomplete-data rejection, source provenance and credential removal retain their current behavior. A product that already has a duty-enabled accepted release cannot be refreshed into a release without duties.

## Private archives and recovery

Archive validation derives the selected namespace from a validated product code. It binds that identity to the pointer, reference key, manifest, prepared release, previous reference and replayed merchandise/duty queries. A valid checksum is insufficient when any of those identities disagree.

Existing archive bundle versions 1 and 2 retain their fields and meanings: version 1 contains the merchandise history; version 2 additionally contains the duty history and scope. The existing product fields carry the selected HS6 code. The pointer retains its current fields. Coffee's existing archive bytes and key prefix remain valid. This extends product values without changing the bundle envelope or converting an old archive.

New transient run and candidate files use state version 2 and explicitly record the selected product. Their validators require the run, candidate, baseline and reference to agree. Existing version 1 transient state is interpreted only as coffee; it cannot be used for a different product. Explicit identity is required even when initialization has no baseline.

The archive store is bound to the selected product namespace and rejects requests for another product or unrelated objects. Conditional pointer writes, immutable bundle writes, successful backup receipts, readback verification and conflict/unknown-outcome handling retain their current protections. Initialization applies only to the selected product's missing pointer.

Local release validation and remote archive acceptance remain distinct. A successfully prepared release can be the current local candidate in the workflow's isolated working directory before backup succeeds. It becomes the accepted remote archive only after the existing backup, recovery and conditional-promotion checks. A local candidate or uploaded bundle alone is not evidence of remote acceptance.

Replay continues to validate the complete existing archive grid: 60 merchandise months for imports and exports, plus 24 duty months when present. Request parameters must reference the selected product. Coverage and aggregation checks are not relaxed to admit a second product.

Offline recovery takes an expected product identity and verifies it before writing generated files. Recovery still requires an empty generated-data destination; it does not merge into or overwrite an existing product tree. Recovery into an isolated empty directory remains the way to inspect a legacy coffee archive when other generated data already exists locally. Recovery does not advance any existing local or remote pointer.

## Manual workflow and command behavior

The existing GitHub import workflow gains a product-code input with coffee as the default. Preflight resolves a reviewed importable product and its storage locations before creating a Census or R2 client. Unknown and malformed codes fail early. User input is passed through quoted arguments and validated registry resolution rather than inserted into shell source or object paths.

The selected product determines import, release validation, archive restore/stage/promotion and artifact scope. Candidate and promotion artifact names include the product code; retained artifacts contain only the selected product's generated files. The workflow keeps its existing main-branch requirement for remote archive writes and explicit initialization requirement.

Archive command entry points accept a selected product, defaulting to coffee for existing operator commands. Expected identity is passed through every operation, including offline packing and verification. An explicit product selection must agree with persisted state; CLI defaults do not reinterpret a different product's state as coffee.

The workflow remains manually dispatched, globally serialized and limited to the existing two fetch workers. Independent storage does not require concurrent API jobs. Existing Census and R2 secrets are reused through their current GitHub configuration; no secret is requested in chat or added to tracked files.

Estimated-duty import remains explicit. Registering a product does not establish duty acceptance: future publication of duties requires that product's audit and evidence. Duty-enabled releases may be prepared for that audit, but a build rejects a duty-enabled published release whose product has no accepted duty evidence. It does not silently strip duty observations. A merchandise-only release remains valid and displays the existing unavailable-duty presentation. Coffee's accepted duty feature continues unchanged.

## Static profiles and existing entry points

Normal builds load every registry product marked for publication, checking the expected code, Census provenance and accepted feature availability. Each becomes `/products/<code>/` through the existing profile component. Missing or invalid data for a published product fails the build clearly; builds do not silently substitute coffee, show synthetic values or omit a required product.

Per-product builds preserve official descriptions, reporting month, retrieval time, source, classification qualifications and processing version. Shared links and CSV/PNG names use the displayed product's code. A profile's monthly and rolling periods, country selection, duty denominators and ranking behavior keep their current definitions.

Coffee remains the default product for the homepage, `/changes/`, `/briefing/` and `/methods/` in this milestone. Their content and links remain explicitly coffee-focused. They do not claim to summarize the entire registry. A product directory, search and additional product-specific entry points are later deliverables.

Fixture mode may exercise two profiles from a separate trusted fixture registry and fixture releases. Both must identify synthetic development data. Normal Census mode must never consult that fixture registry as a fallback.

## Failure behavior

- An unsupported product is rejected before source retrieval or archive access.
- A wrong-product baseline, pointer, reference, run, candidate, source query or recovered release is rejected before acceptance; recovery rejects identity mismatches before writing generated files.
- Failed retrieval or release validation leaves the selected local current pointer unchanged. Failed backup or archive verification leaves accepted remote pointers unchanged. Offline recovery never overwrites an existing pointer. None of these operations changes another product's local or remote pointer.
- A stale conditional promotion reports the existing conflict result and cannot advance the selected pointer. Another product's pointer is never targeted.
- Classification uncertainty, missing/suppressed values and duty-reporting qualifications retain their existing unavailable or qualified presentation.
- A required published release that is missing or invalid makes the static build fail with the product code identified.

## Acceptance evidence

Implementation acceptance must demonstrate the following, using independent products rather than two aliases of the same release:

1. Registry/path validation rejects unknown, duplicate and malformed identities while preserving coffee's existing paths and private keys.
2. Successful synthetic imports for two product codes retain distinct current pointers, raw request scopes and revision histories. Revising or failing one import leaves the other's pointer and prepared bytes unchanged.
3. A wrong-product local baseline is rejected before source requests begin. Locking and failed-worker cleanup continue to protect the selected product.
4. Archive initialization, staging, backup validation and conditional promotion use distinct product namespaces. Cross-product previous references, pointers, run/candidate states, manifests and raw queries are rejected, including initialization with no baseline.
5. Existing coffee bundle versions 1 and 2 recover their original source and prepared bytes without a Census connection. A second synthetic product's archive also recovers offline into an empty destination. A wrong expected product writes no generated files.
6. A fixture static build renders both product routes with the correct names, codes, source labels, downloads and shared links. Production loading rejects fixture provenance and a missing or wrong-product published release.
7. Existing coffee browser acceptance remains valid, including monthly/annual country comparisons, direction switching, duty CSV, chart CSV/PNG, keyboard use and mobile layout. Focused second-product checks verify the same component uses that product's identity and data.
8. The retained-Census coffee build reproduces accepted research values and records file count, total size and largest file. The canonical coffee release hash and pointer are checked before and after acceptance. Existing immutable archives are not rewritten for compatibility testing.
9. Independent subagent review examines an immutable implementation commit, emphasizing product isolation and legacy recovery. GitHub checks must pass for the reviewed head before merge under the user's standing authorization.

Synthetic checks establish isolation and implementation behavior. They do not establish real coverage for a second product. No second product is described as verified or published without its own later evidence.

## Next steps and review status

The conversational design and this written specification are approved. Prepare a focused implementation plan and present its execution method. Implement the foundation only after that plan is accepted. Selection and audit of one more real product, product discovery, public launch and verification across two successive official releases remain separate work.
