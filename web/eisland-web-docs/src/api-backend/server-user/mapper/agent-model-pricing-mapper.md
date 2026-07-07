---
title: AgentModelPricingMapper
---

# AgentModelPricingMapper

:::info
MyBatis `@Mapper` interface for the Agent model pricing configuration table.
:::

## Methods

| Method | Return | Description |
|---|---|---|
| `selectAll()` | `List<AgentModelPricing>` | List all pricing configurations |
| `selectByModelName(modelName)` | `AgentModelPricing` | Lookup by model name |
| `insert(pricing)` | `int` | Create new pricing entry |
| `updateByModelName(modelName, inputPriceFenPerMillion, cachedInputPriceFenPerMillion, outputPriceFenPerMillion, enabled, updatedAt)` | `int` | Update pricing by model name |
| `deleteByModelName(modelName)` | `int` | Delete pricing by model name |
