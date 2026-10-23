# Mexico local all-goods profile verification

Verified locally October 23, 2026. This opt-in page uses the existing privately accepted September 2024–August 2026 Mexico snapshot. It does not publish Mexico, change acceptance policy, verify classifications or contact official sources.

## Behaviour

The local route is `/preview/mexico/2010/`. It offers Imports/Exports, 24 monthly values, current/prior twelve-month totals, dollar change, growth and two browser-generated CSVs. The default view is Imports. Native monthly/source details remain usable without JavaScript; switching and downloads wait for hydration.

General imports use customs value (`GEN_VAL_MO`); domestic plus foreign exports use FAS value (`ALL_VAL_MO`). Values are nominal USD, all transport modes, not seasonally adjusted. Missing values stay missing, complete totals require twelve reported months, and a zero prior total has no growth percentage.

Private acceptance is distinct from the historical candidate's false release/classification/public-profile flags. Every product/category/share/duty comparison remains withheld. The 17 ordinary classification pairs remain unverified; the three statistical exclusions remain in all-goods totals. Dated publication checks have 16 matches and 32 differences across the full 48 observations; causes and original-byte vintage remain unestablished. Retained current grids match 48 controls before collection and 48 after. The page reuses prior reviewed evidence and makes no latest-revised-series claim.

## Data and privacy boundary

The server calls the unchanged selected Mexico reader. Only a 14,430-byte presentation object reaches the client: 48 values, exact source descriptors, private acceptance context and concise qualifications. The archive, owner authorization, evidence envelope, classification dispositions and historical logs are not serialized.

`MEXICO_LOCAL_PREVIEW_MODE` is absent by default and returns before any Mexico state read. `fixture` requires `TRADE_DATA_MODE=fixture`; `selected` requires `TRADE_DATA_MODE=census`. Empty/unknown modes, trade-mode mismatches and combinations with any Canada preview/pilot flag reject the build. Real selection failures stay unavailable; they never fall back to synthetic data.

The normal fixture build, the real four-product/Canada snapshot build and its prepared site all omit the Mexico preview/country route, observations and private acceptance sentinels. Production selection, registries and navigation are unchanged. The existing packaging guard rejects `preview/mexico/2010/index.html`. A robots label is not access control: serve this preview only on loopback and do not upload its output.

## Observed checks

| Check | Local result |
| --- | --- |
| Full Windows unit suite | 2,191 passed across 149 files |
| Astro/TypeScript | 403 files; zero errors, warnings or hints |
| Complete Chromium command | 267 passed: 235 ordinary, 11 Canada preview, 14 Canada pilot, seven Mexico preview |
| Packaging | 24 passed, including the Mexico private-path rejection |
| Workflow Python checks | 17 passed; one preexisting POSIX-only control skipped on Windows |
| Selected-data Chromium | Two directions, 48 displayed rows, four CSV downloads, keyboard Exports, no-JavaScript Imports, 375px layout, zero page errors/external requests |
| Independent arithmetic/provenance | Four installed files per checkout, 121 candidate members, 48 values/source descriptors, four twelve-month totals and two growth results agree |
| Independent rendered/export comparison | 144 displayed month/value/source fields; eight cards; eight CSVs with 3,224 compared cells; zero discrepancies |
| Windows WebKit control | 53 passed; one unchanged global-search navigation failure reproduced separately on unchanged main |

The seven new fixture browser checks cover both directions and CSVs, keyboard-only operation, mobile overflow, light/dark chart colours, no JavaScript, controls before hydration and download failure/retry. Root inspected selected-data desktop, dark and mobile screenshots. Browser CSVs match direct exports byte-for-byte. Independent checking verifies retained projection and recorded output, not a new source replay.

The WebKit search failure stays on Methods after clicking a product result. The isolated existing case and a fixture build from unchanged main `9a36e49933b93b9ad5b2fbd8aad7a99c0e7041d3` reproduce the same failure. Shared layout and its tests are unchanged. Windows Firefox's earlier launch limitation also remains unresolved. The complete Firefox/WebKit matrix is required on Linux CI before merge; do not report either Windows limitation as passing.

## Build and preservation evidence

Rehearsed runtime source: `4d5db641f806c0c448ec04921caa54787dd0753f`. Integration documents and final CI/review binding are recorded in this milestone's PR; local staging evidence applies to that stated source.

| Output | Files | Raw bytes | Largest file |
| --- | ---: | ---: | --- |
| Normal synthetic build | 31 | 1,034,153 | Client asset, 212,848 bytes |
| Normal accepted four-product/Canada build | 40 | 3,157,620 | Roasted-coffee profile, 358,447 bytes |
| Prepared normal site, including provider controls | 42 | 3,158,365 | Roasted-coffee profile, 358,447 bytes |

All are below the existing 15,000-file planning alert. No Mexico input is present in the normal staging project. The first attempt correctly rejected a dependency junction; a real directory installed from the unchanged lockfile satisfied the existing staging guard. No guard, dependency version or install-script approval setting changed.

Private input materialization totals 29,911,916 bytes across the owned checkout and its single normal staging copy, below the approved 32 MiB cap. Readback preserved 26 protected input fingerprints, 219 non-target runtime/config/workflow/dependency fingerprints, four existing site-package fingerprints and all four Mexico installed files. Private proof contains the unsuccessful outcomes, calculations, CSVs, screenshots, build receipts and hashes. It stays outside served trees.

No source request/replay, R2 operation, accepted-data installation/replacement, new product intake, website publication/restoration, paid/access/indexing change or recurring job is performed by this milestone. The September coffee proposal remains unchanged and gated.

## Local use

Use the existing Node 24/locked setup. For a synthetic preview, set the mode to `fixture` and trade mode to `fixture`. For the already installed real snapshot, use `selected` and `census` as below. Missing accepted data must fail; these commands do not import or recover it.

Run from the repository root. The server binds to loopback through the existing dev command. Stop it before restoring the saved environment:

```powershell
$mxFlags = @('MEXICO_LOCAL_PREVIEW_MODE', 'TRADE_DATA_MODE',
  'CANADA_PILOT_MODE', 'CANADA_PREVIEW_MODE', 'CANADA_ACCEPTED_PREVIEW_MODE')
$mxPrior = @{}
foreach ($mxFlag in $mxFlags) {
  $mxPrior[$mxFlag] = [Environment]::GetEnvironmentVariable($mxFlag, 'Process')
}
try {
  $env:MEXICO_LOCAL_PREVIEW_MODE = 'selected'
  $env:TRADE_DATA_MODE = 'census'
  Remove-Item Env:CANADA_PILOT_MODE,Env:CANADA_PREVIEW_MODE,Env:CANADA_ACCEPTED_PREVIEW_MODE -ErrorAction SilentlyContinue
  npm run dev -- --port 4412
} finally {
  foreach ($mxFlag in $mxFlags) {
    if ($null -eq $mxPrior[$mxFlag]) { Remove-Item -LiteralPath "Env:$mxFlag" -ErrorAction SilentlyContinue }
    else { [Environment]::SetEnvironmentVariable($mxFlag, $mxPrior[$mxFlag], 'Process') }
  }
}
```

Open `http://127.0.0.1:4412/preview/mexico/2010/`. The dedicated automated fixture check is `npm run test:e2e:mexico-profile`; it uses and cleans a separate owned output without changing normal `dist`.
