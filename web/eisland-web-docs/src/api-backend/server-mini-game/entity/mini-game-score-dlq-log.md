---
title: MiniGameScoreDlqLog
---

# MiniGameScoreDlqLog

:::info
Persistent entity for dead-letter queue records when score upsert messages exhaust all retries.
:::

## Overview

`MiniGameScoreDlqLog` maps to the `mini_game_score_dlq_log` table. When a `ScoreUpsertMessage` fails after the maximum retry count (5), the consumer inserts a DLQ record for manual investigation and resolution.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Primary key |
| `submitId` | `String` | Client-generated idempotency key (UUID) |
| `userId` | `Long` | User ID |
| `gameId` | `String` | Game identifier |
| `score` | `Long` | Submitted score |
| `durationMs` | `Long` | Game duration in milliseconds |
| `moves` | `Integer` | Move count |
| `retryCount` | `Integer` | Number of retries attempted before DLQ |
| `lastError` | `String` | Error message from the last failed attempt |
| `payloadJson` | `String` | Full serialized message JSON for debugging |
| `status` | `String` | Resolution status (initially `"pending"`) |
| `resolvedBy` | `String` | Admin who resolved the record |
| `resolvedAt` | `LocalDateTime` | When the record was resolved |
| `createdAt` | `LocalDateTime` | Record creation timestamp |

## Unique Constraint

```
uk_submit_id (submit_id)
```

:::warning
A duplicate `submitId` on insert throws `DuplicateKeyException` — the consumer logs and discards the message in this case.
:::
