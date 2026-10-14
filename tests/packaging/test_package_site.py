"""Offline contract tests for the local manifest-authenticated ZIP operator."""
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch
import warnings
import zipfile

REPO = Path(__file__).resolve().parents[2]
TOOL = REPO / "scripts/package_site.py"
DEFAULT_MANIFEST = object()
spec = importlib.util.spec_from_file_location("package_site", TOOL)
pkg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pkg)


def digest(body):
    return hashlib.sha256(body).hexdigest()


def fixture_manifest(root, kind="withdrawal"):
    files, sources = [], []
    targets = {"_headers", "404.html", "index.html"} if kind == "withdrawal" else {"_headers", "404.html"}
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        name, body = path.relative_to(root).as_posix(), path.read_bytes()
        role = "provider-control" if name == "_headers" else "served-error-page" if name == "404.html" else "served-asset"
        item = {"path": name, "bytes": len(body), "sha256": digest(body), "role": role}
        files.append(item)
        if name in targets:
            source = "deployment/pages/_headers" if name == "_headers" else f"deployment/pages/withdrawal/{name}" if kind == "withdrawal" else "deployment/pages/404.html"
            sources.append({"sourcePath": source, "targetPath": name, "bytes": len(body),
                            "sha256": digest(body), "gitBlob": hashlib.sha1(f"blob {len(body)}\0".encode() + body).hexdigest()})
    return {"schemaVersion": 1, "status": "prepared-for-owner-deployment-review", "packageKind": kind,
            "codeCommit": "1" * 40, "files": files, "sourceTemplates": sources,
            "fileCount": len(files), "totalBytes": sum(f["bytes"] for f in files),
            "largestFile": max(files, key=lambda f: f["bytes"]), "planningAlertTriggered": False,
            "uploadLimits": {"dashboard": {"maxFiles": 1000, "maxAssetBytes": 26214400, "eligible": True}}}


class PackageTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="site-package-")
        self.addCleanup(self.temp.cleanup)
        self.home = Path(self.temp.name)
        self.root = self.home / "input"
        self.root.mkdir()
        for name in ("index.html", "404.html"):
            (self.root / name).write_bytes((REPO / f"deployment/pages/withdrawal/{name}").read_bytes())
        (self.root / "_headers").write_bytes(b"/*\n  X-Robots-Tag: noindex, nofollow\n")
        self.manifest = fixture_manifest(self.root)
        self.operator = pkg.Packager(self.home)
        self.out = self.home / "site.zip"

    def reject_create(self, manifest=DEFAULT_MANIFEST):
        with self.assertRaises(ValueError):
            self.operator.create(self.root, self.manifest if manifest is DEFAULT_MANIFEST else manifest, self.out)
        self.assertFalse(self.out.exists())

    def test_create_and_verify_exact_root_entries_and_receipt(self):
        receipt = self.operator.create(self.root, self.manifest, self.out)
        self.assertEqual(receipt, self.operator.verify(self.out, self.manifest))
        self.assertEqual(receipt, {"path": "site.zip", "bytes": self.out.stat().st_size,
                                  "sha256": digest(self.out.read_bytes()), "entryCount": 3, "entriesVerified": True})
        with zipfile.ZipFile(self.out) as archive:
            self.assertEqual(set(archive.namelist()), {"index.html", "404.html", "_headers"})

    def test_site_and_existing_manifest_metadata_are_compatible(self):
        (self.root / "404.html").write_bytes((REPO / "deployment/pages/404.html").read_bytes())
        (self.root / "_astro").mkdir()
        (self.root / "_astro/chart.js").write_bytes(b"export const value = 1;")
        manifest = fixture_manifest(self.root, "site")
        manifest["country"] = {"releaseId": "retained", "reporting": {"latest": "2026-08"}}
        self.assertEqual(self.operator.create(self.root, manifest, self.out)["entryCount"], 4)

    def test_changed_or_extra_input_is_rejected_before_output(self):
        for kind in ("changed", "extra", "missing"):
            with self.subTest(kind=kind):
                if kind == "changed":
                    (self.root / "index.html").write_bytes(b"changed")
                elif kind == "extra":
                    (self.root / "proof.json").write_bytes(b"private")
                else:
                    (self.root / "_headers").unlink()
                self.reject_create()
                for name in ("index.html", "404.html"):
                    (self.root / name).write_bytes((REPO / f"deployment/pages/withdrawal/{name}").read_bytes())
                (self.root / "_headers").write_bytes(pkg.HEADER)
                (self.root / "proof.json").unlink(missing_ok=True)

    def test_recomputed_header_and_wrong_template_blob_are_rejected(self):
        for kind in ("header", "blob"):
            with self.subTest(kind=kind):
                manifest = copy.deepcopy(self.manifest)
                if kind == "header":
                    (self.root / "_headers").write_bytes(b"/*\n X-Robots-Tag: index\n")
                    manifest = fixture_manifest(self.root)
                else:
                    (self.root / "_headers").write_bytes(pkg.HEADER)
                    manifest["sourceTemplates"][0]["gitBlob"] = "0" * 40
                self.reject_create(manifest)

    def test_malformed_manifest_shapes_totals_limits_and_templates(self):
        variants = [None, [], {}, copy.deepcopy(self.manifest)]
        variants[-1]["files"] = [None]
        mutations = [
            ("schemaVersion", True), ("fileCount", True), ("totalBytes", 0), ("largestFile", None),
            ("largestFile", {"path": "index.html", "bytes": max(f["bytes"] for f in self.manifest["files"])}),
            ("uploadLimits", None), ("sourceTemplates", [None]), ("sourceTemplates", []), ("files", []),
        ]
        # The claimed largest entry must be the entry whose bytes are reported.
        if (self.root / "index.html").stat().st_size == max(f["bytes"] for f in self.manifest["files"]):
            mutations[4] = ("largestFile", {"path": "_headers", "bytes": max(f["bytes"] for f in self.manifest["files"])})
        for key, value in mutations:
            manifest = copy.deepcopy(self.manifest)
            manifest[key] = value
            variants.append(manifest)
        for manifest in variants:
            with self.subTest(manifest=manifest):
                self.reject_create(manifest)

    def test_invalid_file_metadata_and_template_source(self):
        for field, value in (("bytes", True), ("bytes", -1), ("bytes", pkg.MAX_BYTES + 1),
                             ("sha256", None), ("sha256", "A" * 64), ("role", "served-asset")):
            manifest = copy.deepcopy(self.manifest)
            next(f for f in manifest["files"] if f["path"] == "_headers")[field] = value
            with self.subTest(field=field, value=value):
                self.reject_create(manifest)
        manifest = copy.deepcopy(self.manifest)
        manifest["sourceTemplates"][0]["sourcePath"] = "private/template.html"
        self.reject_create(manifest)

    def test_private_runtime_and_nonportable_manifest_paths(self):
        (self.root / "404.html").write_bytes((REPO / "deployment/pages/404.html").read_bytes())
        base = fixture_manifest(self.root, "site")
        def with_asset(name):
            manifest = copy.deepcopy(base)
            manifest["files"].append({"path": name, "bytes": 1, "sha256": digest(b"x"), "role": "served-asset"})
            manifest["fileCount"] += 1
            manifest["totalBytes"] += 1
            return manifest
        # An ordinary asset with otherwise identical metadata must be accepted.
        self.assertIn("assets/chart.js", pkg.manifest_items(with_asset("assets/chart.js")))
        for name in ("data/secret.json", "preview/index.html", "functions/index.js", ".git/config.json",
                     "secrets/key.json", ".env.json", "_worker.js", "_WORKER.js", "_redirects",
                     "asset.js.map", "../index.html", "/index.html", "C:/index.html", r"a\index.html",
                     "a//index.html", "a/./index.html", "asset%2ejson", "index.html ", "nul.json"):
            with self.subTest(name=name), self.assertRaises(ValueError):
                pkg.manifest_items(with_asset(name))

    def test_duplicates_and_case_collisions_in_manifest(self):
        for name in ("index.html", "INDEX.html"):
            manifest = copy.deepcopy(self.manifest)
            item = copy.deepcopy(next(f for f in manifest["files"] if f["path"] == "index.html"))
            item["path"] = name
            manifest["files"].append(item)
            self.reject_create(manifest)

    def test_count_and_asset_limit_includes_controls(self):
        manifest = copy.deepcopy(self.manifest)
        manifest["files"] += [manifest["files"][0]] * 998
        self.reject_create(manifest)
        with (self.root / "index.html").open("wb") as stream:
            stream.truncate(pkg.MAX_BYTES + 1)
        self.reject_create()

    def test_occupied_output_preserves_contents_and_output_inside_input_is_rejected(self):
        self.out.write_bytes(b"keep")
        with self.assertRaises(ValueError):
            self.operator.create(self.root, self.manifest, self.out)
        self.assertEqual(self.out.read_bytes(), b"keep")
        with self.assertRaises(ValueError):
            self.operator.create(self.root, self.manifest, self.root / "site.zip")

    def test_scope_escape_dotdot_and_hardlinked_input_are_rejected(self):
        with self.assertRaises(ValueError):
            self.operator.checked_path(self.home / ".." / self.home.name / "input")
        with self.assertRaises(ValueError):
            self.operator.checked_path(self.home.parent)
        os.link(self.root / "index.html", self.home / "linked.html")
        self.reject_create()

    def test_reparse_ancestor_for_input_and_output_is_rejected(self):
        link = self.home / "link"
        if os.name == "nt":
            command = f"New-Item -ItemType Junction -Path '{link}' -Target '{self.root}' | Out-Null"
            subprocess.run(["powershell.exe", "-NoProfile", "-Command", command], check=True, capture_output=True)
        else:
            link.symlink_to(self.root, target_is_directory=True)
        try:
            with self.assertRaises(ValueError):
                self.operator.create(link, self.manifest, self.out)
            with self.assertRaises(ValueError):
                self.operator.create(self.root, self.manifest, link / "site.zip")
        finally:
            # Remove only the verified link itself, never recurse through it.
            if os.name == "nt":
                os.rmdir(link)
            else:
                link.unlink()

    def test_metadata_domains_differ_but_changes_within_handle_domain_fail(self):
        item = self.manifest["files"][0]
        original = os.fstat
        calls = 0
        def shifted(fd):
            nonlocal calls
            calls += 1
            value = original(fd)
            result = SimpleNamespace(**{name: getattr(value, name) for name in dir(value) if name.startswith("st_")})
            result.st_ctime_ns += 1000
            if calls == 2 and changing:
                result.st_ctime_ns += 1000
            return result
        changing = False
        with patch.object(os, "fstat", shifted):
            self.assertEqual(self.operator.checked_body(self.root / item["path"], item), (self.root / item["path"]).read_bytes())
        calls, changing = 0, True
        with patch.object(os, "fstat", shifted), self.assertRaises(ValueError):
            self.operator.checked_body(self.root / item["path"], item)

    def make_zip(self, names=None, transform=None):
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            with zipfile.ZipFile(self.out, "w") as archive:
                for name in names or [f["path"] for f in self.manifest["files"]]:
                    info = zipfile.ZipInfo(name)
                    info.external_attr = (stat.S_IFREG | 0o644) << 16
                    body = (self.root / name).read_bytes() if (self.root / name).is_file() else b"bad"
                    if transform:
                        body = transform(info, body)
                    archive.writestr(info, body)

    def test_bad_zip_paths_duplicates_attributes_and_compression(self):
        originals = [f["path"] for f in self.manifest["files"]]
        for name in ("../index.html", "/index.html", "C:/index.html", r"a\index.html",
                     "wrapper/index.html", "404.html", "INDEX.html", "directory/"):
            self.make_zip([originals[0], originals[1], name])
            with self.subTest(name=name), self.assertRaises(ValueError):
                self.operator.verify(self.out, self.manifest)
        for kind in ("symlink", "directory", "compression"):
            def transform(info, body):
                if kind == "symlink":
                    info.external_attr = (stat.S_IFLNK | 0o777) << 16
                elif kind == "directory":
                    info.external_attr |= 16
                else:
                    info.compress_type = zipfile.ZIP_BZIP2
                return body
            self.make_zip(transform=transform)
            with self.subTest(kind=kind), self.assertRaises(ValueError):
                self.operator.verify(self.out, self.manifest)

    def test_zip_payload_template_identity_header_and_invalid_archive(self):
        self.make_zip(transform=lambda info, body: body + b"changed")
        with self.assertRaises(ValueError):
            self.operator.verify(self.out, self.manifest)
        self.make_zip()
        manifest = copy.deepcopy(self.manifest)
        manifest["sourceTemplates"][0]["gitBlob"] = "0" * 40
        with self.assertRaises(ValueError):
            self.operator.verify(self.out, manifest)
        self.out.write_bytes(b"not zip")
        with self.assertRaises(ValueError):
            self.operator.verify(self.out, self.manifest)

    def test_manifest_read_rejects_duplicate_keys_and_oversized_input(self):
        path = self.home / "manifest.json"
        path.write_text('{"files":[],"files":[]}', encoding="utf-8")
        with self.assertRaises(ValueError):
            self.operator.read_manifest(path)
        with path.open("wb") as stream:
            stream.truncate(pkg.MAX_MANIFEST_BYTES + 1)
        with self.assertRaises(ValueError):
            self.operator.read_manifest(path)


    def test_identical_inputs_produce_identical_zip_bytes(self):
        first = self.operator.create(self.root, self.manifest, self.out)
        second = self.operator.create(self.root, self.manifest, self.home / "second.zip")
        self.assertEqual(first["sha256"], second["sha256"])

    def test_exact_dashboard_file_limit_is_accepted(self):
        (self.root / "404.html").write_bytes((REPO / "deployment/pages/404.html").read_bytes())
        for index in range(997):
            (self.root / f"p{index}.html").write_bytes(b"x")
        manifest = fixture_manifest(self.root, "site")
        self.assertEqual(self.operator.create(self.root, manifest, self.out)["entryCount"], 1000)

    def test_exact_asset_byte_limit_is_accepted(self):
        with (self.root / "index.html").open("wb") as stream:
            stream.truncate(pkg.MAX_BYTES)
        manifest = fixture_manifest(self.root)
        self.assertEqual(self.operator.create(self.root, manifest, self.out)["entryCount"], 3)

    def test_hardlinked_zip_and_zip_metadata_drift_are_rejected(self):
        self.operator.create(self.root, self.manifest, self.out)
        os.link(self.out, self.home / "linked.zip")
        with self.assertRaises(ValueError):
            self.operator.verify(self.out, self.manifest)
        (self.home / "linked.zip").unlink()
        original, calls = os.fstat, 0
        def changing(fd):
            nonlocal calls
            calls += 1
            value = original(fd)
            result = SimpleNamespace(**{name: getattr(value, name) for name in dir(value) if name.startswith("st_")})
            if calls == 2:
                result.st_mtime_ns += 1000
            return result
        with patch.object(os, "fstat", changing), self.assertRaises(ValueError):
            self.operator.verify(self.out, self.manifest)

    def test_missing_and_extra_zip_entries_are_rejected(self):
        for names in (["index.html", "_headers"], ["404.html", "_headers", "index.html", "extra.json"],
                      ["index.html", "INDEX.html", "_headers"]):
            self.make_zip(names)
            with self.subTest(names=names), self.assertRaises(ValueError):
                self.operator.verify(self.out, self.manifest)

    def test_cli_create_verify_and_failure_have_unambiguous_output(self):
        manifest = self.home / "manifest.json"
        manifest.write_text(json.dumps(self.manifest), encoding="utf-8")
        common = ["--work-dir", str(self.home), "--manifest", str(manifest), "--zip", str(self.out)]
        create = subprocess.run([sys.executable, str(TOOL), "create", *common, "--root", str(self.root)], capture_output=True, text=True)
        self.assertEqual(create.returncode, 0, create.stderr)
        receipt = json.loads(create.stdout)
        verify = subprocess.run([sys.executable, str(TOOL), "verify", *common], capture_output=True, text=True)
        self.assertEqual(verify.returncode, 0, verify.stderr)
        self.assertEqual(json.loads(verify.stdout), receipt)
        failure = subprocess.run([sys.executable, str(TOOL), "create", *common, "--root", str(self.root)], capture_output=True, text=True)
        self.assertNotEqual(failure.returncode, 0)
        self.assertEqual(failure.stdout, "")
        self.assertIn("Occupied", failure.stderr)
        self.assertNotIn("Traceback", failure.stderr)


if __name__ == "__main__":
    unittest.main()

