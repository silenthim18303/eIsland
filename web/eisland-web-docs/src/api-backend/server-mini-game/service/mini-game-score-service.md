---
title: MiniGameScoreService
---

# MiniGameScoreService

:::info
Core business service for mini-game score submission, personal high-score queries, and leaderboard management.
:::

## Overview

`MiniGameScoreService` orchestrates the full score lifecycle: rate limiting, idempotency checks, input validation, server-side 2048 replay verification, MQ-based async persistence, and Redis-backed caching for personal scores and leaderboards.

## Submit Flow

1. **Validation** — gameId, submitId (UUID), score (1..999,999,999), durationMs, moves, achievedAt
2. **Rate Limiting** — Redis INCR+EXPIRE per (gameId, userId), configurable per-minute threshold
3. **Idempotency** — Redis SETNX on submitId (24h TTL); rejects duplicate submissions
4. **2048 Replay** — For `gameId=2048`: validates session, replays move trace with deterministic RNG, verifies score/moves/achievedAt match
5. **MQ Publish** — Sends `ScoreUpsertMessage` to the main queue for async DB persistence

## Query APIs

| Method | Source | Description |
|---|---|---|
| `getMyScore(userId, gameId)` | Redis cache → DB fallback | Returns personal high score with duration, moves, achievedAt |
| `getLeaderboard(gameId, limit)` | Redis ZSET → DB cold-start backfill | Returns top-N leaderboard with user metadata |
| `shouldRequireLeaderboardRefreshCaptcha(userId, gameId)` | Redis INCR | Returns true if user exceeded refresh threshold (5 per 60s) |

## Configuration

| Property | Default | Description |
|---|---|---|
| `mini-game.score.submit-rate-per-minute` | `10` | Max submissions per user per game per 60s window |
| `mini-game.score.leaderboard-top-n` | `200` | Maximum leaderboard entries |
| `mini-game.score.cache-ttl-seconds` | `3600` | TTL for personal high-score cache |
| `mini-game.score.session-ttl-seconds` | `21600` | TTL for 2048 game sessions |

## 2048 Replay Verification

For the 2048 game, the service performs full server-side replay:

- Validates `sessionId` exists in Redis (seed:startedAt)
- Replays `moveTrace` (L/R/U/D characters) with a deterministic PRNG seeded from the session
- Verifies final score, move count, and achievedAt match the submission
- Deletes the session after successful verification

:::warning
Redis failures during rate limiting and idempotency checks use fail-open semantics to avoid blocking legitimate submissions.
:::
