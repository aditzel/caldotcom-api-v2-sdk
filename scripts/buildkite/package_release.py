"""Prepare local npm bytes; this module grants no publication authority."""
import base64
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import shutil
import stat
import tarfile

NAME = "caldotcom-api-v2-sdk"
LIMIT = 64 * 1024 * 1024
EXPANDED_LIMIT = 128 * 1024 * 1024
METADATA = ("package.json", "bun.lock", "packages/sdk/package.json",
            "packages/mcp-server/package.json")
REQUIRED = {"package/package.json", "package/dist/index.js", "package/dist/index.mjs",
            "package/dist/index.cjs", "package/dist/index.d.ts", "package/README.md", "package/LICENSE"}
LIFECYCLE = ("prepublishOnly", "prepack", "prepare", "postpack", "publish", "postpublish")


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def decode(data):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            require(key not in result, "Duplicate npm metadata field")
            result[key] = value
        return result
    return json.loads(data, object_pairs_hook=unique)


def regular(root, relative, limit=LIMIT):
    path = root
    for part in Path(relative).parts:
        require(part not in ("", ".", "..") and not Path(relative).is_absolute(),
                "Unsafe package source path")
        path = path / part
        require(not path.is_symlink(), "Package source cannot contain symlinks")
    info = path.lstat()
    require(stat.S_ISREG(info.st_mode) and info.st_nlink == 1 and info.st_size <= limit,
            "Package source must be a bounded regular single-link file")
    return path.read_bytes()


def clear(root):
    for name in ("npm-release", "npm-release.tmp"):
        path = root / name
        if path.is_symlink() or (path.exists() and not path.is_dir()):
            path.unlink()
        elif path.exists():
            shutil.rmtree(path)


def snapshot(root):
    # npm reads project configuration in addition to the isolated user/global files.
    for directory in ("", "packages", "packages/sdk", "packages/mcp-server"):
        path = root / directory / ".npmrc"
        require(not path.exists() and not path.is_symlink(),
                "Project npm configuration requires a reviewed release contract")
    files = {name: regular(root, name, 4 * 1024 * 1024) for name in METADATA}
    package = decode(files["packages/sdk/package.json"])
    require(isinstance(package, dict) and package.get("name") == NAME
            and package.get("private", False) is False, "Unexpected npm package")
    version = package.get("version")
    require(isinstance(version, str) and len(version) <= 200
            and re.fullmatch(r"(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?", version),
            "Invalid npm package version")
    require(package.get("files") == ["dist", "README.md", "LICENSE"],
            "Unexpected SDK package file policy")
    scripts = package.get("scripts", {})
    require(isinstance(scripts, dict) and not any(scripts.get(key) for key in LIFECYCLE),
            "npm lifecycle hooks require a reviewed release contract")
    return files


def validate(payload, package, root, guard):
    require(isinstance(payload, bytes) and 0 < len(payload) <= LIMIT, "Invalid npm tarball size")
    with gzip.GzipFile(fileobj=io.BytesIO(payload)) as compressed:
        expanded = compressed.read(EXPANDED_LIMIT + 1)
    require(len(expanded) <= EXPANDED_LIMIT, "Expanded npm package exceeds budget")
    names = set()
    with tarfile.open(fileobj=io.BytesIO(expanded), mode="r:") as archive:
        for member in archive:
            guard()
            name = member.name
            require(len(names) < 4096 and name not in names and len(name) <= 4096,
                    "Duplicate or excessive npm archive entries")
            require(name.startswith("package/") and "\\" not in name
                    and all(part not in ("", ".", "..") for part in name.split("/"))
                    and all(ord(ch) >= 32 and ord(ch) != 127 for ch in name),
                    "Unsafe npm archive path")
            require(member.isfile() and not member.issparse() and member.size <= EXPANDED_LIMIT,
                    "npm archive requires bounded regular files")
            require(member.mode & ~0o777 == 0 and member.mode & 0o022 == 0,
                    "Unsafe npm package mode")
            require(name in {"package/package.json", "package/README.md", "package/LICENSE"}
                    or name.startswith("package/dist/"), "Unexpected npm package member")
            data = archive.extractfile(member).read()
            relative = name.removeprefix("package/")
            require(data == regular(root / "packages/sdk", relative, EXPANDED_LIMIT),
                    "npm archive differs from the tested SDK output")
            if name == "package/package.json":
                require(decode(data) == package, "Packaged metadata differs from frozen source")
            names.add(name)
        require(not any(expanded[archive.offset:]), "Unexpected data after npm archive")
    require(REQUIRED <= names, "npm archive is missing required SDK files")
    expected = {"package/package.json", "package/README.md", "package/LICENSE"}
    sdk = root / "packages/sdk"
    for path in (sdk / "dist").rglob("*"):
        guard()
        require(not path.is_symlink(), "SDK output cannot contain symlinks")
        if not path.is_dir():
            expected.add("package/" + path.relative_to(sdk).as_posix())
    require(names == expected, "npm archive does not include the complete SDK output")
    return {"size": len(payload), "sha256": hashlib.sha256(payload).hexdigest(),
            "integrity": "sha512-" + base64.b64encode(hashlib.sha512(payload).digest()).decode()}


def pack(root, frozen, run, env, guard):
    require(snapshot(root) == frozen, "Package metadata changed during build or tests")
    package = decode(frozen["packages/sdk/package.json"])
    partial = root / "npm-release.tmp"
    partial.mkdir(mode=0o700)
    # Offline local packing has no registry operation and executes no lifecycle hooks.
    output = run(["npm", "pack", "--json", "--ignore-scripts", "--offline",
                  "--workspaces=false", "--audit=false", "--fund=false",
                  "--pack-destination", str(partial)], env, capture=True,
                 cwd=root / "packages/sdk")
    require(len(output) <= 1024 * 1024, "Oversized npm pack result")
    result = decode(output)
    require(isinstance(result, list) and len(result) == 1 and isinstance(result[0], dict),
            "Unexpected npm pack result")
    name = result[0].get("filename")
    require(isinstance(name, str) and re.fullmatch(r"[A-Za-z0-9._+-]+\.tgz", name),
            "Unsafe npm pack filename")
    require(set(path.name for path in partial.iterdir()) == {name}, "Unexpected npm pack output")
    require(snapshot(root) == frozen, "Package metadata changed during packing")
    payload = regular(partial, name)
    checked = validate(payload, package, root, guard)
    require(result[0].get("name") == NAME and result[0].get("version") == package["version"]
            and result[0].get("size") == checked["size"]
            and result[0].get("integrity") == checked["integrity"], "npm pack metadata mismatch")
    (partial / name).rename(partial / "package.tgz")
    manifest = {"schemaVersion": 1, "name": NAME, "version": package["version"],
                "tarball": "package.tgz", **checked,
                "sourceFiles": {name: hashlib.sha256(data).hexdigest() for name, data in frozen.items()}}
    (partial / "manifest.json").write_text(json.dumps(manifest, sort_keys=True) + "\n")
    guard()
    partial.rename(root / "npm-release")
    guard()
