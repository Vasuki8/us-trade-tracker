# US Import Export Tracker

A commercial research website for understanding U.S. goods trade by product and partner country. Small import and export businesses are the primary audience, with public research pages also serving analysts and readers.

## Project direction

The planned website uses Astro, TypeScript, and React, starting on Cloudflare free hosting. Monthly Census releases will be processed into prepared pages and chart data. The initial hosting budget is US$0 to US$15 per month, excluding the domain and development work.

The first local development profile is verified with real Census data: roasted coffee (HS 090121), five years of import/export history through August 2026, comparison of up to three partner countries, and sourced PNG/CSV downloads. It includes an importer with validated releases, refresh recovery, and revision tracking. Independent reviewers checked all 9,577 observations, annual totals, country share and six-digit classification continuity. Offline tests use visibly labeled synthetic fixtures. See the [recorded verification](docs/data-validation/090121.md).

The second real profile is **green coffee, not decaffeinated (HS 090111)**, available at `/products/090111/` and through the homepage profile links. Its five-year trade history and 24-month estimated-duty dataset passed source replay, six-digit classification review, product-specific offline recovery and local browser checks. It has 6,929 trade observations and 1,524 duty observations; absent country months remain unavailable. The existing shared profile supplies direction/country comparisons and sourced downloads. See the [green coffee verification and limitations](docs/data-validation/090111.md).

The **Product research** directory at `/products/` lists the reviewed, published pilot profiles. Search by product name, source description or HS code, then confirm the description, reporting month and retrieval date before opening the matching profile. Search runs locally; all profile links remain available without JavaScript. The main navigation opens this directory. Normal mode lists the two accepted coffee profiles; explicit fixture mode lists the two labeled synthetic profiles. At that milestone the Census build contained **13 files and 923,164 uncompressed bytes**; the directory added one file and measured 7,738 bytes. See the [directory acceptance](docs/validation/pilot-product-directory.md).

Read the [launch brief](docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md) for features, data definitions, competition, and monetization.

The coffee profile also includes “What changed?”: up to ten country increases and decreases over the latest twelve months versus the preceding twelve months, ranked by dollar change or country-share change in percentage points. It follows Imports/Exports and stays independent of chart country selections and history. Incomplete or classification-incompatible comparisons stay unavailable; a zero prior value has no growth percentage. The changes CSV includes the displayed rankings, both periods, units and source provenance.

The standalone **Monthly changes** pages provide the same verified country comparisons with their own Imports/Exports controls, sourced CSV download and matching profile link. `/changes/` preserves the roasted-coffee default; `/changes/090111/` covers green coffee. A profile's navigation keeps its product, and the changes pages link between the reviewed products, including without JavaScript. Changing product starts with imports ranked by dollars. These remain within-product country rankings over two rolling twelve-month periods. The current Census build contains **14 files and 1,015,387 uncompressed bytes**; the green-coffee changes page is 90,540 bytes. See the [original coffee page acceptance](docs/validation/coffee-monthly-changes.md) and [product-specific changes acceptance](docs/validation/product-monthly-changes.md).

The **Coffee release briefing** at `/briefing/` summarizes latest-month imports and exports against the same month one year earlier, highlights the largest comparable annual country changes by dollars, and shows world estimated duties with consumption denominators and reporting qualifications. It links to the detailed research and carries reporting/source dates. The static page works without JavaScript and measures 7 KB before compression, with no React island or interactive payload. See the [briefing acceptance](docs/validation/coffee-release-briefing.md).

**Shareable profile views** save Imports/Exports, the history window and up to three countries in the URL. “Copy view link” provides a selectable fallback when clipboard copying is unavailable. Country highlights on the profile, Monthly changes and briefing open matching twelve-month profile views. Links use the latest available dataset; an unavailable or invalid selection explains the fallback to default imports. Without JavaScript, the initial research remains the default view and explicitly explains this limitation. See the [saved-view acceptance](docs/validation/coffee-profile-view-links.md).

The **country picker** searches partner names or codes and keeps selected countries visible above the results, with accessible removal controls. Search only narrows the picker; selected chart data, duties, rankings, downloads and shared links keep their existing meaning. See the [country-picker acceptance](docs/validation/coffee-country-picker.md).

