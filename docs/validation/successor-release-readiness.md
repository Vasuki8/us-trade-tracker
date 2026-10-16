# Successor release readiness verification

Verified locally October 15, 2026. This tooling-only batch stages explicitly committed coffee selections and preserves the state required for later exact-candidate review. It performs no official import, remote archive operation, accepted-data replacement or publication.

## Committed selection and historical readback

`deployment/site-product-selection.json` binds the two published coffee products, in registry order, to their exact existing August 2026 pointers and duty-enabled releases. Its four identities were copied from authenticated prior acceptance evidence and independently compared with the canonical files. New creation reads the selection from the requested Git commit's blobs, never from mutable working files or a data-root replacement. The strict parser rejects unknown fields/products, invalid months, crossed paths, invalid hashes/sizes and mismatched filename months.

Staging authenticates the selected bytes, pointer target and Census/schema-v2/product/month metadata. Synthetic September/September and September/August fixtures pass alongside Canada's fixed September 2024–August 2026 snapshot. Invalid provenance, metadata, schema, pointers and changed originals/staged files fail without a success receipt. These fixtures establish software behavior, not actual September availability or acceptance.

Verification of a historical source commit without a selection retains the original exact August protected-file rules. Fresh creation without the contract fails. Malformed new contracts never enter legacy mode. A controlled old-source receipt verifies and rejects successor/mutated pins; this is a legacy compatibility fixture rather than recovery of a removed historical checkout. Receipt/schema/CLI and Canada acceptance contracts are unchanged.

## Exact candidate backup handoff

The existing manual import workflow now retains exactly `bundle.json` and `candidate.json` in its named seven-day candidate backup. A credential-free step requires both members to be nonempty after staging and before upload. Existing dispatch, permissions, secrets, action pins, candidate-only mode and conditional promotion gates remain unchanged. No data workflow was dispatched in this batch.

Offline tests copy both files into a fresh directory, preserve their exact bytes and original baseline ETag/reference, and recover the release using the existing verification API. Missing/empty members, changed bundles, swapped state and crossed baseline references fail. An in-memory synthetic operator promotion uses the retained original ETag; a stale baseline returns conflict without changing the accepted pointer. Candidate-only promotion rejects before provider construction. No live provider or Census requests occur.

The backup is neither indefinite storage nor authorization. Future operators must preserve both downloaded files, hashes and actual artifact ID/digest before expiry, verify offline, and obtain authorization for that exact candidate before remote promotion. A new import is a different candidate. See the [operator instructions](../../README.md#census-key-in-github).

## Complete local rehearsal

Rehearsed committed source: `34a4ba6796cf2a0a59d90ab7b938890d3cab2e9a`, based on `c889f179f252de359922717e1a68c82835f35f70`. The stage-create/readback, explicit Census/snapshot build, post-build readback, assembly, Python site/withdrawal creation and verification, and deterministic ZIP recreation all passed. Exactly seven accepted files (8,186,318 bytes) were copied per stage, without raw archives. The eleven protected originals and Canada's projection remained exact.

| Package | Entries | Raw bytes | ZIP bytes | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| Site | 31 | 1,884,929 | 410,396 | `72eea3a83ab31cfbb4ef236911cb57ae41761600fe6f7aa0e9ce54d46f627d53` |
| Withdrawal | 3 | 1,179 | 1,075 | `af671ea2a9546b6ea76cfcd753c3286ca020cc4622c629d095fa2ae60a005932` |

Largest site asset: `products/090121/index.html`, 350,572 bytes. JavaScript: 384,037 raw bytes; CSS: 21,963 raw bytes. The existing 1,000-entry/25-MiB-per-asset package limits, 2-MiB live-verifier raw-payload limit and 15,000-file planning alert remain clear. This local build does not establish live provider behavior.

Compared with the authenticated prior site, 21 files are byte-identical, 9 HTML files differ only in generated Astro island identifiers, and 1 Methods page differs only in preparation time. All application files under `src/` and existing deployment templates match planning main. Both ZIP recreations are byte-identical to their first creation.

The staged releases reproduced all 135 retained CSV identities and Canada's projection. The historical extra-28 cases retain their prior indirect producer-binding qualification; this is serializer/input compatibility, not a fresh independent audit of raw Census responses. Private source inventories and hashes bind the rehearsal to its exact committed tools and unchanged serializers.

An exclusive loopback server served only the assembled site tree. The retained-browser rehearsal checked both coffee profiles, monthly/rolling product changes and sourced CSVs, Canada's fixed period and imports/exports CSVs, eight disabled/private 404s, desktop/mobile/static views, and no page errors or external requests. Eighteen CSVs matched their retained exact expectations. Representative screenshots were inspected. Browser PNGs and broader unchanged UI behavior are covered by the existing fixture suites.

## Automated checks and limits

Final local checks: 1,516 unit tests across 111 files; Astro/TypeScript diagnostics across 303 files with zero errors, warnings or hints; explicit fixture build; 172 browser tests across the ordinary/private-preview/pilot suites; 24 Python packaging tests. Focused staging/parser/assembly integration: 85 tests; archive/workflow/monthly-refresh gate: 67 tests.

Initial expected failures exposed the missing parser, successor path restriction, missing/malformed selection acceptance, and missing candidate backup member/check. Strict validation also exposed non-reconciling synthetic fixture duty totals; the generator was corrected without weakening production validation. Initial diagnostics rejected inferred mutation callback return types; explicit test-only types resolved all 14 errors. A documentation helper needed explicit UTF-8 decoding; private measurement/browser helpers needed both displayed preparation time and a correctly encoded middle-dot label. These helper corrections changed no application or accepted data. Actual failed and passing logs are preserved.

Private proof is retained under ignored `data/backups/successor-release-readiness/verification-20261015-r1`, bounded to 1,000 files/64 MiB. The shared dependency junction uses the existing locked Node 24 runtime; this does not establish concurrent-build isolation. Legacy compatibility is bounded to the original exact pins. Successive official release acceptance, source availability, actual candidate promotion, R2 and site publication remain separate work.

## Integration checkpoint

At this committed local checkpoint, whole-branch independent review, exact-final-head push/PR Code checks, reviewed merge, final main binding, proof sealing and actual native archive/cache cleanup remain pending. Their actual results will be recorded in the single PR and private completion/readback evidence. No second documentation-only CI cycle or public-site update is required for this tooling-only batch.
