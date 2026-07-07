---
title: MiniGameScore
---

# MiniGameScore

:::info
Persistent entity representing a user's high-score record for a specific mini-game.
:::

## Overview

`MiniGameScore` maps to the `mini_game_score` table. Each row tracks a user's best performance for a single game, identified by the unique key `(user_id, game_id)`.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Primary key |
| `userId` | `Long` | User ID |
| `gameId` | `String` | Game identifier (e.g. `"2048"`) |
| `highScore` | `Long` | All-time highest score |
| `bestDurationMs` | `Long` | Duration (ms) of the best-scoring run |
| `bestMoves` | `Integer` | Move count of the best-scoring run |
| `playsCount` | `Long` | Total number of plays |
| `lastPlayedAt` | `LocalDateTime` | Timestamp of the most recent play |
| `achievedAt` | `LocalDateTime` | When the high score was achieved |
| `createdAt` | `LocalDateTime` | Record creation timestamp |
| `updatedAt` | `LocalDateTime` | Last update timestamp |

## Unique Constraint

```
uk_mini_game_score_user_game (user_id, game_id)
```

:::tip
The upsert pattern uses `INSERT IGNORE` for first-time records and atomic CAS (`UPDATE ... WHERE high_score < ?`) for new high scores.
:::
