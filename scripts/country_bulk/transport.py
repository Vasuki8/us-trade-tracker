"""Parent-owned original retention with absolute cancellable transfer phases."""
from dataclasses import asdict
from datetime import datetime, timezone
from .model import Budget, OriginalRecord, RequestSpec, require
from .sources import allowed_url
from .storage import EvidenceStore

ERRORS = {'header-deadline','body-deadline','work-deadline','disk-guard','file-byte-cap','original-budget','generated-budget','invalid-ipc','unsafe-metadata','http-contract','content-length-mismatch','empty-original','transfer-error','evidence-write-failed'}


def utcnow():
    return datetime.now(timezone.utc).isoformat()


def safe_text(value):
    require(value is None or (type(value) is str and len(value) <= 512 and all(32 <= ord(char) < 127 for char in value)), 'unsafe-metadata')
    return value


def retrieve(spec: RequestSpec, store: EvidenceStore, budget: Budget, transport, *, final: bool=False) -> OriginalRecord:
    record = OriginalRecord(spec.id, spec.kind, spec.url, spec.context_id, transport.processing_commit)
    start = budget.clock()
    child = writer = None
    try:
        require(spec.kind in ('zip','html','pdf') and spec.maximum_bytes > 0, 'invalid-ipc')
        if spec.url is None:
            record.reason = 'unverified-link'
            return record
        require(allowed_url(spec.url), 'http-contract')
        remaining = budget.remaining_overall() if final else budget.remaining_work()
        if remaining <= 0 or (budget.stops and not final):
            record.reason = 'work-deadline' if remaining <= 0 else 'resource-stop'
            if remaining <= 0:
                budget.stop('work-deadline')
            return record
        if transport.free_space(store.root) < budget.limits.disk_guard:
            budget.stop('disk-guard')
            record.reason = 'disk-guard'
            return record
        if budget.original_bytes >= budget.limits.original_bytes:
            budget.stop('original-budget')
            record.reason = 'original-budget'
            return record
        writer = store.open_bounded(spec.filename, 'original', spec.maximum_bytes)
        record.file = spec.filename
        record.attempted = True
        record.started_at = utcnow()
        child = transport.start(spec)
        phase = 'header'
        deadline = start + min(budget.limits.header_seconds, remaining)
        saw_headers = False
        while True:
            remaining = budget.remaining_overall() if final else budget.remaining_work()
            if remaining <= 0:
                budget.stop('work-deadline')
                raise ValueError('work-deadline')
            if budget.clock() >= deadline:
                raise ValueError(phase + '-deadline')
            if transport.free_space(store.root) < budget.limits.disk_guard:
                budget.stop('disk-guard')
                raise ValueError('disk-guard')
            event = child.poll(min(budget.limits.sample_seconds, deadline-budget.clock(), remaining))
            if budget.clock() >= deadline:
                raise ValueError(phase + '-deadline')
            if event is None:
                continue
            require(type(event) is tuple and len(event) == 2, 'invalid-ipc')
            kind,payload = event
            if kind == 'headers':
                require(not saw_headers and type(payload) is dict and set(payload) == {'status','contentType','contentLength','lastModified','httpDate'}, 'invalid-ipc')
                require(type(payload['status']) is int and 100 <= payload['status'] <= 599, 'unsafe-metadata')
                # Validate all text before it enters retained metadata.
                texts = [safe_text(payload[name]) for name in ('contentType','lastModified','httpDate')]
                length = payload['contentLength']
                require(length is None or (type(length) is int and 0 <= length <= 9_007_199_254_740_991), 'unsafe-metadata')
                record.status = payload['status']
                record.content_type, record.last_modified, record.http_date = texts
                record.content_length = length
                saw_headers,phase = True,'body'
                deadline = budget.clock() + min(budget.limits.body_seconds, budget.remaining_overall() if final else budget.remaining_work())
                if length is not None:
                    require(length <= spec.maximum_bytes, 'file-byte-cap')
            elif kind == 'body':
                require(saw_headers and type(payload) is bytes and 0 < len(payload) <= 65536, 'invalid-ipc')
                writer.write(payload)
            elif kind == 'end':
                require(saw_headers and payload is None, 'invalid-ipc')
                require(record.content_length is None or record.content_length == writer.bytes, 'content-length-mismatch')
                require(writer.bytes > 0, 'empty-original')
                mime = (record.content_type or '').split(';')[0].strip().lower()
                accepted = {'html':('text/html','application/xhtml+xml'), 'zip':('application/zip','application/x-zip-compressed'), 'pdf':('application/pdf',)}
                require(record.status == 200 and mime in accepted[spec.kind], 'http-contract')
                record.outcome = 'complete'
                break
            else:
                raise ValueError('transfer-error' if kind == 'error' else 'invalid-ipc')
    except (OSError, ValueError, EOFError) as error:
        reason = str(error)
        record.reason = reason if reason in ERRORS else 'transfer-error'
        record.outcome = 'partial' if writer and writer.bytes else 'failed' if record.attempted else 'unattempted'
    finally:
        if child is not None:
            child.stop_and_join()
        if writer is not None:
            writer.close()
            record.bytes = writer.bytes
            record.sha256 = writer.hasher.hexdigest()
        record.retrieved_at = utcnow() if record.attempted else None
        record.elapsed_seconds = budget.clock()-start
        # Each request's bounded metadata is generated evidence, including failures/skips.
        try:
            store.write_json(spec.filename+'.request.json', asdict(record), final=final)
        except (ValueError, OSError):
            budget.stop('metadata-write-failed')
            record.outcome, record.reason = 'failed', 'metadata-write-failed'
    return record
