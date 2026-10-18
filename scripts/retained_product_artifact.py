"""Authenticate only the two reviewed retained releases; never request Census data."""
import argparse
from contextlib import contextmanager
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import signal
import stat
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile

REPOSITORY = 'Vasuki8/us-trade-tracker'
REPOSITORY_ID = 1410990695
API = 'https://api.github.com/repos/' + REPOSITORY
MIB = 1024 * 1024
SELECTION = 'deployment/tea-cocoa-archive-selection.json'
EVIDENCE = 'docs/data-validation/tea-cocoa-resumption-20261018-evidence.json'
EVIDENCE_SHA = '6aea40a02a7beb4e5141d6bdf1dd80d1ceefd79d44431649e511cc99e69d7989'
SEAL_SHA = '963c4d4c6d24e3934279c9743ae31cb86178622f7a4cf6e1adc4485a98b51877'


class RetainedError(Exception):
    """Short, fixed messages deliberately exclude URLs, credentials and response bodies."""


def require(condition, message='Retained artifact identity rejected'):
    if not condition:
        raise RetainedError(message)


def sha(body):
    return hashlib.sha256(body).hexdigest()


def strict_json(body):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            require(key not in result, 'Duplicate JSON key')
            result[key] = value
        return result
    def invalid(_value):
        raise RetainedError('Nonfinite JSON value')
    try:
        return json.loads(body.decode('utf-8'), object_pairs_hook=unique, parse_constant=invalid)
    except (ValueError, UnicodeError, RecursionError):
        raise RetainedError('Invalid JSON body') from None


def read_bounded(path, cap):
    require(path.is_file() and not path.is_symlink(), 'Expected regular input file')
    with path.open('rb') as stream:
        body = stream.read(cap + 1)
    require(len(body) <= cap, 'Input exceeds byte limit')
    return body


def load_pin(root: Path, product_code: str) -> dict:
    selection = strict_json(read_bounded(root / SELECTION, MIB))
    require(selection == dict(schemaVersion=1, sourceEvidencePath=EVIDENCE,
                             sourceEvidenceSha256=EVIDENCE_SHA, sourceProofSealSha256=SEAL_SHA,
                             products=['090240', '180100']), 'Unapproved selection policy')
    require(product_code in selection['products'], 'Product outside reviewed selection')
    body = read_bounded(root / EVIDENCE, MIB)
    require(sha(body) == EVIDENCE_SHA, 'Source evidence digest mismatch')
    evidence = strict_json(body)
    matches = [row for row in evidence['products'] if row['productCode'] == product_code]
    require(len(matches) == 1 and matches[0]['sourceReady'] is True)
    return matches[0]


def reference(pin):
    return dict(key=f"trade/v1/products/{pin['productCode']}/releases/{pin['releaseId']}.json",
                sha256=pin['bundleSha256'])


def expected_source(pin):
    names = {'processed/current.json', f"processed/releases/{pin['releaseId']}.json"}
    for year in range(2021, 2027):
        for month in range(1, 13):
            period = f'{year}-{month:02}'
            if not '2021-09' <= period <= '2026-08':
                continue
            for direction in ['imports', 'exports']:
                for level in ['HS', 'HSCY']:
                    names.add(f"raw/{pin['releaseId']}/{direction}-{period}-{level}.json")
            if period >= '2024-09':
                for level in ['HS', 'HSCY', 'HSRP', 'HSCYRP']:
                    names.add(f"raw/{pin['releaseId']}/duties-{period}-{level}.json")
    return names


def unpack(zip_path, expected, cap, expected_bytes=None, expected_sha=None):
    body = read_bounded(zip_path, cap)
    require(expected_bytes is None or len(body) == expected_bytes, 'ZIP byte length mismatch')
    require(expected_sha is None or sha(body) == expected_sha, 'ZIP digest mismatch')
    parents = {str(parent) for name in expected for parent in PurePosixPath(name).parents if str(parent) != '.'}
    files, seen, declared = {}, set(), 0
    try:
        with zipfile.ZipFile(zip_path) as archive:
            require(len(archive.infolist()) <= len(expected) + len(parents), 'Too many ZIP entries')
            for info in archive.infolist():
                name = info.filename
                require(name and '\\' not in name and ':' not in name and not name.startswith('/')
                        and '\x00' not in name and not re.search(r'(^|/)(\.{1,2}|)(/|$)', name.rstrip('/')), 'Unsafe ZIP member')
                folded = name.rstrip('/').casefold()
                require(folded not in seen, 'Duplicate ZIP member')
                seen.add(folded)
                mode = info.external_attr >> 16
                require(not stat.S_ISLNK(mode) and stat.S_IFMT(mode) in (0, stat.S_IFREG, stat.S_IFDIR)
                        and not info.flag_bits & 1, 'Unsupported ZIP member')
                if info.is_dir():
                    require(name.rstrip('/') in parents and info.file_size == 0, 'Unexpected ZIP directory')
                    continue
                require(name in expected and 0 <= info.file_size <= 32 * MIB, 'Unexpected or oversized ZIP member')
                declared += info.file_size
                require(declared <= 64 * MIB, 'Decoded archive exceeds byte limit')
                with archive.open(info) as member:
                    data = member.read(min(32 * MIB, 64 * MIB - sum(map(len, files.values()))) + 1)
                require(len(data) == info.file_size and len(data) <= 32 * MIB, 'Decoded member size mismatch')
                files[name] = data
    except (zipfile.BadZipFile, OSError, RuntimeError, EOFError, ValueError, NotImplementedError):
        raise RetainedError('Invalid ZIP body') from None
    require(set(files) == expected, 'Incomplete ZIP membership')
    return files


