"""Windows-only bounded local supervisor and fixed fresh-source diagnostic."""
import argparse
import ctypes
from ctypes import wintypes
from dataclasses import asdict, dataclass, replace
import hashlib
import http.client
import json
import multiprocessing
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time
from urllib.parse import urlsplit
from .model import Budget, Limits, OriginalRecord, WorkerOutcome, contexts, require, safe_integer, validate_projection
from .storage import EvidenceStore, preflight_output
from .sources import planned_requests, discover_archive_url, validate_layout, allowed_url
from .transport import retrieve
from .references import parse_table, validate_publication, build_report, markdown_summary


class BasicLimits(ctypes.Structure):
    _fields_=[('PerProcessUserTimeLimit',ctypes.c_longlong),('PerJobUserTimeLimit',ctypes.c_longlong),('LimitFlags',wintypes.DWORD),('MinimumWorkingSetSize',ctypes.c_size_t),('MaximumWorkingSetSize',ctypes.c_size_t),('ActiveProcessLimit',wintypes.DWORD),('Affinity',ctypes.c_size_t),('PriorityClass',wintypes.DWORD),('SchedulingClass',wintypes.DWORD)]


class IOCounters(ctypes.Structure):
    _fields_=[(name,ctypes.c_ulonglong) for name in ('ReadOperationCount','WriteOperationCount','OtherOperationCount','ReadTransferCount','WriteTransferCount','OtherTransferCount')]


class ExtendedLimits(ctypes.Structure):
    _fields_=[('BasicLimitInformation',BasicLimits),('IoInfo',IOCounters)]+[(name,ctypes.c_size_t) for name in ('ProcessMemoryLimit','JobMemoryLimit','PeakProcessMemoryUsed','PeakJobMemoryUsed')]


class MemoryCounters(ctypes.Structure):
    _fields_=[('cb',wintypes.DWORD),('PageFaultCount',wintypes.DWORD)]+[(name,ctypes.c_size_t) for name in ('PeakWorkingSetSize','WorkingSetSize','QuotaPeakPagedPoolUsage','QuotaPagedPoolUsage','QuotaPeakNonPagedPoolUsage','QuotaNonPagedPoolUsage','PagefileUsage','PeakPagefileUsage')]


def win_api():
    require(sys.platform=='win32','unsupported-platform')
    api=ctypes.WinDLL('kernel32',use_last_error=True)
    api.OpenProcess.argtypes=[wintypes.DWORD,wintypes.BOOL,wintypes.DWORD];api.OpenProcess.restype=wintypes.HANDLE
    api.CloseHandle.argtypes=[wintypes.HANDLE];api.CloseHandle.restype=wintypes.BOOL
    api.CreateJobObjectW.argtypes=[ctypes.c_void_p,wintypes.LPCWSTR];api.CreateJobObjectW.restype=wintypes.HANDLE
    api.SetInformationJobObject.argtypes=[wintypes.HANDLE,ctypes.c_int,ctypes.c_void_p,wintypes.DWORD];api.SetInformationJobObject.restype=wintypes.BOOL
    api.AssignProcessToJobObject.argtypes=[wintypes.HANDLE,wintypes.HANDLE];api.AssignProcessToJobObject.restype=wintypes.BOOL
    return api


class WindowsJob:
    def __init__(self):
        self.api=win_api();self.handle=self.api.CreateJobObjectW(None,None)
        require(bool(self.handle),'job-ownership-failed')
        limits=ExtendedLimits();limits.BasicLimitInformation.LimitFlags=0x2000
        if not self.api.SetInformationJobObject(self.handle,9,ctypes.byref(limits),ctypes.sizeof(limits)):
            self.close();raise ValueError('job-ownership-failed')

    def assign(self,pid):
        process=self.api.OpenProcess(0x100|0x1|0x400,False,pid)
        require(bool(process),'job-ownership-failed')
        try: require(bool(self.api.AssignProcessToJobObject(self.handle,process)),'job-ownership-failed')
        finally: self.api.CloseHandle(process)

    def close(self):
        if self.handle: self.api.CloseHandle(self.handle);self.handle=None

    def __enter__(self): return self
    def __exit__(self,*_): self.close()


