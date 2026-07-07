---
title: VersionBloomRedisConfig
---

# VersionBloomRedisConfig

:::info
Redis configuration for the version module's bloom filter, used to prevent cache penetration on app version lookups.
:::

## Overview

`VersionBloomRedisConfig` provisions a dedicated `LettuceConnectionFactory` and `StringRedisTemplate` for the version bloom filter. The bloom filter uses Redis bitmaps to quickly reject non-existent `appName` values before hitting the database.

## Configuration

| Property | Value |
|---|---|
| Database | DB 0 (configurable via `REDIS_VERSION_BLOOM_DATABASE`) |
| Connection | Standalone Redis (host/port/password from global env) |

## Beans

| Bean | Type | Qualifier |
|---|---|---|
| Connection Factory | `LettuceConnectionFactory` | `versionBloomRedisConnectionFactory` |
| Redis Template | `StringRedisTemplate` | `versionBloomRedisTemplate` |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REDIS_HOST` | `127.0.0.1` | Redis server host |
| `REDIS_PORT` | `6379` | Redis server port |
| `REDIS_PASSWORD` | (empty) | Redis authentication password |
| `REDIS_VERSION_BLOOM_DATABASE` | `0` | Redis database number for bloom filter |

:::tip
The bloom filter is rebuilt from the database on application startup to ensure consistency.
:::
