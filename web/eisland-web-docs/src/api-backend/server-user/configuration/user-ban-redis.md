---
title: UserBanRedisConfig
---

# UserBanRedisConfig

:::info
Spring `@Configuration` that defines a dedicated Redis connection and `StringRedisTemplate` for the user ban bloom filter (DB 9).
:::

## Overview

Provides an isolated Redis connection for the user ban subsystem. Used by `UserBanBloomService` to store bloom filter bitmaps and the exact ban set.

## Beans

| Bean Name | Type | Description |
|---|---|---|
| `userBanRedisConnectionFactory` | `LettuceConnectionFactory` | Redis connection factory |
| `userBanRedisTemplate` | `StringRedisTemplate` | Redis template for user ban operations |

## Configuration Properties

| Property | Env / YAML Key | Default | Description |
|---|---|---|---|
| Host | `REDIS_HOST` | `127.0.0.1` | Redis server hostname |
| Port | `REDIS_PORT` | `6379` | Redis server port |
| Password | `REDIS_PASSWORD` | (empty) | Redis authentication password |
| Database | `REDIS_USER_BAN_DATABASE` | `9` | Redis DB index for user ban bloom filter |
