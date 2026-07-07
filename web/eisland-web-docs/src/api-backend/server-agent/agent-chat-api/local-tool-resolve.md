---
title: Local Tool Resolve
---

# POST /v1/user/ai/agent/local-tool/resolve

:::info
Resolves a pending local tool authorization request. When the AI agent wants to execute a local tool (e.g., file operations, system commands), it pauses and waits for user approval.
:::

## Request

**Method:** `POST`
**Path:** `/v1/user/ai/agent/local-tool/resolve`
**Content-Type:** `application/json`
**Authentication:** Required (JWT)

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `requestId` | String | Yes | The pending request ID from the `local_tool_pending` SSE event |
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

:::warning
Local tools can perform system-level operations (file I/O, shell commands, registry edits). Only approve requests from trusted sessions.
:::

## Source

- `MihtnelisAgentController.java` — `resolveLocalTool()`
- `AgentLocalToolRelayService.java` — `resolveAuthorization()`
