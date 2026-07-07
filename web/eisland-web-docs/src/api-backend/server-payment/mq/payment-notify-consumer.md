---
title: PaymentNotifyConsumer + PaymentNotifyMessage
---

# PaymentNotifyConsumer

:::info
RabbitMQ consumer for processing payment callback notifications with retry and DLQ support.
:::

## Overview

`PaymentNotifyConsumer` listens on the payment notify queue and processes payment callback messages from WeChat Pay and Alipay. It validates signature verification, checks trade state, and delegates order completion to `PaymentService`. Failed messages are routed to a retry queue with exponential backoff, and ultimately to a DLQ after max retries.

## Message Processing Flow

```
1. Receive PaymentNotifyMessage from queue
2. Skip if signature verification failed
3. Skip if trade state is not SUCCESS
4. Skip if outTradeNo is empty
5. Call PaymentService.completeOrderIfPending()
6. On failure → route to retry queue or DLQ
```

## Retry Logic

| Property | Default | Description |
|---|---|---|
| `payment.notify-max-retries` | 5 | Maximum retry attempts before routing to DLQ |

## Listeners

| Queue | Method | Description |
|---|---|---|
| `eisland.payment.notify.process.queue` | `onMessage()` | Main message processing |
| `eisland.payment.notify.dlq` | `onDeadLetter()` | DLQ handler - logs to `payment_dlq_log` table |

## Trade State Validation

| Channel | Success States |
|---|---|
| Alipay | `TRADE_SUCCESS`, `TRADE_FINISHED` |
| WeChat | `SUCCESS` |

---

# PaymentNotifyMessage

:::info
Java record representing a payment callback notification message.
:::

## Fields

| Field | Type | Description |
|---|---|---|
| `notifyId` | String | Unique notification identifier |
| `channel` | String | Payment channel (WECHAT / ALIPAY) |
| `outTradeNo` | String | Merchant order number |
| `transactionId` | String | Payment provider transaction ID |
| `tradeState` | String | Trade state from provider |
| `successTime` | OffsetDateTime | Payment success timestamp |
| `verifyOk` | boolean | Whether signature verification passed |
| `rawBody` | String | Raw notification body |
| `lastError` | String | Error message from last failed attempt (nullable) |

:::warning
Messages with `verifyOk = false` are silently skipped to prevent processing of unverified notifications.
:::
