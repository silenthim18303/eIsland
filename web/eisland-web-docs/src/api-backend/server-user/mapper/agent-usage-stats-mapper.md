---
title: AgentUsageStatsMapper
---

# AgentUsageStatsMapper

:::info
MyBatis `@Mapper` interface for the Agent global usage statistics table with atomic delta upserts.
:::

## Methods

| Method | Return | Description |
|---|---|---|
| `selectAll()` | `List<AgentUsageStats>` | List all model usage statistics |
| `selectByModelName(modelName)` | `AgentUsageStats` | Lookup by model name |
| `upsertDelta(modelName, deltaInputTokens, deltaCachedTokens, deltaOutputTokens, deltaReasoningTokens, deltaRequestCount, deltaCostMicroFen, updatedAt)` | `int` | Atomic increment via `INSERT ... ON DUPLICATE KEY UPDATE` |

## Upsert Behavior

The `upsertDelta` method uses MySQL's `INSERT ... ON DUPLICATE KEY UPDATE` pattern. All delta values are added atomically to the existing cumulative totals, ensuring concurrent requests are safely merged without race conditions.
