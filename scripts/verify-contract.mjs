/** Verify immutable AWS source evidence and the exact canonical PontxSpec mirror. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { loadPontxSpec } from "@pontx/spec";

const execFileAsync = promisify(execFile);
const readJson = async (url) => JSON.parse(await readFile(url, "utf8"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const lock = await readJson(new URL("../contract/sqs.lock.json", import.meta.url));
const pontxLock = await readJson(new URL("../contract/pontx.lock.json", import.meta.url));
const [smithyBytes, specBytes] = await Promise.all([
  readFile(new URL("../contract/smithy.json", import.meta.url)),
  readFile(new URL("../contract/spec.pontx.json", import.meta.url)),
]);

assert.equal(hash(smithyBytes), lock.sha256, "vendored Smithy bytes drifted");
assert.equal(hash(specBytes), pontxLock.canonicalSpec.sha256, "canonical PontxSpec mirror drifted");
const model = JSON.parse(smithyBytes.toString("utf8"));
const service = model.shapes?.[lock.serviceId];
assert.equal(model.smithy, "2.0");
assert.equal(service?.type, "service");
assert.ok(service.traits?.["aws.protocols#awsJson1_0"]);
assert.ok(service.traits?.["aws.protocols#awsQueryCompatible"]);
assert.equal(service.traits?.["aws.auth#sigv4"]?.name, "sqs");
assert.ok(service.traits?.["smithy.rules#endpointRuleSet"]);

const sourceActions = (service.operations ?? [])
  .map((operation) => String(operation.target ?? "").split("#").at(-1))
  .filter(Boolean)
  .sort();
assert.deepEqual(sourceActions, [...lock.operations].sort(), "Smithy operation list drifted");
const spec = loadPontxSpec(specBytes.toString("utf8"), { expectedName: "amazon-sqs" });
assert.equal(spec.pontx, pontxLock.canonicalSpec.pontx);
assert.equal(spec.style, pontxLock.canonicalSpec.style);
assert.equal(spec.rpc?.protocol, pontxLock.canonicalSpec.protocol);
assert.deepEqual(spec.rpc?.compatibleProtocols, pontxLock.canonicalSpec.compatibleProtocols);
assert.equal(`${spec.rpc?.signing?.scheme}/${spec.rpc?.signing?.service}`, pontxLock.canonicalSpec.signing);
assert.ok(spec.rpc?.endpointRuleSet, "canonical contract must retain source endpoint rules");
assert.equal(Object.keys(spec.apis).length, pontxLock.canonicalSpec.operations);
assert.equal(Object.keys(spec.components.schemas).length, pontxLock.canonicalSpec.schemas);
const canonicalActions = Object.values(spec.apis).map((api) => api.operationId).sort();
assert.deepEqual(canonicalActions, sourceActions, "canonical spec must cover every source action");
for (const api of Object.values(spec.apis)) {
  assert.equal(Object.hasOwn(api, "method"), false, `${api.operationId} invented a REST method`);
  assert.equal(Object.hasOwn(api, "path"), false, `${api.operationId} invented a REST path`);
  assert.deepEqual(api.tags, [], `${api.operationId} must remain a root SDK method`);
  assert.equal(api.rpc?.action, api.operationId);
  assert.equal(api.rpc?.method, "POST");
  assert.equal(api.rpc?.contentType, "application/x-amz-json-1.0");
}

const { stdout: remoteBytes } = await execFileAsync("curl", ["--fail", "--location", "--silent", "--show-error", lock.source], {
  encoding: "buffer",
  maxBuffer: 4 * 1024 * 1024,
});
assert.equal(hash(remoteBytes), lock.sha256, "immutable upstream Smithy source no longer matches the lock");
console.log(`Verified Amazon SQS contract: ${canonicalActions.length} canonical actions, ${Object.keys(spec.components.schemas).length} schemas, AWS JSON 1.0, AWS Query compatibility, SigV4, endpoint rules, and metadata commit ${pontxLock.metadata.commit}.`);
