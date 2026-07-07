---
title: AgentModelPricing
---

# AgentModelPricing

:::info
Entity representing per-model pricing configuration for the Agent billing system.
:::

## Overview

Defines token-based pricing for each AI model used by the Agent feature. Prices are specified in fen (1/100 yuan) per million tokens, with separate rates for input, cached input, and output tokens.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Primary key |
| `modelName` | `String` | Model identifier (e.g., `gpt-4o`) |
| `inputPriceFenPerMillion` | `Long` | Input token price in fen per million tokens |
| `cachedInputPriceFenPerMillion` | `Long` | Cached input token price in fen per million tokens |
| `outputPriceFenPerMillion` | `Long` | Output token price in fen per million tokens |
| `enabled` | `Boolean` | Whether this pricing entry is active |
| `updatedAt` | `LocalDateTime` | Last modification timestamp |

## Database Table

Corresponds to `agent_model_pricing`.
