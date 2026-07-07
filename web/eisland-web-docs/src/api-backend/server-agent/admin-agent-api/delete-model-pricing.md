---
title: Delete Model Pricing
---

# DELETE /v1/admin/agent/model-pricing

:::info
Deletes an AI model pricing entry. Requires `ROLE_ADMIN`.
:::

## Request

**Method:** `DELETE`
**Path:** `/v1/admin/agent/model-pricing`
**Authentication:** Required (JWT with `ROLE_ADMIN`)

### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `modelName` | String | Yes | Model identifier to delete |

## Response

```json
{
  "code": 200,
  "message": "success"
}
```

:::warning
Deleting a model pricing entry will also clear its Redis cache. Active sessions using this model will fall back to the default pricing.
:::

## Source

- `AgentAdminController.java` — `deleteModelPricing()`
- `AgentModelPricingService.java` — `delete()`