def sample_working_set(pid):
    api=win_api();process=api.OpenProcess(0x400|0x10,False,pid)
    if not process: raise OSError('memory-measurement-failed')
    try:
        psapi=ctypes.WinDLL('psapi',use_last_error=True)
        psapi.GetProcessMemoryInfo.argtypes=[wintypes.HANDLE,ctypes.POINTER(MemoryCounters),wintypes.DWORD];psapi.GetProcessMemoryInfo.restype=wintypes.BOOL
        info=MemoryCounters();info.cb=ctypes.sizeof(info)
        if not psapi.GetProcessMemoryInfo(process,ctypes.byref(info),info.cb): raise OSError('memory-measurement-failed')
        return int(info.WorkingSetSize),int(info.PeakWorkingSetSize)
    finally: api.CloseHandle(process)


def send_event(connection,kind,payload):
    if kind=='body': wire=b'B'+payload
    else: wire=b'J'+json.dumps([kind,payload],ensure_ascii=True,separators=(',',':')).encode('ascii')
    require(len(wire)<=65537,'invalid-ipc');connection.send_bytes(wire)


def child_entry(connection,mode):
    # No work, network or evidence write occurs before the parent's job assignment.
    sys.stdout=open(os.devnull,'w');sys.stderr=open(os.devnull,'w')
    try:
        payload=json.loads(connection.recv_bytes(32768))
        if mode=='worker':
            from .worker import process_request
            send_event(connection,'result',process_request(payload))
        elif mode=='transfer':
            url=payload['url'];require(allowed_url(url),'http-contract');parsed=urlsplit(url)
            connection_http=http.client.HTTPSConnection('www.census.gov',timeout=30)
            try:
                connection_http.request('GET',parsed.path,headers={'Accept-Encoding':'identity','User-Agent':'us-trade-tracker-canada-diagnostic/1'})
                response=connection_http.getresponse()
                length=response.getheader('Content-Length')
                if length is not None: require(length.isdigit() and len(length)<=16,'unsafe-metadata');length=int(length)
                send_event(connection,'headers',{'status':response.status,'contentType':response.getheader('Content-Type'),'contentLength':length,'lastModified':response.getheader('Last-Modified'),'httpDate':response.getheader('Date')})
                require(response.status==200 and response.getheader('Content-Encoding') in (None,'identity'),'http-contract')
                while True:
                    chunk=response.read1(65536)
                    if not chunk: break
                    send_event(connection,'body',chunk)
                send_event(connection,'end',None)
            finally: connection_http.close()
        else: raise ValueError('invalid-private-mode')
    except (OSError,ValueError,EOFError,KeyError,TypeError,http.client.HTTPException):
        try: send_event(connection,'error',None)
        except (OSError,ValueError): pass
    finally: connection.close()


class OwnedChild:
    def __init__(self,job,mode,payload=None):
        self.measure_transfer=mode=='transfer';self.sampled_working_set=0;self.peak_working_set=0
        context=multiprocessing.get_context('spawn');self.connection,child=context.Pipe(duplex=True)
        self.process=context.Process(target=child_entry,args=(child,mode),daemon=False);self.process.start();child.close();self.pid=self.process.pid
        try:
            job.assign(self.pid)
            if payload is not None:
                wire=json.dumps(payload,ensure_ascii=True,separators=(',',':')).encode('ascii')
                require(len(wire)<=32768,'invalid-ipc');self.connection.send_bytes(wire)
        except BaseException:
            self.stop_and_join();raise

    @property
    def alive(self): return self.process.is_alive()

    def poll(self,seconds):
        if self.measure_transfer and self.alive:
            try:
                current,peak=sample_working_set(self.pid)
                self.sampled_working_set=max(self.sampled_working_set,current);self.peak_working_set=max(self.peak_working_set,peak)
                require(max(current,peak)<=Limits().working_set_bytes,'working-set-cap')
            except OSError:
                if self.alive: raise ValueError('memory-measurement-failed')
        if self.connection.poll(seconds):
            raw=self.connection.recv_bytes(65537)
            if raw[:1]==b'B': return ('body',raw[1:])
            require(raw[:1]==b'J','invalid-ipc');payload=json.loads(raw[1:])
            require(type(payload) is list and len(payload)==2,'invalid-ipc');return tuple(payload)
        if not self.alive: raise EOFError('child-exited')
        return None

    def stop_and_join(self):
        if self.process.is_alive(): self.process.terminate()
        self.process.join(5)
        if self.process.is_alive(): self.process.kill();self.process.join(5)
        self.connection.close()


