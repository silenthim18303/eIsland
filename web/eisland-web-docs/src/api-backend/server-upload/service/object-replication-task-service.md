---
title: ObjectReplicationTaskService
---

# ObjectReplicationTaskService

:::info
Core service for managing cross-provider object replication tasks: enqueue, process, retry, DLQ, and replay.
:::

## Overview

`ObjectReplicationTaskService` orchestrates object replication across storage providers. After a file is uploaded to one provider, this service creates replication tasks for all other providers, fetches the source object via HTTP, and uploads it to the target. Tasks are tracked with SHA-256 deduplication keys.

## Methods

| Method | Description |
|---|---|
| `enqueueForOtherProviders(bizType, bizId, bizKey, fieldName, sourceUploadResult, priority)` | Create replication tasks for all providers except the source |
| `processTask(taskId, traceId, attemptNo)` | Fetch source object and upload to target provider |
| `markRetrying(taskId, retryCount, nextRetryAt, errorMessage)` | Mark task as retrying |
| `markDlq(taskId, retryCount, errorMessage)` | Mark task as dead-lettered |
| `replayDlqTasks(batchSize)` | Reset DLQ tasks back to pending for re-processing |
| `recordAttemptLog(taskId, traceId, attemptNo, status, durationMs, errorMessage)` | Insert attempt log entry |

## Task Processing Flow

```
processTask(taskId)
  ├─ Fetch source object via HTTP (from sourceUrl)
  ├─ Upload to target provider via ObjectStorageRouter
  ├─ Success → markSuccess + insert log
  └─ Failure → insert log (caller handles retry/DLQ)
```

## Task Key Deduplication

Tasks are deduplicated by a SHA-256 hash of:
```
bizType|bizId|bizKey|fieldName|objectKey|sourceProvider|targetProvider
```

INSERT IGNORE prevents duplicate tasks for the same replication scenario.

## Configuration

| Property | Default | Description |
|---|---|---|
| `object-replication.enabled` | `true` | Enable/disable replication |
| `object-replication.max-retries` | `6` | Max retry attempts |
| `object-replication.source-fetch-timeout-ms` | `60000` | HTTP timeout for source object fetch |

:::tip
The `enqueueForOtherProviders` method is transactional — all target tasks and outbox events are created atomically.
:::
