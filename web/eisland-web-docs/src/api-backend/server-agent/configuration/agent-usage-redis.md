---
title: Agent Usage Redis Config
---

# Agent Usage Redis Config

:::info
Dedicated Redis configuration for agent usage statistics. Uses Redis DB 13 (shared with pricing).
:::

## Class

`AgentUsageRedisConfig` — `@Configuration`

## Connection

| Property | Env Variable | Default | Description |
|---|---|---|---|
| `REDIS_HOST` | `REDIS_HOST` | `127.0.0.1` | Redis host |
| `REDIS_PORT` | `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | `REDIS_PASSWORD` | (empty) | Redis password |
| `agent.usage.redis-database` | `REDIS_AGENT_USAGE_DATABASE` | `13` | Redis DB number |

## Beans

| Bean | Type | Description |
|---|---|---|
| `agentUsageRedisConnectionFactory` | `LettuceConnectionFactory` | Standalone Lettuce connection |
| `agentUsageRedisTemplate` | `StringRedisTemplate` | Redis template for usage operations |

## Key Patterns

| Pattern | Data Structure | Description |
|---|---|---|
| `agent:usage:stats` | Hash | Per-model usage counters (input/cached/output/reasoning tokens, cost) |

:::tip
Usage stats are atomically incremented via Redis HINCRBY and periodically persisted to MySQL by `AgentUsageStatsConsumer`.
:::

## Source

- `AgentUsageRedisConfig.java`
- `AgentUsageStatsRedisService.java`
