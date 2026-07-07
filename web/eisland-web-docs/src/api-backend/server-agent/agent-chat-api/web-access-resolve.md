---
title: Web Access Resolve
---

# POST /v1/user/ai/agent/web-access/resolve

:::info
Resolves a pending web access authorization request. When the AI agent needs to access a web page, it pauses and waits for the user to approve or deny.
:::

## Request

**Method:** `POST`
**Path:** `/v1/user/ai/agent/web-access/resolve`
**Content-Type:** `application/json`
**Authentication:** Required (JWT)

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `requestId` | String | Yes | The pending request ID from the `web_access_pending` SSE event |
| `allow` | Boolean | Yes | `true` to allow, `false` to deny |

## Response

```json
{
  "success": true,
  "data": { ... }
}
```

| Field | Type | Description |
|---|---|---|
| `success` | Boolean | Whether the resolution was accepted |
| `error` | String | Error message (when `success` is `false`) |
| `data` | Map | Additional data |

:::tip
The AI agent resumes execution after the user resolves the web access request. If denied, the agent will skip the web access and continue with available information.
:::

## Source

- `MihtnelisAgentController.java` — `resolveWebAccess()`
- `AgentWebAuthorizationService.java` — `resolve()`
