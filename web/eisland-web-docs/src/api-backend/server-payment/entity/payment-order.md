---
title: PaymentOrder
---

# PaymentOrder

:::info
Payment order entity representing a user's payment transaction.
:::

## Overview

`PaymentOrder` is the core entity for tracking payment orders. It stores the merchant order number, user reference, product information, payment amount, status lifecycle, and payment provider-specific fields. The order follows a state machine: PAYING → SUCCESS or PAYING → CLOSED.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | Long | Auto-increment primary key |
| `outTradeNo` | String | Unique merchant order number (format: `EI{Channel}{User}{UUID}`) |
| `username` | String | Username of the buyer |
| `productCode` | String | Product identifier (PRO_MONTH, AGENT_RECHARGE, TEST_PAY) |
| `amountFen` | Integer | Payment amount in fen (cents) |
| `currency` | String | Currency code (default: CNY) |
| `status` | String | Order status |
| `wxPrepayId` | String | WeChat prepay ID or Alipay trade number |
| `wxCodeUrl` | String | QR code URL / payment page URL |
| `wxTransactionId` | String | Payment provider transaction ID (set on success) |
| `expireAt` | LocalDateTime | Order expiration time |
| `paidAt` | LocalDateTime | Payment success time |
| `closedAt` | LocalDateTime | Order close time |
| `createdAt` | LocalDateTime | Order creation time |
| `updatedAt` | LocalDateTime | Last update time |

## Status Constants

| Constant | Value | Description |
|---|---|---|
| `STATUS_PAYING` | `PAYING` | Order created, awaiting payment |
| `STATUS_SUCCESS` | `SUCCESS` | Payment completed successfully |
| `STATUS_CLOSED` | `CLOSED` | Order closed (expired or manually) |
| `STATUS_FAILED` | `FAILED` | Payment failed |

## Status Transitions

```
PAYING → SUCCESS  (payment notification received)
PAYING → CLOSED   (expired or manually closed)
```

:::tip
The `outTradeNo` prefix indicates the channel: `EIW` for WeChat, `EIA` for Alipay.
:::
