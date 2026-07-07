---
title: Agent Billing Redis Config
---

# Agent Billing Redis Config

:::info
Dedicated Redis configuration for the agent billing domain. Uses a separate Redis database (DB 12) for billing balance caching.
:::

## Class

`AgentBillingRedisConfig` — `@Configuration`

## Connection

| Property | Env Variable | Default | Description |
|---|---|---|---|
| `REDIS_HOST` | `REDIS_HOST` | `127.0.0.1` | Redis host |
| `REDIS_PORT` | `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | `REDIS_PASSWORD` | (empty) | Redis password |
| `agent.billing.redis-database` | `REDIS_AGENT_BILLING_DATABASE` | `12` | Redis DB number |

## Beans

| Bean | Type | Description |
|---|---|---|
| `agentBillingRedisConnectionFactory` | `LettuceConnectionFactory` | Standalone Lettuce connection |
| `agentBillingRedisTemplate` | `StringRedisTemplate` | Redis template for billing operations |

## Key Patterns

| Pattern | Description |
|---|---|
| `agent:balance:{username}` | User balance cache (BigDecimal, 8 decimal places) |

:::warning
This config uses a standalone connection (not shared with other Redis configs). Do not confuse with DB 13 (pricing/usage).
:::

## Source

- `AgentBillingRedisConfig.java`
