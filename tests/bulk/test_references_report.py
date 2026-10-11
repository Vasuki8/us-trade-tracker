from dataclasses import asdict, replace
from pathlib import Path
import sys
import unittest
from helpers import table_fixture, publication_projection
REPO=Path(__file__).resolve().parents[2];sys.path.insert(0,str(REPO))
from scripts.country_bulk.model import contexts, Budget, OriginalRecord, validate_projection
from scripts.country_bulk.sources import planned_requests
try:
    from scripts.country_bulk.references import parse_table, snapshot_stability, compare_references, validate_publication, build_report
except ImportError:
    parse_table=snapshot_stability=compare_references=validate_publication=build_report=None

class ReferencesTests(unittest.TestCase):
    def setUp(self): self.assertIsNotNone(parse_table,'Reference/report implementation missing')

    def test_tables_normalize_requested_figures_and_reject_contract_drift(self):
        table=parse_table(table_fixture('1,234.5'))
        self.assertEqual(len(table),48);self.assertEqual(table['imports-2024-09'],1234500000)
        for html in (table_fixture().replace(b'Canada',b'Mexico'),table_fixture().replace(b'not seasonally adjusted',b'seasonally adjusted'),table_fixture().replace(b'<th>Imports</th>',b'<th>Other</th>'),table_fixture().replace(b'1.0',b'1.01'),table_fixture().replace(b'September 2024',b'October 2024')):
            with self.assertRaises(ValueError): parse_table(html)

    def test_snapshot_stability_ignores_markup_but_never_blends_missing_or_changed_rows(self):
        before=parse_table(table_fixture());after=parse_table(table_fixture().replace(b'<td>',b'<td class="x">'))
        self.assertEqual(snapshot_stability(before,after),'matched')
        after['exports-2026-05']+=100000
        self.assertEqual(snapshot_stability(before,after),'mismatch')
        self.assertEqual(snapshot_stability(before,None),'unavailable')

    def test_rounding_ties_and_may_original_only_keep_current_failure(self):
        comparison=compare_references(29790835759,30399000000,29790800000,True)
        self.assertEqual((comparison.reference_check,comparison.publication_check,comparison.reference_corroboration),('mismatch','matched','original-publication-only'))
        self.assertEqual(comparison.current_difference_usd,-608164241)
        self.assertEqual(compare_references(29790850000,29790800000,None,False).reference_check,'mismatch')
        self.assertEqual(compare_references(29790750000,29790800000,None,False).reference_check,'matched')
        self.assertEqual(compare_references(None,100000,None,False).reference_check,'unavailable')

    def test_unreviewed_and_missing_reviewed_publications_differ(self):
        self.assertEqual(compare_references(100000,100000,None,False).publication_check,'not-reviewed')
        outcomes,records,table,contracts=self.good_report()
        report=build_report(outcomes,records,table,table,{},contracts,Budget(),'test')
        checks={row['id']:row['beforeComparison']['publicationCheck'] for row in report['contexts']}
        self.assertEqual(checks['exports-2026-01'],'unavailable');self.assertEqual(checks['imports-2026-01'],'not-reviewed')
        self.assertEqual(sum(value=='not-reviewed' for value in checks.values()),41)

    def test_publication_requires_complete_fresh_exact_pdf_identity(self):
        import hashlib
        raw=b'%PDF-1.7\nsynthetic'
        pin=replace(validate_projection(publication_projection())[0],bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
        record=OriginalRecord('publication-2026-01','pdf',pin.url,'exports-2026-01','test',outcome='complete',status=200,content_type='application/pdf',bytes=len(raw),sha256=pin.sha256)
        self.assertTrue(validate_publication(pin,record,raw))
        for bad in (replace(record,outcome='partial'),replace(record,sha256='b'*64),replace(record,status=302)):
            self.assertFalse(validate_publication(pin,bad,raw))
        self.assertFalse(validate_publication(pin,record,b'bad'))

    def good_report(self):
        table=parse_table(table_fixture());pins=validate_projection(publication_projection())
        records=[OriginalRecord(r.id,r.kind,r.url,r.context_id,'test',attempted=True,outcome='complete') for r in planned_requests(pins)]
        outcomes={c.id:{'state':'validated','sumUsd':1000000,'countryTotalUsd':1000000,'residualUsd':0,'files':{}} for c in contexts()}
        contracts={r.id:True for r in records}
        return outcomes,records,table,contracts

    def test_source_and_diagnostic_gates_and_withheld_acceptance(self):
        outcomes,records,table,contracts=self.good_report()
        report=build_report(outcomes,records,table,table,{},contracts,Budget(),'test')
        self.assertEqual((report['sourceCoverage'],report['diagnosticOutcome']),('passed','passed'))
        for flag in ('releaseAccepted','rollingComparisonsAvailable','defaultAuditRetrievalChanged'): self.assertFalse(report[flag])
        self.assertEqual(report['classificationStatus'],'unverified')
        self.assertEqual((len(report['contexts']),len(report['requests'])),(48,64))
        contracts[records[0].id]=False
        self.assertEqual(build_report(outcomes,records,table,table,{},contracts,Budget(),'test')['diagnosticOutcome'],'failed')
        outcomes['exports-2026-05']['countryTotalUsd']=29790835759
        report=build_report(outcomes,records,table,table,{},contracts,Budget(),'test')
        self.assertEqual(report['sourceCoverage'],'failed')
        del outcomes['imports-2024-09'];report=build_report(outcomes,records,table,None,{},contracts,Budget(),'test')
        self.assertIsNone(report['contexts'][0]['sumUsd'])
        self.assertEqual(report['snapshotStability'],'unavailable')

    def test_incomplete_snapshots_and_wrong_request_grid_cannot_pass(self):
        outcomes,records,table,contracts=self.good_report();incomplete=dict(table);del incomplete['imports-2024-09']
        try: report=build_report(outcomes,records,incomplete,table,{},contracts,Budget(),'test')
        except KeyError: self.fail('Incomplete snapshots must be wholly unavailable')
        self.assertEqual(report['sourceCoverage'],'failed')
        self.assertTrue(all(row['beforeComparison']['referenceCheck']=='unavailable' for row in report['contexts']))
        records[0].id='wrong-page';del contracts['data-products'];contracts['wrong-page']=True
        self.assertEqual(build_report(outcomes,records,table,table,{},contracts,Budget(),'test')['diagnosticOutcome'],'failed')

if __name__=='__main__': unittest.main()
