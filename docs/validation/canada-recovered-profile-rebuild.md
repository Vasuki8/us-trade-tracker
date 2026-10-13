# Canada recovered-profile rebuild

On October 12, 2026, the existing accepted local Canada profile rebuilt from the preserved selected state in a fresh export of tracked source at `7e26c7a186365685cb7da889164b924e791e33ee`. This closes the presentation recovery check after the [two full private R2 recoveries](canada-private-archive.md). It is a local check of the fixed September 2024–August 2026 snapshot; public launch and successive official-release acceptance remain open.

## Inputs and isolation

The input was the already authenticated artifact from the [selected read-only recovery](https://github.com/Vasuki8/us-trade-tracker/actions/runs/38333194037), artifact `11783821619`. Its original ZIP was 1,716,611 bytes / `0931970ced34a1db18c609e3f08c45c56ffb7ef2e87e71d1a9d496b45cd5704d`. This rehearsal made no new provider request or R2 operation.

The fresh tracked-source export contained no historical `.tmp` or `.superpowers` folders, private backups, raw/processed product data, accepted country state or `.env`. Only the following authenticated recovered state files were staged for the Canada loader:

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `data/countries/1220/processed/current.json` | 466 | `9ede6a6906b0da7f85e74203d186bee7f6a8e08e37f452fb9f5a99e88e10a399` |
| Release `candidate.json` | 2,960,916 | `337d25eeb94c87d9dbfdc4c9a21a20e7e50f416a6599cd0699f028eee0349818` |
| Release `acceptance.json` | 13,430 | `b64cdaf9b33c7604d9b069852351c64759ee713f397c8c087201cd7a09320f75` |

The release directory is `releases/2026-08-2e27b39c-932b-4f3d-b2aa-3b11ca2a3cca/`. The staged bodies matched the authenticated archive bundle exactly. The separately preserved original selection receipt was also authenticated before staging. Copying these files did not select a new candidate or alter the original pointer.

The export ran in the existing Windows workspace and shared the installed Node 24/dependency runtime. It was not a new machine or an operating-system sandbox, and did not test a fresh dependency installation. Product pages used visibly synthetic fixtures; Canada used its recovered real accepted state. The original research folders were absent from the exported project. Historical paths embedded in evidence were not needed to load or render that state.

## Result

The authenticated loader reproduced the exact 33,716-byte projection / `33c7db7ec421bddaa13e36c3b2e32cd4558aa041fe17f2f3da01285b62b08fd0`. The isolated build produced **22 files / 601,630 uncompressed bytes**; its largest file was `_astro/client.EoSUrE1U.js`, 212,848 bytes. This smaller footprint reflects synthetic product pages, rather than a change in Canada data.

The browser check covered both directions, all 24 monthly rows and ten selected categories per direction, current/prior totals, mobile containment and keyboard direction/table controls, readable Imports with JavaScript disabled, and the `noindex,nofollow`/unpublished presentation. External browser requests were blocked; no browser errors occurred. Private pointer/package/acceptance identities, backup paths and upload capabilities were absent from built HTML, JavaScript and JSON.

All four actual browser downloads matched the previously reviewed original CSV identities byte for byte:

| Direction / CSV | Bytes | SHA-256 |
| --- | ---: | --- |
| Imports / monthly | 13,543 | `b9c74e8200c6778f13a8fda4f77c03ae4cb67a371a2b17080a5de97aba602da9` |
| Imports / products | 69,587 | `a349ddde908eb8abe84767b9b844b39704d87fc46fa2b4d0de373ada94027e5a` |
| Exports / monthly | 13,539 | `d11ded6a5aba7d8c7ce0e4442d2412e9b0ab145be460bcc42f3adf76899be169` |
| Exports / products | 69,342 | `8940bd3ec8a9e608d8761a5e25b64593907ba731999bb780970b8e0b301899e9` |

A separate negative check changed one byte in the owned recovered acceptance copy. Building in `selected` mode then refused it with `Accepted Canada preview unavailable or invalid`, without emitting an accepted fallback page. The owned copy was restored to its exact original bytes. All eleven protected original files and the original Canada pointer remained unchanged.

## Repeat the presentation check

First complete authenticated, owner-authorized accepted-state recovery using the [archive operator guide](canada-private-archive.md). Preserve the full bundle and selection/recovery receipts separately. Use the recorded selected state, rather than promoting a discovered candidate. Place its exact `data/countries/1220/processed/` subtree in a fresh checkout of the reviewed code. Install the locked dependencies if the toolchain is not already available; that setup was outside this rehearsal.

Run inside that fresh checkout:

```powershell
$env:TRADE_DATA_MODE = 'fixture'
$env:CANADA_ACCEPTED_PREVIEW_MODE = 'selected'
Remove-Item Env:CANADA_PREVIEW_MODE -ErrorAction SilentlyContinue
npm run build
npm run preview -- --port 4415
```

Open `/preview/accepted/countries/1220/`. Product pages are development samples in this mode. Confirm the real Canada provenance/acceptance banner, both directions and CSV identities against the recorded release. Use a fresh contained output for any intentional failure probe and alter only an owned test copy. Remove the accepted preview setting for ordinary builds. None of these commands writes to R2 or publishes a website.

The [machine-readable evidence](../data-validation/1220-recovered-profile-evidence.json) binds the source export, staged bodies, receipts, browser CSVs, measured build and negative check. Fifteen verification files, including the one-off scripts, logs and screenshots, are preserved privately under the archive backup tree. The rehearsal performs no raw-source replay and establishes no new revision agreement, additional history or public acceptance.
