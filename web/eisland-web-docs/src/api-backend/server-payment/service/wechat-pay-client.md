---
title: WechatPayClient
---

# WechatPayClient

:::info
WeChat Pay v3 HTTP client with native Java HttpClient and RSA2048 signature support.
:::

## Overview

`WechatPayClient` implements WeChat Pay v3 API communication using Java's built-in `HttpClient`. It handles request signing with SHA256withRSA, constructs proper `WECHATPAY2-SHA256-RSA2048` authorization headers, and provides methods for native order creation, order query, and order close. The private key is lazily loaded and cached.

## Methods

| Method | Return Type | Description |
|---|---|---|
| `isAvailable()` | boolean | Check if WeChat Pay is properly configured |
| `createNativeOrder(outTradeNo, description, amountFen)` | `PlaceOrderResult` | Create a native QR code payment order |
| `queryOrder(outTradeNo)` | `QueryResult` | Query order status from WeChat Pay |
| `closeOrder(outTradeNo)` | void | Close an unpaid order |

## PlaceOrderResult

| Field | Type | Description |
|---|---|---|
| `prepayId` | String | WeChat prepay ID |
| `codeUrl` | String | QR code URL for native payment |

## QueryResult

| Field | Type | Description |
|---|---|---|
| `tradeState` | String | Trade state from WeChat |
| `transactionId` | String | WeChat transaction ID |
| `successTime` | OffsetDateTime | Payment success time |

| Helper Method | Description |
|---|---|
| `success()` | Returns `true` if `SUCCESS` |
| `shouldClose()` | Returns `true` if `CLOSED`, `REVOKED`, or `PAYERROR` |

## API Endpoints

| Operation | Method | Path |
|---|---|---|
| Create Native Order | POST | `/v3/pay/transactions/native` |
| Query Order | GET | `/v3/pay/transactions/out-trade-no/{outTradeNo}?mchid={mchId}` |
| Close Order | POST | `/v3/pay/transactions/out-trade-no/{outTradeNo}/close` |

## Request Signing

```
Authorization: WECHATPAY2-SHA256-RSA2048
  mchid="{mchId}",
  nonce_str="{nonce}",
  timestamp="{timestamp}",
  serial_no="{serialNo}",
  signature="{signature}"

Sign message = METHOD\nPATH\nTIMESTAMP\nNONCE\nBODY\n
```

:::warning
HTTP requests use a 10-second timeout. Connection timeout is 8 seconds.
:::
