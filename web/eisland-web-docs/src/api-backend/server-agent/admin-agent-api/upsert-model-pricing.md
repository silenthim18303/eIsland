---
title: Upsert Model Pricing
---

# PUT /v1/admin/agent/model-pricing

:::info
Creates or updates an AI model pricing entry. Requires `ROLE_ADMIN`.
:::

## Request

**Method:** `PUT`
**Path:** `/v1/admin/agent/model-pricing`
**Content-Type:** `application/json`
**Authentication:** Required (JWT with `ROLE_ADMIN`)

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `modelName` | String | Yes | Model identifier |
| `inputPriceFenPerMillion` | Long | Yes | Input price (fen per 1M tokens) |
| `cachedInputPriceFenPerMillion` | Long | Yes | Cached input price (fen per 1M tokens) |
| `outputPriceFenPerMillion` | Long | Yes | Output price (fen per 1M tokens) |
| `enabled` | Boolean | Yes | Whether the model is active |

## Response

```json
{
  "code": 200,
  "message": "success"
}
```

:::tip
If a pricing entry for the given `modelName` already exists, it will be updated. Otherwise, a new entry is created.
:::

## Source

- `AgentAdminController.java` — `upsertModelPricing()`
- `AgentModelPricingService.java` — `upsert()`