class Controls:
    def __init__(self,job,processing_commit): self.job=job;self.processing_commit=processing_commit
    def free_space(self,path): return shutil.disk_usage(path).free
    def sample_memory(self,pid): return sample_working_set(pid)
    def start(self,spec): return OwnedChild(self.job,'transfer',{'url':spec.url})
    def start_worker(self,payload): return OwnedChild(self.job,'worker',payload)
    def start_waiting_child(self,mode='worker'): return OwnedChild(self.job,mode)


def validate_worker_files(context,files,store):
    require(type(files) is dict and set(files)=={'rows','receipt'},'invalid-worker-output')
    for kind,suffix in (('rows','-hs6.json'),('receipt','-receipt.json')):
        claimed=files[kind];require(type(claimed) is dict and set(claimed)=={'path','bytes','sha256'} and claimed['path']==context.id+suffix,'invalid-worker-output')
        actual=store.identity(claimed['path']);require(asdict(actual)==claimed,'worker-output-identity')
    receipt=json.loads(store.path(files['receipt']['path']).read_bytes());rows=json.loads(store.path(files['rows']['path']).read_bytes())
    require(receipt['context']==asdict(context) and receipt['rowsFile']==files['rows'],'crossed-worker-output')
    require(type(rows) is list and len(rows)<=1000000,'invalid-worker-output')
    codes=[];total=0
    for row in rows:
        require(type(row) is dict and set(row)=={'commodity','description','value_usd','detail_record_count','special'},'invalid-worker-output')
        code=row['commodity'];require(type(code) is str and len(code)==6 and code.isascii() and code.isdigit(),'invalid-worker-output');codes.append(code)
        total=safe_integer(total+safe_integer(row['value_usd']))
        require(type(row['detail_record_count']) is int and row['detail_record_count']>0 and row['special']==code.startswith(('98','99')) and (row['description'] is None or type(row['description']) is str and len(row['description'])<=150),'invalid-worker-output')
    require(codes==sorted(set(codes)) and total==safe_integer(receipt['sum_usd']) and receipt['residual_usd']==total-safe_integer(receipt['country_total_usd']),'invalid-worker-output')
    require(set(receipt['members'])=={'HSDESC.TXT',('IMP' if context.direction=='imports' else 'EXP')+'_CTY.TXT',('IMP' if context.direction=='imports' else 'EXP')+'_DETL.TXT'} and all(m['CRCVerifiedAtEOF'] is True for m in receipt['members'].values()),'invalid-worker-output')
    return receipt


def run_worker(context,original,store,budget,controls):
    outcome=WorkerOutcome();start=budget.clock();child=None
    names=[context.id+'-hs6.json',context.id+'-receipt.json']
    existing={name for name in names if store.path(name).exists()}
    try:
        require(not existing,'occupied-worker-output')
        if budget.stops or budget.remaining_work()<=0:
            outcome.reason='resource-stop';return outcome
        require(controls.free_space(store.root)>=budget.limits.disk_guard,'disk-guard')
        grant=budget.limits.generated_bytes-budget.limits.final_reserve-budget.generated_bytes
        require(grant>0,'generated-budget')
        child=controls.start_worker({'root':str(store.root),'contextId':context.id,'original':asdict(original),'outputAllowance':grant})
        deadline=start+min(budget.limits.worker_seconds,budget.remaining_work())
        while True:
            if budget.clock()>=deadline: raise ValueError('worker-deadline')
            if child.alive:
                try: current,peak=controls.sample_memory(child.pid)
                except OSError:
                    if child.alive: raise ValueError('memory-measurement-failed')
                    current=peak=0
                outcome.sampled_working_set=max(outcome.sampled_working_set,current);outcome.peak_working_set=max(outcome.peak_working_set,peak)
                require(current<=budget.limits.working_set_bytes and peak<=budget.limits.working_set_bytes,'working-set-cap')
            require(controls.free_space(store.root)>=budget.limits.disk_guard,'disk-guard')
            event=child.poll(min(budget.limits.sample_seconds,deadline-budget.clock()))
            if event is None: continue
            require(budget.clock()<deadline,'worker-deadline')
            require(event[0]=='result','worker-contract-failed')
            child.stop_and_join();files=event[1];validate_worker_files(context,files,store)
            outcome.state='validated';outcome.files=files;break
    except (OSError,ValueError,EOFError,KeyError,TypeError) as error:
        reason=str(error)
        allowed={'worker-deadline','working-set-cap','memory-measurement-failed','disk-guard','generated-budget'}
        outcome.reason=reason if reason in allowed else 'worker-contract-failed'
        outcome.state='stopped' if reason in allowed else 'failed'
        if reason in allowed: budget.stop(reason)
    except KeyboardInterrupt:
        budget.stop('cancelled');outcome.state='stopped';outcome.reason='cancelled'
    finally:
        if child is not None: child.stop_and_join()
        # Include incomplete staging left by a terminated worker. Exclusive names cannot preexist.
        staging=[name for name in names if name not in existing and store.path(name).exists()]
        used=sum(store.path(name).stat().st_size for name in staging)
        if used:
            try: budget.charge_generated(used)
            except ValueError:
                budget.generated_bytes+=used;outcome.state='stopped';outcome.reason='generated-budget';outcome.files=None
        outcome.staging_files=[asdict(store.identity(name)) for name in staging]
        outcome.elapsed_seconds=budget.clock()-start
    return outcome


