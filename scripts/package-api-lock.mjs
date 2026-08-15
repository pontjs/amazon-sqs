/** Package the canonical PontxSpec under the CLI's machine-readable public-SDK lock path. */
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const source = new URL("../contract/spec.pontx.json", import.meta.url);
const target = new URL("../dist/bin/api-lock.json", import.meta.url);
const bytes = await readFile(source);
const spec = JSON.parse(bytes.toString("utf8"));

function methodName(operationId) {
  return operationId.slice(0, 1).toLowerCase() + operationId.slice(1);
}

assert.equal(spec.style, "RPC");
assert.equal(Object.keys(spec.apis ?? {}).length, 23);
const apis = {};
for (const api of Object.values(spec.apis ?? {})) {
  assert.equal(Object.hasOwn(api, "method"), false, "RPC contract must not invent a REST method");
  assert.equal(Object.hasOwn(api, "path"), false, "RPC contract must not invent a REST path");
  assert.equal(typeof api.operationId, "string");
  const publicMethod = methodName(api.operationId);
  assert.equal(Object.hasOwn(apis, publicMethod), false, "public SDK method names must be unique");
  apis[publicMethod] = api;
}

await mkdir(new URL("../dist/bin/", import.meta.url), { recursive: true });
await writeFile(target, `${JSON.stringify({ ...spec, apis }, null, 2)}\n`);
console.log("Packaged Amazon SQS api-lock.json with 23 public SDK methods and canonical RPC actions.");
