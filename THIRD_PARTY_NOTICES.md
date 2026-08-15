# Third-party notices

`@pontx/amazon-sqs` delegates HTTP serialization, AWS Signature Version 4,
credential-provider integration, retries, and AWS partition/FIPS/DualStack
endpoint rules to `@aws-sdk/client-sqs@3.1111.0`, licensed under Apache-2.0.

The generated Pontx action surface is derived from the pinned Apache-2.0 AWS
Smithy source recorded in `contract/sqs.lock.json`, and its canonical
`contract/spec.pontx.json` is a byte-for-byte mirror of
`pontjs/pontx-api-metadata` commit
`d24224857ed1c87e7ba92ba333742d980e44c977`. The upstream Apache-2.0 license
is retained verbatim at `contract/LICENSE.aws-sdk-js-v3`.

Amazon Web Services, AWS, and Amazon SQS are trademarks of Amazon.com, Inc. or
its affiliates. This independent Pontx package is not an AWS SDK or AWS product.