def write_absent(output, files):
    absolute = output.absolute()
    for path in [absolute, *absolute.parents]:
        require(not path.is_symlink() and not (hasattr(path, 'is_junction') and path.is_junction()), 'Linked output path rejected')
    require(not output.exists(), 'Output must be absent')
    output.mkdir(parents=True, exist_ok=False)
    for name, body in files.items():
        path = output / name
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open('xb') as stream:
            stream.write(body)


def authenticate_source(zip_path: Path, pin: dict, output: Path) -> dict:
    files = unpack(zip_path, expected_source(pin), MIB, pin['artifactBytes'], pin['artifactSha256'])
    require(sha(files['processed/current.json']) == pin['pointerSha256'])
    require(strict_json(files['processed/current.json']) == {'releaseFile': f"releases/{pin['releaseId']}.json"})
    release_body = files[f"processed/releases/{pin['releaseId']}.json"]
    require(sha(release_body) == pin['releaseSha256'])
    release = strict_json(release_body)
    require(all(release.get(key) == value for key, value in dict(schemaVersion=2, productCode=pin['productCode'],
                reportingMonth='2026-08', codeVersion=pin['processingCommit'], retrievedAt=pin['retrievedAt']).items()))
    for name, body in files.items():
        if not name.startswith('raw/'):
            continue
        capture = strict_json(body)
        require(isinstance(capture, dict) and capture.get('retrievedAt') == pin['retrievedAt']
                and capture.get('httpStatus') == 200 and isinstance(capture.get('payload'), list), 'Invalid raw capture')
        url = urllib.parse.urlsplit(capture.get('requestUrl', ''))
        require(url.scheme == 'https' and url.netloc == 'api.census.gov' and not url.fragment
                and url.path.startswith('/data/timeseries/intltrade/')
                and all(key.casefold() not in ('key', 'api_key', 'token', 'access_token')
                        for key, _value in urllib.parse.parse_qsl(url.query)), 'Invalid capture source')
    write_absent(output, files)
    return dict(schemaVersion=1, productCode=pin['productCode'], files=len(files), decodedBytes=sum(map(len, files.values())),
                artifactId=pin['artifactId'], zipSha256=pin['artifactSha256'], releaseSha256=pin['releaseSha256'])


def check_candidate(body, pin):
    require(len(body) <= 16 * 1024, 'Candidate exceeds byte limit')
    require(strict_json(body) == dict(schemaVersion=2, productCode=pin['productCode'],
                run=dict(schemaVersion=2, productCode=pin['productCode'], reportingMonth='2026-08', baseline=None),
                reference=reference(pin), bundleFile='bundle.json'), 'Candidate identity mismatch')


def check_bundle(body, pin):
    require(len(body) == pin['bundleBytes'] and sha(body) == pin['bundleSha256'], 'Bundle pin mismatch')


def authenticate_backup(zip_path: Path, pin: dict, output: Path) -> dict:
    files = unpack(zip_path, {'bundle.json', 'candidate.json'}, 8 * MIB)
    check_bundle(files['bundle.json'], pin)
    check_candidate(files['candidate.json'], pin)
    write_absent(output, files)
    return dict(schemaVersion=1, productCode=pin['productCode'], files=2,
                members={name: dict(bytes=len(body), sha256=sha(body)) for name, body in files.items()})


def assert_archive_readback(receipt: dict, pin: dict) -> None:
    require(isinstance(receipt, dict) and all(receipt.get(key) == value for key, value in
            dict(productCode=pin['productCode'], reportingMonth='2026-08', retrievedAt=pin['retrievedAt'],
                 codeVersion=pin['processingCommit'], releaseSha256=pin['releaseSha256']).items()), 'Readback release mismatch')
    require(isinstance(receipt.get('archive'), dict) and receipt['archive'].get('reference') == reference(pin),
            'Readback archive reference mismatch')


