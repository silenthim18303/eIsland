---
title: Server Mini Game
icon: gamepad
---

# Server Mini Game

:::info
The `server-mini-game` module handles mini-game score management, leaderboards, and session tracking.
:::

## Overview

The server-mini-game module provides game-related services:

- **Score Management** — Submit and track game scores
- **Leaderboards** — Global and per-game leaderboards
- **Session Tracking** — Game session management

:::tip
All endpoints require JWT authentication with USER, PRO, or ADMIN role.
:::

## Module Structure

| Layer | Description |
|---|---|
| [Mini Game Score API](./mini-game-score-api/) | Game score and leaderboard endpoints |
