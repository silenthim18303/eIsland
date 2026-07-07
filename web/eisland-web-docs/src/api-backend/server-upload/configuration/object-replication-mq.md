---
title: ObjectReplicationMqConfig
---

# ObjectReplicationMqConfig

:::info
RabbitMQ topology for cross-provider object replication with priority support, retry, and dead-letter queues.
:::

## Overview

`ObjectReplicationMqConfig` defines the MQ topology for the object replication pipeline. Messages carry priority (0-9) to prioritize critical replications. The retry queue uses configurable TTL for delayed redelivery.

## Exchange

| Property | Value |
|---|---|
| Name | `eisland.object.replication.exchange` |
| Type | Direct |
| Durable | Yes |
| Auto-delete | No |

## Queues

| Queue | Routing Key | Features | Description |
|---|---|---|---|
| `eisland.object.replication.process.queue` | `eisland.object.replication.process` | `x-max-priority: 10` | Main queue with priority support |
| `eisland.object.replication.retry.queue` | `eisland.object.replication.retry` | TTL + DLX back to main | Retry queue with delayed redelivery |
| `eisland.object.replication.dlq` | `eisland.object.replication.dlq` | Durable | Dead-letter queue |

## Configuration

| Property | Default | Description |
|---|---|---|
| `object-replication.retry-delay-ms` | `15000` | Retry queue message TTL |

## Message Flow

```
Outbox Relay → Main Queue (priority) → Consumer (success: ack)
                        ↓ (failure)
                  Retry Queue (TTL configurable)
                        ↓ (redeliver)
                  Main Queue → Consumer
                        ↓ (after max retries)
                      DLQ → markDlq on task
```

:::tip
The main queue supports RabbitMQ message priorities (0-9), allowing critical replications to be processed ahead of bulk backfill tasks.
:::
