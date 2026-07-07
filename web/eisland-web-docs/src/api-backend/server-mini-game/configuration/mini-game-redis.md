---
title: MiniGameRedisConfig
---

# MiniGameRedisConfig

:::info
Dedicated Redis configuration for the mini-game domain (default DB14), isolating game keys from other business domains.
:::

## Overview

`MiniGameRedisConfig` provisions an independent `LettuceConnectionFactory` and `StringRedisTemplate` for the mini-game module. All mini-game keys share the prefix `mg:` and reside in a separate Redis database to avoid key collisions with the default DB0 or other business domains.

## Configuration

| Property | Value |
|---|---|
| Database | DB 14 (configurable via `mini-game.redis-database` or `REDIS_MINI_GAME_DATABASE`) |
| Key Prefix | `mg:` |
| Connection | Standalone Redis (host/port/password from global env) |

## Beans

| Bean | Type | Qualifier |
|---|---|---|
| Connection Factory | `LettuceConnectionFactory` | `miniGameRedisConnectionFactory` |
| Redis Template | `StringRedisTemplate` | `miniGameRedisTemplate` |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REDIS_HOST` | `127.0.0.1` | Redis server host |
| `REDIS_PORT` | `6379` | Redis server port |
| `REDIS_PASSWORD` | (empty) | Redis authentication password |
| `REDIS_MINI_GAME_DATABASE` | `14` | Redis database number for mini-game keys |

:::tip
The separate database ensures mini-game keys (`mg:*`) never collide with other modules sharing the same Redis instance.
:::
