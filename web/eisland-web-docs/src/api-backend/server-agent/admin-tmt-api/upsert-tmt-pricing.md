---
title: Upsert TMT Pricing
---

# PUT /v1/admin/tmt/pricing

:::info
Creates or updates a translation service pricing entry. Requires `ROLE_ADMIN`.
:::

## Request

**Method:** `PUT`
**Path:** `/v1/admin/tmt/pricing`
**Content-Type:** `application/json`
**Authentication:** Required (JWT with `ROLE_ADMIN`)

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `serviceName` | String | Yes | Service identifier (e.g., `tencent-tmt`) |
| `priceFenPerMillion` | Long | Yes | Price per million characters (fen) |
| `enabled` | Boolean | Yes | Whether the service is active |

## Response

```json
{
  "code": 200,
  "message": "success"
}
```

:::tip
If a pricing entry for the given `serviceName` already exists, it will be updated. Otherwise, a new entry is created.
:::

## Source

- `AdminTmtController.java` — `upsertPricing()`
- `ToolboxTranslatePricingService.java` — `upsert()`
