---
title: AgentWebAccessResolveRequest
---

# AgentWebAccessResolveRequest

:::info
Request DTO for resolving web access authorization.
:::

## Definition

:::details Source — `MihtnelisAgentController.java`
```java
public record AgentWebAccessResolveRequest(
    String requestId,
    boolean allow
) {}
```
:::

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `requestId` | String | Yes | Pending request ID from `web_access_pending` SSE event |
| `allow` | Boolean | Yes | `true` to allow, `false` to deny |

## Used By

- `POST /v1/user/ai/agent/web-access/resolve` — [Web Access Resolve](../agent-chat-api/web-access-resolve.md)
