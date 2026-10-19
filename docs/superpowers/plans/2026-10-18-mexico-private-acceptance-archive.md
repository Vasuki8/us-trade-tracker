# Mexico Private All-Goods Acceptance and Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Root owns implementation. Use independent reviewer/checker subagents for the acceptance boundary, encrypted transport and final evidence; do not delegate concurrent edits to shared files. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Accept the already eligible Mexico September 2024–August 2026 all-goods snapshot for private use, establish a verified private R2 recovery path, and install its authenticated canonical local state while withholding every product comparison and any Mexico website.

**Architecture:** Add Mexico-specific acceptance and archive layers around the unchanged candidate. Upload three immutable objects through encrypted, short-lived capabilities issued using existing GitHub Secrets; independently read and recover them before initializing a private acceptance marker. A further local readback installs exactly that selected state without changing website consumers.

**Tech Stack:** Existing Node 24, TypeScript, Vitest, AWS SDK/presigner, native `node:crypto`, Python standard library and pinned GitHub Actions. No new dependencies or services.

**Spec:** The combined [design and boundaries](#design-and-boundaries) below. This combined document and its [pinned input companion](2026-10-18-mexico-private-acceptance-archive-inputs.json) are proposed together for the owner's requested single review; they authorize no execution until approved.

## Global constraints

- Mexico `2010`, all-goods only, September 2024–August 2026; general-import customs `GEN_VAL_MO`, total domestic-plus-foreign export FAS `ALL_VAL_MO`, nominal integer USD, not seasonally adjusted, all transport.
- All product comparisons remain unavailable: 17 ordinary pairs unverified and three statistical exclusions; statistical categories remain in country totals.
- Preserve current-reference agreement on 48 controls and dated-publication results of 16 matches/32 differences. Original-byte vintage, revision causes and classification continuity remain unestablished.
- Existing candidate, projection, finalized eligibility, historical failures and sealed proof are immutable. No new candidate preparation, trade-source request, national ZIP/commodity replay, reference download or classification installation.
- No public Mexico route, preview, registry/selection activation, website change or deployment. Canada and all four accepted products remain unchanged.
- Root implements; independent reviewers read/check separate scopes. Use one managed `codex/` worktree and locked runtime/dependencies. Never use Canada defaults for Mexico.
- R2 stays private. No bucket/access/secret changes, new tokens, paid upgrade, public signed URLs, new service, outreach or recurring job.
- Plans and sanitized evidence may enter the public GitHub repository. Candidate bodies, private proof, keys and plaintext capabilities may not.

## Review focus

1. A historical candidate-stage `releaseAccepted:false` must not be rewritten or mistaken for the later authoritative all-goods acceptance decision; Task 1 tests both representations.
2. A self-consistent fabricated proof or crossed archive must not confer acceptance; Tasks 1–2 bind exact reviewed evidence, owner scope and all object identities.
3. Public Actions artifacts/logs must not expose capabilities, private keys or recovered bodies, including on errors; Task 3 tests success and failure output boundaries.
4. Lost acknowledgements, late close/readback failure or interrupted installation must preserve an honest established/uncertain outcome; Tasks 2 and 5 exercise those failures.
5. Recovery must work without historical local paths, and installation must not activate public data; Tasks 2 and 5 test isolated recovery, aliases, occupied roots and build exclusion.

## Design and boundaries

### Intent, alternatives and recommendation

The owner wants to progress Mexico beyond candidate eligibility and secure a private recovery copy, keeping product comparisons withheld. Success is a qualified all-goods acceptance decision bound to an actual recovered remote archive, an exact canonical local installation, independently checked evidence and completed cleanup. This milestone does not prepare a Mexico page.

Recommend an additive Mexico-specific layer. Reusing Canada's fixed selector/archive would import its `1220` policy, qualified product model and 766-file source collection; those are different claims. Merely uploading a candidate would establish neither acceptance nor accepted-state recovery. A local credential-based uploader would be smaller, but no R2 configuration exists in the current process or local `.env`, and the established preference is GitHub Secrets. Keep those secrets in GitHub and add a small encrypted capability bridge using existing libraries.

The bridge is necessary transport work, not a general credential-export or encryption service. Do not implement additional recipients, arbitrary object keys, generic storage management or a dashboard upload fallback that loses conditional-write guarantees.

### Fixed input and preservation boundary

Baseline main is `96f1d2cdbd40bb1f9bc643159de1a95710829f4d` (PR #135). The companion pins the exact candidate, 28 named evidence members and 22 protected files. Its planning SHA-256 is `3257a29089893dc24db022d0ba4e1a7bb57b2cedc854b30a5ba1abe8466103f3`; authenticate the approved bytes again before execution. Preserve the approved plan/companion originals unchanged and record execution progress separately. After Task 5's authorized installation, compare its exact installed map rather than reusing a historical check that required Mexico absent.

| Identity | Approved value |
| --- | --- |
| Candidate | 6,443,203 bytes; `e9317cfb9269d0641613c0cfda5f97941d66e8cc68b1842f566c2e5b9f426454` |
| Projection | 9,425 bytes; `a507ead76c0936572c54674b8b0615d7813cd1749eeff95bdec5313eabd07d02` |
| Release ID | `2026-08-d15a1fdc-2f1c-4d39-8532-7bb8451ddf18` |
| Packaging commit | `d7dbd36a97b8889886c77d4c6aa62b941e94aff1` |
| Prior eligible report | 863 bytes; `a2737930cb8e6c7548694a3eeb44487d4c2081c7e0d9be6230555675fc91f3dd` |
| Prior operator proof | 3,958 bytes; `43228b26ba7697c553860ff568d7f02bb2f86a3f5db1fa16e376ce2a7f4a9a16` |
| Prior closing receipt | 2,599 bytes; `5c6286dadb2f3cab8d4e4761f554cbd549cda10fd71b649e5bf8e80783bb2e3a` |

Read only the named files from the sealed prior proof. Preserve original strings/bytes, including capture offsets. Do not run its writers, revive archived worktrees, recursively scan old raw evidence, or consume old operation allowances. The separate untracked September coffee proposal remains byte-identical and gated. New durable proof lives in the initially absent `data/backups/mexico-country-release/private-acceptance-archive-20261018-r1/`; key/temporary scratch lives in the initially absent `.tmp/mexico-private-archive-20261018-r1/`. Refuse collisions rather than reusing an unknown directory.

The candidate contains 121 members: 120 retained JSON evidence members (4,804,241 bytes) plus the projection. It supports re-authentication of 48 monthly values, four rolling totals and two growth results. The new archive also retains the 28 named acceptance/provenance records (1,479,379 decoded bytes), including actual prior review/CI logs and preservation anchors. It does **not** preserve every member of the prior 774-member proof or the original national trade ZIPs, normalized commodity rows or reference bodies. Call this a **retained all-goods evidence archive**. Historical seal/readback records are preserved attestations; absent historical bodies are not newly reverified.

### Acceptance and state model

Keep `mexicoContract`, existing preparation/recovery commands and all immutable candidate flags unchanged. Add policy `mexico-private-all-goods-acceptance-v1` for the new decision and `mexico-private-all-goods-archive-v1` for its archive. An owner authorization binds this approved plan/companion, exact candidate/eligibility/proof, private all-goods scope, unchanged qualifications and first-install-only baseline.

Produce an immutable acceptance instrument with `decision:'owner-authorized-for-private-all-goods'`. It records authorization and verified input bindings, not an observed upload/installation success. Embed it with the exact prior evidence in a bounded envelope. The authoritative accepted marker later states `status:'accepted-private-all-goods'`, `allGoodsAccepted:true`, `classificationAccepted:false`, `publicMexicoProfile:false`, and `productComparisons:{available:false}`. There is no new unqualified `releaseAccepted:true` field. Historical candidate-stage flags remain false inside the package and prior reports.

Acceptance requires source `census`, the exact approved candidate and evidence pins, recomputed eligible-report equality, preserved 17/3 dispositions and recorded human authorization. Fixtures, the old `d3b1…` candidate, caller-supplied success booleans, arbitrary internally consistent proofs or a generic `eligible` string cannot qualify. The operator and independent reviewer inspect actual retained review/CI/preservation records; the existing validator alone cannot prove their external truth.

Private acceptance is selected remotely only after full object authentication and isolated recovery. Local canonical installation then mirrors that selected state. Distinguish authorization, immutable staging, remote accepted selection, fresh selected recovery and canonical installation in every receipt. A remote acceptance may be complete while local installation is pending; report this partial outcome without deleting remote objects.

### Archive objects and recovery authority

Use only `trade/v1/countries/2010/private-all-goods/` in the existing private `us-trade-tracker` bucket/account. Three immutable objects:

1. `objects/candidate/<candidate-sha256>.json`: exact existing candidate.
2. `objects/evidence/<envelope-sha256>.json`: canonical acceptance instrument, exact approved prior evidence encoded as canonical base64, member identities and explicit preservation-depth statement. Serialized maximum 3 MiB.
3. `objects/manifests/<manifest-sha256>.json`: canonical manifest naming exactly those two objects and their identities, projection, release, policies and approved authorization digest. Maximum 64 KiB; no local source paths as destinations.

The fourth object is initialize-only `current.json` (maximum 16 KiB). It binds the exact manifest, candidate, envelope and authorization, carries the qualified all-goods acceptance state and an observed acceptance time. Persist its proposed bytes privately before attempting its one conditional PUT. No replacement, deletion or generic country pointer is permitted.

Initialization GETs and hashes all three complete immutable bodies, verifies all archived member bytes and candidate/proof bindings, and recovers a prospective selected state in an empty isolated root with historical paths unavailable. That pre-initialization recovery is explicitly not proof that a remote marker already exists. Only afterward may initialization conditionally create the marker and verify its exact readback. The independent read-only run follows that marker and performs the full recovery again. Local downloaded readback performs a third accepted-state recovery before canonical installation. Preserve distinct recovery IDs/roles and exact pointer bytes for second-generation recovery.

`data/countries/2010/processed/current.json` mirrors the exact verified marker. Its fixed local release folder contains `candidate.json`, `evidence.json` and `manifest.json`; the reader maps validated references to these fixed names, never follows arbitrary archive/source paths. Recovery authority comes from the remotely confirmed marker and approved instrument, not a fabricated local installation receipt. The local installation outcome is retained separately; no archive claims to contain a future local outcome.

Use a separate canonical IO adapter. Do not widen the existing backup-only Mexico IO or import Canada's selector defaults. Verify directory identities, exact file sets, exclusive staged writes, sync/close/readback and an initialize-only pointer publication. Unknown occupied state conflicts. An exact already-installed state may only be recognized after complete authentication. Successful remote selection does not authorize replacing any local accepted state.

### Public-repository transport

Generate one ephemeral X25519 recipient key pair locally. Store the private key only in ignored, owned scratch with restricted local access. Send only its public SPKI bytes/fingerprint and bounded descriptors to a new manual main-only workflow. Use native X25519, HKDF-SHA256 and AES-256-GCM: fresh sender key, random 32-byte salt, 12-byte nonce, 16-byte tag and a 32-byte encryption key. Bind repository, reviewed workflow head, policy, run ID/attempt, recipient fingerprint, descriptor identities and expiry through canonical authenticated context; use versioned HKDF info `us-trade-tracker/mexico-archive-capabilities/v1`.

The existing AWS presigner issues exactly three PUT capabilities and four GET capabilities (the three immutable keys and fixed marker). PUTs sign `If-None-Match:*`, exact content length, JSON content type and digest metadata. These are object-specific temporary permissions; secret keys never leave GitHub. Digest metadata is not content proof: full readback SHA-256 remains mandatory. Capabilities expire after 3,600 seconds, are encrypted before writing an artifact, and are never printed or stored as plaintext. Decrypt only in memory locally. Destroy the owned private-key file immediately after its final required use, or at expiry on a stopped batch; retain ciphertext and nonsecret identity/expiry evidence. This is file disposal, not a claim of secure physical erasure.

Encryption provides confidentiality, not authentication of the sender. Before decryption/transfer, independently authenticate the GitHub repository, workflow path, main head, run/attempt, successful conclusion, artifact ID and provider ZIP digest. Bounded extraction accepts only ciphertext and its fixed public metadata. Bind the extracted ciphertext identity to that authenticated artifact receipt; a caller-supplied context string or a decryptable blob alone cannot establish trusted capabilities.

No local capability can PUT the marker. Only the reviewed secret-backed verification workflow can initialize it after recovery. Read-only mode wraps transport to reject every PUT, even with inherited initialization settings. Validate target, modes, canonical descriptors, public key and options before loading secrets or making provider requests. SDK retries are disabled; redirects, foreign hosts, extra keys/headers and generic errors containing signed URLs are rejected or sanitized.

Use two workflows: `mexico-archive-capabilities.yml` and `verify-mexico-all-goods-archive.yml`. Manual only, actual main ref, contents read-only, checkout credentials disabled, pinned existing actions, concurrency `mexico-private-all-goods-2010`, cancellation disabled. No Census secret. Capability artifacts contain ciphertext and public metadata only (128 KiB, one day). Verification artifacts contain only a strict allowlisted summary (16 KiB, seven days); no recovered files, arbitrary error objects, raw proof or private paths. Preserve Canada's private-repository workflow guards unchanged.

### Failure handling and bounded execution

| Resource/action | Hard batch boundary |
| --- | --- |
| R2 new storage | At most 16 MiB / four new objects; no other namespaces; Standard storage; projected account usage below 100 GB |
| Cost | Estimated incremental batch charges at most US$5; recheck current rates/usage before writes; no upgrade or budget change |
| R2 requests/bytes | At most 32 S3 HTTP attempts and 64 MiB combined request/response bodies, including errors/replacements/readbacks; no list/delete/multipart/automatic retry |
| Conditional writes | Three immutable PUT attempts plus one marker PUT attempt; an ambiguous write is resolved by reads, never blindly repeated |
| Manual workflows | Three primary dispatches (capabilities, initialize, selected read-only) and one shared replacement; at most four total, including reruns |
| Real state operations | Three recoveries and one canonical installation; one shared replacement after a reproduced harness/transport fault, at most five admissions; no candidate preparation |
| Time | Each real state operation 300 seconds plus at most three seconds cleanup; cumulative 1,200 seconds including cleanup; workflows 10/15/15 minutes; preparation/transfer batch at most 30 active minutes excluding review/CI waits |
| Memory/disk | Local Windows process-tree ceiling 1 GiB; Linux Node heap 512 MiB, bounded buffers plus recorded process RSS (no claim of a 1 GiB native RSS enforcement); new private proof at most 256 MiB including copies; at least 512 MiB free after writes |
| Integration | Two primary PRs (implementation, actual evidence), one shared reviewed repair PR if needed; at most three PRs |

Reserve at least two remaining GET attempts and sufficient body/time allowance before any conditional write so an uncertain outcome can be read back. Record admissions durably before launch, actual requests/bytes/time and owned process identities; unknown outcomes consume allowances. The capability replacement is allowed only for expiry/preflight/transport failure, uses the same immutable descriptors and preserves the first artifact. A repeated object PUT is not authorized: missing acknowledgement requires readback through the existing GET capability or verifier. Missing objects never consume a second PUT under this plan. A verifier replacement is allowed only after one demonstrated transient/harness defect or reviewed repair in this plan's new files; a data, pin, consent, reference or classification mismatch stops advancement.

No marker until all prerequisite readbacks/recovery pass. A 412 is existing/unverified until full content authentication. An existing exact accepted marker can be confirmed by readback; a different marker conflicts. Acknowledged or uncertain write followed by failed readback remains explicitly unverified/unconfirmed. Receipt persistence or cleanup failures preserve the established provider outcome separately; they never turn it into success or permit another marker PUT.

Before canonical installation, require two successful remote recovery runs and the independent local full GET/recovery, all selecting the same marker. On failure, preserve only this batch's new partial state and keep the canonical pointer unpublished. If pointer publication is uncertain, inspect exact owned identities and hashes; do not overwrite, retry blindly or remove unknown state. Withdrawal/quarantine of this batch's own initial pointer/partial directory is authorized only after complete preservation, verified ownership/hash and absent-before baseline. No prior accepted dataset is removed, and no R2 object is deleted. Exhaustion stops the affected gate; do not silently expand limits.

### Permissions requested with approval

Approval of this whole document and companion authorizes root to implement Tasks 1–6 without routine approval pauses, using:

- One managed worktree/`codex/` branch, scoped filesystem/process/network/runtime permissions needed for the named work, locked dependency setup, synthetic tests, bounded copies/reads of the named existing data and private helpers/proof under a new ignored batch root. Old sealed proof stays read-only.
- Independent acceptance/transport/code reviewers and one independently owned real readback/calculation check, with clear file ownership and no concurrent implementation edits.
- GitHub pushes, public tooling/docs/workflow PRs, CI, artifact/metadata downloads, up to four named manual dispatches using existing R2 Secrets/variables, and reviewed merges under standing permission. No new secret, plaintext credential extraction or credential/access configuration change.
- Read-only Cloudflare dashboard/account/bucket/cost checks and private R2 operations strictly within the table above. Existing target is account `2e23d873002d29a02a1427e1fa37c5cd`, bucket `us-trade-tracker`; require actual settings/session agreement before writes. Authentication expiry may still require owner sign-in; it does not authorize handling a password or inventing a capacity check.
- Qualified all-goods acceptance and first canonical installation for Mexico only after the stated gates; a bounded, reviewed repair confined to the new acceptance/archive/bridge/CLI/workflow/test files and their documentation, plus the one shared replacement. No repair to the frozen candidate runtime or acceptance policy without a new decision.
- Preservation of evidence, owned ephemeral-key disposal after final use or expiry, stopping owned processes, removal/quarantine of preserved owned partial outputs, native recoverable worktree archiving and actual scratch cleanup. Keep successful canonical state and durable proof. If attachment capacity requires it, preserve full metadata then unlink at most two obsolete **merged standalone PR chat attachments**; never change their GitHub PRs or unrelated worktrees, and restore any temporarily detached own PR card.

Approval excludes all new source requests/replays outside the serialized retained JSON checks, reference/classification research, existing accepted-data replacement, other products/countries, public Mexico comparisons/profile, site packaging/publication/restoration, public R2 or access/indexing changes, paid services and recurring jobs. The September coffee plan is unaffected. Final records may show honest partial completion if a material gate fails; permission is not evidence that it passed.

## File structure and interfaces

Existing candidate/Canada modules remain untouched. Add:

- `src/lib/mexico-country-release/acceptance-types.ts`, `acceptance-contract.server.ts`, `acceptance.server.ts`, `acceptance-io.server.ts`: qualified authorization/instrument, exact pin checks, canonical accepted-state reading/installation and safe fixed-root IO.
- `src/lib/mexico-country-archive/types.ts`, `contract.server.ts`, `bundle.server.ts`, `store.server.ts`, `verify.server.ts`: exact archive grammar, evidence envelope/manifest, bounded namespace transport and remote selection/recovery.
- `src/lib/mexico-country-archive/capabilities.server.ts`, `upload.server.ts`: encrypted object permissions, authenticated context and local bounded PUT/GET client.
- `scripts/mexico-country-archive.ts`, `scripts/accept-mexico-country-release.ts`: strict operator commands; add `data:mexico-archive` and `data:accept-mexico` package scripts without changing existing commands or lockfile.
- The two named new workflows, focused tests under `tests/mexico-country-{release,archive}/`, and `tests/helpers/mexico-archive-data.ts` containing synthetic evidence only.
- `docs/validation/mexico-private-archive.md`, `docs/data-validation/2010-private-acceptance-evidence.json`, targeted Mexico readiness/current README updates. Do not relabel historical candidate records as acceptance receipts.

All types below use existing `MexicoIdentity` and `MexicoAllGoodsProjection`. Define `MexicoAcceptanceInputs={candidateBytes:Buffer; evidenceFiles:ReadonlyMap<string,Buffer>; authorization:MexicoAcceptanceAuthorization}`; `MexicoAcceptanceAuthorization` binds schema/policy/owner/scope/time/approved plan and companion digests, exact input identities and baseline `absent`. Define `MexicoAcceptanceMaterial={candidateBytes:Buffer; instrument:MexicoAcceptanceInstrument; evidenceFiles:ReadonlyMap<string,Buffer>; projection:MexicoAllGoodsProjection}`. Define `MexicoArchiveMaterial={candidateBytes:Buffer; evidenceBytes:Buffer; manifestBytes:Buffer; descriptors:readonly MexicoArchiveDescriptor[]}` and `MexicoArchiveDescriptor={role:'candidate'|'evidence'|'manifest';key:string;identity:MexicoIdentity}`. Define `MexicoArchiveStore.get(key:string,maxBytes:number):Promise<{bytes:Buffer;etag:string}|null>` and `.put(key:string,bytes:Buffer,condition:{ifNoneMatch:'*'}):Promise<void>`. No optional replacement condition. The Task 2 receipt/pointer types carry the exact state fields and stage distinctions specified above; they cannot omit the withheld flags or substitute a generic success boolean.

## Task 1: Bind qualified Mexico acceptance to the reviewed evidence

**Files:** New acceptance types/contract/authentication module; `tests/mexico-country-release/acceptance.test.ts`; synthetic archive helper; approved companion copied into the new private proof root, not edited.

**Interfaces:** Produce `authenticateMexicoAcceptance(inputs:MexicoAcceptanceInputs):MexicoAcceptanceMaterial`. It authenticates the candidate, exact prior proof/member pins and owner instrument, recomputes `finalizeMexicoEligibility`, checks exact report equality and returns the unchanged projection. It creates no canonical state and makes no network requests.

- [ ] Snapshot baseline/protected files, approved plan/companion and the initially absent canonical Mexico root. Create a fresh private batch root outside the managed worktree; authenticate/copy only the companion allowlist. Record the owner approval as an actual scoped instruction with plan hashes, not a fabricated consent timestamp.
- [ ] Write RED tests for exact real-input pin rejection, old/fixture/wrong candidate, altered eligible proof/member, missing owner scope, public/product/classification flag escalation and missing 17/3 dispositions. Assert the old projection bytes and historical false flags remain unchanged while the new authorization is a separate instrument. Use the existing test-only `vi.spyOn` contract-getter pattern for synthetic positive protocol coverage; expose no runtime pin override, fixture-to-Census option or injectable acceptance flag in the CLI. Those mocked tests cannot certify actual acceptance.
- [ ] Implement the strict types, pinned contract and authentication only. Keep real-policy pins immutable; synthetic tests cannot install a real release or call a provider. Run `npm test -- tests/mexico-country-release/acceptance.test.ts --maxWorkers=2`; expect RED before implementation and PASS afterward.
- [ ] Independently review the lifecycle/qualification boundary, inspect actual pinned review/CI/closing records and preserve dispositions. Commit the isolated deliverable; no private acceptance marker or canonical write yet.

**Deliverable:** Tested acceptance material from exact approved evidence, with product/public boundaries enforced.

## Task 2: Build the portable archive and fail-closed accepted-state reader

**Files:** New archive types/contract/bundle/store/verify modules and canonical acceptance IO/reader/installer; `tests/mexico-country-archive/{bundle,store,verify}.test.ts`; `tests/mexico-country-release/{accepted-recovery,installation,activation-boundary}.test.ts`.

**Interfaces:** Consume Task 1 material. Produce `buildMexicoArchive(material:MexicoAcceptanceMaterial):MexicoArchiveMaterial`; `authenticateMexicoArchive(material:MexicoArchiveMaterial):MexicoAcceptanceMaterial`; `recoverMexicoAcceptedState({repoRoot,outputDir,material,pointer}):Promise<MexicoAcceptedRecoveryReceipt>`; `verifyMexicoArchive(opts:MexicoVerifyOptions):Promise<MexicoArchiveReceipt>`. Define `MexicoVerifyOptions={store:MexicoArchiveStore;repoRoot:string;outputDir:string}&({mode:'initialize';expectedManifest:MexicoIdentity}|{mode:'selected';expectedManifest?:never})`. Also produce `installMexicoAcceptedState({repoRoot,archiveDir,pointerFile,verificationFile,outcomeFile}):Promise<MexicoInstallationOutcome>` and `readAcceptedMexicoAllGoodsRelease(repoRoot):Promise<{pointer:MexicoAcceptedPointer;material:MexicoAcceptanceMaterial}>`. Installation outcomes are `installed|already-installed|conflict|unconfirmed` with `currentStateVerified` and exact identities; no replacement input exists. Receipts distinguish pre-initialization recovery, selected archive verification and uncertain marker outcomes; no success from an ETag or boolean alone.

- [ ] Write RED tests for exact three-object/full-member closure, canonical base64/JSON, extra/duplicate/path-aliased members, crossed candidate/proof/namespace, preserved qualifications and envelope/stream limits. Verify all 28 archived evidence bodies but never follow paths named inside historical records.
- [ ] Write failure tests for truncated/oversized/hanging streams, absent/altered remote bodies despite matching metadata, conditional conflicts, timeout/abort cleanup, no marker before full recovery, lost PUT acknowledgement/readback, failed receipt persistence and read-only mode refusing PUT. Assert fresh-root recovery and second-generation exact state without historical reads; late failures never produce a verified accepted receipt.
- [ ] Write RED initialize-only IO tests: occupied/linked/aliased directories, replaced reservation, wrong candidate/receipt, concurrent installer, staged write/sync/close fault, unknown file set, pointer publication uncertainty and post-success receipt failure. Test no activation of public routes/selection and no acceptance from a merely prospective/unconfirmed marker. Require second-generation recovery to preserve pointer/instrument/evidence bytes.
- [ ] Implement the fixed archive grammar, complete GET/hash verification, isolated reader and fixed-root installer. Construct/persist proposed marker bytes before the single conditional initialization attempt; confirm only by full validated readback. Use separate safe canonical IO without widening old backup helpers; preserve established uncertain outcomes. Run focused archive/recovery/installation tests until PASS. All real state writes remain prohibited until Tasks 4–5.
- [ ] Review store/selection isolation and independently check derived 48 observations/four totals/two growth results against the pinned expected report. Commit; all provider tests still use synthetic stores, with zero real R2 requests.

**Deliverable:** Offline tested archive/recovery/selection protocol, including failures and exact accepted-state portability.

## Task 3: Add the safe GitHub-secret transport and integrate reviewed tooling

**Files:** New capabilities/upload modules, both CLIs, package scripts, two workflows; `tests/mexico-country-archive/{capabilities,upload,cli,workflow}.test.ts`; `docs/validation/mexico-private-archive.md` operator contract.

**Interfaces:** `sealMexicoCapabilities({config,descriptors,recipientPublicKey,context,now}):Promise<Buffer>`; `openMexicoCapabilities({ciphertext,privateKey,expectedContext,trustedCiphertextIdentity,now}):MexicoCapabilities`; `transferMexicoArchive({repoRoot,material,capabilities,mode:'upload'|'readback',outputDir}):Promise<MexicoTransferReceipt>`. `trustedCiphertextIdentity` comes only from the externally authenticated artifact/extraction receipt, not from the ciphertext itself. Acceptance CLI takes `--archive-dir`, `--pointer-file`, `--verification-file`, `--output` for an external outcome. Archive CLI modes/options: `keygen --output`; `prepare --input-dir --authorization --output`; `upload|readback --archive-dir --capability-artifact --artifact-proof --key-file --output`; `capabilities --descriptors --recipient-public-key --output`; `verify-initialize --manifest-sha256 --manifest-bytes --output`; `verify-selected --output`. Preparation reads only the exact copied allowlist under the new batch's `inputs/`, with the candidate at `candidate.json` and evidence at its companion `archiveName`; outputs cannot alias that input or any sealed root. Each mode allows `--preflight` without writes/network; reject unknown/repeated/alias options and preserve the fixed Mexico policy. Capabilities workflow inputs are canonical descriptor JSON (at most 8 KiB) and canonical X25519 SPKI base64 public key; verifier initialization receives the exact manifest identity, selected mode accepts no identity override. No arbitrary URL/body/country/command input.

- [ ] Write RED crypto tests for wrong recipient/context/head/run/expiry/algorithm, tampered ciphertext/tag, invalid SPKI key, low-order/all-zero shared secret, extra capabilities and unsigned required PUT headers. Reject a newly encrypted attacker blob with matching self-asserted context but the wrong trusted artifact identity. Use native crypto and byte-level context tests; assert decryption errors expose no private value. Test no signed URL/private key/raw recovery leakage in stdout, stderr or artifact selection, including exceptions.
- [ ] Test strict preflight-before-secret/provider behavior, pinned action/main/manual-only/concurrency settings, no Census settings, one-day ciphertext/seven-day summary allowlists, no inherited initialize override, no redirects/retries and expiry/byte/request ledgers. Wire scripts/workflows without modifying Canada's guards or existing import/archive jobs.
- [ ] Implement the small encrypted bridge and CLIs. Independently review encryption composition, authority boundaries and failure output before any credential-bearing dispatch. Run focused tests, full unit/type checks, existing Python workflow/package tests and ordinary fixture build/report; expect all to pass with no new skips or weakened assertions and no Mexico route/private output. Record actual results and review findings.
- [ ] Open implementation PR 1, obtain independent whole-change review and passing CI on the exact head, then merge under standing permission. Bind the exact merged runtime/workflow files before Task 4. No unreviewed real transfer is permitted; the workflow must exist on main before dispatch.

**Deliverable:** Reviewed merged, public-repository-safe tooling; no remote acceptance or local installation yet.

## Task 4: Privately archive and independently recover the actual selected snapshot

**Operations/files:** New private preparation/transfer/verification proof, two new workflows and existing private R2 target; no website operation or canonical installation.

**Interfaces:** Consume exact approved Task 1 input, Task 2 object material and merged Task 3 tooling. Produce three immutable object identities, one confirmed accepted marker and two fresh independent remote recovery receipts. Runtime/package identities remain distinct from the old packaging commit and from provider run/artifact identities.

- [ ] Check current account/bucket/Standard/private status, account-wide usage and cost projection. Refuse mismatched settings, public access, projected usage at/above 100 GB or batch estimate above US$5. Recheck all approved pins. Prepare the envelope/manifest once, record every raw/serialized size, and confirm total storage below 16 MiB and local proof/disk limits. Generate the local recipient key and record only its public identity in public inputs.
- [ ] Dispatch capabilities on exact merged main and authenticate actual workflow/run/head/artifact digest before download/extraction/decryption. Preserve original ciphertext. Upload the three exact local objects once each using their conditional permissions and complete outcome ledger. Reserve readback allowance before every attempt; a successful transport or 412 is not acceptance. Never output plaintext URLs.
- [ ] Admit/dispatch `verify-initialize` with the exact observed manifest identity. Require full object/member authentication, zero historical/source fallback, isolated recovery, conditional marker outcome and exact selected readback. Preserve sanitized run proof plus local private transfer evidence. Do not proceed on conflict/unconfirmed selection; use only remaining authorized reads to establish outcome.
- [ ] On a separate fresh runner, admit/dispatch `verify-selected` with writes blocked and repeat full selected recovery. Independently compare marker/object/projection identities, observations, periods, qualifications, actual workflow heads and summary schemas. Preserve actual failed runs as well as successes. Any replacement consumes the single shared allowance and follows the stated failure rule; no re-preparation or data mismatch retry.

**Deliverable:** Confirmed private all-goods archive and two independent fresh recoveries, or a precise staged/unconfirmed state with advancement withheld.

## Task 5: Install only the verified private state and check exclusion from the website

**Files:** New ignored canonical Mexico state and private acceptance/recovery outcomes. Use the installer/reader and tests completed in Task 2 and CLI/tests completed in Task 3; no new implementation step is deferred past PR 1.

**Interfaces:** Consume Task 2's `installMexicoAcceptedState` and `readAcceptedMexicoAllGoodsRelease`, Task 3's authenticated readback transport and Task 4's two observed remote verifications. Inputs must be independently authenticated downloaded objects and the confirmed marker. Produce actual local recovery, installation outcome and complete compact-state identity map.

- [ ] Before real local execution, verify the merged Task 2 installer/tests and Task 3 CLI are the reviewed unchanged runtime and that both remote receipts select the exact same marker. Recheck request/time/expiry/disk allowances and all protected pins; an unknown canonical root conflicts.
- [ ] After Task 4 passes, use the four encrypted GET permissions for one independently owned full local remote readback (marker plus three bodies); authenticate all identities and recover into a fresh isolated root. An expired capability can use the one shared replacement only if still available; do not bypass this independent readback or expand authority. The independent checker compares exact output with separate arithmetic and preserved prior expectations.
- [ ] Admit first canonical installation from those downloaded authenticated bodies. Require initially absent `data/countries/2010`, complete immutable files/readbacks and exact marker publication. Re-read installed accepted state independently and compare the whole compact file map; record an actual confirmed outcome. Preserve any partial/uncertain state and apply only the owned initial-install failure rule.
- [ ] Run full unit/type checks and build/report with canonical Mexico present. Run existing fixture/Canada browser checks and a bounded real accepted-data build using copies of the four published products and Canada. Assert no `/countries/2010/`, Mexico preview, product selector change, comparison row, raw candidate/evidence or private signed URL is emitted. Existing Canada/four-product pins remain exact. Record file count/total/largest file and the 15,000-file planning alert; no site package or upload is created.

**Deliverable:** Authenticated private-only canonical acceptance and one independently owned local remote recovery, with current site coverage unchanged.

## Task 6: Integrate actual evidence, preserve proof and complete cleanup

**Files:** New sanitized `2010-private-acceptance-evidence.json`, operator guide outcome section, targeted readiness/README updates, private proof manifest/readback/closing receipts. Historical candidate/failed-run records are retained as historical facts.

**Interfaces:** Consume actual acceptance/transfer/workflow/recovery/install results and all failed attempts. Produce a reviewed public scope-limited report and sealed private batch proof with final worktree/process/scratch observations. No completion record may predict later CI, merge, readback or cleanup.

- [ ] Publish only safe counts, hashes, exact approved policies/periods, observed R2 object identifiers, public run/PR/CI IDs and accurate stage outcomes. Explain `allGoodsAccepted:true` separately from immutable candidate-stage false flags; every comparison/classification/public-profile flag remains false. Do not describe a complete historical source backup, independent revalidation of absent bodies or an accepted Mexico website.
- [ ] Independently review new evidence against original private receipts and actual provider observations. Reauthenticate protected compact datasets, prior seal/closing pins, separate September proposal and installed Mexico map. Open evidence PR 2, require exact-head CI/review, then merge. A single reviewed in-scope repair PR is shared across this batch; record exhausted or unresolved gates honestly.
- [ ] Preserve all nonsecret original proof, failed attempts, ciphertext, private calculations, decoded summaries, actual review/CI logs, operation/cost ledger and task records outside the worktree. Retain final key fingerprint/expiry/destruction receipt, never a private key or plaintext capability in Git/public artifacts or remote archive. Stop only owned processes and remove only preserved owned disposable copies. Keep installed canonical Mexico and durable private proof.
- [ ] Reconcile task-workspace plan markers to the actual current checkout **before** post-archive task checks; preserve original marker bytes and test Windows/Bash path routing with synthetic controls. Record all task completion markers, archive only the owned worktree through the native recoverable tool, verify actual checkout/Git-registration absence and restore any detached own PR attachment. Delete only verified owned scratch after preservation, seal/read back the final private proof, then write a non-circular external closing receipt recording actual cleanup. Do not repeat the prior absolute-plan-marker routing failure or modify sealed proof to add final observations.

**Deliverable:** Reviewed merged tooling/evidence, honest qualified acceptance/archive/install outcome, intact protected data and actual completed cleanup.

## Verification commands and acceptance evidence

Use the locked runtime with `SITE_PACKAGE_PYTHON` set to its actual Python executable and `PYTHONDONTWRITEBYTECODE=1`. Verification includes:

```text
npm test -- tests/mexico-country-release tests/mexico-country-archive --maxWorkers=2
npm test -- --maxWorkers=2
npm run check
python -B -m unittest discover -s tests/workflows -v
python -B -m unittest discover -s tests/packaging -v
npm run build
npm run build:report
npm run test:e2e
```

Use the existing browser/accepted-data build configuration and keep its ordinary labeled fixture semantics. New real operations require their own actual admissions, process/stream/request evidence and independent output inspection; synthetic CI alone cannot certify archive acceptance. A prior passed test count is historical, not the expected result of a new run.

## Sources checked for the proposed transport

- GitHub artifacts from a public repository are accessible to signed-in readers; treat plaintext capabilities/private outputs as public exposure. [GitHub artifact downloads](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/download-workflow-artifacts)
- Presigned URLs grant a particular operation on a particular object until expiry; they can be reused during that lifetime and do not expose the signing secret. They are not single-use by themselves. [Cloudflare presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- Verify required conditional headers against the installed SDK and R2's documented compatibility; keep exact-byte GETs authoritative. [Cloudflare S3 compatibility](https://developers.cloudflare.com/r2/api/s3/api/)
- Native crypto supplies the chosen primitives; composition/context/error handling still require focused independent review. [Node 24 crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html)
- Storage/operation billing and allowances are checked at execution; the 16 MiB and US$5 values above are approval ceilings, not an assertion of free service. [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)

## Self-review and handoff

Coverage: owner/pin/qualified acceptance → Task 1; archive integrity/recovery/ambiguous selection and installer implementation → Task 2; public-repository secret boundary/CLIs → Task 3; actual R2/remote recovery → Task 4; actual canonical state and no public activation → Task 5; evidence and actual cleanup → Task 6. All installation implementation/tests are complete before PR 1 and real transfer. The shared replacement/repair budgets cannot be multiplied by phase. Unknown future object digests, keys derived from them, run IDs and actual timestamps are bounded observed outputs, never guessed planning placeholders.

Root implements inline using `executing-plans`, with acceptance and transport reviews before real provider writes and independent evidence review before final integration. Full approval grants the permissions above; implementation, R2 and canonical acceptance remain pending the owner's review of these exact artifacts.
