---
title: AlipayNotifyService
---

# AlipayNotifyService

:::info
Alipay async notification signature verification and parsing service.
:::

## Overview

`AlipayNotifyService` handles incoming Alipay async payment notifications. It verifies the RSA signature using `AlipaySignature.rsaCheckV1()`, validates the `app_id` matches the configured value, and parses the notification parameters into a structured `NotifyData` record.

## Methods

| Method | Description |
|---|---|
| `parse(requestParams)` | Parse and verify an Alipay notification from HTTP request parameters |

## NotifyData Record

| Field | Type | Description |
|---|---|---|
| `notifyId` | String | Alipay notification ID |
| `eventType` | String | Notification type (e.g. `TRADE_FINISHED`) |
| `appId` | String | Alipay app ID from notification |
| `outTradeNo` | String | Merchant order number |
| `transactionId` | String | Alipay trade number |
| `tradeState` | String | Trade status (e.g. `TRADE_SUCCESS`) |
| `totalAmountFen` | Integer | Payment amount converted from yuan to fen |
| `successTime` | OffsetDateTime | Payment time parsed from `gmt_payment` |
| `verifyOk` | boolean | Whether signature and app_id verification passed |
| `rawBody` | String | Raw parameter map as string |

## Verification Logic

```
1. Verify RSA signature against Alipay public key
2. Verify app_id matches configured AlipayProperties.appId
3. Parse total_amount from yuan string to fen integer
4. Parse gmt_payment to OffsetDateTime (CST, UTC+8)
```

:::warning
Notifications where `verifyOk = false` are still parsed but flagged — downstream consumers skip unverified messages.
:::
