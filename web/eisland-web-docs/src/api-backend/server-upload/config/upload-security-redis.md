---
title: UploadSecurityRedisConfig
---

# UploadSecurityRedisConfig

:::info
Redis configuration for upload domain rate limiting and security policies (default DB7).
:::

## Overview

`UploadSecurityRedisConfig` provisions a dedicated `LettuceConnectionFactory` and `StringRedisTemplate` for the upload module's rate limiting keys. Upload rate limit counters are isolated in a separate Redis database.

## Configuration

| Property | Value |
|---|---|
| Database | DB 7 (configurable via `REDIS_UPLOAD_RATE_DATABASE` or `REDIS_UPLOAD_SECURITY_DATABASE`) |
| Connection | Standalone Redis (host/port/password from global env) |

## Beans

| Bean | Type | Qualifier |
|---|---|---|
| Connection Factory | `LettuceConnectionFactory` | `uploadSecurityRedisConnectionFactory` |
| Redis Template | `StringRedisTemplate` | `uploadSecurityRedisTemplate` |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REDIS_HOST` | `127.0.0.1` | Redis server host |
| `REDIS_PORT` | `6379` | Redis server port |
| `REDIS_PASSWORD` | (empty) | Redis authentication password |
| `REDIS_UPLOAD_RATE_DATABASE` | `7` | Redis database number for upload rate limiting |

:::tip
The database number supports two env var names for backward compatibility: `REDIS_UPLOAD_RATE_DATABASE` takes precedence over `REDIS_UPLOAD_SECURITY_DATABASE`.
:::
