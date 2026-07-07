---
title: Agent Pricing Redis Config
---

# Agent Pricing Redis Config

:::info
Dedicated Redis configuration for agent model pricing cache. Uses Redis DB 13.
:::

## Class

`AgentPricingRedisConfig` — `@Configuration`

## Connection

| Property | Env Variable | Default | Description |
|---|---|---|---|
| `REDIS_HOST` | `REDIS_HOST` | `127.0.0.1` | Redis host |
| `REDIS_PORT` | `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | `REDIS_PASSWORD` | (empty) | Redis password |
| `agent.pricing.redis-database` | `REDIS_AGENT_PRICING_DATABASE` | `13` | Redis DB number |

## Beans

| Bean | Type | Description |
|---|---|---|
| `agentPricingRedisConnectionFactory` | `LettuceConnectionFactory` | Standalone Lettuce connection |
| `agentPricingRedisTemplate` | `StringRedisTemplate` | Redis template for pricing operations |

## Key Patterns

| Pattern | Description |
|---|---|
| `agent:pricing:{modelName}` | Model pricing cache (JSON) |

:::note
DB 13 is shared between pricing and usage statistics. Both configs create separate connection factories.
:::

## Source

- `AgentPricingRedisConfig.java`
