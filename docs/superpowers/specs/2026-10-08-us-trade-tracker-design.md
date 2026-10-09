# US Trade Tracker Launch Brief

Prepared October 8, 2026. Revised October 9, 2026, including the approved estimated-duty scope. This brief defines a proposed first release for a commercial website using free official U.S. trade data. The recommendation is to serve small import and export businesses with product and country research, while giving analysts and readers accessible public pages. Subscriptions are the primary revenue goal; public pages and monthly briefings build trust and reach, while advertising is secondary. Demand, traffic, and willingness to pay remain hypotheses to validate.

## Approved scope additions

1. **Correct the labels to Estimated duties.** Describe Census calculated duties without claiming they are the final amounts actually paid by importers.
2. **Validate and extend the data pipeline.** Add duty measures, check product and country coverage and rate-provision aggregation, and verify archive recovery for both existing and extended releases.
3. **Build the duty comparisons.** Show monthly figures and rolling totals with matching consumption-value denominators, complete comparison periods, reporting qualifications, and sourced downloads.

These approved requirements are implemented and independently verified for the coffee sample. See the [duty acceptance record](../../data-validation/090121-duties.md), including reporting qualifications, unavailable country months and recovery evidence.

## Audience and positioning

The primary business user needs to answer: Where does the U.S. source this product? Which countries are gaining share? Where are U.S. exports growing? How have estimated duties on recorded imports changed? What changed since the previous release?

Analysts, journalists, researchers, and interested readers use the same underlying pages to understand trade trends, download sourced charts, and share findings. Investors can research sector and country flows; company exposure and investment forecasts require additional evidence.

Proposed positioning: **Understand what changed in U.S. goods trade and what it means for the products and markets you follow.**

## Competition and the opportunity

These are verified examples of existing capabilities, followed by our proposed response. A competitor's documentation does not establish that it lacks other features.

