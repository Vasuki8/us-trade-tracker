"""Bounded fixed-record ZIP validation across all countries before Canada aggregation."""
from collections import Counter, defaultdict
import hashlib
from pathlib import PurePosixPath
import re
import zipfile
from .model import ArchiveResult, HS6Row, safe_integer, contexts, require


def amount(raw):
    require(len(raw)==15 and raw.isdigit(), 'invalid-monthly-value')
    return safe_integer(int(raw))


def parse_archive(path, context, layout, limits):
    require(context in contexts() and layout.direction==context.direction, 'crossed-archive-context')
    prefix = 'IMP' if context.direction=='imports' else 'EXP'
    calendar = context.month.replace('-','').encode('ascii')
    receipts = {}
    try:
        with zipfile.ZipFile(path) as archive:
            inventory=archive.infolist()
            require(len(inventory)<=limits.archive_members, 'archive-member-cap')
            require(sum(entry.file_size for entry in inventory)<=limits.archive_uncompressed_bytes, 'archive-size-cap')
            names=set()
            for entry in inventory:
                canonical=entry.filename.replace('\\','/').casefold()
                parts=PurePosixPath(canonical)
                require(not parts.is_absolute() and not any(part in ('.','..') for part in canonical.split('/')) and ':' not in canonical and '\x00' not in canonical, 'unsafe-member-name')
                require(canonical not in names, 'ambiguous-member-name')
                names.add(canonical)
                require(not entry.flag_bits & 1, 'encrypted-member')

            def records(name,width):
                matches=[entry for entry in inventory if entry.filename.casefold()==name.casefold()]
                require(len(matches)==1, 'missing-selected-root-member')
                member=matches[0];digest=hashlib.sha256();size=count=0
                with archive.open(member) as stream:
                    while True:
                        line=stream.read(width+2)
                        if not line: break
                        require(len(line)==width+2 and line.endswith(b'\r\n') and line[:-2].isascii(), 'invalid-record-framing')
                        digest.update(line);size+=len(line);count+=1
                        yield line[:-2]
                require(size==member.file_size, 'member-byte-mismatch')
                receipts[name]={'actualMember':member.filename,'bytes':size,'records':count,'recordWidthExcludingCRLF':width,'sha256':digest.hexdigest(),'crc32':f'{member.CRC:08x}','CRCVerifiedAtEOF':True}

            country_keys=set();totals=[]
            for row in records(prefix+'_CTY.TXT',layout.country_width):
                require(row[:4].isdigit() and row[34:40]==calendar, 'country-identity-or-calendar')
                key=row[:4]+row[34:40]
                require(key not in country_keys, 'duplicate-country-total');country_keys.add(key)
                value=amount(row[slice(*layout.country_value)])
                if row[:4]==b'1220':
                    require(row[4:34].strip().lower()==b'canada', 'country-name-mismatch')
                    totals.append(value)
            require(len(totals)==1, 'missing-country-total')
            descriptions={};description_keys=set();levels=Counter()
            for row in records('HSDESC.TXT',206):
                code=row[:6].strip(b' ')
                require(code.isdigit() and len(code) in (2,4,6), 'invalid-description-identity')
                require(code not in description_keys, 'duplicate-description');description_keys.add(code);levels[str(len(code))]+=1
                if len(code)==6: descriptions[code.decode('ascii')]=row[6:156].decode('ascii').strip() or None
            keys=set();values=defaultdict(int);counts=Counter();dimensions=Counter();df_values=defaultdict(int);zeros=0
            for row in records(prefix+'_DETL.TXT',layout.detail_width):
                if context.direction=='imports':
                    require(row[:14].isdigit() and row[16:28].isdigit() and row[22:28]==calendar, 'detail-identity-or-calendar')
                    require(bool(re.fullmatch(rb'[A-Z0-9][A-Z0-9*+ ]',row[14:16])), 'invalid-program-subcode')
                    key,country,code,dimension=row[:28],row[10:14],row[:6],row[14:16]
                else:
                    require(row[:23].isdigit() and row[:1] in (b'1',b'2') and row[17:23]==calendar, 'detail-identity-or-calendar')
                    key,country,code,dimension=row[:23],row[11:15],row[1:7],row[:1]
                require(key not in keys, 'duplicate-global-detail-key');keys.add(key)
                require(len(keys)<=limits.detail_keys, 'detail-key-cap')
                value=amount(row[slice(*layout.detail_value)])
                if country==b'1220':
                    code=code.decode('ascii');dimension=dimension.decode('ascii')
                    values[code]=safe_integer(values[code]+value);counts[code]+=1;dimensions[dimension]+=1;zeros+=value==0
                    if context.direction=='exports': df_values[dimension]=safe_integer(df_values[dimension]+value)
            total=safe_integer(sum(values.values()))
            rows=tuple(HS6Row(code,descriptions.get(code),value,counts[code],code.startswith(('98','99'))) for code,value in sorted(values.items()))
            return ArchiveResult(context,rows,total,totals[0],total-totals[0],receipts,len(keys),{'archiveMembers':len(inventory),'declaredUncompressedBytes':sum(e.file_size for e in inventory),'descriptionCountsByCodeLength':dict(levels),'dimensions':dict(sorted(dimensions.items())),'exportDfTotals':dict(sorted(df_values.items())),'zeroDetailRecords':zeros,'zeroHS6Rows':sum(r.value_usd==0 for r in rows),'canadaDetailRecords':sum(counts.values()),'missingDescriptionCodes':[r.commodity for r in rows if r.description is None]})
    except (zipfile.BadZipFile, NotImplementedError, RuntimeError, EOFError) as error:
        raise ValueError('invalid-zip') from error
