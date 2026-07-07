---
title: ScoreUpsertConsumer
---

# ScoreUpsertConsumer

:::info
RabbitMQ consumer that asynchronously persists mini-game high scores to MySQL with Redis-backed idempotency, locking, and cache synchronization.
:::

## Overview

`ScoreUpsertConsumer` listens on the main queue and DLQ. The main listener performs field validation, idempotency dedup, mutex locking, DB upsert, and Redis cache sync. The DLQ listener persists permanently failed messages to `mini_game_score_dlq_log`.

## Main Queue Processing (`onMessage`)

1. **Validation** — Rejects messages with invalid/missing fields (ack and drop)
2. **Idempotency** — Redis SETNX on `mg:score:consume:idempotency:{submitId}` (24h TTL); stale-key recovery if no DB row exists
3. **Mutex Lock** — Redis SETNX on `mg:score:lock:{gameId}:{userId}` (configurable TTL); contention triggers retry routing
4. **DB Upsert** — `insertIfAbsent` -> `updateBestIfGreater` -> `incrementPlaysCount`
5. **Cache Sync** (new best only) — Updates `mg:score:high:*`, `mg:score:user-meta:*` HASH, and `mg:score:leaderboard:*` ZSET; trims ZSET to top-N

## DLQ Processing (`onDeadLetter`)

- Inserts a `MiniGameScoreDlqLog` record with full payload JSON
- Logs the entry; insert failures are caught to avoid infinite loops

## Retry Routing

| Condition | Action |
|---|---|
| DB exception | Delete idempotency key + release lock + route to retry/DLQ |
| Lock contention | Delete idempotency key + route to retry/DLQ |
| Retry count < 5 | Route to retry queue (15s TTL) |
| Retry count >= 5 | Route to DLQ |

## Configuration

| Property | Default | Description |
|---|---|---|
| `mini-game.score.cache-ttl-seconds` | `3600` | TTL for high-score and user-meta cache |
| `mini-game.score.lock-ttl-seconds` | `10` | Mutex lock TTL |
| `mini-game.score.leaderboard-top-n` | `200` | Maximum ZSET members retained |

:::warning
Cache sync failures are non-fatal (logged as WARN). The cache self-heals on the next read via DB fallback.
:::
