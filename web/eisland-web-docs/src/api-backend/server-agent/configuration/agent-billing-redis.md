---
title: Agent Billing Redis Config
---

# Agent Billing Redis Config

:::info
Redis DB12 configuration for agent billing balance cache.
:::

## Configuration

| Property | Value |
|---|---|
| Database | DB 12 |
| Key Pattern | agent:balance:{username} |
| Value Type | String (8 decimal places) |
| Purpose | User balance cache |

## Key Format

```
agent:balance:john_doe → "123.45678901"
```

## Operations

- **GET** — Read balance
- **SET** — Write balance (used by reconciliation job)
- **SETNX** — Initialize from DB (prevents overwrite)

:::warning
Balance values are stored as strings with 8 decimal places for precision.
:::
