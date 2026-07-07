---
title: ScoreUpsertProducer
---

# ScoreUpsertProducer

:::info
RabbitMQ producer that publishes validated score submissions to the mini-game upsert queue.
:::

## Overview

`ScoreUpsertProducer` is called by `MiniGameScoreService` after a submission passes rate limiting, idempotency, and validation checks. It publishes a `ScoreUpsertMessage` to the main queue via `RabbitTemplate`.

## Method

| Method | Description |
|---|---|
| `publish(ScoreUpsertMessage)` | Sends the message to `eisland.mini-game.exchange` with routing key `eisland.mini-game.score.upsert` |

## ScoreUpsertMessage Fields

| Field | Type | Description |
|---|---|---|
| `submitId` | `String` | Client-generated UUID idempotency key |
| `userId` | `Long` | User ID (from JWT) |
| `gameId` | `String` | Game identifier (e.g. `"2048"`) |
| `score` | `long` | Score achieved |
| `durationMs` | `long` | Game duration in milliseconds |
| `moves` | `int` | Number of moves |
| `achievedAt` | `long` | Client-side achievement timestamp (epoch ms) |
| `clientVersion` | `String` | Client version for debugging |
| `traceId` | `String` | Distributed trace ID |
| `lastError` | `String` | Error from previous retry attempt (null on first send) |

:::tip
The `lastError` field is null on initial publish and populated by the consumer when routing to retry/DLQ queues.
:::
