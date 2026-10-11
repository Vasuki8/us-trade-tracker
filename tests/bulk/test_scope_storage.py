import copy
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from helpers import publication_projection

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))

try:
    from scripts.country_bulk.model import Budget, Limits, contexts, validate_projection
    from scripts.country_bulk.storage import EvidenceStore, preflight_output
except ImportError:
    Budget = Limits = contexts = validate_projection = EvidenceStore = preflight_output = None


class ScopeStorageTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(contexts, 'Fixed scope/storage implementation is missing')
        self.tmp = tempfile.TemporaryDirectory(dir=REPO / '.tmp')
        self.addCleanup(self.tmp.cleanup)
        self.repo = Path(self.tmp.name)
        self.output = self.repo / 'data/backups/canada-country-audit/new-run'

    def test_complete_grid_uses_exact_months_directions_measures(self):
        grid = contexts()
        self.assertEqual(len(grid), 48)
        self.assertEqual(len({c.id for c in grid}), 48)
        self.assertEqual((grid[0].month, grid[0].direction, grid[0].measure, grid[0].basename), ('2024-09', 'imports', 'GEN_VAL_MO', 'IMDB2409.ZIP'))
        self.assertEqual((grid[-1].month, grid[-1].direction, grid[-1].measure, grid[-1].basename), ('2026-08', 'exports', 'ALL_VAL_MO', 'EXDB2608.ZIP'))
        for args in (('9999', '2026-08', 24), ('1220', '2026-07', 24), ('1220', '2026-08', 12)):
            with self.subTest(args=args), self.assertRaises(ValueError):
                contexts(*args)

    def test_deadlines_and_byte_limits_enforce_boundaries(self):
        now = [0.0]
        budget = Budget(clock=lambda: now[0])
        budget.charge_original(12_884_901_888)
        with self.assertRaises(ValueError):
            budget.charge_original(1)
        budget.charge_generated(125_829_120)
        with self.assertRaises(ValueError):
            budget.charge_generated(1)
        budget.charge_generated(8_388_608, final=True)
        with self.assertRaises(ValueError):
            budget.charge_generated(1, final=True)
        now[0] = 3300
        self.assertEqual(budget.remaining_work(), 0)
        self.assertEqual(budget.remaining_overall(), 300)
        now[0] = 3600
        self.assertEqual(budget.remaining_overall(), 0)

    def test_preflight_is_read_only_and_refuses_wrong_or_occupied_location(self):
        result = preflight_output(self.repo, self.output, 16 * 1024**3)
        self.assertEqual(result, self.output)
        self.assertFalse(self.output.exists())
        bad = (self.repo / 'data/processed/new-run', self.repo / 'data/backups/canada-country-audit-other/run', self.repo / 'data/backups/canada-country-audit/../outside/run')
        for path in bad:
            with self.subTest(path=path), self.assertRaises(ValueError):
                preflight_output(self.repo, path, 16 * 1024**3)
        with self.assertRaises(ValueError):
            preflight_output(self.repo, self.output, 16 * 1024**3 - 1)
        self.output.mkdir(parents=True)
        with self.assertRaises(ValueError):
            preflight_output(self.repo, self.output, 16 * 1024**3)

    def test_junction_ancestor_is_rejected_before_creation(self):
        base = self.repo / 'data/backups'
        base.mkdir(parents=True)
        target = self.repo / 'elsewhere'
        target.mkdir()
        link = base / 'canada-country-audit'
        if sys.platform == 'win32':
            result = subprocess.run(['cmd', '/c', 'mklink', '/J', str(link), str(target)], capture_output=True)
            self.assertEqual(result.returncode, 0, (result.stderr + result.stdout).decode(errors='replace'))
            self.addCleanup(lambda: link.rmdir() if link.exists() else None)
        else:
            link.symlink_to(target, target_is_directory=True)
        with self.assertRaises(ValueError):
            preflight_output(self.repo, link / 'new-run', 16 * 1024**3)
        self.assertEqual(list(target.iterdir()), [])

    def test_store_exclusive_bounded_writes_preserve_partial_bytes(self):
        store = EvidenceStore.create(self.output, Budget(), repo_root=self.repo)
        with self.assertRaises(ValueError):
            EvidenceStore.create(self.output, Budget(), repo_root=self.repo)
        with self.assertRaises(ValueError):
            store.write_json('../outside.json', {})
        with store.open_bounded('source.part', 'original', 3) as writer:
            writer.write(b'abc')
            with self.assertRaises(ValueError):
                writer.write(b'd')
        identity = store.identity('source.part')
        self.assertEqual(identity.bytes, 3)
        self.assertEqual(identity.sha256, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
        self.assertEqual(store.budget.original_bytes, 3)
        with self.assertRaises(ValueError):
            store.open_bounded('source.part', 'original', 3)
        report = store.write_json('report.json', {'value': None}, final=True)
        self.assertEqual(json.loads((store.root / report.path).read_text()), {'value': None})

    def test_projection_contract_refuses_duplicate_crossed_and_unsafe_pins(self):
        payload = publication_projection()
        pins = payload['publications']
        self.assertEqual(len(validate_projection(payload)), 7)
        for field, value in (('month', '2026-02'), ('direction', 'imports'), ('valueUsd', 9_007_199_254_740_992), ('bytes', True), ('url', 'https://example.com/file.pdf'), ('sha256', 'invalid')):
            changed = copy.deepcopy(payload)
            changed['publications'][0][field] = value
            with self.subTest(field=field), self.assertRaises(ValueError):
                validate_projection(changed)
        with self.assertRaises(ValueError):
            validate_projection({**payload, 'publications': pins[:-1]})

    def test_store_creation_cannot_bypass_repository_output_boundary(self):
        for path in (self.repo / 'data/processed/backups/canada-country-audit/new-run', self.repo / 'data/products/data/backups/canada-country-audit/new-run'):
            with self.subTest(path=path), self.assertRaises(ValueError):
                EvidenceStore.create(path, Budget())
            self.assertFalse(path.exists())


if __name__ == '__main__':
    unittest.main()
