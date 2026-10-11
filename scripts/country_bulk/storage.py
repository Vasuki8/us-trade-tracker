"""Exclusive local evidence writes and identities; no accepted-data destinations."""
import hashlib
import json
import os
import stat
from dataclasses import dataclass
from pathlib import Path

from .model import Budget, Limits, require


def reject_reparse(path: Path) -> None:
    for ancestor in (path, *path.parents):
        if ancestor.exists() or ancestor.is_symlink():
            info = ancestor.lstat()
            require(not stat.S_ISLNK(info.st_mode) and not getattr(info, 'st_file_attributes', 0) & getattr(stat, 'FILE_ATTRIBUTE_REPARSE_POINT', 1024), 'reparse-output-path')


def preflight_output(repo_root: Path, output: Path, free_bytes: int) -> Path:
    repo_root = Path(os.path.abspath(repo_root))
    output = Path(output)
    if not output.is_absolute():
        output = repo_root / output
    require('..' not in output.parts, 'unsafe-output-path')
    output = Path(os.path.abspath(output))
    allowed = repo_root / 'data/backups/canada-country-audit'
    require(output != allowed and output.is_relative_to(allowed), 'unsupported-output-location')
    reject_reparse(output)
    require(not output.exists(), 'occupied-output')
    require(free_bytes >= Limits().preflight_free, 'insufficient-preflight-disk')
    return output


@dataclass(frozen=True)
class FileIdentity:
    path: str
    bytes: int
    sha256: str


class BoundedWriter:
    def __init__(self, store, name: str, category: str, maximum_bytes: int, final: bool):
        self.store = store
        self.category = category
        self.maximum_bytes = maximum_bytes
        self.final = final
        self.bytes = 0
        self.hasher = hashlib.sha256()
        self.path = store.path(name)
        try:
            self.stream = self.path.open('xb')
        except OSError as error:
            raise ValueError('occupied-or-unwritable-evidence') from error

    def write(self, data: bytes) -> None:
        if self.final and hasattr(self.store.budget,'final_report_deadline'):
            require(self.store.budget.clock()<self.store.budget.final_report_deadline,'report-deadline')
        require(type(data) is bytes and self.bytes + len(data) <= self.maximum_bytes, 'file-byte-cap')
        self.store.budget.ensure(self.category, len(data), self.final)
        view = memoryview(data)
        while view:
            written = self.stream.write(view)
            require(written is not None and written > 0, 'evidence-write-failed')
            self.hasher.update(view[:written])
            self.bytes += written
            if self.category == 'original':
                self.store.budget.charge_original(written)
            else:
                self.store.budget.charge_generated(written, self.final)
            view = view[written:]

    def close(self) -> None:
        self.stream.close()

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.close()


class EvidenceStore:
    def __init__(self, root: Path, budget: Budget):
        self.root = root
        self.budget = budget

    @classmethod
    def create(cls, root: Path, budget: Budget, repo_root: Path | None = None):
        repository = repo_root if repo_root is not None else Path(__file__).resolve().parents[2]
        root = preflight_output(repository, root, budget.limits.preflight_free)
        root.parent.mkdir(parents=True, exist_ok=True)
        try:
            root.mkdir()
        except OSError as error:
            raise ValueError('occupied-or-unwritable-output') from error
        return cls(root, budget)

    def path(self, name: str) -> Path:
        require(type(name) is str and 0 < len(name) <= 128 and Path(name).name == name and name not in ('.', '..') and not any(char in name for char in '/\\:\x00'), 'unsafe-evidence-name')
        result = self.root / name
        reject_reparse(result)
        return result

    def open_bounded(self, name: str, category: str, maximum_bytes: int, final: bool = False) -> BoundedWriter:
        require(category in ('original', 'generated') and type(maximum_bytes) is int and maximum_bytes >= 0, 'invalid-writer-limit')
        return BoundedWriter(self, name, category, maximum_bytes, final)

    def write_json(self, name: str, payload: object, final: bool = False) -> FileIdentity:
        encoder = json.JSONEncoder(ensure_ascii=True, allow_nan=False, separators=(',', ':'))
        with self.open_bounded(name, 'generated', self.budget.limits.generated_bytes, final) as writer:
            for chunk in encoder.iterencode(payload):
                writer.write(chunk.encode('ascii'))
            writer.write(b'\n')
        return self.identity(name)

    def identity(self, name: str) -> FileIdentity:
        path = self.path(name)
        with path.open('rb') as stream:
            digest = hashlib.file_digest(stream, 'sha256').hexdigest()
        return FileIdentity(name, path.stat().st_size, digest)
