"""Private archive child: original identities and exclusive bounded staging only."""
from dataclasses import asdict, replace
import json
from pathlib import Path
from .contracts import parse_archive
from .model import Budget, Limits, contexts, require
from .sources import validate_layout
from .storage import EvidenceStore, reject_reparse


def write_worker_result(result, store, output_allowance):
    require(output_allowance>0, 'generated-budget')
    bounded=EvidenceStore(store.root,Budget(limits=replace(store.budget.limits,generated_bytes=output_allowance,final_reserve=0)))
    try:
        rows=bounded.write_json(result.context.id+'-hs6.json',[asdict(row) for row in result.rows])
        receipt=asdict(result);del receipt['rows']
        receipt['rowsFile']=asdict(rows)
        identity=bounded.write_json(result.context.id+'-receipt.json',receipt)
        return {'rows':asdict(rows),'receipt':asdict(identity)}
    finally:
        store.budget.charge_generated(bounded.budget.generated_bytes)


def process_request(payload):
    root=Path(payload['root']);reject_reparse(root)
    repository=Path(__file__).resolve().parents[2]
    require(root.is_absolute() and root.is_relative_to(repository/'data/backups/canada-country-audit') and root!=(repository/'data/backups/canada-country-audit'), 'unsupported-output-location')
    require(root.is_dir(), 'missing-output-root')
    grant=payload['outputAllowance'];require(type(grant) is int and 0<grant<=Limits().generated_bytes-Limits().final_reserve, 'invalid-output-grant')
    store=EvidenceStore(root,Budget(limits=replace(Limits(),generated_bytes=grant,final_reserve=0)))
    original=payload['original'];context=next((c for c in contexts() if c.id==payload['contextId']),None)
    require(context is not None and original['context_id']==context.id and original['outcome']=='complete' and original['kind']=='zip', 'incomplete-original')
    identity=store.identity(original['file'])
    require(identity.bytes==original['bytes'] and identity.sha256==original['sha256'], 'original-identity-mismatch')
    layout=validate_layout(store.path(context.direction+'-layout.html').read_bytes(),context.direction)
    result=parse_archive(store.path(original['file']),context,layout,store.budget.limits)
    return write_worker_result(result,store,grant)


def main(args):
    require(not args, 'private-worker-no-args')
    import sys
    payload=json.loads(sys.stdin.buffer.read(65537));require(len(json.dumps(payload))<=65536,'invalid-ipc')
    print(json.dumps(process_request(payload),separators=(',',':')))
    return 0


if __name__=='__main__':
    import sys
    try: sys.exit(main(sys.argv[1:]))
    except (ValueError,OSError): sys.exit(1)
