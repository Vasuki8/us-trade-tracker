"""Provider-free tests for retained artifact identity and bounded extraction."""
import copy
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import struct
import tempfile
import time
import unittest
from unittest.mock import patch
import zipfile

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location('retained', ROOT / 'scripts/retained_product_artifact.py')
retained = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(retained)


def encoded(value):
    return json.dumps(value, separators=(',', ':')).encode()


def digest(value):
    return hashlib.sha256(value).hexdigest()


class ArtifactTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.pin = dict(productCode='090240', reportingMonth='2026-08', runId=12, attempt=1,
                        processingCommit='a' * 40, artifactId=34, artifactBytes=0,
                        artifactSha256='', releaseId='2026-08-test', retrievedAt='2026-10-18T06:40:02.423Z')
        release = encoded(dict(schemaVersion=2, productCode='090240', reportingMonth='2026-08',
                               codeVersion='a' * 40, retrievedAt=self.pin['retrievedAt']))
        pointer = encoded(dict(releaseFile='releases/2026-08-test.json'))
        self.pin.update(releaseSha256=digest(release), pointerSha256=digest(pointer))
        self.members = {'processed/current.json': pointer, 'processed/releases/2026-08-test.json': release}
        for year in range(2021, 2027):
            for month in range(1, 13):
                period = f'{year}-{month:02}'
                if not '2021-09' <= period <= '2026-08':
                    continue
                for direction in ['imports', 'exports']:
                    for level in ['HS', 'HSCY']:
                        self.members[f'raw/2026-08-test/{direction}-{period}-{level}.json'] = self.capture(direction)
                if period >= '2024-09':
                    for level in ['HS', 'HSCY', 'HSRP', 'HSCYRP']:
                        self.members[f'raw/2026-08-test/duties-{period}-{level}.json'] = self.capture('imports')
        self.bundle = encoded({'retained': 'synthetic bundle'})
        self.pin.update(bundleBytes=len(self.bundle), bundleSha256=digest(self.bundle))
        self.candidate = dict(schemaVersion=2, productCode='090240',
                              run=dict(schemaVersion=2, productCode='090240', reportingMonth='2026-08', baseline=None),
                              reference=dict(key='trade/v1/products/090240/releases/2026-08-test.json', sha256=digest(self.bundle)),
                              bundleFile='bundle.json')

    def capture(self, direction):
        return encoded(dict(retrievedAt=self.pin['retrievedAt'], httpStatus=200,
                            requestUrl=f'https://api.census.gov/data/timeseries/intltrade/{direction}/hs?time=2026-08',
                            payload=[['heading'], ['value']]))

    def archive(self, members=None):
        path = self.root / 'input.zip'
        with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as archive:
            for name, body in (self.members if members is None else members).items():
                archive.writestr(name, body)
        body = path.read_bytes()
        self.pin.update(artifactBytes=len(body), artifactSha256=digest(body))
        return path

    def test_exact_source_grid_extracts_only_after_validation(self):
        result = retained.authenticate_source(self.archive(), self.pin, self.root / 'out')
        self.assertEqual(result['files'], 338)
        self.assertEqual(len(list((self.root / 'out').rglob('*.json'))), 338)

    def test_source_byte_or_digest_mismatch_leaves_no_output(self):
        for field, value in [('artifactBytes', 1), ('artifactSha256', 'f' * 64)]:
            with self.subTest(field=field):
                path = self.archive()
                self.pin[field] = value
                with self.assertRaises(retained.RetainedError):
                    retained.authenticate_source(path, self.pin, self.root / 'out')
                self.assertFalse((self.root / 'out').exists())

    def test_missing_extra_and_unsafe_members_fail_before_writes(self):
        for bad in [None, '../escape', '/absolute', 'C:/drive', 'raw\\bad', 'unlisted.json',
                    'processed/CURRENT.json', 'raw//empty.json']:
            with self.subTest(bad=bad):
                members = dict(self.members)
                if bad is None:
                    members.pop('processed/current.json')
                else:
                    members[bad] = b'{}'
                with self.assertRaises(retained.RetainedError):
                    retained.authenticate_source(self.archive(members), self.pin, self.root / 'out')
                self.assertFalse((self.root / 'out').exists())

    def test_duplicate_symlink_encrypted_crc_and_truncated_fail_closed(self):
        for mutation in ['duplicate', 'symlink', 'encrypted', 'crc', 'truncated']:
            with self.subTest(mutation=mutation):
                path = self.archive()
                if mutation in ['duplicate', 'symlink']:
                    with zipfile.ZipFile(path, 'a') as archive:
                        if mutation == 'duplicate':
                            archive.writestr('processed/current.json', b'{}')
                        else:
                            info = zipfile.ZipInfo('raw/link')
                            info.create_system = 3
                            info.external_attr = (0o120777 << 16)
                            archive.writestr(info, '../elsewhere')
                else:
                    body = bytearray(path.read_bytes())
                    if mutation == 'truncated':
                        body = body[:-24]
                    elif mutation == 'encrypted':
                        pos = body.index(b'PK\x01\x02')
                        body[pos + 8:pos + 10] = struct.pack('<H', 1)
                    else:
                        pos = body.index(b'PK\x03\x04')
                        offset = pos + 30 + struct.unpack_from('<H', body, pos + 26)[0] + struct.unpack_from('<H', body, pos + 28)[0]
                        body[offset] ^= 0x40
                    path.write_bytes(body)
                body = path.read_bytes()
                self.pin.update(artifactBytes=len(body), artifactSha256=digest(body))
                with self.assertRaises(retained.RetainedError):
                    retained.authenticate_source(path, self.pin, self.root / 'out')
                self.assertFalse((self.root / 'out').exists())

    def test_raw_json_identity_and_credentials_fail_before_extraction(self):
        name = 'raw/2026-08-test/imports-2026-08-HS.json'
        for value in [b'not json', b'{"x":1,"x":2}', b'{"x":NaN}',
                      self.capture('exports').replace(b'2026-10-18', b'2026-10-19'),
                      self.capture('imports').replace(b'?time=', b'?key=secret&time=')]:
            with self.subTest(value=value[:20]):
                members = dict(self.members, **{name: value})
                with self.assertRaises(retained.RetainedError) as caught:
                    retained.authenticate_source(self.archive(members), self.pin, self.root / 'out')
                self.assertNotIn('secret', str(caught.exception))
                self.assertFalse((self.root / 'out').exists())

    def test_occupied_output_and_symlink_parent_rejected(self):
        path = self.archive()
        (self.root / 'out').mkdir()
        with self.assertRaises(retained.RetainedError):
            retained.authenticate_source(path, self.pin, self.root / 'out')
        self.assertEqual(list((self.root / 'out').iterdir()), [])

    def test_declared_and_actual_size_caps(self):
        members = dict(self.members)
        members['processed/current.json'] = b' ' * (32 * 1024 * 1024 + 1)
        with self.assertRaises(retained.RetainedError):
            retained.authenticate_source(self.archive(members), self.pin, self.root / 'out')
        self.assertFalse((self.root / 'out').exists())

    def test_backup_exact_pair_passes_and_wrong_candidates_fail(self):
        pair = {'bundle.json': self.bundle, 'candidate.json': encoded(self.candidate)}
        receipt = retained.authenticate_backup(self.archive(pair), self.pin, self.root / 'good')
        self.assertEqual(receipt['files'], 2)
        for change in ['baseline', 'product', 'reference', 'schema', 'file', 'extra', 'missing', 'bundle']:
            with self.subTest(change=change):
                candidate = copy.deepcopy(self.candidate)
                members = dict(pair)
                if change == 'baseline': candidate['run']['baseline'] = {'key': 'bad'}
                if change == 'product': candidate['productCode'] = '180100'
                if change == 'reference': candidate['reference']['sha256'] = 'f' * 64
                if change == 'schema': candidate['schemaVersion'] = 1
                if change == 'file': candidate['bundleFile'] = '../bundle.json'
                members['candidate.json'] = encoded(candidate)
                if change == 'extra': members['receipt.json'] = b'{}'
                if change == 'missing': members.pop('candidate.json')
                if change == 'bundle': members['bundle.json'] += b' '
                with self.assertRaises(retained.RetainedError):
                    retained.authenticate_backup(self.archive(members), self.pin, self.root / 'bad')
                self.assertFalse((self.root / 'bad').exists())

    def test_readback_requires_all_exact_release_identities(self):
        receipt = dict(productCode='090240', reportingMonth='2026-08', retrievedAt=self.pin['retrievedAt'],
                       codeVersion=self.pin['processingCommit'], releaseSha256=self.pin['releaseSha256'],
                       archive=dict(reference=self.candidate['reference']))
        retained.assert_archive_readback(receipt, self.pin)
        for key in ['productCode', 'reportingMonth', 'retrievedAt', 'codeVersion', 'releaseSha256', 'archive']:
            with self.subTest(key=key):
                changed = dict(receipt, **{key: 'wrong'})
                with self.assertRaises(retained.RetainedError): retained.assert_archive_readback(changed, self.pin)

    def test_metadata_binds_run_attempt_head_repository_and_artifact(self):
        run = dict(id=12, run_attempt=1, head_sha='a' * 40, head_branch='main', status='completed',
                   conclusion='success', path='.github/workflows/import-census.yml',
                   repository={'full_name': retained.REPOSITORY})
        artifact = dict(id=34, name='census-090240-release', size_in_bytes=321, expired=False,
                        digest='sha256:' + 'b' * 64, workflow_run=dict(id=12, head_sha='a' * 40, head_branch='main', repository_id=1410990695))
        self.pin.update(artifactBytes=321, artifactSha256='b' * 64)
        retained.validate_source_metadata(run, artifact, self.pin)
        for key, value in [('id', 13), ('run_attempt', 2), ('head_sha', 'f' * 40), ('head_branch', 'other'),
                           ('conclusion', 'failure'), ('repository', {'full_name': 'other/repo'}), ('path', 'wrong')]:
            with self.subTest(run_key=key):
                with self.assertRaises(retained.RetainedError): retained.validate_source_metadata(dict(run, **{key:value}), artifact, self.pin)
        for key, value in [('id', 99), ('expired', True), ('digest', 'sha256:'+'f'*64), ('size_in_bytes', 322), ('name', 'census-180100-release')]:
            with self.subTest(artifact_key=key):
                with self.assertRaises(retained.RetainedError): retained.validate_source_metadata(run, dict(artifact, **{key:value}), self.pin)

    def test_backup_metadata_requires_successful_same_head_stage_not_source_receipt(self):
        run = dict(id=56, run_attempt=1, head_sha='c'*40, head_branch='main', status='completed', conclusion='success',
                   event='workflow_dispatch', path='.github/workflows/accept-retained-census.yml', repository={'full_name':retained.REPOSITORY})
        retained.validate_run(run, 56, 'c'*40, 'accept-retained-census.yml', 'workflow_dispatch')
        for key, value in [('head_sha','a'*40), ('path','.github/workflows/import-census.yml'), ('event','push'), ('run_attempt',2)]:
            with self.subTest(key=key):
                with self.assertRaises(retained.RetainedError):
                    retained.validate_run(dict(run, **{key:value}), 56, 'c'*40, 'accept-retained-census.yml', 'workflow_dispatch')
        artifact = dict(id=78,name='census-090240-retained-candidate',size_in_bytes=123,expired=False,digest='sha256:'+'d'*64,
                        workflow_run=dict(id=56,head_sha='c'*40,head_branch='main',repository_id=retained.REPOSITORY_ID))
        retained.validate_artifact(artifact,78,56,'c'*40,'census-090240-retained-candidate',123,'d'*64)
        for key,value in [('id',34),('name','census-090240-release'),('workflow_run',dict(artifact['workflow_run'],head_sha='a'*40))]:
            with self.subTest(key=key):
                with self.assertRaises(retained.RetainedError):
                    retained.validate_artifact(dict(artifact,**{key:value}),78,56,'c'*40,'census-090240-retained-candidate',123,'d'*64)

    def test_policy_rejects_unapproved_product_and_changed_evidence(self):
        self.assertEqual(retained.load_pin(ROOT, '090240')['artifactId'], 12128675035)
        with self.assertRaises(retained.RetainedError): retained.load_pin(ROOT, '090121')


