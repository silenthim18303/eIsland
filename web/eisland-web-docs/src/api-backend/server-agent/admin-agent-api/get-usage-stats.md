---
title: Get Usage Statistics
---

# GET /v1/admin/agent/usage-stats

:::info
Gets aggregated usage statistics for all AI models. Requires `ROLE_ADMIN`.
:::

## Request

**Method:** `GET`
**Path:** `/v1/admin/agent/usage-stats`
**Authentication:** Required (JWT with `ROLE_ADMIN`)

## Response

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "modelName": "deepseek-chat",
      "totalInputTokens": 1500000,
      "totalCachedTokens": 300000,
      "totalOutputTokens": 800000,
      "totalReasoningTokens": 200000,
      "totalCostFen": 45000
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `data` | Array | Per-model usage statistics |
| `data[].modelName` | String | Model identifier |
| `data[].totalInputTokens` | Long | Total input tokens consumed |
| `data[].totalCachedTokens` | Long | Total cached input tokens |
| `data[].totalOutputTokens` | Long | Total output tokens generated |
| `data[].totalReasoningTokens` | Long | Total reasoning tokens |
| `data[].totalCostFen` | Long | Total cost in fen |

:::tip
Usage statistics are aggregated from Redis (DB 13) via `AgentUsageStatsRedisService.getAllModelStats()`.
:::

## Source

- `AgentAdminController.java` — `getUsageStats()`
- `AgentUsageStatsRedisService.java` — `getAllModelStats()`
