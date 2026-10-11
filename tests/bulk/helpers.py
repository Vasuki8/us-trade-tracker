"""Synthetic evidence fixtures; never copies the production publication ledger."""
def publication_projection():
    pins = [dict(countryCode='1220', month=f'2026-{month:02d}', direction='exports', measure='ALL_VAL_MO', url=f'https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_26{month:02d}.pdf', publicationDate='2026-09-03', pdfPage=53, printedPage='- 5 -', table='FT900 supplement, Exhibit 4', column='monthly', units='nominal USD millions, not seasonally adjusted', quantumUsd=100000, valueUsd=100000, bytes=100, sha256='a'*64) for month in range(1, 8)]
    return {'schemaVersion': 1, 'countryCode': '1220', 'publications': pins}


def layout_fixture(direction):
    if direction == 'imports':
        tables = [('IMP_DETL.TXT', 688, [('commodity',1,10),('cty_code',11,14),('cty_subco',15,16),('dist_entry',17,18),('dist_unlad',19,20),('rate_prov',21,22),('year',23,26),('month',27,28),('gen_val_mo',179,193)]), ('IMP_CTY.TXT',580,[('cty_code',1,4),('cty_name',5,34),('year',35,38),('month',39,40),('gen_val_mo',131,145)])]
    else:
        tables = [('EXP_DETL.TXT',323,[('df',1,1),('commodity',2,11),('cty_code',12,15),('district',16,17),('year',18,21),('month',22,23),('all_val_mo',69,83)]), ('EXP_CTY.TXT',280,[('cty_code',1,4),('cty_name',5,34),('year',35,38),('month',39,40),('all_val_mo',56,70)])]
    tables.append(('HSDESC.TXT',206,[('commodity',1,6),('descriptn',7,156)]))
    return ('<html>'+''.join(f'<p>FILENAME: {name}</p><p>FIX FORMATTED ASCII FILE RECORD LENGTH: {width}</p><table>'+''.join(f'<tr><td>{start}-{end}</td><td>{field}</td><td>description</td></tr>' for field,start,end in fields)+'</table>' for name,width,fields in tables)+'</html>').encode()