class Response(io.BytesIO):
    def __init__(self, body, status=200, location=None):
        super().__init__(body)
        self.status = status
        self.headers = {'Location': location} if location else {}


class TransportTests(unittest.TestCase):
    def test_deadline_rejects_a_delayed_eof_instead_of_returning_success(self):
        clock=[0]
        class SlowEOF(Response):
            def read(self,*args):
                value=super().read(*args)
                if not value: clock[0]=181
                return value
        with patch.object(retained.time,'monotonic',side_effect=lambda:clock[0]):
            client=retained.ArtifactClient('credential',lambda request,timeout:SlowEOF(b'ok'))
            with self.assertRaises(retained.RetainedError): client.get(retained.API+'/actions/runs/12',10)

    @unittest.skipUnless(hasattr(__import__('signal'),'setitimer'),'POSIX Actions deadline control')
    def test_request_deadline_interrupts_a_blocking_operation(self):
        with self.assertRaises(retained.RetainedError):
            with retained.request_deadline(0.02): time.sleep(0.15)

    def test_authorization_does_not_return_after_cross_origin_redirect(self):
        requests=[]
        def hop(request,timeout):
            requests.append(dict(request.header_items()))
            if len(requests)==1: return Response(b'',302,'https://objects.githubusercontent.com/archive')
            if len(requests)==2: return Response(b'',302,'https://api.github.com/redirected')
            return Response(b'ok')
        client=retained.ArtifactClient('credential',hop)
        self.assertEqual(client.get(retained.API+'/actions/artifacts/34/zip',10),b'ok')
        self.assertTrue(all('Authorization' not in headers for headers in requests[1:]))

    def test_cross_origin_redirect_strips_token_and_bounded_body(self):
        requests = []
        def open_request(request, timeout):
            requests.append((request.full_url, dict(request.header_items()), timeout))
            if len(requests) == 1: return Response(b'', 302, 'https://objects.githubusercontent.com/archive?signature=private')
            return Response(b'zip')
        client = retained.ArtifactClient('credential', open_request)
        self.assertEqual(client.get('https://api.github.com/repos/Vasuki8/us-trade-tracker/actions/artifacts/34/zip', 10), b'zip')
        self.assertIn('Authorization', requests[0][1])
        self.assertNotIn('Authorization', requests[1][1])
        self.assertEqual(requests[0][2], 15)

    def test_untrusted_redirects_body_and_json_errors_are_sanitized(self):
        for url in ['http://api.github.com/a', 'https://attacker.example/a', 'https://user:secret@api.github.com/a',
                    'https://api.github.com:444/a', 'https://api.github.com/a#secret']:
            client = retained.ArtifactClient('credential', lambda *_args, **_kwargs: Response(b'', 302, url))
            with self.assertRaises(retained.RetainedError) as caught:
                client.get('https://api.github.com/repos/Vasuki8/us-trade-tracker/actions/artifacts/34/zip', 10)
            self.assertNotIn('secret', str(caught.exception))
            self.assertNotIn('credential', str(caught.exception))
        client = retained.ArtifactClient('credential', lambda *_args, **_kwargs: Response(b'over limit'))
        with self.assertRaises(retained.RetainedError): client.get('https://api.github.com/repos/Vasuki8/us-trade-tracker/actions/runs/12', 2)
        with self.assertRaises(retained.RetainedError): retained.strict_json(b'{"a":1,"a":2}')

    def test_redirect_and_explicit_attempt_limits_do_not_retry(self):
        requests = []
        def loop(request, timeout):
            requests.append(request)
            return Response(b'', 302, 'https://objects.githubusercontent.com/a')
        client = retained.ArtifactClient('credential', loop)
        with self.assertRaises(retained.RetainedError): client.get('https://api.github.com/repos/Vasuki8/us-trade-tracker/actions/artifacts/34/zip', 10)
        self.assertEqual(len(requests), 4)
        requests.clear()
        client = retained.ArtifactClient('credential', lambda request, timeout: requests.append(request) or Response(b'ok'))
        for _ in range(32): client.get('https://api.github.com/repos/Vasuki8/us-trade-tracker/actions/runs/12', 10)
        with self.assertRaises(retained.RetainedError): client.get('https://api.github.com/repos/Vasuki8/us-trade-tracker/actions/runs/12', 10)
        self.assertEqual(len(requests), 32)


if __name__ == '__main__': unittest.main()