def validate_run(run, run_id, head, workflow, event=None):
    require(isinstance(run, dict) and run.get('id') == run_id and run.get('run_attempt') == 1
            and run.get('head_sha') == head and run.get('head_branch') == 'main'
            and run.get('status') == 'completed' and run.get('conclusion') == 'success'
            and run.get('path') == '.github/workflows/' + workflow
            and run.get('repository', {}).get('full_name') == REPOSITORY
            and (event is None or run.get('event') == event), 'Workflow provenance mismatch')


def validate_artifact(artifact, artifact_id, run_id, head, name, size, digest):
    require(isinstance(artifact, dict) and artifact.get('id') == artifact_id and artifact.get('name') == name
            and artifact.get('expired') is False and artifact.get('size_in_bytes') == size
            and artifact.get('digest') == 'sha256:' + digest, 'Artifact metadata mismatch')
    association = artifact.get('workflow_run', {})
    require(association.get('id') == run_id and association.get('head_sha') == head
            and association.get('head_branch') == 'main' and association.get('repository_id') == REPOSITORY_ID,
            'Artifact run association mismatch')


def validate_source_metadata(run, artifact, pin):
    validate_run(run, pin['runId'], pin['processingCommit'], 'import-census.yml')
    validate_artifact(artifact, pin['artifactId'], pin['runId'], pin['processingCommit'],
                      f"census-{pin['productCode']}-release", pin['artifactBytes'], pin['artifactSha256'])


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *_args, **_kwargs):
        return None


@contextmanager
def request_deadline(seconds, required=True):
    """Bound full HTTP open/header/body work on the Linux Actions runner."""
    require(seconds > 0, 'Transport deadline exceeded')
    if not hasattr(signal, 'setitimer'):
        require(not required, 'Live artifact transport requires POSIX deadline support')
        yield
        return
    require(signal.getitimer(signal.ITIMER_REAL) == (0.0, 0.0), 'Existing process timer rejected')
    previous = signal.getsignal(signal.SIGALRM)
    def expired(_signum, _frame):
        raise RetainedError('Transport deadline exceeded')
    signal.signal(signal.SIGALRM, expired)
    try:
        signal.setitimer(signal.ITIMER_REAL, seconds)
        yield
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        signal.signal(signal.SIGALRM, previous)


class ArtifactClient:
    def __init__(self, token, opener=None):
        require(isinstance(token, str) and token and not re.search(r'[\r\n]', token), 'Missing scoped token')
        self.token = token
        self.open = opener or urllib.request.build_opener(NoRedirect()).open
        self.live_transport = opener is None
        self.started = time.monotonic()
        self.attempts = 0

    def get(self, url, cap):
        # Only constructed repository API paths can start a transport operation.
        require(url.startswith(API + '/actions/'), 'Unapproved API path')
        authorize = True
        for redirect in range(4):
            try:
                parsed = urllib.parse.urlsplit(url)
                host = parsed.hostname or ''
                require(parsed.scheme == 'https' and not parsed.username and not parsed.password
                        and parsed.port in (None, 443) and not parsed.fragment
                        and (host in ('api.github.com', 'github.com') or
                             any(host.endswith('.' + suffix) for suffix in
                                 ['blob.core.windows.net', 'actions.githubusercontent.com', 'githubusercontent.com'])),
                        'Unapproved artifact host')
                require(self.attempts < 32 and time.monotonic() - self.started < 180, 'Transport budget exhausted')
                self.attempts += 1
                headers = {'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10'}
                if host == 'api.github.com' and authorize:
                    headers['Authorization'] = 'Bearer ' + self.token
                request = urllib.request.Request(url, headers=headers, method='GET')
                deadline = min(time.monotonic() + 15, self.started + 180)
                def on_time():
                    require(time.monotonic() < deadline, 'Transport deadline exceeded')
                with request_deadline(deadline - time.monotonic(), required=self.live_transport):
                    try:
                        response = self.open(request, timeout=15)
                    except urllib.error.HTTPError as error:
                        response = error
                    with response:
                        on_time()
                        if response.status in (301, 302, 303, 307, 308):
                            require(redirect < 3, 'Redirect budget exhausted')
                            location = response.headers.get('Location')
                            require(isinstance(location, str), 'Missing artifact redirect')
                            next_url = urllib.parse.urljoin(url, location)
                            if urllib.parse.urlsplit(next_url).netloc != parsed.netloc:
                                authorize = False
                            url = next_url
                            continue
                        require(response.status == 200, 'Artifact request rejected')
                        chunks, length = [], 0
                        while True:
                            on_time()
                            chunk = response.read(min(64 * 1024, cap - length + 1))
                            on_time()
                            if not chunk:
                                break
                            chunks.append(chunk)
                            length += len(chunk)
                            require(length <= cap, 'Response exceeds byte limit')
                        return b''.join(chunks)
            except RetainedError:
                raise
            except Exception:
                raise RetainedError('Artifact transport failed') from None
        raise RetainedError('Redirect budget exhausted')

    def metadata(self, suffix):
        return strict_json(self.get(API + suffix, MIB))


