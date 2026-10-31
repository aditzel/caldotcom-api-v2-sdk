import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const workflow = Bun.YAML.parse(readFileSync(
  new URL("../../.github/workflows/publish.yml", import.meta.url), "utf8",
)) as any;
const helper = "3ff6ff730c9607546551e11f9ae271ce0235487a";
const repository = "aditzel/caldotcom-api-v2-sdk";
const prepare = workflow.jobs["prepare-janus"];
const publish = workflow.jobs.publish;
const legacy = publish.steps.filter((step: any) => step.if === "vars.JANUS_CAL_RELEASE_MODE == ''");

function expression(source: string, mode: string, result = "success", cancelled = false, repo = repository) {
  // Evaluate this workflow's small expression subset, including GitHub's
  // case-insensitive contains(), to exercise its actual routing conditions.
  const body = source.replace(/^\$\{\{\s*|\s*\}\}$/g, "")
    .replaceAll("vars.JANUS_CAL_RELEASE_MODE", "mode")
    .replaceAll("github.repository", "repository")
    .replaceAll("needs.prepare-janus.result", "result")
    .replaceAll("cancelled()", "cancelled");
  return new Function("mode", "repository", "result", "cancelled", "fromJSON", "contains", `return (${body});`)(
    mode, repo, result, cancelled, JSON.parse,
    (values: string[], item: string) => values.some(value => value.toLowerCase() === item.toLowerCase()),
  );
}

