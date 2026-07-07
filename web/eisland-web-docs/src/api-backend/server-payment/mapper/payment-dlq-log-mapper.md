---
title: PaymentDlqLogMapper
---

# PaymentDlqLogMapper

:::info
MyBatis mapper interface for dead-letter queue log persistence and querying.
:::

## Overview

`PaymentDlqLogMapper` provides methods for inserting DLQ log records and querying them for admin review. It supports filtering by notification ID, order number, and trade state (to distinguish payment DLQ from receipt DLQ entries).

## Methods

| Method | Return Type | Description |
|---|---|---|
| `insert(logItem)` | int | Insert a DLQ log record |
| `adminList(notifyId, outTradeNo, limit)` | List\<PaymentDlqLog\> | Query DLQ logs with optional filters |
| `adminListByTradeState(notifyId, outTradeNo, tradeState, limit)` | List\<PaymentDlqLog\> | Query DLQ logs filtered by trade state |

## Parameters

### adminList

| Param | Type | Description |
|---|---|---|
| `notifyId` | String | Optional notification ID filter (nullable) |
| `outTradeNo` | String | Optional order number filter (nullable) |
| `limit` | int | Maximum results (1-200) |

### adminListByTradeState

| Param | Type | Description |
|---|---|---|
| `notifyId` | String | Optional notification ID filter (nullable) |
| `outTradeNo` | String | Optional order number filter (nullable) |
| `tradeState` | String | Trade state filter (e.g. `RECEIPT_EMAIL`) |
| `limit` | int | Maximum results (1-200) |

:::tip
Use `adminListByTradeState` with `tradeState = "RECEIPT_EMAIL"` to query receipt email dispatch failures separately from payment notification failures.
:::
