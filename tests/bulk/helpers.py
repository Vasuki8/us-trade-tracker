"""Synthetic evidence fixtures; never copies the production publication ledger."""
def publication_projection():
    pins = [dict(countryCode='1220', month=f'2026-{month:02d}', direction='exports', measure='ALL_VAL_MO', url=f'https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_26{month:02d}.pdf', publicationDate='2026-09-03', pdfPage=53, printedPage='- 5 -', table='FT900 supplement, Exhibit 4', column='monthly', units='nominal USD millions, not seasonally adjusted', quantumUsd=100000, valueUsd=100000, bytes=100, sha256='a'*64) for month in range(1, 8)]
    return {'schemaVersion': 1, 'countryCode': '1220', 'publications': pins}
