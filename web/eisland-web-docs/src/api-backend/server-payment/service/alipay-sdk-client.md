---
title: AlipaySdkClient
---

# AlipaySdkClient

:::info
Wrapper around the official Alipay SDK for page payment, order query, close, and cancel operations.
:::

## Overview

`AlipaySdkClient` encapsulates the Alipay Java SDK (`DefaultAlipayClient`) and provides methods for creating page payment orders, querying order status, closing orders, and canceling orders. The underlying `AlipayClient` is lazily initialized and cached.

## Methods

| Method | Return Type | Description |
|---|---|---|
| `isAvailable()` | boolean | Check if Alipay is properly configured |
| `createPageOrder(outTradeNo, description, amountFen, timeoutMinutes)` | `PlaceOrderResult` | Create a page payment order |
| `queryOrder(outTradeNo)` | `QueryResult` | Query order status from Alipay |
| `closeOrder(outTradeNo)` | `CloseResult` | Close an unpaid order |
| `cancelOrder(outTradeNo)` | void | Cancel/reverse a paid order |

## PlaceOrderResult

| Field | Type | Description |
|---|---|---|
| `tradeNo` | String | Alipay trade number (null for page pay) |
| `payUrl` | String | Payment page URL to redirect user |

## QueryResult

| Field | Type | Description |
|---|---|---|
| `tradeStatus` | String | Trade status from Alipay |
| `tradeNo` | String | Alipay trade number |
| `successTime` | OffsetDateTime | Payment success time |

| Helper Method | Description |
|---|---|
| `success()` | Returns `true` if `TRADE_SUCCESS` or `TRADE_FINISHED` |
| `shouldClose()` | Returns `true` if `TRADE_CLOSED` |
| `isNotFound()` | Returns `true` if `NOT_FOUND` |

## CloseResult

| Field | Type | Description |
|---|---|---|
| `success` | boolean | Whether close succeeded |
| `subCode` | String | Error code on failure |
| `subMsg` | String | Error message on failure |

| Helper Method | Description |
|---|---|
| `tradeNotExist()` | Returns `true` if `ACQ.TRADE_NOT_EXIST` |

## Order Expiration

The client sets both `timeoutExpress` (relative) and `timeExpire` (absolute, Asia/Shanghai timezone) on page pay orders to prevent Alipay from accepting payment on stale QR codes.

:::tip
The `AlipayClient` instance is lazily created on first use and cached for the lifetime of the application.
:::
