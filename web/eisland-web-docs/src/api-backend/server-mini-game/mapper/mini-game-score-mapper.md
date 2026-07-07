---
title: MiniGameScoreMapper
---

# MiniGameScoreMapper

:::info
MyBatis mapper interface for mini-game high-score CRUD operations with atomic CAS upsert semantics.
:::

## Overview

`MiniGameScoreMapper` provides the data access layer for `mini_game_score`. The write path follows a three-step pattern inside `ScoreUpsertConsumer`: `insertIfAbsent` -> `updateBestIfGreater` -> `incrementPlaysCount`.

## Methods

| Method | Description | Returns |
|---|---|---|
| `selectByUserAndGame(userId, gameId)` | Query high-score record by user and game | `MiniGameScore` or null |
| `insertIfAbsent(score)` | Insert only if `(user_id, game_id)` does not exist (INSERT IGNORE) | 1 = inserted, 0 = already exists |
| `updateBestIfGreater(userId, gameId, highScore, bestDurationMs, bestMoves, achievedAt, updatedAt)` | Atomic CAS: update only when new score > current high_score | 1 = updated, 0 = no change |
| `incrementPlaysCount(userId, gameId, lastPlayedAt, updatedAt)` | Increment plays_count and refresh last_played_at | 1 = success, 0 = not found |
| `selectTopByGame(gameId, limit)` | Top-N records by high_score DESC for leaderboard backfill | `List<MiniGameScore>` |

## Write Flow

```
ScoreUpsertConsumer.onMessage()
  ├─ insertIfAbsent()      → first-time (user, game) pair
  ├─ updateBestIfGreater()  → atomic CAS for new high score
  └─ incrementPlaysCount()  → always called for non-new rows
```

:::tip
`updateBestIfGreater` uses a SQL `WHERE high_score < #{highScore}` clause to ensure atomic compare-and-swap without application-level locking.
:::
