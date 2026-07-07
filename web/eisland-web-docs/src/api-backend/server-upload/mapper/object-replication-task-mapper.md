---
title: ObjectReplicationTaskMapper
---

# ObjectReplicationTaskMapper

:::info
MyBatis mapper interface for cross-provider object replication task lifecycle management.
:::

## Overview

`ObjectReplicationTaskMapper` provides data access for the `object_replication_task` table, supporting task creation with deduplication, status transitions, DLQ replay, and attempt logging.

## Methods

| Method | Description | Returns |
|---|---|---|
| `insertIgnore(taskKey, bizType, bizId, bizKey, fieldName, objectKey, sourceProvider, targetProvider, sourceUrl, status, priority, maxRetries, nextRetryAt, createdAt, updatedAt)` | Insert task (dedup by taskKey) | Affected rows |
| `selectIdByTaskKey(taskKey)` | Look up task ID by dedup key | `Long` |
| `selectById(id)` | Full task record by ID | `Map<String, Object>` |
| `markRetrying(id, retryCount, nextRetryAt, lastError, updatedAt)` | Transition to retrying | Affected rows |
| `markSuccess(id, targetUrl, updatedAt, doneAt)` | Mark replication succeeded | Affected rows |
| `markDlq(id, retryCount, lastError, updatedAt, doneAt)` | Mark as dead-lettered | Affected rows |
| `listDlqTasks(limit)` | Query DLQ tasks for replay | `List<Map>` |
| `resetFromDlq(id, nextRetryAt, updatedAt)` | Reset DLQ task back to pending | Affected rows |
| `insertLog(taskId, traceId, attemptNo, status, durationMs, errorMessage, createdAt)` | Insert attempt log | Affected rows |

## Status Lifecycle

```
pending → success (replication completed)
pending → retrying (transient failure)
retrying → success (retry succeeded)
retrying → retrying (another failure)
retrying → dlq (max retries exceeded)
dlq → pending (manual or scheduled replay)
```

:::tip
`insertIgnore` uses the SHA-256 `taskKey` for deduplication, ensuring the same replication scenario is never enqueued twice.
:::
