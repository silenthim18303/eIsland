---
title: Get TMT Pricing
---

# GET /v1/admin/tmt/pricing

:::info
Lists all translation service pricing configurations. Requires `ROLE_ADMIN`.
:::

## Request

**Method:** `GET`
**Path:** `/v1/admin/tmt/pricing`
**Authentication:** Required (JWT with `ROLE_ADMIN`)

## Response

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "serviceName": "tencent-tmt",
      "priceFenPerMillion": 50,
      "enabled": true
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `data` | Array | List of translation pricing entries |
| `data[].serviceName` | String | Service identifier |
| `data[].priceFenPerMillion` | Long | Price per million characters (fen) |
| `data[].enabled` | Boolean | Whether the service is active |

## Source

- `AdminTmtController.java` — `getPricing()`
- `ToolboxTranslatePricingService.java` — `listAll()`
