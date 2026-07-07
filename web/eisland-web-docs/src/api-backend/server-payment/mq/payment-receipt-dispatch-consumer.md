---
title: PaymentReceiptDispatchConsumer + PaymentReceiptDispatchMessage
---

# PaymentReceiptDispatchConsumer

:::info
RabbitMQ consumer for asynchronously dispatching payment receipt emails with retry and DLQ support.
:::

## Overview

`PaymentReceiptDispatchConsumer` listens on the receipt dispatch queue and sends payment receipt emails via `PaymentReceiptEmailService`. Failed deliveries are retried with the same retry/DLQ mechanism used by the payment notify consumer.

## Message Processing Flow

```
1. Receive PaymentReceiptDispatchMessage from queue
2. Skip if email or outTradeNo is blank
3. Call PaymentReceiptEmailService.sendPaymentReceipt()
4. On failure → route to retry queue or DLQ
```

## Listeners

| Queue | Method | Description |
|---|---|---|
| `eisland.payment.receipt.dispatch.queue` | `onMessage()` | Main receipt dispatch processing |
| `eisland.payment.receipt.dlq` | `onDeadLetter()` | DLQ handler - logs to `payment_dlq_log` with tradeState `RECEIPT_EMAIL` |

## Retry Logic

| Property | Default | Description |
|---|---|---|
| `payment.notify-max-retries` | 5 | Maximum retry attempts before routing to DLQ |

---

# PaymentReceiptDispatchMessage

:::info
Java record representing a payment receipt email dispatch message.
:::

## Fields

| Field | Type | Description |
|---|---|---|
| `traceId` | String | Unique trace identifier for this dispatch |
| `email` | String | Recipient email address |
| `outTradeNo` | String | Merchant order number |
| `channel` | String | Payment channel (WECHAT / ALIPAY) |
| `transactionId` | String | Payment provider transaction ID |
| `amountFen` | Integer | Payment amount in fen (cents) |
| `currency` | String | Currency code (e.g. CNY) |
| `productCode` | String | Product identifier |
| `paidAt` | LocalDateTime | Payment success time |
| `expireAt` | LocalDateTime | Order expiration time |
| `lastError` | String | Error message from last failed attempt (nullable) |

:::tip
Receipt dispatch is decoupled from payment processing via MQ to avoid delaying the payment confirmation response.
:::
