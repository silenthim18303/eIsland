---
title: AgentLocalToolAccessResolveRequest
---

# AgentLocalToolAccessResolveRequest

:::info
Request DTO for resolving local tool authorization.
:::

## Definition

:::details Source — `MihtnelisAgentController.java`
```java
public record AgentLocalToolAccessResolveRequest(
    String requestId,
    boolean allow
) {}
```
:::

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `requestId` | String | Yes | Pending request ID from `local_tool_pending` SSE event |
| `allow` | Boolean | Yes | `true` to allow, `false` to deny |

## Used By

- `POST /v1/user/ai/agent/local-tool/resolve` — [Local Tool Resolve](../agent-chat-api/local-tool-resolve.md)
