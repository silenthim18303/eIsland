---
title: ToolboxSoftwareRedisConfig
---

# ToolboxSoftwareRedisConfig

:::info
Spring `@Configuration` that defines a dedicated Redis connection and `StringRedisTemplate` for toolbox software list caching (DB 0).
:::

## Overview

Provides an isolated Redis connection for caching the enabled toolbox software list. Used by `ToolboxSoftwareService` to avoid repeated database queries for the public software listing endpoint.

## Beans

| Bean Name | Type | Description |
|---|---|---|
| `toolboxSoftwareRedisConnectionFactory` | `LettuceConnectionFactory` | Redis connection factory |
| `toolboxSoftwareRedisTemplate` | `StringRedisTemplate` | Redis template for toolbox software caching |

## Configuration Properties

| Property | Env / YAML Key | Default | Description |
|---|---|---|---|
| Host | `REDIS_HOST` | `127.0.0.1` | Redis server hostname |
| Port | `REDIS_PORT` | `6379` | Redis server port |
| Password | `REDIS_PASSWORD` | (empty) | Redis authentication password |
| Database | `REDIS_TOOLBOX_SOFTWARE_DATABASE` | `0` | Redis DB index for toolbox software cache |
