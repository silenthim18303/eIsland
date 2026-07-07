---
title: PaymentNotifyLog
---

# PaymentNotifyLog

:::info
Entity logging payment notification events for audit and debugging.
:::

## Overview

`PaymentNotifyLog` records each payment notification received from payment providers (WeChat Pay, Alipay). It captures the notification ID, associated order, verification status, and raw body for audit purposes. Records are inserted with `INSERT IGNORE` to handle duplicate notifications gracefully.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | Long | Auto-increment primary key |
| `notifyId` | String | Notification ID from payment provider |
| `outTradeNo` | String | Merchant order number |
| `eventType` | String | Notification event type |
| `verifyOk` | Boolean | Whether signature verification passed |
| `processStatus` | String | Processing result status |
| `rawBody` | String | Raw notification body |
| `createdAt` | LocalDateTime | Log creation time |

:::tip
The `insertIgnore` mapper method ensures duplicate notification logs from repeated provider callbacks are silently skipped.
:::
