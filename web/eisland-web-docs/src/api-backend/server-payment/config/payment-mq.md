---
title: PaymentMqConfig
---

# PaymentMqConfig

:::info
RabbitMQ configuration for payment notification and receipt dispatch queues.
:::

## Overview

`PaymentMqConfig` defines a `DirectExchange` and six durable queues (with bindings) for two independent message flows: payment callback processing and receipt email dispatch. Each flow has a main queue, a retry queue with TTL-based delayed retry, and a dead-letter queue.

## Exchange

| Property | Value |
|---|---|
| Name | `eisland.payment.notify.exchange` |
| Type | Direct |
| Durable | Yes |

## Payment Notify Queues

| Queue | Routing Key | Description |
|---|---|---|
| `eisland.payment.notify.process.queue` | `eisland.payment.notify.process` | Main payment callback processing |
| `eisland.payment.notify.retry.queue` | `eisland.payment.notify.retry` | Retry queue with TTL delay |
| `eisland.payment.notify.dlq` | `eisland.payment.notify.dlq` | Dead letter queue |

## Receipt Dispatch Queues

| Queue | Routing Key | Description |
|---|---|---|
| `eisland.payment.receipt.dispatch.queue` | `eisland.payment.receipt.dispatch` | Receipt email dispatch |
| `eisland.payment.receipt.retry.queue` | `eisland.payment.receipt.retry` | Retry queue with TTL delay |
| `eisland.payment.receipt.dlq` | `eisland.payment.receipt.dlq` | Dead letter queue |

## Retry Headers

| Header | Description |
|---|---|
| `x-payment-retry-count` | Current retry count for payment notify messages |
| `x-payment-receipt-retry-count` | Current retry count for receipt dispatch messages |

## Message Flow

```
Producer → Exchange → Main Queue → Consumer
                ↓ (on failure)
        Retry Queue (TTL delay, default 15s)
                ↓ (after TTL expires)
        Main Queue (retry)
                ↓ (after max retries)
        DLQ (persisted to MySQL)
```

## Configuration Properties

| Property | Default | Description |
|---|---|---|
| `payment.notify-retry-delay-ms` | 15000 | Delay in ms before retry message is re-queued |

:::warning
Retry queues use `x-dead-letter-exchange` and `x-dead-letter-routing-key` to route messages back to the main queue after TTL expiration.
:::
