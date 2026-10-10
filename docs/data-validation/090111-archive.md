# Green coffee private archive acceptance

On October 10, 2026, the existing manual import workflow initialized the private **HS 090111** namespace in the owner's already configured R2 bucket. The run retained merchandise and estimated duties through August 2026, backed up the candidate to GitHub, verified offline recovery and conditionally accepted the pointer. This extends the approved private backup role to the second reviewed product; public delivery, hosting and scheduling are unchanged.

Initial live acceptance and downloaded-backup recovery passed. Independent source replay and comparison by observation identity found no changes from the original green-coffee profile. The separate read-only fresh-runner verification remains pending until its workflow is merged and dispatched; initial promotion alone does not prove that subsequent restoration.

## Initial live acceptance

| Evidence | Value |
| --- | --- |
| Manual import run | [38081943254](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38081943254) |
| Job | `114300502594` |
| Code version | `1ef3dbb23ee478a188018fc1e5761be70090fc11` |
| Product / reporting month | `090111` / `2026-08` |
| Inputs | archive enabled, duties enabled, initialization enabled |
| Original retrieval timestamp | `2026-10-10T20:00:19.513Z` |
| Release ID | `2026-08-ce7cdc7d-10c7-4edd-81b5-f7eea307468f` |
| Accepted bundle SHA256 | `9ac5e90fbf7852e94fa82af3e9c6e07033dd999f1037b69cb0f88b969164ad58` |
| Prepared release SHA256 | `b363ec5ed0ecaf0f4cbbc1c667ce94f8d244d2a24e389a8b3cfefc36fca4d2d3` |
| Candidate artifact | `11680942063` |
| Candidate ZIP SHA256 | `4c01aa049afaeb3df49504ea1fa43ba9ecec4f87c9517b20b4ab24e83fa8f4f8` |
| Promotion artifact | `11681316296` |
| Promotion ZIP SHA256 | `b9b0b423284d4409fd2e96cd6de22d18d848b77038d67c74ec2489c4003b3b27` |
| Promotion outcome | `acknowledged` |

The bounded restore recorded a null baseline, confirming that the selected product's accepted pointer was absent. The immutable candidate key is `trade/v1/products/090111/releases/2026-08-ce7cdc7d-10c7-4edd-81b5-f7eea307468f.json`; the manifest's previous reference is null. Initialization does not overwrite an existing pointer. The promotion receipt identifies that exact reference and the candidate artifact ID/digest. ZIP digests identify the GitHub archives and differ from the inner bundle checksum.

The run passed its existing 458 tests, source validation, immutable upload/readback, GitHub backup, offline recovery and conditional promotion. Downloaded candidate and promotion ZIPs independently matched the digests in GitHub's metadata. Original ZIPs, `bundle.json`, `outcome.json` and comparison results are retained in ignored `data/backups/green-coffee-r2/38081943254/`; source data and backup bytes are not committed.

## Independent recovery and data checks

Credential-free recovery into `.tmp/green-archive-initial-recovered/` made **zero provider calls** and reproduced all **337 original files byte for byte**: one prepared release, 240 merchandise source records and 96 duty source records. The additional local pointer makes 338 recovered files. Its prepared checksum matches the accepted reference above.

Independent replay checked all **6,929 merchandise observations** and all **1,524 duty observations**, including source identity, amounts and statuses. Country merchandise sums reconcile to 120 national direction/month totals. Duty replay checks consumption/dutiable values, reported estimated duties and RP70/79 qualification coverage across September 2024–August 2026. Missing country observations remain unavailable. Every merchandise and duty observation field matches the original accepted profile when compared by unique observation identity; retrieval row order differs. Classification intervals and source URLs match too. Both revision lists are empty because this initial archive has no retained baseline.

The original green-coffee profile retains its earlier source timestamp and processing version. Its local pointer SHA256 remains `d93e6e11e48c540396fee4699a0a9e58cbde0e6f6a55e20e7ba7056fb3296a39` and release SHA256 remains `ef5d56791ad85b1b7a199829818522389a792e82cee792665be61f8e78cba0f7`. Roasted coffee's pointer remains `5098efe55c5d712f097afaef140527c1c3636ebdd7dd0fe48b5521c5cf589bc8`, and its release remains `eaa8c1baa86bd3a8880dcda12db3b32625a38c221591c8c0e087b6af6a325727`. The preview continues using these original validated local releases.

## Remaining boundary

The [read-only verification workflow](../validation/private-archive-verification.md) will establish fresh-runner restoration of this accepted reference without a second Census import or R2 promotion. A same-August archive check does not establish successful processing of two successive official reporting releases; that public-launch requirement remains open.
