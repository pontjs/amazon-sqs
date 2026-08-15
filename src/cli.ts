/**
 * @author pontx-generator
 * @description Safety-first local CLI for the generated Amazon SQS SDK.
 */

import {
  amazonSqsActionNames,
  buildAmazonSqsPreview,
  createAmazonSqsClient,
  hasValidAmazonSqsConfirmation,
  isAmazonSqsActionName,
} from "./index.js";

type Arguments = {
  command?: string;
  action?: string;
  input?: string;
  confirm?: string;
  region?: string;
};

function usage(): string {
  return [
    "Usage:",
    "  pontx-amazon-sqs list apis",
    "  pontx-amazon-sqs preview ACTION --input '{...}'",
    "  pontx-amazon-sqs call ACTION --input '{...}' --confirm ptx1_... [--region REGION]",
    "",
    "All calls require a confirmation token from an unchanged local preview.",
  ].join("\n");
}

function parseArguments(values: string[]): Arguments {
  const [command, action, ...rest] = values;
  const parsed: Arguments = { command, action };
  for (let index = 0; index < rest.length; index += 1) {
    const flag = rest[index];
    const value = rest[index + 1];
    if (!value || !["--input", "--confirm", "--region"].includes(flag)) {
      throw new Error(`Invalid argument: ${flag}`);
    }
    if (flag === "--input") parsed.input = value;
    if (flag === "--confirm") parsed.confirm = value;
    if (flag === "--region") parsed.region = value;
    index += 1;
  }
  return parsed;
}

function parseInput(value: string | undefined): Record<string, unknown> {
  if (!value) throw new Error("--input must contain a JSON object");
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("--input must contain a JSON object");
  }
  return parsed as Record<string, unknown>;
}

async function main(): Promise<void> {
  const args = parseArguments(process.argv.slice(2));
  if (args.command === "list" && args.action === "apis") {
    process.stdout.write(`${amazonSqsActionNames.join("\n")}\n`);
    return;
  }
  if (!args.command || !args.action || !isAmazonSqsActionName(args.action)) {
    throw new Error(usage());
  }
  const input = parseInput(args.input);
  if (args.command === "preview") {
    process.stdout.write(`${JSON.stringify(buildAmazonSqsPreview(args.action, input), null, 2)}\n`);
    return;
  }
  if (args.command !== "call") throw new Error(usage());
  if (!hasValidAmazonSqsConfirmation(args.action, input, args.confirm)) {
    throw new Error("Call denied: run preview first and pass its unchanged confirmationToken.");
  }
  const region = args.region || process.env.AWS_REGION;
  if (!region) throw new Error("Call denied: configure AWS_REGION or pass --region.");
  const client = createAmazonSqsClient({ region });
  try {
    const method = args.action.slice(0, 1).toLowerCase() + args.action.slice(1);
    const response = await (client as unknown as Record<string, (value: Record<string, unknown>) => Promise<unknown>>)[method](input);
    process.stdout.write(`${JSON.stringify(response, null, 2)}\n`);
  } finally {
    client.destroy();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
