---
title: TotpSecurityRedisConfig
---

# TotpSecurityRedisConfig

:::info
Spring `@Configuration` that defines a dedicated Redis connection and `StringRedisTemplate` for TOTP security operations (DB 5).
:::

## Overview

Provides an isolated Redis connection for the TOTP (Time-based One-Time Password) subsystem. Used by `TotpSecurityService` for rate limiting, failure lockouts, replay protection, and secret caching.

## Beans

| Bean Name | Type | Description |
|---|---|---|
| `totpSecurityRedisConnectionFactory` | `LettuceConnectionFactory` | Redis connection factory |
| `totpSecurityRedisTemplate` | `StringRedisTemplate` | Redis template for TOTP security operations |

## Configuration Properties

| Property | Env / YAML Key | Default | Description |
|---|---|---|---|
| Host | `REDIS_HOST` | `127.0.0.1` | Redis server hostname |
| Port | `REDIS_PORT` | `6379` | Redis server port |
| Password | `REDIS_PASSWORD` | (empty) | Redis authentication password |
| Database | `REDIS_TOTP_DATABASE` | `5` | Redis DB index for TOTP security |
