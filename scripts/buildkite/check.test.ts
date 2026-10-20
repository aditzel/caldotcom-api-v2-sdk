import { afterEach, describe, expect, it } from "bun:test";
import { spawn, spawnSync } from "node:child_process";
import {
  copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync,
  rmSync, symlinkSync, writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const roots: string[] = [];

function fixture(options: Record<string, string> = {}) {
  const root = mkdtempSync(join(tmpdir(), "caldotcom-ci-test-"));
  roots.push(root);
  const scripts = join(root, "scripts", "buildkite");
  const bin = join(root, "bin");
  const temporary = join(root, "temporary");
  mkdirSync(scripts, { recursive: true });
  mkdirSync(bin);
  mkdirSync(temporary);
  copyFileSync(new URL("./check.sh", import.meta.url), join(scripts, "check.sh"));
  copyFileSync(new URL("./package_release.py", import.meta.url), join(scripts, "package_release.py"));
  writeFileSync(join(root, ".node-version"), "22\n");
  writeFileSync(join(root, "outside"), "preserved outside data");
  for (const name of ["sdk-dist.tar.gz", "sdk-dist.tar.gz.tmp"]) {
    if (options.TEST_ARCHIVE_LINK) symlinkSync(join(root, "outside"), join(root, name));
    else writeFileSync(join(root, name), "stale archive");
  }
  if (options.TEST_STALE_DIST) {
    mkdirSync(join(root, "packages/sdk/dist"), { recursive: true });
    writeFileSync(join(root, "packages/sdk/dist/stale.js"), "old build");
  }
  if (options.TEST_DOTENV) {
    const path = join(root, options.TEST_DOTENV);
    mkdirSync(dirname(path), { recursive: true });
    if (options.TEST_DOTENV_LINK) symlinkSync(join(root, "missing-env"), path);
    else writeFileSync(path, "FIXTURE=value\n");
  }
  writeFileSync(join(bin, "node"), `#!/bin/sh\nprintf '%s\\n' '${options.TEST_NODE_VERSION || "v22.23.3"}'\n`, { mode: 0o755 });
  writeFileSync(join(bin, "bun"), `#!/usr/bin/env python3
import json,os,pathlib,signal,subprocess,sys,time
options=json.loads(${JSON.stringify(JSON.stringify(options))})
root=pathlib.Path(__file__).resolve().parent.parent
args=sys.argv[1:];stage=' '.join(args)
if args==['--version']:
 print(options.get('TEST_BUN_VERSION','1.3.0'));sys.exit(0)
with (root/'commands.log').open('a') as log:log.write(stage+'\\n')
(root/'environment.json').write_text(json.dumps(dict(os.environ)))
if stage==options.get('TEST_FAIL_STAGE'):sys.exit(23)
if stage=='run build':
 if options.get('TEST_WAIT'):
  signal.signal(signal.SIGTERM,signal.SIG_IGN);signal.signal(signal.SIGINT,signal.SIG_IGN)
  code="""import pathlib,signal,sys,time
signal.signal(signal.SIGTERM,signal.SIG_IGN)
signal.signal(signal.SIGINT,signal.SIG_IGN)
p=pathlib.Path(sys.argv[1])
time.sleep(float(sys.argv[2]))
while True:
 p.write_text(str(time.time_ns()))
 time.sleep(.02)
"""
  child=subprocess.Popen([sys.executable,'-I','-c',code,str(root/'heartbeat'),options.get('TEST_CHILD_DELAY','0')])
  pending=root/'ready.tmp';pending.write_text(json.dumps({'pid':os.getpid(),'pgid':os.getpgrp(),'child':child.pid}));pending.replace(root/'ready.json')
  if options['TEST_WAIT']=='failure':
   deadline=time.monotonic()+5
   while not (root/'heartbeat').exists():
    if child.poll() is not None or time.monotonic()>=deadline:sys.exit('Descendant failed to become ready')
    time.sleep(.01)
   sys.exit(23)
  while True:time.sleep(.05)
 output=root/'packages/sdk/dist';kind=options.get('TEST_DIST','valid')
 if kind=='absent':pass
 elif kind=='empty':(output/'empty').mkdir(parents=True)
 elif kind=='symlink-root':
  output.parent.mkdir(parents=True,exist_ok=True);output.symlink_to(root)
 else:
  output.mkdir(parents=True,exist_ok=True);(output/'index.mjs').write_text('export {};')
  if kind=='symlink-entry':(output/'linked.js').symlink_to(root/'outside')
  if kind=='hardlink-entry':os.link(root/'outside',output/'linked.js')
`, { mode: 0o755 });
  if (options.TEST_TAR_FAIL) writeFileSync(join(bin, "tar"), "#!/bin/sh\nprintf partial > sdk-dist.tar.gz.tmp\nexit 9\n", { mode: 0o755 });
  const env = {
    PATH: `${bin}:/usr/bin:/bin`, HOME: join(root, "outside-home"), TMPDIR: temporary,
    NPM_TOKEN: "fixture-token", GITHUB_TOKEN: "fixture-token",
    BUILDKITE_AGENT_ACCESS_TOKEN: "fixture-token", PYTHONPATH: "/fixture/python",
    NODE_OPTIONS: "--trace-warnings", BUN_INSTALL_CACHE_DIR: join(root, "outside-cache"),
  };
  return { root, temporary, env, script: join(scripts, "check.sh"), archive: join(root, "sdk-dist.tar.gz") };
}

function runCheck(options: Record<string, string> = {}, args = ["build-and-test"]) {
  const f = fixture(options);
  const result = spawnSync("/bin/bash", [f.script, ...args], { cwd: f.root, env: f.env, encoding: "utf8", timeout: 10_000 });
  return { ...f, result };
}

async function until(predicate: () => boolean, timeout = 5000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error("Timed out waiting for fixture");
}

function running(pid: number) {
  try { process.kill(pid, 0); } catch { return false; }
  const stat = `/proc/${pid}/stat`;
  return !(existsSync(stat) && readFileSync(stat, "utf8").split(" ")[2] === "Z");
}

function killGroup(group: number) {
  try { process.kill(-group, "SIGKILL"); } catch { /* The owned fixture already exited. */ }
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("protected SDK CI wrapper", () => {
  it("preserves stage order and archives the successful build output", () => {
    const { result, root, archive } = runCheck();
    expect(result.status).toBe(0);
    expect(readFileSync(join(root, "commands.log"), "utf8")).toBe("install --frozen-lockfile\nrun lint\nrun build\ntest\n");
    const contents = spawnSync("tar", ["-tzf", archive], { encoding: "utf8" });
    expect(contents.status).toBe(0);
    expect(contents.stdout).toContain("dist/index.mjs");
    expect(existsSync(join(root, "sdk-dist.tar.gz.tmp"))).toBe(false);
  });

  it.each(["install --frozen-lockfile", "run lint", "run build", "test"])("preserves a failure at %s without a stale artifact", (stage) => {
    const { result, archive } = runCheck({ TEST_FAIL_STAGE: stage });
    expect(result.status).toBe(23);
    expect(existsSync(archive)).toBe(false);
  });

  it.each(["absent", "empty"])("rejects successful jobs with %s dist", (dist) => {
    const { result, archive } = runCheck({ TEST_DIST: dist });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("SDK dist artifact is missing or empty");
    expect(existsSync(archive)).toBe(false);
  });

  it("preserves failed packaging status without exposing a partial archive", () => {
    const { result, root, archive } = runCheck({ TEST_TAR_FAIL: "1" });
    expect(result.status).toBe(9);
    expect(existsSync(archive)).toBe(false);
    expect(existsSync(join(root, "sdk-dist.tar.gz.tmp"))).toBe(false);
  });

  it.each([[], ["other"], ["build-and-test", "extra"]])("rejects invalid arguments %j", (...args) => {
    expect(runCheck({}, args).result.status).toBe(2);
  });

  it.each([{ TEST_NODE_VERSION: "v24.22.0" }, { TEST_BUN_VERSION: "1.3.4" }])("rejects the wrong toolchain %j", (options) => {
    expect(runCheck(options).result.status).toBe(1);
  });

  it("isolates child homes and configuration and drops inherited credentials and runtime options", () => {
    const { result, root, temporary } = runCheck();
    expect(result.status).toBe(0);
    const env = JSON.parse(readFileSync(join(root, "environment.json"), "utf8"));
    for (const key of ["HOME", "XDG_CONFIG_HOME", "XDG_CACHE_HOME", "TMPDIR", "BUN_INSTALL_CACHE_DIR", "NPM_CONFIG_CACHE"]) {
      expect(env[key].startsWith(`${temporary}/`)).toBe(true);
      expect(existsSync(env[key])).toBe(false);
    }
    for (const key of ["NPM_TOKEN", "GITHUB_TOKEN", "BUILDKITE_AGENT_ACCESS_TOKEN", "PYTHONPATH", "NODE_OPTIONS"]) expect(env[key]).toBeUndefined();
    expect(readdirSync(temporary)).toEqual([]);
  });

  it("rejects stale output when the current build produces no dist", () => {
    const { result, archive } = runCheck({ TEST_STALE_DIST: "1", TEST_DIST: "absent" });
    expect(result.status).toBe(1);
    expect(existsSync(archive)).toBe(false);
  });

  it.each(["symlink-root", "symlink-entry", "hardlink-entry"])("rejects unsafe artifact %s without modifying its target", (kind) => {
    const { result, root, archive } = runCheck({ TEST_DIST: kind });
    expect(result.status).toBe(1);
    expect(existsSync(archive)).toBe(false);
    expect(readFileSync(join(root, "outside"), "utf8")).toBe("preserved outside data");
  });

  it("removes stale archive symlinks without following them", () => {
    const { result, root } = runCheck({ TEST_ARCHIVE_LINK: "1", TEST_FAIL_STAGE: "run lint" });
    expect(result.status).toBe(23);
    expect(readFileSync(join(root, "outside"), "utf8")).toBe("preserved outside data");
  });

  it.each([".env", ".env.test", ".env.production.local", "packages/sdk/.env.local", "packages/mcp-server/.env.development"])("rejects runtime dotenv %s before installing dependencies", (path) => {
    const { result, root } = runCheck({ TEST_DOTENV: path });
    expect(result.status).toBe(1);
    expect(existsSync(join(root, "commands.log"))).toBe(false);
  });

  it("rejects dangling runtime dotenv links but permits example files", () => {
    expect(runCheck({ TEST_DOTENV: ".env.test.local", TEST_DOTENV_LINK: "1" }).result.status).toBe(1);
    expect(runCheck({ TEST_DOTENV: ".env.example" }).result.status).toBe(0);
  });

  it.each(["SIGTERM", "SIGINT", "failure"])("stops owned descendants and cleans private state on %s", async (kind) => {
    // Exceed the wrapper's three-second cleanup grace to expose premature mock failure.
    const f = fixture({ TEST_WAIT: kind === "failure" ? "failure" : "wait", TEST_CHILD_DELAY: kind === "failure" ? "3.5" : "0" });
    const child = spawn("/bin/bash", [f.script, "build-and-test"], { cwd: f.root, env: f.env, detached: true, stdio: ["ignore", "pipe", "pipe"] });
    let closed = false;
    let code: number | null = null;
    let signal: string | null = null;
    child.stdout.resume(); child.stderr.resume();
    child.on("close", (exit, sig) => { closed = true; code = exit; signal = sig; });
    let record: { pid: number; pgid: number; child: number } | undefined;
    try {
      await until(() => existsSync(join(f.root, "ready.json")) && existsSync(join(f.root, "heartbeat")));
      record = JSON.parse(readFileSync(join(f.root, "ready.json"), "utf8"));
      if (kind !== "failure") {
        for (let n = 0; n < 5; n++) {
          if (!closed) process.kill(-child.pid!, kind as NodeJS.Signals);
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
      }
      await until(() => closed, 5000);
      expect(signal).toBeNull();
      expect(code).toBe(kind === "failure" ? 23 : kind === "SIGTERM" ? 143 : 130);
      await until(() => !running(record!.pid) && !running(record!.child));
      const heartbeat = readFileSync(join(f.root, "heartbeat"), "utf8");
      await new Promise((resolve) => setTimeout(resolve, 80));
      expect(readFileSync(join(f.root, "heartbeat"), "utf8")).toBe(heartbeat);
      expect(readdirSync(f.temporary)).toEqual([]);
      expect(existsSync(f.archive)).toBe(false);
      expect(existsSync(join(f.root, "sdk-dist.tar.gz.tmp"))).toBe(false);
    } finally {
      if (!record && existsSync(join(f.root, "ready.json"))) record = JSON.parse(readFileSync(join(f.root, "ready.json"), "utf8"));
      if (record) killGroup(record.pgid);
      killGroup(child.pid!);
      await until(() => closed);
    }
  }, 15_000);
});
