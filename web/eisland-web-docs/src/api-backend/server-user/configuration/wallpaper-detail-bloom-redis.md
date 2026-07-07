---
title: WallpaperDetailBloomRedisConfig
---

# WallpaperDetailBloomRedisConfig

:::info
Spring `@Configuration` that defines a dedicated Redis connection and `StringRedisTemplate` for the wallpaper detail ID bloom filter (DB 3).
:::

## Overview

Provides an isolated Redis connection for the wallpaper detail bloom filter. Used by `WallpaperDetailBloomService` to pre-filter invalid wallpaper IDs before hitting the database, reducing cache-miss pressure from random or fabricated IDs.

## Beans

| Bean Name | Type | Description |
|---|---|---|
| `wallpaperDetailBloomRedisConnectionFactory` | `LettuceConnectionFactory` | Redis connection factory |
| `wallpaperDetailBloomRedisTemplate` | `StringRedisTemplate` | Redis template for wallpaper detail bloom filter |

## Configuration Properties

| Property | Env / YAML Key | Default | Description |
|---|---|---|---|
| Host | `REDIS_HOST` | `127.0.0.1` | Redis server hostname |
| Port | `REDIS_PORT` | `6379` | Redis server port |
| Password | `REDIS_PASSWORD` | (empty) | Redis authentication password |
| Database | `REDIS_WALLPAPER_DETAIL_BLOOM_DATABASE` | `3` | Redis DB index; falls back to `REDIS_WALLPAPER_DATABASE` |
