# @pontx/amazon-sqs

Type-safe Amazon SQS SDK and preview-first CLI generated from a pinned AWS
Smithy contract. This is a Pontx community SDK, not an AWS product.

The contract is fixed to AWS SDK for JavaScript v3 revision
`4efe5bc67b71dc5ec652fe77130f3bae9efe0173`, covers all 23 SQS actions, and
uses the official AWS SDK runtime for AWS JSON 1.0 serialization, SigV4
signing, credential-provider integration, and regional/FIPS/DualStack endpoint
rules. The same upstream service is also AWS Query-compatible for documented
direct HTTP calls; this SDK deliberately uses the official AWS JSON runtime.

## Status

Release candidate only. It is not published to npm and Amazon SQS is not yet a
Pontx Hub catalog API. The SDK mirrors the raw bytes of the canonical
`products/amazon-sqs/spec.pontx.json` from metadata commit
`d24224857ed1c87e7ba92ba333742d980e44c977`; its SHA-256 is
`47fe17acd3e47cf6ef7af669e9ec0e4b8bd308aaccff31ee5e15ee1c5b50687f`.
The public catalog will be updated only after the registry package, SDK/CLI
release evidence, and production verification are all complete.

## SDK

```ts
import { createAmazonSqsClient } from "@pontx/amazon-sqs";

const sqs = createAmazonSqsClient({ region: process.env.AWS_REGION });
const response = await sqs.sendMessage({
  QueueUrl: "https://sqs.us-east-1.amazonaws.com/123456789012/example",
  MessageBody: "hello",
});
```

AWS credentials stay in the caller's process and use the standard AWS SDK
provider chain. Pontx does not proxy, persist, or log them.

## CLI

```bash
pnpm exec pontx-amazon-sqs list apis
pnpm exec pontx-amazon-sqs preview SendMessage \
  --input '{"QueueUrl":"https://sqs.us-east-1.amazonaws.com/123456789012/example","MessageBody":"hello"}'
```

The preview redacts message bodies and credential-like keys. To run any action,
pass the exact preview's confirmation token to `call`; it is bound to the
action and input, and expires after five minutes. `ReceiveMessage` is shown as
a stateful read because it changes message visibility.

## Contract provenance

`contract/sqs.lock.json` records the immutable source URL, revision, SHA-256,
service, protocol, version, and complete action list. `pnpm contract:verify`
refetches and verifies it; `pnpm generate:check` rejects generated-action drift.

## License

Pontx code is MIT. See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for
the Apache-2.0 AWS SDK and source attribution.
