---
title: ObjectOutboxRelayService
---

# ObjectOutboxRelayService

:::info
Scheduled relay service that polls the outbox table and publishes pending replication events to RabbitMQ.
:::

## Overview

`ObjectOutboxRelayService` implements the transactional outbox pattern. It periodically polls `object_outbox` for pending events, publishes `ObjectReplicationMessage` to the replication exchange with priority support, and manages retry/DLQ transitions for failed publishes.

## Scheduled Task

| Property | Default | Description |
|---|---|---|
| `object-replication.outbox-relay-interval-ms` | `3000` | Poll interval |
| `object-replication.outbox-relay-enabled` | `true` | Enable/disable relay |
| `object-replication.outbox-relay-batch-size` | `100` | Max events per poll |
| `object-replication.max-retries` | `6` | Max publish retries before DLQ |

## Processing Flow

```
Poll pending events → Parse payload → Publish to MQ with priority
    ├─ Success → markPublished
    ├─ Retryable error → markRetrying (with next retry timestamp)
    └─ Max retries exceeded → markDlq
```

## Event Types

Currently only processes `object.replication.publish` events. Unsupported event types are immediately routed to DLQ.

## Outbox Event Payload

| Field | Type | Description |
|---|---|---|
| `taskId` | `Long` | Replication task ID |
| `queuePriority` | `Integer` | MQ priority (0-9, normalized to 5 if null) |

:::warning
The relay uses an `AtomicBoolean` guard to prevent concurrent execution if the scheduled interval is shorter than processing time.
:::
