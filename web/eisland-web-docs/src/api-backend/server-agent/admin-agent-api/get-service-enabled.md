---
title: Get Service Enabled Status
---

# GET /v1/admin/agent/service-enabled

:::info
Gets the current agent service status (enabled/disabled and status message). Requires `ROLE_ADMIN`.
:::

## Request

**Method:** `GET`

**Path:** `/v1/admin/agent/service-enabled`
**Authentication:** Required (JWT with `ROLE_ADMIN`)

## Response

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "enabled": true,
    "statusMessage": ""
  }
}
```

| Field | Type | Description |
|---|---|---|
| `data.enabled` | Boolean | Whether the agent service is enabled |
| `data.statusMessage` | String | Status message shown to users when disabled |

## Source

- `AgentAdminController.java` — `getServiceEnabled()`
