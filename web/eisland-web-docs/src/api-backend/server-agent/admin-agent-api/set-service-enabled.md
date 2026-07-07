---
title: Set Service Enabled Status
---

# PUT /v1/admin/agent/service-enabled

:::info
Enables or disables the agent service. When disabled, all user chat requests will be rejected with the provided status message. Requires `ROLE_ADMIN`.
:::

## Request

**Method:** `PUT`
**Path:** `/v1/admin/agent/service-enabled`
**Content-Type:** `application/json`
**Authentication:** Required (JWT with `ROLE_ADMIN`)

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `enabled` | Boolean | Yes | `true` to enable, `false` to disable |
| `message` | String | No | Status message shown to users when disabled |

## Response

```json
{
  "code": 200,
  "message": "success"
}
```

:::warning
Disabling the service will immediately reject all pending and new chat requests. Use the `message` field to inform users about maintenance windows or service status.
:::

## Source

- `AgentAdminController.java` — `setServiceEnabled()`