@dataclass(frozen=True)
class RunOptions:
    repository: Path
    output: Path
    processing_commit: str


def source_contract(spec,record,store,pins):
    if record.outcome!='complete': return False,None
    raw=store.path(record.file).read_bytes() if spec.kind!='zip' else None
    try:
        if spec.id in ('imports-layout','exports-layout'): validate_layout(raw,spec.id.split('-')[0])
        elif spec.id in ('canada-before','canada-after'): return True,parse_table(raw)
        elif spec.kind=='pdf': return validate_publication(next(p for p in pins if spec.id=='publication-'+p.month),record,raw),None
        elif spec.id=='country-subcodes': require(b'country' in raw.lower() and b'subcode' in raw.lower(),'source-contract')
        elif spec.id=='statistical-guide': require(b'general imports' in raw.lower() and b'exports' in raw.lower(),'source-contract')
        elif spec.kind=='html': require(b'<html' in raw.lower() and b'<a' in raw.lower(),'source-contract')
        return True,None
    except (ValueError,UnicodeError): return False,None


def run_diagnostic(options,projection,controls,budget=None):
    budget=budget or Budget();pins=validate_projection(projection);requests=planned_requests(pins)
    require(controls.free_space(options.output.parent if options.output.parent.exists() else options.repository)>=budget.limits.preflight_free,'insufficient-preflight-disk')
    store=EvidenceStore.create(options.output,budget,repo_root=options.repository)
    store.write_json('publication-projection.json',projection)
    records=[];outcomes={};contracts={};pages={};tables={};publications={};cancelled=False
    try:
        for spec in requests[:-1]:
            if spec.kind=='zip':
                context=next(c for c in contexts() if c.id==spec.context_id)
                try: spec=replace(spec,url=discover_archive_url(pages,context))
                except (ValueError,UnicodeError): pass
            record=retrieve(spec,store,budget,controls);records.append(record)
            contract,table=source_contract(spec,record,store,pins);contracts[spec.id]=contract
            if contract and spec.kind=='html': pages[spec.filename]=store.path(spec.filename).read_bytes()
            if table is not None: tables[spec.id]=table
            if spec.kind=='pdf' and contract: publications[spec.context_id]=next(p.value_usd for p in pins if spec.id=='publication-'+p.month)
            if spec.kind=='zip':
                outcome=run_worker(context,record,store,budget,controls) if record.outcome=='complete' and contracts.get(context.direction+'-layout') is True else WorkerOutcome(reason='incomplete-original-or-layout')
                normalized={'state':outcome.state,'reason':outcome.reason,'worker':asdict(outcome),'files':outcome.files}
                if outcome.state=='validated':
                    receipt=validate_worker_files(context,outcome.files,store)
                    normalized.update(sumUsd=receipt['sum_usd'],countryTotalUsd=receipt['country_total_usd'],residualUsd=receipt['residual_usd'])
                outcomes[context.id]=normalized;contracts[context.id]=record.outcome=='complete' and outcome.state=='validated'
    except KeyboardInterrupt:
        budget.stop('cancelled');cancelled=True
    except (OSError,ValueError,KeyError,TypeError): budget.stop('orchestration-failed')
    finally:
        known={r.id for r in records}
        for spec in requests[:-1]:
            if spec.id not in known:
                records.append(OriginalRecord(spec.id,spec.kind,spec.url,spec.context_id,options.processing_commit,reason='resource-stop'));contracts[spec.id]=False
        # Reserve a separate 150 seconds for final reports; no ZIP/PDF is started here.
        budget.final_transfer_deadline=budget.clock()+min(150,max(0,budget.remaining_overall()-150))
        final=retrieve(requests[-1],store,budget,controls,final=True);records.append(final)
        contract,table=source_contract(requests[-1],final,store,pins);contracts[final.id]=contract
        if table is not None: tables[final.id]=table
        budget.final_report_deadline=budget.clock()+min(150,budget.remaining_overall())
        report=build_report(outcomes,records,tables.get('canada-before'),tables.get('canada-after'),publications,contracts,budget,options.processing_commit)
        report['snapshotFiles']={name:asdict(store.identity(name+'.html')) if store.path(name+'.html').exists() else None for name in ('canada-before','canada-after')}
        report['resources']['freeDiskBytes']=controls.free_space(store.root)
        report['resources']['peakChildWorkingSetBytes']=max([r.peak_working_set for r in records]+[o.get('worker',{}).get('peak_working_set',0) for o in outcomes.values()])
        report['resources']['selectedBytes']=sum(sum(m['bytes'] for m in validate_worker_files(c,outcomes[c.id]['files'],store)['members'].values()) for c in contexts() if outcomes.get(c.id,{}).get('state')=='validated')
        try:
            store.write_json('original-manifest.json',{'schemaVersion':1,'processingCommit':options.processing_commit,'requests':[asdict(r) for r in records]},final=True)
            summary=markdown_summary(report).encode('ascii')
            with store.open_bounded('summary.md','generated',budget.limits.final_reserve,final=True) as writer: writer.write(summary)
            # Include the report's own bytes without a circular self-hash.
            report['resources']['generatedBytes']=budget.generated_bytes
            for _ in range(8):
                length=len(json.dumps(report,ensure_ascii=True,allow_nan=False,separators=(',',':')).encode('ascii'))+1
                predicted=budget.generated_bytes+length
                if report['resources']['generatedBytes']==predicted: break
                report['resources']['generatedBytes']=predicted
            require(budget.remaining_overall()>0,'report-deadline');store.write_json('bulk-report.json',report,final=True)
        except (OSError,ValueError):
            budget.stop('final-report-write-failed');report['diagnosticOutcome']='failed'
            report['resources']['stops']=list(budget.stops);report['resources']['generatedBytes']=budget.generated_bytes
            # Even a persistent I/O failure exits nonzero; never announce a saved report.
    return report


