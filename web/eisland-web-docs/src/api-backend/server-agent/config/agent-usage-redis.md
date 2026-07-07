---
title: Agent Usage Redis Config
---

# Agent Usage Redis Config

:::info
Redis DB13 configuration for usage statistics.
:::

## Configuration

| Property | Value |
|---|---|
| Database | DB 13 |
| Key Pattern | agent:usage:{modelName} |
| Value Type | Hash |
| Purpose | Per-model usage statistics |

## Hash Fields

| Field | Type | Description |
|---|---|---|
| inputTokens | long | Total input tokens |
| cachedTokens | long | Total cached tokens |
| outputTokens | long | Total output tokens |
| reasoningTokens | long | Total reasoning tokens |
| requestCount | long | Total request count |
| costMicroFen | long | Total cost (micro-fen) |

## Model Tracking

All recorded model names are stored in a Set:
- Key: `agent:usage:__models__`
- Used to enumerate all models for statistics queries
