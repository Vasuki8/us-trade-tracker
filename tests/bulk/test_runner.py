from dataclasses import replace
from pathlib import Path
import io
import json
import sys
import tempfile
import unittest
import zipfile
from helpers import archive_fixture, layout_fixture, publication_projection, table_fixture
REPO=Path(__file__).resolve().parents[2];sys.path.insert(0,str(REPO))
from scripts.country_bulk.model import Budget, Limits, OriginalRecord, contexts
from scripts.country_bulk.storage import EvidenceStore
try:
    from scripts.country_bulk.runner import WindowsJob, Controls, RunOptions, run_diagnostic, run_worker, sample_working_set
except ImportError:
    WindowsJob=Controls=run_worker=sample_working_set=None

class FakeChild:
    pid=1
    def __init__(self,now,events=()): self.now=now;self.events=iter(events);self.alive=True;self.closed=False
    def poll(self,seconds):
        self.now[0]+=seconds;event=next(self.events,None)
        if event: self.alive=False
        return event
    def stop_and_join(self): self.closed=True;self.alive=False

class FakeControls:
    processing_commit='test'
    def __init__(self,now,memory=(100,200),events=()): self.now=now;self.memory=memory;self.events=events;self.child=None
    def free_space(self,path): return 20*1024**3
    def start_worker(self,payload): self.child=FakeChild(self.now,self.events);return self.child
    def sample_memory(self,pid):
        if self.memory is None: raise OSError('unmeasurable')
        return self.memory

class RunnerTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(run_worker,'Windows runner missing')
        self.tmp=tempfile.TemporaryDirectory(dir=REPO/'.tmp');self.addCleanup(self.tmp.cleanup)
        self.now=[0.0];self.repo=Path(self.tmp.name)

    def test_timeout_memory_and_measurement_failure_close_child(self):
        for name,memory,seconds,reason in [('timeout',(100,200),0.5,'worker-deadline'),('memory',(1024**3+1,1024**3+1),60,'working-set-cap'),('measurement',None,60,'memory-measurement-failed')]:
            with self.subTest(name=name):
                budget=Budget(limits=replace(Limits(),worker_seconds=seconds),clock=lambda:self.now[0])
                store=EvidenceStore.create(self.repo/name/'data/backups/canada-country-audit/run',budget,repo_root=self.repo/name)
                controls=FakeControls(self.now,memory)
                original=OriginalRecord(contexts()[0].id,'zip',None,contexts()[0].id,'test',outcome='complete',file='original.zip')
                result=run_worker(contexts()[0],original,store,budget,controls)
                self.assertEqual(result.state,'stopped');self.assertEqual(result.reason,reason);self.assertTrue(controls.child.closed)

    def test_terminated_worker_staging_is_counted_and_has_no_success_identity(self):
        budget=Budget(limits=replace(Limits(),worker_seconds=0.5),clock=lambda:self.now[0]);store=EvidenceStore.create(self.repo/'data/backups/canada-country-audit/run',budget,repo_root=self.repo)
        class Staging(FakeControls):
            def start_worker(inner,payload):
                (store.root/'imports-2024-09-hs6.json').write_bytes(b'incomplete')
                return super().start_worker(payload)
        controls=Staging(self.now);original=OriginalRecord(contexts()[0].id,'zip',None,contexts()[0].id,'test',outcome='complete',file='original.zip')
        result=run_worker(contexts()[0],original,store,budget,controls)
        self.assertEqual(result.state,'stopped');self.assertIsNone(result.files);self.assertEqual(budget.generated_bytes,10)
        self.assertEqual(result.staging_files[0]['bytes'],10)

    def test_missing_exited_worker_output_is_not_validated(self):
        budget=Budget(clock=lambda:self.now[0]);store=EvidenceStore.create(self.repo/'data/backups/canada-country-audit/run',budget,repo_root=self.repo)
        controls=FakeControls(self.now,events=[('result',{'rows':{'path':'missing.json','bytes':1,'sha256':'a'*64},'receipt':{'path':'missing2.json','bytes':1,'sha256':'a'*64}})])
        original=OriginalRecord(contexts()[0].id,'zip',None,contexts()[0].id,'test',outcome='complete',file='original.zip')
        result=run_worker(contexts()[0],original,store,budget,controls)
        self.assertEqual(result.state,'failed');self.assertTrue(controls.child.closed)

    def test_specific_worker_failure_reason_survives_bounded_ipc(self):
        budget=Budget(clock=lambda:self.now[0]);store=EvidenceStore.create(self.repo/'data/backups/canada-country-audit/run',budget,repo_root=self.repo)
        controls=FakeControls(self.now,events=[('error',{'reason':'duplicate-global-detail-key'})])
        original=OriginalRecord(contexts()[0].id,'zip',None,contexts()[0].id,'test',outcome='complete',file='original.zip')
        result=run_worker(contexts()[0],original,store,budget,controls)
        self.assertEqual(result.reason,'duplicate-global-detail-key');self.assertEqual(result.state,'failed')

    def test_exhausted_work_preserves_full_grid_and_only_final_request_can_start(self):
        class Transfer:
            def __init__(self): self.events=iter([('headers',{'status':200,'contentType':'text/html','contentLength':None,'lastModified':None,'httpDate':None}),('body',table_fixture()),('end',None)])
            def poll(self,seconds): return next(self.events,None)
            def stop_and_join(self): pass
        class FinalControls(FakeControls):
            def __init__(self,now): super().__init__(now);self.starts=[]
            def start(self,spec): self.starts.append(spec.id);return Transfer()
        budget=Budget(limits=replace(Limits(),work_seconds=0,overall_seconds=300),clock=lambda:self.now[0]);controls=FinalControls(self.now)
        report=run_diagnostic(RunOptions(self.repo,self.repo/'data/backups/canada-country-audit/run','test'),publication_projection(),controls,budget)
        self.assertEqual(controls.starts,['canada-after']);self.assertEqual(len(report['requests']),64);self.assertEqual(len(report['contexts']),48)
        self.assertEqual(report['requestCounts']['unattempted'],63);self.assertEqual(report['diagnosticOutcome'],'failed')
        self.assertTrue((self.repo/'data/backups/canada-country-audit/run/bulk-report.json').exists())

    def test_failed_individual_html_does_not_abort_other_requests_or_invent_zip_links(self):
        class Transfer:
            def __init__(self,html): self.events=iter([('headers',{'status':200,'contentType':'text/html','contentLength':None,'lastModified':None,'httpDate':None}),('body',html),('end',None)])
            def poll(self,seconds): return next(self.events,None)
            def stop_and_join(self): pass
        class NoLinks(FakeControls):
            def __init__(self,now): super().__init__(now);self.starts=[]
            def start(self,spec): self.starts.append(spec.id);return Transfer(table_fixture() if spec.id.startswith('canada') else b'<html><a>no archive links</a></html>')
        budget=Budget(clock=lambda:self.now[0]);controls=NoLinks(self.now)
        report=run_diagnostic(RunOptions(self.repo,self.repo/'data/backups/canada-country-audit/run','test'),publication_projection(),controls,budget)
        self.assertEqual(len(controls.starts),16);self.assertFalse(any(name.startswith('imports-202') for name in controls.starts))
        self.assertEqual(report['requestCounts']['unattempted'],48);self.assertEqual(report['sourceCoverage'],'failed')
        self.assertEqual(report['resources']['generatedBytes'],sum(p.stat().st_size for p in (self.repo/'data/backups/canada-country-audit/run').iterdir() if p.suffix not in ('.html','.pdf','.zip')))

    @unittest.skipUnless(sys.platform=='win32','Actual Windows ownership test')
    def test_owned_waiting_child_is_measured_and_terminated_by_job_close(self):
        for mode in ('worker','transfer'):
            job=WindowsJob();controls=Controls(job,'test');child=controls.start_waiting_child(mode)
            self.addCleanup(child.stop_and_join)
            current,peak=sample_working_set(child.pid)
            self.assertGreater(current,0);self.assertGreaterEqual(peak,current)
            job.close();child.process.join(5);self.assertFalse(child.process.is_alive())

    def test_final_io_failure_keeps_failed_return_and_original_manifest(self):
        from unittest.mock import patch
        write_json=EvidenceStore.write_json
        def failing(store,name,payload,final=False):
            if name=='bulk-report.json': raise OSError('simulated disk failure')
            return write_json(store,name,payload,final)
        controls=FakeControls(self.now);budget=Budget(limits=replace(Limits(),work_seconds=0,overall_seconds=150),clock=lambda:self.now[0])
        with patch.object(EvidenceStore,'write_json',failing):
            report=run_diagnostic(RunOptions(self.repo,self.repo/'data/backups/canada-country-audit/run','test'),publication_projection(),controls,budget)
        self.assertEqual(report['diagnosticOutcome'],'failed');self.assertIn('final-report-write-failed',budget.stops)
        self.assertTrue((self.repo/'data/backups/canada-country-audit/run/original-manifest.json').exists())

    @unittest.skipUnless(sys.platform=='win32','Actual Windows worker test')
    def test_actual_worker_validates_original_and_accounted_staging(self):
        root=REPO/'data/backups/canada-country-audit'/('synthetic-'+Path(self.tmp.name).name)
        budget=Budget();store=EvidenceStore.create(root,budget);self.addCleanup(lambda: __import__('shutil').rmtree(root))
        buffer=io.BytesIO()
        with zipfile.ZipFile(buffer,'w',zipfile.ZIP_DEFLATED) as archive:
            for name,data in archive_fixture('imports').items(): archive.writestr(name,data)
        for name,data,cap in [('original.zip',buffer.getvalue(),Limits().zip_bytes),('imports-layout.html',layout_fixture('imports'),Limits().html_bytes)]:
            with store.open_bounded(name,'original',cap) as writer: writer.write(data)
        identity=store.identity('original.zip');original=OriginalRecord(contexts()[0].id,'zip',None,contexts()[0].id,'test',outcome='complete',file='original.zip',bytes=identity.bytes,sha256=identity.sha256)
        with WindowsJob() as job:
            controls=Controls(job,'test')
            rejected=run_worker(contexts()[0],replace(original,sha256='b'*64),store,budget,controls)
            self.assertEqual(rejected.reason,'original-identity-mismatch');self.assertEqual(rejected.state,'failed')
            result=run_worker(contexts()[0],original,store,budget,controls)
        self.assertEqual(result.state,'validated');self.assertGreater(result.peak_working_set,0)
        self.assertEqual(budget.generated_bytes,sum(p.stat().st_size for p in root.glob('*.json')))
        self.assertEqual(json.loads((root/result.files['receipt']['path']).read_text())['residual_usd'],0)

if __name__=='__main__': unittest.main()