def main(args):
    parser=argparse.ArgumentParser();parser.add_argument('--repo',required=True);parser.add_argument('--output',required=True);parser.add_argument('--preflight',action='store_true');parser.add_argument('--remaining-seconds',type=float,default=3600)
    options=parser.parse_args(args)
    require(sys.platform=='win32' and sys.implementation.name=='cpython' and sys.version_info>=(3,11),'unsupported-runtime')
    require(0<options.remaining_seconds<=3600,'invalid-deadline')
    repository=Path(options.repo).resolve();require(repository==Path(__file__).resolve().parents[2],'unsupported-repository')
    output=Path(options.output)
    ancestor=output if output.is_absolute() else repository/output
    while not ancestor.exists(): ancestor=ancestor.parent
    output=preflight_output(repository,output,shutil.disk_usage(ancestor).free)
    wire=sys.stdin.buffer.read(65537);require(len(wire)<=65536,'invalid-projection');projection=json.loads(wire);validate_projection(projection)
    commit=subprocess.run(['git','rev-parse','HEAD'],cwd=repository,check=True,capture_output=True,text=True,timeout=10).stdout.strip()
    require(len(commit)==40 and all(c in '0123456789abcdef' for c in commit),'invalid-processing-commit')
    limits=replace(Limits(),overall_seconds=options.remaining_seconds,work_seconds=max(0,options.remaining_seconds-300));budget=Budget(limits=limits)
    with WindowsJob() as job:
        controls=Controls(job,commit);probe=controls.start_waiting_child()
        try: sample_working_set(probe.pid)
        finally: probe.stop_and_join()
        if options.preflight: print('Preflight passed; no requests or output writes.');return 0
        report=run_diagnostic(RunOptions(repository,output,commit),projection,controls,budget)
    print(json.dumps({'diagnosticOutcome':report['diagnosticOutcome'],'sourceCoverage':report['sourceCoverage'],'requestCounts':report['requestCounts'],'resources':report['resources']},separators=(',',':')))
    return 0 if report['diagnosticOutcome']=='passed' else 1


if __name__=='__main__':
    multiprocessing.freeze_support()
    try: sys.exit(main(sys.argv[1:]))
    except (ValueError,OSError,subprocess.SubprocessError): print('Diagnostic preflight or reporting failed.',file=sys.stderr);sys.exit(1)
