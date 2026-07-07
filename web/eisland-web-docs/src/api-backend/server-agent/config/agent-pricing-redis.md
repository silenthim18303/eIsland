---
title: Agent Pricing Redis Config
---

# Agent Pricing Redis Config

:::info
Redis DB13 configuration for model pricing cache.
:::

## Configuration

| Property | Value |
|---|---|
| Database | DB 13 |
| Key Pattern | agent:pricing:{modelName} |
| Value Type | JSON string |
| TTL | 30 minutes |
| Purpose | Model pricing cache |

## Key Format

```
agent:pricing:deepseek-v4 → {"modelName":"deepseek-v4","inputPriceFenPerMillion":2,...}
```

## Cache Strategy

- Cache-aside pattern
- On miss: Read from MySQL, write to Redis with TTL
- On update: Evict cache, next read will refresh from DB

:::tip
The 30-minute TTL ensures pricing changes are eventually consistent.
:::
