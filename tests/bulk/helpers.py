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
def fixed_record(width, fields):
    record = bytearray(b' ' * width)
    for start, value in fields.items():
        data = str(value).encode('ascii')
        record[start:start+len(data)] = data
    return bytes(record) + b'\r\n'


def table_fixture(value='1.0'):
    import calendar
    rows=[]
    for i in range(24):
        year,month=divmod(2024*12+8+i,12)
        rows.append(f'<tr><td>{calendar.month_name[month+1]} {year}</td><td>{value}</td><td>{value}</td><td>0.0</td></tr>')
    return ('<h1>Trade in Goods with Canada</h1><p>All figures are in millions of U.S. dollars on a nominal basis, not seasonally adjusted.</p><table><tr><th>Month</th><th>Exports</th><th>Imports</th><th>Balance</th></tr>'+''.join(rows)+'</table>').encode()


def archive_fixture(direction):
    importing = direction == 'imports'
    width, prefix = (688, 'IMP') if importing else (323, 'EXP')
    def detail(code, value, extra='01', country='1220'):
        fields = {0:code+'0000',10:country,14:extra,16:'01',18:'01',20:'00',22:'2024',26:'09',178:f'{value:015d}'} if importing else {0:extra[0],1:code+'0000',11:country,15:extra[1]+'1',17:'2024',21:'09',68:f'{value:015d}'}
        return fixed_record(width, fields)
    lines = [detail('090111',0,'AB' if importing else '11'), detail('090121',4,'01' if importing else '11'),detail('090121',6,'02' if importing else '21'), detail('980110',2,'01' if importing else '11'), detail('990100',0,'01' if importing else '11'),detail('090121',100,'01' if importing else '11','2010')]
    countries = [fixed_record(580 if importing else 280, {0:code,4:'Canada' if code=='1220' else 'Other',34:'2024',38:'09',130 if importing else 55:f'{value:015d}'}) for code,value in [('1220',12),('2010',100)]]
    descriptions = [fixed_record(206,{0:'090121',6:'Coffee'}),fixed_record(206,{0:'090111',6:''}), fixed_record(206,{0:'09    ',6:'Chapter'})]
    return {prefix+'_DETL.TXT': b''.join(lines), prefix+'_CTY.TXT': b''.join(countries), 'HSDESC.TXT': b''.join(descriptions)}
