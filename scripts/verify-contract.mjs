/**
 * @author pontx-generator
 * @description Verify immutable SQS contract provenance before a release.
 */

import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const lock = JSON.parse(await readFile(new URL("../contract/sqs.lock.json", import.meta.url), "utf8"));
const { stdout: text } = await execFileAsync("curl", ["--fail", "--location", "--silent", "--show-error", lock.source], {
  encoding: "utf8",
  maxBuffer: 4 * 1024 * 1024,
});
const sha256 = createHash("sha256").update(text).digest("hex");
if (sha256 !== lock.sha256) throw new Error(`Pinned Smithy SHA-256 mismatch: ${sha256}`);

const model = JSON.parse(text);
const service = model.shapes?.[lock.serviceId];
if (model.smithy !== "2.0" || service?.type !== "service") {
  throw new Error("Pinned source is not the expected Smithy 2.0 SQS service");
}
if (!service.traits?.["aws.protocols#awsJson1_0"] ||
  !service.traits?.["aws.protocols#awsQueryCompatible"] ||
  !service.traits?.["aws.auth#sigv4"]?.name) {
  throw new Error("Pinned source no longer declares AWS JSON 1.0, AWS Query compatibility, and SigV4");
}
if (!service.traits?.["smithy.rules#endpointRuleSet"]) {
  throw new Error("Pinned source no longer declares endpoint rules");
}
console.log(`Verified SQS Smithy contract: ${lock.operations.length} actions, AWS JSON 1.0, AWS Query compatibility, SigV4, endpoint rules.`);
