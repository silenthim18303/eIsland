---
title: QWeatherRedisConfig
---

# QWeatherRedisConfig

:::info
Redis configuration for QWeather API response caching (default DB11).
:::

## Overview

`QWeatherRedisConfig` provisions a dedicated `LettuceConnectionFactory` and `StringRedisTemplate` for the QWeather module. Cached API responses (forecasts, alerts, city lookups) and monthly quota counters are stored in a separate Redis database.

## Configuration

| Property | Value |
|---|---|
| Database | DB 11 (configurable via `REDIS_QWEATHER_DATABASE`) |
| Connection | Standalone Redis (host/port/password from global env) |

## Beans

| Bean | Type | Qualifier |
|---|---|---|
| Connection Factory | `LettuceConnectionFactory` | `qweatherRedisConnectionFactory` |
| Redis Template | `StringRedisTemplate` | `qweatherRedisTemplate` |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REDIS_HOST` | `127.0.0.1` | Redis server host |
| `REDIS_PORT` | `6379` | Redis server port |
| `REDIS_PASSWORD` | (empty) | Redis authentication password |
| `REDIS_QWEATHER_DATABASE` | `11` | Redis database number for QWeather cache |

:::tip
The separate database isolates weather cache keys from other modules, allowing independent eviction and monitoring.
:::
