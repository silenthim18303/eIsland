---
title: PaymentOrderMapper
---

# PaymentOrderMapper

:::info
MyBatis mapper interface for payment order CRUD operations.
:::

## Overview

`PaymentOrderMapper` provides database access methods for the `PaymentOrder` entity. It supports order insertion, lookup by trade number or username, status transitions (mark success/closed), and batch queries for scheduled jobs and admin listing.

## Methods

| Method | Return Type | Description |
|---|---|---|
| `insert(order)` | int | Insert a new payment order |
| `selectByOutTradeNo(outTradeNo)` | PaymentOrder | Look up order by merchant order number |
| `selectByUsername(username, limit)` | List\<PaymentOrder\> | List orders for a user |
| `markSuccess(outTradeNo, wxTransactionId, paidAt, updatedAt)` | int | Mark order as SUCCESS |
| `markClosed(outTradeNo, closedAt, updatedAt)` | int | Mark order as CLOSED |
| `listNeedClose(now, limit)` | List\<PaymentOrder\> | List expired PAYING orders for batch close |
| `listPendingForQuery(now, limit)` | List\<PaymentOrder\> | List PAYING orders created before `now` for reconciliation |
| `adminList(username, status, limit)` | List\<PaymentOrder\> | Admin query with optional filters |

## Parameters

### selectByUsername

| Param | Type | Description |
|---|---|---|
| `username` | String | Username to filter by |
| `limit` | int | Maximum number of results |

### markSuccess

| Param | Type | Description |
|---|---|---|
| `outTradeNo` | String | Merchant order number |
| `wxTransactionId` | String | Payment provider transaction ID |
| `paidAt` | LocalDateTime | Payment success time |
| `updatedAt` | LocalDateTime | Current timestamp |

### adminList

| Param | Type | Description |
|---|---|---|
| `username` | String | Optional username filter (nullable) |
| `status` | String | Optional status filter (nullable) |
| `limit` | int | Maximum results (1-200) |

:::tip
`listPendingForQuery` is used by the reconciliation job to find orders that may have been paid but missed async notifications.
:::
