# US Import Export Tracker

A commercial research website for understanding U.S. goods trade by product and partner country. Small import and export businesses are the primary audience, with public research pages also serving analysts and readers.

## Current public pilot

The [public pilot](https://us-trade-tracker.pages.dev/) was updated and verified on **October 18, 2026**. It covers roasted coffee (090121), green coffee (090111), [tea (090240)](https://us-trade-tracker.pages.dev/products/090240/) and [cocoa beans (180100)](https://us-trade-tracker.pages.dev/products/180100/), including reported partner countries, changes, estimated duties and briefings. The [product portfolio](https://us-trade-tracker.pages.dev/briefing/portfolio/) keeps each product’s figures separate. All four products end in August 2026; missing observations remain unavailable.

The existing [Canada historical snapshot](https://us-trade-tracker.pages.dev/countries/1220/) is unchanged and covers September 2024–August 2026 only. No Mexico profile or automatic Canada refresh is included. Successful updates across successive official releases remain a separate open requirement.

Mexico’s September 2024–August 2026 all-goods snapshot is now accepted for **private use**, privately archived and locally installed, with three independently checked recoveries. It remains unpublished; all product comparisons stay withheld. The [acceptance evidence](docs/data-validation/2010-private-acceptance-evidence.json) preserves 17 unverified ordinary classification pairs, three statistical exclusions and 32 dated-reference differences. [Public-profile and publication gates](docs/data-validation/2010-acceptance-readiness.md) remain open.

The latest verified package has **39 files / 2,817,915 raw bytes**, with 84 exact checks across the canonical and deployment origins plus public browser/download checks. It was published from reviewed merge `a5d6e98ee29182790a7d564dd1ba0ba3c78ca44c` to the existing Free Pages project; restoration was unnecessary. See the [archive acceptance, publication evidence and limits](docs/validation/tea-cocoa-publication.md).

Pages/chart data share Cloudflare Pages, downloads are generated in the browser and R2 remains private preservation storage. The public site uses `noindex,nofollow`; that indexing policy does not restrict access. No new Census request, paid upgrade, recurring job or indexing change was made by this expansion.

## Local design preview

The local [Graphite redesign](docs/validation/graphite-redesign.md) implements the approved compact dashboard, numerical overview and persistent light/dark toggle. It preserves the existing research and download flows. This code change has not yet been published to the public pilot.

## Product profile navigation

The published profiles include On this profile section links, annual one-country links from Leading partners, and copied links that follow native section history while preserving manual-copy/picker/download state. Independent review found no issues; exact-head CI passed and PR #97 was merged before the authenticated package was published to the existing Free Production project. Local acceptance passed 1,297 unit/121 browser/24 packaging tests with zero type diagnostics. Public navigation, partner figures, keyboard/mobile/static defaults and downloads passed; restoration was unnecessary. See the [navigation verification record](docs/validation/profile-research-navigation.md#verified-public-update).

## Project direction

The October 16 **recorded merchandise revisions** local checkpoint identifies exact revised monthly cells, open chart points and two explicit profile CSV fields, while preserving release-level provenance. Acceptance passed 1,600 unit, 190 browser and 24 Python packaging checks; 16 CSV identities intentionally gain columns and the other 123 remain identical. Current accepted coffee data has no recorded revisions, so it gains no invented badges. See the [meaning, compatibility and local evidence](docs/validation/merchandise-recorded-revisions.md). The implementation PR carries subsequent publication and actual closeout evidence; this paragraph describes the local checkpoint.

The next checkpoint is owner-run validation of the existing pilot, before choosing more features. The [task study and blank scorecard](docs/research/pilot-task-study.md) and [checked manual coffee briefing](docs/research/coffee-sample-briefing.md) support exploratory sessions. No sessions, demand evidence or willingness to pay are claimed. The owner can return anonymized observations from relevant recent tasks; recruitment and real-user research remain owner-run. Successful updates across successive official releases remain a separate open requirement.

The published **briefing estimated-duty research links** connect both coffee products’ monthly/rolling world summaries to matching Imports/share country comparisons. Independent review and exact-head CI passed before PR #110 merged. Local acceptance passed 1,552 unit/184 browser/24 packaging tests; public checks and actual cleanup are complete. Existing figures, qualifications and 139 CSV identities are preserved; the published package contains 31 entries/1,886,967 raw bytes. See the [completed evidence and limits](docs/validation/briefing-duty-research-links.md#verified-public-update).

The published **briefing research links** open matching monthly Imports/Exports and separate twelve-month partner-card country rankings for each coffee product. Independent review found no issues; exact-head CI passed and PR #99 was merged before publication. Local acceptance passed 1,312 unit/131 browser/24 packaging tests with zero type diagnostics and 112 byte-identical CSV cases. All eight public handoffs and their matching CSVs passed; the site contains 31 entries/1,712,596 raw bytes. Restoration was unnecessary. See the [briefing-link verification](docs/validation/briefing-research-links.md#verified-public-update).

The **product portfolio briefing** at `/briefing/portfolio/` combines selected published products in one report, keeping their amounts and duty rates separate. Choose products and Imports/Exports, share the selection URL, download sourced summary/partner CSVs or print/save the report as PDF. See the [verification and publication boundary](docs/validation/coffee-portfolio-briefing.md).

The website uses Astro, TypeScript, and React on Cloudflare Pages. Census observations are processed into prepared pages and chart data. The initial hosting budget is US$0 to US$15 per month, excluding the domain and development work; automatic monthly publishing remains future work.

The first local development profile is verified with real Census data: roasted coffee (HS 090121), five years of import/export history through August 2026, comparison of up to three partner countries, and sourced PNG/CSV downloads. It includes an importer with validated releases, refresh recovery, and revision tracking. Independent reviewers checked all 9,577 observations, annual totals, country share and six-digit classification continuity. Offline tests use visibly labeled synthetic fixtures. See the [recorded verification](docs/data-validation/090121.md).

The second real profile is **green coffee, not decaffeinated (HS 090111)**, available at `/products/090111/` and through the homepage profile links. Its five-year trade history and 24-month estimated-duty dataset passed source replay, six-digit classification review, product-specific offline recovery and local browser checks. It has 6,929 trade observations and 1,524 duty observations; absent country months remain unavailable. The existing shared profile supplies direction/country comparisons and sourced downloads. See the [green coffee verification and limitations](docs/data-validation/090111.md).

The **Product research** directory at `/products/` lists the reviewed, published pilot profiles. Search by product name, source description or HS code, then confirm the description, reporting month and retrieval date before opening the matching profile. Search runs locally; all profile links remain available without JavaScript. The main navigation opens this directory. Normal mode lists the two accepted coffee profiles; explicit fixture mode lists the two labeled synthetic profiles. At that milestone the Census build contained **13 files and 923,164 uncompressed bytes**; the directory added one file and measured 7,738 bytes. See the [directory acceptance](docs/validation/pilot-product-directory.md).

The **homepage** now starts with product search and shows each reviewed, published profile's own source description, reporting month and source. Its cards link directly to matching country changes and release briefings, and it links to the cross-product changes page. Coverage is explicit, synthetic previews are labeled, and all homepage research links work without JavaScript. At that milestone the Census build had **18 files and 1,062,739 uncompressed bytes**; homepage HTML was **6,905 bytes**. See the [homepage research acceptance](docs/validation/pilot-research-home.md).

Read the [launch brief](docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md) for features, data definitions, competition, and monetization.

The coffee profile also includes “What changed?”: up to ten country increases and decreases over the latest twelve months versus the preceding twelve months, ranked by dollar change or country-share change in percentage points. It follows Imports/Exports and stays independent of chart country selections and history. Incomplete or classification-incompatible comparisons stay unavailable; a zero prior value has no growth percentage. The changes CSV includes the displayed rankings, both periods, units and source provenance.

The standalone **Monthly changes** pages provide the same verified country comparisons with their own Imports/Exports controls, sourced CSV download and matching profile link. `/changes/` preserves the roasted-coffee default; `/changes/090111/` covers green coffee. A profile's navigation keeps its product, and the changes pages link between the reviewed products, including without JavaScript. Changing product starts with imports ranked by dollars. These remain within-product country rankings over two rolling twelve-month periods. That milestone's Census build contained **14 files and 1,015,387 uncompressed bytes**; the green-coffee changes page was 90,540 bytes. See the [original coffee page acceptance](docs/validation/coffee-monthly-changes.md) and [product-specific changes acceptance](docs/validation/product-monthly-changes.md).

Both **country and product changes** pages now restore the direction and ranking measure from a copied link. Edits keep the address current; reloads and browser navigation restore the filters together. Country pages accept `metric=dollars` or `share`; `/changes/products/` accepts `dollars` or `growth`. Invalid or duplicate filters explain the default, and blocked clipboard access provides a selectable link. Links use the latest reviewed release. Without JavaScript, the default import/dollar rankings remain readable with an explanation. At that milestone the Census build had **19 files and 1,066,951 uncompressed bytes** (1.02 MiB). See the [changes-link acceptance](docs/validation/changes-view-links.md).

The **Product changes** page at `/changes/products/` compares the reviewed pilot products by dollar change or percentage growth over the same two rolling twelve-month periods, separately for imports and exports. Growth rankings use the launch brief’s $10 million prior-period threshold. Older reporting months and unavailable comparisons are excluded with explanations; profile links retain product/direction, and the sourced CSV is generated in the browser. The page states its limited pilot coverage and keeps default import tables readable without JavaScript. At that milestone the Census build contained **18 files and 1,057,424 uncompressed bytes**; the new HTML was **16,340 bytes**. See the [pilot product-change acceptance](docs/validation/pilot-product-changes.md).

The static **release briefings** summarize latest-month imports and exports against the same month one year earlier, highlight the largest comparable annual country changes by dollars, and show world estimated duties with consumption denominators and reporting qualifications. `/briefing/` keeps the roasted-coffee default; `/briefing/090111/` covers green coffee using its own accepted release. Profile and Monthly changes navigation retain the product, and named links switch between the reviewed briefings. Figures, product/source identity and matching research links work without JavaScript, with no React island or interactive payload. That milestone’s Census build contained **15 files and 1,025,749 uncompressed bytes**; green coffee's briefing is **8,949 bytes**. See the [original coffee acceptance](docs/validation/coffee-release-briefing.md) and [product-specific briefing acceptance](docs/validation/product-release-briefings.md).

The shared **Sources and methods** page now lists release information for every published profile, including its product/source identity, reporting month, retrieval timestamp, processing version, separate merchandise and duty revision counts, duty-history coverage and matching profile link. These static details work without JavaScript and preserve each product’s own release. That milestone’s Census build contained **15 files and 1,030,256 uncompressed bytes**; only the Methods HTML changed, growing by **4,507 bytes**. See the [release-information acceptance](docs/validation/product-release-information.md).

The Methods page also shows the **next scheduled official publication** from a reviewed Census calendar snapshot, with its reporting month, Eastern publication time, source-check date and page-preparation time. A new build skips passed publication instants and falls back to the calendar link when the reviewed entries are exhausted. This remains static information; scheduled publication does not imply the website has accepted new data. At that milestone the Census build had **18 files and 1,059,046 uncompressed bytes**, with only the Methods HTML growing by **1,622 bytes**. See the [official schedule acceptance and maintenance limits](docs/validation/official-release-schedule.md).

**Shareable profile views** save Imports/Exports, the history window and up to three countries in the URL. “Copy view link” provides a selectable fallback when clipboard copying is unavailable. Country highlights on the profile, Monthly changes and briefing open matching twelve-month profile views. Links use the latest available dataset; an unavailable or invalid selection explains the fallback to default imports. Without JavaScript, the initial research remains the default view and explicitly explains this limitation. See the [saved-view acceptance](docs/validation/coffee-profile-view-links.md).

The **country picker** searches partner names or codes and keeps selected countries visible above the results, with accessible removal controls. Search only narrows the picker; selected chart data, duties, rankings, downloads and shared links keep their existing meaning. See the [country-picker acceptance](docs/validation/coffee-country-picker.md).

The **selected country comparison** shows each chosen country's current/prior values, dollar change, growth, U.S. shares and share change, in selection order. Its default compares two rolling twelve-month periods; **Latest month** compares the reporting month with the same month one year earlier, using matching monthly U.S. totals. It follows Imports/Exports and country selections while keeping its periods independent of chart history and ranking controls. Copied links retain the period choice; older links keep the annual default. Missing or incompatible comparisons stay unavailable, and its browser-generated CSV includes the period type, both U.S. denominators and source details. National headline cards explicitly say **U.S. total**. That milestone's retained-Census build contained eleven files and 687,195 uncompressed bytes. See the [annual summary acceptance](docs/validation/coffee-selected-country-comparison.md) and [monthly comparison acceptance](docs/validation/coffee-monthly-country-comparison.md).

**Estimated duties** on imports uses a separately validated 24-month duty history. Coffee's September 2024–August 2026 Census data, version 2 archive recovery and displayed comparisons passed acceptance and independent review; existing version 1 backups still recover their original bytes. The profile section follows country selection, shows monthly and rolling amounts with matching imports-for-consumption denominators, and generates a sourced CSV in the browser. Both coffee profiles also show the fixed 24-month duty history in current USD and as a share of imports for consumption, with gaps/qualifications and two sourced browser PNGs. The reviewed charts are published and public acceptance passed. See the [chart verification](docs/validation/estimated-duty-history-charts.md). Rolling shares use ratios of sums. RP70/79 affected dutiable value qualifies reported figures; missing coverage or incompatible periods withhold comparisons. See the [duty verification](docs/data-validation/090121-duties.md) and [approved requirements](docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md#approved-scope-additions).

The agreed pilot hosting approach keeps pages and chart data on the same static host, with CSV/PNG downloads generated in the browser. R2 remains private archive storage. Each completed Astro build reports its file count, uncompressed total size and largest file in the build log and, on GitHub Actions, the job summary. At 15,000 files it issues a non-blocking planning warning. Public R2 delivery is reserved for selected large datasets or bulk downloads when measured growth justifies it; ordinary pages stay on static hosting. See the [hosting direction](docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md#launch-resources-and-hosting-direction).

Run `npm run build:report` to measure an existing `dist/` without rebuilding, or `npm run build:report -- --dir path/to/output` for another output directory. Reports stay outside deployment assets. Build sizes are raw bytes before network compression.

The coffee profile uses a compact internal browser payload while preserving its canonical release and archive data. The verified local build reduced product HTML from 5.9 MB to 280 KB before compression and from 212 KB to 80 KB with gzip. Local median time from navigation through a completed direction change improved from 404 ms to 271 ms. The October 13 hosted baseline now measures both coffee profiles: normal-CPU median navigation through a completed switch was 729/625 ms, with switch latency of 47/38 ms. These instrumented developer-machine samples are not a before/after comparison or real-user/mobile timing. Calculations and browser CSV downloads stayed identical. See the [loading measurements and acceptance](docs/validation/coffee-profile-loading.md).

## Local development

Use Node 24 and npm. Install with `npm ci`.

For a labeled sample preview in PowerShell:

```powershell
$env:TRADE_DATA_MODE = 'fixture'
npm run dev
```

Open the displayed localhost URL, then `/products/090121/`. Explicit fixture mode also includes `/products/090122/`, labeled **Synthetic second product**, to check shared profiles. On Bash, use `TRADE_DATA_MODE=fixture npm run dev`. No Census key is needed. Normal mode builds the published registry and requires each product's own validated release; it never silently substitutes sample values. Normal Census mode publishes the two accepted coffee profiles; each requires its own validated release. See the [multi-product foundation acceptance](docs/validation/multi-product-foundation.md).

Run code checks with `npm test` and `npm run check`. For browser acceptance, install Chromium once with `npx playwright install chromium`, build using explicit fixture mode with `npm run build`, then run `npm run test:e2e`. Browser tests exercise real controls and downloads, mobile overflow, keyboard use, PNG failure recovery, and research without JavaScript.

## Monthly product changes

The published Product changes update adds latest-month versus same-month-last-year rankings for the two existing coffee products, alongside the rolling default. Monthly growth uses the prior matching month; eligibility retains the separate $10 million preceding-twelve-month rule. Saved period links, matching profile links and explicit qualification CSV fields passed retained-data and public acceptance. Independent review, exact-head CI and PR #107 merge passed. The site has 31 entries and 1,884,934 raw bytes. See the [verified public record](docs/validation/monthly-product-changes.md#verified-public-update).

## Monthly country movers

The existing coffee changes pages now offer the latest reported month against the same month last year alongside rolling twelve-month comparisons. Direction and ranking changes retain the selected period. Copied monthly links append period=monthly; older links still open rolling comparisons. Country drilldowns and imports-to-duty links carry the matching period.

Monthly CSVs identify the comparison in their filename and comparison_period column. Rolling downloads and default serializer output retain their previous contract. Without JavaScript, the page explains and displays imports over rolling twelve months ranked by dollar change.

See the [monthly country movers verification](docs/validation/monthly-country-movers.md) for fixture checks, retained-data acceptance, compatibility hashes and measured local package growth. This batch prepares local packages; publication requires a separate package/target decision.

## Local site preparation

New local stages use the exact reviewed `deployment/site-product-selection.json` from their requested source commit. The initial selection retains both accepted August coffee releases; future selections can name independently accepted months without changing Canada's historical evidence. Missing/invalid selections fail new creation. Historical verification alone retains the old exact August rules. See the [successor tooling verification](docs/validation/successor-release-readiness.md).

The staging tool exports a clean committed checkout and copies only the fixed accepted Canada/coffee state into a fresh ignored preparation directory. Source and data roots are explicit, so an isolated development checkout can read the existing primary checkout's accepted data. Originals remain unchanged. The staged project reuses the source checkout's existing dependency directory through one recorded link; builds may update that runtime's ignored caches.

Run the following in PowerShell from the clean source checkout. Set `$siteData` to the checkout that holds the existing accepted data; ensure Node 24/dependencies are already available. Choose a new run name for each attempt:

```powershell
$siteSource = (Get-Location).Path
$siteData = $siteSource
$siteRun = Join-Path $siteSource '.tmp/pilot-preparation-r1'
$siteCommit = git rev-parse HEAD
New-Item -ItemType Directory -Path (Join-Path $siteSource '.tmp') -Force | Out-Null

node --import tsx scripts/stage-site.ts create --source-root $siteSource --data-root $siteData --output $siteRun --commit $siteCommit
if ($LASTEXITCODE -ne 0) { throw 'Staging failed' }
node --import tsx scripts/stage-site.ts verify --source-root $siteSource --data-root $siteData --stage-root $siteRun
if ($LASTEXITCODE -ne 0) { throw 'Pre-build readback failed' }

$siteFlags = @('TRADE_DATA_MODE', 'CANADA_PILOT_MODE', 'CANADA_PREVIEW_MODE', 'CANADA_ACCEPTED_PREVIEW_MODE')
$sitePrior = @{}
foreach ($siteFlag in $siteFlags) { $sitePrior[$siteFlag] = [Environment]::GetEnvironmentVariable($siteFlag, 'Process') }
Push-Location (Join-Path $siteRun 'project')
try {
  $env:TRADE_DATA_MODE = 'census'
  $env:CANADA_PILOT_MODE = 'snapshot'
  Remove-Item Env:CANADA_PREVIEW_MODE,Env:CANADA_ACCEPTED_PREVIEW_MODE -ErrorAction SilentlyContinue
  npm run build -- --outDir ../real-dist
  if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
} finally {
  Pop-Location
  foreach ($siteFlag in $siteFlags) {
    if ($null -eq $sitePrior[$siteFlag]) { Remove-Item -LiteralPath "Env:$siteFlag" -ErrorAction SilentlyContinue }
    else { [Environment]::SetEnvironmentVariable($siteFlag, $sitePrior[$siteFlag], 'Process') }
  }
}
node --import tsx scripts/stage-site.ts verify --source-root $siteSource --data-root $siteData --stage-root $siteRun
if ($LASTEXITCODE -ne 0) { throw 'Post-build readback failed' }
```

Assemble only the verified real build into fresh site and withdrawal trees, then create and read back each ZIP. Use Python 3.12 or newer (no packages required):

```powershell
$sitePackages = Join-Path $siteRun 'packages'
node --import tsx scripts/prepare-site.ts --source-root $siteSource --data-root $siteData --stage-root $siteRun --build-root (Join-Path $siteRun 'real-dist') --output $sitePackages
if ($LASTEXITCODE -ne 0) { throw 'Assembly failed' }
foreach ($siteKind in @('site', 'withdrawal')) {
  $siteManifest = Join-Path $sitePackages ($siteKind + '-manifest.json')
  $siteZip = Join-Path $sitePackages ($siteKind + '.zip')
  py -3 scripts/package_site.py create --work-dir $sitePackages --root (Join-Path $sitePackages $siteKind) --manifest $siteManifest --zip $siteZip
  if ($LASTEXITCODE -ne 0) { throw 'Packaging failed' }
  py -3 scripts/package_site.py verify --work-dir $sitePackages --manifest $siteManifest --zip $siteZip
  if ($LASTEXITCODE -ne 0) { throw 'ZIP readback failed' }
}
```

Assembly requires the explicit real-dist build, authenticates the stage again before/after copying, adds the committed headers and standalone error templates, and writes schema-v1 manifests only after readback. Controls count towards the 1,000-entry dashboard limit; each file is bounded at 25 MiB. A failed attempt requires a fresh destination. Receipts and manifests stay outside served trees. Verification also rechecks that staging remains ignored under the source checkout .tmp directory. On Windows, a hidden read-only PowerShell helper checks the native reparse attribute for every inspected component; only the recorded dependency link is exempt. No new dependency is installed. A manifest proves the checked file identities; it does not independently attest that arbitrary substituted assets came from the documented build.

The cross-language integration test uses SITE_PACKAGE_PYTHON to select an existing Python 3.12+ executable. Set that environment variable before npm test. Code checks and the manual import, country-audit and duty-audit jobs explicitly supply python3 to their test processes. This setting addresses the test prerequisite; it does not establish a successful live data run. No dependency installation, source import or provider operation is performed by these tools. See the [real preparation verification](docs/validation/local-site-preparation.md) and [manual-workflow runtime verification](docs/validation/manual-workflow-test-runtime.md).

Each staging command emits its private JSON receipt only on success. Readback authenticates the source inventory to its recorded Git commit, compares the seven copied state files with their accepted originals, and rejects missing/changed/extra files or invalid dependency links. Build caches under `project/.astro` and `project/dist` are permitted; other extra project files are refused. Keep receipts outside any served tree.

This is a local preparation recipe with a shared runtime, not a fresh-machine install, source refresh or public upload. A fresh build can change the Methods preparation timestamp; measure new hashes rather than copying an earlier package's receipt.

## Local site packaging

The tracked Python operator consumes an **already prepared tree and schema-v1 manifest** from the existing site/withdrawal preparation flow. It creates a ZIP or checks a retained ZIP without rebuilding, downloading data or contacting a provider. Use Python 3.12 or newer; no Python packages are required. Keep the preparation directory private and ignored, such as a fresh directory under `.tmp/`.

All paths must be inside the existing, explicitly owned `--work-dir`; parent traversal, symlinks/junctions/reparse points and hardlinked files are refused. Run from the repository root, with the reviewed manifest and tree already in place:

```powershell
py -3 scripts/package_site.py create --work-dir .tmp/package-run --root .tmp/package-run/upload --manifest .tmp/package-run/site-manifest.json --zip .tmp/package-run/site.zip
py -3 scripts/package_site.py verify --work-dir .tmp/package-run --manifest .tmp/package-run/site-manifest.json --zip .tmp/package-run/site.zip
py -3 -m unittest discover -s tests/packaging -v
```

On Linux/macOS, replace `py -3` with `python3`. Both commands emit a JSON receipt on stdout only after full verification: work-directory-relative ZIP path, ZIP bytes/SHA-256, entry count and `entriesVerified: true`. Failure returns nonzero and writes its explanation to stderr. Creation requires a fresh destination and preserves occupied files. If creation fails after opening the ZIP, a partial file may remain for investigation; it has no success receipt and requires a fresh destination for another attempt.

The existing manifest format and dashboard preparation bounds remain: at most **1,000 entries**, including `_headers` and `404.html`, and at most **26,214,400 uncompressed bytes per asset**. This package bound is separate from the normal build's 15,000-file planning alert. The operator checks exact file sets, roles, portable/case-unique paths, private/runtime path exclusions, totals, largest-file identity, provider headers, template SHA-256/Git-blob identities and stable regular-file reads. ZIP verification checks every complete decompressed member, its compressed-stream end and CRC, and hashes the ZIP through the same stable handle. Withdrawal packages contain only `index.html`, `404.html` and `_headers`.

A manifest is trusted local preparation input, not a deployment approval or independent source-data attestation. The operator does not produce manifests, stage accepted datasets, scan arbitrary asset text for secrets, validate provenance metadata against Census/Git, select a target or upload files. Existing source/data review and publication decisions still apply. Do not package an ordinary fixture build for public release.

Offline validation on October 14, 2026 passed 24 packaging tests, including exact file/asset boundaries, malformed manifests and ZIPs, stable-file metadata, hardlinks/junctions, occupied destinations and reproducible output. The operator also read back the retained 30-entry production package and recreated it from a checked private copy of its prepared tree: 1,534,093 uncompressed bytes, 366,534 ZIP bytes, and SHA-256 `1d429b9d39725011e6b43ad6ee8592445d2f7ff5832c8cfb17e4e7db6bcc1e0a`. The original manifest and ZIP remained unchanged; this was an offline compatibility check.

## Census key in GitHub

The manual **Audit Canada country data** workflow is the first data step toward the launch brief's country profiles. It is restricted to Canada (`1220`) through August 2026 and checks 24 monthly all-goods totals and complete HS6 breakdowns for imports and exports. It retains the original responses, sanitized queries and hashes, reports reconciliation gaps and unavailable product months, and compares totals with the official Canada table at its displayed precision. The existing `CENSUS_API_KEY` secret is used only in retrieval. Evidence is retained even when source checks fail, as `census-1220-country-audit` for seven days.

For a local key-configured audit, use `npm run data:audit-country -- --country 1220 --end 2026-08`. Default evidence goes to ignored `.tmp/country-audit/1220/`; an existing directory is refused, even when empty. `--output path/to/fresh/directory` retains a separate rerun. `--preflight` validates inputs without a key or requests. The audit accepts no release and does not access R2. Aggregate reconciliation and candidate completeness do not establish classification compatibility: all candidate comparisons remain marked unavailable pending reviewed evidence. The completed [Canada audit evidence](docs/data-validation/1220-country-audit.md) records failed source acceptance: nine unavailable import parts and seven export totals that disagree with the retained official table. The evidence and calculations were independently replayed and reviewed; country comparisons remain unavailable, and no country profile is published by this command. See the [country-audit design](docs/superpowers/specs/2026-10-10-canada-country-audit-design.md).

If API requests fail before a response, choose `connectivity-probe` in that manual workflow. It checks public API metadata, the existing roasted-coffee world query and four latest-month Canada total/HS6 queries, with at most two requests in flight. Six logical checks can make up to fourteen attempts when the country client retries HTTP 429/5xx. The probe has a four-minute step cutoff, covering the permitted 213-second request/retry schedule, and retains original safe responses, checksums and allowlisted transport codes; exception messages and credentials are excluded. `npm run data:probe-country -- --country 1220 --end 2026-08` offers the same isolated local diagnostic. Even a passing probe leaves 24-month coverage, classification and release acceptance unverified.

The owner prefers a GitHub Actions repository secret. In repository **Settings → Secrets and variables → Actions → Secrets → New repository secret**, add `CENSUS_API_KEY` with the key as its value. Do not create an ordinary variable. See [GitHub's secret instructions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets).

The manual `source-followup` mode investigates the failed Canada audit with a fixed request list: its nine unavailable import parts, the August 2026 export total with monthly and year-to-date values, and a fresh official Canada table. It retrieves the reference alone, then ten API parts in five pairs; the existing request/retry schedule fits a nine-minute step. It records header/body failure phases, allowlisted error codes, original responses and hashes in fresh ignored output. `npm run data:diagnose-country -- --country 1220 --end 2026-08` runs the same diagnostic locally when a key is configured. Cumulative corroboration compares against all eight January–August reference months with a $400,000 accumulated display-rounding bound. It does not resolve monthly discrepancies, combine old and new data into an accepted release, or establish product eligibility. Even a passing followup leaves source coverage and classification unverified.

The independently verified [source followup](docs/data-validation/1220-country-audit.md#live-followup-two-import-totals-retrieved-cumulative-correction-hypothesis-rejected) retrieved March and June 2026 import totals; the other seven import parts timed out before response headers. Export `ALL_VAL_YR` exactly equals the original API monthly sum and remains $1,796,212,748 below the followup official-table sum. It therefore does not supply a supported correction. That strict audit remains failed; at its completion no Canada dataset or comparison was accepted. The later fixed archive-snapshot contract separately supports the qualified historical pilot described above.

The manual `aggregate-probe` mode compares the original query with an explicit aggregate-subdivision query for May 2025 imports (total), June 2025 imports (HS6 breakdown), August 2026 imports (working total control) and May 2026 exports (reference mismatch). Only `DISTRICT=-` plus `RP=-`/`CTY_SUBCODE=-` for imports or `DF=-` for exports change; predicate columns leave `get` to avoid duplicate headers. Country, calendar, commodity and summary restrictions, response validation and the 30-second deadline stay the same. A fresh reference precedes four paired API calls, within a seven-minute step and at most 25 attempts. `npm run data:probe-aggregates -- --country 1220 --end 2026-08` runs the same diagnostic with an existing key. The isolated `aggregate-probe.json` separates retrieval, commodity-row equivalence and rounded export-reference agreement. Unavailable or incompatible responses remain explicit; any failed check gives nonzero status. Even a passing probe cannot accept a Canada release or prove the timeout cause.

The independently replayed [live aggregate probe](docs/data-validation/1220-country-audit.md#live-aggregate-probe-equivalent-returned-data-no-supported-filter-fix) found no supported filter fix: both strategies returned the same 4,302 June 2025 import rows and May export total, while both May and August import totals timed out. The original strategy stays unchanged. Separate [publication research](docs/data-validation/1220-country-audit.md#primary-source-revision-lead) verified that all seven disputed January–July export API totals match their original monthly Census releases at displayed precision. This supports a reference-vintage explanation; the current-reference mismatches remain recorded, and the acceptance gate and country eligibility remain unchanged pending a reviewed reference protocol.

The manual `total-probe` mode tests an independently documented country-total route: imports `enduse`, compared with the existing `hs` total for May and June 2025 and the August 2026 control. Both use `GEN_VAL_MO`, exact calendar predicates and national `DET/CY` totals; end-use has its own strict contract, with `I_ENDUSE=-` and no unsupported `RP` or `CTY_SUBCODE` fields. Its fresh official reference runs alone before three API pairs, within a six-minute step (at most nineteen attempts). `npm run data:probe-totals -- --country 1220 --end 2026-08` produces isolated `total-probe.json`, original bodies and hashes. Endpoint equality and rounded reference agreement are separate checks. A failed or incomplete pair stays unavailable; alternate totals are diagnostic observations and do not replace the default audit query or accept a release. See the [controlled total comparison](docs/data-validation/1220-country-audit.md#controlled-import-total-endpoint-probe).

The independently replayed [live total probe](docs/data-validation/1220-country-audit.md#live-total-probe-recovered-totals-and-equivalent-endpoints) passed: both endpoints returned exactly $29,977,446,512 for May 2025, $29,645,029,011 for June 2025 and $35,980,039,950 for August 2026, all agreeing with their own rounded official reference. May and June totals also corroborate previously retained HS6 sums. End-use was faster in these three observations; HS also recovered, so the earlier timeout cause remains unverified. The full audit still retains its failed coverage verdict; compatible publication references and classification review remain required before any Canada release or comparison.

The full audit now retains seven independently reviewed [original FT900 publications](docs/data-validation/1220-original-publications.md) for January–July 2026 exports. Exact original PDF byte counts and hashes must agree before the pinned monthly figures can corroborate an API total. Current-table checks and mismatches remain visible separately; historical agreement never overrides the existing source-coverage/failure gate. This adds seven public retrievals and up to fourteen retained files, without a PDF dependency or an accepted Canada release.

The [fresh publication audit](docs/data-validation/1220-country-audit.md#fresh-publication-audit-verified-partial-evidence-after-step-timeout) reached its 15-minute retrieval limit and retained 95 files, without final audit or candidate reports. Independent replay and review verified all seven PDFs and four live January–April historical matches. Of 80 retained API parts, 50 were usable; 16 import breakdowns and 14 import totals had no usable response. Twenty-two complete month/direction pairs reconcile exactly, but May–August API parts lack retained files. A faster total endpoint alone cannot resolve the breakdown gaps. Diagnose failed import breakdown contexts against a previously received control before another full run. Source coverage for this partial run, classification and country comparisons remain unverified; the earlier completed full audit keeps its failed verdict.

Manual `prefix-probe` tests the documented smaller-query approach for imports: unchanged full HS6 breakdown versus `I_COMMODITY=0*` for September 2024, April 2026 and the February 2025 control. It compares every normalized row in that subset, preserving descriptions, missing/zero values and special flags. A prefix response is explicitly partial; it cannot replace the full breakdown or establish country coverage. `npm run data:probe-prefix -- --country 1220 --end 2026-08` retains a separate `prefix-probe.json`, seven original records and safe request diagnostics. The existing deadlines, retry rules, two-request concurrency and six-minute step remain; original audit queries and acceptance rules stay unchanged. See the [bounded prefix diagnostic](docs/data-validation/1220-country-audit.md#bounded-import-prefix-diagnostic).

The [live prefix probe](docs/data-validation/1220-country-audit.md#live-prefix-probe-three-subsets-retrieved-one-exact-control-match) returned all three `0*` subsets. February's 291 rows matched the same-run full-response subset exactly; September and April full requests timed out before headers, leaving those equivalence checks unavailable. The source diagnostic therefore failed while retaining all eight evidence files. This supports testing all ten non-overlapping prefixes for one failed month with same-run all-goods reconciliation before adopting partition assembly. It does not prove the timeout cause or complete country coverage; source/classification acceptance and Canada comparisons remain unavailable.

Manual `partition-probe` tests complete prefix retrieval for September 2024 imports. It retrieves `0*`–`9*` and an independent HS all-goods total, validates duplicate-free assembly including returned 98/99 categories, and checks exact API reconciliation and rounded official-reference agreement separately. Missing, empty or incompatible inputs stay unavailable. `npm run data:probe-partitions -- --country 1220 --end 2026-08` retains twelve original records and `partition-probe.json` in fresh ignored output. The twelve logical calls permit at most 34 attempts in an eleven-minute source step; request deadlines, retry rules and concurrency stay unchanged. Passing this one-month experiment cannot accept a Canada release or establish 24-month coverage. See the [partition protocol](docs/data-validation/1220-country-audit.md#bounded-one-month-partition-diagnostic).

The [live partition probe](docs/data-validation/1220-country-audit.md#live-partition-probe-incomplete-retrieval-no-monthly-assembly) failed: only `0*`, `1*` and `5*` returned, supplying 848 HS6 rows. Seven other prefixes and the independent total timed out before headers. All thirteen evidence files were retained; the monthly assembly, exact reconciliation and reference comparison correctly remain unavailable. Do not adopt ten-way partitioning or repeat the unchanged full audit. Its next investigation assessed the official bulk/download route against the monthly HS6, country, measure and provenance requirements.

The [bulk-source feasibility sample](docs/data-validation/1220-country-audit.md#official-bulk-source-feasibility-one-import-month-reconciled) verified September 2024 Canada imports from a public Census ZIP, including all 848 previously retrieved API code/value pairs. The subsequent [five-context validation](docs/data-validation/1220-country-audit.md#five-context-bulk-validation-exact-totals-vintage-difference-retained) covers September 2024 and August 2026 imports/exports plus May 2026 exports. All five HS6 sums equal their separate country totals exactly. Four match their own current reference; May exports match the retained original publication while remaining $608,164,241 below the current table. This supports the bulk record contracts, without resolving reference-vintage compatibility. The 13 originals total 697,503,386 bytes; local replay took about 40 seconds with a largest measured child-process peak of 387,104,768 bytes. Classification and sparse-series eligibility remain unverified; the earlier full audit keeps its failed verdict and no Canada release or comparison is accepted.

The reviewed [bulk diagnostic design](docs/superpowers/specs/2026-10-11-canada-bulk-diagnostic-design.md) and owner-approved [six-task implementation plan](docs/superpowers/plans/2026-10-11-canada-bulk-diagnostic.md) are implemented as an optional local command. The root implemented and subagents reviewed. The tool retains compressed originals locally, with a 12 GiB original-body cap, 128 MiB generated-output cap, 16 GiB free-space preflight and 60-minute overall limit for the 48 monthly archives and their own references. Current-table checks, exact same-archive reconciliation and pinned original-publication corroboration stay separate; a historical match cannot override a current mismatch. Existing workflows and acceptance rules remain unchanged.

The [completed 24-month diagnostic](docs/data-validation/1220-country-audit.md#bounded-24-month-bulk-diagnostic-retrieval-complete-acceptance-withheld) retrieved all 64 originals without retries; its failed live report and earlier offline replay remain preserved. After a reviewed 100-to-128 member-limit change, the [latest offline replay](docs/data-validation/1220-country-audit.md#inventory-limit-replay-all-archives-reconcile-current-mismatches-remain) validates all 48 contexts. Independent verification matches all 223,049 HS6 rows and 144 selected-member receipts. Forty-one contexts match both current snapshots; the same seven export months disagree, including May, while matching their original publications. Exact monthly arithmetic is verified; source/reference/classification resolution remains open, and Canada releases and rolling comparisons stay unavailable. Review an explicit reference-vintage protocol before another acceptance attempt.

The **Import Census data** workflow is manually triggered and accepts a reviewed `product_code`, defaulting to `090121`. Roasted coffee (`090121`) and green coffee (`090111`, not decaffeinated) are both reviewed and accepted. See the [green coffee verification record](docs/data-validation/090111.md). The workflow returns a downloadable public-data artifact. It does not publish a site, commit datasets, run on a monthly schedule, or expose the key to ordinary code-check jobs. GitHub requires this workflow file on the default branch before **Run workflow** becomes available ([manual workflow documentation](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)).

Choose a reporting month confirmed by the [official release calendar](https://www.census.gov/foreign-trade/schedule.html) and current release information, run with `product_code=090121`, and download `census-090121-release`. The artifact has `processed/` and `raw/` directories: extract those into ignored `data/`, then run `npm run data:validate -- --product 090121`. Green coffee uses `data/products/090111/`; other reviewed products use `data/products/<code>/`. Keep their files separate. Artifacts expire after seven days, so retain the public source/archive separately. Remove `TRADE_DATA_MODE` or set it to `census` to preview the actual release. The key stays in GitHub.

The default manual workflow produces independent snapshots. The opt-in retained-release workflow restores the accepted baseline before importing, checks revisions against its exact original bytes, backs up the candidate, and conditionally advances a private R2 pointer. Owner setup and live August 2026 validation are complete for roasted coffee: initial archiving, fresh-runner restoration, conditional promotion and recovery of both GitHub backups passed. See [archive setup, recovery and verification](docs/data-validation/090121-archive.md). Green coffee's initial private archive, offline recovery and read-only fresh-runner restoration also passed; all 337 original files recovered byte for byte with the accepted archive identity and original source metadata. See its separate [archive evidence](docs/data-validation/090111-archive.md).

For baseline-aware review without promotion, select `candidate_only=true` together with `archive_to_r2=true` on `main`, leaving `initialize_archive=false`. This mode requires an existing accepted archive: a missing baseline stops the run before importing. It restores the baseline, imports and validates the candidate, uploads the immutable candidate to private R2, retains the seven-day GitHub backup and verifies offline recovery. Only after those steps succeed does the job summary report **Candidate ready for review**, with the backup artifact ID and digest. Promotion is skipped and the CLI refuses a candidate-only `promote` command; no promotion receipt is produced. This mode still makes Census requests and writes the immutable R2 candidate, so dispatch it only for a confirmed published month and authorized storage operation. Leaving `candidate_only` off preserves the existing artifact-only or conditional-promotion behavior. The control alone supplies no live successive-release acceptance evidence or public replacement.

The candidate backup contains exactly `bundle.json` and `candidate.json`; a credential-free check requires both to be nonempty before upload. Before its seven-day expiry, download and preserve both original files, their SHA-256 hashes, and the actual backup artifact ID/digest. Copy them together into a fresh run directory and run `npm run data:archive -- verify --product <code> --data-dir <fresh-recovery-directory> --run-dir <downloaded-run-directory>` offline. Keep the original candidate state: it retains the bundle reference and baseline ETag needed for conditional promotion. Recovery and a backup receipt do not establish approval. Later remote promotion requires separate authorization for that exact candidate and original baseline condition; recreating an import is a different candidate. This change neither extends artifact retention nor adds a resume workflow.

Offline candidate verification now also binds the exact bundle release identity and predecessor reference before writing recovered files. A correct bundle checksum cannot excuse a mismatched candidate key or baseline. Legacy/bare recovery and remote promotion safeguards keep their existing contracts; offline success cannot establish the current remote ETag or authorize promotion. Synthetic acceptance passed 1,566 unit tests and zero type diagnostics, with accepted data unchanged. See the [candidate-verification checks and limits](docs/validation/candidate-verification-consistency.md).

Use the manual **Verify private archive recovery** workflow on `main` to check an existing accepted archive without another Census import. Select its reviewed product code and expected accepted reporting month. It restores into a fresh runner, validates the bundle and original source records, then retains `census-<code>-restored` and `census-<code>-verification` artifacts for seven days. It uses the existing private R2 settings only in restoration, never initializes an archive, and blocks storage writes. Both reviewed products passed live recovery checks, with all 337 originals per product matching the accepted backups. See [verification usage and limits](docs/validation/private-archive-verification.md).

For an optional local import, put `CENSUS_API_KEY` in ignored `.env`, then run:

```text
npm run data:import -- --product 090121 --end YYYY-MM --months 60
npm run data:validate
```

The reporting month is required; it is never guessed from today's date. Once a local release is accepted, an earlier reporting month is rejected before Census requests or new source files; use a separate workspace for historical snapshots. Same-month revision refreshes and later reporting months remain supported. Each request has a 30-second timeout and at most two retries on 429/5xx responses, with at most two requests in flight. Missing country rows remain unavailable rather than becoming zero. A failed import preserves the current release. A lock prevents overlapping local imports; after an interrupted process, confirm no import is running before removing its stale `data/processed/.import.lock`.

For the validated duty extension, choose `include_duties=true` in the manual workflow. A local import uses `--duties` together with the reviewed `--classification data/classification/090121.json` evidence. Once the accepted baseline contains duties, later imports must retain this option; omission fails before fetching. Archived imports replay both source formats and recover the backed-up candidate offline before promotion.

The separate **Audit product estimated duties** workflow checks 24 months without accepting or promoting a release. Select a reviewed, importable `product_code` (`090121` by default, or `090111`) and a confirmed reporting month. It validates these inputs before accessing the Census key and retains `census-<code>-duty-audit`; raw records, the duty dataset and the report stay in that product's `.tmp/duty-audit/<code>/` directory. An audit can precede publication and duty acceptance; passing reconciliation alone does not verify classification continuity or enable a product's duties.

The product-aware workflow passed a live coffee recheck on October 10, 2026. All 96 retained source records and 1,887 duty observations reconciled, the downloaded artifact matched GitHub's digest, and independent comparison found no changes from the accepted coffee data. See the [live recheck evidence](docs/data-validation/090121-duties.md#october-10-product-aware-workflow-recheck). The audit left the accepted release and R2 archive unchanged.

With a locally configured Census key, the matching command is `npm run data:audit-duties -- --product 090121 --end YYYY-MM`. Omitting `--product` preserves the coffee default. `--output directory` chooses an explicit evidence directory; keep previous evidence and use a fresh directory for a rerun. Existing audit output is never overwritten. The old default `.tmp/duty-audit/` is not rewritten or migrated; new default output is `.tmp/duty-audit/090121/`.

See [live validation status](docs/data-validation/090121.md). Both coffee importer intervals now cover September 2021–September 2026 under the [reviewed September classification evidence](docs/data-validation/coffee-september-classification.md); accepted trade datasets still report August. The CLI clips evidence to an earlier reporting month and never extends it into unreviewed months. Cross-period growth and totals crossing an unverified interval stay unavailable. The [monthly-refresh readiness checks](docs/validation/monthly-refresh-readiness.md) exercise synthetic month-to-month window shifts, revisions, failed refreshes and successor archive recovery for both coffee identities. They do not replace the live successive-release check: September 2026 is scheduled for November 4, 2026 on the [official calendar](https://www.census.gov/foreign-trade/schedule.html), checked October 10. Full recurring-release acceptance still requires two successive official releases. The fixed public pilot is now verified; broad product discovery, advertising and subscriptions remain later work.

CSV exports include classification verification and line-break fields. Formula-looking text is prefixed with an apostrophe for safer spreadsheet opening; numeric dollar values remain numeric.

## File management

The optional local Canada bulk diagnostic uses an existing **Windows CPython 3.11+** interpreter and Node 24. It never installs a runtime or uses Census/R2 credentials. Run a read-only preflight first, with your absolute interpreter path and a fresh ignored destination:

```text
npm run data:diagnose-country-bulk -- --python C:/Python/python.exe --output data/backups/canada-country-audit/fresh-run --preflight
```

Remove `--preflight` to perform one fixed September 2024–August 2026 diagnostic: 48 monthly ZIPs, nine official HTML originals and seven pinned publication PDFs, serially with no retries. Existing destinations are refused. Originals remain compressed locally; no release, accepted data, R2 object or default audit retrieval changes. The command requires 16 GiB free before requests, stops below 2 GiB, caps originals at 12 GiB and generated evidence at 128 MiB, and limits the invocation to 60 minutes. Each archive allows at most 128 members and 3 GiB of declared uncompressed data; the member limit was raised from 100 after independently reviewing the retained 106/113-member inventories. Every other resource limit and validation rule stays unchanged. Parsing children are measured every 250 ms and stopped above 1 GiB or 60 seconds.

The report retains partial and unattempted outcomes. A nonzero exit is expected if May's current-reference mismatch persists; historical-publication matches cannot override that failure. Classification stays unverified and country releases/rolling comparisons remain unavailable. See the [diagnostic design](docs/superpowers/specs/2026-10-11-canada-bulk-diagnostic-design.md) for source, resource and acceptance boundaries and the [verified live/offline findings](docs/data-validation/1220-country-audit.md#bounded-24-month-bulk-diagnostic-retrieval-complete-acceptance-withheld) for the completed invocation, plus the [48-context inventory replay](docs/data-validation/1220-country-audit.md#inventory-limit-replay-all-archives-reconcile-current-mismatches-remain). Do not repeat unchanged downloads to seek a passing verdict.

Track website code, import scripts, project documents, public assets, dependency lockfiles, and small test fixtures in Git. Store large source datasets and prepared data archives in Cloudflare R2, with a separate backup.

The [Canada private archive operator guide](docs/validation/canada-private-archive.md) records completed preservation of the fixed 766-file collection in private R2, authenticated conditional uploads, fresh-runner initialization and a separate full-stream read-only recovery. Both recoveries reproduced the selected acceptance and data exactly. The source collection remains private.

If the source repository is public, the two Canada archive workflows deliberately skip their jobs. Keep their private-repository guards. The archive remains in separate private R2 storage; the operator guide documents local `verify-selected` with owner-supplied process credentials for later integrity checks. Selected Canada state and chat attachments are excluded by tracked ignore rules, alongside the existing credentials, data and backup exclusions.

Coffee downloads belong in `data/raw/`, generated datasets in `data/processed/`, and local backups in `data/backups/`. Other reviewed products have separate generated roots under `data/products/<code>/`. These folders are ignored by Git. Add accuracy-check samples under `tests/fixtures/` so they can be versioned.

Store actual local credentials in `.env`, which is ignored by Git. An `.env.example` file can document required setting names without values. Automated jobs use GitHub Actions secrets; deployed backend functions use Cloudflare secrets. The Census key remains in the data processing environment.

The separate Canada archive snapshot command assesses only the retained, reviewed September 2024–August 2026 collection. It reads no trade ZIP bodies and makes no provider requests:

```powershell
npm run data:assess-country-snapshot -- --output data/backups/canada-country-audit/fresh-snapshot --preflight
npm run data:assess-country-snapshot -- --output data/backups/canada-country-audit/fresh-snapshot
```

The destination must be fresh, even if an existing directory is empty. New output is capped at 8 MiB. Exit zero means complete offline archive integrity, not a passed strict source audit or an accepted release. Current-reference failures remain visible, and the separate [classification ledger](docs/data-validation/1220-snapshot-classification.md) keeps unsupported comparisons unavailable. The command reads that ledger from the current committed Git version. Pages/chart data stay on the static host; downloads remain generated in the browser and R2 remains private backup storage.

## Canada audit status

The [Canada audit handoff](docs/data-validation/1220-audit-handoff.md) closes the fixed September 2024–August 2026 investigation under the approved archive-snapshot contract. All 48 contexts reconcile exactly, and all 17 ordinary classifications and their qualified offline comparisons are independently verified. The seven current-reference mismatches and earlier strict-audit failures remain preserved. Later owner-authorized milestones have accepted this fixed snapshot locally, preserved it in private R2 and added an opt-in accepted local profile. The fixed Canada snapshot is now published through the separately verified pilot; longer history and recurring-release acceptance remain later work. The snapshot command itself performs no acceptance.

## Local Canada development preview

The opt-in route is `/preview/countries/1220/`. It covers September 2024–August 2026 only; it is not an accepted country release or approval to publish. Noindex metadata controls presentation, not access. Ordinary builds exclude the route and its observations.

For synthetic data (including product fixtures):

```powershell
$env:TRADE_DATA_MODE = 'fixture'
$env:CANADA_PREVIEW_MODE = 'fixture'
npm run build
npm run preview -- --port 4402
```

For the reviewed retained Canada assessment and existing accepted product data:

```powershell
Remove-Item Env:TRADE_DATA_MODE -ErrorAction SilentlyContinue
$env:CANADA_PREVIEW_MODE = 'retained'
npm run build
npm run preview -- --port 4402
```

Retained mode reads only the fixed pinned local assessment. Missing, altered or incompatible input fails without a synthetic fallback. It reuses the previously reviewed replay; it makes no new provider request or ZIP replay. The retained inputs remain ignored and do not enter CI. Remove `CANADA_PREVIEW_MODE` for ordinary builds:

```powershell
Remove-Item Env:CANADA_PREVIEW_MODE -ErrorAction SilentlyContinue
npm run build
```

`npm run test:e2e` runs the ordinary browser suite, then the isolated Canada fixture suite. `npm run test:e2e:canada` runs just that fixture suite; it forces synthetic modes, uses its own temporary output, binds localhost on port 4402 (override with `PLAYWRIGHT_CANADA_PORT`), and refuses to reuse a server. CSVs remain generated in the browser. No deployment, accepted country pointer or R2 operation is included.

## Offline Canada release candidates

Node 24 can prepare the fixed September 2024–August 2026 collection under `canada-country-release-v1`. All ten pinned JSON evidence files must be available locally, including the historical independent receipts. The existing `data/backups/canada-country-release/` parent must be a normal directory inside this checkout. Each output child must be fresh. Preflight authenticates the evidence and checks the destination without creating files:

```powershell
npm run data:prepare-country-release -- --output data/backups/canada-country-release/candidate-1 --preflight
npm run data:prepare-country-release -- --output data/backups/canada-country-release/candidate-1
npm run data:recover-country-release -- --candidate data/backups/canada-country-release/candidate-1/candidate.json --output data/backups/canada-country-release/recovery-1
```

Preparation writes `candidate.json` and `candidate-report.json`. The portable package contains exactly ten authenticated evidence bodies plus the generated `research-data.json`; it excludes raw trade ZIPs, normalized rows and original classification documents. Recovery reads that package and reproduces its research data in a fresh directory, without requiring historical scratch locations. Preserve the separate private source collection as well: this package carries reviewed evidence and does not provide a fresh raw-source replay.

The seven gates are authenticated assessment, authenticated replay/arithmetic evidence, qualified classification scope, recorded reference qualifications, verified projection, portable recovery, and implementation review/checks/preservation. Preparation passes the first five and leaves the last two pending. An eligible candidate requires separate trusted operator proof of the actual recovery, checks, independent review, CI and unchanged runtime files. That offline record validates bindings; the parser does not authenticate GitHub or human consent independently.

The original strict audit remains failed. Both saved reference grids retain 41 matches and seven mismatches; original-publication checks retain seven matches and 41 unreviewed contexts. Comparisons cover 17 ordinary selected categories; three statistical categories retain totals with comparisons unavailable. Observation revision dates remain unknown, and selected categories are a subset of trade.

Prepared and eligible candidates have no effect on availability. **The candidate CLI does not select a release.** The local selection API requires separate owner authorization identifying the exact package, complete eligibility report and explicit initialization or expected prior pointer. Its outcome binds the complete selected pointer digest, including the approval-record identity. Accepted-state recovery additionally requires that recorded selected identity, its selection receipt and explicit recovery authorization; a backup alone is insufficient. The fixed snapshot's authorized selection and private preservation are now complete; public publication remains a separate decision.

Owner-authorized local selection has since completed for the fixed Canada candidate. Its package, acceptance, pointer and completion evidence are preserved privately. The [private archive guide](docs/validation/canada-private-archive.md) records that selected identity and the following preservation/recovery work; the fixed public profile has since been published under a separate concrete package decision, while successive-release acceptance remains separate from local selection.

The opt-in [accepted local Canada preview](docs/validation/canada-accepted-local-preview.md) at `/preview/accepted/countries/1220/` reads that authenticated selected release with `CANADA_ACCEPTED_PREVIEW_MODE=selected`. It labels local acceptance separately from publication and the immutable historical flags, preserves the source-qualified comparisons, and adds acceptance context to browser-generated CSVs. Fixture mode stays synthetic. Ordinary builds omit both private Canada preview routes; public launch acceptance remains open.

The [recovered-profile rehearsal](docs/validation/canada-recovered-profile-rebuild.md) rebuilt that Canada page from three authenticated state files in a fresh tracked-source export without the original research folders. All four browser CSVs matched the reviewed originals exactly. The export shared the existing dependency runtime and used visibly synthetic product fixtures; it was a local presentation recovery check, with no new provider operation or public release.

On failure, check Node 24, the fixed input identities and contained non-reparse paths. Never overwrite an existing destination, remove a stale selection lock automatically, or retry a conflict against a changed baseline. An acknowledged selection whose receipt cannot be saved reports the established outcome separately; lock cleanup cannot replace that evidence. Cleanup-only failures carry the outcome in `CountrySelectionCleanupError`; combined receipt/cleanup failures retain `CountrySelectionReceiptError` and its separate cleanup error. Accepted recovery preserves the exact selection receipt, completes all data/receipts before exposing its pointer, and carries an acknowledged but unreadable final state in `CountryAcceptedRecoveryError`. No automatic rollback occurs. Keep unreferenced artifacts for deliberate diagnosis. The [candidate validation record](docs/validation/canada-release-candidate.md) records the measured offline result. Product releases, the opt-in Canada preview and ordinary static-host/browser-download behavior remain unchanged.

## Local Canada pilot preparation

The opt-in `/countries/1220/` prepares the fixed historical snapshot for a possible pilot publication. It adds conditional homepage, navigation and Methods entries; it does not deploy the site. Both private preview modes must be unset. Real mode requires the authenticated selected Canada state and real accepted product releases; crossed or invalid modes fail without a fixture fallback.

```powershell
Remove-Item Env:CANADA_PREVIEW_MODE,Env:CANADA_ACCEPTED_PREVIEW_MODE -ErrorAction SilentlyContinue
Remove-Item Env:TRADE_DATA_MODE -ErrorAction SilentlyContinue
$env:CANADA_PILOT_MODE = 'selected'
npm run build
npm run preview -- --port 4416
```

For a clearly synthetic sample, set both `CANADA_PILOT_MODE` and `TRADE_DATA_MODE` to `fixture`. Run `npm run test:e2e:canada-pilot` for the separate isolated fixture suite. It binds localhost on 4403 (override with `PLAYWRIGHT_CANADA_PILOT_PORT`), uses its own output, and refuses server reuse. The original preview suite forces pilot mode off; the pilot suite forces private modes off. `npm run test:e2e` runs the ordinary, private-preview and pilot suites in sequence.

Remove `CANADA_PILOT_MODE` for ordinary builds. Preparation keeps `noindex,nofollow`; this is not access control or evidence of publication. Source coverage remains September 2024–August 2026, CSVs are browser-generated, and R2 stays private. Hosting/account changes, deployment, indexing and new data require their later decisions.

To reproduce the published historical-snapshot presentation locally, use the same authenticated real data and unset private modes:

```powershell
Remove-Item Env:CANADA_PREVIEW_MODE,Env:CANADA_ACCEPTED_PREVIEW_MODE -ErrorAction SilentlyContinue
Remove-Item Env:TRADE_DATA_MODE -ErrorAction SilentlyContinue
$env:CANADA_PILOT_MODE = 'snapshot'
npm run build
npm run preview -- --port 4422
```

This changes the page and CSV presentation context without changing the accepted snapshot or publishing it. The separate Pages templates, authenticated upload ZIP and private publication receipt belong to the [deployment plan](docs/superpowers/plans/2026-10-13-canada-pilot-deployment.md). They are not added to ordinary Astro output automatically. The initial exact package has now been published and verified; a later public replacement still requires its concrete package/target decision. The current GitHub checks build fixtures.

On the public Canada snapshot route, direction-aware links such as `/countries/1220/?direction=exports#country-history-heading` reopen Imports or Exports after JavaScript starts. Copy view link offers a selectable fallback if clipboard access is unavailable. Links use the snapshot available at the route; they do not pin an immutable release. Without JavaScript the page explains and shows default Imports.

Download chart PNG creates a 1,920 × 1,080 all-goods chart in the browser with the direction, measure, fixed period, source/capture context and historical qualifications. CSVs keep their existing contents and filenames. Private and locally prepared preview contexts retain their existing controls. See the [Canada sharing validation record](docs/validation/canada-research-sharing.md) for actual acceptance and publication status.
## Change workflow

Use `main` for reviewed release code and a separate branch for each feature or fix. Save focused commits with clear descriptions, run the relevant checks, and review changes before merging. Review a preview before publishing a website release.

Version data releases separately from code. Each data release should record its reporting period, retrieval date, and processing code version so published results can be checked and reproduced.

## Read-only live site verification

Use `npm run site:verify` after independently reviewing the build/package and observing the authorized deployment origin. It checks the canonical us-trade-tracker.pages.dev origin and one observed eight-hex deployment origin against the pinned existing site ZIP and schema-v1 manifest. It performs anonymous GETs only.

The command reuses the Python packager before making any HTTP request. It checks decoded response lengths/hashes, constrained same-origin redirects, noindex/nofollow headers and the four existing private/missing-route 404s. It does not upload, restore, discover Production assignment, approve a package or validate statistics. Retain the separate browser/numerical acceptance procedure.

From the repository root in PowerShell, supply the existing reviewed files and their independently recorded hashes:

```powershell
$env:SITE_PACKAGE_PYTHON = Read-Host 'Absolute path to existing Python 3.12+ executable'
$zipSource = Read-Host 'Path to reviewed site ZIP'
$manifestSource = Read-Host 'Path to its schema-v1 manifest'
$zipSha = Read-Host 'Recorded ZIP SHA-256'
$manifestSha = Read-Host 'Recorded manifest SHA-256'
$deploymentOrigin = Read-Host 'Previously observed https://<eight-hex>.us-trade-tracker.pages.dev origin'
$runRoot = Join-Path (Get-Location) ('.tmp/live-verification-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $runRoot | Out-Null
Copy-Item -LiteralPath $zipSource -Destination (Join-Path $runRoot 'site.zip')
Copy-Item -LiteralPath $manifestSource -Destination (Join-Path $runRoot 'site-manifest.json')
npm.cmd run site:verify -- --work-dir $runRoot --manifest (Join-Path $runRoot 'site-manifest.json') --zip (Join-Path $runRoot 'site.zip') --manifest-sha256 $manifestSha --zip-sha256 $zipSha --deployment-origin $deploymentOrigin --proof-root (Join-Path $runRoot 'proof')
if ($LASTEXITCODE -ne 0) { throw 'Live verification failed; inspect the private failure receipt if one was safely created.' }
```

A zero exit status requires every check to pass and receipt.json to be saved and read back. Failures exit nonzero; failed.json preserves partial results with safe error codes when an owned proof directory could be created. Unsafe or occupied proof destinations are rejected without overwriting evidence. A mismatch never triggers an upload or automatic restoration.

This pilot verifier accepts site packages only, at most 1,000 entries, 2 MiB total raw payload, a 4 MiB ZIP, a 1 MiB manifest and 128 logical checks across the two origins. It makes sequential requests, permits at most three redirects per check, uses 15-second request/body timeouts and a three-minute overall network deadline, and performs no retries. An overflowing decoded stream is cancelled without retaining the excess chunk; this is not an exact wire-transfer quota. Automated tests use fixtures and mocked HTTP, with no live site access. See the [verification record](docs/validation/live-site-verification.md).

The published **country-share history** adds selected-country monthly percentages of matching U.S. totals, exact monthly tables and sourced PNG/CSV downloads to both existing coffee profiles. It follows the existing direction/history/country filters and preserves zeros, gaps and classification boundaries. Independent review, the test-covered tiny-axis fix, exact-head CI, PR #103 merge and public acceptance passed. The site has31entries/1,873,448rawbytes. See the [verified public record](docs/validation/country-share-history.md#verified-public-update).

The published **merchandise download reliability** update snapshots PNG work to its activating view, suppresses obsolete results, retains keyboard focus while busy and enables direction/history/download controls only after saved filters restore. Independent review, exact-head CI, PR #105 merge and public acceptance passed. Checks cover 1,450 unit, 169 browser and 24 packaging tests, 24 public merchandise cases and four duty/share coexistence cases. The site retains 31 entries and 1,874,543 raw bytes. See the [verified public record](docs/validation/merchandise-download-reliability.md#verified-public-update).

## Private Mexico all-goods snapshot

Mexico has a privately accepted and archived **all-goods** snapshot, with a confirmed first local installation. Two remote recoveries and a separate local readback selected the same marker; existing Canada and four-product files are unchanged. [Evidence and limits](docs/data-validation/2010-private-acceptance-evidence.json) distinguish the accepted marker from unchanged historical candidate flags. No Mexico website or product comparison is enabled.

Use `npm run data:prepare-mexico-country-release -- --output data/backups/mexico-country-release/<fresh-name>` (optional `--preflight`) with the fixed private evidence and an existing output parent. `npm run data:recover-mexico-country-release -- --candidate <candidate.json> --output data/backups/mexico-country-release/<fresh-name>` needs only that package as data. Both require Node 24, reject occupied or linked output paths, and cannot accept or select a release. The separate [private acceptance/archive tooling](docs/validation/mexico-private-archive.md) performed the approved first installation; [readiness gates](docs/data-validation/2010-acceptance-readiness.md) still withhold public profiles and publication.
