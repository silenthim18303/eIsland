---
title: Mini Game Score API
---

# Mini Game Score API

:::info
Mini-game score management endpoints under `/v1/mini-game/score/`. Requires JWT authentication with USER, PRO, or ADMIN role.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /v1/mini-game/score/{gameId}/submit | Submit game score |
| POST | /v1/mini-game/score/{gameId}/session/start | Start game session |
| GET | /v1/mini-game/score/{gameId}/my | Get user's score |
| GET | /v1/mini-game/score/{gameId}/leaderboard | Get game leaderboard |
| POST | /v1/mini-game/score/{gameId}/leaderboard/refresh-check | Check leaderboard refresh |

:::tip
Start a session before submitting scores to ensure proper tracking and validation.
:::
