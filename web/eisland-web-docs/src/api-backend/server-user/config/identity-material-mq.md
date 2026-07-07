---
title: IdentityMaterialMqConfig
---

# IdentityMaterialMqConfig

:::info
Spring `@Configuration` that declares the RabbitMQ exchange, queues, and bindings for asynchronous identity material (facial recognition photo) uploads.
:::

## Overview

Configures a durable `DirectExchange` with three queues: a main processing queue, a retry queue (with 10-second TTL dead-lettering back to the main queue), and a dead-letter queue (DLQ) for permanently failed messages.

## Constants

| Constant | Value | Description |
|---|---|---|
| `EXCHANGE` | `eisland.identity.material.exchange` | Direct exchange name |
| `QUEUE` | `eisland.identity.material.upload.queue` | Main processing queue |
| `ROUTING_KEY` | `eisland.identity.material.upload` | Main queue routing key |
| `RETRY_QUEUE` | `eisland.identity.material.upload.retry.queue` | Retry queue |
| `RETRY_ROUTING_KEY` | `eisland.identity.material.upload.retry` | Retry routing key |
| `DLQ` | `eisland.identity.material.upload.dlq` | Dead-letter queue |
| `DLQ_ROUTING_KEY` | `eisland.identity.material.upload.dlq` | DLQ routing key |
| `RETRY_HEADER` | `x-identity-material-retry-count` | Header tracking retry attempts |

## Retry Strategy

| Parameter | Value | Description |
|---|---|---|
| Retry Delay | 10,000 ms | TTL on retry queue before dead-lettering back to main |
| Max Retries | 3 | Enforced by the consumer (`IdentityMaterialUploadConsumer`) |

## Beans

- `identityMaterialExchange` -- durable, non-auto-delete `DirectExchange`
- `identityMaterialQueue` -- durable main queue
- `identityMaterialRetryQueue` -- durable retry queue with TTL and DLX
- `identityMaterialDlqQueue` -- durable dead-letter queue
- Three `Binding` beans wiring exchange to queues
