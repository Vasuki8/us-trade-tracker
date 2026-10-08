# US Trade Tracker Launch Brief

Prepared October 8, 2026. This brief defines a proposed first release for a commercial website using free official U.S. trade data. The recommendation is to serve small import and export businesses with product and country research, while giving analysts and readers accessible public pages. Advertising comes first; subscriptions later fund recurring business workflows. Demand, traffic, and willingness to pay remain hypotheses to validate.

## Audience and positioning

The primary business user needs to answer: Where does the U.S. source this product? Which countries are gaining share? Where are U.S. exports growing? What changed since the previous release?

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
| Monthly changes page | Find large changes by dollar value, growth, and country share, with the comparison period visible |
| Monthly briefing | Read a short, reviewed account of the latest release with links to the supporting charts |
| Shareable charts and tables | Download a chart image or its displayed data, including source, period, units, and retrieval date |
| Methods and release information | Understand definitions, revisions, coverage, and when the next official release is scheduled |

Start with HS six digit product categories and national country comparisons. A default chart shows five years when comparable history exists. Product classifications can change; break or label incompatible series rather than implying continuous coverage. Search results show the official description so a visitor can check the match.

Use year over year changes and rolling twelve month totals as the main comparisons. Show absolute dollar changes alongside percentages; show a percentage as unavailable when its prior value is zero or missing. Country share means that country's share of U.S. imports or exports for the selected product. Export destination rankings describe U.S. sales abroad, not a destination's total worldwide demand.

The changes page initially compares the latest rolling twelve months with the preceding twelve months, separately for imports and exports. Rank products by dollar change or percentage growth, and rank country share changes within a selected product in percentage points. For percentage growth rankings, include only products with at least $10 million in the preceding twelve month period. Display this initial editorial threshold and revise it if pilot users find it unhelpful. Describe growing flows as research leads rather than proof of profitability.

## Data foundation and reliability

Census offers monthly international trade API series from January 2010 onward, updates them on release day, and revises prior statistics. API queries currently require a key. The first release will use these national product and country series with monthly refreshes. The schedule should follow the [official release calendar](https://www.census.gov/foreign-trade/schedule.html). [Census API documentation](https://www.census.gov/data/developers/data-sets/international-trade.html).

Use general import customs value and total export value as the default merchandise measures, with definitions visible. Keep direction, classification, geography, time period, and measure attached to every observation. Do not combine totals with their constituent categories. [Import field definitions](https://api.census.gov/data/timeseries/intltrade/imports/hs/variables.html), [export field definitions](https://api.census.gov/data/timeseries/intltrade/exports/hs/variables.html).

The data flow is: retrieve official observations, retain the source response and retrieval date, validate coverage and definitions, calculate comparisons, then publish pages and downloads. Publish a new release only after validation. If refresh fails, retain the last successful release and display its date. Preserve missing and suppressed values instead of converting them to zero. Refresh affected history when revisions arrive, and mark revised figures.

The product and country pages describe goods trade in current dollars and are not seasonally adjusted. The national goods and services headline uses a different scope and statistical basis. If quoted in a briefing, give it a separate label and direct source; do not calculate it by adding our product pages. [Joint Census and BEA release](https://www.census.gov/foreign-trade/Press-Release/current_press_release/index.html).

Attribute original observations to Census and derived rankings or commentary to this website. Display the Census notice prominently: “This product uses the Census Bureau Data API but is not endorsed or certified by the Census Bureau.” [Census API terms](https://www.census.gov/data/developers/about/terms-of-service.html).

## Revenue strategy

Public research pages and monthly briefings build reach for advertising. Keep ads away from filters, definitions, and chart controls so research remains usable. Launch with a small set of useful, reviewed pages rather than generating thousands of near identical pages. This follows the emphasis on original value in [Google's helpful content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

Advertising income depends on traffic and actual page revenue per thousand views. For illustration, 100,000 monthly page views at a $10 page RPM produce about $1,000. The traffic and RPM are assumptions, not a forecast or a benchmark for this niche. [AdSense page RPM definition](https://support.google.com/adsense/answer/190515).

Validate subscription demand while developing the public site; substantial ad revenue need not precede customer research. A later paid pilot should offer a saved product portfolio, consolidated monthly change reports, configurable monitoring, and reusable comparisons. Charge for time saved and recurring work. Start with manual sample reports to test value before building billing and automation. Price remains a customer research decision.

## Features to defer

Defer shipment records, named suppliers and buyers, contact lists, tariff and landed cost calculations, global trade coverage, forecasting, company investment signals, state and port analysis, and a daily newsroom. Census's public aggregate coverage does not expose individual trading businesses. Quantity and average unit value tools can follow once their reporting units and availability are handled correctly; average unit value is not a supplier quote. [Census coverage reference](https://www.census.gov/foreign-trade/reference/products/UTOAvailableData.pdf).

## Validation and launch sequence

1. Interview ten small import or export businesses and a few analysts or journalists. Ask them to demonstrate recent research and monitoring tasks. These sample sizes are planning choices, not statistically representative research.
2. Prototype a product profile, a country comparison, and a monthly changes page. Test the same tasks against DataWeb or USA Trade Online. Choose one pilot product sector based on observed demand rather than committing to an industry now.
3. Release a small public pilot after checking it against official values. Measure successful research tasks, organic visits, chart downloads, and return visits after the next monthly release. Separate business use from general readership.
4. Offer sample portfolio briefings to repeat business users. Build subscriptions when customers demonstrate recurring value and willingness to pay. If users only need occasional free lookups, reconsider the paid offer.

First release acceptance requires correct sample values, working product and country comparisons, source and period labels on every chart and download, clear missing data behavior, readable mobile layouts, and a successful update across two successive releases. A second release is necessary to verify the ongoing publishing workflow, even if the initial pilot is already public.

## Launch resources and hosting direction

The initial monthly hosting budget is US$0 to US$15, excluding the domain and development work. The owner already has a Census API key and a Cloudflare free account. These resources are available for the project; deployment configuration has not yet been completed.

The agreed development direction is Astro with TypeScript and React for interactive charts, starting with Cloudflare free hosting. Prepare public pages and chart data during release processing so routine visits require little backend work. Preserve source files and prepared data in R2 Standard storage, and use GitHub Actions for monthly processing within its included allowance. These are proposed service configurations, not existing deployments. [Cloudflare pricing](https://developers.cloudflare.com/workers/platform/pricing/), [R2 pricing](https://developers.cloudflare.com/r2/pricing/), [GitHub Actions allowances](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

Aim to launch a small pilot within free allowances and retain the budget as headroom. Measure a representative data import before committing to full coverage. Increase spending when processing, storage, performance, or personalized workflows require it; traffic growth alone is not an upgrade trigger. Paid services and publication require a separate deployment decision.

The first development milestone is one product profile using real Census data, with a country comparison and a downloadable sourced chart. A paid database, accounts, and billing remain deferred. Operating costs are usage dependent; the budget is a target rather than a provider enforced spending cap.
