---
title: MiniGameScoreDlqLogMapper
---

# MiniGameScoreDlqLogMapper

:::info
MyBatis mapper interface for persisting dead-letter queue records from failed score upsert messages.
:::

## Overview

`MiniGameScoreDlqLogMapper` provides write access to the `mini_game_score_dlq_log` table. Currently only exposes an insert method; select/update operations will be added when an admin resolution API is implemented.

## Methods

| Method | Description | Returns |
|---|---|---|
| `insert(log)` | Insert a new DLQ record. Duplicate `submitId` throws `DuplicateKeyException`. | Affected rows |

:::warning
The `submit_id` unique constraint means duplicate DLQ entries for the same submission are rejected. The consumer catches and logs the exception to avoid infinite retry loops.
:::
