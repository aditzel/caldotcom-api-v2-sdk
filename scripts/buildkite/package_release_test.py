"""Adversarial package checks and full wrapper tests without registry access."""
import base64
import gzip
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import tarfile
import tempfile
import time
import unittest
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("package_release", HERE / "package_release.py")
p = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(p)
PACKAGE = {"name": p.NAME, "version": "0.2.0", "files": ["dist", "README.md", "LICENSE"]}
FILES = {"package.json": json.dumps(PACKAGE).encode(), "README.md": b"SDK documentation",
         "LICENSE": b"MIT License\nCopyright (c) 2025 Allan Ditzel\n",
         **{"dist/index." + suffix: b"export {};" for suffix in ("js", "mjs", "cjs", "d.ts")}}


def tarball(changes=None, duplicates=False, link=False, trailing=False):
    output = io.BytesIO()
    files = {"package/" + name: data for name, data in FILES.items()}
    files.update(changes or {})
    with tarfile.open(fileobj=output, mode="w") as archive:
        for name, data in files.items():
            if data is None:
                continue
            entry = tarfile.TarInfo(name)
            entry.mode = 0o644
            entry.size = len(data)
            archive.addfile(entry, io.BytesIO(data))
        if duplicates:
            archive.addfile(entry, io.BytesIO(data))
        if link:
            entry = tarfile.TarInfo("package/dist/linked")
            entry.type = tarfile.SYMTYPE
            entry.linkname = "/etc/passwd"
            archive.addfile(entry)
    return gzip.compress(output.getvalue() + (b"untrusted trailing data" if trailing else b""))


class PackageTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="cal-release-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for name in p.METADATA:
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("{}")
        for name, data in FILES.items():
            path = self.root / "packages/sdk" / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)

    def validate(self, payload):
        return p.validate(payload, PACKAGE, self.root, lambda: None)

    def test_valid_package_is_bound_to_built_bytes(self):
        payload = tarball()
        self.assertEqual(self.validate(payload), {
            "size": len(payload), "sha256": hashlib.sha256(payload).hexdigest(),
            "integrity": "sha512-" + base64.b64encode(hashlib.sha512(payload).digest()).decode()})

    def test_malicious_and_incomplete_archives(self):
        for changes in ({"package/../outside": b"x"}, {"package/dist\\oops": b"x"},
                        {"package/.npmrc": b"secret"}, {"package/dist/index.js": None},
                        {"package/package.json": b'{"name":"other"}'},
                        {"package/dist/index.js": b"different bytes"}):
            with self.subTest(changes=changes), self.assertRaises((RuntimeError, FileNotFoundError)):
                self.validate(tarball(changes))
        for options in ({"duplicates": True}, {"link": True}, {"trailing": True}):
            with self.subTest(options=options), self.assertRaises(RuntimeError):
                self.validate(tarball(**options))

    def test_archive_budgets(self):
        with patch.object(p, "LIMIT", 10), self.assertRaises(RuntimeError):
            self.validate(tarball())
        with patch.object(p, "EXPANDED_LIMIT", 10), self.assertRaises(RuntimeError):
            self.validate(tarball())

    def test_declared_license_is_required_even_when_missing_from_the_workspace(self):
        (self.root / "packages/sdk/LICENSE").unlink()
        with self.assertRaisesRegex(RuntimeError, "missing"):
            self.validate(tarball({"package/LICENSE": None}))

    def test_missing_secondary_declarations_are_rejected(self):
        (self.root / "packages/sdk/dist/resource.d.ts").write_text("export {};")
        with self.assertRaisesRegex(RuntimeError, "complete SDK"):
            self.validate(tarball())

    def test_stale_output_links_do_not_remove_their_targets(self):
        target = self.root / "outside"
        target.mkdir()
        (target / "keep").write_text("unrelated data")
        for name in ("npm-release", "npm-release.tmp"):
            (self.root / name).symlink_to(target, target_is_directory=True)
        p.clear(self.root)
        self.assertEqual((target / "keep").read_text(), "unrelated data")
        self.assertFalse((self.root / "npm-release").exists())
        self.assertFalse((self.root / "npm-release.tmp").exists())

    def test_source_links_are_rejected(self):
        path = self.root / "packages/sdk/dist/index.js"
        outside = self.root / "outside"
        outside.write_bytes(path.read_bytes())
        path.unlink()
        path.symlink_to(outside)
        with self.assertRaisesRegex(RuntimeError, "symlinks"):
            self.validate(tarball())
        path.unlink()
        os.link(outside, path)
        with self.assertRaisesRegex(RuntimeError, "single-link"):
            self.validate(tarball())

    def test_configuration_and_lifecycle_require_review(self):
        for directory in ("", "packages", "packages/sdk", "packages/mcp-server"):
            path = self.root / directory / ".npmrc"
            path.symlink_to(self.root / "missing")
            with self.subTest(directory=directory), self.assertRaisesRegex(RuntimeError, "configuration"):
                p.snapshot(self.root)
            path.unlink()
        for hook in p.LIFECYCLE:
            (self.root / "packages/sdk/package.json").write_text(json.dumps({
                **PACKAGE, "scripts": {hook: "unexpected-hook"}}))
            with self.subTest(hook=hook), self.assertRaisesRegex(RuntimeError, "lifecycle"):
                p.snapshot(self.root)

    def test_metadata_duplicates_are_rejected(self):
        with self.assertRaisesRegex(RuntimeError, "Duplicate"):
            p.decode('{"name":"one","name":"two"}')

    def wrapper(self, options=None, args=None, asynchronous=False):
        options = options or {}
        scripts = self.root / "scripts/buildkite"
        scripts.mkdir(parents=True, exist_ok=True)
        for name in ("check.sh", "package_release.py"):
            shutil.copyfile(HERE / name, scripts / name)
        (self.root / ".node-version").write_text("22\n")
        (self.root / "options.json").write_text(json.dumps(options))
        bin_dir = self.root / "bin"
        bin_dir.mkdir()
        (bin_dir / "node").write_text("#!/bin/sh\nprintf 'v22.23.3\\n'\n")
        (self.root / "files.json").write_text(json.dumps({k: v.decode() for k, v in FILES.items()}))
        (bin_dir / "bun").write_text("""#!/usr/bin/env python3
import json,os,pathlib,sys
r=pathlib.Path(__file__).resolve().parent.parent
o=json.loads((r/'options.json').read_text());args=sys.argv[1:];stage=' '.join(args)
if stage=='--version':print(o.get('bun','1.3.0'));sys.exit(0)
with (r/'commands.log').open('a') as f:f.write('bun '+stage+'\\n')
if stage==o.get('fail'):sys.exit(23)
if stage=='run build':
 for name,data in json.loads((r/'files.json').read_text()).items():
  if name.startswith('dist/'):
   p=r/'packages/sdk'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(data)
if stage=='test' and o.get('mutate'):
 (r/'bun.lock').write_text('changed')
""")
        (bin_dir / "npm").write_text("""#!/usr/bin/env python3
import base64,gzip,hashlib,io,json,os,pathlib,signal,sys,tarfile,time
r=pathlib.Path(__file__).resolve().parent.parent;o=json.loads((r/'options.json').read_text())
with (r/'commands.log').open('a') as f:f.write('npm '+' '.join(sys.argv[1:])+'\\n')
(r/'npm-environment.json').write_text(json.dumps(dict(os.environ)))
assert os.environ['NPM_CONFIG_USERCONFIG'] != os.environ['NPM_CONFIG_GLOBALCONFIG']
for key in ('NPM_CONFIG_USERCONFIG','NPM_CONFIG_GLOBALCONFIG'):
 assert pathlib.Path(os.environ[key]).read_bytes()==b''
if o.get('wait'):
 (r/'ready').write_text(str(os.getpid()))
 while True:time.sleep(.02)
if o.get('fail')=='pack':sys.exit(29)
out=pathlib.Path(sys.argv[sys.argv.index('--pack-destination')+1]);name='caldotcom-api-v2-sdk-0.2.0.tgz'
b=io.BytesIO()
with tarfile.open(fileobj=b,mode='w') as a:
 for path in pathlib.Path.cwd().rglob('*'):
  if path.is_file() and ('dist' in path.parts or path.name in ('package.json','README.md','LICENSE')):
   data=path.read_bytes();entry=tarfile.TarInfo('package/'+str(path.relative_to(pathlib.Path.cwd())))
   entry.mode=0o644;entry.size=len(data);a.addfile(entry,io.BytesIO(data))
payload=gzip.compress(b.getvalue());(out/name).write_bytes(payload)
if o.get('unsafe-name'):name='../outside.tgz'
if o.get('extra'):(out/'extra').write_text('unexpected')
print(json.dumps([{'filename':name,'name':'caldotcom-api-v2-sdk','version':'0.2.0',
 'size':len(payload),'integrity':'sha512-'+base64.b64encode(hashlib.sha512(payload).digest()).decode()}]))
""")
        for path in bin_dir.iterdir():
            path.chmod(0o755)
        temporary = self.root / "temporary"
        temporary.mkdir()
        for directory in ("npm-release", "npm-release.tmp"):
            path = self.root / directory
            path.mkdir()
            (path / "stale").write_text("old bytes")
        env = {"PATH": str(bin_dir) + ":/usr/bin:/bin", "HOME": str(self.root / "outside-home"),
               "TMPDIR": str(temporary), "NPM_TOKEN": "fixture", "GITHUB_TOKEN": "fixture",
               "NODE_OPTIONS": "--trace-warnings", "NPM_CONFIG_REGISTRY": "https://invalid.example"}
        command = ["/bin/bash", str(scripts / "check.sh"), *(args if args is not None else ["build-and-pack"])]
        if asynchronous:
            return subprocess.Popen(command, env=env, cwd=self.root, start_new_session=True,
                                    stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return subprocess.run(command, env=env, cwd=self.root, capture_output=True, text=True, timeout=20)

    def test_wrapper_preserves_order_and_isolates_pack(self):
        result = self.wrapper()
        self.assertEqual(result.returncode, 0, result.stderr)
        lines = (self.root / "commands.log").read_text().splitlines()
        self.assertEqual(lines[:4], ["bun install --frozen-lockfile", "bun run lint", "bun run build", "bun test"])
        self.assertTrue(lines[4].startswith("npm pack --json --ignore-scripts --offline --workspaces=false"))
        env = json.loads((self.root / "npm-environment.json").read_text())
        self.assertTrue(set(env).isdisjoint({"NPM_TOKEN", "GITHUB_TOKEN", "NODE_OPTIONS", "NPM_CONFIG_REGISTRY"}))
        self.assertNotEqual(env["NPM_CONFIG_USERCONFIG"], env["NPM_CONFIG_GLOBALCONFIG"])
        self.assertFalse(Path(env["NPM_CONFIG_USERCONFIG"]).exists())
        self.assertFalse(Path(env["NPM_CONFIG_GLOBALCONFIG"]).exists())
        self.assertFalse(Path(env["HOME"]).exists())
        self.assertEqual(list((self.root / "temporary").iterdir()), [])
        final = self.root / "npm-release"
        self.assertEqual({v.name for v in final.iterdir()}, {"package.tgz", "manifest.json"})
        manifest = json.loads((final / "manifest.json").read_text())
        self.assertEqual(manifest["sha256"], hashlib.sha256((final / "package.tgz").read_bytes()).hexdigest())
        self.assertEqual(set(manifest["sourceFiles"]), set(p.METADATA))
        self.assertFalse((self.root / "npm-release.tmp").exists())
        self.assertFalse((self.root / "sdk-dist.tar.gz").exists())
        with tarfile.open(final / "package.tgz", "r:gz") as archive:
            self.assertEqual(archive.extractfile("package/LICENSE").read(), FILES["LICENSE"])

    def test_failures_remove_stale_and_partial_release_outputs(self):
        for options, expected in (({"fail": "install --frozen-lockfile"}, 23),
                                  ({"fail": "run lint"}, 23), ({"fail": "run build"}, 23),
                                  ({"fail": "test"}, 23), ({"fail": "pack"}, 29),
                                  ({"mutate": True}, 1), ({"unsafe-name": True}, 1),
                                  ({"extra": True}, 1), ({"bun": "1.3.4"}, 1)):
            with self.subTest(options=options):
                case = PackageTests()
                case.setUp()
                try:
                    result = case.wrapper(options)
                    self.assertEqual(result.returncode, expected, result.stderr)
                    self.assertFalse((case.root / "npm-release").exists())
                    self.assertFalse((case.root / "npm-release.tmp").exists())
                finally:
                    case.doCleanups()

    def test_invalid_arguments_remove_stale_outputs(self):
        result = self.wrapper(args=["build-and-pack", "v9.0.0"])
        self.assertEqual(result.returncode, 2)
        self.assertFalse((self.root / "npm-release").exists())
        self.assertFalse((self.root / "npm-release.tmp").exists())

    def test_cancel_during_pack_never_exports(self):
        child = self.wrapper({"wait": True}, asynchronous=True)
        try:
            deadline = time.monotonic() + 10
            while not (self.root / "ready").exists() and child.poll() is None and time.monotonic() < deadline:
                time.sleep(.02)
            self.assertTrue((self.root / "ready").exists())
            child.send_signal(signal.SIGTERM)
            stdout, stderr = child.communicate(timeout=10)
            self.assertEqual(child.returncode, 143, stdout + stderr)
            self.assertFalse((self.root / "npm-release").exists())
            self.assertFalse((self.root / "npm-release.tmp").exists())
            self.assertEqual(list((self.root / "temporary").iterdir()), [])
        finally:
            if child.poll() is None:
                os.killpg(child.pid, signal.SIGKILL)
            child.communicate(timeout=5)


if __name__ == "__main__":
    unittest.main()
