/**
 * @author pontx-generator
 * @description Public Amazon SQS SDK entrypoint generated from the pinned Smithy contract.
 */

import { SQSClient, type SQSClientConfig } from "@aws-sdk/client-sqs";
import {
  amazonSqsActionNames,
  createAmazonSqsActions,
  type AmazonSqsActions,
} from "./generated/actions.js";

export type AmazonSqsClientConfig = SQSClientConfig;

export type AmazonSqsClient = AmazonSqsActions & {
  /** The official AWS client for advanced middleware configuration. */
  raw: SQSClient;
  destroy(): void;
};

/**
 * Creates a direct-to-AWS SQS client.
 *
 * Authentication, AWS JSON 1.0 serialization, SigV4 and endpoint rules are all
 * delegated to the official `@aws-sdk/client-sqs` runtime. Credentials remain
 * in the caller's process and are never sent to Pontx.
 */
export function createAmazonSqsClient(config: AmazonSqsClientConfig = {}): AmazonSqsClient {
  const raw = new SQSClient(config);
  return Object.assign(createAmazonSqsActions(raw), {
    raw,
    destroy: () => raw.destroy(),
  });
}

export {
  amazonSqsActionNames,
  createAmazonSqsActions,
};
export type {
  AmazonSqsActionName,
  AmazonSqsActions,
} from "./generated/actions.js";
export {
  buildAmazonSqsPreview,
  AMAZON_SQS_CONFIRMATION_TTL_MS,
  classifyAmazonSqsAction,
  createAmazonSqsConfirmationToken,
  hasValidAmazonSqsConfirmation,
  isAmazonSqsActionName,
} from "./safety.js";
export type { AmazonSqsActionClass } from "./safety.js";

export default createAmazonSqsClient;
