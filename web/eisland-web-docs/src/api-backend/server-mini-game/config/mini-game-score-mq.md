---
title: MiniGameScoreMqConfig
---

# MiniGameScoreMqConfig

:::info
RabbitMQ topology for asynchronous mini-game high-score persistence with retry and dead-letter support.
:::

## Overview

`MiniGameScoreMqConfig` defines the four-queue MQ topology for the mini-game score upsert pipeline: a main queue, a retry queue with TTL-based delayed redelivery, and a dead-letter queue (DLQ) for messages that exceed the retry limit.

## Exchange

| Property | Value |
|---|---|
| Name | `eisland.mini-game.exchange` |
| Type | Direct |
| Durable | Yes |
| Auto-delete | No |

## Queues

| Queue | Routing Key | Description |
|---|---|---|
| `eisland.mini-game.score.upsert.queue` | `eisland.mini-game.score.upsert` | Main queue consumed by `ScoreUpsertConsumer` |
| `eisland.mini-game.score.upsert.retry.queue` | `eisland.mini-game.score.upsert.retry` | Retry queue (TTL 15s, dead-letters back to main) |
| `eisland.mini-game.score.upsert.dlq` | `eisland.mini-game.score.upsert.dlq` | Dead-letter queue for permanently failed messages |

## Retry Policy

| Property | Value |
|---|---|
| Max Retries | 5 |
| Retry Delay | 15,000 ms |
| Retry Header | `x-mini-game-score-retry-count` |

## Message Flow

```
Producer → Main Queue → Consumer (success: ack)
                ↓ (failure)
          Retry Queue (TTL 15s)
                ↓ (redeliver)
          Main Queue → Consumer
                ↓ (after 5 retries)
              DLQ → ScoreUpsertDlqConsumer → mini_game_score_dlq_log
```

:::warning
Retry count is tracked via a custom message header (`x-mini-game-score-retry-count`) rather than RabbitMQ's built-in `x-death` header for cross-version compatibility.
:::
