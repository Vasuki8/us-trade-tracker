# Development fixtures

These files contain synthetic observations shaped like the Census HS API. Their dates and dollar values are invented for correctness checks, not real trade statistics. The country codes and HS code are identifiers used by the application. A fixture build must visibly say **Development sample data** and must never be used as a published data release.

`census-imports.json` includes a world total, individual countries, a regional grouping and a district row. `census-exports.json` uses the separate export measure. Tests add malformed, missing and duplicated observations to verify rejection and gaps.

The browser preview's `product-release.json` includes one deliberately missing Canada import observation in July 2024. Its table cell is unavailable and its chart line has a gap; the later twelve-month partner totals remain complete.

## Estimated-duty audit fixtures

The four `census-duty-*.json` tables are entirely synthetic. They contain $12 in national duty, $200 in consumption value, $120 in dutiable value and $40 in RP70/79 dutiable value. Canada and Italy partition those totals; the European Union grouping is excluded. They prove aggregation and missing-data behavior, not live coffee coverage.
