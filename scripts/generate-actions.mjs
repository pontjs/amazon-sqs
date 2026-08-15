/**
 * @author pontx-generator
 * @description Generate the SDK action facade from the pinned AWS Smithy model.
 */

import { readFile, writeFile } from "node:fs/promises";

const lock = JSON.parse(await readFile(new URL("../contract/sqs.lock.json", import.meta.url), "utf8"));
const pontxLock = JSON.parse(await readFile(new URL("../contract/pontx.lock.json", import.meta.url), "utf8"));
const canonical = JSON.parse(await readFile(new URL("../contract/spec.pontx.json", import.meta.url), "utf8"));
const outputUrl = new URL("../src/generated/actions.ts", import.meta.url);
const write = process.argv.includes("--write");
const check = process.argv.includes("--check");

if (write === check) {
  throw new Error("Use exactly one of --write or --check");
}

if (canonical.pontx !== pontxLock.canonicalSpec.pontx || canonical.style !== "RPC") {
  throw new Error("Canonical PontxSpec identity is invalid");
}
const actions = Object.values(canonical.apis ?? [])
  .map((api) => api.operationId)
  .filter((operationId) => typeof operationId === "string")
  .sort();
const expected = [...lock.operations].sort();
if (JSON.stringify(actions) !== JSON.stringify(expected)) {
  throw new Error(`Canonical SQS action list drifted: expected ${expected.length}, received ${actions.length}`);
}

function methodName(action) {
  return action.slice(0, 1).toLowerCase() + action.slice(1);
}

const commandImports = actions.map((action) =>
  `  ${action}Command,\n  type ${action}CommandInput,\n  type ${action}CommandOutput,`
).join("\n");
const methods = actions.map((action) =>
  `  ${methodName(action)}(input: ${action}CommandInput): Promise<${action}CommandOutput>;`
).join("\n");
const implementations = actions.map((action) =>
  `  ${methodName(action)}: (input) => client.send(new ${action}Command(input)),`
).join("\n");

const output = `/**\n * @author pontx-generator\n * @description Generated Amazon SQS action facade. Do not edit by hand.\n */\n\nimport {\n${commandImports}\n} from "@aws-sdk/client-sqs";\nimport type { SQSClient } from "@aws-sdk/client-sqs";\n\nexport const amazonSqsActionNames = ${JSON.stringify(actions, null, 2)} as const;\nexport type AmazonSqsActionName = typeof amazonSqsActionNames[number];\n\nexport type AmazonSqsActions = {\n${methods}\n};\n\nexport function createAmazonSqsActions(client: SQSClient): AmazonSqsActions {\n  return {\n${implementations}\n  };\n}\n`;

if (write) {
  await writeFile(outputUrl, output);
  console.log(`Generated ${actions.length} Amazon SQS actions.`);
  process.exit(0);
}

const existing = await readFile(outputUrl, "utf8");
if (existing !== output) throw new Error("Generated action facade is stale; run node scripts/generate-actions.mjs --write");
console.log(`Verified ${actions.length} generated Amazon SQS actions.`);
