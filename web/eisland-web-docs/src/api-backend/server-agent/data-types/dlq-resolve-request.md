---
title: DlqResolveRequest
---

# DlqResolveRequest

:::info
Request DTO for resolving a billing DLQ entry.
:::

## Definition

:::details Source — `AgentAdminController.java`
```java
public record DlqResolveRequest(
    String status
) {}
```
:::

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `status` | String | Yes | Resolution status (e.g., `RESOLVED`, `DISMISSED`) |

## Used By

- `PUT /v1/admin/agent/billing-dlq/{id}/resolve` — [Resolve Billing DLQ Entry](../admin-agent-api/resolve-billing-dlq.md)
