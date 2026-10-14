"""Create or verify a local static-site ZIP against an existing preparation manifest.

This tool authenticates package bytes and template identities. It neither builds
a site nor approves source data or deployment. Python 3.12+, standard library only.
"""
import argparse
from contextlib import contextmanager
import hashlib
import json
import os
from pathlib import Path
import stat
import struct
import sys
import zipfile
import zlib

MAX_FILES = 1000
MAX_BYTES = 26214400
MAX_MANIFEST_BYTES = 1048576
HEADER = b"/*\n  X-Robots-Tag: noindex, nofollow\n"
ASSET_SUFFIXES = {".html", ".js", ".css", ".json", ".png", ".svg", ".ico", ".webp", ".woff2"}
PRIVATE_PARTS = {"preview", "functions", "data", "secrets", "node_modules"}
RESERVED_NAMES = {"con", "prn", "aux", "nul", *(f"com{i}" for i in range(1, 10)), *(f"lpt{i}" for i in range(1, 10))}


def canonical_name(name):
    if not isinstance(name, str) or not name or any(c in name for c in '\\:?#%*<>"|') or any(ord(c) < 32 or ord(c) == 127 for c in name):
        raise ValueError("Invalid entry path")
    parts = name.split("/")
    if any(p in ("", ".", "..") or p.endswith((" ", ".")) or p.split(".")[0].casefold() in RESERVED_NAMES for p in parts):
        raise ValueError("Invalid entry path")
    return name


def _digest(value, length):
    return isinstance(value, str) and len(value) == length and all(c in "0123456789abcdef" for c in value)


def manifest_items(manifest):
    if not isinstance(manifest, dict) or type(manifest.get("schemaVersion")) is not int or manifest["schemaVersion"] != 1 or manifest.get("status") != "prepared-for-owner-deployment-review" or manifest.get("packageKind") not in ("site", "withdrawal"):
        raise ValueError("Invalid preparation manifest")
    files = manifest.get("files")
    if not isinstance(files, list) or not files or len(files) > MAX_FILES:
        raise ValueError("File-count limit")
    result, folded = {}, set()
    for item in files:
        if not isinstance(item, dict):
            raise ValueError("Invalid file metadata")
        name = canonical_name(item.get("path"))
        if name.casefold() in folded:
            raise ValueError("Duplicate or case-colliding entry")
        folded.add(name.casefold())
        if type(item.get("bytes")) is not int or not 0 <= item["bytes"] <= MAX_BYTES:
            raise ValueError("Asset-byte limit")
        if not _digest(item.get("sha256"), 64):
            raise ValueError("Invalid digest")
        role = "provider-control" if name == "_headers" else "served-error-page" if name == "404.html" else "served-asset"
        if item.get("role") != role or name != "_headers" and Path(name).suffix not in ASSET_SUFFIXES:
            raise ValueError("Unexpected file role or kind")
        if any(p.startswith(".") or p.casefold() in PRIVATE_PARTS for p in name.split("/")) or Path(name).name.casefold() in ("_worker.js", "_redirects"):
            raise ValueError("Private or executable entry")
        result[name] = item
    if not {"_headers", "404.html"}.issubset(result):
        raise ValueError("Missing provider control/error page")
    if manifest["packageKind"] == "withdrawal" and set(result) != {"index.html", "404.html", "_headers"}:
        raise ValueError("Withdrawal contains extra content")
    if type(manifest.get("fileCount")) is not int or manifest["fileCount"] != len(files) or type(manifest.get("totalBytes")) is not int or manifest["totalBytes"] != sum(f["bytes"] for f in files):
        raise ValueError("Manifest totals differ")
    largest = manifest.get("largestFile")
    if not isinstance(largest, dict) or not isinstance(largest.get("path"), str) or largest["path"] not in result or type(largest.get("bytes")) is not int or largest["bytes"] != result[largest["path"]]["bytes"] or largest["bytes"] != max(f["bytes"] for f in files):
        raise ValueError("Manifest largest file differs")
    for field in ("sha256", "role"):
        if field in largest and largest[field] != result[largest["path"]][field]:
            raise ValueError("Manifest largest file identity differs")
    limits = manifest.get("uploadLimits")
    limit = limits.get("dashboard") if isinstance(limits, dict) else None
    if not isinstance(limit, dict) or limit.get("eligible") is not True or type(limit.get("maxFiles")) is not int or type(limit.get("maxAssetBytes")) is not int or limit != {"maxFiles": MAX_FILES, "maxAssetBytes": MAX_BYTES, "eligible": True}:
        raise ValueError("Dashboard limit metadata invalid")
    sources = manifest.get("sourceTemplates")
    targets = {"_headers", "404.html", "index.html"} if manifest["packageKind"] == "withdrawal" else {"_headers", "404.html"}
    if not isinstance(sources, list) or len(sources) != len(targets) or any(not isinstance(s, dict) or not isinstance(s.get("targetPath"), str) for s in sources) or {s["targetPath"] for s in sources} != targets:
        raise ValueError("Template identity mapping differs")
    for source in sources:
        target = source["targetPath"]
        expected = "deployment/pages/_headers" if target == "_headers" else f"deployment/pages/withdrawal/{target}" if manifest["packageKind"] == "withdrawal" else "deployment/pages/404.html"
        if source.get("sourcePath") != expected or type(source.get("bytes")) is not int or source["bytes"] != result[target]["bytes"] or source.get("sha256") != result[target]["sha256"] or not _digest(source.get("gitBlob"), 40):
            raise ValueError("Template source identity differs")
    return result