The **selected country comparison** shows each chosen country's current/prior values, dollar change, growth, U.S. shares and share change, in selection order. Its default compares two rolling twelve-month periods; **Latest month** compares the reporting month with the same month one year earlier, using matching monthly U.S. totals. It follows Imports/Exports and country selections while keeping its periods independent of chart history and ranking controls. Copied links retain the period choice; older links keep the annual default. Missing or incompatible comparisons stay unavailable, and its browser-generated CSV includes the period type, both U.S. denominators and source details. National headline cards explicitly say **U.S. total**. That milestone's retained-Census build contained eleven files and 687,195 uncompressed bytes. See the [annual summary acceptance](docs/validation/coffee-selected-country-comparison.md) and [monthly comparison acceptance](docs/validation/coffee-monthly-country-comparison.md).

**Estimated duties** on imports uses a separately validated 24-month duty history. Coffee's September 2024–August 2026 Census data, version 2 archive recovery and displayed comparisons passed acceptance and independent review; existing version 1 backups still recover their original bytes. The profile section follows country selection, shows monthly and rolling amounts with matching imports-for-consumption denominators, and generates a sourced CSV in the browser. Rolling shares use ratios of sums. RP70/79 affected dutiable value qualifies reported figures; missing coverage or incompatible periods withhold comparisons. See the [duty verification](docs/data-validation/090121-duties.md) and [approved requirements](docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md#approved-scope-additions).

