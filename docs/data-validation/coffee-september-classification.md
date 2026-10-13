# Coffee classification review for September 2026

Reviewed October 13, 2026. The retained official references support continued six-digit comparability for **090111** (non-roasted, non-decaffeinated coffee) and **090121** (roasted, non-decaffeinated coffee) across the reviewed September import editions and current export definitions. The separately approved importer update now extends both classification intervals through September 2026. Accepted trade datasets still report August; no September trade observations are accepted by this preparation.

## Import classification

The [USITC archive](https://www.usitc.gov/harmonized_tariff_information/hts/archive/list?page=0) lists Revision 17 as the August baseline and Revisions 18, 19 and 20 during September. Its displayed dates are publication labels, not conclusions about when tariff provisions took legal effect.

| Official HTS edition | Archive label date | Coffee hierarchy compared |
| --- | --- | --- |
| [Revision 17](https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_17_json.json) | August 24, 2026 | Baseline |
| [Revision 18](https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_18_json.json) | September 2, 2026 | Same as baseline |
| [Revision 19](https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_19_json.json) | September 15, 2026 | Same as baseline |
| [Revision 20](https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_20_json.json) | September 28, 2026 | Same as baseline |

Each comparison covers all 55 rows from heading 0901 through the row before 0902, including unnumbered parent descriptions. The code, indentation, description and quantity-unit fields match exactly across the four editions. Within that hierarchy, 090111 retains six ten-digit descendants and 090121 retains eight; every descendant reports kilograms. The hierarchy continues to distinguish roasting and decaffeination, so neither aggregate crosses into decaffeinated coffee or another six-digit product.

The freshly retrieved 2026 Census import concordance matches the previously retained source digest. It contains eight 090111 detail codes and ten 090121 detail codes, including two per product absent from the reviewed HTS editions. These reference snapshots contain historical detail: their rows must not be treated as simultaneously active or summed to create the HS6 total. The existing importer requests Census's six-digit aggregate directly. This comparison addresses product definitions and quantity units; it makes no claim that tariff rates or estimated duties remained constant.

## Export classification

The current [2026 Schedule B Chapter 9](https://www.census.gov/foreign-trade/schedules/b/2026/c09.pdf), printed page 3, places 0901110000 under non-roasted, non-decaffeinated coffee and 0901210010/0901210050 under roasted, non-decaffeinated coffee. Their quantity unit is kilograms. The rendered table and extracted text agree on those parent relationships.

The [Schedule B index](https://www.census.gov/foreign-trade/schedules/b/index.html) currently lists 2026 obsolete-code guides for [January](https://www.census.gov/foreign-trade/schedules/b/2026/jan_obsoletetonew.pdf), [February](https://www.census.gov/foreign-trade/schedules/b/2026/feb_obsoletetonew.pdf) and [July](https://www.census.gov/foreign-trade/schedules/b/2026/July_obsoletetonew.pdf). None of their eleven pages contains a 0901 code. These guides are supporting references; the Schedule B manual supplies the actual export definitions. The freshly retrieved export concordance matches its previously retained digest and the three coffee detail definitions.

## Evidence and remaining release gates

The [evidence extract](coffee-september-classification-evidence.json) pins all twelve retained original lengths and SHA-256 hashes, the complete-hierarchy comparison results, current detail-code sets, concordance matches and PDF checks. Its August interval identities and `acceptedIntervalExtended=false` describe the earlier source-review stage; the record remains unchanged after this separate configuration update. An independent reviewer reproduced the source checks and inspected the export table; no open findings remained in that review. Original files, analysis, render and review receipts are retained in private local backups. This review extends the August baseline check without repeating the earlier September 2021–August 2026 investigation.

The approved configuration update changes only each interval's end from August to September, retaining the September 2021 start and public Census reference URL. Earlier August imports still clip coverage to August, while October remains outside the reviewed interval. Classification comparability supports later validation; it supplies neither source observations nor evidence of a completed refresh.

Before a September candidate run, recheck the official publication and classification notices and confirm September API coverage. Census currently schedules [September data for November 4, 2026 at 8:30 a.m. Eastern](https://www.census.gov/foreign-trade/schedule.html); the [current FT900 release](https://www.census.gov/foreign-trade/Press-Release/current_press_release/ft900.pdf) still reports August. The accepted coffee releases, Canada snapshot, R2 objects and public deployment remain unchanged.

The existing `candidate_only=true` control can then prepare a baseline-aware candidate for review, with `archive_to_r2=true`, `initialize_archive=false` and `include_duties=true` on `main`, after the live operation is authorized. A ready candidate does not establish acceptance: source reconciliation, revision review, backup recovery, displayed monthly/rolling values and a decision on the exact candidate still precede promotion. Canada remains a fixed historical snapshot without a promised monthly update.