def receipt_write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x', encoding='utf-8', newline='\n') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')


def canonical_id(value):
    require(bool(re.fullmatch(r'[1-9][0-9]{0,19}', value or '')), 'Invalid backup ID')
    return int(value)


def transport(mode, pin, output):
    require(os.environ.get('GITHUB_REF') == 'refs/heads/main' and os.environ.get('GITHUB_REPOSITORY') == REPOSITORY,
            'Transport requires actual main Actions context')
    client = ArtifactClient(os.environ.get('GH_TOKEN'))
    if mode == 'source':
        require(all(not os.environ.get(key) for key in ['BACKUP_RUN_ID', 'BACKUP_ARTIFACT_ID', 'BACKUP_ARTIFACT_DIGEST']),
                'Stage forbids backup inputs')
        run_id, artifact_id, expected_digest, cap = pin['runId'], pin['artifactId'], pin['artifactSha256'], MIB
    else:
        run_id = canonical_id(os.environ.get('BACKUP_RUN_ID'))
        artifact_id = canonical_id(os.environ.get('BACKUP_ARTIFACT_ID'))
        expected_digest = os.environ.get('BACKUP_ARTIFACT_DIGEST', '')
        require(bool(re.fullmatch('[a-f0-9]{64}', expected_digest)), 'Invalid backup digest')
        cap = 8 * MIB
    run = client.metadata(f'/actions/runs/{run_id}')
    artifact = client.metadata(f'/actions/artifacts/{artifact_id}')
    if mode == 'source':
        validate_source_metadata(run, artifact, pin)
    else:
        head = os.environ.get('GITHUB_SHA', '')
        require(bool(re.fullmatch('[a-f0-9]{40}', head)), 'Invalid executing workflow head')
        validate_run(run, run_id, head, 'accept-retained-census.yml', 'workflow_dispatch')
        size = artifact.get('size_in_bytes')
        require(type(size) is int and 0 < size <= cap, 'Invalid backup byte length')
        validate_artifact(artifact, artifact_id, run_id, head,
                          f"census-{pin['productCode']}-retained-candidate", size, expected_digest)
    body = client.get(f'{API}/actions/artifacts/{artifact_id}/zip', cap)
    require(len(body) == artifact['size_in_bytes'] and sha(body) == expected_digest, 'Downloaded ZIP identity mismatch')
    require(not output.exists(), 'Transport output must be absent')
    # Preserve the original independently of the validated extracted members.
    write_absent(output, {'original.zip': body})
    result = (authenticate_source if mode == 'source' else authenticate_backup)(output / 'original.zip', pin, output / 'files')
    result.update(sourceRunId=run_id, artifactId=artifact_id, artifactBytes=len(body), artifactSha256=sha(body),
                  executingHead=os.environ.get('GITHUB_SHA'), sourceHead=run['head_sha'], fetchAttempts=client.attempts)
    receipt_write(output / 'metadata/receipt.json', result)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['source', 'backup', 'check-bundle', 'check-readback'])
    parser.add_argument('--product', required=True)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--bundle', type=Path)
    parser.add_argument('--candidate', type=Path)
    parser.add_argument('--receipt', type=Path)
    parser.add_argument('--release', type=Path)
    args = parser.parse_args()
    pin = load_pin(Path(__file__).resolve().parents[1], args.product)
    if args.mode in ('source', 'backup'):
        require(args.output is not None, 'Output required')
        result = transport(args.mode, pin, args.output)
    elif args.mode == 'check-bundle':
        require(args.bundle is not None, 'Bundle required')
        body = read_bounded(args.bundle, 8 * MIB)
        check_bundle(body, pin)
        result = dict(schemaVersion=1, productCode=args.product, reference=reference(pin),
                      members={'bundle.json': dict(bytes=len(body), sha256=sha(body))})
        if args.candidate:
            candidate = read_bounded(args.candidate, 16 * 1024)
            check_candidate(candidate, pin)
            result['members']['candidate.json'] = dict(bytes=len(candidate), sha256=sha(candidate))
        if args.receipt:
            receipt_write(args.receipt, result)
    else:
        require(args.receipt is not None and args.release is not None, 'Readback inputs required')
        result = strict_json(read_bounded(args.receipt, MIB))
        result['releaseSha256'] = sha(read_bounded(args.release, 32 * MIB))
        assert_archive_readback(result, pin)
    print(json.dumps(result))


if __name__ == '__main__':
    try:
        main()
    except (RetainedError, OSError, KeyError, TypeError, ValueError):
        print('Retained artifact authentication failed; no archive acceptance established.', file=sys.stderr)
        sys.exit(1)
