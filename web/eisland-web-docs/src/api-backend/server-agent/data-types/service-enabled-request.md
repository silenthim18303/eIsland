---
title: ServiceEnabledRequest
---

# ServiceEnabledRequest

:::info
Request DTO for toggling the agent service.
:::

## Definition

:::details Source — `AgentAdminController.java`
```java
public record ServiceEnabledRequest(
    boolean enabled,
    String message
) {}
```
:::

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `enabled` | Boolean | Yes | `true` to enable, `false` to disable |
| `message` | String | No | Status message shown to users when disabled |

## Used By

- `PUT /v1/admin/agent/service-enabled` — [Set Service Enabled Status](../admin-agent-api/set-service-enabled.md)
