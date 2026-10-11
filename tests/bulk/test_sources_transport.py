import copy
from dataclasses import replace
from pathlib import Path
import sys
import tempfile
import unittest

from helpers import publication_projection, layout_fixture
REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))
from scripts.country_bulk.model import Budget, Limits, contexts, validate_projection
from scripts.country_bulk.storage import EvidenceStore
try:
    from scripts.country_bulk.sources import planned_requests, discover_archive_url, validate_layout
    from scripts.country_bulk.transport import retrieve
except ImportError:
    planned_requests = discover_archive_url = validate_layout = retrieve = None


class FakeTransfer:
    def __init__(self, events, now):
        self.events = iter(events)
        self.now = now
        self.closed = False

    def poll(self, seconds):
        item = next(self.events, None)
        if item is None:
            self.now[0] += seconds
            return None
        delay, kind, payload = item
        self.now[0] += delay
        return (kind, payload)

    def stop_and_join(self):
        self.closed = True


class FakeTransport:
    def __init__(self, events, now, free=16*1024**3):
        self.events, self.now, self.free = events, now, free
        self.starts = []
        self.child = None
        self.processing_commit = 'synthetic-commit'

    def free_space(self, path):
        return self.free

    def start(self, spec):
        self.starts.append(spec.id)
        self.child = FakeTransfer(self.events, self.now)
        return self.child


def headers(status=200, type='text/html', length=None):
    return (0, 'headers', {'status': status, 'contentType': type, 'contentLength': length, 'lastModified': None, 'httpDate': None})


class SourcesTransportTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(planned_requests, 'Bounded source retrieval implementation is missing')
        self.tmp = tempfile.TemporaryDirectory(dir=REPO / '.tmp')
        self.addCleanup(self.tmp.cleanup)
        self.repo = Path(self.tmp.name)
        self.now = [0.0]

    def run_transfer(self, events, *, maximum=1048576, limits=None, free=16*1024**3):
        budget = Budget(limits=limits or Limits(), clock=lambda: self.now[0])
        store = EvidenceStore.create(self.repo / 'data/backups/canada-country-audit/run', budget, repo_root=self.repo)
        request = replace(planned_requests(validate_projection(publication_projection()))[0], maximum_bytes=maximum)
        transport = FakeTransport(events, self.now, free)
        result = retrieve(request, store, budget, transport)
        return result, store, transport

    def test_request_grid_has_all_originals_and_one_final_snapshot(self):
        requests = planned_requests(validate_projection(publication_projection()))
        self.assertEqual(len(requests), 64)
        self.assertEqual(len({r.id for r in requests}), 64)
        self.assertEqual([r.kind for r in requests].count('html'), 9)
        self.assertEqual([r.kind for r in requests].count('zip'), 48)
        self.assertEqual([r.kind for r in requests].count('pdf'), 7)
        self.assertEqual(requests[-1].id, 'canada-after')
        self.assertEqual(requests[15].context_id, 'imports-2024-09')
        self.assertEqual(requests[-2].context_id, 'exports-2026-08')

    def test_indexes_resolve_observed_relative_links_and_deduplicate_same_url(self):
        link = b'<a href="/trade/downloads/2024/Merch/im_m/IMDB2409.ZIP">September</a>'
        self.assertEqual(discover_archive_url({'imports-history.html': link + link}, contexts()[0]), 'https://www.census.gov/trade/downloads/2024/Merch/im_m/IMDB2409.ZIP')
        with self.assertRaises(ValueError):
            discover_archive_url({'imports-history.html': link + b'<a href="/different/IMDB2409.ZIP">Other</a>'}, contexts()[0])
        for href in ('https://example.com/IMDB2409.ZIP', 'https://user@www.census.gov/IMDB2409.ZIP', 'https://www.census.gov:443/IMDB2409.ZIP', '/IMDB2409.ZIP?x=1', '/IMDB2409.ZIP#x', '/IMDB2410.ZIP'):
            with self.subTest(href=href), self.assertRaises(ValueError):
                discover_archive_url({'imports-history.html': f'<a href="{href}">x</a>'.encode()}, contexts()[0])

    def test_complete_original_is_retained_hashed_and_closed_without_retries(self):
        result, store, transport = self.run_transfer([headers(length=3), (0, 'body', b'abc'), (0, 'end', None)])
        self.assertEqual(result.outcome, 'complete')
        self.assertEqual(result.bytes, 3)
        self.assertEqual(result.sha256, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
        self.assertTrue(transport.child.closed)
        self.assertEqual(len(transport.starts), 1)
        self.assertEqual((store.root / result.file).read_bytes(), b'abc')

    def test_partial_body_is_retained_when_absolute_body_deadline_expires(self):
        result, store, transport = self.run_transfer([headers(), (60, 'body', b'abc'), (61, 'body', b'def')])
        self.assertEqual(result.outcome, 'partial')
        self.assertEqual(result.reason, 'body-deadline')
        self.assertEqual(result.bytes, 3)
        self.assertEqual((store.root / result.file).read_bytes(), b'abc')
        self.assertTrue(transport.child.closed)

    def test_stalled_headers_stop_at_absolute_header_deadline(self):
        result, _, transport = self.run_transfer([])
        self.assertEqual(result.reason, 'header-deadline')
        self.assertEqual(result.bytes, 0)
        self.assertLessEqual(self.now[0], 30.25)
        self.assertTrue(transport.child.closed)

    def test_body_and_global_byte_caps_keep_only_accounted_partial_bytes(self):
        for kind in ('per-file', 'all-originals'):
            with self.subTest(kind=kind):
                # Each result owns a different fresh root.
                self.repo = Path(self.tmp.name) / kind
                limits = replace(Limits(), original_bytes=3) if kind == 'all-originals' else Limits()
                result, store, transport = self.run_transfer([headers(), (0, 'body', b'abc'), (0, 'body', b'd')], maximum=3 if kind == 'per-file' else 8, limits=limits)
                self.assertEqual(result.outcome, 'partial')
                self.assertEqual(result.bytes, 3)
                self.assertEqual(store.budget.original_bytes, 3)
                self.assertTrue(transport.child.closed)

    def test_http_redirect_type_and_truncation_do_not_become_complete(self):
        for name, event in (('redirect', headers(status=302)), ('type', headers(type='application/json')), ('length', headers(length=9)), ('unsafe', (0, 'headers', {'status':200,'contentType':'text/html\r\nsecret','contentLength':None,'lastModified':None,'httpDate':None}))):
            with self.subTest(name=name):
                self.repo = Path(self.tmp.name) / name
                result, _, transport = self.run_transfer([event, (0, 'body', b'abc'), (0, 'end', None)])
                self.assertNotEqual(result.outcome, 'complete')
                self.assertNotIn('secret', str(result))
                self.assertEqual(len(transport.starts), 1)
                self.assertTrue(transport.child.closed)

    def test_low_disk_and_exhausted_work_do_not_start_a_request(self):
        result, _, transport = self.run_transfer([], free=2*1024**3-1)
        self.assertEqual(result.outcome, 'unattempted')
        self.assertEqual(transport.starts, [])

    def test_cancellation_and_mid_transfer_disk_guard_preserve_partial(self):
        for kind in ('cancel','disk'):
            with self.subTest(kind=kind):
                self.now[0]=0
                self.repo=Path(self.tmp.name)/kind
                budget=Budget(clock=lambda:self.now[0]);store=EvidenceStore.create(self.repo/'data/backups/canada-country-audit/run',budget,repo_root=self.repo)
                request=planned_requests(validate_projection(publication_projection()))[0]
                transport=FakeTransport([headers(),(0,'body',b'abc')],self.now)
                old_start=transport.start
                def start(spec):
                    child=old_start(spec);old_poll=child.poll
                    def poll(seconds):
                        if child.now[0]>=1:
                            if kind=='cancel': raise KeyboardInterrupt()
                            transport.free=0
                        event=old_poll(seconds)
                        if event and event[0]=='body': child.now[0]=1
                        return event
                    child.poll=poll;return child
                transport.start=start
                result=retrieve(request,store,budget,transport)
                self.assertEqual(result.outcome,'partial');self.assertEqual(result.bytes,3);self.assertTrue(transport.child.closed)
                self.assertIn(result.reason,('cancelled','disk-guard'))
        self.repo = Path(self.tmp.name) / 'deadline'
        result, _, transport = self.run_transfer([], limits=replace(Limits(), work_seconds=0))
        self.assertEqual(result.outcome, 'unattempted')
        self.assertEqual(transport.starts, [])

    def test_oversized_or_invalid_ipc_is_stopped_and_not_a_success(self):
        for name, event in (('large', (0, 'body', b'x'*65537)), ('bad', (0, 'body', 'not bytes'))):
            with self.subTest(name=name):
                self.repo = Path(self.tmp.name) / name
                result, _, transport = self.run_transfer([headers(), event])
                self.assertNotEqual(result.outcome, 'complete')
                self.assertEqual(result.bytes, 0)
                self.assertTrue(transport.child.closed)

    def test_metadata_exhaustion_retains_original_and_final_summary_allowance(self):
        try:
            result, store, transport = self.run_transfer([headers(), (0,'body',b'abc'), (0,'end',None)], limits=replace(Limits(), generated_bytes=256, final_reserve=128))
        except ValueError:
            self.fail('Metadata exhaustion must return a failure record for final reporting')
        self.assertEqual(result.outcome, 'failed')
        self.assertEqual(result.reason, 'metadata-write-failed')
        self.assertEqual((store.root / result.file).read_bytes(), b'abc')
        self.assertTrue(transport.child.closed)
        summary = store.write_json('final.json', {'failed': True}, final=True)
        self.assertGreater(summary.bytes, 0)
        self.assertLessEqual(store.budget.generated_bytes, 256)

    def test_layout_contract_rejects_shifted_value_and_keeps_full_grain(self):
        for direction in ('imports', 'exports'):
            html = layout_fixture(direction)
            result = validate_layout(html, direction)
            self.assertEqual(result.detail_width, 688 if direction == 'imports' else 323)
            self.assertEqual(result.detail_value, (178,193) if direction == 'imports' else (68,83))
            damaged = html.replace(b'179-193', b'178-192') if direction == 'imports' else html.replace(b'69-83', b'68-82')
            # Official positions include formatting whitespace; alter every required measure token instead.
            damaged = damaged.replace(b'gen_val_mo', b'wrong_value') if direction == 'imports' else damaged.replace(b'all_val_mo', b'wrong_value')
            with self.assertRaises(ValueError):
                validate_layout(damaged, direction)


if __name__ == '__main__':
    unittest.main()
