---
title: ToolboxTranslatePricingMapper
---

# ToolboxTranslatePricingMapper

:::info
MyBatis `@Mapper` interface for the translation service pricing configuration table.
:::

## Methods

| Method | Return | Description |
|---|---|---|
| `selectAll()` | `List<ToolboxTranslatePricing>` | List all pricing configurations |
| `selectByServiceName(serviceName)` | `ToolboxTranslatePricing` | Lookup by service name |
| `insert(pricing)` | `int` | Create new pricing entry |
| `updateByServiceName(serviceName, priceFenPerMillion, enabled, updatedAt)` | `int` | Update pricing by service name |
| `deleteByServiceName(serviceName)` | `int` | Delete pricing by service name |
