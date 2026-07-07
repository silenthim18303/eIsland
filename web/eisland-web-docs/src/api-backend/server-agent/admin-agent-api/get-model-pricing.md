---
title: Get Model Pricing
---

# GET /v1/admin/agent/model-pricing

:::info
Lists all AI model pricing configurations. Requires `ROLE_ADMIN`.
:::

## Request

**Method:** `GET`
**Path:** `/v1/admin/agent/model-pricing`
**Authentication:** Required (JWT with `ROLE_ADMIN`)

## Response

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "modelName": "deepseek-chat",
      "inputPriceFenPerMillion": 100,
      "cachedInputPriceFenPerMillion": 10,
      "outputPriceFenPerMillion": 200,
      "enabled": true
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `data` | Array | List of model pricing entries |
| `data[].modelName` | String | Model identifier |
| `data[].inputPriceFenPerMillion` | Long | Input price (fen per 1M tokens) |
| `data[].cachedInputPriceFenPerMillion` | Long | Cached input price (fen per 1M tokens) |
| `data[].outputPriceFenPerMillion` | Long | Output price (fen per 1M tokens) |
| `data[].enabled` | Boolean | Whether the model is active |

## Source

- `AgentAdminController.java` — `getModelPricing()`
- `AgentModelPricingService.java` — `listAll()`
