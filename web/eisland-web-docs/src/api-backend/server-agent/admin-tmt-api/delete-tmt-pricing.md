---
title: Delete TMT Pricing
---

# DELETE /v1/admin/tmt/pricing

:::info
Deletes a translation service pricing entry. Requires `ROLE_ADMIN`.
:::

## Request

**Method:** `DELETE`
**Path:** `/v1/admin/tmt/pricing`
**Authentication:** Required (JWT with `ROLE_ADMIN`)

### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `serviceName` | String | Yes | Service identifier to delete |

## Response

```json
{
  "code": 200,
  "message": "success"
}
```

:::warning
Deleting a pricing entry will also clear its Redis cache. Translation requests using this service will fail until a new pricing entry is created.
:::

## Source

- `AdminTmtController.java` — `deletePricing()`
- `ToolboxTranslatePricingService.java` — `delete()`
