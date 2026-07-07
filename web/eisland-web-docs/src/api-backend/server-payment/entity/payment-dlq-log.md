---
title: PaymentDlqLog
---

# PaymentDlqLog

:::info
Entity logging dead-letter queue messages for manual resolution.
:::

## Overview

`PaymentDlqLog` records messages that have exhausted all retry attempts and landed in the dead-letter queue. It is used for both payment notification DLQ entries and receipt email dispatch DLQ entries, distinguished by the `tradeState` field (receipt DLQ entries use `RECEIPT_EMAIL`).

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | Long | Auto-increment primary key |
| `notifyId` | String | Notification ID or trace ID |
| `outTradeNo` | String | Merchant order number |
| `tradeState` | String | Trade state or `RECEIPT_EMAIL` for receipt DLQ |
| `retryCount` | Integer | Number of retry attempts before DLQ |
| `errorMessage` | String | Last error message |
| `rawBody` | String | Raw message body |
| `createdAt` | LocalDateTime | Log creation time |

## DLQ Types

| `tradeState` Value | Source | Description |
|---|---|---|
| Trade state (e.g. `SUCCESS`) | PaymentNotifyConsumer | Payment notification processing failure |
| `RECEIPT_EMAIL` | PaymentReceiptDispatchConsumer | Receipt email dispatch failure |

:::warning
DLQ entries require manual investigation and resolution. They represent messages that could not be processed after all automated retries.
:::
