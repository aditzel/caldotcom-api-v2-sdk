import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const workflow = Bun.YAML.parse(readFileSync(
  new URL("../../.github/workflows/ci.yml", import.meta.url), "utf8",
)) as any;
const job = workflow.jobs["build-and-test"];

test("ordinary CI leaves hosted execution for forks and explicit rollback", () => {
  expect(workflow.on).toEqual({
    pull_request: { branches: ["main"] },
    workflow_dispatch: null,
  });
  const evaluate = new Function("github", `return (${job.if});`);
  for (const [event, headRepo, expected] of [
    ["pull_request", "aditzel/caldotcom-api-v2-sdk", false],
    ["pull_request", "contributor/caldotcom-api-v2-sdk", true],
    ["workflow_dispatch", undefined, true],
    ["push", undefined, false],
    ["release", undefined, false],
  ] as const) {
    expect(evaluate({
      event_name: event,
      repository: "aditzel/caldotcom-api-v2-sdk",
      event: headRepo ? { pull_request: { head: { repo: { full_name: headRepo } } } } : {},
    })).toBe(expected);
  }
});

test("hosted fallback keeps read-only checkout, commands and successful SDK upload", () => {
  expect(workflow.permissions).toEqual({ contents: "read" });
  expect(job["runs-on"]).toBe("ubuntu-24.04");
  expect(job.steps[0].with["persist-credentials"]).toBe(false);
  expect(job.steps.filter((step: any) => step.run).map((step: any) => step.run)).toEqual([
    "bun install --frozen-lockfile", "bun run lint", "bun run build", "bun test",
  ]);
  const upload = job.steps.at(-1);
  expect(upload.if).toBe("success()");
  expect(upload.with).toEqual({
    name: "caldotcom-api-v2-sdk-dist",
    path: "packages/sdk/dist",
    "if-no-files-found": "error",
  });
});
