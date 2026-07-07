---
title: Get DLQ Pending Count
---

# GET /v1/admin/agent/billing-dlq/pending-count

:::info
Returns the count of unresolved billing DLQ entries. Requires `ROLE_ADMIN`.
:::

## Request

**Method:** `GET`
**Path:** `/v1/admin/agent/billing-dlq/pending-count`
**Authentication:** Required (JWT with `ROLE_ADMIN`)

## Response

```json
{
  "code": 200,
  "message": "success",
  "data": 3
}
```

| Field | Type | Description |
|---|---|---|
| `data` | Integer | Number of unresolved DLQ entries |

:::tip
This endpoint is lightweight and can be used for polling. Use it to display a badge or alert in the admin dashboard when there are pending DLQ entries.
:::

## Source

- `AgentAdminController.java` — `getDlqPendingCount()`
