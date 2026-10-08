# US Import Export Tracker

A commercial research website for understanding U.S. goods trade by product and partner country. Small import and export businesses are the primary audience, with public research pages also serving analysts and readers.

## Project direction

The planned website uses Astro, TypeScript, and React, starting on Cloudflare free hosting. Monthly Census releases will be processed into prepared pages and chart data. The initial hosting budget is US$0 to US$15 per month, excluding the domain and development work.

The project currently contains the launch brief and repository configuration. Website code and deployment will follow the reviewed development plan.

Read the [launch brief](docs/superpowers/specs/2026-10-08-us-trade-tracker-design.md) for features, data definitions, competition, and monetization.

## File management

Track website code, import scripts, project documents, public assets, dependency lockfiles, and small test fixtures in Git. Store large source datasets and prepared data archives in Cloudflare R2, with a separate backup.

Local downloads belong in `data/raw/`, generated datasets in `data/processed/`, and local archive backups in `data/backups/`. These folders are ignored by Git. Add sample data needed for accuracy checks under `tests/fixtures/` so it can be versioned.

Store actual local credentials in `.env`, which is ignored by Git. An `.env.example` file can document required setting names without values. Automated jobs use GitHub Actions secrets; deployed backend functions use Cloudflare secrets. The Census key remains in the data processing environment.

## Change workflow

Use `main` for reviewed release code and a separate branch for each feature or fix. Save focused commits with clear descriptions, run the relevant checks, and review changes before merging. Review a preview before publishing a website release.

Version data releases separately from code. Each data release should record its reporting period, retrieval date, and processing code version so published results can be checked and reproduced.
