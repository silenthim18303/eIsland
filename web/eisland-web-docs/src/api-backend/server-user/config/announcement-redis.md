---
title: AnnouncementRedisConfig
---

# AnnouncementRedisConfig

:::info
Spring `@Configuration` that defines a dedicated Redis connection and `StringRedisTemplate` for announcement caching (default DB 0).
:::

## Overview

Provides an isolated Redis connection factory and template bean for the announcement subsystem. Uses Lettuce standalone mode with configurable host, port, password, and database index.

## Beans

| Bean Name | Type | Description |
|---|---|---|
| `announcementRedisConnectionFactory` | `LettuceConnectionFactory` | Redis connection factory |
| `announcementRedisTemplate` | `StringRedisTemplate` | Redis template for announcement operations |

## Configuration Properties

| Property | Env / YAML Key | Default | Description |
|---|---|---|---|
| Host | `REDIS_HOST` | `127.0.0.1` | Redis server hostname |
| Port | `REDIS_PORT` | `6379` | Redis server port |
| Password | `REDIS_PASSWORD` | (empty) | Redis authentication password |
| Database | `REDIS_ANNOUNCEMENT_DATABASE` | `0` | Redis DB index for announcements |
