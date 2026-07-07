---
title: Get Billing DLQ Entries
---

# GET /v1/admin/agent/billing-dlq

:::info
Lists billing dead-letter queue (DLQ) entries. Failed billing deductions after max retries are persisted here. Requires `ROLE_ADMIN`.
:::

## Request

**Method:** `GET`
**Path:** `/v1/admin/agent/billing-dlq`
**Authentication:** Required (JWT with `ROLE_ADMIN`)

### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `status` | String | No | Filter by status (e.g., `PENDING`, `RESOLVED`) |

## Response

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "username": "user123",
      "amountFen": "1.50000000",
      "modelName": "deepseek-chat",
      "inputTokens": 1500,
      "outputTokens": 800,
      "status": "PENDING",
      "lastError": "MySQL connection timeout",
      "createdAt": "2026-07-01T10:30:00",
      "resolvedAt": null
    }
  ],
  "pendingCount": 3
}
```

| Field | Type | Description |
|---|---|---|
| `data` | Array | DLQ log entries |
| `pendingCount` | Integer | Number of unresolved DLQ entries |

:::warning
Pending DLQ entries represent billing deductions that failed to persist to MySQL. Resolve them promptly to maintain accurate billing.
:::

## Source

- `AgentAdminController.java` — `getBillingDlq()`
