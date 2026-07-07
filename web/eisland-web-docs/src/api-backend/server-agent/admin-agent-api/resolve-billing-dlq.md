---
title: Resolve Billing DLQ Entry
---

# PUT /v1/admin/agent/billing-dlq/{id}/resolve

:::info
Resolves a billing dead-letter queue entry. Requires `ROLE_ADMIN`.
:::

## Request

**Method:** `PUT`
**Path:** `/v1/admin/agent/billing-dlq/{id}/resolve`
**Content-Type:** `application/json`
**Authentication:** Required (JWT with `ROLE_ADMIN`)

### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | Long | Yes | DLQ entry ID |

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `status` | String | Yes | Resolution status (e.g., `RESOLVED`, `DISMISSED`) |

## Response

```json
{
  "code": 200,
  "message": "success"
}
```

:::details Resolution Flow
When a DLQ entry is resolved:
1. If the status is `RESOLVED`, the billing deduction is retried manually
2. The DLQ entry's `resolvedAt` timestamp is updated
3. The entry status is changed to the provided value
:::

## Source

- `AgentAdminController.java` — `resolveDlqEntry()`
