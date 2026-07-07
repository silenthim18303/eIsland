---
title: ObjectReplicationConsumer
---

# ObjectReplicationConsumer

:::info
RabbitMQ consumer that processes cross-provider object replication tasks with retry and dead-letter support.
:::

## Overview

`ObjectReplicationConsumer` listens on the main replication queue and DLQ. The main listener delegates task processing to `ObjectReplicationTaskService`, handling success/failure routing. The DLQ listener marks tasks as dead-lettered and records attempt logs.

## Main Queue Processing (`onMessage`)

1. Validate message (taskId must be positive)
2. Delegate to `ObjectReplicationTaskService.processTask(taskId, traceId, attemptNo)`
3. On success: log and ack
4. On failure: route to retry or DLQ based on retry count

## DLQ Processing (`onDeadLetter`)

- Marks the task as DLQ via `markDlq`
- Records attempt log with `"dlq"` status
- Logs the entry at ERROR level

## Retry Routing

| Condition | Action |
|---|---|
| `currentRetry < allowedRetries` | Route to retry queue with incremented header; mark task as retrying |
| `currentRetry >= allowedRetries` | Route to DLQ; mark task as dead-lettered |

## Configuration

| Property | Default | Description |
|---|---|---|
| `object-replication.max-retries` | `6` | Default max retries (overridable per-task via `maxRetries` field) |
| `object-replication.retry-delay-ms` | `15000` | Delay before retry redelivery |

## ObjectReplicationMessage

| Field | Type | Description |
|---|---|---|
| `taskId` | `Long` | Replication task ID |
| `traceId` | `String` | Distributed trace ID (auto-generated if blank) |
| `lastError` | `String` | Error from previous attempt |

:::warning
The consumer respects per-task `maxRetries` from the database, falling back to the global `object-replication.max-retries` configuration.
:::
