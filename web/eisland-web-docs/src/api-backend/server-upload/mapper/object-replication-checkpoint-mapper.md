---
title: ObjectReplicationCheckpointMapper
---

# ObjectReplicationCheckpointMapper

:::info
MyBatis mapper interface for tracking backfill migration progress via checkpoint records.
:::

## Overview

`ObjectReplicationCheckpointMapper` provides data access for the `object_replication_checkpoint` table. Each checkpoint tracks the progress of a backfill scope (e.g., user avatars, wallpaper assets), enabling resumable batch processing.

## Methods

| Method | Description | Returns |
|---|---|---|
| `insertIgnore(checkpointKey, lastId, status, lastError, doneAt, createdAt, updatedAt)` | Initialize checkpoint if not exists | Affected rows |
| `selectByKey(checkpointKey)` | Query checkpoint by key | `Map<String, Object>` |
| `markRunning(checkpointKey, lastId, lastError, updatedAt)` | Update progress during scanning | Affected rows |
| `markDone(checkpointKey, lastId, lastError, doneAt, updatedAt)` | Mark backfill scope as complete | Affected rows |

## Status Values

| Status | Description |
|---|---|
| `pending` | Initial state, not yet started |
| `running` | Actively scanning and enqueuing |
| `done` | All rows processed, no more data |

:::tip
Checkpoints enable crash-resilient backfilling — on restart, the service resumes from `lastId` rather than re-scanning from the beginning.
:::