The agreed pilot hosting approach keeps pages and chart data on the same static host, with CSV/PNG downloads generated in the browser. R2 remains private archive storage. Each completed Astro build reports its file count, uncompressed total size and largest file in the build log and, on GitHub Actions, the job summary. At 15,000 files it issues a non-blocking planning warning. Public R2 delivery is reserved for selected large datasets or bulk downloads when measured growth justifies it; ordinary pages stay on static hosting. See the [hosting direction](docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md#launch-resources-and-hosting-direction).

Run `npm run build:report` to measure an existing `dist/` without rebuilding, or `npm run build:report -- --dir path/to/output` for another output directory. Reports stay outside deployment assets. Build sizes are raw bytes before network compression.

The coffee profile uses a compact internal browser payload while preserving its canonical release and archive data. The verified local build reduced product HTML from 5.9 MB to 280 KB before compression and from 212 KB to 80 KB with gzip. Local median time from navigation through a completed direction change improved from 404 ms to 271 ms; deployed performance remains to be measured. Calculations and browser CSV downloads stayed identical. See the [loading measurements and acceptance](docs/validation/coffee-profile-loading.md).

## Local development

Use Node 24 and npm. Install with `npm ci`.

For a labeled sample preview in PowerShell:

```powershell
$env:TRADE_DATA_MODE = 'fixture'
npm run dev
```

Open the displayed localhost URL, then `/products/090121/`. Explicit fixture mode also includes `/products/090122/`, labeled **Synthetic second product**, to check shared profiles. On Bash, use `TRADE_DATA_MODE=fixture npm run dev`. No Census key is needed. Normal mode builds the published registry and requires each product's own validated release; it never silently substitutes sample values. Normal Census mode publishes the two accepted coffee profiles; each requires its own validated release. See the [multi-product foundation acceptance](docs/validation/multi-product-foundation.md).

Run code checks with `npm test` and `npm run check`. For browser acceptance, install Chromium once with `npx playwright install chromium`, build using explicit fixture mode with `npm run build`, then run `npm run test:e2e`. Browser tests exercise real controls and downloads, mobile overflow, keyboard use, PNG failure recovery, and research without JavaScript.

## Census key in GitHub

The owner prefers a GitHub Actions repository secret. In repository **Settings → Secrets and variables → Actions → Secrets → New repository secret**, add `CENSUS_API_KEY` with the key as its value. Do not create an ordinary variable. See [GitHub's secret instructions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets).

The **Import Census data** workflow is manually triggered and accepts a reviewed `product_code`, defaulting to `090121`. Roasted coffee (`090121`) and green coffee (`090111`, not decaffeinated) are both reviewed and accepted. See the [green coffee verification record](docs/data-validation/090111.md). The workflow returns a downloadable public-data artifact. It does not publish a site, commit datasets, run on a monthly schedule, or expose the key to ordinary code-check jobs. GitHub requires this workflow file on the default branch before **Run workflow** becomes available ([manual workflow documentation](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)).

Choose a reporting month confirmed by the [official release calendar](https://www.census.gov/foreign-trade/schedule.html) and current release information, run with `product_code=090121`, and download `census-090121-release`. The artifact has `processed/` and `raw/` directories: extract those into ignored `data/`, then run `npm run data:validate -- --product 090121`. Green coffee uses `data/products/090111/`; other reviewed products use `data/products/<code>/`. Keep their files separate. Artifacts expire after seven days, so retain the public source/archive separately. Remove `TRADE_DATA_MODE` or set it to `census` to preview the actual release. The key stays in GitHub.

The default manual workflow produces independent snapshots. The opt-in retained-release workflow restores the accepted baseline before importing, checks revisions against its exact original bytes, backs up the candidate, and conditionally advances a private R2 pointer. Owner setup and live August 2026 validation are complete: initial archiving, fresh-runner restoration, conditional promotion and recovery of both GitHub backups passed. See [archive setup, recovery and verification](docs/data-validation/090121-archive.md).

For an optional local import, put `CENSUS_API_KEY` in ignored `.env`, then run:

```text
npm run data:import -- --product 090121 --end YYYY-MM --months 60
npm run data:validate
```

The reporting month is required; it is never guessed from today's date. Each request has a 30-second timeout and at most two retries on 429/5xx responses, with at most two requests in flight. Missing country rows remain unavailable rather than becoming zero. A failed import preserves the current release. A lock prevents overlapping local imports; after an interrupted process, confirm no import is running before removing its stale `data/processed/.import.lock`.

For the validated duty extension, choose `include_duties=true` in the manual workflow. A local import uses `--duties` together with the reviewed `--classification data/classification/090121.json` evidence. Once the accepted baseline contains duties, later imports must retain this option; omission fails before fetching. Archived imports replay both source formats and recover the backed-up candidate offline before promotion.

The separate **Audit product estimated duties** workflow checks 24 months without accepting or promoting a release. Select a reviewed, importable `product_code` (`090121` by default, or `090111`) and a confirmed reporting month. It validates these inputs before accessing the Census key and retains `census-<code>-duty-audit`; raw records, the duty dataset and the report stay in that product's `.tmp/duty-audit/<code>/` directory. An audit can precede publication and duty acceptance; passing reconciliation alone does not verify classification continuity or enable a product's duties.

The product-aware workflow passed a live coffee recheck on October 10, 2026. All 96 retained source records and 1,887 duty observations reconciled, the downloaded artifact matched GitHub's digest, and independent comparison found no changes from the accepted coffee data. See the [live recheck evidence](docs/data-validation/090121-duties.md#october-10-product-aware-workflow-recheck). The audit left the accepted release and R2 archive unchanged.

With a locally configured Census key, the matching command is `npm run data:audit-duties -- --product 090121 --end YYYY-MM`. Omitting `--product` preserves the coffee default. `--output directory` chooses an explicit evidence directory; keep previous evidence and use a fresh directory for a rerun. Existing audit output is never overwritten. The old default `.tmp/duty-audit/` is not rewritten or migrated; new default output is `.tmp/duty-audit/090121/`.

See [live validation status](docs/data-validation/090121.md). The manual coffee workflow supplies `data/classification/090121.json`, reviewed for September 2021–August 2026. The CLI clips evidence to an earlier reporting month and never extends it into unreviewed months. Cross-period growth and totals crossing an unverified interval stay unavailable. Public launch still requires two successive official releases. Broad product discovery, deployment, advertising and subscriptions remain later work.

CSV exports include classification verification and line-break fields. Formula-looking text is prefixed with an apostrophe for safer spreadsheet opening; numeric dollar values remain numeric.

## File management

Track website code, import scripts, project documents, public assets, dependency lockfiles, and small test fixtures in Git. Store large source datasets and prepared data archives in Cloudflare R2, with a separate backup.

Coffee downloads belong in `data/raw/`, generated datasets in `data/processed/`, and local backups in `data/backups/`. Other reviewed products have separate generated roots under `data/products/<code>/`. These folders are ignored by Git. Add accuracy-check samples under `tests/fixtures/` so they can be versioned.

Store actual local credentials in `.env`, which is ignored by Git. An `.env.example` file can document required setting names without values. Automated jobs use GitHub Actions secrets; deployed backend functions use Cloudflare secrets. The Census key remains in the data processing environment.

## Change workflow

Use `main` for reviewed release code and a separate branch for each feature or fix. Save focused commits with clear descriptions, run the relevant checks, and review changes before merging. Review a preview before publishing a website release.

Version data releases separately from code. Each data release should record its reporting period, retrieval date, and processing code version so published results can be checked and reproduced.
