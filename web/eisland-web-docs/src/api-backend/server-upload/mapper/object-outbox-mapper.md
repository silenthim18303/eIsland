---
title: ObjectOutboxMapper
---

# ObjectOutboxMapper

:::info
MyBatis mapper interface for the transactional outbox table used by the object replication pipeline.
:::

## Overview

`ObjectOutboxMapper` provides data access for the `object_outbox` table. The outbox pattern ensures reliable message delivery: events are written to the outbox within the same transaction as the business operation, then relayed to RabbitMQ by `ObjectOutboxRelayService`.

## Methods

| Method | Description | Returns |
|---|---|---|
| `insertIgnore(eventType, eventKey, payloadJson, status, retryCount, nextRetryAt, lastError, createdAt, updatedAt)` | Insert event (dedup by eventKey) | Affected rows |
| `listPending(now, limit)` | Query pending events ready for relay | `List<Map>` |
| `markPublished(id, publishedAt, updatedAt)` | Mark event as published to MQ | Affected rows |
| `markRetrying(id, retryCount, nextRetryAt, lastError, updatedAt)` | Schedule retry with backoff | Affected rows |
| `markDlq(id, retryCount, lastError, updatedAt)` | Mark event as dead-lettered | Affected rows |

## Status Lifecycle

```
pending → published (success)
pending → retrying (transient error, retry count < max)
retrying → published (success on retry)
retrying → retrying (another failure)
retrying → dlq (max retries exceeded)
```

:::tip
The `eventKey` field provides deduplication — `insertIgnore` prevents duplicate outbox entries for the same logical event.
:::
