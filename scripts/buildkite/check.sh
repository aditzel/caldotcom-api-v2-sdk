#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
# Clear outputs before interpreter startup or any validation can fail.
rm -f -- sdk-dist.tar.gz sdk-dist.tar.gz.tmp
exec python3 -I -B - "$@" <<'PY'
import os
import importlib.util
from pathlib import Path
import shutil
import signal
import stat
import subprocess
import sys
import tempfile
import time
import tarfile
import zlib

ROOT = Path.cwd()
ARCHIVE = ROOT / "sdk-dist.tar.gz"
PARTIAL = ROOT / "sdk-dist.tar.gz.tmp"
spec = importlib.util.spec_from_file_location("cal_package_release", ROOT / "scripts/buildkite/package_release.py")
package_release = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package_release)
cancel_signal = 0


class Cancelled(Exception):
    pass


def cancel(signum, _frame):
    global cancel_signal
    if not cancel_signal:
        cancel_signal = signum


def check_cancelled():
    if cancel_signal:
        raise Cancelled()


def stop_group(process):
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        process.wait(timeout=1)
        return
    deadline = time.monotonic() + 3
    while time.monotonic() < deadline:
        process.poll()
        try:
            os.killpg(process.pid, 0)
        except ProcessLookupError:
            break
        time.sleep(.05)
    try:
        os.killpg(process.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    process.wait(timeout=1)


def run(command, env, capture=False, cwd=ROOT):
    check_cancelled()
    print("+ " + " ".join(command), flush=True)
    # Record signals without raising across Popen's launch window. Commands own
    # separate groups so their descendants can be stopped after a leader exits.
    process = subprocess.Popen(command, cwd=cwd, env=env, start_new_session=True,
                               stdout=subprocess.PIPE if capture else None, text=True)
    try:
        while True:
            check_cancelled()
            try:
                output, _ = process.communicate(timeout=.05)
                break
            except subprocess.TimeoutExpired:
                pass
        check_cancelled()
        if process.returncode:
            raise subprocess.CalledProcessError(process.returncode, command)
        return output.strip() if capture else None
    finally:
        stop_group(process)


def environment(work):
    paths = {"HOME": "home", "XDG_CONFIG_HOME": "config", "XDG_CACHE_HOME": "cache",
             "XDG_DATA_HOME": "data", "XDG_STATE_HOME": "state", "TMPDIR": "tmp",
             "BUN_INSTALL_CACHE_DIR": "bun-cache", "NPM_CONFIG_CACHE": "npm-cache"}
    for name in paths.values():
        (work / name).mkdir()
    for name in ("npm-user.npmrc", "npm-global.npmrc"):
        (work / name).touch(mode=0o600)
    return {**{key: str(work / name) for key, name in paths.items()},
            "PATH": os.environ.get("PATH", os.defpath), "LANG": "C.UTF-8", "CI": "true",
            "NPM_CONFIG_USERCONFIG": str(work / "npm-user.npmrc"),
            "NPM_CONFIG_GLOBALCONFIG": str(work / "npm-global.npmrc")}


def reject_dotenv():
    names = (".env", ".env.local", ".env.development", ".env.development.local",
             ".env.production", ".env.production.local", ".env.test", ".env.test.local")
    for directory in (ROOT, ROOT / "packages/sdk", ROOT / "packages/mcp-server"):
        for name in names:
            path = directory / name
            if os.path.lexists(path):
                raise RuntimeError("Runtime dotenv files are not allowed in credential-free CI: " + str(path.relative_to(ROOT)))


def clear_dist():
    for path in (ROOT / "packages", ROOT / "packages/sdk", ROOT / "packages/sdk/dist"):
        if path.is_symlink() or (path.exists() and not path.is_dir()):
            raise RuntimeError("SDK dist path must contain only real directories")
    dist = ROOT / "packages/sdk/dist"
    if dist.exists():
        shutil.rmtree(dist)


def validate_dist():
    dist = ROOT / "packages/sdk/dist"
    for path in (ROOT / "packages", dist.parent, dist):
        if path.is_symlink():
            raise RuntimeError("SDK dist artifact cannot contain symlinks")
    if not dist.is_dir():
        raise RuntimeError("SDK dist artifact is missing or empty")
    count = 0
    for directory, directories, files in os.walk(dist, followlinks=False):
        check_cancelled()
        for name in directories + files:
            path = Path(directory) / name
            info = path.lstat()
            if stat.S_ISLNK(info.st_mode):
                raise RuntimeError("SDK dist artifact cannot contain symlinks")
            if name in files:
                if not stat.S_ISREG(info.st_mode) or info.st_nlink != 1:
                    raise RuntimeError("SDK dist artifact files must be regular and single-link")
                count += 1
    if not count:
        raise RuntimeError("SDK dist artifact is missing or empty")


def main():
    package_release.clear(ROOT)
    if len(sys.argv) != 2 or sys.argv[1] not in ("build-and-test", "build-and-pack"):
        print("Usage: bash scripts/buildkite/check.sh build-and-test | build-and-pack", file=sys.stderr)
        return 2
    for sig in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP):
        signal.signal(sig, cancel)
    status = 0
    try:
        reject_dotenv()
        clear_dist()
        frozen = package_release.snapshot(ROOT) if sys.argv[1] == "build-and-pack" else None
        with tempfile.TemporaryDirectory(prefix="caldotcom-janus-") as directory:
            env = environment(Path(directory))
            if not run(["node", "--version"], env, capture=True).startswith("v22.") or (ROOT / ".node-version").read_text().strip() != "22":
                raise RuntimeError("Expected Node 22 from .node-version")
            # Preserve the CI pin; package metadata independently declares 1.3.4.
            if run(["bun", "--version"], env, capture=True) != "1.3.0":
                raise RuntimeError("Expected the CI Bun pin 1.3.0")
            for command in (["bun", "install", "--frozen-lockfile"], ["bun", "run", "lint"],
                            ["bun", "run", "build"], ["bun", "test"]):
                run(command, env)
            validate_dist()
            if frozen is not None:
                package_release.pack(ROOT, frozen, run, env, check_cancelled)
            else:
                run(["tar", "-czf", str(PARTIAL), "-C", "packages/sdk", "dist"], env)
                info = PARTIAL.lstat()
                if not stat.S_ISREG(info.st_mode) or info.st_nlink != 1 or not 0 < info.st_size <= 64 * 1024 * 1024:
                    raise RuntimeError("SDK archive must be a nonempty regular single-link file within 64 MiB")
                check_cancelled()
                PARTIAL.replace(ARCHIVE)
                check_cancelled()
    except Cancelled:
        status = 128 + cancel_signal
    except subprocess.CalledProcessError as error:
        status = error.returncode if error.returncode >= 0 else 128 - error.returncode
    except (OSError, ValueError, RuntimeError, subprocess.TimeoutExpired, tarfile.TarError, zlib.error, EOFError) as error:
        print(str(error), file=sys.stderr)
        status = 1
    finally:
        PARTIAL.unlink(missing_ok=True)
        if status or cancel_signal:
            ARCHIVE.unlink(missing_ok=True)
            package_release.clear(ROOT)
    return 128 + cancel_signal if cancel_signal else status


raise SystemExit(main())
PY
