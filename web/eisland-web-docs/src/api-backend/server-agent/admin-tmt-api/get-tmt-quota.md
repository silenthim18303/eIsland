---
title: Get TMT Monthly Quota
---

# GET /v1/admin/tmt/quota

:::info
Gets the current monthly translation quota usage. Requires `ROLE_ADMIN`.
:::

## Request

**Method:** `GET`
**Path:** `/v1/admin/tmt/quota`
**Authentication:** Required (JWT with `ROLE_ADMIN`)

## Response

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "used": 1250000,
    "limit": 5000000,
    "remaining": 3750000,
    "fused": false
  }
}
```

| Field | Type | Description |
|---|---|---|
| `data.used` | Long | Characters translated this month |
| `data.limit` | Long | Monthly character limit (5M) |
| `data.remaining` | Long | Remaining characters |
| `data.fused` | Boolean | Whether the quota is exhausted |

:::warning
When `fused` is `true`, all translation requests will be rejected until the quota resets next month.
:::

## Source

- `AdminTmtController.java` — `getQuota()`
- `TencentTmtTranslateService.java` — `getMonthlyQuotaStatus()`
