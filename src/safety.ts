/**
 * @author pontx-generator
 * @description Local preview and exact-confirmation safeguards for SQS actions.
 */

import { createHash, timingSafeEqual } from "node:crypto";
import { amazonSqsActionNames, type AmazonSqsActionName } from "./generated/actions.js";

export type AmazonSqsActionClass = "read" | "stateful-read" | "mutation";

export const AMAZON_SQS_CONFIRMATION_TTL_MS = 5 * 60 * 1000;

const readActions = new Set<AmazonSqsActionName>([
  "GetQueueAttributes",
  "GetQueueUrl",
  "ListDeadLetterSourceQueues",
  "ListMessageMoveTasks",
  "ListQueueTags",
  "ListQueues",
]);

const statefulReadActions = new Set<AmazonSqsActionName>([
  "ReceiveMessage",
]);

const sensitiveKey = /(authorization|credential|secret|token|password|access.?key|messagebody)/i;

export function isAmazonSqsActionName(value: string): value is AmazonSqsActionName {
  return (amazonSqsActionNames as readonly string[]).includes(value);
}

export function classifyAmazonSqsAction(action: AmazonSqsActionName): AmazonSqsActionClass {
  if (statefulReadActions.has(action)) return "stateful-read";
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
  input: Record<string, unknown>,
  issuedAt = Date.now(),
): string {
  const payload = JSON.stringify({ action, input: stableValue(input), issuedAt });
  return `ptx1_${issuedAt}_${createHash("sha256").update(payload).digest("hex")}`;
}

export function hasValidAmazonSqsConfirmation(
  action: AmazonSqsActionName,
  input: Record<string, unknown>,
  suppliedToken: string | undefined,
  now = Date.now(),
): boolean {
  if (!suppliedToken) return false;
  const match = /^ptx1_(\d{13})_([a-f0-9]{64})$/.exec(suppliedToken);
  if (!match) return false;
  const issuedAt = Number(match[1]);
  if (!Number.isSafeInteger(issuedAt) || issuedAt > now || now - issuedAt > AMAZON_SQS_CONFIRMATION_TTL_MS) {
    return false;
  }
  const expected = Buffer.from(createAmazonSqsConfirmationToken(action, input, issuedAt));
  const received = Buffer.from(suppliedToken);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function buildAmazonSqsPreview(
  action: AmazonSqsActionName,
  input: Record<string, unknown>,
  now = Date.now(),
) {
  return {
    action,
    classification: classifyAmazonSqsAction(action),
    transport: "aws-json-1.0",
    signing: "aws-sigv4",
    input: redact(input),
    confirmationToken: createAmazonSqsConfirmationToken(action, input, now),
    confirmationExpiresAt: new Date(now + AMAZON_SQS_CONFIRMATION_TTL_MS).toISOString(),
  };
}
