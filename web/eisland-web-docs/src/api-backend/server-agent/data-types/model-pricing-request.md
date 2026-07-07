---
title: ModelPricingRequest
---

# ModelPricingRequest

:::info
Request DTO for upserting model pricing.
:::

## Definition

:::details Source — `AgentAdminController.java`
```java
public record ModelPricingRequest(
    String modelName,
    long inputPriceFenPerMillion,
    long cachedInputPriceFenPerMillion,
    long outputPriceFenPerMillion,
    boolean enabled
) {}
```
:::

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `modelName` | String | Yes | Model identifier |
| `inputPriceFenPerMillion` | Long | Yes | Input price (fen per 1M tokens) |
| `cachedInputPriceFenPerMillion` | Long | Yes | Cached input price (fen per 1M tokens) |
| `outputPriceFenPerMillion` | Long | Yes | Output price (fen per 1M tokens) |
| `enabled` | Boolean | Yes | Whether the model is active |

## Used By

- `PUT /v1/admin/agent/model-pricing` — [Upsert Model Pricing](../admin-agent-api/upsert-model-pricing.md)
