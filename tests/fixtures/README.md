# Development fixtures

These files contain synthetic observations shaped like the Census HS API. Their dates and dollar values are invented for correctness checks, not real trade statistics. The country codes and HS code are identifiers used by the application. A fixture build must visibly say **Development sample data** and must never be used as a published data release.

`census-imports.json` includes a world total, individual countries, a regional grouping and a district row. `census-exports.json` uses the separate export measure. Tests add malformed, missing and duplicated observations to verify rejection and gaps.
