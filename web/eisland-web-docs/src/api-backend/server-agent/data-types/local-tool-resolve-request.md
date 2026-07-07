---
title: AgentLocalToolResolveRequest
---

# AgentLocalToolResolveRequest

:::info
Request DTO for submitting local tool execution results.
:::

## Definition

:::details Source — `MihtnelisAgentController.java`
```java
public record AgentLocalToolResolveRequest(
    String requestId,
    boolean success,
    Object result,
    String error,
    Long durationMs
) {}
```
:::

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `requestId` | String | Yes | Pending request ID |
| `success` | Boolean | Yes | Whether the tool execution succeeded |
| `result` | Object | No | Tool execution output |
| `error` | String | No | Error message (when `success` is `false`) |
| `durationMs` | Long | No | Execution duration in milliseconds |

## Used By

- `POST /v1/user/ai/agent/tool-result` — [Tool Result](../agent-chat-api/tool-result.md)
