/** Fail publication if package, lockfile, generated sources, or tarball contents are unsafe. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const lockfile = await readFile(new URL("../pnpm-lock.yaml", import.meta.url), "utf8");
assert.equal(packageJson.private, false, "public package cannot be private");
assert.equal(packageJson.publishConfig?.access, "public");
assert.ok(packageJson.files.includes("contract"), "published package must carry canonical-contract provenance");
assert.ok(!/\b(?:link|file|workspace):/.test(lockfile), "release lockfile cannot use local dependency protocols");
assert.ok(!Object.hasOwn(packageJson, "pnpm") || !packageJson.pnpm?.overrides, "release package cannot use pnpm overrides");
for (const [name, version] of Object.entries(packageJson.dependencies ?? {})) {
  assert.ok(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version), `runtime dependency ${name} must be exactly pinned`);
}
const { stdout } = await execFileAsync("npm", ["pack", "--dry-run", "--json"], { encoding: "utf8" });
const packed = JSON.parse(stdout)[0];
const files = new Set(packed.files.map((file) => file.path));
for (const required of ["dist/index.js", "dist/index.cjs", "dist/index.d.ts", "dist/bin/cli.cjs", "dist/bin/api-lock.json", "contract/spec.pontx.json", "contract/pontx.lock.json", "LICENSE", "THIRD_PARTY_NOTICES.md", "README.md", "package.json"]) {
  assert.ok(files.has(required), `npm tarball misses ${required}`);
}
for (const file of files) {
  assert.equal(/(?:^|\/)(?:node_modules|test|reports)(?:\/|$)/.test(file), false, `npm tarball must not contain ${file}`);
}
console.log(`Release package verified: ${packageJson.name}@${packageJson.version}, ${packed.files.length} files, exact runtime dependencies, frozen lockfile, and canonical-contract provenance.`);
