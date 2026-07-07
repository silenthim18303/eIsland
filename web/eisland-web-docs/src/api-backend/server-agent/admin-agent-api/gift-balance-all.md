---
title: Gift Balance to All Users
---

# PUT /v1/admin/agent/gift-balance-all

:::info
Gifts balance to all users in the system. Requires `ROLE_ADMIN`.
:::

## Request

**Method:** `PUT`
**Path:** `/v1/admin/agent/gift-balance-all`
**Content-Type:** `application/json`
**Authentication:** Required (JWT with `ROLE_ADMIN`)

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `amountFen` | Long | Yes | Amount to gift per user (in fen, 1 yuan = 100 fen) |

## Response

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "affected": 150
  }
}
```

| Field | Type | Description |
|---|---|---|
| `data.affected` | Integer | Number of users who received the gift |

:::tip
This operation adds to each user's existing balance, it does not replace it. The operation is performed in a single database transaction.
:::

## Source

- `AgentAdminController.java` — `giftBalanceAll()`