def _identity(value):
    return (value.st_dev, value.st_ino, value.st_size, value.st_mtime_ns, value.st_ctime_ns)


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate manifest key")
        result[key] = value
    return result


class Packager:
    """All input/output paths must stay inside an explicit owned work directory."""

    def __init__(self, work_dir):
        self.work_dir = Path(work_dir).absolute()
        if self.work_dir == Path(self.work_dir.anchor):
            raise ValueError("Work directory must be an owned preparation directory")
        self.checked_path(self.work_dir)
        if not self.work_dir.is_dir():
            raise ValueError("Work directory is not a directory")

    def checked_path(self, path, missing=False):
        path = Path(path).absolute()
        if ".." in path.parts or not path.is_relative_to(self.work_dir):
            raise ValueError("Path outside owned preparation")
        for part in reversed([path, *path.parents]):
            try:
                value = part.lstat()
            except FileNotFoundError:
                if missing and part == path:
                    continue
                raise ValueError("Missing path ancestor") from None
            if stat.S_ISLNK(value.st_mode) or getattr(value, "st_file_attributes", 0) & 1024:
                raise ValueError("Reparse path rejected")
        return path

    @contextmanager
    def _stable_file(self, path, expected_size=None, max_size=None):
        path = self.checked_path(path)
        before = path.lstat()
        if not stat.S_ISREG(before.st_mode) or before.st_nlink != 1 or expected_size is not None and before.st_size != expected_size or max_size is not None and before.st_size > max_size:
            raise ValueError("Input file type/length differs")
        with path.open("rb") as stream:
            opened = os.fstat(stream.fileno())
            self.checked_path(path)
            if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
                raise ValueError("Input file changed before read")
            yield stream
            after = os.fstat(stream.fileno())
        current = path.lstat()
        # Windows path and handle queries can expose different ctime domains.
        # Compare within each domain; dev/ino still bind the handle to its path.
        if _identity(opened) != _identity(after) or _identity(before) != _identity(current):
            raise ValueError("Input changed during read")
        self.checked_path(path)

    def checked_body(self, path, item):
        with self._stable_file(path, expected_size=item["bytes"], max_size=MAX_BYTES) as stream:
            body = stream.read(MAX_BYTES + 1)
        if len(body) != item["bytes"] or hashlib.sha256(body).hexdigest() != item["sha256"]:
            raise ValueError("Input payload differs")
        return body

    def read_manifest(self, path):
        with self._stable_file(path, max_size=MAX_MANIFEST_BYTES) as stream:
            body = stream.read(MAX_MANIFEST_BYTES + 1)
        if len(body) > MAX_MANIFEST_BYTES:
            raise ValueError("Manifest byte limit")
        try:
            manifest = json.loads(body.decode("utf-8"), object_pairs_hook=_unique_object)
        except (UnicodeError, json.JSONDecodeError, RecursionError) as error:
            raise ValueError("Invalid manifest JSON") from error
        manifest_items(manifest)
        return manifest

    @staticmethod
    def _check_template(body, source):
        if hashlib.sha1(f"blob {len(body)}\0".encode() + body).hexdigest() != source["gitBlob"]:
            raise ValueError("Template Git blob differs")

    def verify_tree(self, root, manifest):
        root = self.checked_path(root)
        if not root.is_dir():
            raise ValueError("Input root is not a directory")
        items = manifest_items(manifest)
        observed = set()

        def scan(directory):
            self.checked_path(directory)
            for path in directory.iterdir():
                self.checked_path(path)
                value = path.lstat()
                if stat.S_ISDIR(value.st_mode):
                    scan(path)
                elif stat.S_ISREG(value.st_mode):
                    name = canonical_name(path.relative_to(root).as_posix())
                    if name not in items:
                        raise ValueError("Unexpected input file")
                    self.checked_body(path, items[name])
                    observed.add(name)
                else:
                    raise ValueError("Nonregular input")
        scan(root)
        if observed != set(items):
            raise ValueError("Missing input entries")
        if self.checked_body(root / "_headers", items["_headers"]).replace(b"\r\n", b"\n") != HEADER:
            raise ValueError("Provider control differs")
        for source in manifest["sourceTemplates"]:
            self._check_template(self.checked_body(root / source["targetPath"], items[source["targetPath"]]), source)

    def create(self, root, manifest, destination):
        root = self.checked_path(root)
        self.verify_tree(root, manifest)
        destination = self.checked_path(destination, missing=True)
        if destination.is_relative_to(root) or destination.exists():
            raise ValueError("Occupied or invalid destination")
        try:
            with zipfile.ZipFile(destination, "x", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
                for item in manifest["files"]:
                    body = self.checked_body(root / item["path"], item)
                    info = zipfile.ZipInfo(item["path"])
                    info.create_system = 3
                    info.external_attr = (stat.S_IFREG | 0o644) << 16
                    archive.writestr(info, body, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
        except FileExistsError:
            raise ValueError("Occupied destination") from None
        self.verify_tree(root, manifest)
        return self.verify(destination, manifest)

    @staticmethod
    def _member_body(source, archive, info, expected_bytes):
        # ZipExtFile truncates decompressed data to the central directory size.
        # Retain its local-name/overlap checks, then decode the entire declared
        # compressed member ourselves with a strict output bound.
        with archive.open(info):
            pass
        source.seek(info.header_offset)
        header = source.read(30)
        if len(header) != 30:
            raise ValueError("Truncated ZIP local header")
        fields = struct.unpack("<4s5H3L2H", header)
        if fields[0] != b"PK\x03\x04" or fields[2] != info.flag_bits or fields[3] != info.compress_type:
            raise ValueError("ZIP local metadata differs")
        source.seek(info.header_offset + 30 + fields[9] + fields[10])
        if info.compress_type == zipfile.ZIP_STORED and info.compress_size != expected_bytes:
            raise ValueError("ZIP stored length differs")
        decoder = zlib.decompressobj(-15) if info.compress_type == zipfile.ZIP_DEFLATED else None
        body = bytearray()
        remaining = info.compress_size
        while remaining:
            chunk = source.read(min(65536, remaining))
            if not chunk:
                raise ValueError("Truncated ZIP member")
            remaining -= len(chunk)
            decoded = decoder.decompress(chunk, expected_bytes + 1 - len(body)) if decoder else chunk
            body.extend(decoded)
            if len(body) > expected_bytes:
                raise ValueError("ZIP expanded length differs")
            if decoder and (decoder.unconsumed_tail or decoder.unused_data):
                raise ValueError("ZIP compressed member has trailing data")
        if decoder and not decoder.eof:
            raise ValueError("Incomplete ZIP compressed stream")
        if len(body) != expected_bytes or zlib.crc32(body) != info.CRC:
            raise ValueError("ZIP member length or CRC differs")
        return bytes(body)

    def verify(self, path, manifest):
        path = self.checked_path(path)
        items = manifest_items(manifest)
        templates = {s["targetPath"]: s for s in manifest["sourceTemplates"]}
        seen, folded = set(), set()
        try:
            # Keep one stable handle for member validation and the final ZIP hash.
            with self._stable_file(path) as source:
                with zipfile.ZipFile(source) as archive:
                    if len(archive.infolist()) != len(items):
                        raise ValueError("ZIP entry count differs")
                    for info in archive.infolist():
                        name = canonical_name(info.orig_filename)
                        if name != info.filename or name.casefold() in folded or name not in items or info.is_dir():
                            raise ValueError("Unexpected or duplicate ZIP path")
                        folded.add(name.casefold())
                        seen.add(name)
                        mode = stat.S_IFMT(info.external_attr >> 16)
                        if mode not in (0, stat.S_IFREG) or info.external_attr & 16 or info.flag_bits & 1 or info.compress_type not in (zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED):
                            raise ValueError("Unsupported ZIP entry attributes")
                        item = items[name]
                        if not 0 <= info.file_size <= MAX_BYTES or info.file_size != item["bytes"]:
                            raise ValueError("ZIP length limit or mismatch")
                        body = self._member_body(source, archive, info, item["bytes"])
                        if len(body) != item["bytes"] or hashlib.sha256(body).hexdigest() != item["sha256"]:
                            raise ValueError("ZIP payload differs")
                        if name == "_headers" and body.replace(b"\r\n", b"\n") != HEADER:
                            raise ValueError("ZIP provider control differs")
                        if name in templates:
                            self._check_template(body, templates[name])
                if seen != set(items):
                    raise ValueError("ZIP entry set differs")
                source.seek(0)
                sha, size = hashlib.sha256(), 0
                while chunk := source.read(1048576):
                    sha.update(chunk)
                    size += len(chunk)
        except (zipfile.BadZipFile, RuntimeError, NotImplementedError, EOFError, zlib.error) as error:
            raise ValueError("Invalid ZIP") from error
        return {"path": path.relative_to(self.work_dir).as_posix(), "bytes": size, "sha256": sha.hexdigest(),
                "entryCount": len(seen), "entriesVerified": True}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    for command in ("create", "verify"):
        sub = commands.add_parser(command)
        sub.add_argument("--work-dir", type=Path, required=True, help="Existing owned preparation directory containing all inputs and outputs")
        sub.add_argument("--manifest", type=Path, required=True, help="Existing schema-v1 preparation manifest")
        sub.add_argument("--zip", type=Path, required=True, help="Fresh output for create; existing input for verify")
        if command == "create":
            sub.add_argument("--root", type=Path, required=True, help="Prepared site or withdrawal tree")
    args = parser.parse_args(argv)
    try:
        operator = Packager(args.work_dir)
        manifest = operator.read_manifest(args.manifest)
        receipt = operator.create(args.root, manifest, args.zip) if args.command == "create" else operator.verify(args.zip, manifest)
    except (ValueError, OSError, RecursionError) as error:
        print(f"Packaging failed: {error}", file=sys.stderr)
        return 1
    print(json.dumps(receipt, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())

