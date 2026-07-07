---
title: AgentUsageStats
---

# AgentUsageStats

:::info
Entity aggregating global token usage and cost statistics per AI model for the Agent billing system.
:::

## Overview

Tracks cumulative usage across all users for each model. Updated via atomic `INSERT ... ON DUPLICATE KEY UPDATE` with delta values. Cost is stored in micro-fen (1 micro-fen = 0.00000001 fen) for precision.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Primary key |
| `modelName` | `String` | Model identifier |
| `totalInputTokens` | `Long` | Cumulative input tokens |
| `totalCachedTokens` | `Long` | Cumulative cached input tokens |
| `totalOutputTokens` | `Long` | Cumulative output tokens |
| `totalReasoningTokens` | `Long` | Cumulative reasoning tokens |
| `totalRequestCount` | `Long` | Cumulative request count |
| `totalCostMicroFen` | `Long` | Cumulative cost in micro-fen |
| `updatedAt` | `LocalDateTime` | Last update timestamp |

## Database Table

Corresponds to the `agent_usage_stats` table.