| Competitor | What it already offers | Implication for this website |
| --- | --- | --- |
| [USITC DataWeb](https://www.usitc.gov/applications/dataweb/about) | Detailed official trade queries, saved queries, commodity and country groups, and monthly email reports | Basic downloads and alerts alone are weak reasons to subscribe |
| [USA Trade Online](https://usatradeonline.census.gov/) | Census trade research and report building | Easier interpretation must add value beyond access to official data |
| [ITC Trade Map](https://www.trademap.org/Index.aspx) and [Global Trade Helpdesk](https://globaltradehelpdesk.org/) | International market research and practical market access information | A broad claim to help businesses find markets is already well served |
| [OEC through Datawheel](https://www.datawheel.us/projects) | Trade visualizations and economic data products | Attractive charts alone are insufficient differentiation |
| [Trading Economics](https://tradingeconomics.com/united-states/balance-of-trade) | Headline trade charts, historical data, forecasts, and release information | A generic trade dashboard will face established alternatives |
| [ImportYeti](https://www.importyeti.com/pricing/supply-chain), [ImportGenius](https://www.importgenius.com/pricing), and [Panjiva](https://www.spglobal.com/market-intelligence/en/solutions/products/panjiva-supply-chain-intelligence) | Company and shipment research | Census aggregate statistics cannot replace supplier or buyer discovery |

The strongest gap hypotheses are a faster path from a product name to a useful comparison, a clear explanation of meaningful changes, and one recurring briefing covering a business's selected products. Test these against existing tools with actual users. Avoid claiming that competitors do not offer them.

## First release

Use one shared set of product and country statistics, with different entry points for businesses and readers. All first release features are public and free; accounts, billing, and personalized email delivery belong to later stages.

| Feature | What the visitor can do |
| --- | --- |
| Product search and profiles | Search by product description or code, confirm the classification, and see U.S. imports and exports over time with leading partner countries |
| Country profiles | See U.S. goods trade with one country, its largest product categories, and changes in their share |
| Country comparison | Compare up to three partner countries for the same product, direction, and period |
| Estimated duties | See monthly calculated duties on U.S. imports by product and partner country, in dollars and as a share of consumption value, with rolling totals and period comparisons |
| Monthly changes page | Find large changes by dollar value, growth, and country share, with the comparison period visible |
| Monthly briefing | Read a short, reviewed account of the latest release with links to the supporting charts |
| Shareable charts and tables | Download a chart image or its displayed data, including source, period, units, and retrieval date |
| Methods and release information | Understand definitions, revisions, coverage, and when the next official release is scheduled |

Start with HS six digit product categories and national country comparisons. A default chart shows five years when comparable history exists. Product classifications can change; break or label incompatible series rather than implying continuous coverage. Search results show the official description so a visitor can check the match.

Use year over year changes and rolling twelve month totals as the main comparisons. Show absolute dollar changes alongside percentages; show a percentage as unavailable when its prior value is zero or missing. Country share means that country's share of U.S. imports or exports for the selected product. Export destination rankings describe U.S. sales abroad, not a destination's total worldwide demand.

The changes page initially compares the latest rolling twelve months with the preceding twelve months, separately for imports and exports. Rank products by dollar change or percentage growth, and rank country share changes within a selected product in percentage points. For percentage growth rankings, include only products with at least $10 million in the preceding twelve month period. Display this initial editorial threshold and revise it if pilot users find it unhelpful. Describe growing flows as research leads rather than proof of profitability.

### Estimated duties

The feature applies to U.S. imports only. Use **Estimated duties** as the feature label and **Calculated duties as share of import value** for the derived percentage, identifying the denominator as imports for consumption. Display the latest monthly duty amount, consumption value and duty share, alongside monthly history and rolling twelve month figures. Compare the latest twelve complete months with the preceding twelve complete months; show dollar changes and duty-share changes in percentage points. A monthly year over year comparison requires both matching months to be available and compatible.

- **Measures:** retrieve `CAL_DUT_MO` (calculated duties), `CON_VAL_MO` (imports for consumption total value) and `DUT_VAL_MO` (dutiable value) from the [Census imports HS endpoint](https://api.census.gov/data/timeseries/intltrade/imports/hs/variables.html). Retain the product, country, month and rate-provision dimensions needed to check coverage.
- **Denominators:** monthly duty share is `100 × CAL_DUT_MO / CON_VAL_MO`. A rolling duty share is `100 × sum(CAL_DUT_MO) / sum(CON_VAL_MO)` over the same complete period, product and geography. Use the ratio of sums rather than an average of monthly percentages. General import value remains the default merchandise measure but cannot be used as the duty denominator. A share of dutiable value, if displayed, must be labeled separately.
- **Availability:** preserve missing, suppressed and reported zero values distinctly. A zero or missing consumption denominator makes the duty share unavailable. Incomplete or classification-incompatible periods make their comparisons unavailable. Percentage growth is unavailable when the prior duty amount is zero or missing.
- **Reporting coverage:** inspect rate-provision codes 70 and 79, for which Census reports dutiable value without calculating duty. Preserve reported duty zeros while flagging the affected coverage; do not interpret those zeros as proof of duty-free trade. Record affected dutiable value and its share so users can assess the qualification. Show qualified figures with their coverage information and withhold comparisons when the data cannot support them. [Census rate-provision codes](https://www.census.gov/foreign-trade/reference/rpcodes.html).
- **Interpretation:** calculated duties can differ from amounts actually paid, exclude antidumping and countervailing duties, and can be understated where no duty is calculated. Do not claim these figures establish final payments or later refunds. Changes in duty share can reflect the mix of imports and reporting coverage as well as tariff changes. [Census duty methodology](https://www.census.gov/foreign-trade/guide/sec2.html).
- **Downloads and labels:** include the product, country, monthly or rolling period, numerator and denominator measures, units, reporting qualifications, source, retrieval date and processing version. Keep duties distinct from import value and country share. Downloads continue to generate in the browser.

## Data foundation and reliability

Census offers monthly international trade API series from January 2010 onward, updates them on release day, and revises prior statistics. API queries currently require a key. The first release will use these national product and country series with monthly refreshes. The schedule should follow the [official release calendar](https://www.census.gov/foreign-trade/schedule.html). [Census API documentation](https://www.census.gov/data/developers/data-sets/international-trade.html).

Use general import customs value and total export value as the default merchandise measures, with definitions visible. Keep direction, classification, geography, time period, and measure attached to every observation. Do not combine totals with their constituent categories. [Import field definitions](https://api.census.gov/data/timeseries/intltrade/imports/hs/variables.html), [export field definitions](https://api.census.gov/data/timeseries/intltrade/exports/hs/variables.html).

The duty extension must validate at least 24 consecutive months for the coffee sample before accepting two rolling twelve month comparisons. September 2024–August 2026 is verified for coffee, aligned with its merchandise release; available country observations and national totals reconcile, while absent country months remain unavailable. Check product totals, country totals and rate-provision breakdowns against the retained source responses for subsequent releases. Reconcile totals with their disjoint breakdowns without adding total rows to component rows or including country groupings as individual countries. The [Census query guide](https://www.census.gov/foreign-trade/reference/guides/Guide_to_International_Trade_Datasets.pdf) documents product, country and rate-provision summary levels; live responses must confirm their usable coverage.

Extend processing and release validation to distinguish merchandise values, consumption values, duties and coverage information explicitly. Existing profile and country-change calculations must continue to select their intended merchandise measure after new measures are introduced. Retain the exact raw responses, query definitions without credentials, retrieval dates and processing versions for reproducibility.

Version changes to release and archive formats. Preserve immutable existing archives and provide recovery for both the existing trade-value format and the extended duty format. Acceptance requires restoring an existing archive and a new duty archive without a Census connection, checking the restored source and processed bytes against their recorded checksums, and reproducing the duty comparisons from the restored data. A failed validation, backup or recovery check must preserve the last accepted release.

The data flow is: retrieve official observations, retain the source response and retrieval date, validate coverage and definitions, calculate comparisons, then publish pages and downloads. Publish a new release only after validation. If refresh fails, retain the last successful release and display its date. Preserve missing and suppressed values instead of converting them to zero. Refresh affected history when revisions arrive, and mark revised figures.

The product and country pages describe goods trade in current dollars and are not seasonally adjusted. The national goods and services headline uses a different scope and statistical basis. If quoted in a briefing, give it a separate label and direct source; do not calculate it by adding our product pages. [Joint Census and BEA release](https://www.census.gov/foreign-trade/Press-Release/current_press_release/index.html).

Attribute original observations to Census and derived rankings or commentary to this website. Display the Census notice prominently: “This product uses the Census Bureau Data API but is not endorsed or certified by the Census Bureau.” [Census API terms](https://www.census.gov/data/developers/about/terms-of-service.html).

## Revenue strategy

Public research pages and monthly briefings build trust and reach for a future subscription offer. Advertising is secondary; whether it can cover hosting remains a revenue hypothesis. Keep ads away from filters, definitions, and chart controls so research remains usable. Launch with a small set of useful, reviewed pages rather than generating thousands of near identical pages. This follows the emphasis on original value in [Google's helpful content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

Advertising income depends on traffic and actual page revenue per thousand views. For illustration, 100,000 monthly page views at a $10 page RPM produce about $1,000. The traffic and RPM are assumptions, not a forecast or a benchmark for this niche. [AdSense page RPM definition](https://support.google.com/adsense/answer/190515).

Validate subscription demand from the first interviews, while developing the public site; substantial ad revenue need not precede customer research. Offer manual sample portfolio briefings early, including estimated duties when verified, to test recurring value before building billing and automation. A later paid pilot should offer a saved product portfolio, consolidated monthly change reports, configurable monitoring, and reusable comparisons. Charge for time saved and recurring work. Price remains a customer research decision.

## Features to defer

Defer shipment records, named suppliers and buyers, contact lists, tariff and landed cost calculators for specific shipments, global trade coverage, forecasting, company investment signals, state and port analysis, and a daily newsroom. Estimated duties on recorded imports are included in the first release; they do not provide a shipment quote or classification advice. Census's public aggregate coverage does not expose individual trading businesses. Quantity and average unit value tools can follow once their reporting units and availability are handled correctly; average unit value is not a supplier quote. [Census coverage reference](https://www.census.gov/foreign-trade/reference/products/UTOAvailableData.pdf).

## Validation and launch sequence

1. Interview ten small import or export businesses and a few analysts or journalists. Ask them to demonstrate recent research and monitoring tasks, and offer manual sample portfolio briefings to interested businesses alongside those interviews. These sample sizes are planning choices, not statistically representative research.
2. Prototype a product profile, a country comparison, estimated duties, and a monthly changes page. Validate the coffee duty series and recovery before accepting its monthly and rolling comparisons. Test the same research tasks against DataWeb or USA Trade Online. Choose one pilot product sector based on observed demand rather than committing to an industry now.
3. Release a small public pilot after checking it against official values. Measure successful research tasks, organic visits, chart downloads, and return visits after the next monthly release. Separate business use from general readership.
4. Continue sample portfolio briefings for repeat business users. Build subscriptions when customers demonstrate recurring value and willingness to pay. If users only need occasional free lookups, reconsider the paid offer.

First release acceptance requires correct sample values, working product and country comparisons, source and period labels on every chart and download, clear missing data behavior, readable mobile layouts, and a successful update across two successive releases. A second release is necessary to verify the ongoing publishing workflow, even if the initial pilot is already public.

Estimated-duty acceptance also requires independently checked monthly amounts and weighted rolling duty shares, matching consumption denominators, visible reporting qualifications, correct unavailable behavior, and recovery of both archive formats. The label must remain **Estimated duties** across the profile, comparisons, downloads and methods. Record the live evidence before marking this feature complete; approval of the scope is not verification of coffee duty coverage.

## Launch resources and hosting direction

The initial monthly hosting budget is US$0 to US$15, excluding the domain and development work. The owner already has a Census API key and a Cloudflare free account. These resources are available for the project; deployment configuration has not yet been completed.

The agreed development direction is Astro with TypeScript and React for interactive charts, starting with Cloudflare free hosting. Prepare public pages and chart data during release processing so routine visits require little backend work. Keep pilot pages and chart data on the same static host, with CSV and PNG downloads generated in the browser. Private R2 Standard archiving and recovery are verified for both coffee merchandise and duty-enabled releases; public deployment and automatic monthly processing remain pending. Use GitHub Actions within its included allowance. [Cloudflare pricing](https://developers.cloudflare.com/workers/platform/pricing/), [R2 pricing](https://developers.cloudflare.com/r2/pricing/), [GitHub Actions allowances](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

The approved hosting approach is:

1. Keep pages and chart data on the same static host, with private R2 backup storage.
2. Generate CSV and PNG downloads in the browser rather than storing each country, period and chart combination.
3. Measure every completed build: report file count, uncompressed total size and largest file in its log and GitHub Actions job summary. Issue a non-blocking planning warning at 15,000 files.
4. Use public R2 selectively if measured growth requires it. Large datasets or bulk downloads are candidates; ordinary pages remain on static hosting.

The optimized duty-enabled coffee profile reduced product HTML by 95.3% and gzip bytes by 62.3%, with identical calculations and CSV downloads; see the [local loading evidence](../../validation/coffee-profile-loading.md). With the standalone coffee Monthly changes page added on October 9, 2026, the retained-Census build contains ten files and 658,679 bytes before compression. The product HTML remains the largest file at 279,660 bytes; the changes page is 96,195 bytes, or an estimated 16,174 bytes with gzip. See the [page acceptance](../../validation/coffee-monthly-changes.md). Continue measuring transfer, parsing and interaction costs before broad coverage and deployment. The [Cloudflare Pages Free limit](https://developers.cloudflare.com/pages/platform/limits/) is 20,000 files and 25 MiB per asset. The planning warning does not enforce provider limits or authorize a hosting upgrade; review actual counts and sizes before deployment. A stored file is not needed for every chart selection or generated download.

Aim to launch a small pilot within free allowances and retain the budget as headroom. Measure a representative data import before committing to full coverage. Increase spending when processing, storage, performance, or personalized workflows require it; traffic growth alone is not an upgrade trigger. Paid services and publication require a separate deployment decision.

The first product profile, country comparison, sourced downloads, country-change prototype, standalone Monthly changes page, coffee release briefing and estimated-duty comparisons are verified locally for coffee. The static briefing separates latest-month year-over-year trade from annual partner highlights and includes qualified duty figures, sources and research links; it works without JavaScript. With the briefing added, the retained-Census build contains eleven files and 666,681 uncompressed bytes; the briefing is 7,159 bytes before compression. See the [briefing acceptance](../../validation/coffee-release-briefing.md). The approved duty pipeline and both archive formats passed live acceptance; their implementation and follow-up fixes are merged. Product discovery, cross-product change rankings and broader country profiles remain later development milestones. A paid database, accounts, and billing remain deferred. Operating costs are usage dependent; the budget is a target rather than a provider enforced spending cap.
