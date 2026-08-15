/**
 * @author pontx-generator
 * @description Safety and AWS JSON 1.0 transport checks.
 */

import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import {
  amazonSqsActionNames,
  AMAZON_SQS_CONFIRMATION_TTL_MS,
  buildAmazonSqsPreview,
  classifyAmazonSqsAction,
  createAmazonSqsClient,
  hasValidAmazonSqsConfirmation,
} from "../../src/index.js";

describe("Amazon SQS generated SDK", () => {
  it("covers the complete pinned action list", () => {
    expect(amazonSqsActionNames).toHaveLength(23);
    expect(amazonSqsActionNames).toContain("SendMessage");
    expect(amazonSqsActionNames).toContain("PurgeQueue");
  });

  it("redacts sensitive preview fields and binds a short-lived confirmation to exact input", () => {
    const input = { QueueUrl: "https://sqs.us-east-1.amazonaws.com/123456789012/example", MessageBody: "private" };
    const issuedAt = 1_700_000_000_000;
    const preview = buildAmazonSqsPreview("SendMessage", input, issuedAt);

    expect(preview.classification).toBe("mutation");
    expect(preview.input).toEqual({
      QueueUrl: "https://sqs.us-east-1.amazonaws.com/123456789012/example",
      MessageBody: "[REDACTED]",
    });
    expect(preview.confirmationExpiresAt).toBe(new Date(issuedAt + AMAZON_SQS_CONFIRMATION_TTL_MS).toISOString());
    expect(hasValidAmazonSqsConfirmation("SendMessage", input, preview.confirmationToken, issuedAt + 1)).toBe(true);
    expect(hasValidAmazonSqsConfirmation("SendMessage", { ...input, MessageBody: "changed" }, preview.confirmationToken, issuedAt + 1)).toBe(false);
    expect(hasValidAmazonSqsConfirmation("SendMessage", input, preview.confirmationToken, issuedAt + AMAZON_SQS_CONFIRMATION_TTL_MS + 1)).toBe(false);
  });

  it("classifies ReceiveMessage as a stateful read", () => {
    expect(classifyAmazonSqsAction("ListQueues")).toBe("read");
    expect(classifyAmazonSqsAction("ReceiveMessage")).toBe("stateful-read");
    expect(classifyAmazonSqsAction("PurgeQueue")).toBe("mutation");
  });

  it("delegates AWS JSON 1.0 serialization and SigV4-ready request construction to the AWS runtime", async () => {
    const requests: Array<{ body?: unknown; headers?: Record<string, string> }> = [];
    const client = createAmazonSqsClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: "unit-test-access-key",
        secretAccessKey: "unit-test-signing-secret",
      },
      requestHandler: {
        handle: async (request: { body?: unknown; headers?: Record<string, string> }) => {
          requests.push(request);
          return {
            response: {
              statusCode: 200,
              headers: { "content-type": "application/x-amz-json-1.0" },
              body: Readable.from([
                "{\"MessageId\":\"message-id\",\"MD5OfMessageBody\":\"5d41402abc4b2a76b9719d911017c592\"}",
              ]),
            },
          };
        },
      },
    });
    try {
      const result = await client.sendMessage({
        QueueUrl: "https://sqs.us-east-1.amazonaws.com/123456789012/example",
        MessageBody: "hello",
      });

      expect(result.MessageId).toBe("message-id");
      const request = requests[0];
      const body = typeof request.body === "string"
        ? request.body
        : new TextDecoder().decode(request.body as ArrayBuffer);
      expect(request.headers?.["content-type"]).toContain("application/x-amz-json-1.0");
      expect(request.headers?.["x-amz-target"]).toBe("AmazonSQS.SendMessage");
      expect(body).toBe("{\"QueueUrl\":\"https://sqs.us-east-1.amazonaws.com/123456789012/example\",\"MessageBody\":\"hello\"}");
      expect(request.headers?.authorization).toContain("AWS4-HMAC-SHA256");
    } finally {
      client.destroy();
    }
  });

  it("uses the official FIPS and dual-stack endpoint rule result", async () => {
    const hosts: string[] = [];
    const client = createAmazonSqsClient({
      region: "us-east-1",
      useFipsEndpoint: true,
      useDualstackEndpoint: true,
      credentials: {
        accessKeyId: "unit-test-access-key",
        secretAccessKey: "unit-test-signing-secret",
      },
      requestHandler: {
        handle: async (request: { hostname?: string }) => {
          hosts.push(request.hostname || "");
          return {
            response: {
              statusCode: 200,
              headers: { "content-type": "application/x-amz-json-1.0" },
              body: Readable.from(["{}"]),
            },
          };
        },
      },
    });
    try {
      await client.listQueues({});
      expect(hosts).toEqual(["sqs-fips.us-east-1.api.aws"]);
    } finally {
      client.destroy();
    }
  });

  it("rejects an unsupported custom-endpoint and FIPS combination before dispatch", async () => {
    const client = createAmazonSqsClient({
      region: "us-east-1",
      endpoint: "https://example.com",
      useFipsEndpoint: true,
      credentials: {
        accessKeyId: "unit-test-access-key",
        secretAccessKey: "unit-test-signing-secret",
      },
      requestHandler: {
        handle: async () => {
          throw new Error("request handler must not run");
        },
      },
    });
    try {
      await expect(client.listQueues({})).rejects.toThrow(/FIPS and custom endpoint/);
    } finally {
      client.destroy();
    }
  });
});
