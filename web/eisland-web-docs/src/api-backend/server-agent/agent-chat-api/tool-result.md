---
title: Tool Result
---

# POST /v1/user/ai/agent/tool-result

:::info
Submits the execution result of a local tool back to the server. After the client executes an approved local tool, it sends the result here so the AI agent can continue.
:::

## Request

**Method:** `POST`
**Path:** `/v1/user/ai/agent/tool-result`
**Content-Type:** `application/json`
**Authentication:** Required (JWT)

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `requestId` | String | Yes | The pending request ID |
| `success` | Boolean | Yes | Whether the tool execution succeeded |
| `result` | Object | No | Tool execution output |
| `error` | String | No | Error message (when `success` is `false`) |
| `durationMs` | Long | No | Execution duration in milliseconds |

## Response

```json
{
  "success": true,
  "data": { ... }
}
```

| Field | Type | Description |
|---|---|---|
| `success` | Boolean | Whether the result was accepted |
| `error` | String | Error message (when `success` is `false`) |
| `data` | Map | Additional data |

:::tip
The `result` field should contain the tool's output in a format the AI agent can understand. For example, a file read tool should return the file content as a string.
:::

## Source

- `MihtnelisAgentController.java` — `submitToolResult()`
- `AgentLocalToolRelayService.java` — `resolve()`