describe("original Cal publisher routing", () => {
  test("preserves only the tag/manual triggers and unused version input", () => {
    expect(workflow.name).toBe("Publish Package");
    expect(workflow.on).toEqual({
      push: { tags: ["v*"] },
      workflow_dispatch: { inputs: {
        version: { description: "Override version to publish (for dry run workflows)", required: false },
      } },
    });
    expect(JSON.stringify(workflow.jobs)).not.toContain("inputs.version");
    expect(workflow.concurrency).toBeUndefined();
    expect(publish.environment).toBeUndefined();
    expect(publish.needs).toBe("prepare-janus");
  });

  test("unset mode keeps the original commands, versions and publisher behavior", () => {
    expect(legacy.map(({ if: _condition, ...step }: any) => step)).toEqual([
      { name: "Checkout repository", uses: "actions/checkout@v4" },
      { name: "Set up Bun", uses: "oven-sh/setup-bun@v1", with: { "bun-version": "1.3.0" } },
      { name: "Install dependencies", run: "bun install --frozen-lockfile" },
      { name: "Lint", run: "bun run lint" },
      { name: "Build", run: "bun run build" },
      { name: "Test", run: "bun test" },
      { name: "Setup Node.js", uses: "actions/setup-node@v4",
        with: { "node-version": "20.x", "registry-url": "https://registry.npmjs.org" } },
      { name: "Update npm", run: "npm install -g npm@latest" },
      { name: "Publish to NPM", "working-directory": "packages/sdk", run: "npm publish --provenance --access public" },
    ]);
    expect(expression(prepare.if, "")).toBe(false);
    expect(expression(publish.if, "", "skipped")).toBe(true);
    expect(expression(publish["runs-on"], "")).toEqual(["self-hosted", "Linux", "X64"]);
  });

  test("both hosted modes require successful preparation and exclude cancellation and forks", () => {
    for (const mode of ["verify", "publish"]) {
      expect(expression(prepare.if, mode)).toBe(true);
      expect(expression(publish["runs-on"], mode)).toEqual(["ubuntu-24.04"]);
      for (const result of ["failure", "cancelled", "skipped", "success"]) {
        expect(expression(publish.if, mode, result)).toBe(result === "success");
        expect(expression(publish.if, mode, result, true)).toBe(false);
      }
      expect(expression(prepare.if, mode, "success", false, "outside/fork")).toBe(false);
      expect(expression(publish.if, mode, "success", false, "outside/fork")).toBe(false);
    }
  });

  test("unknown mode reaches a hosted validation failure before publication", () => {
    const validation = publish.steps[0];
    expect(validation.name).toBe("Validate release mode");
    for (const mode of ["", "verify", "publish", "typo", "VERIFY"]) {
      const result = spawnSync("/bin/bash", ["-e", "-c", validation.run], {
        env: { PATH: "/usr/bin:/bin", RELEASE_MODE: mode }, encoding: "utf8",
      });
      expect(result.status).toBe(["", "verify", "publish"].includes(mode) ? 0 : 1);
    }
    expect(expression(publish.if, "typo", "skipped")).toBe(true);
    expect(expression(publish["runs-on"], "typo")).toEqual(["ubuntu-24.04"]);
  });

  test("preparation rejects case variants before any helper or provider access", () => {
    const validation = prepare.steps[0];
    expect(validation.name).toBe("Validate preparation mode");
    expect(expression(prepare.if, "VERIFY")).toBe(true);
    for (const mode of ["", "verify", "publish", "typo", "VERIFY", "PUBLISH"]) {
      const result = spawnSync("/bin/bash", ["-e", "-c", validation.run], {
        env: { PATH: "/usr/bin:/bin", RELEASE_MODE: mode }, encoding: "utf8",
      });
      expect(result.status).toBe(["verify", "publish"].includes(mode) ? 0 : 1);
    }
  });

  test("separates coordinator creation, read credentials and publisher OIDC", () => {
    expect(workflow.permissions).toEqual({ contents: "read" });
    expect(prepare.permissions).toEqual({ contents: "read", actions: "read" });
    expect(publish.permissions).toEqual({ contents: "read", actions: "read", "id-token": "write" });
    const dispatch = prepare.steps.find((step: any) => step.id === "handoff");
    const final = publish.steps.find((step: any) => step.name === "Publish authenticated package");
    expect(dispatch.env.JANUS_BUILDKITE_CREATE_TOKEN).toBe("${{ secrets.BUILDKITE_CAL_RELEASE_CREATE_TOKEN }}");
    expect(JSON.stringify(publish)).not.toContain("BUILDKITE_CAL_RELEASE_CREATE_TOKEN");
    for (const step of [dispatch, final]) {
      expect(step.env.JANUS_CAL_RELEASE_POLICY).toBe("${{ vars.JANUS_CAL_RELEASE_POLICY }}");
      expect(step.env.JANUS_GITHUB_READ_TOKEN).toBe("${{ secrets.GITHUB_TOKEN }}");
      expect(step.env.JANUS_BUILDKITE_READ_TOKEN).toBe("${{ secrets.BUILDKITE_CAL_RELEASE_READ_TOKEN }}");
      expect(JSON.stringify(step.env)).not.toMatch(/NPM_TOKEN|NODE_AUTH_TOKEN/);
    }
  });

  test("pins both complete helper checkouts and runs no project code in hosted modes", () => {
    for (const job of [prepare, publish]) {
      const checkout = job.steps.find((step: any) => step.id === "helpers");
      expect(checkout.uses).toBe("actions/checkout@11d5960a326750d5838078e36cf38b85af677262");
      expect(checkout.with).toEqual({
        repository: "MiraiForge/devops", ref: helper,
        token: "${{ secrets.JANUS_HELPERS_READ_TOKEN }}", path: ".janus-tools", "persist-credentials": false,
      });
      expect(job["timeout-minutes"]).toBe(360);
      const cleanup = job.steps.at(-1);
      expect(cleanup.if).toBe("always() && steps.helpers.outcome == 'success'");
      expect(cleanup.run).toBe("python3 -I -B .janus-tools/infrastructure/buildkite-publishers/cal-workflow.py cleanup");
    }
    expect(prepare.name).toBe("Prepare Janus package");
    expect(publish.name).toBe("Publish to npm");
    expect(prepare["runs-on"]).toBe("ubuntu-24.04");
    const hostedRuns = [...prepare.steps.slice(1), ...publish.steps.filter((step: any) =>
      step.if === "vars.JANUS_CAL_RELEASE_MODE != ''")].filter((step: any) => step.run);
    for (const step of hostedRuns) {
      expect(step.run).toMatch(/^python3 -I -B \.janus-tools\/infrastructure\/buildkite-publishers\/cal-workflow\.py (prepare|publish|cleanup)$/);
    }
    expect(publish.steps.find((step: any) => step.name === "Setup hosted publisher Node").with).toEqual({
      "node-version": "24.22.0",
    });
  });

  test("uploads only the immutable handoff before coordinator cleanup", () => {
    const upload = prepare.steps.find((step: any) => step.name === "Upload authenticated handoff");
    expect(upload.uses).toBe("actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02");
    expect(upload.with).toEqual({
      name: "${{ steps.handoff.outputs.artifact-name }}",
      path: "${{ steps.handoff.outputs.handoff-file }}",
      "if-no-files-found": "error", overwrite: false,
    });
    expect(upload.if).toBeUndefined();
    expect(prepare.steps.indexOf(upload)).toBeLessThan(prepare.steps.length - 1);
  });
});
