# US Import Export Tracker

A commercial research website for understanding U.S. goods trade by product and partner country. Small import and export businesses are the primary audience, with public research pages also serving analysts and readers.

## Project direction

The planned website uses Astro, TypeScript, and React, starting on Cloudflare free hosting. Monthly Census releases will be processed into prepared pages and chart data. The initial hosting budget is US$0 to US$15 per month, excluding the domain and development work.

The first local development profile is verified with real Census data: roasted coffee (HS 090121), five years of import/export history through August 2026, comparison of up to three partner countries, and sourced PNG/CSV downloads. It includes an importer with validated releases, refresh recovery, and revision tracking. Independent reviewers checked all 9,577 observations, annual totals, country share and six-digit classification continuity. Offline tests use visibly labeled synthetic fixtures. See the [recorded verification](docs/data-validation/090121.md).

Read the [launch brief](docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md) for features, data definitions, competition, and monetization.

The coffee profile also includes “What changed?”: up to ten country increases and decreases over the latest twelve months versus the preceding twelve months, ranked by dollar change or country-share change in percentage points. It follows Imports/Exports and stays independent of chart country selections and history. Incomplete or classification-incompatible comparisons stay unavailable; a zero prior value has no growth percentage. The changes CSV includes the displayed rankings, both periods, units and source provenance.

**Estimated duties** on imports uses a separately validated 24-month duty history. Coffee's September 2024–August 2026 Census data, version 2 archive recovery and displayed comparisons passed acceptance and independent review; existing version 1 backups still recover their original bytes. The profile section follows country selection, shows monthly and rolling amounts with matching imports-for-consumption denominators, and generates a sourced CSV in the browser. Rolling shares use ratios of sums. RP70/79 affected dutiable value qualifies reported figures; missing coverage or incompatible periods withhold comparisons. See the [duty verification](docs/data-validation/090121-duties.md) and [approved requirements](docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md#approved-scope-additions).

The agreed pilot hosting approach keeps pages and chart data on the same static host, with CSV/PNG downloads generated in the browser. R2 remains private archive storage. Each completed Astro build reports its file count, uncompressed total size and largest file in the build log and, on GitHub Actions, the job summary. At 15,000 files it issues a non-blocking planning warning. Public R2 delivery is reserved for selected large datasets or bulk downloads when measured growth justifies it; ordinary pages stay on static hosting. See the [hosting direction](docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md#launch-resources-and-hosting-direction).

Run `npm run build:report` to measure an existing `dist/` without rebuilding, or `npm run build:report -- --dir path/to/output` for another output directory. Reports stay outside deployment assets. Build sizes are raw bytes before network compression.

The coffee profile uses a compact internal browser payload while preserving its canonical release and archive data. The verified local build reduced product HTML from 5.9 MB to 280 KB before compression and from 212 KB to 80 KB with gzip. Local median hydration improved from 269 ms to 126 ms; deployed performance remains to be measured. Calculations and browser CSV downloads stayed identical. See the [loading measurements and acceptance](docs/validation/coffee-profile-loading.md).

## Local development

Use Node 24 and npm. Install with `npm ci`.

For a labeled sample preview in PowerShell:

```powershell
$env:TRADE_DATA_MODE = 'fixture'
npm run dev
```

Open the displayed localhost URL, then `/products/090121/`. On Bash, use `TRADE_DATA_MODE=fixture npm run dev`. No Census key is needed for fixture mode. Normal mode requires a validated release and fails clearly if one is absent; it never silently substitutes sample values.

Run code checks with `npm test` and `npm run check`. For browser acceptance, install Chromium once with `npx playwright install chromium`, build using explicit fixture mode with `npm run build`, then run `npm run test:e2e`. Browser tests exercise real controls and downloads, mobile overflow, keyboard use, PNG failure recovery, and research without JavaScript.

## Census key in GitHub

The owner prefers a GitHub Actions repository secret. In repository **Settings → Secrets and variables → Actions → Secrets → New repository secret**, add `CENSUS_API_KEY` with the key as its value. Do not create an ordinary variable. See [GitHub's secret instructions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets).

The **Import Census data** workflow is manually triggered, retrieves only the coffee sample, and returns a downloadable public-data artifact. It does not publish a site, commit datasets, run on a monthly schedule, or expose the key to ordinary code-check jobs. GitHub requires this workflow file on the default branch before **Run workflow** becomes available ([manual workflow documentation](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)); merging remains a separate review decision.

After the reviewed workflow is available, choose a reporting month confirmed by the [official release calendar](https://www.census.gov/foreign-trade/schedule.html) and current release information, run it, and download `census-coffee-release`. The artifact has `processed/` and `raw/` directories: extract those into the ignored local `data/` folder, then run `npm run data:validate`. Artifacts expire after seven days, so retain the public source/archive separately. Remove `TRADE_DATA_MODE` or set it to `census` to preview the actual release. The key stays in GitHub.

The default manual workflow produces independent snapshots. The opt-in retained-release workflow restores the accepted baseline before importing, checks revisions against its exact original bytes, backs up the candidate, and conditionally advances a private R2 pointer. Owner setup and live August 2026 validation are complete: initial archiving, fresh-runner restoration, conditional promotion and recovery of both GitHub backups passed. See [archive setup, recovery and verification](docs/data-validation/090121-archive.md).

For an optional local import, put `CENSUS_API_KEY` in ignored `.env`, then run:

```text
npm run data:import -- --product 090121 --end YYYY-MM --months 60
npm run data:validate
```

The reporting month is required; it is never guessed from today's date. Each request has a 30-second timeout and at most two retries on 429/5xx responses, with at most two requests in flight. Missing country rows remain unavailable rather than becoming zero. A failed import preserves the current release. A lock prevents overlapping local imports; after an interrupted process, confirm no import is running before removing its stale `data/processed/.import.lock`.

For the validated duty extension, choose `include_duties=true` in the manual workflow. A local import uses `--duties` together with the reviewed `--classification data/classification/090121.json` evidence. Once the accepted baseline contains duties, later imports must retain this option; omission fails before fetching. Archived imports replay both source formats and recover the backed-up candidate offline before promotion.

See [live validation status](docs/data-validation/090121.md). The manual coffee workflow supplies `data/classification/090121.json`, reviewed for September 2021–August 2026. The CLI clips evidence to an earlier reporting month and never extends it into unreviewed months. Cross-period growth and totals crossing an unverified interval stay unavailable. Public launch still requires two successive official releases. Broad product discovery, deployment, advertising and subscriptions remain later work.

CSV exports include classification verification and line-break fields. Formula-looking text is prefixed with an apostrophe for safer spreadsheet opening; numeric dollar values remain numeric.

## File management

Track website code, import scripts, project documents, public assets, dependency lockfiles, and small test fixtures in Git. Store large source datasets and prepared data archives in Cloudflare R2, with a separate backup.

Local downloads belong in `data/raw/`, generated datasets in `data/processed/`, and local archive backups in `data/backups/`. These folders are ignored by Git. Add sample data needed for accuracy checks under `tests/fixtures/` so it can be versioned.

Store actual local credentials in `.env`, which is ignored by Git. An `.env.example` file can document required setting names without values. Automated jobs use GitHub Actions secrets; deployed backend functions use Cloudflare secrets. The Census key remains in the data processing environment.

## Change workflow

Use `main` for reviewed release code and a separate branch for each feature or fix. Save focused commits with clear descriptions, run the relevant checks, and review changes before merging. Review a preview before publishing a website release.

Version data releases separately from code. Each data release should record its reporting period, retrieval date, and processing code version so published results can be checked and reproduced.
