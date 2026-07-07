---
title: UploadRateRedisConfig
---

# UploadRateRedisConfig

:::info
Spring `@Configuration` that defines a dedicated Redis connection and `StringRedisTemplate` for user-domain upload rate limiting (DB 7).
:::

## Overview

Provides an isolated Redis connection for upload rate limiting across the user module. Used by `WallpaperMarketService` to enforce per-user upload and action frequency limits.

## Beans

| Bean Name | Type | Description |
|---|---|---|
| `uploadRateRedisConnectionFactory` | `LettuceConnectionFactory` | Redis connection factory |
| `uploadRateRedisTemplate` | `StringRedisTemplate` | Redis template for upload rate limiting |

## Configuration Properties

| Property | Env / YAML Key | Default | Description |
|---|---|---|---|
| Host | `REDIS_HOST` | `127.0.0.1` | Redis server hostname |
| Port | `REDIS_PORT` | `6379` | Redis server port |
| Password | `REDIS_PASSWORD` | (empty) | Redis authentication password |
| Database | `REDIS_UPLOAD_RATE_DATABASE` | `7` | Redis DB index; falls back to `REDIS_UPLOAD_SECURITY_DATABASE` |
