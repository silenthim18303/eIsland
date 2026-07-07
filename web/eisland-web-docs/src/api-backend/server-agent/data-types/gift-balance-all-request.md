---
title: GiftBalanceAllRequest
---

# GiftBalanceAllRequest

:::info
Request DTO for gifting balance to all users.
:::

## Definition

:::details Source — `AgentAdminController.java`
```java
public record GiftBalanceAllRequest(
    long amountFen
) {}
```
:::

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `amountFen` | Long | Yes | Amount to gift per user (in fen, 1 yuan = 100 fen) |

## Used By

- `PUT /v1/admin/agent/gift-balance-all` — [Gift Balance to All Users](../admin-agent-api/gift-balance-all.md)
