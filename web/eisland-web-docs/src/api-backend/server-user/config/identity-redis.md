---
title: IdentityRedisConfig
---

# IdentityRedisConfig

:::info
Spring `@Configuration` that defines a dedicated Redis connection and `StringRedisTemplate` for identity verification rate limiting and verified-status caching (DB 2).
:::

## Overview

Provides an isolated Redis connection for the identity verification subsystem. Used by `IdentityVerificationService` for per-user rate limiting of verification attempts and caching of verified status.

## Beans

| Bean Name | Type | Description |
|---|---|---|
| `identityRedisConnectionFactory` | `LettuceConnectionFactory` | Redis connection factory |
| `identityRedisTemplate` | `StringRedisTemplate` | Redis template for identity operations |

## Configuration Properties

| Property | Env / YAML Key | Default | Description |
|---|---|---|---|
| Host | `REDIS_HOST` | `127.0.0.1` | Redis server hostname |
| Port | `REDIS_PORT` | `6379` | Redis server port |
| Password | `REDIS_PASSWORD` | (empty) | Redis authentication password |
| Database | `REDIS_IDENTITY_DATABASE` | `2` | Redis DB index for identity operations |
