import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("../../", import.meta.url);
const activeBytes = readFileSync(new URL(".github/workflows/docker-publish.yml", root));
const active = Bun.YAML.parse(activeBytes.toString()) as any;
// Bun 1.3.0 parses bare "on" as YAML 1.1 true; GitHub treats it as "on".
// Normalize only the test lookup, preserving the active workflow's exact bytes.
const activeTriggers = active.on ?? active.true;
const templateText = readFileSync(new URL("docs/ci/docker-publish.janus.yml", root), "utf8");
const template = Bun.YAML.parse(templateText) as any;
const planner = template.jobs["plan-docker"];
const coordinator = template.jobs["publish-janus"];
const repository = "aditzel/caldotcom-api-v2-sdk";
const image = "aditzel/caldotcom-mcp-server";
const sha = "a".repeat(40);
const prefix = "org.opencontainers.image.";
const helper = "5bba3156e1ffeddbe045f783bf208a7fb762072d";
const metadataAction = "docker/metadata-action@c299e40c65443455700f0fdfc63efafe5b349051";

function embedded(step: any): string {
  const match = step.run.match(/^python3 -I -B -S - <<'PYTHON'\n([\s\S]*)\nPYTHON\n?$/);
  expect(match).not.toBeNull();
  return match![1];
}

function fixture(kind = "push", tag = "v1.2.3", prerelease = false) {
  const ref = kind === "push" ? "refs/heads/main" : `refs/tags/${tag}`;
  const versions = kind === "push" ? ["latest", `sha-${sha}`]
    : tag === "unversioned" ? [`sha-${sha}`]
    : tag.includes("-rc.") ? [tag.slice(1), `sha-${sha}`] : [tag.slice(1), `sha-${sha}`, "latest"];
  const labels = Object.fromEntries(Object.entries({
    title: "caldotcom-api-v2-sdk", description: "MCP server", url: `https://github.com/${repository}`,
    source: `https://github.com/${repository}`, version: versions[0],
    created: "2026-10-20T10:00:04.123Z", revision: sha, licenses: "MIT",
  }).map(([key, value]) => [prefix + key, value]));
  const event: any = { repository: { id: 1075098118, full_name: repository },
    ...(kind === "push" ? { ref, after: sha, deleted: false } : { action: "published", release: {
      id: 700, tag_name: tag, draft: false, prerelease, published_at: "2026-10-20T10:00:00Z",
    } }),
  };
  const env = {
    GITHUB_ACTIONS: "true", RUNNER_ENVIRONMENT: "github-hosted", RUNNER_OS: "Linux", GITHUB_JOB: "plan-docker",
    GITHUB_REPOSITORY: repository, GITHUB_REPOSITORY_ID: "1075098118", GITHUB_RUN_ID: "100", GITHUB_RUN_ATTEMPT: "2",
    GITHUB_SHA: sha, GITHUB_REF: ref, GITHUB_EVENT_NAME: kind, GITHUB_WORKFLOW_SHA: sha,
    GITHUB_WORKFLOW_REF: `${repository}/.github/workflows/docker-publish.yml@${ref}`,
    JANUS_CAL_DOCKER_METADATA: JSON.stringify({ tags: versions.map(version => `${image}:${version}`), labels }),
  };
  return { event, env };
}

