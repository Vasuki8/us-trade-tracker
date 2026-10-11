from dataclasses import replace
from pathlib import Path
import hashlib
import sys
import tempfile
import unittest
import zipfile
from helpers import archive_fixture, archive_inventory_fixture, layout_fixture
REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0,str(REPO))
from scripts.country_bulk.model import Limits, contexts
from scripts.country_bulk.sources import validate_layout
from scripts.country_bulk.model import Budget
from scripts.country_bulk.storage import EvidenceStore
try:
    from scripts.country_bulk.contracts import amount, parse_archive
except ImportError:
    amount = parse_archive = None

class ContractsTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(parse_archive, 'Archive parser missing')
        self.tmp = tempfile.TemporaryDirectory(dir=REPO/'.tmp')
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name)/'sample.zip'

    def parse(self, direction='imports', members=None, limits=None):
        with zipfile.ZipFile(self.path,'w',zipfile.ZIP_DEFLATED) as archive:
            for name,data in (members or archive_fixture(direction)).items():
                archive.writestr(name,data)
        context = contexts()[0 if direction == 'imports' else 1]
        return parse_archive(self.path,context,validate_layout(layout_fixture(direction),direction),limits or Limits())

    def test_exact_aggregation_preserves_zeros_specials_dimensions_and_null_descriptions(self):
        for direction in ('imports','exports'):
            result = self.parse(direction)
            self.assertEqual({r.commodity:r.value_usd for r in result.rows}, {'090111':0,'090121':10,'980110':2,'990100':0})
            self.assertEqual((result.sum_usd,result.country_total_usd,result.residual_usd),(12,12,0))
            self.assertEqual(result.full_key_count,6)
            self.assertEqual(result.rows[1].detail_record_count,2)
            self.assertIsNone(result.rows[0].description)
            self.assertIsNone(result.rows[-1].description)
            self.assertTrue(result.rows[-1].special)
            self.assertEqual(len(result.members),3)

    def test_ascii_space_padding_preserves_nonempty_monthly_integers(self):
        for raw, expected in ((b'        1776057',1776057),(b'              0',0),(b'12             ',12),(b' 12            ',12),(b'000000000000012',12)):
            with self.subTest(raw=raw): self.assertEqual(amount(raw),expected)

    def test_numeric_padding_does_not_admit_blank_signed_or_malformed_fields(self):
        for raw in (b' '*15,b'             -1',b'             +1',b'           1 23',b'            1.2',b'\t             1',b'\xff             1',b'1'*14,b'1'*16):
            with self.subTest(raw=raw), self.assertRaisesRegex(ValueError,'invalid-monthly-value'): amount(raw)

    def test_invalid_monthly_values_outside_canada_still_fail_the_archive(self):
        for direction in ('imports','exports'):
            prefix='IMP' if direction=='imports' else 'EXP'
            for member,width,start in ((prefix+'_DETL.TXT',688 if direction=='imports' else 323,178 if direction=='imports' else 68),(prefix+'_CTY.TXT',580 if direction=='imports' else 280,130 if direction=='imports' else 55)):
                members=archive_fixture(direction);data=bytearray(members[member])
                # The last record belongs to the other country, not Canada.
                offset=len(data)-(width+2)+start;data[offset:offset+15]=b' '*15;members[member]=bytes(data)
                with self.subTest(direction=direction,member=member), self.assertRaisesRegex(ValueError,'invalid-monthly-value'):
                    self.parse(direction,members)

    def test_global_duplicates_other_countries_and_context_drift_fail(self):
        for name, change in [('duplicate',lambda data:data+data[-690:]),('month',lambda data:data[:26]+b'10'+data[28:]),('identity',lambda data:b'X'+data[1:]),('negative',lambda data:data[:178]+b'-00000000000001'+data[193:])]:
            members=archive_fixture('imports'); members['IMP_DETL.TXT']=change(members['IMP_DETL.TXT'])
            with self.subTest(name=name), self.assertRaises(ValueError): self.parse(members=members)
        members=archive_fixture('exports');members['EXP_DETL.TXT']=b'3'+members['EXP_DETL.TXT'][1:]
        with self.assertRaises(ValueError): self.parse('exports',members)

    def test_record_width_ascii_crlf_and_huge_no_newline_are_bounded_failures(self):
        for data in (b'x'*1000000,b'x'*688+b'\n',b'\xff'+b' '*687+b'\r\n',b' '*687+b'\r\n'):
            members=archive_fixture('imports');members['IMP_DETL.TXT']=data
            with self.subTest(size=len(data)), self.assertRaises(ValueError): self.parse(members=members)

    def test_inventory_country_and_description_ambiguities_fail(self):
        cases=[]
        for kind in ('missing','case','nested','unsafe','country-duplicate','description-duplicate'):
            members=archive_fixture('imports')
            if kind=='missing': del members['IMP_CTY.TXT']
            if kind=='case': members['imp_detl.txt']=members['IMP_DETL.TXT']
            if kind=='nested': members['folder/IMP_DETL.TXT']=members.pop('IMP_DETL.TXT')
            if kind=='unsafe': members['../other.txt']=b'bad'
            if kind=='country-duplicate': members['IMP_CTY.TXT']+=members['IMP_CTY.TXT'][:582]
            if kind=='description-duplicate': members['HSDESC.TXT']+=members['HSDESC.TXT'][:208]
            cases.append((kind,members))
        for kind,members in cases:
            with self.subTest(kind=kind), self.assertRaises(ValueError): self.parse(members=members)

    def test_member_declared_bytes_key_and_safe_sum_caps_fail(self):
        for limits in (replace(Limits(),archive_members=2),replace(Limits(),archive_uncompressed_bytes=10),replace(Limits(),detail_keys=5)):
            with self.assertRaises(ValueError): self.parse(limits=limits)
        members=archive_fixture('imports')
        data=bytearray(members['IMP_DETL.TXT']); data[178:193]=b'               ';members['IMP_DETL.TXT']=bytes(data)
        with self.assertRaises(ValueError): self.parse(members=members)

    def test_128_member_archives_reconcile_under_default_limits(self):
        for direction in ('imports', 'exports'):
            with self.subTest(direction=direction):
                try:
                    result = self.parse(direction, archive_inventory_fixture(direction, 128))
                except ValueError as error:
                    self.fail(f'Valid 128-member {direction} archive rejected: {error}')
                self.assertEqual(result.observations['archiveMembers'], 128)
                self.assertEqual((result.sum_usd, result.country_total_usd, result.residual_usd), (12, 12, 0))
                self.assertEqual(len(result.members), 3)

    def test_129_member_archives_are_rejected_under_default_limits(self):
        for direction in ('imports', 'exports'):
            with self.subTest(direction=direction), self.assertRaisesRegex(ValueError, 'archive-member-cap'):
                self.parse(direction, archive_inventory_fixture(direction, 129))

    def test_exact_residual_is_reported_separately(self):
        members=archive_fixture('imports');data=bytearray(members['IMP_CTY.TXT']);data[130:145]=b'000000000000013';members['IMP_CTY.TXT']=bytes(data)
        result=self.parse(members=members)
        self.assertEqual(result.residual_usd,-1)

    def test_encryption_crc_truncation_and_unsafe_sum_fail(self):
        self.parse()
        original=self.path.read_bytes()
        for kind in ('encrypted','crc','truncated'):
            damaged=bytearray(original)
            if kind=='truncated': damaged=damaged[:-24]
            else:
                central=damaged.index(b'PK\x01\x02')
                if kind=='encrypted': damaged[central+8] |= 1
                else: damaged[central+16] ^= 1
            self.path.write_bytes(damaged)
            with self.subTest(kind=kind), self.assertRaises(ValueError):
                parse_archive(self.path,contexts()[0],validate_layout(layout_fixture('imports'),'imports'),Limits())
        members=archive_fixture('imports');data=bytearray(members['IMP_DETL.TXT'])
        data[178:193]=b'999999999999999';members['IMP_DETL.TXT']=bytes(data)
        # Fifteen digits are individually safe; make ten distinct rows to overflow the aggregate.
        rows=[]
        for i in range(10):
            row=bytearray(data[:690]);row[14:16]=f'{i:02d}'.encode();rows.append(bytes(row))
        members['IMP_DETL.TXT']=b''.join(rows)
        with self.assertRaises(ValueError): self.parse(members=members)

    def test_worker_staging_obeys_grant_even_when_store_has_room(self):
        from scripts.country_bulk.worker import write_worker_result
        result=self.parse();store=EvidenceStore(Path(self.tmp.name),Budget())
        with self.assertRaises(ValueError): write_worker_result(result,store,10)
        self.assertLessEqual(sum(p.stat().st_size for p in Path(self.tmp.name).glob('*.json')),10)
        self.assertEqual(store.budget.generated_bytes,sum(p.stat().st_size for p in Path(self.tmp.name).glob('*.json')))

if __name__=='__main__': unittest.main()
