---
title: PaymentTransaction
---

# PaymentTransaction

:::info
Payment transaction entity recording successful payment details from the payment provider.
:::

## Overview

`PaymentTransaction` stores the raw transaction data received from the payment provider (WeChat Pay or Alipay) after a successful payment. It is inserted with `INSERT IGNORE` semantics to prevent duplicate records from repeated notifications.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | Long | Auto-increment primary key |
| `outTradeNo` | String | Merchant order number (foreign key to PaymentOrder) |
| `wxTransactionId` | String | Payment provider transaction ID |
| `tradeState` | String | Trade state from provider (e.g. SUCCESS, TRADE_SUCCESS) |
| `payerOpenid` | String | Payer's WeChat OpenID (if available) |
| `successTime` | LocalDateTime | Payment success timestamp |
| `rawJson` | String | Raw notification JSON from payment provider |
| `createdAt` | LocalDateTime | Record creation time |

:::tip
The `insertIgnore` mapper method ensures that duplicate transaction records from repeated notifications are silently ignored.
:::
