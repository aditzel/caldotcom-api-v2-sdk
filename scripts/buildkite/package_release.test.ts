import { expect, test } from "bun:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

test("npm release packaging and wrapper regression suite", async () => {
  const result = await promisify(execFile)("python3", [
    "-I", "-B", fileURLToPath(new URL("./package_release_test.py", import.meta.url)),
  ], { timeout: 120_000 });
  expect(result.stderr).toContain("OK");
}, 125_000);
