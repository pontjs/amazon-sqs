/**
 * @author pontx-generator
 * @description Local preview and exact-confirmation safeguards for SQS actions.
 */

import { createHash, timingSafeEqual } from "node:crypto";
import { amazonSqsActionNames, type AmazonSqsActionName } from "./generated/actions.js";

export type AmazonSqsActionClass = "read" | "mutation";

const readActions = new Set<AmazonSqsActionName>([
  "GetQueueAttributes",
  "GetQueueUrl",
  "ListDeadLetterSourceQueues",
  "ListMessageMoveTasks",
  "ListQueueTags",
  "ListQueues",
  "ReceiveMessage",
]);

const sensitiveKey = /(authorization|credential|secret|token|password|access.?key|messagebody)/i;

export function isAmazonSqsActionName(value: string): value is AmazonSqsActionName {
  return (amazonSqsActionNames as readonly string[]).includes(value);
}

export function classifyAmazonSqsAction(action: AmazonSqsActionName): AmazonSqsActionClass {
  return readActions.has(action) ? "read" : "mutation";
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => [key, stableValue((value as Record<string, unknown>)[key])]));
}

function redact(value: unknown, key = ""): unknown {
  if (sensitiveKey.test(key)) return "[REDACTED]";
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .map(([childKey, childValue]) => [childKey, redact(childValue, childKey)]));
}

/** Creates an opaque token bound to the exact action and unredacted input. */
export function createAmazonSqsConfirmationToken(
  action: AmazonSqsActionName,
  input: Record<string, unknown>
): string {
  const payload = JSON.stringify({ action, input: stableValue(input) });
  return `ptx1_${createHash("sha256").update(payload).digest("hex")}`;
}

export function hasValidAmazonSqsConfirmation(
  action: AmazonSqsActionName,
  input: Record<string, unknown>,
  suppliedToken: string | undefined
): boolean {
  if (!suppliedToken) return false;
  const expected = Buffer.from(createAmazonSqsConfirmationToken(action, input));
  const received = Buffer.from(suppliedToken);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function buildAmazonSqsPreview(
  action: AmazonSqsActionName,
  input: Record<string, unknown>
) {
  return {
    action,
    classification: classifyAmazonSqsAction(action),
    transport: "aws-json-1.0",
    signing: "aws-sigv4",
    input: redact(input),
    confirmationToken: createAmazonSqsConfirmationToken(action, input),
  };
}