function withTemp(run: (dir: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), "cal-docker-plan-"));
  try { run(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
}

function runPlan(dir: string, f = fixture(), raw = JSON.stringify(f.event)) {
  const path = join(dir, "event.json");
  writeFileSync(path, raw);
  return spawnSync("python3", ["-I", "-B", "-S", "-"], {
    input: embedded(planner.steps[1]), encoding: "utf8", timeout: 10000,
    env: { PATH: process.env.PATH, ...f.env, GITHUB_EVENT_PATH: path, RUNNER_TEMP: dir }, cwd: dir,
  });
}

function rejected(f = fixture(), raw = JSON.stringify(f.event)) {
  withTemp(dir => {
    const result = runPlan(dir, f, raw);
    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("Cal Docker metadata plan failed\n");
    expect(existsSync(join(dir, "docker-metadata.json"))).toBe(false);
  });
}

describe("inactive Docker migration preserves the live publisher", () => {
  test("locks the actual main workflow blob, including credentials, labels and build inputs", () => {
    // main 75f28c5696ccf117c852d3883f2905626b89ddb3, fetched independently from GitHub.
    // Updating this baseline requires a separately reviewed active-workflow change.
    expect(createHash("sha1").update(`blob ${activeBytes.length}\0`).update(activeBytes).digest("hex"))
      .toBe("2df65443395ef71a54da7a75399a633162ea348d");
    expect(Object.keys(active.jobs)).toEqual(["push_to_registry"]);
    const job = active.jobs.push_to_registry;
    expect(job["runs-on"]).toEqual(["self-hosted", "Linux", "X64"]);
    expect(job.permissions).toEqual({ packages: "write", contents: "read" });
    expect(job.steps.map((step: any) => step.uses)).toEqual([
      "actions/checkout@v4", "docker/login-action@v3", "docker/metadata-action@v5", "docker/build-push-action@v5",
    ]);
    expect(job.steps[1].with).toEqual({ username: "${{ secrets.DOCKER_USERNAME }}", password: "${{ secrets.DOCKER_PASSWORD }}" });
    expect(job.steps[3].with).toEqual({ context: ".", file: "./Dockerfile", push: true,
      tags: "${{ steps.meta.outputs.tags }}", labels: "${{ steps.meta.outputs.labels }}" });
    for (const key of ["concurrency", "permissions"]) expect(active[key]).toBeUndefined();
    for (const key of ["if", "needs", "timeout-minutes", "environment"]) expect(job[key]).toBeUndefined();
  });

  test("preserves exact event/path admission and metadata order in both sources", () => {
    expect(activeTriggers).toEqual({ push: { branches: ["main"], paths: ["packages/mcp-server/**", "packages/sdk/**", "Dockerfile"] },
      release: { types: ["published"] } });
    expect(template.on).toEqual(activeTriggers);
    expect(planner.steps[0].with).toEqual(active.jobs.push_to_registry.steps[2].with);
    const admitted = (branch: string, path: string) => activeTriggers.push.branches.includes(branch)
      && activeTriggers.push.paths.some((pattern: string) => new Bun.Glob(pattern).match(path));
    for (const path of ["packages/sdk/src/index.ts", "packages/mcp-server/package.json", "Dockerfile"]) {
      expect(admitted("main", path)).toBe(true);
      expect(admitted("other", path)).toBe(false);
    }
    for (const path of ["docs/ci/docker-publish.janus.yml", "docs/ci/buildkite-docker.md", "scripts/buildkite/docker-workflow.test.ts", "README.md"]) {
      expect(admitted("main", path)).toBe(false);
    }
  });

  test("no registered workflow installs, invokes or duplicates the documentation candidate", () => {
    // GitHub only registers direct .github/workflows/*.yml or *.yaml files.
    for (const file of readdirSync(new URL(".github/workflows/", root)).filter(file => /\.ya?ml$/.test(file))) {
      const text = readFileSync(new URL(`.github/workflows/${file}`, root), "utf8");
      expect(text).not.toMatch(/docker-publish\.janus|buildkite-docker|plan-docker|publish-janus|cal-docker-(workflow|plan)\.py|JANUS_CAL_DOCKER_/);
    }
    expect(templateText).not.toMatch(/JANUS_CAL_RELEASE_MODE|cal-policy\.example\.json/);
  });

  test("retains the verifier's exact two-job and ordered three-step planner contract", () => {
    expect(Object.keys(template.jobs)).toEqual(["plan-docker", "publish-janus"]);
    expect(planner.name).toBe("Plan Docker image");
    expect(coordinator.name).toBe("Publish Docker image on Janus");
    expect(planner.steps.map((step: any) => step.name)).toEqual(["Compute image metadata", "Write image plan", "Upload image plan"]);
    expect(planner.steps[0].uses).toBe(metadataAction);
    expect(planner.steps[2].with).toEqual({ name: "cal-docker-metadata-${{ github.run_id }}-${{ github.run_attempt }}",
      path: "${{ runner.temp }}/docker-metadata.json", "if-no-files-found": "error", overwrite: false });
    expect(coordinator.needs).toBe("plan-docker");
    expect(template.permissions).toEqual({});
    expect(planner.permissions).toEqual({ contents: "read" });
    expect(coordinator.permissions).toEqual({ contents: "read", actions: "read", "id-token": "write" });
    for (const job of [planner, coordinator]) {
      expect(job["runs-on"]).toBe("ubuntu-24.04");
      expect(job["timeout-minutes"]).toBe(360);
      expect(job.if).toBe(`github.repository == '${repository}'`);
      for (const step of job.steps.filter((step: any) => step.uses)) expect(step.uses).toMatch(/@[0-9a-f]{40}$/);
    }
    expect(coordinator.steps[0].with).toEqual({ repository: "MiraiForge/devops", ref: helper,
      token: "${{ secrets.JANUS_HELPERS_READ_TOKEN }}", path: ".janus-tools", "persist-credentials": false });
    expect(JSON.stringify(coordinator)).not.toMatch(/DOCKER_USERNAME|DOCKER_PASSWORD|docker\/login-action|docker\/build-push-action/);
    expect(coordinator.steps.slice(2).map((step: any) => step.name)).toEqual([
      "Prepare completion reader credentials", "Verify read-only completion access before dispatch",
      "Coordinate native Docker build and publication", "Remove completion reader credentials",
    ]);
    expect(coordinator.steps[4].if).toBeUndefined(); // success() default: failed reader gates prevent dispatch.
    expect(coordinator.steps[5].if).toBe("always()");
  });
});

describe("actual embedded metadata planner (no provider access)", () => {
  for (const [kind, tag, prerelease] of [
    ["push", "", false], ["release", "v1.2.3", false], ["release", "v1.2.3-rc.1", true],
    ["release", "unversioned", false], ["release", "v1.2.3", true],
  ] as const) {
    for (const size of [0, 2 * 1024 ** 2, 25 * 1024 ** 2, 25 * 1024 ** 2 + 1]) {
      test(`${kind} ${tag} prerelease=${prerelease}, event bytes=${size || "ordinary"}`, () => {
        const f = fixture(kind, tag, prerelease);
        let raw = JSON.stringify(f.event);
        if (size) {
          f.event.padding = "";
          f.event.padding = "x".repeat(size - JSON.stringify(f.event).length);
          raw = JSON.stringify(f.event);
          expect(Buffer.byteLength(raw)).toBe(size);
        }
        if (size > 25 * 1024 ** 2) { rejected(f, raw); return; }
        withTemp(dir => {
          const result = runPlan(dir, f, raw);
          expect(result.status).toBe(0);
          expect(result.stdout + result.stderr).toBe("");
          const path = join(dir, "docker-metadata.json");
          expect(statSync(path).mode & 0o777).toBe(0o600);
          const bytes = readFileSync(path);
          expect(bytes.length).toBeLessThanOrEqual(65536);
          expect(JSON.parse(bytes.toString())).toEqual({ schemaVersion: 1, repository, sourceCommit: sha,
            ref: f.env.GITHUB_REF, event: kind, metadataAction, ...JSON.parse(f.env.JANUS_CAL_DOCKER_METADATA),
            producer: { runId: "100", runAttempt: "2", workflowRef: f.env.GITHUB_WORKFLOW_REF, workflowSha: sha },
            release: kind === "push" ? null : { id: 700, tagName: tag, draft: false, prerelease,
              publishedAt: "2026-10-20T10:00:00Z", action: "published" },
          });
        });
      });
    }
  }

  test("rejects malformed, duplicate, nonfinite and oversized metadata without output", () => {
    for (const raw of ["{", '{"x":1,"x":2}', '{"x":NaN}', " ".repeat(65537)]) {
      const f = fixture(); f.env.JANUS_CAL_DOCKER_METADATA = raw; rejected(f);
    }
    for (const raw of ["{", '{"repository":{},"repository":{}}', '{"x":Infinity}']) rejected(fixture(), raw);
    const f = fixture(); const metadata = JSON.parse(f.env.JANUS_CAL_DOCKER_METADATA);
    metadata.labels[prefix + "revision"] = "b".repeat(40);
    f.env.JANUS_CAL_DOCKER_METADATA = JSON.stringify(metadata); rejected(f);
  });

  test("rejects mismatched repository, source, workflow, runner and authority", () => {
    for (const [key, value] of Object.entries({ GITHUB_REPOSITORY: "outside/fork", GITHUB_REPOSITORY_ID: "1",
      GITHUB_REF: "refs/heads/other", GITHUB_SHA: "b".repeat(40), GITHUB_WORKFLOW_SHA: "b".repeat(40),
      GITHUB_WORKFLOW_REF: `${repository}/docs/ci/docker-publish.janus.yml@refs/heads/main`,
      GITHUB_JOB: "publish-janus", RUNNER_ENVIRONMENT: "self-hosted", GITHUB_RUN_ATTEMPT: "1000000",
      GITHUB_EVENT_NAME: "pull_request" })) {
      const f = fixture(); Object.assign(f.env, { [key]: value }); rejected(f);
    }
    for (const patch of [{ after: "b".repeat(40) }, { deleted: true }, { repository: { id: 1, full_name: repository } }]) {
      const f = fixture(); Object.assign(f.event, patch); rejected(f);
    }
    for (const patch of [{ draft: true }, { tag_name: "other" }, { prerelease: "true" }, { published_at: "invalid" }]) {
      const f = fixture("release"); Object.assign(f.event.release, patch); rejected(f);
    }
    const f = fixture("release"); f.event.action = "created"; rejected(f);
  });

  test("exclusive output refuses overwrite and symlink targets", () => {
    withTemp(dir => {
      const path = join(dir, "docker-metadata.json");
      expect(runPlan(dir).status).toBe(0);
      const before = readFileSync(path);
      expect(runPlan(dir).status).toBe(1);
      expect(readFileSync(path)).toEqual(before);
      rmSync(path);
      const victim = join(dir, "sentinel"); writeFileSync(victim, "unchanged"); symlinkSync(victim, path);
      expect(runPlan(dir).status).toBe(1);
      expect(readFileSync(victim, "utf8")).toBe("unchanged");
    });
  });
});

describe("embedded reader gates with synthetic credentials and no SSH", () => {
  // The actual setup/cleanup checks every ancestor: /tmp is intentionally unsafe.
  // Use an owned fixture under the checkout, and remove only this fixture.
  function reader(run: (dir: string, env: Record<string, string>, execute: (step: number) => ReturnType<typeof spawnSync>) => void) {
    const dir = mkdtempSync(new URL(".cal-docker-reader-test-", root).pathname);
    const env = { PATH: process.env.PATH!, RUNNER_TEMP: dir, GITHUB_RUN_ID: "100", GITHUB_RUN_ATTEMPT: "2",
      GITHUB_ENV: join(dir, "env"), READER_KEY: "synthetic-key-marker\n", READER_KNOWN_HOSTS: "synthetic-host-marker\n",
      READER_HOST: "reader.invalid", READER_PORT: "22" };
    const execute = (step: number) => spawnSync("python3", ["-I", "-B", "-S", "-"], {
      cwd: dir, env, input: embedded(coordinator.steps[step]), encoding: "utf8", timeout: 5000,
    });
    try { run(dir, env, execute); } finally { rmSync(dir, { recursive: true, force: true }); }
  }

  test("partial credential setup fails quietly and always-cleanup removes its files", () => {
    reader((dir, env, execute) => {
      env.READER_KNOWN_HOSTS = "";
      const result = execute(2);
      expect(result.status).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toBe("Cal completion reader setup failed\n");
      const credentials = join(dir, "cal-completion-100-2");
      expect(statSync(credentials).mode & 0o777).toBe(0o700);
      expect(statSync(join(credentials, "identity")).mode & 0o777).toBe(0o600);
      expect(existsSync(env.GITHUB_ENV)).toBe(false);
      expect(execute(5).status).toBe(0);
      expect(existsSync(credentials)).toBe(false);
      expect(execute(5).status).toBe(0);
    });
  });

  test("reader failure blocks dispatch without logging credentials; cleanup preserves evidence", () => {
    reader((dir, env, execute) => {
      const helpers = join(dir, ".janus-tools/infrastructure/buildkite-publishers");
      mkdirSync(helpers, { recursive: true });
      // Isolated substitute at the real import path. Neither SSH nor the coordinator executes.
      writeFileSync(join(helpers, "cal-completion.py"), `def arguments(config, probe):\n    pass\ndef fetch(config, probe, deadline):\n    raise ValueError('synthetic-key-marker')\n`);
      expect(execute(2).status).toBe(0);
      const line = readFileSync(env.GITHUB_ENV, "utf8").trim();
      Object.assign(env, { JANUS_CAL_COMPLETION_READER: line.slice(line.indexOf("=") + 1) });
      const result = execute(3);
      expect(result.status).toBe(1);
      expect(result.stdout).toBe("");
      expect(result.stderr).toBe("Cal completion reader preflight failed; no build dispatched\n");
      const evidence = join(dir, "dispatch-evidence.json"); writeFileSync(evidence, "preserved");
      expect(execute(5).status).toBe(0);
      expect(existsSync(join(dir, "cal-completion-100-2"))).toBe(false);
      expect(readFileSync(evidence, "utf8")).toBe("preserved");
    });
  });
});
